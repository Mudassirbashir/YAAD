import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, ShoppingBag, ListPlus, X } from 'lucide-react';
import { EssentialDisplayItem } from '../../lib/recommendations/popularEssentials';
import { ShoppingList } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AddItemToListChoiceModalProps {
  isOpen: boolean;
  item: EssentialDisplayItem | null;
  lists: ShoppingList[];
  onClose: () => void;
  onAddToList: (item: EssentialDisplayItem, listId: string) => void;
  onCreateNewList: (item: EssentialDisplayItem) => void;
}

export const AddItemToListChoiceModal: React.FC<AddItemToListChoiceModalProps> = ({
  isOpen,
  item,
  lists,
  onClose,
  onAddToList,
  onCreateNewList,
}) => {
  const { language } = useLanguage();

  if (!isOpen || !item) return null;

  // Active / non-completed lists first
  const activeLists = lists.filter((l) => !l.isCompleted);
  const otherLists = lists.filter((l) => l.isCompleted);
  const displayLists = [...activeLists, ...otherLists];

  const isUrdu = language === 'ur';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="w-full sm:max-w-md bg-white dark:bg-surface-container-lowest rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-surface-dim/70 overflow-hidden select-none"
          onClick={(e) => e.stopPropagation()}
          dir={isUrdu ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-dim/60">
            <div>
              <h3 className="font-display text-lg font-bold text-on-surface">
                {isUrdu ? 'لسٹ منتخب کریں' : 'Choose Shopping List'}
              </h3>
              <p className="font-body text-xs text-outline mt-0.5">
                {isUrdu
                  ? `"${item.nameUrdu || item.displayName}" کو کس لسٹ میں شامل کرنا ہے؟`
                  : `Where would you like to add "${item.displayName}"?`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action 1: Create a Brand New List */}
          <div className="pt-4 pb-2">
            <button
              type="button"
              id="choice_modal_create_new_list_btn"
              onClick={() => onCreateNewList(item)}
              className="w-full p-3.5 rounded-2xl bg-primary hover:bg-[#0c3125] text-white active:scale-[0.98] transition-all shadow-xs flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <ListPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0 text-start">
                  <span className="font-display text-sm font-bold truncate">
                    {isUrdu ? 'نئی لسٹ بنائیں' : 'Create New List'}
                  </span>
                  <span className="font-body text-[11px] text-white/80 truncate">
                    {isUrdu ? 'نئی لسٹ میں یہ آئٹم شامل کریں' : `Start a new list with ${item.displayName}`}
                  </span>
                </div>
              </div>
              <Plus className="w-5 h-5 text-white shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Action 2: Existing Lists Option */}
          {displayLists.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-body block mb-2 px-1">
                {isUrdu ? 'یا پرانی لسٹ میں شامل کریں' : 'Or add to an existing list'}
              </span>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 -mr-1">
                {displayLists.map((list) => {
                  const itemCount = (list.items || []).length;
                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => onAddToList(item, list.id)}
                      className="w-full p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-[0.99] text-on-surface transition-all border border-surface-dim/70 flex items-center justify-between gap-3 text-start cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center shrink-0 text-primary border border-surface-dim/60">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-display text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {list.title}
                          </span>
                          <span className="font-body text-[11px] text-outline truncate">
                            {itemCount} {isUrdu ? 'اشیاء' : itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Simple Close */}
          <div className="pt-3 mt-1 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-outline hover:text-on-surface py-2 px-4 rounded-full transition-colors cursor-pointer"
            >
              {isUrdu ? 'بند کریں' : 'Cancel'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
