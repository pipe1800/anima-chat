import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import FoundationStep from '@/components/character-creator/FoundationStep';
import PersonalityStep from '@/components/character-creator/PersonalityStep';
import DialogueStep from '@/components/character-creator/DialogueStep';
import AddonsStep from '@/components/character-creator/AddonsStep';
import FinalizeStep from '@/components/character-creator/FinalizeStep';
import CreationStepsHeader from '@/components/character-creator/CreationStepsHeader';
import { createCharacter, updateCharacter, type CharacterCreationData } from '@/lib/character-operations';
import { getCharacterDetails } from '@/lib/supabase-queries';
import { useToast } from '@/hooks/use-toast';

const CharacterCreator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState<any>({
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
    addons: {
      dynamicWorldInfo: false,
      enhancedMemory: false,
      moodTracking: false,
      clothingInventory: false,
      locationTracking: false,
      timeWeather: false,
      relationshipStatus: false,
      chainOfThought: false,
      fewShotExamples: false
    },
    visibility: 'public',
    nsfw_enabled: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if we're editing a character from location state
  useEffect(() => {
    const state = location.state as any;
    if (state?.isEditing && state?.editingCharacter) {
      setIsEditing(true);
      setEditingCharacterId(state.editingCharacter.id);
      loadCharacterForEditing(state.editingCharacter.id);
    }
  }, [location.state]);

  const loadCharacterForEditing = async (characterId: string) => {
    try {
      const { data: character, error } = await getCharacterDetails(characterId);
      if (error || !character) {
        toast({
          title: "Error Loading Character",
          description: "Failed to load character data for editing.",
          variant: "destructive",
        });
        return;
      }

      // Parse the definition JSON to extract personality and dialogue data
      let definitionData: {
        title?: string;
        personality?: {
          tags?: string[];
          knowledge_base?: string;
          scenario_definition?: string;
        };
        dialogue?: {
          example_dialogues?: Array<{
            user: string;
            character: string;
          }>;
        };
        addons?: {
          dynamicWorldInfo?: boolean;
          enhancedMemory?: boolean;
          moodTracking?: boolean;
          clothingInventory?: boolean;
          locationTracking?: boolean;
          timeWeather?: boolean;
          relationshipStatus?: boolean;
          chainOfThought?: boolean;
          fewShotExamples?: boolean;
        };
      } = {};

      if (character.definition?.[0]?.definition) {
        try {
          definitionData = JSON.parse(character.definition[0].definition);
        } catch (e) {
          console.error('Error parsing character definition:', e);
        }
      }

      setCharacterData({
        name: character.name,
        avatar: character.avatar_url || '',
        title: definitionData.title || '',
        description: character.short_description || '',
        personality: {
          core_personality: character.definition?.[0]?.long_description || '',
          tags: definitionData.personality?.tags || [],
          knowledge_base: definitionData.personality?.knowledge_base || '',
          scenario_definition: definitionData.personality?.scenario_definition || ''
        },
        dialogue: {
          greeting: character.definition?.[0]?.greeting || '',
          example_dialogues: definitionData.dialogue?.example_dialogues || []
        },
        addons: {
          dynamicWorldInfo: definitionData.addons?.dynamicWorldInfo || false,
          enhancedMemory: definitionData.addons?.enhancedMemory || false,
          moodTracking: definitionData.addons?.moodTracking || false,
          clothingInventory: definitionData.addons?.clothingInventory || false,
          locationTracking: definitionData.addons?.locationTracking || false,
          timeWeather: definitionData.addons?.timeWeather || false,
          relationshipStatus: definitionData.addons?.relationshipStatus || false,
          chainOfThought: definitionData.addons?.chainOfThought || false,
          fewShotExamples: definitionData.addons?.fewShotExamples || false
        },
        visibility: character.visibility as 'public' | 'unlisted' | 'private',
        nsfw_enabled: false // This would need to be stored in the database if needed
      });
    } catch (error) {
      console.error('Error loading character for editing:', error);
      toast({
        title: "Error Loading Character",
        description: "Failed to load character data for editing.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    { id: 1, title: 'Foundation', description: 'Basic character info' },
    { id: 2, title: 'Personality', description: 'Traits and behavior' },
    { id: 3, title: 'Dialogue', description: 'Voice and responses' },
    { id: 4, title: 'Addons', description: 'Enhanced features' },
    { id: 5, title: 'Finalize', description: isEditing ? 'Review and update' : 'Review and create' }
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

      let character;
      if (isEditing && editingCharacterId) {
        character = await updateCharacter(editingCharacterId, characterData as CharacterCreationData);
        toast({
          title: "Character Updated!",
          description: `${character.name} has been successfully updated.`,
        });
      } else {
        character = await createCharacter(characterData as CharacterCreationData);
        toast({
          title: "Character Created!",
          description: `${character.name} has been successfully created.`,
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: `Failed to ${isEditing ? 'update' : 'create'} character. Please try again.`,
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
          <AddonsStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <FinalizeStep
            data={characterData}
            onUpdate={handleDataUpdate}
            onFinalize={handleFinalize}
            onPrevious={handlePrevious}
            isCreating={isCreating}
            isEditing={isEditing}
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
