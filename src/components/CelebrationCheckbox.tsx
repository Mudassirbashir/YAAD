import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { triggerHaptic, playItemCheckSound } from '../lib/sound';
import { loadLottie } from '../lib/lottieLoader';

export interface CelebrationCheckboxProps {
  isChecked: boolean;
  isJustCompleted?: boolean;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onChange?: (checked: boolean) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  ariaLabel?: string;
}

let cachedCheckCircleData: any = null;

// Dynamically and lazily load Lottie animation JSON only when celebration runs
async function getThemedAnimationData() {
  if (!cachedCheckCircleData) {
    try {
      const mod = await import('../assets/check-circle-animation.json');
      cachedCheckCircleData = mod.default || mod;
    } catch {
      return null;
    }
  }
  try {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const primaryRgb = isDark ? [0.063, 0.725, 0.506] : [0.0, 0.314, 0.224]; // #10B981 or #005039
    const raw = JSON.stringify(cachedCheckCircleData);
    const replaced = raw.split('[0.071,0.075,0.192').join(`[${primaryRgb.join(',')}`);
    return JSON.parse(replaced);
  } catch {
    return cachedCheckCircleData;
  }
}

/**
 * CelebrationCheckbox
 * Tick Satisfaction (Clean Edition):
 * - Immediate tactile press feedback (scale 0.95x over 150ms) with zero-latency pointerdown audio trigger
 * - Smooth SVG checkmark stroke-dashoffset draw over 300ms (cubic-bezier(0.650, 0, 0.450, 1))
 * - Impact pop (scale 1.0 -> 1.12 -> 1.0) with spring overshoot (cubic-bezier(0.34, 1.56, 0.64, 1))
 * - Synchronized outer shockwave glow ripple ring
 * - Zero per-tick particle burst (spectacle is strictly reserved for list-complete)
 * - Fully uncoupled from Lottie loading: celebration always renders even if Lottie rejects or is delayed
 */
export const CelebrationCheckbox: React.FC<CelebrationCheckboxProps> = ({
  isChecked,
  isJustCompleted = false,
  size = 24,
  className = '',
  onClick,
  onChange,
  onPointerDown,
  ariaLabel,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const [isPressed, setIsPressed] = useState(false);
  const [isPlayingCelebration, setIsPlayingCelebration] = useState(false);
  const prevCheckedRef = useRef(isChecked);
  const lottieContainerRef = useRef<HTMLDivElement>(null);

  // Play animation when item transitions from incomplete -> completed
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
        console.debug('[CelebrationCheckbox] Celebration fired', {
          isChecked,
          isJustCompleted,
          isPlayingCelebration: true,
        });
        triggerHaptic([24, 18, 30]);
        setIsPlayingCelebration(true);
        const timer = setTimeout(() => {
          setIsPlayingCelebration(false);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        console.debug('[CelebrationCheckbox] Celebration skipped: prefers-reduced-motion active');
        triggerHaptic(12);
      }
    } else if (!isChecked) {
      console.debug('[CelebrationCheckbox] Celebration skipped: item unchecked');
      setIsPlayingCelebration(false);
    }
  }, [isChecked, isJustCompleted, prefersReducedMotion]);

  const shouldCelebrate = (isJustCompleted || isPlayingCelebration) && !prefersReducedMotion;

  // Optional progressive enhancement: Lottie vector circle pinch overlay
  useEffect(() => {
    let anim: any = null;
    let isCancelled = false;

    if (shouldCelebrate && lottieContainerRef.current) {
      Promise.all([loadLottie(), getThemedAnimationData()])
        .then(([lottieLib, animData]) => {
          if (isCancelled || !lottieLib || !lottieContainerRef.current || !animData) return;
          try {
            if (anim) {
              anim.destroy();
            }
            anim = lottieLib.loadAnimation({
              container: lottieContainerRef.current,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              animationData: animData,
            });

            anim.setSpeed(1.2);

            anim.addEventListener('complete', () => {
              if (!isCancelled) {
                setIsPlayingCelebration(false);
              }
            });
          } catch (err) {
            console.debug('[CelebrationCheckbox] Lottie init skipped/failed:', err);
          }
        })
        .catch((err) => {
          console.debug('[CelebrationCheckbox] Lottie load rejected:', err);
        });
    }

    return () => {
      isCancelled = true;
      if (anim) {
        anim.destroy();
      }
    };
  }, [shouldCelebrate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true);
    if (!isChecked) {
      // Fire tick sound immediately on pointerdown for ~0ms latency
      playItemCheckSound();
    }
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const handlePointerLeave = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    setIsPressed(false);
    triggerHaptic(14);
    if (onClick) {
      onClick(e);
    }
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <motion.label
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      animate={
        prefersReducedMotion
          ? { scale: 1 }
          : isChecked
          ? shouldCelebrate
            ? { scale: [1, 0.95, 1.12, 1] }
            : { scale: 1 }
          : isPressed
          ? { scale: 0.95 }
          : { scale: 1 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : isPressed
          ? { duration: 0.15, ease: 'easeOut' }
          : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
      }
      className={`checkbox-wrapper yaad-checkbox-container container yaad-celebrate-container cursor-pointer select-none ${
        isChecked ? 'is-checked' : ''
      } ${shouldCelebrate ? 'is-celebrating' : ''} ${className}`}
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

      {/* Outer celebratory glowing ripple ring synced to impact instant */}
      {shouldCelebrate && (
        <span className="yaad-celebrate-ripple" aria-hidden="true" />
      )}

      {/* Main Vector Checkbox with Background Circle, Stroke, and Smooth Draw Check */}
      {/* Decoupled from Lottie so it ALWAYS renders and animates immediately */}
      <svg
        className="checkbox-svg transition-opacity duration-150 opacity-100"
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
          style={{ transition: 'none' }}
          initial={false}
          animate={{
            pathLength: isChecked ? 1 : 0,
            opacity: isChecked ? 1 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: [0.650, 0, 0.450, 1] }
          }
        />
      </svg>

      {/* Optional Lottie Vector Enhancement Layer */}
      {shouldCelebrate && (
        <div
          ref={lottieContainerRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 w-full h-full overflow-visible scale-110"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )}
    </motion.label>
  );
};
