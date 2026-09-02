import React from 'react';
import { Home, Plus, Settings } from 'lucide-react';
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 pointer-events-none pb-4 pt-1 px-4 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      {/* Apple-style floating frosted glass pill container */}
      <div className="pointer-events-auto bg-surface-container-lowest/85 backdrop-blur-xl border border-white/60 shadow-[0px_8px_32px_rgba(0,30,21,0.10)] rounded-3xl p-1.5 flex items-center justify-between transition-all duration-300">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 active:scale-95 group relative ${
            activeTab === 'home'
              ? 'bg-primary-container/15 text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50'
          }`}
          aria-label={t('nav.home')}
        >
          <div className="relative">
            <Home
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'home' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[11px] mt-1 font-['Manrope'] tracking-tight">
            {t('nav.home')}
          </span>
        </button>

        {/* 2. Center Create/Add Button (Elevated Apple-Style Glass Button) */}
        <button
          onClick={() => {
            if (onCreateClick) {
              onCreateClick();
            } else {
              onTabChange('create' as NavigationTab);
            }
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 px-2 group active:scale-90 transition-all duration-200 select-none relative"
          aria-label={t('nav.create')}
        >
          <div className="w-12 h-10 rounded-2xl bg-gradient-to-b from-primary to-primary-container text-on-primary flex items-center justify-center shadow-[0px_4px_16px_rgba(0,35,25,0.25)] border border-primary-fixed-dim/40 backdrop-blur-md group-hover:shadow-[0px_6px_20px_rgba(0,35,25,0.35)] group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
            {/* Subtle glass reflection highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />
            <Plus className="w-5 h-5 text-white stroke-[2.6] transition-transform duration-200 group-hover:rotate-90" />
          </div>
          <span className="text-[11px] mt-1 font-bold text-primary font-['Manrope'] tracking-tight">
            {t('nav.create')}
          </span>
        </button>

        {/* 3. Settings Tab */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 active:scale-95 group relative ${
            activeTab === 'settings'
              ? 'bg-primary-container/15 text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50'
          }`}
          aria-label={t('nav.settings')}
        >
          <div className="relative">
            <Settings
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'settings' ? 'scale-110 stroke-[2.4] rotate-45' : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
            {activeTab === 'settings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[11px] mt-1 font-['Manrope'] tracking-tight">
            {t('nav.settings')}
          </span>
        </button>

      </div>
    </nav>
  );
};
