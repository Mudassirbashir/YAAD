# YAAD • Google Search Console Production Setup Guide

This operational playbook details the exact procedures for setting up, verifying, monitoring, and maintaining **YAAD (یاد)** in **Google Search Console (GSC)** for search engine visibility across Pakistan, GCC, and global diaspora markets.

---

## 1. Property Configuration

### 1.1 Property Type Selection
In Google Search Console, you are presented with two property types:

1. **Domain Property** (Recommended for root apex & all subdomains):
   - Scope: All subdomains (`yaad.app`, `www.yaad.app`, `m.yaad.app`) and protocols (`http://` and `https://`).
   - Requirement: Requires DNS TXT record verification on your DNS registrar (e.g. Cloudflare, Namecheap, Vercel Domains, Route 53).

2. **URL-Prefix Property** (Direct Production Target):
   - Target URL: `https://yaad-mudassirbashir530-creators-projects.vercel.app/`
   - Scope: All URLs residing strictly under this exact protocol and origin path.
   - Requirement: HTML tag, HTML file upload, Google Analytics, or Google Tag Manager.

> **Production Recommendation**:
> Maintain **both**:
> 1. A **URL-Prefix Property** for the authoritative Vercel production deployment: `https://yaad-mudassirbashir530-creators-projects.vercel.app/`
> 2. When custom apex domain `yaad.app` is bound, add a **Domain Property** (`yaad.app`) to capture all DNS-level traffic.

---

## 2. Verification Implementation

### 2.1 HTML Tag Verification (Pre-Configured)
The authoritative verification meta tag has already been permanently embedded into `index.html`:

```html
<meta name="google-site-verification" content="BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg" />
```

**Verification Steps in GSC:**
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** in the top left dropdown.
3. Select **URL prefix** and enter:
   `https://yaad-mudassirbashir530-creators-projects.vercel.app/`
4. Click **Continue**.
5. Under **Other verification methods**, click **HTML tag**.
6. Google Search Console will detect the tag `BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg` in `<head>` and display:
   `Ownership verified`.
7. Click **Go to property**.

### 2.2 DNS TXT Record (Alternative / Apex Domain)
When connecting your production apex domain:
- **Record Type**: `TXT`
- **Host / Name**: `@` or root
- **Value**: Provided by Google Search Console (e.g., `google-site-verification=BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg`)
- **TTL**: Auto or 3600

---

## 3. Sitemap Submission

### 3.1 Submitting the Production Sitemap
YAAD generates a standards-compliant XML sitemap featuring bidirectional multilingual annotations at:
`https://yaad-mudassirbashir530-creators-projects.vercel.app/sitemap.xml`

**Submission Steps:**
1. In the left navigation menu of Google Search Console, select **Indexing** > **Sitemaps**.
2. Under **Add a new sitemap**, enter:
   `sitemap.xml`
3. Click **Submit**.
4. Status will transition from `Submitted` to `Success` within 10–60 minutes.
5. Verify that **Discovered URLs** equals **18** (6 unique canonical editorial pages across 3 genuine language representations: English default, Urdu `?lang=ur`, and Roman Urdu `?lang=roman-urdu`).

---

## 4. URL Inspection & Indexing Verification

### 4.1 Inspecting the Primary URLs
Run live tests via the **URL Inspection** tool (top search bar in GSC) for each public URL:

1. `https://yaad-mudassirbashir530-creators-projects.vercel.app/` (Home / Landing)
2. `https://yaad-mudassirbashir530-creators-projects.vercel.app/about` (About YAAD)
3. `https://yaad-mudassirbashir530-creators-projects.vercel.app/help` (Help & FAQ)
4. `https://yaad-mudassirbashir530-creators-projects.vercel.app/privacy` (Privacy Policy)
5. `https://yaad-mudassirbashir530-creators-projects.vercel.app/terms` (Terms & Conditions)
6. `https://yaad-mudassirbashir530-creators-projects.vercel.app/legal` (Legal Information)

### 4.2 Verifying Live Inspection Output
For each page, click **Test Live URL** and verify:
- **URL is available to Google**: Status 200 OK.
- **User-declared canonical**: Matches the tested URL exactly.
- **Google-selected canonical**: Inspect to confirm Google respects the user-declared canonical.
- **Crawl allowed?**: Yes.
- **Page fetch**: Successful.
- **Indexing allowed?**: Yes (`index, follow`).
- **Rich Results**: 
  - On `/`: `SoftwareApplication` and `Organization` schemas detected.
  - On `/help`: `FAQPage` schema detected with structured Q&A entities.
  - On all pages: `BreadcrumbList` schema detected.

### 4.3 Verifying Private Route Blockage in GSC
To confirm that private user routes cannot be indexed:
1. Inspect `https://yaad-mudassirbashir530-creators-projects.vercel.app/lists/test-list-id`
2. Run **Test Live URL**.
3. Confirm:
   - **Robots.txt rule**: Blocked by `Disallow: /lists/`
   - **Indexing**: "URL is not available to Google: Blocked by robots.txt" or "Excluded by 'noindex' tag".

---

## 5. Core Web Vitals & Experience Monitoring

YAAD is engineered as a lightweight Progressive Web App utilizing Tailwind CSS, instant client-side transitions, and offline service workers.

### 5.1 Targets
| Metric | Full Form | Good Threshold | YAAD Target |
| :--- | :--- | :--- | :--- |
| **LCP** | Largest Contentful Paint | ≤ 2.5s | < 1.2s |
| **INP** | Interaction to Next Paint | ≤ 200ms | < 50ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 0.00 |

### 5.2 GSC Reports to Review Weekly
- **Page Experience**: Ensure 100% of URLs are classified as "Good URLs".
- **Core Web Vitals**: Monitor Mobile and Desktop status separately.
- **HTTPS**: Confirm valid SSL/TLS certificate with zero mixed content errors.
- **Mobile Usability**: Confirm responsive viewport, minimum 44px touch targets, and legible typography without horizontal scrolling.

---

## 6. International Targeting & Multilingual Performance

Because YAAD natively supports **English**, **Urdu (اردو)**, and **Roman Urdu**:

1. **Geographic Distribution**:
   - Primary target: Pakistan (`PK`).
   - Secondary targets: United Arab Emirates (`AE`), Saudi Arabia (`SA`), United Kingdom (`GB`), United States (`US`), Canada (`CA`).
2. **Search Queries Monitoring**:
   - Track brand queries: `yaad app`, `yaad grocery`, `یااد ایپ`, `سودا سلف ایپ`.
   - Track functional intent queries: `grocery list urdu`, `rashan list maker`, `smart shopping reminder`.
   - Filter Performance reports by **Country** and **Device** to assess mobile engagement in South Asia.

---

## 7. Security Issues & Manual Actions

1. Check **Security & Manual Actions** > **Manual actions**: Confirm "No issues detected".
2. Check **Security issues**: Confirm "No issues detected" (zero malware, deceptive pages, or harmful downloads).
