import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  vibes: string[];
  fallback: string;
}

interface CharacterSelectionProps {
  selectedVibes: string[];
  onCharacterSelect: (character: Character) => void;
}

const CharacterSelection = ({ selectedVibes, onCharacterSelect }: CharacterSelectionProps) => {
  const navigate = useNavigate();

  // Character database with vibe associations
  const allCharacters: Character[] = [
    {
      id: 'luna',
      name: 'Luna',
      tagline: 'A mystical sorceress who sees magic in everything around her.',
      avatar: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop&crop=face',
      vibes: ['fantasy', 'anime'],
      fallback: 'LU'
    },
    {
      id: 'zyx',
      name: 'Zyx',
      tagline: 'A cybernetic explorer from the distant future.',
      avatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop&crop=face',
      vibes: ['sci-fi', 'gaming'],
      fallback: 'ZY'
    },
    {
      id: 'sakura',
      name: 'Sakura',
      tagline: 'Your cheerful companion who loves adventure and friendship.',
      avatar: 'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=400&h=400&fit=crop&crop=face',
      vibes: ['anime', 'slice-of-life'],
      fallback: 'SA'
    },
    {
      id: 'raven',
      name: 'Raven',
      tagline: 'A mysterious figure who thrives in the shadows.',
      avatar: 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=400&h=400&fit=crop&crop=face',
      vibes: ['horror', 'fantasy'],
      fallback: 'RA'
    },
    {
      id: 'phoenix',
      name: 'Phoenix',
      tagline: 'A fiery spirit who brings passion to every conversation.',
      avatar: 'https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop&crop=face',
      vibes: ['spicy', 'gaming'],
      fallback: 'PH'
    }
  ];

  // Filter and sort characters based on user's selected vibes
  const getRecommendedCharacters = () => {
    const charactersWithScore = allCharacters.map(character => {
      const matchingVibes = character.vibes.filter(vibe => selectedVibes.includes(vibe));
      return {
        ...character,
        score: matchingVibes.length
      };
    });

    // Sort by score (highest first) and take top 4
    return charactersWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  };

  const recommendedCharacters = getRecommendedCharacters();

  const handleCharacterSelect = (character: Character) => {
    console.log('Selected character:', character);
    onCharacterSelect(character);
    // Navigate to chat with selected character
    navigate('/chat', { state: { selectedCharacter: character } });
  };

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
        {recommendedCharacters.map((character, index) => (
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
            
            {/* Character score indicator */}
            {character.score > 0 && (
              <div className="absolute top-3 right-3 bg-[#FF7A00] text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                {character.score} match{character.score > 1 ? 'es' : ''}
              </div>
            )}

            <div className="p-6 text-center relative z-10">
              {/* Avatar */}
              <div className="mb-6 relative">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-gray-600 group-hover:ring-[#FF7A00]/50 transition-all duration-300">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="bg-[#FF7A00] text-white text-lg font-bold">
                    {character.fallback}
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
                {character.tagline}
              </p>

              {/* Matching vibes */}
              <div className="mt-4 flex flex-wrap gap-1 justify-center">
                {character.vibes
                  .filter(vibe => selectedVibes.includes(vibe))
                  .map(vibe => (
                    <span
                      key={vibe}
                      className="text-xs bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-1 rounded-full capitalize"
                    >
                      {vibe.replace('-', ' ')}
                    </span>
                  ))}
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
