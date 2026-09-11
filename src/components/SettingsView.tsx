import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { AvatarPickerModal } from './AvatarPickerModal';
import { ProfileSection } from './settings/ProfileSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { SecuritySection } from './settings/SecuritySection';
import { AboutSection } from './settings/AboutSection';
import { SignOutConfirmModal } from './settings/SignOutConfirmModal';
import { LegalDocModal } from './settings/LegalDocModal';
import { isPasskeySupported } from '../lib/passkey';
import { PasskeyCredentialInfo } from '../types';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
} from '../utils/phone';

interface SettingsViewProps {
  onBack: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onRestartTour?: () => void;
  onReplayOnboarding?: () => void;
  onOpenLegalPage?: (
    page: 'terms' | 'privacy' | 'about' | 'help' | 'legal',
  ) => void;
  initialEditPhone?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onSignOut,
  onOpenAuth,
  onRestartTour,
  onOpenLegalPage,
  initialEditPhone = false,
}) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const {
    user,
    profile,
    updateUserProfile,
    updatePassword,
    registerPasskey,
    listPasskeys,
    removePasskey,
  } = useAuth();

  // ============================================================================
  // Passkey Management State
  // ============================================================================
  const [passkeys, setPasskeys] = useState<PasskeyCredentialInfo[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [confirmDeletePasskeyId, setConfirmDeletePasskeyId] = useState<
    string | null
  >(null);
  const [isDeletingPasskey, setIsDeletingPasskey] = useState(false);
  const [passkeyMessage, setPasskeyMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user && isPasskeySupported()) {
      setLoadingPasskeys(true);
      listPasskeys()
        .then(setPasskeys)
        .catch(() => {})
        .finally(() => setLoadingPasskeys(false));
    }
  }, [user]);

  const handleRegisterPasskey = async (customName?: string) => {
    setIsRegisteringPasskey(true);
    setPasskeyMessage(null);
    try {
      const res = await registerPasskey(customName);
      if (res.error) {
        setPasskeyMessage({ type: 'error', text: res.error.message });
      } else {
        setPasskeyMessage({
          type: 'success',
          text: 'Passkey registered successfully for this device.',
        });
        const updated = await listPasskeys();
        setPasskeys(updated);
        setTimeout(() => {
          setPasskeyMessage((prev) => (prev?.type === 'success' ? null : prev));
        }, 4000);
      }
    } catch (err: unknown) {
      setPasskeyMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Registration failed',
      });
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleRemovePasskey = async (id: string) => {
    setIsDeletingPasskey(true);
    try {
      const res = await removePasskey(id);
      if (res.error) {
        setPasskeyMessage({ type: 'error', text: res.error.message });
      } else {
        setPasskeyMessage({
          type: 'success',
          text: 'Passkey removed from your account.',
        });
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
        setTimeout(() => {
          setPasskeyMessage((prev) => (prev?.type === 'success' ? null : prev));
        }, 3000);
      }
    } catch {
      setPasskeyMessage({ type: 'error', text: 'Failed to remove passkey.' });
    } finally {
      setIsDeletingPasskey(false);
      setConfirmDeletePasskeyId(null);
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
        text: t('settings.saved') || 'Saved successfully',
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
        text: t('settings.saved') || 'Saved successfully',
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
        text: t('settings.avatarUpdated') || t('settings.saved'),
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
    'privacy' | 'terms' | 'help' | null
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
    (user ? 'Account User' : t('settings.guestUser'));
  const displayEmail =
    user?.email || (user ? 'Authenticated user' : t('settings.guestSubtitle'));
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
              <h1 className="text-xl font-bold font-['Manrope'] text-on-surface tracking-tight leading-tight">
                {t('settings.title') || 'Settings'}
              </h1>
              <p className="text-xs text-outline font-medium">
                {t('settings.subtitle') || 'Preferences & Account'}
              </p>
            </div>
          </div>

          <button
            id="settings_done_btn"
            onClick={onBack}
            className="px-4 py-1.5 text-xs sm:text-sm font-bold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/60 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            {t('settings.done') || 'Done'}
          </button>
        </div>
      </header>

      {/* Main Content Sections Container */}
      <main className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Profile & Account Section */}
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

        {/* 2. Preferences Section */}
        <PreferencesSection
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onLanguageSelect={handleLanguageSelect}
          onRestartTour={onRestartTour}
        />

        {/* 3. Security Section (When Authenticated) */}
        {user && (
          <SecuritySection
            isChangingPassword={isChangingPassword}
            setIsChangingPassword={setIsChangingPassword}
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
            passkeys={passkeys}
            loadingPasskeys={loadingPasskeys}
            isRegisteringPasskey={isRegisteringPasskey}
            confirmDeletePasskeyId={confirmDeletePasskeyId}
            setConfirmDeletePasskeyId={setConfirmDeletePasskeyId}
            isDeletingPasskey={isDeletingPasskey}
            passkeyMessage={passkeyMessage}
            onRegisterPasskey={() => handleRegisterPasskey()}
            onRemovePasskey={handleRemovePasskey}
            onRequestSignOut={() => setShowSignOutConfirm(true)}
          />
        )}

        {/* 4. About & Legal Section */}
        <AboutSection
          onOpenModal={(type) => setActiveLegalModal(type)}
          onOpenLegalPage={onOpenLegalPage}
        />
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
