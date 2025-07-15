import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscoverControlBar } from './DiscoverControlBar';
import { CharacterGrid } from './CharacterGrid';
import { WorldInfoGrid } from './WorldInfoGrid';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
export function DiscoverContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [activeFilters, setActiveFilters] = useState<Array<{
    id: string;
    label: string;
    type: string;
  }>>([]);
  
  // Check URL params for default tab
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') === 'world-infos' ? 'world-infos' : 'characters';
  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(filter => filter.id !== filterId));
    // Reset the corresponding filter state based on type
    const filterToRemove = activeFilters.find(f => f.id === filterId);
    if (filterToRemove?.type === 'category') {
      setFilterBy('all');
    }
  };
  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilterBy('all');
    setSearchQuery('');
  };
  return (
    <div className="min-h-screen bg-[#121212] w-full">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-white text-2xl font-bold">Discovery Hub</h1>
              <p className="text-gray-400 text-sm">Explore characters and world infos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="border-b border-gray-700/50 bg-[#1a1a2e]">
          <div className="px-6 py-2">
            <TabsList className="bg-[#121212] border border-gray-700/50">
              <TabsTrigger 
                value="characters" 
                className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white text-gray-400"
              >
                Characters
              </TabsTrigger>
              <TabsTrigger 
                value="world-infos" 
                className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white text-gray-400"
              >
                World Infos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Control Bar */}
        <DiscoverControlBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
          filterBy={filterBy} 
          setFilterBy={setFilterBy} 
        />

        {/* Active Filter Pills */}
        {activeFilters.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-medium">Active Filters:</h3>
              <button 
                onClick={clearAllFilters} 
                className="text-gray-400 hover:text-[#FF7A00] text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <Badge 
                  key={filter.id} 
                  variant="outline" 
                  className="bg-[#FF7A00]/20 border-[#FF7A00]/30 text-[#FF7A00] hover:bg-[#FF7A00]/30 px-3 py-1 flex items-center space-x-2"
                >
                  <span>{filter.label}</span>
                  <button 
                    onClick={() => removeFilter(filter.id)} 
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <TabsContent value="characters" className="mt-0">
          <CharacterGrid 
            searchQuery={searchQuery} 
            sortBy={sortBy} 
            filterBy={filterBy} 
          />
        </TabsContent>

        <TabsContent value="world-infos" className="mt-0">
          <WorldInfoGrid 
            searchQuery={searchQuery} 
            sortBy={sortBy} 
            filterBy={filterBy} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}