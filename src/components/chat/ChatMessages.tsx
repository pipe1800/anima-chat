import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check, CheckCheck, X, Clock } from 'lucide-react';
import { useChatMessages, useRealtimeMessages } from '@/hooks/useChat';
import type { Message } from '@/hooks/useChat';

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  fallback: string;
}

interface ChatMessagesProps {
  chatId: string | null;
  character: Character;
  newMessages?: Message[];
}

const ChatMessages = ({ chatId, character, newMessages = [] }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useChatMessages(chatId);

  // Enable real-time updates
  useRealtimeMessages(chatId);

  // Combine fetched messages with new messages
  const allMessages = React.useMemo(() => {
    const fetchedMessages = data?.pages?.flatMap(page => page.messages) || [];
    return [...fetchedMessages, ...newMessages];
  }, [data?.pages, newMessages]);

  // Auto scroll to bottom for new messages
  useEffect(() => {
    if (newMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [newMessages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && allMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isLoading, allMessages.length]);

  const handleLoadEarlier = () => {
    if (hasNextPage && !isFetchingNextPage) {
      const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0;
      
      fetchNextPage().then(() => {
        // Maintain scroll position after loading earlier messages
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            const scrollDiff = newScrollHeight - currentScrollHeight;
            messagesContainerRef.current.scrollTop = scrollDiff;
          }
        }, 100);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading chat...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Failed to load messages</div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-6 font-['Open_Sans',_sans-serif]"
    >
      {/* Load Earlier Messages Button */}
      {hasNextPage && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleLoadEarlier}
            disabled={isFetchingNextPage}
            variant="outline"
            className="text-sm"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load Earlier Messages'
            )}
          </Button>
        </div>
      )}

      {/* Messages */}
      {allMessages.map(message => (
        <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
          <div className={`flex space-x-3 max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!message.isUser && (
              <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback className="bg-[#FF7A00] text-white text-sm font-bold">
                  {character.fallback}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`px-5 py-3 rounded-2xl ${message.isUser ? 'bg-[#2A2A2A] text-white rounded-br-md' : 'bg-[#1E1E1E] text-white rounded-bl-md'}`}>
              <p className="text-[15px] leading-relaxed">{message.content}</p>
              {message.isUser && message.status && (
                <div className="flex justify-end mt-1">
                  {message.status === 'sending' && (
                    <Clock className="w-3 h-3 text-gray-400" />
                  )}
                  {message.status === 'sent' && (
                    <CheckCheck className="w-3 h-3 text-green-400" />
                  )}
                  {message.status === 'failed' && (
                    <X className="w-3 h-3 text-red-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;