import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  ArrowLeft,
  Loader2,
  BookOpen,
  Tag,
  Search,
  Download,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Image
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPublicWorldInfoDetails, createWorldInfo, updateWorldInfo, addWorldInfoEntry, updateWorldInfoEntry, deleteWorldInfoEntry, addWorldInfoTag, removeWorldInfoTag, type WorldInfoCreationData, type WorldInfoEntryData } from '@/lib/world-info-operations';
import { uploadAvatar } from '@/lib/avatar-upload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAllTags, useWorldInfoTags } from '@/hooks/useWorldInfos';
import { useQueryClient } from '@tanstack/react-query';

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
  isUsed: boolean;
  likesCount: number;
}

type Tag = {
  id: number;
  name: string;
};

interface TagSectionProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: number) => void;
}

const TagSection: React.FC<TagSectionProps> = ({ selectedTags, availableTags, onAddTag, onRemoveTag }) => {
  const availableForDropdown = availableTags.filter(tag => !selectedTags.some(selected => selected.id === tag.id));
  
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2 text-white">
        <Tag className="w-4 h-4" />
        Tags
      </Label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="default"
              className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80"
              onClick={() => onRemoveTag(tag.id)}
            >
              {tag.name}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
      
      {/* Add Tag Dropdown */}
      {availableForDropdown.length > 0 && (
        <Select onValueChange={onAddTag}>
          <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
            <SelectValue placeholder="Add a tag..." />
          </SelectTrigger>
          <SelectContent>
            {availableForDropdown.map((tag) => (
              <SelectItem key={tag.id} value={tag.id.toString()}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default function PublicWorldInfoProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Main data
  const [worldInfo, setWorldInfo] = useState<WorldInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction states
  const [isLiking, setIsLiking] = useState(false);
  const [isUsingLorebook, setIsUsingLorebook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [similarWorldInfos, setSimilarWorldInfos] = useState<any[]>([]);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('private');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  // Entry editing states
  const [newEntryKeywords, setNewEntryKeywords] = useState('');
  const [newEntryText, setNewEntryText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryKeywords, setEditingEntryKeywords] = useState('');
  const [editingEntryText, setEditingEntryText] = useState('');
  const [entriesSearchQuery, setEntriesSearchQuery] = useState('');
  
  // Data fetching
  const { data: allTags = [] } = useAllTags();
  const { data: worldInfoTags = [] } = useWorldInfoTags(id || null);

  // Permission checks
  const isOwner = user && worldInfo && worldInfo.creator_id === user.id;
  const canEdit = isOwner || (user && worldInfo && worldInfo.isUsed);

  useEffect(() => {
    const fetchWorldInfoData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getPublicWorldInfoDetails(id);
        setWorldInfo(data as unknown as WorldInfoData);
        
        // Initialize edit form with current data
        setEditName(data.name);
        setEditDescription(data.short_description || '');
        setEditAvatarUrl((data as any).avatar_url || '');
        setEditVisibility(data.visibility as 'public' | 'unlisted' | 'private');
        
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

  // Initialize tags when editing
  useEffect(() => {
    if (id && worldInfoTags.length > 0) {
      setSelectedTags(worldInfoTags);
    }
  }, [id, worldInfoTags]);

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

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form to original values
    if (worldInfo) {
      setEditName(worldInfo.name);
      setEditDescription(worldInfo.short_description || '');
      setEditAvatarUrl(worldInfo.avatar_url || '');
      setEditVisibility(worldInfo.visibility as 'public' | 'unlisted' | 'private');
      setSelectedTags(worldInfo.tags);
    }
    setEditAvatarFile(null);
    setEditingEntryId(null);
    setNewEntryKeywords('');
    setNewEntryText('');
  };

  const createCopyAndEdit = async () => {
    if (!worldInfo || !user) return;

    try {
      setSaving(true);

      // Upload new avatar if provided
      let avatarUrl = editAvatarUrl;
      if (editAvatarFile) {
        try {
          avatarUrl = await uploadAvatar(editAvatarFile, 'world-info-avatars');
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          avatarUrl = editAvatarUrl;
        }
      }

      // Create new world info (copy)
      const worldInfoData: WorldInfoCreationData = {
        name: editName.trim(),
        short_description: editDescription.trim(),
        visibility: editVisibility
      };

      const newWorldInfo = await createWorldInfo(worldInfoData);

      // Copy all entries to the new world info
      for (const entry of worldInfo.entries) {
        try {
          await addWorldInfoEntry(newWorldInfo.id, {
            keywords: entry.keywords,
            entry_text: entry.entry_text
          });
        } catch (entryError) {
          console.error('Error copying entry:', entryError);
        }
      }

      // Add tags to the new world info
      for (const tag of selectedTags) {
        try {
          await addWorldInfoTag(newWorldInfo.id, tag.id);
        } catch (tagError) {
          console.error('Error adding tag to new world info:', tagError);
        }
      }

      // Remove original from collection and add new one
      await supabase
        .from('world_info_users')
        .delete()
        .eq('world_info_id', worldInfo.id)
        .eq('user_id', user.id);

      await supabase
        .from('world_info_users')
        .insert({
          world_info_id: newWorldInfo.id,
          user_id: user.id
        });

      toast({
        title: "Success",
        description: "Created your own copy and saved changes"
      });

      // Navigate to the new world info
      navigate(`/world-info-view/${newWorldInfo.id}`);
    } catch (error) {
      console.error('Error creating copy:', error);
      toast({
        title: "Error",
        description: "Failed to create copy",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!worldInfo || !id) return;

    if (isOwner) {
      // Direct update for owners
      try {
        setSaving(true);

        let avatarUrl = editAvatarUrl;
        if (editAvatarFile) {
          try {
            avatarUrl = await uploadAvatar(editAvatarFile, 'world-info-avatars');
          } catch (uploadError) {
            console.error('Avatar upload failed:', uploadError);
            avatarUrl = editAvatarUrl;
          }
        }

        const worldInfoData: WorldInfoCreationData = {
          name: editName.trim(),
          short_description: editDescription.trim(),
          visibility: editVisibility
        };

        await updateWorldInfo(id, worldInfoData);
        
        // Refresh data
        const updatedData = await getPublicWorldInfoDetails(id);
        setWorldInfo(updatedData as unknown as WorldInfoData);
        
        setIsEditMode(false);
        toast({
          title: "Success",
          description: "World info updated successfully"
        });
      } catch (error) {
        console.error('Error updating world info:', error);
        toast({
          title: "Error",
          description: "Failed to update world info",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    } else {
      // Copy-on-edit for non-owners
      await createCopyAndEdit();
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = async (tagId: string) => {
    const tagIdNum = parseInt(tagId);
    const tag = allTags.find(t => t.id === tagIdNum);
    if (!tag) return;

    if (isOwner && id) {
      // If owner and editing existing, add to database
      try {
        await addWorldInfoTag(id, tagIdNum);
        queryClient.invalidateQueries({ queryKey: ['world-info-tags', id] });
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({
          title: "Error",
          description: "Failed to add tag",
          variant: "destructive"
        });
        return;
      }
    }

    // Add to local state
    setSelectedTags(prev => [...prev, tag]);
  };

  const handleRemoveTag = async (tagId: number) => {
    if (isOwner && id) {
      // If owner and editing existing, remove from database
      try {
        await removeWorldInfoTag(id, tagId);
        queryClient.invalidateQueries({ queryKey: ['world-info-tags', id] });
      } catch (error) {
        console.error('Error removing tag:', error);
        toast({
          title: "Error",
          description: "Failed to remove tag",
          variant: "destructive"
        });
        return;
      }
    }

    // Remove from local state
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleAddEntry = async () => {
    if (!id) return;

    if (!newEntryKeywords.trim() || !newEntryText.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both keywords and entry text",
        variant: "destructive"
      });
      return;
    }

    try {
      const keywords = newEntryKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const entryData: WorldInfoEntryData = {
        keywords,
        entry_text: newEntryText.trim()
      };

      await addWorldInfoEntry(id, entryData);

      // Refresh data
      const updatedData = await getPublicWorldInfoDetails(id);
      setWorldInfo(updatedData as unknown as WorldInfoData);

      setNewEntryKeywords('');
      setNewEntryText('');

      toast({
        title: "Success",
        description: "Entry added successfully"
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: "Failed to add entry",
        variant: "destructive"
      });
    }
  };

  const startEditingEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setEditingEntryKeywords(entry.keywords.join(', '));
    setEditingEntryText(entry.entry_text);
  };

  const cancelEditingEntry = () => {
    setEditingEntryId(null);
    setEditingEntryKeywords('');
    setEditingEntryText('');
  };

  const handleUpdateEntry = async () => {
    if (!editingEntryId || !id) return;

    if (!editingEntryKeywords.trim() || !editingEntryText.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both keywords and entry text",
        variant: "destructive"
      });
      return;
    }

    try {
      const keywords = editingEntryKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const entryData: WorldInfoEntryData = {
        keywords,
        entry_text: editingEntryText.trim()
      };

      await updateWorldInfoEntry(editingEntryId, entryData);

      // Refresh data
      const updatedData = await getPublicWorldInfoDetails(id);
      setWorldInfo(updatedData as unknown as WorldInfoData);

      setEditingEntryId(null);
      setEditingEntryKeywords('');
      setEditingEntryText('');

      toast({
        title: "Success",
        description: "Entry updated successfully"
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: "Error",
        description: "Failed to update entry",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!id) return;

    try {
      await deleteWorldInfoEntry(entryId);

      // Refresh data
      const updatedData = await getPublicWorldInfoDetails(id);
      setWorldInfo(updatedData as unknown as WorldInfoData);

      toast({
        title: "Success",
        description: "Entry deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      });
    }
  };

  // Filter entries based on search term
  const filteredEntries = worldInfo?.entries.filter(entry => {
    if (!entriesSearchQuery) return true;
    const searchLower = entriesSearchQuery.toLowerCase();
    return (
      entry.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      entry.entry_text.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !worldInfo) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">World Info Not Found</h2>
          <p className="text-gray-400 mb-4">{error || 'The world info you are looking for does not exist or is not public.'}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                {isEditMode ? 'Edit World Info' : worldInfo.name}
              </h1>
              <div className="flex gap-2">
                {/* Action Buttons */}
                <Button
                  onClick={handleLike}
                  variant={worldInfo.isLiked ? "default" : "outline"}
                  disabled={isLiking}
                  className="border-gray-600"
                >
                  <Heart className={`mr-2 h-4 w-4 ${worldInfo.isLiked ? 'fill-current' : ''}`} />
                  {worldInfo.likesCount} Likes
                </Button>
                <Button
                  onClick={handleUseLorebook}
                  variant={worldInfo.isUsed ? "outline" : "secondary"}
                  disabled={isUsingLorebook}
                  className="border-gray-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {worldInfo.isUsed ? "Remove from Collection" : "Add to Collection"}
                </Button>
                {canEdit && !isEditMode && (
                  <Button
                    onClick={handleEnterEditMode}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditMode && (
                  <>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/80 text-white font-medium px-6 py-2 rounded-lg"
                    >
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      {isOwner ? 'Save' : 'Save as Copy'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* World Info Details Card */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5" />
                    World Info Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Header Section */}
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        {editAvatarUrl ? (
                          <AvatarImage src={editAvatarUrl} alt="World Info Avatar" />
                        ) : (
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            <BookOpen className="w-8 h-8" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {isEditMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 border-gray-600"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <Image className="w-4 h-4" />
                        </Button>
                      )}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      {isEditMode ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Name</Label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-gray-800/50 border-gray-600 text-white"
                              placeholder="World info name..."
                            />
                          </div>
                          <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="bg-gray-800/50 border-gray-600 text-white"
                              placeholder="Brief description..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label className="text-white">Visibility</Label>
                            <Select value={editVisibility} onValueChange={(value: 'public' | 'unlisted' | 'private') => setEditVisibility(value)}>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h1 className="text-4xl font-bold mb-2 text-white">{worldInfo.name}</h1>
                          <p className="text-gray-400 mb-4">
                            Created by{' '}
                            <Link
                              to={`/profile/${worldInfo.creator_id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {worldInfo.creator?.username || 'Unknown'}
                            </Link>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(worldInfo.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {worldInfo.interaction_count} views
                            </div>
                          </div>
                          {worldInfo.short_description && (
                            <p className="text-lg text-gray-300 mt-4">{worldInfo.short_description}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags Section */}
                  <Separator className="bg-gray-700" />
                  {isEditMode ? (
                    <TagSection
                      selectedTags={selectedTags}
                      availableTags={allTags}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                    />
                  ) : (
                    worldInfo.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {worldInfo.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="bg-gray-700 text-gray-300">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Lorebook Entries */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5" />
                    Lorebook Entries ({worldInfo.entries.length})
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search entries by keyword..."
                      value={entriesSearchQuery}
                      onChange={(e) => setEntriesSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Entry Form */}
                  {isEditMode && (
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Add New Entry</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-white">Keywords (comma-separated)</Label>
                          <Input
                            value={newEntryKeywords}
                            onChange={(e) => setNewEntryKeywords(e.target.value)}
                            placeholder="keyword1, keyword2, keyword3"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Entry Text</Label>
                          <Textarea
                            value={newEntryText}
                            onChange={(e) => setNewEntryText(e.target.value)}
                            placeholder="Enter the content for this lorebook entry..."
                            rows={4}
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <Button
                          onClick={handleAddEntry}
                          className="bg-primary hover:bg-primary/80"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Entry
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Entries List */}
                  {filteredEntries.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      {entriesSearchQuery ? 'No entries match your search.' : 'No lorebook entries found.'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredEntries.map((entry) => (
                        <Card key={entry.id} className="bg-gray-700/50 border-gray-600">
                          <CardContent className="p-4">
                            {editingEntryId === entry.id ? (
                              // Edit mode for this entry
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-white">Keywords (comma-separated)</Label>
                                  <Input
                                    value={editingEntryKeywords}
                                    onChange={(e) => setEditingEntryKeywords(e.target.value)}
                                    className="bg-gray-800/50 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white">Entry Text</Label>
                                  <Textarea
                                    value={editingEntryText}
                                    onChange={(e) => setEditingEntryText(e.target.value)}
                                    rows={4}
                                    className="bg-gray-800/50 border-gray-600 text-white"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleUpdateEntry}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/80"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={cancelEditingEntry}
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View mode for this entry
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {entry.keywords.map((keyword, index) => (
                                      <Badge key={index} variant="outline" className="text-xs border-gray-500 text-gray-300">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                  {isEditMode && (
                                    <div className="flex gap-1">
                                      <Button
                                        onClick={() => startEditingEntry(entry)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Delete Entry</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                              Are you sure you want to delete this entry? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteEntry(entry.id)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{entry.entry_text}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Similar World Infos - Only show in view mode */}
              {!isEditMode && similarWorldInfos.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Similar World Infos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {similarWorldInfos.map((similarWorldInfo) => (
                        <Link
                          key={similarWorldInfo.id}
                          to={`/world-info-view/${similarWorldInfo.id}`}
                          className="block border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gray-700 text-gray-300">
                                <BookOpen className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate text-white">{similarWorldInfo.name}</h4>
                              <p className="text-sm text-gray-400 truncate">
                                by {similarWorldInfo.creator?.username || 'Unknown'}
                              </p>
                              {similarWorldInfo.short_description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {similarWorldInfo.short_description}
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
        </div>
      </main>
    </div>
  );
}