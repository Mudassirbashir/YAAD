import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  getProfile,
  updateProfile as supabaseUpdateProfile,
  deleteUserAccountData,
  isNetworkOrOfflineError,
  formatAuthErrorMessage,
} from '../lib/supabase';
import { purgeAllUserOfflineData, getOfflineProfile, saveOfflineProfile } from '../lib/offlineDb';
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
  const isAuthenticatingRef = useRef<boolean>(false);

  // Helper to sync user metadata (Google OAuth or email) into profiles table non-blockingly
  const syncProfileFromUser = async (authUser: User): Promise<UserProfile | null> => {
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
            has_completed_setup: true,
          });
          if (data) return data;
        }
      }
      return existingProfile;
    } catch (e) {
      console.warn('Notice syncing profile from user metadata:', e);
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
        // Fast local session restoration from storage
        const { data: { session: initialSession }, error: sessionError } = await supabase!.auth.getSession();
        if (sessionError) {
          console.warn('Session retrieval notice:', sessionError.message);
        }

        if (!isMounted) return;

        if (initialSession?.user) {
          const activeUser = initialSession.user;
          setSession(initialSession);
          setUser(activeUser);

          // 1. Immediately hydrate profile from local IndexedDB cache
          const cachedProfile = await getOfflineProfile<UserProfile>(activeUser.id);
          if (cachedProfile && isMounted) {
            setProfile(cachedProfile);
          } else if (isMounted) {
            const fallbackProfile: UserProfile = {
              id: activeUser.id,
              full_name: activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || null,
              email: activeUser.email || null,
              avatar_url: activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || null,
              has_completed_setup: true,
            };
            setProfile(fallbackProfile);
            saveOfflineProfile(activeUser.id, fallbackProfile).catch(() => {});
          }

          // 2. Unblock rendering immediately!
          setIsLoading(false);

          // 3. Perform background verification & sync without freezing the UI
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          if (!isOffline) {
            syncProfileFromUser(activeUser).then(async (synced) => {
              if (synced && isMounted) {
                setProfile(synced);
                await saveOfflineProfile(activeUser.id, synced);
              }
            }).catch(() => {});
          }
          return;
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn('Auth initialization notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);

        // Deduplicate: If we already have a loaded profile matching this user, perform non-blocking sync
        if (currentSession.user) {
          syncProfileFromUser(currentSession.user).then((synced) => {
            if (synced && isMounted) {
              setProfile(synced);
              saveOfflineProfile(currentSession.user.id, synced).catch(() => {});
            }
          }).catch(() => {});
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

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    // Prevent duplicate concurrent requests
    if (isAuthenticatingRef.current) {
      return { error: null };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error('You are currently offline. Please check your internet connection.') };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    isAuthenticatingRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: new Error(formatAuthErrorMessage(error)) };
      }

      if (data.user) {
        setSession(data.session);
        setUser(data.user);

        // Immediate responsive profile state to prevent any screen freeze
        const cached = await getOfflineProfile<UserProfile>(data.user.id);
        const activeProfile: UserProfile = cached || {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
          email: data.user.email || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          has_completed_setup: true,
        };
        setProfile(activeProfile);
        saveOfflineProfile(data.user.id, activeProfile).catch(() => {});
        localStorage.setItem('yaad_profile_setup_completed', 'true');

        // Background sync non-blockingly
        syncProfileFromUser(data.user).then((synced) => {
          if (synced) {
            setProfile(synced);
            saveOfflineProfile(data.user.id, synced).catch(() => {});
          }
        }).catch(() => {});
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    // Prevent duplicate concurrent requests
    if (isAuthenticatingRef.current) {
      return { error: null };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error('You are currently offline. Please check your internet connection.') };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    isAuthenticatingRef.current = true;

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
        return { error: new Error(formatAuthErrorMessage(error)) };
      }

      if (data.user) {
        const activeProfile: UserProfile = {
          id: data.user.id,
          full_name: trimmedName,
          email: trimmedEmail,
          avatar_url: null,
          language: 'en',
          has_completed_setup: true,
        };

        // Instantly establish authenticated user & profile
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
        }
        setProfile(activeProfile);
        await saveOfflineProfile(data.user.id, activeProfile);
        localStorage.setItem('yaad_profile_setup_completed', 'true');
        localStorage.setItem('yaad_has_onboarded', 'true');

        // Fire-and-forget background sync without holding up signup
        supabaseUpdateProfile(data.user.id, {
          full_name: trimmedName,
          email: trimmedEmail,
          has_completed_setup: true,
        }).catch((e) => console.warn('Background profile create notice:', e));
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
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
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error('Unable to change password while offline. Please check your internet connection.') };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: unknown) {
      if (isNetworkOrOfflineError(err)) {
        return { error: new Error('Unable to reach server. Please check your internet connection and try again.') };
      }
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

    const currentUserId = user.id;

    try {
      // 1. Optimistically compute and update local state and IndexedDB immediately
      const optimisticMerged: UserProfile = {
        id: currentUserId,
        full_name: updates.full_name !== undefined ? (updates.full_name || null) : (profile?.full_name ?? null),
        email: user.email || profile?.email || null,
        avatar_url: updates.avatar_url !== undefined ? (updates.avatar_url || null) : (profile?.avatar_url ?? null),
        language: updates.language !== undefined ? updates.language : (profile?.language ?? 'en'),
        usage_purpose: updates.usage_purpose !== undefined ? updates.usage_purpose : profile?.usage_purpose,
        referral_source: updates.referral_source !== undefined ? updates.referral_source : profile?.referral_source,
        has_completed_setup: updates.has_completed_setup !== undefined ? updates.has_completed_setup : profile?.has_completed_setup,
      };

      setProfile(optimisticMerged);
      await saveOfflineProfile(currentUserId, optimisticMerged);

      // 2. Keep Supabase Auth user_metadata in sync so auth session restores correctly
      if (supabase && (updates.full_name !== undefined || updates.avatar_url !== undefined)) {
        try {
          const metadataUpdates: Record<string, unknown> = {};
          if (updates.full_name !== undefined) metadataUpdates.full_name = updates.full_name;
          if (updates.avatar_url !== undefined) metadataUpdates.avatar_url = updates.avatar_url;
          await supabase.auth.updateUser({ data: metadataUpdates });
        } catch (authMetaErr) {
          console.warn('Notice updating user metadata in Supabase Auth:', authMetaErr);
        }
      }

      // 3. Save to Supabase profiles table
      const { data, error } = await supabaseUpdateProfile(currentUserId, updates);

      if (error) {
        return { error };
      }

      if (data) {
        setProfile(data);
        await saveOfflineProfile(currentUserId, data);
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
