
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
  const [initialized, setInitialized] = useState(false);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await getPrivateProfile(user.id);
      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
      } else {
        setProfile(data || null);
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
      setProfile(null);
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

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setSession(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Fetch profile non-blocking
            getPrivateProfile(session.user.id)
              .then(({ data, error }) => {
                if (mounted) {
                  if (error) {
                    console.error('Profile fetch error:', error);
                    setProfile(null);
                  } else {
                    setProfile(data || null);
                  }
                  setLoading(false);
                  setInitialized(true);
                }
              })
              .catch((error) => {
                console.error('Profile fetch failed:', error);
                if (mounted) {
                  setProfile(null);
                  setLoading(false);
                  setInitialized(true);
                }
              });
          } else {
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setSession(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile for new sessions
          try {
            const { data, error } = await getPrivateProfile(session.user.id);
            if (mounted) {
              if (error) {
                console.error('Profile fetch error:', error);
                setProfile(null);
              } else {
                setProfile(data || null);
              }
              if (!initialized) {
                setLoading(false);
                setInitialized(true);
              }
            }
          } catch (error) {
            console.error('Profile fetch failed:', error);
            if (mounted) {
              setProfile(null);
              if (!initialized) {
                setLoading(false);
                setInitialized(true);
              }
            }
          }
        } else {
          if (mounted) {
            setProfile(null);
            if (!initialized) {
              setLoading(false);
              setInitialized(true);
            }
          }
        }
      }
    );

    // Initialize auth
    if (!initialized) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

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
