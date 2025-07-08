import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DiscoverControlBar } from '@/components/discover/DiscoverControlBar';
import { CharacterGrid } from '@/components/discover/CharacterGrid';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const PublicDiscover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterBy, setFilterBy] = useState('all');
  const [activeFilters, setActiveFilters] = useState<Array<{
    id: string;
    label: string;
    type: string;
  }>>([]);

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
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/45d0ba23-cfa2-404a-8527-54e83cb321ef.png" 
                alt="Anima AI Chat" 
                className="h-12 w-auto"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-[#FF7A00] hover:bg-[#FF7A00]/10"
                >
                  Home
                </Button>
              </Link>
              <Link to="/characters">
                <Button 
                  variant="ghost" 
                  className="text-[#FF7A00] hover:text-white hover:bg-[#FF7A00]/10 font-medium"
                >
                  Characters
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button 
                  className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-medium transition-colors"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="bg-[#1a1a2e] border-b border-gray-700/50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-white text-2xl font-bold">Character Discovery</h1>
                  <p className="text-gray-400 text-sm">Explore the neural network of legends</p>
                </div>
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

        {/* Character Grid */}
        <CharacterGrid 
          searchQuery={searchQuery} 
          sortBy={sortBy} 
          filterBy={filterBy} 
        />
      </div>
    </div>
  );
};

export default PublicDiscover;