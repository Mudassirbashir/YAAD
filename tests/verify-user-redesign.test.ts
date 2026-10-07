import { adminStore } from '../server/admin/store';

async function runVerificationTests() {
  console.log('--- 1. Admin Store Verification Tests ---');

  const testUserId = 'user_test_verified_123';
  
  // Initially not verified
  const initialVerified = adminStore.isUserVerified(testUserId);
  console.log(`Initial verified status for ${testUserId}:`, initialVerified);
  if (initialVerified !== false) {
    throw new Error('Expected initial verified status to be false');
  }

  // Grant verification
  const updatedUser = adminStore.setAppUserVerified(testUserId, true);
  console.log(`Updated user verification:`, updatedUser?.isVerified);
  if (updatedUser?.isVerified !== true) {
    throw new Error('Failed to set user verified to true');
  }

  const checkVerified = adminStore.isUserVerified(testUserId);
  if (checkVerified !== true) {
    throw new Error('isUserVerified returned false after granting verification');
  }

  // Revoke verification
  const revokedUser = adminStore.setAppUserVerified(testUserId, false);
  console.log(`Revoked user verification:`, revokedUser?.isVerified);
  if (revokedUser?.isVerified !== false) {
    throw new Error('Failed to revoke user verification');
  }

  const checkRevoked = adminStore.isUserVerified(testUserId);
  if (checkRevoked !== false) {
    throw new Error('isUserVerified returned true after revoking verification');
  }

  console.log('✅ ALL ADMIN STORE VERIFICATION TESTS PASSED');
}

runVerificationTests()
  .then(() => {
    console.log('🎉 Verification Suite Passed Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Verification Suite Failed:', err);
    process.exit(1);
  });
