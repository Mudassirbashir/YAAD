import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Smartphone,
  AlertCircle,
  Loader2,
  Camera,
  Trash2,
  Sparkles,
  Crop,
  CloudUpload,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  validatePhoneNumber,
  cleanPhoneNumber,
} from '../../utils/phone';
import { Avatar } from '../Avatar';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { uploadImage, getCloudinaryConfig } from '../../utils/cloudinary';
import { triggerHaptic } from '../../lib/sound';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
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
  initialAvatarUrl,
  focusPhoneOnOpen = false,
  onSave,
}) => {
  const { t, language, isRTL } = useLanguage();

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudinaryConfig = getCloudinaryConfig();

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone(initialPhone);
      setAvatarUrl(initialAvatarUrl || null);
      setPhoneError(null);
      setErrorMessage(null);
      setPendingCroppedBlob(null);
      setSelectedRawImage(null);
      setShowCropper(false);
      setIsUploadingPhoto(false);

      const timer = setTimeout(() => {
        if (focusPhoneOnOpen) {
          document.getElementById('edit_modal_phone_input')?.focus();
        } else {
          document.getElementById('edit_modal_name_input')?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialName, initialPhone, initialAvatarUrl, focusPhoneOnOpen]);

  if (!isOpen) return null;

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

  // Callback from 1:1 Image Cropper Modal
  const handleCropComplete = (croppedBlob: Blob, croppedDataUrl: string) => {
    triggerHaptic(10);
    setPendingCroppedBlob(croppedBlob);
    setAvatarUrl(croppedDataUrl); // Instant responsive preview
    setShowCropper(false);
    setSelectedRawImage(null);
  };

  // Remove custom photo (reset to default avatar)
  const handleRemovePhoto = () => {
    triggerHaptic(8);
    setAvatarUrl(null);
    setPendingCroppedBlob(null);
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

    // If user cropped a new image, upload to Cloudinary (or compressed local storage)
    if (pendingCroppedBlob) {
      setIsUploadingPhoto(true);
      try {
        const uploadResult = await uploadImage(pendingCroppedBlob, `avatar_${Date.now()}.jpg`);
        finalAvatarUrl = uploadResult.url;
      } catch (uploadErr: any) {
        console.warn('Image upload notice:', uploadErr);
        // Fall back to current data URL if upload threw
        finalAvatarUrl = avatarUrl;
      } finally {
        setIsUploadingPhoto(false);
      }
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

  return (
    <>
      <div
        id="edit_profile_modal_backdrop"
        onClick={() => !isSaving && onClose()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div
          id="edit_profile_modal_container"
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-surface-dim/80 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-surface-dim/50">
            <h3 className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans']">
              {language === 'ur' ? 'پروفائل میں ترمیم کریں' : 'Edit Profile'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/20 text-xs text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ------------------------------------------------------------- */}
            {/* FEATURE: Upload Your Profile Picture (اپلوڈ یور پروفائل پکچر)   */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-surface-container-low/80 rounded-2xl p-3.5 border border-surface-dim/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {language === 'ur'
                      ? 'پروفائل پکچر اپلوڈ کریں'
                      : 'Upload Profile Picture'}
                  </span>
                </span>
                <span className="text-[10px] font-medium text-primary font-['Manrope'] bg-primary/10 px-2 py-0.5 rounded-full">
                  1:1 Square
                </span>
              </div>

              {/* Avatar Preview & Actions Row */}
              <div className="flex items-center gap-3.5">
                {/* 1:1 Live Avatar Preview */}
                <div className="relative shrink-0 group">
                  <Avatar
                    name={name || 'User'}
                    avatarUrl={avatarUrl}
                    size="xl"
                    className="w-16 h-16 sm:w-18 sm:h-18 ring-2 ring-primary/25 shadow-sm rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerFileSelect}
                    disabled={isSaving}
                    title={language === 'ur' ? 'تصویر منتخب کریں' : 'Select photo'}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer ring-2 ring-surface-container-lowest"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Upload & Adjust Buttons */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      id="upload_profile_pic_btn"
                      onClick={handleTriggerFileSelect}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>
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
                        className="p-1.5 rounded-xl text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10.5px] text-outline font-['Manrope'] leading-tight">
                    {language === 'ur'
                      ? 'تصویر منتخب کر کے 1:1 تناسب میں کراپ اور ایڈجسٹ کریں'
                      : 'Select and adjust image in 1:1 square crop'}
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSaving}
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit_modal_name_input"
                className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{t('settings.name') || (language === 'ur' ? 'مکمل نام' : 'Full Name')}</span>
              </label>
              <input
                id="edit_modal_name_input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings.namePlaceholder') || 'Enter your name'}
                disabled={isSaving}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border border-surface-dim/75 text-on-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-['Manrope']"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit_modal_phone_input"
                className="text-xs font-bold text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-primary" />
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
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-surface border text-on-surface font-mono focus:outline-hidden focus:ring-2 transition-all ${
                  phoneError
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-surface-dim/75 focus:border-primary focus:ring-primary/20'
                }`}
              />
              {phoneError ? (
                <p className="text-[11px] text-error font-medium">{phoneError}</p>
              ) : (
                <p className="text-[10px] text-outline font-['Manrope']">
                  {language === 'ur'
                    ? 'پاکستانی نمبر (+92) درج کریں'
                    : 'Format: +92 300 1234567'}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
              >
                {t('settings.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {isUploadingPhoto
                        ? (language === 'ur' ? 'تصویر اپلوڈ ہو رہی ہے...' : 'Uploading photo...')
                        : (t('settings.saving') || 'Saving...')}
                    </span>
                  </>
                ) : (
                  <span>{t('settings.save') || 'Save'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
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
