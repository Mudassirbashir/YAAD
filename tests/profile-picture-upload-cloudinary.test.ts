import { parseAvatarValue } from '../src/data/avatarData';
import { getCloudinaryConfig, saveCloudinaryConfig, uploadImage } from '../src/utils/cloudinary';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING PROFILE PICTURE & CLOUDINARY QA TESTS');
  console.log('==================================================');

  // --- 1. Cloudinary Config Persistence ---
  console.log('--- 1. Testing Cloudinary Config Management ---');
  saveCloudinaryConfig('test_cloud', 'yaad_preset');
  const config = getCloudinaryConfig();
  assert(config.cloudName === 'test_cloud', 'Cloud Name is saved and retrieved correctly');
  assert(config.uploadPreset === 'yaad_preset', 'Upload Preset defaults or retrieves correctly');
  assert(config.isConfigured === true, 'Cloudinary is recognized as configured');

  // Test clearing config
  saveCloudinaryConfig('');
  const emptyConfig = getCloudinaryConfig();
  assert(emptyConfig.cloudName === '', 'Cloud Name can be cleared cleanly');
  assert(emptyConfig.isConfigured === false, 'Cloudinary unconfigured state verified');

  // --- 2. Avatar Parsing & Compatibility ---
  console.log('--- 2. Testing Avatar Value Parsing ---');
  // Cloudinary URL
  const cloudinaryUrl = 'https://res.cloudinary.com/yaad/image/upload/v12345/avatar.jpg';
  const parsedCloudinary = parseAvatarValue(cloudinaryUrl);
  assert(parsedCloudinary.isImageUrl === true, 'Cloudinary URL correctly detected as image URL');
  assert(parsedCloudinary.imageUrl === cloudinaryUrl, 'Cloudinary URL extracted accurately');

  // Data URL (fallback compressed square image)
  const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
  const parsedDataUrl = parseAvatarValue(dataUrl);
  assert(parsedDataUrl.isImageUrl === true, 'Data URI correctly detected as image URL');
  assert(parsedDataUrl.imageUrl === dataUrl, 'Data URI extracted accurately');

  // Emoji avatar backwards compatibility
  const emojiAvatar = 'emoji:🥑:mint';
  const parsedEmoji = parseAvatarValue(emojiAvatar);
  assert(parsedEmoji.isEmoji === true, 'Emoji avatar remains backward compatible');
  assert(parsedEmoji.emoji === '🥑', 'Emoji avocado extracted');

  // --- 3. Upload Flow with Fallback ---
  console.log('--- 3. Testing Upload Flow & Fallback Behavior ---');
  // In Node environment, creating a mock blob
  const mockBlob = new Blob(['mock-image-binary-data'], { type: 'image/jpeg' });
  const uploadResult = await uploadImage(mockBlob);
  assert(typeof uploadResult.url === 'string' && uploadResult.url.length > 0, 'Upload returns a valid URL string');

  console.log('==================================================');
  console.log('🎉 ALL PROFILE PICTURE & CLOUDINARY TESTS PASSED!');
  console.log('==================================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
