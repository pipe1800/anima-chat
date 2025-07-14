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
}

const ChatMessages = ({ chatId, character }: ChatMessagesProps) => {
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

  // Use only fetched messages from database (single source of truth)
  const allMessages = React.useMemo(() => {
    return data?.pages?.flatMap(page => page.messages) || [];
  }, [data?.pages]);

  // Group messages for better visual organization
  const messageGroups = React.useMemo(() => {
    return groupMessages(allMessages);
  }, [allMessages]);

  // Auto scroll to bottom for new messages
  useEffect(() => {
    if (allMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">Failed to load messages</div>
      </div>
    );
  }

  // Show empty state when no chat is selected
  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <p className="text-lg">Start a conversation with {character.name}</p>
          <p className="text-sm mt-2">Send a message below to begin</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading messages...
        </div>
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
      {messageGroups.length > 0 ? (
        messageGroups.map(group => (
          <MessageGroup 
            key={group.id} 
            group={group} 
            character={character}
          />
        ))
      ) : (
        // Show empty state for chat with no messages yet
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <p className="text-lg">Your conversation with {character.name} will appear here</p>
            <p className="text-sm mt-2">Send your first message to get started!</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;