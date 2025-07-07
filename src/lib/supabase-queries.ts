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
    .single()

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
    .single()

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
    .single()

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
      creator:profiles!creator_id(id, username, avatar_url)
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
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

  return { data, error }
}

/**
 * Get character with full details (respects visibility rules)
 */
export const getCharacterDetails = async (characterId: string) => {
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
      creator:profiles!creator_id(id, username, avatar_url),
      definition:character_definitions(greeting, long_description, definition),
      tags:character_tags(tag:tags(id, name))
    `)
    .eq('id', characterId)
    .single()

  return { data, error }
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

  return { data, error }
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
    .single()

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
    .single()

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

  return { data, error }
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

  return { data, error }
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
 * Get user's chat sessions
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

  return { data, error }
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
      author:profiles!author_id(id, username, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

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

  const { data, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('author_id', userId)
    .eq('is_ai_message', false)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())

  return { 
    data: { count: data?.length || 0 }, 
    error 
  }
}
