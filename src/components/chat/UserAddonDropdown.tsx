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
  const isGuestPass = userPlan === 'Guest Pass';
  const isTrueFanOrWhale = userPlan === 'True Fan' || userPlan === 'Whale';

  // Count active stateful tracking addons for Guest Pass limits
  const activeStatefulAddons = [
    addonSettings.moodTracking,
    addonSettings.clothingInventory,
    addonSettings.locationTracking,
    addonSettings.timeWeather,
    addonSettings.relationshipStatus,
  ].filter(Boolean).length;

  const addonCategories = {
    'Core Enhancements': {
      dynamicWorldInfo: { 
        name: 'Dynamic World Info', 
        cost: 10, 
        description: 'Enhanced world knowledge',
        available: true,
        dynamicCost: null
      },
      enhancedMemory: { 
        name: 'Enhanced Memory', 
        cost: 0, 
        description: isTrueFanOrWhale 
          ? 'Better conversation memory' 
          : 'Upgrade to True Fan or Whale to unlock',
        available: isTrueFanOrWhale,
        dynamicCost: isTrueFanOrWhale ? 'Cost calculated per chat' : null
      },
    },
    'Stateful Character Tracking': {
      moodTracking: { 
        name: 'Mood Tracking', 
        cost: 5, 
        description: 'Track character emotions',
        available: isTrueFanOrWhale || (!addonSettings.moodTracking && activeStatefulAddons < 2),
        dynamicCost: null
      },
      clothingInventory: { 
        name: 'Clothing Inventory', 
        cost: 5, 
        description: 'Track character outfits',
        available: isTrueFanOrWhale || (!addonSettings.clothingInventory && activeStatefulAddons < 2),
        dynamicCost: null
      },
      locationTracking: { 
        name: 'Location Tracking', 
        cost: 5, 
        description: 'Track current location',
        available: isTrueFanOrWhale || (!addonSettings.locationTracking && activeStatefulAddons < 2),
        dynamicCost: null
      },
      timeWeather: { 
        name: 'Time & Weather', 
        cost: 5, 
        description: 'Real-time environment',
        available: isTrueFanOrWhale || (!addonSettings.timeWeather && activeStatefulAddons < 2),
        dynamicCost: null
      },
      relationshipStatus: { 
        name: 'Relationship Status', 
        cost: 5, 
        description: 'Track relationships',
        available: isTrueFanOrWhale || (!addonSettings.relationshipStatus && activeStatefulAddons < 2),
        dynamicCost: null
      },
    },
    'Advanced Prompting Toolkit': {
      chainOfThought: { 
        name: 'Chain of Thought', 
        cost: 30, 
        description: isTrueFanOrWhale 
          ? 'Advanced reasoning' 
          : 'Upgrade to True Fan or Whale to unlock',
        available: isTrueFanOrWhale,
        dynamicCost: null
      },
      fewShotExamples: { 
        name: 'Few Shot Examples', 
        cost: 7, 
        description: 'Better response quality',
        available: true,
        dynamicCost: null
      },
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
    // Check if addon is available for user's subscription tier
    const addon = Object.values(addonCategories)
      .flatMap(category => Object.entries(category))
      .find(([key]) => key === addonKey)?.[1];
    
    if (!addon?.available) {
      if (addonKey === 'enhancedMemory' || addonKey === 'chainOfThought') {
        toast.error('This addon requires True Fan or Whale subscription. Upgrade to unlock advanced features!');
      } else if (isGuestPass && activeStatefulAddons >= 2) {
        toast.error('Guest Pass users are limited to 2 stateful tracking addons. Upgrade for unlimited access!');
      } else {
        toast.error('This addon is not available for your current subscription tier');
      }
      return;
    }

    // Show loading state
    setSaving(true);

    const newSettings = {
      ...addonSettings,
      [addonKey]: !addonSettings[addonKey]
    };

    setAddonSettings(newSettings);

    try {
      const result = await saveUserCharacterAddonSettings(userId, characterId, newSettings);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save addon settings');
      }
      
      const action = newSettings[addonKey] ? 'enabled' : 'disabled';
      const addonName = addon.name;
      toast.success(`${addonName} ${action} successfully`);
    } catch (error) {
      console.error('Error saving addon settings:', error);
      // Revert the change
      setAddonSettings(addonSettings);
      toast.error(`Failed to update ${addon.name}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const totalCost = calculateAddonCreditCost(addonSettings);
  const activeAddons = Object.values(addonSettings).filter(Boolean).length;

  if (loading) {
    return (
      <Button variant="ghost" className="text-gray-400 px-3" disabled>
        <Settings className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm">Loading addons...</span>
      </Button>
    );
  }

  // Show subscription loading state if subscription is still being fetched
  if (!subscription && userPlan === 'Guest Pass') {
    return (
      <Button variant="ghost" className="text-gray-400 px-3" disabled>
        <Settings className="w-4 h-4 mr-2 animate-pulse" />
        <span className="text-sm">Checking subscription...</span>
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
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-gray-800 px-3"
              disabled={saving}
            >
              <div className="flex items-center space-x-2">
                <Settings className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                <span className="text-sm">
                  {saving ? 'Saving...' : 'Addons'}
                </span>
                {activeAddons > 0 && !saving && (
                  <Badge variant="secondary" className="bg-[#FF7A00] text-white text-xs">
                    {activeAddons}
                  </Badge>
                )}
                {!saving && <ChevronDown className="w-4 h-4" />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-96 bg-[#1a1a2e] border-gray-700/50 z-50 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-medium">Character Addons</h3>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                    {userPlan}
                  </Badge>
                </div>
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
                        <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${
                          details.available 
                            ? 'bg-[#0f0f0f] border-gray-700/30' 
                            : 'bg-gray-900/50 border-gray-700/20 opacity-60'
                        }`}>
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center">
                              <span className={`font-medium text-sm ${
                                details.available ? 'text-white' : 'text-gray-500'
                              }`}>
                                {details.name}
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${
                              details.available ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {details.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-3 shrink-0">
                            {details.dynamicCost ? (
                              <Badge variant="outline" className="text-xs border-blue-400 text-blue-400 h-5">
                                Dynamic
                              </Badge>
                            ) : details.cost > 0 && (
                              <Badge variant="outline" className="text-xs border-[#FF7A00] text-[#FF7A00] h-5 min-w-[45px] justify-center">
                                +{details.cost}%
                              </Badge>
                            )}
                            <Switch
                              checked={addonSettings[key as keyof AddonSettings]}
                              onCheckedChange={() => handleToggleAddon(key as keyof AddonSettings)}
                              disabled={saving || !details.available || (addonSettings[key as keyof AddonSettings] ? false : !details.available)}
                              className="data-[state=checked]:bg-[#FF7A00]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Guest Pass restriction notice for Stateful Character Tracking */}
                    {categoryName === 'Stateful Character Tracking' && isGuestPass && activeStatefulAddons >= 2 && (
                      <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700/40 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <p className="text-yellow-400 text-xs font-medium">
                            Guest Pass Limit Reached
                          </p>
                        </div>
                        <p className="text-yellow-300 text-xs mt-1">
                          You've activated the maximum number of tracking addons. Upgrade to True Fan or Whale for unlimited access.
                        </p>
                      </div>
                    )}

                    {/* Upgrade prompts for locked features */}
                    {categoryName === 'Core Enhancements' && isGuestPass && (
                      <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <p className="text-blue-400 text-xs font-medium">
                            Enhanced Memory Available with Upgrade
                          </p>
                        </div>
                        <p className="text-blue-300 text-xs mt-1">
                          Unlock Enhanced Memory and other premium features with True Fan or Whale subscription.
                        </p>
                      </div>
                    )}

                    {categoryName === 'Advanced Prompting Toolkit' && isGuestPass && (
                      <div className="mt-2 p-3 bg-purple-900/20 border border-purple-700/40 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <p className="text-purple-400 text-xs font-medium">
                            Advanced Features Available
                          </p>
                        </div>
                        <p className="text-purple-300 text-xs mt-1">
                          Chain-of-Thought reasoning requires True Fan or Whale subscription for enhanced AI capabilities.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalCost > 0 && (
                <div className="border-t border-gray-700/50 pt-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full"></div>
                    <p className="text-gray-400 text-xs text-center">
                      Active addons increase message cost by {totalCost}% credits
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};