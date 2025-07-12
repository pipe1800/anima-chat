import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useChatMessages, useRealtimeMessages } from '@/hooks/useChat';
import type { Message } from '@/hooks/useChat';
import { MessageGroup } from './MessageGroup';
import { groupMessages } from '@/utils/messageGrouping';

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

  // Group messages for better visual organization
  const messageGroups = React.useMemo(() => {
    return groupMessages(allMessages);
  }, [allMessages]);

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

      {/* Message Groups */}
      {messageGroups.map(group => (
        <MessageGroup 
          key={group.id} 
          group={group} 
          character={character}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;