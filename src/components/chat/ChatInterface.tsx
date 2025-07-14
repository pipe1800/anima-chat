import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import ChatMessages from './ChatMessages';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useUserCredits,
  useCharacterDetails,
  useSendMessage,
  useConsumeCredits,
  useChatCache,
  useRealtimeMessages,
  type Message
} from '@/hooks/useChat';
import { createMessage } from '@/lib/supabase-queries';

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
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // React Query hooks
  const { data: creditsBalance = 0 } = useUserCredits();
  const { data: characterDetails } = useCharacterDetails(character.id);
  const sendMessageMutation = useSendMessage();
  const consumeCreditsMutation = useConsumeCredits();
  const { addOptimisticMessage, updateMessageStatus } = useChatCache();
  
  // Enable real-time updates for current chat
  useRealtimeMessages(currentChatId);

  // Initialize greeting message for new chats
  useEffect(() => {
    if (!existingChatId && characterDetails) {
      const greeting = characterDetails.definition?.[0]?.greeting || 
                      `Hello! I'm ${character.name}. It's great to meet you. What would you like to talk about?`;
      
        const greetingMessage: Message = {
          id: 'greeting',
          content: greeting,
          isUser: false,
          timestamp: new Date(),
          status: 'sent'
        };
      setNewMessages([greetingMessage]);
    }
    
    if (existingChatId) {
      setCurrentChatId(existingChatId);
      setIsFirstMessage(false);
    }
  }, [existingChatId, characterDetails, character.name]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    // Check if user has enough credits (need at least 1 credit per message)
    if (creditsBalance < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };
    
    // Optimistically add user message
    setNewMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message using React Query mutation
      const result = await sendMessageMutation.mutateAsync({
        chatId: currentChatId,
        content: messageContent,
        characterId: character.id,
        characterName: character.name
      });

      // Update chat ID if it was created
      if (!currentChatId) {
        setCurrentChatId(result.chatId);
      }

      // Update message status to sent
      updateMessageStatus(result.chatId, tempId, 'sent');

      // Handle first message achievement
      if (isFirstMessage) {
        setIsFirstMessage(false);
        onFirstMessage();
        toast({
          title: "🏆 Achievement Unlocked: First Contact!",
          description: "You've earned 100 free credits for completing your first quest. Use them to unlock premium features!",
          duration: 5000
        });
      }

      // Generate AI response
      setTimeout(async () => {
        setIsTyping(false);
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: getAIResponse(messageContent, character.id),
          isUser: false,
          timestamp: new Date(),
          status: 'sent'
        };
        
        setNewMessages(prev => [...prev, aiResponse]);

        // Save AI response to database and consume credits
        try {
          await createMessage(result.chatId, user.id, aiResponse.content, true);
          await consumeCreditsMutation.mutateAsync(1);
          
          console.log('AI response saved and credits consumed');
        } catch (error) {
          console.error('Error saving AI response or consuming credits:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error handling message:', error);
      setIsTyping(false);
      
      // Update message status to failed
      if (currentChatId) {
        updateMessageStatus(currentChatId, tempId, 'failed');
      } else {
        // Remove the optimistic message if no chat was created
        setNewMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
      
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAIResponse = (userInput: string, characterId: string) => {
    const responses = {
      luna: "🔮 I see... the stars whisper interesting things about your words. Tell me more about what draws you to the mystical arts?",
      zyx: "⚡ Fascinating! In my timeline, we solved similar questions using quantum probability matrices. What's your take on this?",
      sakura: "😊 That's so cool! You know what? That reminds me of this amazing thing that happened to me yesterday...",
      raven: "🖤 *nods knowingly* Yes... I've seen this pattern before in the ancient texts. The shadows speak of deeper meanings...",
      phoenix: "🔥 Oh, you've got fire in you! I love that energy. Let's turn up the heat on this conversation!"
    };
    return responses[characterId as keyof typeof responses] || "That's really interesting! I'd love to hear more about your thoughts on this.";
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
        newMessages={newMessages}
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