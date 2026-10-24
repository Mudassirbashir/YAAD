/**
 * Regression Test Suite for Cloudinary Catalog Image Upload (Bug 3 - Doubled yaad-catalog/ Prefix)
 *
 * Verifies:
 * 1. Pre-existing items with historical doubled IDs (yaad-catalog/yaad-catalog/fruit_apple
 *    and yaad-catalog/yaad-catalog/baby_diapers) return HTTP 200 from Cloudinary delivery.
 * 2. Fresh admin upload verifies cloudinaryUploadImage does NOT include folder: 'yaad-catalog'
 *    in paramsToSign or upload payload.
 * 3. Fresh admin upload response and stored product row have cloudinary_public_id / cloudinaryPublicId
 *    prefixed exactly once: yaad-catalog/<id>.
 * 4. Leaves data/admin_data.json pristine via snapshot and restore.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import http from 'node:http';
import { adminRouter } from '../server/admin/routes';
import { adminStore } from '../server/admin/store';
import { buildCatalogImageUrl } from '../src/utils/cloudinary';
import { cloudinaryUploadImage } from '../server/admin/cloudinaryAdmin';

async function runAdminCloudinaryUploadSuite() {
  console.log('--- Running Admin Cloudinary Upload Test Suite (Bug 3) ---');

  // =========================================================================
  // TEST 1: Pre-existing Items Delivery URLs Return HTTP 200 Live
  // =========================================================================
  console.log('\n[Test 1] Verifying pre-existing items with doubled IDs load with HTTP 200...');

  const appleDeliveryUrl = buildCatalogImageUrl('yaad-catalog/yaad-catalog/fruit_apple', 'icon');
  const diapersDeliveryUrl = buildCatalogImageUrl('yaad-catalog/yaad-catalog/baby_diapers', 'icon');

  const [appleRes, diapersRes] = await Promise.all([
    fetch(appleDeliveryUrl),
    fetch(diapersDeliveryUrl),
  ]);

  assert.strictEqual(
    appleRes.status,
    200,
    `Pre-existing fruit_apple delivery URL must return HTTP 200. Got: ${appleRes.status}`
  );
  assert.strictEqual(
    diapersRes.status,
    200,
    `Pre-existing baby_diapers delivery URL must return HTTP 200. Got: ${diapersRes.status}`
  );

  console.log(`  ✅ yaad-catalog/yaad-catalog/fruit_apple HTTP status: ${appleRes.status}`);
  console.log(`  ✅ yaad-catalog/yaad-catalog/baby_diapers HTTP status: ${diapersRes.status}`);

  // =========================================================================
  // TEST 2: Fresh Admin Upload Produces Exactly Single Prefix yaad-catalog/<id>
  // =========================================================================
  console.log('\n[Test 2] Verifying fresh admin upload uses single prefix yaad-catalog/<itemId>...');

  // Snapshot database state before test
  const adminDataPath = path.resolve(process.cwd(), 'data', 'admin_data.json');
  let initialDbSnapshot = '';
  let initialFileContent: string | null = null;
  try {
    initialFileContent = fs.readFileSync(adminDataPath, 'utf8');
    initialDbSnapshot = JSON.stringify((adminStore as any).db);
  } catch {
    initialDbSnapshot = JSON.stringify({ admins: [], products: [] });
  }

  // Set up Express test harness
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/admin', adminRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const baseUrl = `http://localhost:${port}/admin`;

  // Set test credentials
  const oldKey = process.env.CLOUDINARY_API_KEY;
  const oldSecret = process.env.CLOUDINARY_API_SECRET;
  process.env.CLOUDINARY_API_KEY = 'test_api_key';
  process.env.CLOUDINARY_API_SECRET = 'test_api_secret';

  const originalFetch = globalThis.fetch;

  try {
    // Create an authorized admin user with catalog.edit permission
    const testAdmin = {
      id: 'admin_test_upload',
      name: 'Upload Test Admin',
      email: 'upload_admin@yaad.pk',
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
    (adminStore as any).db.admins.push(testAdmin);
    const token = adminStore.createSession(testAdmin).token;

    // Seed a test product in admin store
    const testItem = adminStore.saveCatalogProduct({
      id: 'fresh_upload_test_item',
      nameEn: 'Fresh Upload Test Item',
      nameUr: 'تازہ ٹیسٹ آئٹم',
      category: 'fruits',
      unit: 'kg',
      pricePkr: 250,
      isEssential: false,
    });

    let interceptedPayload: any = null;

    // Intercept outbound fetch calls to Cloudinary API
    globalThis.fetch = (async (input: any, init?: any) => {
      const urlStr = typeof input === 'string' ? input : input?.url || '';
      if (urlStr.includes('api.cloudinary.com')) {
        interceptedPayload = JSON.parse(init?.body || '{}');
        // Cloudinary returns public_id as received when no folder is prepended
        return new Response(
          JSON.stringify({
            secure_url: `https://res.cloudinary.com/rvhmsppk/image/upload/v12345/${interceptedPayload.public_id}.jpg`,
            public_id: interceptedPayload.public_id,
            format: 'jpg',
            width: 800,
            height: 800,
            bytes: 65432,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return originalFetch(input, init);
    }) as any;

    // Perform upload via POST /catalog/products/:id/image
    const uploadResponse = await originalFetch(
      `${baseUrl}/catalog/products/fresh_upload_test_item/image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileDataUri: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        }),
      }
    );

    assert.strictEqual(
      uploadResponse.status,
      200,
      `Upload endpoint must return 200. Got: ${uploadResponse.status}`
    );

    // 1. Verify Cloudinary request payload: folder MUST NOT be present
    assert(interceptedPayload, 'Outbound fetch to Cloudinary must be intercepted');
    assert.strictEqual(
      interceptedPayload.folder,
      undefined,
      `Cloudinary upload payload must NOT include 'folder' property. Got: ${interceptedPayload.folder}`
    );
    assert.strictEqual(
      interceptedPayload.public_id,
      'yaad-catalog/fresh_upload_test_item',
      `Cloudinary upload payload public_id must be exactly 'yaad-catalog/fresh_upload_test_item'. Got: ${interceptedPayload.public_id}`
    );

    // 2. Verify response body has single prefix
    const responseBody = await uploadResponse.json();
    assert.strictEqual(
      responseBody.success,
      true,
      'Upload response body must indicate success: true'
    );
    assert.strictEqual(
      responseBody.cloudinaryPublicId,
      'yaad-catalog/fresh_upload_test_item',
      `Response cloudinaryPublicId must have single prefix: 'yaad-catalog/fresh_upload_test_item'. Got: ${responseBody.cloudinaryPublicId}`
    );

    // 3. Verify stored product row has single prefix
    const storedProduct = adminStore
      .getCatalogProducts()
      .products.find((p) => p.id === 'fresh_upload_test_item');
    assert(storedProduct, 'Stored product must exist in adminStore');
    assert.strictEqual(
      storedProduct.cloudinaryPublicId,
      'yaad-catalog/fresh_upload_test_item',
      `Stored product.cloudinaryPublicId must be exactly 'yaad-catalog/fresh_upload_test_item'. Got: ${storedProduct.cloudinaryPublicId}`
    );

    console.log('  ✅ Outbound Cloudinary payload contains NO redundant folder parameter');
    console.log('  ✅ Upload response product.cloudinaryPublicId has single prefix');
    console.log('  ✅ Stored database row has single prefix: yaad-catalog/fresh_upload_test_item');

  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;

    // Close server
    await new Promise<void>((resolve) => server.close(() => resolve()));

    // Restore env vars
    if (oldKey) process.env.CLOUDINARY_API_KEY = oldKey;
    else delete process.env.CLOUDINARY_API_KEY;
    if (oldSecret) process.env.CLOUDINARY_API_SECRET = oldSecret;
    else delete process.env.CLOUDINARY_API_SECRET;

    // Restore adminStore and file system snapshot
    (adminStore as any).db = JSON.parse(initialDbSnapshot);
    if (initialFileContent !== null) {
      fs.writeFileSync(adminDataPath, initialFileContent, 'utf8');
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL Admin Cloudinary Upload (Bug 3) TESTS PASSED');
  console.log('======================================================');
}

runAdminCloudinaryUploadSuite().catch((err) => {
  console.error('❌ Admin Cloudinary Upload test failed:', err);
  process.exit(1);
});
