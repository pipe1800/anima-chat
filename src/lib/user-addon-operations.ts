import { supabase } from '@/integrations/supabase/client';

export interface AddonSettings {
  dynamicWorldInfo: boolean;
  enhancedMemory: boolean;
  moodTracking: boolean;
  clothingInventory: boolean;
  locationTracking: boolean;
  timeWeather: boolean;
  relationshipStatus: boolean;
  chainOfThought: boolean;
  fewShotExamples: boolean;
}

export const defaultAddonSettings: AddonSettings = {
  dynamicWorldInfo: false,
  enhancedMemory: false,
  moodTracking: false,
  clothingInventory: false,
  locationTracking: false,
  timeWeather: false,
  relationshipStatus: false,
  chainOfThought: false,
  fewShotExamples: false,
};

/**
 * Get user's addon settings for a specific character
 */
export const getUserCharacterAddonSettings = async (
  userId: string, 
  characterId: string
): Promise<AddonSettings> => {
  try {
    const { data, error } = await supabase
      .from('user_character_addons')
      .select('addon_settings')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching addon settings:', error);
      return defaultAddonSettings;
    }

    if (!data) {
      return defaultAddonSettings;
    }

    return { ...defaultAddonSettings, ...(data.addon_settings as unknown as AddonSettings) };
  } catch (error) {
    console.error('Error fetching addon settings:', error);
    return defaultAddonSettings;
  }
};

/**
 * Save user's addon settings for a specific character
 */
export const saveUserCharacterAddonSettings = async (
  userId: string,
  characterId: string,
  settings: AddonSettings
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_character_addons')
      .upsert(
        {
          user_id: userId,
          character_id: characterId,
          addon_settings: settings as any,
        },
        {
          onConflict: 'user_id,character_id'
        }
      );

    if (error) {
      console.error('Error saving addon settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving addon settings:', error);
    return { success: false, error: 'Unknown error occurred' };
  }
};

/**
 * Calculate the total credit cost increase based on addon settings
 */
export const calculateAddonCreditCost = (settings: AddonSettings): number => {
  let total = 0;
  if (settings.dynamicWorldInfo) total += 10;
  if (settings.moodTracking) total += 5;
  if (settings.clothingInventory) total += 5;
  if (settings.locationTracking) total += 5;
  if (settings.timeWeather) total += 5;
  if (settings.relationshipStatus) total += 5;
  if (settings.chainOfThought) total += 30;
  if (settings.fewShotExamples) total += 7;
  return total;
};

/**
 * Check if user has any active addons for a character
 */
export const hasActiveAddons = (settings: AddonSettings): boolean => {
  return Object.values(settings).some(value => value === true);
};