
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { getPublicProfile, getPrivateProfile } from '@/lib/supabase-queries'
import { useAuth } from '@/contexts/AuthContext'
import type { Profile } from '@/types/database'

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!userId) {
          setProfile(null)
          return
        }

        // Get current user to determine if this is their own profile
        const { data: { user } } = await supabase.auth.getUser()
        const isOwnProfile = user?.id === userId

        // Use appropriate query based on whether it's the user's own profile
        const { data, error } = isOwnProfile 
          ? await getPrivateProfile(userId)
          : await getPublicProfile(userId)

        if (error) throw error
        
        // For public profiles, we need to cast the partial data to Profile
        // since we only fetch safe public fields
        setProfile(data as Profile)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const refetch = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      const isOwnProfile = user?.id === userId

      const { data, error } = isOwnProfile 
        ? await getPrivateProfile(userId)
        : await getPublicProfile(userId)

      if (error) throw error
      setProfile(data as Profile)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error, refetch }
}

// Use the global auth context instead of local state management
export const useCurrentUser = () => {
  const { user, profile, loading } = useAuth()
  
  return { 
    user, 
    profile, 
    loading 
  }
}
