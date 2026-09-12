/**
 * Automated Pakistani Grocery Quantity & Category Verification Test Suite
 *
 * Verifies exact household shopping terms:
 * - 1 pau / adha pau / sawa kilo / dedh kilo
 * - dazan / darjan / dozen
 * - packet / dabba / gucchi / tali / bottle
 * - Category assignments: Haldi -> Spices, Podina -> Herbs/Produce, etc.
 */

import { extractQuantityAndUnit } from '../src/lib/recognition/quantityExtractor';
import { recognizeItem } from '../src/lib/recognition/engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n--- Running Pakistani Grocery Quantities & Units Tests ---');

// 1. Traditional weight units (pau, sawa kilo, dedh kilo, adha pau)
console.log('\n1. Traditional Pakistani Weights & Fractions:');

const weightTests = [
  { input: '1 pau aloo', expectedQty: '1', expectedUnit: 'pao' },
  { input: 'adha pau mirch', expectedQty: '0.5', expectedUnit: 'pao' },
  { input: 'sawa kilo sugar', expectedQty: '1.25', expectedUnit: 'kg' },
  { input: 'dedh kilo chawal', expectedQty: '1.5', expectedUnit: 'kg' },
  { input: 'adha kilo tamatar', expectedQty: '0.5', expectedUnit: 'kg' },
];

for (const t of weightTests) {
  const result = extractQuantityAndUnit(t.input);
  assert(result.quantity === t.expectedQty, `'${t.input}' quantity -> expected '${t.expectedQty}', got '${result.quantity}'`);
  assert(result.unit === t.expectedUnit, `'${t.input}' unit -> expected '${t.expectedUnit}', got '${result.unit}'`);
}

// 2. Count & Packaging units (dazan, darjan, packet, dabba, gucchi, tali, bottle)
console.log('\n2. Packaging & Count Units (dazan, darjan, packet, dabba, gucchi, tali, bottle):');

const packageTests = [
  { input: '1 dazan anday', expectedQty: '1', expectedUnit: 'dozen' },
  { input: '2 darjan kele', expectedQty: '2', expectedUnit: 'dozen' },
  { input: '1 dozen eggs', expectedQty: '1', expectedUnit: 'dozen' },
  { input: '1 packet nimco', expectedQty: '1', expectedUnit: 'packet' },
  { input: '1 dabba dahi', expectedQty: '1', expectedUnit: 'box' },
  { input: '1 gucchi podina', expectedQty: '1', expectedUnit: 'bundle' },
  { input: '2 tali dhania', expectedQty: '2', expectedUnit: 'bundle' },
  { input: '1 bottle doodh', expectedQty: '1', expectedUnit: 'bottle' },
];

for (const t of packageTests) {
  const result = extractQuantityAndUnit(t.input);
  assert(result.quantity === t.expectedQty, `'${t.input}' quantity -> expected '${t.expectedQty}', got '${result.quantity}'`);
  assert(result.unit === t.expectedUnit, `'${t.input}' unit -> expected '${t.expectedUnit}', got '${result.unit}'`);
}

// 3. Category Verification in Pakistani Culinary Context
console.log('\n3. Pakistani Culinary Category Verification:');

const categoryTests = [
  { input: 'haldi', expectedCategory: 'spices', expectedName: 'haldi' },
  { input: 'turmeric', expectedCategory: 'spices', expectedName: 'haldi' },
  { input: 'podina', expectedCategory: 'herbs', expectedName: 'mint' },
  { input: 'dhania', expectedCategory: 'herbs', expectedName: 'coriander' },
  { input: 'doodh', expectedCategory: 'dairy', expectedName: 'milk' },
  { input: 'aloo', expectedCategory: 'vegetables', expectedName: 'potato' },
  { input: 'atta', expectedCategory: 'grocery', expectedName: 'flour' },
  { input: 'chawal', expectedCategory: 'rice', expectedName: 'rice' },
];

for (const t of categoryTests) {
  const recognized = recognizeItem(t.input);
  assert(
    recognized.categoryId === t.expectedCategory,
    `Category for '${t.input}' -> expected '${t.expectedCategory}', got '${recognized.categoryId}'`
  );
  assert(
    recognized.canonicalName.toLowerCase().includes(t.expectedName.toLowerCase()),
    `Canonical name for '${t.input}' -> contains '${t.expectedName}', got '${recognized.canonicalName}'`
  );
}

console.log('\n🎉 ALL PAKISTANI GROCERY UNIT & CATEGORY TESTS PASSED PERFECTLY!\n');
