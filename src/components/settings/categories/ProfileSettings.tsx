
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export const ProfileSettings = () => {
  // Mock current user data - in a real app, this would come from your auth/user context
  const [originalData] = useState({
    avatar: '',
    username: 'john_doe',
    bio: 'AI enthusiast and character creator. Love exploring new worlds through conversation.'
  });

  const [formData, setFormData] = useState({
    avatar: originalData.avatar,
    username: originalData.username,
    bio: originalData.bio
  });

  const [isUploading, setIsUploading] = useState(false);

  // Check if any changes have been made
  const hasChanges = 
    formData.avatar !== originalData.avatar ||
    formData.username !== originalData.username ||
    formData.bio !== originalData.bio;

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Create a preview URL for the uploaded image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      username: event.target.value
    }));
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= 150) {
      setFormData(prev => ({
        ...prev,
        bio: value
      }));
    }
  };

  const handleSaveChanges = () => {
    // Here you would implement the actual save logic
    // For now, we'll just log the changes
    console.log('Saving profile changes:', formData);
    // You could show a toast notification here
  };

  const getUserInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Edit Your Public Profile</h2>
        <p className="text-gray-300">Update your profile information that others will see</p>
      </div>

      <div className="space-y-8">
        {/* Avatar Upload Section */}
        <div>
          <Label className="text-gray-300 text-lg font-semibold block mb-4">Profile Picture</Label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={formData.avatar || '/placeholder.svg'} 
                  alt="Profile avatar" 
                />
                <AvatarFallback className="bg-gray-700 text-white text-xl">
                  {getUserInitials(formData.username)}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <label htmlFor="avatar-upload">
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-800 cursor-pointer"
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Upload New Avatar
                  </span>
                </Button>
              </label>
              <p className="text-sm text-gray-400 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Username Field */}
        <div>
          <Label htmlFor="username" className="text-gray-300 text-lg font-semibold">
            Username
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
            className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
          />
          <p className="text-sm text-gray-400 mt-1">
            This is how other users will see you on the platform.
          </p>
        </div>

        {/* Bio Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="bio" className="text-gray-300 text-lg font-semibold">
              Bio
            </Label>
            <span className="text-sm text-gray-400">
              {formData.bio.length}/150 characters
            </span>
          </div>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={handleBioChange}
            placeholder="Tell others about yourself..."
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#FF7A00] focus:ring-[#FF7A00] resize-none"
            rows={4}
          />
          <p className="text-sm text-gray-400 mt-1">
            Write a short bio to help others understand your interests.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`
              px-6 py-2 font-medium transition-all
              ${hasChanges 
                ? 'bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700'
              }
            `}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
