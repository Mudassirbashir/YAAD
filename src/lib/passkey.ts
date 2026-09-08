/**
 * YAAD WebAuthn / Passkey Client Service
 *
 * Implements W3C WebAuthn standards using @simplewebauthn/browser.
 * Complies with strict security:
 * - Never touches private keys, biometric details, or device secrets.
 * - Stores public credential metadata only.
 * - Seamlessly binds authenticated passkey login to a real Supabase Auth session.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import { PasskeyCredentialInfo } from '../types';

/**
 * Detects if the current browser and operating system support WebAuthn / Passkeys
 */
export function isPasskeySupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.PublicKeyCredential &&
    browserSupportsWebAuthn &&
    browserSupportsWebAuthn()
  );
}

/**
 * Registers a new Passkey for an already authenticated Supabase user.
 */
export async function registerPasskey(
  authToken: string,
  deviceName?: string
): Promise<{ success: boolean; passkey?: PasskeyCredentialInfo; error?: string }> {
  if (!isPasskeySupported()) {
    return {
      success: false,
      error: 'Passkeys are not supported on this browser or device.',
    };
  }

  if (!authToken) {
    return {
      success: false,
      error: 'You must be signed in to register a passkey.',
    };
  }

  try {
    // 1. Fetch registration challenge options from backend
    const optRes = await fetch('/api/passkey/register-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!optRes.ok) {
      const errJson = await optRes.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to start passkey registration.');
    }

    const { options, challengeId } = await optRes.json();

    // 2. Perform WebAuthn registration ceremony via browser/authenticator
    const registrationResponse = await startRegistration({ optionsJSON: options });

    // 3. Send response to backend for cryptographic verification and public key storage
    const verifyRes = await fetch('/api/passkey/register-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        response: registrationResponse,
        challengeId,
        deviceName: deviceName || getDefaultDeviceName(),
      }),
    });

    if (!verifyRes.ok) {
      const verifyJson = await verifyRes.json().catch(() => ({}));
      throw new Error(verifyJson.error || 'Failed to verify passkey registration.');
    }

    const data = await verifyRes.json();
    return {
      success: true,
      passkey: data.passkey,
    };
  } catch (err: unknown) {
    const errorMsg = formatPasskeyError(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Performs Passkey authentication ceremony to authenticate the user.
 * Returns the Supabase token_hash required to establish the Supabase Auth session.
 */
export async function authenticateWithPasskey(): Promise<{
  tokenHash?: string;
  email?: string;
  error?: string;
}> {
  if (!isPasskeySupported()) {
    return {
      error: 'Passkeys are not supported on this browser or device. Please continue with Email or Google.',
    };
  }

  try {
    // 1. Fetch authentication challenge options from backend
    const optRes = await fetch('/api/passkey/login-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!optRes.ok) {
      const errJson = await optRes.json().catch(() => ({}));
      throw new Error(errJson.error || 'Unable to initiate passkey sign-in.');
    }

    const { options, challengeId } = await optRes.json();

    // 2. Perform WebAuthn assertion ceremony via browser/authenticator
    const authenticationResponse = await startAuthentication({ optionsJSON: options });

    // 3. Send assertion to backend for verification and session link generation
    const verifyRes = await fetch('/api/passkey/login-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response: authenticationResponse,
        challengeId,
      }),
    });

    if (!verifyRes.ok) {
      const verifyJson = await verifyRes.json().catch(() => ({}));
      throw new Error(verifyJson.error || 'Passkey authentication verification failed.');
    }

    const data = await verifyRes.json();
    return {
      tokenHash: data.token_hash,
      email: data.email,
    };
  } catch (err: unknown) {
    const errorMsg = formatPasskeyError(err);
    return { error: errorMsg };
  }
}

/**
 * Lists the registered passkeys for the current authenticated user
 */
export async function listUserPasskeys(authToken: string): Promise<PasskeyCredentialInfo[]> {
  if (!authToken) return [];
  try {
    const res = await fetch('/api/passkey/list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.passkeys || []).map((p: any) => ({
      id: p.id,
      deviceName: p.device_name || 'Passkey Device',
      createdAt: p.created_at,
      lastUsedAt: p.last_used_at,
    }));
  } catch (e) {
    console.warn('Could not fetch passkeys:', e);
    return [];
  }
}

/**
 * Removes a registered passkey
 */
export async function deleteUserPasskey(
  authToken: string,
  passkeyId: string
): Promise<{ success: boolean; error?: string }> {
  if (!authToken || !passkeyId) {
    return { success: false, error: 'Passkey ID is required.' };
  }
  try {
    const res = await fetch('/api/passkey/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ passkeyId }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to remove passkey.');
    }

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unable to remove passkey.';
    return { success: false, error: msg };
  }
}

/**
 * Helper to generate a human-readable default device name
 */
function getDefaultDeviceName(): string {
  if (typeof navigator === 'undefined') return 'YAAD Passkey';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Device';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * User-friendly translator for WebAuthn errors
 */
function formatPasskeyError(err: unknown): string {
  if (!err) return 'Passkey authentication failed. Please try again.';
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

  if (
    msg.includes('abort') ||
    msg.includes('user cancelled') ||
    msg.includes('the operation was aborted') ||
    msg.includes('notallowederror')
  ) {
    return 'Passkey request was cancelled or timed out.';
  }
  if (msg.includes('not supported') || msg.includes('not available')) {
    return 'Passkeys are not supported on this browser or device. Please continue with Email or Google.';
  }
  if (msg.includes('not found') || msg.includes('not recognized')) {
    return 'Passkey was not found on this account. Please sign in with email or register your passkey first.';
  }
  if (msg.includes('offline') || msg.includes('network') || msg.includes('fetch')) {
    return "You're offline. Please reconnect to sign in.";
  }

  return err instanceof Error ? err.message : 'Passkey error occurred. Please try again.';
}
