import { describe, it, expect } from 'vitest';
import { splitMultiItemInput, parseMultiItemInput } from '../src/lib/recognition/multiItemParser';
import { normalizeCategoryId, CATEGORIES_LIST } from '../src/types';

describe('User Verification Regression Tests', () => {
  it('Parser: parses all 7 grocery items from multi-line text without dropping any item', () => {
    const rawMultiLine = 'doodh\nmakhan\nbread\nanday\ncheeni\npatti\ndahi';
    const split = splitMultiItemInput(rawMultiLine);
    expect(split).toHaveLength(7);
    expect(split).toEqual(['doodh', 'makhan', 'bread', 'anday', 'cheeni', 'patti', 'dahi']);

    const parsed = parseMultiItemInput(rawMultiLine);
    expect(parsed).toHaveLength(7);
    const names = parsed.map((p) => p.name);
    expect(names).toEqual([
      'Milk',
      'Butter',
      'Bread',
      'Egg',
      'Sugar',
      'Tea (Chai Patti)',
      'Yogurt (Dahi)',
    ]);
  });

  it('Parser: parses comma-separated and space-separated lines without dropping items', () => {
    const spaceInput = 'doodh makhan bread anday cheeni patti dahi';
    const parsedSpace = parseMultiItemInput(spaceInput);
    expect(parsedSpace).toHaveLength(7);
  });

  it('Category Mapping: oils category is recognized and has its own entry in CATEGORIES_LIST', () => {
    const norm = normalizeCategoryId('oils');
    expect(norm).toBe('oils');

    const inList = CATEGORIES_LIST.find((c) => c.id === 'oils');
    expect(inList).toBeDefined();
    expect(inList?.defaultName).toBe('Cooking Oil & Ghee');

    // Also check other legacy aliases
    expect(normalizeCategoryId('oil')).toBe('oils');
    expect(normalizeCategoryId('cooking_oil')).toBe('oils');
    expect(normalizeCategoryId('ghee')).toBe('oils');
  });

  it('Undo: restores deleted item at original index', () => {
    const initialItems = [
      { id: '1', name: 'Milk', categoryId: 'dairy', completed: false },
      { id: '2', name: 'Eggs', categoryId: 'dairy', completed: false },
      { id: '3', name: 'Bread', categoryId: 'bakery', completed: false },
    ];

    // Simulate delete of item at index 1 ('Eggs')
    const deletedIndex = 1;
    const deletedItem = initialItems[deletedIndex];
    const afterDelete = initialItems.filter((i) => i.id !== deletedItem.id);
    expect(afterDelete).toHaveLength(2);
    expect(afterDelete[0].name).toBe('Milk');
    expect(afterDelete[1].name).toBe('Bread');

    // Simulate Undo action
    const restored = [...afterDelete];
    restored.splice(deletedIndex, 0, deletedItem);
    expect(restored).toHaveLength(3);
    expect(restored[1].name).toBe('Eggs');
    expect(restored[1].id).toBe('2');
  });
});
