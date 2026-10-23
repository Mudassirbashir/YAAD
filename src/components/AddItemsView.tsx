import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  ShoppingCart,
  AlertCircle,
  Package,
  Check,
  Search,
  X,
  Pencil,
  ScanBarcode,
  Camera,
} from 'lucide-react';
import { CategoryId, CATEGORIES_LIST, ShoppingItem, normalizeCategoryId } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';
import { ItemPhotoCaptureModal } from './common/ItemPhotoCaptureModal';
import { ItemImageLightboxModal } from './common/ItemImageLightboxModal';
import { AnimatedCartIcon } from './common/AnimatedCartIcon';
const BarcodeScannerModal = React.lazy(() =>
  import('./barcode/BarcodeScannerModal').then((m) => ({ default: m.BarcodeScannerModal }))
);
import { BidiText, containsUrdu } from '../utils/bidi';
import { saveUserCategoryOverride } from '../lib/categorizer';
import { parseShoppingItem, parseMultiItemInput } from '../lib/recognition/engine';
import { detectDuplicateItem, mergeQuantities } from '../lib/recognition';
import { saveUserCustomAlias, recordLearnedAlias } from '../lib/recognition/userAliases';
import { normalizeBaseText } from '../lib/recognition/normalizer';
import { defaultCatalogSearchEngine, CatalogSearchResult } from '../lib/catalog';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';
import { useRecommendations, RecommendationCandidate } from '../lib/recommendations';
import { recordSearchQuery } from '../lib/recommendations/searchHistory';
import { getSuggestionsForContext } from '../lib/recommendations/shoppingContexts';
import { triggerHaptic } from '../lib/sound';

export interface AddItemsViewProps {
  listTitle: string;
  initialItems?: ShoppingItem[];
  contextId?: string;
  onBack: () => void;
  onStartShopping: (items: ShoppingItem[]) => void;
  onItemsChange?: (items: ShoppingItem[]) => void;
  onRenameList?: (newTitle: string) => void;
}

export const AddItemsView: React.FC<AddItemsViewProps> = ({
  listTitle,
  initialItems = [],
  contextId,
  onBack,
  onStartShopping,
  onItemsChange,
  onRenameList,
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const isUrdu = language === 'ur';
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [currentTitle, setCurrentTitle] = useState<string>(listTitle);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInputVal, setTitleInputVal] = useState<string>(listTitle);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('vegetables');
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'add' | 'merge' | 'remove';
  } | null>(null);
  const [isBottomCartDriving, setIsBottomCartDriving] = useState<boolean>(false);
  const [cartHoverTrigger, setCartHoverTrigger] = useState<number>(0);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false);
  const [photoCaptureItem, setPhotoCaptureItem] = useState<ShoppingItem | null>(null);

  // User-triggered smart suggestions state (not auto on open)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isAnalyzingSuggestions, setIsAnalyzingSuggestions] = useState<boolean>(false);

  // Item high-res photo lightbox state
  const [lightboxItem, setLightboxItem] = useState<{
    imageUrl: string;
    itemName: string;
    categoryName?: string;
  } | null>(null);

  const handleTriggerSuggestionsAnalysis = () => {
    if (showSuggestions) {
      setShowSuggestions(false);
      return;
    }
    triggerHaptic(12);
    setIsAnalyzingSuggestions(true);
    setTimeout(() => {
      setIsAnalyzingSuggestions(false);
      setShowSuggestions(true);
      triggerHaptic(15);
    }, 1400); // 1.4 seconds realistic AI analysis
  };

  const handleAddScannedItem = (scannedItem: ShoppingItem) => {
    const existingIndex = items.findIndex(
      (it) =>
        (scannedItem.barcode && it.barcode === scannedItem.barcode) ||
        it.name.toLowerCase().trim() === scannedItem.name.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const merged = mergeQuantities(
        existing.quantity,
        existing.unit,
        scannedItem.quantity,
        scannedItem.unit
      );
      const updated = [...items];
      updated[existingIndex] = {
        ...existing,
        quantity: merged.quantity,
        unit: merged.unit,
        barcode: existing.barcode || scannedItem.barcode,
        brand: existing.brand || scannedItem.brand,
        packageSize: existing.packageSize || scannedItem.packageSize,
        imageUrl: existing.imageUrl || scannedItem.imageUrl,
        completed: false,
      };
      updateItems(updated);
      showToast(
        `Updated ${scannedItem.name} (${merged.quantity || '1'}${merged.unit ? ' ' + merged.unit : ''})`,
        'merge'
      );
    } else {
      updateItems([...items, scannedItem]);
      showToast(`Added ${scannedItem.name}`, 'add');
    }
  };

  const handleStartShoppingWithAnimation = () => {
    if (items.length === 0 || isBottomCartDriving) return;
    triggerHaptic([22, 18, 38]);
    setIsBottomCartDriving(true);
    setTimeout(() => {
      onStartShopping(items);
      setIsBottomCartDriving(false);
    }, 720);
  };

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

  // Helper to find if an item name or canonical name is already in the list
  const findItemInList = useCallback((nameOrCanonical?: string): ShoppingItem | undefined => {
    if (!nameOrCanonical) return undefined;
    const norm = normalizeBaseText(nameOrCanonical);
    return items.find((it) => {
      const itCanon = it.canonicalName ? normalizeBaseText(it.canonicalName) : '';
      const itName = normalizeBaseText(it.name);
      const itRaw = it.rawInput ? normalizeBaseText(it.rawInput) : '';
      return (itCanon && itCanon === norm) || itName === norm || itRaw === norm;
    });
  }, [items]);

  // Context-specific suggestions
  const contextData = useMemo(() => {
    return getSuggestionsForContext(contextId, listTitle);
  }, [contextId, listTitle]);

  // Dynamic context-aware & co-purchase recommendations
  const {
    recommendations,
    alreadyAddedRecommendations,
    detectedContext,
    acceptRecommendation,
  } = useRecommendations({
    listTitle,
    contextId: contextId || contextData.contextId,
    currentListItems: items,
    limit: 12,
  });

  // Unified, deduplicated context-aware suggestions:
  // Blends personal purchase history, repeated items, recent searches,
  // co-purchase pairings, and curated Pakistani context staples for the selected category.
  const unifiedSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{
      name: string;
      displayName: string;
      canonicalName?: string;
      rawRec?: RecommendationCandidate;
      reason?: string;
      isAlreadyAdded: boolean;
      addedQuantity?: string;
    }> = [];

    const norm = (s: string) => s.toLowerCase().trim().replace(/[\s_-]+/g, '');

    // 1. High-scoring candidates from recommendation engine (history + repeated items + co-purchases)
    for (const rec of recommendations) {
      const canonicalKey = norm(rec.canonicalName || rec.displayName);
      if (!seen.has(canonicalKey)) {
        seen.add(canonicalKey);
        const inList = findItemInList(rec.canonicalName) || findItemInList(rec.displayName);
        list.push({
          name: rec.displayName || rec.canonicalName,
          displayName: rec.displayName || rec.canonicalName,
          canonicalName: rec.canonicalName,
          rawRec: rec,
          reason: rec.explanation?.displayReason,
          isAlreadyAdded: !!inList,
          addedQuantity: inList?.quantity,
        });
      }
    }

    // 2. Curated Pakistani staples for the selected context/category (from contextData)
    for (const itemName of contextData.items) {
      const itemKey = norm(itemName);
      if (!seen.has(itemKey)) {
        seen.add(itemKey);
        const inList = findItemInList(itemName);
        list.push({
          name: itemName,
          displayName: itemName,
          canonicalName: itemKey,
          reason: `Essential for ${contextData.contextTitle}`,
          isAlreadyAdded: !!inList,
          addedQuantity: inList?.quantity,
        });
      }
    }

    return list;
  }, [recommendations, contextData.items, contextData.contextTitle, items]);

  const activeUnaddedSuggestions = useMemo(() => {
    return unifiedSuggestions.filter((s) => !s.isAlreadyAdded).slice(0, 10);
  }, [unifiedSuggestions]);

  const addedSuggestions = useMemo(() => {
    return unifiedSuggestions.filter((s) => s.isAlreadyAdded).slice(0, 4);
  }, [unifiedSuggestions]);

  // Track search query behavior for contextual recommendation weighting
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (trimmed.length < 2) return;
    const timer = setTimeout(() => {
      recordSearchQuery('guest', trimmed, selectedCategory);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputVal, selectedCategory]);

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
      const isUrduInput = containsUrdu(trimmed) || isUrdu;
      const displayName = (isUrduInput && options.urduName) ? options.urduName : (options.englishName || options.canonicalName);

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

    let updatedList: ShoppingItem[] = [...items];
    let newItemsCount = 0;
    const mergedNames: string[] = [];

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
        mergedNames.push(duplicateCheck.existingItem.name);
      } else {
        const newItemId = generateUUID();
        const displayName = parsed.name || (isUrdu && parsed.nameUrdu ? parsed.nameUrdu : (parsed.canonicalName || parsed.rawInput));
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
        newItemsCount++;
      }
    }

    updateItems(updatedList);

    // Honest, scannable toast
    if (newItemsCount > 0 && mergedNames.length > 0) {
      showToast(
        language === 'ur'
          ? `${newItemsCount} نئی اشیاء شامل، ${mergedNames.length} پہلے سے موجود اشیاء اپڈیٹ ہو گئیں`
          : `Added ${newItemsCount} new item${newItemsCount > 1 ? 's' : ''}, updated ${mergedNames.length} existing in list (${mergedNames.join(', ')})`,
        'add'
      );
    } else if (newItemsCount > 0) {
      showToast(
        newItemsCount === 1
          ? `Added "${parsedItems[0].name}"`
          : `Added ${newItemsCount} items to list`,
        'add'
      );
    } else if (mergedNames.length > 0) {
      showToast(
        `Updated quantity for ${mergedNames.join(', ')} (already in list)`,
        'merge'
      );
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
    acceptRecommendation(candidate);
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
    imageUrl?: string | null
  ) => {
    const updated = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: quantity?.trim() || undefined,
            unit: unit?.trim() || undefined,
            ...(imageUrl !== undefined ? { imageUrl: imageUrl || undefined } : {}),
          }
        : item
    );
    updateItems(updated);
    setEditingItem(null);
    showToast('Updated item', 'merge');
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
      <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-xl [backdrop-filter:blur(24px)] [-webkit-backdrop-filter:blur(24px)] border-b border-surface-dim/40">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 h-14 w-full max-w-6xl mx-auto">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 -ms-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            {isEditingTitle ? (
              <motion.div
                key="editing-title"
                layoutId="list-title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                className="flex items-center gap-1.5 flex-1 max-w-[260px] sm:max-w-md mx-2"
              >
                <input
                  ref={renameInputRef}
                  autoFocus
                  type="text"
                  value={titleInputVal}
                  onChange={(e) => setTitleInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const trimmed = titleInputVal.trim() || 'Shopping List';
                      setCurrentTitle(trimmed);
                      setIsEditingTitle(false);
                      onRenameList?.(trimmed);
                    } else if (e.key === 'Escape') {
                      setTitleInputVal(currentTitle);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full text-sm sm:text-base font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded-lg border border-primary/30 outline-none focus:ring-1 focus:ring-primary transition-[box-shadow] duration-150"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = titleInputVal.trim() || 'Shopping List';
                    setCurrentTitle(trimmed);
                    setIsEditingTitle(false);
                    onRenameList?.(trimmed);
                  }}
                  aria-label="Save list name"
                  className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInputVal(currentTitle);
                    setIsEditingTitle(false);
                  }}
                  aria-label="Cancel editing"
                  className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="static-title"
                layoutId="list-title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                className="flex items-center justify-center gap-2 max-w-[200px] xs:max-w-[240px] sm:max-w-md mx-2 px-2.5 py-1 rounded-2xl bg-surface-container-low/70 border border-surface-dim/60 shadow-2xs"
              >
                <BidiText
                  as="h2"
                  className="font-display text-sm sm:text-base font-bold text-primary truncate text-center max-w-[130px] xs:max-w-[170px] sm:max-w-xs"
                >
                  {currentTitle}
                </BidiText>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInputVal(currentTitle);
                    setIsEditingTitle(true);
                  }}
                  aria-label="Rename list"
                  className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high text-primary/80 hover:text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-surface-dim/70 shadow-2xs"
                  title="Rename list"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="min-w-[40px] flex justify-end">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container text-primary border border-surface-dim/60 shadow-2xs">
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
                <h3 className="font-display font-bold text-primary text-xl">
                  {t('addItems.title') || 'Add Items'}
                </h3>
              </div>

              {/* Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUnifiedAddItem(inputVal);
                }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1 flex items-center">
                    <div className="absolute start-3.5 top-3.5 text-outline pointer-events-none">
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
                      onPaste={(e) => {
                        const pasteText = e.clipboardData?.getData('text');
                        if (pasteText && (pasteText.includes('\n') || pasteText.includes(',') || pasteText.includes('،') || pasteText.includes(';'))) {
                          e.preventDefault();
                          handleUnifiedAddItem(pasteText);
                        }
                      }}
                      placeholder={t('addItems.inputPlaceholder') || 'Add item (e.g. Milk, Apples)...'}
                      className="w-full h-12 bg-surface-container-low rounded-full ps-11 pe-24 text-sm sm:text-base text-on-surface font-body border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
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

                    {/* Add Button - Inside Circle */}
                    <button
                      type="submit"
                      className="absolute end-1.5 top-1.5 bottom-1.5 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-xs cursor-pointer"
                      aria-label="Add item"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Raised square scanner button with red BETA label */}
                  <button
                    type="button"
                    onClick={() => setIsBarcodeScannerOpen(true)}
                    className="relative shrink-0 w-12 h-12 rounded-2xl bg-surface-bright hover:bg-surface-container-low active:scale-95 border border-surface-dim/80 shadow-xs flex flex-col items-center justify-center text-primary transition-all cursor-pointer group"
                    aria-label={(t as any)?.barcode?.scanItem || 'Scan Barcode'}
                    title={(t as any)?.barcode?.scanItem || 'Scan Barcode'}
                  >
                    <ScanBarcode className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" />
                    <span className="absolute -top-1.5 -end-1 bg-red-600 text-white text-[8px] font-black tracking-wider px-1 py-0.2 rounded-full shadow-2xs uppercase leading-tight">
                      {(t as any)?.barcode?.beta || 'BETA'}
                    </span>
                  </button>
                </div>

                {inputError && (
                  <p className="text-xs text-error font-body flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{inputError}</span>
                  </p>
                )}

                {/* Real-time Catalog Search Suggestions Dropdown */}
                {inputVal.trim().length > 0 && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-body font-bold text-outline uppercase tracking-wider block">
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
                                <span className="font-body font-bold text-sm text-primary truncate">
                                  {sug.displayName}
                                </span>
                                {sug.item.urdu_name && (
                                  <span className="font-urdu text-xs text-on-surface-variant shrink-0">
                                    ({sug.item.urdu_name})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-body">
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
                          <span className="font-body font-bold text-sm text-primary block truncate">
                            Add: "{inputVal.trim()}"
                          </span>
                          <span className="text-xs text-on-surface-variant font-body">
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

              {/* USER-CONTROLLED SMART SUGGESTIONS (Triggered on Demand with 1-2s Analysis) */}
              {!inputVal.trim() && (
                <div className="pt-2 border-t border-surface-dim/60 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerSuggestionsAnalysis}
                      disabled={isAnalyzingSuggestions}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-body font-bold text-primary bg-primary/10 hover:bg-primary/15 active:scale-95 transition-all border border-primary/20 shadow-2xs cursor-pointer group"
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 text-primary ${
                          isAnalyzingSuggestions ? 'animate-spin' : 'group-hover:scale-110 transition-transform'
                        }`}
                      />
                      <span>
                        {isAnalyzingSuggestions
                          ? (language === 'ur' ? 'تجزیہ ہو رہا ہے...' : 'Analyzing context...')
                          : showSuggestions
                          ? (language === 'ur' ? 'تجاویز چھپائیں' : 'Hide Suggestions')
                          : (language === 'ur' ? 'AI سے تجاویز حاصل کریں' : '✨ Get Smart Suggestions')}
                      </span>
                    </button>
                    {showSuggestions && !isAnalyzingSuggestions && (
                      <span className="text-[11px] font-body text-on-surface-variant font-medium">
                        {activeUnaddedSuggestions.length} {language === 'ur' ? 'تجاویز دستیاب' : 'suggestions'}
                      </span>
                    )}
                  </div>

                  {/* Analysis state animation (1-2 seconds) */}
                  {isAnalyzingSuggestions && (
                    <div className="p-3 rounded-2xl bg-surface-container-low border border-primary/30 flex items-center gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary font-body">
                          {language === 'ur' ? 'لسٹ کا AI تجزیہ کیا جا رہا ہے...' : 'Analyzing list context & essentials...'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {language === 'ur' ? 'آپ کی ضروری اشیاء کی فوری تجاویز مرتب ہو رہی ہیں' : 'Tailoring recommended items for your trip'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions Revealed after Analysis */}
                  {showSuggestions && !isAnalyzingSuggestions && (activeUnaddedSuggestions.length > 0 || addedSuggestions.length > 0) && (
                    <div className="space-y-2 animate-slide-in-from-top">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-body font-bold text-primary flex items-center gap-2">
                          <span>
                            {language === 'ur'
                              ? `لسٹ "${currentTitle || 'خریداری'}" کے لیے تجویز کردہ:`
                              : `Suggested for ${listTitle || contextData.contextTitle || detectedContext.name || 'Your List'}:`}
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Active un-added context suggestions */}
                        {activeUnaddedSuggestions.map((sug) => (
                          <button
                            key={sug.name}
                            type="button"
                            onClick={() => {
                              if (sug.rawRec) {
                                handleSelectRecommendation(sug.rawRec);
                              } else {
                                handleUnifiedAddItem(sug.name);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-dim/80 hover:border-primary/50"
                            title={sug.reason}
                          >
                            <Plus className="w-3.5 h-3.5 text-primary/70" />
                            <span>{sug.displayName}</span>
                          </button>
                        ))}

                        {/* Already added items */}
                        {addedSuggestions.map((sug) => (
                          <div
                            key={sug.name}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-medium bg-surface-container-low text-on-surface-variant/70 border border-surface-dim/60 select-none opacity-60 cursor-default"
                            title="Already in list"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                            <span className="line-through decoration-outline/40">{sug.displayName}</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                              Added{sug.addedQuantity ? ` (${sug.addedQuantity})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Category Quick Filter / Selector Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body font-bold text-outline uppercase tracking-wider block">
                    {userManuallySelectedCategory
                      ? 'Selected Category (Manual)'
                      : 'Categories'}
                  </span>
                  {userManuallySelectedCategory && (
                    <button
                      type="button"
                      onClick={() => setUserManuallySelectedCategory(false)}
                      className="text-[11px] font-body text-primary hover:underline cursor-pointer"
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
                        className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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
          </div>

          {/* Right Column: Active Shopping Items in this List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Action Card with Summary and Start Shopping Button */}
            <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-dim shadow-2xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-display font-bold text-primary text-sm sm:text-base whitespace-nowrap">
                    {t('addItems.listItemsHeaderClean') || 'List Items'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleStartShoppingWithAnimation}
                  onMouseEnter={() => setCartHoverTrigger((c) => c + 1)}
                  disabled={items.length === 0 || isBottomCartDriving}
                  className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-primary text-on-primary font-body text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer group whitespace-nowrap shrink-0 overflow-hidden"
                >
                  <span className="whitespace-nowrap">{t('addItems.startShoppingBtn') || 'Start Shopping'}</span>
                  <div
                    className={`relative flex items-center transition-all duration-500 ease-out ${
                      isBottomCartDriving
                        ? 'translate-x-3.5 scale-110'
                        : 'translate-x-0 scale-100 group-hover:translate-x-1 group-hover:scale-105'
                    }`}
                  >
                    <AnimatedCartIcon
                      isPlaying={isBottomCartDriving}
                      triggerPlay={cartHoverTrigger}
                      size={18}
                    />
                  </div>
                </button>
              </div>

              {/* Transient Feedback Banner */}
              {feedbackToast && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-body font-semibold flex items-center gap-2 animate-slide-in-from-top ${
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
                  <p className="font-body font-bold text-sm text-primary">
                    No items added yet
                  </p>
                  <p className="font-body text-xs text-on-surface-variant max-w-xs mt-1">
                    Tap any of the suggested essentials on the left or type in the search bar above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
                  {items.map((item) => {
                    const itemCatId = normalizeCategoryId(item.categoryId);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim/70 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <ItemVisualIcon
                            name={item.name}
                            canonicalName={item.canonicalName}
                            displayName={item.name}
                            categoryId={itemCatId}
                            imageUrl={item.imageUrl}
                            size={36}
                            onClick={
                              item.imageUrl
                                ? () => {
                                    setLightboxItem({
                                      imageUrl: item.imageUrl!,
                                      itemName: item.name,
                                      categoryName: getCategoryName(itemCatId),
                                    });
                                  }
                                : undefined
                            }
                            title={item.imageUrl ? `Click to view full photo of ${item.name}` : undefined}
                            className="w-9 h-9 rounded-xl shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                            {/* Line 1: Item Name */}
                            <span className="font-display font-bold text-sm text-primary truncate block">
                              {item.name}
                            </span>

                            {/* Line 2: Quantity (one line below name) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                              }}
                              className="text-xs font-body font-medium text-primary/80 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer w-fit text-start"
                              title="Tap to change quantity"
                            >
                              <span className="bg-surface-container px-2 py-0.5 rounded-md border border-surface-dim/60 font-semibold text-[11px]">
                                {item.quantity
                                  ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                                  : '1x'}
                              </span>
                            </button>

                            {/* Line 3: Category (below quantity) */}
                            <div className="flex items-center gap-1 text-[11px] font-body text-on-surface-variant">
                              <CategoryIcon
                                categoryId={itemCatId}
                                className="w-3 h-3 text-primary/60 shrink-0"
                              />
                              <select
                                value={itemCatId}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleItemCategoryChange(
                                    item.id,
                                    e.target.value as CategoryId,
                                    item.name
                                  );
                                }}
                                aria-label={`Change category for ${item.name}`}
                                className="bg-transparent outline-none cursor-pointer hover:text-primary transition-colors truncate max-w-[140px]"
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

                        {/* Actions: Photo and Delete Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoCaptureItem(item);
                            }}
                            aria-label={`Attach photo for ${item.name}`}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              item.imageUrl
                                ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                : 'text-outline hover:text-primary hover:bg-surface-container'
                            }`}
                            title={item.imageUrl ? 'Change photo' : 'Attach photo'}
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            aria-label="Remove item"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer shrink-0"
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

      {/* Barcode Scanner Modal */}
      {isBarcodeScannerOpen && (
        <React.Suspense fallback={null}>
          <BarcodeScannerModal
            isOpen={isBarcodeScannerOpen}
            onClose={() => setIsBarcodeScannerOpen(false)}
            onAddItem={handleAddScannedItem}
          />
        </React.Suspense>
      )}

      {/* Item Photo Capture Bottom Sheet */}
      <ItemPhotoCaptureModal
        isOpen={!!photoCaptureItem}
        itemName={photoCaptureItem?.name}
        currentImageUrl={photoCaptureItem?.imageUrl}
        onClose={() => setPhotoCaptureItem(null)}
        onPhotoCaptured={(url) => {
          if (!photoCaptureItem) return;
          const updated = items.map((it) =>
            it.id === photoCaptureItem.id ? { ...it, imageUrl: url } : it
          );
          updateItems(updated);
          setPhotoCaptureItem(null);
          showToast('Photo attached', 'merge');
        }}
        onRemovePhoto={() => {
          if (!photoCaptureItem) return;
          const updated = items.map((it) =>
            it.id === photoCaptureItem.id ? { ...it, imageUrl: undefined } : it
          );
          updateItems(updated);
          setPhotoCaptureItem(null);
        }}
      />

      {/* Item High-Resolution Photo Lightbox Preview */}
      <ItemImageLightboxModal
        isOpen={Boolean(lightboxItem)}
        onClose={() => setLightboxItem(null)}
        imageUrl={lightboxItem?.imageUrl}
        itemName={lightboxItem?.itemName}
        categoryName={lightboxItem?.categoryName}
      />

      {/* Floating Bottom Action for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full max-w-xl md:max-w-2xl mx-auto p-4 bg-background/80 backdrop-blur-xl [backdrop-filter:blur(24px)] [-webkit-backdrop-filter:blur(24px)] border-t border-surface-dim/40 z-40">
        <button
          onClick={handleStartShoppingWithAnimation}
          onMouseEnter={() => setCartHoverTrigger((c) => c + 1)}
          disabled={items.length === 0 || isBottomCartDriving}
          className={`relative overflow-hidden w-full h-14 rounded-2xl font-body text-base font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group ${
            isBottomCartDriving
              ? 'bg-[#00422f] text-emerald-100 shadow-emerald-950/40'
              : 'bg-primary text-on-primary hover:bg-primary-container'
          }`}
        >
          {/* Subtle background velocity shimmer during departure */}
          {isBottomCartDriving && (
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse pointer-events-none"
              aria-hidden="true"
            />
          )}

          <span className="transition-opacity duration-200">
            {isBottomCartDriving
              ? (language === 'ur' ? 'شاپنگ کے لیے روانہ...' : 'Off to shop...')
              : (t('addItems.startShoppingBtn') || 'Start Shopping')}
          </span>

          {/* Animated Cart Icon (system-outline-146-cart-hover-slide.json) - drives to the right on click & hover */}
          <div
            className={`relative flex items-center transition-all duration-500 ease-out ${
              isBottomCartDriving
                ? 'translate-x-12 sm:translate-x-16 scale-110'
                : 'translate-x-0 scale-100 group-hover:translate-x-1.5 group-hover:scale-105'
            }`}
          >
            <AnimatedCartIcon
              isPlaying={isBottomCartDriving}
              triggerPlay={cartHoverTrigger}
              size={28}
            />
          </div>
        </button>
      </div>
    </div>
  );
};
