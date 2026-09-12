import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShoppingCart,
  AlertCircle,
  Package,
  Check,
  Search,
  X,
} from 'lucide-react';
import { CategoryId, CATEGORIES_LIST, ShoppingItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';
import { BidiText } from '../utils/bidi';
import { saveUserCategoryOverride } from '../lib/categorizer';
import { parseShoppingItem, parseMultiItemInput } from '../lib/recognition/engine';
import { detectDuplicateItem, mergeQuantities } from '../lib/recognition';
import { saveUserCustomAlias, recordLearnedAlias } from '../lib/recognition/userAliases';
import { normalizeBaseText } from '../lib/recognition/normalizer';
import { defaultCatalogSearchEngine, CatalogSearchResult } from '../lib/catalog';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';
import { useRecommendations, RecommendationCandidate } from '../lib/recommendations';
import { getSuggestionsForContext } from '../lib/recommendations/shoppingContexts';
import { triggerHaptic } from '../lib/sound';

export interface AddItemsViewProps {
  listTitle: string;
  initialItems?: ShoppingItem[];
  contextId?: string;
  onBack: () => void;
  onStartShopping: (items: ShoppingItem[]) => void;
  onItemsChange?: (items: ShoppingItem[]) => void;
}

export const AddItemsView: React.FC<AddItemsViewProps> = ({
  listTitle,
  initialItems = [],
  contextId,
  onBack,
  onStartShopping,
  onItemsChange,
}) => {
  const { t, getCategoryName } = useLanguage();
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [inputVal, setInputVal] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('vegetables');
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'add' | 'merge' | 'remove';
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionTimestampRef = useRef<number>(0);
  const lastAddedKeyRef = useRef<string>('');

  // Synchronize items with parent
  const updateItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  const showToast = (message: string, type: 'add' | 'merge' | 'remove' = 'add') => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedbackToast({ message, type });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  // Context-specific suggestions
  const contextData = useMemo(() => {
    return getSuggestionsForContext(contextId, listTitle);
  }, [contextId, listTitle]);

  // Dynamic co-purchase recommendations
  const { recommendations } = useRecommendations({
    listTitle,
    currentListItems: items,
    limit: 6,
  });

  // Real-time Catalog Search Suggestions
  const searchSuggestions: CatalogSearchResult[] = useMemo(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) return [];
    return defaultCatalogSearchEngine.search(trimmed, 5, {
      frequentlyBoughtNames: new Set(
        recommendations.map((r) => normalizeBaseText(r.canonicalName))
      ),
    });
  }, [inputVal, recommendations]);

  // Auto-detect category from input if user hasn't manually clicked one
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      if (!userManuallySelectedCategory) {
        setSelectedCategory('vegetables');
      }
      return;
    }

    if (!userManuallySelectedCategory) {
      const parsed = parseShoppingItem(trimmed);
      if (parsed.suggestedCategoryId) {
        setSelectedCategory(parsed.suggestedCategoryId);
      }
    }
  }, [inputVal, userManuallySelectedCategory]);

  /**
   * Helper to find if an item name or canonical name is already in the list
   */
  const findItemInList = (nameOrCanonical: string): ShoppingItem | undefined => {
    const norm = normalizeBaseText(nameOrCanonical);
    return items.find((it) => {
      const itCanon = it.canonicalName ? normalizeBaseText(it.canonicalName) : '';
      const itName = normalizeBaseText(it.name);
      const itRaw = it.rawInput ? normalizeBaseText(it.rawInput) : '';
      return itCanon === norm || itName === norm || itRaw === norm;
    });
  };

  /**
   * Unified Item Adder: Handles raw strings, catalog search results, or recommendation taps.
   * Handles duplicate detection, quantity merging, and clear visual feedback.
   */
  const handleUnifiedAddItem = (
    rawOrName: string,
    options?: {
      canonicalName?: string;
      englishName?: string;
      urduName?: string;
      romanUrduNames?: string[];
      categoryId?: CategoryId;
      quantity?: string;
      unit?: string;
      emoji?: string;
      matchedVia?: string;
    }
  ) => {
    const trimmed = rawOrName.trim();
    if (!trimmed) {
      setInputError(t('addItems.errorEmpty') || 'Please enter an item name');
      return;
    }

    // Double tap protection
    const now = Date.now();
    const actionKey = `${trimmed.toLowerCase()}_${options?.canonicalName || ''}`;
    if (now - lastActionTimestampRef.current < 350 && lastAddedKeyRef.current === actionKey) {
      return;
    }
    lastActionTimestampRef.current = now;
    lastAddedKeyRef.current = actionKey;
    triggerHaptic(10);

    // If options provided directly from catalog search result
    if (options && options.canonicalName) {
      const finalCategory = options.categoryId || selectedCategory || 'vegetables';
      const displayName = options.englishName || options.canonicalName;

      // Duplicate detection
      const duplicateCheck = detectDuplicateItem(items, {
        canonicalName: options.canonicalName,
        englishName: displayName,
        nameUrdu: options.urduName,
        nameRomanUrdu: options.romanUrduNames?.[0],
        categoryId: finalCategory,
        confidence: 1.0,
        isRecognized: true,
        unresolved: false,
        rawInput: trimmed,
        matchedVia: 'exact_item',
        quantity: options.quantity,
        unit: options.unit,
      });

      if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
        const merged = mergeQuantities(
          duplicateCheck.existingItem.quantity,
          duplicateCheck.existingItem.unit,
          options.quantity,
          options.unit
        );
        const updated = items.map((item) =>
          item.id === duplicateCheck.existingItem!.id
            ? {
                ...item,
                quantity: merged.quantity,
                unit: merged.unit,
                completed: false,
              }
            : item
        );
        updateItems(updated);
        showToast(
          `Updated ${displayName} quantity (${merged.quantity || '1'}${merged.unit ? ' ' + merged.unit : ''})`,
          'merge'
        );
        setInputVal('');
        setInputError('');
        setUserManuallySelectedCategory(false);
        return;
      }

      // New item creation
      const newItemId = generateUUID();
      const newItem: ShoppingItem = {
        id: newItemId,
        name: displayName,
        canonicalName: options.canonicalName,
        canonical_name: options.canonicalName,
        original_name: trimmed,
        normalized_name: trimmed.toLowerCase(),
        nameUrdu: options.urduName,
        nameRomanUrdu: options.romanUrduNames?.[0],
        quantity: options.quantity,
        unit: options.unit,
        rawInput: trimmed,
        categoryId: finalCategory,
        category: getCategoryName(finalCategory),
        completed: false,
        userModifiedCategory: false,
        confidence: 1.0,
        isRecognized: true,
        unresolved: false,
        emoji: options.emoji,
      };

      updateItems([newItem, ...items]);
      showToast(`Added ${displayName}`, 'add');
      setInputVal('');
      setInputError('');
      setUserManuallySelectedCategory(false);
      return;
    }

    // Parse multi-item or single item input string
    const parsedItems = parseMultiItemInput(trimmed);
    if (parsedItems.length === 0) {
      setInputError(t('addItems.errorEmpty') || 'Please enter an item name');
      return;
    }

    let updatedList = [...items];
    const addedNames: string[] = [];

    for (const parsed of parsedItems) {
      let finalCategory = selectedCategory;

      if (!userManuallySelectedCategory) {
        finalCategory = parsed.suggestedCategoryId || selectedCategory;
      } else {
        saveUserCategoryOverride(parsed.name, selectedCategory);
      }

      const duplicateCheck = detectDuplicateItem(updatedList, {
        canonicalName: parsed.canonicalName || parsed.name,
        englishName: parsed.canonicalName || parsed.name,
        nameUrdu: parsed.nameUrdu,
        nameRomanUrdu: parsed.nameRomanUrdu,
        categoryId: finalCategory,
        confidence: parsed.confidence || 0.9,
        isRecognized: !!parsed.isRecognized,
        unresolved: !!parsed.unresolved,
        rawInput: parsed.rawInput || trimmed,
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
        updatedList = updatedList.map((item) =>
          item.id === duplicateCheck.existingItem!.id
            ? {
                ...item,
                quantity: merged.quantity,
                unit: merged.unit,
                completed: false,
              }
            : item
        );
        addedNames.push(
          `Updated ${duplicateCheck.existingItem.name} (${merged.quantity || '1'}${merged.unit ? ' ' + merged.unit : ''})`
        );
      } else {
        const newItemId = generateUUID();
        const displayName = parsed.canonicalName || parsed.name;
        const newItem: ShoppingItem = {
          id: newItemId,
          name: displayName,
          canonicalName: parsed.canonicalName,
          canonical_name: parsed.canonicalName || parsed.name,
          original_input: trimmed,
          original_name: parsed.rawInput || trimmed,
          normalized_item: parsed.canonicalName || parsed.name,
          normalized_name: trimmed.toLowerCase(),
          nameUrdu: parsed.nameUrdu,
          nameRomanUrdu: parsed.nameRomanUrdu,
          quantity: parsed.quantity,
          unit: parsed.unit,
          rawInput: parsed.rawInput || trimmed,
          categoryId: finalCategory,
          category: getCategoryName(finalCategory),
          completed: false,
          userModifiedCategory: userManuallySelectedCategory,
          confidence: parsed.confidence || 0.9,
          isRecognized: !!parsed.isRecognized,
          unresolved: !parsed.isRecognized,
          emoji: parsed.emoji,
        };

        updatedList = [newItem, ...updatedList];
        addedNames.push(`Added ${displayName}`);
      }
    }

    updateItems(updatedList);
    if (addedNames.length > 0) {
      showToast(addedNames[0]);
    }
    setInputVal('');
    setInputError('');
    setUserManuallySelectedCategory(false);
  };

  /**
   * Handle Custom Unrecognized Item Addition
   */
  const handleAddCustomItem = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    const chosenCat = userManuallySelectedCategory ? selectedCategory : 'uncategorized';
    const newItemId = generateUUID();
    const newItem: ShoppingItem = {
      id: newItemId,
      name: trimmed,
      canonicalName: undefined,
      canonical_name: undefined,
      original_name: trimmed,
      normalized_name: trimmed.toLowerCase(),
      categoryId: chosenCat,
      category: chosenCat === 'uncategorized' ? 'Uncategorized' : getCategoryName(chosenCat),
      completed: false,
      userModifiedCategory: userManuallySelectedCategory,
      confidence: 0.3,
      isRecognized: false,
      unresolved: true,
      rawInput: trimmed,
    };

    updateItems([newItem, ...items]);
    showToast(`Added custom item: "${trimmed}"`);
    setInputVal('');
    setInputError('');
    setUserManuallySelectedCategory(false);
  };

  const handleSelectSuggestion = (suggestion: CatalogSearchResult) => {
    const canonical = suggestion.item;
    if (inputVal.trim()) {
      saveUserCustomAlias(inputVal.trim(), {
        canonicalName: canonical.canonical_name,
        categoryId: suggestion.categoryId,
        canonicalId: canonical.id,
      });
    }

    handleUnifiedAddItem(suggestion.displayName, {
      canonicalName: canonical.canonical_name,
      englishName: canonical.english_name,
      urduName: canonical.urdu_name,
      romanUrduNames: canonical.roman_urdu_names,
      categoryId: suggestion.categoryId,
      quantity: suggestion.parsedQuantity,
      unit: suggestion.parsedUnit || canonical.default_unit,
      emoji: suggestion.emoji,
    });
  };

  const handleSelectRecommendation = (candidate: RecommendationCandidate) => {
    handleUnifiedAddItem(candidate.displayName || candidate.canonicalName, {
      canonicalName: candidate.canonicalName,
      englishName: candidate.displayName || candidate.canonicalName,
      urduName: candidate.nameUrdu,
      romanUrduNames: candidate.nameRomanUrdu ? [candidate.nameRomanUrdu] : undefined,
      categoryId: candidate.category,
      quantity: candidate.suggestedQuantity,
      unit: candidate.suggestedUnit,
      emoji: candidate.emoji,
    });
  };

  const handleRemoveItem = (itemId: string) => {
    triggerHaptic(8);
    const removedItem = items.find((i) => i.id === itemId);
    const filtered = items.filter((i) => i.id !== itemId);
    updateItems(filtered);
    if (removedItem) {
      showToast(`Removed ${removedItem.name}`, 'remove');
    }
  };

  const handleSaveQuantity = (
    itemId: string,
    quantity?: string,
    unit?: string,
    notes?: string
  ) => {
    const updated = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: quantity?.trim() || undefined,
            unit: unit?.trim() || undefined,
            notes: notes?.trim() || undefined,
          }
        : item
    );
    updateItems(updated);
    setEditingItem(null);
    showToast('Updated quantity', 'merge');
  };

  const handleItemCategoryChange = (
    itemId: string,
    newCategoryId: CategoryId,
    itemName: string
  ) => {
    saveUserCategoryOverride(itemName, newCategoryId);
    const existing = items.find((i) => i.id === itemId);
    if (existing) {
      recordLearnedAlias(existing.rawInput || existing.name, {
        canonicalName: existing.canonicalName || existing.name,
        categoryId: newCategoryId,
        isExplicitOverride: true,
      }).catch(() => {});
    }
    const updated = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            categoryId: newCategoryId,
            category: getCategoryName(newCategoryId),
            userModifiedCategory: true,
            unresolved: false,
            confidence: 1.0,
          }
        : item
    );
    updateItems(updated);
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col antialiased bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 h-14 w-full max-w-6xl mx-auto">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 -ms-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
          </button>
          <BidiText
            as="h2"
            className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary truncate max-w-[220px] sm:max-w-md text-center"
          >
            {listTitle}
          </BidiText>
          <div className="w-10 flex justify-end">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-surface-container text-primary">
              {items.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: 1 col on mobile, 2 cols on iPad/desktop */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form, Suggestions, Categories */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Input Card */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-dim shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xl">
                  {t('addItems.title') || 'Add Items'}
                </h3>
                <span className="text-xs font-['Manrope'] text-on-surface-variant font-medium">
                  English, اردو, Roman Urdu
                </span>
              </div>

              {/* Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUnifiedAddItem(inputVal);
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <div className="absolute start-4 top-3.5 text-outline pointer-events-none">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    dir="auto"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      setUserManuallySelectedCategory(false);
                      if (inputError) setInputError('');
                    }}
                    placeholder="e.g. 2 kg chini, hari mirch, milk, fitkari..."
                    className="w-full h-12 bg-surface-container-low rounded-2xl ps-11 pe-24 text-sm sm:text-base text-on-surface font-['Manrope'] border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70"
                    autoFocus
                  />

                  {/* Clear Button */}
                  {inputVal && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputVal('');
                        inputRef.current?.focus();
                      }}
                      className="absolute end-13 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      aria-label="Clear input"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Add Button */}
                  <button
                    type="submit"
                    className="absolute end-1.5 top-1.5 w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-xs cursor-pointer"
                    aria-label="Add item"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {inputError && (
                  <p className="text-xs text-error font-['Manrope'] flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{inputError}</span>
                  </p>
                )}

                {/* Real-time Catalog Search Suggestions Dropdown */}
                {inputVal.trim().length > 0 && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-['Manrope'] font-bold text-outline uppercase tracking-wider block">
                        {searchSuggestions.length > 0
                          ? 'Catalog Matches'
                          : 'Custom Item'}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Tap to add instantly
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchSuggestions.map((sug) => {
                        const inListMatch = findItemInList(sug.item.canonical_name);
                        return (
                          <button
                            key={sug.item.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(sug)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all text-start group active:scale-[0.99] cursor-pointer"
                          >
                            <ItemVisualIcon
                              name={sug.displayName}
                              canonicalName={sug.item.canonical_name}
                              displayName={sug.displayName}
                              categoryId={sug.categoryId}
                              size={40}
                              className="w-10 h-10 rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-['Manrope'] font-bold text-sm text-primary truncate">
                                  {sug.displayName}
                                </span>
                                {sug.item.urdu_name && (
                                  <span className="font-urdu text-xs text-on-surface-variant shrink-0">
                                    ({sug.item.urdu_name})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-['Manrope']">
                                <CategoryIcon
                                  categoryId={sug.categoryId}
                                  className="w-3 h-3 text-primary/70 shrink-0"
                                />
                                <span className="truncate">
                                  {getCategoryName(sug.categoryId)}
                                </span>
                                {inListMatch && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0">
                                    In list ({inListMatch.quantity || '1'})
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary/70 group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                              <Plus className="w-4 h-4" />
                            </span>
                          </button>
                        );
                      })}

                      {/* Explicit Custom Item Card */}
                      <button
                        type="button"
                        onClick={() => handleAddCustomItem(inputVal)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-dashed border-outline-variant/80 transition-all text-start group active:scale-[0.99] cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-['Manrope'] font-bold text-sm text-primary block truncate">
                            Add: "{inputVal.trim()}"
                          </span>
                          <span className="text-xs text-on-surface-variant font-['Manrope']">
                            Custom Item • Tap to add
                          </span>
                        </div>
                        <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary/70 group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                          <Plus className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* CONTEXT SUGGESTIONS (Shown prominently when input is empty) */}
              {!inputVal.trim() && contextData.items.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-surface-dim/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-['Manrope'] font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Suggested for {contextData.contextTitle}:</span>
                    </span>
                    <span className="text-[10px] font-['Manrope'] text-outline uppercase tracking-wider">
                      1-Tap Add
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contextData.items.map((itemName) => {
                      const inList = findItemInList(itemName);
                      const isAdded = !!inList;

                      return (
                        <button
                          key={itemName}
                          type="button"
                          onClick={() => handleUnifiedAddItem(itemName)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Manrope'] font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                            isAdded
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-dim/80'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                              <span>{itemName}</span>
                              <span className="text-[10px] opacity-75 font-normal">
                                ({inList.quantity || '1'})
                              </span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-primary/70" />
                              <span>{itemName}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category Quick Filter / Selector Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-['Manrope'] font-bold text-outline uppercase tracking-wider block">
                    {userManuallySelectedCategory
                      ? 'Selected Category (Manual)'
                      : 'Categories'}
                  </span>
                  {userManuallySelectedCategory && (
                    <button
                      type="button"
                      onClick={() => setUserManuallySelectedCategory(false)}
                      className="text-[11px] font-['Manrope'] text-primary hover:underline cursor-pointer"
                    >
                      Reset Auto-detect
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                  {CATEGORIES_LIST.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setUserManuallySelectedCategory(true);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-2xs'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-surface-dim/70'
                        }`}
                      >
                        <CategoryIcon
                          categoryId={cat.id}
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-on-primary' : 'text-primary/70'
                          }`}
                        />
                        <span>{getCategoryName(cat.id)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Smart Co-Purchase Suggestions Bar */}
            {recommendations.length > 0 && !inputVal.trim() && (
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-dim/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-['Manrope'] font-bold text-primary uppercase tracking-wider">
                      Frequently Bought Together
                    </span>
                  </div>
                  <span className="text-[10px] font-['Manrope'] text-outline uppercase tracking-wider">
                    Smart Suggestions
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recommendations.map((rec) => {
                    const inList = findItemInList(rec.canonicalName);
                    const isAdded = !!inList;

                    return (
                      <button
                        key={rec.canonicalName}
                        type="button"
                        onClick={() => handleSelectRecommendation(rec)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Manrope'] font-medium transition-all active:scale-95 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-dim/70'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                            <span>{rec.displayName || rec.canonicalName}</span>
                            <span className="text-[10px] opacity-75">({inList.quantity || '1'})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-primary/70" />
                            <span>{rec.displayName || rec.canonicalName}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Shopping Items in this List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Action Card with Summary and Start Shopping Button */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-dim shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-lg sm:text-xl">
                    List Items ({items.length})
                  </h3>
                  <p className="font-['Manrope'] text-xs text-on-surface-variant mt-0.5">
                    {items.length === 0
                      ? 'List is currently empty'
                      : `${items.length} item${items.length === 1 ? '' : 's'} added`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartShopping(items)}
                  disabled={items.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-['Manrope'] text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>Start Shopping</span>
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>

              {/* Transient Feedback Banner */}
              {feedbackToast && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-['Manrope'] font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    feedbackToast.type === 'remove'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                      : feedbackToast.type === 'merge'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
                  <span className="truncate">{feedbackToast.message}</span>
                </div>
              )}

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center px-4 bg-surface-container-low/50 rounded-2xl border border-dashed border-surface-dim">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-2">
                    <ShoppingCart className="w-6 h-6 opacity-60" />
                  </div>
                  <p className="font-['Manrope'] font-bold text-sm text-primary">
                    No items added yet
                  </p>
                  <p className="font-['Manrope'] text-xs text-on-surface-variant max-w-xs mt-1">
                    Tap any of the suggested essentials on the left or type in the search bar above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
                  {items.map((item) => {
                    const itemCatId = item.categoryId || 'uncategorized';
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim/70 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <ItemVisualIcon
                            name={item.name}
                            canonicalName={item.canonicalName}
                            displayName={item.name}
                            categoryId={itemCatId}
                            size={36}
                            className="w-9 h-9 rounded-xl shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-['Manrope'] text-sm font-semibold text-primary truncate">
                                {item.name}
                              </span>
                              {item.nameUrdu && (
                                <span className="font-urdu text-xs text-on-surface-variant">
                                  ({item.nameUrdu})
                                </span>
                              )}
                            </div>

                            {/* Category selector */}
                            <div className="flex items-center gap-1 mt-0.5">
                              <select
                                value={itemCatId}
                                onChange={(e) =>
                                  handleItemCategoryChange(
                                    item.id,
                                    e.target.value as CategoryId,
                                    item.name
                                  )
                                }
                                aria-label={`Change category for ${item.name}`}
                                className="text-[11px] font-['Manrope'] text-on-surface-variant bg-transparent outline-none cursor-pointer hover:text-primary transition-colors"
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

                        {/* Quantity pill & Delete action */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-['Manrope'] text-xs font-bold border border-surface-dim transition-colors active:scale-95 cursor-pointer"
                            title="Tap to edit quantity"
                          >
                            <span>
                              {item.quantity
                                ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                                : '1x'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove item"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quantity Edit Modal */}
      <QuantityEditModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveQuantity}
      />

      {/* Floating Bottom Action for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full max-w-xl md:max-w-2xl mx-auto p-4 bg-background/95 backdrop-blur-md border-t border-surface-dim/40 z-40">
        <button
          onClick={() => onStartShopping(items)}
          disabled={items.length === 0}
          className="w-full h-14 rounded-2xl bg-primary text-on-primary font-['Manrope'] text-base font-bold shadow-md hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t('addItems.startShoppingBtn') || 'Start Shopping'} ({items.length})</span>
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
