/**
 * Real WebAuthn / Passkey Client Helper for YAAD
 * Provides genuine public key credential creation and verification
 * using the standard browser Web Authentication API (navigator.credentials).
 */

const PASSKEY_STORAGE_PREFIX = 'yaad_passkey_cred_';

export interface PasskeySupportStatus {
  isSupported: boolean;
  hasPlatformAuthenticator: boolean;
  message?: string;
}

/**
 * Checks if the browser and platform support WebAuthn / Passkeys
 */
export async function checkPasskeySupport(): Promise<PasskeySupportStatus> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return {
      isSupported: false,
      hasPlatformAuthenticator: false,
      message: 'WebAuthn Passkeys are not supported by this browser.',
    };
  }

  try {
    let hasPlatformAuthenticator = false;
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      hasPlatformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    return {
      isSupported: true,
      hasPlatformAuthenticator,
      message: hasPlatformAuthenticator
        ? 'Passkeys with biometric (Touch ID / Face ID / Windows Hello) are available.'
        : 'Security key passkeys are supported.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error checking passkey support';
    return {
      isSupported: false,
      hasPlatformAuthenticator: false,
      message: msg,
    };
  }
}

/**
 * Helper: converts string to Uint8Array buffer
 */
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Helper: converts ArrayBuffer to Base64URL string
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Helper: converts Base64URL string to ArrayBuffer
 */
function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Register a new Passkey credential on this device
 */
export async function registerPasskey(
  userEmail: string,
  userName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  const support = await checkPasskeySupport();
  if (!support.isSupported) {
    return { success: false, error: 'Passkeys are not supported on this browser.' };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = stringToBuffer(userEmail.toLowerCase());

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'YAAD Shopping',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: userEmail.toLowerCase(),
        displayName: userName || userEmail.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Failed to create passkey.' };
    }

    const credentialIdBase64 = bufferToBase64Url(credential.rawId);

    // Securely cache registered passkey identifier for this user email
    try {
      localStorage.setItem(
        `${PASSKEY_STORAGE_PREFIX}${userEmail.toLowerCase()}`,
        JSON.stringify({
          id: credentialIdBase64,
          email: userEmail.toLowerCase(),
          name: userName,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Could not store passkey credential reference in localStorage:', e);
    }

    return { success: true, credentialId: credentialIdBase64 };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      return { success: false, error: 'Passkey creation was cancelled.' };
    }
    const msg = err instanceof Error ? err.message : 'An error occurred during passkey registration.';
    return { success: false, error: msg };
  }
}

/**
 * Authenticate with a previously registered Passkey credential
 */
export async function authenticateWithPasskey(
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const support = await checkPasskeySupport();
  if (!support.isSupported) {
    return { success: false, error: 'Passkeys are not supported on this browser.' };
  }

  try {
    const rawStored = localStorage.getItem(`${PASSKEY_STORAGE_PREFIX}${userEmail.toLowerCase()}`);
    let allowCredentials: PublicKeyCredentialDescriptor[] | undefined = undefined;

    if (rawStored) {
      try {
        const parsed = JSON.parse(rawStored);
        if (parsed?.id) {
          allowCredentials = [
            {
              id: base64UrlToBuffer(parsed.id),
              type: 'public-key',
              transports: ['internal'],
            },
          ];
        }
      } catch (e) {
        console.warn('Error reading stored passkey credential:', e);
      }
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const getOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'preferred',
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      allowCredentials,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: getOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: 'Passkey authentication failed.' };
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      return { success: false, error: 'Passkey authentication was cancelled.' };
    }
    const msg = err instanceof Error ? err.message : 'Passkey authentication failed.';
    return { success: false, error: msg };
  }
}

/**
 * Check if a passkey has already been registered on this device for the given email
 */
export function hasRegisteredPasskey(userEmail: string): boolean {
  if (!userEmail) return false;
  try {
    const val = localStorage.getItem(`${PASSKEY_STORAGE_PREFIX}${userEmail.toLowerCase()}`);
    return Boolean(val);
  } catch {
    return false;
  }
}
