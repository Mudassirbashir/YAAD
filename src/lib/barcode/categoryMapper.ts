import { CategoryId } from '../../types';

/**
 * Maps open product database categories, category tags, and product names
 * into YAAD's canonical CategoryId.
 */
export function mapToYaadCategory(
  categoriesTags: string[] = [],
  categoriesString: string = '',
  productName: string = ''
): CategoryId {
  const combined = [
    ...categoriesTags,
    categoriesString,
    productName,
  ]
    .join(' ')
    .toLowerCase();

  // 1. Snacks & Confectionery (checked early so "chocolate" doesn't trigger "cola")
  if (
    /\b(snack|snacks|biscuit|biscuits|cookie|cookies|oreo|prince|lu|tuc|wafer|wafers|chips|crisps|lays|kurkure|nimko|chocolate|chocolates|candy|candies|sweet|sweets|toffee|bar|bars|twix|snickers|mars|kitkat|cadbury)\b/i.test(
      combined
    )
  ) {
    return 'snacks';
  }

  // 2. Dairy
  if (
    /\b(dairy|milk|milks|olpers|milkpak|nestle|tarang|cheese|yogurt|dahi|butter|makhan|cream|malai|paneer)\b/i.test(
      combined
    )
  ) {
    return 'dairy';
  }

  // 3. Beverages & Drinks
  if (
    /\b(beverage|beverages|drink|drinks|juice|juices|soda|sodas|cola|pepsi|coke|sprite|fanta|tea|chai|coffee|nescafe|water|sharbat|rooh|tang|energy drink|milkshake|smoothie)\b/i.test(
      combined
    )
  ) {
    return 'beverages';
  }

  // 4. Cooking Oil & Ghee
  if (
    /\b(oil|oils|ghee|dalda|habib|sufi|canola|sunflower|olive oil|mustard oil|banaspati)\b/i.test(
      combined
    )
  ) {
    return 'oils';
  }

  // 5. Bakery
  if (
    /\b(bakery|bread|breads|roti|naan|bun|buns|cake|cakes|pastry|pastries|rusk|rusks|sheermal|bakarkhani)\b/i.test(
      combined
    )
  ) {
    return 'bakery';
  }

  // 6. Rice
  if (/\b(rice|basmati|chawal|sela|super kernel)\b/i.test(combined)) {
    return 'rice';
  }

  // 7. Pulses & Lentils
  if (
    /\b(pulse|pulses|lentil|lentils|dal|daal|chana|moong|masoor|urad|chickpea|chickpeas|lobiya)\b/i.test(
      combined
    )
  ) {
    return 'pulses';
  }

  // 8. Spices & Seasoning
  if (
    /\b(spice|spices|seasoning|masala|masalas|shan|national|mehran|salt|namak|pepper|chilli|mirch|turmeric|haldi|coriander|dhaniya|cumin|zeera|clove|cinnamon)\b/i.test(
      combined
    )
  ) {
    return 'spices';
  }

  // 9. Sauces, Condiments & Spreads
  if (
    /\b(sauce|sauces|condiment|condiments|ketchup|mayo|mayonnaise|chutney|vinegar|sirka|soy sauce|chili sauce|jam|honey|spread|spreads|nutella|peanut butter)\b/i.test(
      combined
    )
  ) {
    return 'sauces_condiments';
  }

  // 10. Frozen Food
  if (
    /\b(frozen|ice cream|k&n|dawn|menu|nugget|nuggets|kabab|kebab|paratha|parathas|samosa|samosas|roll|rolls|peas)\b/i.test(
      combined
    )
  ) {
    return 'frozen';
  }

  // 11. Poultry & Eggs
  if (/\b(poultry|chicken|egg|eggs|anda|ande|murgi)\b/i.test(combined)) {
    return 'poultry';
  }

  // 12. Meat
  if (/\b(meat|beef|mutton|gosht|lamb|veal)\b/i.test(combined)) {
    return 'meat';
  }

  // 13. Seafood
  if (/\b(seafood|fish|prawn|prawns|machli|tuna|salmon)\b/i.test(combined)) {
    return 'seafood';
  }

  // 14. Fruits
  if (
    /\b(fruit|fruits|apple|apples|banana|bananas|mango|mangoes|orange|oranges|grape|grapes|kela|seb|aam)\b/i.test(
      combined
    )
  ) {
    return 'fruits';
  }

  // 15. Vegetables
  if (
    /\b(vegetable|vegetables|veggie|veggies|sabzi|potato|potatoes|aloo|onion|onions|pyaz|tomato|tomatoes|tamatar|garlic|ginger|adrak|lehsan)\b/i.test(
      combined
    )
  ) {
    return 'vegetables';
  }

  // 16. Dry Fruits & Nuts
  if (
    /\b(dry fruit|dry fruits|nut|nuts|almond|almonds|badam|pistachio|pistachios|pista|cashew|cashews|kaju|walnut|walnuts|akhrot|raisin|raisins|kishmish)\b/i.test(
      combined
    )
  ) {
    return 'dry_fruits';
  }

  // 17. Grains & Flour
  if (
    /\b(grain|grains|cereal|cereals|atta|flour|maida|suji|oat|oats|cornflakes|wheat)\b/i.test(
      combined
    )
  ) {
    return 'grains';
  }

  // 18. Personal Care & Hygiene
  if (
    /\b(personal care|hygiene|soap|soaps|body wash|shampoo|conditioner|toothpaste|colgate|sensodyne|lotion|cream|deodorant|perfume|shaving|razor|facewash)\b/i.test(
      combined
    )
  ) {
    return 'personal_care';
  }

  // 19. Cleaning & Laundry
  if (
    /\b(cleaning|detergent|detergents|surf|aerial|bonus|harpic|dettol|bleach|dishwash|max|vim|phenyl|floor cleaner)\b/i.test(
      combined
    )
  ) {
    return 'cleaning';
  }

  // 20. Baby Care
  if (/\b(baby|infant|diaper|diapers|pampers|cerelac|feeder|wipes)\b/i.test(combined)) {
    return 'baby_care';
  }

  // 21. Health & Medicine
  if (
    /\b(health|medicine|medicines|vitamin|vitamins|supplement|panadol|disprin|first aid|bandage)\b/i.test(
      combined
    )
  ) {
    return 'health';
  }

  // 22. Household
  if (
    /\b(household|tissue|tissues|rose petal|aluminum foil|foil|battery|batteries|light|bulb|matchbox|candle|candles)\b/i.test(
      combined
    )
  ) {
    return 'household';
  }

  // Default fallback for general grocery packages
  return 'cooking_essentials';
}
