
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

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
  visibility: 'public' | 'unlisted' | 'private';
  nsfw_enabled?: boolean;
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
      visibility: characterData.visibility
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
    const definition = {
      personality: characterData.personality,
      dialogue: characterData.dialogue,
      title: characterData.title
    };

    const { error: definitionError } = await supabase
      .from('character_definitions')
      .insert({
        character_id: character.id,
        definition: JSON.stringify(definition),
        greeting: characterData.dialogue.greeting,
        long_description: characterData.personality.core_personality
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
