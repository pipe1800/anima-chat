import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface WorldInfoCreationData {
  name: string;
  short_description?: string;
  avatar_url?: string;
  visibility: 'public' | 'unlisted' | 'private';
}

export interface WorldInfoEntryData {
  keywords: string[];
  entry_text: string;
}

export const createWorldInfo = async (worldInfoData: WorldInfoCreationData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const worldInfoInsert: TablesInsert<'world_infos'> = {
      creator_id: user.user.id,
      name: worldInfoData.name,
      short_description: worldInfoData.short_description,
      avatar_url: worldInfoData.avatar_url,
      visibility: worldInfoData.visibility
    };

    const { data: worldInfo, error } = await supabase
      .from('world_infos')
      .insert(worldInfoInsert)
      .select()
      .single();

    if (error || !worldInfo) {
      console.error('Error creating world info:', error);
      throw new Error('Failed to create world info');
    }

    return worldInfo;
  } catch (error) {
    console.error('Error in createWorldInfo:', error);
    throw error;
  }
};

export const getWorldInfosByUser = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: worldInfos, error } = await supabase
      .from('world_infos')
      .select('*')
      .eq('creator_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching world infos:', error);
      throw new Error('Failed to fetch world infos');
    }

    return worldInfos || [];
  } catch (error) {
    console.error('Error in getWorldInfosByUser:', error);
    throw error;
  }
};

export const getWorldInfoWithEntries = async (worldInfoId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Get world info
    const { data: worldInfo, error: worldInfoError } = await supabase
      .from('world_infos')
      .select('*')
      .eq('id', worldInfoId)
      .single();

    if (worldInfoError || !worldInfo) {
      console.error('Error fetching world info:', worldInfoError);
      throw new Error('Failed to fetch world info');
    }

    // Get entries
    const { data: entries, error: entriesError } = await supabase
      .from('world_info_entries')
      .select('*')
      .eq('world_info_id', worldInfoId)
      .order('created_at', { ascending: false });

    if (entriesError) {
      console.error('Error fetching world info entries:', entriesError);
      throw new Error('Failed to fetch world info entries');
    }

    return {
      ...worldInfo,
      entries: entries || []
    };
  } catch (error) {
    console.error('Error in getWorldInfoWithEntries:', error);
    throw error;
  }
};

export const updateWorldInfo = async (worldInfoId: string, worldInfoData: WorldInfoCreationData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const worldInfoUpdate: TablesUpdate<'world_infos'> = {
      name: worldInfoData.name,
      short_description: worldInfoData.short_description,
      avatar_url: worldInfoData.avatar_url,
      visibility: worldInfoData.visibility
    };

    const { data: worldInfo, error } = await supabase
      .from('world_infos')
      .update(worldInfoUpdate)
      .eq('id', worldInfoId)
      .eq('creator_id', user.user.id) // Ensure user owns the world info
      .select()
      .single();

    if (error || !worldInfo) {
      console.error('Error updating world info:', error);
      throw new Error('Failed to update world info');
    }

    return worldInfo;
  } catch (error) {
    console.error('Error in updateWorldInfo:', error);
    throw error;
  }
};

export const deleteWorldInfo = async (worldInfoId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('world_infos')
      .delete()
      .eq('id', worldInfoId)
      .eq('creator_id', user.user.id); // Ensure user owns the world info

    if (error) {
      console.error('Error deleting world info:', error);
      throw new Error('Failed to delete world info');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorldInfo:', error);
    throw error;
  }
};

export const addWorldInfoEntry = async (worldInfoId: string, entryData: WorldInfoEntryData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // First verify the user owns the world info
    const { data: worldInfo } = await supabase
      .from('world_infos')
      .select('creator_id')
      .eq('id', worldInfoId)
      .single();

    if (!worldInfo || worldInfo.creator_id !== user.user.id) {
      throw new Error('Unauthorized to add entries to this world info');
    }

    const entryInsert: TablesInsert<'world_info_entries'> = {
      world_info_id: worldInfoId,
      keywords: entryData.keywords,
      entry_text: entryData.entry_text
    };

    const { data: entry, error } = await supabase
      .from('world_info_entries')
      .insert(entryInsert)
      .select()
      .single();

    if (error || !entry) {
      console.error('Error adding world info entry:', error);
      throw new Error('Failed to add world info entry');
    }

    return entry;
  } catch (error) {
    console.error('Error in addWorldInfoEntry:', error);
    throw error;
  }
};

export const updateWorldInfoEntry = async (entryId: string, entryData: WorldInfoEntryData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // First verify the user owns the world info that contains this entry
    const { data: entry } = await supabase
      .from('world_info_entries')
      .select('world_info_id, world_infos!inner(creator_id)')
      .eq('id', entryId)
      .single();

    if (!entry || entry.world_infos.creator_id !== user.user.id) {
      throw new Error('Unauthorized to update this entry');
    }

    const entryUpdate: TablesUpdate<'world_info_entries'> = {
      keywords: entryData.keywords,
      entry_text: entryData.entry_text
    };

    const { data: updatedEntry, error } = await supabase
      .from('world_info_entries')
      .update(entryUpdate)
      .eq('id', entryId)
      .select()
      .single();

    if (error || !updatedEntry) {
      console.error('Error updating world info entry:', error);
      throw new Error('Failed to update world info entry');
    }

    return updatedEntry;
  } catch (error) {
    console.error('Error in updateWorldInfoEntry:', error);
    throw error;
  }
};

export const deleteWorldInfoEntry = async (entryId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // First verify the user owns the world info that contains this entry
    const { data: entry } = await supabase
      .from('world_info_entries')
      .select('world_info_id, world_infos!inner(creator_id)')
      .eq('id', entryId)
      .single();

    if (!entry || entry.world_infos.creator_id !== user.user.id) {
      throw new Error('Unauthorized to delete this entry');
    }

    const { error } = await supabase
      .from('world_info_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting world info entry:', error);
      throw new Error('Failed to delete world info entry');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorldInfoEntry:', error);
    throw error;
  }
};

// =============================================================================
// TAG MANAGEMENT
// =============================================================================

export const getAllTags = async () => {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }

    return tags || [];
  } catch (error) {
    console.error('Error in getAllTags:', error);
    throw error;
  }
};

export const getWorldInfoTags = async (worldInfoId: string) => {
  try {
    const { data: worldInfoTags, error } = await supabase
      .from('world_info_tags')
      .select(`
        tag:tags(id, name)
      `)
      .eq('world_info_id', worldInfoId);

    if (error) {
      console.error('Error fetching world info tags:', error);
      throw new Error('Failed to fetch world info tags');
    }

    return worldInfoTags?.map(wt => wt.tag) || [];
  } catch (error) {
    console.error('Error in getWorldInfoTags:', error);
    throw error;
  }
};

export const addWorldInfoTag = async (worldInfoId: string, tagId: number) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('world_info_tags')
      .insert({
        world_info_id: worldInfoId,
        tag_id: tagId
      });

    if (error) {
      console.error('Error adding world info tag:', error);
      throw new Error('Failed to add tag to world info');
    }

    return true;
  } catch (error) {
    console.error('Error in addWorldInfoTag:', error);
    throw error;
  }
};

export const removeWorldInfoTag = async (worldInfoId: string, tagId: number) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('world_info_tags')
      .delete()
      .eq('world_info_id', worldInfoId)
      .eq('tag_id', tagId);

    if (error) {
      console.error('Error removing world info tag:', error);
      throw new Error('Failed to remove tag from world info');
    }

    return true;
  } catch (error) {
    console.error('Error in removeWorldInfoTag:', error);
    throw error;
  }
};

// =============================================================================
// PUBLIC WORLD INFO OPERATIONS
// =============================================================================

export const getPublicWorldInfoDetails = async (worldInfoId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const isAuthenticated = !!user.user;

    // Fetch the world info with creator profile
    const { data: worldInfo, error: worldInfoError } = await supabase
      .from('world_infos')
      .select(`
        *,
        creator:profiles!creator_id(username, avatar_url)
      `)
      .eq('id', worldInfoId)
      .eq('visibility', 'public')
      .single();

    if (worldInfoError || !worldInfo) {
      console.error('Error fetching world info:', worldInfoError);
      throw new Error('World info not found or not public');
    }

    // Fetch entries
    const { data: entries, error: entriesError } = await supabase
      .from('world_info_entries')
      .select('*')
      .eq('world_info_id', worldInfoId)
      .order('created_at', { ascending: false });

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw new Error('Failed to fetch entries');
    }

    // Fetch tags
    const { data: worldInfoTags, error: tagsError } = await supabase
      .from('world_info_tags')
      .select(`
        tag:tags(id, name)
      `)
      .eq('world_info_id', worldInfoId);

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      throw new Error('Failed to fetch tags');
    }

    const tags = worldInfoTags?.map(wt => wt.tag) || [];

    // Fetch like and favorite status if user is authenticated
    let isLiked = false;
    let isFavorited = false;
    let likesCount = 0;
    let favoritesCount = 0;

    if (isAuthenticated) {
      // Check if user has liked this world info
      const { data: likeData } = await supabase
        .from('world_info_likes')
        .select('id')
        .eq('world_info_id', worldInfoId)
        .eq('user_id', user.user.id)
        .single();

      isLiked = !!likeData;

      // Check if user has favorited this world info
      const { data: favoriteData } = await supabase
        .from('world_info_favorites')
        .select('id')
        .eq('world_info_id', worldInfoId)
        .eq('user_id', user.user.id)
        .single();

      isFavorited = !!favoriteData;
    }

    // Get total likes and favorites count
    const { count: likesCountData } = await supabase
      .from('world_info_likes')
      .select('*', { count: 'exact', head: true })
      .eq('world_info_id', worldInfoId);

    const { count: favoritesCountData } = await supabase
      .from('world_info_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('world_info_id', worldInfoId);

    likesCount = likesCountData || 0;
    favoritesCount = favoritesCountData || 0;

    return {
      ...worldInfo,
      entries: entries || [],
      tags,
      isLiked,
      isFavorited,
      likesCount,
      favoritesCount,
      creator: worldInfo.creator
    };
  } catch (error) {
    console.error('Error in getPublicWorldInfoDetails:', error);
    throw error;
  }
};