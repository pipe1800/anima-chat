import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { capitalizeText, filterCharacterRelevantContext } from '@/lib/utils/textFormatting';

export interface TrackedContext {
  moodTracking: string;
  clothingInventory: string;
  locationTracking: string;
  timeAndWeather: string;
  relationshipStatus: string;
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

const getContextLabel = (key: string): string => {
  switch (key) {
    case 'moodTracking': return 'Mood Tracking';
    case 'clothingInventory': return 'Clothing Inventory';
    case 'locationTracking': return 'Location Tracking';
    case 'timeAndWeather': return 'Time & Weather';
    case 'relationshipStatus': return 'Relationship Status';
    default: return key;
  }
};

const getAddonKey = (itemKey: string): keyof TrackedContext => {
  switch (itemKey) {
    case 'mood': return 'moodTracking';
    case 'clothing': return 'clothingInventory';
    case 'location': return 'locationTracking';
    case 'weather': return 'timeAndWeather';
    case 'relationship': return 'relationshipStatus';
    default: return itemKey as keyof TrackedContext;
  }
};

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
               filterCharacterRelevantContext(key, update.current);
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
    ]
      .filter(item => item.value && 
                     item.value !== 'No context' && 
                     filterCharacterRelevantContext(getAddonKey(item.key), item.value))
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
    ]
      .filter(item => item.value && 
                     item.value !== 'No context' && 
                     filterCharacterRelevantContext(getAddonKey(item.key), item.value))
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

  // Don't render if no relevant context
  if (contextItems.length === 0) {
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
          {contextItems.map((item) => (
            <div key={item.key} className={`text-sm ${item.isHistorical ? 'text-muted-foreground' : 'text-foreground'}`}>
              <span className="font-medium">{item.label}:</span> {item.value}.
            </div>
          ))}
        </div>
      )}
    </div>
  );
};