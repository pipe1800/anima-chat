import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Eye,
  Calendar,
  User,
  Star,
  ArrowLeft,
  Loader2,
  BookOpen,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPublicWorldInfoDetails } from '@/lib/world-info-operations';
import { useToast } from '@/hooks/use-toast';

interface WorldInfoData {
  id: string;
  name: string;
  short_description: string | null;
  avatar_url: string | null;
  interaction_count: number;
  created_at: string;
  creator_id: string;
  visibility: string;
  entries: Array<{
    id: string;
    keywords: string[];
    entry_text: string;
    created_at: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
  creator: {
    username: string;
    avatar_url: string | null;
  } | null;
  isLiked: boolean;
  isFavorited: boolean;
  likesCount: number;
  favoritesCount: number;
}

export default function PublicWorldInfoProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [worldInfo, setWorldInfo] = useState<WorldInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const fetchWorldInfoData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getPublicWorldInfoDetails(id);
        setWorldInfo(data as unknown as WorldInfoData);
      } catch (err) {
        console.error('Error fetching world info:', err);
        setError('Failed to load world info');
      } finally {
        setLoading(false);
      }
    };

    fetchWorldInfoData();
  }, [id]);

  const handleLike = async () => {
    if (!worldInfo || isLiking) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like this world info",
        variant: "destructive"
      });
      return;
    }

    setIsLiking(true);
    try {
      if (worldInfo.isLiked) {
        // Remove like
        const { error } = await supabase
          .from('world_info_likes')
          .delete()
          .eq('world_info_id', worldInfo.id)
          .eq('user_id', user.user.id);

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isLiked: false,
          likesCount: prev.likesCount - 1
        } : null);
      } else {
        // Add like
        const { error } = await supabase
          .from('world_info_likes')
          .insert({
            world_info_id: worldInfo.id,
            user_id: user.user.id
          });

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isLiked: true,
          likesCount: prev.likesCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    if (!worldInfo || isFavoriting) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to favorite this world info",
        variant: "destructive"
      });
      return;
    }

    setIsFavoriting(true);
    try {
      if (worldInfo.isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('world_info_favorites')
          .delete()
          .eq('world_info_id', worldInfo.id)
          .eq('user_id', user.user.id);

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isFavorited: false,
          favoritesCount: prev.favoritesCount - 1
        } : null);
      } else {
        // Add favorite
        const { error } = await supabase
          .from('world_info_favorites')
          .insert({
            world_info_id: worldInfo.id,
            user_id: user.user.id
          });

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isFavorited: true,
          favoritesCount: prev.favoritesCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    } finally {
      setIsFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !worldInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">World Info Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The world info you are looking for does not exist or is not public.'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* World Info Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={worldInfo.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {worldInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{worldInfo.name}</h1>
                    {worldInfo.short_description && (
                      <p className="text-muted-foreground mb-4">
                        {worldInfo.short_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(worldInfo.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {worldInfo.interaction_count} views
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleLike}
                    variant={worldInfo.isLiked ? "default" : "outline"}
                    size="sm"
                    disabled={isLiking}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${worldInfo.isLiked ? 'fill-current' : ''}`} />
                    {worldInfo.likesCount} Likes
                  </Button>
                  <Button
                    onClick={handleFavorite}
                    variant={worldInfo.isFavorited ? "default" : "outline"}
                    size="sm"
                    disabled={isFavoriting}
                  >
                    <Star className={`mr-2 h-4 w-4 ${worldInfo.isFavorited ? 'fill-current' : ''}`} />
                    {worldInfo.favoritesCount} Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {worldInfo.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {worldInfo.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lorebook Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lorebook Entries ({worldInfo.entries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {worldInfo.entries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No lorebook entries found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {worldInfo.entries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{entry.entry_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={worldInfo.creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      {worldInfo.creator?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{worldInfo.creator?.username || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}