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
import { Plus, Upload, Edit2, Trash2, Save, X, Search, Tag, User, BookOpen } from 'lucide-react';
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

type WorldInfo = Tables<'world_infos'> & {
  entries?: Tables<'world_info_entries'>[];
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
  
  const [worldInfos, setWorldInfos] = useState<WorldInfo[]>([]);
  const [selectedWorldInfo, setSelectedWorldInfo] = useState<WorldInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
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
      const newWorldInfo = await createWorldInfo({
        name: editName,
        short_description: editDescription,
        avatar_url: editAvatarUrl,
        visibility: editVisibility
      });
      
      // Add selected tags
      for (const tagId of selectedTags) {
        await addWorldInfoTag(newWorldInfo.id, tagId);
      }
      
      await fetchWorldInfos();
      const detailedInfo = await getWorldInfoWithEntries(newWorldInfo.id);
      setSelectedWorldInfo(detailedInfo);
      setIsCreating(false);
      
      // Reset form
      setEditName('');
      setEditDescription('');
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
      await updateWorldInfo(selectedWorldInfo.id, {
        name: editName,
        short_description: editDescription,
        avatar_url: editAvatarUrl,
        visibility: editVisibility
      });
      
      await fetchWorldInfos();
      const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
      setSelectedWorldInfo(updatedInfo);
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
    }
  };

  const handleDeleteWorldInfo = async (worldInfoId: string) => {
    if (!confirm('Are you sure you want to delete this World Info? This action cannot be undone.')) {
      return;
    }

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
      setSelectedWorldInfo(updatedInfo);
      
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
        setSelectedWorldInfo(updatedInfo);
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
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteWorldInfoEntry(entryId);
      
      if (selectedWorldInfo) {
        const updatedInfo = await getWorldInfoWithEntries(selectedWorldInfo.id);
        setSelectedWorldInfo(updatedInfo);
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">World Info Creator</h1>
              <p className="text-muted-foreground mt-2">Create and manage lore entries for your characters</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - World Info List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      My World Infos
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setIsCreating(true)}
                          disabled={isCreating}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create New
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleImportFile}
                          disabled={importing}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {importing ? 'Importing...' : 'Import'}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Create New Form */}
                    {isCreating && (
                      <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Create New World Info
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="new-name">Name</Label>
                            <Input
                              id="new-name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Enter world info name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-description">Description</Label>
                            <Textarea
                              id="new-description"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Enter description"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-avatar">Avatar URL</Label>
                            <Input
                              id="new-avatar"
                              value={editAvatarUrl}
                              onChange={(e) => setEditAvatarUrl(e.target.value)}
                              placeholder="https://example.com/avatar.jpg"
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
                            <Button onClick={handleCreateNew} disabled={saving}>
                              {saving ? 'Creating...' : 'Create'}
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setIsCreating(false);
                              setSelectedTags([]);
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* World Info List */}
                    <div className="space-y-2">
                      {worldInfos.map((worldInfo) => (
                        <div
                          key={worldInfo.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedWorldInfo?.id === worldInfo.id ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => handleSelectWorldInfo(worldInfo)}
                        >
                          <div className="flex items-center gap-3">
                            {worldInfo.avatar_url ? (
                              <img 
                                src={worldInfo.avatar_url} 
                                alt={worldInfo.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{worldInfo.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {worldInfo.short_description || 'No description'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {worldInfo.visibility}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
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
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorldInfo(worldInfo.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Editor */}
              <div className="lg:col-span-2 space-y-6">
                {selectedWorldInfo ? (
                  <>
                    {/* Basic Information Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="World Info name"
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
                              <Label htmlFor="edit-avatar">Avatar URL</Label>
                              <Input
                                id="edit-avatar"
                                value={editAvatarUrl}
                                onChange={(e) => setEditAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="World Info description"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdateWorldInfo} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-4">
                              {selectedWorldInfo.avatar_url ? (
                                <img 
                                  src={selectedWorldInfo.avatar_url} 
                                  alt={selectedWorldInfo.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h2 className="text-2xl font-bold">{selectedWorldInfo.name}</h2>
                                <p className="text-muted-foreground mt-1">
                                  {selectedWorldInfo.short_description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">
                                    {selectedWorldInfo.visibility}
                                  </Badge>
                                  <Badge variant="outline">
                                    {selectedWorldInfo.entries?.length || 0} entries
                                  </Badge>
                                </div>
                              </div>
                              <Button onClick={() => startEditing(selectedWorldInfo)}>
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
                            Lorebook Entries
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
                      <CardContent className="space-y-4">
                        {/* Add New Entry Form */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-semibold mb-3">Add New Entry</h4>
                          <div className="space-y-3">
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
                            <Button onClick={handleAddEntry} disabled={!newEntryKeywords.trim() || !newEntryText.trim()}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Entry
                            </Button>
                          </div>
                        </div>

                        {/* Entries List */}
                        <div className="space-y-3">
                          {filteredEntries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              {entriesSearchQuery ? 'No entries match your search' : 'No entries yet. Add your first entry above.'}
                            </div>
                          ) : (
                            filteredEntries.map((entry) => (
                              <div key={entry.id} className="p-4 border rounded-lg bg-background">
                                {editingEntryId === entry.id ? (
                                  <div className="space-y-3">
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
                                  <>
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {entry.keywords.map((keyword, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                        <p className="text-sm leading-relaxed">{entry.entry_text}</p>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => startEditingEntry(entry)}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteEntry(entry.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-16">
                      <div className="text-center text-muted-foreground">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No World Info Selected</h3>
                        <p>Select a World Info from the list on the left to start editing, or create a new one.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Hidden file input for imports */}
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