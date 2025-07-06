
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, MessageCircle, Heart, Sparkles, Globe, Link, Lock } from 'lucide-react';

interface FinalizeStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onFinalize: () => void;
  onPrevious: () => void;
}

type VisibilityType = 'public' | 'unlisted' | 'private';

const FinalizeStep = ({ data, onUpdate, onFinalize, onPrevious }: FinalizeStepProps) => {
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [enableNSFW, setEnableNSFW] = useState(false);

  const visibilityOptions = [
    {
      id: 'public' as VisibilityType,
      title: 'Public',
      description: 'Visible to everyone on the Discover page.',
      icon: Globe,
    },
    {
      id: 'unlisted' as VisibilityType,
      title: 'Unlisted',
      description: 'Only accessible with a direct link.',
      icon: Link,
    },
    {
      id: 'private' as VisibilityType,
      title: 'Private',
      description: 'Only you can chat with this character.',
      icon: Lock,
    },
  ];

  const handleFinalize = () => {
    onUpdate({
      visibility,
      nsfw_enabled: enableNSFW
    });
    onFinalize();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Unleash Your Creation
        </h2>
        <p className="text-gray-400 text-lg">
          Configure your character's visibility and launch them into the world!
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
              
              {data.dialogue?.example_dialogues?.length > 0 && (
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">Example Dialogues</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.dialogue.example_dialogues.slice(0, 2).map((dialogue: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-blue-400 text-xs font-medium mb-1">User:</p>
                          <p className="text-white text-sm">"{dialogue.user}"</p>
                        </div>
                        <div className="bg-[#FF7A00]/10 rounded-lg p-3 border border-[#FF7A00]/20">
                          <p className="text-[#FF7A00] text-xs font-medium mb-1">Character:</p>
                          <p className="text-white text-sm">"{dialogue.character}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">Visibility Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = visibility === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setVisibility(option.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:bg-gray-800/30 ${
                  isSelected 
                    ? 'border-[#FF7A00] bg-[#FF7A00]/10' 
                    : 'border-gray-600 bg-gray-800/20'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${
                    isSelected 
                      ? 'bg-[#FF7A00]/20 text-[#FF7A00]' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h4 className={`text-xl font-semibold mb-2 ${
                      isSelected ? 'text-[#FF7A00]' : 'text-white'
                    }`}>
                      {option.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* NSFW Toggle */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-lg font-medium block mb-2">
                Enable NSFW Content
              </Label>
              <p className="text-gray-400 text-sm">
                Allow mature content and conversations with this character
              </p>
            </div>
            <Switch
              checked={enableNSFW}
              onCheckedChange={setEnableNSFW}
              className="data-[state=checked]:bg-[#FF7A00]"
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 text-[#FF7A00] mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-xl font-semibold">Ready to Launch!</span>
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-gray-400">
          Your character is complete and ready to interact with users. Launch when you're ready!
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
          onClick={handleFinalize}
          className="bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/80 hover:from-[#FF7A00]/90 hover:to-[#FF7A00]/70 text-white px-12 py-3 text-lg font-bold shadow-lg"
        >
          Save & Launch Character 🚀
        </Button>
      </div>
    </div>
  );
};

export default FinalizeStep;
