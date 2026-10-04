/**
 * P0 REGRESSION TEST — "normalizeCategoryId is not defined"
 *
 * On 2026-10-04 the production build crashed on every /lists/:id page with
 * ReferenceError: normalizeCategoryId is not defined. Root cause: a stale
 * production deploy served a bundle where the shopping-list views called
 * normalizeCategoryId but the function definition never made it into the
 * bundle. The function itself lives in src/types.ts and is imported by all
 * call sites — this test guards that contract at three levels:
 *
 *  1. RUNTIME: the export actually exists and is callable (the exact crash).
 *  2. BEHAVIOR: legacy/alias ids normalize to canonical CategoryIds, so
 *     grouping + filtering in the shopping views can't silently break.
 *  3. STATIC: every component that calls it imports it from types —
 *     no reliance on an implicit global.
 *
 * Run: tsx tests/normalize-category-id.test.ts
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('TESTING normalizeCategoryId (P0 crash regression)');
console.log('========================================================');

// --- 1. RUNTIME: the function must exist and be callable ------------------
console.log('\n--- 1. Runtime export check ---');
const typesModule = await import('../src/types');
const { normalizeCategoryId, CATEGORIES_LIST } = typesModule;
assert.strictEqual(
  typeof normalizeCategoryId,
  'function',
  'P0: normalizeCategoryId must be a defined, exported function in src/types.ts'
);
console.log('✅ PASSED: normalizeCategoryId is defined and exported (no ReferenceError).');

// --- 2. BEHAVIOR: alias -> canonical mapping --------------------------------
console.log('\n--- 2. Normalization behavior ---');
const cases: Array<[string | null | undefined, string]> = [
  // legacy aliases / alternate spellings
  ['oils', 'oils'],
  ['oil', 'oils'],
  ['cooking_oil', 'oils'],
  ['ghee', 'oils'],
  ['grocery', 'cooking_essentials'],
  ['canned_food', 'cooking_essentials'],
  ['grains_staples', 'cooking_essentials'],
  ['perishables', 'vegetables'],
  ['fresh_produce', 'vegetables'],
  ['eggs', 'poultry'],
  ['baby', 'baby_care'],
  ['medicines', 'health'],
  ['herbal', 'herbs'],
  ['home', 'household'],
  ['hardware', 'household'],
  ['clothing', 'household'],
  ['pet_supplies', 'household'],
  // canonical ids pass through
  ['vegetables', 'vegetables'],
  ['dairy', 'dairy'],
  ['spices', 'spices'],
  // tolerance: case + whitespace
  ['  Oils  ', 'oils'],
  ['GROCERY', 'cooking_essentials'],
  // unknown / missing -> 'other'
  ['not_a_real_category', 'other'],
  ['', 'other'],
  [null, 'other'],
  [undefined, 'other'],
];
for (const [input, expected] of cases) {
  const actual = normalizeCategoryId(input);
  assert.strictEqual(
    actual,
    expected,
    `normalizeCategoryId(${JSON.stringify(input)}) => ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
  );
}
console.log(`✅ PASSED: ${cases.length} normalization cases map to the expected canonical ids.`);

// --- 3. VALIDITY: every output must be a real category -----------------------
console.log('\n--- 3. Output validity ---');
const validIds = new Set(CATEGORIES_LIST.map((c: { id: string }) => c.id));
const samples = ['oils', 'grocery', 'perishables', 'eggs', 'baby', 'medicines', 'herbal', 'home', 'weird_id_xyz', null];
for (const s of samples) {
  const out = normalizeCategoryId(s);
  assert(validIds.has(out), `Output ${JSON.stringify(out)} is not a known CategoryId`);
}
console.log('✅ PASSED: every output is a valid CategoryId present in CATEGORIES_LIST.');

// --- 4. GROUPING: the exact ShoppingListView logic must not throw -----------
console.log('\n--- 4. Grouping/filter simulation (ShoppingListView logic) ---');
const items = [
  { id: '1', categoryId: 'vegetables' },
  { id: '2', categoryId: 'perishables' },   // legacy alias -> vegetables
  { id: '3', categoryId: 'oils' },
  { id: '4', categoryId: 'ghee' },          // legacy alias -> oils
  { id: '5', categoryId: 'grocery' },       // legacy alias -> cooking_essentials
  { id: '6', categoryId: 'bogus_id' },      // unknown -> other
  { id: '7', categoryId: null },
];
// Mirrors src/components/ShoppingListView.tsx grouping lines verbatim:
const grouped = new Set(items.map((i) => normalizeCategoryId(i.categoryId)));
assert.deepStrictEqual(
  [...grouped].sort(),
  ['cooking_essentials', 'oils', 'other', 'vegetables'],
  'Items must group under canonical category ids without throwing'
);
const displayed = items.filter((i) => normalizeCategoryId(i.categoryId) === 'vegetables');
assert.strictEqual(displayed.length, 2, 'Category filter must match normalized ids');
console.log('✅ PASSED: grouping + filtering run without ReferenceError and group correctly.');

// --- 5. STATIC: every caller imports it from types ---------------------------
console.log('\n--- 5. Import-site sweep ---');
const callers: Array<[string, string]> = [
  ['src/components/ShoppingListView.tsx', '../types'],
  ['src/components/EditListView.tsx', '../types'],
  ['src/components/AddItemsView.tsx', '../types'],
  ['src/components/SwipeableShoppingItemCard.tsx', '../types'],
  ['src/components/rashan/RashanListPage.tsx', '../../types'],
];
for (const [file, expectedPath] of callers) {
  const code = fs.readFileSync(path.resolve(file), 'utf8');
  const importRe = new RegExp(`import\\s*{[^}]*normalizeCategoryId[^}]*}\\s*from\\s*['"]${expectedPath.replace(/\//g, '\\/')}['"]`);
  assert(
    importRe.test(code),
    `P0: ${file} calls normalizeCategoryId but does not import it from '${expectedPath}'`
  );
}
console.log(`✅ PASSED: all ${callers.length} calling components explicitly import normalizeCategoryId.`);

console.log('\n========================================================');
console.log('🎉 ALL normalizeCategoryId P0 REGRESSION TESTS PASSED');
console.log('========================================================');
