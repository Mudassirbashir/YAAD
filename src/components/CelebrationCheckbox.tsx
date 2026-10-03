import React, { useEffect, useRef, useState } from 'react';

export interface CelebrationCheckboxProps {
  isChecked: boolean;
  isJustCompleted?: boolean;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
}

/**
 * CelebrationCheckbox
 * Rich custom completion checkbox & party popper confetti animation in CSS:
 * - Responsive container with rounded circular geometry
 * - Checkmark scale/pop with SVG stroke animation
 * - 16-point party popper confetti burst (dots, diamonds, streamers) in CSS
 * - Retains normal completed checkmark state after animation finishes
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
  const isFirstRender = useRef(true);
  const [isPlayingCelebration, setIsPlayingCelebration] = useState(false);
  const prevCheckedRef = useRef(isChecked);

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
      setIsPlayingCelebration(true);
      const timer = setTimeout(() => {
        setIsPlayingCelebration(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isChecked]);

  const shouldCelebrate = isJustCompleted || isPlayingCelebration;

  const handleClick = (e: React.MouseEvent) => {
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
    <label
      className={`checkbox-wrapper yaad-checkbox-container container yaad-celebrate-container ${
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

      {/* Outer celebratory glowing ripple ring */}
      {shouldCelebrate && <span className="yaad-celebrate-ripple" aria-hidden="true" />}

      {/* Main Vector Checkbox with Background Circle, Stroke, and Smooth Draw Check */}
      <svg
        className="checkbox-svg"
        viewBox="0 0 35.6 35.6"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle className="background" cx="17.8" cy="17.8" r="16.8" />
        <circle className="stroke" cx="17.8" cy="17.8" r="16.8" />
        <polyline className="check" points="10.7,18.7 15.3,23.3 24.9,13.7" />
      </svg>

      {/* Dynamic Celebration Party Popper Confetti Particle Burst */}
      {shouldCelebrate && (
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
    </label>
  );
};
