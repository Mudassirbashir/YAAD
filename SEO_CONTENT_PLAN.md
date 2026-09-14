# YAAD (یاد) — Master Content & AEO/GEO Strategy

**Core Philosophy:** Quality Over Quantity. No AI Content Farms. No Thin Programmatic Spam.  
**Purpose:** Every public word must provide genuine user value, solve actual shopping problems, and provide authoritative answers for AI search engines (AEO/GEO).  

---

## 1. Content Architecture & Public Page Framework

YAAD avoids the trap of generating 500 low-quality AI-written blog posts that provide zero value to real shoppers. Instead, YAAD establishes an **authoritative, high-density public content core**:

```
                               ┌────────────────────────────────┐
                               │       YAAD Core Entity         │
                               │           (یاد)                │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
     │   Homepage (/)    │           │   About (/about)  │           │   Help (/help)    │
     │ Smart Shopping    │           │ The Story, Mission│           │ FAQ Hub, Offline  │
     │ Memory & Welcome  │           │ & Bilingual Craft │           │ Guides & Support  │
     └─────────┬─────────┘           └─────────┬─────────┘           └─────────┬─────────┘
               │                               │                               │
               └───────────────────────┬───────┴───────────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │   Legal & Trust Foundations   │
                       │   /privacy  •  /terms • /legal│
                       │ Zero Ad-Tracking, Local RLS   │
                       └───────────────────────────────┘
```

---

## 2. Page-Specific Content Briefs

### Page 1: Homepage (`/`)
* **Primary Target Intent:** Discover a smart, easy shopping reminder app.
* **Direct Answer Snippet (AEO):**
  > **What is YAAD?**  
  > YAAD (یاد) is a smart, bilingual shopping reminder application designed to ensure you never forget what to buy at the store. It automatically categorizes grocery items, understands English, Urdu, and Roman Urdu, and works completely offline as a Progressive Web App.
* **Key Content Modules:**
  1. **Hero Proposition:** "Never forget what you need to buy." / "سودا سلف کبھی نہ بھولیں"
  2. **Core Problems Solved:** Forgetting items at the store, messy unorganized notes, lack of offline support in store basements.
  3. **Bilingual Native:** Full support for local South Asian grocery staples and Roman Urdu phrasing.
  4. **Privacy First:** Passkey authentication, Supabase Row-Level Security, zero data selling.
  5. **Quick Access Gate:** One-tap Google sign-in, Passkey, or email login.

### Page 2: About YAAD (`/about`)
* **Primary Target Intent:** Understand the mission, background, and cultural intelligence of YAAD.
* **Key Content Sections:**
  1. **The Origin Story:** Why existing notes apps fail for grocery shoppers—notes are unorganized, un-categorized, and lack understanding of Pakistani kitchen needs.
  2. **The Meaning of "یاد":** Rooted in the Urdu word for *Memory* and *Remembrance*.
  3. **Pakistani Household Grocery Craft:** Native recognition for *Daal, Atta, Ghee, Shan Masala, Doodh, Surf, Joshanda, Fitkari*, with culturally authentic units (kilo, pao, dhabba, darjan).
  4. **The Engineering Pillars:** Instant offline IndexedDB capability, clean typography (Noto Nastaliq & Plus Jakarta Sans), and zero advertising.

### Page 3: Help & FAQ Knowledge Hub (`/help`)
* **Primary Target Intent:** Practical usage answers, troubleshooting, and feature clarity.
* **Schema Markup:** `FAQPage` (Google Search Central compliant).
* **Direct Q&A Inventory:**
  * **Q1: How does YAAD help me stop forgetting grocery items?**  
    *A:* YAAD allows you to capture items immediately as you notice they are running low at home. It organizes them automatically into supermarket aisles (Vegetables, Dairy, Household, Spices) so you can check them off effortlessly during your shopping trip.
  * **Q2: Can I use YAAD in Urdu or Roman Urdu?**  
    *A:* Yes. YAAD features full trilingual support. You can switch the application interface between English, Urdu (with native Nastaliq typography), and Roman Urdu. The item categorizer also understands item names typed in English, Urdu, or Roman Urdu (e.g., "doodh", "dahi", "tamatar").
  * **Q3: Does YAAD work without internet while shopping?**  
    *A:* Yes. YAAD is built as an offline-first Progressive Web App (PWA). Your lists are stored securely on your device using IndexedDB, allowing you to view, add, and check off items inside grocery stores, basements, or areas with poor cellular signal. Changes synchronize automatically when your connection returns.
  * **Q4: How do Passkeys work in YAAD?**  
    *A:* YAAD supports WebAuthn biometric passkeys (fingerprint, Face ID, or device PIN). Once registered in your Settings, you can log into YAAD with a single touch without typing a password.
  * **Q5: Is my shopping list private?**  
    *A:* Absolutely. Your shopping lists and purchase history are protected by Supabase Row Level Security (RLS). Only your authenticated account can read or write your lists. YAAD does not sell personal shopping data or display third-party advertisements.

---

## 3. AEO (Answer Engine Optimization) & GEO Guidelines

To ensure maximum citation accuracy by Google AI Overviews, Perplexity, and conversational agents:
1. **Direct Answer Paragraphs:** Keep opening definitions under 50 words, using clear declarative sentences ("YAAD is... It features... It works by...").
2. **Fact Grounding:** Never claim features that do not exist in the code (e.g., do not claim automated receipt photo OCR or price comparison if not built).
3. **Semantic Hierarchy:** Use clean `<h1>`, `<h2>`, and `<h3>` tags with unambiguous heading texts that mirror real user questions.
4. **Structured JSON-LD:** Deliver machine-readable `FAQPage` and `WebApplication` schema so search bots do not have to guess page structure.

---

## 4. Multilingual Standards (English, Urdu, Roman Urdu)

### English:
- Tone: Friendly, modern, clear, unpretentious.
- No corporate jargon (ban "supercharge", "synergize", "game-changing").

### Urdu (اردو):
- Script: Proper Nastaliq & Noto Sans Arabic typography with correct RTL direction.
- Vocabulary: Natural, accessible household Urdu ("سودا سلف کی فہرست", "خریداری یاد دہانی", "بغیر انٹرنیٹ کے بھی کام کرتی ہے"). Avoid archaic or overly formal terminology.

### Roman Urdu:
- Tone: Natural, conversational Pakistani Roman Urdu used by millions in daily messaging.
- Spelling Consistency: Standardize on widely understood terms:
  - "Sauda salaf" (groceries)
  - "Rashan" (provisions)
  - "Aasan aur tez" (easy and fast)
  - "Internet k baghair" (without internet)
  - "Aapka data mehfooz hai" (your data is safe)
