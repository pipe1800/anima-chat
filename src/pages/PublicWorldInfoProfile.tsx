import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Heart,
  Eye,
  Calendar,
  User,
  Star,
  ArrowLeft,
  Loader2,
  BookOpen,
  Tag,
  Search,
  Download
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
  isUsed: boolean;
  likesCount: number;
  favoritesCount: number;
}

export default function PublicWorldInfoProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Debug logging for component rendering
  console.log('🔍 Debug: PublicWorldInfoProfile component rendered with ID:', id);
  const [worldInfo, setWorldInfo] = useState<WorldInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isUsingLorebook, setIsUsingLorebook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [similarWorldInfos, setSimilarWorldInfos] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorldInfoData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getPublicWorldInfoDetails(id);
        
        // Debug logging
        console.log('🔍 Debug: Raw data from getPublicWorldInfoDetails:', data);
        console.log('🔍 Debug: Entries array:', data.entries);
        console.log('🔍 Debug: Entries length:', data.entries?.length);
        console.log('🔍 Debug: First entry sample:', data.entries?.[0]);
        
        setWorldInfo(data as unknown as WorldInfoData);
        
        // Fetch similar world infos
        if (data.tags && data.tags.length > 0) {
          const tagIds = data.tags.map(tag => tag.id);
          const { data: similarData } = await supabase
            .from('world_infos')
            .select(`
              id,
              name,
              short_description,
              avatar_url,
              creator:profiles!creator_id(username)
            `)
            .eq('visibility', 'public')
            .neq('id', data.id)
            .in('id', 
              await supabase
                .from('world_info_tags')
                .select('world_info_id')
                .in('tag_id', tagIds)
                .then(({ data }) => data?.map(d => d.world_info_id) || [])
            )
            .limit(6);
          
          setSimilarWorldInfos(similarData || []);
        }
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

  const handleUseLorebook = async () => {
    if (!worldInfo || isUsingLorebook) return;

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this lorebook",
        variant: "destructive"
      });
      return;
    }

    setIsUsingLorebook(true);
    try {
      if (worldInfo.isUsed) {
        // Remove from collection
        const { error } = await supabase
          .from('world_info_users')
          .delete()
          .eq('world_info_id', worldInfo.id)
          .eq('user_id', user.user.id);

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isUsed: false
        } : null);

        toast({
          title: "Lorebook Removed",
          description: "This lorebook has been removed from your collection",
        });
      } else {
        // Add to collection
        const { error } = await supabase
          .from('world_info_users')
          .insert({
            world_info_id: worldInfo.id,
            user_id: user.user.id
          });

        if (error) throw error;

        setWorldInfo(prev => prev ? {
          ...prev,
          isUsed: true
        } : null);

        toast({
          title: "Lorebook Added",
          description: "This lorebook has been added to your collection",
        });
      }
    } catch (error) {
      console.error('Error toggling lorebook usage:', error);
      toast({
        title: "Error",
        description: "Failed to update lorebook collection",
        variant: "destructive"
      });
    } finally {
      setIsUsingLorebook(false);
    }
  };

  // Filter entries based on search term
  const filteredEntries = worldInfo?.entries.filter(entry =>
    entry.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    ) || entry.entry_text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Debug logging for filtering
  console.log('🔍 Debug: worldInfo?.entries before filtering:', worldInfo?.entries);
  console.log('🔍 Debug: filteredEntries after filtering:', filteredEntries);
  console.log('🔍 Debug: searchTerm:', searchTerm);

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/10">
                <BookOpen className="w-10 h-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{worldInfo.name}</h1>
              <p className="text-muted-foreground mb-4">
                Created by{' '}
                <Link
                  to={`/profile/${worldInfo.creator_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {worldInfo.creator?.username || 'Unknown'}
                </Link>
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(worldInfo.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {worldInfo.interaction_count} views
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={handleLike}
              variant={worldInfo.isLiked ? "default" : "outline"}
              disabled={isLiking}
            >
              <Heart className={`mr-2 h-4 w-4 ${worldInfo.isLiked ? 'fill-current' : ''}`} />
              {worldInfo.likesCount} Likes
            </Button>
            <Button
              onClick={handleFavorite}
              variant={worldInfo.isFavorited ? "default" : "outline"}
              disabled={isFavoriting}
            >
              <Star className={`mr-2 h-4 w-4 ${worldInfo.isFavorited ? 'fill-current' : ''}`} />
              {worldInfo.favoritesCount} Favorites
            </Button>
            <Button
              onClick={handleUseLorebook}
              variant={worldInfo.isUsed ? "outline" : "secondary"}
              disabled={isUsingLorebook}
            >
              <Download className="mr-2 h-4 w-4" />
              {worldInfo.isUsed ? "Remove from Collection" : "Add to Collection"}
            </Button>
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-8">
          {worldInfo.short_description && (
            <p className="text-lg mb-4">{worldInfo.short_description}</p>
          )}
          
          {/* Tags */}
          {worldInfo.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {worldInfo.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lore Entries Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lorebook Entries ({worldInfo.entries.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm ? 'No entries match your search.' : 'No lorebook entries found.'}
              </p>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredEntries.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-wrap gap-1 items-center">
                        {entry.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm whitespace-pre-wrap pt-2 pb-4">{entry.entry_text}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        {similarWorldInfos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Similar World Infos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarWorldInfos.map((worldInfo) => (
                  <Link
                    key={worldInfo.id}
                    to={`/world-info-view/${worldInfo.id}`}
                    className="block border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                       <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{worldInfo.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          by {worldInfo.creator?.username || 'Unknown'}
                        </p>
                        {worldInfo.short_description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {worldInfo.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}