import { supabase } from '@/integrations/supabase/client'
import type { Profile, Character, Plan, Subscription, Credits, Chat, Message, OnboardingChecklistItem, UserOnboardingProgress } from '@/types/database'

// =============================================================================
// PROFILE QUERIES - Safe public/private data handling
// =============================================================================

/**
 * Get public profile data (safe for displaying to other users)
 * NEVER use SELECT * on profiles in public contexts!
 */
export const getPublicProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, created_at')
    .eq('id', userId)
    .maybeSingle()

  return { data, error }
}

/**
 * Get complete profile data (only for the current user's own profile)
 */
export const getPrivateProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return { data, error }
}

/**
 * Update user's own profile
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, username, avatar_url, bio, created_at')
    .maybeSingle()

  return { data, error }
}

// =============================================================================
// CHARACTER QUERIES
// =============================================================================

/**
 * Get public characters (for discovery page)
 */
export const getPublicCharacters = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('characters')
    .select(`
      id,
      name,
      short_description,
      avatar_url,
      interaction_count,
      created_at,
      creator_id
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error || !data) {
    return { data: [], error }
  }

  // Fetch creator profiles separately for each character
  const charactersWithCreators = await Promise.all(
    data.map(async (character) => {
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', character.creator_id)
        .maybeSingle()

      return {
        ...character,
        creator: creatorData
      }
    })
  )

  return { data: charactersWithCreators, error: null }
}

/**
 * Get user's own characters (all visibility levels)
 */
export const getUserCharacters = async (userId: string) => {
  const { data, error } = await supabase
    .from('characters')
    .select(`
      id,
      name,
      short_description,
      avatar_url,
      visibility,
      interaction_count,
      created_at,
      updated_at
    `)
    .eq('creator_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !data) {
    return { data: data || [], error }
  }

  // Get actual chat counts and likes for each character
  const charactersWithCounts = await Promise.all(
    data.map(async (character) => {
      // Get actual chat count
      const { count: chatCount } = await supabase
        .from('chats')
        .select('id', { count: 'exact' })
        .eq('character_id', character.id)

      // Get likes count
      const { count: likesCount } = await supabase
        .from('character_likes')
        .select('id', { count: 'exact' })
        .eq('character_id', character.id)

      return {
        ...character,
        actual_chat_count: chatCount || 0,
        likes_count: likesCount || 0
      }
    })
  )

  return { data: charactersWithCounts, error: null }
}

/**
 * Get character with full details (respects visibility rules)
 */
export const getCharacterDetails = async (characterId: string) => {
  console.log('🔍 getCharacterDetails called with characterId:', characterId)

  const { data, error } = await supabase
    .from('characters')
    .select(`
      id,
      name,
      short_description,
      avatar_url,
      visibility,
      interaction_count,
      created_at,
      creator_id
    `)
    .eq('id', characterId)
    .maybeSingle()

  console.log('📊 Character query result:', { data, error })

  if (error || !data) {
    console.error('❌ Failed to fetch character:', error)
    return { data: null, error }
  }

  // Fetch creator profile separately
  console.log('🔍 Fetching creator profile for userId:', data.creator_id)
  const { data: creatorData, error: creatorError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', data.creator_id)
    .maybeSingle()

  console.log('👤 Creator query result:', { creatorData, creatorError })

  // Fetch character definition separately
  console.log('🔍 Fetching character definition for characterId:', characterId)
  const { data: definitionData, error: definitionError } = await supabase
    .from('character_definitions')
    .select('greeting, long_description, definition')
    .eq('character_id', characterId)
    .maybeSingle()

  console.log('📄 Definition query result:', { definitionData, definitionError })

  // Fetch character tags separately
  console.log('🔍 Fetching character tags for characterId:', characterId)
  const { data: tagsData, error: tagsError } = await supabase
    .from('character_tags')
    .select(`
      tag:tags(id, name)
    `)
    .eq('character_id', characterId)

  console.log('🏷️ Tags query result:', { tagsData, tagsError })

  // Combine the data
  const characterWithDetails = {
    ...data,
    creator: creatorData,
    definition: definitionData ? [definitionData] : [],
    tags: tagsData || []
  }

  console.log('✅ Final character with details:', characterWithDetails)

  return { data: characterWithDetails, error: null }
}

/**
 * Create a new character
 */
export const createCharacter = async (characterData: {
  name: string
  short_description?: string
  avatar_url?: string
  visibility?: 'public' | 'unlisted' | 'private'
  definition: string
  greeting?: string
  long_description?: string
}) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  // Create character
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .insert({
      creator_id: user.user.id,
      name: characterData.name,
      short_description: characterData.short_description,
      avatar_url: characterData.avatar_url,
      visibility: characterData.visibility || 'private'
    })
    .select()
    .single()

  if (characterError || !character) return { data: null, error: characterError }

  // Create character definition
  const { error: definitionError } = await supabase
    .from('character_definitions')
    .insert({
      character_id: character.id,
      definition: characterData.definition,
      greeting: characterData.greeting,
      long_description: characterData.long_description
    })

  if (definitionError) {
    // Cleanup: delete the character if definition creation failed
    await supabase.from('characters').delete().eq('id', character.id)
    return { data: null, error: definitionError }
  }

  return { data: character, error: null }
}

// =============================================================================
// BILLING QUERIES
// =============================================================================

/**
 * Get available subscription plans
 */
export const getSubscriptionPlans = async () => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true })

  return { data: data || [], error }
}

/**
 * Get user's current subscription
 */
export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

/**
 * Get user's credit balance
 */
export const getUserCredits = async (userId: string) => {
  const { data, error } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

// =============================================================================
// ONBOARDING QUERIES
// =============================================================================

/**
 * Get onboarding checklist items
 */
export const getOnboardingChecklist = async () => {
  const { data, error } = await supabase
    .from('onboarding_checklist_items')
    .select('*')
    .order('id', { ascending: true })

  return { data: data || [], error }
}

/**
 * Get user's onboarding progress
 */
export const getUserOnboardingProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_onboarding_progress')
    .select(`
      *,
      task:onboarding_checklist_items(*)
    `)
    .eq('user_id', userId)

  return { data: data || [], error }
}

/**
 * Mark onboarding task as completed
 */
export const completeOnboardingTask = async (userId: string, taskId: number) => {
  const { data, error } = await supabase
    .from('user_onboarding_progress')
    .upsert({
      user_id: userId,
      task_id: taskId,
      completed_at: new Date().toISOString()
    })
    .select()

  return { data, error }
}

// =============================================================================
// CHAT QUERIES
// =============================================================================

/**
 * Get user's chat sessions with last message preview
 */
export const getUserChats = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      title,
      last_message_at,
      created_at,
      character:characters(id, name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })

  if (error || !data) {
    return { data: data || [], error }
  }

  // Fetch last message for each chat
  const chatsWithLastMessage = await Promise.all(
    data.map(async (chat) => {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, is_ai_message')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        ...chat,
        lastMessage: lastMessage?.content || null,
        lastMessageIsAI: lastMessage?.is_ai_message || false
      }
    })
  )

  return { data: chatsWithLastMessage, error: null }
}

/**
 * Create a new chat session
 */
export const createChat = async (userId: string, characterId: string, title?: string) => {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      character_id: characterId,
      title: title
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get messages for a chat
 */
export const getChatMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      is_ai_message,
      created_at,
      author_id
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  return { data: data || [], error }
}

/**
 * Create a new message in a chat
 */
export const createMessage = async (chatId: string, authorId: string, content: string, isAiMessage: boolean = false) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      author_id: authorId,
      content: content,
      is_ai_message: isAiMessage
    })
    .select()
    .single()

  // Update the chat's last_message_at timestamp
  if (!error && data) {
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)
  }

  return { data, error }
}

/**
 * Get user's daily message count
 */
export const getDailyMessageCount = async (userId: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('author_id', userId)
    .eq('is_ai_message', false)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())

  return { 
    data: { count: count || 0 }, 
    error 
  }
}

/**
 * Get user's favorite characters
 */
export const getUserFavorites = async (userId: string) => {
  console.log('Fetching favorites for user:', userId);
  
  const { data, error } = await supabase
    .from('character_favorites')
    .select(`
      id,
      created_at,
      character:characters(
        id,
        name,
        short_description,
        avatar_url,
        interaction_count,
        created_at,
        creator_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('Favorites query result:', { data, error });

  if (error) {
    console.error('Error fetching favorites:', error);
    return { data: [], error };
  }

  // Filter out any null characters and map to character data
  const characters = data?.map(fav => fav.character).filter(Boolean) || [];
  
  // Get creator info, actual chat counts and likes for each character
  const charactersWithDetails = await Promise.all(
    characters.map(async (character) => {
      // Get creator profile
      console.log('Fetching creator profile for creator_id:', character.creator_id);
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', character.creator_id)
        .maybeSingle()
      
      console.log('Creator profile result:', { creatorData, creatorError });

      // Get actual chat count
      const { count: chatCount } = await supabase
        .from('chats')
        .select('id', { count: 'exact' })
        .eq('character_id', character.id)

      // Get likes count
      const { count: likesCount } = await supabase
        .from('character_likes')
        .select('id', { count: 'exact' })
        .eq('character_id', character.id)

      return {
        ...character,
        creator: creatorData,
        actual_chat_count: chatCount || 0,
        likes_count: likesCount || 0
      }
    })
  )

  console.log('Processed favorite characters:', charactersWithDetails);
  
  return { data: charactersWithDetails, error: null };
}
