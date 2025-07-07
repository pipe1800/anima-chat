import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Pencil, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageLimitToast } from './MessageLimitToast';
import { DailyLimitModal } from './DailyLimitModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createChat, 
  createMessage, 
  getChatMessages, 
  getDailyMessageCount,
  getUserSubscription,
  getCharacterDetails
} from '@/lib/supabase-queries';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

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
}

const ChatInterface = ({
  character,
  onFirstMessage
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [characterGreeting, setCharacterGreeting] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Daily usage tracking - now using real data
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(75);
  const [isGuestPass, setIsGuestPass] = useState(true);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get user's daily message count and subscription
        const [messageCountResult, subscriptionResult, characterDetailsResult] = await Promise.all([
          getDailyMessageCount(user.id),
          getUserSubscription(user.id),
          getCharacterDetails(character.id)
        ]);

        // Set message count and daily limit
        setMessagesUsed(messageCountResult.data?.count || 0);
        
        // Determine if user is on guest pass and set limits
        const userTier = subscriptionResult.data?.plan?.name || "Guest Pass";
        const isGuest = userTier === "Guest Pass";
        setIsGuestPass(isGuest);
        setDailyLimit(isGuest ? 75 : 999999);

        // Set character greeting
        const greeting = characterDetailsResult.data?.definition?.[0]?.greeting || 
                        `Hello! I'm ${character.name}. It's great to meet you. What would you like to talk about?`;
        setCharacterGreeting(greeting);

        // Add greeting message
        const greetingMessage: Message = {
          id: 'greeting',
          content: greeting,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([greetingMessage]);

        console.log('Chat initialized:', { 
          messagesUsed: messageCountResult.data?.count, 
          userTier, 
          isGuest,
          greeting 
        });

      } catch (error) {
        console.error('Error loading initial chat data:', error);
      } finally {
        setLoading(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    loadInitialData();
  }, [user, character]);

  // Show toast when user has exactly 10 messages remaining
  useEffect(() => {
    const messagesRemaining = dailyLimit - messagesUsed;
    if (isGuestPass && messagesRemaining === 10 && messagesUsed > 0) {
      setShowLimitToast(true);
    }
  }, [messagesUsed, dailyLimit, isGuestPass]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    // Check if user has reached their daily limit
    if (isGuestPass && messagesUsed >= dailyLimit) {
      setShowDailyLimitModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Create chat session if it doesn't exist
      let chatId = currentChatId;
      if (!chatId) {
        console.log('Creating new chat session...');
        const { data: newChat, error: chatError } = await createChat(
          user.id, 
          character.id, 
          `Chat with ${character.name}`
        );
        
        if (chatError) {
          console.error('Error creating chat:', chatError);
          toast({
            title: "Error",
            description: "Failed to create chat session. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        chatId = newChat.id;
        setCurrentChatId(chatId);
        console.log('Created new chat:', chatId);
      }

      // Save user message to database
      console.log('Saving user message...');
      const { error: messageError } = await createMessage(chatId, user.id, messageContent, false);
      
      if (messageError) {
        console.error('Error saving message:', messageError);
        toast({
          title: "Error",
          description: "Failed to save message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update message count
      setMessagesUsed(prev => prev + 1);

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
          id: (Date.now() + 1).toString(),
          content: getAIResponse(messageContent, character.id),
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);

        // Save AI response to database
        try {
          await createMessage(chatId, user.id, aiResponse.content, true);
          console.log('AI response saved to database');
        } catch (error) {
          console.error('Error saving AI response:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error handling message:', error);
      setIsTyping(false);
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

  const handleDismissToast = () => {
    setShowLimitToast(false);
  };

  const handleCloseDailyLimitModal = () => {
    setShowDailyLimitModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  const messagesRemaining = dailyLimit - messagesUsed;

  return (
    <div className="flex flex-col h-full">
      {/* Message Limit Toast */}
      {showLimitToast && (
        <MessageLimitToast
          messagesRemaining={messagesRemaining}
          onDismiss={handleDismissToast}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Daily Limit Modal */}
      <DailyLimitModal
        isOpen={showDailyLimitModal}
        onClose={handleCloseDailyLimitModal}
        onUpgrade={handleUpgrade}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-['Open_Sans',_sans-serif]">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex space-x-3 max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!message.isUser && (
                <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white text-sm font-bold">
                    {character.fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`px-5 py-3 rounded-2xl ${message.isUser ? 'bg-[#2A2A2A] text-white rounded-br-md' : 'bg-[#1E1E1E] text-white rounded-bl-md'}`}>
                <p className="text-[15px] leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
            disabled={isGuestPass && messagesUsed >= dailyLimit}
          />
          <Button
            type="submit"
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 py-3 rounded-xl transition-all hover:scale-105"
            disabled={!inputValue.trim() || (isGuestPass && messagesUsed >= dailyLimit)}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        {/* Message count indicator for Guest Pass users */}
        {isGuestPass && (
          <div className="mt-2 text-center">
            <p className="text-gray-400 text-xs">
              {messagesUsed} / {dailyLimit} messages used today
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
