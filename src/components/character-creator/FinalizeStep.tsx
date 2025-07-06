
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, MessageCircle, Heart, Sparkles } from 'lucide-react';

interface FinalizeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onFinalize: () => void;
  onPrevious: () => void;
}

const FinalizeStep = ({ data, onFinalize, onPrevious }: FinalizeStepProps) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Finalize Your Character
        </h2>
        <p className="text-gray-400 text-lg">
          Review your character's details and bring them to life!
        </p>
      </div>

      {/* Character Summary Card */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-[#FF7A00]/20 overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF7A00]/20 to-transparent p-6 border-b border-[#FF7A00]/20">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20 border-4 border-[#FF7A00]/50">
              <AvatarImage src={data.avatar} />
              <AvatarFallback className="bg-gray-800 text-gray-400">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{data.name}</h3>
              <p className="text-gray-300">{data.description}</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {/* Personality Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-[#FF7A00]" />
              <h4 className="text-xl font-semibold text-white">Personality</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">Personality Traits</Label>
                <div className="flex flex-wrap gap-2">
                  {data.personality?.traits?.map((trait: string) => (
                    <Badge key={trait} className="bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">Communication Style</Label>
                <p className="text-white capitalize">
                  {data.personality?.communication_style?.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {data.personality?.interests?.map((interest: string) => (
                    <Badge key={interest} className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#FF7A00]" />
              <h4 className="text-xl font-semibold text-white">Dialogue & Voice</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">Opening Greeting</Label>
                <div className="bg-gray-800/30 rounded-lg p-4 border-l-4 border-[#FF7A00]">
                  <p className="text-white italic">"{data.dialogue?.greeting}"</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">Dialogue Tone</Label>
                <p className="text-white capitalize">
                  {data.dialogue?.tone?.replace('_', ' ')}
                </p>
              </div>
              
              {data.dialogue?.sample_responses?.length > 0 && (
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">Sample Responses</Label>
                  <div className="space-y-2">
                    {data.dialogue.sample_responses.map((response: string, index: number) => (
                      <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-white text-sm italic">"{response}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 text-[#FF7A00] mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-xl font-semibold">Character Ready!</span>
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-gray-400">
          Your character is complete and ready to come to life. Click "Create Character" to finalize!
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-8 py-3"
        >
          ← Previous
        </Button>
        
        <Button
          onClick={onFinalize}
          className="bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/80 hover:from-[#FF7A00]/90 hover:to-[#FF7A00]/70 text-white px-12 py-3 text-lg font-bold shadow-lg"
        >
          Create Character ✨
        </Button>
      </div>
    </div>
  );
};

export default FinalizeStep;
