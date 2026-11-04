/**
 * P3 — Never-blank search tests.
 *
 * Contract: a search must NEVER return a blank result set to a screen.
 * Ladder: direct hits -> token-relaxed -> popular fallback.
 * The MiniSearch recall tier must catch typos the precision tiers miss.
 */
import assert from 'node:assert';
import { defaultCatalogSearchEngine } from '../src/lib/catalog/searchEngine';
import { searchNeverBlank } from '../src/lib/catalog/neverBlank';

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    console.error(`  ❌ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

check('typo "seeb" finds apple (MiniSearch recall tier)', () => {
  const r = defaultCatalogSearchEngine.search('seeb', 6);
  assert.ok(r.length > 0, 'expected at least one result');
  assert.ok(r.some((x) => x.item.id === 'fruit_apple'), 'expected fruit_apple in results');
});

check('typo "tmatar" finds tomato', () => {
  const r = defaultCatalogSearchEngine.search('tmatar', 6);
  assert.ok(r.some((x) => x.item.id === 'veg_tomato'), 'expected veg_tomato in results');
});

check('urdu "سیب" finds apple', () => {
  const r = defaultCatalogSearchEngine.search('سیب', 6);
  assert.ok(r.some((x) => x.item.id === 'fruit_apple'), 'expected fruit_apple in results');
});

check('gibberish never returns blank (popular fallback)', () => {
  const nb = searchNeverBlank('xyzqqq', 5);
  assert.ok(nb.results.length > 0, 'expected fallback results, got blank');
  assert.strictEqual(nb.tier, 'popular');
});

check('empty query returns empty without crashing', () => {
  const nb = searchNeverBlank('   ', 5);
  assert.strictEqual(nb.results.length, 0);
});

check('normal query still hits direct tier first', () => {
  const nb = searchNeverBlank('apple', 5);
  assert.ok(nb.results.length > 0, 'expected results');
  assert.strictEqual(nb.tier, 'direct');
  assert.strictEqual(nb.results[0].item.id, 'fruit_apple');
});

console.log(`\nP3 never-blank: ${passed} checks passed`);
