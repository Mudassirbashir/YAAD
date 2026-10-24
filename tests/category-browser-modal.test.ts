/**
 * Regression Test Suite for CategoryBrowserModal (Bug 2 - Home Browse Categories Catalog Photos)
 *
 * Verifies:
 * 1. Rendering CategoryBrowserModal with catalog service stubbed to hold an image for one item (e.g. fruit_apple)
 * 2. Grid renders a real <img> element (photo) for that item via resolveVisual + ItemVisualIcon
 * 3. Items with no catalog image (e.g. Banana) continue to render the EssentialItemVisual vector illustration
 */

import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CategoryBrowserModal } from '../src/components/CategoryBrowserModal';
import { LanguageProvider } from '../src/context/LanguageContext';
import { supabaseCatalog, mergeMasterCatalogItems } from '../src/lib/catalog/supabaseCatalog';
import { INITIAL_MASTER_CATALOG } from '../src/lib/catalog/items';

async function runCategoryBrowserModalSuite() {
  console.log('--- Running CategoryBrowserModal Catalog Visual Test Suite (Bug 2) ---');

  // 1. Stub catalog service to hold an Admin-uploaded catalog image for fruit_apple
  const originalCatalogItems = (supabaseCatalog as any).items;

  try {
    const mockRemoteRow = {
      id: 'fruit_apple',
      canonical_name: 'Apple',
      english_name: 'Apple',
      category_id: 'fruits',
      image_url: 'https://res.cloudinary.com/rvhmsppk/image/upload/v1234/yaad-catalog/fruit_apple.jpg',
      cloudinary_public_id: 'yaad-catalog/fruit_apple',
    };

    const mergedWithAppleImage = mergeMasterCatalogItems(INITIAL_MASTER_CATALOG, [mockRemoteRow]);
    (supabaseCatalog as any).items = mergedWithAppleImage;

    // 2. Render CategoryBrowserModal open wrapped in LanguageProvider
    let renderedHtml = '';
    assert.doesNotThrow(() => {
      renderedHtml = renderToString(
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(CategoryBrowserModal, {
            isOpen: true,
            onClose: () => {},
            onAddItem: () => {},
          })
        )
      );
    }, 'Rendering CategoryBrowserModal wrapped in LanguageProvider must succeed');

    // 3. Verify that Apple renders an <img> tag pointing to the catalog delivery URL
    const expectedAppleImageDeliveryUrl =
      'https://res.cloudinary.com/rvhmsppk/image/upload/c_pad,b_white,w_96,h_96,f_auto,q_auto/yaad-catalog/fruit_apple';

    assert(
      renderedHtml.includes(expectedAppleImageDeliveryUrl),
      `Rendered grid must include an <img> with Apple's catalog photo delivery URL. Expected URL: ${expectedAppleImageDeliveryUrl}`
    );

    assert(
      renderedHtml.includes('alt="Apple"'),
      'Rendered grid must include <img> with alt="Apple"'
    );
    console.log('  ✅ CategoryBrowserModal renders <img> catalog photo for Apple');

    // 4. Verify that an item without an admin catalog image (e.g. Banana) does NOT render a photo <img>
    // and instead falls back to EssentialItemVisual illustration
    assert(
      !renderedHtml.includes('yaad-catalog/fruit_banana'),
      'Item without catalog image must not have a catalog image delivery URL'
    );

    assert(
      renderedHtml.includes('aria-label="Banana illustration"'),
      'Item without catalog image (Banana) must fall back to EssentialItemVisual illustration ("Banana illustration")'
    );
    console.log('  ✅ Item with no catalog photo (Banana) gracefully preserves EssentialItemVisual illustration');

  } finally {
    // Restore original catalog items to prevent test pollution
    (supabaseCatalog as any).items = originalCatalogItems;
  }

  console.log('\n======================================================');
  console.log('🎉 ALL CategoryBrowserModal (Bug 2) TESTS PASSED');
  console.log('======================================================');
}

runCategoryBrowserModalSuite().catch((err) => {
  console.error('❌ CategoryBrowserModal test failed:', err);
  process.exit(1);
});
