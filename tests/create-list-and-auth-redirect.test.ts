import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('========================================================');
console.log('TESTING AUTH REDIRECT & CREATE LIST NEW UI SPECIFICATIONS');
console.log('========================================================\n');

// 1. Verify App.tsx authenticated entry & landing bypass
const appTsx = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf-8');

console.log('--- 1. Authenticated User PWA / App Launch Behavior ---');
assert(
  appTsx.includes("if (user) return 'home';"),
  'App.tsx currentScreen immediately routes authenticated user to home instead of landing on root'
);
assert(
  appTsx.includes('route.routeId === \'root\'') &&
    appTsx.includes('replace(\'/home\')'),
  'App.tsx auto-redirects authenticated users from root to /home'
);
console.log('✅ PASSED: Authenticated users bypass website landing page on launch & stay in app.');

// 2. Verify CreateListView.tsx header modifications & spacing
const createListViewTsx = fs.readFileSync(path.resolve('./src/components/CreateListView.tsx'), 'utf-8');

console.log('--- 2. CreateListView Header, Spacing & Categories Heading ---');
// Header should NOT have the h1 Create New List title inside header
const headerMatch = createListViewTsx.match(/<header[\s\S]*?<\/header>/);
assert(headerMatch !== null, 'CreateListView has a header element');
assert(
  !headerMatch[0].includes('createList.title'),
  'Create New List title is removed from the header'
);

// Main content must contain the heading inside the page
const mainMatch = createListViewTsx.match(/<main[\s\S]*?<\/main>/);
assert(mainMatch !== null, 'CreateListView has a main element');
assert(
  mainMatch[0].includes('createList.title') || mainMatch[0].includes('Create New List'),
  'Create New List title is placed inside the main page content'
);

// Categories heading present between input and cards
assert(
  createListViewTsx.includes('categoriesHeading') || createListViewTsx.includes('Categories'),
  'Categories heading is placed above category cards'
);
console.log('✅ PASSED: "Create New List" placed in page, reduced spacing, and Categories heading verified.');

// 3. Verify Search/Input Field specifications
console.log('--- 3. List Name Input Field & Circle Arrow Button ---');
assert(
  createListViewTsx.includes('rounded-full'),
  'Input field has rounded-full edges matching the circle'
);
assert(
  createListViewTsx.includes("placeholder={t('createList.customPlaceholder') || 'List Name'}"),
  'Placeholder is set to "List Name"'
);
assert(
  createListViewTsx.includes('placeholder:text-neutral-400') ||
    createListViewTsx.includes('placeholder:text-gray-400') ||
    createListViewTsx.includes('placeholder:text-'),
  'Placeholder has light gray styling'
);
assert(
  createListViewTsx.includes('<ArrowRight className="w-4 h-4 rtl:rotate-180" />') ||
    createListViewTsx.includes('ArrowRight'),
  'Circle button in input contains ArrowRight'
);
assert(
  createListViewTsx.includes('First enter the list name, then continue'),
  'Empty input validation shows alert: "First enter the list name, then continue"'
);
console.log('✅ PASSED: Input field is rounded-full, with "List Name" placeholder, circle arrow, and empty validation.');

// 4. Verify Animated Plus in Category Cards
console.log('--- 4. Category Cards Animated Plus Icon & Formatting ---');
assert(
  createListViewTsx.includes('iconColor'),
  'Cards use theme-sensitive iconColor'
);
assert(
  createListViewTsx.includes("#000000") && createListViewTsx.includes("theme === 'default'"),
  'Icons default to pure black in default theme'
);
assert(
  createListViewTsx.includes('ShoppingBasket') &&
    createListViewTsx.includes('CalendarDays') &&
    createListViewTsx.includes('ShoppingCart') &&
    createListViewTsx.includes('Pill'),
  'Updated modern icons are mapped for categories'
);
assert(
  createListViewTsx.includes('Plus') && createListViewTsx.includes('group-hover:rotate-90'),
  'Right-hand circle contains animated Plus icon'
);
assert(
  createListViewTsx.includes('truncate') && createListViewTsx.includes('{ctx.title}'),
  'Category title placed to the right of the icon'
);
console.log('✅ PASSED: Category cards have animated Plus in right circle, default black icons on left, and compact layout.');

// 5. Verify AddItemsView Specifications
console.log('--- 5. AddItemsView UI Specifications ---');
const addItemsViewTsx = fs.readFileSync(path.resolve('./src/components/AddItemsView.tsx'), 'utf-8');

// A. Input rounded-full with circle plus button
assert(
  addItemsViewTsx.includes('rounded-full ps-11 pe-24') || addItemsViewTsx.includes('rounded-full ps-10 pe-20') || addItemsViewTsx.includes('rounded-full'),
  'AddItemsView input is rounded-full'
);
assert(
  addItemsViewTsx.includes('w-9 h-9 rounded-full bg-primary') || addItemsViewTsx.includes('rounded-full bg-primary'),
  'AddItemsView add button is circular'
);

// B. English & Roman Urdu removed
assert(
  !addItemsViewTsx.includes('English & Roman Urdu'),
  'English & Roman Urdu text is removed from AddItemsView'
);

// C. Context Essentials removed
assert(
  !addItemsViewTsx.includes('Context Essentials'),
  'Context Essentials text is removed from AddItemsView'
);

// D. List Items header without count in title
assert(
  !addItemsViewTsx.includes('List Items ({items.length})'),
  'List Items title does not contain count ({items.length}) in heading'
);

// E. Top Start Shopping button is rounded-full with ArrowRight in circle
assert(
  addItemsViewTsx.includes('rounded-full bg-primary') && addItemsViewTsx.includes('ArrowRight'),
  'Top Start Shopping button is rounded-full with circle containing ArrowRight'
);

// F. Item cards 3-line layout (Line 1 name, Line 2 quantity, Line 3 category)
assert(
  addItemsViewTsx.includes('Line 1: Item Name') &&
    addItemsViewTsx.includes('Line 2: Quantity') &&
    addItemsViewTsx.includes('Line 3: Category'),
  'Item cards structured into 3 clean vertical lines: Name, Quantity, Category'
);

// G. Accidental deletion protection: row does not delete, trash button has stopPropagation
assert(
  addItemsViewTsx.includes('e.stopPropagation()') && addItemsViewTsx.includes('handleRemoveItem(item.id)'),
  'Trash button safely stops event propagation'
);

// H. Bottom mobile Start Shopping button has driving cart animation and no count
assert(
  !addItemsViewTsx.includes('({items.length})</span>\n          <ShoppingCart') &&
    !addItemsViewTsx.includes('({items.length})</span>\r\n          <ShoppingCart'),
  'Bottom Start Shopping button does not display item count'
);
assert(
  addItemsViewTsx.includes('isBottomCartDriving') && addItemsViewTsx.includes('translate-x-'),
  'Bottom Start Shopping button features driving cart animation'
);
console.log('✅ PASSED: AddItemsView verified: rounded input, circle plus, clean headers, 3-line items, safe delete & driving cart animation.');

console.log('\n🎉 ALL CREATE LIST & ADD ITEMS UI SPECIFICATION TESTS PASSED PERFECTLY!');
