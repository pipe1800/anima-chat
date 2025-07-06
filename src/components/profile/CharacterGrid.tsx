
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart } from 'lucide-react';

interface CharacterGridProps {
  type: 'created' | 'favorites';
}

export const CharacterGrid = ({ type }: CharacterGridProps) => {
  const navigate = useNavigate();

  // Mock data - in real app this would come from props or API
  const characters = [
    {
      id: 1,
      name: 'Luna Starweaver',
      avatar: 'L',
      image: '',
      category: 'Fantasy',
      description: 'A mystical sorceress with knowledge of ancient magic and celestial powers.',
      tagline: 'The stars whisper secrets to those who know how to listen.',
      creator: '@johndoe',
      rating: 4.9,
      conversations: 234,
      likes: 45,
      tags: ['Fantasy', 'Magic', 'Mysterious']
    },
    {
      id: 2,
      name: 'Detective Morrison',
      avatar: 'D',
      image: '',
      category: 'Mystery',
      description: 'A grizzled detective with 20 years on the force, solving the toughest cases.',
      tagline: 'Every case has a solution, you just need to know where to look.',
      creator: '@johndoe',
      rating: 4.8,
      conversations: 189,
      likes: 32,
      tags: ['Modern', 'Detective', 'Mystery']
    },
    {
      id: 3,
      name: 'Aria Nightsong',
      avatar: 'A',
      image: '',
      category: 'Gothic',
      description: 'An elegant vampire aristocrat from the Victorian era with a taste for poetry.',
      tagline: 'Eternity is long enough to perfect the art of conversation.',
      creator: '@johndoe',
      rating: 4.7,
      conversations: 412,
      likes: 78,
      tags: ['Gothic', 'Vampire', 'Victorian']
    },
    {
      id: 4,
      name: 'Captain Rex',
      avatar: 'R',
      image: '',
      category: 'Sci-Fi',
      description: 'A space marine commander leading the fight against alien invaders.',
      tagline: 'Victory is earned through preparation and courage.',
      creator: '@johndoe',
      rating: 4.6,
      conversations: 156,
      likes: 29,
      tags: ['Sci-Fi', 'Military', 'Space']
    }
  ];

  const handleStartChat = (character: typeof characters[0]) => {
    navigate('/chat', { state: { selectedCharacter: character } });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((character, index) => (
        <Card
          key={character.id}
          className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7A00]/20 group cursor-pointer overflow-hidden hover:scale-105 hover:-translate-y-2 transform"
        >
          <CardContent className="p-0">
            {/* Character Avatar Section - Top Half */}
            <div className="relative h-48 bg-gradient-to-br from-[#FF7A00]/10 to-[#FF7A00]/5 flex items-center justify-center">
              <Avatar className="w-20 h-20 ring-4 ring-[#FF7A00]/30 group-hover:ring-[#FF7A00]/60 transition-all duration-300">
                <AvatarImage src={character.image} alt={character.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 text-white font-bold text-2xl">
                  {character.avatar}
                </AvatarFallback>
              </Avatar>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#FF7A00]/90 text-white text-xs font-medium rounded-full">
                {character.category}
              </div>

              {/* Created/Favorites Badge */}
              {type === 'created' && (
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="text-[#FF7A00] border-[#FF7A00]/30 bg-black/40">
                    Created
                  </Badge>
                </div>
              )}
            </div>

            {/* Character Info - Bottom Half */}
            <div className="p-5 space-y-4">
              {/* Name */}
              <h3 className="text-white font-bold text-lg group-hover:text-[#FF7A00] transition-colors line-clamp-1">
                {character.name}
              </h3>

              {/* Tagline */}
              <p className="text-gray-400 text-sm italic line-clamp-2 leading-relaxed min-h-[2.5rem]">
                "{character.tagline}"
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>{character.conversations.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Heart className="w-4 h-4" />
                    <span>{character.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Creator */}
              <p className="text-gray-500 text-xs">
                by {character.creator}
              </p>

              {/* Hover Action Button */}
              <Button
                onClick={() => handleStartChat(character)}
                className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
