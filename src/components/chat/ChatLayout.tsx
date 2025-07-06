
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Settings, User, Search, Heart, Star, MessageCircle, Info } from 'lucide-react';
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
  description?: string;
  tags?: string[];
  creator?: string;
}

interface ChatLayoutProps {
  character: Character;
  children: React.ReactNode;
}

export const ChatLayout = ({ character, children }: ChatLayoutProps) => {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'details'>('history');

  // Mock chat history data
  const chatHistory = [
    { id: '1', name: 'Luna Mystic', lastMessage: 'The stars whisper of ancient secrets...', timestamp: '2m ago', avatar: '/placeholder.svg', isActive: character.id === 'luna' },
    { id: '2', name: 'Zyx Future', lastMessage: 'In the year 3024, technology will...', timestamp: '1h ago', avatar: '/placeholder.svg', isActive: character.id === 'zyx' },
    { id: '3', name: 'Sakura Dreams', lastMessage: 'Let\'s go on a magical adventure!', timestamp: '2h ago', avatar: '/placeholder.svg', isActive: character.id === 'sakura' },
    { id: '4', name: 'Raven Shadow', lastMessage: 'The ancient texts reveal...', timestamp: '1d ago', avatar: '/placeholder.svg', isActive: character.id === 'raven' },
    { id: '5', name: 'Phoenix Fire', lastMessage: 'Ready for some excitement!', timestamp: '2d ago', avatar: '/placeholder.svg', isActive: character.id === 'phoenix' },
  ];

  // Mock character details
  const characterDetails = {
    description: character.tagline + " I love exploring deep conversations and sharing mystical wisdom with those who seek it.",
    tags: ['Mystical', 'Wise', 'Magical', 'Ancient', 'Spiritual'],
    creator: 'mysticalcreator'
  };

  return (
    <div className="h-screen flex bg-[#121212] overflow-hidden relative">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Chat Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Right Panel - Overlay */}
      {rightPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setRightPanelOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-[#0f0f0f] border-l border-gray-700/50 z-50 flex flex-col animate-slide-in-right">
            {/* Panel Header with Tabs */}
            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Panel</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-[#1a1a2e] p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#FF7A00] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chats</span>
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'bg-[#FF7A00] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'history' && (
                <div className="p-4">
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search chats..."
                      className="bg-[#1a1a2e] border-gray-700/50 text-white placeholder-gray-400 pl-10 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                    />
                  </div>

                  {/* Chat History List */}
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
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
              )}

              {activeTab === 'details' && (
                <div className="p-4">
                  {/* Character Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{character.name}</h2>
                    
                    {/* Large Avatar */}
                    <div className="mb-4">
                      <Avatar className="w-32 h-32 mx-auto ring-4 ring-[#FF7A00]/30">
                        <AvatarImage src={character.avatar} alt={character.name} />
                        <AvatarFallback className="bg-[#FF7A00] text-white text-3xl font-bold">
                          {character.fallback}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    {/* Bio/Description */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">About</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {characterDetails.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {characterDetails.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#1a1a2e] text-gray-300 border border-gray-600/50 text-xs px-2 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Creator */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">Creator</h3>
                      <p className="text-gray-400 text-sm">
                        Created by @{characterDetails.creator}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent border-gray-600/50 text-gray-300 hover:bg-[#1a1a2e] hover:text-white"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Like
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent border-gray-600/50 text-gray-300 hover:bg-[#1a1a2e] hover:text-white"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Favorite
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
