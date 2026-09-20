# YAAD Production Domain Migration Report
**Target Domain:** `https://yaadapppk.vercel.app`  
**Migration Date:** September 2026  
**Status:** COMPLETED & VERIFIED IN CODEBASE

---

## 1. Executive Summary

The YAAD production application has been migrated to its new authoritative production domain:
- **New Authoritative Domain:** `https://yaadapppk.vercel.app`
- **Legacy Staging/Preview Domains Supported:**
  - `https://yaad-three.vercel.app`
  - `https://yaad-mudassirbashir530-creators-projects.vercel.app`

All canonical URLs, Open Graph / Twitter tags, JSON-LD structured data, SSR crawler injections, sitemaps, robots.txt, IndexNow notifications, Passkey RP IDs, and authentication redirect helpers have been updated to treat `https://yaadapppk.vercel.app` as the single authoritative source of truth.

---

## 2. Architectural Audit & Code Changes

| Layer / Component | File | Changes Implemented | Status |
| :--- | :--- | :--- | :--- |
| **Site Config (Single Source of Truth)** | `src/config/siteConfig.ts` | Updated `defaultProductionUrl` to `https://yaadapppk.vercel.app`. Added environment-aware `getAuthRedirectUrl()` helper. | **VERIFIED** |
| **HTML Entry Point & Meta Tags** | `index.html` | Updated canonical tag, Open Graph (`og:url`, `og:image`), Twitter cards, and Schema.org JSON-LD graph to `https://yaadapppk.vercel.app`. | **VERIFIED** |
| **Server-Side Rendering (SSR) & Bot Injection** | `server.ts` | Updated fallback canonical URL to `https://yaadapppk.vercel.app`. Added legacy domain 301 Permanent Redirect middleware (`yaad-three.vercel.app` and `yaad-mudassirbashir530-creators-projects.vercel.app` → `yaadapppk.vercel.app`). | **VERIFIED** |
| **Passkey / WebAuthn Configuration** | `src/lib/passkey.ts` & `server.ts` | Updated `PRODUCTION_PASSKEY_RP_ID` and server-side passkey config to `yaadapppk.vercel.app`. Allowed legacy domains during authentication if visited. Enhanced WebAuthn error formatting with clear user instructions. | **VERIFIED** |
| **Authentication & Redirects** | `src/lib/supabase.ts` & `src/context/AuthContext.tsx` | Bound Google OAuth and password reset link redirects to `getAuthRedirectUrl()`. Updated domain-bound error translator in `formatAuthErrorMessage`. | **VERIFIED** |
| **Client-Side Domain Drift Guard** | `src/App.tsx` | Added an instant client-side replace guard that detects legacy domains and redirects to `https://yaadapppk.vercel.app`, preserving paths, query strings, and auth/recovery hash tokens. | **VERIFIED** |
| **Robots & Sitemap** | `public/robots.txt` & `public/sitemap.xml` | Updated sitemap declaration in `robots.txt` and all 126 canonical URLs + hreflang alternate links in `sitemap.xml` to `https://yaadapppk.vercel.app`. | **VERIFIED** |
| **IndexNow Protocol** | `scripts/notify-indexnow.ts` | Updated host and key location to `yaadapppk.vercel.app`. Verified all 21 public multilingual URLs via dry-run execution. | **VERIFIED** |
| **Environment Declarations** | `.env.example` | Updated default `PASSKEY_RP_ID` to `yaadapppk.vercel.app` and added `VITE_SITE_URL`. | **VERIFIED** |
| **Test Suite** | `tests/*.test.ts` | Updated assertions in `seo-master.test.ts`, `crawl-simulation.test.ts`, and `phase4-rashan-landing.test.ts` to test against the new domain. All 10 suites passed. | **VERIFIED** |

---

## 3. Required Dashboard Configurations (Manual Steps)

Because cloud services (Supabase, Google Cloud, Vercel, Google Search Console) require owner privileges, the following steps must be completed in their respective dashboards:

### 3.1. Supabase Dashboard
1. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to: `https://yaadapppk.vercel.app`
   - Add to **Redirect URLs**:
     - `https://yaadapppk.vercel.app/**`
     - `https://yaadapppk.vercel.app/auth`
     - `https://yaadapppk.vercel.app/reset-password`
     - `http://localhost:3000/**` (for local development)
2. Verify in **Authentication → Providers → Google**:
   - Confirm Google OAuth is active. Note your Supabase callback URL (e.g., `https://<your-project>.supabase.co/auth/v1/callback`).

### 3.2. Google Cloud Console (Google OAuth Credentials)
1. Navigate to **APIs & Services → Credentials**:
2. Select your **OAuth 2.0 Client ID** used for Supabase.
3. Under **Authorized JavaScript origins**, add:
   - `https://yaadapppk.vercel.app`
4. Under **Authorized redirect URIs**, ensure your Supabase callback URL is present:
   - `https://<your-project-id>.supabase.co/auth/v1/callback`

### 3.3. Vercel Deployment Dashboard
1. Go to **Project Settings → Environment Variables**:
   - Update `VITE_SITE_URL` = `https://yaadapppk.vercel.app`
   - Update `PASSKEY_RP_ID` = `yaadapppk.vercel.app`
2. Go to **Project Settings → Domains**:
   - Ensure `yaadapppk.vercel.app` is set as the primary production domain.
   - If `yaad-three.vercel.app` or `yaad-mudassirbashir530-creators-projects.vercel.app` are still attached to the project, configure them to 301 redirect to `yaadapppk.vercel.app`.

### 3.4. Search Engines & IndexNow
1. **Google Search Console**:
   - Add a new **URL-prefix property**: `https://yaadapppk.vercel.app/` (will auto-verify via the existing HTML meta tag `BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg`).
   - Submit sitemap: `https://yaadapppk.vercel.app/sitemap.xml`.
2. **Bing Webmaster Tools**:
   - Add `https://yaadapppk.vercel.app/` or import from Google Search Console.
   - Submit sitemap: `https://yaadapppk.vercel.app/sitemap.xml`.
3. **IndexNow**:
   - Run `npm run notify:indexnow` once deployed to push all 21 public URLs immediately to Bing, Yandex, Seznam, and Naver.

---

## 4. Verification Results

- **TypeScript Type Check & Lint:** `npm run lint` — 0 errors.
- **Full Build & Bundle:** `npm run build` — Successful.
- **Full Test Suite:** `npm test` — All 10 suites passed (100% green).
- **IndexNow Dry Run:** `npm run notify:indexnow -- --dry-run` — 21 URLs correctly targeted to `https://yaadapppk.vercel.app`.
