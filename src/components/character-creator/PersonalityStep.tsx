
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface PersonalityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PersonalityStep = ({ data, onUpdate, onNext, onPrevious }: PersonalityStepProps) => {
  const [corePersonality, setCorePersonality] = useState(data.personality?.core_personality || '');
  const [personalityTags, setPersonalityTags] = useState<string[]>(data.personality?.tags || []);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !personalityTags.includes(newTag.trim())) {
      setPersonalityTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPersonalityTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleNext = () => {
    onUpdate({
      personality: {
        core_personality: corePersonality,
        tags: personalityTags
      }
    });
    onNext();
  };

  const isValid = corePersonality.trim().length >= 50;

  return (
    <div className="flex-1 overflow-auto bg-[#121212]">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Craft Their Soul
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Define what makes your character unique. Their personality will shape every conversation.
          </p>
        </div>

        <div className="space-y-8">
          {/* Core Personality Text Area */}
          <div className="space-y-4">
            <Label htmlFor="core-personality" className="text-white text-xl font-medium block">
              Core Personality *
            </Label>
            <div className="relative">
              <Textarea
                id="core-personality"
                placeholder="Describe their personality. Are they sarcastic, shy, heroic? What are their likes, dislikes, fears, and motivations? Use single-word traits, full sentences, or even a backstory. The more detail, the deeper the character."
                value={corePersonality}
                onChange={(e) => setCorePersonality(e.target.value)}
                rows={8}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-base leading-relaxed p-6"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {corePersonality.length} characters
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Minimum 50 characters. The more detail you provide, the more authentic your character will feel.
            </p>
          </div>

          {/* Tag System */}
          <div className="space-y-4">
            <Label className="text-white text-xl font-medium block">
              Quick Tags
            </Label>
            <p className="text-gray-400 mb-4">
              Add personality tags for quick reference. These help define key traits at a glance.
            </p>
            
            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Confident, Witty, Loyal, Chaotic"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg flex-1"
              />
              <Button
                onClick={addTag}
                disabled={!newTag.trim() || personalityTags.includes(newTag.trim())}
                className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-4 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Display Tags */}
            {personalityTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {personalityTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 px-3 py-2 text-sm font-medium hover:bg-[#FF7A00]/30 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:bg-[#FF7A00]/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Helpful Examples */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-white font-medium mb-3">💡 Examples to inspire you:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-[#FF7A00]">Trait-based:</strong>
                <p>"Sarcastic but loyal. Loves coffee and hates small talk. Quick wit covers deep insecurities."</p>
              </div>
              <div>
                <strong className="text-[#FF7A00]">Story-driven:</strong>
                <p>"A former soldier turned artist. Struggles with PTSD but finds peace in painting. Protective of friends."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-700/50">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-8 py-3 rounded-xl"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Dialogue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityStep;
