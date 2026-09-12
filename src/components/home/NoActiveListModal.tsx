import React from 'react';
import { ShoppingBag, Plus, Sparkles, X, ArrowRight } from 'lucide-react';
import { EssentialDisplayItem } from '../../lib/recommendations/popularEssentials';
import { useLanguage } from '../../context/LanguageContext';

interface NoActiveListModalProps {
  isOpen: boolean;
  item: EssentialDisplayItem | null;
  onClose: () => void;
  onAddToNewList: (item: EssentialDisplayItem) => void;
  onCreateListFirst: () => void;
}

export const NoActiveListModal: React.FC<NoActiveListModalProps> = ({
  isOpen,
  item,
  onClose,
  onAddToNewList,
  onCreateListFirst,
}) => {
  const { language } = useLanguage();

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="no_active_list_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="no_active_list_modal_title"
        className="relative w-full max-w-sm sm:max-w-md bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-xl border border-surface-dim/70 overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="no_active_list_modal_title"
              className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface"
            >
              {language === 'ur' ? 'کوئی فعال فہرست موجود نہیں' : 'No Active Shopping List'}
            </h3>
            <p className="font-['Manrope'] text-xs text-outline">
              {language === 'ur'
                ? 'خریداری شروع کرنے کے لیے ایک آپشن منتخب کریں'
                : 'Choose how you would like to begin shopping'}
            </p>
          </div>
        </div>

        {/* Selected Item Preview */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-dim/80 flex items-center justify-between gap-3 my-3">
          <div className="flex flex-col min-w-0">
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-on-surface truncate">
              {language === 'ur' && item.nameUrdu ? item.nameUrdu : item.displayName}
            </span>
            <span className="font-['Manrope'] text-xs text-outline">
              {item.quantity} {item.unit}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold font-['Manrope'] border border-primary/20 shrink-0">
            {language === 'ur' ? 'لازمی چیز' : 'Essential'}
          </span>
        </div>

        {/* Action Choices */}
        <div className="flex flex-col gap-2.5 mt-4">
          {/* Choice 1: Add to a new list */}
          <button
            type="button"
            id="add_to_new_list_btn"
            onClick={() => onAddToNewList(item)}
            className="w-full p-3 rounded-2xl bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary transition-all shadow-xs flex items-center justify-between gap-3 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-on-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold truncate">
                  {language === 'ur' ? 'نئی فہرست میں شامل کریں' : 'Add to a new list'}
                </span>
                <span className="font-['Manrope'] text-[11px] text-on-primary/80 truncate">
                  {language === 'ur'
                    ? 'فوری طور پر خریداری شروع کریں'
                    : 'Create a list and start shopping immediately'}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Choice 2: Create a list first */}
          <button
            type="button"
            id="create_list_first_btn"
            onClick={onCreateListFirst}
            className="w-full p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-[0.98] text-on-surface transition-all border border-surface-dim/80 flex items-center justify-between gap-3 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold truncate">
                  {language === 'ur' ? 'پہلے نئی فہرست بنائیں' : 'Create a list first'}
                </span>
                <span className="font-['Manrope'] text-[11px] text-outline truncate">
                  {language === 'ur'
                    ? 'اپنی فہرست کا نام اور تفصیلات منتخب کریں'
                    : 'Choose your list name and icon'}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-outline hover:text-on-surface py-1 px-3 rounded-full transition-colors cursor-pointer"
          >
            {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
