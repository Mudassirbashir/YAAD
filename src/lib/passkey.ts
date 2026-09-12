/**
 * YAAD WebAuthn / Native Supabase Passkey Client Service
 *
 * Implements W3C WebAuthn standards using native Supabase Passkey APIs:
 * - supabase.auth.signInWithPasskey()
 * - supabase.auth.registerPasskey()
 * - supabase.auth.passkey.startRegistration()
 * - supabase.auth.passkey.verifyRegistration()
 * - supabase.auth.passkey.startAuthentication()
 * - supabase.auth.passkey.verifyAuthentication()
 * - supabase.auth.passkey.list()
 * - supabase.auth.passkey.delete()
 *
 * Complies with strict privacy & security requirements:
 * - Never touches private keys, biometric details, or device secrets.
 * - Hardware biometric prompts (Windows Hello / Fingerprint / Face / PIN) stay local to device.
 * - Seamlessly binds authenticated passkey login to Supabase Auth.
 */

import { supabase } from './supabase';
import { PasskeyCredentialInfo } from '../types';

export const PRODUCTION_PASSKEY_RP_ID = 'yaad-mudassirbashir530-creators-projects.vercel.app';

/**
 * Detects if the current browser and operating system support WebAuthn / Passkeys
 */
export function isPasskeySupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

/**
 * Validates whether passkey authentication is supported on the current domain environment.
 * WebAuthn security specifications strictly bind credentials to the Relying Party ID.
 */
export function isPasskeySupportedOnCurrentDomain(): { supported: boolean; reason?: string } {
  if (!isPasskeySupported()) {
    return {
      supported: false,
      reason: 'Passkeys are not supported on this browser or device. Please continue with Email or Google.',
    };
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    // Allow exact production domain, subdomains, or localhost for local testing
    const isProductionMatch =
      hostname === PRODUCTION_PASSKEY_RP_ID ||
      hostname.endsWith('.' + PRODUCTION_PASSKEY_RP_ID);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!isProductionMatch && !isLocalhost) {
      return {
        supported: false,
        reason: `Passkey authentication is domain-bound to production (${PRODUCTION_PASSKEY_RP_ID}). On this preview environment, please continue with Email or Google.`,
      };
    }
  }

  return { supported: true };
}

let cachedPasskeyDomainCheck: { supported: boolean; reason?: string } | null = null;
let passkeyConfigFetchPromise: Promise<{ supported: boolean; reason?: string }> | null = null;

/**
 * Checks passkey domain support dynamically via backend API, caching the result
 */
export async function checkPasskeyDomainSupport(): Promise<{ supported: boolean; reason?: string }> {
  if (!isPasskeySupported()) {
    return {
      supported: false,
      reason: 'Passkeys are not supported on this browser or device. Please continue with Email or Google.',
    };
  }

  if (cachedPasskeyDomainCheck) {
    return cachedPasskeyDomainCheck;
  }

  if (passkeyConfigFetchPromise) {
    return passkeyConfigFetchPromise;
  }

  passkeyConfigFetchPromise = (async () => {
    try {
      const res = await fetch('/api/auth/passkey-config');
      if (res.ok) {
        const data = await res.json();
        const result = {
          supported: Boolean(data.supported),
          reason: data.reason,
        };
        cachedPasskeyDomainCheck = result;
        return result;
      }
    } catch (err) {
      console.warn('Notice checking server passkey configuration:', err);
    }
    const fallback = isPasskeySupportedOnCurrentDomain();
    cachedPasskeyDomainCheck = fallback;
    return fallback;
  })().finally(() => {
    passkeyConfigFetchPromise = null;
  });

  return passkeyConfigFetchPromise;
}

/**
 * Helper to generate a human-readable default device name
 */
export function getDefaultDeviceName(): string {
  if (typeof navigator === 'undefined') return 'YAAD Passkey Device';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Device';
  if (ua.includes('Windows')) os = 'Windows Hello';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS Touch ID';
  else if (ua.includes('iPhone')) os = 'iPhone Face ID/Touch ID';
  else if (ua.includes('iPad')) os = 'iPad Face ID/Touch ID';
  else if (ua.includes('Android')) os = 'Android Biometrics';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * User-friendly translator for WebAuthn errors
 */
export function formatPasskeyError(err: unknown): string {
  if (!err) return 'Passkey sign-in was not completed. Please try again.';

  let raw = '';
  if (err instanceof Error) {
    raw = err.message;
  } else if (typeof err === 'object' && err !== null) {
    const o = err as any;
    raw = o.message || o.error_description || o.msg || (o.name ? `${o.name}: ${o.message}` : JSON.stringify(err));
  } else {
    raw = String(err);
  }

  const lower = raw.toLowerCase();

  if (
    lower.includes('securityerror') ||
    lower.includes('relying party id') ||
    lower.includes('rp id') ||
    lower.includes('not a valid domain string') ||
    lower.includes('domain-bound')
  ) {
    return `Passkey authentication is domain-bound to production (${PRODUCTION_PASSKEY_RP_ID}). On this preview environment, please continue with Email or Google.`;
  }

  if (
    lower.includes('abort') ||
    lower.includes('user cancelled') ||
    lower.includes('user canceled') ||
    lower.includes('the operation either timed out or was not allowed') ||
    lower.includes('the operation was aborted') ||
    lower.includes('notallowederror')
  ) {
    return 'Passkey sign-in was cancelled.';
  }

  if (
    lower.includes('not supported') ||
    lower.includes('not available') ||
    lower.includes('notsupportederror')
  ) {
    return 'Passkeys are not supported on this browser or device. Please continue with Email or Google.';
  }

  if (
    lower.includes('not found') ||
    lower.includes('not recognized') ||
    lower.includes('no passkey') ||
    lower.includes('no credentials') ||
    lower.includes('failed to find')
  ) {
    return 'No passkey found for this account/device. Use Email or Google to sign in.';
  }

  if (lower.includes('offline') || lower.includes('network') || lower.includes('failed to fetch')) {
    return "You're offline. Please reconnect to continue.";
  }

  return 'No passkey found for this account/device. Use Email or Google to sign in.';
}

/**
 * Signs in using native Supabase Passkey API
 */
export async function signInWithPasskey(): Promise<{
  data: any | null;
  error: Error | null;
}> {
  // 1. Check dynamic domain environment binding
  const domainCheck = await checkPasskeyDomainSupport();
  if (!domainCheck.supported) {
    return {
      data: null,
      error: new Error(domainCheck.reason || 'Passkeys are not supported in this environment.'),
    };
  }

  if (!supabase) {
    return {
      data: null,
      error: new Error('Backend authentication service is not configured.'),
    };
  }

  try {
    const res = await supabase.auth.signInWithPasskey();
    if (res.error) {
      return {
        data: null,
        error: new Error(formatPasskeyError(res.error)),
      };
    }
    return { data: res.data, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: new Error(formatPasskeyError(err)),
    };
  }
}

/**
 * Registers a new Passkey for the current authenticated Supabase user.
 * Uses native Supabase registerPasskey API.
 */
export async function registerPasskey(
  arg1?: string,
  arg2?: string
): Promise<{ success: boolean; passkey?: PasskeyCredentialInfo; error: Error | null }> {
  // Support both (deviceName) and legacy (authToken, deviceName) signatures
  const deviceName = arg2 || (arg1 && !arg1.includes('.') ? arg1 : getDefaultDeviceName());

  // 1. Check dynamic domain environment binding
  const domainCheck = await checkPasskeyDomainSupport();
  if (!domainCheck.supported) {
    return {
      success: false,
      error: new Error(
        domainCheck.reason ||
          `Passkey registration is domain-bound to production (${PRODUCTION_PASSKEY_RP_ID}). On this preview environment, please use Email or Google authentication.`
      ),
    };
  }

  if (!supabase) {
    return {
      success: false,
      error: new Error('Backend authentication service is not configured.'),
    };
  }

  try {
    const res = await supabase.auth.registerPasskey();
    if (res.error || !res.data) {
      return {
        success: false,
        error: new Error(formatPasskeyError(res.error || 'Failed to register passkey.')),
      };
    }

    const passkeyData = res.data;
    const friendlyName = deviceName || getDefaultDeviceName();

    // Optionally set friendly name on the passkey via native API
    try {
      if (passkeyData.id && friendlyName && (supabase.auth as any).passkey?.update) {
        await (supabase.auth as any).passkey.update({
          passkeyId: passkeyData.id,
          friendlyName,
        });
      }
    } catch (updateErr) {
      console.warn('Notice updating passkey friendly name:', updateErr);
    }

    const passkeyInfo: PasskeyCredentialInfo = {
      id: passkeyData.id,
      deviceName: friendlyName,
      createdAt: (passkeyData as any).created_at || new Date().toISOString(),
      lastUsedAt: (passkeyData as any).created_at || new Date().toISOString(),
    };

    return {
      success: true,
      passkey: passkeyInfo,
      error: null,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: new Error(formatPasskeyError(err)),
    };
  }
}

/**
 * Lists the registered passkeys for the current user via native Supabase Passkey API
 */
export async function listUserPasskeys(_authToken?: string): Promise<PasskeyCredentialInfo[]> {
  if (!supabase || !(supabase.auth as any).passkey?.list) return [];
  try {
    const res = await (supabase.auth as any).passkey.list();
    if (res.error || !res.data) {
      return [];
    }
    return (res.data || []).map((p: any) => ({
      id: p.id,
      deviceName: p.friendly_name || 'Passkey Device',
      createdAt: p.created_at,
      lastUsedAt: p.last_used_at || p.created_at,
    }));
  } catch (e) {
    console.warn('Could not fetch passkeys from Supabase:', e);
    return [];
  }
}

/**
 * Removes a registered passkey via native Supabase Passkey API
 */
export async function deleteUserPasskey(
  arg1: string,
  arg2?: string
): Promise<{ success: boolean; error: Error | null }> {
  // Support both (passkeyId) and legacy (authToken, passkeyId)
  const passkeyId = arg2 || arg1;

  if (!supabase || !(supabase.auth as any).passkey?.delete) {
    return { success: false, error: new Error('Auth service unavailable.') };
  }
  if (!passkeyId) {
    return { success: false, error: new Error('Passkey ID is required.') };
  }

  try {
    const res = await (supabase.auth as any).passkey.delete({ passkeyId });
    if (res.error) {
      return { success: false, error: new Error(formatPasskeyError(res.error)) };
    }
    return { success: true, error: null };
  } catch (e: unknown) {
    return { success: false, error: new Error(formatPasskeyError(e)) };
  }
}

/**
 * Direct access to native Supabase Passkey low-level methods
 */
export const supabasePasskeyApi = {
  startRegistration: () => (supabase?.auth as any)?.passkey?.startRegistration(),
  verifyRegistration: (params: any) => (supabase?.auth as any)?.passkey?.verifyRegistration(params),
  startAuthentication: (params?: any) => (supabase?.auth as any)?.passkey?.startAuthentication(params),
  verifyAuthentication: (params: any) => (supabase?.auth as any)?.passkey?.verifyAuthentication(params),
  list: () => (supabase?.auth as any)?.passkey?.list(),
  delete: (params: { passkeyId: string }) => (supabase?.auth as any)?.passkey?.delete(params),
};
