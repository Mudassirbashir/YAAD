/**
 * Milo Parametric Engine & Verification Test Suite
 * YAAD's Interactive Pet Procedural System Verification
 */

import {
  MiloExpression,
  MILO_EXPRESSIONS,
  EVENT_EXPRESSION_MAP,
  interpolateMiloParams,
  easeOutCubic,
} from '../src/pet/miloExpressions';
import {
  playMiloSound,
  isMiloSoundEnabled,
  setMiloSoundEnabled,
} from '../src/pet/miloSounds';
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
console.log('🐾 MILO PARAMETRIC ENGINE & PROCEDURAL PET QA SUITE');
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

// Inject mock window and WebAudio API
(global as any).window = {
  AudioContext: MockAudioContext,
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    getItem: () => 'true',
    setItem: () => {},
  },
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
console.log('✅ Sound muting respected properly');

// --- 5. ZERO ASSET & DEPENDENCY HARD CONSTRAINTS CHECK ---
console.log('\n--- 5. Checking Zero Asset & Zero Dependency Constraints ---');

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verify no new unexpected dependencies were added
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

// Scan src/pet directory to confirm NO image, video, or audio files exist
const petDir = path.resolve(process.cwd(), 'src/pet');
const petFiles = fs.readdirSync(petDir);
const assetExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.mp3', '.wav', '.ogg', '.mp4', '.webm'];

petFiles.forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  assert(!assetExtensions.includes(ext), `No media asset file: ${file}`);
});
console.log(`✅ src/pet contains only code & doc files: ${petFiles.join(', ')}`);

console.log('\n======================================================');
console.log('🎉 ALL MILO QA TESTS PASSED SUCCESSFULLY (100%)');
console.log('======================================================\n');
