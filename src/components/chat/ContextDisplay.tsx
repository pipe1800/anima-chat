import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { capitalizeText, isCharacterRelevantContext, getContextLabel, getAddonKey } from '@/lib/utils/textFormatting';

export interface TrackedContext {
  moodTracking: string;
  clothingInventory: string;
  locationTracking: string;
  timeAndWeather: string;
  relationshipStatus: string;
  characterPosition: string;
}

interface ContextDisplayProps {
  context?: TrackedContext;
  contextUpdates?: {
    [key: string]: {
      previous: string;
      current: string;
    };
  };
  currentContext?: TrackedContext;
  addonSettings?: {
    moodTracking?: boolean;
    clothingInventory?: boolean;
    locationTracking?: boolean;
    timeAndWeather?: boolean;
    relationshipStatus?: boolean;
    characterPosition?: boolean;
  };
  className?: string;
}

interface ContextItem {
  label: string;
  value: string;
  key: string;
  isEnabled: boolean;
  isHistorical: boolean;
}

export const ContextDisplay = ({ context, contextUpdates, currentContext, addonSettings, className = '' }: ContextDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Process context data into unified format
  let contextItems: ContextItem[] = [];
  
  // Handle contextUpdates (from historical messages)
  if (contextUpdates && Object.keys(contextUpdates).length > 0) {
    contextItems = Object.entries(contextUpdates)
      .filter(([key, update]) => {
        return update && 
               update.current !== 'No context' && 
               isCharacterRelevantContext(key, update.current);
      })
      .map(([key, update]) => {
        const isEnabled = addonSettings ? addonSettings[key as keyof typeof addonSettings] : true;
        return {
          label: getContextLabel(key),
          value: capitalizeText(update.current),
          key: key,
          isEnabled: isEnabled,
          isHistorical: !isEnabled
        };
      });
  } 
  // Handle currentContext (inherited states)
  else if (currentContext) {
    contextItems = [
      { label: 'Mood Tracking', value: currentContext.moodTracking, key: 'mood' },
      { label: 'Clothing Inventory', value: currentContext.clothingInventory, key: 'clothing' },
      { label: 'Location Tracking', value: currentContext.locationTracking, key: 'location' },
      { label: 'Time & Weather', value: currentContext.timeAndWeather, key: 'weather' },
      { label: 'Relationship Status', value: currentContext.relationshipStatus, key: 'relationship' },
      { label: 'Character Position', value: currentContext.characterPosition, key: 'character_position' },
    ]
      .filter(item => item.value && 
                     item.value !== 'No context' && 
                     isCharacterRelevantContext(getAddonKey(item.key), item.value))
      .map(item => {
        const addonKey = getAddonKey(item.key);
        const isEnabled = addonSettings ? addonSettings[addonKey] : true;
        return {
          ...item,
          value: capitalizeText(item.value),
          isEnabled,
          isHistorical: false
        };
      });
  }
  // Handle legacy context format
  else if (context) {
    contextItems = [
      { label: 'Mood Tracking', value: context.moodTracking, key: 'mood' },
      { label: 'Clothing Inventory', value: context.clothingInventory, key: 'clothing' },
      { label: 'Location Tracking', value: context.locationTracking, key: 'location' },
      { label: 'Time & Weather', value: context.timeAndWeather, key: 'weather' },
      { label: 'Relationship Status', value: context.relationshipStatus, key: 'relationship' },
      { label: 'Character Position', value: context.characterPosition, key: 'character_position' },
    ]
      .filter(item => item.value && 
                     item.value !== 'No context' && 
                     isCharacterRelevantContext(getAddonKey(item.key), item.value))
      .map(item => {
        const addonKey = getAddonKey(item.key);
        const isEnabled = addonSettings ? addonSettings[addonKey] : true;
        return {
          ...item,
          value: capitalizeText(item.value),
          isEnabled,
          isHistorical: !isEnabled
        };
      });
  }

  // Check if any stateful addons are enabled
  const hasEnabledAddons = addonSettings && (
    addonSettings.moodTracking || 
    addonSettings.clothingInventory || 
    addonSettings.locationTracking || 
    addonSettings.timeAndWeather || 
    addonSettings.relationshipStatus
  );

  // Don't render if no relevant context and no enabled addons
  if (contextItems.length === 0 && !hasEnabledAddons) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Context</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {contextItems.length > 0 ? (
            contextItems.map((item) => (
              <div key={item.key} className={`text-sm ${item.isHistorical ? 'text-muted-foreground' : 'text-foreground'}`}>
                <span className="font-medium">{item.label}:</span> {item.value}.
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              Context tracking is active - no data extracted yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};