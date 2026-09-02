import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  LogOut,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  Camera,
  Edit2,
  X,
  Play,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { Avatar } from './Avatar';
import { checkPasskeySupport, PasskeySupportStatus } from '../lib/passkey';

// Preset avatar options
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

interface SettingsViewProps {
  onBack: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onRestartTour?: () => void;
  onReplayOnboarding?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onDeleteAccount,
  onOpenAuth,
  onRestartTour,
  onReplayOnboarding,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const {
    user,
    profile,
    updateUserProfile,
    updatePassword,
    signInWithGoogle,
    registerDevicePasskey,
    hasPasskey,
  } = useAuth();

  // Local state for Name Editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Passkey State
  const [passkeyStatus, setPasskeyStatus] = useState<PasskeySupportStatus | null>(null);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sign out & Account Deletion confirmation
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  // Check Passkey support on mount
  useEffect(() => {
    checkPasskeySupport().then((status) => {
      setPasskeyStatus(status);
    });
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAvatarPicker) setShowAvatarPicker(false);
        if (showSignOutConfirm && !isSigningOut) setShowSignOutConfirm(false);
        if (showDeleteConfirm && !isDeleting) setShowDeleteConfirm(false);
        if (isEditingName) setIsEditingName(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAvatarPicker, showSignOutConfirm, showDeleteConfirm, isEditingName, isSigningOut, isDeleting]);

  // Play a simple synthesized audio chime for preview
  const playPreviewChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      setProfileMessage({ type: 'error', text: t('profileSetup.nameRequired') });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    const { error } = await updateUserProfile({
      full_name: fullNameInput.trim(),
    });

    setIsSavingProfile(false);

    if (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Unable to update profile' });
    } else {
      setProfileMessage({ type: 'success', text: t('settings.saved') });
      setIsEditingName(false);
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Select Avatar Preset
  const handleSelectAvatar = async (url: string | null) => {
    if (!user) return;
    setIsSavingProfile(true);
    setShowAvatarPicker(false);

    const { error } = await updateUserProfile({
      avatar_url: url || undefined,
    });

    setIsSavingProfile(false);

    if (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Unable to update avatar' });
    } else {
      setProfileMessage({ type: 'success', text: t('settings.saved') });
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t('settings.passwordTooShort') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('settings.passwordMismatch') });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const { error } = await updatePassword(newPassword);

    setIsUpdatingPassword(false);

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Unable to update password.' });
    } else {
      setPasswordMessage({ type: 'success', text: t('settings.passwordUpdated') });
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPasswordMessage(null), 4000);
    }
  };

  // Handle Google OAuth Link/SignIn
  const handleGoogleConnect = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.warn('Google sign-in error:', e);
    }
  };

  // Handle Passkey Registration
  const handleRegisterPasskey = async () => {
    if (!user?.email) return;
    setIsRegisteringPasskey(true);
    setPasskeyMsg(null);

    const name = profile?.full_name || user?.user_metadata?.full_name || 'YAAD User';
    const { error } = await registerDevicePasskey(user.email, name);

    setIsRegisteringPasskey(false);

    if (error) {
      setPasskeyMsg({ type: 'error', text: error.message || 'Failed to register passkey.' });
    } else {
      setPasskeyMsg({ type: 'success', text: t('settings.passkeySuccess') });
      setTimeout(() => setPasskeyMsg(null), 4000);
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

  // Handle Account Deletion
  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || (user ? 'Account User' : t('settings.guestUser'));
  const displayEmail = user?.email || (user ? 'Authenticated user' : t('settings.guestSubtitle'));
  const isGoogleUser = user?.app_metadata?.provider === 'google' || user?.user_metadata?.iss?.includes('google');
  const userHasPasskey = user?.email ? hasPasskey(user.email) : false;

  return (
    <div
      id="settings_screen_container"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface-container-lowest text-on-surface font-['Plus_Jakarta_Sans'] pb-28"
    >
      {/* Top App Bar */}
      <header
        id="settings_header"
        className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-dim px-4 sm:px-6 py-3.5 transition-colors"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="settings_back_btn"
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl font-bold font-['Manrope'] text-on-surface tracking-tight">
                {t('settings.title')}
              </h1>
              <p className="text-xs text-outline font-medium">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>

          <button
            id="settings_done_btn"
            onClick={onBack}
            className="px-4 py-1.5 text-sm font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 rounded-full transition-colors active:scale-95"
          >
            {t('settings.done')}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Global Feedback Banner */}
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
        {/* SECTION 1: ACCOUNT */}
        {/* ==================================================================== */}
        <section id="settings_account_section" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-outline">
              {t('settings.accountTitle')}
            </h2>
          </div>

          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5">
            {user ? (
              <>
                {/* Profile Header & Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative group">
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
                      aria-label={t('settings.chooseAvatar')}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-90"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-start space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                        {displayName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed/50 text-primary">
                        <Check className="w-3 h-3" />
                        {t('settings.verified')}
                      </span>
                    </div>

                    <p className="text-sm text-outline flex items-center justify-center sm:justify-start gap-1.5 font-['Plus_Jakarta_Sans']">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{displayEmail}</span>
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {!isEditingName ? (
                        <button
                          id="edit_name_toggle_btn"
                          onClick={() => {
                            setIsEditingName(true);
                            setFullNameInput(profile?.full_name || user?.user_metadata?.full_name || '');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          {t('settings.editName')}
                        </button>
                      ) : null}

                      <button
                        id="open_avatar_picker_btn"
                        onClick={() => setShowAvatarPicker(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        {t('settings.chooseAvatar')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Name Form */}
                {isEditingName && (
                  <form
                    onSubmit={handleSaveName}
                    className="p-4 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3 animate-in fade-in duration-200"
                  >
                    <label className="block text-xs font-bold text-on-surface-variant">
                      {t('settings.name')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder={t('settings.namePlaceholder')}
                        className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-4 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSavingProfile ? t('settings.saving') : t('settings.saveName')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-3 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low rounded-xl transition-colors"
                      >
                        {t('settings.cancel')}
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
                      {t('settings.guestUser')}
                    </h3>
                    <p className="text-xs text-outline">
                      {t('settings.guestSubtitle')}
                    </p>
                  </div>
                </div>

                {onOpenAuth && (
                  <button
                    id="guest_signin_btn"
                    onClick={() => onOpenAuth('signin')}
                    className="px-5 py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-sm transition-all active:scale-95 shrink-0"
                  >
                    {t('settings.signIn')}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: PREFERENCES (Language, Audio Chime) */}
        {/* ==================================================================== */}
        <section id="settings_preferences_section" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-outline">
              {t('settings.preferencesTitle')}
            </h2>
          </div>

          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-6">
            {/* Language Selector Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-outline">
                {t('settings.language')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. English */}
                <button
                  id="lang_opt_en"
                  type="button"
                  onClick={() => handleLanguageSelect('en')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between ${
                    language === 'en'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold font-['Manrope']">
                      {t('settings.languageEn')}
                    </span>
                    <span className="block text-xs text-outline mt-0.5">
                      {t('settings.languageEnSub')}
                    </span>
                  </div>
                  {language === 'en' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* 2. Roman Urdu */}
                <button
                  id="lang_opt_roman"
                  type="button"
                  onClick={() => handleLanguageSelect('roman-urdu')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between ${
                    language === 'roman-urdu'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold font-['Manrope']">
                      {t('settings.languageRomanUrdu')}
                    </span>
                    <span className="block text-xs text-outline mt-0.5">
                      {t('settings.languageRomanUrduSub')}
                    </span>
                  </div>
                  {language === 'roman-urdu' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* 3. Urdu */}
                <button
                  id="lang_opt_ur"
                  type="button"
                  onClick={() => handleLanguageSelect('ur')}
                  className={`p-3.5 rounded-2xl text-start transition-all border flex items-center justify-between ${
                    language === 'ur'
                      ? 'bg-primary-fixed/30 border-primary text-primary shadow-xs ring-2 ring-primary/20'
                      : 'bg-surface-container-lowest border-surface-dim text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div>
                    <span className="block text-base font-bold font-['Noto_Nastaliq_Urdu',sans-serif]">
                      {t('settings.languageUrdu')}
                    </span>
                    <span className="block text-xs text-outline mt-0.5">
                      {t('settings.languageUrduSub')}
                    </span>
                  </div>
                  {language === 'ur' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Sound Chime Toggle */}
            <div className="pt-2 border-t border-surface-dim flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-['Manrope']">
                    {t('settings.soundTitle')}
                  </h3>
                  <p className="text-xs text-outline">
                    {t('settings.soundDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={playPreviewChime}
                  className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-fixed/30 rounded-xl transition-colors inline-flex items-center gap-1"
                  title={t('settings.testSound')}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">{t('settings.testSound')}</span>
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
                      soundEnabled ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Product Tour & Tutorial Replay */}
            <div className="pt-3 border-t border-surface-dim flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-secondary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-['Manrope']">
                    {t('tour.replayTour')}
                  </h3>
                  <p className="text-xs text-outline">
                    {t('tour.replayTourDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onRestartTour && (
                  <button
                    id="settings_restart_tour_btn"
                    type="button"
                    onClick={onRestartTour}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-['Manrope'] text-xs font-bold transition-all border border-surface-dim active:scale-95 flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('tour.replayTour')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: ACCOUNT SECURITY */}
        {/* ==================================================================== */}
        {user && (
          <section id="settings_security_section" className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-outline">
                {t('settings.securityTitle')}
              </h2>
            </div>

            <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5">
              {/* 1. Change Password */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {t('settings.changePassword')}
                      </h3>
                      <p className="text-xs text-outline">
                        {isChangingPassword ? t('settings.newPasswordPlaceholder') : '••••••••••••'}
                      </p>
                    </div>
                  </div>

                  <button
                    id="toggle_change_password_btn"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setPasswordMessage(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors"
                  >
                    {isChangingPassword ? t('settings.cancel') : t('settings.changePassword')}
                  </button>
                </div>

                {/* Password Form */}
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
                        {t('settings.newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('settings.newPasswordPlaceholder')}
                          className="w-full px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-on-surface"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">
                        {t('settings.confirmPassword')}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('settings.confirmPasswordPlaceholder')}
                        className="w-full px-3.5 py-2 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-outline hover:text-on-surface rounded-xl transition-colors"
                      >
                        {t('settings.cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
                      >
                        {isUpdatingPassword ? t('settings.saving') : t('settings.updatePasswordBtn')}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2. Google Account Status */}
              <div className="pt-3 border-t border-surface-dim flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">
                      {t('settings.googleAccount')}
                    </h3>
                    <p className="text-xs text-outline">
                      {isGoogleUser ? t('settings.googleConnected') : t('settings.googleNotConnected')}
                    </p>
                  </div>
                </div>

                {isGoogleUser ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-fixed/50 text-primary">
                    <Check className="w-3 h-3" />
                    {t('settings.googleConnected')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors"
                  >
                    {t('settings.linkGoogle')}
                  </button>
                )}
              </div>

              {/* 3. Passkey / WebAuthn */}
              <div className="pt-3 border-t border-surface-dim space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {t('settings.passkeyTitle')}
                      </h3>
                      <p className="text-xs text-outline">
                        {passkeyStatus?.isSupported
                          ? userHasPasskey
                            ? t('settings.passkeyRegistered')
                            : t('settings.passkeySupported')
                          : t('settings.passkeyNotSupported')}
                      </p>
                    </div>
                  </div>

                  {passkeyStatus?.isSupported && (
                    <button
                      id="register_passkey_btn"
                      type="button"
                      onClick={handleRegisterPasskey}
                      disabled={isRegisteringPasskey}
                      className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isRegisteringPasskey ? t('settings.saving') : t('settings.registerPasskey')}
                    </button>
                  )}
                </div>

                {passkeyMsg && (
                  <div
                    className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                      passkeyMsg.type === 'success'
                        ? 'bg-secondary-fixed/50 text-primary font-bold'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {passkeyMsg.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-primary" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-error" />
                    )}
                    <span>{passkeyMsg.text}</span>
                  </div>
                )}
              </div>

              {/* 4. Sign Out */}
              <div className="pt-3 border-t border-surface-dim flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">
                      {t('settings.signOut')}
                    </h3>
                    <p className="text-xs text-outline">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <button
                  id="sign_out_trigger_btn"
                  type="button"
                  onClick={() => setShowSignOutConfirm(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-low border border-surface-dim rounded-xl transition-colors"
                >
                  {t('settings.signOut')}
                </button>
              </div>

              {/* 5. Danger Zone: Delete Account */}
              <div className="pt-4 border-t border-error/20 space-y-2">
                <div className="p-4 rounded-2xl bg-error-container/30 border border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-error font-bold text-sm">
                      <Trash2 className="w-4 h-4" />
                      <h4>{t('settings.deleteAccount')}</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">
                      {t('settings.deleteAccountWarning')}
                    </p>
                  </div>

                  <button
                    id="delete_account_trigger_btn"
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-xs font-bold text-error hover:bg-error/10 border border-error/30 rounded-xl transition-colors shrink-0"
                  >
                    {t('settings.deleteAccount')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer / Version Information */}
        <footer className="pt-4 text-center space-y-1 text-xs text-outline">
          <p className="font-medium">{t('settings.appVersion')}</p>
        </footer>
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: Avatar Preset Picker */}
      {/* ==================================================================== */}
      {showAvatarPicker && (
        <div
          onClick={() => setShowAvatarPicker(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-['Manrope']">
                {t('settings.chooseAvatar')}
              </h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAvatar(preset)}
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 active:scale-95 ${
                    profile?.avatar_url === preset ? 'border-primary ring-2 ring-primary/30' : 'border-surface-dim'
                  }`}
                >
                  <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-surface-dim flex justify-between gap-2">
              <button
                onClick={() => handleSelectAvatar(null)}
                className="px-3 py-1.5 text-xs font-semibold text-outline hover:text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
              >
                Use Initials
              </button>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="px-4 py-1.5 text-xs font-bold text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-colors"
              >
                {t('settings.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {t('settings.signOut')}
              </h3>
              <p className="text-xs text-outline">
                {t('settings.signOutConfirm')}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 py-2.5 text-xs font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors"
              >
                {t('settings.cancel')}
              </button>
              <button
                id="confirm_sign_out_btn"
                type="button"
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="flex-1 py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl transition-colors disabled:opacity-50"
              >
                {isSigningOut ? t('settings.saving') : t('settings.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: Delete Account Explicit Confirmation */}
      {/* ==================================================================== */}
      {showDeleteConfirm && (
        <div
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-error/30 space-y-4 text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-on-surface font-['Manrope']">
                {t('settings.deleteAccountConfirmTitle')}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('settings.deleteAccountConfirmDesc')}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                id="confirm_delete_account_btn"
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting}
                className="w-full py-3 text-xs font-bold text-on-error bg-error hover:bg-error/90 rounded-2xl shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {isDeleting ? t('settings.deletingAccount') : t('settings.deleteAccountBtn')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full py-2.5 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors"
              >
                {t('settings.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
