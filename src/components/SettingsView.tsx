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
import { SupportDeskModal } from './settings/SupportDeskModal';
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
    section: 'profile' | 'appearance' | 'preferences' | 'about' | 'security' | 'language' | 'notifications' | 'support',
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
  const { theme, setTheme, themes, customPalettes, selectedCustomPalette, setSelectedCustomPalette } = useAppTheme();

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // Modals state - ALWAYS default to false so regular settings opens cleanly
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [focusPhoneInModal, setFocusPhoneInModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<
    'privacy' | 'terms' | 'help' | 'about' | null
  >(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Deep Link & subSection scrolling
  useEffect(() => {
    if (subSection) {
      setHighlightedSection(subSection);
      if (subSection === 'support') {
        setShowSupportModal(true);
      }
      const targetId = `settings_${subSection}_section`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, 3000);
      return () => clearTimeout(timer);
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
  const handleSaveProfile = async (
    fullName: string,
    phoneNumber: string | null,
    avatarUrl?: string | null
  ) => {
    const res = await updateUserProfile({
      full_name: fullName,
      phone_number: phoneNumber,
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
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
  const [cachedVerified, setCachedVerified] = useState<boolean>(() => {
    try {
      if (user?.id) {
        const c = localStorage.getItem('yaad_verified_' + user.id);
        if (c !== null) return c === 'true';
      }
    } catch {}
    return Boolean(profile?.is_verified || (user?.user_metadata as any)?.is_verified);
  });

  const isVerified = Boolean(profile?.is_verified || (user?.user_metadata as any)?.is_verified || cachedVerified);

  // Authoritative real-time sync of user's blue tick verification badge
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    fetch(`/api/users/${user.id}/verification`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && typeof data.isVerified === 'boolean') {
          try {
            localStorage.setItem('yaad_verified_' + user.id, String(data.isVerified));
          } catch {}
          setCachedVerified(data.isVerified);
          if (profile && profile.is_verified !== data.isVerified) {
            updateUserProfile({ is_verified: data.isVerified }).catch(() => {});
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [user?.id, profile?.is_verified, updateUserProfile]);

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
        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: PROFILE & ACCOUNT (Directly at top of settings)         */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_profile_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.accountTitle') || (language === 'ur' ? 'اکاؤنٹ' : 'Account')}
          </h2>

          <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-dim/75 shadow-2xs">
            {user ? (
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Left side: Avatar with click to edit */}
                <div
                  className="relative shrink-0 flex flex-col items-center cursor-pointer group"
                  onClick={() => {
                    triggerHaptic(8);
                    setFocusPhoneInModal(false);
                    setShowEditProfileModal(true);
                  }}
                  title={language === 'ur' ? 'پروفائل پکچر تبدیل کریں' : 'Change Profile Picture'}
                >
                  <Avatar
                    name={displayName}
                    email={user.email}
                    avatarUrl={profile?.avatar_url}
                    size="lg"
                    className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs ring-1 ring-white">
                    <Pencil className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Profile Information: Name on top with verified badge, phone below, email below phone */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans'] truncate">
                      {displayName}
                    </h3>
                    {isVerified && (
                      <span className="inline-flex shrink-0 items-center self-center">
                        <VerifiedBadge size="sm" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-outline font-['Manrope'] truncate mt-0.5">
                    {displayPhone ? (
                      <span dir="ltr" className="font-mono text-on-surface-variant font-medium">
                        {formatPhoneNumber(displayPhone)}
                      </span>
                    ) : (
                      displayEmail || (language === 'ur' ? 'کوئی فون نمبر درج نہیں' : 'No phone added')
                    )}
                  </p>

                  {displayPhone && displayEmail && (
                    <p className="text-[11px] text-outline/80 font-['Manrope'] truncate">
                      {displayEmail}
                    </p>
                  )}
                </div>

                {/* Right side: Circular button with pencil icon (Edit Info / ایڈٹ انفو) */}
                <button
                  id="edit_profile_btn"
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setFocusPhoneInModal(false);
                    setShowEditProfileModal(true);
                  }}
                  title={language === 'ur' ? 'ایڈٹ انفو' : 'Edit Info'}
                  aria-label={language === 'ur' ? 'ایڈٹ انفو' : 'Edit Info'}
                  className="w-11 h-11 rounded-full bg-surface-container hover:bg-surface-container-high border border-surface-dim/75 text-primary flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all group"
                >
                  <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              /* Guest State Card */
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
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
        {/* SECTION 2: PERFORMANCE (Language only, smooth & rounded)          */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_preferences_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'کارکردگی و زبان' : 'Performance & Language'}
          </h2>

          <div className="bg-surface-container-lowest rounded-3xl border border-surface-dim/75 shadow-2xs p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
                <Globe2 className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                  {t('settings.language') || (language === 'ur' ? 'زبان منتخب کریں' : 'Display Language')}
                </h3>
                <p className="text-xs text-outline font-['Manrope']">
                  {t('settings.languageSubtitle') ||
                    (language === 'ur'
                      ? 'اردو، رومن اردو یا انگریزی میں استعمال کریں'
                      : 'Choose English, Roman Urdu, or Urdu')}
                </p>
              </div>
            </div>

            {/* 3-way Segmented Control with no-wrap and uniform heights */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-surface-container-low rounded-2xl items-center">
              {/* English */}
              <button
                id="lang_select_en"
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`min-h-[42px] py-2 px-1 sm:px-2 rounded-xl text-[11.5px] sm:text-xs font-bold font-['Plus_Jakarta_Sans'] transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
              </button>

              {/* Roman Urdu - strictly whitespace-nowrap so it never breaks to 2 lines */}
              <button
                id="lang_select_roman_urdu"
                type="button"
                onClick={() => handleSelectLanguage('roman-urdu')}
                className={`min-h-[42px] py-2 px-1 sm:px-2 rounded-xl text-[11.5px] sm:text-xs font-bold font-['Plus_Jakarta_Sans'] transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  language === 'roman-urdu'
                    ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>Roman Urdu</span>
                {language === 'roman-urdu' && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
              </button>

              {/* Urdu */}
              <button
                id="lang_select_ur"
                type="button"
                onClick={() => handleSelectLanguage('ur')}
                className={`min-h-[42px] py-2 px-1 sm:px-2 rounded-xl text-[11.5px] sm:text-xs font-bold font-urdu transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  language === 'ur'
                    ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span>اردو</span>
                {language === 'ur' && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />}
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: APPEARANCE & THEMES (Simplified Names + Custom Palettes) */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_appearance_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.appearanceTitle') || (language === 'ur' ? 'تھیم اور رنگ' : 'Appearance & Theme')}
          </h2>

          <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-dim/75 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
                <Palette className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                  {language === 'ur' ? 'ایپ تھیم' : 'App Theme'}
                </h3>
                <p className="text-xs text-outline font-['Manrope']">
                  {language === 'ur'
                    ? 'اپنی پسند کی آسان تھیم یا کسٹم رنگ منتخب کریں'
                    : 'Select a clean pre-set theme or customize your own'}
                </p>
              </div>
            </div>

            {/* Standard Pre-set Themes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    className={`h-12 rounded-2xl border px-3 flex items-center justify-between gap-2 transition-all cursor-pointer text-start active:scale-[0.98] ${
                      isActive
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30 shadow-2xs'
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

            {/* Custom Theme Card with 4 Distinct Palettes */}
            <div className="pt-2 border-t border-surface-dim/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                  {language === 'ur' ? 'کسٹم تھیم (Custom Theme)' : 'Custom Theme Palettes'}
                </span>
                {theme === 'custom' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {language === 'ur' ? 'فعال ہے' : 'Active'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customPalettes.map((cp) => {
                  const isCpActive = theme === 'custom' && selectedCustomPalette.id === cp.id;
                  const cpName =
                    language === 'ur'
                      ? cp.nameUrdu
                      : language === 'roman-urdu'
                      ? cp.nameRomanUrdu
                      : cp.name;

                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setSelectedCustomPalette(cp.id);
                        setTheme('custom');
                      }}
                      className={`h-11 rounded-2xl border px-2.5 flex items-center justify-between gap-1.5 transition-all cursor-pointer text-start active:scale-95 ${
                        isCpActive
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xs'
                          : 'border-surface-dim/70 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-full shrink-0 border border-black/15 shadow-2xs"
                          style={{ backgroundColor: cp.primary }}
                        />
                        <span className="text-[11px] font-bold text-on-surface truncate">
                          {cpName}
                        </span>
                      </div>
                      {isCpActive && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 4: SECURITY (Change Password Card)                         */}
        {/* ------------------------------------------------------------------ */}
        {user && (
          <section id="settings_security_section" className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
              {t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی' : 'Security')}
            </h2>

            <div className="bg-surface-container-lowest rounded-3xl border border-surface-dim/75 shadow-2xs p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <LockKeyhole className="w-4.5 h-4.5 stroke-[2.2]" />
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

              {/* Circular pencil action button */}
              <button
                type="button"
                id="toggle_change_password_btn"
                onClick={() => setShowChangePasswordModal(true)}
                title={language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
                aria-label="Change Password"
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high border border-surface-dim/75 text-primary flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all group"
              >
                <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 5: ABOUT & SUPPORT (Only About YAAD & Customer Support Desk) */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_about_section" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-outline px-1 font-['Plus_Jakarta_Sans']">
            {t('settings.aboutTitle') || (language === 'ur' ? 'معلومات و سپورٹ' : 'About & Support')}
          </h2>

          <div className="bg-surface-container-lowest rounded-3xl border border-surface-dim/75 shadow-2xs divide-y divide-surface-dim/50 overflow-hidden">
            {/* 1. Customer Support Desk */}
            <button
              id="settings_support_section"
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setShowSupportModal(true);
              }}
              className={`w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low ${
                highlightedSection === 'support' ? 'bg-primary/10 ring-2 ring-primary ring-inset rounded-2xl' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Headphones className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                    <span>{language === 'ur' ? 'کسٹمر سپورٹ ڈیسک' : 'Customer Support Desk'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {language === 'ur' ? 'براہ راست رابطہ' : 'Direct Help'}
                    </span>
                  </h3>
                  <p className="text-xs text-outline font-['Manrope'] truncate">
                    {language === 'ur'
                      ? 'ایڈمن سپورٹ ٹیم سے فوری مدد یا شکایت درج کریں'
                      : 'Contact staff or report an issue directly'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>

            {/* 2. About YAAD */}
            <button
              id="settings_link_about"
              type="button"
              onClick={() => handleOpenLegal('about')}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/50 transition-colors cursor-pointer group active:bg-surface-container-low"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5 stroke-[2.2]" />
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
              <ChevronRight className="w-4.5 h-4.5 text-outline group-hover:text-primary transition-colors shrink-0" />
            </button>
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

        {/* Unhighlighted Plain App Version at the very bottom */}
        <div className="pt-4 pb-2 text-center select-none">
          <span className="text-[11px] text-outline/50 font-mono tracking-wide">
            YAAD v{APP_VERSION}
          </span>
        </div>
      </main>

      {/* MODAL 1: Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        initialName={profile?.full_name || user?.user_metadata?.full_name || ''}
        initialPhone={displayPhone || ''}
        initialAvatarUrl={profile?.avatar_url || null}
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

      {/* MODAL 6: Customer Support Desk Modal */}
      <SupportDeskModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userId={user?.id}
        userName={displayName}
        userEmail={user?.email || profile?.email}
        userPhone={displayPhone}
      />
    </div>
  );
};
