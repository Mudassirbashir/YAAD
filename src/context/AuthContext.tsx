import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  getProfile,
  updateProfile as supabaseUpdateProfile,
  deleteUserAccountData,
  isNetworkOrOfflineError,
  formatAuthErrorMessage,
  cleanAuthUrlParams,
  sendPasswordResetEmail as supabaseSendPasswordResetEmail,
} from '../lib/supabase';
import { purgeAllUserOfflineData, getOfflineProfile, saveOfflineProfile } from '../lib/offlineDb';
import { UserProfile, AppLanguage, PasskeyCredentialInfo } from '../types';
import {
  signInWithPasskey as clientSignInWithPasskey,
  registerPasskey as clientRegisterPasskey,
  listUserPasskeys as clientListPasskeys,
  deleteUserPasskey as clientDeletePasskey,
} from '../lib/passkey';

export type AuthState =
  | 'AUTH_LOADING'
  | 'PASSWORD_RESET'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'AUTH_ERROR';

export interface AuthContextType {
  authState: AuthState;
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  oauthError: string | null;
  clearOauthError: () => void;
  isPasswordRecovery: boolean;
  passwordResetError: string | null;
  clearPasswordResetError: () => void;
  clearPasswordRecovery: () => void;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPasskey: () => Promise<{ error: Error | null }>;
  registerPasskey: (deviceName?: string) => Promise<{ success: boolean; passkey?: PasskeyCredentialInfo; error: Error | null }>;
  listPasskeys: () => Promise<PasskeyCredentialInfo[]>;
  removePasskey: (passkeyId: string) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateUserProfile: (updates: {
    full_name?: string;
    phone_number?: string | null;
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
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('yaad_password_recovery_active') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const clearOauthError = useCallback(() => setOauthError(null), []);
  const clearPasswordResetError = useCallback(() => setPasswordResetError(null), []);
  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    setPasswordResetError(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('yaad_password_recovery_active');
      } catch {}
    }
  }, []);

  const isAuthenticatingRef = useRef<boolean>(false);
  const syncingUserIdsRef = useRef<Set<string>>(new Set());

  // Helper to sync user metadata (Google OAuth or email) into profiles table non-blockingly
  const syncProfileFromUser = async (authUser: User): Promise<UserProfile | null> => {
    if (syncingUserIdsRef.current.has(authUser.id)) return null;
    syncingUserIdsRef.current.add(authUser.id);

    try {
      let existingProfile = await getProfile(authUser.id);
      
      // Account linking check: If no profile by ID but user has email, check for existing profile by email
      if (!existingProfile && authUser.email && supabase) {
        const { data: matchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', authUser.email.toLowerCase())
          .maybeSingle();
        if (matchedProfile) {
          existingProfile = matchedProfile;
        }
      }

      const meta = authUser.user_metadata || {};
      const metaFullName = meta.full_name || meta.name || '';
      const metaPhone = meta.phone_number || meta.phone || authUser.phone || '';
      const metaAvatar = meta.avatar_url || meta.picture || '';

      const needsSync =
        !existingProfile ||
        !existingProfile.full_name ||
        (!existingProfile.phone_number && metaPhone) ||
        (!existingProfile.avatar_url && metaAvatar);

      if (needsSync) {
        const { data } = await supabaseUpdateProfile(authUser.id, {
          full_name: metaFullName || existingProfile?.full_name || undefined,
          phone_number: metaPhone || existingProfile?.phone_number || undefined,
          phone: metaPhone || existingProfile?.phone || existingProfile?.phone_number || undefined,
          avatar_url: metaAvatar || existingProfile?.avatar_url || undefined,
          email: authUser.email,
          has_completed_setup: true,
        });
        if (data) return data;
      }
      return existingProfile;
    } catch (e) {
      console.warn('Notice syncing profile from user metadata:', e);
      return null;
    } finally {
      syncingUserIdsRef.current.delete(authUser.id);
    }
  };

  // Initialize session and auth state listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check for OAuth cancellation, errors, or password recovery in URL parameters on mount
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashStr = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashStr);

        // Check if user clicked a password reset / recovery link
        const typeParam = searchParams.get('type') || hashParams.get('type');
        const isRecoveryHash =
          window.location.hash.includes('type=recovery') ||
          typeParam === 'recovery' ||
          searchParams.get('type') === 'recovery';

        if (isRecoveryHash) {
          setIsPasswordRecovery(true);
          try {
            sessionStorage.setItem('yaad_password_recovery_active', 'true');
          } catch {}
        }

        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDesc =
          searchParams.get('error_description') || hashParams.get('error_description') || '';

        if (errorParam || errorCode) {
          const lowerDesc = errorDesc.toLowerCase();
          const lowerCode = (errorCode || '').toLowerCase();

          // Check if this error relates to password reset / recovery token expiration or invalidity
          if (
            lowerCode === 'otp_expired' ||
            lowerCode === 'token_expired' ||
            lowerDesc.includes('expired') ||
            lowerDesc.includes('otp') ||
            lowerDesc.includes('recovery') ||
            lowerDesc.includes('invalid') ||
            lowerDesc.includes('already been used')
          ) {
            setPasswordResetError('This password reset link is invalid or has expired. Please request a new one.');
            setIsPasswordRecovery(false);
            try {
              sessionStorage.removeItem('yaad_password_recovery_active');
            } catch {}
          } else if (
            errorParam === 'access_denied' ||
            lowerDesc.includes('access_denied') ||
            lowerDesc.includes('denied') ||
            lowerDesc.includes('cancel')
          ) {
            setOauthError(
              'Google sign-in was cancelled. You can try again or continue with another sign-in method.'
            );
          } else {
            setOauthError(
              'Google sign-in could not be completed. Please try again or sign in with Email.'
            );
          }
          cleanAuthUrlParams();
        } else if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
          // Allow Supabase OAuth listener to process token, then clean URL
          setTimeout(() => {
            cleanAuthUrlParams();
          }, 350);
        } else if (window.location.hash === '#' || window.location.hash.startsWith('#_=_')) {
          cleanAuthUrlParams();
        }
      } catch (e) {
        console.warn('Notice parsing OAuth URL parameters on mount:', e);
      }
    }

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        // Clean up OAuth callback tokens/code/trailing hash from browser URL bar safely without reloading
        cleanAuthUrlParams();

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          try {
            sessionStorage.setItem('yaad_password_recovery_active', 'true');
          } catch {}
        }

        if (event === 'SIGNED_OUT' || !currentSession?.user) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // For token refreshes, simply update tokens without triggering profile refetches
        if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession.user);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);

        // 1. Immediately hydrate profile from local IndexedDB cache
        const cachedProfile = await getOfflineProfile<UserProfile>(currentSession.user.id);
        if (cachedProfile && isMounted) {
          setProfile(cachedProfile);
        } else if (isMounted) {
          const fallbackProfile: UserProfile = {
            id: currentSession.user.id,
            full_name: currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name || null,
            email: currentSession.user.email || null,
            phone_number: currentSession.user.user_metadata?.phone_number || currentSession.user.user_metadata?.phone || null,
            avatar_url: currentSession.user.user_metadata?.avatar_url || currentSession.user.user_metadata?.picture || null,
            has_completed_setup: true,
          };
          setProfile(fallbackProfile);
          saveOfflineProfile(currentSession.user.id, fallbackProfile).catch(() => {});
        }

        setIsLoading(false);

        // 2. Perform background synchronization without freezing the UI
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        if (!isOffline && currentSession.user) {
          syncProfileFromUser(currentSession.user).then(async (synced) => {
            if (synced && isMounted) {
              setProfile(synced);
              await saveOfflineProfile(currentSession.user.id, synced);
            }
          }).catch(() => {});
        }
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
      return { error: new Error('An authentication request is already in progress.') };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error('Internet connection is unavailable. Please check your connection and try again.') };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    isAuthenticatingRef.current = true;

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
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
          phone_number: data.user.user_metadata?.phone_number || data.user.user_metadata?.phone || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          has_completed_setup: true,
        };
        setProfile(activeProfile);
        saveOfflineProfile(data.user.id, activeProfile).catch(() => {});
        localStorage.setItem('yaad_profile_setup_done', 'true');
        localStorage.setItem('yaad_profile_setup_completed', 'true');
        localStorage.setItem('yaad_has_onboarded_v2', 'true');
        localStorage.setItem('yaad_has_onboarded', 'true');
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ): Promise<{ error: Error | null }> => {
    // Prevent duplicate concurrent requests (double clicks)
    if (isAuthenticatingRef.current) {
      return { error: new Error('An authentication request is already in progress.') };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error('Internet connection is unavailable. Please check your connection and try again.') };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = (phoneNumber || '').trim();

    if (!trimmedEmail) {
      return { error: new Error('Please enter a valid email address.') };
    }
    if (!trimmedName) {
      return { error: new Error('Please enter your full name.') };
    }
    if (!trimmedPhone) {
      return { error: new Error('Please enter your phone number.') };
    }
    if (!password || password.length < 6) {
      return { error: new Error('Please choose a stronger password.') };
    }

    isAuthenticatingRef.current = true;

    try {
      // 1. Direct standard Supabase signup with user metadata
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
            phone: trimmedPhone,
            phone_number: trimmedPhone,
          },
        },
      });

      if (error) {
        return { error: new Error(formatAuthErrorMessage(error)) };
      }

      // If Supabase returned an already-registered user without identities
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: new Error('This email is already registered. Please sign in instead.') };
      }

      let activeSession = data.session;
      let activeUser = data.user;

      // 2. Immediate session recovery if "Confirm email" was still enabled in Supabase project
      if (!activeSession && activeUser) {
        try {
          const confirmResp = await fetch('/api/auth/confirm-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUser.id, email: trimmedEmail }),
          });

          if (confirmResp.ok) {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
            if (signInData?.session) {
              activeSession = signInData.session;
              activeUser = signInData.user;
            }
          }
        } catch (confirmErr) {
          console.warn('Auto-confirm attempt notice:', confirmErr);
        }
      }

      // 3. Authenticated session successfully established
      if (activeSession && activeUser) {
        setSession(activeSession);
        setUser(activeUser);

        const activeProfile: UserProfile = {
          id: activeUser.id,
          full_name: trimmedName,
          email: trimmedEmail,
          phone_number: trimmedPhone || null,
          avatar_url: null,
          language: 'en',
          has_completed_setup: true,
          updated_at: new Date().toISOString(),
        };

        setProfile(activeProfile);

        // Synchronize profile row into public.profiles
        try {
          await supabaseUpdateProfile(activeUser.id, {
            full_name: trimmedName,
            phone_number: trimmedPhone,
            email: trimmedEmail,
            has_completed_setup: true,
          });
        } catch (profileErr) {
          console.warn('Profile synchronization notice:', profileErr);
        }

        // Cache locally for instant offline availability
        await saveOfflineProfile(activeUser.id, activeProfile);
        localStorage.setItem('yaad_profile_setup_done', 'true');
        localStorage.setItem('yaad_profile_setup_completed', 'true');
        localStorage.setItem('yaad_has_onboarded_v2', 'true');
        localStorage.setItem('yaad_has_onboarded', 'true');

        return { error: null };
      }

      if (!activeSession && activeUser) {
        return {
          error: new Error(
            'Account created, but verification is required by your Supabase project settings. Please turn off "Confirm email" in your Supabase Dashboard (Authentication → Providers → Email) to enable instant signup.'
          ),
        };
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    if (isAuthenticatingRef.current) {
      return { error: new Error('An authentication request is already in progress.') };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error("You're offline. Please reconnect to sign in.") };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    isAuthenticatingRef.current = true;
    try {
      const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: isInIframe,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return { error: new Error(formatAuthErrorMessage(error)) };
      }

      if (isInIframe && data?.url) {
        // When running inside an iframe (such as AI Studio preview), opening in a top or popup tab prevents
        // Google OAuth from being blocked by X-Frame-Options: SAMEORIGIN
        const opened = window.open(data.url, '_blank');
        if (!opened) {
          window.location.href = data.url;
        }
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const signInWithPasskey = async (): Promise<{ error: Error | null }> => {
    if (isAuthenticatingRef.current) {
      return { error: new Error('An authentication request is already in progress.') };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error("You're offline. Please reconnect to sign in.") };
    }
    if (!supabase) {
      return { error: new Error('Backend service is not configured.') };
    }

    isAuthenticatingRef.current = true;
    try {
      const result = await clientSignInWithPasskey();
      if (result.error) {
        return { error: result.error };
      }

      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);

        const cached = await getOfflineProfile<UserProfile>(result.data.user.id);
        const activeProfile: UserProfile = cached || {
          id: result.data.user.id,
          full_name: result.data.user.user_metadata?.full_name || result.data.user.user_metadata?.name || null,
          email: result.data.user.email || null,
          phone_number: result.data.user.user_metadata?.phone_number || result.data.user.user_metadata?.phone || null,
          avatar_url: result.data.user.user_metadata?.avatar_url || null,
          has_completed_setup: true,
        };
        setProfile(activeProfile);
        saveOfflineProfile(result.data.user.id, activeProfile).catch(() => {});
        localStorage.setItem('yaad_profile_setup_done', 'true');
        localStorage.setItem('yaad_profile_setup_completed', 'true');
        localStorage.setItem('yaad_has_onboarded_v2', 'true');
        localStorage.setItem('yaad_has_onboarded', 'true');
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: new Error(formatAuthErrorMessage(err)) };
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const registerPasskey = async (
    deviceName?: string
  ): Promise<{ success: boolean; passkey?: PasskeyCredentialInfo; error: Error | null }> => {
    if (!session?.access_token) {
      return { success: false, error: new Error('You must be signed in to register a passkey.') };
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: new Error("You're offline. Please reconnect to register a passkey.") };
    }

    const res = await clientRegisterPasskey(deviceName);
    if (!res.success) {
      return { success: false, error: res.error || new Error('Failed to register passkey.') };
    }
    return { success: true, passkey: res.passkey, error: null };
  };

  const listPasskeys = async (): Promise<PasskeyCredentialInfo[]> => {
    if (!session?.access_token) return [];
    return clientListPasskeys();
  };

  const removePasskey = async (passkeyId: string): Promise<{ success: boolean; error: Error | null }> => {
    if (!session?.access_token) {
      return { success: false, error: new Error('You must be signed in.') };
    }
    const res = await clientDeletePasskey(passkeyId);
    if (!res.success) {
      return { success: false, error: res.error || new Error('Failed to remove passkey.') };
    }
    return { success: true, error: null };
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

  const sendPasswordResetEmail = async (email: string): Promise<{ error: Error | null }> => {
    return await supabaseSendPasswordResetEmail(email);
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (!supabase) {
      return { error: new Error('Backend service is not available.') };
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error("You're offline. Please reconnect to update your password.") };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: new Error(formatAuthErrorMessage(error)) };
      }
      setIsPasswordRecovery(false);
      setPasswordResetError(null);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('yaad_password_recovery_active');
        } catch {}
      }
      // Refresh current session to ensure clean authenticated state
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
      } catch (e) {
        console.warn('Notice refreshing session after password update:', e);
      }
      return { error: null };
    } catch (err: unknown) {
      if (isNetworkOrOfflineError(err)) {
        return { error: new Error("You're offline. Please reconnect to update your password.") };
      }
      return { error: new Error(formatAuthErrorMessage(err)) };
    }
  };

  const updateUserProfile = async (updates: {
    full_name?: string;
    phone_number?: string | null;
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
        phone_number: updates.phone_number !== undefined ? (updates.phone_number || null) : (profile?.phone_number ?? null),
        avatar_url: updates.avatar_url !== undefined ? (updates.avatar_url || null) : (profile?.avatar_url ?? null),
        language: updates.language !== undefined ? updates.language : (profile?.language ?? 'en'),
        usage_purpose: updates.usage_purpose !== undefined ? updates.usage_purpose : profile?.usage_purpose,
        referral_source: updates.referral_source !== undefined ? updates.referral_source : profile?.referral_source,
        has_completed_setup: updates.has_completed_setup !== undefined ? updates.has_completed_setup : profile?.has_completed_setup,
      };

      setProfile(optimisticMerged);
      await saveOfflineProfile(currentUserId, optimisticMerged);

      // 2. Keep Supabase Auth user_metadata in sync so auth session restores correctly
      if (supabase && (updates.full_name !== undefined || updates.avatar_url !== undefined || updates.phone_number !== undefined)) {
        try {
          const metadataUpdates: Record<string, unknown> = {};
          if (updates.full_name !== undefined) metadataUpdates.full_name = updates.full_name;
          if (updates.avatar_url !== undefined) metadataUpdates.avatar_url = updates.avatar_url;
          if (updates.phone_number !== undefined) {
            metadataUpdates.phone_number = updates.phone_number;
            metadataUpdates.phone = updates.phone_number;
          }
          await supabase.auth.updateUser({ data: metadataUpdates });
        } catch (authMetaErr) {
          console.warn('Notice updating user metadata in Supabase Auth:', authMetaErr);
        }
      }

      // Also call /api/account/phone for verified server-side persistence
      if (updates.phone_number !== undefined && session?.access_token) {
        try {
          await fetch('/api/account/phone', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              userId: currentUserId,
              phoneNumber: updates.phone_number,
            }),
          });
        } catch (phoneApiErr) {
          console.warn('Notice updating phone via server endpoint:', phoneApiErr);
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

  const authState: AuthState = useMemo(() => {
    if (isLoading) return 'AUTH_LOADING';
    if (isPasswordRecovery) return 'PASSWORD_RESET';
    if (user) return 'AUTHENTICATED';
    if (oauthError || passwordResetError) return 'AUTH_ERROR';
    return 'UNAUTHENTICATED';
  }, [isLoading, isPasswordRecovery, user, oauthError, passwordResetError]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithPasskey,
        registerPasskey,
        listPasskeys,
        removePasskey,
        signOut,
        deleteAccount,
        updatePassword,
        updateUserProfile,
        refreshProfile,
        oauthError,
        clearOauthError,
        isPasswordRecovery,
        passwordResetError,
        clearPasswordResetError,
        clearPasswordRecovery,
        sendPasswordResetEmail,
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
