# YAAD Google OAuth Production Domain Fix & Migration Report
**Authoritative Production Domain:** `https://yaadapppk.vercel.app`  
**Authenticated Destination:** `https://yaadapppk.vercel.app/home`  
**Status:** CODEBASE COMPLETE & FULLY TESTED (15/15 TEST SUITES PASSING)

---

## 1. Root Cause Analysis

### Why Google OAuth Was Returning to the Vercel Deployment URL
When clicking **"Continue with Google"**, users were returned to:
`https://yaadapppk-mudassirbashir530-creators-projects.vercel.app/home` instead of `https://yaadapppk.vercel.app/home`.

The audit identified three interconnected root causes:
1. **Dynamic Origin Leaks in Client Code:** Previously, `getAuthRedirectUrl()` fell back to `window.location.origin` if present. When a user initially accessed the site via a Vercel preview or deployment link, that deployment URL was transmitted to Supabase's `signInWithOAuth({ options: { redirectTo } })`.
2. **Supabase Dashboard Site URL Configuration:** In native Supabase Auth, when an OAuth provider finishes authenticating in Google Cloud, Supabase verifies the `redirectTo` against allowed Redirect URLs. If no explicit `redirectTo` is provided, or if the `redirectTo` is not in Supabase's whitelist, Supabase automatically falls back to the **Site URL** configured in the Supabase Dashboard. In this project, the Supabase Dashboard was configured with the initial Vercel deployment URL (`https://yaadapppk-mudassirbashir530-creators-projects.vercel.app`).
3. **Inconsistent Domain Constants in Source Code:** `src/config/siteConfig.ts` had `defaultProductionUrl` set to `yaad-three.vercel.app`, and `src/lib/passkey.ts` had inverted RP IDs.

---

## 2. Code Changes Implemented

### 2.1 Single Production Source of Truth (`src/config/siteConfig.ts`)
- Defined `PRODUCTION_APP_URL = 'https://yaadapppk.vercel.app'` as the definitive source of truth.
- Created `LEGACY_OR_DEPLOYMENT_HOSTS` containing:
  - `yaadapppk-mudassirbashir530-creators-projects.vercel.app`
  - `yaad-mudassirbashir530-creators-projects.vercel.app`
  - `yaad-three.vercel.app`
- Updated `getAuthRedirectUrl(path = '/home')`:
  - **Local Development:** Preserves `http://localhost:3000` / container origin.
  - **Dedicated Vercel Git Branch Previews:** Preserves `-git-` preview URLs for PRs.
  - **Production & Deployment URLs:** **Strictly forces** `https://yaadapppk.vercel.app/home`. Even if the page was opened on a deployment URL, it will **never** supply a deployment URL as the OAuth redirect target.

### 2.2 Direct Post-Auth Navigation (`src/context/AuthContext.tsx`)
- Updated `signInWithGoogle` to supply `redirectTo: getAuthRedirectUrl('/home')`, ensuring the OAuth provider and Supabase callback point directly to `https://yaadapppk.vercel.app/home`.

### 2.3 Instant Client-Side Domain Drift Migration (`index.html` & `src/App.tsx`)
- Added an immediate synchronous migration script in `<head>` of `index.html` and in `useEffect` in `src/App.tsx`.
- If a user lands on `https://yaadapppk-mudassirbashir530-creators-projects.vercel.app` (for example, via an old bookmark or if Supabase redirects there), the client **instantly** replaces the location with `https://yaadapppk.vercel.app`, preserving the entire `pathname`, `searchParams`, and hash fragment (`#access_token=...`) so the session is established on the correct production domain with zero user friction.

### 2.4 Server-Side 301 Permanent Redirects (`server.ts`)
- Added middleware at the top of the Express pipeline:
  Any request arriving on `yaadapppk-mudassirbashir530-creators-projects.vercel.app`, `yaad-mudassirbashir530-creators-projects.vercel.app`, or `yaad-three.vercel.app` is issued an HTTP 301 Permanent Redirect to `https://yaadapppk.vercel.app`.

### 2.5 Sensitive Token Scrubbing (`src/lib/supabase.ts`)
- `cleanAuthUrlParams()` sanitizes the address bar upon receiving Supabase OAuth tokens, removing `#access_token=...`, `#refresh_token=...`, `code`, and `state` parameters without page reloads, eliminating sensitive token exposure in the address bar.

### 2.6 WebAuthn / Passkey RP ID Alignment (`src/lib/passkey.ts` & `server.ts`)
- Configured `PRODUCTION_PASSKEY_RP_ID = 'yaadapppk.vercel.app'`.
- Placed legacy domains in `LEGACY_PASSKEY_RP_IDS`.

---

## 3. MANUAL SUPABASE DASHBOARD ACTION REQUIRED

To ensure Supabase Auth permits and uses the production domain, please apply the following settings in your Supabase project dashboard:

### Setting 1: Supabase Site URL
- **Location:** Supabase Dashboard → **Authentication** → **URL Configuration**
- **Setting:** **Site URL**
- **Action:** Replace the deployment URL with:
  ```text
  https://yaadapppk.vercel.app
  ```

### Setting 2: Supabase Redirect URLs
- **Location:** Supabase Dashboard → **Authentication** → **URL Configuration**
- **Setting:** **Redirect URLs**
- **Action:** Ensure the following exact URLs are present:
  ```text
  https://yaadapppk.vercel.app/**
  https://yaadapppk.vercel.app/home
  https://yaadapppk.vercel.app/auth
  https://yaadapppk.vercel.app/reset-password
  http://localhost:3000/**
  ```
  *(Remove or leave as secondary: `https://yaadapppk-mudassirbashir530-creators-projects.vercel.app/**`)*

---

## 4. GOOGLE CLOUD CONSOLE ACTION REQUIRED

For Google OAuth to function seamlessly with the canonical domain:

### Setting 1: Authorized JavaScript Origins
- **Location:** Google Cloud Console → **APIs & Services** → **Credentials** → Your Web Client ID
- **Setting:** **Authorized JavaScript origins**
- **Action:** Ensure the production domain is added:
  ```text
  https://yaadapppk.vercel.app
  ```

### Setting 2: Authorized Redirect URIs
- **Location:** Google Cloud Console → **APIs & Services** → **Credentials** → Your Web Client ID
- **Setting:** **Authorized redirect URIs**
- **Action:** This must point to your **Supabase Auth Callback URL** (Google authenticates against Supabase, and Supabase then redirects to YAAD):
  ```text
  https://<your-supabase-project-id>.supabase.co/auth/v1/callback
  ```
  *(Do NOT change this to `/home` — Google must redirect to Supabase's callback handler).*

---

## 5. Automated Verification Results

All 15 test suites passed:
1. `tests/recognition.test.ts` — Voice & Text item parser (PASS)
2. `tests/rls-logic.test.ts` — Row Level Security queries (PASS)
3. `tests/offline-queue.test.ts` — Offline synchronization queue (PASS)
4. `tests/pakistani-units.test.ts` — Traditional Pakistani units (PASS)
5. `tests/shopping-interaction.test.ts` — Cart and checklist UX (PASS)
6. `tests/step7-stats-history-qa.test.ts` — History & analytics (PASS)
7. `tests/step8-settings-language-about.test.ts` — Localization (PASS)
8. `tests/seo-master.test.ts` — Canonical tags & meta tags (PASS)
9. `tests/crawl-simulation.test.ts` — Search crawler bot simulation (PASS)
10. `tests/phase4-rashan-landing.test.ts` — Rashan list multilingual pages (PASS)
11. `tests/password-security-flow.test.ts` — Password recovery flow (PASS)
12. `scripts/test-passkey-ux.ts` — Passkey / WebAuthn UX (PASS)
13. `tests/app-update-ux.test.ts` — PWA service worker update UX (PASS)
14. `tests/auth-redesign-reference.test.ts` — Auth redesign reference fidelity (PASS)
15. `tests/oauth-production-domain.test.ts` — Google OAuth Production Domain & Drift Prevention (PASS)
