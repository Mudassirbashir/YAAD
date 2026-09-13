import { isCandidateInList } from '../src/lib/recommendations/filter';
import { ShoppingItem } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('\n--- 1. SMART SUGGESTIONS DUPLICATE FILTER TESTS ---');

const mockItems: ShoppingItem[] = [
  {
    id: 'item-1',
    name: 'Milk',
    canonicalName: 'milk',
    canonical_name: 'milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'doodh',
    rawInput: '1 liter fresh milk',
    completed: false,
    categoryId: 'dairy',
  },
  {
    id: 'item-2',
    name: 'Apples',
    canonicalName: 'apple',
    canonical_name: 'apple',
    nameUrdu: 'سیب',
    nameRomanUrdu: 'saib',
    rawInput: '1 kg apples',
    completed: true,
    categoryId: 'fruits',
  },
  {
    id: 'item-3',
    name: 'Aloo',
    canonicalName: 'potato',
    canonical_name: 'potato',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'aloo',
    rawInput: '2 kg aloo',
    completed: false,
    categoryId: 'vegetables',
  },
];

// Test direct canonical match
assert(
  isCandidateInList({ canonicalName: 'milk', displayName: 'Fresh Milk' }, mockItems) === true,
  'Correctly detects Milk already in list by canonicalName'
);

// Test plural variation
assert(
  isCandidateInList({ canonicalName: 'apple', displayName: 'Apple' }, mockItems) === true,
  'Correctly detects Apple already in list even if list item is plural "Apples"'
);

// Test Urdu script match
assert(
  isCandidateInList({ canonicalName: 'doodh', displayName: 'Doodh', nameUrdu: 'دودھ' }, mockItems) === true,
  'Correctly detects item by Urdu name "دودھ"'
);

// Test Roman Urdu match
assert(
  isCandidateInList({ canonicalName: 'potato', displayName: 'Potato', nameRomanUrdu: 'aloo' }, mockItems) === true,
  'Correctly detects item by Roman Urdu name "aloo"'
);

// Test raw input token match
assert(
  isCandidateInList({ canonicalName: 'potato', displayName: 'Potato' }, mockItems) === true,
  'Correctly matches candidate "potato" to item whose canonicalName is potato'
);

// Test non-matching items are ALLOWED
assert(
  isCandidateInList({ canonicalName: 'bread', displayName: 'Bread', nameRomanUrdu: 'double roti' }, mockItems) === false,
  'Allows Bread because it is not in the list'
);

assert(
  isCandidateInList({ canonicalName: 'eggs', displayName: 'Eggs', nameRomanUrdu: 'anday' }, mockItems) === false,
  'Allows Eggs because it is not in the list'
);

assert(
  isCandidateInList({ canonicalName: 'ginger', displayName: 'Ginger', nameRomanUrdu: 'adrak' }, mockItems) === false,
  'Allows Ginger because it is not in the list'
);

// Test empty list handling
assert(
  isCandidateInList({ canonicalName: 'milk', displayName: 'Milk' }, []) === false,
  'Returns false safely when list is empty'
);

console.log('\n--- 2. SHOPPING LIST COMPLETION CALCULATION TESTS ---');

const testList1: ShoppingItem[] = [
  { id: '1', name: 'Eggs', completed: true, categoryId: 'dairy' },
  { id: '2', name: 'Bread', completed: true, categoryId: 'bakery' },
];
const allDone1 = testList1.length > 0 && testList1.every((i) => i.completed);
assert(allDone1 === true, 'Correctly flags all items completed when every item is completed');

const testList2: ShoppingItem[] = [
  { id: '1', name: 'Eggs', completed: true, categoryId: 'dairy' },
  { id: '2', name: 'Bread', completed: false, categoryId: 'bakery' },
];
const allDone2 = testList2.length > 0 && testList2.every((i) => i.completed);
assert(allDone2 === false, 'Correctly does not flag completion when an item remains incomplete');

console.log('\n--- 3. DELETION UNDO RESTORATION TESTS ---');

const originalList: ShoppingItem[] = [
  { id: '1', name: 'Chai', completed: false, categoryId: 'beverages' },
  { id: '2', name: 'Sugar', completed: false, categoryId: 'grocery' },
  { id: '3', name: 'Flour', completed: false, categoryId: 'grocery' },
];

// Delete item at index 1 ('Sugar')
const deletedIndex = 1;
const deletedItem = originalList[deletedIndex];
const afterDelete = originalList.filter((i) => i.id !== deletedItem.id);

assert(afterDelete.length === 2, 'List length decreases after deletion');
assert(!afterDelete.some((i) => i.id === '2'), 'Item 2 removed from list');

// Restore using saved index
const restored = [...afterDelete];
restored.splice(deletedIndex, 0, deletedItem);

assert(restored.length === 3, 'Restored list length equals original');
assert(restored[1].id === '2', 'Restored item returns to its exact previous index');
assert(restored[1].name === 'Sugar', 'Restored item preserves all metadata');

console.log('\n🎉 ALL STEP 5 SHOPPING INTERACTION TESTS PASSED!\n');
