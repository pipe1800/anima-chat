
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CharacterGridProps {
  type: 'created' | 'favorites';
}

export const CharacterGrid = ({ type }: CharacterGridProps) => {
  // Mock data - in real app this would come from props or API
  const characters = [
    {
      id: 1,
      name: 'Luna Starweaver',
      description: 'A mystical sorceress with knowledge of ancient magic and celestial powers.',
      avatar: '',
      category: 'Fantasy',
      interactions: 234,
      favorites: 45,
      isNSFW: false
    },
    {
      id: 2,
      name: 'Detective Morrison',
      description: 'A grizzled detective with 20 years on the force, solving the toughest cases.',
      avatar: '',
      category: 'Mystery',
      interactions: 189,
      favorites: 32,
      isNSFW: false
    },
    {
      id: 3,
      name: 'Aria Nightsong',
      description: 'An elegant vampire aristocrat from the Victorian era with a taste for poetry.',
      avatar: '',
      category: 'Gothic',
      interactions: 412,
      favorites: 78,
      isNSFW: true
    },
    {
      id: 4,
      name: 'Captain Rex',
      description: 'A space marine commander leading the fight against alien invaders.',
      avatar: '',
      category: 'Sci-Fi',
      interactions: 156,
      favorites: 29,
      isNSFW: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character) => (
        <Card key={character.id} className="bg-[#1a1a1a] border-[#333] overflow-hidden hover:border-[#FF7A00]/50 transition-all duration-200 group">
          <div className="p-4">
            {/* Character Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-[#FF7A00]/30">
                  <AvatarImage src={character.avatar} />
                  <AvatarFallback className="bg-[#FF7A00]/20 text-[#FF7A00] font-semibold">
                    {character.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-[#FF7A00] transition-colors">
                    {character.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {character.category}
                    </Badge>
                    {character.isNSFW && (
                      <Badge variant="destructive" className="text-xs">
                        NSFW
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {character.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{character.interactions}</span>
                </span>
                <span className="flex items-center space-x-1 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{character.favorites}</span>
                </span>
              </div>
              {type === 'created' && (
                <Badge variant="outline" className="text-[#FF7A00] border-[#FF7A00]/30">
                  Created
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
