
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

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data } = await getPrivateProfile(user.id);
      setProfile(data || null);
    } catch (error) {
      console.warn('Profile fetch failed:', error);
      setProfile(null);
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first
      clearAuthState();
      
      // Then clear Supabase session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      // Even if signOut fails, we should clear local state
      clearAuthState();
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Clear any potentially corrupted auth state first
        if (typeof window !== 'undefined') {
          // Check for corrupted auth storage and clear if needed
          const keys = Object.keys(localStorage);
          const authKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'));
          
          // If we have auth keys but session retrieval fails, clear storage
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.warn('Session retrieval error, clearing auth storage:', error);
              authKeys.forEach(key => {
                try {
                  localStorage.removeItem(key);
                } catch (e) {
                  console.warn('Failed to clear storage key:', key, e);
                }
              });
            } else if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                try {
                  const { data } = await getPrivateProfile(session.user.id);
                  if (mounted) {
                    setProfile(data || null);
                  }
                } catch (error) {
                  console.warn('Profile fetch failed during init:', error);
                  if (mounted) {
                    setProfile(null);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            // Clear potentially corrupted storage
            authKeys.forEach(key => {
              try {
                localStorage.removeItem(key);
              } catch (e) {
                console.warn('Failed to clear storage key:', key, e);
              }
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const { data } = await getPrivateProfile(session.user.id);
            if (mounted) {
              setProfile(data || null);
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

        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

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
