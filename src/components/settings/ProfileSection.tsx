import React from 'react';
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from '../Avatar';
import { formatPhoneNumber } from '../../utils/phone';

interface ProfileSectionProps {
  user: any;
  profile: any;
  displayName: string;
  displayEmail: string;
  displayPhone: string | null;
  isEditingName: boolean;
  fullNameInput: string;
  setFullNameInput: (val: string) => void;
  isEditingPhone: boolean;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  phoneError: string | null;
  isSavingProfile: boolean;
  profileMessage: { type: 'success' | 'error'; text: string } | null;
  onSaveName: (e: React.FormEvent) => void;
  onSavePhone: (e: React.FormEvent) => void;
  onStartEditName: () => void;
  onCancelEditName: () => void;
  onStartEditPhone: () => void;
  onCancelEditPhone: () => void;
  onOpenAvatarPicker: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  profile,
  displayName,
  displayEmail,
  displayPhone,
  isEditingName,
  fullNameInput,
  setFullNameInput,
  isEditingPhone,
  phoneInput,
  setPhoneInput,
  phoneError,
  isSavingProfile,
  profileMessage,
  onSaveName,
  onSavePhone,
  onStartEditName,
  onCancelEditName,
  onStartEditPhone,
  onCancelEditPhone,
  onOpenAvatarPicker,
  onOpenAuth,
}) => {
  const { t, language } = useLanguage();

  return (
    <section id="settings_account_section" className="space-y-3 sm:space-y-3.5">
      {/* Section Header */}
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
            {t('settings.accountTitle') || 'Profile & Account'}
          </h2>
        </div>
      </div>

      {/* Profile Card Container */}
      <div
        id="settings_profile_card"
        className="bg-surface rounded-3xl p-5 sm:p-6 border border-surface-dim shadow-xs space-y-5"
      >
        {/* Profile Message Feedback Banner */}
        {profileMessage && (
          <div
            id="settings_profile_msg"
            className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              profileMessage.type === 'success'
                ? 'bg-secondary-fixed/50 text-on-secondary-fixed font-semibold border border-secondary-fixed'
                : 'bg-error-container text-on-error-container border border-error/20'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-error" />
            )}
            <span className="flex-1">{profileMessage.text}</span>
          </div>
        )}

        {user ? (
          <>
            {/* Authenticated Profile View */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              {/* Avatar with Camera / Edit Button */}
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
                  type="button"
                  onClick={onOpenAvatarPicker}
                  aria-label={t('settings.chooseAvatar') || 'Choose Avatar'}
                  className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-90 cursor-pointer ring-2 ring-surface"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center sm:text-start space-y-1.5 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface font-['Manrope'] truncate max-w-full">
                    {displayName}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed/50 text-primary shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>{t('settings.verified') || 'Active Account'}</span>
                  </span>
                </div>

                {/* Email address */}
                <p className="text-xs sm:text-sm text-outline flex items-center justify-center sm:justify-start gap-1.5 font-['Plus_Jakarta_Sans']">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-outline" />
                  <span className="truncate max-w-[280px] sm:max-w-xs">{displayEmail}</span>
                </p>

                {/* Phone number */}
                <p className="text-xs sm:text-sm text-outline flex items-center justify-center sm:justify-start gap-1.5 font-['Plus_Jakarta_Sans']">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-outline" />
                  <span className="truncate max-w-[280px] sm:max-w-xs" dir="ltr">
                    {displayPhone
                      ? formatPhoneNumber(displayPhone)
                      : (t('settings.noPhone') || 'No phone number added')}
                  </span>
                </p>

                {/* Edit Controls Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {!isEditingName && (
                    <button
                      id="edit_name_toggle_btn"
                      type="button"
                      onClick={onStartEditName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors active:scale-95 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t('settings.editName') || 'Edit Name'}</span>
                    </button>
                  )}

                  {!isEditingPhone && (
                    <button
                      id="edit_phone_toggle_btn"
                      type="button"
                      onClick={onStartEditPhone}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 rounded-xl transition-colors active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>
                        {displayPhone
                          ? (t('settings.editPhone') || 'Edit Phone')
                          : (t('settings.addPhone') || 'Add Phone')}
                      </span>
                    </button>
                  )}

                  <button
                    id="open_avatar_picker_btn"
                    type="button"
                    onClick={onOpenAvatarPicker}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{t('settings.chooseAvatar') || 'Choose Avatar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Name Inline Form */}
            {isEditingName && (
              <form
                onSubmit={onSaveName}
                className="p-4 sm:p-4.5 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="settings_input_full_name"
                    className="block text-xs font-bold text-on-surface-variant"
                  >
                    {t('settings.name') || 'Full Name'}
                  </label>
                  <button
                    type="button"
                    onClick={onCancelEditName}
                    className="text-xs text-outline hover:text-on-surface flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
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
                    placeholder={t('settings.namePlaceholder') || 'Enter your name'}
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoFocus
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('settings.saving') || 'Saving...'}</span>
                        </>
                      ) : (
                        <span>{t('settings.save') || 'Save'}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEditName}
                      disabled={isSavingProfile}
                      className="px-3.5 py-2.5 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container rounded-xl transition-colors cursor-pointer"
                    >
                      {t('settings.cancel') || 'Cancel'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Edit Phone Number Inline Form */}
            {isEditingPhone && (
              <form
                onSubmit={onSavePhone}
                className="p-4 sm:p-4.5 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="settings_input_phone"
                    className="block text-xs font-bold text-on-surface-variant"
                  >
                    {t('settings.phoneNumber') || 'Phone Number'}
                  </label>
                  <button
                    type="button"
                    onClick={onCancelEditPhone}
                    className="text-xs text-outline hover:text-on-surface flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>{t('settings.cancel') || 'Cancel'}</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="settings_input_phone"
                      type="tel"
                      dir="ltr"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono transition-all"
                      autoFocus
                    />
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('settings.saving') || 'Saving...'}</span>
                          </>
                        ) : (
                          <span>{t('settings.save') || 'Save'}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEditPhone}
                        disabled={isSavingProfile}
                        className="px-3.5 py-2.5 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container rounded-xl transition-colors cursor-pointer"
                      >
                        {t('settings.cancel') || 'Cancel'}
                      </button>
                    </div>
                  </div>

                  {phoneError ? (
                    <p className="text-xs text-error font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-outline">
                      Format: +92 300 1234567 or local 03001234567. We use this for list sync reminders.
                    </p>
                  )}
                </div>
              </form>
            )}
          </>
        ) : (
          /* Guest User View */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-center sm:text-start">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar
                name="Guest"
                size="lg"
                className="ring-2 ring-surface-dim shadow-xs"
              />
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Manrope']">
                  {t('settings.guestUser') || 'Guest User'}
                </h3>
                <p className="text-xs sm:text-sm text-outline max-w-sm">
                  {t('settings.guestSubtitle') ||
                    'Sign in to sync your shopping lists securely across all your devices.'}
                </p>
              </div>
            </div>

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.signIn') || 'Sign In / Register'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
