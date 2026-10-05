import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { AdminSession, AdminUser, AdminInvite } from './store';

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (url && key) {
    try {
      supabaseAdminClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } catch (e) {
      console.warn('[Supabase Admin] Failed to initialize client:', e);
    }
  }
  return supabaseAdminClient;
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export interface SharedTempTokenRecord {
  token: string;
  adminId: string;
  email: string;
  purpose: 'login' | 'bootstrap';
  createdAt: number;
  expiresAt: number;
}

// In-memory fallback maps for local dev / when Supabase is not configured
const memoryTempTokens = new Map<string, SharedTempTokenRecord>();

/**
 * Persists an active admin session to Supabase (or in-memory fallback)
 */
export async function persistSharedSession(session: AdminSession): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const tokenHash = hashSessionToken(session.token);
    await supabase.from('admin_sessions').upsert({
      token_hash: tokenHash,
      admin_id: session.adminId,
      created_at: new Date(session.createdAt).toISOString(),
      expires_at: new Date(session.expiresAt).toISOString(),
      last_activity_at: new Date(session.lastActivityAt).toISOString(),
      ip: session.ip || null,
      user_agent: session.userAgent || null,
    });
  } catch (err) {
    console.warn('[Supabase Admin] Error persisting shared session:', err);
  }
}

/**
 * Retrieves an active admin session from Supabase (or null if not found)
 */
export async function getSharedSessionFromDb(token: string): Promise<AdminSession | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const tokenHash = hashSessionToken(token);
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error || !data) return null;

    return {
      sessionId: 'sess_' + tokenHash.substring(0, 16),
      adminId: data.admin_id,
      token,
      createdAt: new Date(data.created_at).getTime(),
      expiresAt: new Date(data.expires_at).getTime(),
      lastActivityAt: new Date(data.last_activity_at).getTime(),
      ip: data.ip || undefined,
      userAgent: data.user_agent || undefined,
    };
  } catch (err) {
    console.warn('[Supabase Admin] Error fetching shared session:', err);
    return null;
  }
}

/**
 * Updates last_activity_at timestamp for a session
 */
export async function touchSharedSessionInDb(token: string, lastActivityAt: number = Date.now()): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const tokenHash = hashSessionToken(token);
    await supabase
      .from('admin_sessions')
      .update({ last_activity_at: new Date(lastActivityAt).toISOString() })
      .eq('token_hash', tokenHash);
  } catch (err) {
    console.warn('[Supabase Admin] Error touching shared session:', err);
  }
}

/**
 * Deletes a session on logout or expiration
 */
export async function deleteSharedSessionFromDb(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const tokenHash = hashSessionToken(token);
    await supabase.from('admin_sessions').delete().eq('token_hash', tokenHash);
  } catch (err) {
    console.warn('[Supabase Admin] Error deleting shared session:', err);
  }
}

/**
 * Saves a temporary token (2FA login or bootstrap token)
 */
export async function saveSharedTempToken(
  token: string,
  adminId: string,
  email: string,
  purpose: 'login' | 'bootstrap' = 'login',
  ttlMs: number = 5 * 60 * 1000
): Promise<void> {
  const record: SharedTempTokenRecord = {
    token,
    adminId,
    email,
    purpose,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  memoryTempTokens.set(token, record);

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('admin_temp_tokens').upsert({
      token,
      admin_id: adminId,
      email,
      purpose,
      created_at: new Date(record.createdAt).toISOString(),
      expires_at: new Date(record.expiresAt).toISOString(),
    });
  } catch (err) {
    console.warn('[Supabase Admin] Error saving shared temp token:', err);
  }
}

/**
 * Validates and retrieves a temporary token
 */
export async function validateSharedTempToken(
  token: string,
  purpose: 'login' | 'bootstrap' = 'login'
): Promise<SharedTempTokenRecord | null> {
  if (!token) return null;

  // 1. Check memory cache first
  const memoryRecord = memoryTempTokens.get(token);
  if (memoryRecord && memoryRecord.purpose === purpose && Date.now() <= memoryRecord.expiresAt) {
    return memoryRecord;
  }

  // 2. Check Supabase shared table
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_temp_tokens')
      .select('*')
      .eq('token', token)
      .eq('purpose', purpose)
      .maybeSingle();

    if (error || !data) return null;

    const expiresAt = new Date(data.expires_at).getTime();
    if (Date.now() > expiresAt) {
      await deleteSharedTempToken(token);
      return null;
    }

    return {
      token: data.token,
      adminId: data.admin_id,
      email: data.email,
      purpose: data.purpose,
      createdAt: new Date(data.created_at).getTime(),
      expiresAt,
    };
  } catch (err) {
    console.warn('[Supabase Admin] Error validating shared temp token:', err);
    return null;
  }
}

/**
 * Deletes a used or expired temporary token
 */
export async function deleteSharedTempToken(token: string): Promise<void> {
  memoryTempTokens.delete(token);

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('admin_temp_tokens').delete().eq('token', token);
  } catch (err) {
    console.warn('[Supabase Admin] Error deleting shared temp token:', err);
  }
}

/**
 * Persists an admin user to Supabase
 */
export async function persistSharedAdmin(admin: AdminUser): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('admin_users').upsert({
      id: admin.id,
      name: admin.name,
      email: admin.email.toLowerCase().trim(),
      role: admin.role,
      status: admin.status,
      suspend_reason: admin.suspendReason || null,
      totp_secret: admin.totpSecret || null,
      is_totp_enabled: Boolean(admin.isTotpEnabled),
      recovery_codes: admin.recoveryCodes || [],
      failed_attempts: admin.failedAttempts || 0,
      lockout_until: admin.lockoutUntil ? new Date(admin.lockoutUntil).toISOString() : null,
      last_login_at: admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString() : null,
      created_at: new Date(admin.createdAt).toISOString(),
      updated_at: new Date(admin.updatedAt || Date.now()).toISOString(),
      deleted_at: admin.deletedAt ? new Date(admin.deletedAt).toISOString() : null,
    });
  } catch (err) {
    console.warn('[Supabase Admin] Error persisting shared admin:', err);
  }
}

/**
 * Retrieves an admin user by email from Supabase
 */
export async function getSharedAdminByEmail(email: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      suspendReason: data.suspend_reason || undefined,
      totpSecret: data.totp_secret || '',
      isTotpEnabled: Boolean(data.is_totp_enabled),
      recoveryCodes: Array.isArray(data.recovery_codes) ? data.recovery_codes : [],
      failedAttempts: data.failed_attempts || 0,
      lockoutUntil: data.lockout_until ? new Date(data.lockout_until).getTime() : undefined,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at).getTime() : undefined,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      deletedAt: data.deleted_at ? new Date(data.deleted_at).getTime() : null,
    };
  } catch (err) {
    console.warn('[Supabase Admin] Error fetching shared admin by email:', err);
    return null;
  }
}

/**
 * Retrieves an admin user by ID from Supabase
 */
export async function getSharedAdminById(id: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      suspendReason: data.suspend_reason || undefined,
      totpSecret: data.totp_secret || '',
      isTotpEnabled: Boolean(data.is_totp_enabled),
      recoveryCodes: Array.isArray(data.recovery_codes) ? data.recovery_codes : [],
      failedAttempts: data.failed_attempts || 0,
      lockoutUntil: data.lockout_until ? new Date(data.lockout_until).getTime() : undefined,
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at).getTime() : undefined,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      deletedAt: data.deleted_at ? new Date(data.deleted_at).getTime() : null,
    };
  } catch (err) {
    console.warn('[Supabase Admin] Error fetching shared admin by id:', err);
    return null;
  }
}

/**
 * Retrieves all admin users from Supabase
 */
export async function getAllSharedAdmins(): Promise<AdminUser[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: d.role,
      status: d.status,
      suspendReason: d.suspend_reason || undefined,
      totpSecret: d.totp_secret || '',
      isTotpEnabled: Boolean(d.is_totp_enabled),
      recoveryCodes: Array.isArray(d.recovery_codes) ? d.recovery_codes : [],
      failedAttempts: d.failed_attempts || 0,
      lockoutUntil: d.lockout_until ? new Date(d.lockout_until).getTime() : undefined,
      lastLoginAt: d.last_login_at ? new Date(d.last_login_at).getTime() : undefined,
      createdAt: new Date(d.created_at).getTime(),
      updatedAt: new Date(d.updated_at).getTime(),
      deletedAt: d.deleted_at ? new Date(d.deleted_at).getTime() : null,
    }));
  } catch (err) {
    console.warn('[Supabase Admin] Error fetching all shared admins:', err);
    return null;
  }
}

/**
 * Persists an admin invitation to Supabase
 */
export async function persistSharedInvite(invite: AdminInvite): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('admin_invites').upsert({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      role: invite.role,
      token: invite.token,
      invited_by: invite.invitedBy,
      expires_at: new Date(invite.expiresAt).toISOString(),
      status: invite.status,
      created_at: new Date(invite.createdAt).toISOString(),
      accepted_at: invite.acceptedAt ? new Date(invite.acceptedAt).toISOString() : null,
    });
  } catch (err) {
    console.warn('[Supabase Admin] Error persisting shared invite:', err);
  }
}

/**
 * Retrieves an admin invitation by token from Supabase
 */
export async function getSharedInvite(token: string): Promise<AdminInvite | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      token: data.token,
      invitedBy: data.invited_by,
      expiresAt: new Date(data.expires_at).getTime(),
      status: data.status,
      createdAt: new Date(data.created_at).getTime(),
      acceptedAt: data.accepted_at ? new Date(data.accepted_at).getTime() : undefined,
    };
  } catch (err) {
    console.warn('[Supabase Admin] Error fetching shared invite:', err);
    return null;
  }
}

/**
 * Deletes a shared invitation by token from Supabase
 */
export async function deleteSharedInvite(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from('admin_invites').delete().eq('token', token);
  } catch (err) {
    console.warn('[Supabase Admin] Error deleting shared invite:', err);
  }
}

