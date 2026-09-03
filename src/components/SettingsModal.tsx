import React, { useState } from 'react';
import {
  Settings,
  X,
  Globe,
  MessageSquare,
  Languages,
  BookOpen,
  Trash2,
  ChevronRight,
  Database,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';
import { APP_IMAGES } from '../data/initialData';
import { AppLanguage } from '../types';
import { isSoundEnabled, setSoundEnabled, playCompletionSound } from '../lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetOnboarding: () => void;
  onClearAllData: () => void;
  onDeleteAccount?: () => Promise<void>;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetOnboarding,
  onClearAllData,
  onDeleteAccount,
  onOpenAuth,
}) => {
  const { user, profile, isConfigured, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [soundActive, setSoundActive] = useState<boolean>(() => isSoundEnabled());

  const handleToggleSound = () => {
    const nextVal = !soundActive;
    setSoundActive(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) {
      playCompletionSound();
    }
  };

  if (!isOpen) return null;

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || (user ? 'Account User' : t('guest'));
  const displayEmail = profile?.email || user?.email || t('notSignedIn');

  const languages: { id: AppLanguage; label: string; nativeName: string; icon: React.ReactNode }[] = [
    { id: 'en', label: 'English', nativeName: 'English (US)', icon: <Globe className="w-5 h-5" /> },
    { id: 'roman-urdu', label: 'Roman Urdu', nativeName: 'Roman Urdu', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'ur', label: 'اردو', nativeName: 'Urdu Script', icon: <Languages className="w-5 h-5" /> },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl border border-surface-dim space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-surface-dim/60 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-primary">
              {t('settings.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Language Selector Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-['Manrope'] text-xs font-bold text-outline uppercase tracking-wider">
              {t('settings.language')}
            </h3>
            <span className="text-[11px] font-semibold text-primary/70 bg-surface-container px-2.5 py-0.5 rounded-full">
              {language === 'en' ? 'English' : language === 'roman-urdu' ? 'Roman Urdu' : 'اردو'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  type="button"
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {lang.icon}
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold block">
                    {lang.label}
                  </span>
                  <span
                    className={`font-['Manrope'] text-[10px] block opacity-80 ${
                      isSelected ? 'text-on-primary/90' : 'text-outline'
                    }`}
                  >
                    {lang.nativeName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real User Account Card */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={displayName}
              email={user?.email}
              avatarUrl={profile?.avatar_url}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-sm truncate">
                {displayName}
              </h3>
              <p className="font-['Manrope'] text-xs text-on-surface-variant truncate">
                {displayEmail}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={async () => {
                await signOut();
              }}
              className="text-xs font-['Manrope'] font-bold text-error px-3 py-1.5 rounded-full hover:bg-error-container/30 transition-colors shrink-0"
            >
              {t('settings.signOut')}
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth('signin');
              }}
              className="text-xs font-['Manrope'] font-bold text-on-primary bg-primary px-3.5 py-1.5 rounded-full shadow-xs hover:bg-primary-container transition-colors shrink-0"
            >
              {t('settings.signIn')}
            </button>
          )}
        </div>

        {/* Backend / Persistence Status */}
        <div className="space-y-2">
          <h4 className="font-['Manrope'] text-xs font-bold text-outline uppercase tracking-wider">
            {t('settings.backendSection')}
          </h4>

          <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-surface-dim flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <div>
                <span className="font-['Manrope'] text-xs font-bold text-primary flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary/70" />
                  <span>{t('settings.supabaseCloud')}</span>
                </span>
                <span className="font-['Manrope'] text-[11px] text-on-surface-variant">
                  {isConfigured
                    ? t('settings.connectedStatus')
                    : t('settings.localFallbackStatus')}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-['Manrope'] font-semibold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
              {isConfigured ? 'Live' : 'Local'}
            </span>
          </div>
        </div>

        {/* App Info Banner - Transparent Logo */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 border border-surface-dim/50">
          <img
            src={APP_IMAGES.logoTransparent}
            alt="YAAD"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-sm">
              YAAD | یاد
            </h3>
            <p className="font-['Manrope'] text-xs text-on-surface-variant">
              {t('settings.appVersion')}
            </p>
          </div>
        </div>

        {/* Audio & Feedback Settings */}
        <div className="space-y-3">
          <h4 className="font-['Manrope'] text-xs font-bold text-outline uppercase tracking-wider">
            {t('settings.soundSection')}
          </h4>

          <div
            onClick={handleToggleSound}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleSound();
              }
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              {soundActive ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-outline" />
              )}
              <div>
                <span className="font-['Manrope'] text-sm font-semibold text-primary block">
                  {t('settings.soundEffects')}
                </span>
                <span className="font-['Manrope'] text-xs text-on-surface-variant">
                  {t('settings.soundEffectsDesc')}
                </span>
              </div>
            </div>

            {/* iOS-style toggle pill */}
            <div
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                soundActive ? 'bg-primary' : 'bg-surface-dim'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  soundActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="space-y-3">
          <h4 className="font-['Manrope'] text-xs font-bold text-outline uppercase tracking-wider">
            {t('settings.actionsSection')}
          </h4>

          <button
            onClick={() => {
              onResetOnboarding();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <span className="font-['Manrope'] text-sm font-semibold text-primary block">
                  {t('settings.replayOnboarding')}
                </span>
                <span className="font-['Manrope'] text-xs text-on-surface-variant">
                  {t('settings.replayOnboardingDesc')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-error" />
              <div>
                <span className="font-['Manrope'] text-sm font-semibold text-error block">
                  {t('settings.clearAllLists')}
                </span>
                <span className="font-['Manrope'] text-xs text-on-surface-variant">
                  {t('settings.clearAllListsDesc')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-error" />
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-sm hover:bg-primary-container transition-colors active:scale-[0.99]"
        >
          {t('settings.done')}
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-surface-dim space-y-4"
          >
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-lg">
              {t('settings.clearConfirmTitle')}
            </h3>
            <p className="font-['Manrope'] text-xs text-on-surface-variant">
              {t('settings.clearConfirmDesc')}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="h-10 rounded-full bg-surface-container text-primary font-['Manrope'] text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAllData();
                  onClose();
                }}
                className="h-10 rounded-full bg-error text-on-error font-['Manrope'] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

