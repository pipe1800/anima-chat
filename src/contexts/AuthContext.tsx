import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getPrivateProfile } from '@/lib/supabase-queries';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await getPrivateProfile(user.id);
      if (error) {
        console.warn('Profile fetch warning:', error);
        // Don't set profile to null on error, keep existing state
      } else {
        setProfile(data || null);
      }
    } catch (error) {
      console.warn('Profile fetch failed:', error);
      // Don't set profile to null on error, keep existing state
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Try to fetch profile, but don't block on failure
          try {
            const { data, error } = await getPrivateProfile(session.user.id);
            if (mounted) {
              if (error) {
                console.warn('Profile fetch warning:', error);
                // Set a minimal profile if none exists
                setProfile(null);
              } else {
                setProfile(data || null);
              }
            }
          } catch (error) {
            console.warn('Profile fetch failed:', error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }

        // Always set loading to false after handling auth state
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              const { data, error: profileError } = await getPrivateProfile(session.user.id);
              if (profileError) {
                console.warn('Profile fetch warning:', profileError);
                setProfile(null);
              } else {
                setProfile(data || null);
              }
            } catch (error) {
              console.warn('Profile fetch failed:', error);
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
