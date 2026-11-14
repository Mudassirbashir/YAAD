import React, { useEffect, useRef, useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { NavigationTab } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { triggerHaptic } from '../lib/sound';
import { AnimatedHomeIcon } from './common/AnimatedHomeIcon';
import { AnimatedHistoryIcon } from './common/AnimatedHistoryIcon';
import { useShouldAnimate } from '../lib/motionPreference';

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
  const canAnimate = useShouldAnimate();

  const [homeAnimationTrigger, setHomeAnimationTrigger] = useState(0);
  const [historyAnimationTrigger, setHistoryAnimationTrigger] = useState(0);

  const homeBtnRef = useRef<HTMLButtonElement>(null);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const listsBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut listener (1/H for Home, 2/C/+ for Create, 3/L for History)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        setHomeAnimationTrigger((c) => c + 1);
        onTabChange('home');
      } else if (e.key === '2' || e.key.toLowerCase() === 'c' || e.key === '+') {
        e.preventDefault();
        triggerHaptic(14);
        if (onCreateClick) {
          onCreateClick();
        } else {
          onTabChange('create');
        }
      } else if (e.key === '3' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        triggerHaptic(10);
        setHistoryAnimationTrigger((c) => c + 1);
        onTabChange('lists');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, onCreateClick]);

  // Arrow key navigation between navigation items
  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: 'home' | 'create' | 'lists'
  ) => {
    const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === nextKey) {
      e.preventDefault();
      if (current === 'home') createBtnRef.current?.focus();
      else if (current === 'create') listsBtnRef.current?.focus();
      else if (current === 'lists') homeBtnRef.current?.focus();
    } else if (e.key === prevKey) {
      e.preventDefault();
      if (current === 'home') listsBtnRef.current?.focus();
      else if (current === 'create') homeBtnRef.current?.focus();
      else if (current === 'lists') createBtnRef.current?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      homeBtnRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      listsBtnRef.current?.focus();
    }
  };

  const handleHomeClick = () => {
    triggerHaptic(10);
    setHomeAnimationTrigger((c) => c + 1);
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

  const handleListsClick = () => {
    triggerHaptic(10);
    setHistoryAnimationTrigger((c) => c + 1);
    onTabChange('lists');
  };

  const { config: remoteConfig } = useRemoteConfig();
  const showHome = remoteConfig.bottomNav?.showHomeTab !== false;
  const showCreate = remoteConfig.bottomNav?.showCreateTab !== false;
  const showHistory = remoteConfig.bottomNav?.showHistoryTab !== false;
  const showSettings = remoteConfig.bottomNav?.showSettingsTab === true;

  const isHomeActive = activeTab === 'home';
  const isCreateActive = activeTab === 'create';
  const isListsActive = activeTab === 'lists';
  const isSettingsActive = activeTab === 'settings';

  const handleSettingsClick = () => {
    triggerHaptic(10);
    onTabChange('settings');
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center items-end pointer-events-none sm:px-4"
      style={{ transform: 'translateZ(0)' }}
    >
      <nav
        id="bottom_navigation_bar"
        role="navigation"
        aria-label={t('nav.mainNavigation') || 'Main Navigation'}
        className="pointer-events-auto w-full sm:w-auto sm:min-w-[380px] sm:max-w-[440px] bg-surface-container-lowest/80 backdrop-blur-xl [backdrop-filter:blur(24px)] [-webkit-backdrop-filter:blur(24px)] border-t sm:border border-surface-dim/70 rounded-none sm:rounded-full px-5 sm:px-7 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] sm:py-2 sm:mb-3 shadow-[0_-2px_16px_rgba(0,0,0,0.04)] sm:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.12)] select-none transition-[background-color,border-color,box-shadow] duration-200"
      >
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="flex items-center justify-between sm:justify-around gap-2 w-full relative"
        >
          {/* 1. Left: Home Tab */}
          {showHome && (
            <button
              ref={homeBtnRef}
              id="nav_tab_home"
              role="tab"
              type="button"
              tabIndex={isHomeActive ? 0 : -1}
              onClick={handleHomeClick}
              onMouseEnter={() => setHomeAnimationTrigger((c) => c + 1)}
              onKeyDown={(e) => handleTabKeyDown(e, 'home')}
              aria-selected={isHomeActive}
              aria-label={t('nav.home') || 'Home'}
              className={`relative flex-1 sm:flex-initial min-w-[76px] sm:min-w-[88px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-center transition-[transform,background-color,box-shadow] duration-150 ease-out active:duration-75 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[50px] ${
                isHomeActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
              }`}
            >
              {isHomeActive && (
                canAnimate ? (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]"
                    transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75 }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]" />
                )
              )}
              <AnimatedHomeIcon
                isActive={isHomeActive}
                playTrigger={homeAnimationTrigger}
                size={22}
                className="transition-transform duration-150"
              />
              <span className="text-[0.6875rem] sm:text-xs font-body font-bold whitespace-nowrap leading-none">
                {t('nav.home') || 'Home'}
              </span>
            </button>
          )}

          {/* 2. Center: Prominent Elevated Floating Create Button */}
          {showCreate && (
            <div className="relative -top-4 sm:-top-5 flex flex-col items-center shrink-0 z-20">
              {canAnimate ? (
                <motion.button
                  ref={createBtnRef}
                  id="nav_tab_create"
                  role="tab"
                  type="button"
                  tabIndex={isCreateActive ? 0 : -1}
                  onClick={handleCreateClick}
                  onKeyDown={(e) => handleTabKeyDown(e, 'create')}
                  aria-selected={isCreateActive}
                  aria-label={t('nav.create') || 'Create New List'}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                  className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-[0_6px_22px_rgba(15,61,46,0.38)] hover:shadow-[0_8px_28px_rgba(15,61,46,0.48)] ring-4 ring-background dark:ring-stone-900 cursor-pointer group"
                >
                  {/* Eye-catching subtle ambient breathing halo behind button */}
                  <div className="absolute -inset-1 rounded-full bg-emerald-500/30 dark:bg-emerald-400/25 blur-md -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.6]" />
                  </motion.div>
                </motion.button>
              ) : (
                <button
                  ref={createBtnRef}
                  id="nav_tab_create"
                  role="tab"
                  type="button"
                  tabIndex={isCreateActive ? 0 : -1}
                  onClick={handleCreateClick}
                  onKeyDown={(e) => handleTabKeyDown(e, 'create')}
                  aria-selected={isCreateActive}
                  aria-label={t('nav.create') || 'Create New List'}
                  className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-[0_6px_22px_rgba(15,61,46,0.38)] ring-4 ring-background dark:ring-stone-900 cursor-pointer group active:scale-95 transition-transform duration-150"
                >
                  <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.6]" />
                </button>
              )}
              <span className="text-[0.625rem] sm:text-[0.6875rem] font-body font-bold text-on-surface mt-1">
                {t('nav.create') || 'Create'}
              </span>
            </div>
          )}

          {/* 3. Right: Lists / History Tab */}
          {showHistory && (
            <button
              ref={listsBtnRef}
              id="nav_tab_lists"
              role="tab"
              type="button"
              tabIndex={isListsActive ? 0 : -1}
              onClick={handleListsClick}
              onMouseEnter={() => setHistoryAnimationTrigger((c) => c + 1)}
              onKeyDown={(e) => handleTabKeyDown(e, 'lists')}
              aria-selected={isListsActive}
              aria-label={t('nav.history') || t('history.title') || 'History'}
              className={`relative flex-1 sm:flex-initial min-w-[76px] sm:min-w-[88px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-center transition-[transform,background-color,box-shadow] duration-150 ease-out active:duration-75 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[50px] ${
                isListsActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
              }`}
            >
              {isListsActive && (
                canAnimate ? (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]"
                    transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75 }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]" />
                )
              )}
              <AnimatedHistoryIcon
                isActive={isListsActive}
                playTrigger={historyAnimationTrigger}
                size={22}
                className="transition-transform duration-150"
              />
              <span className="text-[0.6875rem] sm:text-xs font-body font-bold whitespace-nowrap leading-none">
                {t('nav.history') || t('history.title') || 'History'}
              </span>
            </button>
          )}

          {/* 4. Optional Settings Tab if enabled in remoteConfig */}
          {showSettings && (
            <button
              id="nav_tab_settings"
              role="tab"
              type="button"
              tabIndex={isSettingsActive ? 0 : -1}
              onClick={handleSettingsClick}
              aria-selected={isSettingsActive}
              aria-label={t('settings.title') || 'Settings'}
              className={`relative flex-1 sm:flex-initial min-w-[76px] sm:min-w-[88px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-center transition-[transform,background-color,box-shadow] duration-150 ease-out active:duration-75 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer min-h-[50px] ${
                isSettingsActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant/80 hover:text-on-surface font-medium hover:bg-surface-container'
              }`}
            >
              {isSettingsActive && (
                canAnimate ? (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]"
                    transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75 }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/30 rounded-2xl -z-10 shadow-[0_2px_12px_rgba(15,61,46,0.08)]" />
                )
              )}
              <Settings className="w-5 h-5 transition-transform duration-150" />
              <span className="text-[0.6875rem] sm:text-xs font-body font-bold whitespace-nowrap leading-none">
                {t('settings.title') || 'Settings'}
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
