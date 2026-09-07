import React, { useState, useMemo } from 'react';
import { Plus, Check, Edit3, CheckCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { ShoppingList, ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import { BidiText, MixedQuantityBadge } from '../utils/bidi';
import { categorizeItemLocally, smartCategorizeItem } from '../lib/categorizer';
import { parseShoppingItem, parseMultiItemInput } from '../lib/recognition/engine';
import { detectDuplicateItem, mergeQuantities } from '../lib/recognition';
import { recordLearnedAlias } from '../lib/recognition/userAliases';
import { defaultCatalogSearchEngine, CatalogSearchResult } from '../lib/catalog';
import { playCompletionSound, playItemCheckSound, triggerHaptic } from '../lib/sound';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';
import { SmartSuggestionsSection } from './SmartSuggestionsSection';

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

    if (newItemText.trim()) {
      recordLearnedAlias(newItemText.trim(), {
        canonicalName: canonical.canonical_name,
        categoryId: finalCategory,
        canonicalId: canonical.id,
        isExplicitOverride: true,
      }).catch(() => {});
    }

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

        // Record alias for repeated learning (offline-first)
        if (parsed.rawInput) {
          recordLearnedAlias(parsed.rawInput, {
            canonicalName: parsed.canonicalName || parsed.name,
            categoryId: parsed.suggestedCategoryId,
            isExplicitOverride: false,
          }).catch(() => {});
        }
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

  const handleItemCategoryChange = (itemId: string, newCategoryId: CategoryId) => {
    const target = list.items.find((i) => i.id === itemId);
    if (target) {
      recordLearnedAlias(target.rawInput || target.name, {
        canonicalName: target.canonicalName || target.name,
        categoryId: newCategoryId,
        isExplicitOverride: true,
      }).catch(() => {});
    }

    const updatedList: ShoppingList = {
      ...list,
      items: list.items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              categoryId: newCategoryId,
              category: getCategoryName(newCategoryId),
              userModifiedCategory: true,
              unresolved: false,
              confidence: 1.0,
            }
          : it
      ),
    };
    onUpdateList(updatedList);
  };

  const handleAddSmartSuggestion = (itemData: {
    name: string;
    canonicalName?: string;
    categoryId: CategoryId;
    quantity?: string;
    unit?: string;
    emoji?: string;
    nameUrdu?: string;
    nameRomanUrdu?: string;
  }) => {
    let updatedItems = [...list.items];
    const duplicateCheck = detectDuplicateItem(updatedItems, {
      canonicalName: itemData.canonicalName || itemData.name,
      englishName: itemData.name,
      nameUrdu: itemData.nameUrdu,
      nameRomanUrdu: itemData.nameRomanUrdu,
      categoryId: itemData.categoryId,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      rawInput: itemData.name,
      matchedVia: 'exact_item',
      quantity: itemData.quantity,
      unit: itemData.unit,
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
      const merged = mergeQuantities(
        duplicateCheck.existingItem.quantity,
        duplicateCheck.existingItem.unit,
        itemData.quantity,
        itemData.unit
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
      const newItem: ShoppingItem = {
        id: generateUUID(),
        name: itemData.name,
        canonicalName: itemData.canonicalName,
        canonical_name: itemData.canonicalName || itemData.name,
        original_input: itemData.name,
        original_name: itemData.name,
        normalized_item: itemData.canonicalName || itemData.name,
        normalized_name: itemData.name.toLowerCase(),
        nameUrdu: itemData.nameUrdu,
        nameRomanUrdu: itemData.nameRomanUrdu,
        quantity: itemData.quantity,
        unit: itemData.unit,
        planned_quantity: itemData.quantity,
        planned_unit: itemData.unit,
        rawInput: itemData.name,
        categoryId: itemData.categoryId,
        category: getCategoryName(itemData.categoryId),
        completed: false,
        confidence: 1.0,
        isRecognized: true,
        emoji: itemData.emoji,
      };
      updatedItems = [newItem, ...updatedItems];
    }

    onUpdateList({
      ...list,
      items: updatedItems,
      isCompleted: false,
    });
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
    <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-primary-container selection:text-on-primary-container">
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
              className="absolute end-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0F3D2E] text-white rounded-full flex items-center justify-center hover:bg-[#145B3A] active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
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
                    <span className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform text-primary">
                      <CategoryIcon categoryId={sug.categoryId} className="w-4 h-4" />
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

        {/* Smart Suggestions Section (Deterministic & Explainable) */}
        <SmartSuggestionsSection
          listTitle={list.title}
          currentItems={list.items}
          onAddItem={handleAddSmartSuggestion}
        />

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

        {/* Empty State when list has no items */}
        {list.items.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-8 text-center border border-surface-container-high/60 my-4 flex flex-col items-center justify-center space-y-3 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-on-surface text-base sm:text-lg">
                {t('shoppingList.emptyTitle') || 'No items in this list yet'}
              </h3>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline">
                {t('shoppingList.emptySubtitle') || 'Type an item name above to start building your shopping list.'}
              </p>
            </div>
          </div>
        ) : (
          /* Grouped Shopping List Cards (Responsive 1-col on mobile, 2-col on tablet/desktop) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                                ? 'bg-[#0F3D2E] border-2 border-[#0F3D2E] shadow-2xs scale-105'
                                : 'border-2 border-outline/70 hover:border-[#0F3D2E] bg-transparent'
                            }`}
                          >
                            {isChecked && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
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
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={item.categoryId || 'uncategorized'}
                                onChange={(e) => handleItemCategoryChange(item.id, e.target.value as CategoryId)}
                                aria-label={`Change category for ${item.name}`}
                                className={`text-[10px] font-['Manrope'] font-medium px-1.5 py-0.5 rounded-md border outline-none cursor-pointer transition-colors ${
                                  item.categoryId === 'uncategorized'
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold'
                                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-dim/80'
                                }`}
                              >
                                {CATEGORIES_LIST.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {getCategoryName(c.id)}
                                  </option>
                                ))}
                              </select>
                              {item.categoryId === 'uncategorized' && (
                                <span className="text-[10px] font-['Manrope'] text-amber-600 dark:text-amber-400 font-semibold">
                                  Tap to assign
                                </span>
                              )}
                              {item.rawInput && item.rawInput.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                                <span className="text-[10px] font-['Manrope'] text-outline opacity-70 truncate max-w-[120px]">
                                  • typed: "<bdi>{item.rawInput}</bdi>"
                                </span>
                              )}
                            </div>
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
        )}

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

