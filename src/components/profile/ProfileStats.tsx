
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Heart, MessageSquare, Trophy } from 'lucide-react';

export const ProfileStats = () => {
  const stats = [
    {
      label: 'Characters Created',
      value: '12',
      icon: Users,
      color: 'text-[#FF7A00]'
    },
    {
      label: 'Total Favorites',
      value: '847',
      icon: Heart,
      color: 'text-red-400'
    },
    {
      label: 'Conversations',
      value: '2.3K',
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      label: 'Achievement Points',
      value: '1,205',
      icon: Trophy,
      color: 'text-yellow-400'
    }
  ];

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
