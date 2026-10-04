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
import { purgeAllUserOfflineData, getOfflineProfile, saveOfflineProfile, enqueueOfflineOperation, migrateOfflineUserData } from '../lib/offlineDb';
import { generateUUID } from '../lib/uuid';
import { cleanPhoneNumber } from '../utils/phone';
import { UserProfile, AppLanguage } from '../types';
import { getAuthRedirectUrl } from '../config/siteConfig';

export type AuthState =
  | 'AUTH_LOADING'
  | 'PASSWORD_RESET_REQUIRED'
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
  isPasswordResetRequired: boolean;
  passwordResetError: string | null;
  clearPasswordResetError: () => void;
  clearPasswordRecovery: () => void;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean; user?: User | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
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
  isOfflineUser: boolean;
  startOfflineOnboarding: (data: {
    fullName: string;
    phoneNumber?: string;
    language?: AppLanguage;
  }) => Promise<void>;
}

// Helper to synchronously retrieve cached authenticated user from localStorage
function getPersistedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('yaad_authenticated_user_cache');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id) {
      return parsed as User;
    }
  } catch (e) {
    console.warn('Error reading persisted user:', e);
  }
  return null;
}

// Helper to reliably persist or purge user session in localStorage
function persistUser(userToSave: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userToSave && userToSave.id) {
      const dataToSave = {
        id: userToSave.id,
        email: userToSave.email || null,
        user_metadata: userToSave.user_metadata || {},
        app_metadata: userToSave.app_metadata || {},
        phone: userToSave.phone || userToSave.user_metadata?.phone_number || null,
        created_at: userToSave.created_at || new Date().toISOString(),
        aud: userToSave.aud || 'authenticated',
        is_offline_user: Boolean((userToSave as any).is_offline_user),
      };
      localStorage.setItem('yaad_authenticated_user_cache', JSON.stringify(dataToSave));
      localStorage.setItem('yaad_user_session_persisted', 'true');
      localStorage.setItem('yaad_profile_setup_done', 'true');
      localStorage.setItem('yaad_profile_setup_completed', 'true');
      localStorage.setItem('yaad_has_onboarded_v2', 'true');
      localStorage.setItem('yaad_has_onboarded', 'true');
    } else {
      localStorage.removeItem('yaad_authenticated_user_cache');
      localStorage.removeItem('yaad_user_session_persisted');
    }
  } catch (e) {
    console.warn('Error saving persisted user:', e);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialCachedUser = getPersistedUser();
  const [user, setUser] = useState<User | null>(initialCachedUser);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined' && initialCachedUser?.id) {
      try {
        const rawProfile = localStorage.getItem(`yaad_offline_profile_${initialCachedUser.id}`);
        if (rawProfile) {
          return JSON.parse(rawProfile);
        }
        return {
          id: initialCachedUser.id,
          full_name: initialCachedUser.user_metadata?.full_name || initialCachedUser.user_metadata?.name || null,
          email: initialCachedUser.email || null,
          phone_number: initialCachedUser.user_metadata?.phone_number || initialCachedUser.user_metadata?.phone || null,
          avatar_url: initialCachedUser.user_metadata?.avatar_url || initialCachedUser.user_metadata?.picture || null,
          has_completed_setup: true,
        };
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCachedUser);
  const [isOfflineUser, setIsOfflineUser] = useState<boolean>(() => Boolean((initialCachedUser as any)?.is_offline_user));
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
        localStorage.removeItem('yaad_password_reset_required');
      } catch {}
      cleanAuthUrlParams(true);
    }
  }, []);

  const isAuthenticatingRef = useRef<boolean>(false);
  const isExplicitSignOutRef = useRef<boolean>(false);
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
      const persistedUser = getPersistedUser();
      if (persistedUser) {
        setUser(persistedUser);
      }
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
            localStorage.setItem('yaad_password_reset_required', 'true');
          } catch {}

          // If recovery tokens exist in URL fragment, establish the session with Supabase Auth
          const accToken = hashParams.get('access_token');
          const refToken = hashParams.get('refresh_token');
          if (accToken && refToken) {
            supabase.auth
              .setSession({ access_token: accToken, refresh_token: refToken })
              .then(({ data, error }) => {
                if (!error && data?.session && isMounted) {
                  setSession(data.session);
                  setUser(data.session.user);
                  setIsPasswordRecovery(true);
                  setIsLoading(false);
                }
              })
              .catch((err) => {
                console.warn('Notice establishing recovery session from hash:', err);
              });
          } else if (searchParams.get('code')) {
            const authCode = searchParams.get('code')!;
            supabase.auth
              .exchangeCodeForSession(authCode)
              .then(({ data, error }) => {
                if (!error && data?.session && isMounted) {
                  setSession(data.session);
                  setUser(data.session.user);
                  setIsPasswordRecovery(true);
                  setIsLoading(false);
                }
              })
              .catch((err) => {
                console.warn('Notice exchanging PKCE code for recovery session:', err);
              });
          }
        }

        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDesc =
          searchParams.get('error_description') || hashParams.get('error_description') || '';

        if (errorParam || errorCode) {
          const lowerDesc = errorDesc.toLowerCase();
          const lowerCode = (errorCode || '').toLowerCase();

          // Safe developer diagnostic logging as required
          console.error('[YAAD OAUTH CALLBACK ERROR]', {
            error: errorParam,
            code: errorCode,
            description: errorDesc,
          });

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
            setPasswordResetError('Your reset link has expired. Request a new one.');
            setIsPasswordRecovery(false);
            try {
              sessionStorage.removeItem('yaad_password_recovery_active');
              localStorage.removeItem('yaad_password_reset_required');
            } catch {}
          } else if (
            lowerDesc.includes('database') ||
            lowerDesc.includes('server') ||
            lowerDesc.includes('postgres') ||
            lowerDesc.includes('trigger') ||
            lowerDesc.includes('error saving new user')
          ) {
            setOauthError(
              'A server error occurred during Google sign-in. Please try again or sign in with Email.'
            );
          } else if (
            lowerDesc.includes('user denied') ||
            lowerDesc.includes('user_denied') ||
            lowerDesc.includes('cancelled') ||
            lowerDesc.includes('canceled') ||
            (errorParam === 'access_denied' && !errorDesc)
          ) {
            setOauthError(
              'Google sign-in was cancelled. You can try again or continue with another sign-in method.'
            );
          } else {
            setOauthError(
              formatAuthErrorMessage(errorDesc || errorParam || 'Google sign-in could not be completed.')
            );
          }
          cleanAuthUrlParams(true);
        } else if (!isRecoveryHash && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
          // Allow Supabase OAuth listener to process token, then clean URL (non-recovery only)
          setTimeout(() => {
            cleanAuthUrlParams();
          }, 1500);
        } else if (window.location.hash === '#' || window.location.hash.startsWith('#_=_')) {
          cleanAuthUrlParams();
        }
      } catch (e) {
        console.warn('Notice parsing OAuth URL parameters on mount:', e);
      }
    }

    let initialSessionResolved = false;

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          try {
            sessionStorage.setItem('yaad_password_recovery_active', 'true');
            localStorage.setItem('yaad_password_reset_required', 'true');
          } catch {}

          if (currentSession) {
            setSession(currentSession);
            if (currentSession.user) {
              setUser(currentSession.user);
              persistUser(currentSession.user);
            }
          }
          setIsLoading(false);
          // Return early. Do NOT run profile sync or metadata update endpoints during PASSWORD_RECOVERY.
          // Background calls can mutate user state and invalidate the single-use recovery token before
          // the user submits their new password.
          return;
        }

        // Clean up OAuth callback tokens from URL bar safely if not in password recovery mode
        if (
          sessionStorage.getItem('yaad_password_recovery_active') !== 'true' &&
          !window.location.hash.includes('type=recovery')
        ) {
          cleanAuthUrlParams();
        }

        if (event === 'SIGNED_OUT') {
          if (!isExplicitSignOutRef.current) {
            const hasPersistedUser = Boolean(getPersistedUser());
            if (hasPersistedUser) {
              console.warn('Preserving authenticated user session despite background SDK SIGNED_OUT notice.');
              return;
            }
          }
          isExplicitSignOutRef.current = false;
          persistUser(null);
          try {
            localStorage.removeItem('yaad_authenticated_user_cache');
            localStorage.removeItem('yaad_user_session_persisted');
            localStorage.removeItem('yaad_password_reset_required');
          } catch {}
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsOfflineUser(false);
          setIsLoading(false);
          return;
        }

        if (!currentSession?.user) {
          // If initialSession is still resolving, DO NOT wipe user state!
          if (!initialSessionResolved) return;

          // If device has an authenticated user cache, KEEP THE USER LOGGED IN!
          // Transient null events, background token refresh delays, or network switches
          // must NEVER log the user out.
          const hasPersistedUser = Boolean(getPersistedUser());
          if (hasPersistedUser) {
            return;
          }

          setSession(null);
          setUser(null);
          setProfile(null);
          setIsOfflineUser(false);
          setIsLoading(false);
          return;
        }

        // For token refreshes, simply update tokens without triggering profile refetches
        if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession.user);
          persistUser(currentSession.user);
          return;
        }

        setSession(currentSession);
        setUser(currentSession.user);
        setIsOfflineUser(false);
        persistUser(currentSession.user);

        // Migrate any offline-first local user records to this authenticated Supabase identity
        try {
          const offlineUserJson = localStorage.getItem('yaad_offline_user');
          if (offlineUserJson) {
            const offlineUser = JSON.parse(offlineUserJson);
            if (offlineUser?.id && String(offlineUser.id).startsWith('local_') && offlineUser.id !== currentSession.user.id) {
              migrateOfflineUserData(offlineUser.id, currentSession.user.id).catch((migErr) => {
                console.warn('Background offline user migration failed:', migErr);
              });
              localStorage.removeItem('yaad_offline_user');
            }
          }
        } catch (mErr) {
          console.warn('Offline user migration parse error:', mErr);
        }

        // Update durable local cache
        try {
          localStorage.setItem(
            'yaad_authenticated_user_cache',
            JSON.stringify({
              id: currentSession.user.id,
              email: currentSession.user.email,
              user_metadata: currentSession.user.user_metadata,
              app_metadata: currentSession.user.app_metadata,
            })
          );
        } catch {}

        if (currentSession.user.user_metadata?.password_reset_required === true) {
          setIsPasswordRecovery(true);
          try {
            localStorage.setItem('yaad_password_reset_required', 'true');
          } catch {}
        }

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

    // Primary Session Restoration Lifecycle
    const restoreActiveSession = async () => {
      try {
        let activeSession: Session | null = null;
        let activeUser: User | null = null;

        // 1. Check Supabase session from local storage / network
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (!sessionError && sessionData?.session?.user) {
            activeSession = sessionData.session;
            activeUser = sessionData.session.user;
          }
        } catch (sessErr) {
          console.warn('Notice retrieving initial Supabase session:', sessErr);
        }

        // 2. Offline fallback: check durable local user cache if Supabase returned nothing
        if (!activeUser && typeof window !== 'undefined') {
          try {
            const cachedUserRaw = localStorage.getItem('yaad_authenticated_user_cache');
            if (cachedUserRaw) {
              const parsed = JSON.parse(cachedUserRaw);
              if (parsed?.id) {
                activeUser = parsed as User;
                if (parsed.is_offline_user) {
                  setIsOfflineUser(true);
                }
              }
            }
          } catch {}
        }

        if (activeUser && isMounted) {
          setUser(activeUser);
          if (activeSession) setSession(activeSession);
          persistUser(activeUser);

          const isResetRequired =
            activeUser.user_metadata?.password_reset_required === true ||
            (typeof window !== 'undefined' && localStorage.getItem('yaad_password_reset_required') === 'true');
          if (isResetRequired) {
            setIsPasswordRecovery(true);
          }

          // 3. Hydrate profile BEFORE setting isLoading = false
          let resolvedProfile = await getOfflineProfile<UserProfile>(activeUser.id);
          if (!resolvedProfile) {
            resolvedProfile = {
              id: activeUser.id,
              full_name: activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || null,
              email: activeUser.email || null,
              phone_number: activeUser.user_metadata?.phone_number || activeUser.user_metadata?.phone || null,
              avatar_url: activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || null,
              has_completed_setup: true,
            };
            await saveOfflineProfile(activeUser.id, resolvedProfile);
          }

          if (isMounted) {
            setProfile(resolvedProfile);
          }

          // 4. Asynchronously fetch fresh server profile if online without delaying app entry
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            getProfile(activeUser.id)
              .then((serverProfile) => {
                if (serverProfile && isMounted) {
                  setProfile(serverProfile);
                  saveOfflineProfile(activeUser.id, serverProfile).catch(() => {});
                }
              })
              .catch(() => {});
          }
        } else if (isMounted) {
          const persisted = getPersistedUser();
          if (!persisted) {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsOfflineUser(false);
          }
        }
      } catch (err) {
        console.warn('Error in restoreActiveSession:', err);
      } finally {
        initialSessionResolved = true;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreActiveSession();

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
        persistUser(data.user);
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
  ): Promise<{ error: Error | null; needsEmailConfirmation?: boolean; user?: User | null }> => {
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
      return { error: new Error('Password must be at least 6 characters.') };
    }

    isAuthenticatingRef.current = true;

    try {
      const redirectUrl = getAuthRedirectUrl('/home');

      // 1. Direct standard Supabase signup with user metadata & production redirect
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: trimmedName,
            name: trimmedName,
            phone: trimmedPhone,
            phone_number: trimmedPhone,
          },
        },
      });

      if (error) {
        console.error('[YAAD AUTH SIGNUP ERROR]', {
          message: error?.message,
          code: (error as any)?.code,
          status: (error as any)?.status,
          name: error?.name,
        });
        return { error: new Error(formatAuthErrorMessage(error, 'sign_up')) };
      }

      console.log('[YAAD SIGNUP RESULT]', {
        hasUser: !!data?.user,
        userId: data?.user?.id ?? null,
        hasSession: !!data?.session,
      });

      // If Supabase returned an already-registered user without identities (fake user for enumeration protection)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: new Error('This email is already registered. Please sign in instead.') };
      }

      const activeSession = data.session;
      const activeUser = data.user;

      // CASE A: Active session established immediately (instant signup or auto-confirmed)
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
        persistUser(activeUser);
        await saveOfflineProfile(activeUser.id, activeProfile);

        localStorage.setItem('yaad_profile_setup_done', 'true');
        localStorage.setItem('yaad_profile_setup_completed', 'true');
        localStorage.setItem('yaad_has_onboarded_v2', 'true');
        localStorage.setItem('yaad_has_onboarded', 'true');

        // Non-blocking background sync of profile metadata if needed
        syncProfileFromUser(activeUser).catch(() => {});

        return { error: null, needsEmailConfirmation: false, user: activeUser };
      }

      // CASE B: User created successfully, but session is null because email confirmation is required
      if (!activeSession && activeUser) {
        // Do NOT treat this as a failure! Supabase created the auth user and handle_new_user() created the profile row.
        console.log('[YAAD AUTH SIGNUP] User created successfully, awaiting email confirmation.');
        return { error: null, needsEmailConfirmation: true, user: activeUser };
      }

      return { error: null };
    } catch (err: unknown) {
      console.error('[YAAD SIGNUP EXCEPTION]', err);
      return { error: new Error(formatAuthErrorMessage(err, 'sign_up')) };
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
      // In production, Google OAuth redirect must target the authoritative domain's /home
      const redirectUrl = getAuthRedirectUrl('/home');

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

  const signOut = async () => {
    isExplicitSignOutRef.current = true;
    setIsPasswordRecovery(false);
    setPasswordResetError(null);
    persistUser(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('yaad_password_recovery_active');
        localStorage.removeItem('yaad_password_reset_required');
      } catch {}
      cleanAuthUrlParams(true);
    }
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
      persistUser(null);
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
    const trimmed = email.trim().toLowerCase();
    // Notify backend to mark password reset required for this email
    fetch('/api/auth/mark-reset-required', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    }).catch((err) => {
      console.warn('Notice marking password reset required on server:', err);
    });

    return await supabaseSendPasswordResetEmail(trimmed);
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (!supabase) {
      return { error: new Error('Backend service is not available.') };
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error("You're offline. Please reconnect to update your password.") };
    }
    try {
      // 1. Verify that an active session exists before attempting updateUser
      let { data: sessionData } = await supabase.auth.getSession();

      // If session is not immediately present, attempt to recover from URL tokens or code
      if (!sessionData?.session && typeof window !== 'undefined') {
        const hashStr = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashStr);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: restored, error: restoreErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!restoreErr && restored?.session) {
            sessionData = restored;
            setSession(restored.session);
            setUser(restored.session.user);
          }
        } else {
          const searchParams = new URLSearchParams(window.location.search);
          const code = searchParams.get('code');
          if (code) {
            const { data: exchanged, error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchErr && exchanged?.session) {
              sessionData = exchanged;
              setSession(exchanged.session);
              setUser(exchanged.session.user);
            }
          }
        }
      }

      if (!sessionData?.session) {
        console.error('[Supabase Auth] Password update failed: No active recovery session found.');
        return { error: new Error('Your reset link has expired. Request a new one.') };
      }

      // 2. Call supabase.auth.updateUser with ONLY the new password (Technical Requirement 11)
      const { data: updateData, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[Supabase Auth] updateUser error:', error);
        return { error: new Error(formatAuthErrorMessage(error, 'password_reset')) };
      }

      // 3. Clear recovery state and force URL cleanup
      setIsPasswordRecovery(false);
      setPasswordResetError(null);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('yaad_password_recovery_active');
          localStorage.removeItem('yaad_password_reset_required');
        } catch {}
        cleanAuthUrlParams(true);
      }

      // 4. Refresh current session to ensure clean authenticated state
      let activeAccessToken = sessionData?.session?.access_token;
      try {
        const { data: freshSessionData } = await supabase.auth.getSession();
        if (freshSessionData?.session) {
          setSession(freshSessionData.session);
          setUser(freshSessionData.session.user);
          persistUser(freshSessionData.session.user);
          if (freshSessionData.session.access_token) {
            activeAccessToken = freshSessionData.session.access_token;
          }
        }
      } catch (e) {
        console.warn('Notice refreshing session after password update:', e);
      }

      // 5. Clear server-side reset requirement in the background
      const targetUserId = updateData?.user?.id || sessionData?.session?.user?.id || user?.id;
      if (targetUserId) {
        fetch('/api/auth/clear-reset-required', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(activeAccessToken ? { Authorization: `Bearer ${activeAccessToken}` } : {}),
          },
          body: JSON.stringify({ userId: targetUserId }),
        }).catch((err) => {
          console.warn('Notice clearing password reset required on server:', err);
        });
      }

      return { error: null };
    } catch (err: unknown) {
      console.error('[Supabase Auth] Exception during updatePassword:', err);
      if (isNetworkOrOfflineError(err)) {
        return { error: new Error("You're offline. Please reconnect to update your password.") };
      }
      return { error: new Error(formatAuthErrorMessage(err, 'password_reset')) };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ error: Error | null }> => {
    if (!supabase) {
      return { error: new Error('Backend service is not available.') };
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { error: new Error("You're offline. Please reconnect to change your password.") };
    }
    if (!user || !user.email) {
      return { error: new Error('You must be signed in to change your password.') };
    }

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    // Check if the user has an existing email/password account
    const hasEmailProvider =
      user.app_metadata?.provider === 'email' ||
      (Array.isArray(user.app_metadata?.providers) &&
        user.app_metadata.providers.includes('email'));

    // If account has an existing password, re-authenticate to verify current password
    if (hasEmailProvider) {
      if (!trimmedCurrent) {
        return { error: new Error('Please enter your current password.') };
      }
      try {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: trimmedCurrent,
        });
        if (verifyError) {
          const lower = (verifyError.message || '').toLowerCase();
          if (
            lower.includes('invalid login credentials') ||
            lower.includes('invalid_grant') ||
            lower.includes('invalid_credentials')
          ) {
            return { error: new Error('Incorrect current password. Please verify and try again.') };
          }
          return { error: new Error(formatAuthErrorMessage(verifyError)) };
        }
      } catch (verifyErr: unknown) {
        if (isNetworkOrOfflineError(verifyErr)) {
          return { error: new Error("You're offline. Please reconnect to change your password.") };
        }
        return { error: new Error('Unable to verify your current password. Please try again.') };
      }
    }

    // Validate new password meets existing authentication policy (min 6 characters)
    if (!trimmedNew || trimmedNew.length < 6) {
      return { error: new Error('New password must be at least 6 characters.') };
    }

    if (trimmedCurrent && trimmedCurrent === trimmedNew) {
      return { error: new Error('New password cannot be the same as your current password.') };
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: trimmedNew,
        data: { password_reset_required: false },
      });

      if (updateError) {
        return { error: new Error(formatAuthErrorMessage(updateError)) };
      }

      // Seamless session refresh without signing out the user
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
      } catch (sErr) {
        console.warn('Notice refreshing session after changePassword:', sErr);
      }

      return { error: null };
    } catch (err: unknown) {
      if (isNetworkOrOfflineError(err)) {
        return { error: new Error("You're offline. Please reconnect to change your password.") };
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
            const cleanPhone = updates.phone_number ? cleanPhoneNumber(updates.phone_number) : null;
            metadataUpdates.phone_number = cleanPhone;
            metadataUpdates.phone = cleanPhone;
          }
          const { data: authUserData } = await supabase.auth.updateUser({ data: metadataUpdates });
          if (authUserData?.user) {
            setUser(authUserData.user);
            persistUser(authUserData.user);
          }
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

  const startOfflineOnboarding = async (data: {
    fullName: string;
    phoneNumber?: string;
    language?: AppLanguage;
  }): Promise<void> => {
    const localId = `local_${generateUUID()}`;
    const cleanPhone = data.phoneNumber ? cleanPhoneNumber(data.phoneNumber) : null;
    const trimmedName = data.fullName.trim();

    const localUser: User = {
      id: localId,
      app_metadata: { provider: 'offline_local' },
      user_metadata: {
        full_name: trimmedName,
        name: trimmedName,
        phone_number: cleanPhone,
        phone: cleanPhone,
        has_completed_setup: true,
        is_offline_user: true,
        language: data.language || 'en',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const localProfile: UserProfile = {
      id: localId,
      full_name: trimmedName,
      email: null,
      phone_number: cleanPhone,
      avatar_url: null,
      language: data.language || 'en',
      has_completed_setup: true,
      updated_at: new Date().toISOString(),
    };

    setUser(localUser);
    setProfile(localProfile);
    setIsOfflineUser(true);

    try {
      localStorage.setItem(
        'yaad_authenticated_user_cache',
        JSON.stringify({
          id: localUser.id,
          email: null,
          user_metadata: localUser.user_metadata,
          app_metadata: localUser.app_metadata,
          is_offline_user: true,
        })
      );
      localStorage.setItem('yaad_profile_setup_done', 'true');
      localStorage.setItem('yaad_profile_setup_completed', 'true');
      localStorage.setItem('yaad_has_onboarded_v2', 'true');
      localStorage.setItem('yaad_has_onboarded', 'true');
    } catch {}

    await saveOfflineProfile(localId, localProfile);

    // Queue safe non-sensitive profile data for synchronization when internet returns
    await enqueueOfflineOperation({
      userId: localId,
      type: 'UPDATE_PROFILE',
      listId: 'profile',
      payload: localProfile,
    });
  };

  const isPasswordResetRequired = Boolean(
    isPasswordRecovery ||
    user?.user_metadata?.password_reset_required === true
  );

  const authState: AuthState = useMemo(() => {
    if (isLoading) return 'AUTH_LOADING';
    if (isPasswordResetRequired) return 'PASSWORD_RESET_REQUIRED';
    if (user) return 'AUTHENTICATED';
    if (oauthError || passwordResetError) return 'AUTH_ERROR';
    return 'UNAUTHENTICATED';
  }, [isLoading, isPasswordResetRequired, user, oauthError, passwordResetError]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        session,
        profile,
        isLoading,
        isOfflineUser,
        isConfigured: isSupabaseConfigured,
        startOfflineOnboarding,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        deleteAccount,
        updatePassword,
        changePassword,
        updateUserProfile,
        refreshProfile,
        oauthError,
        clearOauthError,
        isPasswordRecovery,
        isPasswordResetRequired,
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
