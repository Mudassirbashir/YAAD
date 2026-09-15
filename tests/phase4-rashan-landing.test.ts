import fs from 'fs';
import path from 'path';
import { parseRoute, isProtectedRoute, buildCanonicalPath } from '../src/router/routes';
import { SITE_CONFIG, getAbsoluteCanonicalUrl } from '../src/config/siteConfig';
import { RASHAN_ITEMS, RASHAN_CATEGORIES, RASHAN_FAQS, HOUSEHOLD_SIZE_PROFILES } from '../src/components/rashan/rashanData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n==================================================');
console.log('🧪 RUNNING YAAD SEO PHASE 4 VALIDATION SUITE');
console.log('==================================================\n');

// 1. Router & Canonical Route Resolution
console.log('--- 1. Router & Route ID Resolution ---');
const primaryRoute = parseRoute('/rashan-list');
assert(primaryRoute.routeId === 'rashan_list', 'parseRoute(/rashan-list) resolves to routeId: rashan_list');
assert(!primaryRoute.isProtected, '/rashan-list is NOT protected (publicly crawlable)');
assert(primaryRoute.canonicalPath === '/rashan-list', 'canonicalPath is strictly /rashan-list');

// Test friendly aliases route to rashan_list
const alias1 = parseRoute('/rashan');
assert(alias1.routeId === 'rashan_list', 'parseRoute(/rashan) resolves to rashan_list');
const alias2 = parseRoute('/rashan-ki-list');
assert(alias2.routeId === 'rashan_list', 'parseRoute(/rashan-ki-list) resolves to rashan_list');

assert(!isProtectedRoute('rashan_list'), 'isProtectedRoute(rashan_list) returns false');
assert(buildCanonicalPath('rashan_list') === '/rashan-list', 'buildCanonicalPath(rashan_list) yields /rashan-list');

// 2. SEO Site Configuration
console.log('\n--- 2. SEO Site Configuration ---');
const rashanConfig = SITE_CONFIG.pages.rashanList;
assert(!!rashanConfig, 'SITE_CONFIG.pages.rashanList exists');
assert(rashanConfig.isIndexable === true, 'rashanList is explicitly indexable');
assert(rashanConfig.canonicalPath === '/rashan-list', 'rashanList canonicalPath is /rashan-list');
assert(rashanConfig.title.en.includes('Rashan List'), 'English title contains Rashan List');
assert(rashanConfig.title.ur.includes('راشن'), 'Urdu title contains راشن');
assert(rashanConfig.title.romanUrdu.includes('Rashan'), 'Roman Urdu title contains Rashan');
assert(rashanConfig.description.en.length > 50, 'English description is thorough');
assert(rashanConfig.description.ur.length > 50, 'Urdu description is thorough');

// 3. Robots.txt Allow Rules
console.log('\n--- 3. Robots.txt Audit ---');
const robotsContent = fs.readFileSync(path.join(process.cwd(), 'public', 'robots.txt'), 'utf-8');
assert(robotsContent.includes('Allow: /rashan-list'), 'robots.txt contains Allow: /rashan-list');
assert(!robotsContent.includes('Disallow: /rashan-list'), 'robots.txt does NOT disallow /rashan-list');

// 4. Sitemap XML Audit
console.log('\n--- 4. Sitemap.xml Audit ---');
const sitemapContent = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf-8');
assert(
  sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/rashan-list</loc>'),
  'sitemap.xml contains English canonical loc for /rashan-list'
);
assert(
  sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/rashan-list?lang=ur</loc>'),
  'sitemap.xml contains Urdu loc for /rashan-list?lang=ur'
);
assert(
  sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/rashan-list?lang=roman-urdu</loc>'),
  'sitemap.xml contains Roman Urdu loc for /rashan-list?lang=roman-urdu'
);
assert(
  sitemapContent.includes('hreflang="ur-PK" href="https://yaad-mudassirbashir530-creators-projects.vercel.app/rashan-list?lang=ur"'),
  'sitemap.xml includes valid xhtml:link hreflang="ur-PK" for /rashan-list'
);

// 5. Content Data Layer Quality (Anti-Spam & Real Utility)
console.log('\n--- 5. Content Data Layer & Grocery Taxonomy ---');
assert(RASHAN_ITEMS.length >= 25, `High-density curated item collection (actual: ${RASHAN_ITEMS.length} items)`);
assert(RASHAN_CATEGORIES.length >= 6, `Comprehensive pantry categories (actual: ${RASHAN_CATEGORIES.length})`);
assert(RASHAN_FAQS.length >= 5, `Realistic Pakistani shopping FAQs (actual: ${RASHAN_FAQS.length})`);
assert(HOUSEHOLD_SIZE_PROFILES.length === 3, 'Includes 3 household quantity scaling profiles (2-3, 4-6, 7+ persons)');

// Verify Pakistani staple items exist
const hasAtta = RASHAN_ITEMS.some((i) => i.id === 'atta' && i.name.ur.includes('آٹا'));
const hasChawal = RASHAN_ITEMS.some((i) => i.id === 'basmati-rice' && i.name.ur.includes('چاول'));
const hasGhee = RASHAN_ITEMS.some((i) => i.id === 'oil-ghee' && i.name.romanUrdu.toLowerCase().includes('ghee'));
const hasChanaDaal = RASHAN_ITEMS.some((i) => i.id.includes('chana') && i.category === 'pulses');

assert(hasAtta, 'Curated items contain Chakki Atta with Urdu & Roman Urdu names');
assert(hasChawal, 'Curated items contain Basmati Rice with Urdu & Roman Urdu names');
assert(hasGhee, 'Curated items contain Ghee / Cooking Oil');
assert(hasChanaDaal, 'Curated items contain Daal Chana categorized under pulses');

// 6. Private Route Defense Unbroken
console.log('\n--- 6. Private Route Shielding Verification ---');
const privateRoutes = ['/home', '/lists/xyz', '/history', '/settings', '/stats'];
privateRoutes.forEach((route) => {
  const parsed = parseRoute(route);
  assert(parsed.isProtected, `Private route ${route} remains protected`);
  assert(robotsContent.includes(`Disallow: /${route.split('/')[1]}`), `robots.txt disallows /${route.split('/')[1]}`);
});

console.log('\n==================================================');
console.log('🎉 ALL YAAD SEO PHASE 4 VALIDATIONS PASSED!');
console.log('==================================================\n');
