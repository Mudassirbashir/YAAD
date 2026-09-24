import React, { useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useSmartScroll } from '../../hooks/useSmartScroll';
import { APP_IMAGES } from '../../data/initialData';

interface AppPublicHeaderProps {
  user?: any;
  onSignIn?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  onGoHome?: () => void;
}

export const AppPublicHeader: React.FC<AppPublicHeaderProps> = ({
  user,
  onSignIn,
  showBack = false,
  onBack,
  title = 'YAAD',
  onGoHome,
}) => {
  const isVisible = useSmartScroll(25);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      if (onSignIn) onSignIn();
      return;
    }
    // Smoothly expand the pill to reveal "Sign In" text before navigating
    setIsExpanding(true);
    setTimeout(() => {
      if (onSignIn) onSignIn();
      setIsExpanding(false);
    }, 280);
  };

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <header
      id="app_public_header"
      className={`fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e5e1d8] transition-transform duration-300 ease-in-out select-none ${
        isVisible ? 'translate-y-0 shadow-2xs' : '-translate-y-full'
      }`}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Back Button and Official YAAD Logo */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#e5e1d8] bg-white hover:bg-[#f0ebe1] flex items-center justify-center text-[#1c2826] transition-colors shadow-2xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#1c2826]" />
            </button>
          )}

          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 p-1 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer group"
            title="Go to YAAD Home"
          >
            {/* High-contrast container for the official logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-xs p-1">
              <img
                src={APP_IMAGES.logoTransparent || '/logo.png'}
                alt="YAAD Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        </div>

        {/* Center: Brand Name strictly centered to the entire viewport */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto text-center">
          <button
            type="button"
            onClick={handleLogoClick}
            className="text-base sm:text-lg font-black tracking-tight text-[#005039] font-['Plus_Jakarta_Sans'] hover:opacity-85 transition-opacity cursor-pointer"
          >
            {title}
          </button>
        </div>

        {/* Right: Sliding Interactive Sign In / Profile Avatar */}
        <div className="flex items-center gap-2 z-10">
          {user ? (
            <button
              type="button"
              onClick={handleProfileClick}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#005039] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#003d2b] transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden xs:inline">Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProfileClick}
              title="Sign In to your account"
              className={`group flex items-center bg-white border border-[#005039]/25 hover:border-[#005039] text-[#005039] shadow-2xs transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                isExpanding
                  ? 'px-3.5 py-1.5 rounded-full bg-[#005039]/10'
                  : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full justify-center hover:bg-[#005039]/10'
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#005039]" />
              </div>
              <span
                className={`overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 ease-out ${
                  isExpanding
                    ? 'max-w-[70px] opacity-100 ms-1.5'
                    : 'max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ms-1.5'
                }`}
              >
                Sign In
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
