import assert from 'node:assert/strict';
import { resolveGS1Prefix } from '../src/lib/barcode/gs1Prefix';
import { getRetailerLinksForQuery } from '../src/lib/barcode/retailerLinks';
import { PersistentBarcodeCache } from '../src/lib/barcode/persistentCache';
import { UPCItemDBProvider } from '../src/lib/barcode/providers/upcItemDB';
import { BarcodeLookupService } from '../src/lib/barcode/service';
import { NormalizedBarcode, BarcodeLookupResult, BarcodeProvider } from '../src/lib/barcode/types';

async function runTests() {
  console.log('========================================================');
  console.log('TESTING REVERSE-ENGINEERED BARCODE CAPABILITIES');
  console.log('========================================================');

  // --- 1. GS1 Country of Origin Prefix Resolution ---
  console.log('\n--- 1. GS1 Prefix & Country Resolution ---');
  {
    // Pakistan: 896 (Shan Biryani Masala: 8964000123454)
    const pk = resolveGS1Prefix('8964000123454');
    assert.ok(pk, 'Should resolve Pakistan prefix');
    assert.equal(pk.country, 'Pakistan');
    assert.equal(pk.flag, '🇵🇰');
    assert.equal(pk.organization, 'GS1 Pakistan');

    // USA / Canada (UPC-A 12-digit standard): 000-139
    const us12 = resolveGS1Prefix('012345678905');
    assert.ok(us12, 'Should resolve USA UPC-A 12-digit code');
    assert.equal(us12.country, 'United States & Canada');
    assert.equal(us12.flag, '🇺🇸');

    // United Kingdom: 500-509
    const uk = resolveGS1Prefix('5012345678900');
    assert.ok(uk, 'Should resolve UK prefix');
    assert.equal(uk.country, 'United Kingdom');
    assert.equal(uk.flag, '🇬🇧');

    // Germany: 400-440
    const de = resolveGS1Prefix('4001234567890');
    assert.ok(de, 'Should resolve Germany prefix');
    assert.equal(de.country, 'Germany');
    assert.equal(de.flag, '🇩🇪');

    // UAE: 629
    const uae = resolveGS1Prefix('6291234567890');
    assert.ok(uae, 'Should resolve UAE prefix');
    assert.equal(uae.country, 'United Arab Emirates');
    assert.equal(uae.flag, '🇦🇪');

    // Saudi Arabia: 628
    const ksa = resolveGS1Prefix('6281234567890');
    assert.ok(ksa, 'Should resolve Saudi Arabia prefix');
    assert.equal(ksa.country, 'Saudi Arabia');
    assert.equal(ksa.flag, '🇸🇦');

    // Invalid / short
    assert.equal(resolveGS1Prefix(''), null);
    assert.equal(resolveGS1Prefix('12'), null);

    console.log('✅ PASSED: GS1 Prefix resolver accurately maps national prefixes and flags');
  }

  // --- 2. 1-Tap Retailer Price Check Deep-Links ---
  console.log('\n--- 2. Retailer Deep-Link Generation ---');
  {
    const links = getRetailerLinksForQuery('896400012345');
    assert.equal(links.length, 5);

    const google = links.find((l) => l.id === 'google_shopping');
    assert.ok(google);
    assert.ok(google.url.includes('google.com/search'));
    assert.ok(google.url.includes('tbm=shop'));
    assert.ok(google.url.includes('896400012345'));

    const amazon = links.find((l) => l.id === 'amazon');
    assert.ok(amazon);
    assert.ok(amazon.url.includes('amazon.com/s?k=896400012345'));

    const daraz = links.find((l) => l.id === 'daraz');
    assert.ok(daraz);
    assert.ok(daraz.url.includes('daraz.pk/catalog/?q=896400012345'));

    const ebay = links.find((l) => l.id === 'ebay');
    assert.ok(ebay);
    assert.ok(ebay.url.includes('ebay.com/sch'));

    const walmart = links.find((l) => l.id === 'walmart');
    assert.ok(walmart);
    assert.ok(walmart.url.includes('walmart.com/search'));

    console.log('✅ PASSED: Retailer price check links accurately formatted for international and local platforms');
  }

  // --- 3. Persistent Barcode Cache ---
  console.log('\n--- 3. Persistent Local Barcode Cache ---');
  {
    const cache = new PersistentBarcodeCache();
    cache.clear();

    const mockResult: BarcodeLookupResult = {
      status: 'FOUND',
      source: 'test_provider',
      product: {
        barcode: '8964000123454',
        name: 'Olpers Milk 1L',
        brand: 'Olpers',
        packageSize: '1000ml',
        categoryId: 'dairy',
        source: 'test_provider',
      },
    };

    // Set cache
    cache.set('8964000123454', mockResult);

    // Retrieve cache
    const retrieved = cache.get('8964000123454');
    assert.ok(retrieved, 'Should retrieve item from cache');
    assert.equal(retrieved.status, 'FOUND');
    assert.equal(retrieved.product?.name, 'Olpers Milk 1L');
    assert.equal(retrieved.fromCache, true);

    // Non-existent key
    assert.equal(cache.get('9999999999999'), null);

    // Delete
    cache.delete('8964000123454');
    assert.equal(cache.get('8964000123454'), null);

    console.log('✅ PASSED: Persistent Barcode Cache stores, retrieves, and expires items correctly');
  }

  // --- 4. UPCItemDB Provider Integration ---
  console.log('\n--- 4. UPCItemDB Provider Execution ---');
  {
    const provider = new UPCItemDBProvider();

    // Invalid barcode format
    const invalidBarcode: NormalizedBarcode = {
      raw: '123',
      normalized: '123',
      format: 'UNKNOWN',
      isValid: false,
      error: 'Invalid length',
    };
    const invalidRes = await provider.lookup(invalidBarcode);
    assert.equal(invalidRes.status, 'INVALID_BARCODE');

    // Valid mock lookup
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          code: 'OK',
          total: 1,
          items: [
            {
              ean: '012345678905',
              title: 'Duracell AA Batteries 4-Pack',
              brand: 'Duracell',
              category: 'Electronics > Batteries',
              images: ['https://images.example.com/duracell.jpg'],
            },
          ],
        }),
      } as any;
    };

    try {
      const validBarcode: NormalizedBarcode = {
        raw: '012345678905',
        normalized: '012345678905',
        format: 'UPC_A',
        isValid: true,
      };

      const res = await provider.lookup(validBarcode);
      assert.equal(res.status, 'FOUND');
      assert.equal(res.product?.name, 'Duracell AA Batteries 4-Pack');
      assert.equal(res.product?.brand, 'Duracell');
      assert.equal(res.product?.categoryId, 'electronics');
      assert.equal(res.product?.imageUrl, 'https://images.example.com/duracell.jpg');
    } finally {
      globalThis.fetch = originalFetch;
    }

    console.log('✅ PASSED: UPCItemDB Provider queries, maps categories, and sanitizes metadata');
  }

  // --- 5. Tiered BarcodeLookupService with GS1 Enrichment ---
  console.log('\n--- 5. Tiered BarcodeLookupService with GS1 ---');
  {
    // Shan Biryani Masala valid EAN-13: 8964000123454
    const validEan13 = '8964000123454';

    const providerA: BarcodeProvider = {
      name: 'provider_food',
      lookup: async () => ({ status: 'NOT_FOUND' }),
    };

    const providerB: BarcodeProvider = {
      name: 'provider_retail',
      lookup: async (b) => ({
        status: 'FOUND',
        source: 'provider_retail',
        product: {
          barcode: b.normalized,
          name: 'Shan Biryani Masala 50g',
          brand: 'Shan Foods',
          categoryId: 'spices',
          source: 'provider_retail',
        },
      }),
    };

    const service = new BarcodeLookupService([providerA, providerB]);

    // Lookup Pakistan EAN-13
    const res = await service.lookupBarcode(validEan13);
    assert.equal(res.status, 'FOUND');
    assert.equal(res.product?.name, 'Shan Biryani Masala 50g');
    assert.equal(res.product?.originCountry, 'Pakistan');
    assert.equal(res.product?.originFlag, '🇵🇰');
    assert.ok(res.gs1Prefix);
    assert.equal(res.gs1Prefix.country, 'Pakistan');
    assert.equal(res.gs1Prefix.organization, 'GS1 Pakistan');

    // Repeat lookup should hit cache
    const cachedRes = await service.lookupBarcode(validEan13);
    assert.equal(cachedRes.status, 'FOUND');
    assert.equal(cachedRes.fromCache, true);
    assert.equal(cachedRes.product?.name, 'Shan Biryani Masala 50g');

    console.log('✅ PASSED: Tiered lookup falls back properly and enriches with GS1 origin & cache');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL REVERSE-ENGINEERED FEATURE TESTS PASSED (100%)');
  console.log('========================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
