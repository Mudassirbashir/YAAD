import fs from 'fs';
import path from 'path';

function runAuditVerification() {
  console.log('======================================================');
  console.log('🔍 YAAD Production Audit Automated Verification Suite');
  console.log('======================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, message: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ Passed: ${message}`);
      passedCount++;
    } else {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Accessibility & Viewport Zoom (Phase 5A)
  console.log('--- 1. Viewport Zoom & Accessibility ---');
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
  assert(!indexHtml.includes('user-scalable=no'), 'Viewport meta does not contain "user-scalable=no"');
  assert(!indexHtml.includes('maximum-scale=1.0'), 'Viewport meta does not contain "maximum-scale=1.0"');
  assert(indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0'), 'Viewport allows standard scalable width');

  // 2. Critical Rendering Path & Fonts (Phase 2A & 2B)
  console.log('\n--- 2. Critical Rendering Path & Font Optimization ---');
  assert(!indexHtml.includes('src="/vendor/lottie.min.js"'), 'Lottie is removed from render-blocking index.html script tag');
  assert(!indexHtml.includes('Material+Symbols+Outlined'), 'Unused Material Symbols Outlined font stylesheet is removed');
  assert(indexHtml.includes('rel="stylesheet"') && indexHtml.includes('family=Plus+Jakarta+Sans'), 'Plus Jakarta Sans stylesheet loaded');
  assert(!indexHtml.includes('media="print" onload="this.media=\'all\'"'), 'Print-to-all swap removed to prevent font flash');
  assert(!indexHtml.includes('<noscript>'), 'Noscript font fallback removed in favor of single stylesheet link');
  assert(indexHtml.includes('Noto+Nastaliq+Urdu'), 'Urdu typography font coverage preserved');

  // 3. Deferred Lottie Loading Helper (Phase 2A)
  console.log('\n--- 3. Deferred Lottie Module ---');
  const lottieLoaderPath = path.join(process.cwd(), 'src', 'lib', 'lottieLoader.ts');
  assert(fs.existsSync(lottieLoaderPath), 'lottieLoader.ts exists');
  const lottieLoaderContent = fs.readFileSync(lottieLoaderPath, 'utf-8');
  assert(lottieLoaderContent.includes('loadLottie'), 'lottieLoader exports loadLottie function');

  // 4. Code Splitting & Bundle Size (Phase 2C)
  console.log('\n--- 4. Code Splitting & Bundles ---');
  const appTsx = fs.readFileSync(path.join(process.cwd(), 'src', 'App.tsx'), 'utf-8');
  assert(appTsx.includes('React.lazy(() => import(\'./admin/AdminApp\')'), 'AdminApp is lazy loaded');
  assert(appTsx.includes('React.lazy(() => import(\'./components/AddItemsView\')'), 'AddItemsView is lazy loaded');
  assert(appTsx.includes('React.lazy(() => import(\'./components/ShoppingListView\')'), 'ShoppingListView is lazy loaded');
  assert(appTsx.includes('React.lazy(() => import(\'./components/legal/LegalPageView\')'), 'LegalPageView is lazy loaded');

  const addItemsView = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'AddItemsView.tsx'), 'utf-8');
  assert(addItemsView.includes('import(\'./barcode/BarcodeScannerModal\')'), 'BarcodeScannerModal is lazy loaded in AddItemsView');

  // Check dist output assets
  const distAssetsDir = path.join(process.cwd(), 'dist', 'assets');
  if (fs.existsSync(distAssetsDir)) {
    const assetFiles = fs.readdirSync(distAssetsDir);
    const mainJsFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
    assert(Boolean(mainJsFile), `Main JS file found in dist/assets: ${mainJsFile}`);
    if (mainJsFile) {
      const stats = fs.statSync(path.join(distAssetsDir, mainJsFile));
      const sizeKb = stats.size / 1024;
      assert(sizeKb < 1300, `Main JS bundle (${sizeKb.toFixed(1)} kB) is reduced below 1300 kB baseline`);
    }
  }

  // 5. Logo & Image Optimization (Phase 3)
  console.log('\n--- 5. Logo & Image Delivery ---');
  const logo128Webp = path.join(process.cwd(), 'public', 'logo-128.webp');
  const logoWebp = path.join(process.cwd(), 'public', 'logo.webp');
  const logoPng = path.join(process.cwd(), 'public', 'logo.png');
  assert(fs.existsSync(logo128Webp), 'public/logo-128.webp exists');
  assert(fs.existsSync(logoWebp), 'public/logo.webp exists');
  assert(fs.existsSync(logoPng), 'public/logo.png exists');

  const logo128Stats = fs.statSync(logo128Webp);
  const logo128Kb = logo128Stats.size / 1024;
  assert(logo128Kb < 10, `Optimized logo-128.webp is ${logo128Kb.toFixed(2)} KiB (target < 10 KiB)`);

  const appPublicHeaderContent = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'common', 'AppPublicHeader.tsx'), 'utf-8');
  assert(appPublicHeaderContent.includes('/logo-128.webp'), 'AppPublicHeader references logo-128.webp');
  assert(appPublicHeaderContent.includes('/logo.png'), 'AppPublicHeader fallback retains official logo.png');
  assert(appPublicHeaderContent.includes('width={36}') || appPublicHeaderContent.includes('width="36"'), 'AppPublicHeader specifies intrinsic logo width');
  assert(appPublicHeaderContent.includes('height={36}') || appPublicHeaderContent.includes('height="36"'), 'AppPublicHeader specifies intrinsic logo height');

  // 6. Accessibility Contrast (Phase 5B)
  console.log('\n--- 6. Accessibility Color Contrast ---');
  const landingPageContent = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'LandingPageView.tsx'), 'utf-8');
  assert(!landingPageContent.includes('#788880'), 'Failing low-contrast color #788880 removed from LandingPageView');
  const appPublicFooter = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'common', 'AppPublicFooter.tsx'), 'utf-8');
  assert(!appPublicFooter.includes('#788880'), 'Failing low-contrast color #788880 removed from AppPublicFooter');
  const legalPageView = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'legal', 'LegalPageView.tsx'), 'utf-8');
  assert(!legalPageView.includes('#788880'), 'Failing low-contrast color #788880 removed from LegalPageView');

  // Contrast calculation check: #4a5c53 on white (#ffffff)
  function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  const l1 = getLuminance(255, 255, 255);
  const l2 = getLuminance(0x4a, 0x5c, 0x53);
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  assert(ratio >= 4.5, `Replacement text color #4a5c53 achieves contrast ratio of ${ratio.toFixed(2)}:1 (>= 4.5:1 WCAG AA)`);

  // 7. AI Discoverability: llms.txt & ai-catalog.json (Phase 7)
  console.log('\n--- 7. AI Discoverability ---');
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
  assert(fs.existsSync(llmsPath), 'public/llms.txt exists');
  const llmsContent = fs.readFileSync(llmsPath, 'utf-8');
  assert(llmsContent.startsWith('# YAAD'), 'llms.txt begins with valid H1 "# YAAD"');
  assert(llmsContent.includes('https://yaadapppk.vercel.app'), 'llms.txt includes canonical public URLs');
  assert((llmsContent.match(/\[.*?\]\(https:\/\/.*?\)/g) || []).length >= 5, 'llms.txt contains at least 5 markdown links');

  const aiCatalogPath = path.join(process.cwd(), 'public', 'ai-catalog.json');
  assert(fs.existsSync(aiCatalogPath), 'public/ai-catalog.json exists');
  const aiCatalogContent = fs.readFileSync(aiCatalogPath, 'utf-8');
  const aiCatalogParsed = JSON.parse(aiCatalogContent);
  assert(aiCatalogParsed.name === 'YAAD', 'ai-catalog.json specifies name "YAAD"');
  assert(Array.isArray(aiCatalogParsed.endpoints) && aiCatalogParsed.endpoints.length > 0, 'ai-catalog.json contains valid endpoints array');
  assert(Array.isArray(aiCatalogParsed.capabilities) && aiCatalogParsed.capabilities.length > 0, 'ai-catalog.json contains valid capabilities array');

  // 8. Security Headers & Vercel Config (Phase 6 & 8)
  console.log('\n--- 8. Security Headers & Deployment Caching ---');
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  assert(fs.existsSync(vercelJsonPath), 'vercel.json exists');
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));

  const globalHeaders = vercelJson.headers.find((h: any) => h.source === '/(.*)');
  assert(Boolean(globalHeaders), 'vercel.json contains global header block (/(.*))');
  const headerKeys = (globalHeaders?.headers || []).map((h: any) => h.key);
  assert(headerKeys.includes('Content-Security-Policy'), 'CSP header configured in vercel.json');
  const cspHeader = (globalHeaders?.headers || []).find((h: any) => h.key === 'Content-Security-Policy');
  assert(Boolean(cspHeader) && !cspHeader.value.includes('unsafe-eval'), 'CSP strictly forbids "unsafe-eval"');
  assert(headerKeys.includes('Cross-Origin-Opener-Policy'), 'COOP header configured in vercel.json');
  assert(headerKeys.includes('X-Frame-Options'), 'X-Frame-Options configured in vercel.json');
  assert(headerKeys.includes('X-Content-Type-Options'), 'X-Content-Type-Options configured in vercel.json');
  assert(headerKeys.includes('Referrer-Policy'), 'Referrer-Policy configured in vercel.json');
  assert(headerKeys.includes('Permissions-Policy'), 'Permissions-Policy configured in vercel.json');

  const assetHeader = vercelJson.headers.find((h: any) => h.source === '/assets/(.*)');
  assert(Boolean(assetHeader), 'Immutable asset cache-control configured in vercel.json');

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedCount}/${totalCount} AUDIT VERIFICATIONS PASSED CLEANLY!`);
  console.log('======================================================\n');
}

runAuditVerification();
