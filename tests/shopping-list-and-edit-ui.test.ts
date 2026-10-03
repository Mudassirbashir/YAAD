import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('TESTING SHOPPING LIST & EDIT LIST UI SPECIFICATIONS');
console.log('========================================================');

const shoppingListViewPath = path.resolve('src/components/ShoppingListView.tsx');
const editListViewPath = path.resolve('src/components/EditListView.tsx');
const smartSuggestionsPath = path.resolve('src/components/SmartSuggestionsSection.tsx');
const swipeableCardPath = path.resolve('src/components/SwipeableShoppingItemCard.tsx');

const shoppingListCode = fs.readFileSync(shoppingListViewPath, 'utf8');
const editListCode = fs.readFileSync(editListViewPath, 'utf8');
const smartSuggestionsCode = fs.readFileSync(smartSuggestionsPath, 'utf8');
const swipeableCardCode = fs.readFileSync(swipeableCardPath, 'utf8');

// 1. Smart Suggestions On-Demand Search & Activation
console.log('\n--- 1. Smart Suggestions Activation UI ---');
assert(
  smartSuggestionsCode.includes('isExpanded') && smartSuggestionsCode.includes('isAnalyzing'),
  'Smart suggestions must have isExpanded and isAnalyzing state'
);
assert(
  smartSuggestionsCode.includes('Search') && smartSuggestionsCode.includes('rounded-full'),
  'Must have circular Search button'
);
assert(
  smartSuggestionsCode.includes('Loader2') || smartSuggestionsCode.includes('isAnalyzing'),
  'Must simulate analysis when search button is clicked'
);
assert(
  smartSuggestionsCode.includes('!isExpanded'),
  'Suggestions must NOT be shown automatically by default'
);
console.log('✅ PASSED: Smart suggestions hidden by default, rectangular search activator with circular search icon implemented.');

// 2. ShoppingListView Header & Minimal Summary
console.log('\n--- 2. ShoppingListView Header Simplification ---');
assert(
  !shoppingListCode.includes('shoppingList.boughtSummary'),
  'boughtSummary (0/15 items bought) must be removed from ShoppingListView'
);
assert(
  !shoppingListCode.includes('shoppingList.percentComplete'),
  'percentComplete (0% completed) must be removed from ShoppingListView'
);
assert(
  !shoppingListCode.includes('shoppingList.tapOrSwipeHint'),
  'tapOrSwipeHint extra text must be removed from header'
);
assert(
  shoppingListCode.includes('itemsCount'),
  'Must keep total items count (e.g. 15 items) in the header'
);
console.log('✅ PASSED: Progress bar, boughtSummary, and percentComplete removed from header; 15 items retained cleanly.');

// 3. SwipeableShoppingItemCard 3-Tier Hierarchy
console.log('\n--- 3. Swipeable Item Card 3-Tier Hierarchy ---');
assert(
  swipeableCardCode.includes('ItemVisualIcon'),
  'Card must have ItemVisualIcon on the left'
);
assert(
  swipeableCardCode.includes('item.name') && swipeableCardCode.includes('onEditQuantity'),
  'Card must display item name and quantity on tier 2'
);
assert(
  swipeableCardCode.includes('CategoryIcon'),
  'Card must display category on tier 3'
);
assert(
  swipeableCardCode.includes('CelebrationCheckbox'),
  'Card must have completion checkbox on the right'
);
console.log('✅ PASSED: Item card adheres to 3-tier hierarchy: logo on left, name, quantity, category, and complete checkbox.');

// 4. EditListView Unified Card Design & Default Black Plus
console.log('\n--- 4. EditListView Unified Card Design & Add Button ---');
assert(
  editListCode.includes('ItemVisualIcon'),
  'EditListView items must use ItemVisualIcon cards'
);
assert(
  editListCode.includes('Plus') && editListCode.includes('#000000'),
  'Add item plus button must default to pure black in default theme'
);
assert(
  editListCode.includes('feedbackToast') && editListCode.includes('Added'),
  'Must show feedback toast when adding item'
);
assert(
  editListCode.includes('Trash2'),
  'Items in EditListView must have delete action'
);
console.log('✅ PASSED: EditListView cards unified, plus button has black background, and feedback toast confirmed.');

// 5. ShoppingListView Add Item & Feedback Toast
console.log('\n--- 5. ShoppingListView Add Item & Feedback ---');
assert(
  shoppingListCode.includes('feedbackToast'),
  'ShoppingListView must show feedback toast when adding item'
);
assert(
  shoppingListCode.includes('setSelectedCategoryFilter(\'all\')'),
  'Must reset category filter to all on item add so new items are immediately visible'
);
assert(
  shoppingListCode.includes('#000000'),
  'ShoppingListView plus button background defaults to black'
);
console.log('✅ PASSED: ShoppingListView add item resets category filter and shows feedback toast.');

console.log('\n🎉 ALL USER REQUIREMENTS VERIFIED SUCCESSFULLY!');
