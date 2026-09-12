import React, { useEffect, useRef } from 'react';
import { Home, Plus, Settings } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { NavigationTab } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../lib/sound';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onCreateClick?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onCreateClick,
}) => {
  const { t, isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const homeBtnRef = useRef<HTMLButtonElement>(null);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut listener (1 / H for Home, 2 / C / + for Create, 3 / S for Settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing into input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '1' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        triggerHaptic(10);
        onTabChange('home');
      } else if (e.key === '2' || e.key.toLowerCase() === 'c' || e.key === '+') {
        e.preventDefault();
        triggerHaptic(14);
        if (onCreateClick) {
          onCreateClick();
        } else {
          onTabChange('create');
        }
      } else if (e.key === '3' || e.key.toLowerCase() === 's' || e.key === ',') {
        e.preventDefault();
        triggerHaptic(10);
        onTabChange('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, onCreateClick]);

  // Arrow key navigation between navigation items
  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: 'home' | 'create' | 'settings'
  ) => {
    const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === nextKey) {
      e.preventDefault();
      if (current === 'home') createBtnRef.current?.focus();
      else if (current === 'create') settingsBtnRef.current?.focus();
      else if (current === 'settings') homeBtnRef.current?.focus();
    } else if (e.key === prevKey) {
      e.preventDefault();
      if (current === 'home') settingsBtnRef.current?.focus();
      else if (current === 'create') homeBtnRef.current?.focus();
      else if (current === 'settings') createBtnRef.current?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      homeBtnRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      settingsBtnRef.current?.focus();
    }
  };

  const handleHomeClick = () => {
    triggerHaptic(10);
    onTabChange('home');
  };

  const handleCreateClick = () => {
    triggerHaptic(14);
    if (onCreateClick) {
      onCreateClick();
    } else {
      onTabChange('create');
    }
  };

  const handleSettingsClick = () => {
    triggerHaptic(10);
    onTabChange('settings');
  };

  const isHomeActive = activeTab === 'home';
  const isCreateActive = activeTab === 'create';
  const isSettingsActive = activeTab === 'settings';

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center items-end pointer-events-none sm:px-4"
      style={{ transform: 'translateZ(0)' }}
    >
      <nav
        id="bottom_navigation_bar"
        role="navigation"
        aria-label={t('nav.mainNavigation') || 'Main Navigation'}
        className="pointer-events-auto w-full sm:w-auto sm:min-w-[440px] sm:max-w-[500px] lg:min-w-[540px] lg:max-w-[620px] bg-surface-container-lowest/95 backdrop-blur-xl border-t sm:border border-surface-dim/70 rounded-none sm:rounded-full lg:rounded-2xl px-3 sm:px-3 lg:px-4 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] sm:py-1.5 lg:py-2 sm:mb-2.5 lg:mb-4 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] sm:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.1)] select-none transition-all duration-200"
      >
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 lg:gap-3 w-full"
        >
          {/* Home Tab */}
          <button
            ref={homeBtnRef}
            id="nav_tab_home"
            role="tab"
            type="button"
            tabIndex={isHomeActive ? 0 : -1}
            onClick={handleHomeClick}
            onKeyDown={(e) => handleTabKeyDown(e, 'home')}
            aria-selected={isHomeActive}
            aria-label={t('nav.home')}
            className={`relative flex-1 sm:flex-initial sm:min-w-[120px] lg:min-w-[140px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl sm:rounded-full lg:rounded-xl text-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[48px] ${
              isHomeActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
            }`}
          >
            {isHomeActive && (
              <motion.div
                layoutId="nav-active-indicator"
                className="absolute inset-0 bg-primary/10 rounded-xl sm:rounded-full lg:rounded-xl -z-10"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 480, damping: 34 }
                }
              />
            )}
            <Home
              className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                isHomeActive ? 'stroke-[2.3] scale-105' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] sm:text-xs lg:text-[13px] font-['Manrope'] font-semibold tracking-tight whitespace-nowrap leading-tight">
              {t('nav.home')}
            </span>
          </button>

          {/* Create Tab */}
          <button
            ref={createBtnRef}
            id="nav_tab_create"
            role="tab"
            type="button"
            tabIndex={isCreateActive ? 0 : -1}
            onClick={handleCreateClick}
            onKeyDown={(e) => handleTabKeyDown(e, 'create')}
            aria-selected={isCreateActive}
            aria-label={t('nav.create')}
            className={`relative flex-1 sm:flex-initial sm:min-w-[120px] lg:min-w-[140px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl sm:rounded-full lg:rounded-xl text-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[48px] ${
              isCreateActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
            }`}
          >
            {isCreateActive && (
              <motion.div
                layoutId="nav-active-indicator"
                className="absolute inset-0 bg-primary/10 rounded-xl sm:rounded-full lg:rounded-xl -z-10"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 480, damping: 34 }
                }
              />
            )}
            <Plus
              className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                isCreateActive ? 'stroke-[2.5] scale-105' : 'stroke-[2]'
              }`}
            />
            <span className="text-[11px] sm:text-xs lg:text-[13px] font-['Manrope'] font-semibold tracking-tight whitespace-nowrap leading-tight">
              {t('nav.create')}
            </span>
          </button>

          {/* Settings Tab */}
          <button
            ref={settingsBtnRef}
            id="nav_tab_settings"
            role="tab"
            type="button"
            tabIndex={isSettingsActive ? 0 : -1}
            onClick={handleSettingsClick}
            onKeyDown={(e) => handleTabKeyDown(e, 'settings')}
            aria-selected={isSettingsActive}
            aria-label={t('nav.settings')}
            className={`relative flex-1 sm:flex-initial sm:min-w-[120px] lg:min-w-[140px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl sm:rounded-full lg:rounded-xl text-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[48px] ${
              isSettingsActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
            }`}
          >
            {isSettingsActive && (
              <motion.div
                layoutId="nav-active-indicator"
                className="absolute inset-0 bg-primary/10 rounded-xl sm:rounded-full lg:rounded-xl -z-10"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 480, damping: 34 }
                }
              />
            )}
            <Settings
              className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                isSettingsActive ? 'stroke-[2.3] scale-105' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[11px] sm:text-xs lg:text-[13px] font-['Manrope'] font-semibold tracking-tight whitespace-nowrap leading-tight">
              {t('nav.settings')}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
