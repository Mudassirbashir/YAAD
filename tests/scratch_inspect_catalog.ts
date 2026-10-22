import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('No anon key');
    return;
  }
  const client = createClient(url, key);
  const { data: cats, error: catErr } = await client.from('categories').select('*');
  console.log('Categories count:', cats?.length, catErr || '');
  console.log('Categories:', cats);

  const { data: items, count, error: itErr } = await client.from('items').select('*', { count: 'exact' }).limit(5);
  console.log('Items count:', count, itErr || '');
  console.log('Sample items:', items);

  const { data: qaItem } = await client.from('items').select('*').ilike('canonical_name', '%QA TEST%');
  console.log('QA Item in items:', qaItem);

  const { data: cmsArticles, count: cmsCount } = await client.from('cms_articles').select('id, slug, title, status, queue_status', { count: 'exact' });
  console.log('CMS Articles count:', cmsCount);
  const qaCms = cmsArticles?.filter(a => a.slug?.includes('qa-test') || a.title?.includes('QA TEST'));
  console.log('QA CMS articles:', qaCms);
}

main();
