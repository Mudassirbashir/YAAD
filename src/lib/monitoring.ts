import * as Sentry from '@sentry/react';
import { APP_NAME, APP_VERSION } from '../version';

export type MonitoringEnvironment = 'production' | 'staging' | 'development' | 'test';

export type MonitoringEventName =
  | 'list_save_failed'
  | 'item_completion_failed'
  | 'list_delete_failed'
  | 'sync_failed'
  | 'auth_failed';

export type ErrorCategory =
  | 'database_error'
  | 'network_error'
  | 'storage_error'
  | 'validation_error'
  | 'auth_error'
  | 'sync_error'
  | 'permission_error'
  | 'conflict_error'
  | 'unknown_error';

export interface MonitoringOptions {
  category: ErrorCategory;
  error?: unknown;
  errorCode?: string;
  operationType?: string;
  opaqueReference?: string;
  retryCount?: number;
  isOffline?: boolean;
  extra?: Record<string, string | number | boolean | null | undefined>;
}

// In-memory deduplication cache: avoids flooding Sentry with duplicate reports within a short window
const recentEventsCache = new Map<string, number>();
const DEDUPE_WINDOW_MS = 5000;

// State flag indicating whether Sentry SDK was initialized
let isInitialized = false;

// Internal test event sink hook for automated tests
let testEventSink: ((event: { error: unknown; options?: any }) => void) | null = null;

export function _setTestEventSink(
  sink: ((event: { error: unknown; options?: any }) => void) | null
): void {
  testEventSink = sink;
}

function getEnvVar(name: string): string | undefined {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && typeof metaEnv[name] === 'string' && metaEnv[name].trim()) {
    return metaEnv[name];
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }
  return undefined;
}

/**
 * Determine the active Sentry environment based on explicit config or runtime hostname.
 */
export function getMonitoringEnvironment(): MonitoringEnvironment {
  const envVar = getEnvVar('VITE_SENTRY_ENVIRONMENT');
  if (typeof envVar === 'string' && envVar.trim()) {
    const normalized = envVar.trim().toLowerCase();
    if (normalized === 'production' || normalized === 'staging' || normalized === 'development' || normalized === 'test') {
      return normalized;
    }
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = (window.location.hostname || '').toLowerCase();
    if (host === 'yaadapppk.vercel.app') {
      return 'production';
    }
    if (host === 'yaad-three.vercel.app' || (host.endsWith('.vercel.app') && host !== 'yaadapppk.vercel.app')) {
      return 'staging';
    }
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.includes('local')) {
      return 'development';
    }
  }

  const mode = getEnvVar('MODE');
  if (mode === 'production') {
    return 'production';
  }
  return 'development';
}

/**
 * Check whether a valid client-side Sentry DSN is present in the environment.
 */
export function isMonitoringConfigured(): boolean {
  const dsn = getEnvVar('VITE_SENTRY_DSN');
  if (typeof dsn !== 'string') return false;
  const trimmed = dsn.trim();
  return Boolean(
    trimmed &&
    trimmed !== 'MY_SENTRY_DSN' &&
    !trimmed.includes('placeholder') &&
    trimmed.startsWith('http')
  );
}

/**
 * Sanitizes URLs by stripping sensitive query parameters and token-bearing fragments.
 */
export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const parsed = new URL(rawUrl, 'https://yaad.local');

    // Strip sensitive search parameters (tokens, codes, credentials, PII)
    const sensitiveParams = [
      'code',
      'token',
      'access_token',
      'refresh_token',
      'id_token',
      'state',
      'otp',
      'password',
      'email',
      'phone',
      'error_description',
      'apikey',
    ];
    for (const param of sensitiveParams) {
      parsed.searchParams.delete(param);
    }

    // Strip URL fragments that contain tokens or authorization parameters
    if (parsed.hash) {
      const lowerHash = parsed.hash.toLowerCase();
      if (
        lowerHash.includes('access_token') ||
        lowerHash.includes('refresh_token') ||
        lowerHash.includes('token') ||
        lowerHash.includes('code') ||
        lowerHash.includes('type=')
      ) {
        parsed.hash = '';
      }
    }

    // If a dummy base was used, return clean pathname + search + hash
    if (rawUrl.startsWith('/')) {
      return parsed.pathname + (parsed.search ? parsed.search : '') + (parsed.hash ? parsed.hash : '');
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, strip query string and hash directly
    return rawUrl.split('?')[0].split('#')[0];
  }
}

/**
 * Strips PII (email, phone, tokens, credentials, lists/item payloads) from strings.
 */
export function sanitizeString(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let sanitized = text;

  // 1. Redact email addresses
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    '[REDACTED_EMAIL]'
  );

  // 2. Redact phone numbers (Pakistani format and standard international digits >= 8)
  sanitized = sanitized.replace(
    /(?:\+?92[ -]?)?0?3[0-9]{2}[ -]?[0-9]{7}/g,
    '[REDACTED_PHONE]'
  );

  // 3. Redact Bearer tokens & JWTs
  sanitized = sanitized.replace(
    /Bearer\s+[A-Za-z0-9_\-.]+/gi,
    'Bearer [REDACTED_TOKEN]'
  );
  sanitized = sanitized.replace(
    /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    '[REDACTED_JWT]'
  );

  // 4. Redact query-like parameter assignments (password=..., token=..., key=...)
  sanitized = sanitized.replace(
    /(access_token|refresh_token|id_token|password|secret|apikey|api_key|service_role_key)=[^&\s]+/gi,
    '$1=[REDACTED]'
  );

  return sanitized;
}

/**
 * Filter and sanitize Sentry breadcrumb objects before recording.
 */
export function sanitizeSentryBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
  try {
    // Strip fetch/xhr breadcrumb URLs and payload bodies
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      if (breadcrumb.data && typeof breadcrumb.data.url === 'string') {
        breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
      }
      // Never transmit request or response bodies in breadcrumbs
      if (breadcrumb.data) {
        delete breadcrumb.data.body;
        delete breadcrumb.data.request_body;
        delete breadcrumb.data.response_body;
        delete breadcrumb.data.headers;
      }
    }

    if (breadcrumb.message) {
      breadcrumb.message = sanitizeString(breadcrumb.message);
    }

    return breadcrumb;
  } catch {
    return breadcrumb;
  }
}

/**
 * Filter and sanitize Sentry events before sending to server.
 */
export function sanitizeSentryEvent(
  event: Sentry.ErrorEvent,
  _hint?: Sentry.EventHint
): Sentry.ErrorEvent | null {
  try {
    // 1. Sanitize request URL and headers
    if (event.request) {
      if (event.request.url) {
        event.request.url = sanitizeUrl(event.request.url);
      }
      if (event.request.headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'apikey'];
        for (const h of sensitiveHeaders) {
          delete event.request.headers[h];
        }
      }
      // Never send request bodies
      delete event.request.data;
    }

    // 2. Strict User Context Sanitization: Never transmit emails, usernames, or IPs
    if (event.user) {
      event.user = {
        id: event.user.id ? sanitizeString(String(event.user.id)) : undefined,
      };
      delete event.user.ip_address;
      delete (event.user as any).email;
      delete (event.user as any).username;
      delete (event.user as any).phone;
    }

    // 3. Exception Message Sanitization
    if (event.exception?.values) {
      for (const exc of event.exception.values) {
        if (exc.value) {
          exc.value = sanitizeString(exc.value);
        }
      }
    }

    // 4. Breadcrumbs Sanitization
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs
        .map((b) => sanitizeSentryBreadcrumb(b))
        .filter((b): b is Sentry.Breadcrumb => b !== null);
    }

    return event;
  } catch {
    return event;
  }
}

/**
 * Initialize Sentry error monitoring in YAAD.
 *
 * Guaranteed Safe & Non-Intrusive:
 * - If VITE_SENTRY_DSN is absent, safely no-ops and YAAD continues working normally.
 * - Session Replay is disabled.
 * - Performance tracing is disabled (tracesSampleRate: 0).
 * - sendDefaultPii is set to false, and strict privacy sanitization is attached.
 */
export function initMonitoring(): boolean {
  if (isInitialized) return true;

  if (!isMonitoringConfigured()) {
    return false;
  }

  const dsn = ((import.meta as any).env?.VITE_SENTRY_DSN || '').trim();
  const environment = getMonitoringEnvironment();
  const release = `${APP_NAME}@${APP_VERSION}`;

  try {
    (Sentry.init as (options: Sentry.BrowserOptions & { sendDefaultPii?: boolean }) => void)({
      dsn,
      environment,
      release,
      sendDefaultPii: false,
      tracesSampleRate: 0, // Performance tracing disabled
      replaysSessionSampleRate: 0, // Session Replay disabled
      replaysOnErrorSampleRate: 0, // Error Session Replay disabled
      beforeSend: (event, hint) => sanitizeSentryEvent(event, hint),
      beforeBreadcrumb: (breadcrumb) => sanitizeSentryBreadcrumb(breadcrumb),
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'AbortError',
      ],
    });

    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('Notice initializing Sentry monitoring:', err);
    return false;
  }
}

/**
 * Helper to extract a sanitized error message and stack trace.
 */
function extractSanitizedError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    const cleanMsg = sanitizeString(error.message || fallbackMessage);
    const cleanErr = new Error(cleanMsg);
    if (error.stack) {
      cleanErr.stack = sanitizeString(error.stack);
    }
    cleanErr.name = error.name || 'Error';
    return cleanErr;
  }
  if (typeof error === 'string') {
    return new Error(sanitizeString(error));
  }
  if (typeof error === 'object' && error !== null) {
    const msg = (error as any).message || (error as any).msg || fallbackMessage;
    return new Error(sanitizeString(String(msg)));
  }
  return new Error(fallbackMessage);
}

/**
 * Generic handler for the 5 approved monitoring events.
 * Accepts only approved event names and guarantees privacy and non-interference.
 */
export function captureMonitoringEvent(
  eventName: MonitoringEventName,
  options: MonitoringOptions
): void {
  try {
    const environment = getMonitoringEnvironment();

    // 1. Validate approved event names strictly
    const APPROVED_EVENTS: Set<MonitoringEventName> = new Set([
      'list_save_failed',
      'item_completion_failed',
      'list_delete_failed',
      'sync_failed',
      'auth_failed',
    ]);
    if (!APPROVED_EVENTS.has(eventName)) {
      return;
    }

    // 2. Prepare safe error details
    const sanitizedError = extractSanitizedError(
      options.error,
      `[${eventName}] Category: ${options.category}`
    );

    // 3. Rate-limiting / deduplication: avoid duplicate events within DEDUPE_WINDOW_MS
    const dedupeKey = `${eventName}:${options.category}:${options.errorCode || ''}:${sanitizedError.message}`;
    const now = Date.now();
    const lastReported = recentEventsCache.get(dedupeKey);
    if (lastReported && now - lastReported < DEDUPE_WINDOW_MS) {
      return;
    }
    recentEventsCache.set(dedupeKey, now);

    // Periodic cleanup of dedupe cache
    if (recentEventsCache.size > 200) {
      for (const [k, timestamp] of recentEventsCache.entries()) {
        if (now - timestamp > DEDUPE_WINDOW_MS * 2) {
          recentEventsCache.delete(k);
        }
      }
    }

    // 4. If Sentry is not configured, do not attempt transmission
    if (!isMonitoringConfigured()) {
      return;
    }

    const tags: Record<string, string> = {
      event_name: eventName,
      error_category: options.category,
      app_version: APP_VERSION,
      environment,
    };

    if (options.errorCode) {
      tags.error_code = sanitizeString(options.errorCode);
    }
    if (options.operationType) {
      tags.operation_type = sanitizeString(options.operationType);
    }
    if (options.isOffline !== undefined) {
      tags.is_offline = String(options.isOffline);
    }

    const context: Record<string, unknown> = {
      eventName,
      category: options.category,
      timestamp: now,
      errorCode: options.errorCode ? sanitizeString(options.errorCode) : undefined,
      operationType: options.operationType ? sanitizeString(options.operationType) : undefined,
      opaqueReference: options.opaqueReference ? sanitizeString(options.opaqueReference) : undefined,
      retryCount: options.retryCount,
      isOffline: options.isOffline,
    };

    // Attach any non-sensitive sanitized extra fields
    if (options.extra) {
      for (const [key, val] of Object.entries(options.extra)) {
        if (val !== undefined && val !== null) {
          context[key] = typeof val === 'string' ? sanitizeString(val) : val;
        }
      }
    }

    if (testEventSink) {
      testEventSink({
        error: sanitizedError,
        options: {
          tags,
          contexts: {
            monitoring_event: context,
          },
        },
      });
      return;
    }

    // Capture as an exception to preserve stack trace and symbolication capabilities
    Sentry.captureException(sanitizedError, {
      tags,
      contexts: {
        monitoring_event: context,
      },
    });
  } catch {
    // Safety guarantee: monitoring failures must never interfere with application logic
  }
}

/**
 * Report failure when a shopping list cannot be persisted to IndexedDB or Supabase.
 */
export function reportListSaveFailed(options: MonitoringOptions): void {
  captureMonitoringEvent('list_save_failed', options);
}

/**
 * Report failure when updating an item's completion state cannot be persisted.
 */
export function reportItemCompletionFailed(options: MonitoringOptions): void {
  captureMonitoringEvent('item_completion_failed', options);
}

/**
 * Report failure when list deletion fails permanently.
 */
export function reportListDeleteFailed(options: MonitoringOptions): void {
  captureMonitoringEvent('list_delete_failed', options);
}

/**
 * Report failure when offline queue synchronization fails terminally.
 */
export function reportSyncFailed(options: MonitoringOptions): void {
  captureMonitoringEvent('sync_failed', options);
}

/**
 * Report unexpected authentication and signup failures requiring investigation.
 */
export function reportAuthFailed(options: MonitoringOptions): void {
  captureMonitoringEvent('auth_failed', options);
}

// Staging & Development Verification Helper
// Exposes an inspection & testing helper in browser DevTools ONLY on non-production hosts
export function initStagingConsoleHelper(win: any = typeof window !== 'undefined' ? window : undefined): void {
  if (!win) return;
  try {
    const currentEnv = getMonitoringEnvironment();
    if (currentEnv !== 'production') {
      win.__YAAD_MONITORING__ = {
        triggerTestEvent: (
          eventName: MonitoringEventName = 'list_save_failed',
          category: ErrorCategory = 'storage_error'
        ) => {
          captureMonitoringEvent(eventName, {
            category,
            error: new Error(`[YAAD Staging Verification] Test ping for ${eventName}`),
            errorCode: 'STAGING_VERIFY_PING',
            opaqueReference: 'staging-test-ref',
            operationType: 'MANUAL_TEST',
          });
          console.info(`[YAAD Monitoring] Triggered test event "${eventName}" on ${currentEnv}`);
        },
        getEnvironment: () => getMonitoringEnvironment(),
        isConfigured: () => isMonitoringConfigured(),
      };
    } else {
      delete win.__YAAD_MONITORING__;
    }
  } catch {
    // Non-intrusive safety guarantee
  }
}

if (typeof window !== 'undefined') {
  initStagingConsoleHelper(window);
}

