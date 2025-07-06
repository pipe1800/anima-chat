
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Settings, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AppSidebar } from '@/components/dashboard/AppSidebar';

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  fallback: string;
}

interface ChatLayoutProps {
  character: Character;
  children: React.ReactNode;
}

export const ChatLayout = ({ character, children }: ChatLayoutProps) => {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Mock chat history data
  const chatHistory = [
    { id: '1', name: 'Luna Mystic', lastMessage: 'The stars whisper...', timestamp: '2m ago', avatar: '/placeholder.svg', isActive: character.id === 'luna' },
    { id: '2', name: 'Zyx Future', lastMessage: 'In the year 3024...', timestamp: '1h ago', avatar: '/placeholder.svg', isActive: character.id === 'zyx' },
    { id: '3', name: 'Sakura Dreams', lastMessage: 'Let\'s go on an adventure!', timestamp: '2h ago', avatar: '/placeholder.svg', isActive: character.id === 'sakura' },
    { id: '4', name: 'Raven Shadow', lastMessage: 'The ancient texts...', timestamp: '1d ago', avatar: '/placeholder.svg', isActive: character.id === 'raven' },
  ];

  return (
    <div className="h-screen flex bg-[#121212] overflow-hidden">
      {/* Left Panel - Main Navigation */}
      <AppSidebar />

      {/* Center Panel - Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        {/* Chat Header */}
        <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
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

            {!rightPanelOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(true)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Chat Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Right Panel - Chat History */}
      <div className={`${rightPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-[#0f0f0f] border-l border-gray-700/50 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Right Panel Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">My Chats</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search chats..."
                className="bg-[#1a1a2e] border-gray-700/50 text-white placeholder-gray-400 pl-10 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
              />
            </div>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  chat.isActive 
                    ? 'bg-[#FF7A00]/20 border border-[#FF7A00]/30' 
                    : 'hover:bg-[#1a1a2e]'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="bg-[#FF7A00] text-white text-sm">
                      {chat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium text-sm truncate ${
                        chat.isActive ? 'text-[#FF7A00]' : 'text-white'
                      }`}>{chat.name}</h3>
                      <span className="text-gray-400 text-xs flex-shrink-0 ml-2">{chat.timestamp}</span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
