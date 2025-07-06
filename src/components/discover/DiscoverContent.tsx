
import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DiscoverControlBar } from './DiscoverControlBar';
import { CharacterGrid } from './CharacterGrid';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export function DiscoverContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [activeFilters, setActiveFilters] = useState<Array<{id: string, label: string, type: string}>>([]);

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
    <div className="min-h-screen bg-[#121212]">
      {/* Header with single sidebar trigger */}
      <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div>
              <h1 className="text-white text-2xl font-bold">Character Discovery</h1>
              <p className="text-gray-400 text-sm">Explore the neural network of legends</p>
            </div>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <DiscoverControlBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
      />

      {/* Main Headline Section */}
      <div className="px-6 py-8 text-center">
        <h1 className="text-white text-4xl font-bold mb-3">Explore the Multiverse</h1>
        <p className="text-gray-400 text-lg">Find your next obsession. Thousands of AI companions are waiting.</p>
      </div>

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
            {activeFilters.map((filter) => (
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

      {/* Character Grid */}
      <CharacterGrid
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
      />
    </div>
  );
}
