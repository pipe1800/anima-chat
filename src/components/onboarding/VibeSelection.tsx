
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Heart, Gamepad2, Skull, Coffee, Wand2 } from 'lucide-react';

interface VibeSelectionProps {
  onNext: (vibes: string[]) => void;
  selectedVibes: string[];
  setSelectedVibes: (vibes: string[]) => void;
}

const VibeSelection = ({ onNext, selectedVibes, setSelectedVibes }: VibeSelectionProps) => {
  const vibes = [
    { id: 'fantasy', name: 'Fantasy', icon: Wand2, color: 'from-purple-500 to-pink-500' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { id: 'anime', name: 'Anime', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    { id: 'spicy', name: 'Spicy', icon: Heart, color: 'from-red-500 to-orange-500' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'from-green-500 to-teal-500' },
    { id: 'horror', name: 'Horror', icon: Skull, color: 'from-gray-700 to-red-900' },
    { id: 'slice-of-life', name: 'Slice of Life', icon: Coffee, color: 'from-yellow-500 to-orange-500' },
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
    <div className="w-full max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-white mb-4">
        Step 1: Choose Your Vibe
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        What are you in the mood for? Pick a few tags so we can recommend the perfect companions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <div className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${vibe.color} flex items-center justify-center`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {vibe.name}
                </h3>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center">
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
