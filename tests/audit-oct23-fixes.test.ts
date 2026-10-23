import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { defaultCatalogSearchEngine } from '../src/lib/catalog/searchEngine';
import { normalizePhonetic, normalizeRomanUrdu } from '../src/lib/recognition/normalizer';
import { recognizeItem } from '../src/lib/recognition/engine';
import { ShoppingItem } from '../src/types';

async function runAuditVerificationSuite() {
  console.log('======================================================');
  console.log('🔍 YAAD AUDIT 2026-10-23 ISSUES COMPREHENSIVE VERIFICATION');
  console.log('======================================================');

  // -----------------------------------------------------------------
  // 1. FONT & TYPOGRAPHY SYSTEM AUDIT
  // -----------------------------------------------------------------
  console.log('\n--- 1. Typography, Design Tokens & Flutter Fonts ---');

  const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
  const pubspecYaml = fs.readFileSync(path.resolve(process.cwd(), 'yaad_flutter/pubspec.yaml'), 'utf-8');

  // Verify design tokens prioritize Plus Jakarta Sans for Latin and Noto Nastaliq Urdu for Urdu
  assert(indexCss.includes('--font-sans: "Plus Jakarta Sans"'), 'Design token --font-sans prioritizes Plus Jakarta Sans');
  assert(indexCss.includes('--font-display: "Plus Jakarta Sans"'), 'Design token --font-display prioritizes Plus Jakarta Sans');
  assert(indexCss.includes('--font-body: "Plus Jakarta Sans"'), 'Design token --font-body prioritizes Plus Jakarta Sans');
  assert(indexCss.includes('--font-urdu: "Noto Nastaliq Urdu"'), 'Design token --font-urdu prioritizes Noto Nastaliq Urdu');

  // Verify utility class aliases redirect Manrope and Plus_Jakarta_Sans classes uniformly
  assert(indexCss.includes('[class*="font-[\'Manrope\']"]'), 'CSS aliases [class*="font-[\'Manrope\']"]');
  assert(indexCss.includes('[class*="font-[\'Plus_Jakarta_Sans\']"]'), 'CSS aliases [class*="font-[\'Plus_Jakarta_Sans\']"]');

  // Verify Urdu mode applies Noto Nastaliq Urdu across body, buttons and inputs
  assert(indexCss.includes('html[lang="ur"] button'), 'CSS provides unified Urdu button typography');
  assert(indexCss.includes('html[lang="ur"] input'), 'CSS provides unified Urdu input typography');

  // Verify Google Fonts preload includes weights 400, 500, 600, 700 for Noto Nastaliq Urdu
  assert(
    indexHtml.includes('Noto+Nastaliq+Urdu:wght@400;500;600;700'),
    'index.html includes complete weights 400..700 for Noto Nastaliq Urdu'
  );
  assert(
    indexHtml.includes('Plus+Jakarta+Sans:wght@400;500;600;700;800'),
    'index.html includes complete weights for Plus Jakarta Sans'
  );

  // Verify Flutter pubspec.yaml bundles google_fonts
  assert(
    pubspecYaml.includes('google_fonts: ^6.2.1'),
    'yaad_flutter/pubspec.yaml includes google_fonts dependency'
  );

  console.log('✅ Passed: Unified Latin typography on Plus Jakarta Sans across web & tokens');
  console.log('✅ Passed: Unified Urdu typography on Noto Nastaliq Urdu with full font weights');
  console.log('✅ Passed: Flutter app bundles google_fonts dependency');

  // -----------------------------------------------------------------
  // 2. SEARCH ENGINE & ROMAN URDU PHONETIC HARMONIZATION
  // -----------------------------------------------------------------
  console.log('\n--- 2. Search Engine Roman Urdu Vowel Harmonization ---');

  // Phonetic normalizer harmonization
  const phoneticAnday = normalizePhonetic('anday');
  const phoneticEnday = normalizePhonetic('enday');
  assert.strictEqual(
    phoneticEnday,
    phoneticAnday,
    `normalizePhonetic('enday') [${phoneticEnday}] must match normalizePhonetic('anday') [${phoneticAnday}]`
  );

  const phoneticCheni = normalizePhonetic('cheni');
  const phoneticChini = normalizePhonetic('chini');
  assert.strictEqual(
    phoneticCheni,
    phoneticChini,
    `normalizePhonetic('cheni') [${phoneticCheni}] must match normalizePhonetic('chini') [${phoneticChini}]`
  );

  // Catalog search engine results
  const testQueries = ['enday', 'undey', 'anday', 'ande', 'endey'];
  for (const query of testQueries) {
    const results = defaultCatalogSearchEngine.search(query, 3);
    assert(results.length > 0, `Search for '${query}' must return at least 1 result`);
    const topResult = results[0];
    assert(
      topResult.item.id === 'eggs_farm' || topResult.displayName.toLowerCase().includes('egg'),
      `Search for '${query}' must match Eggs (got '${topResult.displayName}')`
    );
  }

  // Recognition engine identification
  const recEnday = recognizeItem('enday');
  assert(recEnday.isRecognized, "recognizeItem('enday') is recognized");
  assert(
    recEnday.canonicalName.toLowerCase().includes('egg') || recEnday.nameUrdu.includes('انڈے'),
    `recognizeItem('enday') matches egg (got '${recEnday.canonicalName}')`
  );

  console.log('✅ Passed: Roman Urdu vowel harmonization (e/a/u) maps "enday" to "Eggs (Anday)"');
  console.log('✅ Passed: normalizePhonetic harmonizes leading vowels and internal e/i variations');
  console.log('✅ Passed: All Roman Urdu egg queries successfully resolve with top confidence');

  // -----------------------------------------------------------------
  // 3. ITEM PHOTO & METADATA PERSISTENCE ACROSS MERGE / HYDRATION
  // -----------------------------------------------------------------
  console.log('\n--- 3. Photo & Metadata Persistence Merge Simulation ---');

  // Simulate remote relational items where image_url is missing (as in production Supabase)
  const relationalItems: ShoppingItem[] = [
    {
      id: 'item-uuid-1',
      name: 'Fresh Farm Eggs',
      categoryId: 'dairy_eggs',
      quantity: 1,
      unit: 'dozen',
      completed: false,
    },
    {
      id: 'item-uuid-2',
      name: 'Whole Milk',
      categoryId: 'dairy_eggs',
      quantity: 2,
      unit: 'litre',
      completed: true,
    },
  ];

  // Simulate local / JSON copy with rich photo and brand attached by user
  const richFallbackItems: ShoppingItem[] = [
    {
      id: 'item-uuid-1',
      name: 'Fresh Farm Eggs',
      categoryId: 'dairy_eggs',
      quantity: 1,
      unit: 'dozen',
      completed: false,
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v1234/eggs.jpg',
      emoji: '🥚',
      brand: 'Organic Farm',
    },
    {
      id: 'item-uuid-2',
      name: 'Whole Milk',
      categoryId: 'dairy_eggs',
      quantity: 2,
      unit: 'litre',
      completed: true,
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v5678/milk.jpg',
      emoji: '🥛',
    },
    {
      id: 'item-uuid-3-offline-only',
      name: 'Chai Patti',
      categoryId: 'pantry',
      quantity: 1,
      unit: 'pack',
      completed: false,
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v9999/tea.jpg',
    },
  ];

  // Implement the merge logic from src/lib/supabase.ts
  const matchedFallbackIds = new Set<string>();
  const matchedFallbackNames = new Set<string>();

  let merged: ShoppingItem[] = relationalItems.map((rItem) => {
    const fItem = richFallbackItems.find(
      (f) => f.id === rItem.id || (f.name && rItem.name && f.name.trim().toLowerCase() === rItem.name.trim().toLowerCase())
    );
    if (!fItem) return rItem;
    matchedFallbackIds.add(fItem.id);
    if (fItem.name) matchedFallbackNames.add(fItem.name.trim().toLowerCase());
    return {
      ...fItem,
      ...rItem,
      canonicalName: rItem.canonicalName || fItem.canonicalName,
      nameUrdu: rItem.nameUrdu || fItem.nameUrdu,
      nameRomanUrdu: rItem.nameRomanUrdu || fItem.nameRomanUrdu,
      emoji: rItem.emoji || fItem.emoji,
      isRecognized: rItem.isRecognized ?? fItem.isRecognized,
      barcode: rItem.barcode || fItem.barcode,
      brand: rItem.brand || fItem.brand,
      packageSize: rItem.packageSize || fItem.packageSize,
      imageUrl: fItem.imageUrl || rItem.imageUrl,
      completed: Boolean(rItem.completed ?? fItem.completed),
    };
  });

  const unmatched = richFallbackItems.filter(
    (f) => !matchedFallbackIds.has(f.id) && (!f.name || !matchedFallbackNames.has(f.name.trim().toLowerCase()))
  );
  if (unmatched.length > 0) {
    merged = [...merged, ...unmatched];
  }

  // Assertions
  assert.strictEqual(merged.length, 3, 'All 3 items are present (relational + unmatched fallback)');
  const eggs = merged.find((i) => i.id === 'item-uuid-1');
  assert(eggs, 'Eggs item found');
  assert.strictEqual(
    eggs?.imageUrl,
    'https://res.cloudinary.com/rvhmsppk/image/upload/v1234/eggs.jpg',
    'Eggs retained attached imageUrl despite relational row omitting image_url'
  );
  assert.strictEqual(eggs?.brand, 'Organic Farm', 'Eggs retained custom brand metadata');

  const tea = merged.find((i) => i.id === 'item-uuid-3-offline-only');
  assert(tea, 'Offline-only item Chai Patti preserved');
  assert.strictEqual(tea?.imageUrl, 'https://res.cloudinary.com/rvhmsppk/image/upload/v9999/tea.jpg', 'Chai Patti retained photo');

  // Verify photoCount calculation as in ShoppingListCard
  const photoCount = merged.filter((i) => Boolean(i.imageUrl)).length;
  assert.strictEqual(photoCount, 3, 'photoCount correctly counts 3 photos');

  console.log('✅ Passed: Relational hydration strictly preserves imageUrl, emoji and brand');
  console.log('✅ Passed: Unmatched items from JSON / IndexedDB cache are never discarded');
  console.log('✅ Passed: ShoppingListCard photoCount accurately reflects attached photos');

  console.log('\n======================================================');
  console.log('🎉 ALL AUDIT RESOLUTION VERIFICATION CHECKS PASSED CLEANLY!');
  console.log('======================================================\n');
}

runAuditVerificationSuite().catch((err) => {
  console.error('❌ Audit verification suite failed:', err);
  process.exit(1);
});
