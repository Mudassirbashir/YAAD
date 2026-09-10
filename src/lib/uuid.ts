/**
 * Generates a standard RFC4122 v4 UUID.
 * Works seamlessly across modern browsers, mobile runtimes, and Node environments.
 * Safe for both PostgreSQL UUID and TEXT/VARCHAR primary key columns.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks if a string is a valid UUID format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Generates a deterministic RFC4122 compliant UUID from an input string seed.
 * Guarantees that the same input (e.g. listId + sessionId + itemId) produces
 * the exact same UUID, ensuring idempotency and zero duplicate history records in PostgreSQL/Supabase.
 */
export function generateDeterministicUUID(seed: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  let h3 = 0x811c9dc5 ^ 0;
  let h4 = 0x9e3779b9 ^ 0;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3812015801);
    h4 = Math.imul(h4 ^ ch, 951274213);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = ((h2 >>> 16) & 0xffff).toString(16).padStart(4, '0');
  // Version 4 UUID marker
  const p3 = (((h2 & 0x0fff) | 0x4000) >>> 0).toString(16).padStart(4, '0');
  // Variant RFC4122 marker
  const p4 = ((((h3 >>> 16) & 0x3fff) | 0x8000) >>> 0).toString(16).padStart(4, '0');
  const p5 = (((h3 & 0xffff) << 16) | (h4 & 0xffff)) >>> 0;
  const p5Hex = (p5).toString(16).padStart(8, '0') + ((h4 >>> 16) & 0xffff).toString(16).padStart(4, '0');

  return `${p1}-${p2}-${p3}-${p4}-${p5Hex}`;
}
