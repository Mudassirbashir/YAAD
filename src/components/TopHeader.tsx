import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { APP_IMAGES } from '../data/initialData';
import { BidiText } from '../utils/bidi';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onAvatarClick?: () => void;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'YAAD',
  showBack = false,
  onBack,
  onSettingsClick,
  onAvatarClick,
  onMenuClick,
  rightAction,
}) => {
  const [isGearTapped, setIsGearTapped] = useState(false);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGearTapped(true);
    setTimeout(() => setIsGearTapped(false), 400);

    const handler = onSettingsClick || onMenuClick || onAvatarClick;
    if (handler) {
      handler();
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40 transition-colors select-none">
      <div className="relative flex justify-between items-center px-4 sm:px-6 md:px-8 h-14 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
        {/* Left Action / Brand Anchor */}
        <div className="flex items-center z-10 min-w-[40px]">
          {showBack ? (
            <button
              id="top_header_back_btn"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ms-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          ) : (
            <div id="top_header_logo_area" className="flex items-center">
              {/* Preserved Full Transparent YAAD Logo (no circular crop, no artificial background, exact aspect ratio) */}
              <img
                id="top_header_logo"
                src={APP_IMAGES.logoTransparent || '/logo.png'}
                alt="YAAD Logo"
                draggable={false}
                className="h-8 sm:h-9 w-auto max-w-none object-contain select-none transition-transform duration-200 hover:scale-105 active:scale-95"
              />
            </div>
          )}
        </div>

        {/* Center Title - Visually Centered */}
        <div id="top_header_title" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4 max-w-[62%] sm:max-w-[70%]">
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
              <BidiText>{title}</BidiText>
            )}
          </h1>
        </div>

        {/* Right Action: Recognizable Standard Settings Gear Icon with subtle rotation */}
        <div className="flex items-center justify-end min-w-[40px] z-10">
          {rightAction ? (
            rightAction
          ) : (onSettingsClick || onMenuClick || onAvatarClick) ? (
            <button
              id="top_header_settings_btn"
              data-testid="top_header_settings_btn"
              type="button"
              onClick={handleSettingsClick}
              aria-label="Settings"
              title="Settings"
              className="w-10 h-10 -me-2 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low active:bg-surface-container active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer group"
            >
              <Settings
                className={`w-5 h-5 text-primary stroke-[2] transition-transform duration-300 ease-out group-hover:rotate-45 motion-reduce:transform-none ${
                  isGearTapped ? 'rotate-90' : 'rotate-0'
                }`}
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
