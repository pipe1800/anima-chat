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
import { RelatedCharactersCarousel } from '@/components/character-profile/RelatedCharactersCarousel';
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
        <div className="relative h-[40vh] overflow-hidden m-3 rounded-lg">
          <img 
            src={character.avatar_url || "/placeholder.svg"} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Back Button - Mobile */}
          <div className="absolute top-2 left-2">
            <Button
              onClick={() => navigate('/discover')}
              variant="ghost"
              size="icon"
              className="bg-black/40 text-white hover:bg-black/60 w-8 h-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Character Name Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h1 className="text-2xl font-bold text-white mb-1">
              {character.name}
            </h1>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-3 py-2 bg-background border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {(character.actual_chat_count || 0) >= 1000 
                    ? `${((character.actual_chat_count || 0) / 1000).toFixed(1)}K` 
                    : character.actual_chat_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                <span className="text-lg font-bold text-foreground">
                  {(character.likes_count || 0) >= 1000 
                    ? `${((character.likes_count || 0) / 1000).toFixed(1)}K` 
                    : character.likes_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="px-3 py-2 bg-background border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-muted-foreground">Creator</div>
                <div className="text-sm font-semibold text-foreground">@{character.creator?.username || 'Unknown'}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 text-xs"
              >
                Follow
              </Button>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Published At</div>
                <div className="text-xs font-medium text-foreground">
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
        <div className="px-3 py-3">
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {character.short_description || character.character_definitions?.description || "No description available"}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {character.tags?.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="bg-secondary/50 text-secondary-foreground border border-border text-xs px-2 py-1"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleStartChat}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Conversation
            </Button>
            <Button
              onClick={handleLike}
              variant="outline"
              className={`w-full py-2 text-sm ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                  : 'text-foreground hover:bg-secondary border-border'
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Side - Character Image */}
        <div className="relative w-1/2 overflow-hidden p-4">
          <div className="relative h-full overflow-hidden rounded-lg">
            <img 
              src={character.avatar_url || "/placeholder.svg"} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
            
            {/* Like Button Overlay */}
            <div className="absolute bottom-4 left-4">
              <Button
                onClick={handleLike}
                variant="ghost"
                size="icon"
                className={`w-10 h-10 rounded-full ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Back Button */}
            <div className="absolute top-4 left-4">
              <Button
                onClick={() => navigate('/discover')}
                variant="ghost"
                size="sm"
                className="bg-black/40 text-white hover:bg-black/60 text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Discover
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Character Info */}
        <div className="w-1/2 flex flex-col">
          {/* Header Section */}
          <div className="p-4 pb-3">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {character.name}
            </h1>
            
            {/* Stats Row */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-1 bg-secondary/50 px-2 py-1 rounded-full">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {(character.actual_chat_count || 0) >= 1000 
                    ? `${((character.actual_chat_count || 0) / 1000).toFixed(1)}K` 
                    : character.actual_chat_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-secondary/50 px-2 py-1 rounded-full">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {(character.likes_count || 0) >= 1000 
                    ? `${((character.likes_count || 0) / 1000).toFixed(1)}K` 
                    : character.likes_count || 0}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">11</span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs text-muted-foreground">Creator</div>
                  <div className="text-sm font-semibold text-foreground">@{character.creator?.username || 'Unknown'}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-2 bg-primary text-primary-foreground border-primary hover:bg-primary/90 text-xs"
                >
                  Follow
                </Button>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Published At</div>
                <div className="text-xs font-medium text-foreground mb-1">
                  {new Date(character.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-xs text-muted-foreground">Last Updated</div>
                <div className="text-xs font-medium text-foreground">
                  a year ago
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 flex-1">
            <p className="text-foreground leading-relaxed mb-4 text-sm">
              {character.short_description || character.character_definitions?.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {character.tags?.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="bg-secondary/80 text-secondary-foreground px-3 py-1 text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 pt-0">
            <div className="flex space-x-2">
              <Button
                onClick={handleStartChat}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 text-sm"
              >
                Start New Chat ✨
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-2 text-sm border-border hover:bg-secondary"
              >
                Generate Pictures ✨
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Characters Carousel */}
      <div className="px-3 md:px-6 py-4 border-t border-border">
        <h2 className="text-lg font-bold text-foreground mb-3">More like this</h2>
        <RelatedCharactersCarousel currentCharacterId={character.id} tags={character.tags || []} />
      </div>
    </div>
  );
}