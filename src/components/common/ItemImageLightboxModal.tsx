import React, { useEffect } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ItemImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  itemName?: string;
  categoryName?: string;
}

export const ItemImageLightboxModal: React.FC<ItemImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  itemName = 'Item Photo',
  categoryName,
}) => {
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      id="item_image_lightbox_backdrop"
      onClick={onClose}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={itemName}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="item_image_lightbox_container"
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full max-h-[92vh] flex flex-col bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-zoom-in-95"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/10 shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/90 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans'] truncate">
                {itemName}
              </h3>
              {categoryName && (
                <p className="text-white/60 text-[11px] font-['Manrope'] truncate">
                  {categoryName}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo preview"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 flex items-center justify-center p-3 sm:p-4 bg-black/90 overflow-hidden min-h-[260px] sm:min-h-[360px]">
          <img
            src={imageUrl}
            alt={itemName}
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-2xl shadow-lg select-none"
          />
        </div>

        {/* Footer info badge */}
        <div className="px-4 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-primary-fixed" />
            <span>{language === 'ur' ? 'مکمل تصویر' : 'High Resolution Photo'}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white font-medium underline cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
