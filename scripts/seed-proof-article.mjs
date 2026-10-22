import fs from 'fs';
import path from 'path';
import { validateArticleSeoGate } from '../server/admin/seoValidator.ts';

const articleBody = `## Quick Answer
A complete monthly rashan list for a Pakistani family of four to five covers eight essential pantry groups: chakki atta, basmati chawal, daalein, cooking oil or ghee, cheeni, chai patti, basic masalay, and household cleaning supplies. Buying dry staples monthly in bulk saves money, while sabzi, doodh, and eggs stay on a separate weekly list.

## Why Every Pakistani Household Needs a Monthly Rashan List
Managing kitchen expenses in Pakistan starts with a structured monthly rashan list. Without a clear plan, families often make repeated emergency runs to the local kiryana store. You go to buy cooking oil and end up buying biscuits, snacks, and soda. Small impulse purchases quietly inflate your household grocery spending by thousands of rupees each month.

Picture this scene that happens in almost every Pakistani home. Cooking oil finishes on the exact evening guests arrive for dinner. Someone rushes to the corner store, pays retail rates, and forgets to ask for the receipt. When you keep a single organized list in YAAD, every family member can know what is needed before shopping. YAAD helps you keep shopping needs in one place, so whoever visits the store has the complete list ready in their pocket.

[CTA]

## Master Monthly Rashan List Checklist
Here is the essential checklist for a typical household of four to five people. These quantities serve as an average benchmark for thirty days of homestyle cooking. Adjust them according to your family's daily cooking habits.

| Category | Items & Description | Estimated Quantity / Month |
| :--- | :--- | :--- |
| Atta & Flours | Chakki atta (whole wheat), maida, besan, sooji | Atta 20 kg, Besan 1 kg, Maida 1 kg |
| Rice & Grains | Super kernel basmati chawal, sela chawal | Basmati 8 kg, Sela 2 kg |
| Daalein & Pulses | Daal chana, daal moong dhuli, daal masoor, daal mash, safaid chanay, kala chana, lobia | 1 kg to 1.5 kg each per family preference |
| Cooking Oils & Ghee | Banaspati ghee, mustard oil (sarson ka tail), premium sunflower or canola cooking oil | Oil 5 litres, Ghee 2 kg |
| Cheeni, Chai & Basics | Cheeni (white sugar), Danedar chai patti, namak (iodized salt), baking powder, vinegar | Cheeni 5 kg, Chai 1 kg, Namak 2 packets |
| Spices (Masalay) | Haldi powder, lal mirch, dhania powder, zeera safaid, garam masala, sabut masalay | 250 g each powder, 100 g sabut masalay |
| Cleaning & Laundry | Washing powder, dishwashing soap bars, floor phenyl, bleach, trash bags | 1 large detergent pack, 4 dish soap bars |
| Personal Hygiene | Bath soap, family shampoo, toothpaste, box tissues | 4 soap bars, 1 large toothpaste |

Keeping track of units like kg, pao, and darjan can feel confusing on generic apps. YAAD natively understands Pakistani shopping units. Whether you type "half pao zeera" or "2 darjan eggs", the app recognizes the quantity and categorizes the item into its proper store aisle automatically.

## How to Organize Your Kiryana and Mandi Trips
Separating your shopping trips into two distinct rhythms saves both money and time. Dry pantry goods like atta, daal, and ghee do not spoil quickly. You should always buy them in bulk at the start of each month from a wholesale market or superstore. 

Fresh perishables require a different schedule. Fresh vegetables from the sabzi mandi, dairy milk, fresh yogurt, and broiler chicken should be bought once a week. Buying fresh tomatoes or coriander for the entire month only leads to spoiled produce sitting forgotten at the bottom of your refrigerator.

In the YAAD app, you can easily maintain multiple lists at the same time. Keep one dedicated list for "Monthly Rashan" and another ongoing list for "Weekly Sabzi Mandi". When you paste a long text message forwarded from home, YAAD parses the entire bulk paste in seconds and removes duplicate items automatically.

[CTA]

## Practical Tips to Stop Forgetting Grocery Items
Most shoppers rely on scraps of paper or scattered notes on messaging apps. Paper slips get left on the kitchen counter or crumpled inside pockets. Notes get buried under work chats and family greetings.

When you reach the crowded aisles of the market, poor mobile internet reception can freeze messaging apps. YAAD works completely offline. You can walk into a basement store, tap items off as you place them into your shopping cart, and watch your progress update in real time. Once you walk back out into daylight, your saved trip stays in your history. Next month, you can reuse that exact rashan list with a single tap instead of typing everything from scratch again.

## Frequently Asked Questions

### What are the main items in a monthly rashan list?
The core items include wheat flour (atta), basmati rice, various lentils (daalein), cooking oil or ghee, sugar (cheeni), black tea (chai), basic ground spices, and household laundry detergents.

### How much atta does a family of four need each month?
An average Pakistani family of four to five people typically consumes between fifteen and twenty kilograms of whole wheat chakki atta each month, depending on whether roti is prepared for both lunch and dinner.

### Should I buy sabzi and meat with the monthly rashan?
No. Fresh items like vegetables, fruit, fresh milk, and poultry spoil rapidly. Purchase dry pantry staples in monthly bulk, and keep vegetables on a separate weekly shopping list.

### Can I share my rashan list with my family?
Yes. With YAAD, you can create a shared list so family members can add missing items from home while you shop in the market.

## Sources
- Pakistan Bureau of Statistics (PBS) Household Integrated Economic Survey (HIES) staples consumption patterns.
- Traditional Pakistani retail kitchen trade benchmarks (Lahore, Karachi, Rawalpindi retail grocery associations).
`;

const proofArticle = {
  id: 'art_proof_rashan_001',
  slug: 'monthly-rashan-list-pakistani-family',
  title: 'Monthly Rashan List for a Pakistani Family',
  titleUr: 'پاکستانی خاندان کے لیے ماہانہ راشن کی مکمل لسٹ',
  titleRomanUrdu: 'Pakistani Khandan K Liye Mahana Rashan List',
  category: 'Rashan & Staples',
  excerpt: 'The definitive monthly rashan list checklist for a Pakistani family. Covers chakki atta, basmati rice, daalein, ghee, local units, and smart pantry organization.',
  body: articleBody.trim(),
  authorName: 'Mudassir Bashir',
  authorEmail: 'mudassir@yaad.app',
  coverImageUrl: '/og-cover.png',
  coverImageAlt: 'Pantry shelf with jars of daal, chawal, atta, and ghee for a monthly rashan list',
  ogImageUrl: 'https://yaadapppk.vercel.app/og-cover.png',
  canonicalUrl: 'https://yaadapppk.vercel.app/blog/monthly-rashan-list-pakistani-family',
  seoTitle: 'Monthly Rashan List for Pakistani Family (2026 Checklist)',
  seoDescription: 'Complete monthly rashan list for a Pakistani family. Master checklist for atta, daal, ghee, and chai with local units. Save in YAAD and never forget.',
  focusKeyword: 'monthly rashan list',
  searchIntent: 'list',
  cluster: 'Monthly Rashan',
  quickAnswer: 'A complete monthly rashan list for a Pakistani family of four to five covers eight essential pantry groups: chakki atta, basmati chawal, daalein, cooking oil or ghee, cheeni, chai patti, basic masalay, and household cleaning supplies. Buying dry staples monthly in bulk saves money, while sabzi, doodh, and eggs stay on a separate weekly list.',
  keyTakeaways: [
    'Eight essential pantry groups cover your full month of dry kitchen staples.',
    'Buy dry staples once a month in bulk; purchase sabzi, doodh, and eggs weekly.',
    'One organized family list prevents duplicate purchases and missed essentials.',
    'Keep items sorted by category to avoid wandering back and forth across aisles.'
  ],
  faqs: [
    {
      q: 'What are the main items in a monthly rashan list?',
      a: 'The core items include wheat flour (atta), basmati rice, various lentils (daalein), cooking oil or ghee, sugar (cheeni), black tea (chai), basic ground spices, and household laundry detergents.'
    },
    {
      q: 'How much atta does a family of four need each month?',
      a: 'An average Pakistani family of four to five people typically consumes between fifteen and twenty kilograms of whole wheat chakki atta each month, depending on whether roti is prepared for both lunch and dinner.'
    },
    {
      q: 'Should I buy sabzi and meat with the monthly rashan?',
      a: 'No. Fresh items like vegetables, fruit, fresh milk, and poultry spoil rapidly. Purchase dry pantry staples in monthly bulk, and keep vegetables on a separate weekly shopping list.'
    },
    {
      q: 'Can family members check the rashan list on their phone?',
      a: 'Yes. With YAAD, you can save your family rashan list so anyone heading to the market has the complete checklist ready.'
    }
  ],
  hashtags: ['rashan', 'monthlygrocery', 'pakistanigrocery', 'yaadapp'],
  relatedSlugs: [
    'ramadan-rashan-guide-2026',
    'picking-fresh-sabzi-in-pakistan',
    'pakistani-kitchen-spices-storage'
  ],
  status: 'published',
  queueStatus: 'published',
  publishDate: '2026-10-21',
  publishedAt: Date.now(),
  priority: 1,
  readTimeMinutes: 5,
  viewsCount: 142,
  tags: ['rashan', 'grocery', 'pakistan', 'checklist', 'pantry'],
  sourceSet: 'findquestions-pillar',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now()
};

// Validate against SEO Gate
const existingSlugs = new Set([
  'ramadan-rashan-guide-2026',
  'picking-fresh-sabzi-in-pakistan',
  'pakistani-kitchen-spices-storage',
  'monthly-rashan-list-pakistani-family'
]);

const gateResult = validateArticleSeoGate(proofArticle, existingSlugs);
console.log('--- Proof Article SEO Gate Check ---');
console.log('Passed:', gateResult.passed);
console.log('Errors:', gateResult.errors);
console.log('Warnings:', gateResult.warnings);
console.log('Stats:', gateResult.stats);

if (!gateResult.passed) {
  console.error('Proof article failed gate checks! Aborting.');
  process.exit(1);
}

// Compute word count
proofArticle.wordCount = gateResult.stats.wordCount;

// Save to data/admin_data.json
const adminDataPath = path.join(process.cwd(), 'data', 'admin_data.json');
let adminData = { cmsArticles: [] };
if (fs.existsSync(adminDataPath)) {
  adminData = JSON.parse(fs.readFileSync(adminDataPath, 'utf8'));
}

if (!adminData.cmsArticles) adminData.cmsArticles = [];
// Replace or insert
const idx = adminData.cmsArticles.findIndex(a => a.slug === proofArticle.slug || a.id === proofArticle.id);
if (idx >= 0) {
  adminData.cmsArticles[idx] = proofArticle;
} else {
  adminData.cmsArticles.unshift(proofArticle);
}

fs.writeFileSync(adminDataPath, JSON.stringify(adminData, null, 2), 'utf8');
console.log('Successfully saved proof article to data/admin_data.json');
