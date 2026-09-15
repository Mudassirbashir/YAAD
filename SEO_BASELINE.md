# YAAD • Search Performance Baseline & Monitoring Protocol

**Document Version:** 1.0.0  
**Status:** ACTIVE BASELINE  
**Canonical Host:** `https://yaad-mudassirbashir530-creators-projects.vercel.app`  
**Search Engines Covered:** Google (Search Console), Microsoft Bing (Webmaster Tools)

---

## 1. Initial Empirical Baseline Metrics (Day 0)

> **Strict Truth-in-Data Mandate:** In accordance with production search engineering standards, all performance metrics prior to live search engine telemetry are recorded as `UNKNOWN / PENDING SEARCH CONSOLE TELEMETRY`. Fabricating, estimating, or predicting initial search numbers is strictly forbidden.

| Metric | Day 0 Status (Launch Baseline) | Verification Source |
| :--- | :--- | :--- |
| **Indexed Pages (Google)** | `UNKNOWN` (Pending initial crawl & index verification) | Google Search Console > Indexing > Pages |
| **Indexed Pages (Bing)** | `UNKNOWN` (Pending Bingbot crawl & index verification) | Bing Webmaster Tools > URL Inspection / Sitemaps |
| **Total Search Impressions** | `UNKNOWN` (0 recorded until organic queries trigger impressions) | GSC > Performance > Search Results |
| **Total Clicks** | `UNKNOWN` (0 recorded until search visitors click YAAD listings) | GSC > Performance > Search Results |
| **Average Click-Through Rate (CTR)** | `UNKNOWN` (Calculated once impressions > 0) | GSC > Performance > Search Results |
| **Average Search Position** | `UNKNOWN` (Calculated across active ranking queries) | GSC > Performance > Search Results |
| **Top Organic Search Queries** | `UNKNOWN` (Awaiting user search query discovery) | GSC > Performance > Queries |
| **Top Performing Landing Pages** | `UNKNOWN` (Awaiting organic landing distribution) | GSC > Performance > Pages |
| **Sitemap Processing State** | `NOT YET VERIFIED` (Sitemap is live and valid; awaiting GSC ingestion) | GSC > Sitemaps (`/sitemap.xml`) |
| **Mobile Core Web Vitals (CWV)** | `PASSING (LAB)` (LCP: ~0.9s, INP: ~35ms, CLS: 0.00 in lab simulations; field CrUX data pending traffic threshold) | Google PageSpeed / Chrome UX Report |

---

## 2. Measurement Checkpoint Schedule (Day 0 to Day 90)

Search engines do not index or rank applications overnight. New web applications undergo discovery, crawler scheduling, parsing, canonical selection, initial sandbox evaluation, and query matching over weeks.

The following schedule establishes empirical review checkpoints:

```
[Day 0: Setup & Audit] ──> [Day 7: First Crawl] ──> [Day 30: Initial Queries] ──> [Day 60: Index Maturation] ──> [Day 90: Core Evaluation]
```

### Checkpoint 1: Day 0 (Launch & Submission)
- **Primary Milestone:** Property verification, sitemap discovery, robots testing.
- **Verification Target:**
  - GSC URL-prefix property verified via HTML verification tag (`BBtNIhi5i9ysQRvwAjXIWz3DnfhZLl0-4bweA8zuxDg`).
  - Sitemap submitted: `https://yaad-mudassirbashir530-creators-projects.vercel.app/sitemap.xml`.
  - Manual Live URL Inspection requested on Priority 1 pages (`/`, `/about`, `/help`).
  - IndexNow key verified and dry-run protocol executed.
- **Expected Data State:** All impressions, clicks, and rankings remain `UNKNOWN` or 0.

### Checkpoint 2: Day 7 (Initial Crawl & Indexing Audit)
- **Primary Milestone:** First pass by Googlebot and Bingbot.
- **Inspection Checklist:**
  - Inspect GSC **Page indexing** report: Have `/`, `/about`, `/help` transitioned from `Discovered - currently not indexed` to `Crawled` or `Indexed`?
  - Verify zero 5xx server errors or unhandled redirects.
  - Confirm private paths (`/lists/`, `/history/`, `/settings/`, `/home`) remain strictly excluded with `Excluded by 'noindex' tag` or `Blocked by robots.txt`.
  - Check Bing Webmaster Tools sitemap status: Confirm 18 URLs detected and parsed.

### Checkpoint 3: Day 30 (First Search Queries & Impression Discovery)
- **Primary Milestone:** Emergence of long-tail impressions and brand searches.
- **Inspection Checklist:**
  - Review GSC **Performance** report filtered by Last 28 Days.
  - Identify initial discovering queries:
    - Branded: `yaad app`, `yaad shopping`, `یاد ایپ`
    - Topical: `grocery list urdu`, `sauda salaf list`, `rashan list app`
  - Record genuine impressions and average position for top 10 discovered terms.
  - Review **Coverage** report: Resolve any `Page with redirect` or `Alternate page with proper canonical tag` warnings.
  - Verify that `?lang=ur` and `?lang=roman-urdu` are recognized as language alternates rather than conflicting duplicates.

### Checkpoint 4: Day 60 (Search Footprint Maturation & Click Stabilization)
- **Primary Milestone:** Stable indexing across all 18 localized endpoints.
- **Inspection Checklist:**
  - Audit Page Indexing: All 6 public editorial pages across all 3 language variants (18 URLs) should have an indexing decision.
  - Review CTR trends for top queries: Is the meta title and description driving engagement?
  - Compare Bing vs. Google discovery rates: Did IndexNow expedite Bing indexation compared to Google?
  - Core Web Vitals assessment: Check if real-user field data (CrUX) has appeared in Search Console.

### Checkpoint 5: Day 90 (Quarterly Baseline Review & Strategy Refresh)
- **Primary Milestone:** Comprehensive baseline establishment and Phase 4 roadmap activation.
- **Inspection Checklist:**
  - Populate definitive 90-day baseline numbers:
    - 90-Day Total Impressions
    - 90-Day Total Clicks
    - Blended CTR
    - Median Ranking Position across primary keyword clusters (from `SEO_KEYWORD_STRATEGY.md`)
  - Identify top 5 query opportunities with high impressions but low CTR (target for meta copy optimization).
  - Identify content expansion candidates from `SEO_CONTENT_ROADMAP.md` (e.g. dedicated Rashan checklists).

---

## 3. Weekly Search Console Operational Monitoring Protocol

Every **Monday morning**, execute the following 10-point health audit in Google Search Console:

1. **Page Indexing Status**:
   - Check **Indexed** vs. **Not Indexed** count.
   - Verify that any newly added public pages are indexed.
   - Confirm no unintended spike in excluded pages.
2. **Robots & Security Directives**:
   - Check **Security & Manual Actions** tab (must state *"No issues detected"*).
   - Ensure zero private user URLs (`/lists/*`, `/history/*`, `/home`) appear in the indexed list.
3. **Sitemap Status**:
   - Check `/sitemap.xml` status under **Sitemaps** (must be green *"Success"*).
   - Confirm *"Discovered URLs"* equals 18.
4. **Search Impressions**:
   - Review 7-day impression trend. Any abrupt drop indicates technical regression or indexing removal.
5. **Organic Clicks**:
   - Track weekly click volume from Google Organic.
6. **Average CTR**:
   - Monitor Click-Through Rate. Normal baseline for informational utilities is 2.5% to 5.0%.
7. **Average Position**:
   - Track directional movement for core terms (`yaad`, `sauda salaf`, `grocery reminder`).
8. **Top Discovered Queries**:
   - Note emerging search terms to inform new FAQ items or localized headings.
9. **Top Performing Pages**:
   - Review which page receives the majority of traffic (`/`, `/about`, or `/help`).
10. **Core Web Vitals & Page Experience**:
    - Ensure all URLs remain in the "Good" threshold.

---

## 4. Monthly In-Depth Review Protocol

On the **first calendar day of each month**, perform this strategic review:

- [ ] **Keyword Growth Analysis**: Compare query count month-over-month. Are we appearing for more long-tail Pakistani grocery terms?
- [ ] **Multilingual Performance Segmentation**: Filter GSC Performance by country (Pakistan, UAE, UK, US, Canada) and language to evaluate Urdu Nastaliq (`?lang=ur`) vs. Roman Urdu (`?lang=roman-urdu`) engagement.
- [ ] **Hreflang Validation Audit**: Confirm Search Console reports zero hreflang annotation mismatch errors.
- [ ] **Bing Webmaster Tools Comparison**: Compare Bing performance with Google. Check if Bing Copilot citations are emerging.
- [ ] **Content Opportunities**: Compare search query logs against `SEO_CONTENT_ROADMAP.md` to prioritize the next publishing milestone.
- [ ] **Technical Maintenance**: Verify `lastmod` dates in `sitemap.xml` are updated whenever content is revised.
