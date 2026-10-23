import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import express from 'express';
import http from 'node:http';

// Real imports from application source code
import { INITIAL_MASTER_CATALOG } from '../src/lib/catalog/items';
import {
  mergeMasterCatalogItems,
  getCatalogImageForItem,
  supabaseCatalog,
} from '../src/lib/catalog/supabaseCatalog';
import { resolveVisual } from '../src/lib/catalog/visualResolver';
import { buildCatalogImageUrl, OFFICIAL_CLOUDINARY_CLOUD_NAME } from '../src/utils/cloudinary';
import { ItemVisualIcon } from '../src/components/ItemVisualIcon';
import {
  slugifyCatalogName,
  matchCatalogFile,
} from '../src/admin/components/AdminBulkImageImportModal';
import { isAllowedImageFile } from '../src/admin/components/AdminItemImageModal';
import { signParams } from '../server/admin/cloudinaryAdmin';
import { adminRouter } from '../server/admin/routes';
import { adminStore } from '../server/admin/store';

async function runCatalogImageLibrarySuite() {
  console.log('--- YAAD Phase 3: Comprehensive Catalog Image Library Test Suite ---');

  // =========================================================================
  // WORKSTREAM A: Catalog Data Model & Merge Logic Tests
  // =========================================================================
  console.log('\n[Workstream A] Testing MasterCatalogItem merge & lookup...');

  // A1/A3: Static twin merge with remote image fields
  const staticPotato = INITIAL_MASTER_CATALOG.find((it) => it.id === 'veg_potato');
  assert(staticPotato, 'INITIAL_MASTER_CATALOG must contain veg_potato');
  assert(
    staticPotato.aliases.length > 0,
    'Static potato must have aliases (e.g. aloo, aalu)'
  );

  const mockRemoteRows = [
    {
      id: 'veg_potato',
      image_url: 'https://res.cloudinary.com/rvhmsppk/image/upload/v123/yaad-catalog/veg_potato.jpg',
      cloudinary_public_id: 'yaad-catalog/veg_potato',
      canonical_name: 'Potato',
    },
    {
      id: 'custom_admin_product',
      canonical_name: 'Special Basmati Rice 5kg',
      english_name: 'Special Basmati Rice',
      urdu_name: 'خاص باسمتی چاول',
      category_id: 'grains',
      image_url: 'https://res.cloudinary.com/rvhmsppk/image/upload/v123/yaad-catalog/custom_admin_product.jpg',
      cloudinary_public_id: 'yaad-catalog/custom_admin_product',
    },
  ];

  const merged = mergeMasterCatalogItems(INITIAL_MASTER_CATALOG, mockRemoteRows);
  assert(
    merged.length === INITIAL_MASTER_CATALOG.length + 1,
    `Merged catalog must contain all static items plus 1 remote-only item. Expected ${INITIAL_MASTER_CATALOG.length + 1}, got ${merged.length}`
  );

  const mergedPotato = merged.find((it) => it.id === 'veg_potato');
  assert(mergedPotato, 'Merged catalog must include veg_potato');
  assert.strictEqual(
    mergedPotato.cloudinaryPublicId,
    'yaad-catalog/veg_potato',
    'Merged potato must gain cloudinaryPublicId from remote row'
  );
  assert.strictEqual(
    mergedPotato.imageUrl,
    'https://res.cloudinary.com/rvhmsppk/image/upload/v123/yaad-catalog/veg_potato.jpg',
    'Merged potato must gain imageUrl from remote row'
  );
  assert(
    mergedPotato.aliases.length === staticPotato.aliases.length,
    'Merged potato must preserve all static aliases'
  );

  const mergedCustom = merged.find((it) => it.id === 'custom_admin_product');
  assert(mergedCustom, 'Remote-only item must be mapped whole');
  assert.strictEqual(
    mergedCustom.canonical_name,
    'Special Basmati Rice 5kg',
    'Remote-only item preserves canonical_name'
  );
  assert.strictEqual(
    mergedCustom.cloudinaryPublicId,
    'yaad-catalog/custom_admin_product',
    'Remote-only item preserves cloudinaryPublicId'
  );

  // Offline / fetch-failure behavior: static items remain indexed
  const emptyMerged = mergeMasterCatalogItems(INITIAL_MASTER_CATALOG, []);
  assert.strictEqual(
    emptyMerged.length,
    INITIAL_MASTER_CATALOG.length,
    'When remote fetch returns 0 items, static catalog is indexed unchanged'
  );

  console.log('  ✅ Workstream A merge logic verified');

  // =========================================================================
  // WORKSTREAM D1: Delivery URL Standard & Transformations
  // =========================================================================
  console.log('\n[Workstream D1] Testing Cloudinary delivery URL builder...');

  const iconUrl = buildCatalogImageUrl('yaad-catalog/veg_potato', 'icon');
  const expectedIconUrl =
    'https://res.cloudinary.com/rvhmsppk/image/upload/c_pad,b_white,w_96,h_96,f_auto,q_auto/yaad-catalog/veg_potato';
  assert.strictEqual(
    iconUrl,
    expectedIconUrl,
    `Icon URL format mismatch.\nExpected: ${expectedIconUrl}\nGot:      ${iconUrl}`
  );

  const largeUrl = buildCatalogImageUrl('yaad-catalog/veg_potato', 'large');
  const expectedLargeUrl =
    'https://res.cloudinary.com/rvhmsppk/image/upload/c_pad,b_white,w_600,h_600,f_auto,q_auto/yaad-catalog/veg_potato';
  assert.strictEqual(
    largeUrl,
    expectedLargeUrl,
    `Large URL format mismatch.\nExpected: ${expectedLargeUrl}\nGot:      ${largeUrl}`
  );

  console.log('  ✅ Workstream D1 delivery URL transformations verified (c_pad,b_white,f_auto,q_auto)');

  // =========================================================================
  // WORKSTREAM C: App Display Precedence & Component Rendering
  // =========================================================================
  console.log('\n[Workstream C] Testing visual precedence and ItemVisualIcon rendering...');

  // 1. Catalog item with cloudinaryPublicId renders transformed Cloudinary URL
  const catalogItemWithImage = {
    id: 'veg_potato',
    canonical_name: 'Potato',
    cloudinaryPublicId: 'yaad-catalog/veg_potato',
    imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/v123/yaad-catalog/veg_potato.jpg',
  };
  const resolvedCatalog = resolveVisual(catalogItemWithImage, 'icon');
  assert.strictEqual(
    resolvedCatalog.type,
    'catalog',
    'Catalog item visual must have type "catalog"'
  );
  assert.strictEqual(
    resolvedCatalog.url,
    expectedIconUrl,
    'Catalog item visual must deliver transformed icon URL'
  );

  const htmlCatalogImg = renderToString(
    React.createElement(ItemVisualIcon, {
      name: 'Potato',
      canonicalName: 'Potato',
      imageUrl: resolvedCatalog.url,
      size: 40,
    })
  );
  assert(
    htmlCatalogImg.includes('img') && htmlCatalogImg.includes(expectedIconUrl),
    `ItemVisualIcon must render <img> with D-variant Cloudinary URL. Got:\n${htmlCatalogImg}`
  );

  // 2. Item without image fields renders emoji fallback
  const itemWithoutImage = {
    id: 'veg_unknown',
    canonical_name: 'Custom Unimaged Veg',
  };
  const resolvedFallback = resolveVisual(itemWithoutImage, 'icon');
  assert.strictEqual(
    resolvedFallback.type,
    'emoji',
    'Item without image fields must resolve to type "emoji"'
  );

  const htmlEmojiFallback = renderToString(
    React.createElement(ItemVisualIcon, {
      name: 'Custom Veg',
      imageUrl: resolvedFallback.url,
      size: 40,
    })
  );
  assert(
    !htmlEmojiFallback.includes('<img'),
    `ItemVisualIcon for item without image must not render an <img> tag. Got:\n${htmlEmojiFallback}`
  );

  // 3. List item with BOTH user photo AND catalog image -> USER PHOTO ALWAYS WINS (Precedence 1)
  const listItemWithBoth = {
    id: 'user_list_item_1',
    name: 'Potato',
    canonicalName: 'Potato',
    imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/user_photo_potato_999.jpg',
    cloudinaryPublicId: 'yaad-catalog/veg_potato',
  };
  const resolvedBoth = resolveVisual(listItemWithBoth, 'icon');
  assert.strictEqual(
    resolvedBoth.type,
    'photo',
    'Precedence 1 rule: user photo MUST win over catalog image'
  );
  assert.strictEqual(
    resolvedBoth.url,
    'https://res.cloudinary.com/rvhmsppk/image/upload/user_photo_potato_999.jpg',
    'Precedence 1 rule: resolved URL must be the user photo URL'
  );

  const htmlUserPhoto = renderToString(
    React.createElement(ItemVisualIcon, {
      name: 'Potato',
      imageUrl: resolvedBoth.url,
      size: 40,
    })
  );
  assert(
    htmlUserPhoto.includes('user_photo_potato_999.jpg'),
    'ItemVisualIcon must render the user photo'
  );

  console.log('  ✅ Workstream C visual precedence verified (user photo > catalog image > emoji fallback)');

  // =========================================================================
  // WORKSTREAM D2: Bulk Import Stem & Slug Matching
  // =========================================================================
  console.log('\n[Workstream D2] Testing bulk import filename matching...');

  const mockCatalogList = [
    {
      id: 'veg_potato',
      name: 'Potato',
      category: 'Vegetables',
    },
    {
      id: 'oils_cooking_oil',
      name: 'Cooking Oil',
      category: 'Cooking Oils & Ghee',
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/oil.jpg',
    },
    {
      id: 'dairy_milk',
      name: 'Farm Fresh Milk',
      category: 'Dairy & Eggs',
    },
  ];

  // 1. Exact catalog ID stem match (with various extensions)
  const matchId1 = matchCatalogFile('veg_potato.webp', mockCatalogList);
  assert.strictEqual(matchId1.item?.id, 'veg_potato', 'veg_potato.webp must match exact id veg_potato');
  assert.strictEqual(matchId1.matchType, 'id');

  const matchId2 = matchCatalogFile('dairy_milk.heic', mockCatalogList);
  assert.strictEqual(matchId2.item?.id, 'dairy_milk', 'dairy_milk.heic must match exact id dairy_milk');

  // 2. Slugified name match (with special characters, spaces, hyphens)
  const matchSlug1 = matchCatalogFile('cooking-oil.jpg', mockCatalogList);
  assert.strictEqual(matchSlug1.item?.id, 'oils_cooking_oil', 'cooking-oil.jpg must match "Cooking Oil"');
  assert.strictEqual(matchSlug1.matchType, 'slug');

  const matchSlug2 = matchCatalogFile('farm_fresh_milk.png', mockCatalogList);
  assert.strictEqual(matchSlug2.item?.id, 'dairy_milk', 'farm_fresh_milk.png must match "Farm Fresh Milk"');
  assert.strictEqual(matchSlug2.matchType, 'slug');

  // 3. Unknown stem remains unmatched
  const matchUnknown = matchCatalogFile('unknown_unmatched_grocery_item.avif', mockCatalogList);
  assert.strictEqual(matchUnknown.item, null, 'Unknown stem must remain unmatched');

  // 4. Headline validation: isAllowedImageFile accepts all valid extensions + image/* MIME
  assert(isAllowedImageFile({ name: 'photo.HEIC', type: '' }), 'HEIC with empty MIME must be accepted');
  assert(isAllowedImageFile({ name: 'product.webp', type: 'image/webp' }), 'WEBP must be accepted');
  assert(isAllowedImageFile({ name: 'icon.svg', type: 'image/svg+xml' }), 'SVG must be accepted');
  assert(isAllowedImageFile({ name: 'test.avif', type: 'application/octet-stream' }), 'AVIF with generic MIME must be accepted');
  assert(!isAllowedImageFile({ name: 'document.pdf', type: 'application/pdf' }), 'PDF must be rejected');
  assert(!isAllowedImageFile({ name: 'script.js', type: 'text/javascript' }), 'JS file must be rejected');

  console.log('  ✅ Workstream D2 bulk stem & slug matching and file validation verified');

  // =========================================================================
  // WORKSTREAM B: Server Cloudinary Admin Endpoints & Auth Guards
  // =========================================================================
  console.log('\n[Workstream B] Testing server admin image endpoints & security guards...');

  // Signature verification (alphabetical parameter ordering + SHA-1)
  const testSig = signParams(
    { public_id: 'yaad-catalog/test_item', timestamp: 1700000000 },
    'mock_api_secret_12345'
  );
  assert(typeof testSig === 'string' && testSig.length === 40, 'signParams must produce 40-character hex SHA-1');

  // Setup express server with adminRouter
  const adminDataPath = path.resolve(process.cwd(), 'data/admin_data.json');
  const initialFileContent = fs.existsSync(adminDataPath)
    ? fs.readFileSync(adminDataPath, 'utf8')
    : null;
  const initialDbSnapshot = JSON.stringify((adminStore as any).db);
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use('/api/admin', adminRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api/admin`;

  try {
    // 1. Unauthenticated request -> must return 401
    const unauthRes = await fetch(`${baseUrl}/catalog/products/veg_potato/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileDataUri: 'data:image/png;base64,iVBORw0KGgo=' }),
    });
    assert.strictEqual(
      unauthRes.status,
      401,
      `Unauthenticated image upload must return 401. Got: ${unauthRes.status}`
    );

    // 2. Admin user without 'catalog.edit' permission (e.g. role 'analyst') -> must return 403
    const analystUser = {
      id: 'admin_analyst_test',
      name: 'Analyst User',
      email: 'analyst@yaad.pk',
      passwordHash: 'dummy',
      salt: 'salt',
      role: 'analyst' as const,
      totpSecret: '',
      isTotpEnabled: false,
      status: 'active' as const,
      failedAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    (adminStore as any).db.admins.push(analystUser);
    const analystToken = adminStore.createSession(analystUser).token;

    const forbiddenRes = await fetch(`${baseUrl}/catalog/products/veg_potato/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${analystToken}`,
      },
      body: JSON.stringify({ fileDataUri: 'data:image/png;base64,iVBORw0KGgo=' }),
    });
    assert.strictEqual(
      forbiddenRes.status,
      403,
      `Admin lacking catalog.edit permission must return 403. Got: ${forbiddenRes.status}`
    );

    // 3. Authorized admin user with 'catalog.edit', but Cloudinary admin credentials absent
    // Ensure env credentials are empty for this test
    const oldKey = process.env.CLOUDINARY_API_KEY;
    const oldSecret = process.env.CLOUDINARY_API_SECRET;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const superAdminUser = {
      id: 'admin_super_test',
      name: 'Super Admin Test',
      email: 'super_admin_test@yaad.pk',
      passwordHash: 'dummy',
      salt: 'salt',
      role: 'super_admin' as const,
      totpSecret: '',
      isTotpEnabled: false,
      status: 'active' as const,
      failedAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    (adminStore as any).db.admins.push(superAdminUser);
    const superAdminToken = adminStore.createSession(superAdminUser).token;

    const missingCredsRes = await fetch(`${baseUrl}/catalog/products/veg_potato/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ fileDataUri: 'data:image/png;base64,iVBORw0KGgo=' }),
    });
    assert.strictEqual(
      missingCredsRes.status,
      503,
      `When Cloudinary admin credentials are absent, endpoint must return 503. Got: ${missingCredsRes.status}`
    );
    const missingCredsBody = await missingCredsRes.json();
    assert.strictEqual(
      missingCredsBody.error,
      'Cloudinary admin credentials not configured',
      `Expected error "Cloudinary admin credentials not configured", got "${missingCredsBody.error}"`
    );

    // 4. DELETE /catalog/products/:id/image with missing credentials -> 503
    const missingCredsDeleteRes = await fetch(`${baseUrl}/catalog/products/veg_potato/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert.strictEqual(
      missingCredsDeleteRes.status,
      503,
      `DELETE without Cloudinary credentials must return 503. Got: ${missingCredsDeleteRes.status}`
    );

    // 5. Failed destroy leaves stored fields unchanged and surfaces real error
    process.env.CLOUDINARY_API_KEY = 'mock_key';
    process.env.CLOUDINARY_API_SECRET = 'mock_secret';

    const testProd = adminStore.saveCatalogProduct({
      id: 'prod_destroy_test',
      nameEn: 'Destroy Test Product',
      nameUr: 'ٹیسٹ',
      category: 'Vegetables',
      imageUrl: 'https://res.cloudinary.com/rvhmsppk/image/upload/prod_destroy_test.jpg',
      cloudinaryPublicId: 'yaad-catalog/prod_destroy_test',
    });
    assert.strictEqual(testProd.cloudinaryPublicId, 'yaad-catalog/prod_destroy_test');

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: any, init?: any) => {
      const urlStr = typeof input === 'string' ? input : input?.url || '';
      if (urlStr.includes('/image/destroy')) {
        return new Response(JSON.stringify({ error: { message: 'Cloudinary API quota exceeded' } }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return originalFetch(input, init);
    }) as any;

    try {
      const destroyFailRes = await fetch(`${baseUrl}/catalog/products/prod_destroy_test/image`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      assert.strictEqual(destroyFailRes.status, 500, 'Failed destroy must return 500');
      const destroyFailBody = await destroyFailRes.json();
      assert(
        destroyFailBody.error && destroyFailBody.error.includes('Cloudinary API quota exceeded'),
        `Error must surface Cloudinary real error message. Got: ${destroyFailBody.error}`
      );

      const currentStored = adminStore.getCatalogProducts().products.find(
        (p) => p.id === 'prod_destroy_test'
      );
      assert.strictEqual(
        currentStored?.cloudinaryPublicId,
        'yaad-catalog/prod_destroy_test',
        'Failed destroy must leave stored cloudinaryPublicId intact'
      );
      assert.strictEqual(
        currentStored?.imageUrl,
        'https://res.cloudinary.com/rvhmsppk/image/upload/prod_destroy_test.jpg',
        'Failed destroy must leave stored imageUrl intact'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }

    // Restore env vars
    if (oldKey) process.env.CLOUDINARY_API_KEY = oldKey;
    else delete process.env.CLOUDINARY_API_KEY;
    if (oldSecret) process.env.CLOUDINARY_API_SECRET = oldSecret;
    else delete process.env.CLOUDINARY_API_SECRET;

    console.log('  ✅ Workstream B endpoint auth guards & failed destroy error isolation verified');
  } finally {
    server.close();
    (adminStore as any).db = JSON.parse(initialDbSnapshot);
    if (initialFileContent !== null) {
      fs.writeFileSync(adminDataPath, initialFileContent, 'utf8');
    }
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL CATALOG IMAGE LIBRARY UNIT & INTEGRATION TESTS PASSED');
  console.log('=============================================================\n');
}

runCatalogImageLibrarySuite().catch((err) => {
  console.error('❌ catalog-image-library test failed:', err);
  process.exit(1);
});
