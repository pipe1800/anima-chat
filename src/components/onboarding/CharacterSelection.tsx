import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getRecommendedCharacters, toggleCharacterFavorite, isCharacterFavorited } from '@/lib/supabase-queries';
import { useCurrentUser } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
  short_description: string;
  avatar_url: string;
  interaction_count: number;
  character_definitions: Array<{ greeting: string }>;
  favorited?: boolean;
}

interface CharacterSelectionProps {
  selectedVibes: string[];
  onCharacterSelect: (character: Character) => void;
}

const CharacterSelection = ({ selectedVibes, onCharacterSelect }: CharacterSelectionProps) => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const { data: recommendedChars, error } = await getRecommendedCharacters(selectedVibes, 4);
        
        if (error) {
          console.error('Error fetching characters:', error);
          return;
        }

        // Check favorite status for each character
        if (user && recommendedChars) {
          const charactersWithFavorites = await Promise.all(
            recommendedChars.map(async (char) => {
              const { data: favorited } = await isCharacterFavorited(user.id, char.id);
              return { ...char, favorited };
            })
          );
          setCharacters(charactersWithFavorites);
        } else {
          setCharacters(recommendedChars || []);
        }
      } catch (error) {
        console.error('Error in fetchCharacters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [selectedVibes, user]);

  const handleCharacterSelect = (character: Character) => {
    console.log('Selected character:', character);
    onCharacterSelect(character);
    // Navigate to chat with selected character
    navigate('/chat', { state: { selectedCharacter: character } });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, characterId: string) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to favorite characters');
      return;
    }

    try {
      const { data, error } = await toggleCharacterFavorite(user.id, characterId);
      
      if (error) {
        toast.error('Failed to update favorite');
        return;
      }

      // Update local state
      setCharacters(chars => 
        chars.map(char => 
          char.id === characterId 
            ? { ...char, favorited: data?.favorited }
            : char
        )
      );

      toast.success(data?.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center px-4">
        <div className="text-white">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-center px-4">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-6">
          Your First{' '}
          <span className="text-transparent bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/70 bg-clip-text">
            Encounter
          </span>
        </h1>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
          Based on your vibe, we think you'll get along with one of these. 
          Choose your first companion to start chatting.
        </p>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {characters.map((character, index) => (
          <Card
            key={character.id}
            className="relative cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-[#1a1a2e]/90 via-[#1a1a2e]/80 to-[#16213e]/90 border border-gray-700/50 hover:border-[#FF7A00]/50 backdrop-blur-sm group overflow-hidden"
            onClick={() => handleCharacterSelect(character)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Favorite button */}
            <Button
              onClick={(e) => handleToggleFavorite(e, character.id)}
              variant="ghost"
              size="icon"
              className={`absolute top-3 right-3 z-10 h-8 w-8 rounded-full ${
                character.favorited 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70'
              }`}
            >
              <Heart className={`h-4 w-4 ${character.favorited ? 'fill-current' : ''}`} />
            </Button>

            <div className="p-6 text-center relative z-10">
              {/* Avatar */}
              <div className="mb-6 relative">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-gray-600 group-hover:ring-[#FF7A00]/50 transition-all duration-300">
                  <AvatarImage src={character.avatar_url || ''} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white text-lg font-bold">
                    {character.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Pulse animation */}
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-[#FF7A00]/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Character Info */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FF7A00] transition-colors duration-300">
                {character.name}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {character.short_description || character.character_definitions?.[0]?.greeting || 'A mysterious character waiting to chat with you.'}
              </p>

              {/* Interaction count */}
              <div className="mt-4 flex justify-center">
                <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">
                  {character.interaction_count} interactions
                </span>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FF7A00]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-gray-500 text-sm">
        Click on any character to begin your first conversation
      </p>
    </div>
  );
};

export default CharacterSelection;
