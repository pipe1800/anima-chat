import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Heart,
  TrendingUp
} from 'lucide-react';

// Mock data for characters with likes added
const characters = [
  {
    id: 1,
    name: "Luna Shadowweaver",
    avatar: "L",
    image: "/placeholder.svg",
    category: "Fantasy",
    description: "A mysterious sorceress with mastery over shadow magic and lunar enchantments.",
    tagline: "The stars whisper secrets to those who know how to listen.",
    creator: "@MysticCrafter",
    rating: 4.9,
    conversations: 12500,
    likes: 8900,
    tags: ["Fantasy", "Magic", "Mysterious"]
  },
  {
    id: 2,
    name: "Captain Zyx-9",
    avatar: "Z",
    image: "/placeholder.svg",
    category: "Sci-Fi",
    description: "Time-traveling space captain from the year 3045 with quantum manipulation abilities.",
    tagline: "Time is just another dimension to navigate, traveler.",
    creator: "@TimeTraveler",
    rating: 4.8,
    conversations: 8900,
    likes: 6700,
    tags: ["Sci-Fi", "Time Travel", "Space"]
  },
  {
    id: 3,
    name: "Sakura Nightblade",
    avatar: "S",
    image: "/placeholder.svg",
    category: "Anime",
    description: "Elite ninja warrior with cherry blossom techniques and silent assassination skills.",
    tagline: "In silence, I find strength; in shadow, I find purpose.",
    creator: "@AnimeArtist",
    rating: 4.7,
    conversations: 15200,
    likes: 12300,
    tags: ["Anime", "Ninja", "Warrior"]
  },
  {
    id: 4,
    name: "Dr. Raven Blackwood",
    avatar: "R",
    image: "/placeholder.svg",
    category: "Modern",
    description: "Brilliant forensic psychologist who specializes in criminal profiling and dark mysteries.",
    tagline: "Every mind has its secrets, and I know how to unlock them.",
    creator: "@CrimeMind",
    rating: 4.9,
    conversations: 7800,
    likes: 5400,
    tags: ["Modern", "Psychology", "Mystery"]
  },
  {
    id: 5,
    name: "Phoenix Flameborn",
    avatar: "P",
    image: "/placeholder.svg",
    category: "Fantasy",
    description: "Immortal fire elemental who has witnessed the rise and fall of ancient civilizations.",
    tagline: "From ashes I rise, with passion I burn eternal.",
    creator: "@FlameKeeper",
    rating: 4.6,
    conversations: 9600,
    likes: 7200,
    tags: ["Fantasy", "Fire", "Immortal"]
  },
  {
    id: 6,
    name: "Nova Stardust",
    avatar: "N",
    image: "/placeholder.svg",
    category: "Sci-Fi",
    description: "Cosmic entity born from a dying star, possesses knowledge of the universe's secrets.",
    tagline: "I am the echo of stars, the whisper of infinity.",
    creator: "@CosmicDreamer",
    rating: 4.8,
    conversations: 11300,
    likes: 9100,
    tags: ["Sci-Fi", "Cosmic", "Ethereal"]
  }
];

interface CharacterGridProps {
  searchQuery: string;
  sortBy: string;
  filterBy: string;
}

export function CharacterGrid({ searchQuery, sortBy, filterBy }: CharacterGridProps) {
  // Filter and sort characters based on props
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || character.category.toLowerCase() === filterBy.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id;
      case 'rating':
        return b.rating - a.rating;
      case 'conversations':
        return b.conversations - a.conversations;
      case 'liked':
        return b.likes - a.likes;
      default: // popular/relevance
        return b.conversations - a.conversations;
    }
  });

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
                  <div className="flex items-center space-x-1 text-gray-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>{character.conversations.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Heart className="w-4 h-4" />
                    <span>{character.likes.toLocaleString()}</span>
                  </div>
                </div>

                {/* Creator */}
                <p className="text-gray-500 text-xs">
                  by {character.creator}
                </p>

                {/* Hover Action Button */}
                <Button
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
