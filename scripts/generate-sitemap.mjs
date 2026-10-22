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

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchPublishedArticlesForSitemap() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[generate-sitemap] Build failed: Supabase credentials (SUPABASE_URL / VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY) are missing in build environment. Supabase is required as the single source of truth for sitemap generation.'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('cms_articles')
    .select('slug, updated_at, created_at, status, queue_status')
    .eq('status', 'published');

  if (error) {
    throw new Error(`[generate-sitemap] Build failed: Unable to fetch published articles from Supabase cms_articles: ${error.message}`);
  }

  return (data || []).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    status: row.status,
    queueStatus: row.queue_status,
  }));
}

export async function generateSitemapFile(customArticles) {
  let articles = customArticles;
  if (!articles) {
    console.log('[generate-sitemap] Fetching published articles from Supabase as single source of truth...');
    articles = await fetchPublishedArticlesForSitemap();
  }

  const xml = buildSitemapXml(articles);
  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');

  const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, xml, 'utf8');
  }

  console.log(`[generate-sitemap] Wrote sitemap.xml with 10 static URLs and ${articles.length} published articles from Supabase.`);
  return xml;
}

// If executed directly as script
if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.mjs')) {
  generateSitemapFile().catch((err) => {
    console.error('[generate-sitemap] FATAL BUILD ERROR:', err.message);
    process.exit(1);
  });
}
