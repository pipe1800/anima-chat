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

  // Handle context display with inheritance
  let contextItems: { label: string; value: string; key: string; previous?: string; isUpdate?: boolean; isEnabled?: boolean }[] = [];
  
  // If we have contextUpdates, show them (these are actual changes)
  if (contextUpdates && Object.keys(contextUpdates).length > 0) {
    contextItems = Object.entries(contextUpdates)
      .filter(([key, update]) => {
        // Show ALL updates, but distinguish between enabled and disabled
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
          isEnabled: isEnabled
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
       return { ...item, isEnabled };
     });
  }
  // Legacy format: show all non-empty context
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
       return { ...item, isEnabled };
     });
  }

  // Show debug info if no context
  if (contextItems.length === 0) {
    console.log('ContextDisplay: No context items to show', { context, contextUpdates, currentContext });
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
                  {item.isEnabled === false && <span className="ml-2 text-xs opacity-60">(historical)</span>}
                </div>
                {item.previous && item.previous !== 'No context' && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                    Previous: {item.previous}
                  </div>
                )}
                <div className={`text-sm rounded-md p-2 ${
                  item.isUpdate 
                    ? (item.isEnabled ? 'text-foreground bg-primary/10 border border-primary/20' : 'text-foreground/50 bg-primary/5 border border-primary/10') 
                    : (item.isEnabled ? 'text-foreground bg-muted/50' : 'text-foreground/50 bg-muted/30')
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};