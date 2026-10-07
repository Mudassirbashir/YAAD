import React, { useState, useEffect } from 'react';
import {
  User,
  Smartphone,
  Pencil,
  Palette,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Globe2,
  LockKeyhole,
  LogOut,
  Sparkles,
  Headphones,
  ShieldCheck,
  ScrollText,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme, AppThemeId } from '../context/ThemeContext';
import { Language } from '../translations';
import { APP_VERSION } from '../version';
import { TopHeader } from './TopHeader';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { AvatarPickerModal } from './AvatarPickerModal';
import { EditProfileModal } from './settings/EditProfileModal';
import { ChangePasswordModal } from './settings/ChangePasswordModal';
import { SignOutConfirmModal } from './settings/SignOutConfirmModal';
import { LegalDocModal } from './settings/LegalDocModal';
import { formatPhoneNumber } from '../utils/phone';
import { triggerHaptic } from '../lib/sound';

interface SettingsViewProps {
  onBack: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onReplayOnboarding?: () => void;
  onOpenLegalPage?: (
    page: 'terms' | 'privacy' | 'about' | 'help' | 'legal',
  ) => void;
  initialEditPhone?: boolean;
  onClearInitialEditPhone?: () => void;
  subSection?: string | null;
  onSubSectionChange?: (
    section: 'profile' | 'appearance' | 'preferences' | 'about' | 'security' | 'language',
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onDeleteAccount,
  onOpenAuth,
  onOpenLegalPage,
  initialEditPhone = false,
  onClearInitialEditPhone,
  subSection = null,
  onSubSectionChange,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, profile, updateUserProfile, changePassword } = useAuth();
  const { theme, setTheme, themes } = useAppTheme();

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // Modals state - ALWAYS default to false so regular settings opens cleanly
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [focusPhoneInModal, setFocusPhoneInModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<
    'privacy' | 'terms' | 'help' | 'about' | null
  >(null);

  // Deep Link & subSection scrolling
  useEffect(() => {
    if (subSection) {
      const targetId = `settings_${subSection}_section`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [subSection]);

  // Sound preference state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yaad_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const playPreviewChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  };

  const handleToggleSound = () => {
    triggerHaptic(8);
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('yaad_sound_enabled', String(nextVal));
    } catch {}
    if (nextVal) {
      playPreviewChime();
    }
  };

  // Push notifications state
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yaad_push_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const handleTogglePush = async () => {
    triggerHaptic(8);
    if (!pushEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          if (res === 'granted') {
            setPushEnabled(true);
            localStorage.setItem('yaad_push_enabled', 'true');
            return;
          }
        } catch {}
      }
      setPushEnabled(true);
      localStorage.setItem('yaad_push_enabled', 'true');
    } else {
      setPushEnabled(false);
      localStorage.setItem('yaad_push_enabled', 'false');
    }
  };

  // Language selection handler
  const handleSelectLanguage = async (newLang: Language) => {
    triggerHaptic(10);
    setLanguage(newLang);
    if (user) {
      await updateUserProfile({ language: newLang });
    }
  };

  // Profile save handler
  const handleSaveProfile = async (fullName: string, phoneNumber: string | null) => {
    const res = await updateUserProfile({
      full_name: fullName,
      phone_number: phoneNumber,
    });
    return res;
  };

  // Avatar select handler
  const handleSelectAvatar = async (avatarValue: string | null) => {
    await updateUserProfile({ avatar_url: avatarValue });
  };

  // Sign out confirmation handler
  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  // Legal item click
  const handleOpenLegal = (page: 'about' | 'help' | 'privacy' | 'terms') => {
    if (onOpenLegalPage) {
      onOpenLegalPage(page);
    } else {
      setActiveLegalModal(page);
    }
  };

  // Computed display names
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user ? 'User' : t('settings.guestUser') || (language === 'ur' ? 'مہمان صارف' : 'Guest User'));

  const displayPhone =
    profile?.phone_number ||
    user?.user_metadata?.phone_number ||
    user?.user_metadata?.phone ||
    user?.phone ||
    null;

  const displayEmail = user?.email || null;
  const isVerified = Boolean(profile?.is_verified || (user?.user_metadata as any)?.is_verified);

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-on-surface flex flex-col font-sans pb-28 sm:pb-32"
    >
      {/* 1. Standard Top Navigation Header */}
      <TopHeader
        title={t('settings.title') || (language === 'ur' ? 'ترتیبات' : 'Settings')}
        showBack={true}
        onBack={onBack}
      />

      {/* 2. Main Page Container */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6">
        {/* Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            {t('settings.title') || (language === 'ur' ? 'ترتیبات' : 'Settings')}
          </h1>
          <p className="text-xs sm:text-sm text-outline font-['Manrope']">
            {t('settings.subtitle') ||
              (language === 'ur'
                ? 'اکاؤنٹ، ترجیحات اور ایپ کی ترتیبات'
                : 'Manage your profile, preferences, and app options')}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: PROFILE & ACCOUNT                                       */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_profile_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.accountTitle') || (language === 'ur' ? 'اکاؤنٹ' : 'Account')}
          </h2>

          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-surface-dim/75 shadow-2xs">
            {user ? (
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Avatar with Camera Trigger */}
                <div className="relative shrink-0">
                  <Avatar
                    name={displayName}
                    email={user.email}
                    avatarUrl={profile?.avatar_url}
                    size="lg"
                    className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-primary/20"
                  />
                  <button
                    id="change_avatar_btn"
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    aria-label={t('settings.chooseAvatar') || 'Choose Avatar'}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-white hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>

                {/* Profile Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate">
                      {displayName}
                    </h3>
                    {isVerified && <VerifiedBadge size="sm" />}
                  </div>

                  <p className="text-xs text-outline font-['Manrope'] truncate mt-0.5">
                    {displayPhone ? (
                      <span dir="ltr" className="font-mono text-on-surface-variant font-medium">
                        {formatPhoneNumber(displayPhone)}
                      </span>
                    ) : (
                      displayEmail || t('settings.noPhone') || 'No phone added'
                    )}
                  </p>

                  {displayPhone && displayEmail && (
                    <p className="text-[11px] text-outline/80 font-['Manrope'] truncate">
                      {displayEmail}
                    </p>
                  )}
                </div>

                {/* Edit Profile Button */}
                <button
                  id="edit_profile_btn"
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setFocusPhoneInModal(false);
                    setShowEditProfileModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold font-['Plus_Jakarta_Sans'] text-primary bg-surface-container-low hover:bg-surface-container border border-surface-dim/75 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{t('settings.editName') || (language === 'ur' ? 'ترمیم' : 'Edit')}</span>
                </button>
              </div>
            ) : (
              /* Guest State Card */
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                      {t('settings.guestUser') || (language === 'ur' ? 'مہمان صارف' : 'Guest Account')}
                    </h3>
                    <p className="text-xs text-outline font-['Manrope'] truncate">
                      {language === 'ur'
                        ? 'پرچیاں کلاؤڈ پر محفوظ کرنے کے لیے لاگ ان کریں'
                        : 'Sign in to sync your lists across devices'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth?.('signin')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {t('auth.signIn') || (language === 'ur' ? 'سائن ان' : 'Sign In')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: PREFERENCES (Language, Sound, Reminders)                */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_preferences_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.preferencesTitle') || (language === 'ur' ? 'ترجیحات' : 'Preferences')}
          </h2>

          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-dim/75 shadow-2xs divide-y divide-surface-dim/50 overflow-hidden">
            {/* 1. Language Selector Row */}
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Globe2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.language') || (language === 'ur' ? 'زبان' : 'Language')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope']">
                    {t('settings.languageSubtitle') ||
                      (language === 'ur'
                        ? 'اپنی پسندیدہ ڈسپلے زبان منتخب کریں'
                        : 'Choose your display language')}
                  </p>
                </div>
              </div>

              {/* 3-way Segmented Control */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-low rounded-xl">
                {/* English */}
                <button
                  id="lang_select_en"
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    language === 'en'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs ring-1 ring-black/5'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span>{t('settings.languageEn') || 'English'}</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>

                {/* Roman Urdu */}
                <button
                  id="lang_select_roman_urdu"
                  type="button"
                  onClick={() => handleSelectLanguage('roman-urdu')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold font-['Plus_Jakarta_Sans'] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    language === 'roman-urdu'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs ring-1 ring-black/5'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span>{t('settings.languageRomanUrdu') || 'Roman Urdu'}</span>
                  {language === 'roman-urdu' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>

                {/* Urdu */}
                <button
                  id="lang_select_ur"
                  type="button"
                  onClick={() => handleSelectLanguage('ur')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold font-urdu transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    language === 'ur'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs ring-1 ring-black/5'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span>{t('settings.languageUrdu') || 'اردو'}</span>
                  {language === 'ur' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              </div>
            </div>

            {/* 2. Sound Effects Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <VolumeX className="w-4 h-4 stroke-[2]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.soundEffects') || (language === 'ur' ? 'صوتی اثرات' : 'Sound Effects')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {t('settings.soundEffectsDesc') ||
                      (language === 'ur'
                        ? 'خریداری کے دوران تسلی بخش آوازیں سنیں'
                        : 'Audio feedback when checking items')}
                  </p>
                </div>
              </div>

              {/* Sound Toggle Switch */}
              <button
                id="toggle_sound_btn"
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={handleToggleSound}
                aria-label="Toggle Sound Effects"
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                  soundEnabled ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                    soundEnabled ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Shopping Reminders Toggle */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  {pushEnabled ? (
                    <BellRing className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <Bell className="w-4 h-4 stroke-[2]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {language === 'ur' ? 'یاد دہانیاں اور منڈی الرٹس' : 'Shopping Reminders'}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur'
                      ? 'جمعہ بازار اور ہفتہ وار منڈی کی یاد دہانی'
                      : 'Weekly Mandi & grocery reminders'}
                  </p>
                </div>
              </div>

              {/* Push Toggle Switch */}
              <button
                id="toggle_push_btn"
                type="button"
                role="switch"
                aria-checked={pushEnabled}
                onClick={handleTogglePush}
                aria-label="Toggle Shopping Reminders"
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                  pushEnabled ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                    pushEnabled ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: APPEARANCE & THEMES                                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_appearance_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.appearanceTitle') || (language === 'ur' ? 'تھیم' : 'Appearance')}
          </h2>

          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-surface-dim/75 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                  {language === 'ur' ? 'ایپ تھیم' : 'App Theme'}
                </h3>
                <p className="text-xs text-outline font-['Manrope']">
                  {language === 'ur'
                    ? 'اپنی پسند کی تھیم منتخب کریں'
                    : 'Select your preferred visual style'}
                </p>
              </div>
            </div>

            {/* Compact Themes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {themes.map((item) => {
                const isActive = theme === item.id;
                const localizedName =
                  language === 'ur'
                    ? item.nameUrdu
                    : language === 'roman-urdu'
                    ? item.nameRomanUrdu
                    : item.name;

                return (
                  <button
                    key={item.id}
                    id={`theme_select_btn_${item.id}`}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setTheme(item.id);
                    }}
                    className={`h-12 rounded-xl border px-3 flex items-center justify-between gap-2 transition-all cursor-pointer text-start active:scale-[0.98] ${
                      isActive
                        ? 'border-primary bg-primary/8 ring-1 ring-primary/30 shadow-2xs'
                        : 'border-surface-dim/70 bg-surface-container-lowest hover:bg-surface-container-low/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Swatch circle */}
                      <div
                        className="w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center border border-black/10 shadow-2xs"
                        style={{ backgroundColor: item.primary }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.accent }}
                        />
                      </div>
                      <span className="text-xs font-bold font-['Plus_Jakarta_Sans'] text-on-surface truncate">
                        {localizedName}
                      </span>
                    </div>

                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 4: SECURITY (Only when logged in)                          */}
        {/* ------------------------------------------------------------------ */}
        {user && (
          <section id="settings_security_section" className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
              {t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی' : 'Security')}
            </h2>

            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-dim/75 shadow-2xs overflow-hidden">
              <button
                type="button"
                id="toggle_change_password_btn"
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer active:bg-surface-container-low"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                    <LockKeyhole className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                      {t('settings.changePassword') || (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
                    </h3>
                    <p className="text-xs text-outline font-['Manrope'] truncate">
                      {language === 'ur'
                        ? 'اپنے یاد اکاؤنٹ کا نیا پاس ورڈ سیٹ کریں'
                        : 'Update your account login password'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-outline shrink-0">
                  <span className="text-xs font-semibold font-['Manrope']">
                    {language === 'ur' ? 'تبدیل کریں' : 'Change'}
                  </span>
                  <Chevron className="w-4 h-4" />
                </div>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 5: ABOUT & LEGAL                                           */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_about_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.aboutTitle') || (language === 'ur' ? 'معلومات و سپورٹ' : 'About & Support')}
          </h2>

          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-dim/75 shadow-2xs divide-y divide-surface-dim/50 overflow-hidden">
            {/* 1. About YAAD */}
            <button
              id="settings_link_about"
              type="button"
              onClick={() => handleOpenLegal('about')}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.aboutYaad') || (language === 'ur' ? 'یاد کے بارے میں' : 'About YAAD')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {t('settings.aboutYaadDesc') ||
                      (language === 'ur'
                        ? 'آسان اور تیز خریداری اسسٹنٹ'
                        : 'Simple grocery shopping memory assistant')}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>

            {/* 2. Help & Feedback */}
            <button
              id="settings_link_help"
              type="button"
              onClick={() => handleOpenLegal('help')}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.helpFeedback') || (language === 'ur' ? 'مدد اور فیڈ بیک' : 'Help & Feedback')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur'
                      ? 'سوالات یا تجاویز کے لیے رابطہ کریں'
                      : 'Guides and customer support'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>

            {/* 3. Privacy Policy */}
            <button
              id="settings_link_privacy"
              type="button"
              onClick={() => handleOpenLegal('privacy')}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.privacyPolicy') || (language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur'
                      ? 'آپ کا ذاتی گروسری ڈیٹا مکمل محفوظ ہے'
                      : 'Your data protection and privacy'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>

            {/* 4. Terms of Service */}
            <button
              id="settings_link_terms"
              type="button"
              onClick={() => handleOpenLegal('terms')}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <ScrollText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.termsOfService') || (language === 'ur' ? 'استعمال کی شرائط' : 'Terms of Service')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur'
                      ? 'یاد ایپ کے استعمال کے آسان اصول'
                      : 'Terms of service and usage'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>

            {/* 5. Version Row */}
            <div
              id="settings_item_version"
              className="p-4 sm:p-4.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                    {t('settings.versionTitle') || (language === 'ur' ? 'ایپ ورژن' : 'App Version')}
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur' ? 'پروڈکشن ریلیز' : 'Official release'}
                  </p>
                </div>
              </div>

              <div
                id="settings_version_badge"
                className="px-2.5 py-1 rounded-lg bg-surface-container-low font-mono text-xs font-bold text-outline border border-surface-dim/60 shrink-0"
              >
                v{APP_VERSION}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 6: SIGN OUT & DESTRUCTIVE ACTIONS                          */}
        {/* ------------------------------------------------------------------ */}
        {user && (
          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <button
              id="settings_sign_out_trigger_btn"
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowSignOutModal(true);
              }}
              className="w-full sm:w-auto sm:min-w-[220px] py-2.5 px-6 rounded-xl border border-rose-200/80 bg-rose-50/80 hover:bg-rose-100/90 text-rose-700 font-bold font-['Plus_Jakarta_Sans'] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
              <span>{t('auth.signOut') || (language === 'ur' ? 'اکاؤنٹ سے لاگ آؤٹ' : 'Sign Out')}</span>
            </button>

            {onDeleteAccount && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      language === 'ur'
                        ? 'کیا آپ واقعی اپنا اکاؤنٹ حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔'
                        : 'Are you sure you want to permanently delete your account? This cannot be undone.'
                    )
                  ) {
                    onDeleteAccount();
                  }
                }}
                className="text-[11px] text-outline hover:text-rose-600 transition-colors cursor-pointer py-1"
              >
                {language === 'ur' ? 'اکاؤنٹ مستقل حذف کریں' : 'Delete Account'}
              </button>
            )}

            <p className="text-[11px] text-outline/60 font-['Manrope'] text-center">
              YAAD • {language === 'ur' ? 'یاد — شاپنگ میموری اسسٹنٹ' : 'Simple Shopping Memory'}
            </p>
          </div>
        )}
      </main>

      {/* MODAL 1: Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        initialName={profile?.full_name || user?.user_metadata?.full_name || ''}
        initialPhone={displayPhone || ''}
        focusPhoneOnOpen={focusPhoneInModal}
        onSave={handleSaveProfile}
      />

      {/* MODAL 2: Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={changePassword}
      />

      {/* MODAL 3: Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarUrl={profile?.avatar_url}
        onSave={handleSelectAvatar}
        userName={displayName}
        userEmail={user?.email}
      />

      {/* MODAL 4: Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
      />

      {/* MODAL 5: In-App Legal / Help Viewer Modal */}
      <LegalDocModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
