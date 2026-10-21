import fs from 'fs';
import path from 'path';

const researchPath = 'C:\\Users\\Mudassir Bashir\\Downloads\\YAAD SEO Article Research.html';
const content = fs.readFileSync(researchPath, 'utf8');

const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('No script tag found');
  process.exit(1);
}

const scriptContent = scriptMatch[1];
const codeBeforeDom = scriptContent.split(/var grid\s*=/i)[0];

// Execute to get CLUSTERS and IDEAS
const fn = new Function(`${codeBeforeDom}; return { CLUSTERS, IDEAS };`);
const { CLUSTERS, IDEAS } = fn();

console.log('Total raw IDEAS:', IDEAS.length);

function determineIntent(title, clusterKey) {
  const t = title.toLowerCase();
  if (t.includes(' vs ') || t.includes('versus') || t.includes('best grocery list app') || t.includes('best apps') || t.includes('alternatives') || clusterKey === 'compare') {
    return 'comparison';
  }
  if (t.includes('template') || t.includes('tracker') || t.includes('planner sheet') || t.includes('spreadsheet')) {
    return 'template';
  }
  if (t.includes('list') || t.includes('checklist') || t.includes('items') || t.includes('staples') || t.includes('essentials')) {
    return 'list';
  }
  return 'informational';
}

function extractFocusKeyword(title) {
  // Extract a clean 2-5 word keyword from the title
  let clean = title.replace(/[–—:\-?]/g, ' ').replace(/\s+/g, ' ').trim();
  // If title has common prefixes like "How to ...", extract core
  return clean;
}

const clusterPrettyMap = {
  original: 'Grocery List Core',
  bonus: 'Home & Kitchen Organization',
  set2: 'Rashan & Pakistani Households',
  set3: 'Forgetting & Reminders',
  set4: 'Family Lists & Meal Planning',
  rashan: 'Rashan & Pakistan',
  meal: 'Meal Planning',
  budget: 'Budget & Saving',
  diet: 'Diet & Occasion Lists',
  compare: 'App Comparisons',
};

const rows = IDEAS.map((item, index) => {
  const title = item[0].trim();
  const clusterKey = item[1];
  const src = item[2];
  const summary = item[3] || '';
  const isDup = Boolean(item[4]);

  const cluster = clusterPrettyMap[clusterKey] || CLUSTERS[clusterKey] || clusterKey;
  const searchIntent = determineIntent(title, clusterKey);
  const focusKeyword = extractFocusKeyword(title);
  const sourceSet = `${src}-${clusterKey}`;
  const priority = index + 1;

  return {
    title,
    focusKeyword,
    cluster,
    searchIntent,
    sourceSet,
    priority,
    isDup,
    summary,
  };
});

const outDir = path.join(process.cwd(), 'data', 'inapp-articles');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Write JSON
fs.writeFileSync(path.join(outDir, 'bank.json'), JSON.stringify(rows, null, 2), 'utf8');

// Write CSV with proper quoting
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const csvHeader = 'title,focusKeyword,cluster,searchIntent,sourceSet,priority';
const csvLines = [csvHeader];
for (const r of rows) {
  csvLines.push([
    escapeCsv(r.title),
    escapeCsv(r.focusKeyword),
    escapeCsv(r.cluster),
    escapeCsv(r.searchIntent),
    escapeCsv(r.sourceSet),
    r.priority,
  ].join(','));
}

fs.writeFileSync(path.join(outDir, 'bank.csv'), csvLines.join('\n'), 'utf8');
console.log('Successfully generated bank.csv and bank.json in data/inapp-articles/. Total rows:', rows.length);
