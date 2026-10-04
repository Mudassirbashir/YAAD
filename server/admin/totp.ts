import crypto from 'crypto';
import QRCode from 'qrcode';

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encodes a buffer to Base32 string (RFC 4648)
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += B32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string to Buffer (RFC 4648)
 */
export function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = B32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

/**
 * Generates a cryptographically random 20-byte Base32 TOTP secret
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Computes a 6-digit TOTP token for a given secret and 30-second time step (RFC 6238)
 */
export function computeTotpToken(secret: string, timeStep: number = Math.floor(Date.now() / 1000 / 30)): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit TOTP code against a secret with +/- 1 time step window for clock skew
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  if (!token || !/^\d{6}$/.test(token.trim())) {
    return false;
  }

  const cleanToken = token.trim();
  const currentStep = Math.floor(Date.now() / 1000 / 30);

  // Check window: previous step, current step, next step (90-second total window)
  for (let step = currentStep - 1; step <= currentStep + 1; step++) {
    const expected = computeTotpToken(secret, step);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Builds the standard otpauth URL for authenticator apps
 */
export function buildOtpAuthUri(email: string, secret: string, issuer: string = 'YAAD Admin'): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates QR Code data URL (PNG) from an otpauth URI
 */
export async function generateQrCodeDataUrl(otpAuthUri: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri, {
    width: 240,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}
