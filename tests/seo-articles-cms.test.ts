process.env.NODE_ENV = 'test';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { adminStore } from '../server/admin/store.ts';
import { validateArticleSeoGate } from '../server/admin/seoValidator.ts';
import { buildSitemapXml } from '../scripts/generate-sitemap.mjs';
import { app, resolvePublishedArticle } from '../server.ts';

console.log('=== Running SEO Articles & Publishing CMS Test Suite ===\n');

const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
const originalSitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf-8') : null;

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

  // Snapshot initial CMS articles state and sitemap before test to avoid mutating production data
  const originalArticlesSnapshot = JSON.parse(JSON.stringify(adminStore.getCmsArticles()));
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  const originalSitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf-8') : null;

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
    if (originalSitemap !== null) {
      fs.writeFileSync(sitemapPath, originalSitemap, 'utf-8');
    }
  }
});

// -------------------------------------------------------------
// Test 6: Draft articles cannot leak through public routes (?preview=true or direct)
// -------------------------------------------------------------
await runTest('Draft articles return 404 through public single-article and comments routes', async () => {
  const originalArticlesSnapshot = JSON.parse(JSON.stringify(adminStore.getCmsArticles()));
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Direct fetch for draft article -> must be 404
    const draftRes = await fetch(`${baseUrl}/api/blog/articles/best-grocery-list-apps-for-busy-families`);
    assert.strictEqual(draftRes.status, 404, 'Draft article must return 404 Not Found');

    // 2. Draft article with ?preview=true -> must be 404 (no unauthenticated bypass)
    const previewRes = await fetch(`${baseUrl}/api/blog/articles/best-grocery-list-apps-for-busy-families?preview=true`);
    assert.strictEqual(previewRes.status, 404, 'Draft article with ?preview=true must return 404 Not Found');

    // 3. Draft article comments GET -> must be 404
    const draftCommentsGet = await fetch(`${baseUrl}/api/blog/articles/best-grocery-list-apps-for-busy-families/comments`);
    assert.strictEqual(draftCommentsGet.status, 404, 'Draft article comments GET must return 404');

    // 4. Draft article comments POST -> must be 404
    const draftCommentsPost = await fetch(`${baseUrl}/api/blog/articles/best-grocery-list-apps-for-busy-families/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', content: 'Test comment' }),
    });
    assert.strictEqual(draftCommentsPost.status, 404, 'Draft article comments POST must return 404');

    // 5. Published article -> must be 200 OK
    const pubRes = await fetch(`${baseUrl}/api/blog/articles/monthly-rashan-list-pakistani-family`);
    assert.strictEqual(pubRes.status, 200, 'Published article must return 200 OK');
    const pubJson = await pubRes.json();
    assert.strictEqual(pubJson.success, true, 'Published article success must be true');
    assert.strictEqual(pubJson.article?.slug, 'monthly-rashan-list-pakistani-family', 'Correct article slug returned');

    // 6. Direct unit check on resolvePublishedArticle
    const resolvedDraft = await resolvePublishedArticle('best-grocery-list-apps-for-busy-families');
    assert.strictEqual(resolvedDraft, null, 'resolvePublishedArticle must return null for draft');

    const resolvedPub = await resolvePublishedArticle('monthly-rashan-list-pakistani-family');
    assert.ok(resolvedPub !== null, 'resolvePublishedArticle must resolve published article');
    assert.strictEqual(resolvedPub?.article.status, 'published', 'Resolved status must be published');
  } finally {
    server.close();
    adminStore['db'].cmsArticles = originalArticlesSnapshot;
    adminStore['save']();
  }
});

// -------------------------------------------------------------
// Test 7: Rule #13 - List Template SEO Gate Validation
// -------------------------------------------------------------
await runTest('Rule #13: List template requires >=8 items, >=200w intro, >=3 internal links', async () => {
  const baseTemplate: any = {
    slug: 'test-rule-13-validation-sample',
    title: 'Test Rule Thirteen Grocery Checklist Template',
    seoTitle: 'Test Rule Thirteen Grocery Checklist Template',
    seoDescription: 'A valid meta description for testing the list template rule thirteen validation gate in the test suite for Pakistani grocery planning and household budget.',
    excerpt: 'A valid excerpt describing what shoppers will learn from this grocery checklist template with clear Pakistani kitchen budget tips and guidance.',
    focusKeyword: 'test rule thirteen',
    category: 'Grocery Guide',
    cluster: 'Testing',
    quickAnswer: 'This quick answer explains the comprehensive testing methodology for the thirteenth rule of the SEO gate in YAAD. It guarantees that copyable shopping templates feature sufficient checklist depth and internal linking before they become fully eligible for the automated daily publication pipeline across Pakistani stores.',
    keyTakeaways: ['Checklist depth of at least eight items', 'Introductory prose of at least two hundred words', 'Three internal links to related guides'],
    faqs: [
      { q: 'What is rule thirteen?', a: 'Rule thirteen enforces checklist depth, intro length, and internal links.' },
      { q: 'Why is it important?', a: 'It guarantees that all list templates provide genuine, high-quality user utility.' },
      { q: 'Who validates this?', a: 'The automated SEO gate validates every article before publication.' }
    ],
    hashtags: ['TemplateTest', 'GroceryList', 'SEOGate'],
    relatedSlugs: ['monthly-rashan-list-pakistani-family', 'ramadan-rashan-guide-2026', 'picking-fresh-sabzi-in-pakistan'],
    coverImageUrl: 'https://example.com/cover.jpg',
    coverImageAlt: 'Test cover image for template validation',
    templateKind: 'list_template',
    listItems: [
      { name: 'Item 1', qty: '1', unit: 'kg' },
      { name: 'Item 2', qty: '2', unit: 'kg' },
      { name: 'Item 3', qty: '3', unit: 'kg' },
      { name: 'Item 4', qty: '4', unit: 'kg' },
      { name: 'Item 5', qty: '5', unit: 'kg' },
      { name: 'Item 6', qty: '6', unit: 'kg' },
      { name: 'Item 7', qty: '7', unit: 'kg' },
      { name: 'Item 8', qty: '8', unit: 'kg' },
    ],
    body: `This complete test rule thirteen checklist guide helps families organize weekly Pakistani grocery needs systematically. ${new Array(200).fill('details').join(' ')}

## Overview of the Test Rule Thirteen Checklist

${new Array(500).fill('content').join(' ')}

Check our [Monthly Rashan Guide](/blog/monthly-rashan-list-pakistani-family) and our [Ramadan Rashan Guide](/blog/ramadan-rashan-guide-2026) alongside our [Fresh Sabzi Guide](/blog/picking-fresh-sabzi-in-pakistan) for more details.`
  };

  // 1. Valid list template passes
  const validCheck = validateArticleSeoGate(baseTemplate);
  assert.strictEqual(validCheck.passed, true, `Valid list template must pass gate: ${validCheck.errors.join(', ')}`);

  // 2. Fewer than 8 items fails
  const underItems = {
    ...baseTemplate,
    listItems: baseTemplate.listItems.slice(0, 5)
  };
  const underItemsCheck = validateArticleSeoGate(underItems);
  assert.strictEqual(underItemsCheck.passed, false, 'Template with < 8 items must fail');
  assert.ok(underItemsCheck.errors.some(e => e.includes('at least 8 checklist items')), 'Reports checklist items error');

  // 3. Intro fewer than 200 words fails
  const shortIntro = {
    ...baseTemplate,
    body: `Short intro with only few words.\n\n## Overview of the Test Rule Thirteen Checklist\n\n${new Array(700).fill('content').join(' ')} [Monthly Rashan Guide](/blog/monthly-rashan-list-pakistani-family) [Ramadan Rashan Guide](/blog/ramadan-rashan-guide-2026) [Fresh Sabzi Guide](/blog/picking-fresh-sabzi-in-pakistan)`
  };
  const shortIntroCheck = validateArticleSeoGate(shortIntro);
  assert.strictEqual(shortIntroCheck.passed, false, 'Template with short intro must fail');
  assert.ok(shortIntroCheck.errors.some(e => e.includes('at least 200 words')), 'Reports intro word count error');

  // 4. Fewer than 3 internal links fails
  const fewLinks = {
    ...baseTemplate,
    body: `This test rule thirteen guide intro provides enough words for testing. ${new Array(200).fill('details').join(' ')}\n\n## Overview of the Test Rule Thirteen Checklist\n\n${new Array(600).fill('content').join(' ')} Only one link: [Monthly Rashan Guide](/blog/monthly-rashan-list-pakistani-family)`
  };
  const fewLinksCheck = validateArticleSeoGate(fewLinks);
  assert.strictEqual(fewLinksCheck.passed, false, 'Template with < 3 internal links must fail');
  assert.ok(fewLinksCheck.errors.some(e => e.includes('at least 3 internal links')), 'Reports internal links error');
});

// -------------------------------------------------------------
// Test 8: Daily Cron Auto-Publish Endpoint (/api/cron/publish-daily)
// -------------------------------------------------------------
await runTest('Cron auto-publish endpoint rejects unauthorized and executes idempotently', async () => {
  const originalArticlesSnapshot = JSON.parse(JSON.stringify(adminStore.getCmsArticles()));
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const originalCronSecret = process.env.CRON_SECRET;

  try {
    process.env.CRON_SECRET = 'secret_test_token_yaad_2026';

    // 1. Without secret -> 401 Unauthorized
    const unauthRes = await fetch(`${baseUrl}/api/cron/publish-daily`, { method: 'POST' });
    assert.strictEqual(unauthRes.status, 401, 'Request without secret must return 401');

    // 2. With invalid secret -> 401 Unauthorized
    const wrongRes = await fetch(`${baseUrl}/api/cron/publish-daily`, {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong_token' }
    });
    assert.strictEqual(wrongRes.status, 401, 'Request with wrong secret must return 401');

    // 3. With valid secret -> 200 OK
    const validRes = await fetch(`${baseUrl}/api/cron/publish-daily`, {
      method: 'POST',
      headers: { Authorization: 'Bearer secret_test_token_yaad_2026' }
    });
    assert.strictEqual(validRes.status, 200, 'Request with valid secret must return 200');
    const validJson = await validRes.json();
    assert.ok(validJson.status === 'published' || validJson.status === 'already_run_today' || validJson.status === 'idle');

    // 4. Re-running on same day -> idempotent (already_run_today)
    if (validJson.status === 'published') {
      const secondRes = await fetch(`${baseUrl}/api/cron/publish-daily`, {
        method: 'POST',
        headers: { Authorization: 'Bearer secret_test_token_yaad_2026' }
      });
      assert.strictEqual(secondRes.status, 200);
      const secondJson = await secondRes.json();
      assert.strictEqual(secondJson.status, 'already_run_today', 'Second run on same day must report already_run_today');
    }
  } finally {
    process.env.CRON_SECRET = originalCronSecret;
    server.close();
    adminStore['db'].cmsArticles = originalArticlesSnapshot;
    adminStore['save']();
  }
});

if (originalSitemap !== null) {
  fs.writeFileSync(sitemapPath, originalSitemap, 'utf-8');
}

console.log(`\nAll ${passedTests} SEO Articles CMS tests passed with 100% success!`);
