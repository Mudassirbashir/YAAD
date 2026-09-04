import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShoppingCart,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { CategoryId, CATEGORIES_LIST, ShoppingItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { BidiText } from '../utils/bidi';
import {
  categorizeItemLocally,
  smartCategorizeItem,
  saveUserCategoryOverride,
} from '../lib/categorizer';
import { parseShoppingItem, parseMultiItemInput } from '../lib/recognition/engine';
import { detectDuplicateItem, mergeQuantities } from '../lib/recognition';
import { saveUserCustomAlias } from '../lib/recognition/userAliases';
import { normalizeBaseText } from '../lib/recognition/normalizer';
import { defaultCatalogSearchEngine, CatalogSearchResult } from '../lib/catalog';
import { generateUUID } from '../lib/uuid';
import { QuantityEditModal } from './QuantityEditModal';
import { useRecommendations, RecommendationCandidate } from '../lib/recommendations';
import { RecommendationChipsBar } from './RecommendationChipsBar';

interface AddItemsViewProps {
  listTitle: string;
  initialItems?: ShoppingItem[];
  onBack: () => void;
  onStartShopping: (items: ShoppingItem[]) => void;
}

export const AddItemsView: React.FC<AddItemsViewProps> = ({
  listTitle,
  initialItems = [],
  onBack,
  onStartShopping,
}) => {
  const { t, getCategoryName } = useLanguage();
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [inputVal, setInputVal] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('vegetables');
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>('');
  const [isCategorizing, setIsCategorizing] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Live parsed recognition object
  const currentRecognition = useMemo(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) return null;
    return parseShoppingItem(trimmed);
  }, [inputVal]);

  // Auto-detect category in real-time as user types (if user hasn't manually clicked a category for this input)
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

  // Dynamic personal & co-purchase recommendations based on current draft items
  const { recommendations } = useRecommendations({
    currentListItems: items,
    limit: 6,
  });

  // Real-time catalog search suggestions (Local search first: Exact -> Alias -> Prefix -> Phonetic -> Fuzzy -> Personal boost)
  const searchSuggestions: CatalogSearchResult[] = useMemo(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) return [];
    return defaultCatalogSearchEngine.search(trimmed, 4, {
      frequentlyBoughtNames: new Set(recommendations.map((r) => normalizeBaseText(r.canonicalName))),
    });
  }, [inputVal, recommendations]);

  const handleSelectRecommendation = (candidate: RecommendationCandidate) => {
    const finalCategory = candidate.category || 'vegetables';
    const displayName = candidate.displayName || candidate.canonicalName;

    const duplicateCheck = detectDuplicateItem(items, {
      canonicalName: candidate.canonicalName,
      englishName: displayName,
      nameUrdu: candidate.nameUrdu,
      nameRomanUrdu: candidate.nameRomanUrdu,
      categoryId: finalCategory,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      rawInput: displayName,
      matchedVia: 'exact_item',
      quantity: candidate.suggestedQuantity,
      unit: candidate.suggestedUnit,
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
      const merged = mergeQuantities(
        duplicateCheck.existingItem.quantity,
        duplicateCheck.existingItem.unit,
        candidate.suggestedQuantity,
        candidate.suggestedUnit
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === duplicateCheck.existingItem!.id
            ? {
                ...item,
                quantity: merged.quantity,
                unit: merged.unit,
                completed: false,
              }
            : item
        )
      );
      return;
    }

    const newItemId = generateUUID();
    const newItem: ShoppingItem = {
      id: newItemId,
      name: displayName,
      canonicalName: candidate.canonicalName,
      canonical_name: candidate.canonicalName,
      original_input: displayName,
      original_name: displayName,
      normalized_item: candidate.canonicalName,
      normalized_name: displayName.toLowerCase(),
      nameUrdu: candidate.nameUrdu,
      nameRomanUrdu: candidate.nameRomanUrdu,
      quantity: candidate.suggestedQuantity,
      unit: candidate.suggestedUnit,
      planned_quantity: candidate.suggestedQuantity,
      planned_unit: candidate.suggestedUnit,
      rawInput: `${candidate.suggestedQuantity ? candidate.suggestedQuantity + ' ' : ''}${candidate.suggestedUnit ? candidate.suggestedUnit + ' ' : ''}${displayName}`.trim(),
      categoryId: finalCategory,
      category: getCategoryName(finalCategory),
      completed: false,
      userModifiedCategory: false,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      emoji: candidate.emoji,
    };

    setItems((prev) => [newItem, ...prev]);
  };

  const handleSelectSuggestion = (suggestion: CatalogSearchResult) => {
    const canonical = suggestion.item;
    const finalCategory = suggestion.categoryId;

    const duplicateCheck = detectDuplicateItem(items, {
      canonicalName: canonical.canonical_name,
      englishName: canonical.english_name,
      nameUrdu: canonical.urdu_name,
      nameRomanUrdu: canonical.roman_urdu_names[0],
      categoryId: finalCategory,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      rawInput: inputVal,
      matchedVia: 'exact_item',
      quantity: suggestion.parsedQuantity,
      unit: suggestion.parsedUnit || canonical.default_unit,
    });

    if (inputVal.trim()) {
      saveUserCustomAlias(inputVal.trim(), {
        canonicalName: canonical.canonical_name,
        categoryId: finalCategory,
        canonicalId: canonical.id,
      });
    }

    if (duplicateCheck.isDuplicate && duplicateCheck.existingItem) {
      const merged = mergeQuantities(
        duplicateCheck.existingItem.quantity,
        duplicateCheck.existingItem.unit,
        suggestion.parsedQuantity,
        suggestion.parsedUnit || canonical.default_unit
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === duplicateCheck.existingItem!.id
            ? {
                ...item,
                quantity: merged.quantity,
                unit: merged.unit,
                completed: false,
              }
            : item
        )
      );
      setInputVal('');
      setInputError('');
      setUserManuallySelectedCategory(false);
      return;
    }

    const newItemId = generateUUID();
    const newItem: ShoppingItem = {
      id: newItemId,
      name: canonical.english_name,
      canonicalName: canonical.canonical_name,
      canonical_name: canonical.canonical_name,
      original_name: inputVal,
      normalized_name: inputVal.trim().toLowerCase(),
      nameUrdu: canonical.urdu_name,
      nameRomanUrdu: canonical.roman_urdu_names[0],
      quantity: suggestion.parsedQuantity,
      unit: suggestion.parsedUnit || canonical.default_unit,
      rawInput: inputVal,
      categoryId: finalCategory,
      category: getCategoryName(finalCategory),
      completed: false,
      userModifiedCategory: false,
      confidence: 1.0,
      isRecognized: true,
      unresolved: false,
      emoji: suggestion.emoji,
    };

    setItems((prev) => [newItem, ...prev]);
    setInputVal('');
    setInputError('');
    setUserManuallySelectedCategory(false);
  };

  const handleCategoryChipClick = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setUserManuallySelectedCategory(true);
  };

  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setInputError(t('addItems.errorEmpty'));
      return;
    }

    const parsedItems = parseMultiItemInput(trimmed);
    if (parsedItems.length === 0) {
      setInputError(t('addItems.errorEmpty'));
      return;
    }

    let updatedList = [...items];

    for (const parsed of parsedItems) {
      let finalCategory = selectedCategory;

      // If user didn't manually pick category, use parsed suggestion
      if (!userManuallySelectedCategory) {
        finalCategory = parsed.suggestedCategoryId;
      } else {
        // User explicitly chose this category for this item -> remember this preference!
        saveUserCategoryOverride(parsed.name, selectedCategory);
      }

      // Check if equivalent item already exists in current list (e.g. aloo vs potato)
      const duplicateCheck = detectDuplicateItem(updatedList, {
        canonicalName: parsed.canonicalName || parsed.name,
        englishName: parsed.canonicalName || parsed.name,
        nameUrdu: parsed.nameUrdu,
        nameRomanUrdu: parsed.nameRomanUrdu,
        categoryId: finalCategory,
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
        updatedList = updatedList.map((item) =>
          item.id === duplicateCheck.existingItem!.id
            ? {
                ...item,
                quantity: merged.quantity,
                unit: merged.unit,
                planned_quantity: merged.quantity,
                planned_unit: merged.unit,
                completed: false,
              }
            : item
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
          categoryId: finalCategory,
          category: getCategoryName(finalCategory),
          completed: false,
          userModifiedCategory: userManuallySelectedCategory,
          confidence: parsed.confidence,
          isRecognized: parsed.isRecognized,
          unresolved: parsed.unresolved,
          emoji: parsed.emoji,
        };

        updatedList = [newItem, ...updatedList];

        // Background AI refinement for low confidence single items
        if (!userManuallySelectedCategory && parsedItems.length === 1) {
          const localCheck = categorizeItemLocally(parsed.name);
          if (localCheck.confidence < 0.8) {
            setIsCategorizing(true);
            smartCategorizeItem(parsed.name)
              .then((aiResult) => {
                if (aiResult.categoryId && aiResult.categoryId !== finalCategory) {
                  setItems((currentItems) =>
                    currentItems.map((item) =>
                      item.id === newItemId && !item.userModifiedCategory
                        ? {
                            ...item,
                            categoryId: aiResult.categoryId,
                            category: getCategoryName(aiResult.categoryId),
                          }
                        : item
                    )
                  );
                }
              })
              .catch(() => {})
              .finally(() => setIsCategorizing(false));
          }
        }
      }
    }

    setItems(updatedList);
    setInputVal('');
    setInputError('');
    setUserManuallySelectedCategory(false);
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
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleQuantityCycle = (id: string, currentQty?: string, currentUnit?: string) => {
    let nextQty = '2';
    let nextUnit = currentUnit;

    if (!currentQty) {
      nextQty = '2';
    } else if (currentQty === '2') {
      nextQty = '3';
    } else if (currentQty === '3') {
      nextQty = '1';
      nextUnit = nextUnit || 'kg';
    } else if (currentQty === '1' && nextUnit === 'kg') {
      nextQty = '2';
      nextUnit = 'kg';
    } else if (currentQty === '2' && nextUnit === 'kg') {
      nextQty = '1';
      nextUnit = 'dozen';
    } else {
      nextQty = '';
      nextUnit = undefined;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: nextQty || undefined,
              unit: nextUnit || undefined,
            }
          : item
      )
    );
  };

  const handleItemCategoryChange = (itemId: string, newCategoryId: CategoryId, itemName: string) => {
    saveUserCategoryOverride(itemName, newCategoryId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              categoryId: newCategoryId,
              category: getCategoryName(newCategoryId),
              userModifiedCategory: true,
            }
          : item
      )
    );
  };

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 h-14 w-full">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 -ms-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
          </button>
          <BidiText as="h2" className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary truncate max-w-[200px] sm:max-w-xs text-center">
            {listTitle}
          </BidiText>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 pb-28 flex flex-col gap-5">
        {/* Input Card */}
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-dim shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xl">
              {t('addItems.title')}
            </h3>
            {isCategorizing && (
              <span className="text-[11px] font-['Manrope'] text-primary/80 flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('thinking')}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleAddItem} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                dir="auto"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setUserManuallySelectedCategory(false);
                  if (inputError) setInputError('');
                }}
                placeholder={t('addItems.inputPlaceholder')}
                className="w-full h-12 bg-surface-container-low rounded-2xl ps-4 pe-12 text-sm text-on-surface font-['Manrope'] border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                autoFocus
              />
              <button
                type="submit"
                className="absolute end-1.5 top-1.5 w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-xs"
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

            {/* Real-time Catalog Search Suggestions */}
            {searchSuggestions.length > 0 && inputVal.trim().length > 0 && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                <span className="text-[11px] font-['Manrope'] font-bold text-outline uppercase tracking-wider block">
                  {t('searchSuggestions') || 'Catalog Suggestions'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchSuggestions.map((sug) => (
                    <button
                      key={sug.item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all text-start group active:scale-[0.99] cursor-pointer"
                    >
                      <span className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
                        {sug.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-['Manrope'] font-bold text-sm text-primary truncate">
                            {sug.displayName}
                          </span>
                          {sug.item.urdu_name && (
                            <span className="font-['Noto_Nastaliq_Urdu','Jameel_Noori_Nastaleeq',serif] text-xs text-on-surface-variant shrink-0">
                              ({sug.item.urdu_name})
                            </span>
                          )}
                          {sug.isUserLearned && (
                            <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                              Saved
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-['Manrope']">
                          <CategoryIcon categoryId={sug.categoryId} className="w-3 h-3 text-primary/70 shrink-0" />
                          <span className="truncate">{getCategoryName(sug.categoryId)}</span>
                          {sug.item.roman_urdu_names?.[0] && sug.item.roman_urdu_names[0].toLowerCase() !== sug.displayName.toLowerCase() && (
                            <span className="text-outline text-[11px] truncate">
                              • {sug.item.roman_urdu_names[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary/70 group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Recognition Preview */}
            {currentRecognition && inputVal.trim().length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high/80 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CategoryIcon categoryId={selectedCategory} className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="font-['Manrope'] font-bold text-primary truncate">
                      {currentRecognition.name}
                    </span>
                    {currentRecognition.nameUrdu && (
                      <span className="font-['Noto_Nastaliq_Urdu','Jameel_Noori_Nastaleeq',serif] text-xs text-on-surface-variant font-normal shrink-0">
                        ({currentRecognition.nameUrdu})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ms-auto">
                  {currentRecognition.quantity && (
                    <span className="px-2 py-0.5 rounded-md bg-surface-container text-primary font-['Manrope'] font-bold text-[11px]">
                      {currentRecognition.quantity} {currentRecognition.unit || ''}
                    </span>
                  )}
                  <span className="text-[11px] font-['Manrope'] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>{getCategoryName(selectedCategory)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Personal & Co-Purchase Recommendations */}
            {!inputVal.trim() && recommendations.length > 0 && (
              <RecommendationChipsBar
                recommendations={recommendations}
                onSelectItem={handleSelectRecommendation}
                hasItemsInList={items.length > 0}
              />
            )}

            {/* Category Selector Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-['Manrope'] font-bold text-outline uppercase tracking-wider block">
                  {t('addItems.categoryLabel')}
                </span>
                {inputVal.trim() && !userManuallySelectedCategory && (
                  <span className="text-[10px] text-primary/70 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>{t('addItems.autoDetected')}: {getCategoryName(selectedCategory)}</span>
                  </span>
                )}
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {CATEGORIES_LIST.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChipClick(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-xs ring-2 ring-primary/20'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
                      <span>{getCategoryName(cat.id)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Current Items List */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-base">
              {t('addItems.listItemsHeader', { count: items.length })}
            </h4>
            {items.length > 0 && (
              <span className="text-xs font-['Manrope'] text-on-surface-variant font-medium">
                {t('addItems.quantityHint')}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-3xl border border-surface-dim text-center my-auto min-h-[180px]">
              <Package className="w-10 h-10 text-outline/80 mb-2" />
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-base">
                {t('addItems.emptyItemsTitle')}
              </p>
              <p className="font-['Manrope'] text-xs text-on-surface-variant mt-1 max-w-xs leading-relaxed">
                {t('addItems.emptyItemsDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {items.map((item) => {
                const itemCatId = (item.categoryId || 'other') as CategoryId;
                return (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest p-3 sm:p-3.5 rounded-2xl border border-surface-dim/70 flex items-center justify-between gap-2 shadow-xs group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <CategoryIcon categoryId={itemCatId} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap" dir="auto">
                          <BidiText className="font-['Manrope'] text-sm font-semibold text-primary truncate">
                            {item.name}
                          </BidiText>
                          {item.nameUrdu && (
                            <span className="font-urdu text-xs text-on-surface-variant/80 font-normal">
                              ({item.nameUrdu})
                            </span>
                          )}
                        </div>
                        {item.rawInput && item.rawInput.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                          <p className="font-['Manrope'] text-[10px] text-outline truncate">
                            typed: "<bdi>{item.rawInput}</bdi>"
                          </p>
                        )}

                        {/* Category Dropdown picker for instant override */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <div className="relative inline-block">
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
                              className={`text-[11px] font-['Manrope'] font-medium px-2 py-0.5 rounded-md border outline-none cursor-pointer transition-colors ${
                                itemCatId === 'uncategorized'
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
                          </div>
                          {itemCatId === 'uncategorized' && (
                            <span className="text-[10px] font-['Manrope'] text-amber-600 dark:text-amber-400 font-medium">
                              Tap to assign
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-['Manrope'] text-xs font-bold border border-surface-dim transition-colors active:scale-95 cursor-pointer"
                        title="Tap to edit quantity and unit"
                      >
                        <bdi dir="ltr">{item.quantity ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}` : '1x'}</bdi>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Remove item"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-colors"
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
      </main>

      {/* Quantity Edit Modal */}
      <QuantityEditModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveQuantity}
      />

      {/* Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto p-4 bg-background/95 backdrop-blur-md border-t border-surface-dim/40 z-40">
        <button
          onClick={() => onStartShopping(items)}
          className="w-full h-14 rounded-full bg-primary text-on-primary font-['Manrope'] text-base font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{t('addItems.startShoppingBtn')}</span>
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

