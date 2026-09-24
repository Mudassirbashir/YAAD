import React, { useState, useRef } from 'react';
import { ArrowLeft, User, LogIn } from 'lucide-react';
import { useSmartScroll } from '../../hooks/useSmartScroll';
import { APP_IMAGES } from '../../data/initialData';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../Avatar';

interface AppPublicHeaderProps {
  user?: any;
  onSignIn?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  onGoHome?: () => void;
}

export const AppPublicHeader: React.FC<AppPublicHeaderProps> = ({
  user: propUser,
  onSignIn,
  showBack = false,
  onBack,
  title = 'YAAD',
  onGoHome,
}) => {
  const isVisible = useSmartScroll(25);
  const { user: authUser, profile } = useAuth();
  const [isExpanding, setIsExpanding] = useState(false);
  const isNavigatingRef = useRef(false);

  // Active user: prop takes precedence if explicitly passed, otherwise use auth context
  const activeUser = propUser !== undefined ? propUser : authUser;

  const handleProfileClick = () => {
    if (activeUser) {
      if (onSignIn) {
        onSignIn();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/home';
      }
      return;
    }

    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    // Smooth, deliberate slide animation for the Sign In button
    setIsExpanding(true);

    // Give user time (750ms) to clearly see the elegant slide out animation
    setTimeout(() => {
      if (onSignIn) {
        onSignIn();
      }
      setIsExpanding(false);
      isNavigatingRef.current = false;
    }, 750);
  };

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const userAvatarUrl =
    profile?.avatar_url ||
    activeUser?.user_metadata?.avatar_url ||
    activeUser?.user_metadata?.picture ||
    activeUser?.photoURL ||
    null;

  const userDisplayName =
    profile?.full_name ||
    activeUser?.user_metadata?.full_name ||
    activeUser?.displayName ||
    activeUser?.email ||
    '';

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
            className="text-base sm:text-lg font-black tracking-tight text-[#005039] font-['Plus_Jakarta_Sans'] hover:opacity-85 transition-opacity cursor-pointer select-none"
          >
            {title}
          </button>
        </div>

        {/* Right: Smooth Sliding Interactive Sign In / Authenticated User Profile */}
        <div className="flex items-center gap-2 z-10">
          {activeUser ? (
            <button
              type="button"
              onClick={handleProfileClick}
              title={userDisplayName || 'Your Account Dashboard'}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-[#faf8f5] border border-[#005039]/25 text-[#005039] shadow-2xs active:scale-95 transition-all cursor-pointer group"
            >
              <Avatar
                name={userDisplayName}
                email={activeUser.email}
                avatarUrl={userAvatarUrl}
                size="sm"
                className="ring-1 ring-[#005039]/30"
              />
              <span className="hidden sm:inline text-xs font-bold text-[#1c2826] max-w-[120px] truncate">
                {userDisplayName.split(' ')[0] || 'Dashboard'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProfileClick}
              disabled={isExpanding}
              title="Sign in to your account"
              aria-label="Sign in"
              className={`group relative flex items-center shadow-2xs cursor-pointer active:scale-95 transition-all duration-500 ease-out overflow-hidden ${
                isExpanding
                  ? 'w-[108px] sm:w-[116px] px-3.5 py-2 rounded-full bg-[#005039] text-white border border-[#005039] shadow-md'
                  : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full justify-center bg-white border border-[#005039]/25 text-[#005039] hover:border-[#005039] hover:bg-[#005039]/5'
              }`}
            >
              <div
                className={`flex items-center justify-center shrink-0 transition-transform duration-500 ease-out ${
                  isExpanding ? 'scale-105 text-white' : 'text-[#005039]'
                }`}
              >
                {isExpanding ? (
                  <LogIn className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <User className="w-4 h-4 text-[#005039]" />
                )}
              </div>

              <span
                className={`whitespace-nowrap text-xs font-extrabold tracking-tight transition-all duration-500 ease-out ${
                  isExpanding
                    ? 'opacity-100 translate-x-0 ms-2 max-w-[80px]'
                    : 'opacity-0 -translate-x-2 ms-0 max-w-0 pointer-events-none'
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
