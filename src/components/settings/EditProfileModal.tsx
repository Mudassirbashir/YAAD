import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  AlertCircle,
  Loader2,
  Camera,
  Trash2,
  Sparkles,
  CloudUpload,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
} from '../../utils/phone';
import { Avatar } from '../Avatar';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { uploadImage } from '../../utils/cloudinary';
import { triggerHaptic } from '../../lib/sound';
import { useShouldAnimate } from '../../lib/motionPreference';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
  email?: string | null;
  initialAvatarUrl?: string | null;
  focusPhoneOnOpen?: boolean;
  onSave: (
    fullName: string,
    phoneNumber: string | null,
    avatarUrl?: string | null
  ) => Promise<{ error?: any }>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialPhone,
  email = null,
  initialAvatarUrl,
  focusPhoneOnOpen = false,
  onSave,
}) => {
  const { t, language, isRTL } = useLanguage();
  const canAnimate = useShouldAnimate();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Picture Upload & Cropping State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [pendingCroppedBlob, setPendingCroppedBlob] = useState<Blob | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setName(initialName);
      setPhone(initialPhone);
      setAvatarUrl(initialAvatarUrl || null);
      setPhoneError(null);
      setErrorMessage(null);
      setPendingCroppedBlob(null);
      setSelectedRawImage(null);
      setShowCropper(false);
      setIsUploadingPhoto(false);
      setPhotoSuccessMsg(null);
      setPhotoUploadError(null);

      // Do not auto-open keyboard when name & phone already exist;
      // only allow focusing a missing required/requested field.
      const hasName = Boolean(initialName?.trim());
      const hasPhone = Boolean(initialPhone?.trim());

      if (!hasName || (focusPhoneOnOpen && !hasPhone)) {
        const timer = setTimeout(() => {
          if (!hasName) {
            document.getElementById('edit_modal_name_input')?.focus();
          } else if (focusPhoneOnOpen && !hasPhone) {
            document.getElementById('edit_modal_phone_input')?.focus();
          }
        }, 120);
        prevIsOpenRef.current = isOpen;
        return () => clearTimeout(timer);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialName, initialPhone, initialAvatarUrl, focusPhoneOnOpen]);

  // Handle late-loading profile data if user has not entered a custom name yet
  useEffect(() => {
    if (isOpen && initialName && !name) {
      setName(initialName);
    }
  }, [isOpen, initialName, name]);

  // Escape closes the full-screen Edit Profile view cleanly when not saving or cropping
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !showCropper) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, showCropper, onClose]);

  // Trigger hidden file picker
  const handleTriggerFileSelect = () => {
    triggerHaptic(6);
    fileInputRef.current?.click();
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        language === 'ur'
          ? 'براہ کرم درست تصویر فائل منتخب کریں (JPG, PNG, WEBP)'
          : 'Please select a valid image file (JPG, PNG, WEBP)'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedRawImage(dataUrl);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so user can pick same file again if desired
    e.target.value = '';
  };

  // Perform upload to Cloudinary with non-destructive state retention
  const performPhotoUpload = async (blobToUpload: Blob): Promise<{ success: boolean; url?: string }> => {
    setIsUploadingPhoto(true);
    setPhotoSuccessMsg(null);
    setPhotoUploadError(null);
    setErrorMessage(null);

    try {
      const uploadResult = await uploadImage(blobToUpload, `avatar_${Date.now()}.jpg`);
      if (uploadResult.source === 'cloudinary' && uploadResult.url) {
        setAvatarUrl(uploadResult.url);
        setPendingCroppedBlob(null);
        setPhotoUploadError(null);
        setPhotoSuccessMsg(
          language === 'ur'
            ? 'تصویر کلاؤڈ پر محفوظ ہو گئی ہے!'
            : 'Photo saved to cloud!'
        );
        triggerHaptic(15);
        return { success: true, url: uploadResult.url };
      } else {
        // Upload failed or fell back to data URL: KEEP cropped preview visible!
        // Never revert avatarUrl to initialAvatarUrl!
        const errorDetail = uploadResult.error || (language === 'ur' ? 'تصویر اپ لوڈ کرنے میں ناکامی ہوئی' : 'Failed to upload photo to cloud');
        setPhotoSuccessMsg(null);
        setPhotoUploadError(errorDetail);
        setErrorMessage(errorDetail);
        return { success: false };
      }
    } catch (err: any) {
      console.warn('Background upload note:', err);
      // Keep cropped preview visible! Never revert to initialAvatarUrl!
      const errorDetail = err?.message || (language === 'ur' ? 'تصویر اپ لوڈ کرنے میں ناکامی ہوئی' : 'Failed to upload photo');
      setPhotoSuccessMsg(null);
      setPhotoUploadError(errorDetail);
      setErrorMessage(errorDetail);
      return { success: false };
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Callback from 1:1 Image Cropper Modal (Auto-upload to Cloudinary with live preview)
  const handleCropComplete = async (croppedBlob: Blob, croppedDataUrl: string) => {
    triggerHaptic(10);
    setPendingCroppedBlob(croppedBlob);
    setAvatarUrl(croppedDataUrl); // Instant responsive preview
    setShowCropper(false);
    setSelectedRawImage(null);
    setPhotoSuccessMsg(null);
    setPhotoUploadError(null);
    setErrorMessage(null);

    await performPhotoUpload(croppedBlob);
  };

  // Retry upload of currently held cropped blob
  const handleRetryUpload = async () => {
    if (!pendingCroppedBlob) return;
    triggerHaptic(8);
    await performPhotoUpload(pendingCroppedBlob);
  };

  // Remove custom photo (reset to default avatar)
  const handleRemovePhoto = () => {
    triggerHaptic(8);
    setAvatarUrl(null);
    setPendingCroppedBlob(null);
    setPhotoSuccessMsg(null);
    setPhotoUploadError(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPhoneError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage(
        t('profileSetup.nameRequired') ||
          (language === 'ur' ? 'براہ کرم اپنا نام درج کریں' : 'Please enter your name')
      );
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const validation = validatePhoneNumber(trimmedPhone);
      if (!validation.isValid) {
        setPhoneError(
          validation.error ||
            (language === 'ur'
              ? 'درست فون نمبر درج کریں (مثلاً: +92 300 1234567)'
              : 'Please enter a valid phone number (e.g. +92 300 1234567)')
        );
        return;
      }
    }

    setIsSaving(true);

    let finalAvatarUrl: string | null = avatarUrl;

    // If user cropped a new image and background upload has not finished/failed yet
    if (pendingCroppedBlob) {
      const uploadOutcome = await performPhotoUpload(pendingCroppedBlob);
      if (!uploadOutcome.success || !uploadOutcome.url) {
        setIsSaving(false);
        // Keep the preview visible and don't wipe pendingCroppedBlob!
        return;
      }
      finalAvatarUrl = uploadOutcome.url;
    }

    // Safety guard: never save a data URL as avatar_url
    if (finalAvatarUrl && finalAvatarUrl.startsWith('data:')) {
      finalAvatarUrl = initialAvatarUrl || null;
    }

    const cleanPhoneVal = trimmedPhone ? cleanPhoneNumber(trimmedPhone) : null;
    const { error } = await onSave(trimmedName, cleanPhoneVal, finalAvatarUrl);
    setIsSaving(false);

    if (error) {
      setErrorMessage(
        error.message ||
          (language === 'ur' ? 'پروفائل محفوظ نہیں ہو سکی' : 'Failed to update profile')
      );
    } else {
      triggerHaptic(12);
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayTitleName = name.trim() || initialName || 'User';

  return (
    <>
      <div
        id="edit_profile_modal_container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit_profile_screen_title"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={!canAnimate ? { animationDuration: '80ms' } : undefined}
        className={`fixed inset-0 z-50 bg-background text-on-surface flex flex-col overflow-y-auto overscroll-contain font-sans ${
          canAnimate ? 'animate-slide-in-from-bottom' : 'animate-fade-in'
        }`}
      >
            {/* Full-Screen Liquid-Glass Header Area */}
            <header className="sticky top-0 z-20 px-3 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2 bg-gradient-to-b from-background via-background/85 to-transparent">
              <div className="max-w-xl mx-auto w-full">
                <div className="yaad-liquid-glass relative h-14 px-1.5 grid grid-cols-[1fr_auto_1fr] items-center">
                  <div className="relative z-10 flex items-center justify-start">
                    <button
                      type="button"
                      id="edit_profile_back_btn"
                      onClick={onClose}
                      disabled={isSaving}
                      aria-label={language === 'ur' ? 'واپس' : 'Back'}
                      className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-primary hover:bg-primary/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
                      }`}
                    >
                      <ArrowLeft className="w-5 h-5 rtl:rotate-180" aria-hidden="true" />
                    </button>
                  </div>

                  <h1
                    id="edit_profile_screen_title"
                    className="relative z-10 text-base sm:text-lg font-extrabold text-on-surface font-display text-center truncate px-2"
                  >
                    {language === 'ur' ? 'پروفائل میں ترمیم کریں' : 'Edit Profile'}
                  </h1>

                  <div className="relative z-10 flex items-center justify-end">
                    <div className="w-11 h-11" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </header>

            {/* Full-Screen Body */}
            <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] flex flex-col gap-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-error-container/30 border border-error/25 text-xs text-error flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* 1. Profile Summary Card: DP at Top + Name Directly Below DP + Photo Action Chips */}
                <section
                  aria-label={language === 'ur' ? 'پروفائل تصویر' : 'Profile Picture'}
                  className="yaad-liquid-glass yaad-liquid-glass-card relative p-4 sm:p-5 flex flex-col items-center text-center gap-3"
                >
                  <div className="relative z-10 flex flex-col items-center gap-2.5 w-full">
                    {/* Profile Picture / DP */}
                    <div className="relative shrink-0">
                      <Avatar
                        name={displayTitleName}
                        avatarUrl={avatarUrl}
                        size="xl"
                        className="w-24 h-24 sm:w-28 sm:h-28 ring-2 ring-primary/25 shadow-sm rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleTriggerFileSelect}
                        disabled={isSaving}
                        title={language === 'ur' ? 'تصویر منتخب کریں' : 'Select photo'}
                        aria-label={language === 'ur' ? 'تصویر منتخب کریں' : 'Select photo'}
                        className={`yaad-liquid-glass yaad-liquid-glass-no-blur yaad-liquid-glass-primary absolute -bottom-1.5 -end-1.5 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
                        }`}
                      >
                        <Camera className="relative z-10 w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* User Name Below DP */}
                    <div className="min-w-0 max-w-full px-2">
                      <h2 className="text-lg sm:text-xl font-extrabold text-on-surface font-display truncate leading-tight">
                        {displayTitleName}
                      </h2>
                    </div>

                    {/* Photo Action Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                      <button
                        type="button"
                        id="upload_profile_pic_btn"
                        onClick={handleTriggerFileSelect}
                        disabled={isSaving}
                        className={`yaad-liquid-glass yaad-liquid-glass-no-blur yaad-liquid-glass-primary relative min-h-[44px] px-4 py-2 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
                        }`}
                      >
                        <CloudUpload className="relative z-10 w-4 h-4" aria-hidden="true" />
                        <span className="relative z-10">
                          {avatarUrl
                            ? (language === 'ur' ? 'تصویر تبدیل کریں' : 'Change Photo')
                            : (language === 'ur' ? 'تصویر اپلوڈ کریں' : 'Upload Photo')}
                        </span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isSaving}
                          title={language === 'ur' ? 'تصویر ہٹائیں' : 'Remove Photo'}
                          aria-label={language === 'ur' ? 'تصویر ہٹائیں' : 'Remove Photo'}
                          className={`yaad-liquid-glass yaad-liquid-glass-no-blur yaad-liquid-glass-row relative min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold text-error inline-flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error ${
                            canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
                          }`}
                        >
                          <Trash2 className="relative z-10 w-4 h-4" aria-hidden="true" />
                          <span className="relative z-10">
                            {language === 'ur' ? 'ہٹائیں' : 'Remove'}
                          </span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-outline font-body leading-tight">
                      {language === 'ur'
                        ? 'تصویر منتخب کر کے 1:1 تناسب میں کراپ اور ایڈجسٹ کریں'
                        : 'Select and adjust image in 1:1 square crop'}
                    </p>
                  </div>

                  {/* Live photo upload & persist indicators */}
                  {isUploadingPhoto && (
                    <div
                      id="profile_photo_uploading_indicator"
                      className="relative z-10 w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-primary/10 text-primary text-xs font-semibold"
                    >
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>
                        {language === 'ur' ? 'تصویر اپلوڈ اور محفوظ ہو رہی ہے...' : 'Uploading & applying profile photo...'}
                      </span>
                    </div>
                  )}

                  {photoUploadError && !isUploadingPhoto && (
                    <div
                      id="profile_photo_upload_error_box"
                      className="relative z-10 w-full flex flex-col gap-1.5 p-3 rounded-2xl bg-error-container/30 border border-error/25 text-error text-xs text-start"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
                          <span className="font-semibold truncate">
                            {language === 'ur' ? 'تصویر اپ لوڈ نہیں ہو سکی' : 'Photo upload failed'}
                          </span>
                        </div>
                        {pendingCroppedBlob && (
                          <button
                            type="button"
                            id="retry_photo_upload_btn"
                            onClick={handleRetryUpload}
                            disabled={isSaving}
                            className={`min-h-[44px] px-3.5 py-1.5 rounded-full bg-error text-white font-semibold text-xs hover:bg-error/90 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1 ${
                              canAnimate ? 'transition-transform duration-150 active:scale-95' : ''
                            }`}
                          >
                            {language === 'ur' ? 'دوبارہ کوشش کریں' : 'Retry'}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] opacity-90 break-words font-mono">
                        {photoUploadError}
                      </p>
                    </div>
                  )}

                  {photoSuccessMsg && !isUploadingPhoto && !photoUploadError && (
                    <div
                      id="profile_photo_success_indicator"
                      className="relative z-10 w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{photoSuccessMsg}</span>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSaving}
                  />
                </section>

                {/* 2. Account Information Section (Order: Full Name -> Email Address -> Phone Number) */}
                <section
                  aria-label={language === 'ur' ? 'اکاؤنٹ کی معلومات' : 'Account Information'}
                  className="yaad-liquid-glass yaad-liquid-glass-card relative p-4 sm:p-5"
                >
                  <div className="relative z-10 flex flex-col gap-3.5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="edit_modal_name_input"
                        className="text-xs font-bold text-on-surface font-display flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        <span>{t('settings.name') || (language === 'ur' ? 'مکمل نام' : 'Full Name')}</span>
                      </label>
                      <input
                        id="edit_modal_name_input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('settings.namePlaceholder') || 'Enter your name'}
                        disabled={isSaving}
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-2xl bg-surface border border-surface-dim/80 text-on-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 font-body"
                        required
                      />
                    </div>

                    {/* Email Address (Read-Only Account Info) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-on-surface font-display flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        <span>{t('settings.email') || (language === 'ur' ? 'ای میل ایڈریس' : 'Email Address')}</span>
                      </span>
                      <div
                        id="edit_profile_email_value"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-2xl bg-surface-container-low/80 border border-surface-dim/60 text-on-surface-variant flex items-center min-w-0 overflow-hidden"
                      >
                        <span dir="ltr" className="truncate font-body w-full rtl:text-right">
                          {email || (language === 'ur' ? 'کوئی ای میل درج نہیں' : 'No email linked')}
                        </span>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="edit_modal_phone_input"
                        className="text-xs font-bold text-on-surface font-display flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        <span>{t('settings.phone') || (language === 'ur' ? 'فون نمبر' : 'Phone Number')}</span>
                      </label>
                      <input
                        id="edit_modal_phone_input"
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (phoneError) setPhoneError(null);
                        }}
                        placeholder="+92 300 1234567"
                        disabled={isSaving}
                        className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-2xl bg-surface border text-on-surface font-mono focus:outline-hidden focus:ring-2 ${
                          phoneError
                            ? 'border-error focus:border-error focus:ring-error/20'
                            : 'border-surface-dim/80 focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                      {phoneError ? (
                        <p className="text-[11px] text-error font-medium">{phoneError}</p>
                      ) : (
                        <p className="text-[11px] text-outline font-body">
                          {language === 'ur'
                            ? 'پاکستانی نمبر (+92) درج کریں'
                            : 'Format: +92 300 1234567'}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* 3. Action Buttons */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className={`yaad-liquid-glass yaad-liquid-glass-no-blur yaad-liquid-glass-row relative flex-1 min-h-[48px] px-5 text-sm font-bold text-on-surface-variant cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      canAnimate ? 'transition-transform duration-150 active:scale-[0.98]' : ''
                    }`}
                  >
                    <span className="relative z-10">{t('settings.cancel') || 'Cancel'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`yaad-liquid-glass yaad-liquid-glass-no-blur yaad-liquid-glass-primary relative flex-1 min-h-[48px] px-5 text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      canAnimate ? 'transition-transform duration-150 active:scale-[0.98]' : ''
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
                        <span className="relative z-10">
                          {isUploadingPhoto
                            ? (language === 'ur' ? 'تصویر اپلوڈ ہو رہی ہے...' : 'Uploading photo...')
                            : (t('settings.saving') || 'Saving...')}
                        </span>
                      </>
                    ) : (
                      <span className="relative z-10">{t('settings.save') || 'Save'}</span>
                    )}
                  </button>
                </div>
              </form>
            </main>
          </div>

      {/* 1:1 Responsive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropper}
        imageSrc={selectedRawImage}
        onClose={() => {
          setShowCropper(false);
          setSelectedRawImage(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

