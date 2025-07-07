import React, { useState, useEffect } from 'react';
import { ChevronRight, Menu, Search, Heart, Star, MessageCircle, Info, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getUserChats, getCharacterDetails } from '@/lib/supabase-queries';
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
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [characterDetails, setCharacterDetails] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user) {
          // Load chat history
          const { data: chats } = await getUserChats(user.id);
          setChatHistory(chats || []);
        }

        // Load character details
        const { data: charDetails } = await getCharacterDetails(character.id);
        setCharacterDetails(charDetails);
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [character.id]);

  const handleEditCharacter = () => {
    navigate(`/character-creator?edit=${character.id}`);
  };

  const isCharacterOwner = currentUser && characterDetails && currentUser.id === characterDetails.creator_id;

  return (
    <div className="h-screen flex bg-[#121212]">
      {/* Left Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
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

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-80 bg-[#0f0f0f] border-l border-gray-700/50 flex flex-col">
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
                    {loading ? (
                      <div className="text-gray-400 text-center py-4">Loading chats...</div>
                    ) : chatHistory.length === 0 ? (
                      <div className="text-gray-400 text-center py-4">No chat history yet</div>
                    ) : (
                      chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            chat.character?.id === character.id
                              ? 'bg-[#FF7A00]/20 border border-[#FF7A00]/30' 
                              : 'hover:bg-[#1a1a2e]'
                          }`}
                          onClick={() => navigate('/chat', { state: { selectedCharacter: chat.character } })}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={chat.character?.avatar_url} alt={chat.character?.name} />
                              <AvatarFallback className="bg-[#FF7A00] text-white text-sm">
                                {chat.character?.name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-medium text-sm truncate ${
                                  chat.character?.id === character.id ? 'text-[#FF7A00]' : 'text-white'
                                }`}>{chat.character?.name || 'Unknown Character'}</h3>
                                <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                                  {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : 'No messages'}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm truncate">{chat.title || 'New conversation'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="p-4">
                  {loading ? (
                    <div className="text-gray-400 text-center py-4">Loading character details...</div>
                  ) : (
                    <>
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
                            {characterDetails?.short_description || character.tagline || 'No description available.'}
                          </p>
                        </div>

                        {/* Tags */}
                        {characterDetails?.tags && characterDetails.tags.length > 0 && (
                          <div>
                            <h3 className="text-white font-semibold mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {characterDetails.tags.map((tagItem: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-[#1a1a2e] text-gray-300 border border-gray-600/50 text-xs px-2 py-1"
                                >
                                  {tagItem.tag?.name || tagItem.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Creator */}
                        <div>
                          <h3 className="text-white font-semibold mb-2">Creator</h3>
                          <p className="text-gray-400 text-sm">
                            Created by @{characterDetails?.creator?.username || 'Unknown'}
                          </p>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h3 className="text-white font-semibold mb-3">Actions</h3>
                          <div className="flex flex-col space-y-3">
                            {isCharacterOwner && (
                              <Button
                                onClick={handleEditCharacter}
                                className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Character
                              </Button>
                            )}
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};