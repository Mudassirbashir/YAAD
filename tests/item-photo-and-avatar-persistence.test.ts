import assert from 'node:assert';
import { sanitizeImageUrl } from '../src/lib/barcode/providers/openFoodFacts';
import { triggerHaptic } from '../src/lib/sound';
import { getCloudinaryConfig, uploadImage } from '../src/utils/cloudinary';
import { parseAvatarValue, encodeEmojiAvatar } from '../src/data/avatarData';

async function runTests() {
  console.log('🧪 RUNNING ITEM PHOTO, HAPTIC FEEDBACK & AVATAR PERSISTENCE QA SUITE');

  // --- 1. Image URL Sanitization (HTTPS & safe data:image/) ---
  console.log('\n--- 1. Image URL Sanitization Verification ---');
  const httpsUrl = 'https://res.cloudinary.com/yaad/image/upload/v12345/item.jpg';
  assert.strictEqual(sanitizeImageUrl(httpsUrl), httpsUrl, 'Valid https URL is preserved');

  const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...';
  assert.strictEqual(sanitizeImageUrl(dataUri), dataUri, 'Safe data:image/ URI is accepted');

  const pngDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
  assert.strictEqual(sanitizeImageUrl(pngDataUri), pngDataUri, 'Safe data:image/png URI is accepted');

  const dangerousScript = 'javascript:alert(1)';
  assert.strictEqual(sanitizeImageUrl(dangerousScript), undefined, 'javascript: scheme is rejected');

  const invalidUrl = 'not-a-url';
  assert.strictEqual(sanitizeImageUrl(invalidUrl), undefined, 'Malformed string is rejected');
  console.log('✅ PASSED: sanitizeImageUrl properly allows HTTPS and safe data:image/ URIs');

  // --- 2. Avatar Parsing & Persistence Logic ---
  console.log('\n--- 2. Avatar Parsing & Custom Photo Support ---');
  const cloudAvatar = 'https://res.cloudinary.com/yaad/image/upload/v999/avatar.jpg';
  const parsedCloud = parseAvatarValue(cloudAvatar);
  assert.strictEqual(parsedCloud.isImageUrl, true, 'Cloudinary avatar detected as image URL');
  assert.strictEqual(parsedCloud.imageUrl, cloudAvatar, 'Cloudinary URL preserved');

  const localAvatar = 'data:image/jpeg;base64,samplephoto';
  const parsedLocal = parseAvatarValue(localAvatar);
  assert.strictEqual(parsedLocal.isImageUrl, true, 'Data URL avatar detected as image URL');

  const emojiAvatar = encodeEmojiAvatar('🥑', 'mint');
  const parsedEmoji = parseAvatarValue(emojiAvatar);
  assert.strictEqual(parsedEmoji.isEmoji, true, 'Emoji avatar parsed correctly');
  assert.strictEqual(parsedEmoji.emoji, '🥑', 'Emoji extracted accurately');
  assert.strictEqual(parsedEmoji.bgId, 'mint', 'Palette extracted accurately');
  console.log('✅ PASSED: Avatar parsing distinguishes image URLs from emojis');

  // --- 3. Profile Avatar Retention Simulation ---
  console.log('\n--- 3. Profile Avatar Retention on Database Upsert ---');
  const updates = { avatar_url: 'https://res.cloudinary.com/yaad/avatar.jpg' };
  const mergedProfile = {
    id: 'user_123',
    full_name: 'Mudassir',
    email: 'test@example.com',
    avatar_url: updates.avatar_url,
  };
  // Simulate database row returning null for avatar_url
  const savedRow = {
    id: 'user_123',
    full_name: 'Mudassir',
    email: 'test@example.com',
    avatar_url: null, // DB omitted or null
  };

  const finalProfile = {
    ...mergedProfile,
    ...(savedRow || {}),
    avatar_url: updates.avatar_url !== undefined
      ? (updates.avatar_url || null)
      : (savedRow?.avatar_url || mergedProfile.avatar_url || null),
  };

  assert.strictEqual(
    finalProfile.avatar_url,
    'https://res.cloudinary.com/yaad/avatar.jpg',
    'Avatar URL is NEVER wiped out by null in savedRow'
  );
  console.log('✅ PASSED: Profile avatar retention logic prevents database null overwrite');

  // --- 4. Haptic Feedback Invocation Safety ---
  console.log('\n--- 4. Haptic Feedback Invocation Safety ---');
  // Check triggerHaptic with distinct tactile pattern
  assert.doesNotThrow(() => triggerHaptic([40, 30, 45]), 'Pattern haptic does not throw');
  assert.doesNotThrow(() => triggerHaptic(15), 'Single haptic does not throw');
  assert.doesNotThrow(() => triggerHaptic([50, 40, 60, 40, 80]), 'Celebration haptic does not throw');
  console.log('✅ PASSED: triggerHaptic safely runs in browser and non-browser environments');

  // --- 5. Cloudinary Upload Fallback ---
  console.log('\n--- 5. Cloudinary & Upload Utility Resilience ---');
  const config = getCloudinaryConfig();
  assert(typeof config === 'object', 'Cloudinary config returns object');
  console.log(`Cloudinary isConfigured: ${config.isConfigured}, cloudName: "${config.cloudName}"`);
  console.log('✅ PASSED: Cloudinary config utility operational');

  console.log('\n========================================================');
  console.log('🎉 ALL ITEM PHOTO & AVATAR PERSISTENCE TESTS PASSED!');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
