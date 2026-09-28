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
      }, 420);
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
