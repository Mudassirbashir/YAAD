# YAAD • Master SEO Final Checklist & Launch Verification

This document provides the operational pre-launch, launch day, and ongoing maintenance checklist for the **YAAD (یاد)** production SEO deployment.

---

## 1. Pre-Launch Technical Checklist

### 1.1 Canonical & Domain Integrity
- [x] Production domain strictly bound to `https://yaad-mudassirbashir530-creators-projects.vercel.app` in `siteConfig.ts`.
- [x] Zero staging, preview, or `localhost` hostnames present in `<link rel="canonical">` or Open Graph tags.
- [x] Every public page emits a self-referential canonical URL matching its exact route and language query parameters.

### 1.2 Robots & Crawler Directives
- [x] `public/robots.txt` exists and is served with `Content-Type: text/plain; charset=utf-8` at `/robots.txt`.
- [x] `User-agent: *` is defined.
- [x] All 6 public editorial routes (`/`, `/about`, `/help`, `/terms`, `/privacy`, `/legal`) are explicitly allowed.
- [x] All private routes (`/lists/`, `/history/`, `/settings/`, `/create`, `/stats`, `/reset-password`, `/auth`) are strictly disallowed.
- [x] `Sitemap:` directive references the authoritative production XML sitemap.

### 1.3 Private Route Protection & Data Leak Prevention
- [x] Authenticated screens (`/home`, `/lists/*`, `/history/*`, `/settings/*`, `/create`, etc.) inject `<meta name="robots" content="noindex, nofollow, noarchive" />`.
- [x] Authenticated screens clear canonical link tags and JSON-LD structured data scripts.
- [x] Server-side fallback (`server.ts`) intercepts requests to private paths and guarantees `noindex, nofollow, noarchive` in the raw HTML stream.
- [x] Supabase Row Level Security (RLS) policies prevent unauthorized access to shopping lists and item tables.

### 1.4 XML Sitemap Quality & Hreflang
- [x] `public/sitemap.xml` exists and is served at `/sitemap.xml` with `Content-Type: application/xml`.
- [x] Contains 18 live, resolvable URLs representing the 6 editorial routes in English, Urdu (`?lang=ur`), and Roman Urdu (`?lang=roman-urdu`).
- [x] XML namespace declarations are valid (`sitemaps.org/schemas/sitemap/0.9` and `w3.org/1999/xhtml`).
- [x] All hreflang links are strictly reciprocal across all language alternates.
- [x] `x-default` is mapped to the English default root.
- [x] Zero private or authenticated URLs are present in the sitemap.

### 1.5 Multilingual Routing & Localization
- [x] `?lang=ur` renders authentic Urdu Nastaliq typography with `dir="rtl"` and `lang="ur-PK"`.
- [x] `?lang=roman-urdu` renders Roman Urdu with `dir="ltr"` and `lang="ur-Latn"`.
- [x] Default route renders English with `dir="ltr"` and `lang="en"`.
- [x] Page titles, meta descriptions, and Open Graph previews dynamically adapt to the active language.

### 1.6 Structured Data (JSON-LD)
- [x] Homepage includes valid `SoftwareApplication` and `Organization` schemas.
- [x] `/help` includes valid `FAQPage` schema with comprehensive Q&A entities.
- [x] All public pages include hierarchical `BreadcrumbList` schema.
- [x] Zero validation errors when tested against Google's Rich Results Test.

### 1.7 Social Preview Assets
- [x] `/public/og-image.png` is an exact 1200×630px high-contrast PNG asset.
- [x] Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) are fully defined.
- [x] Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) specify `summary_large_image`.

---

## 2. Launch Day Search Engine Submission Checklist

### 2.1 Google Search Console
- [ ] Add URL-prefix property: `https://yaad-mudassirbashir530-creators-projects.vercel.app/`.
- [ ] Verify ownership via existing pre-configured HTML meta tag (`BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg`).
- [ ] Submit sitemap URL: `https://yaad-mudassirbashir530-creators-projects.vercel.app/sitemap.xml`.
- [ ] Perform live URL inspection on `/`, `/about`, and `/help` to verify 200 OK and valid schema.
- [ ] Request indexing on the primary homepage URL.

### 2.2 Microsoft Bing Webmaster Tools
- [ ] Sign in to Bing Webmaster Tools and import site configuration from Google Search Console.
- [ ] Verify `sitemap.xml` is processed and 18 URLs are recognized.
- [ ] Configure Crawl Control to optimize crawling during off-peak hours.
- [ ] Test `/` in Bing Live URL Inspection tool.

### 2.3 IndexNow Protocol Activation
- [ ] Place IndexNow verification key file at website root.
- [ ] Trigger automated ping for all public editorial URLs.

---

## 3. Ongoing Maintenance & Health Schedule

### 3.1 Weekly Tasks
- **Google Search Console**: Review **Performance** tab for emerging search queries (especially bilingual queries like `سودا سلف`, `rashan list`).
- **Index Coverage**: Verify zero 4xx or 5xx crawl anomalies.
- **Security Check**: Confirm zero security warnings or manual actions.

### 3.2 Monthly Tasks
- **Core Web Vitals**: Confirm LCP ≤ 1.2s, INP ≤ 50ms, and CLS = 0.0 across mobile and desktop.
- **Sitemap Refresh**: Check if new informational guides or legal revisions have been made and verify `lastmod` timestamps.
- **Hreflang Audit**: Ensure reciprocal language annotations continue to resolve without redirect chains.

### 3.3 Quarterly Tasks
- **Content Roadmap Execution**: Review `SEO_CONTENT_ROADMAP.md` and publish new seasonal rashan or grocery management guides.
- **Competitor & Keyword Expansion**: Refresh `SEO_KEYWORD_STRATEGY.md` with new search trends in regional markets.

---

## 4. Emergency Incident Response: Private URL Crawl Remediation

In the unexpected event that a crawler discovers a private shopping list link (e.g. shared publicly on social media or in an external forum):

1. **Immediate Verification**:
   - Confirm that visiting the URL returns `noindex, nofollow, noarchive` and that Supabase RLS forbids unauthenticated read access.
2. **Urgent Removal in Google Search Console**:
   - Navigate to **Indexing** > **Removals**.
   - Click **New Request**.
   - Select **Temporarily remove URL** (or **Clear cached URL**).
   - Enter the private URL or prefix (e.g. `https://.../lists/[list-id]`).
   - Submit the removal request (processed by Google within 2–6 hours).
3. **Bing Webmaster Tools Removal**:
   - Navigate to **Tools** > **Block URLs**.
   - Enter the target path and submit the temporary block.
4. **Log Analysis**:
   - Inspect server access logs to confirm crawler has ceased fetching the blocked URI.
