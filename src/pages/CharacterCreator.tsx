
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import FoundationStep from '@/components/character-creator/FoundationStep';
import PersonalityStep from '@/components/character-creator/PersonalityStep';
import DialogueStep from '@/components/character-creator/DialogueStep';
import FinalizeStep from '@/components/character-creator/FinalizeStep';
import CreationStepsHeader from '@/components/character-creator/CreationStepsHeader';

const CharacterCreator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    name: '',
    avatar: '',
    description: '',
    personality: {
      traits: [],
      communication_style: '',
      interests: []
    },
    dialogue: {
      greeting: '',
      sample_responses: [],
      tone: ''
    }
  });
  const navigate = useNavigate();

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
    try {
      // Here you would save the character to your database
      console.log('Creating character:', characterData);
      
      // For now, navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating character:', error);
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
        
        {/* Main Content Area - properly offset from sidebar */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          {/* Creation Steps Header - now properly contained */}
          <div className="w-full">
            <CreationStepsHeader
              steps={steps}
              currentStep={currentStep}
              onStepChange={handleStepChange}
            />
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-auto">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CharacterCreator;
