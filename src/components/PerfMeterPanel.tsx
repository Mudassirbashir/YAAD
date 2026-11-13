import React, { useState, useEffect } from 'react';
import {
  isPerfMeterEnabled,
  PERF_METER_TOGGLE_EVENT,
  getPerfMeterSnapshot,
  startFpsSampling,
  stopFpsSampling,
  clearPerfMetrics,
  formatPerfReport,
  PerfMeterSnapshot,
} from '../lib/perfMeter';

export const PerfMeterPanel: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => isPerfMeterEnabled());
  const [expanded, setExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [snap, setSnap] = useState<PerfMeterSnapshot | null>(() =>
    isPerfMeterEnabled() ? getPerfMeterSnapshot() : null
  );

  // Listen only for settings toggle changes
  useEffect(() => {
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled?: boolean }>).detail;
      const next = typeof detail?.enabled === 'boolean' ? detail.enabled : isPerfMeterEnabled();
      setEnabled(next);
      if (!next) {
        setExpanded(false);
        stopFpsSampling();
        setSnap(null);
      } else {
        setSnap(getPerfMeterSnapshot());
      }
    };
    window.addEventListener(PERF_METER_TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(PERF_METER_TOGGLE_EVENT, onToggle);
  }, []);

  // Poll snapshot at most 2 times per second (500ms) ONLY while meter is enabled
  useEffect(() => {
    if (!enabled) return;
    setSnap(getPerfMeterSnapshot());
    const id = window.setInterval(() => {
      setSnap(getPerfMeterSnapshot());
    }, 500);
    return () => window.clearInterval(id);
  }, [enabled]);

  // Run FPS rAF sampler ONLY while panel is expanded
  useEffect(() => {
    if (!enabled || !expanded) {
      stopFpsSampling();
      return;
    }
    startFpsSampling();
    return () => {
      stopFpsSampling();
    };
  }, [enabled, expanded]);

  if (!enabled || !snap) return null;

  const lcpSec = (snap.lcpMs / 1000).toFixed(1);
  const tickAvg = Math.round(snap.tickAvgMs);
  const tickWorst = Math.round(snap.tickWorstMs);
  const fcpMs = Math.round(snap.fcpMs);
  const lcpMs = Math.round(snap.lcpMs);
  const loadMs = Math.round(snap.loadMs);
  const longWorst = snap.worstLongTask ? Math.round(snap.worstLongTask.duration) : 0;
  const longTotal = Math.round(snap.longTaskTotalMs);

  const handleCopy = async () => {
    const text = formatPerfReport(getPerfMeterSnapshot());
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleClear = () => {
    clearPerfMetrics();
    setSnap(getPerfMeterSnapshot());
  };

  return (
    <div
      id="perf_meter_container"
      className="fixed right-3 bottom-[84px] sm:bottom-[92px] z-[60] flex flex-col items-end gap-2 pointer-events-none select-none"
      dir="ltr"
    >
      {expanded && (
        <div
          id="perf_meter_expanded_panel"
          className="pointer-events-auto w-[300px] max-w-[calc(100vw-24px)] rounded-2xl bg-[#111917]/95 text-white border border-emerald-500/30 shadow-2xl backdrop-blur-md p-3.5 text-[11px] font-mono space-y-2"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-emerald-300 text-xs">YAAD Speed Meter</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                snap.online
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {snap.online ? 'online' : 'offline'}
            </span>
          </div>

          <div className="space-y-1 text-white/90 leading-snug">
            <div>
              <span className="text-white/55">Cold start: </span>
              FCP {fcpMs}ms / LCP {lcpMs}ms / load {loadMs}ms
            </div>
            <div>
              <span className="text-white/55">Tick (n={snap.tickCount}): </span>
              avg {tickAvg}ms / worst {tickWorst}ms
            </div>
            <div>
              <span className="text-white/55">Long tasks: </span>
              {snap.longTaskCount} / worst {longWorst}ms / total {longTotal}ms
              {snap.countdownJankCount > 0 ? ` (jank: ${snap.countdownJankCount})` : ''}
            </div>
            <div>
              <span className="text-white/55">FPS (open): </span>
              min {snap.fpsMin} / avg {snap.fpsAvg}
            </div>
            <div className="text-white/75 break-words">
              <span className="text-white/55">Device: </span>
              {snap.cores ?? '?'} cores / {snap.deviceMemoryGb ?? '?'} GB /{' '}
              {snap.effectiveType || '?'} / {snap.screenWidth}x{snap.screenHeight} / v
              {snap.appVersion}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="perf_meter_copy_btn"
              type="button"
              onClick={handleCopy}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy report'}
            </button>
            <button
              id="perf_meter_clear_btn"
              type="button"
              onClick={handleClear}
              className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-xs active:scale-95 transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <button
        id="perf_meter_pill"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="pointer-events-auto px-3 py-1.5 rounded-full bg-[#111917]/90 hover:bg-[#111917] text-white border border-emerald-400/35 shadow-lg backdrop-blur-md text-[11px] font-mono tracking-tight active:scale-95 transition-transform cursor-pointer"
      >
        LCP {lcpSec}s · tick {tickAvg}ms · long tasks {snap.longTaskCount}
      </button>
    </div>
  );
};
