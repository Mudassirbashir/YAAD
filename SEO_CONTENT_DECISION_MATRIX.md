# YAAD (یاد) • Public SEO Content Decision Matrix

**Objective:** Establish a disciplined, content-first evaluation framework for prospective public search landing pages. This matrix prevents SEO spam, doorway pages, keyword cannibalization, and thin content by enforcing strict evaluation criteria before any line of code or prose is published.

---

## 1. Strategic Evaluation Criteria & Principles

Every candidate page is audited against nine qualitative and quantitative criteria:

1. **Unique Search Intent:** Does the user have a distinct task or informational gap that cannot be addressed by an existing page?
2. **Overlap with Existing Pages:** Would this compete with `/`, `/about`, or `/help`?
3. **Real User Value:** Does the page solve an actual human dilemma (e.g. household grocery budget planning, forgetting items, local market navigation)?
4. **YAAD Product Relevance:** Can the page naturally introduce YAAD's core capabilities (bilingual recognition, aisle grouping, offline reliability, passkeys)?
5. **Pakistani Cultural Relevance:** Does it respect real domestic shopping patterns (kiryana provision stores, monthly rashan, local units like pao and darjan)?
6. **Content Depth Possible:** Can we write 1,500+ words of genuine, high-utility guidance without fluff, marketing clichés, or AI filler?
7. **Internal Linking Value:** Does it create a natural bridge between brand discovery and functional app usage?
8. **Conversion Value:** Can a reader transition frictionlessly from reading into creating a real list in YAAD?
9. **Risk of Thin / Doorway Content:** Does the topic risk reading like an artificial programmatic doorway page?

---

## 2. Public Candidate Page Evaluation Matrix

| Page | Primary Intent | Primary Keyword | Secondary Keywords | Language | Audience | Unique Value | Potential Cannibalization | Recommended Action | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **/rashan-list** | Informational + Practical Utility: Planning recurring monthly household groceries and pantry staples | `rashan list` / `monthly rashan list` | `راشن لسٹ`, `rashan ki list`, `ghar ka rashan`, `monthly grocery list pakistan`, `sauda salaf checklist`, `kiryana rashan items` | English, Urdu (`?lang=ur`), Roman Urdu (`?lang=roman-urdu`) | Pakistani households, newly married couples, joint families, hostelites, overseas diaspora | Complete, categorized household pantry checklist with quantities, traditional units (pao, darjan), storage tips, and instant 1-click import into YAAD | **None.** Distinct from brand homepage (`/`) and general help (`/help`). Fills a massive search void flooded by PDF links and delivery ads. | **CREATE** | **P0 (Immediate)** |
| **/shopping-list** | Generic Tool / Commercial: Finding an online or digital shopping list tool | `shopping list app` | `smart shopping list`, `online shopping list`, `simple shopping list` | English, Urdu, Roman Urdu | General mobile and desktop users wanting list utilities | Generic utility description and list generator | **Severe.** Overlaps 90% with YAAD's core homepage (`/`) title and meta description. Competing with `/` causes keyword cannibalization. | **COMBINE / REJECT** | Combined into `/` |
| **/grocery-list** | Generic Tool / Commercial: Finding a grocery-specific checklist tool | `grocery list app` | `free grocery list`, `grocery checklist app`, `digital grocery list` | English, Urdu, Roman Urdu | Shoppers seeking dedicated grocery utilities | Generic grocery list features | **Severe.** Direct cannibalization of `/` and `/about`. Would dilute homepage rank for core category phrases. | **COMBINE / REJECT** | Combined into `/` & `/about` |
| **/shopping-reminder** | Problem / Solution: Remembering what to buy before leaving home or store | `shopping reminder app` | `grocery reminder`, `remember shopping items`, `never forget groceries` | English, Urdu, Roman Urdu | Forgetful shoppers, family errand runners | Memory hooks, voice reminder concepts | **Severe.** This is YAAD's explicit core brand tagline ("Smart Shopping Memory"). Belongs directly on homepage and FAQ. | **COMBINE** | Combined into `/` & `/help` |
| **/urdu-shopping-list** | Linguistic Solution: Finding a shopping list app in Urdu | `urdu shopping list` | `urdu grocery app`, `سودا سلف ایپ`, `اردو میں شاپنگ لسٹ` | English (doorway) targeting Urdu query | Urdu-literate and bilingual shoppers | Explaining Urdu language support | **High.** Creating an English URL `/urdu-shopping-list` to target Urdu queries creates an unnatural doorway page. Better served by genuine `/?lang=ur` with full RTL typography. | **COMBINE** | Combined into `/?lang=ur` & `/rashan-list?lang=ur` |
| **/roman-urdu-shopping-list** | Linguistic Solution: Typing grocery items colloquially | `roman urdu shopping list` | `roman urdu grocery app`, `sauda salaf app`, `doodh tamatar app` | English (doorway) targeting Roman Urdu | Colloquial South Asian mobile users | Explaining transliterated recognition | **High.** Standalone URL is thin. Properly fulfilled via `hreflang="ur-Latn"` on `/` and `/rashan-list?lang=roman-urdu`. | **COMBINE / REJECT** | Combined into `?lang=roman-urdu` |
| **/ramadan-rashan-list** | Seasonal Planning: Preparing kitchen staples for Ramadan fasting & Iftar | `ramadan rashan list` | `ramazan rashan package`, `sehri iftari grocery list`, `رمضان راشن لسٹ` | English, Urdu, Roman Urdu | Families preparing for Ramadan groceries (dates, rooh afza, besan, pulses) | High seasonal demand, special fasting staples and charity packages | **Low**, but temporary/seasonal in nature. Publishing off-season produces dead traffic. | **DEFER** | **P2 (Schedule for Rajab / Sha'ban)** |
| **/kiryana-shopping-guide** | Educational / Guide: Navigating traditional provision stores vs supermarkets | `kiryana shopping list` | `kiryana vs supermarket pakistan`, `how to buy spices in bulk`, `sauda salaf tips` | English, Urdu | Young adults, budget-conscious household shoppers | Practical store negotiation, freshness checks, bulk savings tips | **Low.** Valuable informational asset, but secondary to the monthly pantry checklist itself. | **DEFER** | **P3 (Future Editorial)** |

---

## 3. Decision Summary & Roadmap Execution

### Actions Approved for Phase 4:
- **CREATE `/rashan-list` (P0)**: Build a comprehensive, human-crafted, responsive public landing page in English, Urdu (Nastaliq RTL), and Roman Urdu. Include complete categorized household staples, Pakistani measurement units (*pao*, *darjan*, *chattank*), authentic budget and storage advice, FAQ with matching Schema, and an interactive CTA to start the list in YAAD.

### Actions Rejected:
- **REJECT `/shopping-list` & `/grocery-list`**: These represent artificial keyword splitting. The YAAD homepage already ranks and targets the primary entity keywords. Splitting these into sub-pages would fragment internal PageRank and cannibalize search rankings.
- **REJECT Standalone `/urdu-shopping-list` & `/roman-urdu-shopping-list`**: Creating English doorway pages to rank for language searches violates Google Search Essentials and BeyondSEO guidelines. All linguistic demand is natively satisfied through authentic `?lang=ur` (RTL) and `?lang=roman-urdu` alternates with reciprocal `hreflang` tags.

### Actions Deferred:
- **DEFER `/ramadan-rashan-list`**: Seasonal content will be introduced during pre-Ramadan editorial windows (Sha'ban) to maintain algorithmic freshness and prevent stale off-season signals.
- **DEFER `/kiryana-shopping-guide`**: Slated for subsequent editorial releases once search telemetry validates `/rashan-list` traction.
