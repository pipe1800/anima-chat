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

  // Create all possible addon items
  const allAddonItems = [
    { label: 'Mood Tracking', key: 'mood', addonKey: 'moodTracking' },
    { label: 'Clothing Inventory', key: 'clothing', addonKey: 'clothingInventory' },
    { label: 'Location Tracking', key: 'location', addonKey: 'locationTracking' },
    { label: 'Time & Weather', key: 'weather', addonKey: 'timeAndWeather' },
    { label: 'Relationship Status', key: 'relationship', addonKey: 'relationshipStatus' },
    { label: 'Character Position', key: 'character_position', addonKey: 'characterPosition' },
  ];

  // Process context data into unified format
  let contextItems: ContextItem[] = [];
  
  // Handle contextUpdates (from historical messages)
  if (contextUpdates && Object.keys(contextUpdates).length > 0) {
    contextItems = allAddonItems.map(item => {
      const isEnabled = addonSettings ? addonSettings[item.addonKey] : true;
      const updateData = contextUpdates[item.addonKey];
      
      if (updateData && updateData.current !== 'No context' && isCharacterRelevantContext(item.addonKey, updateData.current)) {
        return {
          label: item.label,
          value: capitalizeText(updateData.current),
          key: item.key,
          isEnabled: isEnabled,
          isHistorical: !isEnabled
        };
      } else if (isEnabled) {
        return {
          label: item.label,
          value: 'No context yet',
          key: item.key,
          isEnabled: true,
          isHistorical: false
        };
      }
      return null;
    }).filter(Boolean);
  } 
  // Handle currentContext (inherited states)
  else if (currentContext) {
    contextItems = allAddonItems.map(item => {
      const isEnabled = addonSettings ? addonSettings[item.addonKey] : true;
      const contextValue = currentContext[item.addonKey];
      
      if (contextValue && contextValue !== 'No context' && isCharacterRelevantContext(item.addonKey, contextValue)) {
        return {
          label: item.label,
          value: capitalizeText(contextValue),
          key: item.key,
          isEnabled: isEnabled,
          isHistorical: false
        };
      } else if (isEnabled) {
        return {
          label: item.label,
          value: 'No context yet',
          key: item.key,
          isEnabled: true,
          isHistorical: false
        };
      }
      return null;
    }).filter(Boolean);
  }
  // Handle legacy context format
  else if (context) {
    contextItems = allAddonItems.map(item => {
      const isEnabled = addonSettings ? addonSettings[item.addonKey] : true;
      const contextValue = context[item.addonKey];
      
      if (contextValue && contextValue !== 'No context' && isCharacterRelevantContext(item.addonKey, contextValue)) {
        return {
          label: item.label,
          value: capitalizeText(contextValue),
          key: item.key,
          isEnabled: isEnabled,
          isHistorical: !isEnabled
        };
      } else if (isEnabled) {
        return {
          label: item.label,
          value: 'No context yet',
          key: item.key,
          isEnabled: true,
          isHistorical: false
        };
      }
      return null;
    }).filter(Boolean);
  }
  // If no context data but addons are enabled, show all enabled addons with "No context yet"
  else {
    contextItems = allAddonItems.map(item => {
      const isEnabled = addonSettings ? addonSettings[item.addonKey] : false;
      if (isEnabled) {
        return {
          label: item.label,
          value: 'No context yet',
          key: item.key,
          isEnabled: true,
          isHistorical: false
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Check if any stateful addons are enabled
  const hasEnabledAddons = addonSettings && (
    addonSettings.moodTracking || 
    addonSettings.clothingInventory || 
    addonSettings.locationTracking || 
    addonSettings.timeAndWeather || 
    addonSettings.relationshipStatus ||
    addonSettings.characterPosition
  );

  // Always show dropdown if addons are enabled, even if no context yet
  if (!hasEnabledAddons) {
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
                <span className="font-medium">{item.label}:</span> {item.value}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              No stateful addons are currently enabled.
            </div>
          )}
        </div>
      )}
    </div>
  );
};