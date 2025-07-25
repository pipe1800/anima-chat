import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserActiveSubscription } from '@/lib/supabase-queries';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

// Define the Tag type
interface Tag {
  id: number;
  name: string;
}

interface PersonalityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const PersonalityStep = ({ data, onUpdate, onNext, onPrevious, selectedTags, setSelectedTags }: PersonalityStepProps) => {
  const [corePersonality, setCorePersonality] = useState(data.personality?.core_personality || '');
  const [knowledgeBase, setKnowledgeBase] = useState(data.personality?.knowledge_base || '');
  const [scenarioDefinition, setScenarioDefinition] = useState(data.personality?.scenario_definition || '');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('Guest Pass');

  const { user } = useAuth();

  // Fetch user subscription and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      console.log('PersonalityStep: Starting to fetch data...');
      setIsLoading(true);
      
      try {
        // Fetch user subscription
        if (user) {
          const { data: subscription } = await getUserActiveSubscription(user.id);
          setUserPlan(subscription?.plan?.name || 'Guest Pass');
        } else {
          setUserPlan('Guest Pass');
        }

        // Fetch tags
        const { data: tagsData, error } = await supabase.from('tags').select('*').order('name');
        if (error) {
          console.error('Error fetching tags:', error);
          setAllTags([]);
        } else {
          console.log('PersonalityStep: Fetched tags:', tagsData);
          setAllTags((tagsData as Tag[]) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserPlan('Guest Pass');
        setAllTags([]);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [user]);

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

  // Handler to add a tag
  const handleAddTag = (tagId: string) => {
    const tagToAdd = allTags.find(tag => tag.id.toString() === tagId);
    // Add the tag only if it exists and is not already selected
    if (tagToAdd && !selectedTags.some(tag => tag.id === tagToAdd.id)) {
      setSelectedTags([...selectedTags, tagToAdd]);
    }
  };

  // Handler to remove a tag
  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleNext = () => {
    onUpdate({
      personality: {
        core_personality: corePersonality,
        tags: selectedTags.map(tag => tag.name), // Convert tag objects to tag names
        knowledge_base: knowledgeBase,
        scenario_definition: scenarioDefinition
      }
    });
    onNext();
  };

  const isValid = corePersonality.trim().length >= 50;

  // Filter the dropdown to show only tags that haven't been selected yet
  // Also filter out NSFW tag for Guest Pass users
  const availableTags = allTags.filter(tag => {
    // Don't show already selected tags
    if (selectedTags.some(selected => selected.id === tag.id)) {
      return false;
    }
    
    // Hide NSFW tag for Guest Pass users
    if (userPlan === 'Guest Pass' && tag.name.toLowerCase() === 'nsfw') {
      return false;
    }
    
    return true;
  });
  
  console.log('PersonalityStep render - allTags:', allTags.length, 'selectedTags:', selectedTags.length, 'availableTags:', availableTags.length);

  return (
    <div className="flex-1 overflow-auto bg-[#121212]">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">
            Craft Their Soul
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Define what makes your character unique. Their personality will shape every conversation.
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Description Text Area */}
          <div className="space-y-4">
            <Label htmlFor="core-personality" className="text-white text-lg md:text-xl font-medium block">
              Description *
            </Label>
            <div className="relative">
              <Textarea
                id="core-personality"
                placeholder="Describe the physical and mental details of your character. What do they look like? How do they think and behave? What are their motivations, fears, and quirks?"
                value={corePersonality}
                onChange={(e) => setCorePersonality(e.target.value)}
                rows={6}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-sm md:text-base leading-relaxed p-4 md:p-6"
              />
              <div className={`absolute bottom-3 md:bottom-4 right-3 md:right-4 text-xs md:text-sm font-medium ${
                corePersonality.length >= 50 ? 'text-green-500' : 'text-red-500'
              }`}>
                {corePersonality.length}/50
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500">
              Describe the physical and mental details of your character
            </p>
          </div>

          {/* Quick Tags System */}
          <div className="space-y-4">
            <Label className="text-white text-lg md:text-xl font-medium block">
              Quick Tags
            </Label>
            <p className="text-gray-400 text-sm md:text-base mb-4">
              Add personality tags for quick reference. These help define key traits at a glance.
            </p>
            
            {/* Tag Dropdown */}
            <div className="space-y-4">
              <Select onValueChange={handleAddTag} disabled={isLoading}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white rounded-lg h-10 md:h-11">
                  <SelectValue placeholder={isLoading ? 'Loading tags...' : `Select a tag to add... (${availableTags.length} available)`} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-50">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <SelectItem 
                        key={tag.id} 
                        value={tag.id.toString()}
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
                      className="bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium hover:bg-[#FF7A00]/30 transition-colors"
                    >
                      {tag.name}
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="ml-1.5 md:ml-2 hover:bg-[#FF7A00]/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
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
              <div className="flex items-center gap-2 text-white text-lg md:text-xl font-medium hover:text-[#FF7A00] transition-colors">
                {isAdvancedOpen ? (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                )}
                Advanced
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 md:space-y-6 mt-4">
              {/* Personality Summary */}
              <div className="space-y-4">
                <Label htmlFor="knowledge-base" className="text-white text-base md:text-lg font-medium block">
                  Personality summary
                </Label>
                <Textarea
                  id="knowledge-base"
                  placeholder="A short summary of the personality"
                  value={knowledgeBase}
                  onChange={(e) => setKnowledgeBase(e.target.value)}
                  rows={4}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-sm md:text-base leading-relaxed p-3 md:p-4"
                />
                <p className="text-xs md:text-sm text-gray-500">
                  A short summary of the personality.
                </p>
              </div>

              {/* Scenario */}
              <div className="space-y-4">
                <Label htmlFor="scenario-definition" className="text-white text-base md:text-lg font-medium block">
                  Scenario
                </Label>
                <Textarea
                  id="scenario-definition"
                  placeholder="Share context of the scenario or the interaction taking place in the chat"
                  value={scenarioDefinition}
                  onChange={(e) => setScenarioDefinition(e.target.value)}
                  rows={4}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none text-sm md:text-base leading-relaxed p-3 md:p-4"
                />
                <p className="text-xs md:text-sm text-gray-500">
                  Share context of the scenario or the interaction taking place in the chat.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Helpful Examples */}
          <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/50">
            <h4 className="text-white font-medium mb-3 text-sm md:text-base">💡 Examples to inspire you:</h4>
            <div className="grid grid-cols-1 gap-3 md:gap-4 text-xs md:text-sm text-gray-300">
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
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-8 md:mt-12 pt-4 md:pt-6 border-t border-gray-700/50">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-sm md:text-base order-2 sm:order-1"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            <span className="hidden sm:inline">Next: Dialogue →</span>
            <span className="sm:hidden">Next →</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityStep;