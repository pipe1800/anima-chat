import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  BrainCircuit, 
  Smile, 
  Shirt, 
  MapPin, 
  Cloud, 
  Heart, 
  Lightbulb, 
  Image, 
  Mic,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription } from '@/lib/supabase-queries';

interface AddonData {
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

interface AddonsStepProps {
  data: {
    addons?: AddonData;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface AddonCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  creditCost: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

const AddonCard: React.FC<AddonCardProps> = ({
  icon: Icon,
  title,
  description,
  creditCost,
  enabled,
  onToggle,
  disabled = false,
  comingSoon = false
}) => {
  return (
    <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
      disabled ? 'opacity-50 bg-muted/50' : 'bg-card'
    } ${enabled && !disabled ? 'border-primary' : 'border-border'}`}>
      <div className="flex-shrink-0 mt-1">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          {comingSoon && (
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        {!comingSoon && (
          <p className="text-xs font-medium text-primary">{creditCost}</p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled || comingSoon}
        />
      </div>
    </div>
  );
};

const AddonsStep: React.FC<AddonsStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const { user } = useAuth();
  const [addons, setAddons] = useState<AddonData>({
    dynamicWorldInfo: false,
    enhancedMemory: false,
    moodTracking: false,
    clothingInventory: false,
    locationTracking: false,
    timeWeather: false,
    relationshipStatus: false,
    chainOfThought: false,
    fewShotExamples: false,
    ...data.addons
  });
  const [userPlan, setUserPlan] = useState<string>('Guest Pass');

  // Calculate if any add-ons are currently enabled
  const hasActiveAddons = () => {
    return Object.values(addons).some(value => value === true);
  };

  const [addonsEnabled, setAddonsEnabled] = useState<boolean>(hasActiveAddons());

  // Fetch user subscription to check if they're on Guest Pass
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) {
        setUserPlan('Guest Pass');
        return;
      }
      
      try {
        const { data: subscription } = await getUserSubscription(user.id);
        setUserPlan(subscription?.plan?.name || 'Guest Pass');
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setUserPlan('Guest Pass');
      }
    };

    fetchUserSubscription();
  }, [user]);

  // Keep master switch in sync when component loads or addons change
  useEffect(() => {
    setAddonsEnabled(hasActiveAddons());
  }, []);

  const handleToggle = (key: keyof AddonData, value: boolean) => {
    // Don't allow enabling individual addons if user is on Guest Pass
    if (value && userPlan === 'Guest Pass') {
      return;
    }
    
    const updatedAddons = { ...addons, [key]: value };
    setAddons(updatedAddons);
    onUpdate({ addons: updatedAddons });

    // Auto-enable master switch if any addon is enabled
    if (value && !addonsEnabled) {
      setAddonsEnabled(true);
    }

    // Auto-disable master switch if all addons are disabled
    const hasAnyEnabled = Object.values(updatedAddons).some(val => val === true);
    if (!hasAnyEnabled && addonsEnabled) {
      setAddonsEnabled(false);
    }
  };

  const handleMasterToggle = (value: boolean) => {
    // Don't allow enabling if user is on Guest Pass (only Guest Pass is restricted)
    if (value && userPlan === 'Guest Pass') {
      return;
    }
    
    setAddonsEnabled(value);
    
    // If turning off master switch, disable all addons
    if (!value) {
      const allDisabledAddons = Object.keys(addons).reduce((acc, key) => {
        acc[key as keyof AddonData] = false;
        return acc;
      }, {} as AddonData);
      
      setAddons(allDisabledAddons);
      onUpdate({ addons: allDisabledAddons });
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    if (addons.dynamicWorldInfo) total += 15;
    if (addons.enhancedMemory) total += 25;
    if (addons.moodTracking) total += 3;
    if (addons.clothingInventory) total += 3;
    if (addons.locationTracking) total += 3;
    if (addons.timeWeather) total += 3;
    if (addons.relationshipStatus) total += 3;
    if (addons.chainOfThought) total += 10;
    if (addons.fewShotExamples) total += 20;
    return total;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Enhance Your Character</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Activate powerful add-ons to create a more dynamic and immersive roleplaying experience. 
            Each enhancement consumes additional credits.
          </p>
        </div>

        <div className="space-y-6 mb-20">
          {/* Master Switch */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Enable Character Add-ons</h3>
                  <p className="text-sm text-gray-400">
                    Master control for all character enhancement features
                  </p>
                  {userPlan === 'Guest Pass' && (
                    <p className="text-sm text-orange-500 mt-2">
                      ⚠️ This feature is for paid subscribers only. Upgrade your plan to unlock character add-ons.
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={addonsEnabled}
                    onCheckedChange={handleMasterToggle}
                    disabled={userPlan === 'Guest Pass'}
                    className="scale-125"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Add-ons */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Core Enhancements</CardTitle>
              <CardDescription className="text-gray-400">
                Essential features to make your character more intelligent and consistent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AddonCard
                  icon={BookOpen}
                  title="Dynamic World Info"
                  description="Build a 'lorebook' for your character. When you mention keywords in chat, relevant lore is automatically added to the AI's context, ensuring consistency."
                  creditCost="+15% credit cost"
                  enabled={addons.dynamicWorldInfo}
                  onToggle={(enabled) => handleToggle('dynamicWorldInfo', enabled)}
                  disabled={!addonsEnabled || userPlan === 'Guest Pass'}
                />
                <AddonCard
                  icon={BrainCircuit}
                  title="Enhanced Memory"
                  description="Gives your character a long-term memory by creating a running summary of your conversation, preventing them from forgetting important details."
                  creditCost="+25% credit cost"
                  enabled={addons.enhancedMemory}
                  onToggle={(enabled) => handleToggle('enhancedMemory', enabled)}
                  disabled={!addonsEnabled || userPlan === 'Guest Pass'}
                />
            </CardContent>
          </Card>

          {/* Stateful Character Tracking */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Stateful Character Tracking</CardTitle>
              <CardDescription className="text-gray-400">
                Enable individual trackers to make your character aware of their current state. 
                Each tracker adds a small credit cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddonCard
                icon={Smile}
                title="Mood Tracking"
                description="Character's emotional state will evolve and be remembered."
                creditCost="+3% credit cost"
                enabled={addons.moodTracking}
                onToggle={(enabled) => handleToggle('moodTracking', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
              <AddonCard
                icon={Shirt}
                title="Clothing & Inventory"
                description="Keeps track of what the character is wearing and carrying."
                creditCost="+3% credit cost"
                enabled={addons.clothingInventory}
                onToggle={(enabled) => handleToggle('clothingInventory', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
              <AddonCard
                icon={MapPin}
                title="Location Tracking"
                description="Remembers the character's current location and environment."
                creditCost="+3% credit cost"
                enabled={addons.locationTracking}
                onToggle={(enabled) => handleToggle('locationTracking', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
              <AddonCard
                icon={Cloud}
                title="Time & Weather"
                description="The character will be aware of the in-story time and weather."
                creditCost="+3% credit cost"
                enabled={addons.timeWeather}
                onToggle={(enabled) => handleToggle('timeWeather', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
              <AddonCard
                icon={Heart}
                title="Relationship Status"
                description="Tracks the evolving relationship between you and the character."
                creditCost="+3% credit cost"
                enabled={addons.relationshipStatus}
                onToggle={(enabled) => handleToggle('relationshipStatus', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
            </CardContent>
          </Card>

          {/* Advanced Prompting Toolkit */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Prompting Toolkit</CardTitle>
              <CardDescription className="text-gray-400">
                For power users. These tools give you finer control over the AI's reasoning and response 
                style at a higher credit cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddonCard
                icon={Lightbulb}
                title="Chain-of-Thought"
                description="Prompts the AI to 'think step-by-step', improving logic and reasoning for complex scenarios."
                creditCost="+10% credit cost"
                enabled={addons.chainOfThought}
                onToggle={(enabled) => handleToggle('chainOfThought', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
              <AddonCard
                icon={BookOpen}
                title="Few-Shot Examples"
                description="Provide 1-3 examples of ideal interactions to better guide the AI's tone and style."
                creditCost="+20% credit cost"
                enabled={addons.fewShotExamples}
                onToggle={(enabled) => handleToggle('fewShotExamples', enabled)}
                disabled={!addonsEnabled || userPlan === 'Guest Pass'}
              />
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Features</CardTitle>
              <CardDescription className="text-gray-400">
                Exciting new capabilities coming soon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddonCard
                icon={Image}
                title="Image Generation"
                description="Allow the character to generate 'selfies' or images based on the conversation context."
                creditCost=""
                enabled={false}
                onToggle={() => {}}
                disabled={true}
                comingSoon={true}
              />
              <AddonCard
                icon={Mic}
                title="Text-to-Speech Voice"
                description="Give your character a voice. AI-generated responses will be read aloud in a chosen voice."
                creditCost=""
                enabled={false}
                onToggle={() => {}}
                disabled={true}
                comingSoon={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-700/50">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-8 py-3 rounded-xl"
          >
            ← Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Credit Cost Increase</p>
            <p className="text-xl font-bold text-[#FF7A00]">+{calculateTotalCost()}%</p>
          </div>
          
          <Button
            onClick={onNext}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
          >
            Next: Finalize →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddonsStep;