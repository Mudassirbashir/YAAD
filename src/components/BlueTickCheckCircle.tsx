import React, { useEffect, useRef, useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface BlueTickCheckCircleProps {
  isChecked: boolean;
  isJustCompleted?: boolean;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * BlueTickCheckCircle
 * High-fidelity animated circular blue tick / checkmark.
 * Recreates the exact dynamic ring sweep, verified blue fill, and animated stroke checkmark.
 */
export const BlueTickCheckCircle: React.FC<BlueTickCheckCircleProps> = ({
  isChecked,
  isJustCompleted = false,
  size = 24,
  className = '',
  onClick,
}) => {
  const isFirstRender = useRef(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const gradId = `yaadBlueTickGrad_${safeId}`;
  const glowId = `yaadBlueGlow_${safeId}`;

  // Trigger animation on active transition from unchecked to checked
  const shouldAnimate = isJustCompleted || (!isFirstRender.current && isChecked && !hasAnimated);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isChecked) {
      setHasAnimated(true);
    } else {
      setHasAnimated(false);
    }
  }, [isChecked]);

  const circleRadius = 9.8;
  const circumference = 2 * Math.PI * circleRadius; // ~61.57

  return (
    <div
      role="presentation"
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {/* 1. Micro Ripple Celebration Pulse (Fires upon check) */}
      <AnimatePresence>
        {(isJustCompleted || shouldAnimate) && isChecked && (
          <motion.div
            key="ripple"
            initial={{ scale: 0.9, opacity: 0.75 }}
            animate={{ scale: 1.65, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-blue-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. Main Animated SVG Container */}
      <motion.svg
        viewBox="0 0 24 24"
        style={{ width: size, height: size }}
        className="w-full h-full overflow-visible shrink-0"
        initial={false}
        animate={
          shouldAnimate
            ? {
                scale: [0.82, 1.25, 0.96, 1],
                rotate: [0, -3, 2, 0],
              }
            : {
                scale: 1,
                rotate: 0,
              }
        }
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          {/* Vivid Verified Blue Tick Gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Subtle Outer Glow Filter */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#1d4ed8" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 3. Base Unchecked State: Clean Subtle Circular Ring (the "hole") */}
        {!isChecked && (
          <circle
            cx="12"
            cy="12"
            r={circleRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-surface-dim hover:text-primary/70 transition-colors opacity-80"
          />
        )}

        {/* 4. Checked State: Sweeping Ring -> Solid Fill -> Check Stroke */}
        {isChecked && (
          <>
            {/* Filled Blue Badge Circle */}
            <motion.circle
              cx="12"
              cy="12"
              r={circleRadius}
              fill={`url(#${gradId})`}
              filter={`url(#${glowId})`}
              initial={shouldAnimate ? { scale: 0.3, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: shouldAnimate ? 0.22 : 0,
                delay: shouldAnimate ? 0.08 : 0,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: 'center' }}
            />

            {/* Dynamic Tracing Ring Stroke (Rotational sweep matching the video) */}
            {shouldAnimate && (
              <motion.circle
                cx="12"
                cy="12"
                r={circleRadius}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference, rotate: -90 }}
                animate={{ strokeDashoffset: 0, rotate: -90 }}
                transition={{ duration: 0.24, ease: 'easeInOut' }}
                style={{ transformOrigin: 'center' }}
              />
            )}

            {/* Crisp White Checkmark Path with Smooth Vector Drawing */}
            <motion.path
              d="M 7.2 12.3 L 10.5 15.6 L 16.8 8.8"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: shouldAnimate ? 0.22 : 0,
                  delay: shouldAnimate ? 0.12 : 0,
                  ease: 'easeOut',
                },
                opacity: {
                  duration: shouldAnimate ? 0.12 : 0,
                  delay: shouldAnimate ? 0.1 : 0,
                },
              }}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
};
