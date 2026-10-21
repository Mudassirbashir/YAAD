/**
 * YAAD SEO Auto-Filler Engine
 * Auto-generates full SEO fields meeting all 11 quality gate rules.
 */

export interface AutoFillInputs {
  title: string;
  body?: string;
  category?: string;
  cluster?: string;
  authorName?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  existingSlugs?: string[];
  focusKeyword?: string;
}

export interface AutoFillOutputs {
  focusKeyword: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  quickAnswer: string;
  excerpt: string;
  authorName: string;
  canonicalUrl: string;
  ogImageUrl: string;
  coverImageAlt: string;
  cluster: string;
  searchIntent: 'informational' | 'list' | 'comparison' | 'template';
  keyTakeaways: string[];
  hashtags: string[];
  relatedSlugs: string[];
  faqs: Array<{ q: string; a: string }>;
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'guide';
}

export function extractKeywordFromTitle(title: string): string {
  const clean = title.trim();
  // Strip common leading questions/fillers
  const stripped = clean
    .replace(/^(How to|What('s| is) the|Can a|Which|Best|Top)\s+/i, '')
    .replace(/\?$/, '')
    .trim();

  // If reasonably short, use the stripped title
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length <= 5) {
    return stripped.toLowerCase();
  }
  // Otherwise take the first 3-4 key nouns
  return words.slice(0, 4).join(' ').toLowerCase();
}

/**
 * Format a meta description to be strictly between 140 and 160 characters.
 */
export function formatSeoDescription(
  focusKeyword: string,
  benefit: string = 'budget better at local kiryana stores',
  cta: string = 'Plan your shopping free with YAAD.'
): string {
  const base = `Learn how to organize your ${focusKeyword.toLowerCase()} to ${benefit}. Step-by-step checklist, Pakistani units, and expert tips. ${cta}`;
  if (base.length >= 140 && base.length <= 160) {
    return base;
  }
  if (base.length > 160) {
    // Trim at word boundary and append soft CTA
    const trimmed = base.slice(0, 156).replace(/\s+\S*$/, '.');
    if (trimmed.length < 140) {
      return base.slice(0, 159);
    }
    return trimmed;
  }
  // If under 140, pad naturally
  const padded = `Complete Pakistani guide: learn how to organize your ${focusKeyword.toLowerCase()} to ${benefit}. Verified checklist, local units, and expert tips. ${cta}`;
  if (padded.length >= 140 && padded.length <= 160) {
    return padded;
  }
  return padded.slice(0, 155).replace(/\s+\S*$/, '.') + ' Plan with YAAD.';
}

/**
 * Generates a compliant 40-60 word Quick Answer box.
 */
export function generateQuickAnswer(title: string, focusKeyword: string): string {
  return `To manage ${focusKeyword.toLowerCase()} effectively in Pakistan, organize items by store section before leaving home. Group grains like chakki atta and basmati rice separately from sabzi mandi perishables. Check pantry stock first, calculate portions in kilograms or pao, and use a reliable offline shopping checklist like YAAD to avoid forgotten items.`;
}

export function autoFillArticleSeo(inputs: AutoFillInputs): AutoFillOutputs {
  const rawTitle = (inputs.title || '').trim() || 'Pakistani Grocery Shopping Guide';
  const slug = slugifyText(rawTitle);
  const keyword = (inputs.focusKeyword && inputs.focusKeyword.trim())
    ? inputs.focusKeyword.trim().toLowerCase()
    : extractKeywordFromTitle(rawTitle);

  // SEO Title: <= 60 characters, front-loading keyword
  let seoTitle = rawTitle;
  if (seoTitle.length > 60) {
    // Try shortening
    const short = `${rawTitle.split(':')[0] || rawTitle}`.trim();
    if (short.length <= 60) {
      seoTitle = short;
    } else {
      seoTitle = rawTitle.slice(0, 57).replace(/\s+\S*$/, '') + '...';
    }
  }

  // Quick Answer: 40-60 words
  const quickAnswer = generateQuickAnswer(rawTitle, keyword);

  // SEO Description: 140-160 characters
  const seoDescription = formatSeoDescription(keyword);

  // Excerpt
  const excerpt = `Practical advice on ${keyword} for Pakistani households. Learn how to budget monthly rashan, convert local bazaar units, and save shopping time.`;

  // Author Name
  const authorName = (inputs.authorName && inputs.authorName.trim() && inputs.authorName !== 'Admin')
    ? inputs.authorName.trim()
    : 'YAAD Editorial Team';

  // Canonical URL
  const canonicalUrl = `https://yaadapppk.vercel.app/blog/${slug}`;

  // Cover image alt
  const coverImageAlt = (inputs.coverImageAlt && inputs.coverImageAlt.trim())
    ? inputs.coverImageAlt.trim()
    : `Pakistani grocery shopping and monthly rashan guide for ${rawTitle}`;

  // Cluster
  const cluster = inputs.cluster || inputs.category || 'Monthly Rashan';

  // Search Intent
  let searchIntent: 'informational' | 'list' | 'comparison' | 'template' = 'informational';
  const lowerTitle = rawTitle.toLowerCase();
  if (lowerTitle.includes('vs') || lowerTitle.includes('best') || lowerTitle.includes('compare')) {
    searchIntent = 'comparison';
  } else if (lowerTitle.includes('list') || lowerTitle.includes('checklist') || lowerTitle.includes('how to')) {
    searchIntent = 'list';
  }

  // Key Takeaways (3-4 bullets)
  const keyTakeaways = [
    `Audit kitchen pantry staples before visiting local kiryana stores or bachat bazaars.`,
    `Convert traditional units accurately: 1 dharri equals 5kg, while 1 pao is 250 grams.`,
    `Track monthly grocery items with offline lists like YAAD to avoid forgotten items and overspending.`,
  ];

  // Hashtags (3-5 tags)
  const hashtags = ['#yaadapp', '#groceryshopping', '#monthlyrashan', '#pakistanikitchen'];

  // Default known published slugs to link as related
  const fallbackSlugs = [
    'ramadan-rashan-guide-2026',
    'monthly-rashan-budgeting-pakistan',
    'pakistani-units-dharri-pao-kg-explained',
    'offline-shopping-basement-bazaars',
  ];

  const candidateSlugs = (inputs.existingSlugs || []).filter((s) => s && s !== slug);
  const relatedSlugs = candidateSlugs.length >= 3
    ? candidateSlugs.slice(0, 4)
    : Array.from(new Set([...candidateSlugs, ...fallbackSlugs])).filter((s) => s !== slug).slice(0, 3);

  // FAQs (3 questions)
  const faqs = [
    {
      q: `How does YAAD help with ${keyword}?`,
      a: `YAAD lets you build bilingual grocery lists in English, Roman Urdu, or Urdu script. It categorizes items automatically and works 100% offline inside basements and crowded bazaars where mobile internet is weak.`,
    },
    {
      q: `How can I calculate grocery portions for my family?`,
      a: `Estimate 10kg of whole-wheat chakki atta and 5kg of basmati rice per adult monthly. For vegetables and pulses, buying in weekly batches from local sabzi mandis ensures maximum freshness and prevents kitchen waste.`,
    },
    {
      q: `Can I share my grocery list with other family members?`,
      a: `Yes. YAAD allows instant list sharing via WhatsApp and syncs purchases across family members so multiple shoppers never purchase the same grocery items twice.`,
    },
  ];

  return {
    focusKeyword: keyword,
    slug,
    seoTitle,
    seoDescription,
    quickAnswer,
    excerpt,
    authorName,
    canonicalUrl,
    ogImageUrl: inputs.coverImageUrl || 'https://yaadapppk.vercel.app/og-cover.png',
    coverImageAlt,
    cluster,
    searchIntent,
    keyTakeaways,
    hashtags,
    relatedSlugs,
    faqs,
  };
}
