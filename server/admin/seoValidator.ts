export interface SeoGateCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    wordCount: number;
    quickAnswerWords: number;
    seoTitleLength: number;
    seoDescriptionLength: number;
    excerptLength: number;
    keywordInTitle: boolean;
    keywordInFirst100Words: boolean;
    keywordInH2: boolean;
    hasCoverOrAlt: boolean;
    hashtagCount: number;
    resolvedRelatedSlugsCount: number;
    bannedPhrasesFound: string[];
  };
}

export const BANNED_AI_PATTERNS: Array<{ pattern: RegExp; name: string; maxAllowed?: number }> = [
  { pattern: /in today'?s fast-paced world/i, name: "in today's fast-paced world" },
  { pattern: /\bdelve\b/i, name: 'delve' },
  { pattern: /\bgame-?changer\b/i, name: 'game-changer' },
  { pattern: /\bunlock\b/i, name: 'unlock' },
  { pattern: /\belevate your\b/i, name: 'elevate your' },
  { pattern: /\bin conclusion\b/i, name: 'in conclusion' },
  { pattern: /\bit'?s important to note\b/i, name: "it's important to note" },
  { pattern: /^whether you('re| are) a\b/im, name: "Whether you're a X opening" },
  { pattern: /\bmoreover\b/gi, name: 'moreover (repeated)', maxAllowed: 1 },
  { pattern: /\bfurthermore\b/gi, name: 'furthermore (repeated)', maxAllowed: 1 },
  // Product Truth violations: unverified claims about YAAD features, sync, or metrics
  { pattern: /\b(offline\s+sync|shared\s+lists?)\b/i, name: 'unverified sync or shared list phrase' },
  { pattern: /\byaad\b[^\.\n]*\b(offline\s+sync|shared\s+lists?|cloud\s+sync|real-?time\s+sync|live\s+sync)\b/i, name: 'YAAD unverified sync/sharing claim' },
  { pattern: /\byaad\b[^\.\n]*\b(voice\s+control|voice\s+command|voice\s+assistant|voice-?activated)\b/i, name: 'YAAD unverified voice feature claim' },
  { pattern: /\byaad\b[^\.\n]*\b(recipe\s+extract(ion)?|ai\s+recipe|auto(matic)?\s+recipe)\b/i, name: 'YAAD unverified recipe extraction claim' },
  { pattern: /\byaad\b[^\.\n]*\b(#1|number\s+one|best\s+app\s+in\s+pakistan|highest\s+rated)\b/i, name: 'YAAD unverified superlative claim' },
  { pattern: /\byaad\b[^\.\n]*\b(\d+([,\.]\d+)?\s*(k|m|\+)?\s*(active\s+)?users|\d+\s*stars?|rated\s+4\.\d)\b/i, name: 'YAAD unverified user count or rating claim' },
];

export function validateArticleSeoGate(
  article: {
    title?: string;
    slug?: string;
    body?: string;
    quickAnswer?: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
    coverImageUrl?: string;
    coverImageAlt?: string;
    hashtags?: string[];
    relatedSlugs?: string[];
  },
  existingSlugs: Set<string> = new Set()
): SeoGateCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = (article.title || '').trim();
  const slug = (article.slug || '').trim();
  const body = (article.body || '').trim();
  const quickAnswer = (article.quickAnswer || '').trim();
  const seoTitle = (article.seoTitle || title).trim();
  const seoDescription = (article.seoDescription || '').trim();
  const focusKeyword = (article.focusKeyword || '').trim().toLowerCase();
  const hashtags = Array.isArray(article.hashtags) ? article.hashtags.filter(Boolean) : [];
  const relatedSlugs = Array.isArray(article.relatedSlugs) ? article.relatedSlugs.filter(Boolean) : [];

  // 1. Title
  if (!title) {
    errors.push('Article title is required.');
  }

  // 2. Slug
  if (!slug) {
    errors.push('Article slug is required.');
  }

  // 3. Body >= 700 words
  const words = body ? body.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  if (wordCount < 700) {
    errors.push(`Article body must be at least 700 words (currently ${wordCount} words).`);
  }

  // 4. Quick Answer 40-60 words
  const qaWords = quickAnswer ? quickAnswer.split(/\s+/).filter(Boolean) : [];
  const quickAnswerWords = qaWords.length;
  if (quickAnswerWords < 40 || quickAnswerWords > 60) {
    errors.push(`Quick Answer must be 40-60 words (currently ${quickAnswerWords} words).`);
  }

  // 5. seoTitle <= 60 chars
  const seoTitleLength = seoTitle.length;
  if (!seoTitle) {
    errors.push('Meta title (seoTitle) is required.');
  } else if (seoTitleLength > 60) {
    errors.push(`Meta title must be 60 characters or fewer (currently ${seoTitleLength} chars).`);
  }

  // 6. seoDescription 140-160 chars
  const seoDescriptionLength = seoDescription.length;
  if (!seoDescription) {
    errors.push('Meta description (seoDescription) is required.');
  } else if (seoDescriptionLength < 140 || seoDescriptionLength > 160) {
    errors.push(`Meta description must be between 140 and 160 characters (currently ${seoDescriptionLength} chars).`);
  }

  // 7. Focus keyword
  let keywordInTitle = false;
  let keywordInFirst100Words = false;
  let keywordInH2 = false;

  if (!focusKeyword) {
    errors.push('Focus keyword is required.');
  } else {
    // in title
    keywordInTitle = title.toLowerCase().includes(focusKeyword);
    if (!keywordInTitle) {
      errors.push(`Focus keyword "${focusKeyword}" must be present in the title.`);
    }

    // in first 100 words
    const first100Text = words.slice(0, 100).join(' ').toLowerCase();
    keywordInFirst100Words = first100Text.includes(focusKeyword);
    if (!keywordInFirst100Words) {
      errors.push(`Focus keyword "${focusKeyword}" must appear in the first 100 words of the body.`);
    }

    // in at least one H2 heading
    const h2Lines = body.split('\n').filter((l) => /^##\s+/i.test(l.trim()));
    keywordInH2 = h2Lines.some((l) => l.toLowerCase().includes(focusKeyword));
    if (!keywordInH2) {
      errors.push(`Focus keyword "${focusKeyword}" must appear in at least one H2 heading.`);
    }
  }

  // 8. Cover image or explicit slot with alt
  const hasCoverOrAlt = Boolean(
    (article.coverImageUrl && article.coverImageUrl.trim()) ||
    (article.coverImageAlt && article.coverImageAlt.trim())
  );
  if (!hasCoverOrAlt) {
    errors.push('Cover image or an image slot with descriptive alt text is required.');
  } else if (article.coverImageUrl && (!article.coverImageAlt || !article.coverImageAlt.trim())) {
    errors.push('Cover image requires descriptive alt text (coverImageAlt).');
  }

  // 9. 3-5 hashtags
  const hashtagCount = hashtags.length;
  if (hashtagCount < 3 || hashtagCount > 5) {
    errors.push(`Article must have 3-5 hashtags (currently ${hashtagCount}).`);
  }

  // 10. 3-5 related slugs
  let resolvedRelatedSlugsCount = 0;
  if (relatedSlugs.length < 3 || relatedSlugs.length > 5) {
    errors.push(`Article must have 3-5 related internal guide slugs (currently ${relatedSlugs.length}).`);
  } else {
    // If existingSlugs provided, check resolution
    if (existingSlugs.size > 0) {
      const unresolved = relatedSlugs.filter((s) => !existingSlugs.has(s));
      resolvedRelatedSlugsCount = relatedSlugs.length - unresolved.length;
      if (unresolved.length > 0) {
        errors.push(`Related slugs must resolve to real articles: unresolved [${unresolved.join(', ')}].`);
      }
    } else {
      resolvedRelatedSlugsCount = relatedSlugs.length;
    }
  }

  // 11. Banned AI phrase scan
  const bannedPhrasesFound: string[] = [];
  const fullText = `${title}\n${seoDescription}\n${article.excerpt || ''}\n${quickAnswer}\n${body}`;

  for (const item of BANNED_AI_PATTERNS) {
    const matches = fullText.match(item.pattern);
    if (matches) {
      const allowed = item.maxAllowed ?? 0;
      if (matches.length > allowed) {
        bannedPhrasesFound.push(item.name);
        errors.push(`Banned AI phrasing detected: "${item.name}" (${matches.length} occurrences, max allowed: ${allowed}).`);
      }
    }
  }

  // 12. Excerpt / summary must be non-empty and 140-160 chars
  const excerpt = (article.excerpt || '').trim();
  const excerptLength = excerpt.length;
  if (!excerpt) {
    errors.push('Article excerpt (summary) is required.');
  } else if (excerptLength < 140 || excerptLength > 160) {
    errors.push(`Article excerpt must be between 140 and 160 characters (currently ${excerptLength} chars).`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      wordCount,
      quickAnswerWords,
      seoTitleLength,
      seoDescriptionLength,
      excerptLength,
      keywordInTitle,
      keywordInFirst100Words,
      keywordInH2,
      hasCoverOrAlt,
      hashtagCount,
      resolvedRelatedSlugsCount,
      bannedPhrasesFound,
    },
  };
}
