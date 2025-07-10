import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface PersonalityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedTags: Tables<'tags'>[];
  setSelectedTags: (tags: Tables<'tags'>[]) => void;
}

const PersonalityStep = ({ data, onUpdate, onNext, onPrevious, selectedTags, setSelectedTags }: PersonalityStepProps) => {
  const [corePersonality, setCorePersonality] = useState(data.personality?.core_personality || '');
  const [knowledgeBase, setKnowledgeBase] = useState(data.personality?.knowledge_base || '');
  const [scenarioDefinition, setScenarioDefinition] = useState(data.personality?.scenario_definition || '');
  const [allTags, setAllTags] = useState<Tables<'tags'>[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fetch all tags from the database
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data: tags, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching tags:', error);
          return;
        }
        
        if (tags) {
          setAllTags(tags);
        }
      } catch (err) {
        console.error('Exception fetching tags:', err);
      }
    };

    fetchTags();
  }, []);

  // Update form data when character data is loaded
  useEffect(() => {
    if (data.personality) {
      setCorePersonality(data.personality.core_personality || '');
      setKnowledgeBase(data.personality.knowledge_base || '');
      setScenarioDefinition(data.personality.scenario_definition || '');
      
      // Auto-expand advanced section if there's content
      const hasAdvancedContent = 
        (data.personality.knowledge_base && data.personality.knowledge_base.trim()) ||
        (data.personality.scenario_definition && data.personality.scenario_definition.trim());
      
      if (hasAdvancedContent) {
        setIsAdvancedOpen(true);
      }
    }
  }, [data]);

  const addTag = (tagName: string) => {
    const fullTag = allTags.find(tag => tag.name === tagName);
    if (fullTag && !selectedTags.find(tag => tag.id === fullTag.id)) {
      setSelectedTags([...selectedTags, fullTag]);
    }
  };

  const removeTag = (tagToRemove: Tables<'tags'>) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagToRemove.id));
  };

  const handleNext = () => {
    onUpdate({
      personality: {
        core_personality: corePersonality,
        tags: selectedTags,
        knowledge_base: knowledgeBase,
        scenario_definition: scenarioDefinition
      }
    });
    onNext();
  };

  const isValid = corePersonality.trim().length >= 50;

  // Filter out already selected tags
  const availableTagsToSelect = allTags.filter(tag => !selectedTags.find(selected => selected.id === tag.id));

  return (
    <div className="flex-1 overflow-auto bg-[#121212]">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Craft Their Soul
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Define what makes your character unique. Their personality will shape every conversation.
          </p>
        </div>

        <div className="space-y-8">
          {/* Description Text Area */}
          <div className="space-y-4">
            <Label htmlFor="core-personality" className="text-white text-xl font-medium block">
              Description *
            </Label>
            <div className="relative">
              <Textarea
                id="core-personality"
                placeholder="Describe the physical and mental details of your character. What do they look like? How do they think and behave? What are their motivations, fears, and quirks?"
                value={corePersonality}
                onChange={(e) => setCorePersonality(e.target.value)}
                rows={8}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-base leading-relaxed p-6"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {corePersonality.length} characters
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Describe the physical and mental details of your character
            </p>
          </div>

          {/* Tag System */}
          <div className="space-y-4">
            <Label className="text-white text-xl font-medium block">
              Quick Tags
            </Label>
            <p className="text-gray-400 mb-4">
              Add personality tags for quick reference. These help define key traits at a glance.
            </p>
            
            {/* Tag Dropdown */}
            <div className="space-y-4">
              
              <Select onValueChange={addTag}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white rounded-lg">
                  <SelectValue placeholder={`Select a tag to add... (${availableTagsToSelect.length} available)`} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-50">
                  {availableTagsToSelect.length > 0 ? (
                    availableTagsToSelect.map((tag) => (
                      <SelectItem 
                        key={tag.id} 
                        value={tag.name}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {tag.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-tags" disabled className="text-gray-400">
                      {allTags.length === 0 ? 'Loading tags...' : 'All tags already selected'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Display Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      className="bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 px-3 py-2 text-sm font-medium hover:bg-[#FF7A00]/30 transition-colors"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:bg-[#FF7A00]/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Section */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
              <div className="flex items-center gap-2 text-white text-xl font-medium hover:text-[#FF7A00] transition-colors">
                {isAdvancedOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                Advanced
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-6 mt-4">
              {/* Personality Summary */}
              <div className="space-y-4">
                <Label htmlFor="knowledge-base" className="text-white text-lg font-medium block">
                  Personality summary
                </Label>
                <Textarea
                  id="knowledge-base"
                  placeholder="A short summary of the personality"
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  rows={5}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-base leading-relaxed p-4"
                />
                <p className="text-sm text-gray-500">
                  A short summary of the personality.
                </p>
              </div>

              {/* Scenario */}
              <div className="space-y-4">
                <Label htmlFor="scenario-definition" className="text-white text-lg font-medium block">
                  Scenario
                </Label>
                <Textarea
                  id="scenario-definition"
                  placeholder="Share context of the scenario or the interaction taking place in the chat"
                  value={scenarioDefinition}
                  onChange={(e) => setScenarioDefinition(e.target.value)}
                  rows={5}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-base leading-relaxed p-4"
                />
                <p className="text-sm text-gray-500">
                  Share context of the scenario or the interaction taking place in the chat.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Helpful Examples */}
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-white font-medium mb-3">💡 Examples to inspire you:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-[#FF7A00]">Trait-based:</strong>
                <p>"Sarcastic but loyal. Loves coffee and hates small talk. Quick wit covers deep insecurities."</p>
              </div>
              <div>
                <strong className="text-[#FF7A00]">Story-driven:</strong>
                <p>"A former soldier turned artist. Struggles with PTSD but finds peace in painting. Protective of friends."</p>
              </div>
            </div>
          </div>
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
          
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Dialogue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityStep;