import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserCharacterAddonSettings, saveUserCharacterAddonSettings, calculateAddonCreditCost, type AddonSettings } from '@/lib/user-addon-operations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserAddonDropdownProps {
  characterId: string;
  userId: string;
}

export const UserAddonDropdown = ({ characterId, userId }: UserAddonDropdownProps) => {
  const { subscription } = useAuth();
  const [addonSettings, setAddonSettings] = useState<AddonSettings>({
    dynamicWorldInfo: false,
    enhancedMemory: false,
    moodTracking: false,
    clothingInventory: false,
    locationTracking: false,
    timeWeather: false,
    relationshipStatus: false,
    chainOfThought: false,
    fewShotExamples: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Determine user's subscription tier
  const userPlan = subscription?.plan?.name || 'Guest Pass';

  const addonCategories = {
    'Core Enhancements': {
      dynamicWorldInfo: { name: 'Dynamic World Info', cost: 10, description: 'Enhanced world knowledge' },
      enhancedMemory: { name: 'Enhanced Memory', cost: 0, description: 'Better conversation memory' },
    },
    'Stateful Character Tracking': {
      moodTracking: { name: 'Mood Tracking', cost: 5, description: 'Track character emotions' },
      clothingInventory: { name: 'Clothing Inventory', cost: 5, description: 'Track character outfits' },
      locationTracking: { name: 'Location Tracking', cost: 5, description: 'Track current location' },
      timeWeather: { name: 'Time & Weather', cost: 5, description: 'Real-time environment' },
      relationshipStatus: { name: 'Relationship Status', cost: 5, description: 'Track relationships' },
    },
    'Advanced Prompting Toolkit': {
      chainOfThought: { name: 'Chain of Thought', cost: 30, description: 'Advanced reasoning' },
      fewShotExamples: { name: 'Few Shot Examples', cost: 7, description: 'Better response quality' },
    }
  };

  useEffect(() => {
    loadAddonSettings();
  }, [characterId, userId]);

  const loadAddonSettings = async () => {
    try {
      const settings = await getUserCharacterAddonSettings(userId, characterId);
      setAddonSettings(settings);
    } catch (error) {
      console.error('Error loading addon settings:', error);
      toast.error('Failed to load addon settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAddon = async (addonKey: keyof AddonSettings) => {
    const newSettings = {
      ...addonSettings,
      [addonKey]: !addonSettings[addonKey]
    };

    setAddonSettings(newSettings);
    setSaving(true);

    try {
      const result = await saveUserCharacterAddonSettings(userId, characterId, newSettings);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Addon settings updated');
    } catch (error) {
      console.error('Error saving addon settings:', error);
      // Revert the change
      setAddonSettings(addonSettings);
      toast.error('Failed to update addon settings');
    } finally {
      setSaving(false);
    }
  };

  const totalCost = calculateAddonCreditCost(addonSettings);
  const activeAddons = Object.values(addonSettings).filter(Boolean).length;

  if (loading) {
    return (
      <Button variant="ghost" className="text-gray-400 px-3" disabled>
        <Settings className="w-4 h-4 mr-2" />
        <span className="text-sm">Loading...</span>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white px-2">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Active addons will increase your credit usage per message</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800 px-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Addons</span>
                {activeAddons > 0 && (
                  <Badge variant="secondary" className="bg-[#FF7A00] text-white text-xs">
                    {activeAddons}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-96 bg-[#1a1a2e] border-gray-700/50 z-50 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
                <h3 className="text-white font-medium">Character Addons</h3>
                {totalCost > 0 && (
                  <Badge variant="outline" className="border-[#FF7A00] text-[#FF7A00]">
                    +{totalCost}% credits per message
                  </Badge>
                )}
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {Object.entries(addonCategories).map(([categoryName, addons]) => (
                  <div key={categoryName} className="space-y-3">
                    <h4 className="text-gray-300 font-medium text-sm border-b border-gray-700/30 pb-1">
                      {categoryName}
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(addons).map(([key, details]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] border border-gray-700/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium text-sm">{details.name}</span>
                              {details.cost > 0 && (
                                <Badge variant="outline" className="text-xs border-[#FF7A00] text-[#FF7A00]">
                                  +{details.cost}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{details.description}</p>
                          </div>
                          <Switch
                            checked={addonSettings[key as keyof AddonSettings]}
                            onCheckedChange={() => handleToggleAddon(key as keyof AddonSettings)}
                            disabled={saving}
                            className="data-[state=checked]:bg-[#FF7A00]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {totalCost > 0 && (
                <div className="border-t border-gray-700/50 pt-3">
                  <p className="text-gray-400 text-xs text-center">
                    These addons will increase your message cost by {totalCost}% credits
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};