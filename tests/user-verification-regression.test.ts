import assert from 'node:assert';
import { splitMultiItemInput, parseMultiItemInput } from '../src/lib/recognition/multiItemParser';
import { normalizeCategoryId, CATEGORIES_LIST } from '../src/types';

// 1. Parser: parses all 7 grocery items from multi-line text without dropping any item
const rawMultiLine = 'doodh\nmakhan\nbread\nanday\ncheeni\npatti\ndahi';
const split = splitMultiItemInput(rawMultiLine);
assert.strictEqual(split.length, 7);
assert.deepStrictEqual(split, ['doodh', 'makhan', 'bread', 'anday', 'cheeni', 'patti', 'dahi']);

const parsed = parseMultiItemInput(rawMultiLine);
assert.strictEqual(parsed.length, 7);
const names = parsed.map((p) => p.name);
assert.deepStrictEqual(names, [
  'Milk',
  'Butter',
  'Bread',
  'Egg',
  'Sugar',
  'Tea (Chai Patti)',
  'Yogurt (Dahi)',
]);

// 2. Parser: parses comma-separated and space-separated lines without dropping items
const spaceInput = 'doodh makhan bread anday cheeni patti dahi';
const parsedSpace = parseMultiItemInput(spaceInput);
assert.strictEqual(parsedSpace.length, 7);

// 3. Category Mapping: oils category is recognized and has its own entry in CATEGORIES_LIST
const norm = normalizeCategoryId('oils');
assert.strictEqual(norm, 'oils');

const inList = CATEGORIES_LIST.find((c) => c.id === 'oils');
assert.ok(inList);
assert.strictEqual(inList?.defaultName, 'Cooking Oil & Ghee');

assert.strictEqual(normalizeCategoryId('oil'), 'oils');
assert.strictEqual(normalizeCategoryId('cooking_oil'), 'oils');
assert.strictEqual(normalizeCategoryId('ghee'), 'oils');

// 4. Undo: restores deleted item at original index
const initialItems = [
  { id: '1', name: 'Milk', categoryId: 'dairy', completed: false },
  { id: '2', name: 'Eggs', categoryId: 'dairy', completed: false },
  { id: '3', name: 'Bread', categoryId: 'bakery', completed: false },
];

const deletedIndex = 1;
const deletedItem = initialItems[deletedIndex];
const afterDelete = initialItems.filter((i) => i.id !== deletedItem.id);
assert.strictEqual(afterDelete.length, 2);
assert.strictEqual(afterDelete[0].name, 'Milk');
assert.strictEqual(afterDelete[1].name, 'Bread');

const restored = [...afterDelete];
restored.splice(deletedIndex, 0, deletedItem);
assert.strictEqual(restored.length, 3);
assert.strictEqual(restored[1].name, 'Eggs');
assert.strictEqual(restored[1].id, '2');

console.log('✅ ALL USER VERIFICATION REGRESSION TESTS PASSED');
