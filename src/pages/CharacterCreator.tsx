
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import FoundationStep from '@/components/character-creator/FoundationStep';
import PersonalityStep from '@/components/character-creator/PersonalityStep';
import DialogueStep from '@/components/character-creator/DialogueStep';
import FinalizeStep from '@/components/character-creator/FinalizeStep';
import CreationStepsHeader from '@/components/character-creator/CreationStepsHeader';
import { createCharacter, type CharacterCreationData } from '@/lib/character-operations';
import { useToast } from '@/hooks/use-toast';

const CharacterCreator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState<Partial<CharacterCreationData>>({
    name: '',
    avatar: '',
    title: '',
    description: '',
    personality: {
      core_personality: '',
      tags: [],
      knowledge_base: '',
      scenario_definition: ''
    },
    dialogue: {
      greeting: '',
      example_dialogues: []
    },
    visibility: 'public',
    nsfw_enabled: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Foundation', description: 'Basic character info' },
    { id: 2, title: 'Personality', description: 'Traits and behavior' },
    { id: 3, title: 'Dialogue', description: 'Voice and responses' },
    { id: 4, title: 'Finalize', description: 'Review and create' }
  ];

  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleDataUpdate = (stepData: any) => {
    setCharacterData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalize = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a character.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // Validate required fields
      if (!characterData.name || !characterData.description || !characterData.personality?.core_personality || !characterData.dialogue?.greeting) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const character = await createCharacter(characterData as CharacterCreationData);
      
      toast({
        title: "Character Created!",
        description: `${character.name} has been successfully created.`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FoundationStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <PersonalityStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <DialogueStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <FinalizeStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onFinalize={handleFinalize}
            onPrevious={handlePrevious}
            isCreating={isCreating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          <div className="w-full">
            <CreationStepsHeader
              steps={steps}
              currentStep={currentStep}
              onStepChange={handleStepChange}
            />
          </div>

          <div className="flex-1 overflow-auto">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CharacterCreator;
