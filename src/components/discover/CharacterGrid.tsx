import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Heart,
  TrendingUp,
  Loader2,
  Eye
} from 'lucide-react';
import { getPublicCharacters } from '@/lib/supabase-queries';

interface CharacterGridProps {
  searchQuery: string;
  sortBy: string;
  filterBy: string;
}

type PublicCharacter = {
  id: string;
  name: string;
  short_description: string | null;
  avatar_url: string | null;
  interaction_count: number;
  created_at: string;
  creator: any; // Temporary to handle the query response
  actual_chat_count: number;
  likes_count: number;
};

export function CharacterGrid({ searchQuery, sortBy, filterBy }: CharacterGridProps) {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<PublicCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const { data, error } = await getPublicCharacters(50, 0);
        if (error) {
          console.error('Error fetching characters:', error);
          setError('Failed to load characters');
        } else {
          setCharacters(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load characters');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleStartChat = (character: PublicCharacter) => {
    navigate('/chat', { state: { selectedCharacter: character } });
  };

  const handleViewCharacter = (character: PublicCharacter) => {
    navigate(`/character/${character.id}`);
  };

  // Filter and sort characters based on props
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false; // No tags in current schema
    
    // For now, filterBy will just filter by name until we have proper categories
    const matchesFilter = filterBy === 'all' || 
                         character.name.toLowerCase().includes(filterBy.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popularity':
      case 'conversations':
        return b.actual_chat_count - a.actual_chat_count;
      default: // relevance
        return b.actual_chat_count - a.actual_chat_count;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
        <span className="ml-2 text-white">Loading characters...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-400 text-lg mb-2">{error}</div>
        <div className="text-gray-500 text-sm">Please try again later</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-xl font-semibold">
            {sortedCharacters.length} Characters Found
          </h2>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Updated 2 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Character Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 transition-all duration-500 ease-in-out"
        style={{
          animation: 'fade-in 0.6s ease-out'
        }}
      >
        {sortedCharacters.map((character, index) => (
          <Card
            key={character.id}
            className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7A00]/20 group cursor-pointer overflow-hidden hover:scale-105 hover:-translate-y-2 transform"
            style={{
              animation: `fade-in 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <CardContent className="p-0">
              {/* Character Avatar Section - Top Half */}
              <div className="relative h-32 bg-gradient-to-br from-[#FF7A00]/10 to-[#FF7A00]/5 flex items-center justify-center">
                <Avatar className="w-24 h-24 ring-4 ring-[#FF7A00]/30 group-hover:ring-[#FF7A00]/60 transition-all duration-300">
                  <AvatarImage src={character.avatar_url || "/placeholder.svg"} alt={character.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 text-white font-bold text-2xl">
                    {character.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
              </div>

              {/* Character Info - Bottom Half */}
              <div className="p-5 space-y-4">
                {/* Name */}
                <h3 className="text-white font-bold text-lg group-hover:text-[#FF7A00] transition-colors line-clamp-1">
                  {character.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {character.short_description || "No description available"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>{character.actual_chat_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Heart className="w-4 h-4" />
                    <span>{character.likes_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Creator */}
                <p className="text-gray-500 text-xs">
                  by @{character.creator?.username || 'Unknown'}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewCharacter(character)}
                    variant="outline"
                    className="flex-1 border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Character
                  </Button>
                  <Button
                    onClick={() => handleStartChat(character)}
                    className="flex-1 bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white font-medium"
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

      {/* Empty State */}
      {sortedCharacters.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-2">No characters found</div>
          <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
        </div>
      )}

      {/* Load More */}
      {sortedCharacters.length > 0 && (
        <div className="flex justify-center mt-16">
          <Button
            variant="outline"
            className="border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] bg-transparent px-10 py-4 text-lg font-medium"
          >
            Load More Characters
          </Button>
        </div>
      )}
    </div>
  );
}
