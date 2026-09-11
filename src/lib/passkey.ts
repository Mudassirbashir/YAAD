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
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

  if (
    msg.includes('abort') ||
    msg.includes('user cancelled') ||
    msg.includes('user canceled') ||
    msg.includes('the operation either timed out or was not allowed') ||
    msg.includes('the operation was aborted') ||
    msg.includes('notallowederror')
  ) {
    return 'Passkey sign-in was cancelled.';
  }

  if (
    msg.includes('not supported') ||
    msg.includes('not available') ||
    msg.includes('notsupportederror')
  ) {
    return 'Passkeys are not supported on this browser or device. Please continue with Email or Google.';
  }

  if (
    msg.includes('not found') ||
    msg.includes('not recognized') ||
    msg.includes('no passkey') ||
    msg.includes('no credentials') ||
    msg.includes('failed to find')
  ) {
    return 'No passkey found for this account/device. Use Email or Google to sign in.';
  }

  if (
    msg.includes('securityerror') ||
    msg.includes('relying party id') ||
    msg.includes('rp id') ||
    msg.includes('not a valid domain string')
  ) {
    return 'Passkeys are configured for the production domain. On this preview environment, please continue with Email or Google.';
  }

  if (msg.includes('offline') || msg.includes('network') || msg.includes('failed to fetch')) {
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
  if (!isPasskeySupported()) {
    return {
      data: null,
      error: new Error('Passkeys are not supported on this browser or device. Please continue with Email or Google.'),
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

  if (!isPasskeySupported()) {
    return {
      success: false,
      error: new Error('Passkeys are not supported on this browser or device.'),
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
