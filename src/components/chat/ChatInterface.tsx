import React, { useState, useEffect, useRef } from 'react';
import { Send, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import ChatMessages from './ChatMessages';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCharacterAddonSettings } from '@/lib/user-addon-operations';
import { 
  useUserCredits,
  useCharacterDetails,
  useSendMessage,
  useChatMessages,
  type Message
} from '@/hooks/useChat';

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  fallback: string;
}

interface ChatInterfaceProps {
  character: Character;
  onFirstMessage: () => void;
  existingChatId?: string;
}

const ChatInterface = ({
  character,
  onFirstMessage,
  existingChatId
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(existingChatId || null);
  const [hasEnhancedMemory, setHasEnhancedMemory] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  
  // Listen to message updates to stop typing when AI responds
  const { data: messagesData } = useChatMessages(currentChatId);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // React Query hooks
  const { data: creditsBalance = 0 } = useUserCredits();
  const { data: characterDetails } = useCharacterDetails(character.id);
  const sendMessageMutation = useSendMessage();

  // Initialize chat for existing chat and load addon settings
  useEffect(() => {
    if (existingChatId) {
      setCurrentChatId(existingChatId);
      setIsFirstMessage(false);
    }
    
    // Load addon settings to check for enhanced memory and background image
    const loadAddonSettings = async () => {
      if (user && currentChatId) {
        try {
          const settings = await getUserCharacterAddonSettings(user.id, character.id);
          setHasEnhancedMemory(settings.enhancedMemory);
          
          // TODO: Load chat-specific background image from storage or database
          // For now, we'll use a placeholder implementation
        } catch (error) {
          console.error('Error loading addon settings:', error);
        }
      }
    };
    
    loadAddonSettings();
  }, [existingChatId, user, character.id]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Stop typing indicator when AI message appears
  useEffect(() => {
    if (!isTyping || !messagesData?.pages) return;
    
    const allMessages = messagesData.pages.flatMap(page => page.messages);
    const latestMessage = allMessages[allMessages.length - 1];
    
    // If latest message is from AI and we're showing typing indicator, stop it
    if (latestMessage && !latestMessage.isUser) {
      setIsTyping(false);
    }
  }, [messagesData, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !currentChatId) return;

    // Check if user has enough credits (need at least 1 credit per message)
    if (creditsBalance < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to existing chat
      await sendMessageMutation.mutateAsync({
        chatId: currentChatId,
        content: messageContent,
        characterId: character.id
      });

      // Handle first message achievement if needed
      if (isFirstMessage) {
        setIsFirstMessage(false);
        onFirstMessage();
        toast({
          title: "🏆 Achievement Unlocked: First Contact!",
          description: "You've earned 100 free credits for completing your first quest. Use them to unlock premium features!",
          duration: 5000
        });
      }

      // Note: Don't set isTyping(false) here - let the useEffect handle it when AI message arrives

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };


  const handleUpgrade = () => {
    // Navigate to upgrade page or show upgrade modal
    console.log('Navigate to upgrade page');
  };

  const handleCloseInsufficientCreditsModal = () => {
    setShowInsufficientCreditsModal(false);
  };


  return (
    <div 
      className="flex flex-col h-full"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={handleCloseInsufficientCreditsModal}
        currentBalance={creditsBalance}
        onUpgrade={handleUpgrade}
      />

      {/* Messages Area */}
      <ChatMessages 
        chatId={currentChatId} 
        character={character}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-6 pb-2">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">{character.name} is typing...</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#1a1a2e]/90 backdrop-blur-sm border-t border-gray-700/50 p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1 relative">
            {hasEnhancedMemory && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Wand2 className="w-5 h-5 text-[#FF7A00]" />
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Message ${character.name}...`}
              className={`w-full bg-[#121212] border border-gray-700/50 rounded-xl py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all font-['Open_Sans',_sans-serif] ${
                hasEnhancedMemory ? 'pl-12 pr-4' : 'px-4'
              }`}
              disabled={creditsBalance < 1}
            />
          </div>
          <Button
            type="submit"
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 py-3 rounded-xl transition-all hover:scale-105"
            disabled={!inputValue.trim() || creditsBalance < 1}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        {/* Credit balance indicator */}
        <div className="mt-2 text-center" data-tutorial="credits-display">
          <p className="text-gray-400 text-xs">
            {creditsBalance.toLocaleString()} credits remaining
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;