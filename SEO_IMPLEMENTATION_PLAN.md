# YAAD (یاد) — Master SEO Implementation Plan

**Framework:** BeyondSEO Methodology + Google Search Central Standards  
**Target Architecture:** Vite 6 + React 19 SPA + Express SSR Meta Injector  
**Security Boundary:** Complete Isolation of Private Supabase & IndexedDB Shopping Lists  

---

## 1. Architectural Strategy & Phased Roadmap

The implementation is structured into 6 sequential phases to ensure maximum technical correctness without risking regression of existing application features:

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Canonical Site Configuration                       │
│ Single source of truth for domain, brand, & metadata       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Static Technical Assets                            │
│ RFC 9309 robots.txt + sitemaps.xml + 1200x630 OG Banner     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: Client-Side Dynamic Head Manager                   │
│ React 19 reactive meta tags, canonicals, & robots directives│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Server-Side Meta Injection (Raw HTML / Crawlers)   │
│ Express SSR tag injection for WhatsApp, Facebook, bots      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 5: Structured Data (Schema.org) Engine                │
│ JSON-LD: WebApplication, WebSite, FAQPage, Breadcrumbs       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 6: Verification, CWV, & Search Console Readiness      │
│ Full TypeScript check, unit test suite, production build    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Component Architecture

### Component 1: `src/config/siteConfig.ts`
Establishes a single configurable object containing:
- `productionUrl`: Configurable via `import.meta.env.VITE_SITE_URL` with default fallback to `https://yaad.app` (and development fallback).
- `siteName`: `"YAAD"`
- `siteNameUrdu`: `"یاد"`
- `titleTemplate`: `"%s • YAAD"`
- `defaultDescription`: `"YAAD (یاد) is a smart, friendly shopping reminder that helps you remember what to buy before and during your shopping trip. Works in English, Urdu, and Roman Urdu."`
- `brandThemeColor`: `"#005039"`
- `officialEmail`: `"yaadapppk@gmail.com"`
- `routes`: Canonical paths and metadata definitions for all public pages.

### Component 2: Static Crawl Files (`public/robots.txt` & `public/sitemap.xml`)
- **`robots.txt`**: Strictly allows search bots on public marketing/editorial pages while explicitly blocking private application routes.
- **`sitemap.xml`**: Lists valid public URLs with `lastmod`, `changefreq`, `priority`, and `<xhtml:link rel="alternate">` tags.

### Component 3: Reactive Head Manager (`src/seo/HeadManager.tsx`)
A dedicated React component mounted at the root of `App.tsx`:
- Listens to route changes from `RouterContext`.
- Listens to language changes from `LanguageContext` (`en`, `roman-urdu`, `ur`).
- Dynamically updates `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`.
- Dynamically updates `document.documentElement.lang` (`en`, `ur-PK`, `ur-Latn`) and `dir` (`ltr`, `rtl`).
- Generates and injects page-specific Schema.org JSON-LD scripts into `<head>`.

### Component 4: Express Raw HTML Meta Injector (`server.ts`)
- Catches GET requests for `/`, `/about`, `/help`, `/terms`, `/privacy`, `/legal`.
- Reads `dist/index.html` (or Vite template in dev) and performs surgical regex replacement of title, description, canonical link, and Open Graph tags.
- Allows web scrapers (WhatsApp, Facebook, Twitter, Slack, LinkedIn, Googlebot non-JS pass) to see page-specific preview cards instantly without booting the React VM.

---

## 3. Schema.org Structured Data Architecture

| Page | Primary Schema Type | Secondary Schema Type | Properties Included |
| :--- | :--- | :--- | :--- |
| `/` | `WebApplication` | `WebSite` | `name`, `alternateName: "یاد"`, `operatingSystem: "All"`, `applicationCategory: "ShoppingApplication"`, `offers: { price: 0 }`, `inLanguage: ["en", "ur"]` |
| `/about` | `AboutPage` | `Organization` | `name`, `description`, `mainEntity: Organization`, `url`, `logo` |
| `/help` | `FAQPage` | `ItemPage` | `mainEntity: Question[]` (Direct questions & answers matching visible UI) |
| `/terms` | `WebPage` | `BreadcrumbList` | `name`, `description`, `breadcrumb` |
| `/privacy` | `WebPage` | `BreadcrumbList` | `name`, `description`, `breadcrumb` |
| `/legal` | `WebPage` | `BreadcrumbList` | `name`, `description`, `breadcrumb` |

---

## 4. Verification & Testing Protocol

Before marking complete, the following verification gates must pass:
1. **TypeScript Compilation:** `npm run lint` (0 errors).
2. **Regression Test Suite:** `npm test` (all 7 existing test suites must pass).
3. **Production Build:** `npm run build` (`vite build` + `esbuild server.ts`).
4. **Endpoint Validation:**
   - `GET /robots.txt` returns HTTP 200 with `Content-Type: text/plain`.
   - `GET /sitemap.xml` returns HTTP 200 with `Content-Type: application/xml`.
   - `GET /about` returns HTML containing `<title>About YAAD • یاد</title>`.
5. **Security & Privacy Audit:**
   - Verify that no private user list ID appears in any sitemap or robots output.
   - Verify that authenticated views always render `<meta name="robots" content="noindex, nofollow">`.
