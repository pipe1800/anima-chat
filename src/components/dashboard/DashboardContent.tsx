
import React, { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DailyUsageWidget } from './DailyUsageWidget';
import DiscordCTA from '../DiscordCTA';
import { useCurrentUser } from '@/hooks/useProfile';
import { 
  getUserChats, 
  getUserCharacters, 
  getUserCredits, 
  getUserSubscription 
} from '@/lib/supabase-queries';
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
  Crown
} from 'lucide-react';

export function DashboardContent() {
  const { user, profile, loading: userLoading } = useCurrentUser();
  const [recentChats, setRecentChats] = useState([]);
  const [myCharacters, setMyCharacters] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile) return;

      try {
        setLoading(true);

        // Fetch user's chats
        const { data: chatsData } = await getUserChats(user.id);
        setRecentChats(chatsData?.slice(0, 5) || []);

        // Fetch user's characters
        const { data: charactersData } = await getUserCharacters(user.id);
        setMyCharacters(charactersData || []);

        // Fetch user's credits with proper null handling
        const { data: creditsData } = await getUserCredits(user.id);
        console.log('Credits data received:', creditsData);
        
        if (creditsData && typeof creditsData.balance === 'number') {
          setUserCredits(creditsData.balance);
        } else {
          console.warn('Credits data is null or invalid, defaulting to 0');
          setUserCredits(0);
        }

        // Fetch user's subscription
        const { data: subscriptionData } = await getUserSubscription(user.id);
        setSubscription(subscriptionData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Please sign in to access your dashboard.</div>
      </div>
    );
  }

  // Determine user tier
  const userTier = subscription?.plan?.name || "Guest Pass";
  const isGuestPass = userTier === "Guest Pass";
  const messagesUsed = 45; // This would come from actual usage tracking
  const dailyLimit = 75;

  // Format recent chats for display
  const formattedRecentChats = recentChats.map(chat => ({
    id: chat.id,
    character: {
      name: chat.character?.name || 'Unknown',
      avatar: chat.character?.name?.charAt(0) || 'U',
      image: chat.character?.avatar_url || "/placeholder.svg"
    },
    lastMessage: "Continue your conversation...",
    timestamp: new Date(chat.last_message_at || chat.created_at).toLocaleDateString()
  }));

  // Format characters for display  
  const formattedMyCharacters = myCharacters.map(character => ({
    id: character.id,
    name: character.name,
    avatar: character.name.charAt(0),
    image: character.avatar_url || "/placeholder.svg",
    totalChats: character.interaction_count || 0
  }));

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header Section */}
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Left side - Welcome Message */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div>
              <h1 className="text-white text-3xl font-bold">
                Welcome back, @{profile?.username || 'User'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">Ready to continue your digital adventures?</p>
            </div>
          </div>
          
          {/* Right side - Account Status */}
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Subscription Tier:</p>
              <p className="text-[#FF7A00] font-bold text-lg">{userTier}</p>
            </div>
            {!isGuestPass && (
              <div className="bg-[#FF7A00]/20 px-4 py-3 rounded-lg border border-[#FF7A00]/30">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#FF7A00]" />
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Credits:</p>
                    <p className="text-[#FF7A00] font-bold text-lg">{userCredits.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Daily Usage Widget - Only for Guest Pass users */}
        {isGuestPass && (
          <DailyUsageWidget messagesUsed={messagesUsed} dailyLimit={dailyLimit} />
        )}

        {/* Daily Quest Widget */}
        <Card className="bg-gradient-to-r from-[#FF7A00]/20 to-[#FF7A00]/10 border-[#FF7A00]/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-[#FF7A00]" />
              <span>Daily Quest</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white text-lg mb-2">Start a conversation with a character tagged #Sci-Fi</p>
                <p className="text-[#FF7A00] font-semibold">Reward: 25 Credits</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32">
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">0/1 completed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discord CTA */}
        <DiscordCTA />

        {/* Main Tabbed Widget */}
        <Card className="bg-[#1a1a2e] border-gray-700/50">
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

              {/* Recent Chats Tab */}
              <TabsContent value="recent-chats" className="mt-6">
                <div className="space-y-3">
                  {formattedRecentChats.length > 0 ? (
                    formattedRecentChats.map((chat) => (
                      <Card
                        key={chat.id}
                        className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
                              <AvatarImage src={chat.character.image} alt={chat.character.name} />
                              <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                                {chat.character.avatar}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-lg mb-1">
                                {chat.character.name}
                              </h3>
                              <p className="text-gray-400 text-sm line-clamp-1">
                                {chat.lastMessage}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-gray-500 text-sm">
                                {chat.timestamp}
                              </p>
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

              {/* My Characters Tab */}
              <TabsContent value="my-characters" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formattedMyCharacters.length > 0 ? (
                    formattedMyCharacters.map((character) => (
                      <Card
                        key={character.id}
                        className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20"
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-gray-600">
                            <AvatarImage src={character.image} alt={character.name} />
                            <AvatarFallback className="bg-gray-700 text-white font-bold text-lg">
                              {character.avatar}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="text-white font-bold text-lg mb-2">
                            {character.name}
                          </h3>
                          
                          <p className="text-gray-400 text-sm mb-3">
                            {character.totalChats} total chats
                          </p>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
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

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="mt-6">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Your favorite characters will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats Grid */}
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
                  <p className="text-white text-2xl font-bold">{userCredits}</p>
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

        {/* Quick Actions */}
        <Card className="bg-[#1a1a2e] border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#FF7A00]" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-16 bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white flex-col">
                <MessageCircle className="w-6 h-6 mb-1" />
                <span className="text-sm">New Chat</span>
              </Button>
              <Button variant="outline" className="h-16 border-gray-600 text-gray-300 hover:bg-gray-800 flex-col">
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-sm">Create Character</span>
              </Button>
              <Button variant="outline" className="h-16 border-gray-600 text-gray-300 hover:bg-gray-800 flex-col">
                <Users className="w-6 h-6 mb-1" />
                <span className="text-sm">Discover</span>
              </Button>
              <Button variant="outline" className="h-16 border-gray-600 text-gray-300 hover:bg-gray-800 flex-col">
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-sm">Upgrade</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
