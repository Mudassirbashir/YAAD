import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSmartScroll } from '../../hooks/useSmartScroll';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShouldAnimate } from '../../lib/motionPreference';
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
  const { t, dir } = useLanguage();
  const canAnimate = useShouldAnimate();

  // Active user: prop takes precedence if explicitly passed, otherwise use auth context
  const activeUser = propUser !== undefined ? propUser : authUser;

  const handleCtaClick = () => {
    if (onSignIn) {
      onSignIn();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = activeUser ? '/home' : '/auth';
    }
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

  const tryFreeLabel = t('landing.tryFree') || 'Try YAAD Free';

  return (
    <header
      id="app_public_header"
      dir={dir}
      className={`fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/80 dark:bg-background/80 backdrop-blur-xl border-b border-[#e5e1d8] dark:border-outline-variant/40 select-none ${
        canAnimate ? 'transition-transform duration-200 ease-out' : ''
      } ${isVisible ? 'translate-y-0 shadow-2xs' : '-translate-y-full'}`}
    >
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3">
        {/* Leading: Back Button (optional) + Official YAAD Logo */}
        <div className="flex items-center justify-start gap-1.5 sm:gap-3 shrink-0 min-w-[44px]">
          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('back') || 'Back'}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[#e5e1d8] dark:border-outline-variant bg-white dark:bg-surface-container hover:bg-[#f0ebe1] flex items-center justify-center text-[#1c2826] dark:text-on-surface shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}

          <button
            type="button"
            onClick={handleLogoClick}
            aria-label={t('landing.goHome') || 'Go to YAAD Home'}
            title={t('landing.goHome') || 'Go to YAAD Home'}
            className={`flex items-center p-1 rounded-xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              canAnimate ? 'transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-95' : ''
            }`}
          >
            {/* High-contrast container for the official logo */}
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-xs p-1">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/logo-128.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="YAAD Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
          </button>
        </div>

        {/* Center: Brand Wordmark centered cleanly without overlap */}
        <div className="flex items-center justify-center text-center min-w-0">
          <button
            type="button"
            onClick={handleLogoClick}
            dir="ltr"
            className="min-h-[44px] px-1.5 sm:px-2 text-base sm:text-lg font-black tracking-tight text-[#005039] dark:text-primary font-display hover:opacity-85 cursor-pointer select-none inline-flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {title}
          </button>
        </div>

        {/* Trailing: Logged-out "Try YAAD Free" CTA or Authenticated User Profile */}
        <div className="flex items-center justify-end gap-2 shrink-0 min-w-[44px]">
          {activeUser ? (
            <button
              type="button"
              onClick={handleCtaClick}
              title={userDisplayName || t('landing.accountDashboard') || 'Your Account Dashboard'}
              className={`inline-flex items-center gap-2 min-h-[44px] px-2.5 py-1.5 sm:px-3 rounded-full bg-white dark:bg-surface-container hover:bg-[#faf8f5] border border-[#005039]/25 dark:border-primary/40 text-[#005039] dark:text-primary shadow-2xs cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
              }`}
            >
              <Avatar
                name={userDisplayName}
                email={activeUser.email}
                avatarUrl={userAvatarUrl}
                size="sm"
                className="ring-1 ring-[#005039]/30"
              />
              <span className="hidden sm:inline text-xs font-bold text-[#1c2826] dark:text-on-surface max-w-[120px] truncate">
                {userDisplayName.split(' ')[0] || 'Dashboard'}
              </span>
            </button>
          ) : (
            <button
              id="public_header_try_free_btn"
              type="button"
              onClick={handleCtaClick}
              className={`inline-flex items-center justify-center min-h-[44px] h-11 px-3 sm:px-5 rounded-full bg-[#005039] hover:bg-[#003d2b] text-white font-display font-bold text-[11px] sm:text-[13px] tracking-tight whitespace-nowrap shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005039] focus-visible:ring-offset-2 ${
                canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
              }`}
            >
              {tryFreeLabel}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

