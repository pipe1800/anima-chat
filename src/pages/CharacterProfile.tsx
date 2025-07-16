import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart,
  ArrowLeft,
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { useCharacterProfile, useCharacterLikeStatus, useToggleCharacterLike } from '@/hooks/useCharacterProfile';
import { CharacterFoundationSection } from '@/components/character-profile/CharacterFoundationSection';
import { CharacterPersonalitySection } from '@/components/character-profile/CharacterPersonalitySection';
import { CharacterDialogueSection } from '@/components/character-profile/CharacterDialogueSection';

import { CharacterStatsSection } from '@/components/character-profile/CharacterStatsSection';
import { supabase } from '@/integrations/supabase/client';

export default function CharacterProfile() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  
  // Use React Query hooks for optimized data fetching
  const { 
    data: character, 
    isLoading: loading, 
    error: characterError 
  } = useCharacterProfile(characterId);
  
  const { 
    data: isLiked = false 
  } = useCharacterLikeStatus(characterId);
  
  const toggleLikeMutation = useToggleCharacterLike();

  const error = characterError?.message || null;

  const handleStartChat = () => {
    if (character) {
      navigate('/chat', { state: { selectedCharacter: character } });
    }
  };

  const handleLike = async () => {
    if (!character) return;

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    // Use the optimized mutation
    toggleLikeMutation.mutate({
      characterId: character.id,
      isLiked: isLiked
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-foreground">Loading character...</span>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">{error}</div>
          <Button onClick={() => navigate('/discover')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Hero Image Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src={character.avatar_url || "/placeholder.svg"} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Back Button - Mobile */}
          <div className="absolute top-4 left-4">
            <Button
              onClick={() => navigate('/discover')}
              variant="ghost"
              size="icon"
              className="bg-black/40 text-white hover:bg-black/60"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Character Name Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              {character.name}
            </h1>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-4 bg-background border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">
                  {(character.actual_chat_count || 0) >= 1000 
                    ? `${((character.actual_chat_count || 0) / 1000).toFixed(1)}K` 
                    : character.actual_chat_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                <span className="text-2xl font-bold text-foreground">
                  {(character.likes_count || 0) >= 1000 
                    ? `${((character.likes_count || 0) / 1000).toFixed(1)}K` 
                    : character.likes_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="px-6 py-4 bg-background border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-muted-foreground">Creator</div>
                <div className="font-semibold text-foreground">@{character.creator?.username || 'Unknown'}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              >
                Follow
              </Button>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Published At</div>
                <div className="text-sm font-medium text-foreground">
                  {new Date(character.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-6">
          <p className="text-foreground leading-relaxed mb-6">
            {character.short_description || character.character_definitions?.description || "No description available"}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {character.tags?.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="bg-secondary/50 text-secondary-foreground border border-border"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleStartChat}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Conversation
            </Button>
            <Button
              onClick={handleLike}
              variant="outline"
              className={`w-full py-4 text-lg ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                  : 'text-foreground hover:bg-secondary border-border'
              }`}
            >
              <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Side - Character Image */}
        <div className="relative w-1/2 overflow-hidden">
          <img 
            src={character.avatar_url || "/placeholder.svg"} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
          
          {/* Like Button Overlay */}
          <div className="absolute bottom-6 left-6">
            <Button
              onClick={handleLike}
              variant="ghost"
              size="icon"
              className={`w-16 h-16 rounded-full ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <Button
              onClick={() => navigate('/discover')}
              variant="ghost"
              className="bg-black/40 text-white hover:bg-black/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
          </div>
        </div>

        {/* Right Side - Character Info */}
        <div className="w-1/2 flex flex-col">
          {/* Header Section */}
          <div className="p-8 pb-6">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              {character.name}
            </h1>
            
            {/* Stats Row */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-full">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">
                  {(character.actual_chat_count || 0) >= 1000 
                    ? `${((character.actual_chat_count || 0) / 1000).toFixed(1)}K` 
                    : character.actual_chat_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-full">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">
                  {(character.likes_count || 0) >= 1000 
                    ? `${((character.likes_count || 0) / 1000).toFixed(1)}K` 
                    : character.likes_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-full">
                <Heart className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">11</span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm text-muted-foreground">Creator</div>
                  <div className="font-semibold text-foreground">@{character.creator?.username || 'Unknown'}</div>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-4 bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                >
                  Follow
                </Button>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Published At</div>
                <div className="text-sm font-medium text-foreground mb-2">
                  {new Date(character.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="text-sm font-medium text-foreground">
                  a year ago
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-8 flex-1">
            <p className="text-foreground leading-relaxed mb-8 text-lg">
              {character.short_description || character.character_definitions?.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-12">
              {character.tags?.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="bg-secondary/80 text-secondary-foreground px-4 py-2 text-sm"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 pt-0">
            <div className="flex space-x-4">
              <Button
                onClick={handleStartChat}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 text-lg"
              >
                Start New Chat ✨
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-4 text-lg border-border hover:bg-secondary"
              >
                Generate Pictures ✨
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}