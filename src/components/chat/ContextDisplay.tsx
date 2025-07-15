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
  className?: string;
}

export const ContextDisplay = ({ context, contextUpdates, className = '' }: ContextDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle both legacy context and new contextUpdates
  let contextItems: { label: string; value: string; key: string; previous?: string }[] = [];
  
  if (contextUpdates) {
    // New format: show context updates with previous/current values
    contextItems = Object.entries(contextUpdates)
      .filter(([_, update]) => update && update.current !== 'No context')
      .map(([key, update]) => ({
        label: key === 'moodTracking' ? 'Mood Tracking' :
               key === 'clothingInventory' ? 'Clothing Inventory' :
               key === 'locationTracking' ? 'Location Tracking' :
               key === 'timeAndWeather' ? 'Time & Weather' :
               key === 'relationshipStatus' ? 'Relationship Status' : key,
        value: update.current,
        previous: update.previous,
        key: key
      }));
  } else if (context) {
    // Legacy format: show all non-empty context
    contextItems = [
      { label: 'Mood Tracking', value: context.moodTracking, key: 'mood' },
      { label: 'Clothing Inventory', value: context.clothingInventory, key: 'clothing' },
      { label: 'Location Tracking', value: context.locationTracking, key: 'location' },
      { label: 'Time & Weather', value: context.timeAndWeather, key: 'weather' },
      { label: 'Relationship Status', value: context.relationshipStatus, key: 'relationship' },
    ].filter(item => item.value && item.value !== 'No context');
  }

  // Show debug info if no context
  if (contextItems.length === 0) {
    console.log('ContextDisplay: No context items to show', { context, contextUpdates });
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
            <span className="text-sm font-medium">Context Updates</span>
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
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </div>
                {item.previous && item.previous !== 'No context' && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                    Previous: {item.previous}
                  </div>
                )}
                <div className="text-sm text-foreground bg-muted/50 rounded-md p-2">
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