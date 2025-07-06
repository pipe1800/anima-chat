
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, MessageCircle } from 'lucide-react';

interface DialogueStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DialogueStep = ({ data, onUpdate, onNext, onPrevious }: DialogueStepProps) => {
  const [greeting, setGreeting] = useState(data.dialogue?.greeting || '');
  const [tone, setTone] = useState(data.dialogue?.tone || '');
  const [sampleResponses, setSampleResponses] = useState<string[]>(data.dialogue?.sample_responses || ['']);

  const toneOptions = [
    { value: 'encouraging', label: 'Encouraging & Supportive', description: 'Positive and uplifting responses' },
    { value: 'analytical', label: 'Analytical & Logical', description: 'Thoughtful and reasoned responses' },
    { value: 'creative', label: 'Creative & Imaginative', description: 'Innovative and artistic responses' },
    { value: 'conversational', label: 'Conversational & Natural', description: 'Flowing, natural dialogue' },
    { value: 'professional', label: 'Professional & Informative', description: 'Clear and knowledgeable responses' }
  ];

  const addSampleResponse = () => {
    setSampleResponses(prev => [...prev, '']);
  };

  const removeSampleResponse = (index: number) => {
    setSampleResponses(prev => prev.filter((_, i) => i !== index));
  };

  const updateSampleResponse = (index: number, value: string) => {
    setSampleResponses(prev => prev.map((response, i) => i === index ? value : response));
  };

  const handleNext = () => {
    const validResponses = sampleResponses.filter(response => response.trim());
    onUpdate({
      dialogue: {
        greeting,
        tone,
        sample_responses: validResponses
      }
    });
    onNext();
  };

  const isValid = greeting.trim() && tone && sampleResponses.filter(r => r.trim()).length >= 2;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Dialogue & Voice
        </h2>
        <p className="text-gray-400 text-lg">
          Define how your character speaks and interacts in conversations.
        </p>
      </div>

      <div className="space-y-10">
        {/* Greeting Message */}
        <div>
          <Label htmlFor="greeting" className="text-white text-xl mb-4 block">
            Opening Greeting *
          </Label>
          <p className="text-gray-400 mb-6">
            What's the first thing your character says when meeting someone new?
          </p>
          
          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              id="greeting"
              placeholder="Hello! I'm excited to chat with you..."
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pl-12 h-12 text-lg"
            />
          </div>
          
          {greeting && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#FF7A00]/10 to-transparent rounded-lg border border-[#FF7A00]/20">
              <p className="text-[#FF7A00] font-medium mb-2">Preview:</p>
              <p className="text-white italic">"{greeting}"</p>
            </div>
          )}
        </div>

        {/* Dialogue Tone */}
        <div>
          <Label className="text-white text-xl mb-4 block">
            Dialogue Tone *
          </Label>
          <p className="text-gray-400 mb-6">
            What's the overall tone and style of your character's responses?
          </p>
          
          <RadioGroup value={tone} onValueChange={setTone}>
            <div className="space-y-4">
              {toneOptions.map(option => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={option.value} 
                      className="text-white font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Sample Responses */}
        <div>
          <Label className="text-white text-xl mb-4 block">
            Sample Responses * (At least 2)
          </Label>
          <p className="text-gray-400 mb-6">
            Provide examples of how your character might respond to different topics or questions.
          </p>
          
          <div className="space-y-4">
            {sampleResponses.map((response, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-1">
                  <textarea
                    placeholder={`Sample response ${index + 1}...`}
                    value={response}
                    onChange={(e) => updateSampleResponse(index, e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                  />
                </div>
                
                {sampleResponses.length > 1 && (
                  <button
                    onClick={() => removeSampleResponse(index)}
                    className="mt-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addSampleResponse}
            className="mt-4 flex items-center space-x-2 text-[#FF7A00] hover:text-[#FF7A00]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add another sample response</span>
          </button>
        </div>

        {/* Preview Section */}
        {greeting && tone && (
          <div className="p-6 bg-gradient-to-r from-[#FF7A00]/10 to-transparent rounded-xl border border-[#FF7A00]/20">
            <h3 className="text-xl font-semibold text-[#FF7A00] mb-4">
              Dialogue Preview
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Opening Greeting:</p>
                <p className="text-white italic">"{greeting}"</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Tone Style:</p>
                <p className="text-white capitalize">{tone.replace('_', ' ')}</p>
              </div>
              {sampleResponses.filter(r => r.trim()).length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Sample Responses:</p>
                  <div className="space-y-2">
                    {sampleResponses.filter(r => r.trim()).map((response, index) => (
                      <p key={index} className="text-white italic text-sm">
                        ""{response}""
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
          Next: Finalize →
        </Button>
      </div>
    </div>
  );
};

export default DialogueStep;
