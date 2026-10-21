import fs from 'fs';
import path from 'path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://yaadapppk.vercel.app').replace(/\/+$/, '');

const STATIC_URLS = [
  { path: '/', lastmod: '2026-10-21', changefreq: 'daily', priority: '1.0' },
  { path: '/rashan-list', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.9' },
  { path: '/features', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.8' },
  { path: '/how-it-works', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.8' },
  { path: '/help', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', lastmod: '2026-10-21', changefreq: 'weekly', priority: '0.8' },
  { path: '/privacy', lastmod: '2026-10-21', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', lastmod: '2026-10-21', changefreq: 'monthly', priority: '0.5' },
  { path: '/legal', lastmod: '2026-10-21', changefreq: 'monthly', priority: '0.4' },
];

export function buildSitemapXml(publishedArticles = []) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  // 1. Static 10 public URLs
  for (const item of STATIC_URLS) {
    const loc = `${SITE_URL}${item.path}`;
    lines.push('  <url>');
    lines.push(`    <loc>${loc}</loc>`);
    lines.push(`    <lastmod>${item.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${item.changefreq}</changefreq>`);
    lines.push(`    <priority>${item.priority}</priority>`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="ur" href="${loc}${item.path === '/' ? '?lang=ur' : '?lang=ur'}" />`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="ur-PK" href="${loc}${item.path === '/' ? '?lang=ur' : '?lang=ur'}" />`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="ur-Latn" href="${loc}${item.path === '/' ? '?lang=roman-urdu' : '?lang=roman-urdu'}" />`);
    lines.push('  </url>');
  }

  // 2. Published articles only (no drafts, no ideas, no needs_review)
  for (const art of publishedArticles) {
    if (art.status !== 'published') continue;
    const slug = art.slug || art.id;
    const loc = `${SITE_URL}/blog/${slug}`;
    const dateNum = art.updatedAt || art.publishedAt || art.createdAt || Date.now();
    const lastmod = new Date(dateNum).toISOString().split('T')[0];

    lines.push('  <url>');
    lines.push(`    <loc>${loc}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

export function generateSitemapFile(customArticles) {
  let articles = customArticles;
  if (!articles) {
    try {
      const dataFilePath = path.join(process.cwd(), 'data', 'admin_data.json');
      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        articles = (parsed.cmsArticles || []).filter(
          (a) => a.status === 'published' && a.queueStatus !== 'needs_review' && a.queueStatus !== 'idea'
        );
      } else {
        articles = [];
      }
    } catch {
      articles = [];
    }
  }

  const xml = buildSitemapXml(articles);
  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');

  const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, xml, 'utf8');
  }

  console.log(`[generate-sitemap] Wrote sitemap.xml with 10 static URLs and ${articles.length} published articles.`);
  return xml;
}

// If executed directly as script
if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.mjs')) {
  generateSitemapFile();
}
