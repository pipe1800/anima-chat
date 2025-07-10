
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface CharacterCreationData {
  name: string;
  avatar?: string;
  title?: string;
  description: string;
  personality: {
    core_personality: string;
    tags: string[];
    knowledge_base?: string;
    scenario_definition?: string;
  };
  dialogue: {
    greeting: string;
    example_dialogues: Array<{
      user: string;
      character: string;
    }>;
  };
  addons?: {
    dynamicWorldInfo: boolean;
    enhancedMemory: boolean;
    moodTracking: boolean;
    clothingInventory: boolean;
    locationTracking: boolean;
    timeWeather: boolean;
    relationshipStatus: boolean;
    chainOfThought: boolean;
    fewShotExamples: boolean;
  };
  visibility: 'public' | 'unlisted' | 'private';
  nsfw_enabled?: boolean;
  default_persona_id?: string | null;
}

export const createCharacter = async (characterData: CharacterCreationData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Create character record
    const characterInsert: TablesInsert<'characters'> = {
      creator_id: user.user.id,
      name: characterData.name,
      short_description: characterData.description,
      avatar_url: characterData.avatar,
      visibility: characterData.visibility,
      default_persona_id: characterData.default_persona_id
    };

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .insert(characterInsert)
      .select()
      .single();

    if (characterError || !character) {
      console.error('Error creating character:', characterError);
      throw new Error('Failed to create character');
    }

    // Create character definition
    const definition: any = {
      personality: characterData.personality,
      dialogue: characterData.dialogue,
      title: characterData.title
    };

    // Only include addons if any are enabled (master switch is ON)
    const hasEnabledAddons = characterData.addons && Object.values(characterData.addons).some(value => value === true);
    if (hasEnabledAddons) {
      definition.addons = characterData.addons;
    }

    const { error: definitionError } = await supabase
      .from('character_definitions')
      .insert({
        character_id: character.id,
        personality_summary: JSON.stringify(definition),
        greeting: characterData.dialogue.greeting,
        description: characterData.personality.core_personality,
        scenario: characterData.personality.scenario_definition || null
      });

    if (definitionError) {
      console.error('Error creating character definition:', definitionError);
      // Cleanup: delete the character if definition creation failed
      await supabase.from('characters').delete().eq('id', character.id);
      throw new Error('Failed to create character definition');
    }

    return character;
  } catch (error) {
    console.error('Error in createCharacter:', error);
    throw error;
  }
};

export const updateCharacter = async (characterId: string, characterData: CharacterCreationData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Update character record
    const characterUpdate: TablesUpdate<'characters'> = {
      name: characterData.name,
      short_description: characterData.description,
      avatar_url: characterData.avatar,
      visibility: characterData.visibility,
      default_persona_id: characterData.default_persona_id
    };

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .update(characterUpdate)
      .eq('id', characterId)
      .eq('creator_id', user.user.id) // Ensure user owns the character
      .select()
      .single();

    if (characterError || !character) {
      console.error('Error updating character:', characterError);
      throw new Error('Failed to update character');
    }

    // Update character definition
    const definition: any = {
      personality: characterData.personality,
      dialogue: characterData.dialogue,
      title: characterData.title
    };

    // Only include addons if any are enabled (master switch is ON)
    const hasEnabledAddons = characterData.addons && Object.values(characterData.addons).some(value => value === true);
    if (hasEnabledAddons) {
      definition.addons = characterData.addons;
    }

    const { error: definitionError } = await supabase
      .from('character_definitions')
      .update({
        personality_summary: JSON.stringify(definition),
        greeting: characterData.dialogue.greeting,
        description: characterData.personality.core_personality,
        scenario: characterData.personality.scenario_definition || null
      })
      .eq('character_id', characterId);

    if (definitionError) {
      console.error('Error updating character definition:', definitionError);
      throw new Error('Failed to update character definition');
    }

    return character;
  } catch (error) {
    console.error('Error in updateCharacter:', error);
    throw error;
  }
};
