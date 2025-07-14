import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { 
  getRecentChatMessages, 
  getEarlierChatMessages,
  createMessage, 
  createChat,
  consumeCredits,
  getUserCredits,
  getCharacterDetails
} from '@/lib/supabase-queries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

// Hook for managing chat messages with pagination
interface ChatPage {
  messages: Message[];
  hasMore: boolean;
  oldestTimestamp: string | null;
}

export const useChatMessages = (chatId: string | null) => {
  return useInfiniteQuery<ChatPage, Error, InfiniteData<ChatPage>, string[], string | undefined>({
    queryKey: ['chat', 'messages', chatId],
    queryFn: async ({ pageParam = undefined }) => {
      if (!chatId) return { messages: [], hasMore: false, oldestTimestamp: null };
      
      const limit = 20;
      let result;
      
      if (pageParam) {
        // Load earlier messages
        result = await getEarlierChatMessages(chatId, pageParam, limit);
      } else {
        // Load recent messages
        result = await getRecentChatMessages(chatId, limit);
      }
      
      if (result.error) throw result.error;
      
      const messages: Message[] = result.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: !msg.is_ai_message,
        timestamp: new Date(msg.created_at),
        status: 'sent'
      }));
      
      return {
        messages,
        hasMore: result.data.length === limit,
        oldestTimestamp: result.data.length > 0 ? result.data[0].created_at : null
      };
    },
    getNextPageParam: (lastPage: ChatPage) => {
      return lastPage.hasMore ? lastPage.oldestTimestamp : undefined;
    },
    initialPageParam: undefined,
    enabled: !!chatId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for user credits
export const useUserCredits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'credits', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const result = await getUserCredits(user.id);
      if (result.error) throw result.error;
      return result.data?.balance || 0;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for character details with caching
export const useCharacterDetails = (characterId: string) => {
  return useQuery({
    queryKey: ['character', 'details', characterId],
    queryFn: async () => {
      const result = await getCharacterDetails(characterId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!characterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for sending messages
export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      chatId, 
      content, 
      characterId, 
      characterName 
    }: { 
      chatId: string | null; 
      content: string; 
      characterId: string;
      characterName: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      let finalChatId = chatId;
      
      // Create chat if it doesn't exist
      if (!finalChatId) {
        const { data: newChat, error: chatError } = await createChat(
          user.id, 
          characterId, 
          `Chat with ${characterName}`
        );
        if (chatError) throw chatError;
        finalChatId = newChat.id;
      }
      
      // Save user message
      const { error: messageError } = await createMessage(finalChatId, user.id, content, false);
      if (messageError) throw messageError;
      
      // Add AI Invocation (The Missing Piece)
      try {
        // Get character details for system prompt
        const characterDetails = await getCharacterDetails(characterId);
        if (characterDetails.error) {
          console.error('Failed to get character details:', characterDetails.error);
          throw new Error('Failed to get character details');
        }
        
        // Construct message history array  
        const systemContent = characterDetails.data?.character_definitions?.personality_summary || 
                             characterDetails.data?.character_definitions?.description || 
                             'You are a helpful assistant.';
        const messages = [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: content
          }
        ];
        
        // Get the session token for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('User not authenticated');
        }
        
        // Invoke the Supabase Edge Function with streaming
        const response = await fetch(`https://rclpyipeytqbamiwcuih.supabase.co/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            character_id: characterId,
            chat_id: finalChatId,
            model: 'openai/gpt-4o-mini',
            messages: messages
          }),
        });
        
        if (!response.ok) {
          throw new Error(`AI response failed: ${response.status}`);
        }
        
        // Process the JSON response from Edge Function
        const responseData = await response.json();
        
        if (!responseData.success || !responseData.content) {
          throw new Error('No valid response received from AI');
        }
        
        const aiResponseContent = responseData.content;
        
        // Save the AI response to the database (frontend handles all DB operations)
        const { error: aiMessageError } = await createMessage(
          finalChatId,
          user.id, // Use current user ID - distinguish with is_ai_message flag
          aiResponseContent,
          true // is_ai_message = true
        );
        
        if (aiMessageError) {
          console.error('Failed to save AI message:', aiMessageError);
          throw new Error('Failed to save AI response');
        }
        
        console.log('AI message saved successfully');
        
      } catch (error) {
        console.error('Error invoking AI:', error);
        // Continue execution - user message was saved successfully
        // The error will be logged but won't prevent the mutation from succeeding
      }
      
      return { chatId: finalChatId, content };
    },
    onSuccess: ({ chatId }) => {
      // Invalidate user credits only - real-time handles message updates
      queryClient.invalidateQueries({ queryKey: ['user', 'credits', user?.id] });
    },
  });
};

// Hook for consuming credits
export const useConsumeCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credits: number) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await consumeCredits(user.id, credits);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Update credits in cache
      queryClient.invalidateQueries({ queryKey: ['user', 'credits', user?.id] });
    },
  });
};


// Cache management utilities
export const useChatCache = () => {
  const queryClient = useQueryClient();
  
  const prefetchChatMessages = (chatId: string) => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['chat', 'messages', chatId],
      queryFn: async () => {
        const result = await getRecentChatMessages(chatId, 20);
        if (result.error) throw result.error;
        
        const messages: Message[] = result.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: !msg.is_ai_message,
          timestamp: new Date(msg.created_at),
          status: 'sent'
        }));
        
        return {
          messages,
          hasMore: result.data.length === 20,
          oldestTimestamp: result.data.length > 0 ? result.data[0].created_at : null
        };
      },
      initialPageParam: undefined,
      staleTime: 1 * 60 * 1000,
    });
  };
  
  const invalidateChatMessages = (chatId: string) => {
    queryClient.invalidateQueries({ queryKey: ['chat', 'messages', chatId] });
  };
  
  const addOptimisticMessage = (chatId: string, message: Message) => {
    queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
      if (!old || !old.pages.length) return old;
      
      const firstPage = old.pages[0];
      const updatedFirstPage: ChatPage = {
        ...firstPage,
        messages: [...firstPage.messages, message]
      };
      
      return {
        ...old,
        pages: [updatedFirstPage, ...old.pages.slice(1)]
      };
    });
  };
  
  const updateMessageStatus = (chatId: string, tempId: string, status: 'sent' | 'failed', newId?: string) => {
    queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
      if (!old || !old.pages.length) return old;
      
      const updatedPages = old.pages.map(page => ({
        ...page,
        messages: page.messages.map(msg => 
          msg.id === tempId 
            ? { ...msg, status, ...(newId && { id: newId }) }
            : msg
        )
      }));
      
      return { ...old, pages: updatedPages };
    });
  };
  
  return {
    prefetchChatMessages,
    invalidateChatMessages,
    addOptimisticMessage,
    updateMessageStatus,
  };
};

// Hook for real-time message updates
export const useRealtimeMessages = (chatId: string | null) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!chatId || !user) return;
    
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            isUser: !payload.new.is_ai_message,
            timestamp: new Date(payload.new.created_at),
            status: 'sent'
          };
          
          // Add new messages to the cache
          queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
            if (!old || !old.pages.length) return old;
            
          // Check if message already exists to prevent duplicates
          const messageExists = old.pages.some(page => 
            page.messages.some(msg => msg.id === newMessage.id)
          );
          
          if (messageExists) {
            console.log('Duplicate message prevented:', newMessage.id);
            return old;
          }
          
          // Additional check: prevent duplicate content for AI messages within 1 second
          if (!newMessage.isUser) {
            const recentMessages = old.pages[0]?.messages || [];
            const duplicateContent = recentMessages.find(msg => 
              !msg.isUser && 
              msg.content === newMessage.content &&
              Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000
            );
            
            if (duplicateContent) {
              console.log('Duplicate AI content prevented:', newMessage.content.substring(0, 50));
              return old;
            }
          }
            
            const firstPage = old.pages[0];
            const updatedFirstPage: ChatPage = {
              ...firstPage,
              messages: [...firstPage.messages, newMessage]
            };
            
            return {
              ...old,
              pages: [updatedFirstPage, ...old.pages.slice(1)]
            };
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user, queryClient]);
};