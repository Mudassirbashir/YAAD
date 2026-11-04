/**
 * P5 — Phase-0 catalog import pipeline.
 *
 * Reads ~/workspace/catalog/data/catalog_merged.json (1,269 real Pakistan-market
 * products) and generates idempotent INSERT SQL for:
 *   1. new catalog_leaves rows (one per category/subcategory pair)
 *   2. new items rows (deduped against live Supabase + within the batch)
 *
 * Usage:
 *   tsx scripts/import-catalog-batch.ts            # dry-run: prints plan + samples
 *   tsx scripts/import-catalog-batch.ts --apply    # writes import-phase0.sql
 *
 * Then: run supabase/migrations/20261105_catalog_taxonomy.sql FIRST,
 * then import-phase0.sql, both in the Supabase SQL Editor.
 *
 * Env (for live dedup check): SUPABASE_URL, SUPABASE_ANON_KEY.
 * Without env, dedups within the batch only (still safe: INSERT ... ON CONFLICT DO NOTHING).
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = !process.argv.includes('--apply');

interface RawItem {
  category: string;
  subcategory: string;
  brand: string;
  product: string;
  pack: string;
}

const DEPARTMENT_MAP: Record<string, string> = {
  'Grocery & Food': 'Groceries',
  'Snacks': 'Snacks',
  'Personal/Home Care': 'Health & Beauty',
  'Pharmacy': 'Health & Beauty',
  'Electronics': 'Electronics & Phones',
  'Cars/Automotive': 'Automotive',
};

const CATEGORY_ID_MAP: Record<string, string> = {
  'Grocery & Food': 'grocery',
  'Snacks': 'snacks',
  'Personal/Home Care': 'personal_care',
  'Pharmacy': 'health',
  'Electronics': 'electronics',
  'Cars/Automotive': 'automotive',
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function sqlStr(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlArr(arr: string[]): string {
  if (arr.length === 0) return "'{}'";
  return `ARRAY[${arr.map((a) => sqlStr(a)).join(',')}]`;
}

async function fetchExistingNames(): Promise<Set<string>> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const names = new Set<string>();
  if (!url || !key) return names;
  try {
    let from = 0;
    const step = 1000;
    for (;;) {
      const res = await fetch(
        `${url}/rest/v1/items?select=canonical_name,english_name&limit=${step}&offset=${from}`,
        { headers: { apikey: key } }
      );
      if (!res.ok) break;
      const rows = (await res.json()) as any[];
      if (rows.length === 0) break;
      for (const r of rows) {
        if (r.canonical_name) names.add(r.canonical_name.toLowerCase().trim());
        if (r.english_name) names.add(r.english_name.toLowerCase().trim());
      }
      from += rows.length;
      if (rows.length < step) break;
    }
  } catch {
    // offline or bad creds — batch-only dedup still applies
  }
  return names;
}

async function main() {
  const raw: RawItem[] = JSON.parse(
    readFileSync(join(__dirname, '../../catalog/data/catalog_merged.json'), 'utf8')
  );
  console.log(`Loaded ${raw.length} raw products`);

  const existingNames = await fetchExistingNames();
  console.log(`Live catalog names for dedup: ${existingNames.size}`);

  const leaves = new Map<string, { id: string; department: string; name_en: string }>();
  const seenInBatch = new Set<string>();
  const itemRows: string[] = [];
  let dupLive = 0;
  let dupBatch = 0;

  const usedIds = new Set<string>();

  for (const r of raw) {
    const brand = (r.brand || '').trim();
    const product = (r.product || '').trim();
    if (!product) continue;
    const pack = (r.pack || '').trim();
    // Dedupe: many source rows already start with the brand ("Weetabix Original"
    // with brand "Weetabix") — don't prepend it again ("Weetabix Weetabix Original").
    const productStartsWithBrand = !!brand && product.toLowerCase().startsWith(brand.toLowerCase());
    const name = brand && !productStartsWithBrand ? `${brand} ${product}${pack ? ` ${pack}` : ''}` : `${product}${pack ? ` ${pack}` : ''}`;
    const normName = name.toLowerCase().trim();

    if (existingNames.has(normName)) {
      dupLive += 1;
      continue;
    }
    if (seenInBatch.has(normName)) {
      dupBatch += 1;
      continue;
    }
    seenInBatch.add(normName);

    const department = DEPARTMENT_MAP[r.category] || 'Groceries';
    const leafSlug = slug(r.subcategory || r.category);
    const leafId = `leaf_imp_${slug(department)}_${leafSlug}`;
    if (!leaves.has(leafId)) {
      leaves.set(leafId, { id: leafId, department, name_en: r.subcategory || r.category });
    }

    let baseId = `imp_${slug(brand ? `${brand}-${product}` : product)}` || 'imp_item';
    let id = baseId;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${n}`;
      n += 1;
    }
    usedIds.add(id);

    const categoryId = CATEGORY_ID_MAP[r.category] || 'grocery';
    const terms = [product.toLowerCase(), brand.toLowerCase()].filter(Boolean);
    itemRows.push(
      `(${sqlStr(id)},${sqlStr(name)},${sqlStr(name)},'',${sqlArr([])},${sqlStr(categoryId)},'general',${sqlArr(terms)},${sqlArr([])},true,'piece',${sqlStr(leafId)},NULL,NULL,now(),now())`
    );
  }

  console.log(`New leaves: ${leaves.size}`);
  console.log(`New items: ${itemRows.length} (skipped ${dupLive} live-dupes, ${dupBatch} batch-dupes)`);
  console.log('Sample leaves:', [...leaves.values()].slice(0, 5).map((l) => l.id).join(', '));

  if (DRY_RUN) {
    console.log('\nDRY RUN — no files written. Re-run with --apply to generate import-phase0.sql');
    return;
  }

  const leafSql = [...leaves.values()]
    .map((l) => `('${l.id}','${l.department.replace(/'/g, "''")}','${l.name_en.replace(/'/g, "''")}')`)
    .join(',\n');

  const sql = `-- P5 Phase-0 import: ${itemRows.length} items, ${leaves.size} leaves.
-- Generated ${new Date().toISOString()} from workspace/catalog/data/catalog_merged.json
-- PREREQUISITE: run supabase/migrations/20261105_catalog_taxonomy.sql first.
-- IDEMPOTENT: ON CONFLICT DO NOTHING throughout.

INSERT INTO public.catalog_leaves (id, department, name_en) VALUES
${leafSql}
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.items
  (id, canonical_name, english_name, urdu_name, roman_urdu_names, category_id, subcategory_id, searchable_terms, common_misspellings, active, default_unit, leaf_id, image_url, cloudinary_public_id, created_at, updated_at)
VALUES
${itemRows.join(',\n')}
ON CONFLICT (id) DO NOTHING;
`;

  const outPath = join(__dirname, 'import-phase0.sql');
  writeFileSync(outPath, sql);
  console.log(`\nWrote ${outPath} (${(sql.length / 1024).toFixed(0)} KB)`);
  console.log('Next: run 20261105_catalog_taxonomy.sql, then this file, in the Supabase SQL Editor.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
