import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export const ContextDisplay = ({ context, contextUpdates, currentContext, addonSettings, className = '' }: ContextDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle context display with inheritance - ALWAYS show historical context
  let contextItems: { label: string; value: string; key: string; previous?: string; isUpdate?: boolean; isEnabled?: boolean; isHistorical?: boolean }[] = [];
  
  // If we have contextUpdates, show them (these are actual changes from historical messages)
  if (contextUpdates && Object.keys(contextUpdates).length > 0) {
    contextItems = Object.entries(contextUpdates)
      .filter(([key, update]) => {
        // Show ALL updates, regardless of current addon state - this is historical data
        return update && update.current !== 'No context';
      })
      .map(([key, update]) => {
        const isEnabled = addonSettings ? addonSettings[key as keyof typeof addonSettings] : true;
        return {
          label: key === 'moodTracking' ? 'Mood Tracking' :
                 key === 'clothingInventory' ? 'Clothing Inventory' :
                 key === 'locationTracking' ? 'Location Tracking' :
                 key === 'timeAndWeather' ? 'Time & Weather' :
                 key === 'relationshipStatus' ? 'Relationship Status' : key,
          value: update.current,
          previous: update.previous,
          key: key,
          isUpdate: true,
          isEnabled: isEnabled,
          isHistorical: !isEnabled // Mark as historical if addon is now disabled
        };
      });
  } 
  // If we have currentContext, show it (these are inherited context states)
  else if (currentContext) {
    contextItems = [
      { label: 'Mood Tracking', value: currentContext.moodTracking, key: 'mood' },
      { label: 'Clothing Inventory', value: currentContext.clothingInventory, key: 'clothing' },
      { label: 'Location Tracking', value: currentContext.locationTracking, key: 'location' },
      { label: 'Time & Weather', value: currentContext.timeAndWeather, key: 'weather' },
      { label: 'Relationship Status', value: currentContext.relationshipStatus, key: 'relationship' },
    ].filter(item => item.value && item.value !== 'No context')
     .map(item => {
       // Determine if addon is enabled
       const addonKey = item.key === 'mood' ? 'moodTracking' :
                        item.key === 'clothing' ? 'clothingInventory' :
                        item.key === 'location' ? 'locationTracking' :
                        item.key === 'weather' ? 'timeAndWeather' :
                        'relationshipStatus';
       const isEnabled = addonSettings ? addonSettings[addonKey as keyof typeof addonSettings] : true;
       return { ...item, isEnabled, isHistorical: false };
     });
  }
  // Legacy format: show all non-empty context - preserve historical data
  else if (context) {
    contextItems = [
      { label: 'Mood Tracking', value: context.moodTracking, key: 'mood' },
      { label: 'Clothing Inventory', value: context.clothingInventory, key: 'clothing' },
      { label: 'Location Tracking', value: context.locationTracking, key: 'location' },
      { label: 'Time & Weather', value: context.timeAndWeather, key: 'weather' },
      { label: 'Relationship Status', value: context.relationshipStatus, key: 'relationship' },
    ].filter(item => item.value && item.value !== 'No context')
     .map(item => {
       // Determine if addon is enabled
       const addonKey = item.key === 'mood' ? 'moodTracking' :
                        item.key === 'clothing' ? 'clothingInventory' :
                        item.key === 'location' ? 'locationTracking' :
                        item.key === 'weather' ? 'timeAndWeather' :
                        'relationshipStatus';
       const isEnabled = addonSettings ? addonSettings[addonKey as keyof typeof addonSettings] : true;
       return { ...item, isEnabled, isHistorical: !isEnabled };
     });
  }

  // Show debug info if no context
  if (contextItems.length === 0) {
    return (
      <Card className={`bg-background/50 border-border/50 backdrop-blur-sm ${className}`}>
        <div className="p-3">
          <div className="text-xs text-muted-foreground">
            No context tracked yet. Enable addons to start tracking context.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-background/50 border-border/50 backdrop-blur-sm ${className}`}>
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {contextItems.some(item => item.isUpdate) ? 'Context Updates' : 'Current Context'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {contextItems.length}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
            {contextItems.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className={`text-xs font-medium uppercase tracking-wide ${item.isEnabled ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                  {item.label}
                  {item.isUpdate && <span className="ml-2 text-primary">● Updated</span>}
                  {item.isHistorical && <span className="ml-2 text-xs opacity-60 text-amber-500">(historical - addon now disabled)</span>}
                  {item.isEnabled === false && !item.isHistorical && <span className="ml-2 text-xs opacity-60">(addon disabled)</span>}
                </div>
                {item.previous && item.previous !== 'No context' && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                    Previous: {item.previous}
                  </div>
                )}
                <div className={`text-sm rounded-md p-2 border ${
                  item.isHistorical 
                    ? 'text-foreground/70 bg-amber-50/50 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-800/30' 
                    : item.isUpdate 
                      ? (item.isEnabled ? 'text-foreground bg-primary/10 border-primary/20' : 'text-foreground/50 bg-primary/5 border-primary/10') 
                      : (item.isEnabled ? 'text-foreground bg-muted/50 border-muted' : 'text-foreground/50 bg-muted/30 border-muted/50')
                }`}>
                  {item.value}
                  {item.isHistorical && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      ℹ️ This context was active when the message was sent
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};