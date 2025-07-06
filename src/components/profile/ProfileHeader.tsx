
import React, { useState } from 'react';
import { Camera, Edit3, Plus, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProfileHeader = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative">
      {/* Header Banner */}
      <div className="h-64 bg-gradient-to-r from-[#FF7A00]/20 via-[#FF7A00]/10 to-transparent relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,122,0,0.1)_25%,rgba(255,122,0,0.1)_50%,transparent_50%,transparent_75%,rgba(255,122,0,0.1)_75%)] bg-[length:20px_20px]"></div>
        
        {/* Edit Banner Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-black/20"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Camera className="h-4 w-4 mr-2" />
          Edit Banner
        </Button>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-8 pb-8">
        <div className="flex items-start space-x-6">
          {/* Avatar - positioned to overlap banner */}
          <div className="relative -mt-16 flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 p-1">
              <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-4xl font-bold text-[#FF7A00]">
                JD
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-[#FF7A00] hover:bg-[#FF7A00]/80"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* User Information */}
          <div className="flex-1 pt-4">
            {/* Username */}
            <h1 className="text-3xl font-bold text-white mb-4">@johndoe</h1>
            
            {/* Stats Row */}
            <div className="flex items-center space-x-8 mb-4">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-[#FF7A00]" />
                <span className="text-white font-medium">12</span>
                <span className="text-muted-foreground text-sm">Creations</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#FF7A00]" />
                <span className="text-white font-medium">1.2K</span>
                <span className="text-muted-foreground text-sm">Followers</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-[#FF7A00]" />
                <span className="text-white font-medium">2.3K</span>
                <span className="text-muted-foreground text-sm">Total Chats</span>
              </div>
            </div>
            
            {/* Bio */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
              Character Creator & Storyteller passionate about bringing unique personalities to life. 
              Specializing in fantasy and sci-fi characters with deep backstories and engaging dialogue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
