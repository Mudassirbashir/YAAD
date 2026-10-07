import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Palette,
  SlidersHorizontal,
  Compass,
  ShieldAlert,
  Pencil,
  Smartphone,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  PhoneCall,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { TopHeader } from './TopHeader';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { AvatarPickerModal } from './AvatarPickerModal';
import { AppearanceSection } from './settings/AppearanceSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { SecuritySection } from './settings/SecuritySection';
import { AboutSection } from './settings/AboutSection';
import { SignOutConfirmModal } from './settings/SignOutConfirmModal';
import { LegalDocModal } from './settings/LegalDocModal';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
  formatPhoneNumber,
} from '../utils/phone';

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
  subSection?: string | null;
  onSubSectionChange?: (
    section: 'profile' | 'appearance' | 'preferences' | 'about' | 'security' | 'language',
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onOpenAuth,
  onOpenLegalPage,
  initialEditPhone = false,
  subSection = null,
  onSubSectionChange,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const {
    user,
    profile,
    updateUserProfile,
    changePassword,
  } = useAuth();

  // Active section for jump pill highlights
  const [activeSection, setActiveSection] = useState<string>(
    subSection || 'profile',
  );

  // Deep Link & Subsection auto-scroll
  useEffect(() => {
    if (!subSection) return;
    setActiveSection(subSection);

    const targetId =
      subSection === 'profile'
        ? 'settings_section_profile'
        : subSection === 'appearance'
        ? 'settings_section_appearance'
        : subSection === 'security'
        ? 'settings_section_security'
        : subSection === 'about'
        ? 'settings_section_about'
        : 'settings_section_preferences';

    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [subSection]);

  const handleJumpToSection = (
    section: 'profile' | 'appearance' | 'preferences' | 'about' | 'security',
  ) => {
    setActiveSection(section);
    onSubSectionChange?.(section);
    const targetId =
      section === 'profile'
        ? 'settings_section_profile'
        : section === 'appearance'
        ? 'settings_section_appearance'
        : section === 'preferences'
        ? 'settings_section_preferences'
        : section === 'about'
        ? 'settings_section_about'
        : 'settings_section_security';

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ============================================================================
  // Profile & Name/Phone Edit State
  // ============================================================================
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(initialEditPhone);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync inputs with user / profile data
  useEffect(() => {
    if (profile?.full_name) {
      setFullNameInput(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullNameInput(user.user_metadata.full_name);
    } else {
      setFullNameInput('');
    }
  }, [profile, user]);

  useEffect(() => {
    if (profile?.phone_number) {
      setPhoneInput(profile.phone_number);
    } else if (user?.user_metadata?.phone_number) {
      setPhoneInput(user.user_metadata.phone_number);
    } else if (user?.user_metadata?.phone) {
      setPhoneInput(user.user_metadata.phone);
    } else if (user?.phone) {
      setPhoneInput(user.phone);
    } else {
      setPhoneInput('');
    }
  }, [profile, user]);

  // Auto-focus phone field if navigated with initialEditPhone
  useEffect(() => {
    if (initialEditPhone) {
      setIsEditingPhone(true);
      const timer = setTimeout(() => {
        const inputEl = document.getElementById('settings_input_phone');
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          inputEl.focus();
        } else {
          const editBtn = document.getElementById('edit_phone_toggle_btn');
          if (editBtn) {
            editBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialEditPhone]);

  // Avatar Picker Modal
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Save Name Handler
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullNameInput.trim()) {
      setProfileMessage({
        type: 'error',
        text: t('profileSetup.nameRequired') || 'Name is required',
      });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    const { error } = await updateUserProfile({
      full_name: fullNameInput.trim(),
    });

    setIsSavingProfile(false);

    if (error) {
      setProfileMessage({
        type: 'error',
        text: error.message || 'Unable to update profile',
      });
    } else {
      setProfileMessage({
        type: 'success',
        text: t('settings.saved') || (language === 'ur' ? 'محفوظ کر لیا گیا' : 'Saved successfully'),
      });
      setIsEditingName(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Save Phone Handler
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPhoneError(null);

    const trimmedPhone = phoneInput.trim();
    if (trimmedPhone) {
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.isValid) {
        setPhoneError(
          validation.error ||
            'Please enter a valid phone number (e.g. +92 300 1234567).',
        );
        return;
      }
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    const cleanVal = trimmedPhone ? cleanPhoneNumber(trimmedPhone) : null;
    const { error } = await updateUserProfile({
      phone_number: cleanVal,
    });

    setIsSavingProfile(false);

    if (error) {
      setProfileMessage({
        type: 'error',
        text: error.message || 'Unable to update phone number',
      });
    } else {
      setProfileMessage({
        type: 'success',
        text: t('settings.saved') || (language === 'ur' ? 'فون نمبر محفوظ کر لیا گیا' : 'Saved successfully'),
      });
      setIsEditingPhone(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Save Avatar Handler
  const handleSelectAvatar = async (avatarValue: string | null) => {
    setIsSavingProfile(true);
    const { error } = await updateUserProfile({
      avatar_url: avatarValue,
    });
    setIsSavingProfile(false);

    if (error) {
      setProfileMessage({
        type: 'error',
        text: error.message || 'Unable to update avatar',
      });
    } else {
      setProfileMessage({
        type: 'success',
        text: t('settings.avatarUpdated') || t('settings.saved') || (language === 'ur' ? 'اواتار تبدیل ہو گیا' : 'Avatar updated!'),
      });
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // ============================================================================
  // Preferences State & Handlers (Sound & Language)
  // ============================================================================
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
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

      osc2.frequency.setValueAtTime(261.63, now); // C4
      osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.1); // E4
      osc2.frequency.exponentialRampToValueAtTime(392.0, now + 0.2); // G4
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem('yaad_sound_enabled', String(nextVal));
    } catch (e) {
      console.warn('Could not save sound pref:', e);
    }
    if (nextVal) {
      playPreviewChime();
    }
  };

  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang);
    if (user) {
      await updateUserProfile({ language: lang });
    }
  };

  // ============================================================================
  // Password State & Handlers
  // ============================================================================
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setPasswordMessage({
        type: 'error',
        text:
          language === 'ur'
            ? 'آپ آف لائن ہیں۔ پاس ورڈ تبدیل کرنے کے لیے انٹرنیٹ سے جڑیں۔'
            : "You're offline. Please reconnect to change your password.",
      });
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordMessage({
        type: 'error',
        text:
          t('settings.enterCurrentPassword') ||
          (language === 'ur' ? 'براہ کرم اپنا موجودہ پاس ورڈ درج کریں۔' : 'Please enter your current password.'),
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text:
          t('settings.passwordTooShort') ||
          (language === 'ur' ? 'پاس ورڈ کم از کم 6 ہندسوں پر مشتمل ہونا چاہیے۔' : 'Password must be at least 6 characters.'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text:
          t('settings.passwordsDoNotMatch') ||
          (language === 'ur' ? 'پاس ورڈ مماثل نہیں ہیں۔' : 'Passwords do not match.'),
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const { error } = await changePassword(currentPassword, newPassword);

    setIsUpdatingPassword(false);

    if (error) {
      setPasswordMessage({
        type: 'error',
        text: error.message || (language === 'ur' ? 'پاس ورڈ اپ ڈیٹ نہیں ہو سکا' : 'Unable to update password.'),
      });
    } else {
      setPasswordMessage({
        type: 'success',
        text:
          t('settings.passwordUpdated') ||
          (language === 'ur' ? 'پاس ورڈ کامیابی سے تبدیل ہو گیا!' : 'Password updated successfully!'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPasswordMessage(null), 4000);
    }
  };

  // ============================================================================
  // Sign Out State & Handlers
  // ============================================================================
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  // ============================================================================
  // Legal Modals State
  // ============================================================================
  const [activeLegalModal, setActiveLegalModal] = useState<
    'privacy' | 'terms' | 'help' | 'about' | null
  >(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAvatarPicker) setShowAvatarPicker(false);
        if (showSignOutConfirm && !isSigningOut) setShowSignOutConfirm(false);
        if (isEditingName) setIsEditingName(false);
        if (isEditingPhone) setIsEditingPhone(false);
        if (activeLegalModal) setActiveLegalModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showAvatarPicker,
    showSignOutConfirm,
    isEditingName,
    isEditingPhone,
    isSigningOut,
    activeLegalModal,
  ]);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user ? 'Account User' : t('settings.guestUser') || (language === 'ur' ? 'مہمان صارف' : 'Guest User'));
  const displayEmail =
    user?.email || (user ? 'Authenticated user' : t('settings.guestSubtitle') || (language === 'ur' ? 'غیر رجسٹرڈ' : 'Not signed in'));
  const displayPhone =
    profile?.phone_number ||
    user?.user_metadata?.phone_number ||
    user?.user_metadata?.phone ||
    user?.phone ||
    null;

  const isUserVerified = Boolean(
    profile?.is_verified || (user?.user_metadata as any)?.is_verified
  );

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FBFBFA] text-on-surface font-['Plus_Jakarta_Sans'] pb-32 sm:pb-36"
    >
      {/* 1. Universal Top Header (Adheres strictly to universal rules: Back Arrow on left, YAAD in center, Bell + Settings on right) */}
      <TopHeader
        title="YAAD"
        showBack={true}
        onBack={onBack}
        onSettingsClick={() => {}}
      />

      {/* 2. Hero Section: Centered Profile with soft shaded gradient backdrop (Screenshots 4 & 5) */}
      <div className="relative bg-gradient-to-b from-[#003527]/12 via-emerald-50/20 to-transparent pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 border-b border-neutral-200/50">
        <div className="max-w-md mx-auto text-center flex flex-col items-center">
          {/* Centered Avatar with Camera / Edit Pencil Badge */}
          <div className="relative inline-block mx-auto">
            <div className="p-1 rounded-full bg-white shadow-md ring-1 ring-neutral-200/60">
              <Avatar
                name={displayName}
                email={user?.email}
                avatarUrl={profile?.avatar_url}
                size="xl"
                className="w-24 h-24 sm:w-28 sm:h-28 ring-2 ring-emerald-500/20"
              />
            </div>
            <button
              id="change_avatar_btn"
              type="button"
              onClick={() => setShowAvatarPicker(true)}
              aria-label={t('settings.chooseAvatar') || 'Choose Avatar'}
              className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-8 h-8 rounded-full bg-[#003527] text-white flex items-center justify-center shadow-md hover:bg-[#002b1f] active:scale-95 transition-all ring-2 ring-white cursor-pointer"
              title="Change Avatar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Name with Verified Blue Tick Rosette Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-3.5">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
              {displayName}
            </h2>
            {isUserVerified && (
              <VerifiedBadge size="md" title="Official Verified Account" />
            )}
          </div>

          {/* Email or Phone Subtitle */}
          <div className="text-xs sm:text-sm text-neutral-500 font-medium mt-1 flex items-center justify-center gap-2">
            {displayPhone ? (
              <span dir="ltr" className="font-mono text-neutral-600">
                {formatPhoneNumber(displayPhone)}
              </span>
            ) : (
              <span className="truncate max-w-[260px]">{displayEmail}</span>
            )}
          </div>

          {/* Active Status Pill */}
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span>{t('settings.verified') || (language === 'ur' ? 'فعال اکاؤنٹ' : 'Active Account')}</span>
            </span>
          </div>

          {/* Quick Edit Action Buttons */}
          {user && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
              {!isEditingName && (
                <button
                  id="edit_name_toggle_btn"
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setFullNameInput(profile?.full_name || user?.user_metadata?.full_name || '');
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-neutral-200/90 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#003527]" />
                  <span>{t('settings.editName') || (language === 'ur' ? 'نام تبدیل کریں' : 'Edit Name')}</span>
                </button>
              )}

              {!isEditingPhone && (
                <button
                  id="edit_phone_toggle_btn"
                  type="button"
                  onClick={() => {
                    setIsEditingPhone(true);
                    setPhoneInput(displayPhone || '');
                    setPhoneError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-neutral-200/90 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#003527]" />
                  <span>
                    {displayPhone
                      ? (t('settings.editPhone') || (language === 'ur' ? 'فون تبدیل کریں' : 'Edit Phone'))
                      : (t('settings.addPhone') || (language === 'ur' ? 'فون شامل کریں' : 'Add Phone'))}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Inline Edit Name Form */}
          {isEditingName && (
            <form
              onSubmit={handleSaveName}
              className="w-full max-w-sm mt-4 p-4 bg-white rounded-2xl border border-emerald-500/30 shadow-sm space-y-3 animate-in fade-in duration-200 text-start"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="settings_input_full_name"
                  className="text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#003527]" />
                  <span>{t('settings.name') || (language === 'ur' ? 'مکمل نام' : 'Full Name')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('settings.cancel') || 'Cancel'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="settings_input_full_name"
                  type="text"
                  dir="auto"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder={t('settings.namePlaceholder') || 'Enter your full name'}
                  disabled={isSavingProfile}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]"
                />
                <button
                  id="save_name_btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl hover:bg-[#002b1f] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : t('settings.save') || 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* Inline Edit Phone Form */}
          {isEditingPhone && (
            <form
              onSubmit={handleSavePhone}
              className="w-full max-w-sm mt-4 p-4 bg-white rounded-2xl border border-emerald-500/30 shadow-sm space-y-3 animate-in fade-in duration-200 text-start"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="settings_input_phone"
                  className="text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#003527]" />
                  <span>{t('settings.phone') || (language === 'ur' ? 'فون نمبر' : 'Phone Number')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('settings.cancel') || 'Cancel'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="settings_input_phone"
                  type="tel"
                  dir="ltr"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="+92 300 1234567"
                  disabled={isSavingProfile}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]"
                />
                <button
                  id="save_phone_btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl hover:bg-[#002b1f] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : t('settings.save') || 'Save'}
                </button>
              </div>
              {phoneError && (
                <p className="text-[11px] text-rose-600 font-medium">{phoneError}</p>
              )}
            </form>
          )}

          {/* Feedback Toast Message */}
          {profileMessage && (
            <div
              className={`mt-3.5 p-3 rounded-2xl text-xs flex items-center gap-2 max-w-sm w-full ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="flex-1 font-medium">{profileMessage.text}</span>
            </div>
          )}

          {/* Guest User CTA */}
          {!user && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs max-w-sm w-full text-center">
              <p className="text-xs text-neutral-600">
                {language === 'ur'
                  ? 'اپنی خریداری کی تاریخ اور پرچیاں کلاؤڈ پر محفوظ کرنے کے لیے لاگ ان کریں۔'
                  : 'Sign in to sync your grocery lists and backup data.'}
              </p>
              <button
                type="button"
                onClick={() => onOpenAuth?.('signin')}
                className="mt-2.5 px-5 py-1.5 rounded-xl bg-[#003527] text-white text-xs font-bold hover:bg-[#002b1f] transition-all shadow-xs cursor-pointer"
              >
                {t('auth.signIn') || (language === 'ur' ? 'سائن ان' : 'Sign In')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Section Jump Pills (Order: General -> Appearance -> Preferences -> About -> Security) */}
      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200/60 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleJumpToSection('preferences')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'preferences' || activeSection === 'profile'
                ? 'bg-[#003527] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('settings.preferencesTitle') || (language === 'ur' ? 'عمومی و ترجیحات' : 'General')}</span>
          </button>

          <button
            onClick={() => handleJumpToSection('appearance')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'appearance'
                ? 'bg-[#003527] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'تھیم' : 'Appearance'}</span>
          </button>

          <button
            onClick={() => handleJumpToSection('about')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'about'
                ? 'bg-[#003527] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('settings.aboutYaad') || (language === 'ur' ? 'معلومات و سپورٹ' : 'About & Support')}</span>
          </button>

          {user && (
            <button
              onClick={() => handleJumpToSection('security')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'security'
                  ? 'bg-[#003527] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی' : 'Security')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Grouped iOS-style Inset Cards (Matching Screenshots 4 & 5) */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* GROUP 1: General & Preferences (Screenshot 4) */}
        <div id="settings_section_preferences" className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 px-3 font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'عمومی ترجیحات' : 'General'}
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <PreferencesSection
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onLanguageSelect={handleLanguageSelect}
            />
          </div>
        </div>

        {/* GROUP 2: Appearance & Theme */}
        <div id="settings_section_appearance" className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 px-3 font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'ظاہری شکل و تھیم' : 'Appearance & Theme'}
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <AppearanceSection />
          </div>
        </div>

        {/* GROUP 3: Security & Passwords */}
        {user && (
          <div id="settings_section_security" className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 px-3 font-['Plus_Jakarta_Sans']">
              {language === 'ur' ? 'سیکیورٹی و پاس ورڈ' : 'Security'}
            </h3>
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <SecuritySection
                isChangingPassword={isChangingPassword}
                setIsChangingPassword={setIsChangingPassword}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isUpdatingPassword={isUpdatingPassword}
                passwordMessage={passwordMessage}
                setPasswordMessage={setPasswordMessage}
                onUpdatePassword={handleUpdatePassword}
                onRequestSignOut={() => setShowSignOutConfirm(true)}
              />
            </div>
          </div>
        )}

        {/* GROUP 4: About & Legal */}
        <div id="settings_section_about" className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 px-3 font-['Plus_Jakarta_Sans']">
            {language === 'ur' ? 'یاد کے بارے میں و سپورٹ' : 'About & Legal'}
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <AboutSection
              onOpenModal={(type) => setActiveLegalModal(type)}
              onOpenLegalPage={onOpenLegalPage}
            />
          </div>
        </div>

        {/* 5. Bottom Distinctive Outline "SIGN OUT" Pill Button (Screenshot 5) */}
        {user && (
          <div className="pt-6 pb-6 flex flex-col items-center justify-center gap-2">
            <button
              id="settings_bottom_signout_btn"
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="w-48 py-2.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 text-neutral-800 font-bold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer text-center"
            >
              {t('auth.signOut') || (language === 'ur' ? 'سائن آؤٹ' : 'SIGN OUT')}
            </button>
            <p className="text-[11px] text-neutral-400">
              {language === 'ur' ? 'یاد ورژن 1.0.0 (پروڈکشن)' : 'YAAD Version 1.0.0 (Production)'}
            </p>
          </div>
        )}
      </main>

      {/* MODAL 1: Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarUrl={profile?.avatar_url}
        onSave={handleSelectAvatar}
        userName={displayName}
        userEmail={user?.email}
      />

      {/* MODAL 2: Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
      />

      {/* MODAL 3: In-App Legal / Help Viewer Sheet */}
      <LegalDocModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
