import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import DiscordCTA from '../DiscordCTA';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboard';
import { 
  MessageCircle, 
  Trophy, 
  Zap, 
  Star, 
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  Plus,
  Edit,
  Share,
  CreditCard,
  CheckCircle,
  Crown,
  Heart
} from 'lucide-react';

export function DashboardContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Use React Query hook for dashboard data
  const { 
    data: dashboardData, 
    isLoading: dataLoading, 
    error: dashboardError 
  } = useDashboardData();

  // Extract data with fallbacks
  const recentChats = dashboardData?.chats || [];
  const myCharacters = dashboardData?.characters || [];
  const favoriteCharacters = dashboardData?.favorites || [];
  const userCredits = dashboardData?.credits || 0;
  const subscription = dashboardData?.subscription;
  const creditsUsed = dashboardData?.creditsUsed || 0;
  const monthlyAllowance = subscription?.plan?.monthly_credits_allowance || 1000;

  const handleStartChat = (character: any) => {
    navigate('/chat', { state: { selectedCharacter: character } });
  };

  const handleContinueChat = (chat: any) => {
    navigate('/chat', { 
      state: { 
        selectedCharacter: chat.character, 
        existingChatId: chat.id 
      } 
    });
  };

  const handleEditCharacter = (character: any) => {
    navigate('/character-creator', { 
      state: { 
        editingCharacter: character,
        isEditing: true 
      } 
    });
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Please sign in to access your ANIMA dashboard.</div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Failed to load dashboard data</div>
          <div className="text-gray-400 text-sm">Please refresh the page to try again</div>
        </div>
      </div>
    );
  }

  const userTier = subscription?.plan?.name || "Guest Pass";
  const isGuestPass = userTier === "Guest Pass";
  const username = profile?.username || user.email?.split('@')[0] || 'User';

  const formattedRecentChats = recentChats.map(chat => ({
    id: chat.id,
    character: {
      id: chat.character?.id,
      name: chat.character?.name || 'Unknown',
      avatar: chat.character?.name?.charAt(0) || 'U',
      image: chat.character?.avatar_url || "/placeholder.svg"
    },
    lastMessage: "No messages yet", // Will be enhanced later
    lastMessageIsAI: false,
    timestamp: new Date(chat.last_message_at || chat.created_at).toLocaleDateString(),
    originalChat: chat
  }));

  const formattedMyCharacters = myCharacters.map(character => ({
    id: character.id,
    name: character.name,
    avatar: character.name.charAt(0),
    image: character.avatar_url || "/placeholder.svg",
    totalChats: character.interaction_count || 0,
    likesCount: 0, // Will be enhanced later
    originalCharacter: character
  }));

  const formattedFavoriteCharacters = favoriteCharacters.map(character => ({
    id: character.id,
    name: character.name,
    avatar: character.name.charAt(0),
    image: character.avatar_url || "/placeholder.svg",
    totalChats: character.actual_chat_count || 0,
    likesCount: character.likes_count || 0,
    creatorUsername: character.creator?.username || 'Unknown',
    originalCharacter: character
  }));

  console.log('Formatted favorite characters:', formattedFavoriteCharacters);

  return (
    <div className="min-h-screen bg-[#121212]">
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl font-bold">
              Welcome back to ANIMA, @{username}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Ready to continue your digital adventures?</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
              <AvatarImage 
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face"} 
                alt={profile?.username || "User"} 
              />
              <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                {profile?.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Username and Credits */}
            <div className="text-right">
              <p className="text-white text-lg font-bold">
                @{username}
              </p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <Zap className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-[#FF7A00] text-sm font-bold">{userCredits.toLocaleString()} credits</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats cards above Daily Message Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Chats</p>
                  <p className="text-white text-2xl font-bold">{recentChats.length}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Characters Created</p>
                  <p className="text-white text-2xl font-bold">{myCharacters.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Credits</p>
                  <p className="text-white text-2xl font-bold">{userCredits.toLocaleString()}</p>
                </div>
                <Sparkles className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Plan</p>
                  <p className="text-white text-lg font-bold">{userTier}</p>
                </div>
                <Crown className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Your Dashboard sections - moved above Daily Quest */}
        <Card className="bg-[#1a1a2e] border-gray-700/50 min-h-[800px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-2xl">Your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
              <Tabs defaultValue="recent-chats" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#121212] border border-gray-700/50">
                  <TabsTrigger 
                    value="recent-chats" 
                    className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white text-gray-400"
                  >
                    Recent Chats
                  </TabsTrigger>
                  <TabsTrigger 
                    value="my-characters" 
                    className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white text-gray-400"
                  >
                    My Characters
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites" 
                    className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white text-gray-400"
                  >
                    Favorites
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recent-chats" className="mt-6">
                  <div className="space-y-3">
                    {formattedRecentChats.length > 0 ? (
                      formattedRecentChats.map((chat) => (
                        <Card
                          key={chat.id}
                          className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
                                <AvatarImage 
                                  src={chat.character.image} 
                                  alt={chat.character.name}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                                  {chat.character.avatar}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-white font-bold text-lg">
                                    {chat.character.name}
                                  </h3>
                                  <p className="text-gray-500 text-sm flex-shrink-0 ml-2">
                                    {chat.timestamp}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  {chat.lastMessage !== "No messages yet" ? (
                                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 flex-1 mr-3">
                                      <span className={chat.lastMessageIsAI ? "text-[#FF7A00]" : "text-blue-400"}>
                                        {chat.lastMessageIsAI ? chat.character.name : 'You'}:
                                      </span>
                                      {' '}{chat.lastMessage}
                                    </p>
                                  ) : (
                                    <p className="text-gray-400 text-sm flex-1 mr-3">No messages yet</p>
                                  )}
                                  <Button
                                    onClick={() => handleContinueChat(chat.originalChat)}
                                    size="sm"
                                    className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white flex-shrink-0"
                                  >
                                    Continue Chat
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No recent chats. Start a conversation!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="my-characters" className="mt-6">
                  <div className="grid grid-cols-4 gap-4">
                    {formattedMyCharacters.length > 0 ? (
                      formattedMyCharacters.map((character) => (
                        <Card
                          key={character.id}
                          className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 relative overflow-hidden h-80 group"
                        >
                          <CardContent className="p-0 relative h-full">
                            <img 
                              src={character.image} 
                              alt={character.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            
                            {/* Middle section with buttons - hidden by default, shown on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
                                  onClick={() => handleStartChat(character.originalCharacter)}
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  New Chat
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
                                  onClick={() => handleEditCharacter(character.originalCharacter)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-bold text-lg mb-2 truncate" title={character.name}>
                                {character.name.length > 15 ? `${character.name.substring(0, 15)}...` : character.name}
                              </h3>
                              
                              <div className="flex items-center justify-center space-x-4 text-sm mb-3">
                                <div className="flex items-center space-x-1 text-gray-300">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{character.totalChats}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-300">
                                  <Heart className="w-4 h-4" />
                                  <span>{character.likesCount}</span>
                                </div>
                              </div>
                              
                              {/* Description preview - 3 lines */}
                              <p className="text-gray-300 text-xs leading-tight line-clamp-3 mb-0">
                                {character.originalCharacter.short_description || "No description available for this character."}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No characters created yet.</p>
                        <Button className="bg-[#FF7A00] hover:bg-[#FF7A00]/80">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Character
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="mt-6">
                  <div className="grid grid-cols-4 gap-4">
                    {formattedFavoriteCharacters.length > 0 ? (
                      formattedFavoriteCharacters.map((character) => (
                        <Card
                          key={character.id}
                          className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 relative overflow-hidden h-80 group"
                        >
                          <CardContent className="p-0 relative h-full">
                            <img 
                              src={character.image} 
                              alt={character.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            
                            {/* Middle section with button - hidden by default, shown on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                size="sm"
                                className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
                                onClick={() => handleStartChat(character.originalCharacter)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                New Chat
                              </Button>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-bold text-lg mb-2 truncate" title={character.name}>
                                {character.name.length > 15 ? `${character.name.substring(0, 15)}...` : character.name}
                              </h3>
                              
                              <p className="text-gray-400 text-sm mb-3 min-h-[1.25rem]">
                                by @{character.creatorUsername}
                              </p>
                              
                              <div className="flex items-center justify-center space-x-4 text-sm mb-3">
                                <div className="flex items-center space-x-1 text-gray-300">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{character.totalChats}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-300">
                                  <Heart className="w-4 h-4" />
                                  <span>{character.likesCount}</span>
                                </div>
                              </div>
                              
                              {/* Description preview - 3 lines */}
                              <p className="text-gray-300 text-xs leading-tight line-clamp-3 mb-0">
                                {character.originalCharacter.short_description || "No description available for this character."}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No favorite characters yet. Explore and favorite some characters!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

{/* Daily Quest section hidden for now */}

        <DiscordCTA />
      </div>
    </div>
  );
}
