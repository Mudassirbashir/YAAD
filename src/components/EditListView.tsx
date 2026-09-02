import React, { useState } from 'react';
import { Plus, Search, X, Check } from 'lucide-react';
import { ShoppingList, ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { TopHeader } from './TopHeader';
import { CategoryIcon } from './CategoryIcon';
import { useLanguage } from '../context/LanguageContext';
import {
  categorizeItemLocally,
  saveUserCategoryOverride,
} from '../lib/categorizer';
import { generateUUID } from '../lib/uuid';

interface EditListViewProps {
  list: ShoppingList;
  onBack: () => void;
  onSave: (updatedList: ShoppingList) => void;
  onOpenProfile: () => void;
}

export const EditListView: React.FC<EditListViewProps> = ({
  list,
  onBack,
  onSave,
  onOpenProfile,
}) => {
  const { t, getCategoryName } = useLanguage();
  const [title, setTitle] = useState<string>(list.title);
  const [items, setItems] = useState<ShoppingItem[]>(list.items);
  const [newItemName, setNewItemName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('vegetables');

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    // Use smart categorizer if default or use selected
    const local = categorizeItemLocally(trimmed);
    const catId = local.confidence >= 0.7 ? local.categoryId : selectedCategory;

    const newItem: ShoppingItem = {
      id: generateUUID(),
      name: trimmed,
      categoryId: catId,
      category: getCategoryName(catId),
      completed: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
  };

  const handleUpdateItemName = (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
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

  const handleUpdateQuantity = (id: string, currentQty?: string, currentUnit?: string) => {
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

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

  // Group items by categoryId
  const categoryIds: CategoryId[] = Array.from(
    new Set(items.map((i) => (i.categoryId || 'other') as CategoryId))
  );

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-32">
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
        <div className="mb-2">
          <label className="sr-only" htmlFor="listName">
            {t('editList.title')}
          </label>
          <input
            id="listName"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-b-2 border-primary focus:border-primary-container outline-none py-1 text-3xl font-bold font-['Plus_Jakarta_Sans'] text-primary transition-colors tracking-tight"
            placeholder={t('editList.namePlaceholder')}
            type="text"
          />
          <p className="text-on-surface-variant font-['Manrope'] text-sm mt-1.5">
            {t('editList.editingCount', { count: items.length })}
          </p>
        </div>

        {/* Add Item Input */}
        <div className="space-y-2.5">
          <form
            onSubmit={handleAddItem}
            className="flex items-center bg-surface-container-lowest rounded-full shadow-[0px_4px_20px_rgba(0,30,21,0.05)] border border-surface-container-high focus-within:border-primary transition-colors p-1 pl-4 pr-1.5"
          >
            <Search className="w-5 h-5 text-outline mr-2 shrink-0" />
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none font-['Manrope'] text-base text-on-surface py-2.5"
              placeholder={t('editList.inputPlaceholder')}
              type="text"
            />
            <button
              type="submit"
              aria-label="Add item"
              className="bg-secondary-container text-on-secondary-container rounded-full h-10 w-10 flex items-center justify-center hover:opacity-90 active:scale-95 transition-opacity shrink-0 shadow-xs"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
            {CATEGORIES_LIST.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-['Manrope'] text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
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

        {/* List Items Container */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0px_4px_20px_rgba(0,30,21,0.04)] overflow-hidden border border-surface-container-high/60">
          {categoryIds.length === 0 ? (
            <div className="p-8 text-center text-outline font-['Manrope'] text-sm">
              {t('editList.emptyList')}
            </div>
          ) : (
            categoryIds.map((catId) => {
              const catItems = items.filter((i) => (i.categoryId || 'other') === catId);
              return (
                <div key={catId}>
                  <div className="px-4 py-2.5 bg-surface-container-low/40 border-b border-surface-container-high/60 flex justify-between items-center">
                    <h3 className="font-['Manrope'] text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <CategoryIcon categoryId={catId} className="w-4 h-4 text-primary/70" />
                      <span>{getCategoryName(catId)}</span>
                    </h3>
                    <span className="text-xs text-outline font-semibold">
                      {catItems.length}
                    </span>
                  </div>

                  <ul className="divide-y divide-surface-container-high/40">
                    {catItems.map((item) => {
                      const itemCatId = (item.categoryId || 'other') as CategoryId;
                      return (
                        <li
                          key={item.id}
                          className="p-3.5 flex items-center gap-3 bg-surface-container-lowest group hover:bg-surface-container-low/30 transition-colors"
                        >
                          <div className="flex-grow flex flex-col gap-1 min-w-0">
                            <input
                              value={item.name}
                              onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                              className="bg-transparent border-none outline-none font-['Manrope'] text-base text-on-surface w-full focus:ring-0 p-0 m-0"
                              type="text"
                            />

                            <select
                              value={itemCatId}
                              onChange={(e) =>
                                handleUpdateItemCategory(
                                  item.id,
                                  e.target.value as CategoryId,
                                  item.name
                                )
                              }
                              aria-label={`Category for ${item.name}`}
                              className="text-[11px] font-['Manrope'] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md border border-surface-dim outline-none w-fit cursor-pointer"
                            >
                              {CATEGORIES_LIST.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {getCategoryName(c.id)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, item.unit)}
                              className="text-outline font-['Manrope'] text-xs bg-surface-container-low px-2.5 py-1 rounded-full hover:bg-surface-container transition-colors"
                              title="Click to adjust quantity"
                            >
                              {item.quantity ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}` : '1x'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              aria-label={`Delete ${item.name}`}
                              className="text-outline-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container/20 active:scale-95"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Save Action */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto z-40 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8 px-5 flex justify-center pointer-events-none">
        <button
          onClick={handleSave}
          className="pointer-events-auto bg-primary text-on-primary font-['Manrope'] font-bold rounded-full h-[56px] px-8 w-full max-w-md shadow-[0px_8px_24px_rgba(0,30,21,0.2)] hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{t('editList.saveChanges')}</span>
          <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

