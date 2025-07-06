
import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Pencil, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

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

const ChatInterface = ({ character, onFirstMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    if (isFirstMessage) {
      setIsFirstMessage(false);
      onFirstMessage();
      
      toast({
        title: "🏆 Achievement Unlocked: First Contact!",
        description: "You've earned 100 free credits for completing your first quest. Use them to unlock premium features!",
        duration: 5000,
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

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a2e] border-b border-gray-700/50 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                {character.fallback}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-white font-bold text-lg">{character.name}</h1>
              {isTyping && (
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="ml-2">typing...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-['Open_Sans',_sans-serif]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex space-x-3 max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!message.isUser && (
                <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white text-sm font-bold">
                    {character.fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`px-5 py-3 rounded-2xl ${
                  message.isUser
                    ? 'bg-[#2A2A2A] text-white rounded-br-md'
                    : 'bg-[#1E1E1E] text-white rounded-bl-md'
                }`}
              >
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
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-[#121212] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all font-['Open_Sans',_sans-serif]"
          />
          <Button 
            type="submit" 
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 py-3 rounded-xl transition-all hover:scale-105"
            disabled={!inputValue.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
