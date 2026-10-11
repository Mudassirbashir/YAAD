import assert from 'node:assert';
import {
  normalizeBarcode,
  validateEAN13Checksum,
  validateUPCAChecksum,
  validateEAN8Checksum,
  validateITF14Checksum,
  expandUPCEToUPCA,
} from '../src/lib/barcode/normalizer';
import { mapProviderCategoryToYAAD } from '../src/lib/barcode/categoryMapper';
import { sanitizeImageUrl } from '../src/lib/barcode/providers/openFoodFacts';

console.log('========================================================');
console.log('TESTING BARCODE STANDARDS, NORMALIZATION & EXPANSION');
console.log('========================================================');

// 1. EAN-13 Checksum Validation
console.log('\n--- 1. EAN-13 Checksum Validation ---');
// Real valid EAN-13 barcodes
const validEAN13 = [
  '7350053850019', // Oatly Oat Milk
  '8964000123454', // Pakistani consumer goods example (checksum 4)
  '4008400404127', // Ferrero Kinder Bueno
  '0012345678905', // EAN-13 starting with zero (UPC-A padded)
];
for (const code of validEAN13) {
  assert.strictEqual(validateEAN13Checksum(code), true, `Expected valid EAN-13 for ${code}`);
}
// Invalid checksums (corrupted last digit)
assert.strictEqual(validateEAN13Checksum('7350053850018'), false, 'Corrupted EAN-13 check digit should fail');
assert.strictEqual(validateEAN13Checksum('8964000123451'), false, 'Corrupted EAN-13 check digit should fail');
assert.strictEqual(validateEAN13Checksum('12345'), false, 'Short code should not be valid EAN-13');
console.log('✅ PASSED: EAN-13 checksum validation (valid and invalid cases)');

// 2. UPC-A Checksum Validation
console.log('\n--- 2. UPC-A Checksum Validation ---');
const validUPCA = [
  '012345678905', // Standard UPC-A
  '04963406',     // Short length should fail
  '036000291452', // Kleenex Tissues
];
assert.strictEqual(validateUPCAChecksum('012345678905'), true, 'Expected valid UPC-A');
assert.strictEqual(validateUPCAChecksum('036000291452'), true, 'Expected valid UPC-A');
assert.strictEqual(validateUPCAChecksum('012345678906'), false, 'Invalid UPC-A checksum should fail');
assert.strictEqual(validateUPCAChecksum('036000291459'), false, 'Invalid UPC-A checksum should fail');
console.log('✅ PASSED: UPC-A checksum validation');

// 3. Leading-Zero Preservation
console.log('\n--- 3. Leading-Zero Preservation ---');
const zeroLeading = '0012345678905';
const normalizedZero = normalizeBarcode(zeroLeading);
assert.strictEqual(normalizedZero.normalized, zeroLeading, 'Leading zeros must be preserved');
assert.strictEqual(normalizedZero.normalized.startsWith('00'), true, 'Leading double zero must remain intact');
assert.strictEqual(normalizedZero.format, 'EAN_13');
assert.strictEqual(normalizedZero.isValid, true);
console.log('✅ PASSED: Leading zeros preserved without corruption');

// 4. UPC-A to EAN-13 and EAN-13 to UPC-A Equivalence
console.log('\n--- 4. UPC-A / EAN-13 Equivalence ---');
const upcACode = '012345678905';
const normalizedUPCA = normalizeBarcode(upcACode);
assert.strictEqual(normalizedUPCA.format, 'UPC_A');
assert.strictEqual(normalizedUPCA.ean13Equivalent, '0012345678905', 'UPC-A must provide 13-digit zero-padded equivalent');

const ean13WithZero = '0012345678905';
const normalizedEAN = normalizeBarcode(ean13WithZero);
assert.strictEqual(normalizedEAN.format, 'EAN_13');
assert.strictEqual(normalizedEAN.upcAEquivalent, '012345678905', 'Zero-leading EAN-13 must provide 12-digit UPC-A equivalent');
console.log('✅ PASSED: UPC-A and EAN-13 cross-format equivalence conversion');

// 5. EAN-8 Checksum Validation
console.log('\n--- 5. EAN-8 Checksum Validation ---');
const validEAN8 = '96385074';
assert.strictEqual(validateEAN8Checksum(validEAN8), true, 'Expected valid EAN-8');
assert.strictEqual(validateEAN8Checksum('96385075'), false, 'Expected invalid EAN-8 checksum');

const normEAN8 = normalizeBarcode(validEAN8);
assert.strictEqual(normEAN8.format, 'EAN_8');
assert.strictEqual(normEAN8.isValid, true);
console.log('✅ PASSED: EAN-8 checksum and format resolution');

// 6. UPC-E Compression and Expansion Rules
console.log('\n--- 6. UPC-E Expansion Rules ---');
// Rule 1: last digit 0, 1, 2
// 6 digits: 123450 -> Mfg: 12000, Prod: 00345 -> 01200000345 + check digit
const exp1 = expandUPCEToUPCA('123450', '0');
assert.ok(exp1, 'UPC-E rule 0 must expand to UPC-A');
assert.strictEqual(exp1.startsWith('01200000345'), true);
assert.strictEqual(validateUPCAChecksum(exp1), true);

// Rule 2: last digit 3
// 6 digits: 123453 -> Mfg: 12300, Prod: 00045 -> 01230000045 + check digit
const exp2 = expandUPCEToUPCA('123453', '0');
assert.ok(exp2, 'UPC-E rule 3 must expand');
assert.strictEqual(exp2.startsWith('01230000045'), true);
assert.strictEqual(validateUPCAChecksum(exp2), true);

// Rule 3: last digit 4
// 6 digits: 123454 -> Mfg: 12340, Prod: 00005 -> 01234000005 + check digit
const exp3 = expandUPCEToUPCA('123454', '0');
assert.ok(exp3, 'UPC-E rule 4 must expand');
assert.strictEqual(exp3.startsWith('01234000005'), true);
assert.strictEqual(validateUPCAChecksum(exp3), true);

// Rule 4: last digit 5, 6, 7, 8, 9
// 6 digits: 123457 -> Mfg: 12345, Prod: 00007 -> 01234500007 + check digit
const exp4 = expandUPCEToUPCA('123457', '0');
assert.ok(exp4, 'UPC-E rule 5-9 must expand');
assert.strictEqual(exp4.startsWith('01234500007'), true);
assert.strictEqual(validateUPCAChecksum(exp4), true);

// 8-digit UPC-E input validation
// 01234565 has system digit 0, payload 123456, check digit 5
const normUPCE = normalizeBarcode('01234565', 'UPC_E');
assert.strictEqual(normUPCE.format, 'UPC_E');
console.log('✅ PASSED: All 4 UPC-E compression and expansion rules verified');

// 7. Disambiguation: Short numeric values must not blindly be treated as UPC-E
console.log('\n--- 7. Short numeric disambiguation ---');
const arbitraryShort = '1234';
const normShort = normalizeBarcode(arbitraryShort);
assert.strictEqual(normShort.isValid, false, 'Arbitrary 4-digit code must not be treated as valid barcode');

const arbitrary7 = '9876543'; // Does not start with 0 or 1, invalid UPC-E
const norm7 = normalizeBarcode(arbitrary7);
assert.strictEqual(norm7.isValid, false, 'Invalid 7-digit code must be rejected');
console.log('✅ PASSED: Short numbers correctly validated and rejected if invalid');

// 8. Alphanumeric Barcode Formats (CODE-128, CODE-39)
console.log('\n--- 8. Alphanumeric Barcodes ---');
const code128 = 'PKG-9823-XA';
const norm128 = normalizeBarcode(code128, 'CODE_128');
assert.strictEqual(norm128.isValid, true);
assert.strictEqual(norm128.format, 'CODE_128');
assert.strictEqual(norm128.normalized, 'PKG-9823-XA');

const code39 = 'ASSET*492';
const norm39 = normalizeBarcode(code39, 'CODE_39');
assert.strictEqual(norm39.isValid, true);
assert.strictEqual(norm39.format, 'CODE_39');
console.log('✅ PASSED: Alphanumeric barcodes supported without numeric corruption');

// 9. ITF-14
console.log('\n--- 9. ITF-14 Validation ---');
// 14 digits with valid Modulo 10
const itfCode = '10012345678902';
assert.strictEqual(validateITF14Checksum(itfCode), true);
const normITF = normalizeBarcode(itfCode);
assert.strictEqual(normITF.format, 'ITF');
assert.strictEqual(normITF.isValid, true);
console.log('✅ PASSED: ITF-14 validated');

// 10. Category Mapper Tests
console.log('\n--- 10. Provider Category Mapping ---');
assert.strictEqual(mapProviderCategoryToYAAD(['en:plant-milks', 'en:dairies']), 'dairy');
assert.strictEqual(mapProviderCategoryToYAAD(['en:beverages', 'en:fruit-juices']), 'beverages');
assert.strictEqual(mapProviderCategoryToYAAD(['en:biscuits', 'en:sweet-snacks']), 'snacks');
assert.strictEqual(mapProviderCategoryToYAAD(['en:cooking-oils']), 'oils');
assert.strictEqual(mapProviderCategoryToYAAD(['en:laundry-detergents']), 'cleaning');
assert.strictEqual(mapProviderCategoryToYAAD(['en:shampoos']), 'personal_care');
assert.strictEqual(mapProviderCategoryToYAAD(['en:baby-diapers']), 'baby_care');
assert.strictEqual(mapProviderCategoryToYAAD(['en:unknown-nonexistent-category']), 'other');
console.log('✅ PASSED: Category mapper accurately maps tags to YAAD canonical categories');

// 11. Image URL Sanitization
console.log('\n--- 11. Image URL Sanitization ---');
assert.strictEqual(
  sanitizeImageUrl('https://images.openfoodfacts.org/images/products/735/005/385/0019/front_en.jpg'),
  'https://images.openfoodfacts.org/images/products/735/005/385/0019/front_en.jpg'
);
assert.strictEqual(sanitizeImageUrl('javascript:alert(1)'), undefined);
assert.strictEqual(sanitizeImageUrl('data:text/html,<script>alert(1)</script>'), undefined);
assert.strictEqual(sanitizeImageUrl('relative/path/image.png'), undefined);
assert.strictEqual(sanitizeImageUrl(''), undefined);
assert.strictEqual(sanitizeImageUrl(null), undefined);
console.log('✅ PASSED: Image URL sanitization rejects malicious and invalid schemes');

console.log('========================================================');
console.log('🎉 ALL BARCODE STANDARDS & NORMALIZATION TESTS PASSED');
console.log('========================================================');
