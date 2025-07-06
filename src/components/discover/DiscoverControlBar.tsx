
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Zap
} from 'lucide-react';
import { FilterPanel } from './FilterPanel';

interface DiscoverControlBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
}

export function DiscoverControlBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy
}: DiscoverControlBarProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-[#0f1419] border-b border-[#FF7A00]/30 backdrop-blur-sm">
        <div className="p-6">
          {/* Main Control Row */}
          <div className="flex items-center justify-between space-x-6 mb-4">
            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                placeholder="Search by name, tag, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 bg-[#2a2a2a] border-gray-600/50 text-white placeholder-gray-400 text-lg focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/30 focus:bg-[#2a2a2a] transition-all duration-200"
              />
            </div>

            {/* Controls Group */}
            <div className="flex items-center space-x-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 font-medium text-sm whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-12 bg-[#1a1a2e] border-gray-600/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-gray-600/50 z-50">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="popularity">Popularity (Most Chats)</SelectItem>
                    <SelectItem value="trending">Trending (Recent Activity)</SelectItem>
                    <SelectItem value="liked">Most Liked</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filters Button */}
              <Button
                variant="outline"
                onClick={() => setIsFilterPanelOpen(true)}
                className="h-12 border-[#FF7A00]/50 text-[#FF7A00] hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] bg-transparent px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Quick Actions */}
              <Button className="h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-4">
                <Zap className="w-4 h-4 mr-2" />
                Surprise Me
              </Button>
            </div>
          </div>

          {/* Filter and Sort Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 font-medium text-sm">Category:</span>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[140px] bg-[#1a1a2e] border-gray-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-gray-700/50">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-[#1a1a2e] rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#FF7A00] bg-[#FF7A00]/20 hover:bg-[#FF7A00]/30"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-gray-500 text-sm">Active filters:</span>
            <div className="flex space-x-2">
              {filterBy !== 'all' && (
                <span className="px-3 py-1 bg-[#FF7A00]/20 text-[#FF7A00] rounded-full text-xs font-medium border border-[#FF7A00]/30">
                  {filterBy}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-[#FF7A00]/20 text-[#FF7A00] rounded-full text-xs font-medium border border-[#FF7A00]/30">
                  "{searchQuery}"
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={isFilterPanelOpen} 
        onClose={() => setIsFilterPanelOpen(false)}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
      />
    </>
  );
}
