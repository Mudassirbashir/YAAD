import React, { useState, useEffect } from 'react';
import {
  User,
  Smartphone,
  Pencil,
  Palette,
  Volume2,
  VolumeX,
  Globe2,
  LockKeyhole,
  LogOut,
  Sparkles,
  Headphones,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Gauge,
  Zap,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
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
import { isMiloEnabled, setMiloEnabled } from '../pet/miloPrefs';
import { isMiloSoundEnabled, setMiloSoundEnabled } from '../pet/miloSounds';
import { triggerMiloEvent } from '../pet/useMilo';
import { isPerfMeterEnabled, setPerfMeterEnabled } from '../lib/perfMeter';
import { isLowEndDevice, setLiteMode } from '../lib/deviceTier';
import { useLiteMode, useShouldAnimate } from '../lib/motionPreference';

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

interface SettingsSwitchProps {
  id: string;
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  isRTL: boolean;
  canAnimate: boolean;
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  id,
  checked,
  onToggle,
  ariaLabel,
  isRTL,
  canAnimate,
}) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={onToggle}
    className="min-w-[52px] min-h-[48px] flex items-center justify-center rounded-full shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <span
      className={`w-[50px] h-[30px] rounded-full p-[3px] flex items-center border ${
        canAnimate ? 'transition-[background-color,border-color] duration-150 yaad-ease-premium' : ''
      } ${
        checked
          ? 'bg-primary border-primary'
          : 'bg-surface-dim/90 dark:bg-slate-700 border-outline/25 dark:border-slate-600'
      }`}
    >
      <span
        className={`w-[22px] h-[22px] rounded-full bg-white shadow-xs flex items-center justify-center ${
          canAnimate ? 'transition-transform duration-150 yaad-ease-premium' : ''
        } ${checked ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`}
      >
        {checked && (
          <Check className="w-3 h-3 text-primary stroke-[3]" aria-hidden="true" />
        )}
      </span>
    </span>
  </button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onDeleteAccount,
  onOpenAuth,
  onOpenLegalPage,
  subSection = null,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, profile, updateUserProfile, changePassword } = useAuth();
  const { theme, setTheme, themes, customPalettes, selectedCustomPalette, setSelectedCustomPalette } = useAppTheme();
  const { config: remoteConfig } = useRemoteConfig();
  const canAnimate = useShouldAnimate();

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // Modals state - ALWAYS default to false so regular settings opens cleanly
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [focusPhoneInModal, setFocusPhoneInModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<
    'privacy' | 'terms' | 'help' | 'about' | null
  >(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

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
        el.scrollIntoView({ behavior: canAnimate ? 'smooth' : 'auto', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [subSection, canAnimate]);

  // Milo companion active state
  const [miloActive, setMiloActive] = useState<boolean>(() => isMiloEnabled());

  const handleToggleMilo = () => {
    triggerHaptic(8);
    const nextVal = !miloActive;
    setMiloActive(nextVal);
    setMiloEnabled(nextVal);
    triggerMiloEvent('settings_saved');
  };

  // Speed meter active state (zero-cost when OFF)
  const [perfMeterActive, setPerfMeterActive] = useState<boolean>(() => isPerfMeterEnabled());

  const handleTogglePerfMeter = () => {
    triggerHaptic(8);
    const nextVal = !perfMeterActive;
    setPerfMeterActive(nextVal);
    setPerfMeterEnabled(nextVal);
  };

  // Lite mode active state (maximum-performance escape hatch)
  const liteModeActive = useLiteMode();
  const isLowEndPhone = isLowEndDevice();

  const handleToggleLiteMode = () => {
    triggerHaptic(8);
    setLiteMode(!liteModeActive);
  };

  // Sound preference state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return isMiloSoundEnabled();
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
    setMiloSoundEnabled(nextVal);
    triggerMiloEvent('settings_saved');
    try {
      localStorage.setItem('yaad_sound_enabled', String(nextVal));
    } catch {}
    if (nextVal) {
      playPreviewChime();
    }
  };

  // Push notifications state (preserved as inactive state; no unrendered row added)
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yaad_push_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const _handleTogglePush = async () => {
    triggerHaptic(8);
    triggerMiloEvent('settings_saved');
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
  void _handleTogglePush;

  // Language selection handler
  const handleSelectLanguage = async (newLang: Language) => {
    triggerHaptic(10);
    setLanguage(newLang);
    triggerMiloEvent('settings_saved');
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
    if (!res.error) {
      triggerMiloEvent('settings_saved');
    }
    return res;
  };

  // Avatar select handler
  const handleSelectAvatar = async (avatarValue: string | null) => {
    const res = await updateUserProfile({ avatar_url: avatarValue });
    if (!res.error) {
      triggerHaptic([20, 15, 30]);
      triggerMiloEvent('settings_saved');
      setAvatarToast(
        language === 'ur'
          ? 'پروفائل تصویر کامیابی سے اپڈیٹ ہوگئی!'
          : language === 'roman-urdu'
          ? 'Profile picture kamyabi se update ho gayi!'
          : 'Profile picture updated successfully!'
      );
      setTimeout(() => setAvatarToast(null), 3500);
    }
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

  // Delete account confirmation handler
  const handleConfirmDeleteAccount = async () => {
    if (!onDeleteAccount) return;
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirmModal(false);
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

  const languageOptions: Array<{
    id: Language;
    domId: string;
    label: string;
    isUrdu?: boolean;
  }> = [
    { id: 'en', domId: 'lang_select_en', label: t('settings.languageEn') || 'English' },
    { id: 'roman-urdu', domId: 'lang_select_roman_urdu', label: t('settings.languageRomanUrdu') || 'Roman Urdu' },
    { id: 'ur', domId: 'lang_select_ur', label: t('settings.languageUrdu') || 'اردو', isUrdu: true },
  ];

  const hasPreferencesRows =
    remoteConfig.settings?.languageSelect !== false ||
    remoteConfig.settings?.miloCompanion !== false ||
    remoteConfig.settings?.soundEffects !== false;

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-on-surface flex flex-col font-sans pb-[calc(env(safe-area-inset-bottom,0px)+116px)] sm:pb-36"
    >
      {/* 1. Standard Top Navigation Header */}
      <TopHeader
        title={t('settings.title') || (language === 'ur' ? 'ترتیبات' : 'Settings')}
        showBack={true}
        onBack={onBack}
      />

      {/* 2. Main Page Container — consistent 24px section rhythm & tight heading-to-card gap */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-4 pb-6 flex flex-col gap-6">
        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: ACCOUNT & PROFILE                                       */}
        {/* ------------------------------------------------------------------ */}
        <section id="settings_profile_section" className="flex flex-col gap-2">
          <h2 className="yaad-settings-section-label px-1 font-display">
            {t('settings.accountTitle') || (language === 'ur' ? 'اکاؤنٹ' : 'Account')}
          </h2>

          <div
            className={`yaad-settings-card yaad-settings-hero-card p-4 sm:p-5 ${
              highlightedSection === 'profile' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
            }`}
          >
            {user ? (
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Leading Avatar (tap to open Avatar Picker when allowed) */}
                {remoteConfig.settings?.photoUpload !== false ? (
                  <button
                    type="button"
                    className={`relative shrink-0 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-95' : ''
                    }`}
                    onClick={() => {
                      triggerHaptic(8);
                      setShowAvatarPicker(true);
                    }}
                    title={language === 'ur' ? 'پروفائل پکچر تبدیل کریں' : 'Change Profile Picture'}
                    aria-label={language === 'ur' ? 'پروفائل پکچر تبدیل کریں' : 'Change Profile Picture'}
                  >
                    <Avatar
                      name={displayName}
                      email={user.email}
                      avatarUrl={profile?.avatar_url}
                      size="lg"
                      className="w-14 h-14 sm:w-15 sm:h-15 ring-2 ring-primary/20 group-hover:ring-primary/45 rounded-full"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 -end-0.5 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs ring-2 ring-surface-container-lowest"
                    >
                      <Pencil className="w-3 h-3" />
                    </span>
                  </button>
                ) : (
                  <div className="relative shrink-0 min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Avatar
                      name={displayName}
                      email={user.email}
                      avatarUrl={profile?.avatar_url}
                      size="lg"
                      className="w-14 h-14 sm:w-15 sm:h-15 ring-2 ring-primary/20 rounded-full"
                    />
                  </div>
                )}

                {/* Middle: Name primary, Phone & Email secondary */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-on-surface font-display truncate leading-tight">
                      {displayName}
                    </h3>
                    {isVerified && (
                      <span className="inline-flex shrink-0 items-center self-center">
                        <VerifiedBadge size="sm" />
                      </span>
                    )}
                  </div>

                  {displayPhone && (
                    <p className="text-[13px] text-on-surface-variant font-mono truncate leading-snug flex items-center gap-1.5 min-w-0 mt-0.5">
                      <Smartphone className="w-3.5 h-3.5 text-primary/80 shrink-0" aria-hidden="true" />
                      <span dir="ltr" className="truncate font-medium tabular-nums">
                        {formatPhoneNumber(displayPhone)}
                      </span>
                    </p>
                  )}

                  {displayEmail && (
                    <p dir="ltr" className="text-[13px] text-outline font-body truncate leading-snug rtl:text-right">
                      {displayEmail}
                    </p>
                  )}
                </div>

                {/* Trailing Edit Profile pencil button (≥48px touch target) */}
                {remoteConfig.settings?.editProfile !== false && (
                  <button
                    id="edit_profile_btn"
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setFocusPhoneInModal(false);
                      setShowEditProfileModal(true);
                    }}
                    title={language === 'ur' ? 'ایڈٹ انفو' : 'Edit Profile'}
                    aria-label={language === 'ur' ? 'ایڈٹ انفو' : 'Edit Profile'}
                    className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-surface-container-low hover:bg-primary/10 border border-surface-dim/70 text-primary flex items-center justify-center shrink-0 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-95' : ''
                    }`}
                  >
                    <Pencil className="w-4 h-4 stroke-[2.1]" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              /* Guest State Card — adapts cleanly down to 320px */
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 min-h-[56px]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="yaad-settings-tile">
                    <User className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-bold text-on-surface font-display leading-snug truncate">
                      {t('settings.guestUser') || (language === 'ur' ? 'مہمان صارف' : 'Guest Account')}
                    </h3>
                    <p className="text-[13px] text-outline font-body leading-snug mt-0.5 line-clamp-2">
                      {language === 'ur'
                        ? 'پرچیاں کلاؤڈ پر محفوظ کرنے کے لیے لاگ ان کریں'
                        : language === 'roman-urdu'
                        ? 'Lists cloud par mehfooz rakhne ke liye sign in karein'
                        : 'Sign in to sync your lists across devices'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth?.('signin')}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-95' : ''
                  }`}
                >
                  {t('auth.signIn') || (language === 'ur' ? 'سائن ان' : 'Sign In')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: PREFERENCES / GENERAL                                   */}
        {/* ------------------------------------------------------------------ */}
        {hasPreferencesRows && (
          <section id="settings_preferences_section" className="flex flex-col gap-2">
            <h2 className="yaad-settings-section-label px-1 font-display">
              {t('settings.preferencesTitle') || (language === 'ur' ? 'ترجیحات' : 'Preferences')}
            </h2>

            <div
              className={`yaad-settings-card p-4 sm:p-5 flex flex-col ${
                highlightedSection === 'preferences'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              {/* Language Selector */}
              {remoteConfig.settings?.languageSelect !== false && (
                <div
                  id="settings_language_section"
                  className={`flex flex-col gap-3 pb-4 ${
                    highlightedSection === 'language'
                      ? 'rounded-2xl p-2 -m-2 bg-primary/5 ring-2 ring-primary/60'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-h-[52px]">
                    <div className="yaad-settings-tile">
                      <Globe2 className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-on-surface font-display leading-snug">
                        {t('settings.language') || (language === 'ur' ? 'زبان منتخب کریں' : 'Display Language')}
                      </h3>
                      <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                        {t('settings.languageSubtitle') ||
                          (language === 'ur'
                            ? 'اردو، رومن اردو یا انگریزی میں استعمال کریں'
                            : 'Choose English, Roman Urdu, or Urdu')}
                      </p>
                    </div>
                  </div>

                  {/* 3-way Segmented Choice Control (EN / Roman Urdu / Urdu) */}
                  <div
                    role="radiogroup"
                    aria-label={t('settings.language') || 'Language'}
                    className="grid grid-cols-3 gap-1.5 p-1.5 bg-surface-container-low rounded-2xl border border-surface-dim/45 items-stretch"
                  >
                    {languageOptions.map((opt) => {
                      const isSelected = language === opt.id;
                      return (
                        <button
                          key={opt.id}
                          id={opt.domId}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectLanguage(opt.id)}
                          className={`min-h-[48px] py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] min-[390px]:text-xs sm:text-[13px] font-semibold flex flex-col min-[400px]:flex-row items-center justify-center gap-0.5 min-[400px]:gap-1.5 cursor-pointer whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                            opt.isUrdu ? 'font-urdu' : 'font-display'
                          } ${
                            canAnimate ? 'transition-[transform,background-color,color,border-color] duration-150 yaad-ease-premium active:scale-[0.98]' : ''
                          } ${
                            isSelected
                              ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                              : 'bg-transparent text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container/80'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.8] shrink-0 ${
                              isSelected ? 'opacity-100' : 'opacity-0 hidden min-[400px]:hidden'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle Rows with subtle hairline dividers & 12-16px spacing */}
              <div
                className={`flex flex-col divide-y yaad-settings-divider ${
                  remoteConfig.settings?.languageSelect !== false
                    ? 'border-t yaad-settings-divider pt-1'
                    : ''
                }`}
              >
                {/* Lite Mode Toggle + low-end-only hint */}
                <div className={`flex flex-col gap-1.5 ${remoteConfig.settings?.languageSelect !== false ? 'py-3' : 'pb-3'}`}>
                  <div className="flex items-center justify-between gap-3 min-h-[54px]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="yaad-settings-tile">
                        <Zap className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-semibold text-on-surface font-display truncate leading-snug">
                          Lite mode
                        </h4>
                        <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                          {language === 'ur'
                            ? 'ہلکے فون کے لیے تیز موڈ — اینیمیشن اور مائلو بند'
                            : language === 'en'
                            ? 'Fastest mode for budget phones — disables animations and Milo'
                            : 'Halke phone ke liye sab se tez mode — animation aur Milo band'}
                        </p>
                      </div>
                    </div>

                    <SettingsSwitch
                      id="toggle_lite_mode"
                      checked={liteModeActive}
                      onToggle={handleToggleLiteMode}
                      ariaLabel={liteModeActive ? 'Disable Lite mode' : 'Enable Lite mode'}
                      isRTL={isRTL}
                      canAnimate={canAnimate}
                    />
                  </div>

                  {isLowEndPhone && !liteModeActive && (
                    <p
                      id="lite_mode_low_end_hint"
                      className="text-[13px] text-outline font-body ps-[52px] leading-snug"
                    >
                      {language === 'ur'
                        ? 'آپ کا فون لو اینڈ ہے — لائٹ موڈ سے ایپ تیز چلے گی'
                        : language === 'en'
                        ? 'Your device is low-end — turn on Lite mode for faster performance'
                        : 'Aap ka phone low-end hai — Lite mode se app tez chalega'}
                    </p>
                  )}
                </div>

                {/* Milo Companion Toggle */}
                {remoteConfig.settings?.miloCompanion !== false && (
                  <div className="py-3 flex items-center justify-between gap-3 min-h-[54px]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="yaad-settings-tile yaad-settings-tile-warm">
                        <Sparkles className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-semibold text-on-surface font-display truncate leading-snug">
                          {language === 'ur' ? 'مائلو پالتو ساتھی' : 'Milo Pet Companion'}
                        </h4>
                        <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                          {language === 'ur'
                            ? 'فلوٹنگ اینیمیٹڈ ببل اور جشن کے تاثرات'
                            : language === 'roman-urdu'
                            ? 'Floating pet aur choti khushi ke lamhaat'
                            : 'Interactive floating pet & celebration moments'}
                        </p>
                      </div>
                    </div>

                    <SettingsSwitch
                      id="toggle_milo_companion"
                      checked={miloActive}
                      onToggle={handleToggleMilo}
                      ariaLabel={miloActive ? 'Disable Milo Pet Companion' : 'Enable Milo Pet Companion'}
                      isRTL={isRTL}
                      canAnimate={canAnimate}
                    />
                  </div>
                )}

                {/* Speed Meter Toggle */}
                <div className="py-3 flex items-center justify-between gap-3 min-h-[54px]">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="yaad-settings-tile">
                      <Gauge className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-semibold text-on-surface font-display truncate leading-snug">
                        Speed meter
                      </h4>
                      <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                        {language === 'ur'
                          ? 'فون پر اصل اسپیڈ دیکھنے کے لیے (بند ہونے پر زیرو اثر)'
                          : language === 'en'
                          ? 'Measure live app speed on device (zero overhead when off)'
                          : 'Phone par asal speed naapne ke liye (band hone par bilkul free)'}
                      </p>
                    </div>
                  </div>

                  <SettingsSwitch
                    id="toggle_speed_meter"
                    checked={perfMeterActive}
                    onToggle={handleTogglePerfMeter}
                    ariaLabel={perfMeterActive ? 'Disable Speed meter' : 'Enable Speed meter'}
                    isRTL={isRTL}
                    canAnimate={canAnimate}
                  />
                </div>

                {/* Sound Effects Toggle */}
                {remoteConfig.settings?.soundEffects !== false && (
                  <div className="pt-3 flex items-center justify-between gap-3 min-h-[54px]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="yaad-settings-tile">
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                        ) : (
                          <VolumeX className="w-5 h-5 stroke-[1.9] text-outline" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-semibold text-on-surface font-display truncate leading-snug">
                          {t('settings.soundEffects') || (language === 'ur' ? 'آواز کے اثرات' : 'Sound Effects')}
                        </h4>
                        <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                          {t('settings.soundEffectsDesc') ||
                            (language === 'ur'
                              ? 'مائلو کی آوازیں اور تصدیقی دھنیں'
                              : 'Synthesized pet audio & action feedback')}
                        </p>
                      </div>
                    </div>

                    <SettingsSwitch
                      id="toggle_sound_effects"
                      checked={soundEnabled}
                      onToggle={handleToggleSound}
                      ariaLabel={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
                      isRTL={isRTL}
                      canAnimate={canAnimate}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: APPEARANCE & THEMES                                     */}
        {/* ------------------------------------------------------------------ */}
        {remoteConfig.settings?.themeColor !== false && (
          <section id="settings_appearance_section" className="flex flex-col gap-2">
            <h2 className="yaad-settings-section-label px-1 font-display">
              {t('settings.appearanceTitle') || (language === 'ur' ? 'تھیم اور رنگ' : 'Appearance & Themes')}
            </h2>

            <div
              className={`yaad-settings-card p-4 sm:p-5 flex flex-col gap-4 ${
                highlightedSection === 'appearance'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3 min-h-[52px]">
                <div className="yaad-settings-tile">
                  <Palette className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold text-on-surface font-display leading-snug">
                    {language === 'ur' ? 'ایپ تھیم' : 'App Theme'}
                  </h3>
                  <p className="text-[13px] text-outline font-body leading-snug mt-0.5">
                    {language === 'ur'
                      ? 'اپنی پسند کی آسان تھیم یا کسٹم رنگ منتخب کریں'
                      : language === 'roman-urdu'
                      ? 'Pasandeeda theme ya custom rang chunein'
                      : 'Select a clean pre-set theme or customize your own'}
                  </p>
                </div>
              </div>

              {/* Standard Pre-set Themes Grid */}
              <div
                role="group"
                aria-label={language === 'ur' ? 'ایپ تھیمز' : 'Preset Themes'}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              >
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
                      aria-pressed={isActive}
                      onClick={() => {
                        triggerHaptic(8);
                        setTheme(item.id);
                        triggerMiloEvent('settings_saved');
                      }}
                      className={`min-h-[56px] rounded-2xl px-3 py-2 flex items-center justify-between gap-2 cursor-pointer text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                        canAnimate ? 'transition-[transform,background-color,border-color] duration-150 yaad-ease-premium active:scale-[0.98]' : ''
                      } ${
                        isActive
                          ? 'border-2 border-primary bg-primary/10 dark:bg-primary/16'
                          : 'border border-surface-dim/70 bg-surface-container-low/55 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center border border-black/15"
                          style={{ backgroundColor: item.primary }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.accent }}
                          />
                        </span>
                        <span
                          className={`text-xs sm:text-[13px] font-display truncate ${
                            isActive ? 'font-bold text-on-surface' : 'font-semibold text-on-surface-variant'
                          }`}
                        >
                          {localizedName}
                        </span>
                      </div>

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Theme Palettes */}
              <div className="pt-4 border-t yaad-settings-divider flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-on-surface font-display">
                    {language === 'ur' ? 'کسٹم تھیم (Custom Theme)' : 'Custom Theme Palettes'}
                  </span>
                  {theme === 'custom' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <Check className="w-3.5 h-3.5 stroke-[2.6]" aria-hidden="true" />
                      <span>{language === 'ur' ? 'فعال ہے' : 'Active'}</span>
                    </span>
                  )}
                </div>

                <div
                  role="group"
                  aria-label={language === 'ur' ? 'کسٹم رنگ پیلیٹس' : 'Custom Color Palettes'}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                >
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
                        id={`custom_palette_btn_${cp.id}`}
                        type="button"
                        aria-pressed={isCpActive}
                        onClick={() => {
                          triggerHaptic(8);
                          setSelectedCustomPalette(cp.id);
                          setTheme('custom');
                          triggerMiloEvent('settings_saved');
                        }}
                        className={`min-h-[52px] rounded-2xl px-2.5 py-2 flex items-center justify-between gap-1.5 cursor-pointer text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                          canAnimate ? 'transition-[transform,background-color,border-color] duration-150 yaad-ease-premium active:scale-[0.98]' : ''
                        } ${
                          isCpActive
                            ? 'border-2 border-primary bg-primary/10 dark:bg-primary/16'
                            : 'border border-surface-dim/70 bg-surface-container-low/55 hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            aria-hidden="true"
                            className="w-5 h-5 rounded-full shrink-0 border border-black/15"
                            style={{ backgroundColor: cp.primary }}
                          />
                          <span
                            className={`text-xs truncate ${
                              isCpActive ? 'font-bold text-on-surface' : 'font-semibold text-on-surface-variant'
                            }`}
                          >
                            {cpName}
                          </span>
                        </div>
                        {isCpActive && (
                          <span
                            aria-hidden="true"
                            className="w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 4: SECURITY                                                */}
        {/* ------------------------------------------------------------------ */}
        {user && remoteConfig.settings?.changePassword !== false && (
          <section id="settings_security_section" className="flex flex-col gap-2">
            <h2 className="yaad-settings-section-label px-1 font-display">
              {t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی' : 'Security')}
            </h2>

            <div
              className={`yaad-settings-card overflow-hidden ${
                highlightedSection === 'security'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              <button
                type="button"
                id="toggle_change_password_btn"
                onClick={() => {
                  triggerHaptic(8);
                  setShowChangePasswordModal(true);
                }}
                className="w-full p-4 sm:p-5 min-h-[68px] flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/65 active:bg-surface-container-low cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="yaad-settings-tile">
                    <LockKeyhole className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-on-surface font-display leading-snug">
                      {t('settings.changePassword') || (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
                    </h3>
                    <p className="text-[13px] text-outline font-body truncate leading-snug mt-0.5">
                      {language === 'ur'
                        ? 'اپنے یاد اکاؤنٹ کا نیا پاس ورڈ سیٹ کریں'
                        : language === 'roman-urdu'
                        ? 'Apne YAAD account ka naya password set karein'
                        : 'Update your account login password'}
                    </p>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className="w-9 h-9 rounded-xl bg-surface-container-low border border-surface-dim/55 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/10"
                >
                  <Pencil className="w-4 h-4 stroke-[2]" />
                </span>
              </button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 5: ABOUT & SUPPORT                                         */}
        {/* ------------------------------------------------------------------ */}
        {(remoteConfig.settings?.customerSupport !== false || remoteConfig.settings?.aboutYaad !== false) && (
          <section id="settings_about_section" className="flex flex-col gap-2">
            <h2 className="yaad-settings-section-label px-1 font-display">
              {t('settings.aboutTitle') || (language === 'ur' ? 'معلومات و سپورٹ' : 'About & Support')}
            </h2>

            <div
              className={`yaad-settings-card divide-y yaad-settings-divider overflow-hidden ${
                highlightedSection === 'about'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              {/* 1. Customer Support Desk */}
              {remoteConfig.settings?.customerSupport !== false && (
                <button
                  id="settings_support_section"
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setShowSupportModal(true);
                  }}
                  className={`w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/65 active:bg-surface-container-low cursor-pointer group min-h-[68px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                    highlightedSection === 'support' ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="yaad-settings-tile">
                      <Headphones className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-on-surface font-display leading-snug truncate">
                        {language === 'ur' ? 'کسٹمر سپورٹ ڈیسک' : 'Customer Support Desk'}
                      </h3>
                      <p className="text-[13px] text-outline font-body truncate leading-snug mt-0.5">
                        {language === 'ur'
                          ? 'سپورٹ ٹیم سے براہ راست مدد یا شکایت درج کریں'
                          : language === 'roman-urdu'
                          ? 'Support team se barah-e-raast madad ya shikayat bhejein'
                          : 'Direct help · Contact staff or report an issue'}
                      </p>
                    </div>
                  </div>
                  <Chevron className="w-5 h-5 text-outline group-hover:text-primary shrink-0" aria-hidden="true" />
                </button>
              )}

              {/* 2. About YAAD */}
              {remoteConfig.settings?.aboutYaad !== false && (
                <button
                  id="settings_link_about"
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    handleOpenLegal('about');
                  }}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-start hover:bg-surface-container-low/65 active:bg-surface-container-low cursor-pointer group min-h-[68px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="yaad-settings-tile">
                      <Info className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-on-surface font-display leading-snug truncate">
                        {t('settings.aboutYaad') || (language === 'ur' ? 'یاد کے بارے میں' : 'About YAAD')}
                      </h3>
                      <p className="text-[13px] text-outline font-body truncate leading-snug mt-0.5">
                        {t('settings.aboutYaadDesc') ||
                          (language === 'ur'
                            ? 'آسان اور تیز خریداری اسسٹنٹ'
                            : 'Simple grocery shopping memory assistant')}
                      </p>
                    </div>
                  </div>
                  <Chevron className="w-5 h-5 text-outline group-hover:text-primary shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 6: ISOLATED SIGN OUT & DESTRUCTIVE ZONE                    */}
        {/* ------------------------------------------------------------------ */}
        {user && (
          <section
            aria-label={language === 'ur' ? 'اکاؤنٹ سیشن' : 'Account session'}
            className="pt-4 mt-1 border-t yaad-settings-divider flex flex-col items-center gap-3"
          >
            {remoteConfig.settings?.signOut !== false && (
              <button
                id="settings_sign_out_trigger_btn"
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setShowSignOutModal(true);
                }}
                className={`w-full min-h-[52px] py-3 px-5 rounded-2xl border border-rose-200/90 dark:border-rose-500/30 bg-rose-50/85 dark:bg-rose-950/35 hover:bg-rose-100/90 dark:hover:bg-rose-950/55 text-rose-700 dark:text-rose-300 font-semibold font-display text-[15px] flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  canAnimate ? 'transition-transform duration-150 yaad-ease-premium active:scale-[0.99]' : ''
                }`}
              >
                <LogOut className="w-5 h-5 stroke-[2] rtl:rotate-180" aria-hidden="true" />
                <span>{t('auth.signOut') || (language === 'ur' ? 'اکاؤنٹ سے لاگ آؤٹ' : 'Sign Out')}</span>
              </button>
            )}

            {onDeleteAccount && remoteConfig.settings?.deleteAccount === true && (
              <button
                id="settings_delete_account_btn"
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setShowDeleteConfirmModal(true);
                }}
                className="min-h-[48px] px-4 py-2 text-[13px] font-medium text-rose-700/80 dark:text-rose-400/85 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/8 cursor-pointer rounded-xl inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{language === 'ur' ? 'اکاؤنٹ مستقل حذف کریں' : 'Delete Account'}</span>
              </button>
            )}
          </section>
        )}

        {/* Unhighlighted Plain App Version at the very bottom */}
        <footer className="pt-2 pb-1 text-center select-none flex flex-col items-center gap-1">
          <p className="text-xs text-outline/75 font-body">
            YAAD · {language === 'ur' ? 'یاد — شاپنگ میموری اسسٹنٹ' : 'Simple Shopping Memory'}
          </p>
          <span className="text-xs text-outline/60 font-mono tabular-nums tracking-wide">
            YAAD v{APP_VERSION}
          </span>
        </footer>
      </main>

      {/* Full-Screen Edit Profile View */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        initialName={displayName}
        initialPhone={displayPhone || ''}
        email={displayEmail}
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

      {/* MODAL 7: Conditional Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && onDeleteAccount && remoteConfig.settings?.deleteAccount === true && (
        <div
          id="delete_account_modal_backdrop"
          onClick={() => !isDeletingAccount && setShowDeleteConfirmModal(false)}
          style={!canAnimate ? { animationDuration: '80ms' } : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 yaad-enter-fade"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete_account_modal_title"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div
            id="delete_account_modal_container"
            onClick={(e) => e.stopPropagation()}
            style={!canAnimate ? { animationDuration: '80ms' } : undefined}
            className={`yaad-settings-card p-5 sm:p-6 max-w-sm w-full space-y-4 text-center ${
              canAnimate ? 'yaad-enter-zoom' : 'yaad-enter-fade'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/12 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h3 id="delete_account_modal_title" className="text-lg font-bold text-on-surface font-display">
                {language === 'ur' ? 'اکاؤنٹ مستقل حذف کریں؟' : 'Delete Your Account?'}
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                {language === 'ur'
                  ? 'کیا آپ واقعی اپنا اکاؤنٹ حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔'
                  : 'Are you sure you want to permanently delete your account? This cannot be undone.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-1">
              <button
                type="button"
                id="confirm_delete_account_btn"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{language === 'ur' ? 'حذف ہو رہا ہے...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <span>{language === 'ur' ? 'ہاں، حذف کریں' : 'Yes, Delete'}</span>
                )}
              </button>
              <button
                type="button"
                id="cancel_delete_account_btn"
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container border border-surface-dim/70 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t('settings.cancel') || (language === 'ur' ? 'منسوخ' : 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Save Feedback Toast */}
      {avatarToast && (
        <div
          role="status"
          aria-live="polite"
          style={!canAnimate ? { animationDuration: '80ms' } : undefined}
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#003527] text-[#FDF6E3] px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 border border-[#FCBC1F]/35 text-xs font-body font-semibold max-w-[calc(100vw-32px)] ${
            canAnimate ? 'yaad-enter-state' : 'yaad-enter-fade'
          }`}
        >
          <Check className="w-4 h-4 text-[#FCBC1F] stroke-[3] shrink-0" aria-hidden="true" />
          <span className="truncate">{avatarToast}</span>
        </div>
      )}
    </div>
  );
};
