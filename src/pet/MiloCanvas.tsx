/**
 * Milo Procedural Canvas Engine - v2 Look Match
 * 60fps Parametric Rendering with Soft Pom-Pom Fur Physics, Soulful Eyes, and WebAudio Feedback
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  MiloExpression,
  MILO_EXPRESSIONS,
  interpolateMiloParams,
} from './miloExpressions';

export interface MiloCanvasProps {
  expression?: MiloExpression;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  onTap?: () => void;
  reducedMotion?: boolean;
}

interface FurStrand {
  angle: number;
  baseLengthRatio: number;
  currentBend: number;
}

interface SurfaceTuft {
  xRatio: number;
  yRatio: number;
  angle: number;
  lengthRatio: number;
  currentBend: number;
}

// 156 perimeter strands for dense, touchable pom-pom fluff
const STRAND_COUNT = 156;
const INITIAL_STRANDS: FurStrand[] = Array.from({ length: STRAND_COUNT }, (_, i) => {
  const angle = (i / STRAND_COUNT) * 2 * Math.PI;
  // Deterministic seed formula based on index for stable, organic fluff
  const pseudoRand = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
  // Short, dense pom-pom tufts (reference match: ~5-10% of radius)
  const baseLengthRatio = 0.055 + pseudoRand * 0.05;
  return {
    angle,
    baseLengthRatio,
    currentBend: 0,
  };
});

// Deterministic surface micro-tufts for plush 3D pom-pom fleece texture
const TUFT_COUNT = 52;
const INITIAL_TUFTS: SurfaceTuft[] = Array.from({ length: TUFT_COUNT }, (_, i) => {
  const seed1 = Math.abs(Math.sin((i + 7) * 31.4159) * 28472.193) % 1;
  const seed2 = Math.abs(Math.sin((i + 13) * 17.291) * 91823.471) % 1;
  const r = 0.25 + seed1 * 0.65; // keep away from dead-center face
  const theta = seed2 * 2 * Math.PI;
  return {
    xRatio: Math.cos(theta) * r,
    yRatio: Math.sin(theta) * r,
    angle: theta,
    lengthRatio: 0.05 + (seed1 * 0.04),
    currentBend: 0,
  };
});

export const MiloCanvas: React.FC<MiloCanvasProps> = ({
  expression = 'idle',
  size = 180,
  width,
  height,
  className = '',
  onTap,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasWidth = width || size;
  const canvasHeight = height || size;

  // Animation state stored in refs to prevent React rerender cycle overhead
  const stateRef = useRef({
    targetExpression: expression,
    fromExpressionParams: MILO_EXPRESSIONS[expression],
    currentParams: { ...MILO_EXPRESSIONS[expression] },
    transitionProgress: 1, // 0..1
    isTransitioning: false,
    t: 0,
    lastFrameTime: 0,
    // Eyelid & blink state
    blinkTimer: 3.0,
    blinkProgress: 0,
    isBlinking: false,
    blinkElapsed: 0,
    // Fur impulse
    tapImpulse: 0,
    // Device / Pointer tilt vector [-1, 1]
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    // Strands & surface tufts
    strands: INITIAL_STRANDS.map((s) => ({ ...s })),
    tufts: INITIAL_TUFTS.map((tuft) => ({ ...tuft })),
    // Battery optimization flags
    isVisible: true,
    isTabActive: true,
  });

  // Trigger one blink immediately
  const triggerBlink = useCallback(() => {
    const s = stateRef.current;
    s.isBlinking = true;
    s.blinkElapsed = 0;
    s.blinkProgress = 0;
  }, []);

  // Handle external expression change
  useEffect(() => {
    const s = stateRef.current;
    if (s.targetExpression !== expression) {
      s.fromExpressionParams = { ...s.currentParams };
      s.targetExpression = expression;
      s.transitionProgress = 0;
      s.isTransitioning = true;
      triggerBlink();
    }
  }, [expression, triggerBlink]);

  // Handle user tap on Milo
  const handlePointerDown = () => {
    const s = stateRef.current;
    s.tapImpulse = 1.0;
    triggerBlink();

    // Check iOS DeviceOrientation permission if supported
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .catch(() => {});
    }

    if (onTap) {
      onTap();
    }
  };

  // Track pointer hover/drag as natural tilt fallback
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const s = stateRef.current;
    s.targetTiltX = Math.max(-1, Math.min(1, dx));
    s.targetTiltY = Math.max(-1, Math.min(1, dy));
  };

  const handlePointerLeave = () => {
    const s = stateRef.current;
    s.targetTiltX = 0;
    s.targetTiltY = 0;
  };

  // Device orientation motion listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const s = stateRef.current;
      s.targetTiltX = Math.max(-1, Math.min(1, e.gamma / 35));
      s.targetTiltY = Math.max(-1, Math.min(1, (e.beta - 40) / 45));
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Main 60fps Procedural Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const s = stateRef.current;

    // Detect prefers-reduced-motion media query
    const mql =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReduced = reducedMotion || (mql ? mql.matches : false);

    const handleMql = (e: MediaQueryListEvent) => {
      prefersReduced = reducedMotion || e.matches;
    };
    if (mql && mql.addEventListener) {
      mql.addEventListener('change', handleMql);
    }

    // Battery Optimization 1: Visibility change listener
    const handleVisibilityChange = () => {
      s.isTabActive = !document.hidden;
      if (s.isTabActive && s.isVisible) {
        s.lastFrameTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Battery Optimization 2: IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          s.isVisible = entry ? entry.isIntersecting : true;
          if (s.isVisible && s.isTabActive) {
            s.lastFrameTime = performance.now();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    // DPR & Canvas sizing
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    s.lastFrameTime = performance.now();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      if (!s.isTabActive || !s.isVisible) {
        return;
      }

      // Delta time clamped to max 0.05s
      const rawDt = (now - s.lastFrameTime) / 1000;
      s.lastFrameTime = now;
      const dt = Math.max(0.001, Math.min(0.05, rawDt));
      s.t += dt;

      // 1. Parameter Transition (Lerp over 0.35s with easeOutCubic)
      const targetParams = MILO_EXPRESSIONS[s.targetExpression];
      if (s.isTransitioning) {
        s.transitionProgress += dt / 0.35;
        if (s.transitionProgress >= 1) {
          s.transitionProgress = 1;
          s.isTransitioning = false;
        }
        s.currentParams = interpolateMiloParams(
          s.fromExpressionParams,
          targetParams,
          s.transitionProgress
        );
      } else {
        s.currentParams = targetParams;
      }

      const p = s.currentParams;

      // 2. Smooth tilt tracking
      s.tiltX += (s.targetTiltX - s.tiltX) * Math.min(1, dt * 6);
      s.tiltY += (s.targetTiltY - s.tiltY) * Math.min(1, dt * 6);

      // 3. Eyelid Blink Engine (MILO-03)
      if (!s.isBlinking) {
        s.blinkTimer -= dt;
        if (s.blinkTimer <= 0) {
          s.isBlinking = true;
          s.blinkElapsed = 0;
          s.blinkProgress = 0;
          s.blinkTimer = 2.5 + Math.random() * 2.5;
        }
      } else {
        s.blinkElapsed += dt;
        const blinkDuration = 0.22;
        if (s.blinkElapsed >= blinkDuration) {
          s.isBlinking = false;
          s.blinkProgress = 0;
        } else {
          s.blinkProgress = Math.sin((s.blinkElapsed / blinkDuration) * Math.PI);
        }
      }

      const totalLidCover = Math.min(1, Math.max(p.droop, s.blinkProgress));

      // 4. Fur Impulse Decay
      s.tapImpulse *= Math.max(0, 1 - dt * 4.5);

      // 5. Breathing & Bounce Physics
      const effFurEnergy = prefersReduced ? p.fur * 0.4 : p.fur;
      const effBounceA = prefersReduced ? p.bounceA * 0.25 : p.bounceA;

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // Base radius scaled to fit comfortably inside the canvas with fluff
      const baseR = Math.min(canvasWidth, canvasHeight) * 0.38;
      const breathingR = baseR * (1 + 0.015 * Math.sin(s.t * 2.1));

      // Bounce offset & volume-preserving squash
      const bounceF = p.bounceF;
      const yOff = effBounceA > 0 ? Math.abs(Math.sin(s.t * bounceF * Math.PI)) * effBounceA : 0;
      const squashScaleY = effBounceA > 0 ? 1 - 0.05 * (yOff / effBounceA) : 1;
      const squashScaleX = 1 / Math.sqrt(squashScaleY);

      // Clear Canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Save global canvas context
      ctx.save();

      // Position Milo body with bounce, tilt, squash
      ctx.translate(cx, cy - yOff);
      ctx.rotate(p.tilt);
      ctx.scale(squashScaleX, squashScaleY);

      // 6. DRAW BASE BODY (Soft radial gradient - plush pom-pom core)
      // Light source slightly above center, gentle transition to warm golden edges
      const bodyGrad = ctx.createRadialGradient(
        0,
        -breathingR * 0.16,
        breathingR * 0.08,
        0,
        0,
        breathingR * 1.02
      );
      bodyGrad.addColorStop(0, '#fff4b8'); // soft light golden center highlight
      bodyGrad.addColorStop(0.28, '#fed762'); // warm sunny gold
      bodyGrad.addColorStop(0.62, '#fcbc1f'); // YAAD brand yellow
      bodyGrad.addColorStop(0.86, '#f1a418'); // warm honey golden amber
      bodyGrad.addColorStop(1.0, '#de8c0e');  // soft golden depth

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, breathingR, 0, Math.PI * 2);
      ctx.fill();

      // Subtle soft ambient occlusion shadow at base of sphere
      const baseShadow = ctx.createRadialGradient(
        0,
        breathingR * 0.65,
        breathingR * 0.2,
        0,
        breathingR * 0.85,
        breathingR * 0.95
      );
      baseShadow.addColorStop(0, 'rgba(190, 110, 8, 0.25)');
      baseShadow.addColorStop(1, 'rgba(190, 110, 8, 0)');
      ctx.fillStyle = baseShadow;
      ctx.beginPath();
      ctx.arc(0, 0, breathingR, 0, Math.PI * 2);
      ctx.fill();

      // 7. DRAW SURFACE FLEECE TUFTS (Pom-pom touchable fuzziness across the body)
      const tuftStrokeW = Math.max(1.3, breathingR * 0.026);
      ctx.lineWidth = tuftStrokeW;
      ctx.lineCap = 'round';

      for (let i = 0; i < s.tufts.length; i++) {
        const tuft = s.tufts[i];
        // Skip tufts directly in the eye/mouth zone to keep face expressive
        if (
          Math.abs(tuft.xRatio) < 0.45 &&
          tuft.yRatio > -0.22 &&
          tuft.yRatio < 0.32
        ) {
          continue;
        }

        const tx = tuft.xRatio * breathingR;
        const ty = tuft.yRatio * breathingR;
        const tuftLen = breathingR * tuft.lengthRatio;

        const radX = Math.cos(tuft.angle);
        const radY = Math.sin(tuft.angle);
        const tanX = -Math.sin(tuft.angle);
        const tanY = Math.cos(tuft.angle);

        const idleSway = Math.sin(s.t * 2.2 + tuft.angle * 4) * 0.25 * effFurEnergy;
        const projected = tanX * s.tiltX + tanY * s.tiltY;
        const tiltPull = projected * (0.2 + effFurEnergy);
        const impulse = s.tapImpulse * Math.sin(tuft.angle * 3 + s.t * 5);
        const targetBend = idleSway + tiltPull + impulse;

        tuft.currentBend += (targetBend - tuft.currentBend) * Math.min(1, dt * 7);

        const tipX = tx + radX * tuftLen + tanX * (tuft.currentBend * tuftLen * 0.5);
        const tipY = ty + radY * tuftLen + tanY * (tuft.currentBend * tuftLen * 0.5);
        const cpX = tx + radX * (tuftLen * 0.5) + tanX * (tuft.currentBend * tuftLen * 0.25);
        const cpY = ty + radY * (tuftLen * 0.5) + tanY * (tuft.currentBend * tuftLen * 0.25);

        // Soft golden cream highlight tufts vs warm shadow tufts
        ctx.strokeStyle = tuft.yRatio < 0.1
          ? 'rgba(255, 245, 195, 0.42)'
          : 'rgba(215, 135, 12, 0.26)';

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.stroke();
      }

      // 8. DRAW PERIMETER FUR STRANDS (156 strands, short, dense, soft pom-pom fluff)
      const strandStrokeW = Math.max(1.7, breathingR * 0.034);
      ctx.lineWidth = strandStrokeW;
      ctx.lineCap = 'round';

      for (let i = 0; i < s.strands.length; i++) {
        const strand = s.strands[i];
        const radX = Math.cos(strand.angle);
        const radY = Math.sin(strand.angle);
        const tanX = -Math.sin(strand.angle);
        const tanY = Math.cos(strand.angle);

        // Sinusoidal organic sway (fur never freezes at idle)
        const idleSway = Math.sin(s.t * 2.2 + strand.angle * 4) * 0.28 * effFurEnergy;

        // Device tilt / pointer pull
        const projected = tanX * s.tiltX + tanY * s.tiltY;
        const tiltPull = projected * (0.24 + effFurEnergy);

        // Decaying tap impulse
        const impulse = s.tapImpulse * Math.sin(strand.angle * 3 + s.t * 5);
        const targetBend = idleSway + tiltPull + impulse;

        // Exponential smoothing
        strand.currentBend += (targetBend - strand.currentBend) * Math.min(1, dt * 7);

        // Strand geometry: short pom-pom tuft
        const strandLen = breathingR * strand.baseLengthRatio;
        const startX = radX * (breathingR - 1);
        const startY = radY * (breathingR - 1);

        const tipX =
          radX * (breathingR + strandLen) + tanX * (strand.currentBend * strandLen * 0.55);
        const tipY =
          radY * (breathingR + strandLen) + tanY * (strand.currentBend * strandLen * 0.55);

        const cpX =
          radX * (breathingR + strandLen * 0.5) + tanX * (strand.currentBend * strandLen * 0.25);
        const cpY =
          radY * (breathingR + strandLen * 0.5) + tanY * (strand.currentBend * strandLen * 0.25);

        // Soft warm golden-cream gradient: warm root to soft creamy sunny tip
        const grad = ctx.createLinearGradient(startX, startY, tipX, tipY);
        grad.addColorStop(0, '#f5af1f');
        grad.addColorStop(0.5, '#fedb6e');
        grad.addColorStop(1, '#fff1b4');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.stroke();
      }

      // 9. EYES & SOULFUL HIGHLIGHTS (Bigger & rounder: radius ~0.19 of body radius)
      const eyeR = breathingR * 0.19 * p.eye;
      const driftX = s.tiltX * (breathingR * 0.035);
      const driftY = s.tiltY * (breathingR * 0.035);

      const eyePositions = [
        { x: -breathingR * 0.29 + driftX, y: -breathingR * 0.03 + driftY, isLeft: true },
        { x: breathingR * 0.29 + driftX, y: -breathingR * 0.03 + driftY, isLeft: false },
      ];

      eyePositions.forEach(({ x: ex, y: ey, isLeft }) => {
        ctx.save();

        // Eye socket: deep dark chocolate brown #231206 with subtle glassy depth
        const eyeGrad = ctx.createRadialGradient(
          ex - eyeR * 0.2,
          ey - eyeR * 0.2,
          eyeR * 0.1,
          ex,
          ey,
          eyeR
        );
        eyeGrad.addColorStop(0, '#321b0b');
        eyeGrad.addColorStop(1, '#201005');

        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeR, eyeR, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper lash / eyelid hood line (soft, cute character contour from reference)
        ctx.strokeStyle = '#201005';
        ctx.lineWidth = Math.max(2.2, eyeR * 0.18);
        ctx.lineCap = 'round';
        ctx.beginPath();
        const wingOffset = isLeft ? -eyeR * 0.15 : eyeR * 0.15;
        ctx.moveTo(ex - eyeR * 1.05 + wingOffset, ey - eyeR * 0.15);
        ctx.quadraticCurveTo(ex, ey - eyeR * 1.18, ex + eyeR * 1.05 + wingOffset, ey - eyeR * 0.15);
        ctx.stroke();

        // Double glint highlight (primary crisp white glint + soft secondary reflection)
        if (totalLidCover < 0.85) {
          // Primary gloss catchlight (large white reflection)
          const glintX = ex + eyeR * 0.32;
          const glintY = ey - eyeR * 0.30;
          const glintR = Math.max(1.5, eyeR * 0.33);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(glintX, glintY, glintR, 0, Math.PI * 2);
          ctx.fill();

          // Secondary soft reflection at bottom-left
          const secGlintX = ex - eyeR * 0.24;
          const secGlintY = ey + eyeR * 0.28;
          const secGlintR = Math.max(1, eyeR * 0.14);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
          ctx.beginPath();
          ctx.arc(secGlintX, secGlintY, secGlintR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Proper Eyelid (MILO-03): Fur-colored #f4b620 shape clipped to the eye
        if (totalLidCover > 0.02) {
          ctx.beginPath();
          ctx.ellipse(ex, ey, eyeR, eyeR, 0, 0, Math.PI * 2);
          ctx.clip();

          ctx.fillStyle = '#f4b620';
          const topY = ey - eyeR;
          const lidHeight = eyeR * 2 * totalLidCover;
          ctx.fillRect(ex - eyeR - 3, topY - 1, (eyeR + 3) * 2, lidHeight + 1);

          // Eyelid crease line
          ctx.strokeStyle = '#d7950e';
          ctx.lineWidth = Math.max(1.8, eyeR * 0.14);
          ctx.beginPath();
          ctx.moveTo(ex - eyeR, topY + lidHeight);
          ctx.quadraticCurveTo(ex, topY + lidHeight + 2, ex + eyeR, topY + lidHeight);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 10. MOUTH (Small, sweet, gentle closed-lip smile just below eyes: y ~ 0.20 R)
      const mouthY = breathingR * 0.20;
      ctx.save();

      switch (p.mouth) {
        case 'smile': {
          // Gentle compact curved smile matching reference
          const w = breathingR * 0.17 * (0.85 + p.mOpen * 0.35);
          const d = breathingR * 0.09 * (0.6 + p.mOpen * 0.7);
          ctx.strokeStyle = '#422312';
          ctx.lineWidth = Math.max(2.4, breathingR * 0.038);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY - d * 0.25);
          ctx.quadraticCurveTo(0, mouthY + d, w, mouthY - d * 0.25);
          ctx.stroke();
          break;
        }

        case 'frown': {
          const w = breathingR * 0.16;
          const d = breathingR * 0.09 * (0.6 + p.mOpen * 0.6);
          ctx.strokeStyle = '#422312';
          ctx.lineWidth = Math.max(2.4, breathingR * 0.038);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY + d * 0.25);
          ctx.quadraticCurveTo(0, mouthY - d, w, mouthY + d * 0.25);
          ctx.stroke();
          break;
        }

        case 'flat': {
          const w = breathingR * 0.14 * (0.85 + p.mOpen * 0.3);
          ctx.strokeStyle = '#422312';
          ctx.lineWidth = Math.max(2.4, breathingR * 0.038);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY);
          ctx.lineTo(w, mouthY);
          ctx.stroke();
          break;
        }

        case 'open': {
          // Joyful laughing mouth with tongue
          const rx = breathingR * 0.16;
          const ry = breathingR * 0.14 * Math.max(0.25, p.mOpen);
          ctx.beginPath();
          ctx.ellipse(0, mouthY + ry * 0.2, rx, ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#6f240f';
          ctx.fill();
          ctx.strokeStyle = '#422312';
          ctx.lineWidth = Math.max(2.2, breathingR * 0.034);
          ctx.stroke();

          // Cute pink tongue
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(0, mouthY + ry * 0.2, rx, ry, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = '#ea6661';
          ctx.beginPath();
          ctx.arc(0, mouthY + ry * 0.7, rx * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'o': {
          const r = breathingR * 0.095 * Math.max(0.4, p.mOpen);
          ctx.beginPath();
          ctx.ellipse(0, mouthY, r * 0.85, r, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#6f240f';
          ctx.fill();
          ctx.strokeStyle = '#422312';
          ctx.lineWidth = Math.max(2.2, breathingR * 0.034);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();

      // 11. HURRAH SPARKLES (Orbiting golden 4-point stars with sinusoidal alpha)
      if (s.targetExpression === 'hurrah' && !prefersReduced) {
        ctx.restore();
        ctx.save();
        ctx.translate(cx, cy - yOff);

        const starCount = 16;
        for (let idx = 0; idx < starCount; idx++) {
          const orbitR = breathingR * (1.32 + 0.26 * Math.sin(idx * 1.7));
          const orbitSpeed = 1.0 + (idx % 4) * 0.25;
          const orbitAngle = idx * ((Math.PI * 2) / starCount) + s.t * orbitSpeed;
          const life = (s.t * 0.8 + idx * 0.22) % 1;
          const alpha = Math.sin(Math.PI * life);

          if (alpha > 0.05) {
            const sx = Math.cos(orbitAngle) * orbitR;
            const sy = Math.sin(orbitAngle) * orbitR;
            const starSize = 5 + (idx % 3) * 2;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(s.t * 3 + idx);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffd700';

            ctx.beginPath();
            ctx.moveTo(0, -starSize);
            ctx.quadraticCurveTo(0, 0, starSize, 0);
            ctx.quadraticCurveTo(0, 0, 0, starSize);
            ctx.quadraticCurveTo(0, 0, -starSize, 0);
            ctx.quadraticCurveTo(0, 0, 0, -starSize);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, starSize * 0.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
        ctx.restore();
      } else {
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) {
        observer.disconnect();
      }
      if (mql && mql.removeEventListener) {
        mql.removeEventListener('change', handleMql);
      }
    };
  }, [canvasWidth, canvasHeight, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`touch-none select-none cursor-pointer ${className}`}
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
      aria-label={`Milo the pet (${expression})`}
      role="img"
    />
  );
};
