import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  adminStore,
  AdminRole,
  AdminUser,
  LOCKOUT_DURATION_MS,
  MAX_FAILED_ATTEMPTS,
  generateRecoveryCodes,
  verifySetupKey,
  isStrongPassword,
} from './store';
import {
  generateTotpSecret,
  verifyTotpToken,
  buildOtpAuthUri,
  generateQrCodeDataUrl,
} from './totp';
import {
  AdminAuthRequest,
  requireAdminAuth,
  requireRoles,
  rateLimit,
} from './middleware';

export const adminRouter = Router();

// In-memory temp tokens for multi-step 2FA login (valid for 5 minutes)
interface TempLoginState {
  adminId: string;
  email: string;
  expiresAt: number;
}
const tempLogins = new Map<string, TempLoginState>();

function createTempLoginToken(admin: AdminUser): string {
  const token = crypto.randomBytes(24).toString('hex');
  tempLogins.set(token, {
    adminId: admin.id,
    email: admin.email,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  return token;
}

function validateTempLoginToken(token: string): TempLoginState | null {
  if (!token) return null;
  const state = tempLogins.get(token);
  if (!state || Date.now() > state.expiresAt) {
    tempLogins.delete(token);
    return null;
  }
  return state;
}

// In-memory temporary bootstrap tokens (valid for 10 minutes)
interface BootstrapState {
  token: string;
  createdAt: number;
  expiresAt: number;
}
const bootstrapTokens = new Map<string, BootstrapState>();

function createBootstrapToken(): string {
  const token = 'boot_' + crypto.randomBytes(32).toString('hex');
  bootstrapTokens.set(token, {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return token;
}

function validateBootstrapToken(token: string): boolean {
  if (!token) return false;
  const state = bootstrapTokens.get(token);
  if (!state || Date.now() > state.expiresAt) {
    bootstrapTokens.delete(token);
    return false;
  }
  return true;
}

function sanitizeAdmin(admin: AdminUser) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    isTotpEnabled: admin.isTotpEnabled,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// 0. FIRST SUPER ADMIN BOOTSTRAP ENDPOINTS (One-time, self-destructing)
// -----------------------------------------------------------------------------

// Check if initial setup is currently allowed
adminRouter.get('/setup/status', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  if (!adminStore.isSetupAllowed()) {
    res.status(404).json({ error: 'Setup route not found.', code: 'SETUP_DISABLED' });
    return;
  }

  // Audit setup visited
  adminStore.writeAuditLog({
    action: 'setup_visited',
    targetType: 'system_security',
    ip: clientIp,
    userAgent,
    metadata: { note: 'Initial setup route accessed while 0 admins exist in database' },
  });

  res.status(200).json({ allowed: true });
});

// Verify ADMIN_SETUP_KEY from environment variables
adminRouter.post('/setup/verify-key', rateLimit(5, 15 * 60 * 1000), (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const { setupKey } = req.body;

  if (!adminStore.isSetupAllowed()) {
    res.status(404).json({ error: 'Setup route not found.', code: 'SETUP_DISABLED' });
    return;
  }

  if (!setupKey || typeof setupKey !== 'string') {
    res.status(400).json({ error: 'Setup key is required.' });
    return;
  }

  const isKeyValid = verifySetupKey(setupKey.trim());
  if (!isKeyValid) {
    adminStore.writeAuditLog({
      action: 'setup_key_failed',
      targetType: 'system_security',
      ip: clientIp,
      userAgent,
      metadata: { reason: 'Incorrect setup key submitted' },
    });
    res.status(401).json({ error: 'Invalid secret key or setup access denied.' });
    return;
  }

  const bootstrapToken = createBootstrapToken();
  adminStore.writeAuditLog({
    action: 'setup_key_verified',
    targetType: 'system_security',
    ip: clientIp,
    userAgent,
    metadata: { note: 'Valid setup key provided, temporary bootstrap session granted' },
  });

  res.status(200).json({
    success: true,
    bootstrapToken,
    message: 'Secret key verified. Please complete first Super Admin account creation.',
  });
});

// Create exactly ONE Super Admin, then permanently self-destructs
adminRouter.post('/setup/create-admin', rateLimit(5, 15 * 60 * 1000), (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const { bootstrapToken, name, email, password } = req.body;

  if (!adminStore.isSetupAllowed()) {
    res.status(404).json({ error: 'Setup route not found.', code: 'SETUP_DISABLED' });
    return;
  }

  if (!bootstrapToken || !validateBootstrapToken(bootstrapToken)) {
    res.status(401).json({ error: 'Invalid or expired setup token. Please re-enter the secret key.' });
    return;
  }

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Full name, email, and password are required.' });
    return;
  }

  try {
    const superAdmin = adminStore.createFirstSuperAdmin({
      name: String(name),
      email: String(email),
      passwordPlain: String(password),
      ip: clientIp,
      userAgent,
    });

    // Invalidate temporary bootstrap token immediately
    bootstrapTokens.delete(bootstrapToken);

    res.status(201).json({
      success: true,
      message: 'Super Admin created successfully. Setup route is now permanently disabled. Please log in to complete mandatory 2FA enrollment.',
      admin: sanitizeAdmin(superAdmin),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to bootstrap Super Admin.' });
  }
});

// -----------------------------------------------------------------------------
// 1. Admin Login (Passwordless Email + TOTP, or 2-Step)
// -----------------------------------------------------------------------------
adminRouter.post('/auth/login', rateLimit(10, 60 * 1000), (req: Request, res: Response) => {
  const { email, password, code, totpCode, recoveryCode } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  if (!email) {
    res.status(400).json({ error: 'Staff email address is required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const admin = adminStore.findAdminByEmail(cleanEmail);

  if (!admin) {
    adminStore.writeAuditLog({
      action: 'admin_login_failed',
      targetType: 'auth',
      afterValue: { email: cleanEmail, reason: 'user_not_found' },
      ip: clientIp,
    });
    res.status(401).json({ error: 'No admin account found with that email address.' });
    return;
  }

  // Check account suspension
  if (admin.status === 'suspended') {
    adminStore.writeAuditLog({
      action: 'admin_login_blocked',
      adminId: admin.id,
      adminEmail: admin.email,
      targetType: 'auth',
      afterValue: { reason: 'account_suspended' },
      ip: clientIp,
    });
    res.status(403).json({
      error: `Your admin account has been suspended. Reason: ${admin.suspendReason || 'Contact a Super Admin.'}`,
      code: 'ACCOUNT_SUSPENDED',
    });
    return;
  }

  // Check temporary lockout
  if (admin.lockoutUntil && Date.now() < admin.lockoutUntil) {
    const minutesLeft = Math.ceil((admin.lockoutUntil - Date.now()) / (60 * 1000));
    res.status(429).json({
      error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesLeft} minutes.`,
      code: 'ACCOUNT_LOCKED',
      lockoutUntil: admin.lockoutUntil,
    });
    return;
  }

  const authCode = String(code || totpCode || recoveryCode || '').trim().toUpperCase();

  // If 2FA is not yet configured for this admin
  if (!admin.isTotpEnabled || !admin.totpSecret) {
    const tempToken = createTempLoginToken(admin);
    res.status(200).json({
      requires2faSetup: true,
      tempToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      message: '2FA setup is required to access the YAAD Admin Panel.',
    });
    return;
  }

  // Direct passwordless authentication with TOTP / recovery code
  if (authCode) {
    let isRecovery = false;
    let isValidCode = false;

    if (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(authCode)) {
      isRecovery = true;
      isValidCode = adminStore.consumeRecoveryCode(admin.id, authCode);
    } else if (/^\d{6}$/.test(authCode)) {
      isValidCode = verifyTotpToken(admin.totpSecret, authCode);
    }

    if (!isValidCode) {
      const { isLocked, remainingAttempts, lockoutUntil } = adminStore.recordFailedLogin(admin.id, clientIp);
      adminStore.writeAuditLog({
        action: isRecovery ? 'admin_recovery_code_failed' : 'admin_2fa_failed',
        adminId: admin.id,
        adminEmail: admin.email,
        targetType: 'auth',
        afterValue: { reason: isRecovery ? 'invalid_recovery_code' : 'invalid_totp_code', remainingAttempts, isLocked },
        ip: clientIp,
      });

      if (isLocked) {
        res.status(429).json({
          error: `Account locked due to 5 consecutive failed attempts. Please wait 15 minutes.`,
          code: 'ACCOUNT_LOCKED',
          lockoutUntil,
        });
        return;
      }

      res.status(401).json({
        error: isRecovery
          ? 'Invalid or already-used emergency recovery code.'
          : `Invalid 6-digit authenticator code. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts,
      });
      return;
    }

    // Success!
    adminStore.resetFailedAttempts(admin.id);
    const session = adminStore.createSession(admin, clientIp, userAgent);

    adminStore.writeAuditLog({
      action: isRecovery ? 'admin_recovery_code_used' : 'admin_login_success',
      adminId: admin.id,
      adminEmail: admin.email,
      targetType: 'session',
      targetId: session.sessionId,
      ip: clientIp,
      userAgent,
      metadata: { role: admin.role, authMethod: isRecovery ? 'recovery_code' : 'totp_passwordless' },
    });

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader(
      'Set-Cookie',
      `yaad_admin_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${12 * 3600}; ${isSecure ? 'Secure;' : ''}`
    );

    res.status(200).json({
      success: true,
      token: session.token,
      admin: sanitizeAdmin(admin),
      expiresAt: session.expiresAt,
    });
    return;
  }

  // If password provided (fallback compatibility)
  if (password) {
    const isValidPassword = adminStore.verifyPassword(admin, String(password));
    if (!isValidPassword) {
      const { isLocked, remainingAttempts, lockoutUntil } = adminStore.recordFailedLogin(admin.id, clientIp);
      adminStore.writeAuditLog({
        action: 'admin_login_failed',
        adminId: admin.id,
        adminEmail: admin.email,
        targetType: 'auth',
        afterValue: { reason: 'invalid_password', remainingAttempts, isLocked },
        ip: clientIp,
      });

      if (isLocked) {
        res.status(429).json({
          error: `Account locked due to 5 consecutive failed attempts. All Super Admins have been alerted. Please wait 15 minutes.`,
          code: 'ACCOUNT_LOCKED',
          lockoutUntil,
        });
        return;
      }

      res.status(401).json({
        error: `Invalid admin credentials. ${remainingAttempts} attempt(s) remaining before 15-minute account lockout.`,
        remainingAttempts,
      });
      return;
    }

    const tempToken = createTempLoginToken(admin);
    res.status(200).json({
      requires2faVerify: true,
      tempToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      message: 'Please enter the 6-digit TOTP code from your authenticator app or emergency recovery code.',
    });
    return;
  }

  // If only email was sent
  const tempToken = createTempLoginToken(admin);
  res.status(200).json({
    requires2faVerify: true,
    tempToken,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    message: 'Please enter your 6-digit authenticator code.',
  });
});

// -----------------------------------------------------------------------------
// 2. Admin Login (Step 2: TOTP Verification or Emergency Recovery Code)
// -----------------------------------------------------------------------------
adminRouter.post('/auth/verify-2fa', rateLimit(10, 60 * 1000), (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  const state = validateTempLoginToken(tempToken);
  if (!state) {
    res.status(400).json({
      error: 'Login session expired or invalid. Please sign in again.',
      code: 'TEMP_SESSION_EXPIRED',
    });
    return;
  }

  const admin = adminStore.findAdminById(state.adminId);
  if (!admin) {
    res.status(404).json({ error: 'Admin account not found.' });
    return;
  }

  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) {
    res.status(400).json({ error: 'Please enter your 6-digit TOTP code or emergency recovery code.' });
    return;
  }

  let isRecovery = false;
  let isValidCode = false;

  // Check if format is emergency recovery code (e.g. ABCD-EFGH)
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanCode)) {
    isRecovery = true;
    isValidCode = adminStore.consumeRecoveryCode(admin.id, cleanCode);
  } else if (/^\d{6}$/.test(cleanCode)) {
    isValidCode = verifyTotpToken(admin.totpSecret, cleanCode);
  }

  if (!isValidCode) {
    adminStore.writeAuditLog({
      action: isRecovery ? 'admin_recovery_code_failed' : 'admin_2fa_failed',
      adminId: admin.id,
      adminEmail: admin.email,
      targetType: 'auth',
      afterValue: { reason: isRecovery ? 'invalid_or_used_recovery_code' : 'invalid_totp_code' },
      ip: clientIp,
    });
    res.status(401).json({
      error: isRecovery
        ? 'Invalid or already-used emergency recovery code.'
        : 'Invalid 2FA code. Please check your authenticator app and try again.',
      code: 'INVALID_2FA_CODE',
    });
    return;
  }

  // Successful 2FA verification!
  tempLogins.delete(tempToken);
  adminStore.resetFailedAttempts(admin.id);
  const session = adminStore.createSession(admin.id, clientIp, userAgent);

  adminStore.writeAuditLog({
    action: isRecovery ? 'admin_recovery_code_used' : 'admin_login_success',
    adminId: admin.id,
    adminEmail: admin.email,
    targetType: 'session',
    targetId: session.sessionId,
    ip: clientIp,
    userAgent,
    metadata: { role: admin.role, authMethod: isRecovery ? 'recovery_code' : 'totp' },
  });

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    `yaad_admin_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${12 * 3600}; ${isSecure ? 'Secure;' : ''}`
  );

  res.status(200).json({
    token: session.token,
    admin: sanitizeAdmin(admin),
    expiresAt: session.expiresAt,
  });
});

// -----------------------------------------------------------------------------
// 3. Setup 2FA (Generate Secret & QR Code)
// -----------------------------------------------------------------------------
adminRouter.post('/auth/setup-2fa', async (req: Request, res: Response) => {
  const { tempToken, token } = req.body;
  let admin: AdminUser | undefined;

  if (tempToken) {
    const state = validateTempLoginToken(tempToken);
    if (state) {
      admin = adminStore.findAdminById(state.adminId);
    }
  } else if (token) {
    const sessionRes = adminStore.validateSession(token);
    admin = sessionRes.admin;
  }

  if (!admin) {
    res.status(401).json({ error: 'Valid session or temp login token required.' });
    return;
  }

  const secret = generateTotpSecret();
  const otpAuthUri = buildOtpAuthUri(admin.email, secret, 'YAAD Admin');
  const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);

  res.status(200).json({
    secret,
    otpAuthUri,
    qrCodeDataUrl,
    email: admin.email,
  });
});

// -----------------------------------------------------------------------------
// 4. Confirm 2FA Setup
// -----------------------------------------------------------------------------
adminRouter.post('/auth/confirm-2fa', (req: Request, res: Response) => {
  const { tempToken, token, secret, code } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  let admin: AdminUser | undefined;
  if (tempToken) {
    const state = validateTempLoginToken(tempToken);
    if (state) admin = adminStore.findAdminById(state.adminId);
  } else if (token) {
    const sessionRes = adminStore.validateSession(token);
    admin = sessionRes.admin;
  }

  if (!admin) {
    res.status(401).json({ error: 'Valid session or temp login token required.' });
    return;
  }

  if (!secret || !code) {
    res.status(400).json({ error: 'Secret and verification code are required.' });
    return;
  }

  const isValid = verifyTotpToken(secret, String(code).trim());
  if (!isValid) {
    res.status(400).json({
      error: 'Verification code incorrect. Please verify the code on your authenticator app.',
    });
    return;
  }

  // Save TOTP secret and activate 2FA
  adminStore.enableTotp(admin.id, secret);
  if (tempToken) tempLogins.delete(tempToken);

  // Generate 10 single-use emergency recovery codes
  const recoveryCodes = generateRecoveryCodes(10);
  adminStore.setRecoveryCodes(admin.id, recoveryCodes);

  adminStore.writeAuditLog({
    action: 'admin_2fa_enabled',
    adminId: admin.id,
    adminEmail: admin.email,
    targetType: 'admin_user',
    targetId: admin.id,
    ip: clientIp,
    metadata: { note: 'Mandatory TOTP 2FA enabled, 10 emergency recovery codes generated' },
  });

  // Issue active session
  const session = adminStore.createSession(admin.id, clientIp, userAgent);
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    `yaad_admin_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${12 * 3600}; ${isSecure ? 'Secure;' : ''}`
  );

  res.status(200).json({
    message: '2FA has been successfully configured and activated.',
    token: session.token,
    admin: sanitizeAdmin(admin),
    recoveryCodes, // Exactly 10 codes shown once
  });
});

// -----------------------------------------------------------------------------
// 5. Forgot Password Request
// -----------------------------------------------------------------------------
adminRouter.post('/auth/forgot-password', rateLimit(5, 60 * 1000), (req: Request, res: Response) => {
  const { email } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const reset = adminStore.createPasswordReset(String(email).trim());
  if (reset) {
    const resetUrl = `/admin/reset-password?token=${reset.token}`;
    adminStore.writeAuditLog({
      action: 'admin_password_reset_requested',
      adminEmail: reset.email,
      targetType: 'auth',
      afterValue: { tokenHash: reset.token.substring(0, 8) + '...' },
      ip: clientIp,
    });

    console.log(`[YAAD Admin] Password reset link for ${email}: ${resetUrl}`);
    res.status(200).json({
      message: 'If an account exists with that email, a password reset link has been dispatched.',
      // In dev environment, return the direct link so the admin can test immediately without an SMTP server
      devResetLink: resetUrl,
    });
    return;
  }

  // Consistent response to prevent user enumeration
  res.status(200).json({
    message: 'If an account exists with that email, a password reset link has been dispatched.',
  });
});

// -----------------------------------------------------------------------------
// 6. Complete Password Reset
// -----------------------------------------------------------------------------
adminRouter.post('/auth/reset-password', rateLimit(5, 60 * 1000), (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!token || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required.' });
    return;
  }

  if (String(newPassword).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters in length.' });
    return;
  }

  const admin = adminStore.completePasswordReset(token, newPassword);
  if (!admin) {
    res.status(400).json({
      error: 'Invalid or expired password reset link. Please request a new link.',
      code: 'INVALID_RESET_TOKEN',
    });
    return;
  }

  adminStore.writeAuditLog({
    action: 'admin_password_reset_completed',
    adminId: admin.id,
    adminEmail: admin.email,
    targetType: 'admin_user',
    targetId: admin.id,
    ip: clientIp,
  });

  res.status(200).json({
    message: 'Your password has been successfully reset. You can now sign in with your new credentials.',
  });
});

// -----------------------------------------------------------------------------
// 7. Get Current Admin Profile & Check Inactivity
// -----------------------------------------------------------------------------
adminRouter.get('/auth/me', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  res.status(200).json({
    admin: sanitizeAdmin(req.admin!),
    session: {
      lastActivityAt: req.adminSession!.lastActivityAt,
      expiresAt: req.adminSession!.expiresAt,
    },
  });
});

// -----------------------------------------------------------------------------
// 8. Admin Logout
// -----------------------------------------------------------------------------
adminRouter.post('/auth/logout', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  adminStore.destroySession(req.adminSession!.token);
  adminStore.writeAuditLog({
    action: 'admin_logout',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'session',
    targetId: req.adminSession!.sessionId,
    ip: clientIp,
  });

  res.setHeader('Set-Cookie', 'yaad_admin_session=; Path=/; HttpOnly; Max-Age=0');
  res.status(200).json({ message: 'Signed out successfully.' });
});

// -----------------------------------------------------------------------------
// 9. Staff & Team Management (Super Admin only for mutations)
// -----------------------------------------------------------------------------
adminRouter.get('/team', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const { search, role, status, page = '1', limit = '10' } = req.query;

  let admins = adminStore.getAllAdmins();

  if (search) {
    const q = String(search).toLowerCase();
    admins = admins.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
  }

  if (role && role !== 'all') {
    admins = admins.filter((a) => a.role === role);
  }

  if (status && status !== 'all') {
    admins = admins.filter((a) => a.status === status);
  }

  const total = admins.length;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const paged = admins.slice((p - 1) * l, p * l).map(sanitizeAdmin);

  res.status(200).json({
    admins: paged,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

adminRouter.post(
  '/team/:id/status',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const targetId = req.params.id;
    const { status, reason } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    if (targetId === req.admin!.id) {
      res.status(400).json({ error: 'You cannot suspend your own admin account.' });
      return;
    }

    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }

    const targetAdmin = adminStore.findAdminById(targetId);
    if (!targetAdmin) {
      res.status(404).json({ error: 'Admin user not found.' });
      return;
    }

    const before = { status: targetAdmin.status, reason: targetAdmin.suspendReason };
    adminStore.setAdminStatus(targetId, status, reason);
    const after = { status, reason };

    adminStore.writeAuditLog({
      action: status === 'suspended' ? 'admin_suspended' : 'admin_reactivated',
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      targetType: 'admin_user',
      targetId,
      beforeValue: before,
      afterValue: after,
      ip: clientIp,
      metadata: { targetEmail: targetAdmin.email, reason },
    });

    res.status(200).json({
      message: `Admin ${targetAdmin.email} has been ${status === 'suspended' ? 'suspended' : 'reactivated'}.`,
    });
  }
);

// -----------------------------------------------------------------------------
// 10. Admin Invitations (Super Admin Only)
// -----------------------------------------------------------------------------
adminRouter.get('/invites', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  const invites = adminStore.getAllInvites();
  res.status(200).json({ invites });
});

adminRouter.post('/invites', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  const { email, name, role } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!email || !name || !role) {
    res.status(400).json({ error: 'Name, email, and role are required for inviting an admin.' });
    return;
  }

  const validRoles: AdminRole[] = ['super_admin', 'support_agent', 'content_editor', 'analyst'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
    return;
  }

  const existing = adminStore.findAdminByEmail(String(email).trim());
  if (existing) {
    res.status(400).json({ error: `An admin account with email ${email} already exists.` });
    return;
  }

  const invite = adminStore.createInvite({
    email: String(email).trim(),
    name: String(name).trim(),
    role,
    invitedBy: {
      id: req.admin!.id,
      email: req.admin!.email,
      name: req.admin!.name,
    },
  });

  const inviteUrl = `/admin/accept-invite?token=${invite.token}`;

  adminStore.writeAuditLog({
    action: 'admin_invited',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'admin_invite',
    targetId: invite.id,
    afterValue: { email: invite.email, role: invite.role, name: invite.name },
    ip: clientIp,
  });

  console.log(`[YAAD Admin] Admin invite generated for ${invite.email}: ${inviteUrl}`);

  res.status(201).json({
    message: `Invite generated successfully for ${invite.email}.`,
    invite,
    inviteUrl,
  });
});

adminRouter.delete(
  '/invites/:id',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const inviteId = req.params.id;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const success = adminStore.revokeInvite(inviteId);
    if (!success) {
      res.status(404).json({ error: 'Pending invite not found.' });
      return;
    }

    adminStore.writeAuditLog({
      action: 'admin_invite_revoked',
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      targetType: 'admin_invite',
      targetId: inviteId,
      ip: clientIp,
    });

    res.status(200).json({ message: 'Invite revoked.' });
  }
);

// Verify an invite token before rendering form
adminRouter.get('/invites/verify', (req: Request, res: Response) => {
  const token = String(req.query.token || '').trim();
  const invite = adminStore.findInviteByToken(token);

  if (!invite || invite.status !== 'pending' || Date.now() > invite.expiresAt) {
    res.status(400).json({
      error: 'This invitation link is invalid or has expired. Please contact a Super Admin.',
      code: 'INVALID_INVITE',
    });
    return;
  }

  res.status(200).json({
    email: invite.email,
    name: invite.name,
    role: invite.role,
    expiresAt: invite.expiresAt,
  });
});

// Accept invite & complete 2FA setup
adminRouter.post('/invites/accept', (req: Request, res: Response) => {
  const { token, password, totpSecret, totpCode } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || '';

  if (!token || !password || !totpSecret || !totpCode) {
    res.status(400).json({
      error: 'Token, password, 2FA secret, and verification code are required.',
    });
    return;
  }

  const { isValid: isStrong, reason: pwdReason } = isStrongPassword(String(password));
  if (!isStrong) {
    res.status(400).json({ error: pwdReason || 'Password must meet complexity requirements (min 12 chars, upper/lower/number/symbol).' });
    return;
  }

  const isValidCode = verifyTotpToken(totpSecret, String(totpCode).trim());
  if (!isValidCode) {
    res.status(400).json({
      error: 'Verification code incorrect. Please verify your authenticator app code.',
    });
    return;
  }

  const newAdmin = adminStore.acceptInvite(token, String(password), totpSecret);
  if (!newAdmin) {
    res.status(400).json({ error: 'Invitation could not be accepted. It may be expired or already used.' });
    return;
  }

  // Generate 10 single-use emergency recovery codes for invitee
  const recoveryCodes = generateRecoveryCodes(10);
  adminStore.setRecoveryCodes(newAdmin.id, recoveryCodes);

  const session = adminStore.createSession(newAdmin.id, clientIp, userAgent);

  adminStore.writeAuditLog({
    action: 'admin_invite_accepted',
    adminId: newAdmin.id,
    adminEmail: newAdmin.email,
    targetType: 'admin_user',
    targetId: newAdmin.id,
    afterValue: { role: newAdmin.role },
    ip: clientIp,
    metadata: { note: 'Staff invitation accepted with mandatory 2FA enrollment' },
  });

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    `yaad_admin_session=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${12 * 3600}; ${isSecure ? 'Secure;' : ''}`
  );

  res.status(200).json({
    message: 'Welcome to the YAAD Admin Team! Your account has been activated.',
    token: session.token,
    admin: sanitizeAdmin(newAdmin),
    recoveryCodes, // Exactly 10 codes shown once
  });
});

// -----------------------------------------------------------------------------
// 11. Security Alerts for Super Admins
// -----------------------------------------------------------------------------
adminRouter.get(
  '/security-alerts',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    res.status(200).json({
      alerts: adminStore.getSecurityAlerts(),
    });
  }
);

adminRouter.post(
  '/security-alerts/dismiss',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const { alertId } = req.body;
    if (!alertId) {
      res.status(400).json({ error: 'alertId is required.' });
      return;
    }
    adminStore.dismissSecurityAlert(String(alertId));
    res.status(200).json({ success: true, message: 'Alert dismissed.' });
  }
);

// -----------------------------------------------------------------------------
// 12. Email Allowlist Settings (Super Admin Only)
// -----------------------------------------------------------------------------
adminRouter.get(
  '/settings/allowlist',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    res.status(200).json({
      allowlist: adminStore.getEmailAllowlist(),
    });
  }
);

adminRouter.post(
  '/settings/allowlist',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const { allowlist } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    if (!Array.isArray(allowlist)) {
      res.status(400).json({ error: 'Allowlist must be an array of strings (e.g. "@company.com" or "user@domain.com").' });
      return;
    }

    const before = adminStore.getEmailAllowlist();
    adminStore.setEmailAllowlist(allowlist);
    const after = adminStore.getEmailAllowlist();

    adminStore.writeAuditLog({
      action: 'email_allowlist_updated',
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      targetType: 'system_security',
      beforeValue: before,
      afterValue: after,
      ip: clientIp,
      metadata: { count: after.length },
    });

    res.status(200).json({
      message: 'Email allowlist successfully updated.',
      allowlist: after,
    });
  }
);

// -----------------------------------------------------------------------------
// 13. Public Signup Hard-Block (Invite-only enforcement, returns 404)
// -----------------------------------------------------------------------------
adminRouter.all(['/signup', '/register', '/auth/signup', '/auth/register'], (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Registration is closed. Access to YAAD Admin is strictly by Super Admin invitation only.',
    code: 'PUBLIC_SIGNUP_FORBIDDEN',
  });
});

// -----------------------------------------------------------------------------
// 14. Audit Logs Viewer (Super Admin Only)
// -----------------------------------------------------------------------------
adminRouter.get(
  '/audit-logs',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const { action, adminEmail, search, page = '1', limit = '50' } = req.query;

    const p = Math.max(1, parseInt(String(page), 10));
    const l = Math.max(1, parseInt(String(limit), 10));
    const offset = (p - 1) * l;

    const { logs, total } = adminStore.getAuditLogs({
      action: action ? String(action) : undefined,
      adminEmail: adminEmail ? String(adminEmail) : undefined,
      search: search ? String(search) : undefined,
      limit: l,
      offset,
    });

    res.status(200).json({
      logs,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    });
  }
);

// -----------------------------------------------------------------------------
// 15. Method Not Allowed Guards for POST-Only Endpoints
// -----------------------------------------------------------------------------
adminRouter.get(
  [
    '/auth/login',
    '/auth/verify-2fa',
    '/auth/confirm-2fa',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/setup/verify-key',
    '/setup/create-admin',
    '/invites/accept',
  ],
  (req: Request, res: Response) => {
    res.status(405).json({
      error: `Method Not Allowed: ${req.method} is not supported for ${req.path}. Please send a POST request.`,
      code: 'METHOD_NOT_ALLOWED',
    });
  }
);

// -----------------------------------------------------------------------------
// 16. Admin Router Catch-All Fallback (guarantees JSON response, never HTML)
// -----------------------------------------------------------------------------
adminRouter.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Admin API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
    code: 'ADMIN_ENDPOINT_NOT_FOUND',
  });
});
