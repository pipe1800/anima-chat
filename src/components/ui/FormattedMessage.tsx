import React from 'react';
import { parseMessageContent } from '@/lib/utils/messageFormatting';

export interface FormattedMessageProps {
  content: string;
  className?: string;
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  const segments = parseMessageContent(content);
  
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'speech':
            return (
              <span key={index} className="text-current">
                "{segment.content}"
              </span>
            );
          case 'action':
            return (
              <span key={index} className="italic text-muted-foreground/90">
                *{segment.content}*
              </span>
            );
          default:
            return (
              <span key={index} className="text-current">
                {segment.content}
              </span>
            );
        }
      })}
    </span>
  );
}