import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  LogOut,
  Check,
  CheckCircle2,
  AlertCircle,
  Globe,
  Camera,
  Edit2,
  X,
  Play,
  Compass,
  Info,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { Avatar } from './Avatar';
import { AvatarPickerModal } from './AvatarPickerModal';

interface SettingsViewProps {
  onBack: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onRestartTour?: () => void;
  onReplayOnboarding?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onOpenAuth,
  onRestartTour,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, profile, updateUserProfile, updatePassword } = useAuth();

  // Local state for Name Editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Avatar Picker Modal
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Sound Effects State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yaad_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sign out confirmation
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // About modals (Privacy, Terms, Help)
  const [activeModal, setActiveModal] = useState<
    'privacy' | 'terms' | 'help' | null
  >(null);

  // Initialize Name from Profile/User
  useEffect(() => {
    if (profile?.full_name) {
      setFullNameInput(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullNameInput(user.user_metadata.full_name);
    } else {
      setFullNameInput('');
    }
  }, [profile, user]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAvatarPicker) setShowAvatarPicker(false);
        if (showSignOutConfirm && !isSigningOut) setShowSignOutConfirm(false);
        if (isEditingName) setIsEditingName(false);
        if (activeModal) setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showAvatarPicker,
    showSignOutConfirm,
    isEditingName,
    isSigningOut,
    activeModal,
  ]);

  // Play a synthesized audio chime for preview
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

  // Language Change Handler
  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang);
    if (user) {
      await updateUserProfile({ language: lang });
    }
  };

  // Save Name
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
        text: t('settings.saved') || 'Saved successfully',
      });
      setIsEditingName(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Select Avatar (Emoji or Initials)
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
        text: t('settings.avatarUpdated') || t('settings.saved'),
      });
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text:
          t('settings.passwordTooShort') ||
          'Password must be at least 6 characters.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: t('settings.passwordMismatch') || 'Passwords do not match.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const { error } = await updatePassword(newPassword);

    setIsUpdatingPassword(false);

    if (error) {
      setPasswordMessage({
        type: 'error',
        text: error.message || 'Unable to update password.',
      });
    } else {
      setPasswordMessage({
        type: 'success',
        text:
          t('settings.passwordUpdated') || 'Password updated successfully!',
      });
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPasswordMessage(null), 4000);
    }
  };

  // Handle Sign Out confirmation
  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user ? 'Account User' : t('settings.guestUser'));
  const displayEmail =
    user?.email || (user ? 'Authenticated user' : t('settings.guestSubtitle'));

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] pb-28"
    >
      {/* Top Navigation Bar */}
      <header
        id="settings_header"
        className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-dim px-4 sm:px-6 lg:px-8 py-3.5 transition-colors"
      >
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="settings_back_btn"
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
            </button>
            <div>
              <h1 className="text-xl font-bold font-['Manrope'] text-on-surface tracking-tight">
                {t('settings.title') || 'Settings'}
              </h1>
              <p className="text-xs text-outline font-medium">
                {t('settings.subtitle') || 'Preferences & Profile'}
              </p>
            </div>
          </div>

          <button
            id="settings_done_btn"
            onClick={onBack}
            className="px-4 py-1.5 text-sm font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 rounded-full transition-colors active:scale-95"
          >
            {t('settings.done') || 'Done'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-9">
        {/* Profile/Save Message Alert */}
        {profileMessage && (
          <div
            id="settings_profile_msg"
            className={`p-3.5 rounded-2xl text-sm flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              profileMessage.type === 'success'
                ? 'bg-secondary-fixed/50 text-on-secondary-fixed font-semibold border border-secondary-fixed'
                : 'bg-error-container text-on-error-container border border-error/20'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-error" />
            )}
            <span className="flex-1">{profileMessage.text}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION 1: ACCOUNT & PROFILE CARD */}
        {/* ==================================================================== */}
        <section id="settings_account_section" className="space-y-3 sm:space-y-3.5">
          <div
            id="settings_account_header"
            className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </div>
              <h2
                className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
                  language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
                }`}
              >
                {t('settings.accountTitle') || 'Account'}
              </h2>
            </div>
          </div>

          <div
            id="settings_profile_card"
            className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5"
          >
            {user ? (
              <>
                {/* Profile Header & Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative group shrink-0">
                    <Avatar
                      name={displayName}
                      email={user.email}
                      avatarUrl={profile?.avatar_url}
                      size="xl"
                      className="ring-4 ring-primary-fixed/30 shadow-md"
                    />
                    <button
                      id="change_avatar_btn"
                      onClick={() => setShowAvatarPicker(true)}
                      aria-label={t('settings.chooseAvatar') || 'Choose Avatar'}
                      className="absolute bottom-0 end-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-90"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-start space-y-1 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                        {displayName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed/50 text-primary">
                        <Check className="w-3 h-3" />
                        {t('settings.verified') || 'Active Account'}
                      </span>
                    </div>

                    <p className="text-sm text-outline flex items-center justify-center sm:justify-start gap-1.5 font-['Plus_Jakarta_Sans']">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[280px]">
                        {displayEmail}
                      </span>
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {!isEditingName ? (
                        <button
                          id="edit_name_toggle_btn"
                          onClick={() => {
                            setIsEditingName(true);
                            setFullNameInput(
                              profile?.full_name ||
                                user?.user_metadata?.full_name ||
                                '',
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors active:scale-95"
                        >
                          <Edit2 className="w-3 h-3" />
                          {t('settings.editName') || 'Edit Name'}
                        </button>
                      ) : null}

                      <button
                        id="open_avatar_picker_btn"
                        onClick={() => setShowAvatarPicker(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors active:scale-95"
                      >
                        <Camera className="w-3 h-3" />
                        <span id="settings_avatar_btn">
                          {t('settings.chooseAvatar') || 'Choose Avatar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Name Inline Form */}
                {isEditingName && (
                  <form
                    onSubmit={handleSaveName}
                    className="p-4 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3 animate-in fade-in duration-200"
                  >
                    <label className="block text-xs font-bold text-on-surface-variant">
                      {t('settings.name') || 'Full Name'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        dir="auto"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder={
                          t('settings.namePlaceholder') || 'Enter your name'
                        }
                        className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-4 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 active:scale-95"
                      >
                        {isSavingProfile
                          ? t('settings.saving') || 'Saving...'
                          : t('settings.saveName') || 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-3 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low rounded-xl transition-colors"
                      >
                        {t('settings.cancel') || 'Cancel'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              /* Guest State */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                      {t('settings.guestUser') || 'Guest User'}
                    </h3>
                    <p className="text-xs text-outline">
                      {t('settings.guestSubtitle') ||
                        'Sign in to sync your shopping lists across devices.'}
                    </p>
                  </div>
                </div>

                {onOpenAuth && (
                  <button
                    id="guest_signin_btn"
                    onClick={() => onOpenAuth('signin')}
                    className="px-5 py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-sm transition-all active:scale-95 shrink-0"
                  >
                    {t('settings.signIn') || 'Sign In'}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: PREFERENCES (Language, Sound Effects, Product Tour) */}
        {/* ==================================================================== */}
        <section id="settings_preferences_section" className="space-y-3 sm:space-y-3.5">
          <div
            id="settings_preferences_header"
            className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
                <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </div>
              <h2
                className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
                  language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
                }`}
              >
                {t('settings.preferencesTitle') || 'Preferences'}
              </h2>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-6">
            {/* Language Selector */}
            <div id="settings_language_section" className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-outline">
                {t('settings.language') || 'Language'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. English */}
                <button
                  id="lang_opt_en"
                  type="button"
                  onClick={() => handleLanguageSelect('en')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between active:scale-98 ${
                    language === 'en'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold font-['Manrope']">
                      {t('settings.languageEn') || 'English'}
                    </span>
                    <span className="block text-xs text-outline mt-0.5">
                      {t('settings.languageEnSub') || 'English (US)'}
                    </span>
                  </div>
                  {language === 'en' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* 2. Roman Urdu */}
                <button
                  id="lang_opt_roman"
                  type="button"
                  onClick={() => handleLanguageSelect('roman-urdu')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between active:scale-98 ${
                    language === 'roman-urdu'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold font-['Manrope']">
                      {t('settings.languageRomanUrdu') || 'Roman Urdu'}
                    </span>
                    <span className="block text-xs text-outline mt-0.5">
                      {t('settings.languageRomanUrduSub') || 'Aasan Roman Urdu'}
                    </span>
                  </div>
                  {language === 'roman-urdu' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* 3. Urdu (Authentic Noto Nastaliq Urdu) */}
                <button
                  id="lang_opt_ur"
                  type="button"
                  onClick={() => handleLanguageSelect('ur')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between active:scale-98 ${
                    language === 'ur'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-base font-bold font-urdu leading-relaxed">
                      {t('settings.languageUrdu') || 'اردو'}
                    </span>
                    <span className="block text-xs text-outline font-urdu mt-0.5">
                      {t('settings.languageUrduSub') || 'آسان اردو'}
                    </span>
                  </div>
                  {language === 'ur' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Sound Chime Toggle */}
            <div className="pt-3 border-t border-surface-dim flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-['Manrope']">
                    {t('settings.soundTitle') || 'Sound Effects'}
                  </h3>
                  <p className="text-xs text-outline">
                    {t('settings.soundDesc') ||
                      'Play a cheerful chime when completing a shopping trip'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={playPreviewChime}
                  className="px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary-fixed/30 rounded-xl transition-colors inline-flex items-center gap-1 active:scale-95"
                  title={t('settings.testSound') || 'Test Sound'}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">
                    {t('settings.testSound') || 'Test Sound'}
                  </span>
                </button>

                <button
                  id="sound_toggle_btn"
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  onClick={handleToggleSound}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    soundEnabled ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      soundEnabled
                        ? isRTL
                          ? '-translate-x-5'
                          : 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Product Tour Replay */}
            <div className="pt-3 border-t border-surface-dim flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-['Manrope']">
                    {t('settings.restartTourTitle') ||
                      t('tour.replayTour') ||
                      'Restart Product Tour'}
                  </h3>
                  <p className="text-xs text-outline">
                    {t('settings.restartTourDesc') ||
                      t('tour.replayTourDesc') ||
                      'Replay the interactive walkthrough for all features'}
                  </p>
                </div>
              </div>

              {onRestartTour && (
                <button
                  id="settings_restart_tour_btn"
                  type="button"
                  onClick={onRestartTour}
                  className="px-4 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-['Manrope'] text-xs font-bold transition-all border border-surface-dim active:scale-95 flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {t('settings.restartTourBtn') ||
                      t('tour.replayTour') ||
                      'Start Tour'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: ACCOUNT SECURITY (Change Password & Sign Out) */}
        {/* ==================================================================== */}
        {user && (
          <section id="settings_security_section" className="space-y-3 sm:space-y-3.5">
            <div
              id="settings_security_header"
              className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
                  <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                </div>
                <h2
                  className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
                    language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
                  }`}
                >
                  {t('settings.securityTitle') || 'Security'}
                </h2>
              </div>
            </div>

            <div
              id="settings_security_card"
              className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5"
            >
              {/* Change Password Trigger & Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {t('settings.changePassword') || 'Change Password'}
                      </h3>
                      <p className="text-xs text-outline">
                        {isChangingPassword
                          ? t('settings.newPasswordPlaceholder') ||
                            'Enter new password (min 6 chars)'
                          : t('settings.changePasswordDesc') ||
                            'Update your account password with strong security'}
                      </p>
                    </div>
                  </div>

                  <button
                    id="toggle_change_password_btn"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setPasswordMessage(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors active:scale-95 shrink-0"
                  >
                    {isChangingPassword
                      ? t('settings.cancel') || 'Cancel'
                      : t('settings.changePassword') || 'Change'}
                  </button>
                </div>

                {/* Inline Change Password Form */}
                {isChangingPassword && (
                  <form
                    onSubmit={handleUpdatePassword}
                    className="p-4 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3.5 animate-in fade-in duration-200"
                  >
                    {passwordMessage && (
                      <div
                        className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                          passwordMessage.type === 'success'
                            ? 'bg-secondary-fixed/50 text-primary font-bold'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {passwordMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
                        )}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">
                        {t('settings.newPassword') || 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={
                            t('settings.newPasswordPlaceholder') ||
                            'Enter new password (min 6 chars)'
                          }
                          className="w-full px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 pe-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 end-3 flex items-center text-outline hover:text-on-surface"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">
                        {t('settings.confirmPassword') || 'Confirm Password'}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={
                          t('settings.confirmPasswordPlaceholder') ||
                          'Re-enter new password'
                        }
                        className="w-full px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-outline hover:text-on-surface rounded-xl transition-colors"
                      >
                        {t('settings.cancel') || 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isUpdatingPassword
                          ? t('settings.saving') || 'Saving...'
                          : t('settings.updatePasswordBtn') ||
                            'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sign Out Trigger */}
              <div className="pt-3 border-t border-surface-dim flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-error-container/20 text-error flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-on-surface truncate">
                      {t('settings.signOut') || 'Sign Out'}
                    </h3>
                    <p className="text-xs text-outline truncate">
                      {t('settings.signOutDesc') ||
                        'Sign out of your account on this device'}
                    </p>
                  </div>
                </div>

                <button
                  id="settings_signout_btn"
                  type="button"
                  onClick={() => setShowSignOutConfirm(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-error bg-error-container/25 hover:bg-error-container/45 rounded-xl sm:rounded-full transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                >
                  <span id="sign_out_trigger_btn">
                    {t('settings.signOut') || 'Sign Out'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* SECTION 4: ABOUT & LEGAL INFORMATION */}
        {/* ==================================================================== */}
        <section id="settings_about_section" className="space-y-3 sm:space-y-3.5">
          <div
            id="settings_about_header"
            className="flex items-center justify-between px-1 sm:px-1.5 pb-0.5"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
                <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </div>
              <h2
                className={`text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight ${
                  language === 'ur' ? 'font-urdu text-lg sm:text-xl' : "font-['Manrope']"
                }`}
              >
                {t('settings.aboutTitle') || 'About'}
              </h2>
            </div>
          </div>

          <div
            id="settings_about_card"
            className="bg-surface rounded-3xl border border-surface-dim shadow-xs divide-y divide-surface-dim overflow-hidden"
          >
            {/* About YAAD row */}
            <div className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-bold text-on-surface font-['Manrope']">
                  {t('settings.aboutYaad') || 'About YAAD'}
                </h3>
                <p className="text-xs text-outline leading-relaxed">
                  {t('settings.aboutYaadDesc') ||
                    'YAAD is a minimalist, smart shopping memory app built to organize grocery lists effortlessly.'}
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            <button
              id="settings_privacy_btn"
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-surface-container-lowest/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-outline flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">
                    {t('settings.privacyPolicy') || 'Privacy Policy'}
                  </h4>
                  <p className="text-xs text-outline">
                    {t('settings.privacyPolicyDesc') ||
                      'Your personal list data is securely encrypted.'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline shrink-0" />
            </button>

            {/* Terms of Service */}
            <button
              id="settings_terms_btn"
              type="button"
              onClick={() => setActiveModal('terms')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-surface-container-lowest/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-outline flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">
                    {t('settings.termsOfService') || 'Terms of Service'}
                  </h4>
                  <p className="text-xs text-outline">
                    {t('settings.termsOfServiceDesc') ||
                      'Simple, fair terms to help you organize shopping safely.'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline shrink-0" />
            </button>

            {/* Help & Support */}
            <button
              id="settings_help_btn"
              type="button"
              onClick={() => setActiveModal('help')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start hover:bg-surface-container-lowest/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container text-outline flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">
                    {t('settings.helpSupport') || 'Help & Support'}
                  </h4>
                  <p className="text-xs text-outline">
                    {t('settings.helpSupportDesc') ||
                      'Need help or have suggestions? Reach out to our team anytime.'}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-outline shrink-0" />
            </button>
          </div>
        </section>

        {/* Footer: Version & Brand */}
        <footer className="pt-2 text-center space-y-1.5 text-xs text-outline">
          <p className="font-semibold text-on-surface-variant font-['Manrope']">
            {t('settings.footerTagline') || 'Simple Shopping Memory'}
          </p>
          <p className="text-outline/70">
            {t('settings.footerVersion') ||
              t('settings.appVersion') ||
              'YAAD v2.0.0'}
          </p>
        </footer>
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: Emoji & Custom Avatar Picker */}
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
      {/* MODAL 2: Sign Out Confirmation */}
      {/* ==================================================================== */}
      {showSignOutConfirm && (
        <div
          onClick={() => !isSigningOut && setShowSignOutConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                {t('settings.signOut') || 'Sign Out'}
              </h3>
              <p className="text-xs text-outline">
                {t('settings.signOutConfirm') ||
                  'Are you sure you want to sign out?'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 py-2.5 text-xs font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors active:scale-95"
              >
                {t('settings.cancel') || 'Cancel'}
              </button>
              <button
                id="confirm_sign_out_btn"
                type="button"
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="flex-1 py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl transition-colors disabled:opacity-50 active:scale-95"
              >
                {isSigningOut
                  ? t('settings.saving') || 'Saving...'
                  : t('settings.signOut') || 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: Privacy, Terms, Help Sheet */}
      {/* ==================================================================== */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-2xl border border-surface-dim space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                {activeModal === 'privacy' &&
                  (t('settings.privacyPolicy') || 'Privacy Policy')}
                {activeModal === 'terms' &&
                  (t('settings.termsOfService') || 'Terms of Service')}
                {activeModal === 'help' &&
                  (t('settings.helpSupport') || 'Help & Support')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-on-surface-variant space-y-3 leading-relaxed max-h-72 overflow-y-auto pr-1">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    At YAAD, your privacy is a foundational priority. We never
                    sell or monetize your shopping lists, personal notes, or
                    grocery routines.
                  </p>
                  <p>
                    All synchronization is powered by encrypted database
                    connections via Supabase. When using YAAD offline or as a
                    PWA, your lists reside locally on your device storage.
                  </p>
                  <p>
                    You remain in full control of your account credentials and
                    personal details at all times.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    Welcome to YAAD. By using this service, you agree to simple,
                    fair terms designed to provide a pleasant, reliable shopping
                    assistant.
                  </p>
                  <p>
                    YAAD is provided for personal grocery and shopping list
                    management. Content is preserved to help you plan and
                    execute daily errands efficiently.
                  </p>
                  <p>
                    We continually improve the application with new features and
                    optimizations for bilingual shopping experiences in English,
                    Roman Urdu, and Urdu.
                  </p>
                </>
              )}

              {activeModal === 'help' && (
                <>
                  <p>
                    Have questions about YAAD, suggestions for new grocery items,
                    or need assistance with your account?
                  </p>
                  <div className="p-3 bg-surface-container-lowest rounded-2xl border border-surface-dim space-y-1">
                    <span className="text-xs font-bold uppercase text-outline">
                      Direct Email Support
                    </span>
                    <a
                      id="settings_support_email_link"
                      href={`mailto:${t('settings.supportEmail') || 'useyaadapp@gmail.com'}`}
                      className="block text-primary font-bold hover:underline break-all"
                    >
                      {t('settings.supportEmail') || 'useyaadapp@gmail.com'}
                    </a>
                  </div>
                  <p className="text-xs text-outline">
                    Our team typically responds within 24 hours. We welcome
                    feedback on Urdu localization and Pakistani grocery staples!
                  </p>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl transition-colors active:scale-95"
              >
                {t('settings.done') || 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
