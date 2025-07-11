
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Edit, User } from 'lucide-react';
import { getUserCharacters } from '@/lib/supabase-queries';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface CharacterGridProps {
  type: 'created' | 'favorites';
}

export const CharacterGrid = ({ type }: CharacterGridProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['user-characters', user?.id, type],
    queryFn: async () => {
      if (!user?.id) return [];
      if (type === 'created') {
        const { data } = await getUserCharacters(user.id);
        return data || [];
      }
      // For favorites, we'll return empty for now since we don't have a favorites system yet
      return [];
    },
    enabled: !!user?.id,
  });

  const handleStartChat = (character: any) => {
    navigate('/chat', { state: { selectedCharacter: character } });
  };

  const handleEditCharacter = (character: any) => {
    navigate('/character-creator', { 
      state: { 
        editingCharacter: character,
        isEditing: true 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-[#1a1a2e] border-gray-700/50 animate-pulse">
            <CardContent className="p-0">
              <div className="h-48 bg-gray-700/30"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 bg-gray-700/30 rounded"></div>
                <div className="h-4 bg-gray-700/30 rounded"></div>
                <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          {type === 'created' ? 'No characters created yet' : 'No favorite characters yet'}
        </div>
        {type === 'created' && (
          <Button 
            onClick={() => navigate('/character-creator')}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
          >
            Create Your First Character
          </Button>
        )}
        {type === 'favorites' && (
          <Button 
            onClick={() => navigate('/discover')}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
          >
            Discover Characters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {characters.map((character) => (
        <Card
          key={character.id}
          className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7A00]/20 group cursor-pointer overflow-hidden hover:scale-105 hover:-translate-y-2 transform relative"
        >
          {/* Avatar as background */}
          <div className="absolute inset-0 opacity-30">
            <img 
              src={character.avatar_url} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-0 relative z-10">
            {/* Character Avatar Section - Top Half */}
            <div className="relative h-48 bg-gradient-to-br from-black/60 to-black/40 flex items-center justify-center">
              <Avatar className="w-20 h-20 ring-4 ring-[#FF7A00]/30 group-hover:ring-[#FF7A00]/60 transition-all duration-300">
                <AvatarImage src={character.avatar_url} alt={character.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 text-white font-bold text-2xl">
                  {character.name?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              
              {/* Visibility Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#FF7A00]/90 text-white text-xs font-medium rounded-full capitalize">
                {character.visibility}
              </div>

              {/* Created Badge */}
              {type === 'created' && (
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="text-[#FF7A00] border-[#FF7A00]/30 bg-black/40">
                    Created
                  </Badge>
                </div>
              )}
            </div>

            {/* Character Info - Bottom Half */}
            <div className="p-5 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
              {/* Name */}
              <h3 className="text-white font-bold text-lg group-hover:text-[#FF7A00] transition-colors truncate" title={character.name}>
                {character.name.length > 20 ? `${character.name.substring(0, 20)}...` : character.name}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {character.short_description || 'No description available'}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>{character.interaction_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Heart className="w-4 h-4" />
                    <span>0</span>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <p className="text-gray-500 text-xs">
                Created {new Date(character.created_at).toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Button
                  onClick={() => handleStartChat(character)}
                  className="flex-1 bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white font-medium"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                {type === 'created' && (
                  <Button
                    onClick={() => handleEditCharacter(character)}
                    variant="outline"
                    className="border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00]/10"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
