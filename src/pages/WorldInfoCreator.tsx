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
import { Plus, Upload, Edit2, Trash2, Save, X } from 'lucide-react';
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
  type WorldInfoCreationData,
  type WorldInfoEntryData
} from '@/lib/world-info-operations';

type WorldInfo = Tables<'world_infos'> & {
  entries?: Tables<'world_info_entries'>[];
};

type WorldInfoEntry = Tables<'world_info_entries'>;

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
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('private');
  
  // Entry form states
  const [newEntryKeywords, setNewEntryKeywords] = useState('');
  const [newEntryText, setNewEntryText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryKeywords, setEditingEntryKeywords] = useState('');
  const [editingEntryText, setEditingEntryText] = useState('');

  useEffect(() => {
    if (user) {
      fetchWorldInfos();
    }
  }, [user]);

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
        visibility: editVisibility
      });
      
      await fetchWorldInfos();
      const detailedInfo = await getWorldInfoWithEntries(newWorldInfo.id);
      setSelectedWorldInfo(detailedInfo);
      setIsCreating(false);
      
      // Reset form
      setEditName('');
      setEditDescription('');
      setEditVisibility('private');
      
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
                      <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Create New World Info</h3>
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
                          <div className="flex gap-2">
                            <Button onClick={handleCreateNew} disabled={saving}>
                              {saving ? 'Creating...' : 'Create'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
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
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedWorldInfo?.id === worldInfo.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-accent'
                          }`}
                          onClick={() => handleSelectWorldInfo(worldInfo)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{worldInfo.name}</h4>
                              {worldInfo.short_description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {worldInfo.short_description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {worldInfo.visibility}
                                </Badge>
                              </div>
                            </div>
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
                      ))}
                      {worldInfos.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No World Infos yet. Create your first one!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Editor */}
              <div className="lg:col-span-2">
                {selectedWorldInfo ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {isEditing ? 'Edit World Info' : selectedWorldInfo.name}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (isEditing) {
                              setIsEditing(false);
                            } else {
                              startEditing(selectedWorldInfo);
                            }
                          }}
                        >
                          {isEditing ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Edit Form */}
                      {isEditing && (
                        <div className="space-y-4 p-4 border rounded-lg">
                          <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={3}
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
                          <Button onClick={handleUpdateWorldInfo} disabled={saving}>
                            <Save className="w-4 h-4 mr-1" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      )}

                      {/* World Info Details */}
                      {!isEditing && (
                        <div className="space-y-4">
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedWorldInfo.short_description || 'No description provided'}
                            </p>
                          </div>
                          <div>
                            <Label>Visibility</Label>
                            <Badge variant="outline" className="ml-2">
                              {selectedWorldInfo.visibility}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Entries Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Lore Entries</h3>
                        
                        {/* Add New Entry Form */}
                        <div className="mb-6 p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">Add New Entry</h4>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="new-entry-keywords">Keywords (comma-separated)</Label>
                              <Input
                                id="new-entry-keywords"
                                value={newEntryKeywords}
                                onChange={(e) => setNewEntryKeywords(e.target.value)}
                                placeholder="character name, location, item"
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-entry-text">Entry Text</Label>
                              <Textarea
                                id="new-entry-text"
                                value={newEntryText}
                                onChange={(e) => setNewEntryText(e.target.value)}
                                placeholder="Describe the lore entry..."
                                rows={4}
                              />
                            </div>
                            <Button onClick={handleAddEntry}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add Entry
                            </Button>
                          </div>
                        </div>

                        {/* Existing Entries */}
                        <div className="space-y-4">
                          {selectedWorldInfo.entries?.map((entry) => (
                            <div key={entry.id} className="p-4 border rounded-lg">
                              {editingEntryId === entry.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="edit-entry-keywords">Keywords (comma-separated)</Label>
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
                                    <Button onClick={handleUpdateEntry}>
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button variant="outline" onClick={cancelEditingEntry}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex gap-2">
                                      {entry.keywords.map((keyword, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
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
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {entry.entry_text}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          {(!selectedWorldInfo.entries || selectedWorldInfo.entries.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              No entries yet. Add your first lore entry above!
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center text-muted-foreground">
                        <h3 className="text-lg font-semibold mb-2">No World Info Selected</h3>
                        <p>Select a World Info from the list on the left to start editing, or create a new one.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </SidebarProvider>
  );
};

export default WorldInfoCreator;
