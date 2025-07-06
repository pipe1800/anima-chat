
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';

interface FoundationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const FoundationStep = ({ data, onUpdate, onNext }: FoundationStepProps) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    avatar: data.avatar || '',
    description: data.description || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  const isValid = formData.name.trim() && formData.description.trim();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Foundation
        </h2>
        <p className="text-gray-400 text-lg">
          Let's start with the basics. Give your character a name, appearance, and core identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Avatar Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Character Avatar
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-[#FF7A00]/30">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF7A00] rounded-full flex items-center justify-center hover:bg-[#FF7A00]/80 transition-colors">
                  <Upload className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="avatar-url" className="text-white">
                Avatar URL (Optional)
              </Label>
              <Input
                id="avatar-url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="character-name" className="text-white text-lg mb-3 block">
              Character Name *
            </Label>
            <Input
              id="character-name"
              placeholder="Enter your character's name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 text-lg h-12"
            />
          </div>

          <div>
            <Label htmlFor="character-description" className="text-white text-lg mb-3 block">
              Character Description *
            </Label>
            <textarea
              id="character-description"
              placeholder="Describe your character's background, role, and core identity..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Character Preview */}
      {formData.name && (
        <div className="mt-12 p-6 bg-gradient-to-r from-[#FF7A00]/10 to-transparent rounded-xl border border-[#FF7A00]/20">
          <h3 className="text-xl font-semibold text-[#FF7A00] mb-4">
            Character Preview
          </h3>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16 border-2 border-[#FF7A00]/30">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="bg-gray-800 text-gray-400">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-white font-semibold text-lg">{formData.name}</h4>
              {formData.description && (
                <p className="text-gray-300 mt-2 leading-relaxed">
                  {formData.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end mt-12">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold"
        >
          Next: Personality →
        </Button>
      </div>
    </div>
  );
};

export default FoundationStep;
