
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, RotateCcw, Search } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
}

// Popular tags data
const popularTags = [
  'Fantasy', 'Sci-Fi', 'Anime', 'Romance', 'Adventure', 'Mystery', 
  'Historical', 'Modern', 'Magic', 'Space', 'Medieval', 'Cyberpunk',
  'Vampire', 'Dragon', 'Ninja', 'Princess', 'Warrior', 'Demon',
  'Angel', 'Robot', 'Alien', 'Witch', 'Knight', 'Pirate'
];

export function FilterPanel({ isOpen, onClose, filterBy, setFilterBy }: FilterPanelProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const handleReset = () => {
    setFilterBy('all');
    setSelectedTags([]);
    setTagSearchQuery('');
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredTags = popularTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] bg-[#0f1419] border-l border-[#FF7A00]/30 text-white overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-white">Advanced Filters</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <SheetDescription className="text-gray-400">
            Refine your search to find the perfect AI companion
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Filter by Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Filter by Tags</h3>
            
            {/* Tag Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tags..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a2e] border-gray-700/50 text-white placeholder-gray-400 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/30"
              />
            </div>

            {/* Tag Pills Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 text-left ${
                    selectedTags.includes(tag)
                      ? 'bg-[#FF7A00] text-white shadow-lg shadow-[#FF7A00]/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Selected tags ({selectedTags.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#FF7A00]/20 text-[#FF7A00] text-xs rounded-full border border-[#FF7A00]/30 flex items-center gap-1"
                    >
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-white" 
                        onClick={() => handleTagToggle(tag)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-gray-700/50" />

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Category</h3>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="bg-[#1a1a2e] border-gray-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700/50">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-gray-700/50" />

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Minimum Rating</h3>
            <Select defaultValue="any">
              <SelectTrigger className="bg-[#1a1a2e] border-gray-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700/50">
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="3.0">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-gray-700/50" />

          {/* Activity Level */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Activity Level</h3>
            <Select defaultValue="any">
              <SelectTrigger className="bg-[#1a1a2e] border-gray-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700/50">
                <SelectItem value="any">Any Activity</SelectItem>
                <SelectItem value="very-active">Very Active (1000+ chats)</SelectItem>
                <SelectItem value="active">Active (500+ chats)</SelectItem>
                <SelectItem value="moderate">Moderate (100+ chats)</SelectItem>
                <SelectItem value="new">New Characters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-gray-700/50" />

          {/* Creator Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Creator Type</h3>
            <Select defaultValue="any">
              <SelectTrigger className="bg-[#1a1a2e] border-gray-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700/50">
                <SelectItem value="any">All Creators</SelectItem>
                <SelectItem value="verified">Verified Creators</SelectItem>
                <SelectItem value="community">Community Creators</SelectItem>
                <SelectItem value="official">Official Characters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0f1419] border-t border-gray-700/50 space-y-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={onClose}
            className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
