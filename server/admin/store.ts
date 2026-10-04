import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type AdminRole = 'super_admin' | 'support_agent' | 'content_editor' | 'analyst';

export type AdminStatus = 'active' | 'suspended';

export interface AdminRecoveryCode {
  codeHash: string;
  usedAt?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: AdminRole;
  totpSecret: string;
  isTotpEnabled: boolean;
  recoveryCodes?: AdminRecoveryCode[];
  status: AdminStatus;
  suspendReason?: string;
  failedAttempts: number;
  lockoutUntil?: number;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface AdminInvite {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  token: string;
  invitedBy: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: number;
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: number;
  acceptedAt?: number;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: number;
  usedAt?: number;
  createdAt: number;
}

export interface AdminSession {
  sessionId: string;
  adminId: string;
  token: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  ip?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
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

export interface AdminSettings {
  emailAllowlist?: string[];
  setupCompletedAt?: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  type: 'account_lockout' | 'repeated_failures' | 'unauthorized_attempt';
  title: string;
  message: string;
  targetEmail: string;
  ip?: string;
  dismissed?: boolean;
}

export interface AdminDatabase {
  admins: AdminUser[];
  invites: AdminInvite[];
  resets: PasswordResetToken[];
  sessions: AdminSession[];
  auditLogs: AuditLogEntry[];
  securityAlerts?: SecurityAlert[];
  settings?: AdminSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'admin_data.json');

// Inactivity timeout: 30 minutes
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// Absolute session expiry: 12 hours
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
// Max failed attempts before lockout
export const MAX_FAILED_ATTEMPTS = 5;
// Lockout duration: 15 minutes
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    const bytes = crypto.randomBytes(8);
    for (let b = 0; b < 4; b++) {
      part1 += chars[bytes[b] % chars.length];
      part2 += chars[bytes[b + 4] % chars.length];
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

export function isStrongPassword(password: string): { isValid: boolean; reason?: string } {
  if (!password || password.length < 12) {
    return { isValid: false, reason: 'Password must be at least 12 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, reason: 'Password must include at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, reason: 'Password must include at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, reason: 'Password must include at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return { isValid: false, reason: 'Password must include at least one special symbol.' };
  }
  return { isValid: true };
}

export function verifySetupKey(candidateKey: string): boolean {
  // Read ADMIN_SETUP_KEY from environment, with safe local fallback
  const configuredKey = process.env.ADMIN_SETUP_KEY || 'yaad_bootstrap_superadmin_sec_2026_xyz987';
  if (!configuredKey || typeof configuredKey !== 'string' || configuredKey.trim().length === 0) {
    return false;
  }
  const cleanCandidate = (candidateKey || '').trim();
  const cleanConfigured = configuredKey.trim();
  if (cleanCandidate.length !== cleanConfigured.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(cleanCandidate), Buffer.from(cleanConfigured));
  } catch {
    return false;
  }
}

class AdminStore {
  private db: AdminDatabase = {
    admins: [],
    invites: [],
    resets: [],
    sessions: [],
    auditLogs: [],
    securityAlerts: [],
    settings: {
      emailAllowlist: [],
    },
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.db = {
          admins: parsed.admins || [],
          invites: parsed.invites || [],
          resets: parsed.resets || [],
          sessions: parsed.sessions || [],
          auditLogs: parsed.auditLogs || [],
          securityAlerts: parsed.securityAlerts || [],
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[AdminStore] Error loading database:', err);
    }
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AdminStore] Error saving database:', err);
    }
  }

  // --- First Admin Bootstrap Methods ---
  public getActiveAdminsCount(): number {
    return this.db.admins.filter((a) => !a.deletedAt).length;
  }

  public isSetupAllowed(): boolean {
    if (process.env.ADMIN_SETUP_ENABLED === 'false') {
      return false;
    }
    return this.getActiveAdminsCount() === 0;
  }

  public getEmailAllowlist(): string[] {
    return this.db.settings?.emailAllowlist || [];
  }

  public setEmailAllowlist(list: string[]): void {
    if (!this.db.settings) {
      this.db.settings = {};
    }
    this.db.settings.emailAllowlist = list.map((s) => s.trim().toLowerCase()).filter(Boolean);
    this.save();
  }

  public isEmailAllowed(email: string): boolean {
    const allowlist = this.getEmailAllowlist();
    if (allowlist.length === 0) return true;
    const clean = email.toLowerCase().trim();
    return allowlist.some((rule) => {
      if (rule.startsWith('@')) {
        return clean.endsWith(rule);
      }
      return clean === rule;
    });
  }

  public createFirstSuperAdmin(params: {
    name: string;
    email: string;
    passwordPlain: string;
    ip?: string;
    userAgent?: string;
  }): AdminUser {
    if (!this.isSetupAllowed()) {
      throw new Error('Bootstrap setup is disabled or already completed.');
    }

    const { isValid, reason } = isStrongPassword(params.passwordPlain);
    if (!isValid) {
      throw new Error(reason || 'Password does not meet complexity requirements.');
    }

    const cleanEmail = params.email.trim().toLowerCase();
    if (!this.isEmailAllowed(cleanEmail)) {
      throw new Error('This email domain or address is not permitted by the organization allowlist.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(params.passwordPlain, salt);

    const superAdmin: AdminUser = {
      id: 'admin_' + crypto.randomUUID(),
      name: params.name.trim(),
      email: cleanEmail,
      passwordHash,
      salt,
      role: 'super_admin',
      totpSecret: '',
      isTotpEnabled: false, // Mandatory 2FA enrollment on first login
      status: 'active',
      failedAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    this.db.admins.push(superAdmin);
    if (!this.db.settings) this.db.settings = {};
    this.db.settings.setupCompletedAt = Date.now();

    // Audit logs for bootstrap events
    this.writeAuditLog({
      action: 'first_super_admin_bootstrapped',
      adminId: superAdmin.id,
      adminEmail: superAdmin.email,
      targetType: 'admin_user',
      targetId: superAdmin.id,
      afterValue: { email: superAdmin.email, role: superAdmin.role },
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: { note: 'Initial Super Admin bootstrapped via secure setup key' },
    });

    this.writeAuditLog({
      action: 'setup_permanently_disabled',
      adminId: superAdmin.id,
      adminEmail: superAdmin.email,
      targetType: 'system_security',
      afterValue: { status: 'disabled' },
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: { note: 'One-time setup route permanently closed' },
    });

    this.save();
    return superAdmin;
  }

  // --- Recovery Codes (Task 4) ---
  public setRecoveryCodes(adminId: string, plainCodes: string[]): void {
    const admin = this.findAdminById(adminId);
    if (!admin) return;

    admin.recoveryCodes = plainCodes.map((code) => ({
      codeHash: hashCode(code),
    }));
    admin.updatedAt = Date.now();
    this.save();
  }

  public consumeRecoveryCode(adminId: string, plainCode: string): boolean {
    const admin = this.findAdminById(adminId);
    if (!admin || !admin.recoveryCodes || admin.recoveryCodes.length === 0) {
      return false;
    }

    const testHash = hashCode(plainCode);
    const target = admin.recoveryCodes.find((c) => c.codeHash === testHash && !c.usedAt);
    if (!target) {
      return false;
    }

    target.usedAt = Date.now();
    admin.updatedAt = Date.now();
    this.save();
    return true;
  }

  // --- Audit Log (Append-only) ---
  public writeAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const log: AuditLogEntry = {
      id: 'audit_' + crypto.randomUUID(),
      timestamp: Date.now(),
      ...entry,
    };
    this.db.auditLogs.unshift(log);
    // Keep last 10,000 logs in memory/disk
    if (this.db.auditLogs.length > 10000) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 10000);
    }
    this.save();
    return log;
  }

  public getAuditLogs(options?: {
    limit?: number;
    offset?: number;
    action?: string;
    adminEmail?: string;
    search?: string;
  }): { logs: AuditLogEntry[]; total: number } {
    let list = this.db.auditLogs;

    if (options?.action) {
      list = list.filter((l) => l.action.toLowerCase() === options.action?.toLowerCase());
    }

    if (options?.adminEmail) {
      list = list.filter((l) => (l.adminEmail || '').toLowerCase().includes(options.adminEmail!.toLowerCase()));
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          (l.adminEmail && l.adminEmail.toLowerCase().includes(q)) ||
          l.targetType.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paged = list.slice(offset, offset + limit);

    return { logs: paged, total };
  }

  // --- Admin User Operations ---
  public findAdminByEmail(email: string): AdminUser | undefined {
    return this.db.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && !a.deletedAt);
  }

  public findAdminById(id: string): AdminUser | undefined {
    return this.db.admins.find((a) => a.id === id && !a.deletedAt);
  }

  public getAllAdmins(): AdminUser[] {
    return this.db.admins.filter((a) => !a.deletedAt);
  }

  public verifyPassword(admin: AdminUser, passwordAttempt: string): boolean {
    const hash = hashPassword(passwordAttempt, admin.salt);
    return crypto.timingSafeEqual(Buffer.from(admin.passwordHash, 'hex'), Buffer.from(hash, 'hex'));
  }

  public updatePassword(adminId: string, newPasswordPlain: string): boolean {
    const admin = this.findAdminById(adminId);
    if (!admin) return false;

    const newSalt = crypto.randomBytes(16).toString('hex');
    admin.salt = newSalt;
    admin.passwordHash = hashPassword(newPasswordPlain, newSalt);
    admin.updatedAt = Date.now();
    admin.failedAttempts = 0;
    admin.lockoutUntil = undefined;

    // Invalidate all existing sessions upon password change
    this.invalidateAllSessionsForAdmin(adminId);
    this.save();
    return true;
  }

  public recordFailedLogin(adminId: string, clientIp?: string): { isLocked: boolean; remainingAttempts: number; lockoutUntil?: number } {
    const admin = this.findAdminById(adminId);
    if (!admin) return { isLocked: false, remainingAttempts: 0 };

    admin.failedAttempts = (admin.failedAttempts || 0) + 1;
    if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;

      // 1. Audit log the account lockout
      this.writeAuditLog({
        action: 'admin_account_locked',
        adminId: admin.id,
        adminEmail: admin.email,
        targetType: 'admin_user',
        targetId: admin.id,
        ip: clientIp,
        afterValue: { lockoutUntil: admin.lockoutUntil, failedAttempts: admin.failedAttempts },
        metadata: {
          note: `Account locked for 15 minutes after reaching ${MAX_FAILED_ATTEMPTS} failed login attempts.`,
        },
      });

      // 2. Security alert notifying all Super Admins
      const alert: SecurityAlert = {
        id: 'alert_' + crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'account_lockout',
        title: 'Security Alert: Account Lockout Triggered',
        message: `Admin account (${admin.email}) was locked for 15 minutes after 5 consecutive failed login attempts. Originating IP: ${clientIp || 'unknown'}`,
        targetEmail: admin.email,
        ip: clientIp,
        dismissed: false,
      };

      if (!this.db.securityAlerts) {
        this.db.securityAlerts = [];
      }
      this.db.securityAlerts.unshift(alert);

      this.writeAuditLog({
        action: 'super_admin_security_alert',
        adminId: admin.id,
        adminEmail: admin.email,
        targetType: 'system_security',
        ip: clientIp,
        metadata: {
          alertId: alert.id,
          title: alert.title,
          message: alert.message,
          severity: 'CRITICAL',
        },
      });

      this.save();
      return { isLocked: true, remainingAttempts: 0, lockoutUntil: admin.lockoutUntil };
    }

    this.save();
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - admin.failedAttempts,
    };
  }

  public getSecurityAlerts(): SecurityAlert[] {
    return (this.db.securityAlerts || []).filter((a) => !a.dismissed);
  }

  public dismissSecurityAlert(alertId: string): boolean {
    const alert = (this.db.securityAlerts || []).find((a) => a.id === alertId);
    if (!alert) return false;
    alert.dismissed = true;
    this.save();
    return true;
  }

  public resetFailedAttempts(adminId: string): void {
    const admin = this.findAdminById(adminId);
    if (admin) {
      admin.failedAttempts = 0;
      admin.lockoutUntil = undefined;
      admin.lastLoginAt = Date.now();
      admin.updatedAt = Date.now();
      this.save();
    }
  }

  public enableTotp(adminId: string, secret: string): boolean {
    const admin = this.findAdminById(adminId);
    if (!admin) return false;

    admin.totpSecret = secret;
    admin.isTotpEnabled = true;
    admin.updatedAt = Date.now();
    this.save();
    return true;
  }

  public setAdminStatus(adminId: string, status: AdminStatus, reason?: string): boolean {
    const admin = this.findAdminById(adminId);
    if (!admin) return false;

    admin.status = status;
    admin.suspendReason = status === 'suspended' ? reason : undefined;
    admin.updatedAt = Date.now();

    if (status === 'suspended') {
      this.invalidateAllSessionsForAdmin(adminId);
    }

    this.save();
    return true;
  }

  // --- Session Management ---
  public createSession(adminId: string, ip?: string, userAgent?: string): AdminSession {
    const token = generateSecureToken();
    const now = Date.now();
    const session: AdminSession = {
      sessionId: 'sess_' + crypto.randomUUID(),
      adminId,
      token,
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + SESSION_MAX_AGE_MS,
      ip,
      userAgent,
    };

    this.db.sessions.push(session);
    this.save();
    return session;
  }

  public validateSession(token: string): { session?: AdminSession; admin?: AdminUser; error?: string } {
    if (!token) return { error: 'No session token provided' };

    const session = this.db.sessions.find((s) => s.token === token);
    if (!session) {
      return { error: 'Invalid or expired session' };
    }

    const now = Date.now();
    // Check absolute expiration
    if (now > session.expiresAt) {
      this.destroySession(token);
      return { error: 'Session has expired' };
    }

    // Check inactivity timeout (30 mins)
    if (now - session.lastActivityAt > SESSION_INACTIVITY_TIMEOUT_MS) {
      this.destroySession(token);
      return { error: 'Session expired due to inactivity' };
    }

    const admin = this.findAdminById(session.adminId);
    if (!admin) {
      this.destroySession(token);
      return { error: 'Admin account not found' };
    }

    if (admin.status === 'suspended') {
      this.destroySession(token);
      return { error: 'Admin account is currently suspended' };
    }

    // Refresh last activity time
    session.lastActivityAt = now;
    this.save();

    return { session, admin };
  }

  public destroySession(token: string): void {
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.save();
  }

  public invalidateAllSessionsForAdmin(adminId: string): void {
    this.db.sessions = this.db.sessions.filter((s) => s.adminId !== adminId);
    this.save();
  }

  // --- Invites ---
  public createInvite(options: {
    email: string;
    name: string;
    role: AdminRole;
    invitedBy: { id: string; email: string; name: string };
  }): AdminInvite {
    const cleanEmail = options.email.toLowerCase().trim();
    if (!this.isEmailAllowed(cleanEmail)) {
      throw new Error('This email address or domain is not permitted by the organization allowlist.');
    }

    const token = generateSecureToken();
    const invite: AdminInvite = {
      id: 'inv_' + crypto.randomUUID(),
      email: cleanEmail,
      name: options.name.trim(),
      role: options.role,
      token,
      invitedBy: options.invitedBy,
      // Exactly 24 hours expiration
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Remove any previous pending invites for this email
    this.db.invites = this.db.invites.filter(
      (i) => !(i.email === invite.email && i.status === 'pending')
    );

    this.db.invites.push(invite);
    this.save();
    return invite;
  }

  public findInviteByToken(token: string): AdminInvite | undefined {
    return this.db.invites.find((i) => i.token === token);
  }

  public getAllInvites(): AdminInvite[] {
    return this.db.invites;
  }

  public revokeInvite(inviteId: string): boolean {
    const invite = this.db.invites.find((i) => i.id === inviteId);
    if (!invite || invite.status !== 'pending') return false;

    invite.status = 'revoked';
    this.save();
    return true;
  }

  public acceptInvite(token: string, passwordPlain: string, totpSecret: string): AdminUser | null {
    const invite = this.findInviteByToken(token);
    if (!invite || invite.status !== 'pending' || Date.now() > invite.expiresAt) {
      return null;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(passwordPlain, salt);

    const newAdmin: AdminUser = {
      id: 'admin_' + crypto.randomUUID(),
      name: invite.name,
      email: invite.email,
      passwordHash,
      salt,
      role: invite.role,
      totpSecret,
      isTotpEnabled: true,
      status: 'active',
      failedAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };

    this.db.admins.push(newAdmin);
    invite.status = 'accepted';
    invite.acceptedAt = Date.now();
    this.save();

    return newAdmin;
  }

  // --- Password Reset ---
  public createPasswordReset(email: string): PasswordResetToken | null {
    const admin = this.findAdminByEmail(email);
    if (!admin) return null;

    const token = generateSecureToken();
    const reset: PasswordResetToken = {
      id: 'reset_' + crypto.randomUUID(),
      email: admin.email,
      token,
      // 1 hour expiration
      expiresAt: Date.now() + 60 * 60 * 1000,
      createdAt: Date.now(),
    };

    // Remove old unused resets for this email
    this.db.resets = this.db.resets.filter((r) => r.email !== admin.email || r.usedAt);
    this.db.resets.push(reset);
    this.save();
    return reset;
  }

  public findPasswordReset(token: string): PasswordResetToken | undefined {
    return this.db.resets.find((r) => r.token === token && !r.usedAt && Date.now() <= r.expiresAt);
  }

  public completePasswordReset(token: string, newPasswordPlain: string): AdminUser | null {
    const reset = this.findPasswordReset(token);
    if (!reset) return null;

    const admin = this.findAdminByEmail(reset.email);
    if (!admin) return null;

    this.updatePassword(admin.id, newPasswordPlain);
    reset.usedAt = Date.now();
    this.save();
    return admin;
  }
}

export const adminStore = new AdminStore();
