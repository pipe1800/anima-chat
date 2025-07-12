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
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/discover')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Character Hero Section */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl border border-border overflow-hidden">
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
                {/* Avatar */}
                <div className="flex justify-center lg:justify-start">
                  <Avatar className="w-32 h-32 ring-4 ring-primary/50">
                    <AvatarImage src={character.avatar_url || "/placeholder.svg"} alt={character.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-4xl">
                      {character.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Character Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-foreground mb-2">{character.name}</h1>
                  
                  {character.short_description && (
                    <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                      {character.short_description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{character.actual_chat_count?.toLocaleString() || 0}</span>
                      <span className="text-sm">conversations</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-primary'}`} />
                      <span className="font-semibold">{character.likes_count?.toLocaleString() || 0}</span>
                      <span className="text-sm">likes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm">Created {new Date(character.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created by</span>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-primary font-medium">@{character.creator?.username || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      onClick={handleStartChat}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-8 py-3"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Start Conversation
                    </Button>
                    <Button
                      onClick={handleLike}
                      variant="outline"
                      className={`border-primary/50 hover:border-primary px-8 py-3 ${
                        isLiked 
                          ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                          : 'text-primary hover:bg-primary/10 bg-transparent'
                      }`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Character Details Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Foundation Section */}
              <CharacterFoundationSection character={character} />

              {/* Personality Section */}
              <CharacterPersonalitySection 
                character={character}
                tags={character.tags || []}
              />

              {/* Dialogue Section */}
              <CharacterDialogueSection 
                character={character}
                exampleDialogues={[]} // TODO: Add example dialogues to character data
              />

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <CharacterStatsSection character={character} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}