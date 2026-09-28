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
 * Exact integration of the user's custom completion checkbox & celebration burst animation.
 * Features:
 * - Scalable container with 50% border radius
 * - Custom checkmark with smooth 0.3s cubic scaling & #20c580 background
 * - 50x50 celebratory polygon burst animation playing 'kfr-celebrate' once on incomplete -> completed
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
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [isChecked]);

  const shouldCelebrate = isJustCompleted || isPlayingCelebration;

  // Calculate font-size so that 1.3em equals requested size (e.g. 24px / 1.3 ≈ 18.5px)
  const computedFontSize = Math.round((size / 1.3) * 10) / 10;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <label
      className={`container yaad-celebrate-container ${isChecked ? 'is-checked' : ''} ${className}`}
      style={{
        fontSize: `${computedFontSize}px`,
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
      <div className="checkmark" />
      {shouldCelebrate && (
        <svg
          key={isPlayingCelebration ? 'celebrating' : 'idle'}
          width="50"
          height="50"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          className="celebrate"
          aria-hidden="true"
        >
          <polygon points="0,0 10,10" />
          <polygon points="0,25 10,25" />
          <polygon points="0,50 10,40" />
          <polygon points="50,0 40,10" />
          <polygon points="50,25 40,25" />
          <polygon points="50,50 40,40" />
        </svg>
      )}
    </label>
  );
};
