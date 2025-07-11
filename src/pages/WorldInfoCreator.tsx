import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Upload, Edit2, Trash2, Save, X, Search, Tag, User, BookOpen, Image, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import {
  createWorldInfo,
  getWorldInfosByUser,
  getWorldInfoWithEntries,
  updateWorldInfo,
  deleteWorldInfo,
  addWorldInfoEntry,
  updateWorldInfoEntry,
  deleteWorldInfoEntry,
  getAllTags,
  getWorldInfoTags,
  addWorldInfoTag,
  removeWorldInfoTag,
  type WorldInfoCreationData,
  type WorldInfoEntryData
} from '@/lib/world-info-operations';
import { uploadAvatar } from '@/lib/avatar-upload';

type WorldInfo = Tables<'world_infos'> & {
  entries?: Tables<'world_info_entries'>[];
  avatar_url?: string;
};

type WorldInfoEntry = Tables<'world_info_entries'>;

type Tag = {
  id: number;
  name: string;
};

interface TagSectionProps {
  selectedTags: number[];
  availableTags: Tag[];
  onTagToggle: (tagId: number) => void;
}

const TagSection: React.FC<TagSectionProps> = ({ selectedTags, availableTags, onTagToggle }) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Tags
      </Label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => onTagToggle(tag.id)}
            >
              {tag.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

const WorldInfoCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [worldInfos, setWorldInfos] = useState<WorldInfo[]>([]);
  const [selectedWorldInfo, setSelectedWorldInfo] = useState<WorldInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('private');
  
  // Entry form states
  const [newEntryKeywords, setNewEntryKeywords] = useState('');
  const [newEntryText, setNewEntryText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryKeywords, setEditingEntryKeywords] = useState('');
  const [editingEntryText, setEditingEntryText] = useState('');
  const [entriesSearchQuery, setEntriesSearchQuery] = useState('');
  
  // Tag states
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      fetchWorldInfos();
      fetchTags();
    }
  }, [user]);

  const fetchTags = async () => {
    try {
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchWorldInfos = async () => {
    try {
      setLoading(true);
      const infos = await getWorldInfosByUser();
      setWorldInfos(infos);
    } catch (error) {
      console.error('Error fetching world infos:', error);
      toast({
        title: "Error",
        description: "Failed to load World Infos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorldInfoTags = async (worldInfoId: string) => {
    try {
      const tags = await getWorldInfoTags(worldInfoId);
      setSelectedTags(tags.map(tag => tag.id));
    } catch (error) {
      console.error('Error fetching world info tags:', error);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditAvatarUrl(previewUrl);
    }
  };

  const handleCreateNew = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the World Info",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      let avatarUrl = '';
      if (editAvatarFile && user) {
        setUploadingAvatar(true);
        const uploadedUrl = await uploadAvatar(editAvatarFile, user.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
        setUploadingAvatar(false);
      }

      const newWorldInfo = await createWorldInfo({
        name: editName,
        short_description: editDescription,
        visibility: editVisibility
      });
      
      // Add avatar_url to local state for display
      const newWorldInfoWithAvatar = { ...newWorldInfo, avatar_url: avatarUrl };
      
      // Add selected tags
      for (const tagId of selectedTags) {
        await addWorldInfoTag(newWorldInfo.id, tagId);
      }
      
      await fetchWorldInfos();
      const detailedInfo = await getWorldInfoWithEntries(newWorldInfo.id);
      const detailedInfoWithAvatar = { ...detailedInfo, avatar_url: avatarUrl };
      setSelectedWorldInfo(detailedInfoWithAvatar);
      setIsCreating(false);
      
      // Reset form
      setEditName('');
      setEditDescription('');
      setEditAvatarFile(null);
      setEditAvatarUrl('');
      setEditVisibility('private');
      setSelectedTags([]);
      
      toast({
        title: "Success",
        description: "World Info created successfully"
      });
    } catch (error) {
      console.error('Error creating world info:', error);
      toast({
        title: "Error",
        description: "Failed to create World Info",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleSelectWorldInfo = async (worldInfo: WorldInfo) => {
    try {
      const detailedInfo = await getWorldInfoWithEntries(worldInfo.id);
      setSelectedWorldInfo(detailedInfo);
      await fetchWorldInfoTags(worldInfo.id);
      setIsEditing(false);
      setEditingEntryId(null);
    } catch (error) {
      console.error('Error fetching world info details:', error);
      toast({
        title: "Error",
        description: "Failed to load World Info details",
        variant: "destructive"
      });
    }
  };

  const handleUpdateWorldInfo = async () => {
    if (!selectedWorldInfo || !editName.trim()) return;

    try {
      setSaving(true);
      
      let avatarUrl = selectedWorldInfo.avatar_url || '';
      if (editAvatarFile && user) {
        setUploadingAvatar(true);
        const uploadedUrl = await uploadAvatar(editAvatarFile, user.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
        setUploadingAvatar(false);
      }

      await updateWorldInfo(selectedWorldInfo.id, {
        name: editName,
        short_description: editDescription,
        visibility: editVisibility
      });
      
      await fetchWorldInfos();
      const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
      const updatedInfoWithAvatar = { ...updatedInfo, avatar_url: avatarUrl };
      setSelectedWorldInfo(updatedInfoWithAvatar);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "World Info updated successfully"
      });
    } catch (error) {
      console.error('Error updating world info:', error);
      toast({
        title: "Error",
        description: "Failed to update World Info",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleDeleteWorldInfo = async (worldInfoId: string) => {
    try {
      await deleteWorldInfo(worldInfoId);
      await fetchWorldInfos();
      if (selectedWorldInfo?.id === worldInfoId) {
        setSelectedWorldInfo(null);
      }
      
      toast({
        title: "Success",
        description: "World Info deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting world info:', error);
      toast({
        title: "Error",
        description: "Failed to delete World Info",
        variant: "destructive"
      });
    }
  };

  const handleTagToggle = async (tagId: number) => {
    if (!selectedWorldInfo) return;

    try {
      if (selectedTags.includes(tagId)) {
        await removeWorldInfoTag(selectedWorldInfo.id, tagId);
        setSelectedTags(prev => prev.filter(id => id !== tagId));
      } else {
        await addWorldInfoTag(selectedWorldInfo.id, tagId);
        setSelectedTags(prev => [...prev, tagId]);
      }
    } catch (error) {
      console.error('Error toggling tag:', error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive"
      });
    }
  };

  const handleAddEntry = async () => {
    if (!selectedWorldInfo || !newEntryKeywords.trim() || !newEntryText.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both keywords and entry text",
        variant: "destructive"
      });
      return;
    }

    try {
      const keywords = newEntryKeywords.split(',').map(k => k.trim()).filter(k => k);
      await addWorldInfoEntry(selectedWorldInfo.id, {
        keywords,
        entry_text: newEntryText
      });
      
      const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
      const updatedInfoWithAvatar = { ...updatedInfo, avatar_url: selectedWorldInfo.avatar_url };
      setSelectedWorldInfo(updatedInfoWithAvatar);
      
      // Reset form
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

  const handleUpdateEntry = async () => {
    if (!editingEntryId || !editingEntryKeywords.trim() || !editingEntryText.trim()) return;

    try {
      const keywords = editingEntryKeywords.split(',').map(k => k.trim()).filter(k => k);
      await updateWorldInfoEntry(editingEntryId, {
        keywords,
        entry_text: editingEntryText
      });
      
      if (selectedWorldInfo) {
        const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
        const updatedInfoWithAvatar = { ...updatedInfo, avatar_url: selectedWorldInfo.avatar_url };
        setSelectedWorldInfo(updatedInfoWithAvatar);
      }
      
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
    try {
      await deleteWorldInfoEntry(entryId);
      
      if (selectedWorldInfo) {
        const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
        const updatedInfoWithAvatar = { ...updatedInfo, avatar_url: selectedWorldInfo.avatar_url };
        setSelectedWorldInfo(updatedInfoWithAvatar);
      }
      
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

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: "Error",
        description: "Please select a JSON file",
        variant: "destructive"
      });
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate JSON structure
      if (!jsonData.name || !jsonData.entries) {
        toast({
          title: "Error",
          description: "Invalid JSON format. Expected 'name' and 'entries' fields.",
          variant: "destructive"
        });
        return;
      }

      // Create the main World Info record
      const newWorldInfo = await createWorldInfo({
        name: jsonData.name,
        short_description: jsonData.description || '',
        visibility: 'private'
      });

      // Import entries
      const entries = Object.entries(jsonData.entries);
      for (const [key, value] of entries) {
        if (typeof value === 'object' && value !== null) {
          const entry = value as any;
          if (entry.keys && entry.content) {
            await addWorldInfoEntry(newWorldInfo.id, {
              keywords: Array.isArray(entry.keys) ? entry.keys : [entry.keys],
              entry_text: entry.content
            });
          }
        }
      }

      // Refresh the list and select the new World Info
      await fetchWorldInfos();
      const detailedInfo = await getWorldInfoWithEntries(newWorldInfo.id);
      setSelectedWorldInfo(detailedInfo);

      toast({
        title: "Success",
        description: `Successfully imported "${jsonData.name}" with ${entries.length} entries`
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Error",
        description: "Failed to import file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startEditing = (worldInfo: WorldInfo) => {
    setEditName(worldInfo.name);
    setEditDescription(worldInfo.short_description || '');
    setEditAvatarUrl(worldInfo.avatar_url || '');
    setEditAvatarFile(null);
    setEditVisibility(worldInfo.visibility as 'public' | 'unlisted' | 'private');
    setIsEditing(true);
  };

  const startEditingEntry = (entry: WorldInfoEntry) => {
    setEditingEntryId(entry.id);
    setEditingEntryKeywords(entry.keywords.join(', '));
    setEditingEntryText(entry.entry_text);
  };

  const cancelEditingEntry = () => {
    setEditingEntryId(null);
    setEditingEntryKeywords('');
    setEditingEntryText('');
  };

  const filteredEntries = selectedWorldInfo?.entries?.filter(entry => {
    if (!entriesSearchQuery) return true;
    const searchLower = entriesSearchQuery.toLowerCase();
    return (
      entry.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      entry.entry_text.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex-1 ml-64 p-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Lorebook Studio
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Create rich, immersive worlds through detailed lore entries. Build the foundation for unforgettable storytelling experiences.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setIsCreating(true)}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Lorebook
                </Button>
                <Dialog open={importing} onOpenChange={setImporting}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={handleImportFile}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Lorebook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Importing Lorebook</DialogTitle>
                      <DialogDescription>
                        Please wait while we process your lorebook file. This may take a few moments for larger files.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column - World Info Grid */}
              <div className="lg:col-span-1 space-y-6">
                {/* Create New Form */}
                {isCreating && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-5 h-5" />
                        New Lorebook
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <AvatarImage src={editAvatarUrl} />
                            <AvatarFallback className="bg-primary/10">
                              <Image className="w-8 h-8 text-primary/50" />
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                          >
                            {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                          </Button>
                        </div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarSelect}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-name">Name</Label>
                        <Input
                          id="new-name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter lorebook name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-description">Description</Label>
                        <Textarea
                          id="new-description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Brief description of this world"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-visibility">Visibility</Label>
                        <Select value={editVisibility} onValueChange={(value: 'public' | 'unlisted' | 'private') => setEditVisibility(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <TagSection
                        selectedTags={selectedTags}
                        availableTags={availableTags}
                        onTagToggle={(tagId) => {
                          if (selectedTags.includes(tagId)) {
                            setSelectedTags(prev => prev.filter(id => id !== tagId));
                          } else {
                            setSelectedTags(prev => [...prev, tagId]);
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCreateNew} disabled={saving || uploadingAvatar} className="flex-1">
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                          {saving ? 'Creating...' : 'Create'}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setIsCreating(false);
                          setSelectedTags([]);
                          setEditAvatarFile(null);
                          setEditAvatarUrl('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* World Info Grid */}
                <div className="grid gap-4">
                  {worldInfos.map((worldInfo) => (
                    <Card
                      key={worldInfo.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedWorldInfo?.id === worldInfo.id ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50'
                      }`}
                      onClick={() => handleSelectWorldInfo(worldInfo)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarImage src={worldInfo.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{worldInfo.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {worldInfo.short_description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {worldInfo.visibility}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {worldInfo.entries?.length || 0} entries
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-1 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(worldInfo);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lorebook</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{worldInfo.name}"? This action cannot be undone and will permanently remove all entries.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteWorldInfo(worldInfo.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column - Editor */}
              <div className="lg:col-span-3 space-y-6">
                {selectedWorldInfo ? (
                  <>
                    {/* Basic Information Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Lorebook Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {isEditing ? (
                          <>
                            <div className="flex flex-col items-center gap-4">
                              <div className="relative">
                                <Avatar className="w-24 h-24 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                  <AvatarImage src={editAvatarUrl} />
                                  <AvatarFallback className="bg-primary/10">
                                    <Image className="w-8 h-8 text-primary/50" />
                                  </AvatarFallback>
                                </Avatar>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                  onClick={() => avatarInputRef.current?.click()}
                                  disabled={uploadingAvatar}
                                >
                                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Lorebook name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-visibility">Visibility</Label>
                                <Select value={editVisibility} onValueChange={(value: 'public' | 'unlisted' | 'private') => setEditVisibility(value)}>
                                  <SelectTrigger>
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
                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Brief description of this world"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdateWorldInfo} disabled={saving || uploadingAvatar}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-6">
                              <Avatar className="w-20 h-20 flex-shrink-0">
                                <AvatarImage src={selectedWorldInfo.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                                  <BookOpen className="w-10 h-10 text-primary" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h2 className="text-3xl font-bold">{selectedWorldInfo.name}</h2>
                                <p className="text-muted-foreground mt-2 text-lg">
                                  {selectedWorldInfo.short_description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                  <Badge variant="outline" className="px-3 py-1">
                                    {selectedWorldInfo.visibility}
                                  </Badge>
                                  <Badge variant="secondary" className="px-3 py-1">
                                    {selectedWorldInfo.entries?.length || 0} entries
                                  </Badge>
                                </div>
                              </div>
                              <Button onClick={() => startEditing(selectedWorldInfo)} className="flex-shrink-0">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                            <Separator />
                            <TagSection
                              selectedTags={selectedTags}
                              availableTags={availableTags}
                              onTagToggle={handleTagToggle}
                            />
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Lorebook Entries Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Lore Entries
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                              <Input
                                placeholder="Search entries..."
                                value={entriesSearchQuery}
                                onChange={(e) => setEntriesSearchQuery(e.target.value)}
                                className="pl-8 w-64"
                              />
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add New Entry Form */}
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add New Entry
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="new-entry-keywords">Keywords (comma-separated)</Label>
                                <Input
                                  id="new-entry-keywords"
                                  value={newEntryKeywords}
                                  onChange={(e) => setNewEntryKeywords(e.target.value)}
                                  placeholder="character name, location, event"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-entry-text">Entry Text</Label>
                                <Textarea
                                  id="new-entry-text"
                                  value={newEntryText}
                                  onChange={(e) => setNewEntryText(e.target.value)}
                                  placeholder="Describe the lore or information"
                                  rows={4}
                                />
                              </div>
                              <Button 
                                onClick={handleAddEntry} 
                                disabled={!newEntryKeywords.trim() || !newEntryText.trim()}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Entry
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Entries List */}
                        <div className="space-y-4">
                          {filteredEntries.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No entries found</h3>
                              <p>{entriesSearchQuery ? 'No entries match your search' : 'Add your first lore entry above to get started.'}</p>
                            </div>
                          ) : (
                            filteredEntries.map((entry) => (
                              <Card key={entry.id} className="border-l-4 border-l-primary/30">
                                <CardContent className="p-4">
                                  {editingEntryId === entry.id ? (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-entry-keywords">Keywords</Label>
                                        <Input
                                          id="edit-entry-keywords"
                                          value={editingEntryKeywords}
                                          onChange={(e) => setEditingEntryKeywords(e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-entry-text">Entry Text</Label>
                                        <Textarea
                                          id="edit-entry-text"
                                          value={editingEntryText}
                                          onChange={(e) => setEditingEntryText(e.target.value)}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button onClick={handleUpdateEntry} size="sm">
                                          <Save className="w-4 h-4 mr-1" />
                                          Save
                                        </Button>
                                        <Button onClick={cancelEditingEntry} variant="outline" size="sm">
                                          <X className="w-4 h-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                          {entry.keywords.map((keyword, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs font-medium">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.entry_text}</p>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => startEditingEntry(entry)}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="ghost">
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete this lore entry? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="h-[600px]">
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground max-w-md">
                        <BookOpen className="w-24 h-24 mx-auto mb-6 opacity-30" />
                        <h3 className="text-2xl font-semibold mb-4">Welcome to Lorebook Studio</h3>
                        <p className="text-lg mb-6">Select a lorebook from the sidebar to start editing, or create a new one to begin crafting your world's lore.</p>
                        <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-primary to-primary/80">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Lorebook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default WorldInfoCreator;