
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
    console.log('Clearing auth state');
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const clearAllAuthStorage = () => {
    console.log('Clearing all auth storage');
    try {
      // Clear all localStorage keys that might contain auth data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.includes('supabase') || 
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('token')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('Removing storage key:', key);
        localStorage.removeItem(key);
      });

      // Also clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.includes('supabase') || 
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('token')
        )) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        console.log('Removing session storage key:', key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      console.log('Refreshing profile for user:', user.id);
      const { data } = await getPrivateProfile(user.id);
      setProfile(data || null);
      console.log('Profile refreshed:', data);
    } catch (error) {
      console.warn('Profile fetch failed:', error);
      setProfile(null);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear local state first
      clearAuthState();
      
      // Clear all storage
      clearAllAuthStorage();
      
      // Then clear Supabase session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Even if signOut fails, we should clear local state
      clearAuthState();
      clearAllAuthStorage();
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('AuthProvider initializing...');

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // First, try to get session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          // Clear potentially corrupted storage
          clearAllAuthStorage();
          
          if (mounted) {
            clearAuthState();
            setLoading(false);
          }
          return;
        }

        console.log('Session retrieved:', session?.user?.email || 'No session');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User found, fetching profile...');
            try {
              const { data } = await getPrivateProfile(session.user.id);
              if (mounted) {
                setProfile(data || null);
                console.log('Profile loaded:', data?.username || 'No profile');
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
        
        // If we get here, something is seriously wrong - clear everything
        clearAllAuthStorage();
        
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('Auth initialization complete');
        }
      }
    };

    // Set up auth state listener
    console.log('Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const { data } = await getPrivateProfile(session.user.id);
            if (mounted) {
              setProfile(data || null);
              console.log('Profile updated from auth change:', data?.username || 'No profile');
            }
          } catch (error) {
            console.warn('Profile fetch failed on auth change:', error);
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
      console.log('Cleaning up auth provider...');
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

  console.log('AuthProvider render:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    userEmail: user?.email 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
