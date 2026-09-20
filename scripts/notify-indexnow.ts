/**
 * YAAD IndexNow Safe Notification Utility
 * 
 * Submits updated public editorial URLs to the IndexNow API (supported by Bing, Yandex, Seznam, Naver).
 * 
 * Safety Rules:
 * 1. Only submits verified public indexable canonical URLs (18 URLs across languages).
 * 2. Never submits private/authenticated paths (/lists/, /history/, /settings/, /auth, etc.).
 * 3. Rate-limited and idempotent: do not run unnecessarily.
 * 4. Supports --dry-run mode for pre-flight validation.
 */

const INDEXNOW_KEY = '8f21b34e6c9941a8b9e652a912d0831f';
const HOST = 'yaadapppk.vercel.app';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// Authoritative Public URLs (Base and Localized Alternates)
const PUBLIC_CANONICAL_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/?lang=ur`,
  `https://${HOST}/?lang=roman-urdu`,
  `https://${HOST}/about`,
  `https://${HOST}/about?lang=ur`,
  `https://${HOST}/about?lang=roman-urdu`,
  `https://${HOST}/help`,
  `https://${HOST}/help?lang=ur`,
  `https://${HOST}/help?lang=roman-urdu`,
  `https://${HOST}/rashan-list`,
  `https://${HOST}/rashan-list?lang=ur`,
  `https://${HOST}/rashan-list?lang=roman-urdu`,
  `https://${HOST}/terms`,
  `https://${HOST}/terms?lang=ur`,
  `https://${HOST}/terms?lang=roman-urdu`,
  `https://${HOST}/privacy`,
  `https://${HOST}/privacy?lang=ur`,
  `https://${HOST}/privacy?lang=roman-urdu`,
  `https://${HOST}/legal`,
  `https://${HOST}/legal?lang=ur`,
  `https://${HOST}/legal?lang=roman-urdu`,
];

async function submitIndexNow(isDryRun = false) {
  console.log('==============================================');
  console.log('YAAD IndexNow Protocol Notification Utility');
  console.log('==============================================');
  console.log(`Host: ${HOST}`);
  console.log(`Key: ${INDEXNOW_KEY}`);
  console.log(`Key Location: ${KEY_LOCATION}`);
  console.log(`Target URLs: ${PUBLIC_CANONICAL_URLS.length} URLs`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: PUBLIC_CANONICAL_URLS,
  };

  if (isDryRun) {
    console.log('\n[DRY RUN] Payload that would be dispatched to https://api.indexnow.org/IndexNow:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\nDry run completed successfully. Zero requests dispatched.');
    return;
  }

  try {
    console.log('\nDispatching IndexNow notification to https://api.indexnow.org/IndexNow ...');
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    if (response.status === 200 || response.status === 202) {
      console.log('✅ IndexNow notification accepted successfully by search engines.');
    } else {
      const responseBody = await response.text();
      console.log(`⚠️ Search engine response body: ${responseBody}`);
    }
  } catch (error) {
    console.error('❌ Failed to dispatch IndexNow request:', error);
  }
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
submitIndexNow(isDryRun);
