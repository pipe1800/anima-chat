
import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DailyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function DailyLimitModal({ isOpen, onClose, onUpgrade }: DailyLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF7A00]/10">
            <Zap className="h-8 w-8 text-[#FF7A00]" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Daily Limit Reached!
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            You're on fire! You've used all your free messages for today. To continue your conversation without interruption, upgrade to a premium plan for unlimited messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-3">
          <Button
            onClick={onUpgrade}
            className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-3 text-base font-semibold"
            size="lg"
          >
            Upgrade to Unlimited
          </Button>
          
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
