
import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Pencil, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageLimitToast } from './MessageLimitToast';

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
  
  // Daily usage tracking (mock data - in real app this would come from props/context)
  const [messagesUsed, setMessagesUsed] = useState(65); // Mock: user has used 65 messages
  const dailyLimit = 75;
  const messagesRemaining = dailyLimit - messagesUsed;
  const isGuestPass = true; // Mock: user is on Guest Pass
  const [showLimitToast, setShowLimitToast] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Show toast when user has exactly 10 messages remaining
  useEffect(() => {
    if (isGuestPass && messagesRemaining === 10 && messagesUsed > 0) {
      setShowLimitToast(true);
    }
  }, [messagesRemaining, isGuestPass, messagesUsed]);

  // Character greeting messages
  const getGreeting = (characterId: string) => {
    const greetings = {
      luna: "✨ Hello there! I sense a spark of magic in you. What mystical adventures shall we embark on together?",
      zyx: "🚀 Greetings, traveler! I've just returned from the year 3024. Ready to explore the boundaries of possibility?",
      sakura: "🌸 Hi! I'm so excited to meet you! What kind of fun adventure should we go on today?",
      raven: "🌙 *emerges from the shadows* Interesting... you've found your way to me. What secrets do you seek?",
      phoenix: "🔥 Well, well! Look who's ready for some excitement. I can already tell we're going to have a blast!"
    };
    return greetings[characterId as keyof typeof greetings] || "Hello! It's great to meet you. What would you like to talk about?";
  };

  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      content: getGreeting(character.id),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greeting]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [character]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if user has reached their daily limit
    if (isGuestPass && messagesUsed >= dailyLimit) {
      toast({
        title: "Daily limit reached",
        description: "You've used all your daily messages. Upgrade to continue chatting!",
        duration: 5000
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Increment message count
    setMessagesUsed(prev => prev + 1);

    if (isFirstMessage) {
      setIsFirstMessage(false);
      onFirstMessage();
      toast({
        title: "🏆 Achievement Unlocked: First Contact!",
        description: "You've earned 100 free credits for completing your first quest. Use them to unlock premium features!",
        duration: 5000
      });
    }

    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue, character.id),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
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
