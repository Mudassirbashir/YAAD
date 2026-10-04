import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type AdminRole = 'super_admin' | 'support_agent' | 'content_editor' | 'analyst';

export type AdminStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: AdminRole;
  totpSecret: string;
  isTotpEnabled: boolean;
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

export interface AdminDatabase {
  admins: AdminUser[];
  invites: AdminInvite[];
  resets: PasswordResetToken[];
  sessions: AdminSession[];
  auditLogs: AuditLogEntry[];
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

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

class AdminStore {
  private db: AdminDatabase = {
    admins: [],
    invites: [],
    resets: [],
    sessions: [],
    auditLogs: [],
  };

  constructor() {
    this.load();
    this.seedInitialSuperAdmin();
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

  private seedInitialSuperAdmin(): void {
    const activeAdmins = this.db.admins.filter((a) => !a.deletedAt);
    if (activeAdmins.length === 0) {
      const email = 'admin@yaad.app';
      const name = 'YAAD Super Admin';
      const salt = crypto.randomBytes(16).toString('hex');
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'YaadAdmin2026!';
      const passwordHash = hashPassword(defaultPassword, salt);

      const adminUser: AdminUser = {
        id: 'admin_' + crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        salt,
        role: 'super_admin',
        totpSecret: '', // Will be configured on first login
        isTotpEnabled: false,
        status: 'active',
        failedAttempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null,
      };

      this.db.admins.push(adminUser);

      // Also create an audit log entry for initial setup
      this.writeAuditLog({
        action: 'system_initialized',
        targetType: 'admin_user',
        targetId: adminUser.id,
        afterValue: { email: adminUser.email, role: adminUser.role },
        metadata: { note: 'Initial Super Admin provisioned' },
      });

      this.save();
      console.log('----------------------------------------------------');
      console.log('🔐 [YAAD Admin] Initial Super Admin Created:');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('   Enforce 2FA TOTP setup on first login.');
      console.log('----------------------------------------------------');
    }
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

  public recordFailedLogin(adminId: string): { isLocked: boolean; remainingAttempts: number; lockoutUntil?: number } {
    const admin = this.findAdminById(adminId);
    if (!admin) return { isLocked: false, remainingAttempts: 0 };

    admin.failedAttempts = (admin.failedAttempts || 0) + 1;
    if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.save();
      return { isLocked: true, remainingAttempts: 0, lockoutUntil: admin.lockoutUntil };
    }

    this.save();
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - admin.failedAttempts,
    };
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
    const token = generateSecureToken();
    const invite: AdminInvite = {
      id: 'inv_' + crypto.randomUUID(),
      email: options.email.toLowerCase().trim(),
      name: options.name.trim(),
      role: options.role,
      token,
      invitedBy: options.invitedBy,
      // 7 days expiration
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
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
