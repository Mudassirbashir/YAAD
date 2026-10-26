/**
 * Regression Test Suite for Catalog Image Lookup (2026-10-26)
 *
 * Bug: Admin catalog image upload/delete/status endpoints called
 * adminStore.getCatalogProductsAsync() with NO options. That method pages
 * at 50 items by default (ordered by canonical name), so it only ever
 * searched the first 50 of 89 catalog items. Items past position 50 —
 * e.g. veg_potato at #64 — 404'd as "Catalog product not found" even
 * though they exist, while early items (fruit_apple #2, baby_diapers #3)
 * uploaded fine.
 *
 * Fix: the endpoints now share findCatalogProductById(), which fetches
 * with limit 5000 so the lookup sees the whole catalog.
 *
 * Test: seeds 60 local products (local fallback is used when no live
 * Supabase is configured, as in this environment). saveCatalogProduct
 * unshifts, so the first-seeded product ends up LAST — beyond the first
 * 50 under the old default paging. The helper must still find it.
 * Leaves data/admin_data.json pristine via snapshot and restore.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { adminStore } from '../server/admin/store';
import { findCatalogProductById } from '../server/admin/routes';

async function runCatalogImageLookupSuite() {
  console.log('--- Running Catalog Image Lookup Test Suite ---');

  const adminDataPath = path.resolve(process.cwd(), 'data', 'admin_data.json');
  const initialDbSnapshot = JSON.stringify((adminStore as any).db);
  const initialFileContent = fs.existsSync(adminDataPath)
    ? fs.readFileSync(adminDataPath, 'utf8')
    : null;

  try {
    // Seed 60 local products. Unshift ordering puts lookup_seed_01 last,
    // i.e. beyond the first 50 under the old default paging.
    for (let i = 1; i <= 60; i++) {
      const n = String(i).padStart(2, '0');
      adminStore.saveCatalogProduct({
        id: `lookup_seed_${n}`,
        nameEn: `Lookup Seed ${n}`,
        category: 'Fresh Vegetables & Sabzi',
        unit: 'kg',
      } as any);
    }

    // If a live authoritative catalog is configured, local seeds are not
    // visible through the helper and this environment cannot prove the
    // regression — skip instead of failing on environment, not on code.
    const probe = await adminStore.getCatalogProductsAsync({ limit: 5000 });
    const seesLocalSeeds = probe.items.some((p: any) => p.id === 'lookup_seed_01');
    if (!seesLocalSeeds) {
      console.log('  ⚠️  Live authoritative catalog active; local seeds not visible — SKIPPING (environment, not code).');
      return;
    }

    // [Test 1] Item beyond the old first-50 page is found.
    const beyond = await findCatalogProductById('lookup_seed_01');
    assert.ok(beyond, 'findCatalogProductById must find lookup_seed_01 (beyond old 50-item page)');
    assert.strictEqual(beyond.id, 'lookup_seed_01');
    console.log('  ✅ Found item beyond old 50-item page: lookup_seed_01');

    // [Test 2] Early item still found.
    const early = await findCatalogProductById('lookup_seed_60');
    assert.ok(early && early.id === 'lookup_seed_60');
    console.log('  ✅ Found early item: lookup_seed_60');

    // [Test 3] Lookup by display name still works (p.name === id branch).
    const byName = await findCatalogProductById('Lookup Seed 30');
    assert.ok(byName && byName.id === 'lookup_seed_30');
    console.log('  ✅ Found item by display name: Lookup Seed 30');

    // [Test 4] Unknown id returns null (endpoints turn this into 404).
    const missing = await findCatalogProductById('does_not_exist_item');
    assert.strictEqual(missing, null);
    console.log('  ✅ Unknown id returns null');

    // [Test 5] Documents the original bug mechanism: the old bare call
    // (no options = 50-item page) does NOT contain lookup_seed_01.
    const oldStyle = await adminStore.getCatalogProductsAsync();
    assert.ok(
      !oldStyle.items.some((p: any) => p.id === 'lookup_seed_01'),
      'Bare getCatalogProductsAsync() (50-item page) must NOT contain lookup_seed_01 — this is the bug mechanism'
    );
    console.log('  ✅ Old bare call confirmed missing lookup_seed_01 (bug mechanism documented)');
  } finally {
    (adminStore as any).db = JSON.parse(initialDbSnapshot);
    if (initialFileContent !== null) {
      fs.writeFileSync(adminDataPath, initialFileContent, 'utf8');
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL Catalog Image Lookup TESTS PASSED');
  console.log('======================================================\n');
}

runCatalogImageLookupSuite().catch((err) => {
  console.error('❌ Catalog Image Lookup test failed:', err);
  process.exit(1);
});
