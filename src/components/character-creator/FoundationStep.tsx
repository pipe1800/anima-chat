import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, User, Sparkles, Loader2 } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { uploadAvatar } from '@/lib/avatar-upload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FoundationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onFileChange?: (file: File) => Promise<void>;
  isParsingCard?: boolean;
}

const FoundationStep = ({ data, onUpdate, onNext, onFileChange, isParsingCard = false }: FoundationStepProps) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    avatar: data.avatar || '',
    title: data.title || '',
    description: data.description || ''
  });

  // Update form data when character data is loaded
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        avatar: data.avatar || '',
        title: data.title || '',
        description: data.description || ''
      });
    }
  }, [data]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create temporary URL for cropping
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setIsUploading(true);
      setShowCropper(false);
      
      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const avatarUrl = await uploadAvatar(file, user!.id);
      
      if (avatarUrl) {
        handleInputChange('avatar', avatarUrl);
        toast({
          title: "Upload Successful",
          description: "Avatar uploaded and cropped successfully!",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      cleanupTempImage();
      resetFileInput();
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    cleanupTempImage();
    resetFileInput();
  };

  const cleanupTempImage = () => {
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl('');
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    onUpdate(formData);
    onNext();
  };

  const isValid = formData.name.trim() && formData.description.trim();

  return (
    <div className="flex-1 overflow-auto bg-[#121212]">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[calc(100vh-200px)]">
          
          {/* Left Column - Avatar Upload */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Avatar</h2>
              <p className="text-gray-400">Give your character a face</p>
            </div>

            {/* Large Avatar Display */}
            <div className="relative group">
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-4 border-[#FF7A00]/30 bg-gradient-to-br from-[#FF7A00]/20 to-transparent backdrop-blur-sm flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Character Avatar" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#FF7A00]/60">
                    <User className="w-16 h-16 mb-2 animate-pulse" />
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/20 animate-ping absolute" style={{ animationDuration: '3s' }} />
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00]/40 animate-ping absolute" style={{ animationDelay: '1.5s', animationDuration: '3s' }} />
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 rounded-full border-2 border-[#FF7A00]/50 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Buttons */}
            <div className="flex flex-col space-y-3 w-full max-w-xs">
              <Button 
                className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {isUploading ? 'Processing...' : 'Upload & Crop Image'}
              </Button>
              
              {/* PNG Character Card Upload */}
              <div className="w-full max-w-xs">
                <Label htmlFor="character-card" className="text-gray-300 text-sm mb-2 block">
                  Upload PNG Character Card
                </Label>
                <Input
                  id="character-card"
                  type="file"
                  accept=".png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onFileChange) {
                      onFileChange(file);
                    }
                  }}
                  disabled={isParsingCard}
                  className="bg-gray-800/50 border-gray-600 text-white file:bg-[#FF7A00] file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-[#FF7A00]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isParsingCard && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Parsing character card...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Core Details */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Core Details</h2>
              <p className="text-gray-400">Define your character's identity</p>
            </div>

            {/* Character Name */}
            <div className="space-y-2">
              <Label htmlFor="character-name" className="text-white font-medium">
                Name *
              </Label>
              <Input
                id="character-name"
                placeholder="Character's Handle"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg h-12 text-lg font-medium"
              />
            </div>

            {/* Title/Tagline */}
            <div className="space-y-2">
              <Label htmlFor="character-title" className="text-white font-medium">
                Title/Tagline
              </Label>
              <Input
                id="character-title"
                placeholder="e.g., Rogue Netrunner with a heart of gold"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg h-11"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="character-description" className="text-white font-medium">
                  Short Description *
                </Label>
                <span className="text-xs text-gray-400">
                  {formData.description.length}/150
                </span>
              </div>
              <Textarea
                id="character-description"
                placeholder="A brief summary of your character for the discovery page."
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 150) {
                    handleInputChange('description', e.target.value);
                  }
                }}
                rows={4}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500">
                This is what other users will see at a glance in the discovery page.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Bottom Right */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-700/50">
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Personality →
          </Button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageUrl={tempImageUrl}
          isOpen={showCropper}
          onClose={handleCropCancel}
          onCrop={handleCropComplete}
        />
      )}
    </div>
  );
};

export default FoundationStep;
