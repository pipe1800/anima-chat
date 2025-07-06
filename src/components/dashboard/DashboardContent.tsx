import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CreditCard
} from 'lucide-react';

const recentChats = [
  {
    id: 1,
    character: {
      name: "Luna",
      avatar: "L",
      image: "/placeholder.svg"
    },
    lastMessage: "The moonlight reveals ancient secrets hidden in the shadows...",
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    character: {
      name: "Zyx",
      avatar: "Z",
      image: "/placeholder.svg"
    },
    lastMessage: "Time bends around us as we navigate the quantum realm together.",
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    character: {
      name: "Sakura",
      avatar: "S",
      image: "/placeholder.svg"
    },
    lastMessage: "Cherry blossoms fall like memories in the wind...",
    timestamp: "1 day ago"
  }
];

const myCharacters = [
  {
    id: 1,
    name: "Vex",
    avatar: "V",
    image: "/placeholder.svg",
    description: "A mysterious shadow warrior"
  },
  {
    id: 2,
    name: "Phoenix",
    avatar: "P",
    image: "/placeholder.svg",
    description: "Rising from digital ashes"
  },
  {
    id: 3,
    name: "Mystic",
    avatar: "M",
    image: "/placeholder.svg",
    description: "Guardian of ancient wisdom"
  },
  {
    id: 4,
    name: "Cipher",
    avatar: "C",
    image: "/placeholder.svg",
    description: "Master of encrypted secrets"
  }
];

const favorites = [
  {
    id: 1,
    character: {
      name: "Aria",
      avatar: "A",
      image: "/placeholder.svg"
    },
    category: "Fantasy",
    rating: 5
  },
  {
    id: 2,
    character: {
      name: "Nexus",
      avatar: "N",
      image: "/placeholder.svg"
    },
    category: "Sci-Fi",
    rating: 5
  },
  {
    id: 3,
    character: {
      name: "Echo",
      avatar: "E",
      image: "/placeholder.svg"
    },
    category: "Mystery",
    rating: 4
  }
];

export function DashboardContent() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header Section */}
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Welcome Message */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div>
              <h1 className="text-white text-3xl font-bold">Welcome back, @xX_ShadowGamer_Xx</h1>
              <p className="text-gray-400 text-sm mt-1">Ready to continue your digital adventures?</p>
            </div>
          </div>
          
          {/* Right side - Account Status */}
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Subscription Tier:</p>
              <p className="text-[#FF7A00] font-bold text-lg">True Fan</p>
            </div>
            <div className="bg-[#FF7A00]/20 px-4 py-3 rounded-lg border border-[#FF7A00]/30">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#FF7A00]" />
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Credits:</p>
                  <p className="text-[#FF7A00] font-bold text-lg">1,247</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentChats.map((chat) => (
                    <Card
                      key={chat.id}
                      className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 group cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10 ring-2 ring-[#FF7A00]/50">
                            <AvatarImage src={chat.character.image} alt={chat.character.name} />
                            <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                              {chat.character.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm mb-1">
                              {chat.character.name}
                            </h3>
                            <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                              {chat.lastMessage}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {chat.timestamp}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-3 bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* My Characters Tab */}
              <TabsContent value="my-characters" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Create New Character Card */}
                  <Card className="aspect-square bg-gradient-to-br from-[#FF7A00]/20 to-[#FF7A00]/5 border-2 border-[#FF7A00] border-dashed hover:border-solid hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#FF7A00]/30 transition-colors">
                        <Plus className="w-6 h-6 text-[#FF7A00]" />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">Create New</h3>
                      <h3 className="text-[#FF7A00] font-bold text-sm">Character</h3>
                    </CardContent>
                  </Card>

                  {/* Existing Characters */}
                  {myCharacters.map((character) => (
                    <Card
                      key={character.id}
                      className="aspect-square bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 group cursor-pointer"
                    >
                      <CardContent className="p-4 h-full flex flex-col items-center justify-center relative">
                        <Avatar className="w-16 h-16 mb-3 ring-2 ring-gray-600 group-hover:ring-[#FF7A00]/50 transition-all">
                          <AvatarImage src={character.image} alt={character.name} />
                          <AvatarFallback className="bg-gray-700 text-white font-bold text-lg">
                            {character.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-white font-semibold text-sm text-center mb-1">
                          {character.name}
                        </h3>
                        <p className="text-gray-400 text-xs text-center">
                          {character.description}
                        </p>
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:border-[#FF7A00] hover:text-[#FF7A00] hover:bg-transparent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:border-[#FF7A00] hover:text-[#FF7A00] hover:bg-transparent"
                          >
                            <Share className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((favorite) => (
                    <Card
                      key={favorite.id}
                      className="bg-[#121212] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 group cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
                            <AvatarImage src={favorite.character.image} alt={favorite.character.name} />
                            <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                              {favorite.character.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-white font-semibold">
                                {favorite.character.name}
                              </h3>
                              <div className="flex items-center space-x-1">
                                {[...Array(favorite.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {favorite.category}
                            </p>
                            <Button
                              className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              size="sm"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Start Chat
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  <p className="text-white text-2xl font-bold">12</p>
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
                  <p className="text-white text-2xl font-bold">8</p>
                </div>
                <Users className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Messages</p>
                  <p className="text-white text-2xl font-bold">2,547</p>
                </div>
                <Sparkles className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Hours Chatted</p>
                  <p className="text-white text-2xl font-bold">127</p>
                </div>
                <Clock className="w-8 h-8 text-[#FF7A00]" />
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
