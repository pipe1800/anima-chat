
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Heart, MessageSquare, Trophy } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useProfile';

export const ProfileStats = () => {
  const { user, profile, loading } = useCurrentUser();

  // For now, using placeholder stats since we don't have character/chat counts implemented yet
  const stats = [
    {
      label: 'Characters Created',
      value: '0', // This would come from a count of user's characters
      icon: Users,
      color: 'text-[#FF7A00]'
    },
    {
      label: 'Total Favorites',
      value: '0', // This would come from favorites system
      icon: Heart,
      color: 'text-red-400'
    },
    {
      label: 'Conversations',
      value: '0', // This would come from a count of user's chats
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      label: 'Member Since',
      value: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '2024',
      icon: Trophy,
      color: 'text-yellow-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-[#1a1a1a] border-[#333] p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-black/40 w-12 h-12"></div>
              <div>
                <div className="h-6 bg-gray-600 rounded w-12 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#1a1a1a] border-[#333] p-6 hover:border-[#FF7A00]/50 transition-colors">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-black/40 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
