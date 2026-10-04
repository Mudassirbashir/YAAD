import { Request, Response, NextFunction } from 'express';
import { adminStore, AdminRole, AdminUser, AdminSession } from './store';

// Extend Express Request to attach admin & session
export interface AdminAuthRequest extends Request {
  admin?: AdminUser;
  adminSession?: AdminSession;
}

/**
 * Extracts Bearer token from Authorization header or Cookie
 */
export function extractAdminToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Also check cookie header if present
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/yaad_admin_session=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Middleware: Enforces that the request comes from an authenticated admin staff member.
 * Checks token validity, account status, and 30-minute inactivity timeout.
 */
export function requireAdminAuth(req: AdminAuthRequest, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to the YAAD Admin Panel.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const { session, admin, error } = adminStore.validateSession(token);
  if (error || !session || !admin) {
    res.status(401).json({
      error: error || 'Your admin session is invalid or has expired.',
      code: 'SESSION_EXPIRED',
    });
    return;
  }

  req.admin = admin;
  req.adminSession = session;
  next();
}

/**
 * Middleware factory: Enforces specific role or roles
 */
export function requireRoles(...allowedRoles: AdminRole[]) {
  return (req: AdminAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHORIZED' });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        error: `Access Denied: Your role (${req.admin.role}) does not have permission to perform this action.`,
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * In-memory IP rate limiter for login and sensitive auth endpoints
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipLimits = new Map<string, RateLimitRecord>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipLimits.get(clientIp);

    if (!record || now > record.resetAt) {
      ipLimits.set(clientIp, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.status(429).json({
        error: `Too many requests from this IP. Please wait ${waitSeconds} seconds before trying again.`,
        code: 'RATE_LIMITED',
        retryAfter: waitSeconds,
      });
      return;
    }

    next();
  };
}
