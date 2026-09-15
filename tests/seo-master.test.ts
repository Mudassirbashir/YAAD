import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runSeoTests() {
  console.log('\n========================================');
  console.log('YAAD SEO & ARCHITECTURAL VERIFICATION SUITE');
  console.log('========================================\n');

  // --- 1. Robots.txt Inspection ---
  console.log('--- 1. Robots.txt Compliance (RFC 9309) ---');
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  assert(fs.existsSync(robotsPath), 'public/robots.txt file exists');

  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  assert(robotsContent.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
  assert(robotsContent.includes('Allow: /'), 'robots.txt allows root public route');
  assert(robotsContent.includes('Allow: /about'), 'robots.txt allows /about');
  assert(robotsContent.includes('Allow: /help'), 'robots.txt allows /help');
  assert(robotsContent.includes('Allow: /terms'), 'robots.txt allows /terms');
  assert(robotsContent.includes('Allow: /privacy'), 'robots.txt allows /privacy');
  assert(robotsContent.includes('Allow: /legal'), 'robots.txt allows /legal');
  assert(robotsContent.includes('Allow: /rashan-list'), 'robots.txt allows /rashan-list');

  // Strict Private Data Safeguards
  assert(robotsContent.includes('Disallow: /lists/'), 'robots.txt explicitly disallows /lists/');
  assert(robotsContent.includes('Disallow: /history/'), 'robots.txt explicitly disallows /history/');
  assert(robotsContent.includes('Disallow: /settings/'), 'robots.txt explicitly disallows /settings/');
  assert(robotsContent.includes('Disallow: /create'), 'robots.txt explicitly disallows /create');
  assert(robotsContent.includes('Disallow: /stats'), 'robots.txt explicitly disallows /stats');
  assert(robotsContent.includes('Disallow: /reset-password'), 'robots.txt explicitly disallows /reset-password');
  assert(robotsContent.includes('Sitemap:'), 'robots.txt references production sitemap');

  // --- 2. XML Sitemap Inspection ---
  console.log('\n--- 2. XML Sitemap Inspection (sitemaps.org & Hreflang) ---');
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  assert(fs.existsSync(sitemapPath), 'public/sitemap.xml file exists');

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  assert(sitemapContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap has valid XML namespace');
  assert(sitemapContent.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'sitemap has valid XHTML namespace for hreflang');

  // Verify all 7 public indexable URLs are included
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/</loc>'), 'sitemap includes homepage loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/about</loc>'), 'sitemap includes /about loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/help</loc>'), 'sitemap includes /help loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/terms</loc>'), 'sitemap includes /terms loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/privacy</loc>'), 'sitemap includes /privacy loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/legal</loc>'), 'sitemap includes /legal loc');
  assert(sitemapContent.includes('<loc>https://yaad-mudassirbashir530-creators-projects.vercel.app/rashan-list</loc>'), 'sitemap includes /rashan-list loc');

  // Verify hreflang annotations
  assert(sitemapContent.includes('hreflang="en"'), 'sitemap includes English hreflang');
  assert(sitemapContent.includes('hreflang="ur"'), 'sitemap includes Urdu hreflang');
  assert(sitemapContent.includes('hreflang="ur-Latn"'), 'sitemap includes Roman Urdu hreflang');
  assert(sitemapContent.includes('hreflang="x-default"'), 'sitemap includes x-default fallback hreflang');

  // Verify NO private routes leaked
  assert(!sitemapContent.includes('/lists/'), 'sitemap does NOT leak /lists/');
  assert(!sitemapContent.includes('/history/'), 'sitemap does NOT leak /history/');
  assert(!sitemapContent.includes('/settings/'), 'sitemap does NOT leak /settings/');
  assert(!sitemapContent.includes('/create'), 'sitemap does NOT leak /create');

  // --- 3. Open Graph Image Verification ---
  console.log('\n--- 3. Open Graph Preview Asset (1200x630) ---');
  const ogPath = path.join(process.cwd(), 'public', 'og-image.png');
  assert(fs.existsSync(ogPath), 'public/og-image.png asset exists');

  const ogMetadata = await sharp(ogPath).metadata();
  assert(ogMetadata.width === 1200, 'OG image width is exactly 1200px');
  assert(ogMetadata.height === 630, 'OG image height is exactly 630px');
  assert(ogMetadata.format === 'png', 'OG image format is PNG');

  // --- 4. HTML Entry Point & Metadata Sync ---
  console.log('\n--- 4. HTML Head Tags & Metadata.json Sync ---');
  const indexPath = path.join(process.cwd(), 'index.html');
  const metaPath = path.join(process.cwd(), 'metadata.json');
  assert(fs.existsSync(indexPath), 'index.html exists');
  assert(fs.existsSync(metaPath), 'metadata.json exists');

  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  const metadataJson = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  assert(indexHtml.includes('<title>YAAD • Smart Shopping Memory &amp; Grocery Reminder</title>'), 'index.html has brand title');
  assert(indexHtml.includes('rel="canonical"'), 'index.html contains canonical tag');
  assert(indexHtml.includes('property="og:image"'), 'index.html contains og:image tag');
  assert(indexHtml.includes('name="twitter:card" content="summary_large_image"'), 'index.html contains twitter:card tag');
  assert(indexHtml.includes('type="application/ld+json"'), 'index.html contains JSON-LD structured data');

  // Check sync between index.html and metadata.json
  assert(metadataJson.name === 'YAAD', 'metadata.json name is YAAD');
  assert(indexHtml.includes(metadataJson.name), 'index.html title includes metadata.json name');
  assert(indexHtml.includes(metadataJson.description), 'index.html description matches metadata.json description');

  // --- 5. BeyondSEO Strategic Audit & Content Documents ---
  console.log('\n--- 5. BeyondSEO Strategic Audit & Content Documents ---');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_AUDIT.md')), 'SEO_AUDIT.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_IMPLEMENTATION_PLAN.md')), 'SEO_IMPLEMENTATION_PLAN.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_KEYWORD_STRATEGY.md')), 'SEO_KEYWORD_STRATEGY.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_CONTENT_PLAN.md')), 'SEO_CONTENT_PLAN.md exists');

  // --- 6. Phase 2 Production Verification & Operations Documents ---
  console.log('\n--- 6. Phase 2 Production Verification & Operations Documents ---');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_SEARCH_CONSOLE_SETUP.md')), 'SEO_SEARCH_CONSOLE_SETUP.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_BING_SETUP.md')), 'SEO_BING_SETUP.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_CONTENT_ROADMAP.md')), 'SEO_CONTENT_ROADMAP.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_PRODUCTION_VERIFICATION.md')), 'SEO_PRODUCTION_VERIFICATION.md exists');
  assert(fs.existsSync(path.join(process.cwd(), 'SEO_FINAL_CHECKLIST.md')), 'SEO_FINAL_CHECKLIST.md exists');

  // Verify Rashan List cluster is documented
  const kwStrategy = fs.readFileSync(path.join(process.cwd(), 'SEO_KEYWORD_STRATEGY.md'), 'utf-8');
  assert(kwStrategy.includes('راشن لسٹ'), 'SEO_KEYWORD_STRATEGY.md includes Rashan list cluster in Urdu');
  assert(kwStrategy.includes('rashan list'), 'SEO_KEYWORD_STRATEGY.md includes rashan list in Roman Urdu');

  // Verify Sitemap URL count (7 public pages × 3 language alternates = 21 URLs)
  const sitemapUrlMatches = sitemapContent.match(/<loc>/g);
  assert(sitemapUrlMatches !== null && sitemapUrlMatches.length === 21, `Sitemap contains exactly 21 URLs across language alternates (found: ${sitemapUrlMatches?.length})`);

  console.log('\n🎉 ALL SEO & ARCHITECTURAL VERIFICATION TESTS PASSED PERFECTLY!\n');
}

runSeoTests().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
