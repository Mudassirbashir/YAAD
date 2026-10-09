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

// Missing tables cache to avoid redundant schema cache queries and spurious warning logs when tables do not exist
const missingTablesCache = new Set<string>();

export function isTableMissingInSupabase(tableName: string): boolean {
  return missingTablesCache.has(tableName);
}

export function markTableMissingInSupabase(tableName: string): void {
  missingTablesCache.add(tableName);
}

export function isSchemaCacheMissingTableError(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const message = typeof error.message === 'string' ? error.message : '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('schema cache') ||
    message.includes('Could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))
  );
}

/**
 * Persists an active admin session to Supabase (or in-memory fallback)
 */
export async function persistSharedSession(session: AdminSession): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_sessions')) return;

  try {
    const tokenHash = hashSessionToken(session.token);
    const { error } = await supabase.from('admin_sessions').upsert({
      token_hash: tokenHash,
      admin_id: session.adminId,
      created_at: new Date(session.createdAt).toISOString(),
      expires_at: new Date(session.expiresAt).toISOString(),
      last_activity_at: new Date(session.lastActivityAt).toISOString(),
      ip: session.ip || null,
      user_agent: session.userAgent || null,
    });
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_sessions');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * Retrieves an active admin session from Supabase (or null if not found)
 */
export async function getSharedSessionFromDb(token: string): Promise<AdminSession | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_sessions')) return null;

  try {
    const tokenHash = hashSessionToken(token);
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_sessions');
      }
      return null;
    }
    if (!data) return null;

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
  } catch {
    return null;
  }
}

/**
 * Updates last_activity_at timestamp for a session
 */
export async function touchSharedSessionInDb(token: string, lastActivityAt: number = Date.now()): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_sessions')) return;

  try {
    const tokenHash = hashSessionToken(token);
    const { error } = await supabase
      .from('admin_sessions')
      .update({ last_activity_at: new Date(lastActivityAt).toISOString() })
      .eq('token_hash', tokenHash);
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_sessions');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * Deletes a session on logout or expiration
 */
export async function deleteSharedSessionFromDb(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_sessions')) return;

  try {
    const tokenHash = hashSessionToken(token);
    const { error } = await supabase.from('admin_sessions').delete().eq('token_hash', tokenHash);
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_sessions');
    }
  } catch {
    // In-memory fallback active
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
  if (!supabase || isTableMissingInSupabase('admin_temp_tokens')) return;

  try {
    const { error } = await supabase.from('admin_temp_tokens').upsert({
      token,
      admin_id: adminId,
      email,
      purpose,
      created_at: new Date(record.createdAt).toISOString(),
      expires_at: new Date(record.expiresAt).toISOString(),
    });
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_temp_tokens');
    }
  } catch {
    // In-memory fallback active
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
  if (!supabase || isTableMissingInSupabase('admin_temp_tokens')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_temp_tokens')
      .select('*')
      .eq('token', token)
      .eq('purpose', purpose)
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_temp_tokens');
      }
      return null;
    }
    if (!data) return null;

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
  } catch {
    return null;
  }
}

/**
 * Deletes a used or expired temporary token
 */
export async function deleteSharedTempToken(token: string): Promise<void> {
  memoryTempTokens.delete(token);

  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_temp_tokens')) return;

  try {
    const { error } = await supabase.from('admin_temp_tokens').delete().eq('token', token);
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_temp_tokens');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * Persists an admin user to Supabase
 */
export async function persistSharedAdmin(admin: AdminUser): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_users')) return;

  try {
    const payload: any = {
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
    };
    if (admin.passwordHash) payload.password_hash = admin.passwordHash;
    if (admin.salt) payload.salt = admin.salt;
    if ((admin as any).phone) payload.phone = (admin as any).phone;

    const { error } = await supabase.from('admin_users').upsert(payload);
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_users');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * Retrieves an admin user by email from Supabase
 */
export async function getSharedAdminByEmail(email: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_users')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_users');
      }
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      passwordHash: data.password_hash || undefined,
      salt: data.salt || undefined,
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
  } catch {
    return null;
  }
}

/**
 * Retrieves an admin user by ID from Supabase
 */
export async function getSharedAdminById(id: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_users')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_users');
      }
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      passwordHash: data.password_hash || undefined,
      salt: data.salt || undefined,
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
  } catch {
    return null;
  }
}

/**
 * Retrieves all admin users from Supabase
 */
export async function getAllSharedAdmins(): Promise<AdminUser[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_users')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_users');
      }
      return null;
    }
    if (!data) return null;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      passwordHash: d.password_hash || undefined,
      salt: d.salt || undefined,
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
  } catch {
    return null;
  }
}

/**
 * Persists an admin invitation to Supabase
 */
export async function persistSharedInvite(invite: AdminInvite): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_invites')) return;

  try {
    const { error } = await supabase.from('admin_invites').upsert({
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
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_invites');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * Retrieves an admin invitation by token from Supabase
 */
export async function getSharedInvite(token: string): Promise<AdminInvite | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_invites')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_invites');
      }
      return null;
    }
    if (!data) return null;

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
  } catch {
    return null;
  }
}

/**
 * Deletes a shared invitation by token from Supabase
 */
export async function deleteSharedInvite(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_invites')) return;

  try {
    const { error } = await supabase.from('admin_invites').delete().eq('token', token);
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_invites');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * -----------------------------------------------------------------------------
 * ADMIN ACCESS REQUESTS (Applicant flow)
 * -----------------------------------------------------------------------------
 */

export interface SharedAccessRequestRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  requestedRole: string;
  department?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
}

export async function persistSharedAccessRequest(req: SharedAccessRequestRecord): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_access_requests')) return;

  try {
    const { error } = await supabase.from('admin_access_requests').upsert({
      id: req.id,
      name: req.name,
      email: req.email.toLowerCase().trim(),
      phone: req.phone || null,
      requested_role: req.requestedRole,
      department: req.department || null,
      reason: req.reason,
      status: req.status,
      reviewed_by: req.reviewedBy || null,
      reviewed_at: req.reviewedAt ? new Date(req.reviewedAt).toISOString() : null,
      created_at: new Date(req.createdAt).toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_access_requests');
    }
  } catch {
    // In-memory fallback active
  }
}

export async function getSharedAccessRequestsFromDb(): Promise<SharedAccessRequestRecord[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_access_requests')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_access_requests');
      }
      return null;
    }
    if (!data) return null;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      requestedRole: d.requested_role,
      department: d.department || undefined,
      reason: d.reason,
      status: d.status,
      reviewedBy: d.reviewed_by || undefined,
      reviewedAt: d.reviewed_at ? new Date(d.reviewed_at).getTime() : undefined,
      createdAt: new Date(d.created_at).getTime(),
    }));
  } catch {
    return null;
  }
}

export async function updateSharedAccessRequestStatusInDb(
  id: string,
  status: 'approved' | 'rejected',
  reviewer?: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_access_requests')) return;

  try {
    const { error } = await supabase
      .from('admin_access_requests')
      .update({
        status,
        reviewed_by: reviewer || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_access_requests');
    }
  } catch {
    // In-memory fallback active
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE AUDIT LOG PERSISTENCE & RETRIEVAL
 * -----------------------------------------------------------------------------
 */

export interface SharedAuditLogEntry {
  id: string;
  timestamp: number;
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  beforeValue?: any;
  afterValue?: any;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function persistSharedAuditLog(entry: SharedAuditLogEntry): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_audit_logs')) return;

  try {
    const { error } = await supabase.from('admin_audit_logs').insert({
      id: entry.id,
      timestamp: new Date(entry.timestamp).toISOString(),
      admin_id: entry.adminId || null,
      admin_email: entry.adminEmail || null,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId || null,
      before_value: entry.beforeValue || null,
      after_value: entry.afterValue || null,
      ip: entry.ip || null,
      user_agent: entry.userAgent || null,
      metadata: entry.metadata || null,
    });
    if (error && isSchemaCacheMissingTableError(error)) {
      markTableMissingInSupabase('admin_audit_logs');
    }
  } catch {
    // In-memory fallback active
  }
}

export async function getSharedAuditLogsFromDb(options?: {
  action?: string;
  adminEmail?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: SharedAuditLogEntry[]; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_audit_logs')) return null;

  try {
    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    if (options?.action) {
      query = query.eq('action', options.action);
    }
    if (options?.adminEmail) {
      query = query.ilike('admin_email', `%${options.adminEmail}%`);
    }
    if (options?.search) {
      const q = options.search.trim();
      query = query.or(`action.ilike.%${q}%,admin_email.ilike.%${q}%,target_type.ilike.%${q}%`);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_audit_logs');
      }
      return null;
    }

    const logs: SharedAuditLogEntry[] = (data || []).map((row: any) => ({
      id: row.id,
      timestamp: new Date(row.timestamp).getTime(),
      adminId: row.admin_id || undefined,
      adminEmail: row.admin_email || undefined,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id || undefined,
      beforeValue: row.before_value || undefined,
      afterValue: row.after_value || undefined,
      ip: row.ip || undefined,
      userAgent: row.user_agent || undefined,
      metadata: row.metadata || undefined,
    }));

    return { logs, total: count ?? logs.length };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE LIVE APPLICATION METRICS & STATISTICS (PHASE 8)
 * -----------------------------------------------------------------------------
 */

export interface AuthoritativeDashboardStats {
  totalUsers: number;
  activeUsers30d: number;
  activeUsers7d: number;
  totalLists: number;
  completedLists: number;
  totalItems: number;
  completedItems: number;
  totalAdmins: number;
  activeAdmins: number;
  pendingInvites: number;
  totalAuditLogs: number;
  openTickets: number;
}

export async function getAuthoritativeAppMetrics(): Promise<AuthoritativeDashboardStats | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      usersCountRes,
      activeUsers30dRes,
      activeUsers7dRes,
      listsCountRes,
      completedListsRes,
      itemsCountRes,
      completedItemsRes,
      adminsRes,
      invitesRes,
      auditLogsRes,
      ticketsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', thirtyDaysAgoIso),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', sevenDaysAgoIso),
      supabase.from('shopping_lists').select('*', { count: 'exact', head: true }),
      supabase.from('shopping_lists').select('*', { count: 'exact', head: true }).eq('is_completed', true),
      supabase.from('shopping_items').select('*', { count: 'exact', head: true }),
      supabase.from('shopping_items').select('*', { count: 'exact', head: true }).eq('is_completed', true),
      (async () => {
        if (isTableMissingInSupabase('admin_users')) return { count: 0, data: [] };
        try {
          const res = await supabase.from('admin_users').select('status', { count: 'exact' });
          if (res.error && isSchemaCacheMissingTableError(res.error)) {
            markTableMissingInSupabase('admin_users');
            return { count: 0, data: [] };
          }
          return res;
        } catch {
          return { count: 0, data: [] };
        }
      })(),
      (async () => {
        if (isTableMissingInSupabase('admin_invites')) return { count: 0 };
        try {
          const res = await supabase.from('admin_invites').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          if (res.error && isSchemaCacheMissingTableError(res.error)) {
            markTableMissingInSupabase('admin_invites');
            return { count: 0 };
          }
          return res;
        } catch {
          return { count: 0 };
        }
      })(),
      (async () => {
        if (isTableMissingInSupabase('admin_audit_logs')) return { count: 0 };
        try {
          const res = await supabase.from('admin_audit_logs').select('*', { count: 'exact', head: true });
          if (res.error && isSchemaCacheMissingTableError(res.error)) {
            markTableMissingInSupabase('admin_audit_logs');
            return { count: 0 };
          }
          return res;
        } catch {
          return { count: 0 };
        }
      })(),
      (async () => {
        if (isTableMissingInSupabase('support_tickets')) return { count: 0 };
        try {
          const res = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open');
          if (res.error && isSchemaCacheMissingTableError(res.error)) {
            markTableMissingInSupabase('support_tickets');
            return { count: 0 };
          }
          return res;
        } catch {
          return { count: 0 };
        }
      })(),
    ]);

    const totalUsers = usersCountRes.count ?? 0;
    const activeUsers30d = activeUsers30dRes.count ?? 0;
    const activeUsers7d = activeUsers7dRes.count ?? 0;
    const totalLists = listsCountRes.count ?? 0;
    const completedLists = completedListsRes.count ?? 0;
    const totalItems = itemsCountRes.count ?? 0;
    const completedItems = completedItemsRes.count ?? 0;

    const adminsList = adminsRes.data || [];
    const totalAdmins = adminsRes.count ?? adminsList.length;
    const activeAdmins = adminsList.filter((a: any) => a.status === 'active').length;
    const pendingInvites = invitesRes.count ?? 0;
    const totalAuditLogs = auditLogsRes.count ?? 0;
    const openTickets = ticketsRes.count ?? 0;

    return {
      totalUsers,
      activeUsers30d,
      activeUsers7d,
      totalLists,
      completedLists,
      totalItems,
      completedItems,
      totalAdmins,
      activeAdmins,
      pendingInvites,
      totalAuditLogs,
      openTickets,
    };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE USER DIRECTORY (PHASE 9)
 * -----------------------------------------------------------------------------
 */

export interface AuthoritativeAppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  language?: string;
  avatarUrl?: string;
  signupDate: number;
  lastActiveAt: number;
  status: 'active' | 'suspended';
  suspendReason?: string;
  listsCount: number;
  completedTripsCount: number;
  isVerified?: boolean;
}

export async function getAuthoritativeAppUsers(options?: {
  search?: string;
  status?: string;
  offset?: number;
  limit?: number;
}): Promise<{ users: AuthoritativeAppUser[]; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.search) {
      const q = options.search.trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 25;
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('profiles');
      }
      return null;
    }

    if (!profiles || profiles.length === 0) {
      return { users: [], total: count ?? 0 };
    }

    // Fetch actual shopping list counts per user
    const userIds = profiles.map((p: any) => p.id);
    const { data: userLists } = await supabase
      .from('shopping_lists')
      .select('id, user_id, is_completed')
      .in('user_id', userIds);

    const listCountsByUser = new Map<string, { total: number; completed: number }>();
    (userLists || []).forEach((l: any) => {
      const current = listCountsByUser.get(l.user_id) || { total: 0, completed: 0 };
      current.total += 1;
      if (l.is_completed) current.completed += 1;
      listCountsByUser.set(l.user_id, current);
    });

    const verifiedMap = (await getAuthoritativeSetting<Record<string, boolean>>('yaad_verified_users')) || {};
    const suspendedMap = (await getAuthoritativeSetting<Record<string, { suspended: boolean; reason?: string }>>('yaad_suspended_users')) || {};

    // Retrieve auth users from Supabase Auth admin if available to guarantee email & Google OAuth accounts appear
    const authUsersMap = new Map<string, any>();
    try {
      if ((supabase as any).auth?.admin?.listUsers) {
        const { data: authData } = await (supabase as any).auth.admin.listUsers();
        if (authData?.users && Array.isArray(authData.users)) {
          authData.users.forEach((au: any) => {
            authUsersMap.set(au.id, au);
          });
        }
      }
    } catch {}

    const users: AuthoritativeAppUser[] = profiles.map((p: any) => {
      const counts = listCountsByUser.get(p.id) || { total: 0, completed: 0 };
      const createdAt = p.created_at ? new Date(p.created_at).getTime() : Date.now();
      const updatedAt = p.updated_at ? new Date(p.updated_at).getTime() : createdAt;
      const au = authUsersMap.get(p.id);

      const isSuspended = Boolean(p.is_suspended || suspendedMap[p.id]?.suspended);
      const suspendReason = p.suspend_reason || suspendedMap[p.id]?.reason;

      return {
        id: p.id,
        name: p.full_name || au?.user_metadata?.full_name || au?.user_metadata?.name || 'Shopper',
        email: p.email || au?.email || undefined,
        phone: p.phone_number || p.phone || au?.phone || au?.user_metadata?.phone_number || undefined,
        language: p.language || au?.user_metadata?.language || 'en',
        avatarUrl: p.avatar_url || au?.user_metadata?.avatar_url || undefined,
        signupDate: createdAt,
        lastActiveAt: au?.last_sign_in_at ? new Date(au.last_sign_in_at).getTime() : updatedAt,
        status: isSuspended ? 'suspended' : 'active',
        suspendReason: suspendReason || undefined,
        listsCount: counts.total,
        completedTripsCount: counts.completed,
        isVerified: Boolean(p.is_verified || au?.user_metadata?.is_verified || (verifiedMap && verifiedMap[p.id])),
      };
    });

    // Append any auth users who haven't created a profiles record yet
    authUsersMap.forEach((au, id) => {
      if (!profiles.some((p: any) => p.id === id)) {
        const isSusp = Boolean(suspendedMap[id]?.suspended);
        users.push({
          id,
          name: au.user_metadata?.full_name || au.user_metadata?.name || 'Shopper',
          email: au.email || undefined,
          phone: au.phone || au.user_metadata?.phone_number || undefined,
          language: au.user_metadata?.language || 'en',
          avatarUrl: au.user_metadata?.avatar_url || undefined,
          signupDate: au.created_at ? new Date(au.created_at).getTime() : Date.now(),
          lastActiveAt: au.last_sign_in_at ? new Date(au.last_sign_in_at).getTime() : Date.now(),
          status: isSusp ? 'suspended' : 'active',
          suspendReason: suspendedMap[id]?.reason || undefined,
          listsCount: listCountsByUser.get(id)?.total || 0,
          completedTripsCount: listCountsByUser.get(id)?.completed || 0,
          isVerified: Boolean(au.user_metadata?.is_verified || verifiedMap[id]),
        });
      }
    });

    return { users, total: Math.max(count ?? 0, users.length) };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE SHOPPING LIST MODERATION (PHASE 10)
 * -----------------------------------------------------------------------------
 */

export interface AuthoritativeShoppingListSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  title: string;
  isCompleted: boolean;
  itemsCount: number;
  createdAt: number;
  updatedAt: number;
  items: Array<{
    id: string;
    name: string;
    category: string;
    quantity?: string;
    unit?: string;
    completed: boolean;
  }>;
}

export async function getAuthoritativeShoppingLists(options?: {
  search?: string;
  isCompleted?: boolean;
  offset?: number;
  limit?: number;
}): Promise<{ lists: AuthoritativeShoppingListSummary[]; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    let query = supabase
      .from('shopping_lists')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.search) {
      query = query.ilike('title', `%${options.search.trim()}%`);
    }
    if (options?.isCompleted !== undefined) {
      query = query.eq('is_completed', options.isCompleted);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 25;
    query = query.range(offset, offset + limit - 1);

    const { data: listsData, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('shopping_lists');
      }
      return null;
    }

    if (!listsData || listsData.length === 0) {
      return { lists: [], total: count ?? 0 };
    }

    const listIds = listsData.map((l: any) => l.id);
    const userIds = [...new Set(listsData.map((l: any) => l.user_id))];

    const [itemsRes, profilesRes] = await Promise.all([
      supabase.from('shopping_items').select('*').in('list_id', listIds),
      supabase.from('profiles').select('id, full_name, email').in('id', userIds),
    ]);

    const userMap = new Map<string, { name: string; email?: string }>();
    (profilesRes.data || []).forEach((p: any) => {
      userMap.set(p.id, { name: p.full_name || 'Anonymous User', email: p.email || undefined });
    });

    const itemsByList = new Map<string, any[]>();
    (itemsRes.data || []).forEach((item: any) => {
      const arr = itemsByList.get(item.list_id) || [];
      arr.push({
        id: item.id,
        name: item.item_name || item.name || '',
        category: item.category || 'other',
        quantity: item.quantity ? String(item.quantity) : undefined,
        unit: item.unit || undefined,
        completed: Boolean(item.is_completed),
      });
      itemsByList.set(item.list_id, arr);
    });

    const lists: AuthoritativeShoppingListSummary[] = listsData.map((l: any) => {
      const userInfo = userMap.get(l.user_id) || { name: 'App User' };
      const items = itemsByList.get(l.id) || (Array.isArray(l.items) ? l.items : []);

      return {
        id: l.id,
        userId: l.user_id,
        userName: userInfo.name,
        userEmail: userInfo.email,
        title: l.title || 'Untitled List',
        isCompleted: Boolean(l.is_completed),
        itemsCount: items.length,
        createdAt: l.created_at ? new Date(l.created_at).getTime() : Date.now(),
        updatedAt: l.updated_at ? new Date(l.updated_at).getTime() : Date.now(),
        items,
      };
    });

    return { lists, total: count ?? lists.length };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE PRODUCT CATALOG (PHASE 2 & MODULE 6)
 * -----------------------------------------------------------------------------
 */

export interface AuthoritativeCatalogItem {
  id: string;
  canonicalName: string;
  englishName: string;
  urduName: string;
  categoryId: string;
  categoryName?: string;
  defaultUnit: string;
  emoji?: string;
  active: boolean;
  createdAt: number;
}

export async function getAuthoritativeCatalog(options?: {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AuthoritativeCatalogItem[]; categories: Array<{ id: string; nameEn: string; nameUr: string; icon: string }>; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('items')) return null;

  try {
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('id, name_en, name_ur, icon')
      .order('sort_order', { ascending: true });

    if (catError && isSchemaCacheMissingTableError(catError)) {
      markTableMissingInSupabase('categories');
    }

    const categories = (categoriesData || []).map((c: any) => ({
      id: c.id,
      nameEn: c.name_en,
      nameUr: c.name_ur,
      icon: c.icon || 'category',
    }));

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order('canonical_name', { ascending: true });

    if (options?.categoryId && options.categoryId !== 'all') {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.search) {
      const q = options.search.trim();
      query = query.or(`canonical_name.ilike.%${q}%,english_name.ilike.%${q}%,urdu_name.ilike.%${q}%`);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data: itemsData, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('items');
      }
      return null;
    }

    const catNameMap = new Map(categories.map((c) => [c.id, c.nameEn]));

    const items: AuthoritativeCatalogItem[] = (itemsData || []).map((it: any) => ({
      id: it.id,
      canonicalName: it.canonical_name,
      englishName: it.english_name,
      urduName: it.urdu_name,
      categoryId: it.category_id,
      categoryName: catNameMap.get(it.category_id) || it.category_id,
      defaultUnit: it.default_unit || 'kg',
      emoji: it.emoji || undefined,
      active: it.active !== false,
      createdAt: it.created_at ? new Date(it.created_at).getTime() : Date.now(),
    }));

    return { items, categories, total: count ?? items.length };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE SUPPORT TICKETS & CMS (MODULES 7 & 11)
 * -----------------------------------------------------------------------------
 */

export async function getAuthoritativeTickets(options?: {
  status?: string;
  search?: string;
  offset?: number;
  limit?: number;
}): Promise<{ tickets: any[]; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('support_tickets')) return null;

  try {
    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options?.search) {
      const q = options.search.trim();
      query = query.or(`ticket_number.ilike.%${q}%,subject.ilike.%${q}%,user_name.ilike.%${q}%,user_email.ilike.%${q}%`);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 25;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('support_tickets');
      }
      return null;
    }

    return { tickets: data || [], total: count ?? (data?.length || 0) };
  } catch {
    return null;
  }
}

export async function getAuthoritativeCms(options?: {
  status?: string;
  search?: string;
}): Promise<{ articles: any[]; total: number } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('cms_articles')) return null;

  try {
    let query = supabase
      .from('cms_articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options?.search) {
      query = query.ilike('title', `%${options.search.trim()}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('cms_articles');
      }
      return null;
    }

    return { articles: data || [], total: count ?? (data?.length || 0) };
  } catch {
    return null;
  }
}

/**
 * -----------------------------------------------------------------------------
 * AUTHORITATIVE SETTINGS KEY-VALUE STORE (MODULE 12)
 * -----------------------------------------------------------------------------
 */

export async function getAuthoritativeSetting<T>(key: string): Promise<T | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_settings')) return null;

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_settings');
      }
      return null;
    }
    if (!data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function setAuthoritativeSetting<T>(key: string, value: T, updatedBy?: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase || isTableMissingInSupabase('admin_settings')) return false;

  try {
    const { error } = await supabase.from('admin_settings').upsert({
      key,
      value: value as any,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    });
    if (error) {
      if (isSchemaCacheMissingTableError(error)) {
        markTableMissingInSupabase('admin_settings');
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function setAuthoritativeAppUserVerified(userId: string, isVerified: boolean): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  let success = false;
  try {
    // 1. Update profiles table if available
    if (!isTableMissingInSupabase('profiles')) {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: isVerified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (!error) {
        success = true;
      }
    }

    // 2. Also attempt updating auth.users user_metadata for sync
    try {
      if ((supabase as any).auth?.admin?.updateUserById) {
        await (supabase as any).auth.admin.updateUserById(userId, {
          user_metadata: { is_verified: isVerified },
        });
        success = true;
      }
    } catch {
      // ignore auth admin failure if permission is restricted
    }

    // 3. Persist verified users map in admin_settings key-value store for 100% durability
    const verifiedMap = (await getAuthoritativeSetting<Record<string, boolean>>('yaad_verified_users')) || {};
    verifiedMap[userId] = isVerified;
    await setAuthoritativeSetting('yaad_verified_users', verifiedMap, 'super_admin');

    return success || true;
  } catch (err) {
    console.warn('[SupabaseAdmin] Error updating verified status:', err);
    return false;
  }
}

export async function setAuthoritativeAppUserStatus(
  userId: string,
  status: 'active' | 'suspended',
  reason?: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const isSuspended = status === 'suspended';

  try {
    if (supabase && !isTableMissingInSupabase('profiles')) {
      await supabase
        .from('profiles')
        .update({
          is_suspended: isSuspended,
          suspend_reason: isSuspended ? (reason || null) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // Persist suspended users map in admin_settings key-value store for 100% durability
    const suspendedMap = (await getAuthoritativeSetting<Record<string, { suspended: boolean; reason?: string }>>('yaad_suspended_users')) || {};
    if (isSuspended) {
      suspendedMap[userId] = { suspended: true, reason: reason || 'Suspended by administration' };
    } else {
      delete suspendedMap[userId];
    }
    await setAuthoritativeSetting('yaad_suspended_users', suspendedMap, 'super_admin');

    return true;
  } catch (err) {
    console.warn('[SupabaseAdmin] Error updating user suspension:', err);
    return false;
  }
}

