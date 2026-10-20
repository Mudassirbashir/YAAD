import React, { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { loadLottie } from '../../lib/lottieLoader';
import homeAnimationData from '../../assets/home-tab-animation.json';

interface AnimatedHomeIconProps {
  isActive: boolean;
  playTrigger?: number;
  className?: string;
  size?: number;
}

function getThemedHomeData(isActive: boolean): any {
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

    const raw = JSON.stringify(homeAnimationData);
    const replaced = raw.split('[0.071,0.075,0.192').join(`[${rgb.join(',')}`);
    return JSON.parse(replaced);
  } catch {
    return homeAnimationData;
  }
}

export const AnimatedHomeIcon: React.FC<AnimatedHomeIconProps> = ({
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
    let isCancelled = false;

    if (containerRef.current) {
      loadLottie().then((lottieLib) => {
        if (isCancelled || !lottieLib || !containerRef.current) return;
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
            animationData: getThemedHomeData(isActive),
          });

          anim.setSpeed(1.5);
          animInstanceRef.current = anim;
          setIsReady(true);

          // If triggered initially or became active, play the hover-pinch animation
          if (isActive) {
            anim.goToAndPlay(0, true);
          }
        } catch (err) {
          console.warn('AnimatedHomeIcon error:', err);
        }
      });
    }

    return () => {
      isCancelled = true;
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
        console.warn('Home animation trigger notice:', err);
      }
    }
  }, [playTrigger, isActive]);

  // Hover animation handler for mouse on desktop screens
  const handleMouseEnter = () => {
    if (animInstanceRef.current) {
      try {
        animInstanceRef.current.goToAndPlay(0, true);
      } catch (err) {
        console.warn('Home hover animation notice:', err);
      }
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer ${className}`}
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
        <Home
          className={`w-full h-full absolute inset-0 shrink-0 transition-transform duration-150 ${
            isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
          }`}
        />
      )}
    </div>
  );
};
