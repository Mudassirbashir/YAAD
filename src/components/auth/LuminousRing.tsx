import React, { useEffect, useRef } from 'react';

interface LuminousRingProps {
  size?: number; // Base pixel diameter
  onClick?: () => void;
  label?: string;
  subLabel?: string;
  isUrdu?: boolean;
  logoSrc?: string;
}

export const LuminousRing: React.FC<LuminousRingProps> = ({
  size = 380,
  onClick,
  label = 'Sign In',
  subLabel = 'Tap to continue',
  isUrdu = false,
  logoSrc,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    // Adjust canvas resolution for high-DPI displays
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const width = size;
    const height = size;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const cx = (width * dpr) / 2;
    const cy = (height * dpr) / 2;
    const baseRadius = (width * dpr) * 0.33; // Core ring radius

    // Chromatic Filament Wave definitions directly captured from the video
    // 3 Color Groups: Magenta/Violet, Electric Blue/Cyan, Coral/Orange/Gold
    const ribbonGroups = [
      {
        name: 'violet',
        baseColor: [217, 70, 239], // #d946ef
        secondaryColor: [168, 85, 247], // #a855f7
        speed: 0.00085,
        freq: 2,
        phaseOffset: 0,
        amp: baseRadius * 0.075,
        filaments: 6,
        filamentSpread: 3.2 * dpr,
      },
      {
        name: 'cyan',
        baseColor: [56, 189, 248], // #38bdf8
        secondaryColor: [59, 130, 246], // #3b82f6
        speed: -0.00072,
        freq: 2,
        phaseOffset: Math.PI * 0.65,
        amp: baseRadius * 0.065,
        filaments: 5,
        filamentSpread: 2.8 * dpr,
      },
      {
        name: 'amber',
        baseColor: [249, 115, 22], // #f97316
        secondaryColor: [239, 68, 68], // #ef4444
        speed: 0.00095,
        freq: 3,
        phaseOffset: Math.PI * 1.35,
        amp: baseRadius * 0.08,
        filaments: 6,
        filamentSpread: 3.0 * dpr,
      },
    ];

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save base state
      ctx.save();

      // Enable additive blending for realistic light bloom and chromatic overlap
      ctx.globalCompositeOperation = 'screen';

      const hoverFactor = isHoveredRef.current ? 1.25 : 1.0;

      // 1. DRAW CHROMATIC WAVE FILAMENTS (Revolving ribbons seen in the video)
      for (const group of ribbonGroups) {
        const rotTime = elapsed * group.speed * hoverFactor;
        const [r1, g1, b1] = group.baseColor;
        const [r2, g2, b2] = group.secondaryColor;

        for (let f = 0; f < group.filaments; f++) {
          const fRatio = f / (group.filaments - 1); // 0 to 1
          const spreadOffset = (f - group.filaments / 2) * group.filamentSpread;
          const alpha = (0.28 + fRatio * 0.35) * (isHoveredRef.current ? 0.9 : 0.7);

          ctx.beginPath();
          const steps = 140; // High segment resolution for silky curve

          for (let s = 0; s <= steps; s++) {
            const theta = (s / steps) * Math.PI * 2;
            // Harmonic wave formula with seamless closed loop (k * theta)
            const wave1 = Math.sin(theta * group.freq + rotTime + group.phaseOffset);
            const wave2 = Math.cos(theta * 3 - rotTime * 1.3) * 0.45;
            const wave3 = Math.sin(theta * 1 + rotTime * 0.7) * 0.35;

            const radialDelta = (wave1 + wave2 + wave3) * group.amp * hoverFactor + spreadOffset;
            const currentR = baseRadius + radialDelta;

            const x = cx + Math.cos(theta) * currentR;
            const y = cy + Math.sin(theta) * currentR;

            if (s === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();

          // Interp color
          const cr = Math.round(r1 + (r2 - r1) * fRatio);
          const cg = Math.round(g1 + (g2 - g1) * fRatio);
          const cb = Math.round(b1 + (b2 - b1) * fRatio);

          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.lineWidth = (1.1 + fRatio * 0.6) * dpr;
          ctx.stroke();
        }
      }

      // 2. DRAW TRAVELING LUMINOUS HOTSPOT (Bright light flare orbiting the perimeter)
      const flareAngle = (elapsed * 0.0011 * hoverFactor) % (Math.PI * 2);
      const flareLength = Math.PI * 0.75; // arc segment
      const flareStart = flareAngle - flareLength;

      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, flareStart, flareAngle);
      const flareGrad = ctx.createLinearGradient(
        cx + Math.cos(flareStart) * baseRadius,
        cy + Math.sin(flareStart) * baseRadius,
        cx + Math.cos(flareAngle) * baseRadius,
        cy + Math.sin(flareAngle) * baseRadius
      );
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      flareGrad.addColorStop(0.7, 'rgba(236, 72, 153, 0.45)');
      flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

      ctx.strokeStyle = flareGrad;
      ctx.lineWidth = 4.2 * dpr;
      ctx.stroke();

      // 3. DRAW SOLID WHITE-HOT CORE RING (The sharp white circular boundary from video)
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4 * dpr;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10 * dpr;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Soft outer white ring bloom
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 4.5 * dpr;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      {/* 60 FPS HTML5 Canvas Ring */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {/* Interactive Center Portal Target */}
      <button
        id="auth_animated_circle_btn"
        type="button"
        onClick={onClick}
        className="group relative z-10 flex flex-col items-center justify-center rounded-full transition-all duration-300 active:scale-95 cursor-pointer focus:outline-hidden"
        style={{
          width: `${size * 0.52}px`,
          height: `${size * 0.52}px`,
        }}
        aria-label={label}
      >
        {/* Deep Obsidian Center with Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 rounded-full bg-[#05070D]/90 backdrop-blur-md transition-all duration-300 group-hover:bg-[#080B14] group-hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] border border-white/10 group-hover:border-white/25" />

        {/* Floating Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          {logoSrc && (
            <img
              src={logoSrc}
              alt="YAAD"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 mb-1"
            />
          )}

          <span
            className={`font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200 ${
              isUrdu ? 'font-urdu text-xl sm:text-2xl' : "font-['Plus_Jakarta_Sans'] text-lg sm:text-xl"
            }`}
          >
            {label}
          </span>

          <span className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors font-['Manrope'] font-medium flex items-center gap-1">
            <span>{subLabel}</span>
            <svg
              className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  );
};
