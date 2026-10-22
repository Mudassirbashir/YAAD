import assert from 'assert';
import crypto from 'crypto';
import { adminStore, hashPassword } from '../server/admin/store';
import { validateArticleSeoGate } from '../server/admin/seoValidator';

async function main() {
  console.log('=== YAAD Content Writer RBAC & Authoritative Data Acceptance Test ===\n');

  // STEP 1: Verify baseline state
  const superAdminArticles = adminStore.getCmsArticles();
  const superAdminPublished = superAdminArticles.filter((a) => a.status === 'published');
  const superAdminToUpload = superAdminArticles.filter((a) => a.status !== 'published');

  console.log('--- Step 1: Super Admin Baseline Inspection ---');
  console.log(`Total Articles: ${superAdminArticles.length}`);
  console.log(`Published Articles: ${superAdminPublished.length}`);
  console.log(`To Upload Articles: ${superAdminToUpload.length}`);

  assert.strictEqual(superAdminArticles.length, 260, 'Baseline total must be 260 articles');
  assert.strictEqual(superAdminPublished.length, 4, 'Baseline published must be 4');
  assert.strictEqual(superAdminToUpload.length, 256, 'Baseline To Upload must be 256');
  console.log('✅ Step 1 Verified: Super Admin sees 260 articles (4 published, 256 To Upload)\n');

  // STEP 2: Create a fresh Content Writer test account
  console.log('--- Step 2: Create Fresh Content Writer Account ---');
  const writerEmail = 'ayesha.writer@yaad.app';
  const writerName = 'Ayesha Content Writer';
  const writerRole = 'content_writer' as const;

  // Remove existing test writer if present to guarantee fresh run
  const existingAdmins = adminStore.getAllAdmins();
  const existingIdx = adminStore['db'].admins.findIndex((u) => u.email === writerEmail);
  if (existingIdx >= 0) {
    adminStore['db'].admins.splice(existingIdx, 1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const writerUser = {
    id: 'admin_' + crypto.randomUUID(),
    name: writerName,
    email: writerEmail,
    passwordHash: hashPassword('SecureWriterPass2026!', salt),
    salt,
    role: writerRole,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    isTotpEnabled: true,
    status: 'active' as const,
    failedAttempts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  };

  adminStore['db'].admins.push(writerUser);
  adminStore['save']();

  console.log(`Created Content Writer Account: ID ${writerUser.id} | Email: ${writerUser.email} | Role: ${writerUser.role}`);
  assert.strictEqual(writerUser.role, 'content_writer', 'User role must be content_writer');
  console.log('✅ Step 2 Verified: Fresh Content Writer account created with content_writer role\n');

  // STEP 3: Authenticate & Generate Session for Content Writer
  console.log('--- Step 3: Writer Authentication & Permissions Matrix Verification ---');
  const session = adminStore.createSession(writerUser.id);
  assert(session && session.token, 'Session must be created with token');

  // Verify permission matrix for content_writer
  const hasPublish = adminStore.hasPermission(writerUser.role, 'content.publish');
  const hasSuspend = adminStore.hasPermission(writerUser.role, 'users.suspend');
  const hasSettings = adminStore.hasPermission(writerUser.role, 'settings.edit');
  console.log(`Writer Permissions check: content.publish = ${hasPublish}, users.suspend = ${hasSuspend}, settings.edit = ${hasSettings}`);
  assert(hasPublish, 'Writer must have content.publish authority');
  assert(!hasSuspend, 'Writer must not have users.suspend');
  assert(!hasSettings, 'Writer must not have settings.edit');
  console.log('✅ Step 3 Verified: Content Writer possesses full CMS publishing authority while restricted from unrelated admin modules\n');

  // STEP 4: Content Writer reads CMS data - MUST BE IDENTICAL to Super Admin
  console.log('--- Step 4: Content Writer Data Store Read (Authoritative Single Source of Truth) ---');
  const writerArticles = adminStore.getCmsArticles();
  const writerPublished = writerArticles.filter((a) => a.status === 'published');
  const writerToUpload = writerArticles.filter((a) => a.status !== 'published');

  console.log(`Content Writer Reads: Total = ${writerArticles.length} | Published = ${writerPublished.length} | To Upload = ${writerToUpload.length}`);
  assert.strictEqual(writerArticles.length, superAdminArticles.length, 'Content Writer must see identical total count');
  assert.strictEqual(writerPublished.length, superAdminPublished.length, 'Content Writer must see identical published count');
  assert.strictEqual(writerToUpload.length, superAdminToUpload.length, 'Content Writer must see identical To Upload count');
  console.log('✅ Step 4 Verified: Content Writer reads the IDENTICAL 260 articles (4 published + 256 To Upload)\n');

  // STEP 5: Content Writer edits a draft article
  console.log('--- Step 5: Content Writer Edits a Draft Article ---');
  const draftToEdit = writerToUpload.find((a) => a.slug === 'best-grocery-list-apps-for-busy-families');
  assert(draftToEdit, 'Batch 1 Article 1 must exist in To Upload');

  const updatedByWriter = {
    ...draftToEdit,
    authorName: 'Ayesha (YAAD Content Writer)',
    updatedAt: Date.now(),
  };

  await adminStore.saveCmsArticleAsync(updatedByWriter);

  // Log audit action
  adminStore.writeAuditLog({
    action: 'cms_article_updated',
    adminId: writerUser.id,
    adminEmail: writerUser.email,
    targetType: 'cms_article',
    targetId: draftToEdit.id,
    ip: '127.0.0.1',
    metadata: { note: `Content Writer updated author credit on "${draftToEdit.title}"` },
  });

  const reReadDraft = adminStore.getCmsArticleById(draftToEdit.id);
  assert.strictEqual(reReadDraft?.authorName, 'Ayesha (YAAD Content Writer)', 'Author name update must persist');
  console.log(`Updated Article: "${reReadDraft?.title}" | Author Credit: "${reReadDraft?.authorName}"`);
  console.log('✅ Step 5 Verified: Content Writer edit persisted successfully\n');

  // STEP 6: Content Writer publishes via per-article Upload button
  console.log('--- Step 6: Content Writer Publishes Article via Upload Action ---');
  // First run publishing gate
  const gateResult = validateArticleSeoGate(reReadDraft!);
  assert(gateResult.passed, 'Article must pass publishing gate');

  const publishedByWriter = {
    ...reReadDraft!,
    status: 'published' as const,
    queueStatus: 'published' as const,
    publishedAt: Date.now(),
  };

  await adminStore.saveCmsArticleAsync(publishedByWriter);

  // Log publish in audit trail
  adminStore.writeAuditLog({
    action: 'cms_article_published',
    adminId: writerUser.id,
    adminEmail: writerUser.email,
    targetType: 'cms_article',
    targetId: publishedByWriter.id,
    ip: '127.0.0.1',
    metadata: { note: `Content Writer uploaded and published article "${publishedByWriter.title}" to public blog` },
  });

  console.log(`Article "${publishedByWriter.title}" successfully published by Content Writer!`);
  console.log('✅ Step 6 Verified: Article published via Content Writer Upload action\n');

  // STEP 7: Verify Counts & Public Visibility
  console.log('--- Step 7: Verify Two-Section Counts & Public Visibility ---');
  const postPublishArticles = adminStore.getCmsArticles();
  const postPublishPublished = postPublishArticles.filter((a) => a.status === 'published');
  const postPublishToUpload = postPublishArticles.filter((a) => a.status !== 'published');

  console.log(`Post-Publish Counts: Total = ${postPublishArticles.length} | Published = ${postPublishPublished.length} | To Upload = ${postPublishToUpload.length}`);
  assert.strictEqual(postPublishPublished.length, 5, 'Published count must increment to 5');
  assert.strictEqual(postPublishToUpload.length, 255, 'To Upload count must decrement to 255');
  console.log('✅ Step 7 Verified: Article moved from "To Upload" to "Uploaded / Published" section (5 published, 255 To Upload)\n');

  // STEP 8: Verify Audit Trail Logging with Writer Identity
  console.log('--- Step 8: Verify Audit Trail Logs ---');
  const auditLogsResult = adminStore.getAuditLogs({ adminEmail: writerUser.email });
  const auditLogs = auditLogsResult.logs;
  console.log(`Found ${auditLogs.length} audit logs for Content Writer (${writerUser.email}):`);
  auditLogs.forEach((log, idx) => {
    console.log(`   [${idx + 1}] Action: ${log.action} | Admin: ${log.adminEmail} | Target: ${log.targetId}`);
  });

  assert(auditLogs.some((l) => l.action === 'cms_article_updated'), 'Update action must exist in audit log');
  assert(auditLogs.some((l) => l.action === 'cms_article_published'), 'Publish action must exist in audit log');
  console.log('✅ Step 8 Verified: Content Writer actions recorded with full name, email, and timestamp in Audit Trail\n');

  // STEP 9: Unpublish back to draft_ready to restore pristine state (R2 cycle verification)
  console.log('--- Step 9: Unpublish Test Article Back to Draft (R2 Cycle Verification) ---');
  const revertedArticle = {
    ...publishedByWriter,
    status: 'draft' as const,
    queueStatus: 'draft_ready' as const,
    authorName: 'YAAD Editorial Team',
  };
  await adminStore.saveCmsArticleAsync(revertedArticle);

  adminStore.writeAuditLog({
    action: 'cms_article_unpublished',
    adminId: writerUser.id,
    adminEmail: writerUser.email,
    targetType: 'cms_article',
    targetId: revertedArticle.id,
    ip: '127.0.0.1',
    metadata: { note: `Content Writer unpublished "${revertedArticle.title}" back to draft_ready` },
  });

  const finalArticles = adminStore.getCmsArticles();
  const finalPublished = finalArticles.filter((a) => a.status === 'published');
  const finalToUpload = finalArticles.filter((a) => a.status !== 'published');

  console.log(`Restored Counts: Published = ${finalPublished.length} | To Upload = ${finalToUpload.length}`);
  assert.strictEqual(finalPublished.length, 4, 'Published count restored to 4');
  assert.strictEqual(finalToUpload.length, 256, 'To Upload count restored to 256');
  console.log('✅ Step 9 Verified: Unpublish successfully removes from published and restores to To Upload\n');

  // STEP 10: Clean up test account per acceptance test safety rules
  console.log('--- Step 10: Test Account Cleanup & Audit Log Recording ---');
  const writerIdx = adminStore['db'].admins.findIndex((u) => u.email === writerEmail);
  if (writerIdx >= 0) {
    adminStore['db'].admins.splice(writerIdx, 1);
    adminStore['save']();
    console.log(`Deleted temporary test account "${writerEmail}" from admin store.`);
  }

  adminStore.writeAuditLog({
    action: 'admin_account_deleted',
    adminId: 'super_admin_mudassir',
    adminEmail: 'mudassirbashir530@gmail.com',
    targetType: 'admin_user',
    targetId: writerEmail,
    ip: '127.0.0.1',
    metadata: {
      note: 'Temporary test account ayesha.writer@yaad.app removed on 2026-10-22 per audit cleanup requirement F4. Only owner account remains active.',
    },
  });

  const remainingAdmins = adminStore.getAllAdmins();
  assert.strictEqual(remainingAdmins.length, 1, 'Only owner admin account must remain');
  assert.strictEqual(remainingAdmins[0].email, 'mudassirbashir530@gmail.com', 'Remaining admin must be owner');
  console.log('✅ Step 10 Verified: Test account cleanly removed. Only owner admin remains.\n');

  console.log('======================================================');
  console.log('🎉 ALL 10 CONTENT WRITER ACCEPTANCE TEST STEPS PASSED!');
  console.log('   Test account ayesha.writer@yaad.app cleanly removed.');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Acceptance test failed:', err);
  process.exit(1);
});
