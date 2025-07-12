import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/utils/messageGrouping";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

interface MessageGroupData {
  id: string;
  messages: Message[];
  isUser: boolean;
  timestamp: Date;
  showTimestamp: boolean;
}

interface Character {
  id: string;
  name: string;
  avatar: string;
  fallback: string;
}

interface MessageGroupProps {
  group: MessageGroupData;
  character: Character;
}

export function MessageGroup({ group, character }: MessageGroupProps) {
  const { messages, isUser, showTimestamp } = group;

  return (
    <div className="mb-6">
      {showTimestamp && (
        <div className="text-center text-xs text-muted-foreground mb-4">
          {formatMessageTime(group.timestamp)}
        </div>
      )}
      
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback>{character.fallback}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`px-4 py-2 text-sm ${
                isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              } ${
                // Rounded corners based on position in group
                index === 0 && index === messages.length - 1
                  ? 'rounded-lg' // Single message
                  : index === 0
                  ? isUser
                    ? 'rounded-t-lg rounded-bl-lg rounded-br-sm'
                    : 'rounded-t-lg rounded-br-lg rounded-bl-sm'
                  : index === messages.length - 1
                  ? isUser
                    ? 'rounded-b-lg rounded-bl-lg rounded-br-sm'
                    : 'rounded-b-lg rounded-br-lg rounded-bl-sm'
                  : isUser
                  ? 'rounded-bl-lg rounded-br-sm'
                  : 'rounded-br-lg rounded-bl-sm'
              }`}
            >
              {message.content}
              {isUser && message.status && (
                <div className="text-xs opacity-70 mt-1">
                  {message.status === 'sending' && '●'}
                  {message.status === 'sent' && '✓'}
                  {message.status === 'failed' && '✗'}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}