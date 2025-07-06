
import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DiscoverControlBar } from './DiscoverControlBar';
import { CharacterGrid } from './CharacterGrid';

export function DiscoverContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
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

      {/* Character Grid */}
      <CharacterGrid
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
      />
    </div>
  );
}
