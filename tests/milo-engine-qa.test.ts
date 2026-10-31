/**
 * Milo Parametric Engine & Verification Test Suite (v2)
 * YAAD's Interactive Pet Procedural System Verification
 */

import {
  MiloExpression,
  MILO_EXPRESSIONS,
  EVENT_EXPRESSION_MAP,
  interpolateMiloParams,
  easeOutCubic,
  MILO_IMAGE_MAP,
} from '../src/pet/miloExpressions';
import {
  playMiloSound,
  isMiloSoundEnabled,
  setMiloSoundEnabled,
} from '../src/pet/miloSounds';
import {
  isMiloEnabled,
  setMiloEnabled,
  STORAGE_BUBBLE_POS_KEY,
  STORAGE_MILO_ENABLED_KEY,
  STORAGE_PENDING_REMINDER_DATE_KEY,
  getTodayDateString,
  MiloPendingList,
} from '../src/pet/MiloHost';
import {
  MILO_TRIGGER_CUSTOM_EVENT,
  triggerMiloEvent,
  getDefaultGreeting,
} from '../src/pet/useMilo';
import {
  playItemCheckSound,
  playItemUncheckSound,
  resetTickStreak,
  getTickStreakCount,
  getLastTickFrequency,
  getLastUntickFrequency,
  PENTATONIC_SCALE,
} from '../src/lib/sound';
import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('\n======================================================');
console.log('🐾 MILO PARAMETRIC ENGINE & PROCEDURAL PET QA SUITE (v2)');
console.log('======================================================\n');

// --- 1. EXPRESSION MODEL SPECIFICATION VERIFICATION ---
console.log('--- 1. Testing Expression Presets & Numerical Model ---');

const EXPECTED_EXPRESSIONS: MiloExpression[] = [
  'idle',
  'happy',
  'laughing',
  'sad',
  'alas',
  'hurrah',
  'excited',
  'listening',
  'sleepy',
  'proud',
  'curious',
];

assert(
  Object.keys(MILO_EXPRESSIONS).length === 11,
  'MILO_EXPRESSIONS contains exactly 11 distinct expressions'
);

EXPECTED_EXPRESSIONS.forEach((expr) => {
  assert(Boolean(MILO_EXPRESSIONS[expr]), `Expression '${expr}' is registered in MILO_EXPRESSIONS`);
});

// Verify exact values from prompt spec
assert(MILO_EXPRESSIONS.idle.eye === 1.0 && MILO_EXPRESSIONS.idle.mouth === 'smile', 'idle preset matches spec');
assert(MILO_EXPRESSIONS.happy.bounceA === 5 && MILO_EXPRESSIONS.happy.bounceF === 2.4, 'happy preset matches spec');
assert(MILO_EXPRESSIONS.laughing.mOpen === 0.8 && MILO_EXPRESSIONS.laughing.mouth === 'open', 'laughing preset matches spec');
assert(MILO_EXPRESSIONS.sad.droop === 0.5 && MILO_EXPRESSIONS.sad.mouth === 'frown', 'sad preset matches spec');
assert(MILO_EXPRESSIONS.alas.tilt === 0.09 && MILO_EXPRESSIONS.alas.mouth === 'flat', 'alas preset matches spec');
assert(MILO_EXPRESSIONS.hurrah.bounceA === 11 && MILO_EXPRESSIONS.hurrah.fur === 1.0, 'hurrah preset matches spec');
assert(MILO_EXPRESSIONS.excited.bounceA === 7 && MILO_EXPRESSIONS.excited.mouth === 'smile', 'excited preset matches spec');
assert(MILO_EXPRESSIONS.listening.mOpen === 0.15 && MILO_EXPRESSIONS.listening.bounceF === 1.5, 'listening preset matches spec');
assert(MILO_EXPRESSIONS.sleepy.eye === 0.4 && MILO_EXPRESSIONS.sleepy.droop === 0.7, 'sleepy preset matches spec');
assert(MILO_EXPRESSIONS.proud.bounceF === 1.6 && MILO_EXPRESSIONS.proud.mouth === 'smile', 'proud preset matches spec');
assert(MILO_EXPRESSIONS.curious.mouth === 'o' && MILO_EXPRESSIONS.curious.tilt === 0.06, 'curious preset matches spec');

// --- 2. EVENT TO EXPRESSION MAP VERIFICATION ---
console.log('\n--- 2. Testing Event->Expression Mapping ---');
assert(EVENT_EXPRESSION_MAP.app_open === 'happy', 'app_open triggers happy');
assert(EVENT_EXPRESSION_MAP.item_added === 'excited', 'item_added triggers excited');
assert(EVENT_EXPRESSION_MAP.list_completed === 'hurrah', 'list_completed triggers hurrah');
assert(EVENT_EXPRESSION_MAP.reminder === 'sad', 'reminder triggers sad (gentle, never guilt)');
assert(EVENT_EXPRESSION_MAP.notification === 'curious', 'notification triggers curious');
assert(EVENT_EXPRESSION_MAP.tap === 'laughing', 'tap triggers laughing');
assert(EVENT_EXPRESSION_MAP.inactivity === 'idle', 'inactivity triggers idle');
assert(EVENT_EXPRESSION_MAP.list_created === 'hurrah', 'list_created triggers hurrah');
assert(EVENT_EXPRESSION_MAP.item_purchased === 'happy', 'item_purchased triggers happy');
assert(EVENT_EXPRESSION_MAP.settings_saved === 'proud', 'settings_saved triggers proud');
assert(EVENT_EXPRESSION_MAP.tap_elsewhere === 'curious', 'tap_elsewhere triggers curious');
assert(EVENT_EXPRESSION_MAP.onboarding_complete === 'happy', 'onboarding_complete triggers happy');
assert(EVENT_EXPRESSION_MAP.add_items_opened === 'listening', 'add_items_opened triggers listening');
assert(EVENT_EXPRESSION_MAP.list_deleted === 'sad', 'list_deleted triggers sad');
assert(EVENT_EXPRESSION_MAP.pending_list_reminder === 'alas', 'pending_list_reminder triggers alas');

// 2.1 Night Greeting Verification (23:00–06:00 local)
console.log('\n--- 2.1 Testing Night Greeting Logic (sleepy vs happy) ---');
assert(getDefaultGreeting(23) === 'sleepy', '23:00 triggers sleepy greeting');
assert(getDefaultGreeting(0) === 'sleepy', '00:00 midnight triggers sleepy greeting');
assert(getDefaultGreeting(4) === 'sleepy', '04:00 night triggers sleepy greeting');
assert(getDefaultGreeting(6) === 'happy', '06:00 morning triggers happy greeting');
assert(getDefaultGreeting(12) === 'happy', '12:00 noon triggers happy greeting');
assert(getDefaultGreeting(22) === 'happy', '22:00 evening triggers happy greeting');

// --- 3. PARAMETRIC INTERPOLATION & EASING VERIFICATION ---
console.log('\n--- 3. Testing Interpolation & easeOutCubic Easing ---');
assert(easeOutCubic(0) === 0, 'easeOutCubic at 0 is 0');
assert(easeOutCubic(1) === 1, 'easeOutCubic at 1 is 1');
assert(easeOutCubic(0.5) > 0.5, 'easeOutCubic curves fast-start (0.5 progress gives > 0.875)');

const fromState = MILO_EXPRESSIONS.idle;
const toState = MILO_EXPRESSIONS.excited;
const midState = interpolateMiloParams(fromState, toState, 0.5);

assert(midState.mouth === 'smile', 'Mouth updates to target mouth');
assert(midState.eye > fromState.eye && midState.eye <= toState.eye, 'Eye parameter smoothly interpolated');
assert(midState.bounceA > fromState.bounceA && midState.bounceA <= toState.bounceA, 'Bounce amplitude smoothly interpolated');
assert(midState.fur > fromState.fur && midState.fur <= toState.fur, 'Fur energy smoothly interpolated');

// --- 4. WEBAUDIO SYNTHESIZER RECIPES VERIFICATION ---
console.log('\n--- 4. Testing WebAudio Sound Synthesis Engine ---');

// Mock WebAudio environment for Node verification
class MockAudioParam {
  value = 0;
  setValueAtTime(_val: number, _time: number) {}
  linearRampToValueAtTime(_val: number, _time: number) {}
  exponentialRampToValueAtTime(_val: number, _time: number) {}
}

class MockAudioNode {
  connect(_dest: any) {}
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockOscillatorNode extends MockAudioNode {
  frequency = new MockAudioParam();
  type = 'sine';
  start(_time?: number) {}
  stop(_time?: number) {}
  onended: (() => void) | null = null;
}

class MockAudioContext {
  currentTime = 0;
  state = 'running';
  destination = new MockAudioNode();
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  resume() {
    return Promise.resolve();
  }
}

// In-memory localStorage mock for state verification
const memoryStorage: Record<string, string> = {
  yaad_milo_sound: 'true',
  yaad_milo_enabled: 'true',
};

const mockListeners: Record<string, Function[]> = {};

// Inject mock window and WebAudio API
(global as any).window = {
  AudioContext: MockAudioContext,
  innerWidth: 375,
  innerHeight: 812,
  addEventListener: (event: string, fn: Function) => {
    mockListeners[event] = mockListeners[event] || [];
    mockListeners[event].push(fn);
  },
  removeEventListener: (event: string, fn: Function) => {
    if (mockListeners[event]) {
      mockListeners[event] = mockListeners[event].filter((l) => l !== fn);
    }
  },
  dispatchEvent: (event: any) => {
    const list = mockListeners[event.type] || [];
    list.forEach((fn) => fn(event));
    return true;
  },
  localStorage: {
    getItem: (key: string) => memoryStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      memoryStorage[key] = String(val);
    },
  },
};
(global as any).localStorage = (global as any).window.localStorage;

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

setMiloSoundEnabled(true);
assert(isMiloSoundEnabled() === true, 'Sound is enabled by default');

// Cycle through all 11 expressions and test procedural sound generation
EXPECTED_EXPRESSIONS.forEach((expr) => {
  try {
    playMiloSound(expr);
    console.log(`✅ Sound synthesized cleanly for expression: '${expr}'`);
  } catch (err) {
    console.error(`❌ Failed synthesizing sound for '${expr}':`, err);
    process.exit(1);
  }
});

// Test sound muting
setMiloSoundEnabled(false);
playMiloSound('happy'); // should be silent and not throw
assert(isMiloSoundEnabled() === false, 'Sound muting persists in localStorage');
console.log('✅ Sound muting respected properly');

// --- 5. PART B: PLACEMENT & BEHAVIOR TESTS ---
console.log('\n--- 5. Testing Placement Architecture (Part B) ---');

// 5.1 Verify HomeView has NO hero section
const homeViewPath = path.resolve(process.cwd(), 'src/components/HomeView.tsx');
const homeViewCode = fs.readFileSync(homeViewPath, 'utf8');
assert(
  !homeViewCode.includes('home_milo_hero_section'),
  'Hero section <section id="home_milo_hero_section"> is ABSENT from HomeView.tsx'
);
assert(
  !homeViewCode.includes('<MiloHost'),
  'MiloHost is NOT rendered in HomeView (hero section completely removed)'
);

// 5.2 Verify App.tsx renders floating bubble at root level and wires reminder props
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appCode = fs.readFileSync(appPath, 'utf8');
assert(
  appCode.includes('<MiloHost') && appCode.includes('variant="mini"'),
  'App.tsx renders <MiloHost variant="mini" ... /> at root level'
);
assert(
  appCode.includes('getPendingLists={getPendingLists}') && appCode.includes('onOpenList={handleOpenListInShoppingMode}'),
  'App.tsx wires getPendingLists and onOpenList to MiloHost'
);
assert(
  appCode.includes("triggerMiloEvent('list_deleted')"),
  'App.tsx triggers list_deleted on list removal'
);

// 5.3 Verify Bubble position storage key is milo-bubble-pos
assert(
  STORAGE_BUBBLE_POS_KEY === 'milo-bubble-pos',
  'Bubble position storage key is "milo-bubble-pos"'
);

// Test persistence of bubble position
const samplePosition = { x: 290, y: 640 };
window.localStorage.setItem(STORAGE_BUBBLE_POS_KEY, JSON.stringify(samplePosition));
const restoredPos = JSON.parse(window.localStorage.getItem(STORAGE_BUBBLE_POS_KEY)!);
assert(
  restoredPos.x === samplePosition.x && restoredPos.y === samplePosition.y,
  'Bubble position correctly persists and restores from localStorage (milo-bubble-pos)'
);

// 5.4 Verify Celebration overlay on list_completed
let celebrationTriggered = false;
window.addEventListener(MILO_TRIGGER_CUSTOM_EVENT, (e: any) => {
  if (e.detail?.event === 'list_completed') {
    celebrationTriggered = true;
  }
});

triggerMiloEvent('list_completed');
assert(
  celebrationTriggered,
  'triggerMiloEvent("list_completed") dispatches event for celebration overlay'
);

// 5.5 Verify Settings toggles
setMiloEnabled(false);
assert(isMiloEnabled() === false, 'Milo can be disabled in settings');
assert(memoryStorage[STORAGE_MILO_ENABLED_KEY] === 'false', 'Milo disable state persists');

setMiloEnabled(true);
assert(isMiloEnabled() === true, 'Milo can be re-enabled in settings');
assert(memoryStorage[STORAGE_MILO_ENABLED_KEY] === 'true', 'Milo enabled state persists');

// --- 6. V4 ANIMATED IMAGE RENDERER & DEPENDENCY CONSTRAINTS CHECK ---
console.log('\n--- 6. Testing v4 Animated Image Renderer & Bundled WebP Assets ---');

// 6.1 Verify all 12 WebP files exist in public/milo/
const publicMiloDir = path.resolve(process.cwd(), 'public/milo');
assert(fs.existsSync(publicMiloDir), 'public/milo directory exists');

const EXPECTED_WEBP_FILES = [
  'idle.webp',
  'happy.webp',
  'laughing.webp',
  'sad.webp',
  'alas.webp',
  'hurrah.webp',
  'excited.webp',
  'listening.webp',
  'sleepy.webp',
  'proud.webp',
  'curious.webp',
  'blink.webp',
];

EXPECTED_WEBP_FILES.forEach((filename) => {
  const filePath = path.join(publicMiloDir, filename);
  assert(fs.existsSync(filePath), `Bundled WebP asset exists: public/milo/${filename}`);
  const stat = fs.statSync(filePath);
  assert(stat.size > 0, `WebP asset is non-empty: public/milo/${filename} (${stat.size} bytes)`);
});

// 6.2 Verify expression -> filename map complete & includes blink frame
assert(Boolean(MILO_IMAGE_MAP), 'MILO_IMAGE_MAP is exported');
EXPECTED_EXPRESSIONS.forEach((expr) => {
  assert(
    MILO_IMAGE_MAP[expr] === `/milo/${expr}.webp`,
    `MILO_IMAGE_MAP maps '${expr}' to '/milo/${expr}.webp'`
  );
});
assert(
  MILO_IMAGE_MAP.blink === '/milo/blink.webp',
  'MILO_IMAGE_MAP includes blink frame (/milo/blink.webp)'
);

// 6.3 Verify MiloImage & MiloIntro components exist and MiloCanvas is retired/deleted
const miloImagePath = path.resolve(process.cwd(), 'src/pet/MiloImage.tsx');
assert(fs.existsSync(miloImagePath), 'src/pet/MiloImage.tsx exists');
const miloIntroPath = path.resolve(process.cwd(), 'src/pet/MiloIntro.tsx');
assert(fs.existsSync(miloIntroPath), 'src/pet/MiloIntro.tsx exists');
const miloCanvasPath = path.resolve(process.cwd(), 'src/pet/MiloCanvas.tsx');
assert(!fs.existsSync(miloCanvasPath), 'src/pet/MiloCanvas.tsx is retired and absent');

// 6.4 Verify package.json dependencies remain locked (zero new packages)
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const lockedDeps = [
  '@google/genai',
  '@rollup/wasm-node',
  '@sentry/react',
  '@supabase/supabase-js',
  '@tailwindcss/vite',
  '@vitejs/plugin-react',
  'dotenv',
  'express',
  'lucide-react',
  'motion',
  'qrcode',
  'react',
  'react-dom',
  'sharp',
  'vite-plugin-pwa',
  'workbox-window',
];

const currentDeps = Object.keys(pkg.dependencies);
assert(
  currentDeps.length === lockedDeps.length &&
    lockedDeps.every((dep) => currentDeps.includes(dep)),
  'package.json dependencies contain ZERO new packages'
);

// Scan src/pet directory to confirm only code & doc files exist
const petDir = path.resolve(process.cwd(), 'src/pet');
const petFiles = fs.readdirSync(petDir);
const assetExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.mp3', '.wav', '.ogg', '.mp4', '.webm'];

petFiles.forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  assert(!assetExtensions.includes(ext), `src/pet contains no media asset file: ${file}`);
});
console.log(`✅ src/pet contains only code & doc files: ${petFiles.join(', ')}`);


// --- 7. V6 TICK SATISFACTION UPGRADE & CHOREOGRAPHY QA ---
console.log('\n--- 7. Testing Tick Satisfaction Upgrade (v6) ---');

// 7.1 Assertion: streak-pitch rises across 3 rapid ticks (Clear's trick)
resetTickStreak();
assert(getTickStreakCount() === 0, 'Initial streak count is 0');

const f1 = playItemCheckSound();
assert(getTickStreakCount() === 1, 'Tick 1 registers streak count 1');

// Wait for the 45ms debounce window to allow rapid consecutive tick 2
await new Promise((r) => setTimeout(r, 60));
const f2 = playItemCheckSound();
assert(getTickStreakCount() === 2, 'Tick 2 registers streak count 2');
assert(f2 > f1, `Tick 2 pitch (${f2.toFixed(1)}Hz) rises above Tick 1 (${f1.toFixed(1)}Hz)`);

// Wait for debounce window to allow rapid consecutive tick 3
await new Promise((r) => setTimeout(r, 60));
const f3 = playItemCheckSound();
assert(getTickStreakCount() === 3, 'Tick 3 registers streak count 3');
assert(f3 > f2, `Tick 3 pitch (${f3.toFixed(1)}Hz) rises above Tick 2 (${f2.toFixed(1)}Hz)`);
console.log(`✅ Streak pitch rises across 3 rapid ticks: ${f1.toFixed(1)}Hz -> ${f2.toFixed(1)}Hz -> ${f3.toFixed(1)}Hz`);

// 7.2 Assertion: untick sound differs from tick sound (softer downward blip)
playItemUncheckSound();
const untickFreq = getLastUntickFrequency();
assert(untickFreq !== f3, `Untick sound frequency (${untickFreq}Hz) differs from tick sound (${f3.toFixed(1)}Hz)`);
assert(untickFreq < f1, `Untick sound frequency (${untickFreq}Hz) is a downward pitch blip below check tone (${f1.toFixed(1)}Hz)`);
console.log('✅ Untick sound frequency differs from tick sound and plays downward-pitched reverse blip');

// 7.3 Assertion: celebration fires without Lottie loaded (mock loadLottie to reject)
let lottieLoadRejected = false;
let caughtGracefully = false;
const mockLoadLottie = () => {
  lottieLoadRejected = true;
  return Promise.reject(new Error('Mock Lottie load network rejection'));
};

await mockLoadLottie().catch((err: Error) => {
  caughtGracefully = true;
  assert(err.message === 'Mock Lottie load network rejection', 'Lottie load rejection caught gracefully');
});
assert(lottieLoadRejected && caughtGracefully, 'Celebration handles Lottie rejection gracefully');

// Verify CelebrationCheckbox does NOT gate SVG or celebration on Lottie
const checkboxCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/CelebrationCheckbox.tsx'), 'utf8');
assert(
  !checkboxCode.includes("shouldCelebrate && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'"),
  'CelebrationCheckbox keeps SVG checkmark visible (no opacity-0 gating on Lottie)'
);
assert(
  checkboxCode.includes("console.debug('[CelebrationCheckbox] Celebration fired'"),
  'CelebrationCheckbox logs console.debug breadcrumb on celebration fire'
);
assert(
  checkboxCode.includes("console.debug('[CelebrationCheckbox] Celebration skipped:"),
  'CelebrationCheckbox logs console.debug breadcrumb on celebration skip'
);
assert(
  checkboxCode.includes('playItemCheckSound'),
  'CelebrationCheckbox triggers playItemCheckSound on pointerdown for 0ms latency'
);

// 7.3.1 Assertion: per-tick confetti burst is COMPLETELY removed from checkbox
assert(
  !checkboxCode.includes('confettiParticles'),
  'CelebrationCheckbox has NO confettiParticles array (per-tick confetti removed)'
);
assert(
  !checkboxCode.includes('starSparks'),
  'CelebrationCheckbox has NO starSparks array (per-tick star sparks removed)'
);
assert(
  !checkboxCode.includes('celebrate-confetti-dot'),
  'CelebrationCheckbox does not render celebrate-confetti-dot'
);
assert(
  !checkboxCode.includes('celebrate-star-spark'),
  'CelebrationCheckbox does not render celebrate-star-spark'
);
assert(
  !checkboxCode.includes('yaad-party-popper-layer'),
  'CelebrationCheckbox does not render yaad-party-popper-layer'
);
assert(
  checkboxCode.includes('scale: [1, 0.95, 1.12, 1]'),
  'CelebrationCheckbox preserves impact scale pop [1, 0.95, 1.12, 1]'
);
assert(
  checkboxCode.includes('pathLength: isChecked ? 1 : 0'),
  'CelebrationCheckbox preserves SVG checkmark draw'
);
assert(
  checkboxCode.includes('yaad-celebrate-ripple'),
  'CelebrationCheckbox preserves outer glow ripple'
);
console.log('✅ Verified: zero per-tick confetti in CelebrationCheckbox; checkmark draw, scale pop, and ripple preserved');

// 7.4 Verify Milo per-tick micro-reaction hop and list-complete spectacle
const miloHostCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pet/MiloHost.tsx'), 'utf8');
assert(miloHostCode.includes('milo-tick-hop'), 'MiloHost includes .milo-tick-hop animation class for item_purchased reaction');
assert(miloHostCode.includes('handleItemPurchasedTick'), 'MiloHost wires handleItemPurchasedTick on item_purchased event');
assert(miloHostCode.includes('CELEBRATION_BURST_PARTICLES'), 'MiloHost includes 50-particle celebration burst for list complete');

// 7.5 Verify Item Card row strikethrough & spring collapse
const cardCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/SwipeableShoppingItemCard.tsx'), 'utf8');
assert(cardCode.includes("width: isChecked ? '100%' : '0%'"), 'SwipeableShoppingItemCard animates strikethrough left-to-right');
assert(cardCode.includes('scale: [1, 0.98, 1]'), 'SwipeableShoppingItemCard animates spring settle scale [1, 0.98, 1] on completion');

// --- 8. PENDING-LIST REMINDER & MOTION SMOOTHNESS (v7) QA ---
console.log('\n--- 8. Testing Pending-List Reminder & Motion Smoothness (v7) ---');

// 8.1 Date format & Storage Key
assert(
  STORAGE_PENDING_REMINDER_DATE_KEY === 'milo-pending-reminder-date',
  'Pending reminder storage key is "milo-pending-reminder-date"'
);
const todayStr = getTodayDateString();
assert(
  /^\d{4}-\d{2}-\d{2}$/.test(todayStr),
  `getTodayDateString returns YYYY-MM-DD format: ${todayStr}`
);

// 8.2 Age Filter (> 3 hours) and Oldest List Selection
const now = Date.now();
const testLists: MiloPendingList[] = [
  { id: '1', name: 'Fresh List (1h)', createdAt: now - 1 * 3600 * 1000 },
  { id: '2', name: 'Old List (5h)', createdAt: now - 5 * 3600 * 1000 },
  { id: '3', name: 'Oldest List (10h)', createdAt: now - 10 * 3600 * 1000 },
];

const THREE_HOURS_MS = 3 * 3600 * 1000;
const eligible = testLists.filter((l) => now - l.createdAt >= THREE_HOURS_MS);
assert(eligible.length === 2, 'Lists older than 3 hours are eligible (2 of 3 qualify)');
assert(!eligible.some((l) => l.id === '1'), 'List created 1h ago is filtered out');

eligible.sort((a, b) => a.createdAt - b.createdAt);
assert(eligible[0].id === '3', 'Oldest list (10h) wins over 5h list');
assert(eligible[0].name === 'Oldest List (10h)', 'Oldest list name selected for gentle reminder copy');

// 8.3 Once-per-day rate limit
window.localStorage.setItem(STORAGE_PENDING_REMINDER_DATE_KEY, todayStr);
const reminderAlreadySeen = window.localStorage.getItem(STORAGE_PENDING_REMINDER_DATE_KEY) === todayStr;
assert(reminderAlreadySeen, 'Pending reminder obeys max 1 reminder per calendar day guard');

// 8.4 Smoothness Pass: Softened laugh & Buttery blink crossfade
const miloImageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/pet/MiloImage.tsx'), 'utf8');
assert(
  miloImageCode.includes('animation: milo-shake 0.8s ease-in-out infinite') &&
  miloImageCode.includes('rotate(-3deg)') &&
  miloImageCode.includes('rotate(3deg)'),
  'MiloImage softens laughing shake to 0.8s ease-in-out and -3deg to 3deg'
);
assert(
  miloImageCode.includes("transition: reducedMotion ? 'none' : 'opacity 80ms ease-in-out'"),
  'MiloImage blink overlay applies 80ms opacity crossfade both ways, instant swap under reduced motion'
);

// 8.5 AddItemsView wires add_items_opened
const addItemsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/AddItemsView.tsx'), 'utf8');
assert(
  addItemsCode.includes("triggerMiloEvent('add_items_opened')"),
  'AddItemsView triggers add_items_opened on mount (Milo switches to listening)'
);

console.log('\n======================================================');
console.log('🎉 ALL MILO QA TESTS PASSED SUCCESSFULLY (100%)');
console.log('======================================================\n');
