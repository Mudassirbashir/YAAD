import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { APP_IMAGES } from '../data/initialData';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onAvatarClick?: () => void;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'YAAD',
  showBack = false,
  onBack,
  onAvatarClick,
  onMenuClick,
  rightAction,
}) => {
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || (user ? 'User' : undefined);

  return (
    <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40 transition-colors">
      <div className="relative flex justify-between items-center px-4 sm:px-6 md:px-8 h-14 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
        {/* Left Action / Brand Anchor */}
        <div className="flex items-center z-10">
          {showBack ? (
            <button
              id="top_header_back_btn"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          ) : (
            <div className="flex items-center">
              {/* Preserved Full Transparent YAAD Logo (no circular crop, no artificial background) */}
              <img
                src={APP_IMAGES.logoTransparent}
                alt="YAAD Logo"
                className="h-8 sm:h-9 w-auto object-contain select-none transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Center Title - Visually Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-8 max-w-[70%]">
          <h1 className="text-lg sm:text-xl font-extrabold font-['Plus_Jakarta_Sans'] text-primary tracking-tight truncate flex items-center justify-center">
            {title === 'YAAD' || title === 'یاد' ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="font-extrabold text-primary tracking-tight">YAAD</span>
                <span className="text-primary/30 font-light text-xs">|</span>
                <span className="font-urdu-brand text-2xl sm:text-[26px] leading-none font-bold text-primary pt-1 pb-0.5 tracking-normal">
                  یاد
                </span>
              </span>
            ) : (
              title
            )}
          </h1>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-1.5 z-10">
          {rightAction ? (
            rightAction
          ) : onMenuClick ? (
            <button
              id="top_header_settings_btn"
              onClick={onMenuClick}
              aria-label="Open Settings"
              className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low active:scale-95 transition-all group"
            >
              <Settings className="w-5 h-5 text-primary stroke-[2] transition-transform duration-250 group-hover:rotate-45" />
            </button>
          ) : onAvatarClick ? (
            <button
              id="top_header_avatar_btn"
              onClick={onAvatarClick}
              aria-label="User Profile"
              className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full active:scale-95 transition-transform -mr-1"
            >
              <Avatar
                name={displayName}
                email={user?.email}
                avatarUrl={profile?.avatar_url}
                size="md"
                alt="User profile"
              />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
    </header>
  );
};
