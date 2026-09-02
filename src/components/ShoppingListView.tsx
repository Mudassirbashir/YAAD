import React, { useState } from 'react';
import { Plus, Check, Edit3, CheckCheck } from 'lucide-react';
import { ShoppingList, ShoppingItem, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { categorizeItemLocally, smartCategorizeItem } from '../lib/categorizer';
import { parseShoppingItem } from '../lib/itemParser';
import { playCompletionSound, playItemCheckSound, triggerHaptic } from '../lib/sound';
import { generateUUID } from '../lib/uuid';

interface ShoppingListViewProps {
  list: ShoppingList;
  onBack: () => void;
  onUpdateList: (updatedList: ShoppingList) => void;
  onCompleteTrip: (completedList: ShoppingList) => void;
  onEditList: (list: ShoppingList) => void;
  onOpenProfile: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  list,
  onBack,
  onUpdateList,
  onCompleteTrip,
  onEditList,
  onOpenProfile,
}) => {
  const { t, getCategoryName } = useLanguage();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [newItemText, setNewItemText] = useState<string>('');

  const totalItems = list.items.length;
  const completedItemsCount = list.items.filter((i) => i.completed).length;
  const percentComplete = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

  // Toggle item completed state with instant haptic & sound feedback
  const handleToggleItem = (itemId: string) => {
    let willBeChecked = false;

    const updatedItems = list.items.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        if (nextState) willBeChecked = true;
        return { ...item, completed: nextState };
      }
      return item;
    });

    const isAllCompleted = updatedItems.length > 0 && updatedItems.every((i) => i.completed);

    const updatedList: ShoppingList = {
      ...list,
      items: updatedItems,
      isCompleted: isAllCompleted,
    };

    onUpdateList(updatedList);

    // Haptic & Sound Feedback
    if (willBeChecked) {
      triggerHaptic(15);
      if (isAllCompleted) {
        // Final item completed -> sequence completion chime!
        playCompletionSound();
        setTimeout(() => {
          onCompleteTrip(updatedList);
        }, 400);
      } else {
        // Individual item tap
        playItemCheckSound();
      }
    }
  };

  // Add new inline item using natural language parser and smart categorizer
  const handleAddInlineItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    const parsed = parseShoppingItem(trimmed);
    const newItemId = generateUUID();

    const newItem: ShoppingItem = {
      id: newItemId,
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      rawInput: parsed.rawInput,
      categoryId: parsed.suggestedCategoryId,
      category: getCategoryName(parsed.suggestedCategoryId),
      completed: false,
    };

    const updatedList: ShoppingList = {
      ...list,
      items: [newItem, ...list.items],
      isCompleted: false,
    };

    onUpdateList(updatedList);
    setNewItemText('');

    // If low confidence local categorizer match, refine with AI in background
    const localResult = categorizeItemLocally(parsed.name);
    if (localResult.confidence < 0.8) {
      smartCategorizeItem(parsed.name)
        .then((aiResult) => {
          if (aiResult.categoryId && aiResult.categoryId !== parsed.suggestedCategoryId) {
            const refinedList: ShoppingList = {
              ...updatedList,
              items: updatedList.items.map((it) =>
                it.id === newItemId
                  ? {
                      ...it,
                      categoryId: aiResult.categoryId,
                      category: getCategoryName(aiResult.categoryId),
                    }
                  : it
              ),
            };
            onUpdateList(refinedList);
          }
        })
        .catch(() => {});
    }
  };

  // Extract unique categoryIds in this list
  const uniqueCategoryIds: CategoryId[] = Array.from(
    new Set(list.items.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  // Filter items by category if selected
  const displayedItems =
    selectedCategoryFilter === 'all'
      ? list.items
      : list.items.filter((i) => (i.categoryId || 'other') === selectedCategoryFilter);

  // Group displayed items by categoryId
  const groupedCategoryIds: CategoryId[] = Array.from(
    new Set(displayedItems.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <TopHeader
        title={t('appName')}
        showBack={true}
        onBack={onBack}
        onAvatarClick={onOpenProfile}
        rightAction={
          <button
            onClick={() => onEditList(list)}
            className="font-['Manrope'] text-sm font-bold text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-full transition-colors active:scale-95 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('shoppingList.editList')}</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 flex flex-col gap-5">
        {/* Header & Summary */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-primary tracking-tight truncate pr-2">
              {list.title}
            </h1>
            <span className="font-['Manrope'] text-sm text-on-surface-variant font-medium shrink-0">
              {t('home.itemsCount', { count: totalItems })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high rounded-full h-2.5 mt-1 overflow-hidden shadow-inner">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="flex justify-between font-['Manrope'] text-xs font-semibold text-outline">
            <span>
              {t('shoppingList.boughtSummary', { done: completedItemsCount, total: totalItems })}
            </span>
            <span>{t('shoppingList.percentComplete', { percent: percentComplete })}</span>
          </div>
        </div>

        {/* Add Item Input Bar */}
        <form
          onSubmit={handleAddInlineItem}
          className="relative w-full shadow-[0px_4px_20px_rgba(0,30,21,0.05)] rounded-full bg-surface-container-lowest border border-surface-container-high/60"
        >
          <input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="w-full h-[54px] pl-5 pr-14 rounded-full border-none bg-transparent focus:ring-2 focus:ring-primary/20 text-base text-on-surface placeholder:text-outline font-['Manrope'] outline-none"
            placeholder={t('shoppingList.inputPlaceholder')}
            type="text"
          />
          <button
            type="submit"
            aria-label="Add item"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Categories / Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-4 py-1.5 rounded-full font-['Manrope'] text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
              selectedCategoryFilter === 'all'
                ? 'border border-primary bg-primary text-on-primary shadow-xs'
                : 'border border-surface-container-high bg-surface-container-lowest text-primary hover:bg-surface-container-low'
            }`}
          >
            {t('shoppingList.allCategories')}
          </button>

          {uniqueCategoryIds.map((catId) => (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategoryFilter(catId)}
              className={`px-4 py-1.5 rounded-full font-['Manrope'] text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategoryFilter === catId
                  ? 'border border-primary bg-primary text-on-primary shadow-xs'
                  : 'border border-surface-container-high bg-surface-container-lowest text-primary hover:bg-surface-container-low'
              }`}
            >
              <CategoryIcon categoryId={catId} className="w-3.5 h-3.5" />
              <span>{getCategoryName(catId)}</span>
            </button>
          ))}
        </div>

        {/* Grouped Shopping List Cards */}
        <div className="flex flex-col gap-4">
          {groupedCategoryIds.map((catId) => {
            const categoryItems = displayedItems.filter(
              (i) => (i.categoryId || 'other') === catId
            );
            if (categoryItems.length === 0) return null;

            return (
              <div
                key={catId}
                className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0px_4px_20px_rgba(0,30,21,0.03)] border border-surface-container-high/60 animate-in fade-in duration-200"
              >
                <h2 className="font-['Manrope'] text-sm font-bold text-primary mb-3.5 tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CategoryIcon categoryId={catId} className="w-4 h-4 text-primary/80" />
                    <span>{getCategoryName(catId)}</span>
                  </span>
                  <span className="text-xs text-outline font-semibold">
                    {categoryItems.filter((i) => i.completed).length}/{categoryItems.length}
                  </span>
                </h2>

                <div className="flex flex-col gap-2.5">
                  {categoryItems.map((item) => {
                    const isChecked = item.completed;
                    const formattedQty = item.quantity
                      ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                      : item.note || null;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`flex items-center justify-between gap-3.5 p-3 rounded-2xl cursor-pointer select-none transition-all duration-200 ${
                          isChecked
                            ? 'bg-surface-container-low/60 opacity-60'
                            : 'bg-surface-bright hover:bg-surface-container-low border border-surface-dim/50'
                        }`}
                      >
                        {/* Custom Round Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                            isChecked
                              ? 'bg-secondary-container border-2 border-secondary-container shadow-xs scale-105'
                              : 'border-2 border-outline hover:border-primary bg-transparent'
                          }`}
                        >
                          {isChecked && (
                            <Check className="w-3.5 h-3.5 text-on-secondary-container stroke-[3]" />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={`font-['Manrope'] text-base transition-all truncate ${
                              isChecked
                                ? 'line-through text-outline font-normal'
                                : 'text-on-surface font-semibold group-hover:text-primary'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="font-['Manrope'] text-[11px] text-on-surface-variant font-medium">
                            {getCategoryName((item.categoryId || 'other') as CategoryId)}
                          </span>
                        </div>

                        {/* Quantity & Unit Badge */}
                        {formattedQty && (
                          <span
                            className={`font-['Manrope'] text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${
                              isChecked
                                ? 'bg-surface-container text-outline'
                                : 'bg-surface-container-high text-primary border border-surface-dim'
                            }`}
                          >
                            {formattedQty}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish Shopping Trip Button */}
        {completedItemsCount > 0 && (
          <div className="pt-2 pb-4">
            <button
              onClick={() => onCompleteTrip(list)}
              className="w-full h-[52px] rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{t('shoppingList.finishTrip')}</span>
              <CheckCheck className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

