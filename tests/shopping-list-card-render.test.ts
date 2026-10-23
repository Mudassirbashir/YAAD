import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ShoppingListCard } from '../src/components/ShoppingListCard';
import { LanguageProvider } from '../src/context/LanguageContext';
import { ShoppingList } from '../src/types';

async function runShoppingListCardRenderSuite() {
  console.log('--- Running ShoppingListCard Server Render Test Suite ---');

  const listWithTwoPhotos: ShoppingList = {
    id: 'list-uuid-1234-5678',
    title: 'Weekend Grocery Run',
    createdAt: '2026-10-23T10:00:00Z',
    isCompleted: false,
    items: [
      {
        id: 'item-1',
        name: 'Eggs 12 Pack',
        quantity: 1,
        unit: 'pack',
        completed: false,
        imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v1/eggs.jpg',
      },
      {
        id: 'item-2',
        name: 'Whole Milk',
        quantity: 2,
        unit: 'l',
        completed: false,
        imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v2/milk.jpg',
      },
      {
        id: 'item-3',
        name: 'Bread',
        quantity: 1,
        unit: 'pack',
        completed: true,
      },
    ],
  };

  let renderedHtml = '';
  assert.doesNotThrow(() => {
    renderedHtml = renderToString(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(ShoppingListCard, {
          list: listWithTwoPhotos,
          onSelectList: () => {},
        })
      )
    );
  }, 'Rendering ShoppingListCard wrapped in LanguageProvider must not throw (prevents photoCount crashes)');

  // Verify that the rendered HTML contains the photo badge and thumbnail
  assert(
    renderedHtml.includes('2 photos'),
    `Rendered HTML must contain '2 photos' count badge. Got:\n${renderedHtml.slice(0, 500)}...`
  );

  // Verify that the first item thumbnail is present in HTML
  assert(
    renderedHtml.includes('https://res.cloudinary.com/rvhmsppk/image/upload/v1/eggs.jpg'),
    'Rendered HTML must contain the first item photo thumbnail src'
  );

  console.log('✅ Passed: ShoppingListCard renders cleanly with real LanguageProvider');
  console.log('✅ Passed: photoCount badge correctly renders "2 photos"');
  console.log('✅ Passed: First item photo thumbnail rendered in card');
}

runShoppingListCardRenderSuite().catch((err) => {
  console.error('❌ shopping-list-card-render test failed:', err);
  process.exit(1);
});
