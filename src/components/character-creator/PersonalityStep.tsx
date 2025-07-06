
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PersonalityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PersonalityStep = ({ data, onUpdate, onNext, onPrevious }: PersonalityStepProps) => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(data.personality?.traits || []);
  const [communicationStyle, setCommunicationStyle] = useState(data.personality?.communication_style || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.personality?.interests || []);

  const personalityTraits = [
    'Friendly', 'Mysterious', 'Energetic', 'Calm', 'Witty', 'Serious',
    'Playful', 'Intellectual', 'Creative', 'Ambitious', 'Loyal', 'Independent',
    'Empathetic', 'Confident', 'Curious', 'Patient', 'Adventurous', 'Wise'
  ];

  const communicationStyles = [
    { value: 'casual', label: 'Casual & Relaxed', description: 'Uses informal language and slang' },
    { value: 'formal', label: 'Professional & Formal', description: 'Structured and polite communication' },
    { value: 'friendly', label: 'Warm & Friendly', description: 'Enthusiastic and welcoming tone' },
    { value: 'intellectual', label: 'Thoughtful & Analytical', description: 'Deep, reflective responses' },
    { value: 'humorous', label: 'Playful & Humorous', description: 'Uses jokes and light-hearted banter' }
  ];

  const interests = [
    'Technology', 'Science', 'Art', 'Music', 'Sports', 'Travel',
    'Cooking', 'Reading', 'Gaming', 'Philosophy', 'History', 'Fashion',
    'Nature', 'Movies', 'Photography', 'Fitness', 'Business', 'Psychology'
  ];

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    onUpdate({
      personality: {
        traits: selectedTraits,
        communication_style: communicationStyle,
        interests: selectedInterests
      }
    });
    onNext();
  };

  const isValid = selectedTraits.length >= 3 && communicationStyle && selectedInterests.length >= 2;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Personality
        </h2>
        <p className="text-gray-400 text-lg">
          Define your character's personality traits, communication style, and interests.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personality Traits */}
        <div>
          <Label className="text-white text-xl mb-4 block">
            Personality Traits * (Select at least 3)
          </Label>
          <p className="text-gray-400 mb-6">
            Choose traits that best describe your character's personality.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {personalityTraits.map(trait => (
              <button
                key={trait}
                onClick={() => toggleTrait(trait)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedTraits.includes(trait)
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
          
          {selectedTraits.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTraits.map(trait => (
                <Badge key={trait} className="bg-[#FF7A00] text-white px-3 py-1">
                  {trait}
                  <button
                    onClick={() => toggleTrait(trait)}
                    className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Communication Style */}
        <div>
          <Label className="text-white text-xl mb-4 block">
            Communication Style *
          </Label>
          <p className="text-gray-400 mb-6">
            How does your character communicate and interact with others?
          </p>
          
          <RadioGroup value={communicationStyle} onValueChange={setCommunicationStyle}>
            <div className="space-y-4">
              {communicationStyles.map(style => (
                <div key={style.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={style.value} 
                    id={style.value}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={style.value} 
                      className="text-white font-medium cursor-pointer"
                    >
                      {style.label}
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">
                      {style.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Interests */}
        <div>
          <Label className="text-white text-xl mb-4 block">
            Interests & Hobbies * (Select at least 2)
          </Label>
          <p className="text-gray-400 mb-6">
            What topics and activities is your character passionate about?
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {interests.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedInterests.includes(interest)
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00]'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          
          {selectedInterests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedInterests.map(interest => (
                <Badge key={interest} className="bg-[#FF7A00] text-white px-3 py-1">
                  {interest}
                  <button
                    onClick={() => toggleInterest(interest)}
                    className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-8 py-3"
        >
          ← Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold"
        >
          Next: Dialogue →
        </Button>
      </div>
    </div>
  );
};

export default PersonalityStep;
