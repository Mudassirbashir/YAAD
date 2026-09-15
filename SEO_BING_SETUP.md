# YAAD • Bing Webmaster Tools Production Setup Guide

This operational manual covers setup, verification, sitemap submission, IndexNow automated indexing, and crawling management for **YAAD (یاد)** within **Microsoft Bing Webmaster Tools (BWT)** and Yahoo Search / DuckDuckGo syndication.

---

## 1. Property Setup in Bing Webmaster Tools

Bing Webmaster Tools powers organic results on **Microsoft Bing**, **DuckDuckGo**, **Ecosia**, and conversational AI search in **Microsoft Copilot**.

### 1.1 Method A: One-Click Import from Google Search Console (Recommended)
Because Google Search Console ownership is verified:
1. Navigate to [Bing Webmaster Tools](https://www.bing.com/webmasters/).
2. Sign in using your Microsoft, Google, or GitHub account.
3. Select **Import your sites from GSC**.
4. Authorize Bing to access the GSC account managing `https://yaad-mudassirbashir530-creators-projects.vercel.app/`.
5. Bing automatically imports the verified site, sitemap definitions, and settings without requiring additional DNS or meta-tag checks.

### 1.2 Method B: Manual Verification via HTML Meta Tag
If importing manually:
1. Add `https://yaad-mudassirbashir530-creators-projects.vercel.app/` as a site.
2. Select **HTML Meta Tag** verification.
3. Copy the `<meta name="msvalidate.01" content="[BING_CODE]" />` value.
4. Paste it into the `<head>` section of `index.html`.
5. Click **Verify**.

---

## 2. Sitemap Submission in Bing

1. In the left navigation menu of Bing Webmaster Tools, open **Sitemaps**.
2. Click **Submit Sitemap**.
3. Enter the absolute URL:
   `https://yaad-mudassirbashir530-creators-projects.vercel.app/sitemap.xml`
4. Click **Submit**.
5. Bing will fetch and process the 18 URLs and their reciprocal hreflang annotations.

---

## 3. IndexNow Integration & Instant Indexing

### 3.1 What is IndexNow?
IndexNow is an open protocol co-developed by Microsoft Bing and Yandex that instantly notifies search engines whenever content is published, updated, or deleted, bypassing crawler latency.

### 3.2 Key Generation
To use IndexNow:
1. Generate an API Key (a 32-character hexadecimal string, e.g. `8f21b34e6c9941a8b9e652a912d0831f`).
2. Host the key file at the root of the site:
   `https://yaad-mudassirbashir530-creators-projects.vercel.app/8f21b34e6c9941a8b9e652a912d0831f.txt`
   The contents of this file must match the key string exactly.
3. When publishing new editorial content or revising legal documents, dispatch an HTTP POST request to Bing:

```bash
curl -X POST "https://api.indexnow.org/IndexNow" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d '{
       "host": "yaad-mudassirbashir530-creators-projects.vercel.app",
       "key": "8f21b34e6c9941a8b9e652a912d0831f",
       "keyLocation": "https://yaad-mudassirbashir530-creators-projects.vercel.app/8f21b34e6c9941a8b9e652a912d0831f.txt",
       "urlList": [
         "https://yaad-mudassirbashir530-creators-projects.vercel.app/",
         "https://yaad-mudassirbashir530-creators-projects.vercel.app/about",
         "https://yaad-mudassirbashir530-creators-projects.vercel.app/help",
         "https://yaad-mudassirbashir530-creators-projects.vercel.app/privacy"
       ]
     }'
```

---

## 4. Crawl Control & Bingbot Optimization

### 4.1 Crawl Control Settings
In Bing Webmaster Tools:
1. Open **Configure My Site** > **Crawl Control**.
2. Bing allows you to designate hours when Bingbot crawls at lower or higher volume.
3. For YAAD, set normal crawling around the clock, with higher crawl rate during Pakistani off-peak hours (02:00–06:00 PKT).

### 4.2 URL Inspection Tool
Bing provides a live URL Inspection tool equivalent to GSC:
1. Paste `https://yaad-mudassirbashir530-creators-projects.vercel.app/`.
2. Inspect the **Live URL Test**:
   - Status code: `200 OK`.
   - Discovered markup: Schema.org structured data (`SoftwareApplication`, `Organization`, `BreadcrumbList`).
   - Mobile friendliness: "Mobile friendly".

---

## 5. Rich Snippets & Microsoft Copilot Search Grounding

Bing and Copilot strongly weight structured schema entities:
- The presence of `FAQPage` schema on `/help` allows Bing to display collapsible question accordions directly in Bing search results.
- The `SoftwareApplication` schema with `operatingSystem: "Web, Progressive Web App (PWA)"` and `applicationCategory: "LifestyleApplication"` signals to Copilot that YAAD is an installable, high-utility tool.
- Multilingual indexing ensures Bing surfaces YAAD for bilingual queries in Urdu and Roman Urdu.
