import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart,
  Star,
  BookOpen,
  Eye,
  Users
} from 'lucide-react';

interface WorldInfoCardProps {
  worldInfo: {
    id: string;
    name: string;
    short_description: string | null;
    interaction_count: number;
    created_at: string;
    creator: {
      id: string;
      username: string;
      avatar_url: string | null;
    } | null;
    likes_count: number;
    favorites_count: number;
    usage_count: number;
  };
  index: number;
}

export function WorldInfoCard({ worldInfo, index }: WorldInfoCardProps) {
  const navigate = useNavigate();

  const handleViewWorldInfo = () => {
    navigate(`/world-info/${worldInfo.id}`);
  };

  return (
    <Card
      className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7A00]/20 group cursor-pointer overflow-hidden hover:scale-105 hover:-translate-y-2 transform"
      style={{
        animation: `fade-in 0.6s ease-out ${index * 0.1}s both`
      }}
      onClick={handleViewWorldInfo}
    >
      <CardContent className="p-0">
        {/* World Info Avatar Section - Top Half */}
        <div className="relative h-32 bg-gradient-to-br from-[#FF7A00]/10 to-[#FF7A00]/5 flex items-center justify-center">
           <Avatar className="w-24 h-24 ring-4 ring-[#FF7A00]/30 group-hover:ring-[#FF7A00]/60 transition-all duration-300">
            <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 text-white font-bold text-2xl">
              <BookOpen className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* World Info Details - Bottom Half */}
        <div className="p-5 space-y-4">
          {/* Name */}
          <h3 className="text-white font-bold text-lg group-hover:text-[#FF7A00] transition-colors line-clamp-1">
            {worldInfo.name}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {worldInfo.short_description || "No description available"}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-1 text-gray-300">
              <Heart className="w-4 h-4" />
              <span>{worldInfo.likes_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <Star className="w-4 h-4" />
              <span>{worldInfo.favorites_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span>{worldInfo.usage_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <Eye className="w-4 h-4" />
              <span>{worldInfo.interaction_count.toLocaleString()}</span>
            </div>
          </div>

          {/* Creator */}
          <p className="text-gray-500 text-xs">
            by @{worldInfo.creator?.username || 'Unknown'}
          </p>

          {/* Action Button */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleViewWorldInfo();
              }}
              variant="outline"
              className="w-full border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] bg-transparent"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Lorebook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}