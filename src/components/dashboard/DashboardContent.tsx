
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  Share
} from 'lucide-react';

const recentConversations = [
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
  },
  {
    id: 4,
    character: {
      name: "Raven",
      avatar: "R",
      image: "/placeholder.svg"
    },
    lastMessage: "The darkness holds answers that light cannot provide.",
    timestamp: "2 days ago"
  }
];

const userCreatedCharacters = [
  {
    id: 1,
    name: "Vex",
    avatar: "V",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Phoenix",
    avatar: "P",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Mystic",
    avatar: "M",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "Cipher",
    avatar: "C",
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "Nova",
    avatar: "N",
    image: "/placeholder.svg"
  }
];

export function DashboardContent() {
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div>
              <h1 className="text-white text-2xl font-bold">Mission Control</h1>
              <p className="text-gray-400 text-sm">Welcome back, Neural Pilot</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-[#FF7A00]/20 px-4 py-2 rounded-lg border border-[#FF7A00]/30">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-[#FF7A00] font-bold">1,247 Credits</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Continue Your Adventure Section */}
        <div className="space-y-4">
          <h2 className="text-white text-3xl font-bold">Jump Back In</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {recentConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="w-80 flex-shrink-0 bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 group cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
                        <AvatarImage src={conversation.character.image} alt={conversation.character.name} />
                        <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                          {conversation.character.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {conversation.character.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-gray-500 text-xs mb-4">
                          {conversation.timestamp}
                        </p>
                        <Button
                          className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Continue Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Your Creations Section */}
        <div className="space-y-4">
          <h2 className="text-white text-3xl font-bold">Your Creations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Create New Legend CTA Card */}
            <Card className="aspect-square bg-gradient-to-br from-[#FF7A00]/20 to-[#FF7A00]/5 border-2 border-[#FF7A00] border-dashed hover:border-solid hover:shadow-lg hover:shadow-[#FF7A00]/30 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#FF7A00]/30 transition-colors">
                  <Plus className="w-6 h-6 text-[#FF7A00]" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">Create a</h3>
                <h3 className="text-[#FF7A00] font-bold text-sm">New Legend</h3>
              </CardContent>
            </Card>

            {/* User Created Characters */}
            {userCreatedCharacters.map((character) => (
              <Card
                key={character.id}
                className="aspect-square bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7A00]/20 group cursor-pointer"
              >
                <CardContent className="p-4 h-full flex flex-col items-center justify-center relative">
                  <Avatar className="w-16 h-16 mb-3 ring-2 ring-gray-600 group-hover:ring-[#FF7A00]/50 transition-all">
                    <AvatarImage src={character.image} alt={character.name} />
                    <AvatarFallback className="bg-gray-700 text-white font-bold text-lg">
                      {character.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-white font-semibold text-sm text-center">
                    {character.name}
                  </h3>
                  
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
        </div>

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
                  <p className="text-gray-400 text-sm">Achievements</p>
                  <p className="text-white text-2xl font-bold">47</p>
                </div>
                <Trophy className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Level Progress</p>
                  <p className="text-white text-2xl font-bold">87%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Time Online</p>
                  <p className="text-white text-2xl font-bold">24h</p>
                </div>
                <Clock className="w-8 h-8 text-[#FF7A00]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-[#1a1a2e] border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#FF7A00]" />
                <span>Recent Neural Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { character: "Luna", action: "Completed mystical quest", time: "2 min ago", avatar: "L" },
                { character: "Zyx", action: "Unlocked time travel achievement", time: "15 min ago", avatar: "Z" },
                { character: "Sakura", action: "Started adventure sequence", time: "1 hour ago", avatar: "S" },
                { character: "Raven", action: "Discovered hidden knowledge", time: "3 hours ago", avatar: "R" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-[#121212] border border-gray-700/30">
                  <Avatar className="w-10 h-10 ring-2 ring-[#FF7A00]/50">
                    <AvatarImage src="/placeholder.svg" alt={activity.character} />
                    <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.character}</p>
                    <p className="text-gray-400 text-xs">{activity.action}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#1a1a2e] border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#FF7A00]" />
                <span>Quick Launch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                <Users className="w-4 h-4 mr-2" />
                Browse Characters
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                <Trophy className="w-4 h-4 mr-2" />
                View Achievements
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                <Star className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Showcase */}
        <Card className="bg-[#1a1a2e] border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-[#FF7A00]" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "First Contact", description: "Started your first conversation", icon: MessageCircle },
                { title: "Explorer", description: "Chatted with 5 different characters", icon: Users },
                { title: "Time Master", description: "Spent 10 hours in conversations", icon: Clock },
              ].map((achievement, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-[#FF7A00]/20 to-[#FF7A00]/5 border border-[#FF7A00]/30">
                  <achievement.icon className="w-8 h-8 text-[#FF7A00] mb-2" />
                  <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
