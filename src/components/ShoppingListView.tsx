import React, { useState, useMemo } from 'react';
import { Plus, Check, Edit3, CheckCheck, Sparkles } from 'lucide-react';
import { ShoppingList, ShoppingItem, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { BidiText, MixedQuantityBadge } from '../utils/bidi';
import { categorizeItemLocally, smartCategorizeItem } from '../lib/categorizer';
import { parseShoppingItem, parseMultiItemInput } from '../lib/recognition/engine';
import { detectDuplicateItem, mergeQuantities } from '../lib/recognition';
import { defaultCatalogSearchEngine, CatalogSearchResult } from '../lib/catalog';
import { playCompletionSound, playItemCheckSound, triggerHaptic } from '../lib/sound';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';

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
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const handleSaveQuantity = (itemId: string, newQty?: string, newUnit?: string) => {
    const updatedList: ShoppingList = {
      ...list,
      items: list.items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              quantity: newQty,
              unit: newUnit,
              planned_quantity: newQty,
              planned_unit: newUnit,
            }
          : it
      ),
    };
    onUpdateList(updatedList);
  };

  const quickAddParsed = useMemo(() => {
    const trimmed = newItemText.trim();
    if (!trimmed) return null;
    return parseShoppingItem(trimmed);
  }, [newItemText]);

  // Real-time catalog search suggestions
  const searchSuggestions: CatalogSearchResult[] = useMemo(() => {
    const trimmed = newItemText.trim();
    if (!trimmed) return [];
    return defaultCatalogSearchEngine.search(trimmed, 3);
  }, [newItemText]);

  const handleSelectSuggestion = (suggestion: CatalogSearchResult) => {
    const canonical = suggestion.item;
    const finalCategory = suggestion.categoryId;

    const duplicateCheck = detectDuplicateItem(list.items, {
      canonicalName: canonical.canonical_name,
      englishName: canonical.english_name,
      nameUrdu: canonical.urdu_name,
      nameRomanUrdu: canonical.roman_urdu_names[0],
      categoryId: finalCategory,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      rawInput: newItemText,
      matchedVia: 'exact_item',
      quantity: suggestion.parsedQuantity,
      unit: suggestion.parsedUnit || canonical.default_unit,
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
      const merged = mergeQuantities(
        duplicateCheck.existingItem.quantity,
        duplicateCheck.existingItem.unit,
        suggestion.parsedQuantity,
        suggestion.parsedUnit || canonical.default_unit
      );
      const updatedList: ShoppingList = {
        ...list,
        items: list.items.map((it) =>
          it.id === duplicateCheck.existingItem!.id
            ? {
                ...it,
                quantity: merged.quantity,
                unit: merged.unit,
                completed: false,
              }
            : it
        ),
        isCompleted: false,
      };
      onUpdateList(updatedList);
      setNewItemText('');
      return;
    }

    const newItemId = generateUUID();
    const newItem: ShoppingItem = {
      id: newItemId,
      name: canonical.english_name,
      canonicalName: canonical.canonical_name,
      canonical_name: canonical.canonical_name,
      original_name: newItemText,
      normalized_name: newItemText.trim().toLowerCase(),
      nameUrdu: canonical.urdu_name,
      nameRomanUrdu: canonical.roman_urdu_names[0],
      quantity: suggestion.parsedQuantity,
      unit: suggestion.parsedUnit || canonical.default_unit,
      rawInput: newItemText,
      categoryId: finalCategory,
      category: getCategoryName(finalCategory),
      completed: false,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      emoji: suggestion.emoji,
    };

    const updatedList: ShoppingList = {
      ...list,
      items: [newItem, ...list.items],
      isCompleted: false,
    };

    onUpdateList(updatedList);
    setNewItemText('');
  };

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

    const parsedItems = parseMultiItemInput(trimmed);
    if (parsedItems.length === 0) return;

    let updatedItems = [...list.items];

    for (const parsed of parsedItems) {
      // Check if equivalent item already exists in the list (e.g. aloo vs potato)
      const duplicateCheck = detectDuplicateItem(updatedItems, {
        canonicalName: parsed.canonicalName || parsed.name,
        englishName: parsed.canonicalName || parsed.name,
        nameUrdu: parsed.nameUrdu,
        nameRomanUrdu: parsed.nameRomanUrdu,
        categoryId: parsed.suggestedCategoryId,
        confidence: parsed.confidence || 0.9,
        isRecognized: !!parsed.isRecognized,
        unresolved: !!parsed.unresolved,
        rawInput: parsed.rawInput,
        matchedVia: 'exact_item',
        quantity: parsed.quantity,
        unit: parsed.unit,
      });

      if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
        const merged = mergeQuantities(
          duplicateCheck.existingItem.quantity,
          duplicateCheck.existingItem.unit,
          parsed.quantity,
          parsed.unit
        );
        updatedItems = updatedItems.map((it) =>
          it.id === duplicateCheck.existingItem!.id
            ? {
                ...it,
                quantity: merged.quantity,
                unit: merged.unit,
                planned_quantity: merged.quantity,
                planned_unit: merged.unit,
                completed: false,
              }
            : it
        );
      } else {
        const newItemId = generateUUID();
        const newItem: ShoppingItem = {
          id: newItemId,
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
          categoryId: parsed.suggestedCategoryId,
          category: getCategoryName(parsed.suggestedCategoryId),
          completed: false,
          confidence: parsed.confidence,
          isRecognized: parsed.isRecognized,
          unresolved: parsed.unresolved,
          emoji: parsed.emoji,
        };

        updatedItems = [newItem, ...updatedItems];
      }
    }

    const updatedList: ShoppingList = {
      ...list,
      items: updatedItems,
      isCompleted: false,
    };

    onUpdateList(updatedList);
    setNewItemText('');
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
        <div className="space-y-2">
          <form
            onSubmit={handleAddInlineItem}
            className="relative w-full shadow-[0px_4px_20px_rgba(0,30,21,0.05)] rounded-full bg-surface-container-lowest border border-surface-container-high/60"
          >
            <input
              dir="auto"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full h-[54px] ps-5 pe-14 rounded-full border-none bg-transparent focus:ring-2 focus:ring-primary/20 text-base text-on-surface placeholder:text-outline font-['Manrope'] outline-none"
              placeholder={t('shoppingList.inputPlaceholder')}
              type="text"
            />
            <button
              type="submit"
              aria-label="Add item"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Real-time Catalog Search Suggestions */}
          {searchSuggestions.length > 0 && newItemText.trim().length > 0 && (
            <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {searchSuggestions.map((sug) => (
                  <button
                    key={sug.item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all text-start group active:scale-[0.99] cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center text-lg shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                      {sug.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-['Manrope'] font-bold text-xs text-primary truncate">
                          {sug.displayName}
                        </span>
                        {sug.item.urdu_name && (
                          <span className="font-urdu text-[11px] text-on-surface-variant shrink-0">
                            ({sug.item.urdu_name})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-['Manrope'] flex items-center gap-1">
                        <CategoryIcon categoryId={sug.categoryId} className="w-2.5 h-2.5 text-primary/70" />
                        <span>{getCategoryName(sug.categoryId)}</span>
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-primary/70 group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Recognition Badge */}
          {quickAddParsed && newItemText.trim().length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-surface-container-low border border-surface-container-high/80 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CategoryIcon categoryId={quickAddParsed.suggestedCategoryId} className="w-3 h-3" />
                </span>
                <BidiText className="font-bold text-primary truncate">
                  {quickAddParsed.name}
                </BidiText>
                {quickAddParsed.nameUrdu && (
                  <span className="font-urdu text-xs text-on-surface-variant font-normal shrink-0">
                    ({quickAddParsed.nameUrdu})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ms-auto">
                {quickAddParsed.quantity && (
                  <MixedQuantityBadge
                    quantity={quickAddParsed.quantity}
                    unit={quickAddParsed.unit}
                    className="px-2 py-0.5 rounded-md bg-surface-container text-primary text-[11px] font-bold"
                  />
                )}
                <span className="text-[11px] font-['Manrope'] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>{getCategoryName(quickAddParsed.suggestedCategoryId)}</span>
                </span>
              </div>
            </div>
          )}
        </div>

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
                    const plannedQty = item.planned_quantity || item.quantity;
                    const plannedUnit = item.planned_unit || item.unit;
                    const formattedQty = plannedQty
                      ? `${plannedQty}${plannedUnit ? ' ' + plannedUnit : ''}`
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
                          <div className="flex items-center gap-1.5 flex-wrap" dir="auto">
                            <BidiText
                              className={`font-['Manrope'] text-base transition-all truncate ${
                                isChecked
                                  ? 'line-through text-outline font-normal'
                                  : 'text-on-surface font-semibold group-hover:text-primary'
                              }`}
                            >
                              {item.name}
                            </BidiText>
                            {item.nameUrdu && (
                              <span
                                className={`font-urdu text-xs transition-opacity ${
                                  isChecked ? 'opacity-50 text-outline' : 'text-on-surface-variant font-normal'
                                }`}
                              >
                                ({item.nameUrdu})
                              </span>
                            )}
                          </div>
                          <span className="font-['Manrope'] text-[11px] text-on-surface-variant font-medium">
                            {getCategoryName((item.categoryId || 'other') as CategoryId)}
                            {item.rawInput && item.rawInput.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                              <span className="opacity-70 ms-1">
                                • typed: "<bdi>{item.rawInput}</bdi>"
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Quantity & Unit Badge (Tappable to modify) */}
                        {formattedQty ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            title="Tap to change quantity or unit"
                            className={`font-['Manrope'] tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all active:scale-95 cursor-pointer ${
                              isChecked
                                ? 'bg-surface-container text-outline hover:bg-surface-container-high'
                                : 'bg-surface-container-high hover:bg-surface-container text-primary border border-surface-dim shadow-2xs'
                            }`}
                          >
                            <bdi dir="ltr">{formattedQty}</bdi>
                          </button>
                        ) : !isChecked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            title="Add quantity"
                            className="text-[11px] font-['Manrope'] font-semibold text-outline hover:text-primary px-2 py-0.5 rounded-md hover:bg-surface-container transition-colors shrink-0"
                          >
                            + qty
                          </button>
                        ) : null}
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

      {/* Quantity Edit Modal */}
      <QuantityEditModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveQuantity}
      />
    </div>
  );
};

