import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import cartAnimationData from '../../assets/cart-start-shopping-animation.json';

interface AnimatedCartIconProps {
  isPlaying?: boolean;
  triggerPlay?: number;
  color?: string; // e.g. 'white' or hex/rgb
  className?: string;
  size?: number;
}

function getThemedCartData(color: 'white' | 'primary' = 'white'): any {
  try {
    // White for primary dark-green button, or primary green
    const rgb = color === 'white' ? [1.0, 1.0, 1.0] : [0.0, 0.314, 0.224];
    const raw = JSON.stringify(cartAnimationData);
    const replaced = raw.split('[0.071,0.075,0.192').join(`[${rgb.join(',')}`);
    return JSON.parse(replaced);
  } catch {
    return cartAnimationData;
  }
}

export const AnimatedCartIcon: React.FC<AnimatedCartIconProps> = ({
  isPlaying = false,
  triggerPlay = 0,
  color = 'white',
  className = '',
  size = 24,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const prevIsPlayingRef = useRef(isPlaying);
  const prevTriggerRef = useRef(triggerPlay);

  // Initialize Lottie player
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
            animationData: getThemedCartData(color === 'white' ? 'white' : 'primary'),
          });

          anim.setSpeed(1.25);
          animInstanceRef.current = anim;
          setIsReady(true);

          if (isPlaying) {
            anim.goToAndPlay(0, true);
          }
        } catch (err) {
          console.warn('AnimatedCartIcon error:', err);
        }
      }
    }

    return () => {
      if (anim) {
        anim.destroy();
      }
      animInstanceRef.current = null;
    };
  }, [color]);

  // Play animation when isPlaying transitions to true or triggerPlay increments
  useEffect(() => {
    const becamePlaying = isPlaying && !prevIsPlayingRef.current;
    const triggerChanged = triggerPlay !== prevTriggerRef.current && triggerPlay > 0;
    prevIsPlayingRef.current = isPlaying;
    prevTriggerRef.current = triggerPlay;

    if ((becamePlaying || triggerChanged) && animInstanceRef.current) {
      try {
        animInstanceRef.current.goToAndPlay(0, true);
      } catch (err) {
        console.warn('Cart animation trigger error:', err);
      }
    }
  }, [isPlaying, triggerPlay]);

  // Hover animation on computer screen
  const handleMouseEnter = () => {
    if (animInstanceRef.current) {
      try {
        animInstanceRef.current.goToAndPlay(0, true);
      } catch (err) {
        console.warn('Cart hover notice:', err);
      }
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={`relative flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Lottie Animation Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center pointer-events-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {/* Static ShoppingCart Fallback while Lottie is initializing */}
      {!isReady && (
        <ShoppingCart
          className="w-full h-full absolute inset-0 shrink-0 stroke-[2.2]"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )}
    </div>
  );
};
