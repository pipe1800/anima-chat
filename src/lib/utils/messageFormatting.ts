// Utility for parsing and formatting message content
export interface MessageSegment {
  type: 'text' | 'speech' | 'action';
  content: string;
}

export function parseMessageContent(content: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let currentIndex = 0;
  
  while (currentIndex < content.length) {
    // Find next speech or action
    const nextSpeech = content.indexOf('"', currentIndex);
    const nextAction = content.indexOf('*', currentIndex);
    
    // Determine which comes first
    let nextSpecial = -1;
    let type: 'speech' | 'action' = 'speech';
    
    if (nextSpeech === -1 && nextAction === -1) {
      // No more special formatting, add remaining text
      const remaining = content.substring(currentIndex).trim();
      if (remaining) {
        segments.push({ type: 'text', content: remaining });
      }
      break;
    } else if (nextSpeech === -1) {
      nextSpecial = nextAction;
      type = 'action';
    } else if (nextAction === -1) {
      nextSpecial = nextSpeech;
      type = 'speech';
    } else {
      if (nextSpeech < nextAction) {
        nextSpecial = nextSpeech;
        type = 'speech';
      } else {
        nextSpecial = nextAction;
        type = 'action';
      }
    }
    
    // Add text before special formatting
    if (nextSpecial > currentIndex) {
      const textBefore = content.substring(currentIndex, nextSpecial).trim();
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }
    
    // Find the closing character
    const closingChar = type === 'speech' ? '"' : '*';
    const closingIndex = content.indexOf(closingChar, nextSpecial + 1);
    
    if (closingIndex === -1) {
      // No closing character found, treat as regular text
      const remaining = content.substring(nextSpecial).trim();
      if (remaining) {
        segments.push({ type: 'text', content: remaining });
      }
      break;
    }
    
    // Extract the formatted content
    const formattedContent = content.substring(nextSpecial + 1, closingIndex).trim();
    if (formattedContent) {
      segments.push({ type, content: formattedContent });
    }
    
    currentIndex = closingIndex + 1;
  }
  
  return segments;
}