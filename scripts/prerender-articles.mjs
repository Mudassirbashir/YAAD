import fs from 'fs';
import path from 'path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://yaadapppk.vercel.app').replace(/\/+$/, '');

export function renderArticleHtml(templateHtml, article) {
  const baseCanonical = SITE_URL;
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || `${article.title} - YAAD Grocery & Shopping Guide`;
  const canonical = article.canonicalUrl || `${baseCanonical}/blog/${article.slug}`;
  const ogImage = article.ogImageUrl || article.coverImageUrl || `${baseCanonical}/og-cover.png`;

  const datePub = article.publishedAt
    ? new Date(article.publishedAt).toISOString().split('T')[0]
    : '2026-10-21';
  const dateMod = article.updatedAt
    ? new Date(article.updatedAt).toISOString().split('T')[0]
    : datePub;

  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': `${baseCanonical}/blog/${article.slug}#article`,
      headline: title,
      name: title,
      description: description,
      articleBody: article.quickAnswer || (article.body ? article.body.slice(0, 500) : ''),
      url: `${baseCanonical}/blog/${article.slug}`,
      datePublished: datePub,
      dateModified: dateMod,
      inLanguage: 'en',
      author: {
        '@type': 'Person',
        name: article.authorName || 'YAAD Editorial Team',
        url: `${baseCanonical}/about`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'YAAD',
        url: baseCanonical,
        logo: {
          '@type': 'ImageObject',
          url: `${baseCanonical}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseCanonical}/blog/${article.slug}`,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${baseCanonical}/blog/${article.slug}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseCanonical}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseCanonical}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: `${baseCanonical}/blog/${article.slug}`,
        },
      ],
    },
  ];

  if (article.coverImageUrl) {
    graph[0].image = article.coverImageUrl;
  }

  if (Array.isArray(article.faqs) && article.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${baseCanonical}/blog/${article.slug}#faq`,
      mainEntity: article.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    });
  }

  const articleJsonLd = `\n  <script type="application/ld+json" id="article-jsonld">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })}</script>`;

  const quickAnswerSafe = (article.quickAnswer || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const titleSafe = (article.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Extract first section from markdown body if available
  let firstSectionSafe = '';
  if (article.body) {
    const paragraphs = article.body.split('\n\n').filter(p => !p.startsWith('#') && !p.startsWith('[CTA]'));
    if (paragraphs.length > 0) {
      firstSectionSafe = paragraphs[0].replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  const articleBodyHtml = `\n    <article id="ssr-article-root" class="sr-only" aria-hidden="true">
      <h1>${titleSafe}</h1>
      ${quickAnswerSafe ? `<p class="quick-answer"><strong>Quick Answer:</strong> ${quickAnswerSafe}</p>` : ''}
      ${firstSectionSafe ? `<p class="first-section">${firstSectionSafe}</p>` : ''}
    </article>`;

  const hreflangTags = `
    <link rel="alternate" hreflang="x-default" href="${baseCanonical}/blog/${article.slug}" />
    <link rel="alternate" hreflang="en" href="${baseCanonical}/blog/${article.slug}" />
    <link rel="alternate" hreflang="ur" href="${baseCanonical}/blog/${article.slug}?lang=ur" />
    <link rel="alternate" hreflang="ur-PK" href="${baseCanonical}/blog/${article.slug}?lang=ur" />
    <link rel="alternate" hreflang="ur-Latn" href="${baseCanonical}/blog/${article.slug}?lang=roman-urdu" />`;

  let modified = templateHtml;
  modified = modified.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  modified = modified.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  modified = modified.replace(/<link rel="canonical" href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />${hreflangTags}`);
  modified = modified.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  modified = modified.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  modified = modified.replace(/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  modified = modified.replace(/<meta property="og:type" content=".*?"\s*\/?>/i, '<meta property="og:type" content="article" />');
  if (!modified.includes('property="og:type"')) {
    modified = modified.replace('</head>', '  <meta property="og:type" content="article" />\n</head>');
  }
  if (ogImage) {
    modified = modified.replace(/<meta property="og:image" content=".*?"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />`);
    modified = modified.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${ogImage}" />`);
  }
  modified = modified.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  modified = modified.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);

  if (articleJsonLd) {
    modified = modified.replace('</head>', `${articleJsonLd}\n</head>`);
  }
  if (articleBodyHtml) {
    if (modified.includes('<div id="root"></div>')) {
      modified = modified.replace('<div id="root"></div>', `<div id="root">${articleBodyHtml}</div>`);
    } else {
      modified = modified.replace('</body>', `${articleBodyHtml}\n</body>`);
    }
  }

  return modified;
}

export function prerenderAllArticles() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  const distIndexPath = path.join(distDir, 'index.html');
  const templatePath = fs.existsSync(distIndexPath) ? distIndexPath : path.join(rootDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.warn('[prerender] No template HTML found (dist/index.html or index.html). Skipping.');
    return;
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const adminDataPath = path.join(rootDir, 'data', 'admin_data.json');
  let articles = [];

  if (fs.existsSync(adminDataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(adminDataPath, 'utf8'));
      articles = data.cmsArticles || [];
    } catch (err) {
      console.error('[prerender] Failed to parse admin_data.json:', err.message);
    }
  }

  const published = articles.filter((a) => a.status === 'published');
  console.log(`[prerender] Found ${published.length} published article(s) to prerender.`);

  let prerenderedCount = 0;
  for (const art of published) {
    if (!art.slug) continue;
    const html = renderArticleHtml(templateHtml, art);

    // Write to dist/blog/<slug>/index.html
    const targetDir = path.join(distDir, 'blog', art.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

    // Also write to dist/blog/<slug>.html for direct rewrites
    const blogDir = path.join(distDir, 'blog');
    fs.mkdirSync(blogDir, { recursive: true });
    fs.writeFileSync(path.join(blogDir, `${art.slug}.html`), html, 'utf8');

    prerenderedCount++;
  }

  console.log(`[prerender] Successfully emitted prerendered static HTML for ${prerenderedCount} article(s).`);
}

// Execute if called directly from CLI
prerenderAllArticles();
