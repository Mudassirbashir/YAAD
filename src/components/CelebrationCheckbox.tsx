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
 * Exact integration of the user's custom completion checkbox & animation:
 * - Responsive container with rounded circular geometry
 * - SVG vector with background circle (cx="17.8" cy="17.8" r="16.8"),
 *   outer stroke circle (cx="17.8" cy="17.8" r="16.8"),
 *   and smooth draw checkmark (polyline points="10.7,18.7 15.3,23.3 24.9,13.7")
 * - 50x50 celebratory polygon burst animation playing on incomplete -> completed
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
      }, 520);
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

  // 8 celebratory radial particles with curated festive colors
  const particles = [
    { dx: 22, dy: 0, color: '#10B981', r: 3, delay: 0 },
    { dx: 16, dy: 16, color: '#F59E0B', r: 2.6, delay: 0.02 },
    { dx: 0, dy: 22, color: '#34D399', r: 3, delay: 0.01 },
    { dx: -16, dy: 16, color: '#FB7185', r: 2.6, delay: 0.03 },
    { dx: -22, dy: 0, color: '#10B981', r: 3, delay: 0 },
    { dx: -16, dy: -16, color: '#FBBF24', r: 2.6, delay: 0.02 },
    { dx: 0, dy: -22, color: '#34D399', r: 3, delay: 0.01 },
    { dx: 16, dy: -16, color: '#FB7185', r: 2.6, delay: 0.03 },
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

      {/* Dynamic Celebration Confetti Particle Burst */}
      {shouldCelebrate && (
        <svg
          key={isPlayingCelebration ? 'celebrating' : 'idle'}
          width="64"
          height="64"
          viewBox="-32 -32 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="celebrate"
          aria-hidden="true"
          style={{ width: `${size * 2.4}px`, height: `${size * 2.4}px` }}
        >
          {particles.map((p, idx) => (
            <circle
              key={idx}
              cx="0"
              cy="0"
              r={p.r}
              fill={p.color}
              className="celebrate-particle"
              style={
                {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
          {/* 4 diamond star sparks at 45 degree angles */}
          {[
            { angle: 45, d: 18, color: '#F59E0B' },
            { angle: 135, d: 18, color: '#34D399' },
            { angle: 225, d: 18, color: '#FBBF24' },
            { angle: 315, d: 18, color: '#FB7185' },
          ].map((spark, sIdx) => {
            const rad = (spark.angle * Math.PI) / 180;
            const sx = Math.cos(rad) * spark.d;
            const sy = Math.sin(rad) * spark.d;
            return (
              <polygon
                key={`spark-${sIdx}`}
                points="0,-2.5 1.8,0 0,2.5 -1.8,0"
                fill={spark.color}
                className="celebrate-particle"
                style={
                  {
                    '--dx': `${sx}px`,
                    '--dy': `${sy}px`,
                    animationDelay: '0.015s',
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
