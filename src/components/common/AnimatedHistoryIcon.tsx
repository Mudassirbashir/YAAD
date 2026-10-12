import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import clipboardAnimationData from '../../assets/clipboard-history-animation.json';

interface AnimatedHistoryIconProps {
  isActive: boolean;
  playTrigger?: number;
  className?: string;
  size?: number;
}

function getThemedClipboardData(isActive: boolean): any {
  try {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark');

    // Light active: #005039 (RGB 0, 80, 57)
    // Dark active: #10B981 (RGB 16, 185, 129)
    // Inactive: #737973 (RGB 115, 121, 115)
    let rgb = [0.45, 0.47, 0.45];
    if (isActive) {
      rgb = isDark ? [0.063, 0.725, 0.506] : [0.0, 0.314, 0.224];
    }

    const raw = JSON.stringify(clipboardAnimationData);
    const replaced = raw.split('[0.071,0.075,0.192').join(`[${rgb.join(',')}`);
    return JSON.parse(replaced);
  } catch {
    return clipboardAnimationData;
  }
}

export const AnimatedHistoryIcon: React.FC<AnimatedHistoryIconProps> = ({
  isActive,
  playTrigger = 0,
  className = '',
  size = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const prevTriggerRef = useRef(playTrigger);
  const prevActiveRef = useRef(isActive);

  // Initialize and update Lottie animation instance when active state or theme changes
  useEffect(() => {
    let anim: any = null;

    if (containerRef.current) {
      const lottieLib = (window as any).lottie || (window as any).bodymovin;
      if (lottieLib && typeof lottieLib.loadAnimation === 'function') {
        try {
          if (animInstanceRef.current) {
            animInstanceRef.current.destroy();
            animInstanceRef.current = null;
          }

          anim = lottieLib.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: getThemedClipboardData(isActive),
          });

          anim.setSpeed(1.2);
          animInstanceRef.current = anim;
          setIsReady(true);

          // If triggered initially or became active, play the hover-pinch animation
          if (isActive) {
            anim.goToAndPlay(0, true);
          }
        } catch (err) {
          console.warn('AnimatedHistoryIcon error:', err);
        }
      }
    }

    return () => {
      if (anim) {
        anim.destroy();
      }
      animInstanceRef.current = null;
    };
  }, [isActive]);

  // Play animation whenever playTrigger increments or tab becomes active
  useEffect(() => {
    const triggerChanged = playTrigger !== prevTriggerRef.current;
    const becameActive = isActive && !prevActiveRef.current;
    prevTriggerRef.current = playTrigger;
    prevActiveRef.current = isActive;

    if ((triggerChanged || becameActive) && animInstanceRef.current) {
      try {
        animInstanceRef.current.goToAndPlay(0, true);
      } catch (err) {
        console.warn('Animation trigger notice:', err);
      }
    }
  }, [playTrigger, isActive]);

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Lottie Animation Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-150 ${
          isActive ? 'scale-110' : 'scale-100'
        }`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {/* Static Lucide Fallback while Lottie is initializing */}
      {!isReady && (
        <ClipboardList
          className={`w-full h-full absolute inset-0 shrink-0 transition-transform duration-150 ${
            isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
          }`}
        />
      )}
    </div>
  );
};
