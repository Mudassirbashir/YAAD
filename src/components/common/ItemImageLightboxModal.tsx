import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
}) => {
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
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none cursor-pointer animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={itemName}
    >
      {/* Edge-to-edge blurred photo backdrop layer */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />

      {/* Floating Close Button (Top-Right) */}
      <button
        id="item_image_lightbox_close_btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close photo preview"
        className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg border border-white/15"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Centered full-screen photo with viewport padding, no frame/border */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-2 sm:p-6"
      >
        <img
          src={imageUrl}
          alt={itemName}
          className="max-h-full max-w-full object-contain pointer-events-auto rounded-2xl shadow-2xl"
          onClick={(e) => {
            // Clicking photo also closes per "click anywhere closes"
            onClose();
          }}
        />
      </div>
    </div>
  );
};
