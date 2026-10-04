import React, { useState, useRef } from 'react';
import { Plus, Search, Trash2, Check, ArrowLeft } from 'lucide-react';
import { ShoppingList, ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { saveUserCategoryOverride } from '../lib/categorizer';
import { parseMultiItemInput } from '../lib/recognition/engine';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';
import { playItemCheckSound, triggerHaptic } from '../lib/sound';
import { BidiText } from '../utils/bidi';

interface EditListViewProps {
  list: ShoppingList;
  onBack: () => void;
  onSave: (updatedList: ShoppingList) => void;
  onOpenProfile: () => void;
  onDeleteList?: (listId: string) => void;
}

export const EditListView: React.FC<EditListViewProps> = ({
  list,
  onBack,
  onSave,
  onOpenProfile,
  onDeleteList,
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const { theme, currentThemeConfig } = useAppTheme();
  const isUrdu = language === 'ur';

  const [title, setTitle] = useState<string>(list.title);
  const [items, setItems] = useState<ShoppingItem[]>(list.items);
  const [newItemName, setNewItemName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('vegetables');
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Transient feedback banner for added/removed items
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'add' | 'remove' } | null>(null);
  const feedbackTimerRef = useRef<any>(null);

  const showFeedbackToast = (message: string, type: 'add' | 'remove' = 'add') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackToast({ message, type });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 3000);
  };

  const plusBg = theme === 'default' ? '#000000' : currentThemeConfig?.primary || '#000000';

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const parsedItems = parseMultiItemInput(trimmed);
    if (parsedItems.length === 0) return;

    const newShoppingItems: ShoppingItem[] = parsedItems.map((parsed) => {
      const catId = parsed.suggestedCategoryId || selectedCategory;
      return {
        id: generateUUID(),
        name: parsed.name,
        canonicalName: parsed.canonicalName,
        canonical_name: parsed.canonicalName || parsed.name,
        original_input: trimmed,
        original_name: parsed.rawInput || trimmed,
        normalized_item: parsed.canonicalName || parsed.name,
        normalized_name: parsed.rawInput || parsed.name.toLowerCase(),
        nameUrdu: parsed.nameUrdu,
        nameRomanUrdu: parsed.nameRomanUrdu,
        quantity: parsed.quantity,
        unit: parsed.unit,
        planned_quantity: parsed.quantity,
        planned_unit: parsed.unit,
        rawInput: parsed.rawInput,
        categoryId: catId,
        category: getCategoryName(catId),
        completed: false,
        confidence: parsed.confidence,
        isRecognized: parsed.isRecognized,
        unresolved: parsed.unresolved,
        emoji: parsed.emoji,
      };
    });

    setItems((prev) => [...newShoppingItems, ...prev]);
    setNewItemName('');
    triggerHaptic(15);
    playItemCheckSound();
    showFeedbackToast(
      language === 'ur'
        ? `"${trimmed}" لسٹ میں شامل ہو گیا`
        : `Added "${trimmed}" to list`,
      'add'
    );
  };

  const handleSaveQuantity = (itemId: string, newQty?: string, newUnit?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              unit: newUnit,
              planned_quantity: newQty,
              planned_unit: newUnit,
            }
          : item
      )
    );
    showFeedbackToast(
      language === 'ur' ? 'مقدار اپڈیٹ ہو گئی' : 'Updated quantity',
      'add'
    );
  };

  const handleUpdateItemCategory = (id: string, newCatId: CategoryId, itemName: string) => {
    saveUserCategoryOverride(itemName, newCatId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              categoryId: newCatId,
              category: getCategoryName(newCatId),
              userModifiedCategory: true,
            }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    triggerHaptic(8);
    const targetItem = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (targetItem) {
      showFeedbackToast(
        language === 'ur'
          ? `"${targetItem.name}" لسٹ سے ہٹا دیا گیا`
          : `Removed "${targetItem.name}"`,
        'remove'
      );
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim() || t('createList.suggestions.0');
    const updatedList: ShoppingList = {
      ...list,
      title: trimmedTitle,
      items,
      isCompleted: items.length > 0 && items.every((i) => i.completed),
    };
    onSave(updatedList);
  };

  // Group items by categoryId for organized sections
  const categoryIds: CategoryId[] = Array.from(
    new Set(items.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-32">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        showBack={true}
        onBack={onBack}
        onAvatarClick={onOpenProfile}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-5">
        {/* Header / List Name Input */}
        <div className="mb-1">
          <label className="sr-only" htmlFor="listName">
            {t('editList.title')}
          </label>
          <input
            id="listName"
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-b-2 border-primary focus:border-primary-container outline-none py-1 text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-primary transition-colors tracking-tight"
            placeholder={t('editList.namePlaceholder')}
            type="text"
          />
          <p className="text-on-surface-variant font-['Manrope'] text-xs sm:text-sm mt-1">
            {t('editList.editingCount', { count: items.length })}
          </p>
        </div>

        {/* Transient Feedback Banner */}
        {feedbackToast && (
          <div
            className={`p-2.5 rounded-xl text-xs font-['Manrope'] font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 ${
              feedbackToast.type === 'remove'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
            <span className="truncate">{feedbackToast.message}</span>
          </div>
        )}

        {/* Add Item Input */}
        <div className="space-y-2.5">
          <form
            onSubmit={handleAddItem}
            className="relative w-full shadow-[0px_4px_20px_rgba(0,30,21,0.05)] rounded-full bg-surface-container-lowest border border-surface-container-high/60"
          >
            <input
              dir="auto"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full h-[54px] ps-5 pe-14 rounded-full border-none bg-transparent focus:ring-2 focus:ring-primary/20 text-base text-on-surface placeholder:text-outline font-['Manrope'] outline-none"
              placeholder={t('editList.inputPlaceholder')}
              type="text"
            />
            <button
              type="submit"
              aria-label="Add item"
              style={{ backgroundColor: plusBg }}
              className="absolute end-1.5 top-1/2 -translate-y-1/2 w-10 h-10 text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
            {CATEGORIES_LIST.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-['Manrope'] text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest border border-surface-container-high text-primary hover:bg-surface-container-low'
                }`}
              >
                <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
                <span>{getCategoryName(cat.id)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List Items Container with Unified 3-Tier Card Design */}
        <div className="space-y-4">
          {categoryIds.length === 0 ? (
            <div className="p-8 text-center text-outline font-['Manrope'] text-sm bg-surface-container-lowest rounded-3xl border border-surface-container-high/60">
              {t('editList.emptyList')}
            </div>
          ) : (
            categoryIds.map((catId) => {
              const catItems = items.filter((i) => (i.categoryId || 'other') === catId);
              if (catItems.length === 0) return null;

              return (
                <div
                  key={catId}
                  className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-container-high/60 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center pb-1 border-b border-surface-container-high/40">
                    <h3 className="font-['Manrope'] text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <CategoryIcon categoryId={catId} className="w-4 h-4 text-primary/70" />
                      <span>{getCategoryName(catId)}</span>
                    </h3>
                    <span className="text-xs text-outline font-semibold">
                      {catItems.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {catItems.map((item) => {
                      const itemCatId = (item.categoryId || 'other') as CategoryId;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim/70 transition-all gap-3 shadow-2xs"
                        >
                          {/* Left: Item Logo + 3-Tier Info (Name, Quantity, Category) */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <ItemVisualIcon
                              name={item.name}
                              canonicalName={item.canonicalName}
                              displayName={item.name}
                              categoryId={itemCatId}
                              size={36}
                              className="w-9 h-9 rounded-xl shrink-0"
                            />

                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                              {/* Line 1: Item Name */}
                              <div className="flex items-center gap-1.5 truncate" dir="auto">
                                <BidiText
                                  as="span"
                                  className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary truncate block"
                                >
                                  {item.name}
                                </BidiText>
                                {item.nameUrdu && !isUrdu && item.nameUrdu !== item.name && (
                                  <span className="font-urdu text-xs text-on-surface-variant font-normal shrink-0">
                                    ({item.nameUrdu})
                                  </span>
                                )}
                              </div>

                              {/* Line 2: Quantity (below name) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(item);
                                }}
                                className="text-xs font-['Manrope'] font-medium text-primary/80 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer w-fit text-start"
                                title="Tap to change quantity"
                              >
                                <span className="bg-surface-container px-2 py-0.5 rounded-md border border-surface-dim/60 font-semibold text-[11px]">
                                  {item.quantity
                                    ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                                    : '1x'}
                                </span>
                              </button>

                              {/* Line 3: Category (below quantity) */}
                              <div
                                className="flex items-center gap-1 text-[11px] font-['Manrope'] text-on-surface-variant"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <CategoryIcon
                                  categoryId={itemCatId}
                                  className="w-3 h-3 text-primary/60 shrink-0"
                                />
                                <select
                                  value={itemCatId}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleUpdateItemCategory(
                                      item.id,
                                      e.target.value as CategoryId,
                                      item.name
                                    );
                                  }}
                                  aria-label={`Change category for ${item.name}`}
                                  className="bg-transparent outline-none cursor-pointer hover:text-primary transition-colors truncate max-w-[140px] text-[11px]"
                                >
                                  {CATEGORIES_LIST.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {getCategoryName(c.id)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Right: Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            aria-label={`Remove ${item.name}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Delete List Button */}
          {onDeleteList && (
            <div className="pt-8 pb-24 flex justify-center">
              <button
                type="button"
                id="edit_list_delete_btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-full bg-transparent text-rose-700 dark:text-rose-400 font-['Manrope'] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-5 py-2.5 transition-colors active:scale-95 cursor-pointer border border-rose-200 dark:border-rose-900/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete') || 'Delete List'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete List Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-surface-dim space-y-4 animate-scale-in"
          >
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-on-surface truncate">
                  {t('delete') || 'Delete List'}
                </h3>
                <p className="text-xs text-outline font-['Manrope'] truncate">
                  {list.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete this shopping list? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-full bg-surface-container text-on-surface font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                id="confirm_delete_list_edit_btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteList?.(list.id);
                }}
                className="h-11 rounded-full bg-rose-600 text-white font-['Manrope'] text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Edit Modal */}
      <QuantityEditModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveQuantity}
      />

      {/* Floating Save Action */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-5xl mx-auto z-40 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8 px-5 flex justify-center pointer-events-none">
        <button
          onClick={handleSave}
          className="pointer-events-auto bg-primary text-on-primary font-['Manrope'] font-bold rounded-full h-[56px] px-8 w-full max-w-md shadow-[0px_8px_24px_rgba(0,30,21,0.2)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t('editList.saveChanges')}</span>
          <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
