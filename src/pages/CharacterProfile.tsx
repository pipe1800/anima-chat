import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart,
  Eye,
  Calendar,
  User,
  Star,
  ArrowLeft,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CharacterData {
  id: string;
  name: string;
  short_description: string | null;
  avatar_url: string | null;
  interaction_count: number;
  created_at: string;
  creator_id: string;
  visibility: string;
  character_definitions?: {
    definition: string;
    long_description: string | null;
    greeting: string | null;
  };
  creator?: {
    username: string;
    avatar_url: string | null;
  };
  actual_chat_count?: number;
  likes_count?: number;
}

export default function CharacterProfile() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!characterId) {
        setError('Character ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch character with definitions
        const { data: characterData, error: characterError } = await supabase
          .from('characters')
          .select(`
            *,
            character_definitions(*)
          `)
          .eq('id', characterId)
          .eq('visibility', 'public')
          .single();

        if (characterError) {
          console.error('Error fetching character:', characterError);
          setError('Character not found or not public');
          setLoading(false);
          return;
        }

        // Fetch creator profile separately
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', characterData.creator_id)
          .single();

        // Get chat count
        const { count: chatCount } = await supabase
          .from('chats')
          .select('*', { count: 'exact' })
          .eq('character_id', characterId);

        // Get likes count
        const { count: likesCount } = await supabase
          .from('character_likes')
          .select('*', { count: 'exact' })
          .eq('character_id', characterId);

        // Check if current user has liked this character
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userLike } = await supabase
            .from('character_likes')
            .select('id')
            .eq('character_id', characterId)
            .eq('user_id', user.id)
            .single();
          
          setIsLiked(!!userLike);
        }

        setCharacter({
          ...characterData,
          creator: creatorProfile || { username: 'Unknown', avatar_url: null },
          actual_chat_count: chatCount || 0,
          likes_count: likesCount || 0
        });

      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load character');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterData();
  }, [characterId]);

  const handleStartChat = () => {
    if (character) {
      navigate('/chat', { state: { selectedCharacter: character } });
    }
  };

  const handleLike = async () => {
    if (!character) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('character_likes')
          .delete()
          .eq('character_id', character.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setCharacter(prev => prev ? {
          ...prev,
          likes_count: Math.max(0, (prev.likes_count || 0) - 1)
        } : null);
      } else {
        // Add like
        await supabase
          .from('character_likes')
          .insert([{ character_id: character.id, user_id: user.id }]);
        
        setIsLiked(true);
        setCharacter(prev => prev ? {
          ...prev,
          likes_count: (prev.likes_count || 0) + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#121212]">
          <AppSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <header className="h-16 border-b border-gray-700/50 bg-[#1b1b1b] flex items-center px-6">
              <SidebarTrigger className="text-gray-400 hover:text-white" />
            </header>
            <main className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
                <span className="text-white">Loading character...</span>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !character) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#121212]">
          <AppSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <header className="h-16 border-b border-gray-700/50 bg-[#1b1b1b] flex items-center px-6">
              <SidebarTrigger className="text-gray-400 hover:text-white" />
            </header>
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-400 text-lg mb-2">{error}</div>
                <Button onClick={() => navigate('/discover')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Discover
                </Button>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col ml-64">{/* Added ml-64 to account for sidebar width */}
          {/* Header */}
          <header className="h-16 border-b border-gray-700/50 bg-[#1b1b1b] flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-gray-400 hover:text-white" />
              <Button
                onClick={() => navigate('/discover')}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discover
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-8 space-y-8">
              {/* Character Hero Section */}
              <Card className="bg-[#1a1a2e] border-gray-700/50 overflow-hidden">
                <div className="relative">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 via-[#FF7A00]/10 to-transparent" />
                  
                  <CardContent className="relative p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
                      {/* Avatar */}
                      <div className="flex justify-center lg:justify-start">
                        <Avatar className="w-32 h-32 ring-4 ring-[#FF7A00]/50">
                          <AvatarImage src={character.avatar_url || "/placeholder.svg"} alt={character.name} />
                          <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 text-white font-bold text-4xl">
                            {character.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Character Info */}
                      <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-4xl font-bold text-white mb-2">{character.name}</h1>
                        
                        {character.short_description && (
                          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                            {character.short_description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <MessageCircle className="w-5 h-5 text-[#FF7A00]" />
                            <span className="font-semibold">{character.actual_chat_count?.toLocaleString() || 0}</span>
                            <span className="text-sm">conversations</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-[#FF7A00]'}`} />
                            <span className="font-semibold">{character.likes_count?.toLocaleString() || 0}</span>
                            <span className="text-sm">likes</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Calendar className="w-5 h-5 text-[#FF7A00]" />
                            <span className="text-sm">Created {new Date(character.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Creator */}
                        <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Created by</span>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-[#FF7A00] text-white text-xs">
                                {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[#FF7A00] font-medium">@{character.creator?.username || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <Button
                            onClick={handleStartChat}
                            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white font-bold px-8 py-3"
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Start Conversation
                          </Button>
                          <Button
                            onClick={handleLike}
                            variant="outline"
                            className={`border-[#FF7A00]/50 hover:border-[#FF7A00] px-8 py-3 ${
                              isLiked 
                                ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                                : 'text-[#FF7A00] hover:bg-[#FF7A00]/10 bg-transparent'
                            }`}
                          >
                            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                            {isLiked ? 'Liked' : 'Like'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Character Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Greeting */}
                  {character.character_definitions?.greeting && (
                    <Card className="bg-[#1a1a2e] border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-[#FF7A00]" />
                          Character Greeting
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed italic">
                          "{character.character_definitions.greeting}"
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Long Description */}
                  {character.character_definitions?.long_description && (
                    <Card className="bg-[#1a1a2e] border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-[#FF7A00]" />
                          Character Background
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {character.character_definitions.long_description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Character Definition */}
                  {character.character_definitions?.definition && (
                    <Card className="bg-[#1a1a2e] border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Star className="w-5 h-5 mr-2 text-[#FF7A00]" />
                          Character Personality
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {character.character_definitions.definition}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card className="bg-[#1a1a2e] border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-[#FF7A00]" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Conversations</span>
                        <Badge variant="secondary" className="bg-[#FF7A00]/20 text-[#FF7A00]">
                          {character.actual_chat_count?.toLocaleString() || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Likes</span>
                        <Badge variant="secondary" className="bg-[#FF7A00]/20 text-[#FF7A00]">
                          {character.likes_count?.toLocaleString() || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Visibility</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Public
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Created</span>
                        <span className="text-gray-300 text-sm">
                          {new Date(character.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Creator Info */}
                  <Card className="bg-[#1a1a2e] border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-[#FF7A00]" />
                        Creator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={character.creator?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-[#FF7A00] text-white">
                            {character.creator?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">@{character.creator?.username || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">Character Creator</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}