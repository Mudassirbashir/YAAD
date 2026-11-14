export const STORAGE_MILO_ENABLED_KEY = 'yaad_milo_enabled';

/**
 * Check if Milo floating companion is globally enabled
 */
export function isMiloEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_MILO_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Toggle Milo floating companion on/off
 */
export function setMiloEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MILO_ENABLED_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('yaad:milo:toggle', { detail: { enabled } }));
  } catch {}
}
