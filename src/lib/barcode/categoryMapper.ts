import { CategoryId, normalizeCategoryId } from '../../types';

/**
 * Maps Open Food Facts and Open Products Facts category tags or names
 * to YAAD's canonical CategoryId.
 */
export function mapProviderCategoryToYAAD(
  categoriesTags?: string[],
  categoryName?: string
): CategoryId {
  const candidates: string[] = [];

  if (categoriesTags && Array.isArray(categoriesTags)) {
    // Traverse from most specific (end) to least specific (beginning)
    for (let i = categoriesTags.length - 1; i >= 0; i--) {
      candidates.push(categoriesTags[i].toLowerCase().replace(/^en:/, '').trim());
    }
  }

  if (categoryName && typeof categoryName === 'string') {
    candidates.push(categoryName.toLowerCase().trim());
  }

  for (const tag of candidates) {
    // 1. Dairy
    if (
      tag.includes('dairy') ||
      tag.includes('milk') ||
      tag.includes('cheese') ||
      tag.includes('yogurt') ||
      tag.includes('butter') ||
      tag.includes('cream')
    ) {
      return 'dairy';
    }

    // 2. Beverages
    if (
      tag.includes('beverage') ||
      tag.includes('drink') ||
      tag.includes('juice') ||
      tag.includes('soda') ||
      tag.includes('water') ||
      tag.includes('tea') ||
      tag.includes('coffee')
    ) {
      return 'beverages';
    }

    // 3. Snacks & Confectionery
    if (
      tag.includes('snack') ||
      tag.includes('biscuit') ||
      tag.includes('cookie') ||
      tag.includes('chocolate') ||
      tag.includes('chip') ||
      tag.includes('crisp') ||
      tag.includes('candy') ||
      tag.includes('confectionery')
    ) {
      return 'snacks';
    }

    // 4. Bakery
    if (
      tag.includes('bread') ||
      tag.includes('bakery') ||
      tag.includes('pastry') ||
      tag.includes('cake') ||
      tag.includes('toast')
    ) {
      return 'bakery';
    }

    // 5. Cooking Oil & Ghee
    if (
      tag.includes('cooking-oil') ||
      tag.includes('vegetable-oil') ||
      tag.includes('olive-oil') ||
      tag.includes('ghee') ||
      tag.includes('fats') ||
      tag === 'oil' ||
      tag === 'oils'
    ) {
      return 'oils';
    }

    // 6. Fruits
    if (tag.includes('fruit')) {
      return 'fruits';
    }

    // 7. Vegetables
    if (tag.includes('vegetable') || tag.includes('salad') || tag.includes('potato')) {
      return 'vegetables';
    }

    // 8. Meat & Poultry & Seafood
    if (tag.includes('poultry') || tag.includes('chicken') || tag.includes('egg')) {
      return 'poultry';
    }
    if (tag.includes('fish') || tag.includes('seafood') || tag.includes('shrimp')) {
      return 'seafood';
    }
    if (tag.includes('meat') || tag.includes('beef') || tag.includes('mutton') || tag.includes('lamb')) {
      return 'meat';
    }

    // 9. Rice, Grains, Pulses
    if (tag.includes('rice')) {
      return 'rice';
    }
    if (tag.includes('lentil') || tag.includes('pulse') || tag.includes('bean') || tag.includes('dal')) {
      return 'pulses';
    }
    if (
      tag.includes('cereal') ||
      tag.includes('flour') ||
      tag.includes('grain') ||
      tag.includes('wheat') ||
      tag.includes('oat') ||
      tag.includes('pasta') ||
      tag.includes('noodle')
    ) {
      return 'grains';
    }

    // 10. Spices & Condiments & Cooking Essentials
    if (tag.includes('spice') || tag.includes('seasoning') || tag.includes('pepper') || tag.includes('salt')) {
      return 'spices';
    }
    if (tag.includes('sauce') || tag.includes('condiment') || tag.includes('ketchup') || tag.includes('mayonnaise') || tag.includes('vinegar')) {
      return 'sauces_condiments';
    }
    if (tag.includes('spread') || tag.includes('jam') || tag.includes('honey') || tag.includes('canned')) {
      return 'cooking_essentials';
    }

    // 11. Frozen Foods
    if (tag.includes('frozen') || tag.includes('ice-cream')) {
      return 'frozen';
    }

    // 12. Non-Food Categories (Open Products Facts)
    // Cleaning
    if (
      tag.includes('cleaning') ||
      tag.includes('detergent') ||
      tag.includes('dishwashing') ||
      tag.includes('laundry') ||
      tag.includes('bleach')
    ) {
      return 'cleaning';
    }

    // Personal Care
    if (
      tag.includes('personal-care') ||
      tag.includes('cosmetic') ||
      tag.includes('hygiene') ||
      tag.includes('shampoo') ||
      tag.includes('soap') ||
      tag.includes('toothpaste') ||
      tag.includes('deodorant')
    ) {
      return 'personal_care';
    }

    // Baby Care
    if (tag.includes('baby') || tag.includes('diaper') || tag.includes('infant')) {
      return 'baby_care';
    }

    // Health & Medicines
    if (tag.includes('medicine') || tag.includes('pharmacy') || tag.includes('health') || tag.includes('vitamin') || tag.includes('first-aid')) {
      return 'health';
    }

    // Stationery
    if (tag.includes('stationery') || tag.includes('pen') || tag.includes('paper') || tag.includes('office')) {
      return 'stationery';
    }

    // Kitchen & Household
    if (tag.includes('kitchen') || tag.includes('cookware') || tag.includes('tableware')) {
      return 'kitchen';
    }
    if (
      tag.includes('household') ||
      tag.includes('home') ||
      tag.includes('pet') ||
      tag.includes('dog') ||
      tag.includes('cats') ||
      tag.includes('cat-food') ||
      tag === 'cat'
    ) {
      return 'household';
    }

    // Electronics
    if (tag.includes('electronic') || tag.includes('battery') || tag.includes('appliance')) {
      return 'electronics';
    }
  }

  return normalizeCategoryId('other');
}
