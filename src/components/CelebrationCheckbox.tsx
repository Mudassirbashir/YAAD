import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { triggerHaptic } from '../lib/sound';
import checkCircleAnimationData from '../assets/check-circle-animation.json';

export interface CelebrationCheckboxProps {
  isChecked: boolean;
  isJustCompleted?: boolean;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
}

// Dynamically adapt Lottie vector colors to active light/dark theme
function getThemedAnimationData() {
  try {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const primaryRgb = isDark ? [0.063, 0.725, 0.506] : [0.0, 0.314, 0.224]; // #10B981 or #005039
    const raw = JSON.stringify(checkCircleAnimationData);
    const replaced = raw.split('[0.071,0.075,0.192').join(`[${primaryRgb.join(',')}`);
    return JSON.parse(replaced);
  } catch {
    return checkCircleAnimationData;
  }
}

/**
 * CelebrationCheckbox
 * Rich custom completion checkbox with authentic Lottie check-circle-empty-hover-pinch animation:
 * - Responsive container with rounded circular geometry
 * - Plays system-outline-4489-check-circle-empty-hover-pinch.json on item completion / purchase
 * - Smoothly transitions to completed checkmark state after animation finishes
 */
export const CelebrationCheckbox: React.FC<CelebrationCheckboxProps> = ({
  isChecked,
  isJustCompleted = false,
  size = 24,
  className = '',
  onClick,
  onChange,
  ariaLabel,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const [isPlayingCelebration, setIsPlayingCelebration] = useState(false);
  const prevCheckedRef = useRef(isChecked);
  const lottieContainerRef = useRef<HTMLDivElement>(null);

  // Play animation once when item changes from incomplete -> completed
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCheckedRef.current = isChecked;
      return;
    }

    const wasChecked = prevCheckedRef.current;
    prevCheckedRef.current = isChecked;

    if (!wasChecked && isChecked) {
      if (!prefersReducedMotion) {
        triggerHaptic([22, 16, 32]);
        setIsPlayingCelebration(true);
        const timer = setTimeout(() => {
          setIsPlayingCelebration(false);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        triggerHaptic(12);
      }
    } else if (!isChecked) {
      setIsPlayingCelebration(false);
    }
  }, [isChecked, prefersReducedMotion]);

  const shouldCelebrate = (isJustCompleted || isPlayingCelebration) && !prefersReducedMotion;

  // Lottie player lifecycle management
  useEffect(() => {
    let anim: any = null;

    if (shouldCelebrate && lottieContainerRef.current) {
      const lottieLib = (window as any).lottie || (window as any).bodymovin;
      if (lottieLib && typeof lottieLib.loadAnimation === 'function') {
        try {
          anim = lottieLib.loadAnimation({
            container: lottieContainerRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: getThemedAnimationData(),
          });

          anim.setSpeed(1.2);

          anim.addEventListener('complete', () => {
            setIsPlayingCelebration(false);
          });
        } catch (err) {
          console.warn('Lottie player notice:', err);
        }
      }
    }

    return () => {
      if (anim) {
        anim.destroy();
      }
    };
  }, [shouldCelebrate]);

  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic(18);
    if (onClick) {
      onClick(e);
    }
    if (onChange) {
      onChange(!isChecked);
    }
  };

  // 12 festive confetti pieces shooting radially outward in all directions
  const confettiParticles = [
    { dx: 24, dy: -4, color: '#10B981', r: 3.2, rot: 45, delay: 0 },
    { dx: 18, dy: 18, color: '#F59E0B', r: 2.8, rot: -30, delay: 0.01 },
    { dx: 4, dy: 24, color: '#06B6D4', r: 3.0, rot: 60, delay: 0.02 },
    { dx: -18, dy: 18, color: '#FB7185', r: 2.6, rot: 90, delay: 0.015 },
    { dx: -24, dy: -2, color: '#8B5CF6', r: 3.2, rot: -45, delay: 0 },
    { dx: -18, dy: -18, color: '#FBBF24', r: 2.8, rot: 75, delay: 0.02 },
    { dx: 0, dy: -24, color: '#10B981', r: 3.0, rot: -60, delay: 0.01 },
    { dx: 18, dy: -18, color: '#EC4899', r: 2.6, rot: 30, delay: 0.025 },
    // 4 additional party streamer sparks
    { dx: 12, dy: 22, color: '#F59E0B', r: 2.4, rot: 120, delay: 0.03 },
    { dx: -22, dy: 10, color: '#34D399', r: 2.5, rot: -90, delay: 0.02 },
    { dx: -10, dy: -22, color: '#A855F7', r: 2.4, rot: 40, delay: 0.03 },
    { dx: 22, dy: -10, color: '#38BDF8', r: 2.5, rot: -80, delay: 0.015 },
  ];

  // 4 diamond star sparkles
  const starSparks = [
    { angle: 30, d: 20, color: '#F59E0B' },
    { angle: 120, d: 21, color: '#10B981' },
    { angle: 210, d: 20, color: '#EC4899' },
    { angle: 300, d: 21, color: '#06B6D4' },
  ];

  return (
    <motion.label
      whileTap={{ scale: 0.88 }}
      animate={
        isChecked
          ? { scale: [1, 0.88, 1.12, 1] }
          : { scale: 1 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.1 }
          : { duration: 0.34, ease: [0.34, 1.56, 0.64, 1] }
      }
      className={`checkbox-wrapper yaad-checkbox-container container yaad-celebrate-container cursor-pointer select-none ${
        isChecked ? 'is-checked' : ''
      } ${shouldCelebrate && !prefersReducedMotion ? 'is-celebrating' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Outer celebratory glowing ripple ring */}
      {shouldCelebrate && !prefersReducedMotion && (
        <span className="yaad-celebrate-ripple" aria-hidden="true" />
      )}

      {/* Main Vector Checkbox with Background Circle, Stroke, and Smooth Draw Check */}
      <svg
        className={`checkbox-svg transition-opacity duration-150 ${
          shouldCelebrate && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'
        }`}
        style={isChecked ? { filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.35))' } : undefined}
        viewBox="0 0 35.6 35.6"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle className="background" cx="17.8" cy="17.8" r="16.8" />
        <circle className="stroke" cx="17.8" cy="17.8" r="16.8" />
        <motion.path
          className="check"
          d="M10.7 18.7 L15.3 23.3 L24.9 13.7"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: isChecked ? 1 : 0,
            opacity: isChecked ? 1 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0.1 }
              : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </svg>

      {/* Authentic Lottie Animated Check Circle (Plays system-outline-4489-check-circle-empty-hover-pinch.json on item completion) */}
      {shouldCelebrate && !prefersReducedMotion && (
        <div
          ref={lottieContainerRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 w-full h-full overflow-visible scale-110"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )}

      {/* Dynamic Celebration Party Popper Confetti Particle Burst */}
      {shouldCelebrate && !prefersReducedMotion && (
        <svg
          key={isPlayingCelebration ? 'celebrating' : 'idle'}
          width="72"
          height="72"
          viewBox="-36 -36 72 72"
          xmlns="http://www.w3.org/2000/svg"
          className="celebrate yaad-party-popper-layer"
          aria-hidden="true"
          style={{ width: `${size * 2.8}px`, height: `${size * 2.8}px` }}
        >
          {/* Confetti Dots & Ribbons */}
          {confettiParticles.map((p, idx) => (
            <circle
              key={idx}
              cx="0"
              cy="0"
              r={p.r}
              fill={p.color}
              className="celebrate-particle celebrate-confetti-dot"
              style={
                {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  '--rot': `${p.rot}deg`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Diamond Stars / Sparks */}
          {starSparks.map((spark, sIdx) => {
            const rad = (spark.angle * Math.PI) / 180;
            const sx = Math.cos(rad) * spark.d;
            const sy = Math.sin(rad) * spark.d;
            return (
              <polygon
                key={`spark-${sIdx}`}
                points="0,-3.2 2.2,0 0,3.2 -2.2,0"
                fill={spark.color}
                className="celebrate-particle celebrate-star-spark"
                style={
                  {
                    '--dx': `${sx}px`,
                    '--dy': `${sy}px`,
                    '--rot': '45deg',
                    animationDelay: '0.01s',
                  } as React.CSSProperties
                }
              />
            );
          })}
        </svg>
      )}
    </motion.label>
  );
};
