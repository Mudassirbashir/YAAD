import React, { useState } from 'react';
import { Home, Plus, Settings } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { NavigationTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [settingsRotated, setSettingsRotated] = useState(false);

  const handleSettingsClick = () => {
    setSettingsRotated(true);
    setTimeout(() => setSettingsRotated(false), 400);
    onTabChange('settings');
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      onTabChange('create');
    }
  };

  return (
    <nav
      id="bottom_navigation_bar"
      role="tablist"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-40 pointer-events-none pb-4 pt-1 px-4 max-w-sm sm:max-w-md md:max-w-lg mx-auto select-none"
    >
      {/* YAAD Original Soft-Glass Capsule Container */}
      <div className="pointer-events-auto bg-surface-container-lowest/85 dark:bg-surface-container-lowest/90 backdrop-blur-xl border border-primary/10 shadow-[0px_8px_32px_rgba(0,35,24,0.08)] rounded-2xl p-1.5 flex items-center justify-between gap-1 transition-colors duration-200">
        
        {/* 1. Home Tab */}
        <button
          id="nav_tab_home"
          role="tab"
          type="button"
          onClick={() => onTabChange('home')}
          aria-selected={activeTab === 'home'}
          aria-label={t('nav.home')}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-150 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
            activeTab === 'home'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
        >
          {/* YAAD Signature Soft Glass Pill Active Indicator */}
          {activeTab === 'home' && (
            <motion.div
              layoutId="yaadActiveNavPill"
              className="absolute inset-0 bg-primary/[0.08] dark:bg-primary/[0.18] border border-primary/20 dark:border-primary/30 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_8px_rgba(0,40,25,0.05)] backdrop-blur-xs pointer-events-none"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 32 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <motion.div
              animate={{
                scale: activeTab === 'home' ? 1.05 : 1,
                opacity: activeTab === 'home' ? 1 : 0.75,
              }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Home
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeTab === 'home' ? 'stroke-[2.3] text-primary' : 'stroke-[1.8]'
                }`}
              />
            </motion.div>
            <span
              className={`text-[11px] font-['Manrope'] tracking-tight transition-colors duration-200 flex items-center gap-1 ${
                activeTab === 'home' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.home')}
              {activeTab === 'home' && (
                <span className="w-1 h-1 rounded-full bg-primary inline-block" />
              )}
            </span>
          </div>
        </button>

        {/* 2. Create Tab */}
        <button
          id="nav_tab_create"
          role="tab"
          type="button"
          onClick={handleCreateClick}
          aria-selected={activeTab === 'create'}
          aria-label={t('nav.create')}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-150 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
            activeTab === 'create'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
        >
          {/* YAAD Signature Soft Glass Pill Active Indicator (if in create mode) */}
          {activeTab === 'create' && (
            <motion.div
              layoutId="yaadActiveNavPill"
              className="absolute inset-0 bg-primary/[0.08] dark:bg-primary/[0.18] border border-primary/20 dark:border-primary/30 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_8px_rgba(0,40,25,0.05)] backdrop-blur-xs pointer-events-none"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 32 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-[0_3px_10px_rgba(0,55,40,0.22)] group-hover:scale-105 active:scale-95 transition-all duration-150">
              <Plus className="w-4 h-4 text-white stroke-[2.6] transition-transform duration-200 group-hover:rotate-90 group-active:rotate-90 motion-reduce:transform-none" />
            </div>
            <span
              className={`text-[11px] font-['Manrope'] tracking-tight transition-colors duration-200 flex items-center gap-1 ${
                activeTab === 'create' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.create')}
              {activeTab === 'create' && (
                <span className="w-1 h-1 rounded-full bg-primary inline-block" />
              )}
            </span>
          </div>
        </button>

        {/* 3. Settings Tab */}
        <button
          id="nav_tab_settings"
          role="tab"
          type="button"
          onClick={handleSettingsClick}
          aria-selected={activeTab === 'settings'}
          aria-label={t('nav.settings')}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-150 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
            activeTab === 'settings'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
        >
          {/* YAAD Signature Soft Glass Pill Active Indicator */}
          {activeTab === 'settings' && (
            <motion.div
              layoutId="yaadActiveNavPill"
              className="absolute inset-0 bg-primary/[0.08] dark:bg-primary/[0.18] border border-primary/20 dark:border-primary/30 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_2px_8px_rgba(0,40,25,0.05)] backdrop-blur-xs pointer-events-none"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 32 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <motion.div
              animate={{
                scale: activeTab === 'settings' ? 1.05 : 1,
                opacity: activeTab === 'settings' ? 1 : 0.75,
                rotate: settingsRotated ? 60 : 0,
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              <Settings
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeTab === 'settings' ? 'stroke-[2.3] text-primary' : 'stroke-[1.8]'
                }`}
              />
            </motion.div>
            <span
              className={`text-[11px] font-['Manrope'] tracking-tight transition-colors duration-200 flex items-center gap-1 ${
                activeTab === 'settings' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.settings')}
              {activeTab === 'settings' && (
                <span className="w-1 h-1 rounded-full bg-primary inline-block" />
              )}
            </span>
          </div>
        </button>

      </div>
    </nav>
  );
};
