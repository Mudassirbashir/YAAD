import { spawn } from 'child_process';
import http from 'http';

const PORT = 3456;
process.env.PORT = String(PORT);

console.log(`Starting production server on port ${PORT}...`);
const serverProcess = spawn('node', ['dist/server.cjs'], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

serverProcess.stderr.on('data', (d) => {
  console.error('[Server stderr]', d.toString());
});

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function waitServerReady(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchUrl('/');
      if (res.statusCode === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server failed to start in time');
}

async function runVerification() {
  try {
    await waitServerReady();
    console.log('Production server is alive and responding!');

    console.log('\n--- 1. Testing /blog/monthly-rashan-list-pakistani-family raw initial HTML ---');
    const articleRes = await fetchUrl('/blog/monthly-rashan-list-pakistani-family');
    console.log('HTTP Status:', articleRes.statusCode);
    if (articleRes.statusCode !== 200) {
      throw new Error(`Expected HTTP 200, got ${articleRes.statusCode}`);
    }

    const html = articleRes.body;
    const checks = [
      { name: 'Meta Title', pass: html.includes('<title>Monthly Rashan List for Pakistani Family (2026 Checklist)</title>') },
      { name: 'Meta Description', pass: html.includes('<meta name="description" content="Complete monthly rashan list for a Pakistani family.') },
      { name: 'Canonical Link', pass: html.includes('<link rel="canonical" href="https://yaadapppk.vercel.app/blog/monthly-rashan-list-pakistani-family" />') },
      { name: 'Open Graph Title', pass: html.includes('<meta property="og:title" content="Monthly Rashan List for Pakistani Family') },
      { name: 'Open Graph Type (article)', pass: html.includes('<meta property="og:type" content="article" />') },
      { name: 'JSON-LD Schema', pass: html.includes('application/ld+json') && html.includes('BlogPosting') && html.includes('FAQPage') },
      { name: 'Quick Answer SSR Text', pass: html.includes('A complete monthly rashan list for a Pakistani family of four to five covers eight essential pantry groups') },
      { name: 'Semantic Article Root', pass: html.includes('id="ssr-article-root"') },
    ];

    for (const c of checks) {
      console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
      if (!c.pass) throw new Error(`Failed check: ${c.name}`);
    }

    console.log('\n--- 2. Testing /sitemap.xml raw XML output ---');
    const sitemapRes = await fetchUrl('/sitemap.xml');
    console.log('HTTP Status:', sitemapRes.statusCode);
    const xml = sitemapRes.body;
    const sitemapChecks = [
      { name: 'Sitemap contains sample article URL', pass: xml.includes('<loc>https://yaadapppk.vercel.app/blog/monthly-rashan-list-pakistani-family</loc>') },
      { name: 'Sitemap contains today lastmod', pass: xml.includes('2026-10-21') },
      { name: 'Sitemap retains static public pages (/rashan-list)', pass: xml.includes('https://yaadapppk.vercel.app/rashan-list') },
      { name: 'Drafts not in sitemap', pass: !xml.includes('draft') },
    ];

    for (const c of sitemapChecks) {
      console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
      if (!c.pass) throw new Error(`Failed check: ${c.name}`);
    }

    console.log('\n--- 3. Testing /api/blog/articles endpoint ---');
    const apiRes = await fetchUrl('/api/blog/articles');
    console.log('HTTP Status:', apiRes.statusCode);
    const apiJson = JSON.parse(apiRes.body);
    const apiPass = apiJson.success && Array.isArray(apiJson.articles) && apiJson.articles.some(a => a.slug === 'monthly-rashan-list-pakistani-family');
    console.log(`${apiPass ? '✓' : '✗'} API returns published article in public articles list`);
    if (!apiPass) throw new Error('API failed to return published article');

    console.log('\n🎉 ALL PRODUCTION CURL CHECKS PASSED WITH 100% SUCCESS!');
  } finally {
    serverProcess.kill('SIGTERM');
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err.message);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});
