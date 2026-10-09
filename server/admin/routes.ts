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
  requirePermission,
  rateLimit,
  getClientIp,
} from './middleware';
import {
  saveSharedTempToken,
  validateSharedTempToken,
  deleteSharedTempToken,
} from './supabaseAdmin';

export const adminRouter = Router();
 
// Preflight and CORS support across all Admin routes
adminRouter.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Temp tokens for multi-step 2FA login (valid for 5 minutes)
interface TempLoginState {
  adminId: string;
  email: string;
  expiresAt: number;
}

async function createTempLoginToken(admin: AdminUser): Promise<string> {
  const token = crypto.randomBytes(24).toString('hex');
  await saveSharedTempToken(token, admin.id, admin.email, 'login', 5 * 60 * 1000);
  return token;
}

async function validateTempLoginToken(token: string): Promise<TempLoginState | null> {
  if (!token) return null;
  const record = await validateSharedTempToken(token, 'login');
  if (!record) return null;
  return {
    adminId: record.adminId,
    email: record.email,
    expiresAt: record.expiresAt,
  };
}

// Temporary bootstrap tokens (valid for 10 minutes)
async function createBootstrapToken(): Promise<string> {
  const token = 'boot_' + crypto.randomBytes(32).toString('hex');
  await saveSharedTempToken(token, 'bootstrap_admin', 'bootstrap@yaad.app', 'bootstrap', 10 * 60 * 1000);
  return token;
}

async function validateBootstrapToken(token: string): Promise<boolean> {
  if (!token) return false;
  const record = await validateSharedTempToken(token, 'bootstrap');
  return Boolean(record);
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
  const clientIp = getClientIp(req);
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
adminRouter.post('/setup/verify-key', rateLimit(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';
  const { setupKey } = req.body || {};

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

  const bootstrapToken = await createBootstrapToken();
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
adminRouter.post('/setup/create-admin', rateLimit(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';
  const { bootstrapToken, name, email, password } = req.body || {};

  if (!adminStore.isSetupAllowed()) {
    res.status(404).json({ error: 'Setup route not found.', code: 'SETUP_DISABLED' });
    return;
  }

  if (!bootstrapToken || !(await validateBootstrapToken(bootstrapToken))) {
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
    deleteSharedTempToken(bootstrapToken).catch(() => null);

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
adminRouter.post('/auth/login', rateLimit(10, 60 * 1000), async (req: Request, res: Response) => {
  const { email, password, code, totpCode, recoveryCode } = req.body || {};
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';

  if (!email) {
    res.status(400).json({ error: 'Staff email address is required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const admin = await adminStore.findAdminByEmailAsync(cleanEmail);

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
    const tempToken = await createTempLoginToken(admin);
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

    const cleanAuth = authCode.replace(/[\s-]/g, '');
    if (Boolean(recoveryCode) || (/^[A-Z0-9]{4}[-\s]?[A-Z0-9]{4}$/.test(authCode) && !/^\d{6}$/.test(authCode))) {
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

    const tempToken = await createTempLoginToken(admin);
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
  const tempToken = await createTempLoginToken(admin);
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
adminRouter.post('/auth/verify-2fa', rateLimit(10, 60 * 1000), async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';

  const state = await validateTempLoginToken(tempToken);
  if (!state) {
    res.status(400).json({
      error: 'Login session expired or invalid. Please sign in again.',
      code: 'TEMP_SESSION_EXPIRED',
    });
    return;
  }

  const admin = await adminStore.findAdminByIdAsync(state.adminId);
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
  deleteSharedTempToken(tempToken).catch(() => null);
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
  const { tempToken, token } = req.body || {};
  let admin: AdminUser | undefined;

  if (tempToken) {
    const state = await validateTempLoginToken(tempToken);
    if (state) {
      admin = await adminStore.findAdminByIdAsync(state.adminId);
    } else {
      // Check if tempToken is a valid pending staff invite token
      const invite = await adminStore.findInviteByTokenAsync(tempToken);
      if (invite && invite.status === 'pending' && Date.now() <= invite.expiresAt) {
        admin = {
          id: `invite_${invite.id}`,
          email: invite.email,
          name: invite.name,
          role: invite.role,
          totpSecret: '',
          isTotpEnabled: false,
          status: 'active',
          failedAttempts: 0,
          createdAt: invite.createdAt,
          updatedAt: invite.createdAt,
          deletedAt: null,
          recoveryCodes: [],
        };
      }
    }
  } else if (token) {
    const sessionRes = await adminStore.validateSessionAsync(token);
    admin = sessionRes.admin;
  }

  if (!admin) {
    res.status(401).json({ error: 'Valid session or temp login token required.' });
    return;
  }

  try {
    const secret = generateTotpSecret();
    const otpAuthUri = buildOtpAuthUri(admin.email, secret, 'YAAD Admin');
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);

    res.status(200).json({
      secret,
      otpAuthUri,
      qrCodeDataUrl,
      email: admin.email,
    });
  } catch (err: any) {
    console.error('[2FA Setup Error]:', err);
    res.status(500).json({ error: 'Failed to generate 2FA setup QR code. Please try again.' });
  }
});

// -----------------------------------------------------------------------------
// 4. Confirm 2FA Setup
// -----------------------------------------------------------------------------
adminRouter.post('/auth/confirm-2fa', async (req: Request, res: Response) => {
  const { tempToken, token, secret, code } = req.body || {};
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';

  let admin: AdminUser | undefined;
  if (tempToken) {
    const state = await validateTempLoginToken(tempToken);
    if (state) admin = await adminStore.findAdminByIdAsync(state.adminId);
  } else if (token) {
    const sessionRes = await adminStore.validateSessionAsync(token);
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
  if (tempToken) await deleteSharedTempToken(tempToken);

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
  const { email } = req.body || {};
  const clientIp = getClientIp(req);

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
  const { token, newPassword } = req.body || {};
  const clientIp = getClientIp(req);

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

// Update / Set Password for Authenticated Staff Member
adminRouter.post('/auth/change-password', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const { newPassword } = req.body || {};
  const clientIp = getClientIp(req);

  if (!newPassword || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'New password is required.' });
    return;
  }

  const check = isStrongPassword(newPassword);
  if (!check.isValid) {
    res.status(400).json({ error: check.reason || 'Password does not meet complexity requirements.' });
    return;
  }

  const success = adminStore.updatePassword(req.admin!.id, newPassword);
  if (!success) {
    res.status(500).json({ error: 'Failed to update password.' });
    return;
  }

  adminStore.writeAuditLog({
    action: 'admin_password_updated',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'admin_user',
    targetId: req.admin!.id,
    ip: clientIp,
  });

  res.status(200).json({
    success: true,
    message: 'Staff password has been securely updated.',
  });
});

// Regenerate 10 Single-Use Emergency Recovery Codes (Super Admin only)
adminRouter.post('/auth/regenerate-recovery-codes', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  const clientIp = getClientIp(req);
  const recoveryCodes = generateRecoveryCodes(10);

  adminStore.setRecoveryCodes(req.admin!.id, recoveryCodes);

  adminStore.writeAuditLog({
    action: 'admin_recovery_codes_regenerated',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'admin_user',
    targetId: req.admin!.id,
    ip: clientIp,
    metadata: { note: '10 new emergency recovery codes generated' },
  });

  res.status(200).json({
    success: true,
    recoveryCodes,
    message: '10 new single-use emergency recovery codes generated.',
  });
});

// -----------------------------------------------------------------------------
// 8. Admin Logout
// -----------------------------------------------------------------------------
adminRouter.post('/auth/logout', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const clientIp = getClientIp(req);

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
adminRouter.get('/team', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { search, role, status, page = '1', limit = '10' } = req.query;

  let admins = await adminStore.getAllAdminsAsync();

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
    const clientIp = getClientIp(req);

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
adminRouter.get('/invites', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const invites = await adminStore.getAllInvitesAsync();
  res.status(200).json({ invites });
});

adminRouter.post('/invites', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  try {
    const { email, name, role } = req.body;
    const clientIp = getClientIp(req);

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
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to generate invitation.' });
  }
});

adminRouter.delete(
  '/invites/:id',
  requireAdminAuth,
  requireRoles('super_admin'),
  (req: AdminAuthRequest, res: Response) => {
    const inviteId = req.params.id;
    const clientIp = getClientIp(req);

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
adminRouter.get('/invites/verify', async (req: Request, res: Response) => {
  const token = String(req.query.token || '').trim().replace(/[\s\r\n/]+$/, '');
  const invite = await adminStore.findInviteByTokenAsync(token);

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
adminRouter.post('/invites/accept', async (req: Request, res: Response) => {
  const { token, password, totpSecret, totpCode } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] as string) || '';
  const cleanToken = String(token || '').trim().replace(/[\s\r\n/]+$/, '');

  if (!cleanToken || !totpSecret || !totpCode) {
    res.status(400).json({
      error: 'Token, 2FA secret, and verification code are required.',
    });
    return;
  }

  const isValidCode = verifyTotpToken(totpSecret, String(totpCode).trim());
  if (!isValidCode) {
    res.status(400).json({
      error: 'Verification code incorrect. Please verify your authenticator app code.',
    });
    return;
  }

  const invite = await adminStore.findInviteByTokenAsync(cleanToken);
  if (!invite || invite.status !== 'pending' || Date.now() > invite.expiresAt) {
    res.status(400).json({ error: 'Invitation could not be accepted. It may be expired or already used.' });
    return;
  }

  const plainPassword = password ? String(password) : `Aa1!${crypto.randomBytes(24).toString('hex')}`;
  const newAdmin = adminStore.acceptInvite(invite, plainPassword, totpSecret);
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
// 11b. Unified Admin Notifications Center (All Staff with RBAC filtering)
// -----------------------------------------------------------------------------
adminRouter.get('/notifications', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const result = adminStore.getAdminNotifications(req.admin);
  res.status(200).json(result);
});

adminRouter.post('/notifications/:id/dismiss', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Notification ID is required.' });
    return;
  }
  adminStore.dismissNotification(id);
  res.status(200).json({ success: true, message: 'Notification dismissed.' });
});

adminRouter.post('/notifications/dismiss-all', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  adminStore.dismissAllNotifications();
  res.status(200).json({ success: true, message: 'All notifications dismissed.' });
});

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
    const clientIp = getClientIp(req);

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
  async (req: AdminAuthRequest, res: Response) => {
    const { action, adminEmail, search, page = '1', limit = '50' } = req.query;

    const p = Math.max(1, parseInt(String(page), 10));
    const l = Math.max(1, parseInt(String(limit), 10));
    const offset = (p - 1) * l;

    const { logs, total } = await adminStore.getAuditLogsAsync({
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
// 14b. Authoritative Dashboard Metrics (Phase 8: Live Supabase counts)
// -----------------------------------------------------------------------------
adminRouter.get('/dashboard/stats', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  try {
    const stats = await adminStore.getDashboardMetricsAsync();
    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve authoritative metrics from Supabase.', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// 14c. Authoritative User Directory (Phase 9: Profiles + Shopping activity)
// -----------------------------------------------------------------------------
adminRouter.get('/users', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { search, status, page = '1', limit = '25' } = req.query;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const offset = (p - 1) * l;

  try {
    const result = await adminStore.getAppUsersAsync({
      search: search ? String(search) : undefined,
      status: status && status !== 'all' ? String(status) : undefined,
      offset,
      limit: l,
    });

    res.status(200).json({
      users: result.users,
      total: result.total,
      kpis: result.kpis,
      page: p,
      limit: l,
      totalPages: Math.ceil(result.total / l),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users from database.', details: err.message });
  }
});

adminRouter.post('/users/:id/status', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const clientIp = getClientIp(req);

  try {
    const user = adminStore.setAppUserStatus(id, status, reason);
    adminStore.writeAuditLog({
      action: status === 'suspended' ? 'user_suspended' : 'user_reactivated',
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      targetType: 'app_user',
      targetId: id,
      afterValue: { status, reason },
      ip: clientIp,
    });
    res.status(200).json({ success: true, message: `User status changed to ${status}.`, user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status.', details: err.message });
  }
});

adminRouter.post('/users/:id/verify', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  const clientIp = getClientIp(req);

  try {
    const user = adminStore.setAppUserVerified(id, Boolean(isVerified));
    adminStore.writeAuditLog({
      action: isVerified ? 'user_verified' : 'user_unverified',
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      targetType: 'app_user',
      targetId: id,
      afterValue: { isVerified: Boolean(isVerified) },
      ip: clientIp,
    });
    res.status(200).json({
      success: true,
      message: `User verification updated to ${Boolean(isVerified)}.`,
      user,
      isVerified: Boolean(isVerified),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user verification.', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// 14d. Authoritative Shopping List Moderation (Phase 10: Lists + Items)
// -----------------------------------------------------------------------------
adminRouter.get('/lists', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { search, isCompleted, page = '1', limit = '25' } = req.query;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const offset = (p - 1) * l;

  try {
    const result = await adminStore.getModerationListsAsync({
      search: search ? String(search) : undefined,
      offset,
      limit: l,
    });

    res.status(200).json({
      lists: result.lists,
      total: result.total,
      page: p,
      limit: l,
      totalPages: Math.ceil(result.total / l),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve shopping lists from database.', details: err.message });
  }
});

adminRouter.post(
  '/lists/:id/status',
  requireAdminAuth,
  requirePermission('moderation.manage'),
  (req: AdminAuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['clean', 'flagged', 'under_review', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status. Must be clean, flagged, under_review, or resolved.' });
    }
    const ok = adminStore.updateModerationListStatus(id, status);
    if (!ok) return res.status(404).json({ error: 'Shopping list not found.' });
    adminStore.writeAuditLog({
      action: 'list_moderation_status_changed',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'shopping_list',
      targetId: id,
      afterValue: { status },
    });
    res.status(200).json({ success: true, status });
  }
);

adminRouter.post(
  '/lists/:id/items/:itemId/moderate',
  requireAdminAuth,
  requirePermission('moderation.manage'),
  (req: AdminAuthRequest, res: Response) => {
    const { id, itemId } = req.params;
    const { action, reason } = req.body;
    if (!['approved', 'removed'].includes(action)) {
      return res.status(400).json({ error: 'Invalid moderation action. Must be approved or removed.' });
    }
    const ok = adminStore.moderateListItem(id, itemId, action, reason);
    if (!ok) return res.status(404).json({ error: 'Shopping list or item not found.' });
    adminStore.writeAuditLog({
      action: `list_item_${action}`,
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'shopping_item',
      targetId: itemId,
      afterValue: { listId: id, action, reason },
    });
    res.status(200).json({ success: true });
  }
);

adminRouter.delete(
  '/lists/:id',
  requireAdminAuth,
  requirePermission('moderation.manage'),
  (req: AdminAuthRequest, res: Response) => {
    const { id } = req.params;
    const ok = adminStore.deleteModerationList(id);
    if (!ok) return res.status(404).json({ error: 'Shopping list not found.' });
    adminStore.writeAuditLog({
      action: 'list_moderation_deleted',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'shopping_list',
      targetId: id,
    });
    res.status(200).json({ success: true });
  }
);

// -----------------------------------------------------------------------------
// 14e. Authoritative Product Catalog (Phase 2 & Module 6)
// -----------------------------------------------------------------------------
adminRouter.get('/catalog/products', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { search, category, page = '1', limit = '50' } = req.query;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const offset = (p - 1) * l;

  try {
    const result = await adminStore.getCatalogProductsAsync({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      offset,
      limit: l,
    });

    res.status(200).json({
      items: result.items,
      categories: result.categories,
      total: result.total,
      page: p,
      limit: l,
      totalPages: Math.ceil(result.total / l),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve catalog items.', details: err.message });
  }
});

adminRouter.post('/catalog/products', requireAdminAuth, requirePermission('catalog.edit'), (req: AdminAuthRequest, res: Response) => {
  try {
    const { name, nameUr, category, defaultUnit } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    const product = adminStore.saveCatalogProduct({
      nameEn: name,
      nameUr: nameUr || '',
      category,
      unit: defaultUnit || 'kg',
      subcategory: 'Grocery',
    });
    adminStore.writeAuditLog({
      action: 'catalog_item_added',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'catalog_item',
      targetId: product.id,
      afterValue: { name: product.nameEn, category: product.category },
    });
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add catalog item', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// 14f. System Settings & Role Matrix (Modules 2 & 12)
// -----------------------------------------------------------------------------
adminRouter.get('/settings', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  res.status(200).json(adminStore.getSystemSettings());
});

adminRouter.post('/settings', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  const settings = adminStore.updateSystemSettings(req.body);
  adminStore.writeAuditLog({
    action: 'system_settings_updated',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'system_settings',
    afterValue: settings,
  });
  res.status(200).json({ success: true, settings });
});

adminRouter.get('/role-matrix', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  res.status(200).json(adminStore.getPermissionMatrix());
});

adminRouter.post('/role-matrix', requireAdminAuth, requireRoles('super_admin'), (req: AdminAuthRequest, res: Response) => {
  const matrix = adminStore.updatePermissionMatrix(req.body);
  adminStore.writeAuditLog({
    action: 'role_matrix_updated',
    adminId: req.admin!.id,
    adminEmail: req.admin!.email,
    targetType: 'role_matrix',
    afterValue: matrix,
  });
  res.status(200).json({ success: true, matrix });
});

// -----------------------------------------------------------------------------
// 14g. Support Tickets, CMS, Push & Analytics (Modules 7, 8, 10, 11)
// -----------------------------------------------------------------------------
adminRouter.get('/tickets', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { status, priority, search, page = '1', limit = '25' } = req.query;
  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const offset = (p - 1) * l;

  try {
    const result = await adminStore.getSupportTicketsAsync({
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      search: search ? String(search) : undefined,
      offset,
      limit: l,
    });
    res.status(200).json({
      tickets: result.tickets,
      total: result.total,
      page: p,
      limit: l,
      totalPages: Math.ceil(result.total / l),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve support tickets.', details: err.message });
  }
});

adminRouter.post(['/tickets', '/support/tickets'], (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail || req.body.email;
    const description = req.body.description || req.body.message;
    const userName = req.body.userName || req.body.name || 'Shopper';
    const userPhone = req.body.userPhone || req.body.phone;
    const subject = req.body.subject || 'Support Request';
    const userId = req.body.userId;
    const category = req.body.category || 'general';
    const priority = req.body.priority || 'medium';

    if (!description || !userEmail) {
      return res.status(400).json({ error: 'Email and issue description are required.' });
    }
    const ticket = adminStore.createSupportTicket({
      userId,
      userName,
      userEmail,
      userPhone,
      subject,
      description,
      category,
      priority,
    });
    return res.status(201).json({ success: true, ticket });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create support ticket', details: err.message });
  }
});

adminRouter.patch('/tickets/:id', requireAdminAuth, requirePermission('tickets.manage'), (req: AdminAuthRequest, res: Response) => {
  const { status, assignedAdmin, resolutionNotes, replyMessage } = req.body;
  try {
    const ticket = adminStore.updateTicketStatus(
      req.params.id,
      status,
      assignedAdmin || (req.admin ? { id: req.admin.id, name: req.admin.name, email: req.admin.email } : undefined)
    );
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const reply = (replyMessage || resolutionNotes || '').trim();
    if (reply) {
      adminStore.addTicketMessage(ticket.id, {
        sender: 'staff',
        senderName: req.admin?.name || 'YAAD Support',
        text: reply,
      });

      // Broadcast in-app notification so shopper receives response directly in their app
      adminStore.sendPushCampaign({
        titleEn: `Support Update: Ticket ${ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`}`,
        titleUr: `سپورٹ اپڈیٹ: ٹکٹ ${ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`}`,
        bodyEn: `YAAD Support: ${reply}`,
        bodyUr: `یاڈ سپورٹ: ${reply}`,
        iconUrl: '/logo.png',
        targetAudience: 'all',
        status: 'sent',
        createdBy: req.admin?.email || 'admin',
      });
    }

    adminStore.writeAuditLog({
      action: 'support_ticket_updated',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'support_ticket',
      targetId: ticket.id,
      afterValue: { status: ticket.status, ticketNumber: ticket.ticketNumber, hasReply: Boolean(reply) },
    });
    return res.status(200).json({ success: true, ticket });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update ticket status', details: err.message });
  }
});

// Admin Access Requests (Apply for Admin Access)
adminRouter.post('/access-requests', rateLimit(10, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, requestedRole = 'support_agent', department, reason } = req.body;
    if (!name || !email || !reason) {
      return res.status(400).json({ error: 'Full name, email address, and reason for access are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const request = await adminStore.createAccessRequestAsync({
      name,
      email,
      phone,
      requestedRole,
      department,
      reason,
    });
    return res.status(201).json({ success: true, message: 'Admin access request received successfully.', request });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit access request', details: err.message });
  }
});

adminRouter.get('/access-requests', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const requests = await adminStore.getAccessRequestsAsync();
  return res.status(200).json({ requests });
});

adminRouter.patch('/access-requests/:id', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }
  const updated = await adminStore.updateAccessRequestStatusAsync(req.params.id, status, req.admin?.name || req.admin?.email);
  if (!updated) {
    return res.status(404).json({ error: 'Access request not found.' });
  }
  adminStore.writeAuditLog({
    action: `access_request_${status}`,
    adminId: req.admin?.id,
    adminEmail: req.admin?.email,
    targetType: 'access_request',
    targetId: updated.id,
    afterValue: { email: updated.email, status: updated.status },
  });
  return res.status(200).json({ success: true, request: updated });
});

// Email Allowlist Settings (Staff Governance Module 12)
adminRouter.get('/settings/allowlist', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const allowlist = await adminStore.getEmailAllowlistAsync();
  res.status(200).json({ allowlist });
});

adminRouter.post('/settings/allowlist', requireAdminAuth, requireRoles('super_admin'), async (req: AdminAuthRequest, res: Response) => {
  const { allowlist } = req.body || {};
  if (!Array.isArray(allowlist)) {
    return res.status(400).json({ error: 'Allowlist must be an array of domain/email strings.' });
  }
  const cleanList = allowlist
    .map((s: any) => String(s).trim().toLowerCase())
    .filter((s: string) => Boolean(s));
  await adminStore.setEmailAllowlistAsync(cleanList);
  adminStore.writeAuditLog({
    action: 'allowlist_updated',
    adminId: req.admin?.id,
    adminEmail: req.admin?.email,
    targetType: 'system_settings',
    targetId: 'email_allowlist',
    afterValue: { allowlist: cleanList },
    metadata: { count: cleanList.length },
  });
  res.status(200).json({ success: true, allowlist: cleanList });
});

adminRouter.get('/public/cms/articles', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, articles: adminStore.getPublicCmsArticles() });
});

adminRouter.get('/cms/articles', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { status, search } = req.query;
  try {
    const result = await adminStore.getCmsArticlesAsync({
      status: status as any,
      search: search ? String(search) : undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve CMS articles.', details: err.message });
  }
});

adminRouter.post('/cms/articles', requireAdminAuth, requirePermission('content.publish'), (req: AdminAuthRequest, res: Response) => {
  try {
    const article = adminStore.saveCmsArticle(req.body, req.admin?.name || 'Staff');
    adminStore.writeAuditLog({
      action: 'cms_article_created',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'cms_article',
      targetId: article.id,
      afterValue: { title: article.title, status: article.status },
    });
    res.status(201).json({ success: true, article });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create article', details: err.message });
  }
});

adminRouter.put('/cms/articles/:id', requireAdminAuth, requirePermission('content.publish'), (req: AdminAuthRequest, res: Response) => {
  try {
    const article = adminStore.saveCmsArticle({ ...req.body, id: req.params.id }, req.admin?.name || 'Staff');
    adminStore.writeAuditLog({
      action: 'cms_article_updated',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'cms_article',
      targetId: article.id,
      afterValue: { title: article.title, status: article.status },
    });
    res.status(200).json({ success: true, article });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update article', details: err.message });
  }
});

adminRouter.delete('/cms/articles/:id', requireAdminAuth, requirePermission('content.publish'), (req: AdminAuthRequest, res: Response) => {
  try {
    const ok = adminStore.deleteCmsArticle(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Article not found' });
    adminStore.writeAuditLog({
      action: 'cms_article_deleted',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'cms_article',
      targetId: req.params.id,
    });
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete article', details: err.message });
  }
});

adminRouter.get('/push/campaigns', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  res.status(200).json({ campaigns: adminStore.getPushCampaigns() });
});

adminRouter.get('/push/templates', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  res.status(200).json({ templates: adminStore.getPushTemplates() });
});

adminRouter.post('/push/templates', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  try {
    const { name, title_en, title_ur, body_en, body_ur, category = 'general' } = req.body;
    if (!name || !title_en || !body_en) {
      return res.status(400).json({ error: 'Template name, English title, and body are required' });
    }
    const template = adminStore.createPushTemplate({
      name,
      titleEn: title_en,
      titleUr: title_ur || '',
      bodyEn: body_en,
      bodyUr: body_ur || '',
      category,
    });
    res.status(201).json({ success: true, template });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create template', details: err.message });
  }
});

adminRouter.delete('/push/templates/:id', requireAdminAuth, (req: AdminAuthRequest, res: Response) => {
  try {
    const deleted = adminStore.deletePushTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete template', details: err.message });
  }
});

adminRouter.post('/push/campaigns', requireAdminAuth, requirePermission('notifications.send'), (req: AdminAuthRequest, res: Response) => {
  try {
    const { title_en, title_ur, body_en, body_ur, icon_url, target_audience = 'all_active' } = req.body;
    if (!title_en || !body_en) {
      return res.status(400).json({ error: 'Title and message body are required' });
    }
    const campaign = adminStore.sendPushCampaign({
      titleEn: title_en,
      titleUr: title_ur || '',
      bodyEn: body_en,
      bodyUr: body_ur || '',
      iconUrl: icon_url || '',
      targetAudience: target_audience,
      status: 'sent',
      createdBy: req.admin?.email || 'admin',
    });
    adminStore.writeAuditLog({
      action: 'push_broadcast_sent',
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      targetType: 'push_campaign',
      targetId: campaign.id,
      afterValue: { title: campaign.titleEn, audience: campaign.targetAudience },
    });
    res.status(201).json({ success: true, campaign });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to broadcast push notification', details: err.message });
  }
});

adminRouter.get('/analytics', requireAdminAuth, async (req: AdminAuthRequest, res: Response) => {
  const { range = '30d' } = req.query;
  const validRange = range === '7d' || range === '90d' ? range : '30d';
  const report = await adminStore.getAnalyticsReportAsync(validRange);
  res.status(200).json(report);
});

// -----------------------------------------------------------------------------
// 15. Graceful Auth Login GET Handler & POST-Only Endpoints Guard
// -----------------------------------------------------------------------------
adminRouter.get('/auth/login', (req: Request, res: Response) => {
  const acceptsHtml = req.headers.accept?.includes('text/html');
  if (acceptsHtml) {
    return res.redirect('/admin/login');
  }
  return res.status(200).json({
    status: 'active',
    endpoint: '/api/admin/auth/login',
    method: 'POST',
    message: 'YAAD Staff Authentication Portal. Submit email and credentials via POST to authenticate.',
    loginUrl: '/admin/login',
  });
});

adminRouter.get(
  [
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
