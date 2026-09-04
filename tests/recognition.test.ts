import { recognizeItem, parseShoppingItem } from '../src/lib/recognition/engine';
import { defaultCatalogSearchEngine } from '../src/lib/catalog/searchEngine';
import { saveUserCustomAlias, clearUserCustomAliases } from '../src/lib/recognition/userAliases';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n--- 1. Multilingual & Spelling Variations Test ---');

const variations: Array<{ input: string; expectedCanonical: string; expectedCategory: string }> = [
  // Potato variations
  { input: 'potato', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },
  { input: 'aloo', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },
  { input: 'alo', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },
  { input: 'alu', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },
  { input: 'aaloo', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },
  { input: 'آلو', expectedCanonical: 'Potato', expectedCategory: 'vegetables' },

  // Onion variations
  { input: 'onion', expectedCanonical: 'Onion', expectedCategory: 'vegetables' },
  { input: 'pyaaz', expectedCanonical: 'Onion', expectedCategory: 'vegetables' },
  { input: 'pyaz', expectedCanonical: 'Onion', expectedCategory: 'vegetables' },

  // Tomato variations
  { input: 'tomato', expectedCanonical: 'Tomato', expectedCategory: 'vegetables' },
  { input: 'tamatar', expectedCanonical: 'Tomato', expectedCategory: 'vegetables' },

  // Green Chilli variations
  { input: 'hari mirch', expectedCanonical: 'Green Chilli', expectedCategory: 'vegetables' },
  { input: 'green chili', expectedCanonical: 'Green Chilli', expectedCategory: 'vegetables' },
  { input: 'green chilli', expectedCanonical: 'Green Chilli', expectedCategory: 'vegetables' },

  // Fitkari / Phitkari / Alum variations
  { input: 'fitkari', expectedCanonical: 'Alum (Phitkari)', expectedCategory: 'health' },
  { input: 'phatkari', expectedCanonical: 'Alum (Phitkari)', expectedCategory: 'health' },
  { input: 'phitkari', expectedCanonical: 'Alum (Phitkari)', expectedCategory: 'health' },

  // Cinnamon variations (spice distinction)
  { input: 'cinnamon', expectedCanonical: 'Cinnamon (Dar Cheeni)', expectedCategory: 'spices' },
  { input: 'darchini', expectedCanonical: 'Cinnamon (Dar Cheeni)', expectedCategory: 'spices' },
  { input: 'dar chini', expectedCanonical: 'Cinnamon (Dar Cheeni)', expectedCategory: 'spices' },

  // Herbs vs Spices distinction
  { input: 'dhania', expectedCanonical: 'Coriander (Dhania)', expectedCategory: 'herbs' },
  { input: 'podina', expectedCanonical: 'Mint (Podina)', expectedCategory: 'herbs' },
];

for (const test of variations) {
  const result = recognizeItem(test.input);
  assert(
    result.canonicalName.toLowerCase().includes(test.expectedCanonical.toLowerCase()),
    `Recognition '${test.input}' -> expected canonical '${test.expectedCanonical}', got '${result.canonicalName}'`
  );
  assert(
    result.categoryId === test.expectedCategory,
    `Category '${test.input}' -> expected '${test.expectedCategory}', got '${result.categoryId}'`
  );
}

console.log('\n--- 2. Quantity & Unit Extraction Test ---');

const quantityTests = [
  { input: '2 kg tamatar', expectedQty: '2', expectedUnit: 'kg', expectedName: 'Tomato' },
  { input: 'bring 1 dozen anda', expectedQty: '1', expectedUnit: 'dozen', expectedName: 'Egg' },
  { input: 'adha kilo aloo', expectedQty: '0.5', expectedUnit: 'kg', expectedName: 'Potato' },
  { input: '500g darchini', expectedQty: '500', expectedUnit: 'g', expectedName: 'Cinnamon' },
];

for (const test of quantityTests) {
  const parsed = parseShoppingItem(test.input);
  assert(parsed.quantity === test.expectedQty, `Quantity for '${test.input}': expected '${test.expectedQty}', got '${parsed.quantity}'`);
  assert(parsed.unit === test.expectedUnit, `Unit for '${test.input}': expected '${test.expectedUnit}', got '${parsed.unit}'`);
  assert(
    (parsed.canonicalName || parsed.name).toLowerCase().includes(test.expectedName.toLowerCase()),
    `Name for '${test.input}': expected '${test.expectedName}', got '${parsed.canonicalName || parsed.name}'`
  );
}

console.log('\n--- 3. Catalog Search Engine Prefix & Personalization Test ---');

// Prefix matching
const prefixTests = [
  { query: 'hari mir', expectedMatch: 'Green' },
  { query: 'phat', expectedMatch: 'Alum' },
  { query: 'darchin', expectedMatch: 'Cinnamon' },
];

for (const test of prefixTests) {
  const results = defaultCatalogSearchEngine.search(test.query, 3);
  assert(results.length > 0, `Search results for prefix '${test.query}' should not be empty`);
  assert(
    results[0].displayName.toLowerCase().includes(test.expectedMatch.toLowerCase()),
    `Search for prefix '${test.query}' top result '${results[0].displayName}' contains '${test.expectedMatch}'`
  );
}

// User-learned custom alias test
clearUserCustomAliases();
saveUserCustomAlias('kheera desi', {
  canonicalName: 'Cucumber',
  categoryId: 'vegetables',
});

const learnedResults = defaultCatalogSearchEngine.search('kheera desi', 2);
assert(learnedResults.length > 0, `Learned alias 'kheera desi' returns results`);
assert(learnedResults[0].isUserLearned === true, `Learned result has isUserLearned: true`);
assert(learnedResults[0].displayName === 'Cucumber', `Learned result displayName is 'Cucumber'`);

console.log('\n🎉 ALL RECOGNITION & CATALOG TESTS PASSED SUCCESSFULLY!\n');
