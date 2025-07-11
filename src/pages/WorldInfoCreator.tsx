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
import { Plus, Upload, Edit2, Trash2, Save, X, Search, Tag, User, BookOpen, Image, Loader2, ArrowLeft, Heart, FileText } from 'lucide-react';
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
  toggleWorldInfoLike,
  addWorldInfoToCollection,
  removeWorldInfoFromCollection,
  type WorldInfoCreationData,
  type WorldInfoEntryData
} from '@/lib/world-info-operations';
import { uploadAvatar } from '@/lib/avatar-upload';

type WorldInfo = Tables<'world_infos'> & {
  entries?: Tables<'world_info_entries'>[];
  avatar_url?: string;
  tags?: Tag[];
  likesCount?: number;
  favoritesCount?: number;
  creator?: {
    username: string;
    avatar_url?: string;
  };
  entriesCount?: number;
};

type WorldInfoEntry = Tables<'world_info_entries'>;

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
      <Label className="text-sm font-medium flex items-center gap-2">
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

const WorldInfoCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [worldInfos, setWorldInfos] = useState<WorldInfo[]>([]);
  const [collectedWorldInfos, setCollectedWorldInfos] = useState<WorldInfo[]>([]);
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
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  // View states
  const [showWorldInfoList, setShowWorldInfoList] = useState(true);
  const [editingWorldInfo, setEditingWorldInfo] = useState<WorldInfo | null>(null);

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
      setSelectedTags(tags);
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
      for (const tag of selectedTags) {
        await addWorldInfoTag(newWorldInfo.id, tag.id);
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
      setShowWorldInfoList(false);
      
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
      setShowWorldInfoList(false);
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

  const handleDeleteWorldInfo = async (worldInfoId: string, worldInfoName?: string) => {
    try {
      await deleteWorldInfo(worldInfoId);
      await fetchWorldInfos();
      if (selectedWorldInfo?.id === worldInfoId) {
        setSelectedWorldInfo(null);
        setShowWorldInfoList(true);
      }
      
      toast({
        title: "Success",
        description: `"${worldInfoName || 'World Info'}" deleted successfully`
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

  const handleAddTag = async (tagId: string) => {
    if (!selectedWorldInfo) return;
    
    const tagToAdd = availableTags.find(tag => tag.id.toString() === tagId);
    if (!tagToAdd || selectedTags.some(tag => tag.id === tagToAdd.id)) return;

    try {
      await addWorldInfoTag(selectedWorldInfo.id, tagToAdd.id);
      setSelectedTags(prev => [...prev, tagToAdd]);
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive"
      });
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!selectedWorldInfo) return;

    try {
      await removeWorldInfoTag(selectedWorldInfo.id, tagId);
      setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag",
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

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedWorldInfo(null);
    setEditName('');
    setEditDescription('');
    setEditAvatarFile(null);
    setEditAvatarUrl('');
    setEditVisibility('private');
    setSelectedTags([]);
    setShowWorldInfoList(false);
  };

  const handleBackToList = () => {
    setShowWorldInfoList(true);
    setSelectedWorldInfo(null);
    setIsCreating(false);
    setIsEditing(false);
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
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden" style={{ marginLeft: 'var(--sidebar-width, 250px)' }}>
          {showWorldInfoList ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">World Infos</h1>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleStartCreate}
                      className="bg-primary hover:bg-primary/80 text-white font-medium px-4 py-2 rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                    <Button
                      onClick={handleImportFile}
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10 font-medium px-4 py-2 rounded-lg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </div>

              {/* World Info List */}
              <div className="flex-1 overflow-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-400">Loading world infos...</span>
                  </div>
                ) : worldInfos.length === 0 && collectedWorldInfos.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No World Infos Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first world info to get started</p>
                    <Button
                      onClick={handleStartCreate}
                      className="bg-primary hover:bg-primary/80 text-white font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First World Info
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Created by User Column */}
                    <div>
                      <h2 className="text-white text-xl font-semibold mb-6 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        My World Infos ({worldInfos.length})
                      </h2>
                      <div className="space-y-4">
                         {worldInfos.map((worldInfo) => (
                           <Card
                             key={worldInfo.id}
                             className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg relative"
                           >
                             <CardContent className="p-6 pb-16">
                               <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-white font-semibold text-xl line-clamp-1">
                                        {worldInfo.name}
                                      </h3>
                                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                        worldInfo.visibility === 'public' 
                                          ? 'bg-green-500/20 text-green-400' 
                                          : worldInfo.visibility === 'unlisted'
                                          ? 'bg-yellow-500/20 text-yellow-400'
                                          : 'bg-gray-500/20 text-gray-400'
                                      }`}>
                                        {worldInfo.visibility}
                                      </span>
                                    </div>
                                    <p className="text-gray-400 text-base line-clamp-2 mb-3">
                                      {worldInfo.short_description || "No description available"}
                                    </p>
                                    
                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-base text-gray-500 mb-3">
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        {worldInfo.entriesCount || 0} entries
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {worldInfo.likesCount || 0} likes
                                      </span>
                                      <span>{worldInfo.interaction_count} uses</span>
                                    </div>

                                    {/* Tags */}
                                    {worldInfo.tags && worldInfo.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {worldInfo.tags.slice(0, 3).map((tag) => (
                                          <Badge key={tag.id} variant="secondary" className="text-sm">
                                            {tag.name}
                                          </Badge>
                                        ))}
                                        {worldInfo.tags.length > 3 && (
                                          <Badge variant="secondary" className="text-sm">
                                            +{worldInfo.tags.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                 <AlertDialog>
                                   <AlertDialogTrigger asChild>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={(e) => e.stopPropagation()}
                                       className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                     >
                                       <Trash2 className="w-4 h-4" />
                                     </Button>
                                   </AlertDialogTrigger>
                                   <AlertDialogContent>
                                     <AlertDialogHeader>
                                       <AlertDialogTitle>Delete World Info</AlertDialogTitle>
                                       <AlertDialogDescription>
                                         Are you sure you want to delete "{worldInfo.name}"? This action cannot be undone and will delete all associated entries.
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
                               
                                {/* Action Button - Bottom Right */}
                                <div className="absolute bottom-4 right-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectWorldInfo(worldInfo)}
                                    className="border-primary/50 text-primary hover:bg-primary/10"
                                  >
                                    View
                                  </Button>
                                </div>
                             </CardContent>
                           </Card>
                         ))}
                        
                        {worldInfos.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No world infos created yet</p>
                            <p className="text-sm">Click "Create New" to get started</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* User's Collection Column */}
                    <div>
                      <h2 className="text-white text-xl font-semibold mb-6 flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        My Collection ({collectedWorldInfos.length})
                      </h2>
                      <div className="space-y-4">
                         {collectedWorldInfos.map((worldInfo) => (
                           <Card
                             key={worldInfo.id}
                             className="bg-[#1a1a2e] border-gray-700/50 hover:border-[#FF7A00]/50 transition-all duration-300 hover:shadow-lg relative"
                           >
                             <CardContent className="p-6 pb-16">
                               <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-white font-semibold text-xl line-clamp-1">
                                        {worldInfo.name}
                                      </h3>
                                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                        worldInfo.visibility === 'public' 
                                          ? 'bg-green-500/20 text-green-400' 
                                          : worldInfo.visibility === 'unlisted'
                                          ? 'bg-yellow-500/20 text-yellow-400'
                                          : 'bg-gray-500/20 text-gray-400'
                                      }`}>
                                        {worldInfo.visibility}
                                      </span>
                                    </div>
                                    <p className="text-gray-400 text-base line-clamp-2 mb-3">
                                      {worldInfo.short_description || "No description available"}
                                    </p>
                                    
                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-base text-gray-500 mb-3">
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        {worldInfo.entriesCount || 0} entries
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {worldInfo.likesCount || 0} likes
                                      </span>
                                      <span>by @{worldInfo.creator?.username || 'Unknown'}</span>
                                    </div>

                                    {/* Tags */}
                                    {worldInfo.tags && worldInfo.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {worldInfo.tags.slice(0, 3).map((tag) => (
                                          <Badge key={tag.id} variant="secondary" className="text-sm">
                                            {tag.name}
                                          </Badge>
                                        ))}
                                        {worldInfo.tags.length > 3 && (
                                          <Badge variant="secondary" className="text-sm">
                                            +{worldInfo.tags.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     // Remove from collection logic would go here
                                   }}
                                   className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                 >
                                   <X className="w-4 h-4" />
                                 </Button>
                               </div>
                               
                               {/* Action Button - Bottom Right */}
                               <div className="absolute bottom-4 right-4">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleSelectWorldInfo(worldInfo)}
                                   className="border-primary/50 text-primary hover:bg-primary/10"
                                 >
                                   View
                                 </Button>
                               </div>
                             </CardContent>
                           </Card>
                         ))}
                        
                        {collectedWorldInfos.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No world infos in collection</p>
                            <p className="text-sm">Discover and add world infos from the community</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-[#121212]">
              {/* Back Button Header */}
              <div className="p-6 border-b border-gray-700/50">
                <Button
                  onClick={handleBackToList}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to World Infos
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto">
                {isCreating ? (
                  <div className="p-6">
                    <Card className="border-primary/20 bg-gray-800/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                          <BookOpen className="w-5 h-5" />
                          New World Info
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
                            placeholder="Enter world info name"
                            className="bg-gray-800/50 border-gray-600 text-white"
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
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-visibility">Visibility</Label>
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
                        <TagSection
                          selectedTags={selectedTags}
                          availableTags={availableTags}
                          onAddTag={(tagId: string) => {
                            const tagToAdd = availableTags.find(tag => tag.id.toString() === tagId);
                            if (tagToAdd && !selectedTags.some(tag => tag.id === tagToAdd.id)) {
                              setSelectedTags(prev => [...prev, tagToAdd]);
                            }
                          }}
                          onRemoveTag={(tagId: number) => {
                            setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
                          }}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleCreateNew} disabled={saving || uploadingAvatar} className="flex-1">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            {saving ? 'Creating...' : 'Create'}
                          </Button>
                          <Button variant="outline" onClick={handleBackToList}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : selectedWorldInfo ? (
                  <div className="p-6 space-y-6">
                    {/* Basic Information Card */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <User className="w-5 h-5" />
                          World Info Details
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
                                <Label htmlFor="edit-name" className="text-white">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="World info name"
                                  className="bg-gray-800/50 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-visibility" className="text-white">Visibility</Label>
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
                            <div>
                              <Label htmlFor="edit-description" className="text-white">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Brief description of this world"
                                rows={3}
                                className="bg-gray-800/50 border-gray-600 text-white"
                              />
                            </div>
                            <TagSection
                              selectedTags={selectedTags}
                              availableTags={availableTags}
                              onAddTag={handleAddTag}
                              onRemoveTag={handleRemoveTag}
                            />
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
                                <h2 className="text-3xl font-bold text-white">{selectedWorldInfo.name}</h2>
                                <p className="text-gray-400 mt-2 text-lg">
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
                              onAddTag={handleAddTag}
                              onRemoveTag={handleRemoveTag}
                            />
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* World Info Entries Card */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-white">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            World Info Entries
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                              <Input
                                placeholder="Search entries..."
                                value={entriesSearchQuery}
                                onChange={(e) => setEntriesSearchQuery(e.target.value)}
                                className="pl-8 w-64 bg-gray-800/50 border-gray-600 text-white"
                              />
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add New Entry Form */}
                        <Card className="bg-gray-700/50 border-gray-600">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                              <Plus className="w-4 h-4" />
                              Add New Entry
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="new-entry-keywords" className="text-white">Keywords (comma-separated)</Label>
                                <Input
                                  id="new-entry-keywords"
                                  value={newEntryKeywords}
                                  onChange={(e) => setNewEntryKeywords(e.target.value)}
                                  placeholder="character name, location, event"
                                  className="bg-gray-800/50 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-entry-text" className="text-white">Entry Text</Label>
                                <Textarea
                                  id="new-entry-text"
                                  value={newEntryText}
                                  onChange={(e) => setNewEntryText(e.target.value)}
                                  placeholder="Describe the lore or information"
                                  rows={4}
                                  className="bg-gray-800/50 border-gray-600 text-white"
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
                            <div className="text-center py-12 text-gray-400">
                              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2 text-white">No entries found</h3>
                              <p>{entriesSearchQuery ? 'No entries match your search' : 'Add your first world info entry above to get started.'}</p>
                            </div>
                          ) : (
                            filteredEntries.map((entry) => (
                              <Card key={entry.id} className="border-l-4 border-l-primary/30 bg-gray-700/30 border-gray-600">
                                <CardContent className="p-4">
                                  {editingEntryId === entry.id ? (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-entry-keywords" className="text-white">Keywords</Label>
                                        <Input
                                          id="edit-entry-keywords"
                                          value={editingEntryKeywords}
                                          onChange={(e) => setEditingEntryKeywords(e.target.value)}
                                          className="bg-gray-800/50 border-gray-600 text-white"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-entry-text" className="text-white">Entry Text</Label>
                                        <Textarea
                                          id="edit-entry-text"
                                          value={editingEntryText}
                                          onChange={(e) => setEditingEntryText(e.target.value)}
                                          rows={4}
                                          className="bg-gray-800/50 border-gray-600 text-white"
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
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{entry.entry_text}</p>
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
                                                Are you sure you want to delete this world info entry? This action cannot be undone.
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
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </main>
        
        {/* Import Loading Dialog */}
        <Dialog open={importing} onOpenChange={setImporting}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importing World Info</DialogTitle>
              <DialogDescription>
                Please wait while we process your world info file. This may take a few moments for larger files.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="hidden"
        />
      </div>
    </SidebarProvider>
  );
};

export default WorldInfoCreator;