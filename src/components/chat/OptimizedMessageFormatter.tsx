import React, { useMemo } from 'react';

interface OptimizedMessageFormatterProps {
  content: string;
  isAiMessage: boolean;
  characterName?: string;
}

interface ParsedContent {
  speech: string[];
  actions: string[];
  text: string;
}

const OptimizedMessageFormatter = ({ content, isAiMessage, characterName }: OptimizedMessageFormatterProps) => {
  const parsedContent = useMemo((): ParsedContent => {
    if (!content) return { speech: [], actions: [], text: '' };

    // Cache key for memoization
    const cacheKey = `${content}-${isAiMessage}`;
    
    // Speech pattern: "quoted text" or 'quoted text'
    const speechMatches = content.match(/["']([^"']+)["']/g) || [];
    const speech = speechMatches.map(match => match.slice(1, -1));

    // Action pattern: *action* or **action**
    const actionMatches = content.match(/\*+([^*]+)\*+/g) || [];
    const actions = actionMatches.map(match => match.replace(/\*/g, ''));

    // Clean text without speech and actions
    let cleanText = content
      .replace(/["']([^"']+)["']/g, '') // Remove speech
      .replace(/\*+([^*]+)\*+/g, '') // Remove actions
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return { speech, actions, text: cleanText };
  }, [content, isAiMessage]);

  const renderFormattedContent = () => {
    if (!isAiMessage) {
      return <span className="text-foreground">{content}</span>;
    }

    const { speech, actions, text } = parsedContent;
    const elements: React.ReactNode[] = [];
    let textIndex = 0;

    // Interleave speech, actions, and text
    const allElements = [];
    
    // Find positions of speech and actions in original content
    const speechRegex = /["']([^"']+)["']/g;
    const actionRegex = /\*+([^*]+)\*+/g;
    
    let match;
    const positions: Array<{ type: 'speech' | 'action', content: string, index: number }> = [];
    
    while ((match = speechRegex.exec(content)) !== null) {
      positions.push({ type: 'speech', content: match[1], index: match.index });
    }
    
    while ((match = actionRegex.exec(content)) !== null) {
      positions.push({ type: 'action', content: match[1], index: match.index });
    }
    
    // Sort by position in original text
    positions.sort((a, b) => a.index - b.index);
    
    let lastIndex = 0;
    
    positions.forEach((pos, idx) => {
      // Add text before this element
      if (pos.index > lastIndex) {
        const beforeText = content.slice(lastIndex, pos.index).trim();
        if (beforeText) {
          elements.push(
            <span key={`text-${idx}`} className="text-foreground">
              {beforeText}
            </span>
          );
        }
      }
      
      // Add the speech or action element
      if (pos.type === 'speech') {
        elements.push(
          <span key={`speech-${idx}`} className="text-primary font-medium">
            "{pos.content}"
          </span>
        );
      } else {
        elements.push(
          <span key={`action-${idx}`} className="text-muted-foreground italic">
            *{pos.content}*
          </span>
        );
      }
      
      lastIndex = pos.index;
    });
    
    // Add remaining text
    const remainingText = content.slice(lastIndex).replace(/["']([^"']+)["']/g, '').replace(/\*+([^*]+)\*+/g, '').trim();
    if (remainingText) {
      elements.push(
        <span key="remaining" className="text-foreground">
          {remainingText}
        </span>
      );
    }

    return elements.length > 0 ? elements : <span className="text-foreground">{content}</span>;
  };

  return (
    <div className="message-content">
      {renderFormattedContent()}
    </div>
  );
};

export default React.memo(OptimizedMessageFormatter);