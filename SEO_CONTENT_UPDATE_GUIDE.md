# YAAD (یاد) • Public SEO Content Lifecycle & Update Guide

This operational playbook governs the maintenance, audit cadence, multilingual quality reviews, and algorithmic hygiene of all public content assets on YAAD.

---

## 1. Content Audit Cadence & Triggers

Public content on YAAD must reflect accurate product features, authentic market conditions, and genuine user search behavior. The following schedule dictates review cycles:

| Frequency | Scope | Primary Objective |
| :--- | :--- | :--- |
| **Bi-Weekly** | Search Console Telemetry Audit | Review newly discovered queries, click-through rates (CTR), impressions, and crawl status in Google Search Console and Bing Webmaster Tools. |
| **Monthly** | Keyword Reassessment & Content Refresh | Verify whether existing queries show intent drift, identify emerging related search terms, and update outdated information (e.g. seasonal staple variations). |
| **Quarterly** | Multilingual Translation & Cultural Accuracy Audit | Audit Urdu (RTL) and Roman Urdu phrasing with native speakers to guarantee natural syntax, eliminate machine translation artifacts, and preserve cultural resonance. |
| **Biannual** | Page Merge, Prune, or Canonicalization Audit | Evaluate pages with low engagement, high bounce rates, or overlapping intents. Merge cannibalizing pages and retire obsolete pages. |

---

## 2. Trigger Conditions for Content Updates

### Trigger 1: Search Console Impression vs. CTR Discrepancy
- **Signal**: High impressions (e.g., >1,000/mo) but CTR under 1.5% in average positions 4–10.
- **Root Cause**: Title tag or meta description fails to resonate with user intent, or SERP features (featured snippets, answer boxes) are capturing clicks.
- **Action**:
  1. Audit SERP competitors for the primary keyword cluster.
  2. Rewrite the title tag to lead with the primary human benefit (e.g., *"Complete Monthly Checklist"* rather than generic brand names).
  3. Refine the `<meta name="description">` to explicitly address the specific pain point (e.g., *"Includes Chakki Atta, Daalein, Banaspati Ghee quantities for Pakistani families"*).
  4. Test and verify changes in Google Search Console URL Inspection.

### Trigger 2: Emergence of High-Value Long-Tail Queries
- **Signal**: GSC reveals impressions for specific unaddressed sub-queries (e.g., *"how much atta for family of 4"*, *"pakistani spices list with urdu names"*).
- **Action**:
  1. Check if the query is best answered inside the existing `/rashan-list` page.
  2. Add an explicit H2/H3 sub-section or an AEO question in the FAQ block.
  3. Mirror the question and answer in the visible text and update the matching `FAQPage` JSON-LD schema.

### Trigger 3: App Feature Evolution
- **Signal**: YAAD introduces new functionality (e.g., enhanced speech recognition, receipt scanning, pantry inventory).
- **Action**:
  1. Update the "How YAAD Helps" section across public landing pages to accurately describe real app behavior.
  2. Never claim unbuilt or experimental features.

---

## 3. Policy for Merging or Pruning Public Pages

### When to Merge Pages (Consolidation)
A public page should be merged into another page if:
1. **Keyword Cannibalization**: Two distinct URLs rank for the same set of queries (positions 15–40) while dividing impressions and backlinks.
2. **Thin Content**: A page has under 600 words of substance and cannot be expanded without fluff.
3. **Intent Overlap**: User feedback shows visitors looking for information on Page A expect the content found on Page B.

**Execution Steps for Merging:**
1. Consolidate valuable sections, FAQs, or checklists into the primary authoritative page.
2. Update all internal links across the application pointing to the old URL to target the consolidated URL.
3. Configure a permanent HTTP 301 redirect from the deprecated URL to the consolidated URL in `server.ts`.
4. Update `sitemap.xml` and `robots.txt` accordingly.
5. Submit the redirected URL to IndexNow and request re-indexing in Search Console.

### When to Remove Pages (Pruning)
A page should be retired and return HTTP 410 (Gone) or HTTP 404 if:
- It was created for an event or campaign that has permanently ended.
- It provides zero search impressions over 180 consecutive days and serves no product discovery purpose.

---

## 4. Multilingual Review Standards (Urdu & Roman Urdu)

### Strict Principles for Urdu (Nastaliq / اردو)
1. **No Machine Translation Artifacts**:
   - Machine tools routinely mistranslate grocery terms (e.g., translating "flour" as "آٹا" correctly, but translating "cooking oil" as "کھانا پکانے کا تیل" instead of the natural "کوکنگ آئل" or "گھی").
   - Ensure authentic vocabulary: *سودا سلف*, *چکی کا آٹا*, *بانسپتی گھی*, *دال چنا*, *پاؤ*, *دھڑی*.
2. **Typography & Layout**:
   - All Urdu containers must render with `dir="rtl"` and appropriate line-height (`leading-relaxed` or `leading-loose`) to prevent cut-off Nastaliq diacritics.
3. **Entity Parity**:
   - The brand name must consistently render as **یاد** alongside **YAAD**.

### Strict Principles for Roman Urdu
1. **Standardized Transliteration**:
   - Avoid inconsistent spelling within the same page (e.g., do not switch between "rashan", "raashan", and "ration"). Use standardized, commonly searched forms: *rashan*, *sauda salaf*, *daal*, *ghee*, *atta*.
2. **Natural Conversational Flow**:
   - Roman Urdu must read like clean, respectful South Asian domestic communication (e.g., *"Mahana grocery ki mukammal fahreest"* rather than awkward English phrasing written phonetically).

---

## 5. Seasonal Content Management Protocol

Pakistani household shopping exhibits marked seasonal peaks:
- **Ramadan (رمضان)**: Pre-fasting pantry stocking (dates, besan, rooh afza, frying oils, vermicelli).
- **Eid-ul-Adha (بقر عید)**: Meat preparation, bags, specialized spices, barbecue skewers, vinegar, garlic.
- **Winter Season**: Dry fruits (*chilgoza*, *badam*, *akhrot*), tea staples, seasonal root vegetables.

### Governance Rules for Seasonal Content:
1. **Evergreen URL Architecture**: Never include year numbers in seasonal URLs (use `/ramadan-rashan` rather than `/ramadan-rashan-2026`).
2. **45-Day Advance Publication**: Seasonal content must be refreshed and published at least 45 days before the event (e.g. at the start of the Islamic month of Rajab for Ramadan) to allow search engines time to index and rank the asset.
3. **Off-Season Behavior**: When the season ends, do NOT delete the page. Retain it as an evergreen archive with a friendly note: *"Planning for next year? Save this list in YAAD or view our monthly household rashan guide."* Keep internal links subtle during the off-season.
