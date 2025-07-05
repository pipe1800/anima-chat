
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    // Add character's greeting message immediately
    const greeting: Message = {
      id: 'greeting',
      content: getGreeting(character.id),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greeting]);

    // Focus input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [character]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
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

    // Trigger first message handler
    if (isFirstMessage) {
      setIsFirstMessage(false);
      onFirstMessage();
    }

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue, character.id),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userInput: string, characterId: string) => {
    // Simple response logic based on character
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
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-[#1a1a2e] border-b border-gray-700/50 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
              {character.fallback}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-white font-semibold text-lg">{character.name}</h1>
            <p className="text-gray-400 text-sm">{character.tagline}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!message.isUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white text-xs font-bold">
                    {character.fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.isUser
                    ? 'bg-[#FF7A00] text-white rounded-br-md'
                    : 'bg-[#1a1a2e] text-white border border-gray-700/50 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#1a1a2e] border-t border-gray-700/50 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-[#121212] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent transition-all animate-pulse"
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
