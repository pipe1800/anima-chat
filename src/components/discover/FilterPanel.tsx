
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
}

export function FilterPanel({ isOpen, onClose, filterBy, setFilterBy }: FilterPanelProps) {
  const handleReset = () => {
    setFilterBy('all');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] bg-[#0f1419] border-l border-[#FF7A00]/30 text-white">
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

        <div className="space-y-6">
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

        {/* Action Buttons */}
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Filters
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
