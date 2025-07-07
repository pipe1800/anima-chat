
import React from 'react';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageLimitToastProps {
  messagesRemaining: number;
  onDismiss: () => void;
  onUpgrade: () => void;
}

export function MessageLimitToast({ messagesRemaining, onDismiss, onUpgrade }: MessageLimitToastProps) {
  return (
    <div className="bg-gradient-to-r from-[#FF7A00]/90 to-[#FF7A00]/80 backdrop-blur-sm border-b border-[#FF7A00]/30 px-4 py-3 flex items-center justify-between animate-slide-down">
      <div className="flex items-center space-x-3">
        <div className="bg-white/20 p-1.5 rounded-full">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">
            Heads up! You have {messagesRemaining} messages left today.
          </p>
          <p className="text-white/80 text-xs">
            Upgrade now to keep the conversation going without limits.
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onUpgrade}
          className="bg-white text-[#FF7A00] hover:bg-white/90 px-3 py-1 h-7 text-xs font-semibold"
        >
          Upgrade
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="text-white hover:bg-white/10 p-1 h-7 w-7"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
