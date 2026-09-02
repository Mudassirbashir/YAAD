import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  getProfile,
  updateProfile as supabaseUpdateProfile,
  deleteUserAccountData,
} from '../lib/supabase';
import { purgeAllUserOfflineData } from '../lib/offlineDb';
import { UserProfile, AppLanguage } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateUserProfile: (updates: {
    full_name?: string;
    avatar_url?: string | null;
    language?: AppLanguage;
    usage_purpose?: string;
    referral_source?: string;
    has_completed_setup?: boolean;
  }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to sync user metadata (Google OAuth or email) into profiles table
  const syncProfileFromUser = async (authUser: User) => {
    try {
      const existingProfile = await getProfile(authUser.id);
      const meta = authUser.user_metadata || {};
      const metaFullName = meta.full_name || meta.name || '';
      const metaAvatar = meta.avatar_url || meta.picture || '';

      if (!existingProfile || !existingProfile.full_name) {
        if (metaFullName || metaAvatar) {
          const { data } = await supabaseUpdateProfile(authUser.id, {
            full_name: metaFullName || existingProfile?.full_name || undefined,
            avatar_url: metaAvatar || existingProfile?.avatar_url || undefined,
            email: authUser.email,
          });
          if (data) return data;
        }
      }
      return existingProfile;
    } catch (e) {
      console.warn('Error syncing profile from user metadata:', e);
      return null;
    }
  };

  // Initialize session and auth state listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase!.auth.getSession();
        if (error) {
          console.warn('Error getting session from Supabase:', error.message);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);

          if (initialSession?.user) {
            const synced = await syncProfileFromUser(initialSession.user);
            if (isMounted) {
              setProfile(synced || {
                id: initialSession.user.id,
                full_name: initialSession.user.user_metadata?.full_name || initialSession.user.user_metadata?.name || null,
                email: initialSession.user.email || null,
                avatar_url: initialSession.user.user_metadata?.avatar_url || initialSession.user.user_metadata?.picture || null,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes (e.g. Google OAuth redirect, login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const synced = await syncProfileFromUser(currentSession.user);
          if (isMounted) {
            setProfile(synced || {
              id: currentSession.user.id,
              full_name: currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name || null,
              email: currentSession.user.email || null,
              avatar_url: currentSession.user.user_metadata?.avatar_url || currentSession.user.user_metadata?.picture || null,
            });
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    if (p) setProfile(p);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase configuration missing in environment variables.') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        const synced = await syncProfileFromUser(data.user);
        setProfile(synced || {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || null,
          email: data.user.email || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      return { error: new Error(msg) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase configuration missing in environment variables.') };
    }
    try {
      const trimmedEmail = email.trim();
      const trimmedName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        // If session was established immediately (e.g. auto-confirm enabled)
        if (data.session) {
          await supabaseUpdateProfile(data.user.id, {
            full_name: trimmedName,
            email: trimmedEmail,
          });

          const p = await getProfile(data.user.id);
          setProfile(p || {
            id: data.user.id,
            full_name: trimmedName,
            email: trimmedEmail,
            avatar_url: null,
          });
        } else {
          // Session is pending confirmation; set local profile state
          setProfile({
            id: data.user.id,
            full_name: trimmedName,
            email: trimmedEmail,
            avatar_url: null,
          });
        }
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      return { error: new Error(msg) };
    }
  };

  const signOut = async () => {
    if (user?.id) {
      try {
        await purgeAllUserOfflineData(user.id);
      } catch (err) {
        console.warn('Could not purge offline data on sign out:', err);
      }
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during sign out:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No authenticated user to delete') };
    }

    const currentUserId = user.id;

    try {
      // 1. Delete all user data in database (shopping_items, shopping_lists, profiles)
      const { error: dataError } = await deleteUserAccountData(currentUserId);
      if (dataError) {
        console.warn('Warning deleting account data from Supabase:', dataError.message);
      }

      // 2. Call backend /api/account/delete endpoint with JWT token for full admin clean up
      if (session?.access_token) {
        try {
          await fetch('/api/account/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ userId: currentUserId }),
          });
        } catch (e) {
          console.warn('Server account delete notice:', e);
        }
      }

      // 3. Purge user offline data from IndexedDB and localStorage
      try {
        await purgeAllUserOfflineData(currentUserId);
        localStorage.removeItem(`yaad_shopping_lists_u_${currentUserId}`);
        localStorage.removeItem('yaad_shopping_lists_guest');
        localStorage.removeItem('yaad_user_language');
      } catch (e) {
        console.warn('Could not clear user local offline storage:', e);
      }

      // 4. Terminate Supabase session
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('Notice signing out after account deletion:', err);
        }
      }

      // 5. Clear local auth state
      setUser(null);
      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account';
      return { error: new Error(msg) };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (!supabase) {
      return { error: new Error('Backend is not available') };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      return { error: new Error(msg) };
    }
  };

  const updateUserProfile = async (updates: {
    full_name?: string;
    avatar_url?: string | null;
    language?: AppLanguage;
    usage_purpose?: string;
    referral_source?: string;
    has_completed_setup?: boolean;
  }) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      const { data, error } = await supabaseUpdateProfile(user.id, {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url ?? undefined,
        language: updates.language,
        usage_purpose: updates.usage_purpose,
        referral_source: updates.referral_source,
        has_completed_setup: updates.has_completed_setup,
        email: user.email,
      });

      if (error) {
        return { error };
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile((prev) => (prev ? { ...prev, ...updates, avatar_url: updates.avatar_url ?? undefined } : null));
      }

      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return { error: new Error(msg) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        updatePassword,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
