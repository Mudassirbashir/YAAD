/**
 * Test Suite: Catalog Visual Precedence & Sync Re-render
 *
 * Verifies:
 * 1. resolveVisual precedence:
 *    - User photo > Catalog library image > Emoji fallback
 *    - Catalog image present -> photo URL (Cloudinary delivery URL)
 *    - Image missing -> emoji fallback
 * 2. Catalog sync-complete version bump & instant search suggestions photo resolution:
 *    - Version increments upon sync completion (no polling)
 *    - Subscribing listeners are invoked immediately
 *    - Searching "aaloo" after sync resolves Potato photo without adding to list
 * 3. Frequent Essentials tile rendering:
 *    - Item with catalog image (Potato) renders <img> tag
 *    - Item without catalog image (Tomato) renders emoji fallback (🍅)
 */

import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { resolveVisual } from '../src/lib/catalog/visualResolver';
import {
  supabaseCatalog,
  mergeMasterCatalogItems,
  getCatalogImageForItem,
} from '../src/lib/catalog/supabaseCatalog';
import { INITIAL_MASTER_CATALOG } from '../src/lib/catalog/items';
import { defaultCatalogSearchEngine } from '../src/lib/catalog/searchEngine';
import {
  FrequentEssentialTileVisual,
  FrequentEssentialsSection,
} from '../src/components/home/FrequentEssentialsSection';
import { LanguageProvider } from '../src/context/LanguageContext';
import { EssentialDisplayItem } from '../src/lib/recommendations/popularEssentials';
import { buildCatalogImageUrl } from '../src/utils/cloudinary';

async function runCatalogVisualPrecedenceAndSyncSuite() {
  console.log('\n--- Running Catalog Visual Precedence & Sync Re-render Test Suite ---');

  const snapshotItems = [...supabaseCatalog.getItems()];
  const initialVersion = supabaseCatalog.getVersion();

  try {
    // =========================================================================
    // Test 1: resolveVisual Precedence
    // =========================================================================
    console.log('\n[Test 1] Testing resolveVisual Precedence (User photo > Catalog image > Emoji fallback)...');

    // 1a. User's own photo on list item
    const itemWithUserPhoto = {
      id: 'item_user_1',
      name: 'Custom Organic Milk',
      canonicalName: 'Milk',
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v999/user_upload_milk.jpg',
    };
    const visualUserPhoto = resolveVisual(itemWithUserPhoto);
    assert.strictEqual(visualUserPhoto.type, 'photo', 'User photo must have type "photo"');
    assert.strictEqual(
      visualUserPhoto.url,
      itemWithUserPhoto.imageUrl,
      'User photo must deliver original uploaded photo URL'
    );
    console.log('  ✅ 1a: User photo takes top precedence');

    // 1b. Item with catalog image directly on item
    const itemWithCatalogImage = {
      id: 'veg_potato',
      canonical_name: 'Potato',
      english_name: 'Potato',
      cloudinaryPublicId: 'yaad-catalog/veg_potato',
    };
    const visualCatalog = resolveVisual(itemWithCatalogImage);
    assert.strictEqual(visualCatalog.type, 'catalog', 'Catalog item must have type "catalog"');
    const expectedPotatoCloudinaryUrl = buildCatalogImageUrl('yaad-catalog/veg_potato', 'icon');
    assert.strictEqual(
      visualCatalog.url,
      expectedPotatoCloudinaryUrl,
      'Catalog item must deliver transformed Cloudinary icon URL'
    );
    console.log('  ✅ 1b: Catalog library image delivers Cloudinary delivery URL');

    // 1c. User photo beats catalog image when both exist on the same item
    const itemWithBoth = {
      id: 'veg_potato',
      canonicalName: 'Potato',
      cloudinaryPublicId: 'yaad-catalog/veg_potato',
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v555/my_garden_potatoes.jpg',
    };
    const visualBoth = resolveVisual(itemWithBoth);
    assert.strictEqual(visualBoth.type, 'photo', 'When both exist, user photo ALWAYS wins');
    assert.strictEqual(
      visualBoth.url,
      itemWithBoth.imageUrl,
      'User photo URL must be selected over catalog image'
    );
    console.log('  ✅ 1c: User photo strictly wins over catalog image when both exist');

    // 1d. Item with no image anywhere falls back to emoji
    const itemWithoutImage = {
      id: 'veg_tomato',
      canonicalName: 'Tomato',
      name: 'Tomato',
      category: 'vegetables',
    };
    const visualNoImage = resolveVisual(itemWithoutImage);
    assert.strictEqual(visualNoImage.type, 'emoji', 'Item without image must return type "emoji"');
    assert.strictEqual(visualNoImage.url, undefined, 'Emoji fallback must have no URL');
    console.log('  ✅ 1d: Item without image correctly returns emoji fallback');

    // =========================================================================
    // Test 2: Catalog Sync Version Bump & Instant Search Suggestion Resolution
    // =========================================================================
    console.log('\n[Test 2] Testing Catalog Sync Version Bump & Search Suggestion Resolution...');

    // Reset catalog items to un-synced state (no potato image)
    const rawStatic = INITIAL_MASTER_CATALOG.map((it) => ({
      ...it,
      imageUrl: undefined,
      cloudinaryPublicId: undefined,
    }));
    supabaseCatalog.setItems(rawStatic);

    // Initial search for "aaloo": Potato is found in catalog, but has NO image
    const initialSearchResults = defaultCatalogSearchEngine.search('aaloo', 5);
    assert.ok(initialSearchResults.length > 0, 'Search for "aaloo" must find Potato');
    const initialPotatoSug = initialSearchResults.find((s) => s.item.canonical_name === 'Potato');
    assert.ok(initialPotatoSug, 'Search results must contain Potato');
    const initialVisual = resolveVisual(initialPotatoSug.item);
    assert.strictEqual(
      initialVisual.type,
      'emoji',
      'Before sync, Potato has no image and resolves to emoji'
    );

    // Track subscriber notification & version bump
    const versionBeforeSync = supabaseCatalog.getVersion();
    let subscriberFired = false;
    const unsubscribe = supabaseCatalog.subscribe(() => {
      subscriberFired = true;
    });

    // Simulate Supabase sync completion with remote rows including veg_potato
    const remoteRows = [
      {
        id: 'veg_potato',
        canonical_name: 'Potato',
        english_name: 'Potato',
        urdu_name: 'آلو',
        roman_urdu_names: ['Aloo'],
        category_id: 'vegetables',
        image_url: 'https://res.cloudinary.com/rvhmsppk/image/upload/v1234/yaad-catalog/veg_potato.jpg',
        cloudinary_public_id: 'yaad-catalog/veg_potato',
      },
    ];
    const syncedItems = mergeMasterCatalogItems(INITIAL_MASTER_CATALOG, remoteRows);
    supabaseCatalog.setItems(syncedItems);

    unsubscribe();

    assert.ok(subscriberFired, 'Subscribers must be notified when catalog sync completes');
    assert.ok(
      supabaseCatalog.getVersion() > versionBeforeSync,
      `Catalog version must bump on sync. Before: ${versionBeforeSync}, After: ${supabaseCatalog.getVersion()}`
    );
    console.log(`  ✅ Catalog version bumped from ${versionBeforeSync} to ${supabaseCatalog.getVersion()}`);

    // Search for "aaloo" again after sync: Potato suggestion NOW has Cloudinary photo WITHOUT adding to list!
    const postSyncSearchResults = defaultCatalogSearchEngine.search('aaloo', 5);
    const postSyncPotatoSug = postSyncSearchResults.find((s) => s.item.canonical_name === 'Potato');
    assert.ok(postSyncPotatoSug, 'Post-sync search must contain Potato');

    const postSyncVisual = resolveVisual(postSyncPotatoSug.item);
    assert.strictEqual(
      postSyncVisual.type,
      'catalog',
      'Post-sync search suggestion must resolve to catalog photo'
    );
    assert.strictEqual(
      postSyncVisual.url,
      expectedPotatoCloudinaryUrl,
      'Post-sync search suggestion must deliver Cloudinary delivery URL for Potato'
    );
    console.log('  ✅ "aaloo" search suggestion instantly resolves Potato photo without adding to shopping list');

    // Also verify getCatalogImageForItem lookup directly
    const directLookup = getCatalogImageForItem('Potato');
    assert.ok(directLookup, 'getCatalogImageForItem("Potato") must return image info');
    assert.strictEqual(directLookup.cloudinaryPublicId, 'yaad-catalog/veg_potato');
    console.log('  ✅ getCatalogImageForItem("Potato") finds uploaded public ID');

    // =========================================================================
    // Test 3: Frequent Essentials Tile Rendering
    // =========================================================================
    console.log('\n[Test 3] Testing Frequent Essentials Tile Rendering (Image -> <img>, Missing -> Emoji)...');

    const potatoEssential: EssentialDisplayItem = {
      canonicalName: 'potatoes',
      displayName: 'Potatoes',
      nameUrdu: 'آلو',
      nameRomanUrdu: 'Aloo',
      category: 'vegetables',
      quantity: '1',
      unit: 'kg',
      isPersonalized: false,
    };

    const tomatoEssential: EssentialDisplayItem = {
      canonicalName: 'tomatoes',
      displayName: 'Tomatoes',
      nameUrdu: 'ٹماٹر',
      nameRomanUrdu: 'Tamatar',
      category: 'vegetables',
      quantity: '1',
      unit: 'kg',
      isPersonalized: false,
    };

    // 3a. Render FrequentEssentialTileVisual for Potato (has catalog image)
    const htmlPotatoTile = renderToString(
      React.createElement(FrequentEssentialTileVisual, {
        item: potatoEssential,
        fallbackEmoji: '🥔',
      })
    );
    assert.ok(
      htmlPotatoTile.includes('<img') && htmlPotatoTile.includes(expectedPotatoCloudinaryUrl),
      `Potato tile must render an <img> with Cloudinary URL. Got:\n${htmlPotatoTile}`
    );
    assert.ok(
      htmlPotatoTile.includes('alt="Potatoes"'),
      'Potato tile <img> must have alt="Potatoes"'
    );
    assert.ok(
      !htmlPotatoTile.includes('🥔'),
      'Potato tile must NOT render emoji when catalog image is available'
    );
    console.log('  ✅ Potato tile renders <img> with Cloudinary URL instead of emoji');

    // 3b. Render FrequentEssentialTileVisual for Tomato (no catalog image yet)
    const htmlTomatoTile = renderToString(
      React.createElement(FrequentEssentialTileVisual, {
        item: tomatoEssential,
        fallbackEmoji: '🍅',
      })
    );
    assert.ok(
      !htmlTomatoTile.includes('<img'),
      `Tomato tile must NOT render an <img>. Got:\n${htmlTomatoTile}`
    );
    assert.ok(
      htmlTomatoTile.includes('🍅'),
      'Tomato tile must gracefully fall back to emoji 🍅'
    );
    console.log('  ✅ Tomato tile without uploaded image renders emoji fallback (🍅)');

    // 3c. Full FrequentEssentialsSection renders cleanly with both items
    const htmlFullSection = renderToString(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(FrequentEssentialsSection, {
          lists: [],
          mostRecentActiveList: null,
          onAddItem: () => {},
          onViewAllCategories: () => {},
        })
      )
    );
    assert.ok(
      htmlFullSection.includes(expectedPotatoCloudinaryUrl),
      'Full FrequentEssentialsSection must include Potato catalog image URL'
    );
    assert.ok(
      htmlFullSection.includes('id="essential_card_potatoes"'),
      'FrequentEssentialsSection must render essential card for potatoes'
    );
    console.log('  ✅ Full FrequentEssentialsSection renders Potato catalog photo and preserves tile structure');

  } finally {
    // Restore initial catalog items
    supabaseCatalog.setItems(snapshotItems);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL Catalog Visual Precedence & Sync Tests PASSED');
  console.log('======================================================\n');
}

runCatalogVisualPrecedenceAndSyncSuite().catch((err) => {
  console.error('❌ Catalog Visual Precedence & Sync test failed:', err);
  process.exit(1);
});
