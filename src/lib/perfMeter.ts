import { APP_VERSION } from '../version';

export const STORAGE_PERF_METER_ENABLED_KEY = 'yaad_perf_meter_enabled';
export const STORAGE_PERF_SUMMARY_KEY = 'yaad_perf_summary';
export const PERF_METER_TOGGLE_EVENT = 'yaad:perf-meter:toggle';

export interface LongTaskRecord {
  duration: number;
  startTime: number;
  duringCountdown: boolean;
  online: boolean;
}

export interface PerfMeterSnapshot {
  enabled: boolean;
  startedAt: number;
  // Cold start (captured once per app launch)
  responseEndMs: number;
  fpMs: number;
  fcpMs: number;
  lcpMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  // Long tasks
  longTaskCount: number;
  longTaskTotalMs: number;
  worstLongTask: LongTaskRecord | null;
  worstLongTasks: LongTaskRecord[];
  countdownJankCount: number;
  // Tick latency (last 20)
  tickCount: number;
  tickAvgMs: number;
  tickWorstMs: number;
  // FPS (while panel is open)
  fpsMin: number;
  fpsAvg: number;
  fpsSampling: boolean;
  // Device & context
  cores: number | null;
  deviceMemoryGb: number | null;
  effectiveType: string | null;
  screenWidth: number;
  screenHeight: number;
  online: boolean;
  appVersion: string;
}

let started = false;
let coldStartCaptured = false;
let startedAt = 0;

let responseEndMs = 0;
let fpMs = 0;
let fcpMs = 0;
let lcpMs = 0;
let domContentLoadedMs = 0;
let loadMs = 0;

let longTaskCount = 0;
let longTaskTotalMs = 0;
let worstLongTask: LongTaskRecord | null = null;
let worstLongTasks: LongTaskRecord[] = [];
let countdownActive = false;
let countdownJankCount = 0;

let tickSamples: number[] = [];
let lastSampleOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

let fpsRafId: number | null = null;
let fpsWindowStart = 0;
let fpsFrameCount = 0;
let fpsSamples: number[] = [];
let fpsMin = 0;
let fpsAvg = 0;

let paintObserver: PerformanceObserver | null = null;
let lcpObserver: PerformanceObserver | null = null;
let longTaskObserver: PerformanceObserver | null = null;
const seenLongTaskEntries = new WeakSet<PerformanceEntry>();
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let loadHandler: (() => void) | null = null;

export function isPerfMeterEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_PERF_METER_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPerfMeterEnabled(next: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PERF_METER_ENABLED_KEY, next ? 'true' : 'false');
  } catch {}
  if (next) {
    startPerfMeter();
  } else {
    stopPerfMeter();
  }
  try {
    window.dispatchEvent(new CustomEvent(PERF_METER_TOGGLE_EVENT, { detail: { enabled: next } }));
  } catch {}
}

function readNavigationAndPaintEntriesOnce(): void {
  if (typeof performance === 'undefined') return;
  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const nav = navEntries && navEntries[0];
    if (nav) {
      responseEndMs = Math.max(0, nav.responseEnd || 0);
      domContentLoadedMs = Math.max(0, nav.domContentLoadedEventEnd || 0);
      if (nav.loadEventEnd && nav.loadEventEnd > 0) {
        loadMs = nav.loadEventEnd;
      }
    }
  } catch {}

  try {
    const paintEntries = performance.getEntriesByType('paint');
    for (const entry of paintEntries) {
      if (entry.name === 'first-paint' && entry.startTime > 0) {
        fpMs = entry.startTime;
      } else if (entry.name === 'first-contentful-paint' && entry.startTime > 0) {
        fcpMs = entry.startTime;
      }
    }
  } catch {}

  coldStartCaptured = true;
}

function persistSummary(): void {
  if (!started || typeof window === 'undefined') return;
  try {
    const snap = getPerfMeterSnapshot();
    const summary = {
      ts: Date.now(),
      v: snap.appVersion,
      fcpMs: Math.round(snap.fcpMs),
      lcpMs: Math.round(snap.lcpMs),
      loadMs: Math.round(snap.loadMs),
      tickAvgMs: Math.round(snap.tickAvgMs),
      tickWorstMs: Math.round(snap.tickWorstMs),
      tickCount: snap.tickCount,
      longTaskCount: snap.longTaskCount,
      longTaskTotalMs: Math.round(snap.longTaskTotalMs),
      longTaskWorstMs: snap.worstLongTask ? Math.round(snap.worstLongTask.duration) : 0,
      countdownJankCount: snap.countdownJankCount,
      fpsMin: snap.fpsMin,
      fpsAvg: snap.fpsAvg,
      online: snap.online,
    };
    localStorage.setItem(STORAGE_PERF_SUMMARY_KEY, JSON.stringify(summary));
  } catch {}
}

export function startPerfMeter(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  startedAt = Date.now();
  lastSampleOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!coldStartCaptured) {
    readNavigationAndPaintEntriesOnce();
  }

  if (loadMs === 0 && typeof document !== 'undefined' && document.readyState !== 'complete') {
    loadHandler = () => {
      try {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const nav = navEntries && navEntries[0];
        if (nav) {
          responseEndMs = Math.max(responseEndMs, nav.responseEnd || 0);
          domContentLoadedMs = Math.max(domContentLoadedMs, nav.domContentLoadedEventEnd || 0);
          loadMs = Math.max(loadMs, nav.loadEventEnd || performance.now());
        }
      } catch {}
      persistSummary();
    };
    window.addEventListener('load', loadHandler, { once: true });
  }

  onlineHandler = () => {
    lastSampleOnline = true;
  };
  offlineHandler = () => {
    lastSampleOnline = false;
  };
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  if (typeof PerformanceObserver !== 'undefined') {
    if (fpMs === 0 || fcpMs === 0) {
      try {
        paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint' && fpMs === 0) {
              fpMs = entry.startTime;
            } else if (entry.name === 'first-contentful-paint' && fcpMs === 0) {
              fcpMs = entry.startTime;
            }
          }
          persistSummary();
        });
        paintObserver.observe({ type: 'paint', buffered: true });
      } catch {
        paintObserver = null;
      }
    }

    try {
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last && last.startTime > 0) {
          lcpMs = last.startTime;
          persistSummary();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      lcpObserver = null;
    }

    try {
      longTaskObserver = new PerformanceObserver((list) => {
        const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
        for (const entry of list.getEntries()) {
          if (seenLongTaskEntries.has(entry)) continue;
          seenLongTaskEntries.add(entry);
          const duration = entry.duration || 0;
          const record: LongTaskRecord = {
            duration,
            startTime: entry.startTime || 0,
            duringCountdown: countdownActive,
            online: isOnlineNow,
          };
          longTaskCount += 1;
          longTaskTotalMs += duration;
          lastSampleOnline = isOnlineNow;
          if (countdownActive) {
            countdownJankCount += 1;
          }
          if (!worstLongTask || duration > worstLongTask.duration) {
            worstLongTask = record;
          }
          worstLongTasks.push(record);
          worstLongTasks.sort((a, b) => b.duration - a.duration);
          if (worstLongTasks.length > 10) {
            worstLongTasks.length = 10;
          }
        }
        persistSummary();
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch {
      longTaskObserver = null;
    }
  }

  persistSummary();
}

export function stopPerfMeter(): void {
  if (!started) return;
  started = false;
  countdownActive = false;

  stopFpsSampling();

  try {
    paintObserver?.disconnect();
  } catch {}
  paintObserver = null;

  try {
    lcpObserver?.disconnect();
  } catch {}
  lcpObserver = null;

  try {
    longTaskObserver?.disconnect();
  } catch {}
  longTaskObserver = null;

  if (typeof window !== 'undefined') {
    if (onlineHandler) window.removeEventListener('online', onlineHandler);
    if (offlineHandler) window.removeEventListener('offline', offlineHandler);
    if (loadHandler) window.removeEventListener('load', loadHandler);
  }
  onlineHandler = null;
  offlineHandler = null;
  loadHandler = null;
}

export function measureTick(startTime: number): void {
  if (!started || typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!started) return;
      const elapsed = Math.max(0, performance.now() - startTime);
      tickSamples.push(elapsed);
      if (tickSamples.length > 20) {
        tickSamples.shift();
      }
      lastSampleOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      persistSummary();
    });
  });
}

export function setPerfCountdownActive(active: boolean): void {
  if (!started) return;
  countdownActive = active;
}

export function startFpsSampling(): void {
  if (!started || fpsRafId !== null || typeof requestAnimationFrame === 'undefined') return;
  fpsWindowStart = performance.now();
  fpsFrameCount = 0;

  const loop = (now: number) => {
    if (!started || fpsRafId === null) return;
    fpsFrameCount += 1;
    const elapsed = now - fpsWindowStart;
    if (elapsed >= 1000) {
      const fps = Math.max(1, Math.min(240, Math.round((fpsFrameCount * 1000) / elapsed)));
      fpsSamples.push(fps);
      if (fpsSamples.length > 60) {
        fpsSamples.shift();
      }
      fpsMin = fpsSamples.reduce((m, v) => (v < m ? v : m), fpsSamples[0]);
      fpsAvg = Math.round(fpsSamples.reduce((s, v) => s + v, 0) / fpsSamples.length);
      fpsWindowStart = now;
      fpsFrameCount = 0;
    }
    fpsRafId = requestAnimationFrame(loop);
  };

  fpsRafId = requestAnimationFrame(loop);
}

export function stopFpsSampling(): void {
  if (fpsRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(fpsRafId);
  }
  fpsRafId = null;
  fpsFrameCount = 0;
  fpsWindowStart = 0;
}

export function clearPerfMetrics(): void {
  longTaskCount = 0;
  longTaskTotalMs = 0;
  worstLongTask = null;
  worstLongTasks = [];
  countdownJankCount = 0;
  tickSamples = [];
  fpsSamples = [];
  fpsMin = 0;
  fpsAvg = 0;
  if (started) {
    persistSummary();
  }
}

export function getPerfMeterSnapshot(): PerfMeterSnapshot {
  if (started && loadMs === 0 && typeof performance !== 'undefined') {
    try {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const nav = navEntries && navEntries[0];
      if (nav) {
        if (nav.responseEnd > 0) responseEndMs = nav.responseEnd;
        if (nav.domContentLoadedEventEnd > 0) domContentLoadedMs = nav.domContentLoadedEventEnd;
        if (nav.loadEventEnd > 0) loadMs = nav.loadEventEnd;
      }
    } catch {}
  }

  const tickCount = tickSamples.length;
  const tickAvgMs =
    tickCount > 0 ? tickSamples.reduce((sum, v) => sum + v, 0) / tickCount : 0;
  const tickWorstMs =
    tickCount > 0 ? tickSamples.reduce((max, v) => (v > max ? v : max), 0) : 0;

  const navAny = typeof navigator !== 'undefined' ? (navigator as any) : null;
  const cores =
    navAny && typeof navAny.hardwareConcurrency === 'number' ? navAny.hardwareConcurrency : null;
  const deviceMemoryGb =
    navAny && typeof navAny.deviceMemory === 'number' ? navAny.deviceMemory : null;
  const effectiveType =
    navAny && navAny.connection && typeof navAny.connection.effectiveType === 'string'
      ? navAny.connection.effectiveType
      : null;

  const screenWidth = typeof window !== 'undefined' && window.screen ? window.screen.width : 0;
  const screenHeight = typeof window !== 'undefined' && window.screen ? window.screen.height : 0;
  const online = typeof navigator !== 'undefined' ? navigator.onLine : lastSampleOnline;

  return {
    enabled: started,
    startedAt,
    responseEndMs,
    fpMs,
    fcpMs,
    lcpMs,
    domContentLoadedMs,
    loadMs,
    longTaskCount,
    longTaskTotalMs,
    worstLongTask,
    worstLongTasks: [...worstLongTasks],
    countdownJankCount,
    tickCount,
    tickAvgMs,
    tickWorstMs,
    fpsMin,
    fpsAvg,
    fpsSampling: fpsRafId !== null,
    cores,
    deviceMemoryGb,
    effectiveType,
    screenWidth,
    screenHeight,
    online,
    appVersion: APP_VERSION,
  };
}

export function formatPerfReport(snap: PerfMeterSnapshot = getPerfMeterSnapshot()): string {
  const nowStr = new Date().toLocaleString();
  const coresStr = snap.cores !== null ? String(snap.cores) : '?';
  const ramStr = snap.deviceMemoryGb !== null ? String(snap.deviceMemoryGb) : '?';
  const connStr = snap.effectiveType || '?';
  const netStr = snap.online ? 'online' : 'offline';
  const fcp = Math.round(snap.fcpMs || 0);
  const lcp = Math.round(snap.lcpMs || 0);
  const load = Math.round(snap.loadMs || 0);
  const tickAvg = Math.round(snap.tickAvgMs || 0);
  const tickWorst = Math.round(snap.tickWorstMs || 0);
  const longWorst = snap.worstLongTask ? Math.round(snap.worstLongTask.duration) : 0;
  const longTotal = Math.round(snap.longTaskTotalMs || 0);
  const fpsMinVal = Math.round(snap.fpsMin || 0);
  const fpsAvgVal = Math.round(snap.fpsAvg || 0);

  return [
    `YAAD speed report — ${nowStr} — v${snap.appVersion}`,
    `Phone: ${coresStr} cores, ${ramStr} GB RAM, ${connStr}, ${snap.screenWidth}x${snap.screenHeight}, ${netStr}`,
    `Cold start: FCP ${fcp}ms, LCP ${lcp}ms, load ${load}ms`,
    `Tick: avg ${tickAvg}ms, worst ${tickWorst}ms (n=${snap.tickCount})`,
    `Long tasks: ${snap.longTaskCount}, worst ${longWorst}ms, total ${longTotal}ms`,
    `FPS (panel open): min ${fpsMinVal}, avg ${fpsAvgVal}`,
  ].join('\n');
}
