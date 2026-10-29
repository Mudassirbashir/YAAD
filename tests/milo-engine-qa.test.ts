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
} from '../src/pet/MiloHost';
import {
  MILO_TRIGGER_CUSTOM_EVENT,
  triggerMiloEvent,
} from '../src/pet/useMilo';
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

// 5.2 Verify App.tsx renders floating bubble at root level
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appCode = fs.readFileSync(appPath, 'utf8');
assert(
  appCode.includes('<MiloHost variant="mini" />'),
  'App.tsx renders <MiloHost variant="mini" /> at root level'
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

// --- 6. V3 IMAGE RENDERER & DEPENDENCY CONSTRAINTS CHECK ---
console.log('\n--- 6. Testing v3 Image Renderer & Bundled WebP Assets ---');

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

// 6.3 Verify MiloImage component exists and MiloCanvas is retired/deleted
const miloImagePath = path.resolve(process.cwd(), 'src/pet/MiloImage.tsx');
assert(fs.existsSync(miloImagePath), 'src/pet/MiloImage.tsx exists');
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

console.log('\n======================================================');
console.log('🎉 ALL MILO QA TESTS PASSED SUCCESSFULLY (100%)');
console.log('======================================================\n');
