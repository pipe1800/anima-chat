
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Mock chat history data
  const chatHistory = [
    { id: '1', name: 'Luna Mystic', lastMessage: 'The stars whisper...', timestamp: '2m ago', avatar: '/placeholder.svg' },
    { id: '2', name: 'Zyx Future', lastMessage: 'In the year 3024...', timestamp: '1h ago', avatar: '/placeholder.svg' },
    { id: '3', name: 'Sakura Dreams', lastMessage: 'Let\'s go on an adventure!', timestamp: '2h ago', avatar: '/placeholder.svg' },
    { id: '4', name: 'Raven Shadow', lastMessage: 'The ancient texts...', timestamp: '1d ago', avatar: '/placeholder.svg' },
  ];

  return (
    <div className="h-screen flex bg-[#121212] overflow-hidden">
      {/* Left Panel - Chat History */}
      <div className={`${leftPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-[#0f0f0f] border-r border-gray-700/50 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Left Panel Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Chat History</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="p-3 rounded-lg hover:bg-[#1a1a2e] cursor-pointer transition-colors mb-2"
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
                      <h3 className="text-white font-medium text-sm truncate">{chat.name}</h3>
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

      {/* Center Panel - Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!leftPanelOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              
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
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Chat Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Right Panel - Character Details */}
      <div className={`${rightPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-[#0f0f0f] border-l border-gray-700/50 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          {/* Right Panel Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Character Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Character Details Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Character Avatar and Info */}
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-[#FF7A00]/50">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white font-bold text-2xl">
                    {character.fallback}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white font-semibold text-lg mb-1">{character.name}</h3>
                <p className="text-gray-400 text-sm">{character.tagline}</p>
              </div>

              {/* Character Stats */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Chats</span>
                    <span className="text-white text-sm">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Rating</span>
                    <span className="text-white text-sm">4.8/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Response Time</span>
                    <span className="text-white text-sm">~2s</span>
                  </div>
                </div>
              </div>

              {/* Character Tags */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-[#FF7A00]/20 border-[#FF7A00]/30 text-[#FF7A00]">
                    Mystical
                  </Badge>
                  <Badge variant="outline" className="bg-[#FF7A00]/20 border-[#FF7A00]/30 text-[#FF7A00]">
                    Wise
                  </Badge>
                  <Badge variant="outline" className="bg-[#FF7A00]/20 border-[#FF7A00]/30 text-[#FF7A00]">
                    Fantasy
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Chat Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
