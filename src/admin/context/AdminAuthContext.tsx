import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AdminUser, AdminSessionInfo } from '../types';

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
  verify2fa: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
  get2faSetupData: (tempToken?: string) => Promise<{ secret: string; otpAuthUri: string; qrCodeDataUrl: string; email: string } | null>;
  confirm2faSetup: (secret: string, code: string, tempToken?: string) => Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string; devResetLink?: string; error?: string }>;
  completePasswordReset: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'yaad_admin_bearer_token';
const INACTIVITY_TIMEOUT_SECONDS = 30 * 60; // 30 minutes

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
        // Enforce inactivity logout
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
      const res = await fetch('/api/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!res.ok) {
        // Invalid or expired session
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setAdmin(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setAdmin(data.admin);
      setSession(data.session);
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
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to authenticate admin credentials.');
        return {
          error: data.error || 'Failed to authenticate.',
          remainingAttempts: data.remainingAttempts,
          lockoutUntil: data.lockoutUntil,
        };
      }

      return data;
    } catch (err: any) {
      const msg = err.message || 'Network error connecting to Admin API.';
      setError(msg);
      return { error: msg };
    }
  };

  const verify2fa = async (tempToken: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const res = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid 2FA code.' };
      }

      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      lastActivityTimestamp.current = Date.now();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to verify 2FA code.' };
    }
  };

  const get2faSetupData = async (tempToken?: string) => {
    try {
      const res = await fetch('/api/admin/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tempToken, token }),
      });

      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('[AdminAuth] Error fetching 2FA setup:', err);
      return null;
    }
  };

  const confirm2faSetup = async (secret: string, code: string, tempToken?: string): Promise<{ success: boolean; error?: string; recoveryCodes?: string[] }> => {
    try {
      const res = await fetch('/api/admin/auth/confirm-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ secret, code, tempToken, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to confirm 2FA setup.' };
      }

      if (data.token) {
        setToken(data.token);
        setAdmin(data.admin);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      }
      return { success: true, recoveryCodes: data.recoveryCodes };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error confirming 2FA.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setAdmin(null);
      setSession(null);
      window.location.href = '/admin/login';
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { error: err.message || 'Failed to request password reset.' };
    }
  };

  const completePasswordReset = async (resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reset password.' };
    }
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
        verify2fa,
        get2faSetupData,
        confirm2faSetup,
        logout,
        requestPasswordReset,
        completePasswordReset,
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
