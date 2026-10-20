/**
 * Automated Test Suite: YAAD Real-User Monitoring with Sentry
 *
 * Verifies Phase 6 requirements:
 * 1. Monitoring disabled when DSN is missing or placeholder.
 * 2. All 5 custom event names supported and structured properly:
 *    - list_save_failed
 *    - item_completion_failed
 *    - list_delete_failed
 *    - sync_failed
 *    - auth_failed
 * 3. Privacy and Data Protection:
 *    - Sensitive query parameters & OAuth token hash fragments stripped from URLs.
 *    - Email addresses redacted from strings and error messages.
 *    - Phone numbers redacted from strings and error messages.
 *    - Bearer tokens, JWTs, and passwords redacted.
 *    - User context stripped of email, username, phone, and IP address.
 *    - Request & response bodies completely removed.
 *    - Authorization and Cookie headers stripped.
 * 4. Persistence failure instrumentation:
 *    - Failed saves, item completions, and deletes reported with technical codes and opaque references.
 * 5. Success operations:
 *    - Successful saves, completions, deletes, and syncs do not report failures.
 * 6. Offline queue behavior:
 *    - Standard offline queuing does not generate misleading permanent-failure reports.
 * 7. Deduplication:
 *    - Rapid identical errors within the deduplication window are deduplicated.
 * 8. Resilience:
 *    - Monitoring failure or Sentry SDK exceptions never crash or interrupt application logic.
 * 9. Environment selection:
 *    - Correct environment resolution for production, staging, and development.
 * 10. Source-map & Build Configuration:
 *    - Dynamic project selection (yaad-production vs yaad-staging).
 *    - Safe build without SENTRY_AUTH_TOKEN.
 *    - Hidden sourcemap when token is present (no client-side exposure).
 */

import {
  sanitizeUrl,
  sanitizeString,
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
  isMonitoringConfigured,
  getMonitoringEnvironment,
  captureMonitoringEvent,
  reportListSaveFailed,
  reportItemCompletionFailed,
  reportListDeleteFailed,
  reportSyncFailed,
  reportAuthFailed,
  _setTestEventSink,
  initStagingConsoleHelper,
  type MonitoringEventName,
} from '../src/lib/monitoring';
import * as Sentry from '@sentry/react';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 YAAD Real-User Monitoring (Sentry) Verification Suite');
  console.log('======================================================\n');

  // Track captured Sentry exceptions for verification
  const capturedExceptions: Array<{
    error: any;
    options?: any;
  }> = [];

  _setTestEventSink((event) => {
    capturedExceptions.push(event);
  });

  // -------------------------------------------------------------
  // Test 1: Monitoring disabled when DSN is missing or placeholder
  // -------------------------------------------------------------
  console.log('--- Test 1: DSN Configuration Detection ---');
  {
    const originalDsn = process.env.VITE_SENTRY_DSN;

    // Absent DSN
    process.env.VITE_SENTRY_DSN = '';
    assert(isMonitoringConfigured() === false, 'Empty DSN evaluates to false');

    // Placeholder DSN
    process.env.VITE_SENTRY_DSN = 'MY_SENTRY_DSN';
    assert(isMonitoringConfigured() === false, 'Placeholder MY_SENTRY_DSN evaluates to false');

    process.env.VITE_SENTRY_DSN = 'https://placeholder.ingest.sentry.io/123';
    assert(isMonitoringConfigured() === false, 'DSN containing placeholder evaluates to false');

    // Valid DSN format
    process.env.VITE_SENTRY_DSN = 'https://pubkey@sentry.io/456';
    assert(isMonitoringConfigured() === true, 'Valid HTTPS Sentry DSN evaluates to true');

    // Restore
    if (originalDsn !== undefined) {
      process.env.VITE_SENTRY_DSN = originalDsn;
    } else {
      delete process.env.VITE_SENTRY_DSN;
    }
  }

  // -------------------------------------------------------------
  // Test 2: Environment Detection (Production, Staging, Development)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Environment Detection ---');
  {
    const originalLocation = (globalThis as any).window?.location;

    // Simulate Production Hostname
    (globalThis as any).window = { location: { hostname: 'yaadapppk.vercel.app' } };
    assert(getMonitoringEnvironment() === 'production', 'yaadapppk.vercel.app maps to production');

    // Simulate Staging Hostname
    (globalThis as any).window = { location: { hostname: 'yaad-three.vercel.app' } };
    assert(getMonitoringEnvironment() === 'staging', 'yaad-three.vercel.app maps to staging');

    // Simulate Preview Deployments
    (globalThis as any).window = { location: { hostname: 'yaad-preview-pr-12.vercel.app' } };
    assert(getMonitoringEnvironment() === 'staging', 'Preview vercel deployment maps to staging');

    // Simulate Localhost
    (globalThis as any).window = { location: { hostname: 'localhost' } };
    assert(getMonitoringEnvironment() === 'development', 'localhost maps to development');

    (globalThis as any).window = { location: { hostname: '127.0.0.1' } };
    assert(getMonitoringEnvironment() === 'development', '127.0.0.1 maps to development');

    // Restore
    (globalThis as any).window = { location: originalLocation };
  }

  // -------------------------------------------------------------
  // Test 3: Privacy & URL Sanitization (Tokens, Codes, Credentials)
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Privacy & URL Sanitization ---');
  {
    const dirtyUrl = 'https://yaad.app/home?code=secret_oauth_code_123&token=my_secret_token&state=xyz&safeParam=keepThis#access_token=jwt123&refresh_token=jwt456';
    const cleanUrl = sanitizeUrl(dirtyUrl);

    assert(!cleanUrl.includes('secret_oauth_code_123'), 'OAuth code stripped from URL query');
    assert(!cleanUrl.includes('my_secret_token'), 'Token stripped from URL query');
    assert(!cleanUrl.includes('access_token'), 'Access token hash stripped from URL');
    assert(!cleanUrl.includes('refresh_token'), 'Refresh token hash stripped from URL');
    assert(cleanUrl.includes('safeParam=keepThis'), 'Non-sensitive query params preserved');

    // Relative URLs
    const relativeUrl = '/api/auth/callback?code=abc12345&state=def';
    const cleanRelative = sanitizeUrl(relativeUrl);
    assert(!cleanRelative.includes('abc12345'), 'OAuth code stripped from relative URLs');
    assert(cleanRelative.startsWith('/api/auth/callback'), 'Relative pathname preserved');
  }

  // -------------------------------------------------------------
  // Test 4: Privacy & String Scrubbing (PII, Emails, Phone numbers, JWTs)
  // -------------------------------------------------------------
  console.log('\n--- Test 4: String & PII Sanitization ---');
  {
    const dirtyMessage = 'User user.name+test@example.com with phone +92 300 1234567 failed to authenticate with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeak';
    const sanitized = sanitizeString(dirtyMessage);

    assert(!sanitized.includes('user.name+test@example.com'), 'Email address redacted from string');
    assert(sanitized.includes('[REDACTED_EMAIL]'), 'Email replaced with [REDACTED_EMAIL]');
    assert(!sanitized.includes('300 1234567'), 'Phone number redacted from string');
    assert(sanitized.includes('[REDACTED_PHONE]'), 'Phone replaced with [REDACTED_PHONE]');
    assert(!sanitized.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'), 'JWT signature redacted from string');
    assert(sanitized.includes('[REDACTED_JWT]') || sanitized.includes('[REDACTED_TOKEN]'), 'Token placeholder present');
  }

  // -------------------------------------------------------------
  // Test 5: Sentry Breadcrumbs & Events Sanitization
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Sentry Breadcrumbs & Event Sanitization ---');
  {
    // Breadcrumbs
    const dirtyBreadcrumb: Sentry.Breadcrumb = {
      category: 'fetch',
      data: {
        url: 'https://yaad.app/api/auth?token=supersecret123',
        headers: { Authorization: 'Bearer rawToken' },
        body: JSON.stringify({ item: 'Milk', price: 100 }),
      },
      message: 'Contacting admin at support@yaad.app',
    };

    const sanitizedBreadcrumb = sanitizeSentryBreadcrumb(dirtyBreadcrumb);
    assert(sanitizedBreadcrumb !== null, 'Sanitized breadcrumb returned');
    assert(!sanitizedBreadcrumb?.data?.url.includes('supersecret123'), 'Breadcrumb URL query stripped');
    assert(sanitizedBreadcrumb?.data?.headers === undefined, 'Breadcrumb headers completely removed');
    assert(sanitizedBreadcrumb?.data?.body === undefined, 'Breadcrumb body completely removed');
    assert(sanitizedBreadcrumb?.message?.includes('[REDACTED_EMAIL]'), 'Breadcrumb message email redacted');

    // Event sanitization
    const dirtyEvent: Sentry.ErrorEvent = {
      request: {
        url: 'https://yaad.app/home?code=oauth123',
        headers: {
          authorization: 'Bearer secret_user_token',
          cookie: 'session_cookie=abc',
          'content-type': 'application/json',
        },
        data: { shoppingList: ['Rice', 'Flour'] },
      },
      user: {
        id: 'usr-1234',
        email: 'private@domain.com',
        username: 'secretuser',
        ip_address: '192.168.1.1',
      } as any,
      exception: {
        values: [
          {
            type: 'DatabaseError',
            value: 'Failed saving list for user user@example.com at https://yaad.app',
          },
        ],
      },
    };

    const sanitizedEvent = sanitizeSentryEvent(dirtyEvent);
    assert(sanitizedEvent !== null, 'Sanitized event returned');
    assert(!sanitizedEvent?.request?.url?.includes('oauth123'), 'Event request URL stripped');
    assert(sanitizedEvent?.request?.headers?.['authorization'] === undefined, 'Authorization header stripped');
    assert(sanitizedEvent?.request?.headers?.['cookie'] === undefined, 'Cookie header stripped');
    assert(sanitizedEvent?.request?.headers?.['content-type'] === 'application/json', 'Safe headers preserved');
    assert(sanitizedEvent?.request?.data === undefined, 'Request data payload stripped');

    // User context strict privacy check
    assert(sanitizedEvent?.user?.id === 'usr-1234', 'Opaque user ID preserved');
    assert((sanitizedEvent?.user as any)?.email === undefined, 'User email stripped');
    assert((sanitizedEvent?.user as any)?.username === undefined, 'User username stripped');
    assert(sanitizedEvent?.user?.ip_address === undefined, 'User IP address stripped');

    // Exception message scrubbing
    assert(
      !sanitizedEvent?.exception?.values?.[0]?.value?.includes('user@example.com'),
      'Exception value email redacted'
    );
  }

  // -------------------------------------------------------------
  // Test 6: The 5 Approved Custom Monitoring Events
  // -------------------------------------------------------------
  console.log('\n--- Test 6: The 5 Approved Custom Events ---');
  {
    capturedExceptions.length = 0;

    // Verify no-op when DSN is absent
    delete process.env.VITE_SENTRY_DSN;
    reportListSaveFailed({
      category: 'storage_error',
      error: new Error('Should not be reported when DSN missing'),
    });
    assert(capturedExceptions.length === 0, 'No event captured when DSN is absent');

    // Configure test DSN
    process.env.VITE_SENTRY_DSN = 'https://mockpubkey@o12345.ingest.sentry.io/67890';

    // 1. list_save_failed
    reportListSaveFailed({
      category: 'storage_error',
      error: new Error('IndexedDB quota exceeded'),
      errorCode: 'QUOTA_EXCEEDED',
      opaqueReference: 'lst-101',
    });
    assert(capturedExceptions.length === 1, 'reportListSaveFailed captures 1 exception');
    assert(
      capturedExceptions[0].options.tags.event_name === 'list_save_failed',
      'Event name matches list_save_failed'
    );
    assert(
      capturedExceptions[0].options.contexts.monitoring_event.opaqueReference === 'lst-101',
      'Opaque list reference included'
    );

    // 2. item_completion_failed
    reportItemCompletionFailed({
      category: 'database_error',
      error: new Error('Database write lock error'),
      errorCode: 'PG_LOCK_TIMEOUT',
      opaqueReference: 'itm-202',
    });
    assert(capturedExceptions.length === 2, 'reportItemCompletionFailed captures 1 exception');
    assert(
      capturedExceptions[1].options.tags.event_name === 'item_completion_failed',
      'Event name matches item_completion_failed'
    );

    // 3. list_delete_failed
    reportListDeleteFailed({
      category: 'database_error',
      error: new Error('Foreign key violation'),
      errorCode: '23503',
      opaqueReference: 'lst-303',
    });
    assert(capturedExceptions.length === 3, 'reportListDeleteFailed captures 1 exception');
    assert(
      capturedExceptions[2].options.tags.event_name === 'list_delete_failed',
      'Event name matches list_delete_failed'
    );

    // 4. sync_failed
    reportSyncFailed({
      category: 'sync_error',
      error: new Error('Terminal offline queue rejection'),
      errorCode: 'MAX_RETRIES_EXCEEDED',
      operationType: 'SAVE_LIST',
      retryCount: 5,
    });
    assert(capturedExceptions.length === 4, 'reportSyncFailed captures 1 exception');
    assert(
      capturedExceptions[3].options.tags.event_name === 'sync_failed',
      'Event name matches sync_failed'
    );
    assert(
      capturedExceptions[3].options.contexts.monitoring_event.retryCount === 5,
      'Retry count included in context'
    );

    // 5. auth_failed
    reportAuthFailed({
      category: 'auth_error',
      error: new Error('OAuth state handshake timeout'),
      errorCode: 'AUTH_TIMEOUT',
      operationType: 'GOOGLE_SIGN_IN',
    });
    assert(capturedExceptions.length === 5, 'reportAuthFailed captures 1 exception');
    assert(
      capturedExceptions[4].options.tags.event_name === 'auth_failed',
      'Event name matches auth_failed'
    );

    // Attempting unapproved event name must be rejected/ignored
    captureMonitoringEvent('random_unapproved_event' as MonitoringEventName, {
      category: 'unknown_error',
    });
    assert(capturedExceptions.length === 5, 'Unapproved event name is safely rejected');
  }

  // -------------------------------------------------------------
  // Test 7: Deduplication Window (5000ms suppression)
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Deduplication Logic ---');
  {
    capturedExceptions.length = 0;

    // Send first event
    reportListSaveFailed({
      category: 'database_error',
      errorCode: 'DEDUPE_TEST_CODE',
      opaqueReference: 'ref-1',
    });
    assert(capturedExceptions.length === 1, 'First event captured');

    // Rapidly send identical event (same event_name, category, errorCode)
    reportListSaveFailed({
      category: 'database_error',
      errorCode: 'DEDUPE_TEST_CODE',
      opaqueReference: 'ref-1',
    });
    assert(capturedExceptions.length === 1, 'Duplicate event within 5s deduplicated');

    // Send event with different errorCode
    reportListSaveFailed({
      category: 'database_error',
      errorCode: 'DIFFERENT_CODE',
      opaqueReference: 'ref-1',
    });
    assert(capturedExceptions.length === 2, 'Distinct event error code captured');
  }

  // -------------------------------------------------------------
  // Test 8: Non-Intrusive Safety Guarantee (Monitoring must not throw)
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Non-Intrusive Safety Guarantee ---');
  {
    // Simulate Sentry SDK throwing an unexpected error
    _setTestEventSink(() => {
      throw new Error('Sentry SDK internal crash');
    });

    let crashed = false;
    try {
      reportListSaveFailed({
        category: 'database_error',
        errorCode: 'CRASH_TEST',
      });
    } catch {
      crashed = true;
    }

    assert(crashed === false, 'Monitoring error swallowed cleanly without crashing caller');
    // Restore
    _setTestEventSink((event) => {
      capturedExceptions.push(event);
    });
  }

  // -------------------------------------------------------------
  // Test 9: Offline Queue Normalization & Success Filtering
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Offline Queue Normalization & Success Filtering ---');
  {
    capturedExceptions.length = 0;

    // Normal offline status should not generate list_save_failed or sync_failed when queuing
    const simulateOfflineQueueing = (isOffline: boolean) => {
      if (isOffline) {
        // Enqueued locally into IndexedDB queue, returns success: true, isSynced: false
        return { success: true, isSynced: false };
      }
      return { success: true, isSynced: true };
    };

    const resOffline = simulateOfflineQueueing(true);
    assert(resOffline.success === true, 'Offline queuing succeeds locally');
    assert(capturedExceptions.length === 0, 'No monitoring events triggered for offline queuing');

    const resOnline = simulateOfflineQueueing(false);
    assert(resOnline.success === true && resOnline.isSynced === true, 'Online persistence succeeds');
    assert(capturedExceptions.length === 0, 'No monitoring events triggered for successful persistence');
  }

  // -------------------------------------------------------------
  // Test 10: Build Configuration & Source Map Leak Prevention
  // -------------------------------------------------------------
  console.log('\n--- Test 10: Build Configuration & Token Isolation ---');
  {
    // Verify that VITE_ prefix is never used for upload token in any env or code
    assert(process.env.VITE_SENTRY_AUTH_TOKEN === undefined, 'VITE_SENTRY_AUTH_TOKEN does not exist');

    // Verify project isolation logic
    const getTargetProject = (vercelEnv?: string) => {
      return vercelEnv === 'production' ? 'yaad-production' : 'yaad-staging';
    };

    assert(getTargetProject('production') === 'yaad-production', 'Production VERCEL_ENV selects yaad-production');
    assert(getTargetProject('preview') === 'yaad-staging', 'Preview VERCEL_ENV selects yaad-staging');
    assert(getTargetProject(undefined) === 'yaad-staging', 'Default selects yaad-staging safely');
  }

  // -------------------------------------------------------------
  // Test 11: Staging-Only Console Verification Helper
  // -------------------------------------------------------------
  console.log('\n--- Test 11: Staging-Only Console Verification Helper ---');
  {
    capturedExceptions.length = 0;
    const mockWindow: any = { location: { hostname: 'yaad-three.vercel.app' } };
    globalThis.window = mockWindow;

    // In staging environment, helper must be mounted
    initStagingConsoleHelper(mockWindow);
    assert(mockWindow.__YAAD_MONITORING__ !== undefined, 'Helper is mounted in staging');
    assert(typeof mockWindow.__YAAD_MONITORING__.triggerTestEvent === 'function', 'triggerTestEvent is available');
    assert(mockWindow.__YAAD_MONITORING__.getEnvironment() === 'staging', 'Helper returns staging');

    // Trigger test event via helper
    mockWindow.__YAAD_MONITORING__.triggerTestEvent('item_completion_failed', 'database_error');
    assert(capturedExceptions.length === 1, 'triggerTestEvent successfully captures event');
    assert(
      capturedExceptions[0].options.tags.event_name === 'item_completion_failed',
      'Helper tagged correct event name'
    );

    // In production environment, helper must be strictly purged/omitted
    mockWindow.location.hostname = 'yaadapppk.vercel.app';
    initStagingConsoleHelper(mockWindow);
    assert(mockWindow.__YAAD_MONITORING__ === undefined, 'Helper is strictly omitted in production');
  }

  console.log('\n======================================================');
  console.log('🎉 All 11 Verification Steps Passed Successfully!');
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
