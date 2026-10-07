import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AdminUser, AdminSessionInfo } from '../types';
import { safeFetchJson } from '../utils/apiClient';

interface LoginStep1Result {
  requires2faVerify?: boolean;
  requires2faSetup?: boolean;
  tempToken?: string;
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  remainingAttempts?: number;
  lockoutUntil?: number;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  session: AdminSessionInfo | null;
  isLoading: boolean;
  error: string | null;
  inactivitySecondsRemaining: number;
  loginStep1: (email: string, password: string) => Promise<LoginStep1Result>;
  loginPasswordless: (email: string, code: string) => Promise<{ success: boolean; requires2faSetup?: boolean; tempToken?: string; error?: string }>;
  verify2fa: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
  get2faSetupData: (tempToken?: string) => Promise<{ secret: string; otpAuthUri: string; qrCodeDataUrl: string; email: string } | null>;
  confirm2faSetup: (secret: string, code: string, tempToken?: string) => Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message?: string; devResetLink?: string; error?: string }>;
  completePasswordReset: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  regenerateRecoveryCodes: () => Promise<{ success: boolean; recoveryCodes?: string[]; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'yaad_admin_bearer_token';
const INACTIVITY_TIMEOUT_SECONDS = 24 * 60 * 60; // 24 hours (prevents premature staff logouts)

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<AdminSessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inactivitySecondsRemaining, setInactivitySecondsRemaining] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);

  const lastActivityTimestamp = useRef<number>(Date.now());

  // Record user activity (mouse / keydown) to reset client inactivity counter
  useEffect(() => {
    const handleActivity = () => {
      lastActivityTimestamp.current = Date.now();
      setInactivitySecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  // Inactivity countdown ticker
  useEffect(() => {
    if (!token || !admin) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityTimestamp.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - elapsed);
      setInactivitySecondsRemaining(remaining);

      if (remaining <= 0) {
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, admin]);

  // Load admin profile if token exists
  const refreshProfile = useCallback(async () => {
    const activeToken = token || localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!activeToken) {
      setAdmin(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await safeFetchJson<{ admin: AdminUser; session: AdminSessionInfo }>('/api/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!res.ok || !res.data) {
        // Clear session if unauthorized (401) or forbidden (403)
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setAdmin(null);
          setSession(null);
        }
        setIsLoading(false);
        return;
      }

      setAdmin(res.data.admin);
      setSession(res.data.session);
    } catch (err: any) {
      console.error('[AdminAuth] Error checking me:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const loginStep1 = async (email: string, password: string): Promise<LoginStep1Result> => {
    setError(null);
    const res = await safeFetchJson<any>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError(res.error || 'Failed to authenticate admin credentials.');
      return {
        error: res.error || 'Failed to authenticate.',
        remainingAttempts: res.remainingAttempts,
        lockoutUntil: res.lockoutUntil,
      };
    }

    return res.data || {};
  };

  const loginPasswordless = async (email: string, code: string): Promise<{ success: boolean; requires2faSetup?: boolean; tempToken?: string; error?: string }> => {
    setError(null);
    const res = await safeFetchJson<any>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      setError(res.error || 'Authentication failed.');
      return { success: false, error: res.error || 'Authentication failed.' };
    }

    const data = res.data || {};
    if (data.requires2faSetup) {
      return { success: false, requires2faSetup: true, tempToken: data.tempToken };
    }

    if (data.token && data.admin) {
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      lastActivityTimestamp.current = Date.now();
      return { success: true };
    }

    return { success: false, error: data.message || 'Unexpected login response.' };
  };

  const verify2fa = async (tempToken: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const res = await safeFetchJson<any>('/api/admin/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    });

    if (!res.ok || !res.data) {
      return { success: false, error: res.error || 'Invalid 2FA code.' };
    }

    setToken(res.data.token);
    setAdmin(res.data.admin);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
    lastActivityTimestamp.current = Date.now();
    return { success: true };
  };

  const get2faSetupData = async (tempToken?: string) => {
    try {
      const res = await safeFetchJson<any>('/api/admin/auth/setup-2fa', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ tempToken, token }),
      });

      if (!res.ok || !res.data) {
        return null;
      }
      return res.data;
    } catch (err) {
      console.error('[AdminAuth] Error fetching 2FA setup:', err);
      return null;
    }
  };

  const confirm2faSetup = async (secret: string, code: string, tempToken?: string): Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }> => {
    const res = await safeFetchJson<any>('/api/admin/auth/confirm-2fa', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ secret, code, tempToken, token }),
    });

    if (!res.ok || !res.data) {
      return { success: false, error: res.error || 'Failed to confirm 2FA setup.' };
    }

    if (res.data.token) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
    }
    return { success: true, recoveryCodes: res.data.recoveryCodes };
  };

  const isLoggingOutRef = useRef<boolean>(false);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    const activeToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    // Immediately clear local authentication state to prevent cascading 401 fetches
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAdmin(null);
    setSession(null);

    try {
      if (activeToken) {
        safeFetchJson('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
        }).catch(() => null);
      }
    } finally {
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
      isLoggingOutRef.current = false;
    }
  }, []);

  const requestPasswordReset = async (email: string) => {
    const res = await safeFetchJson<any>('/api/admin/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return { error: res.error || 'Failed to request password reset.' };
    }
    return res.data || {};
  };

  const completePasswordReset = async (resetToken: string, newPassword: string) => {
    const res = await safeFetchJson<any>('/api/admin/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    if (!res.ok) {
      return { success: false, error: res.error || 'Failed to reset password.' };
    }
    return { success: true, message: res.data?.message };
  };

  const changePassword = async (newPassword: string) => {
    const res = await safeFetchJson<any>('/api/admin/auth/change-password', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      return { success: false, error: res.error || 'Failed to update password.' };
    }
    return { success: true, message: res.data?.message };
  };

  const regenerateRecoveryCodes = async () => {
    const res = await safeFetchJson<any>('/api/admin/auth/regenerate-recovery-codes', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      return { success: false, error: res.error || 'Failed to regenerate recovery codes.' };
    }
    return { success: true, recoveryCodes: res.data?.recoveryCodes };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        session,
        isLoading,
        error,
        inactivitySecondsRemaining,
        loginStep1,
        loginPasswordless,
        verify2fa,
        get2faSetupData,
        confirm2faSetup,
        logout,
        requestPasswordReset,
        completePasswordReset,
        changePassword,
        regenerateRecoveryCodes,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
