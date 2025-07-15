import React, { useState, useEffect, useRef } from 'react';
import { Send, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import ChatMessages from './ChatMessages';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useUserCredits,
  useCharacterDetails,
  useSendMessage,
  useChatMessages,
  type Message,
  type TrackedContext
} from '@/hooks/useChat';
import { getUserCharacterAddonSettings, type AddonSettings } from '@/lib/user-addon-operations';

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
  trackedContext?: TrackedContext;
  onContextUpdate?: (context: TrackedContext) => void;
}

const ChatInterface = ({
  character,
  onFirstMessage,
  existingChatId,
  trackedContext: parentTrackedContext,
  onContextUpdate
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(existingChatId || null);
  const [addonSettings, setAddonSettings] = useState<AddonSettings>({
    dynamicWorldInfo: false,
    enhancedMemory: false,
    moodTracking: false,
    clothingInventory: false,
    locationTracking: false,
    timeWeather: false,
    relationshipStatus: false,
    chainOfThought: false,
    fewShotExamples: false,
  });
  const [trackedContext, setTrackedContext] = useState<TrackedContext>({
    moodTracking: 'No context',
    clothingInventory: 'No context',
    locationTracking: 'No context',
    timeAndWeather: 'No context',
    relationshipStatus: 'No context'
  });
  
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

  // Initialize chat for existing chat
  useEffect(() => {
    if (existingChatId) {
      setCurrentChatId(existingChatId);
      setIsFirstMessage(false);
    }
  }, [existingChatId]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load addon settings
  useEffect(() => {
    const loadAddonSettings = async () => {
      if (user && character.id) {
        try {
          const settings = await getUserCharacterAddonSettings(user.id, character.id);
          setAddonSettings(settings);
        } catch (error) {
          console.error('Error loading addon settings:', error);
        }
      }
    };
    loadAddonSettings();
  }, [user, character.id]);

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
      const result = await sendMessageMutation.mutateAsync({
        chatId: currentChatId,
        content: messageContent,
        characterId: character.id
      });

      // Update tracked context if returned
      if (result?.updatedContext) {
        setTrackedContext(result.updatedContext);
        onContextUpdate?.(result.updatedContext);
      }

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
    <div className="flex flex-col h-full">
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
        trackedContext={trackedContext}
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
      <div className="bg-[#1a1a2e] border-t border-gray-700/50 p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-[#121212] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all font-['Open_Sans',_sans-serif]"
            disabled={creditsBalance < 1}
          />
          <div className="flex items-center space-x-2">
            {/* Enhanced Memory indicator */}
            {addonSettings.enhancedMemory && (
              <div className="flex items-center justify-center w-10 h-10 text-[#FF7A00]">
                <Wand2 className="w-5 h-5" />
              </div>
            )}
            <Button
              type="submit"
              className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 py-3 rounded-xl transition-all hover:scale-105"
              disabled={!inputValue.trim() || creditsBalance < 1}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
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