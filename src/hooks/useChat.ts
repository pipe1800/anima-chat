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
      
      return { chatId: finalChatId, content };
    },
    onSuccess: ({ chatId }) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', chatId] });
      // Invalidate user credits
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

// Hook for handling streaming AI responses
export const useHandleSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addOptimisticMessage, updateMessageStatus } = useChatCache();
  
  const handleSendMessage = async ({
    chatId,
    model,
    messages,
    characterId
  }: {
    chatId: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    characterId: string;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create optimistic AI message
    const tempAiMessageId = `temp-ai-${Date.now()}`;
    const aiMessage: Message = {
      id: tempAiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      status: 'sending'
    };

    // Add optimistic message to cache
    addOptimisticMessage(chatId, aiMessage);

    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session found');
      }

      // Make direct fetch call to Edge Function for streaming support
      const response = await fetch(`https://rclpyipeytqbamiwcuih.supabase.co/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbHB5aXBleXRxYmFtaXdjdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDY0MjAsImV4cCI6MjA2NzMyMjQyMH0.D6IvUZBtLF5MdBGA2Re-1UMEc6bGaT2JhP0V1JuU_KU'
        },
        body: JSON.stringify({
          model,
          character_id: characterId,
          messages,
          chat_id: chatId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse Server-Sent Events (SSE) format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              // Extract content from the streaming response
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const newContent = parsed.choices[0].delta.content;
                accumulatedContent += newContent;
                
                // Update the message content in real-time
                queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
                  if (!old || !old.pages.length) return old;
                  
                  const updatedPages = old.pages.map(page => ({
                    ...page,
                    messages: page.messages.map(msg => 
                      msg.id === tempAiMessageId 
                        ? { ...msg, content: accumulatedContent, status: 'sending' as const }
                        : msg
                    )
                  }));
                  
                  return { ...old, pages: updatedPages };
                });
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      // Save the final AI message to database
      const { data: savedMessage, error: saveError } = await createMessage(
        chatId, 
        characterId, // Use characterId as author for AI messages
        accumulatedContent, 
        true // is_ai_message = true
      );

      if (saveError) {
        console.error('Failed to save AI message:', saveError);
        // Update status to failed but keep the content
        updateMessageStatus(chatId, tempAiMessageId, 'failed');
        toast.error('Failed to save AI response');
        return;
      }

      // Update the message with the real ID and mark as sent
      updateMessageStatus(chatId, tempAiMessageId, 'sent', savedMessage.id);
      
      // Invalidate credits cache as they would have been consumed
      queryClient.invalidateQueries({ queryKey: ['user', 'credits', user.id] });
      
      toast.success('Response generated successfully');

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      // Update the AI message to show error
      queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
        if (!old || !old.pages.length) return old;
        
        const updatedPages = old.pages.map(page => ({
          ...page,
          messages: page.messages.map(msg => 
            msg.id === tempAiMessageId 
              ? { 
                  ...msg, 
                  content: 'Error: Could not get response.',
                  status: 'failed' as const
                }
              : msg
          )
        }));
        
        return { ...old, pages: updatedPages };
      });

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else if (errorMessage.includes('not available')) {
        toast.error('This AI model is not available for your current plan.');
      } else if (errorMessage.includes('Character definition not found')) {
        toast.error('Character not found. Please try a different character.');
      } else {
        toast.error('Failed to generate response. Please try again.');
      }

      throw error;
    }
  };

  return { handleSendMessage };
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
          
          // Only add messages from other sources (AI responses)
          if (payload.new.author_id !== user.id) {
            queryClient.setQueryData(['chat', 'messages', chatId], (old: InfiniteData<ChatPage> | undefined) => {
              if (!old || !old.pages.length) return old;
              
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
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user, queryClient]);
};