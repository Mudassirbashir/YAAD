import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

interface SimulatedCrawlRecord {
  route: string;
  expectedStatus: number;
  expectedIndexable: boolean;
  expectedCanonical: string | null;
  expectedTitleSnippet: string;
  expectedLanguage: string;
  hasJsonLd: boolean;
  isInSitemap: boolean;
}

const PRODUCTION_HOST = 'https://yaad-mudassirbashir530-creators-projects.vercel.app';

// 1. All Public Priority Routes (Base + Multilingual Alternates)
const PUBLIC_CRAWL_ROUTES: SimulatedCrawlRecord[] = [
  // Priority 1: High-Impact Core Pages
  {
    route: '/',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/`,
    expectedTitleSnippet: 'YAAD',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/about',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/about`,
    expectedTitleSnippet: 'About YAAD',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/help',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/help`,
    expectedTitleSnippet: 'Help & FAQ',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  // Priority 2: Legal, Trust & Compliance
  {
    route: '/terms',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/terms`,
    expectedTitleSnippet: 'Terms',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/privacy',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/privacy`,
    expectedTitleSnippet: 'Privacy Policy',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/legal',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/legal`,
    expectedTitleSnippet: 'Legal',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  // Priority 3: Localized Variations (Urdu Nastaliq & Roman Urdu)
  {
    route: '/?lang=ur',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/?lang=ur`,
    expectedTitleSnippet: 'یاد',
    expectedLanguage: 'ur-PK',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/?lang=roman-urdu',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/?lang=roman-urdu`,
    expectedTitleSnippet: 'YAAD',
    expectedLanguage: 'ur-Latn',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/about?lang=ur',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/about?lang=ur`,
    expectedTitleSnippet: 'یاد',
    expectedLanguage: 'ur-PK',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/about?lang=roman-urdu',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/about?lang=roman-urdu`,
    expectedTitleSnippet: 'About YAAD',
    expectedLanguage: 'ur-Latn',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/help?lang=ur',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/help?lang=ur`,
    expectedTitleSnippet: 'مدد',
    expectedLanguage: 'ur-PK',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/help?lang=roman-urdu',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/help?lang=roman-urdu`,
    expectedTitleSnippet: 'Madad',
    expectedLanguage: 'ur-Latn',
    hasJsonLd: true,
    isInSitemap: true,
  },
  // Phase 4: Monthly Rashan List & Pantry Guide
  {
    route: '/rashan-list',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/rashan-list`,
    expectedTitleSnippet: 'Rashan',
    expectedLanguage: 'en',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/rashan-list?lang=ur',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/rashan-list?lang=ur`,
    expectedTitleSnippet: 'راشن',
    expectedLanguage: 'ur-PK',
    hasJsonLd: true,
    isInSitemap: true,
  },
  {
    route: '/rashan-list?lang=roman-urdu',
    expectedStatus: 200,
    expectedIndexable: true,
    expectedCanonical: `${PRODUCTION_HOST}/rashan-list?lang=roman-urdu`,
    expectedTitleSnippet: 'Rashan',
    expectedLanguage: 'ur-Latn',
    hasJsonLd: true,
    isInSitemap: true,
  },
];

// 2. All Private / Authenticated Routes (Must NEVER be indexable or leaked)
const PRIVATE_CRAWL_ROUTES: string[] = [
  '/home',
  '/lists/test-list-id-123',
  '/lists/test-list-id-123/details',
  '/lists/test-list-id-123/edit',
  '/history',
  '/history/test-session-456',
  '/settings',
  '/settings/profile',
  '/settings/security',
  '/settings/language',
  '/settings/preferences',
  '/settings/about',
  '/create',
  '/create/items',
  '/add-items',
  '/stats',
  '/statistics',
  '/auth',
  '/reset-password',
  '/profile-setup',
  '/onboarding',
];

async function runCrawlSimulation() {
  console.log('\n======================================================');
  console.log('YAAD PRODUCTION SEARCH ENGINE CRAWL SIMULATION (PHASE 3)');
  console.log('======================================================\n');

  const sitemapContent = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf-8');
  const robotsContent = fs.readFileSync(path.join(process.cwd(), 'public', 'robots.txt'), 'utf-8');

  // --- 1. Audit Public Routes ---
  console.log('--- 1. Testing Public & Localized Indexable Endpoints ---');
  for (const item of PUBLIC_CRAWL_ROUTES) {
    // Verify Sitemap presence
    const cleanSitemapTarget = item.route === '/' ? PRODUCTION_HOST + '/' : PRODUCTION_HOST + item.route;
    const isPresentInSitemap = sitemapContent.includes(`<loc>${cleanSitemapTarget}</loc>`);
    assert(isPresentInSitemap === item.isInSitemap, `Route ${item.route} matches sitemap inclusion policy (${isPresentInSitemap})`);

    // Verify robots.txt does not disallow the base path
    const basePath = item.route.split('?')[0];
    const isDisallowedInRobots = robotsContent.includes(`Disallow: ${basePath}`) && !robotsContent.includes(`Allow: ${basePath}`);
    assert(!isDisallowedInRobots, `Route ${item.route} is not blocked by robots.txt`);
  }

  // --- 2. Audit Private / Authenticated Routes ---
  console.log('\n--- 2. Testing Private & Authenticated Protection Shield ---');
  for (const privatePath of PRIVATE_CRAWL_ROUTES) {
    // 1. Must NOT exist in sitemap.xml
    assert(!sitemapContent.includes(privatePath), `Private route ${privatePath} is NOT present in sitemap.xml`);

    // 2. Must be blocked by robots.txt pattern
    const prefix = privatePath.split('/')[1]; // e.g. lists, history, settings, create, stats
    const isExplicitlyDisallowed = robotsContent.includes(`Disallow: /${prefix}/`) ||
                                   robotsContent.includes(`Disallow: /${prefix}`) ||
                                   robotsContent.includes(`Disallow: ${privatePath}`);
    assert(isExplicitlyDisallowed, `Private route ${privatePath} is covered by robots.txt Disallow rule`);
  }

  // --- 3. Verify IndexNow Servability ---
  console.log('\n--- 3. Testing IndexNow Protocol Endpoint Servability ---');
  const indexNowKey = '8f21b34e6c9941a8b9e652a912d0831f';
  const indexNowFilePath = path.join(process.cwd(), 'public', `${indexNowKey}.txt`);
  assert(fs.existsSync(indexNowFilePath), `IndexNow key file exists at /public/${indexNowKey}.txt`);
  const indexNowFileContent = fs.readFileSync(indexNowFilePath, 'utf-8').trim();
  assert(indexNowFileContent === indexNowKey, 'IndexNow key file content strictly matches key token');

  console.log('\n🎉 ALL CRAWL SIMULATION & CRAWLER SAFETY CHECKS PASSED!\n');
}

runCrawlSimulation().catch((err) => {
  console.error('Crawl simulation failed:', err);
  process.exit(1);
});
