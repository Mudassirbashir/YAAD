import React, { useEffect } from 'react';
import { APP_IMAGES } from '../data/initialData';

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="bg-background h-screen w-full flex flex-col items-center justify-center cursor-pointer select-none px-6 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 w-72 h-72 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Logo Container */}
      <div className="flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center filter drop-shadow-[0px_12px_28px_rgba(0,53,39,0.18)] hover:scale-105 transition-transform duration-300">
          <img
            src={APP_IMAGES.logo3d}
            alt="YAAD Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Text Anchor */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-primary tracking-widest text-center">
            YAAD | یاد
          </h1>
          <p className="text-on-surface-variant font-['Manrope'] text-sm font-medium tracking-wide">
            Shopping Memory
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 text-xs text-outline font-['Manrope']">
        Tap anywhere to continue
      </div>
    </div>
  );
};
