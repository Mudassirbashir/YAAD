import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Palette,
  SlidersHorizontal,
  Compass,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { AvatarPickerModal } from './AvatarPickerModal';
import { ProfileSection } from './settings/ProfileSection';
import { AppearanceSection } from './settings/AppearanceSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { SecuritySection } from './settings/SecuritySection';
import { AboutSection } from './settings/AboutSection';
import { SignOutConfirmModal } from './settings/SignOutConfirmModal';
import { LegalDocModal } from './settings/LegalDocModal';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
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

      osc2.frequency.setValueAtTime(261.63, now);
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

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
        text: language === 'ur'
          ? 'آپ آف لائن ہیں۔ پاس ورڈ تبدیل کرنے کے لیے انٹرنیٹ سے جڑیں۔'
          : "You're offline. Please reconnect to change your password.",
      });
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordMessage({
        type: 'error',
        text: t('settings.enterCurrentPassword') ||
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

    if (currentPassword === newPassword) {
      setPasswordMessage({
        type: 'error',
        text:
          t('settings.samePasswordError') ||
          (language === 'ur' ? 'نیا پاس ورڈ پرانے سے مختلف ہونا چاہیے۔' : 'New password cannot be the same as your current password.'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: t('settings.passwordMismatch') ||
          (language === 'ur' ? 'پاس ورڈ کی تصدیق مماثل نہیں ہے۔' : 'Passwords do not match.'),
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

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] pb-32 sm:pb-36"
    >
      {/* Top Navigation Bar */}
      <header
        id="settings_header"
        className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-dim px-4 sm:px-6 lg:px-8 py-3.5 transition-colors"
      >
        <div className="max-w-3xl lg:max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="settings_back_btn"
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
            </button>
            <div>
              <h1 className={`text-xl font-bold text-on-surface tracking-tight leading-tight ${language === 'ur' ? 'font-urdu' : "font-['Manrope']"}`}>
                {t('settings.title') || (language === 'ur' ? 'ترتیبات' : 'Settings')}
              </h1>
              <p className="text-xs text-outline font-medium">
                {t('settings.subtitle') ||
                  (language === 'ur' ? 'پروفائل، اپیرنس، ترجیحات و سیکیورٹی' : 'Profile, Appearance & Security')}
              </p>
            </div>
          </div>

          <button
            id="settings_done_btn"
            onClick={onBack}
            className="px-4 py-1.5 text-xs sm:text-sm font-bold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 rounded-full transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('settings.done') || (language === 'ur' ? 'مکمل' : 'Done')}</span>
          </button>
        </div>

        {/* Section Jump Pills (Order: Profile -> Appearance -> Preferences -> About -> Security at the end) */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {/* 1. Profile Pill */}
          <button
            id="settings_jump_profile"
            onClick={() => handleJumpToSection('profile')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'profile'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('settings.profile') || (language === 'ur' ? 'پروفائل' : 'Profile')}</span>
          </button>

          {/* 2. Appearance Pill */}
          <button
            id="settings_jump_appearance"
            onClick={() => handleJumpToSection('appearance')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'appearance'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>
              {language === 'ur'
                ? 'اپیرنس اور تھیم'
                : language === 'roman-urdu'
                ? 'Appearance & Theme'
                : 'Appearance'}
            </span>
          </button>

          {/* 3. Preferences Pill */}
          <button
            id="settings_jump_preferences"
            onClick={() => handleJumpToSection('preferences')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'preferences' || activeSection === 'language'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('settings.preferencesTitle') || (language === 'ur' ? 'ترجیحات' : 'Preferences')}</span>
          </button>

          {/* 4. About Pill */}
          <button
            id="settings_jump_about"
            onClick={() => handleJumpToSection('about')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'about'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('settings.aboutYaad') || (language === 'ur' ? 'یاد کے بارے میں' : 'About')}</span>
          </button>

          {/* 5. Security Pill (At the very end!) */}
          {user && (
            <button
              id="settings_jump_security"
              onClick={() => handleJumpToSection('security')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'security'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('settings.securityTitle') || (language === 'ur' ? 'سیکیورٹی و سائن آؤٹ' : 'Security')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Sections Container */}
      <main className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Profile & Account Section */}
        <div id="settings_section_profile">
          <ProfileSection
            user={user}
            profile={profile}
            displayName={displayName}
            displayEmail={displayEmail}
            displayPhone={displayPhone}
            isEditingName={isEditingName}
            fullNameInput={fullNameInput}
            setFullNameInput={setFullNameInput}
            isEditingPhone={isEditingPhone}
            phoneInput={phoneInput}
            setPhoneInput={setPhoneInput}
            phoneError={phoneError}
            isSavingProfile={isSavingProfile}
            profileMessage={profileMessage}
            onSaveName={handleSaveName}
            onSavePhone={handleSavePhone}
            onStartEditName={() => {
              setIsEditingName(true);
              setFullNameInput(
                profile?.full_name || user?.user_metadata?.full_name || '',
              );
            }}
            onCancelEditName={() => setIsEditingName(false)}
            onStartEditPhone={() => {
              setIsEditingPhone(true);
              setPhoneInput(displayPhone || '');
              setPhoneError(null);
            }}
            onCancelEditPhone={() => setIsEditingPhone(false)}
            onOpenAvatarPicker={() => setShowAvatarPicker(true)}
            onOpenAuth={onOpenAuth}
          />
        </div>

        {/* 2. Appearance & Pre-installed Themes Section (NEW) */}
        <div id="settings_section_appearance">
          <AppearanceSection />
        </div>

        {/* 3. Preferences Section (Language & Sound) */}
        <div id="settings_section_preferences">
          <PreferencesSection
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onLanguageSelect={handleLanguageSelect}
          />
        </div>

        {/* 4. About & Legal Section */}
        <div id="settings_section_about">
          <AboutSection
            onOpenModal={(type) => setActiveLegalModal(type)}
            onOpenLegalPage={onOpenLegalPage}
          />
        </div>

        {/* 5. Security & Sign Out Section (PLACED AT THE VERY END AS REQUESTED) */}
        {user && (
          <div id="settings_section_security">
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
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: Avatar Picker Modal */}
      {/* ==================================================================== */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarUrl={profile?.avatar_url}
        onSave={handleSelectAvatar}
        userName={displayName}
        userEmail={user?.email}
      />

      {/* ==================================================================== */}
      {/* MODAL 2: Sign Out Confirmation Modal */}
      {/* ==================================================================== */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
      />

      {/* ==================================================================== */}
      {/* MODAL 3: In-App Legal / Help Viewer Sheet */}
      {/* ==================================================================== */}
      <LegalDocModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
};
