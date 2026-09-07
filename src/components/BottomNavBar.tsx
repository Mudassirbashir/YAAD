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
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center items-end pointer-events-none sm:pb-[max(env(safe-area-inset-bottom,0px),0.625rem)] sm:px-4"
      style={{ transform: 'translateZ(0)' }}
    >
      <nav
        id="bottom_navigation_bar"
        role="navigation"
        aria-label={t('nav.mainNavigation') || 'Main Navigation'}
        className="pointer-events-auto w-full sm:max-w-[400px] md:max-w-[440px] bg-surface-container-lowest/95 sm:bg-surface-container-lowest/90 dark:bg-stone-900/95 sm:dark:bg-stone-900/90 backdrop-blur-xl sm:backdrop-blur-2xl border-t sm:border border-surface-dim/60 sm:border-surface-dim/70 dark:border-white/10 rounded-none sm:rounded-full px-2 sm:px-1.5 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.375rem)] sm:pb-1.5 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] sm:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] sm:ring-1 sm:ring-black/[0.04] dark:sm:ring-white/[0.06] select-none transition-all duration-200"
      >
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="flex items-center justify-between gap-1 w-full"
        >
          {/* 1. HOME TAB */}
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
            className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 sm:py-2 px-1 sm:px-3.5 rounded-xl sm:rounded-full text-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 cursor-pointer min-h-[44px] sm:min-h-0 ${
              isHomeActive
                ? 'text-primary dark:text-emerald-400 font-bold'
                : 'text-on-surface-variant/70 hover:text-on-surface font-medium hover:bg-surface-container-high/40'
            }`}
          >
            {isHomeActive && (
              <motion.div
                layoutId="nav-active-indicator"
                className="absolute inset-0 bg-primary/[0.08] dark:bg-emerald-500/15 rounded-xl sm:rounded-full -z-10"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 480, damping: 34 }
                }
              />
            )}
            <Home
              className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                isHomeActive
                  ? 'stroke-[2.2] scale-105'
                  : 'stroke-[2] opacity-80 group-hover:opacity-100'
              }`}
            />
            <span className="text-[10px] sm:text-xs font-['Manrope'] tracking-tight whitespace-nowrap leading-tight">
              {t('nav.home')}
            </span>
          </button>

          {/* 2. CREATE BUTTON (PRIMARY ACTION) */}
          <div className="flex-1 flex items-center justify-center px-0.5 sm:px-1">
            <button
              ref={createBtnRef}
              id="nav_tab_create"
              type="button"
              tabIndex={0}
              onClick={handleCreateClick}
              onKeyDown={(e) => handleTabKeyDown(e, 'create')}
              aria-label={t('nav.create')}
              className="w-full max-w-[110px] sm:max-w-[145px] flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 sm:py-2 px-1 sm:px-4 rounded-xl sm:rounded-full bg-transparent sm:bg-primary text-primary sm:text-on-primary hover:bg-surface-container-high/40 sm:hover:bg-[#14523e] active:bg-surface-container-high/60 sm:active:bg-[#0a281e] dark:sm:bg-emerald-600 dark:sm:hover:bg-emerald-500 dark:sm:active:bg-emerald-700 sm:shadow-[0_2px_8px_rgba(15,61,46,0.25)] sm:hover:shadow-[0_4px_14px_rgba(15,61,46,0.35)] transition-all duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 cursor-pointer min-h-[44px] sm:min-h-0 group"
            >
              {/* Mobile-only compact icon circle (Apple-style, lightweight, not oversized) */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 sm:hidden ${
                  isCreateActive
                    ? 'bg-primary text-on-primary dark:bg-emerald-500 ring-2 ring-primary/20 scale-105'
                    : 'bg-primary text-on-primary dark:bg-emerald-600 shadow-2xs group-hover:scale-110'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
              </div>

              {/* Desktop-only direct Lucide Plus icon */}
              <Plus className="hidden sm:inline-block w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.4] shrink-0 transition-transform duration-150 group-hover:scale-110" />

              <span className="text-[10px] sm:text-xs font-bold font-['Manrope'] tracking-tight text-primary dark:text-emerald-400 sm:text-on-primary whitespace-nowrap leading-tight">
                {t('nav.create')}
              </span>
            </button>
          </div>

          {/* 3. SETTINGS TAB */}
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
            className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 sm:py-2 px-1 sm:px-3.5 rounded-xl sm:rounded-full text-center transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900 cursor-pointer min-h-[44px] sm:min-h-0 ${
              isSettingsActive
                ? 'text-primary dark:text-emerald-400 font-bold'
                : 'text-on-surface-variant/70 hover:text-on-surface font-medium hover:bg-surface-container-high/40'
            }`}
          >
            {isSettingsActive && (
              <motion.div
                layoutId="nav-active-indicator"
                className="absolute inset-0 bg-primary/[0.08] dark:bg-emerald-500/15 rounded-xl sm:rounded-full -z-10"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 480, damping: 34 }
                }
              />
            )}
            <Settings
              className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                isSettingsActive
                  ? 'stroke-[2.2] scale-105'
                  : 'stroke-[2] opacity-80 group-hover:opacity-100'
              }`}
            />
            <span className="text-[10px] sm:text-xs font-['Manrope'] tracking-tight whitespace-nowrap leading-tight">
              {t('nav.settings')}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
