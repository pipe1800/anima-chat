
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, Zap, Heart, Gamepad2, Skull, Coffee, Wand2, Sword, Mountain, 
  Drama, Laugh, Theater, Search, Clock, Rabbit, Bot, BookOpen, Code, 
  Dice6, BookMarked, User, Users, Eye, EyeOff 
} from 'lucide-react';

interface VibeSelectionProps {
  onNext: (vibes: string[]) => void;
  selectedVibes: string[];
  setSelectedVibes: (vibes: string[]) => void;
}

const VibeSelection = ({ onNext, selectedVibes, setSelectedVibes }: VibeSelectionProps) => {
  const vibes = [
    { 
      id: 'action', 
      name: 'Action', 
      icon: Sword, 
      color: 'from-red-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop'
    },
    { 
      id: 'adventure', 
      name: 'Adventure', 
      icon: Mountain, 
      color: 'from-green-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=300&fit=crop'
    },
    { 
      id: 'anime', 
      name: 'Anime', 
      icon: Sparkles, 
      color: 'from-pink-500 to-rose-500',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop'
    },
    { 
      id: 'comedy', 
      name: 'Comedy', 
      icon: Laugh, 
      color: 'from-yellow-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=300&fit=crop'
    },
    { 
      id: 'drama', 
      name: 'Drama', 
      icon: Theater, 
      color: 'from-purple-600 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=400&h=300&fit=crop'
    },
    { 
      id: 'fantasy', 
      name: 'Fantasy', 
      icon: Wand2, 
      color: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop'
    },
    { 
      id: 'horror', 
      name: 'Horror', 
      icon: Skull, 
      color: 'from-gray-700 to-red-900',
      image: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=400&h=300&fit=crop'
    },
    { 
      id: 'mystery', 
      name: 'Mystery', 
      icon: Search, 
      color: 'from-gray-600 to-gray-800',
      image: 'https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=400&h=300&fit=crop'
    },
    { 
      id: 'romance', 
      name: 'Romance', 
      icon: Heart, 
      color: 'from-red-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'
    },
    { 
      id: 'sci-fi', 
      name: 'Sci-Fi', 
      icon: Zap, 
      color: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
    },
    { 
      id: 'slice-of-life', 
      name: 'Slice of Life', 
      icon: Coffee, 
      color: 'from-yellow-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=300&fit=crop'
    },
    { 
      id: 'thriller', 
      name: 'Thriller', 
      icon: Clock, 
      color: 'from-red-600 to-gray-800',
      image: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?w=400&h=300&fit=crop'
    },
    { 
      id: 'animals', 
      name: 'Animals', 
      icon: Rabbit, 
      color: 'from-green-400 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=300&fit=crop'
    },
    { 
      id: 'assistant', 
      name: 'Assistant', 
      icon: Bot, 
      color: 'from-blue-400 to-indigo-500',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop'
    },
    { 
      id: 'historical', 
      name: 'Historical', 
      icon: BookOpen, 
      color: 'from-amber-600 to-yellow-700',
      image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop'
    },
    { 
      id: 'oc', 
      name: 'OC', 
      icon: Code, 
      color: 'from-cyan-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop'
    },
    { 
      id: 'games', 
      name: 'Games', 
      icon: Gamepad2, 
      color: 'from-green-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    { 
      id: 'rpg', 
      name: 'RPG', 
      icon: Dice6, 
      color: 'from-purple-500 to-violet-600',
      image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop'
    },
    { 
      id: 'storytelling', 
      name: 'Storytelling', 
      icon: BookMarked, 
      color: 'from-indigo-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&h=300&fit=crop'
    },
    { 
      id: 'female', 
      name: 'Female', 
      icon: User, 
      color: 'from-pink-400 to-rose-500',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop'
    },
    { 
      id: 'furry', 
      name: 'Furry', 
      icon: Rabbit, 
      color: 'from-orange-400 to-amber-500',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop'
    },
    { 
      id: 'male', 
      name: 'Male', 
      icon: User, 
      color: 'from-blue-400 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop'
    },
    { 
      id: 'non-binary', 
      name: 'Non-binary', 
      icon: User, 
      color: 'from-yellow-400 to-green-500',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
    },
    { 
      id: 'nsfw', 
      name: 'NSFW', 
      icon: EyeOff, 
      color: 'from-red-500 to-pink-600',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop'
    },
    { 
      id: 'multiple-character', 
      name: 'Multiple Character', 
      icon: Users, 
      color: 'from-violet-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop'
    }
  ];

  const toggleVibe = (vibeId: string) => {
    if (selectedVibes.includes(vibeId)) {
      setSelectedVibes(selectedVibes.filter(id => id !== vibeId));
    } else {
      setSelectedVibes([...selectedVibes, vibeId]);
    }
  };

  const handleNext = () => {
    onNext(selectedVibes);
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-white mb-4">
        Step 1: Choose Your Vibe
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        What are you in the mood for? Pick a few tags so we can recommend the perfect companions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 max-h-[60vh] overflow-y-auto">
        {vibes.map((vibe) => {
          const IconComponent = vibe.icon;
          const isSelected = selectedVibes.includes(vibe.id);
          
          return (
            <Card
              key={vibe.id}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected 
                  ? 'border-[#FF7A00] border-2 shadow-lg shadow-[#FF7A00]/25 bg-[#1a1a2e]' 
                  : 'border-gray-700 hover:border-gray-600 bg-[#1a1a2e]/80'
              }`}
              onClick={() => toggleVibe(vibe.id)}
            >
              <div className="relative overflow-hidden">
                {/* Background Image */}
                <div 
                  className="h-32 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${vibe.image})` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-70`}></div>
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                
                {/* Content */}
                <div className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${vibe.color} flex items-center justify-center relative -mt-8 border-2 border-white shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {vibe.name}
                  </h3>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={handleNext}
        disabled={selectedVibes.length === 0}
        className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-bold py-3 px-8 text-lg rounded-lg shadow-lg hover:shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next Step
      </Button>
    </div>
  );
};

export default VibeSelection;
