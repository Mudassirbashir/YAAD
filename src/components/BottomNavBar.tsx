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
    setSettingsRotated((prev) => !prev);
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
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-40 pointer-events-none pb-4 pt-1 px-4 max-w-md md:max-w-lg mx-auto"
    >
      {/* Translucent Frosted Glass Navigation Pill Container */}
      <div className="pointer-events-auto bg-surface-container-lowest/85 backdrop-blur-xl border border-surface-dim/80 shadow-[0px_8px_30px_rgba(0,30,21,0.08)] rounded-2xl p-1.5 flex items-center justify-between gap-1 transition-colors duration-200">
        
        {/* 1. Home Tab */}
        <button
          id="nav_tab_home"
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
          aria-label={t('nav.home')}
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          {/* Active translucent glass background pill */}
          {activeTab === 'home' && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute inset-0 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-xl"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 450, damping: 35 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: activeTab === 'home' ? 1.08 : 1,
                opacity: activeTab === 'home' ? 1 : 0.72,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Home
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeTab === 'home' ? 'stroke-[2.4] text-primary' : 'stroke-[1.8]'
                }`}
              />
            </motion.div>
            <span
              className={`text-[11px] mt-1 font-['Manrope'] tracking-tight transition-all duration-200 ${
                activeTab === 'home' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.home')}
            </span>
          </div>
        </button>

        {/* 2. Create Tab */}
        <button
          id="nav_tab_create"
          type="button"
          onClick={handleCreateClick}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            activeTab === 'create' ? 'text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
          aria-label={t('nav.create')}
        >
          {/* Active translucent glass background pill (if in create mode) */}
          {activeTab === 'create' && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute inset-0 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-xl"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 450, damping: 35 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform duration-200">
              <Plus className="w-4 h-4 text-white stroke-[2.6] transition-transform duration-200 group-hover:rotate-90" />
            </div>
            <span
              className={`text-[11px] mt-0.5 font-['Manrope'] tracking-tight transition-all duration-200 ${
                activeTab === 'create' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.create')}
            </span>
          </div>
        </button>

        {/* 3. Settings Tab */}
        <button
          id="nav_tab_settings"
          type="button"
          onClick={handleSettingsClick}
          className={`flex-1 relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            activeTab === 'settings' ? 'text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'
          }`}
          aria-label={t('nav.settings')}
          aria-current={activeTab === 'settings' ? 'page' : undefined}
        >
          {/* Active translucent glass background pill */}
          {activeTab === 'settings' && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute inset-0 bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-xl"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 450, damping: 35 }
              }
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: activeTab === 'settings' ? 1.08 : 1,
                opacity: activeTab === 'settings' ? 1 : 0.72,
                rotate: settingsRotated ? 60 : 0,
              }}
              transition={{
                duration: 0.25,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              <Settings
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeTab === 'settings' ? 'stroke-[2.4] text-primary' : 'stroke-[1.8]'
                }`}
              />
            </motion.div>
            <span
              className={`text-[11px] mt-1 font-['Manrope'] tracking-tight transition-all duration-200 ${
                activeTab === 'settings' ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'
              }`}
            >
              {t('nav.settings')}
            </span>
          </div>
        </button>

      </div>
    </nav>
  );
};
