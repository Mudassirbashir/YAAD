/**
 * Milo Procedural Canvas Engine
 * 60fps Parametric Rendering with Fur Physics, Eyelid Blinks, and WebAudio Feedback
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  MiloExpression,
  MiloParams,
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

// Fixed pseudo-random distribution for reproducible, organic fur without runtime jitter
const STRAND_COUNT = 112;
const INITIAL_STRANDS: FurStrand[] = Array.from({ length: STRAND_COUNT }, (_, i) => {
  const angle = (i / STRAND_COUNT) * 2 * Math.PI;
  // Deterministic seed formula based on index
  const pseudoRand = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
  const baseLengthRatio = 0.10 + pseudoRand * 0.09;
  return {
    angle,
    baseLengthRatio,
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
    blinkTimer: 3.2, // seconds until next blink
    blinkProgress: 0, // 0..1 during blink
    isBlinking: false,
    blinkElapsed: 0,
    // Fur impulse
    tapImpulse: 0,
    // Device / Pointer tilt vector [-1, 1]
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    // Strands array clone
    strands: INITIAL_STRANDS.map((s) => ({ ...s })),
    // Battery optimization flags
    isVisible: true,
    isTabActive: true,
  });

  // Trigger one blink immediately (e.g. on expression transition or tap)
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
      // Per Rule: Fire one blink on every expression change
      triggerBlink();
    }
  }, [expression, triggerBlink]);

  // Handle user tap on Milo
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    // Add physical fur excitation impulse
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
      // gamma: left-to-right [-90, 90]
      // beta: front-to-back [-180, 180]
      s.targetTiltX = Math.max(-1, Math.min(1, e.gamma / 35));
      s.targetTiltY = Math.max(-1, Math.min(1, (e.beta - 40) / 45)); // 40 deg resting phone angle
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

      // Check battery pausing conditions
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
      // Natural blink every 2.5s to 5.0s, lasting 0.22s
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
          // Half-sine wave (0 -> 1 -> 0)
          s.blinkProgress = Math.sin((s.blinkElapsed / blinkDuration) * Math.PI);
        }
      }

      // Total eyelid cover = max(droop, blinkProgress)
      const totalLidCover = Math.min(1, Math.max(p.droop, s.blinkProgress));

      // 4. Fur Impulse Decay
      s.tapImpulse *= Math.max(0, 1 - dt * 4.5);

      // 5. Breathing & Bounce Physics
      const effFurEnergy = (prefersReduced ? p.fur * 0.4 : p.fur);
      const effBounceA = (prefersReduced ? p.bounceA * 0.25 : p.bounceA);

      // Milo center coordinates inside the canvas
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;

      // Base radius with buffer for fur and bounce
      const baseR = Math.min(canvasWidth, canvasHeight) * 0.34;
      const breathingR = baseR * (1 + 0.015 * Math.sin(s.t * 2.1));

      // Bounce offset & squash
      const bounceF = p.bounceF;
      const yOff = effBounceA > 0 ? Math.abs(Math.sin(s.t * bounceF * Math.PI)) * effBounceA : 0;
      const squashScaleY = effBounceA > 0 ? 1 - 0.05 * (yOff / effBounceA) : 1;
      const squashScaleX = 1 / Math.sqrt(squashScaleY);

      // Clear Canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Save global canvas context
      ctx.save();

      // Position Milo body
      ctx.translate(cx, cy - yOff);
      ctx.rotate(p.tilt);
      ctx.scale(squashScaleX, squashScaleY);

      // 6. DRAW FUR STRANDS (Around the circle perimeter)
      for (let i = 0; i < s.strands.length; i++) {
        const strand = s.strands[i];
        const radX = Math.cos(strand.angle);
        const radY = Math.sin(strand.angle);
        const tanX = -Math.sin(strand.angle);
        const tanY = Math.cos(strand.angle);

        // Physics formulas from spec:
        // idleSway: fur never freezes, sinusoidal sway based on time and angle
        const idleSway = Math.sin(s.t * 2.2 + strand.angle * 4) * 0.35 * effFurEnergy;

        // tiltPull: projected device-tilt on tangential strand direction
        const projected = tanX * s.tiltX + tanY * s.tiltY;
        const tiltPull = projected * (0.3 + effFurEnergy);

        // impulse: decaying tap/shake impulse
        const impulse = s.tapImpulse * Math.sin(strand.angle * 3 + s.t * 6);

        const targetBend = idleSway + tiltPull + impulse;

        // Exponential smoothing
        strand.currentBend += (targetBend - strand.currentBend) * Math.min(1, dt * 7);

        // Strand geometry: quadratic curve from edge outward
        const strandLen = breathingR * strand.baseLengthRatio;
        const startX = radX * breathingR;
        const startY = radY * breathingR;

        const tipX =
          radX * (breathingR + strandLen) + tanX * (strand.currentBend * strandLen * 0.65);
        const tipY =
          radY * (breathingR + strandLen) + tanY * (strand.currentBend * strandLen * 0.65);

        const cpX =
          radX * (breathingR + strandLen * 0.5) + tanX * (strand.currentBend * strandLen * 0.3);
        const cpY =
          radY * (breathingR + strandLen * 0.5) + tanY * (strand.currentBend * strandLen * 0.3);

        const grad = ctx.createLinearGradient(startX, startY, tipX, tipY);
        grad.addColorStop(0, '#ebb62d');
        grad.addColorStop(1, '#ffaa55');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.stroke();
      }

      // 7. DRAW MILO'S BODY (Always a circle, radial gradient #ffd968 -> #f7b91f -> #e89b0c)
      const bodyGrad = ctx.createRadialGradient(
        -breathingR * 0.22,
        -breathingR * 0.25,
        breathingR * 0.05,
        0,
        0,
        breathingR
      );
      bodyGrad.addColorStop(0, '#ffd968');
      bodyGrad.addColorStop(0.55, '#f7b91f');
      bodyGrad.addColorStop(1, '#e89b0c');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, breathingR, 0, Math.PI * 2);
      ctx.fill();

      // 8. EYES & DRIFTING PUPILS
      const eyeR = breathingR * 0.155 * p.eye;
      const driftX = s.tiltX * (breathingR * 0.04);
      const driftY = s.tiltY * (breathingR * 0.04);

      const eyePositions = [
        { x: -breathingR * 0.32 + driftX, y: -breathingR * 0.10 + driftY },
        { x: breathingR * 0.32 + driftX, y: -breathingR * 0.10 + driftY },
      ];

      eyePositions.forEach(({ x: ex, y: ey }) => {
        ctx.save();

        // Eye socket ellipse #3a2410
        ctx.fillStyle = '#3a2410';
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeR, eyeR, 0, 0, Math.PI * 2);
        ctx.fill();

        // White highlight dot (visible when eyelid is open)
        if (totalLidCover < 0.85) {
          const glintX = ex + eyeR * 0.32;
          const glintY = ey - eyeR * 0.32;
          const glintR = Math.max(1, eyeR * 0.3);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(glintX, glintY, glintR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Proper Eyelid (MILO-03): Fur-colored #f2b41c shape clipped to the eye
        if (totalLidCover > 0.02) {
          ctx.beginPath();
          ctx.ellipse(ex, ey, eyeR, eyeR, 0, 0, Math.PI * 2);
          ctx.clip();

          ctx.fillStyle = '#f2b41c';
          const topY = ey - eyeR;
          const lidHeight = eyeR * 2 * totalLidCover;
          ctx.fillRect(ex - eyeR - 3, topY - 1, (eyeR + 3) * 2, lidHeight + 1);

          // Eyelid crease line
          ctx.strokeStyle = '#df9b12';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(ex - eyeR, topY + lidHeight);
          ctx.quadraticCurveTo(ex, topY + lidHeight + 2, ex + eyeR, topY + lidHeight);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 9. MOUTH AT (0, R * 0.34)
      const mouthY = breathingR * 0.34;
      ctx.save();

      switch (p.mouth) {
        case 'smile': {
          const w = breathingR * 0.22 * (0.8 + p.mOpen * 0.4);
          const d = breathingR * 0.13 * (0.5 + p.mOpen * 0.8);
          ctx.strokeStyle = '#3a2410';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY - d * 0.3);
          ctx.quadraticCurveTo(0, mouthY + d, w, mouthY - d * 0.3);
          ctx.stroke();
          break;
        }

        case 'frown': {
          const w = breathingR * 0.2;
          const d = breathingR * 0.12 * (0.5 + p.mOpen * 0.7);
          ctx.strokeStyle = '#3a2410';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY + d * 0.3);
          ctx.quadraticCurveTo(0, mouthY - d, w, mouthY + d * 0.3);
          ctx.stroke();
          break;
        }

        case 'flat': {
          const w = breathingR * 0.16 * (0.8 + p.mOpen * 0.4);
          ctx.strokeStyle = '#3a2410';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-w, mouthY);
          ctx.lineTo(w, mouthY);
          ctx.stroke();
          break;
        }

        case 'open': {
          const rx = breathingR * 0.18;
          const ry = breathingR * 0.16 * Math.max(0.2, p.mOpen);
          ctx.beginPath();
          ctx.ellipse(0, mouthY, rx, ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#7a2d12';
          ctx.fill();
          ctx.strokeStyle = '#3a2410';
          ctx.lineWidth = 2.4;
          ctx.stroke();

          // Gentle pink tongue at base of open mouth
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(0, mouthY, rx, ry, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = '#eb6c67';
          ctx.beginPath();
          ctx.arc(0, mouthY + ry * 0.65, rx * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'o': {
          const r = breathingR * 0.11 * Math.max(0.4, p.mOpen);
          ctx.beginPath();
          ctx.ellipse(0, mouthY, r * 0.85, r, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#7a2d12';
          ctx.fill();
          ctx.strokeStyle = '#3a2410';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          break;
        }
      }
      ctx.restore();

      // 10. HURRAH SPARKLES (~16 small 4-point star particles orbiting)
      if (s.targetExpression === 'hurrah' && !prefersReduced) {
        ctx.restore(); // Exit body squash/tilt transform to orbit freely
        ctx.save();
        ctx.translate(cx, cy - yOff);

        const starCount = 16;
        for (let idx = 0; idx < starCount; idx++) {
          const orbitR = breathingR * (1.35 + 0.28 * Math.sin(idx * 1.7));
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

            // Draw 4-point star
            ctx.beginPath();
            ctx.moveTo(0, -starSize);
            ctx.quadraticCurveTo(0, 0, starSize, 0);
            ctx.quadraticCurveTo(0, 0, 0, starSize);
            ctx.quadraticCurveTo(0, 0, -starSize, 0);
            ctx.quadraticCurveTo(0, 0, 0, -starSize);
            ctx.fill();

            // Bright white center dot
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

