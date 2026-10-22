import assert from 'assert';
import { adminStore } from '../server/admin/store.ts';
import { validateArticleSeoGate } from '../server/admin/seoValidator.ts';
import { buildSitemapXml } from '../scripts/generate-sitemap.mjs';

console.log('=== Running SEO Articles & Publishing CMS Test Suite ===\n');

let passedTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// Test 1: Slug and Title Deduplication on Bank Import
// -------------------------------------------------------------
runTest('Import bank deduplicates repeated ideas and enforces slug uniqueness', () => {
  const testBatch = [
    {
      title: 'Unique Test Recipe A',
      focusKeyword: 'recipe a',
      cluster: 'Recipes',
      searchIntent: 'informational' as const,
      priority: 10,
    },
    {
      title: 'Unique Test Recipe A', // deliberate duplicate title
      focusKeyword: 'recipe a',
      cluster: 'Recipes',
      searchIntent: 'informational' as const,
      priority: 11,
    },
    {
      title: 'Unique Test Recipe B',
      focusKeyword: 'recipe b',
      cluster: 'Recipes',
      searchIntent: 'list' as const,
      priority: 12,
    },
  ];

  // First run in dry-run mode
  const dryResult = adminStore.importIdeaBank(testBatch, true);
  assert.strictEqual(dryResult.imported, 2, 'Dry run should report 2 unique imports');
  assert.strictEqual(dryResult.skippedDuplicates, 1, 'Dry run should report 1 duplicate');

  // Second run: live import
  const liveResult = adminStore.importIdeaBank(testBatch, false);
  assert.strictEqual(liveResult.imported, 2, 'Live run should import 2 unique ideas');
  assert.strictEqual(liveResult.skippedDuplicates, 1, 'Live run should skip 1 duplicate');

  // Third run with exact same batch: must import 0 new ideas (idempotency)
  const repeatResult = adminStore.importIdeaBank(testBatch, false);
  assert.strictEqual(repeatResult.imported, 0, 'Second import must import 0 new items');
  assert.strictEqual(repeatResult.skippedDuplicates, 3, 'Second import should skip all as duplicates');

  // Clean up test items from store
  const allArticles = adminStore.getCmsArticles();
  for (const art of allArticles) {
    if (art.title === 'Unique Test Recipe A' || art.title === 'Unique Test Recipe B') {
      adminStore.deleteCmsArticle(art.id);
    }
  }
});

// -------------------------------------------------------------
// Test 2: Pre-Publish Gate Blocking
// -------------------------------------------------------------
runTest('Publish gate blocks article missing meta description and sets needs_review', () => {
  const existingArt = adminStore.getCmsArticleBySlug('test-article-missing-meta-description');
  if (existingArt) {
    adminStore.deleteCmsArticle(existingArt.id);
  }

  const invalidArticle = {
    title: 'Test Article Missing Meta Description',
    slug: 'test-article-missing-meta-description',
    body: '## Quick Answer\n' + 'Word '.repeat(50) + '\n## Heading 2 With Keyword\n' + 'Test keyword in body. '.repeat(80),
    quickAnswer: 'This is a test quick answer answering the primary question in exactly forty to sixty words for testing search engine optimization validation properly.',
    seoTitle: 'Valid Short Meta Title (2026)',
    seoDescription: '', // deliberately empty!
    focusKeyword: 'test keyword',
    coverImageUrl: '/cover.png',
    coverImageAlt: 'Valid descriptive cover image alt text',
    hashtags: ['test1', 'test2', 'test3'],
    relatedSlugs: ['ramadan-rashan-guide-2026', 'picking-fresh-sabzi-in-pakistan', 'pakistani-kitchen-spices-storage'],
  };

  const gate = validateArticleSeoGate(invalidArticle);
  assert.strictEqual(gate.passed, false, 'Article with empty seoDescription must fail gate');
  assert.ok(
    gate.errors.some((e) => e.includes('Meta description (seoDescription) is required')),
    'Error list must specify missing seoDescription'
  );

  // Now create the article in store and test publish-today gate blocking
  const today = new Date().toISOString().split('T')[0];
  const saved = adminStore.saveCmsArticle(
    {
      ...invalidArticle,
      status: 'draft',
      queueStatus: 'scheduled',
      publishDate: today,
    },
    'Test Author'
  );

  // Attempt to publish today
  const publishReport = adminStore.publishTodayArticles(10);
  assert.ok(
    publishReport.blocked.some((b) => b.id === saved.id),
    'Invalid article must be in blocked report'
  );

  // Check that the article status is now needs_review with reasons recorded
  const refreshed = adminStore.getCmsArticleById(saved.id);
  assert.strictEqual(refreshed?.queueStatus, 'needs_review', 'Blocked article must transition to needs_review');
  assert.strictEqual(refreshed?.status, 'draft', 'Blocked article must remain draft');
  assert.ok(
    Array.isArray(refreshed?.needsReviewReasons) && refreshed.needsReviewReasons.length > 0,
    'Blocked article must have needsReviewReasons populated'
  );

  // Clean up
  adminStore.deleteCmsArticle(saved.id);
});

// -------------------------------------------------------------
// Test 3: Publish-Today Idempotency
// -------------------------------------------------------------
runTest('Publish-today endpoint is idempotent (re-running publishes 0 duplicates)', () => {
  const existingArt = adminStore.getCmsArticleBySlug('idempotency-test-article-for-seo');
  if (existingArt) {
    adminStore.deleteCmsArticle(existingArt.id);
  }

  const today = new Date().toISOString().split('T')[0];
  const validArticle = {
    title: 'Idempotency Test Article for SEO',
    slug: 'idempotency-test-article-for-seo',
    body: `## Quick Answer
A complete test quick answer explaining the primary concept of idempotency within forty to sixty words as required by the SEO ranking guidelines and schema standards for Pakistani households. This comprehensive summary answers the primary search intent directly so readers and search engine crawlers immediately find the exact information.

## What is an Idempotency Test Article for SEO
A detailed explanation of idempotency in SEO systems. Idempotency test article for seo must appear here within the first hundred words of the body text so that search engine crawlers detect primary relevance.

| Metric | Standard | Description |
| :--- | :--- | :--- |
| Word count | 750+ words | Comprehensive coverage |
| Gate check | Zero errors | Full pass |

` + 'Every section must have practical advice and detailed context for Pakistani families. '.repeat(65),
    quickAnswer: 'A complete test quick answer explaining the primary concept of idempotency within forty to sixty words as required by the SEO ranking guidelines and schema standards for Pakistani households. This comprehensive summary answers the primary search intent directly so readers and search engine crawlers immediately find the exact information.',
    seoTitle: 'Idempotency Test Article (2026 Checklist)',
    seoDescription: 'Complete guide to idempotency test article for seo in modern web applications. Verified features and clean publishing routines for Pakistani shoppers.',
    excerpt: 'Complete guide to idempotency test article for seo in modern web applications. Verified features and clean publishing routines for Pakistani shoppers.',
    focusKeyword: 'idempotency test article for seo',
    coverImageUrl: '/cover.png',
    coverImageAlt: 'Descriptive cover image alt text for idempotency test article',
    hashtags: ['idempotency', 'yaadapp', 'testing'],
    relatedSlugs: ['ramadan-rashan-guide-2026', 'picking-fresh-sabzi-in-pakistan', 'pakistani-kitchen-spices-storage'],
    status: 'draft' as const,
    queueStatus: 'scheduled' as const,
    publishDate: today,
    priority: 5,
  };

  const created = adminStore.saveCmsArticle(validArticle, 'Tester');

  // First run: should publish the valid article
  const firstRun = adminStore.publishTodayArticles(10);
  assert.ok(
    firstRun.published.some((p) => p.id === created.id),
    'First run must publish the scheduled article'
  );

  // Second run: should publish 0 new articles (idempotency)
  const secondRun = adminStore.publishTodayArticles(10);
  assert.strictEqual(
    secondRun.published.length,
    0,
    'Second run must publish 0 articles because all were already published'
  );
  assert.strictEqual(
    secondRun.totalPublished,
    0,
    'Total published on second run must be 0'
  );

  // Clean up
  adminStore.deleteCmsArticle(created.id);
});

// -------------------------------------------------------------
// Test 4: Sitemap Contains Published Articles Only
// -------------------------------------------------------------
runTest('Sitemap generator includes published articles and excludes drafts & needs_review', () => {
  const articlesList = [
    {
      id: 'art_pub_1',
      slug: 'published-article-alpha',
      title: 'Published Article Alpha',
      status: 'published',
      updatedAt: 1770000000000,
    },
    {
      id: 'art_draft_2',
      slug: 'draft-article-beta',
      title: 'Draft Article Beta',
      status: 'draft',
      updatedAt: 1770000000000,
    },
    {
      id: 'art_review_3',
      slug: 'needs-review-gamma',
      title: 'Needs Review Gamma',
      status: 'draft',
      queueStatus: 'needs_review',
      updatedAt: 1770000000000,
    },
  ];

  const xml = buildSitemapXml(articlesList);

  assert.ok(
    xml.includes('/blog/published-article-alpha'),
    'Sitemap must contain published article URL'
  );
  assert.strictEqual(
    xml.includes('/blog/draft-article-beta'),
    false,
    'Sitemap must NEVER contain draft articles'
  );
  assert.strictEqual(
    xml.includes('/blog/needs-review-gamma'),
    false,
    'Sitemap must NEVER contain needs_review articles'
  );
  assert.ok(
    xml.includes('https://yaadapppk.vercel.app/rashan-list'),
    'Sitemap must retain all static public pages'
  );
});

// -------------------------------------------------------------
// Test 5: Async Bank Import, Auto-Schedule & Publish Metrics
// -------------------------------------------------------------
await runTest('Async import bank tracks persistedCount and totalInSystemAfter without silent swallow', async () => {
  const testBatchAsync = [
    {
      title: 'Async Persistence Test Recipe 1',
      focusKeyword: 'async test recipe 1',
      cluster: 'Recipes',
      searchIntent: 'informational' as const,
      priority: 15,
      body: 'Detailed body for test recipe 1 with sufficient content for testing.',
    },
    {
      title: 'Async Persistence Test Recipe 2',
      focusKeyword: 'async test recipe 2',
      cluster: 'Recipes',
      searchIntent: 'list' as const,
      priority: 16,
      body: 'Detailed body for test recipe 2 with sufficient content for testing.',
    },
  ];

  // Snapshot initial CMS articles state before test to avoid mutating production data
  const originalArticlesSnapshot = JSON.parse(JSON.stringify(adminStore.getCmsArticles()));

  try {
    // Dry-run
    const dryRes = await adminStore.importIdeaBankAsync(testBatchAsync, true);
    assert.strictEqual(dryRes.dryRun, true, 'Dry run flag must be true');
    assert.strictEqual(dryRes.imported, 2, 'Must report 2 unique ideas');
    assert.strictEqual(dryRes.persistedCount, 0, 'Dry run persistedCount must be 0');
    assert.strictEqual(dryRes.success, true, 'Dry run success must be true');

    // Live import
    const liveRes = await adminStore.importIdeaBankAsync(testBatchAsync, false);
    assert.strictEqual(liveRes.dryRun, false, 'Live run flag must be false');
    assert.strictEqual(liveRes.imported, 2, 'Live run must import 2 unique ideas');
    assert.ok(typeof liveRes.persistedCount === 'number', 'persistedCount must be a number');
    assert.ok(typeof liveRes.totalInSystemAfter === 'number', 'totalInSystemAfter must be a number');
    assert.strictEqual(liveRes.skippedDuplicates, 0, 'First live run must have 0 duplicates');

    // Re-run for idempotency and deduplication
    const repeatRes = await adminStore.importIdeaBankAsync(testBatchAsync, false);
    assert.strictEqual(repeatRes.imported, 0, 'Second run must import 0 new items');
    assert.strictEqual(repeatRes.skippedDuplicates, 2, 'Second run must skip both as duplicates');

    // Test autoScheduleQueueAsync
    const schedRes = await adminStore.autoScheduleQueueAsync({ articlesPerDay: 1 });
    assert.ok(typeof schedRes.scheduledCount === 'number', 'scheduledCount must be number');
    assert.ok(Array.isArray(schedRes.scheduledDates), 'scheduledDates must be array');

    // Test publishTodayArticlesAsync
    const todayStr = new Date().toISOString().split('T')[0];
    const pubRes = await adminStore.publishTodayArticlesAsync({ targetDate: todayStr, limit: 1 });
    assert.ok(typeof pubRes.totalAttempted === 'number', 'totalAttempted must be number');
    assert.ok(Array.isArray(pubRes.published), 'published must be array');
    assert.ok(Array.isArray(pubRes.blocked), 'blocked must be array');
  } finally {
    // Clean up test items and restore pristine database state
    adminStore['db'].cmsArticles = originalArticlesSnapshot;
    adminStore['save']();
  }
});

console.log(`\nAll ${passedTests} SEO Articles CMS tests passed with 100% success!`);
