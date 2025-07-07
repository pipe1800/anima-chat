
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { getPublicProfile, getPrivateProfile } from '@/lib/supabase-queries'
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

export const useCurrentUser = () => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('useCurrentUser: Getting initial session...');
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('useCurrentUser: Initial session:', session?.user ? 'User found' : 'No user');
        
        if (!mounted) return

        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('useCurrentUser: Fetching profile for user:', session.user.id);
          try {
            const { data, error } = await getPrivateProfile(session.user.id)
            console.log('useCurrentUser: Profile fetch result:', { data, error });
            if (error) {
              console.error('Profile fetch error:', error);
            }
            if (mounted) {
              setProfile(data || null)
            }
          } catch (profileError) {
            console.error('Profile fetch failed:', profileError);
            if (mounted) {
              setProfile(null)
            }
          }
        } else {
          setProfile(null)
        }
      } catch (sessionError) {
        console.error('Session fetch failed:', sessionError);
      } finally {
        if (mounted) {
          console.log('useCurrentUser: Setting loading to false');
          setLoading(false)
        }
      }
    }

    // Initialize auth state
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('useCurrentUser: Auth state changed:', event);
          
          if (!mounted) return

          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('useCurrentUser: Fetching profile after auth change for user:', session.user.id);
            try {
              const { data, error } = await getPrivateProfile(session.user.id)
              console.log('useCurrentUser: Profile fetch after auth change:', { data, error });
              if (error) {
                console.error('Profile fetch error after auth change:', error);
              }
              if (mounted) {
                setProfile(data || null)
              }
            } catch (profileError) {
              console.error('Profile fetch failed after auth change:', profileError);
              if (mounted) {
                setProfile(null)
              }
            }
          } else {
            if (mounted) {
              setProfile(null)
            }
          }
        } catch (authError) {
          console.error('Auth state change error:', authError);
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - effect only runs once

  console.log('useCurrentUser hook state:', { user: !!user, profile: !!profile, loading });

  return { user, profile, loading }
}
