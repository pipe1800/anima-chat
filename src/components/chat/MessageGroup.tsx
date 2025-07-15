import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/utils/messageGrouping";
import { ContextDisplay } from "./ContextDisplay";
import { FormattedMessage } from "@/components/ui/FormattedMessage";
import type { TrackedContext, Message } from "@/hooks/useChat";

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
  trackedContext?: TrackedContext;
  addonSettings?: {
    moodTracking?: boolean;
    clothingInventory?: boolean;
    locationTracking?: boolean;
    timeAndWeather?: boolean;
    relationshipStatus?: boolean;
    characterPosition?: boolean;
  };
}

export function MessageGroup({ group, character, trackedContext, addonSettings }: MessageGroupProps) {
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
              <FormattedMessage content={message.content} />
            </div>
          ))}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 flex-shrink-0" />
        )}
      </div>
      
      {/* Show context display for AI messages when addons are enabled */}
      {!isUser && (
        <div className="mt-3 ml-11">
          {messages.map(msg => {
            // Show context if there are updates, current context, or any stateful addons are enabled
            const hasContextUpdates = msg.contextUpdates && Object.keys(msg.contextUpdates).length > 0;
            const hasCurrentContext = msg.current_context && Object.keys(msg.current_context).length > 0;
            const hasEnabledAddons = addonSettings && (
              addonSettings.moodTracking || 
              addonSettings.clothingInventory || 
              addonSettings.locationTracking || 
              addonSettings.timeAndWeather || 
              addonSettings.relationshipStatus ||
              addonSettings.characterPosition
            );
            
            if (hasContextUpdates || hasCurrentContext || hasEnabledAddons) {
              return (
                <div key={`${msg.id}-context`} className="mb-2">
                  <ContextDisplay 
                    contextUpdates={msg.contextUpdates} 
                    currentContext={msg.current_context || trackedContext}
                    addonSettings={addonSettings}
                    className="mt-2"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}