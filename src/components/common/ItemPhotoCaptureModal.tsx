import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Image as ImageIcon, X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { triggerHaptic } from '../../lib/sound';
import { uploadImage } from '../../utils/cloudinary';

export interface ItemPhotoCaptureModalProps {
  isOpen: boolean;
  itemName?: string;
  currentImageUrl?: string | null;
  onClose: () => void;
  onPhotoCaptured: (url: string) => void | Promise<void>;
  onRemovePhoto?: () => void;
}

export const ItemPhotoCaptureModal: React.FC<ItemPhotoCaptureModalProps> = ({
  isOpen,
  itemName = 'Item',
  currentImageUrl,
  onClose,
  onPhotoCaptured,
  onRemovePhoto,
}) => {
  const { language, isRTL } = useLanguage();
  const isUrdu = language === 'ur';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera stream inside bottom sheet
  const startCameraStream = useCallback(async (facing: 'environment' | 'user') => {
    stopCameraStream();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        isUrdu
          ? 'کیمرہ دستیاب نہیں ہے۔ براہ کرم گیلری سے تصویر منتخب کریں۔'
          : 'Camera is unavailable. Please pick a photo from gallery.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play request interrupted or handled
        }
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access notice:', err);
      // Fallback: try default without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (fallbackErr) {
        setCameraError(
          isUrdu
            ? 'کیمرہ اوپن نہیں ہو سکا۔ گیلری سے تصویر اپلوڈ کریں۔'
            : 'Unable to open camera. You can choose a photo from gallery.'
        );
        setIsCameraActive(false);
      }
    }
  }, [isUrdu, stopCameraStream]);

  // Manage camera lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setPreviewUrl(null);
      setCameraError(null);
      startCameraStream(facingMode);
    } else {
      stopCameraStream();
      setCapturedBlob(null);
      setPreviewUrl(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode, startCameraStream, stopCameraStream]);

  // Flip front/rear camera
  const handleFlipCamera = () => {
    triggerHaptic(10);
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Instant shutter snap
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    triggerHaptic(20);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    // Crop to square for clean product tile rendering
    const size = Math.min(width, height);
    const startX = (width - size) / 2;
    const startY = (height - size) / 2;

    canvas.width = Math.min(size, 800);
    canvas.height = Math.min(size, 800);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPreviewUrl(dataUrl);
        stopCameraStream();
      },
      'image/jpeg',
      0.88
    );
  };

  // Trigger gallery file picker
  const handleSelectFromGallery = () => {
    triggerHaptic(8);
    fileInputRef.current?.click();
  };

  // Handle local file chosen from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError(isUrdu ? 'براہ کرم درست تصویر منتخب کریں' : 'Please select a valid image file');
      return;
    }

    triggerHaptic(12);
    setCapturedBlob(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        stopCameraStream();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retake photo: reset preview and restart camera stream
  const handleRetake = () => {
    triggerHaptic(10);
    setCapturedBlob(null);
    setPreviewUrl(null);
    startCameraStream(facingMode);
  };

  // Save photo: upload to Cloudinary (or compressed local storage) and return URL
  const handleConfirmSave = async () => {
    if (!capturedBlob && !previewUrl) return;

    setIsUploading(true);
    triggerHaptic(14);

    try {
      let finalUrl = previewUrl || '';
      if (capturedBlob) {
        const uploadResult = await uploadImage(capturedBlob, `item_${Date.now()}.jpg`);
        finalUrl = uploadResult.url;
      }

      await onPhotoCaptured(finalUrl);
      triggerHaptic([30, 25, 40]);
      onClose();
    } catch (err: unknown) {
      console.warn('Failed to upload item photo:', err);
      // Even if upload throws, attach previewUrl as fallback so user is never blocked
      if (previewUrl) {
        await onPhotoCaptured(previewUrl);
        triggerHaptic([30, 25, 40]);
        onClose();
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="item_photo_capture_backdrop"
      onClick={() => !isUploading && onClose()}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="item_photo_capture_sheet"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 max-w-md w-full shadow-2xl border border-surface-dim/80 space-y-4 animate-slide-in-from-bottom sm:animate-zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-dim/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-on-surface font-['Plus_Jakarta_Sans'] line-clamp-1">
                {isUrdu ? `${itemName} کی تصویر` : `Photo for ${itemName}`}
              </h3>
              <p className="text-[0.6875rem] text-on-surface-variant font-['Manrope']">
                {isUrdu ? 'تیز رفتار کیپچر یا گیلری سے منتخب کریں' : 'Instant camera capture or pick from gallery'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-square max-h-[320px] sm:max-h-[340px] w-full mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
          {previewUrl ? (
            /* Captured Snapshot Preview */
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Captured product"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 end-2 bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{isUrdu ? 'کیپچر مکمل' : 'Captured'}</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-white" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-white" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-white" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-white" />
                </div>
              </div>
            </>
          )}

          {/* Camera Error Message */}
          {cameraError && !previewUrl && (
            <div className="absolute inset-4 flex flex-col items-center justify-center text-center p-4 bg-black/75 rounded-xl text-white space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <p className="text-xs text-white/90">{cameraError}</p>
              <button
                type="button"
                onClick={handleSelectFromGallery}
                className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'گیلری سے منتخب کریں' : 'Choose from Gallery'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          {previewUrl ? (
            /* Confirmation Actions */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1 h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-dim font-['Manrope'] text-xs font-bold text-on-surface transition-all active:scale-[0.98] cursor-pointer"
              >
                {isUrdu ? 'دوبارہ لیں (Retake)' : 'Retake'}
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isUploading}
                className="flex-2 h-12 rounded-2xl bg-primary text-on-primary hover:bg-primary-container font-['Manrope'] text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isUrdu ? 'اپلوڈ ہو رہا ہے...' : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isUrdu ? 'تصویر محفوظ کریں' : 'Attach Photo'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Live Camera Capture Controls */
            <div className="flex items-center justify-between px-2">
              {/* Pick from Gallery Button */}
              <button
                type="button"
                onClick={handleSelectFromGallery}
                aria-label={isUrdu ? 'گیلری سے منتخب کریں' : 'Choose from Gallery'}
                className="w-12 h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                title={isUrdu ? 'گیلری سے فوٹو اپلوڈ کریں' : 'Pick from Gallery'}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Central Shutter Snap Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={!isCameraActive}
                aria-label={isUrdu ? 'تصویر کھینچیں' : 'Capture Photo'}
                className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-transform cursor-pointer ring-4 ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-full border-2 border-on-primary flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              {/* Flip Camera Button */}
              <button
                type="button"
                onClick={handleFlipCamera}
                disabled={!isCameraActive}
                aria-label={isUrdu ? 'کیمرہ تبدیل کریں' : 'Flip Camera'}
                className="w-12 h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-40"
                title={isUrdu ? 'کیمرہ بدلیں' : 'Flip Camera'}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Remove Current Photo Option (if item already has one) */}
          {currentImageUrl && !previewUrl && onRemovePhoto && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onRemovePhoto();
                onClose();
              }}
              className="w-full text-center py-2 text-xs font-semibold text-error hover:bg-error-container/20 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'موجودہ تصویر ہٹائیں' : 'Remove Current Photo'}</span>
            </button>
          )}
        </div>

        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
