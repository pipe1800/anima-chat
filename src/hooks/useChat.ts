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

// Hook for creating chat with greeting
export const useCreateChatWithGreeting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      characterId, 
      characterName 
    }: { 
      characterId: string;
      characterName: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Create chat
      const { data: newChat, error: chatError } = await createChat(
        user.id, 
        characterId, 
        `Chat with ${characterName}`
      );
      if (chatError) throw chatError;
      
      // Add initial greeting message immediately
      const characterDetails = await getCharacterDetails(characterId);
      if (characterDetails.data?.character_definitions) {
        const greeting = characterDetails.data.character_definitions.greeting || 
                        `Hello! I'm ${characterName}. It's great to meet you. What would you like to talk about?`;
        
        const { error: greetingError } = await createMessage(newChat.id, user.id, greeting, true);
        if (greetingError) {
          console.error('Failed to save greeting message:', greetingError);
          throw new Error('Failed to save greeting message');
        }
      }
      
      return { chatId: newChat.id };
    },
    onSuccess: ({ chatId }) => {
      // Prefetch the new chat messages
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
      });
    },
  });
};

// Hook for sending messages with optimistic updates
export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      chatId, 
      content, 
      characterId 
    }: { 
      chatId: string; 
      content: string; 
      characterId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Generate optimistic message ID
      const optimisticId = `temp-${Date.now()}`;
      
      // Add optimistic user message to cache immediately
      queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
        if (!old || !old.pages.length) {
          // Create initial structure if empty
          return {
            pages: [{
              messages: [{
                id: optimisticId,
                content,
                isUser: true,
                timestamp: new Date(),
                status: 'sending' as const
              }],
              hasMore: false,
              oldestTimestamp: null
            }],
            pageParams: [undefined]
          };
        }
        
        const optimisticMessage: Message = {
          id: optimisticId,
          content,
          isUser: true,
          timestamp: new Date(),
          status: 'sending'
        };
        
        const firstPage = old.pages[0];
        const updatedFirstPage: ChatPage = {
          ...firstPage,
          messages: [...firstPage.messages, optimisticMessage]
        };
        
        return {
          ...old,
          pages: [updatedFirstPage, ...old.pages.slice(1)]
        };
      });
      
      try {
        // Save user message to database
        const { error: messageError } = await createMessage(chatId, user.id, content, false);
        if (messageError) throw messageError;
        
        // Update optimistic message to 'sent'
        queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => 
                msg.id === optimisticId 
                  ? { ...msg, status: 'sent' as const }
                  : msg
              )
            }))
          };
        });
        
        // Invoke AI for response (don't await - let it happen in background)
        invokeAIResponse(chatId, content, characterId, user.id);
        
        return { chatId, content, optimisticId };
        
      } catch (error) {
        // Update optimistic message to 'failed'
        queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => 
                msg.id === optimisticId 
                  ? { ...msg, status: 'failed' as const }
                  : msg
              )
            }))
          };
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate credits
      queryClient.invalidateQueries({ queryKey: ['user', 'credits', user?.id] });
    },
  });
};

// Separate function for AI invocation (runs in background)
const invokeAIResponse = async (
  chatId: string, 
  userMessage: string, 
  characterId: string, 
  userId: string
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');
    
    const response = await fetch(`https://rclpyipeytqbamiwcuih.supabase.co/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character_id: characterId,
        chat_id: chatId,
        model: 'openai/gpt-4o-mini',
        user_message: userMessage
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI response failed: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.success || !responseData.content) {
      throw new Error('No valid response received from AI');
    }
    
    // Save AI response to database (real-time will handle UI update)
    const { error: aiMessageError } = await createMessage(
      chatId,
      userId,
      responseData.content,
      true // is_ai_message = true
    );
    
    if (aiMessageError) {
      console.error('Failed to save AI message:', aiMessageError);
    }
    
  } catch (error) {
    console.error('Error invoking AI:', error);
  }
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


// Cache management utilities (simplified)
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
  
  return {
    prefetchChatMessages,
    invalidateChatMessages,
  };
};

// Hook for real-time message updates with simplified duplicate prevention
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
          
          // Add new messages to the cache with simplified duplicate prevention
          queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
            if (!old || !old.pages.length) {
              // Create initial structure if empty
              return {
                pages: [{
                  messages: [newMessage],
                  hasMore: false,
                  oldestTimestamp: null
                }],
                pageParams: [undefined]
              };
            }
            
            // Simple ID-based duplicate prevention only
            const messageExists = old.pages.some(page => 
              page.messages.some(msg => msg.id === newMessage.id)
            );
            
            if (messageExists) {
              console.log('Duplicate message prevented by ID:', newMessage.id);
              return old;
            }
            
            // Replace optimistic messages with real ones (for user messages)
            if (newMessage.isUser) {
              const updatedPages = old.pages.map(page => ({
                ...page,
                messages: page.messages.map(msg => {
                  // Replace temp optimistic message with real one
                  if (msg.id.startsWith('temp-') && msg.content === newMessage.content && msg.isUser) {
                    return newMessage;
                  }
                  return msg;
                })
              }));
              
              // Check if we actually replaced an optimistic message
              const replacedOptimistic = updatedPages.some(page =>
                page.messages.some(msg => msg.id === newMessage.id)
              );
              
              if (replacedOptimistic) {
                return {
                  ...old,
                  pages: updatedPages
                };
              }
            }
            
            // Add new message to the end of the first page
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