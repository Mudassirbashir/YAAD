import { CanonicalItemRecord, ItemCatalogProvider } from './types';
import { normalizeBaseText, normalizePhonetic } from './normalizer';
import { stringSimilarity, FUZZY_MIN_ACCEPTABLE_SCORE } from './fuzzyMatcher';
import { PAKISTANI_GROCERY_ITEMS } from '../../data/pakistaniGroceryData';
import { INITIAL_MASTER_CATALOG } from '../catalog/items';

/**
 * Priority Foundation Catalog Items.
 * Specifically satisfies core recognition test targets:
 * - آلو / aloo / alu / alo / aalu -> Potato (Vegetables) 🥔
 * - پیاز / pyaaz / pyaz -> Onion (Vegetables) 🧅
 * - ہری مرچ -> Green Chili (Vegetables) 🌶️
 * - چینی -> Sugar (Grocery) 🧂
 * - فٹکری -> Alum (Herbal / Personal Care) 🌿
 * - lime stone -> Limestone (Hardware) 🧱
 */
const CORE_CANONICAL_ITEMS: CanonicalItemRecord[] = [
  {
    id: 'potato',
    canonical_name: 'Potato',
    english_name: 'Potato',
    urdu_name: 'آلو',
    roman_urdu_names: ['Aloo', 'Alu', 'Alo', 'Aalu'],
    aliases: [
      'potato', 'potatoes', 'potatos', 'potatoe',
      'aloo', 'alu', 'alo', 'aalu', 'allu', 'aaloo', 'aluu', 'aluuu', 'aluw',
      'آلو', 'الو', 'پوٹاٹو', 'پٹاٹو',
    ],
    category: 'vegetables',
    subcategory: 'Root Vegetables',
    common_spellings: ['poteto', 'potatoe', 'allu', 'alo', 'aalu', 'aluu', 'aluuu'],
    confidence: 0.98,
    active: true,
    emoji: '🥔',
    defaultUnit: 'kg',
    canonicalName: 'Potato',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'Aloo',
    categoryId: 'vegetables',
  },
  {
    id: 'egg',
    canonical_name: 'Egg',
    english_name: 'Egg',
    urdu_name: 'انڈے',
    roman_urdu_names: ['Anday', 'Anda', 'Ande'],
    aliases: [
      'egg', 'eggs', 'eg', 'egs',
      'anday', 'anda', 'ande', 'andey', 'desi anday', 'farmi anday', 'desi anda',
      'انڈہ', 'انڈے', 'انڈوں',
    ],
    category: 'dairy',
    subcategory: 'Dairy & Eggs',
    common_spellings: ['anday', 'anda', 'ande', 'egs'],
    confidence: 0.98,
    active: true,
    emoji: '🥚',
    defaultUnit: 'dozen',
    canonicalName: 'Egg',
    nameUrdu: 'انڈے',
    nameRomanUrdu: 'Anday',
    categoryId: 'dairy',
  },
  {
    id: 'garlic',
    canonical_name: 'Garlic',
    english_name: 'Garlic',
    urdu_name: 'لہسن',
    roman_urdu_names: ['Lehsan', 'Lahsun', 'Lahsan', 'Lasun'],
    aliases: [
      'garlic', 'garlics',
      'lehsan', 'lehsun', 'lahsan', 'lahsun', 'lasun', 'lahson', 'lehson', 'lehsan paste', 'lehsun paste',
      'لہسن', 'لہسن پیسٹ',
    ],
    category: 'vegetables',
    subcategory: 'Root Vegetables',
    common_spellings: ['lahsun', 'lehsan', 'lahsan', 'lasun', 'garlic'],
    confidence: 0.98,
    active: true,
    emoji: '🧄',
    defaultUnit: 'pao',
    canonicalName: 'Garlic',
    nameUrdu: 'لہسن',
    nameRomanUrdu: 'Lehsan',
    categoryId: 'vegetables',
  },
  {
    id: 'ginger',
    canonical_name: 'Ginger',
    english_name: 'Ginger',
    urdu_name: 'ادرک',
    roman_urdu_names: ['Adrak', 'Adrik', 'Aadrak'],
    aliases: [
      'ginger', 'gingers',
      'adrak', 'adrik', 'aadrak', 'adrakh', 'fresh ginger', 'adrak paste',
      'ادرک', 'ادرک پیسٹ',
    ],
    category: 'vegetables',
    subcategory: 'Root Vegetables',
    common_spellings: ['adrak', 'adrik', 'aadrak', 'ginger'],
    confidence: 0.98,
    active: true,
    emoji: '🫚',
    defaultUnit: 'pao',
    canonicalName: 'Ginger',
    nameUrdu: 'ادرک',
    nameRomanUrdu: 'Adrak',
    categoryId: 'vegetables',
  },
  {
    id: 'salt',
    canonical_name: 'Salt',
    english_name: 'Salt',
    urdu_name: 'نمک',
    roman_urdu_names: ['Namak', 'Lahori Namak'],
    aliases: [
      'salt', 'salts', 'table salt', 'iodized salt', 'white salt', 'pink salt',
      'namak', 'nimak', 'lahori namak', 'kala namak',
      'نمک', 'سفید نمک', 'لاہوری نمک', 'کالا نمک',
    ],
    category: 'cooking_essentials',
    subcategory: 'Cooking Essentials',
    common_spellings: ['namak', 'nimak', 'salt'],
    confidence: 0.98,
    active: true,
    emoji: '🧂',
    defaultUnit: 'packet',
    canonicalName: 'Salt',
    nameUrdu: 'نمک',
    nameRomanUrdu: 'Namak',
    categoryId: 'cooking_essentials',
  },
  {
    id: 'lemon',
    canonical_name: 'Lemon',
    english_name: 'Lemon',
    urdu_name: 'لیموں',
    roman_urdu_names: ['Lemon', 'Lime', 'Leemu', 'Limu', 'Nimbu'],
    aliases: [
      'lemon', 'lemons', 'lime', 'limes',
      'leemu', 'limu', 'nimbu', 'neebu', 'desi leemu', 'kaghzi leemu',
      'لیموں', 'لیمو', 'نیبو',
    ],
    category: 'fruits',
    subcategory: 'Citrus Fruits',
    common_spellings: ['leemu', 'limu', 'nimbu', 'lemon', 'lime'],
    confidence: 0.98,
    active: true,
    emoji: '🍋',
    defaultUnit: 'pao',
    canonicalName: 'Lemon',
    nameUrdu: 'لیموں',
    nameRomanUrdu: 'Leemu',
    categoryId: 'fruits',
  },
  {
    id: 'green_chili',
    canonical_name: 'Green Chilli',
    english_name: 'Green Chilli',
    urdu_name: 'ہری مرچ',
    roman_urdu_names: ['Hari Mirch', 'Hari Mirchi', 'Sabz Mirch'],
    aliases: [
      'green chili', 'green chilli', 'green chillies', 'green chilies', 'green chilly',
      'hari mirch', 'hari mirchi', 'haree mirch', 'harimirch', 'sabz mirch', 'hari mir',
      'ہری مرچ', 'ہری مرچی', 'سبز مرچ',
    ],
    category: 'vegetables',
    subcategory: 'Fresh Herbs & Chilis',
    common_spellings: ['green chili', 'green chilli', 'hari mirche', 'harimirch', 'hari mirchi', 'hari mir'],
    confidence: 0.98,
    active: true,
    emoji: '🌶️',
    defaultUnit: 'pao',
    canonicalName: 'Green Chilli',
    nameUrdu: 'ہری مرچ',
    nameRomanUrdu: 'Hari Mirch',
    categoryId: 'vegetables',
  },
  {
    id: 'tomato',
    canonical_name: 'Tomato',
    english_name: 'Tomato',
    urdu_name: 'ٹماٹر',
    roman_urdu_names: ['Tamatar', 'Tamaatar'],
    aliases: [
      'tomato', 'tomatoes', 'tamatar', 'tamaatar', 'tmatar', 'tamatr', 'tamater', 'tamator',
      'ٹماٹر',
    ],
    category: 'vegetables',
    subcategory: 'Nightshades & Peppers',
    common_spellings: ['tamatar', 'tamaatar', 'tmatar', 'tamatr', 'tamater'],
    confidence: 0.98,
    active: true,
    emoji: '🍅',
    defaultUnit: 'kg',
    canonicalName: 'Tomato',
    nameUrdu: 'ٹماٹر',
    nameRomanUrdu: 'Tamatar',
    categoryId: 'vegetables',
  },
  {
    id: 'dhania',
    canonical_name: 'Coriander (Dhania)',
    english_name: 'Coriander',
    urdu_name: 'دھنیا',
    roman_urdu_names: ['Dhania', 'Dhaniya', 'Hara Dhania'],
    aliases: [
      'dhania', 'dhaniya', 'hara dhania', 'coriander', 'cilantro', 'dhanya', 'dhania patta',
      'دھنیا', 'ہرا دھنیا',
    ],
    category: 'herbs',
    subcategory: 'Fresh Herbs',
    common_spellings: ['dhaniya', 'dhania', 'hara dhanya'],
    confidence: 0.98,
    active: true,
    emoji: '🌿',
    defaultUnit: 'bunch',
    canonicalName: 'Coriander (Dhania)',
    nameUrdu: 'دھنیا',
    nameRomanUrdu: 'Dhania',
    categoryId: 'herbs',
  },
  {
    id: 'podina',
    canonical_name: 'Mint (Podina)',
    english_name: 'Mint',
    urdu_name: 'پودینہ',
    roman_urdu_names: ['Podina', 'Pudina', 'Podeena'],
    aliases: [
      'podina', 'pudina', 'podeena', 'mint', 'fresh mint', 'pudena', 'podina patta',
      'پودینہ',
    ],
    category: 'herbs',
    subcategory: 'Fresh Herbs',
    common_spellings: ['pudina', 'podina', 'podeena'],
    confidence: 0.98,
    active: true,
    emoji: '🌿',
    defaultUnit: 'bunch',
    canonicalName: 'Mint (Podina)',
    nameUrdu: 'پودینہ',
    nameRomanUrdu: 'Podina',
    categoryId: 'herbs',
  },
  {
    id: 'cinnamon',
    canonical_name: 'Cinnamon (Dar Cheeni)',
    english_name: 'Cinnamon',
    urdu_name: 'دار چینی',
    roman_urdu_names: ['Dar Cheeni', 'Dar Chini', 'Darchini', 'Dalchini'],
    aliases: [
      'cinnamon', 'cinnamon sticks', 'cinnamon powder',
      'dar cheeni', 'dar chini', 'darchini', 'dalchini', 'daalchini',
      'دار چینی', 'دارچینی',
    ],
    category: 'spices',
    subcategory: 'Whole Spices',
    common_spellings: ['cinamon', 'darchini', 'dar chini', 'dalchini'],
    confidence: 0.98,
    active: true,
    emoji: '🪵',
    defaultUnit: 'pao',
    canonicalName: 'Cinnamon (Dar Cheeni)',
    nameUrdu: 'دار چینی',
    nameRomanUrdu: 'Dar Cheeni',
    categoryId: 'spices',
  },
  {
    id: 'fitkari',
    canonical_name: 'Alum (Phitkari)',
    english_name: 'Alum',
    urdu_name: 'پھٹکری',
    roman_urdu_names: ['Phitkari', 'Fitkari', 'Phatkari', 'Phatakari'],
    aliases: [
      'fitkari', 'phitkari', 'phatkari', 'phatakari', 'fatkari', 'phitkiri', 'fitkri', 'fatkri', 'fatakari', 'alum', 'potash alum',
      'پھٹکری', 'فٹکری',
    ],
    category: 'health',
    subcategory: 'Herbal & Antiseptic Care',
    common_spellings: ['fitkiri', 'phitkri', 'fitkri', 'fatkari', 'phatkari', 'phatakari'],
    confidence: 0.98,
    active: true,
    emoji: '🩹',
    defaultUnit: 'pcs',
    canonicalName: 'Alum (Phitkari)',
    nameUrdu: 'پھٹکری',
    nameRomanUrdu: 'Phitkari',
    categoryId: 'health',
  },
  {
    id: 'limestone',
    canonical_name: 'Limestone (Choona)',
    english_name: 'Limestone',
    urdu_name: 'چونا',
    roman_urdu_names: ['Choona', 'Chuna', 'Safedi'],
    aliases: [
      'lime stone', 'limestone', 'choona', 'chuna', 'safedi', 'lime powder', 'slaked lime', 'quicklime', 'calcium carbonate',
      'چونا', 'سفیدی',
    ],
    category: 'household',
    subcategory: 'Building & Whitewash',
    common_spellings: ['limestone', 'limeston', 'chuna', 'choona'],
    confidence: 0.98,
    active: true,
    emoji: '🏠',
    defaultUnit: 'kg',
    canonicalName: 'Limestone (Choona)',
    nameUrdu: 'چونا',
    nameRomanUrdu: 'Choona',
    categoryId: 'household',
  },
  {
    id: 'sugar',
    canonical_name: 'Sugar',
    english_name: 'Sugar',
    urdu_name: 'چینی',
    roman_urdu_names: ['Cheeni', 'Chini'],
    aliases: [
      'sugar', 'sugr', 'white sugar', 'refined sugar',
      'cheeni', 'chini', 'cheni', 'shakar', 'shakkar',
      'چینی', 'شکر', 'سفید چینی',
    ],
    category: 'cooking_essentials',
    subcategory: 'Sweeteners & Staples',
    common_spellings: ['sugr', 'cheni', 'cheeni', 'shakar'],
    confidence: 0.98,
    active: true,
    emoji: '🧂',
    defaultUnit: 'kg',
    canonicalName: 'Sugar',
    nameUrdu: 'چینی',
    nameRomanUrdu: 'Cheeni',
    categoryId: 'cooking_essentials',
  },
  {
    id: 'haldi',
    canonical_name: 'Haldi',
    english_name: 'Turmeric',
    urdu_name: 'ہلدی',
    roman_urdu_names: ['Haldi', 'Huldi'],
    aliases: [
      'turmeric', 'turmeric powder', 'haldi', 'huldi', 'pisi haldi',
      'ہلدی',
    ],
    category: 'spices',
    subcategory: 'Ground Spices',
    common_spellings: ['haldi', 'huldi', 'turmeric'],
    confidence: 0.98,
    active: true,
    emoji: '🌶️',
    defaultUnit: 'pao',
    canonicalName: 'Haldi',
    nameUrdu: 'ہلدی',
    nameRomanUrdu: 'Haldi',
    categoryId: 'spices',
  },
  {
    id: 'lal_mirch',
    canonical_name: 'Lal Mirch',
    english_name: 'Red Chili',
    urdu_name: 'لال مرچ',
    roman_urdu_names: ['Lal Mirch', 'Surkh Mirch'],
    aliases: [
      'red chili', 'red chilli', 'lal mirch', 'surkh mirch', 'laal mirch', 'kuti lal mirch',
      'لال مرچ', 'سرخ مرچ',
    ],
    category: 'spices',
    subcategory: 'Ground Spices',
    common_spellings: ['lal mirch', 'laal mirch', 'surkh mirch'],
    confidence: 0.98,
    active: true,
    emoji: '🌶️',
    defaultUnit: 'pao',
    canonicalName: 'Lal Mirch',
    nameUrdu: 'لال مرچ',
    nameRomanUrdu: 'Lal Mirch',
    categoryId: 'spices',
  },
  {
    id: 'milk',
    canonical_name: 'Milk',
    english_name: 'Milk',
    urdu_name: 'دودھ',
    roman_urdu_names: ['Doodh', 'Dudh'],
    aliases: [
      'milk', 'fresh milk', 'doodh', 'dudh', 'dhudh', 'cow milk', 'buffalo milk',
      'دودھ',
    ],
    category: 'dairy',
    subcategory: 'Fresh Milk',
    common_spellings: ['doodh', 'dudh', 'dhudh'],
    confidence: 0.98,
    active: true,
    emoji: '🥛',
    defaultUnit: 'litre',
    canonicalName: 'Milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'Doodh',
    categoryId: 'dairy',
  },
  {
    id: 'surf',
    canonical_name: 'Surf',
    english_name: 'Washing Powder (Surf)',
    urdu_name: 'سرف',
    roman_urdu_names: ['Surf', 'Washing Powder', 'Ariel', 'Bonus'],
    aliases: [
      'surf', 'washing powder', 'detergent', 'surf excel', 'ariel', 'bonus', 'washing surf',
      'سرف',
    ],
    category: 'cleaning',
    subcategory: 'Laundry & Detergents',
    common_spellings: ['surf', 'serf', 'detergent'],
    confidence: 0.98,
    active: true,
    emoji: '✨',
    defaultUnit: 'kg',
    canonicalName: 'Surf',
    nameUrdu: 'سرف',
    nameRomanUrdu: 'Surf',
    categoryId: 'cleaning',
  },
  {
    id: 'shampoo',
    canonical_name: 'Shampoo',
    english_name: 'Shampoo',
    urdu_name: 'شیمپو',
    roman_urdu_names: ['Shampoo', 'Shampu'],
    aliases: [
      'shampoo', 'hair shampoo', 'sunsilk', 'head and shoulders', 'pantene', 'shampu', 'conditioner',
      'شیمپو',
    ],
    category: 'personal_care',
    subcategory: 'Hair Care',
    common_spellings: ['shampoo', 'shampu', 'shampo'],
    confidence: 0.98,
    active: true,
    emoji: '🧼',
    defaultUnit: 'bottle',
    canonicalName: 'Shampoo',
    nameUrdu: 'شیمپو',
    nameRomanUrdu: 'Shampoo',
    categoryId: 'personal_care',
  },
  {
    id: 'onion',
    canonical_name: 'Onion',
    english_name: 'Onion',
    urdu_name: 'پیاز',
    roman_urdu_names: ['Pyaz', 'Pyaaz', 'Piyaz'],
    aliases: [
      'onion', 'onions', 'onoin', 'onins',
      'pyaz', 'pyaaz', 'piyaz', 'payaz', 'piaaz', 'pyaas', 'piazz', 'pyazz',
      'pyaj', 'pyaaj', 'piyaj',
      'پیاز',
    ],
    category: 'vegetables',
    subcategory: 'Root Vegetables',
    common_spellings: ['onoin', 'onins', 'pyaas', 'piaaz', 'pyz', 'pyaj', 'pyaaj', 'piyaj'],
    confidence: 0.98,
    active: true,
    emoji: '🧅',
    defaultUnit: 'kg',
    canonicalName: 'Onion',
    nameUrdu: 'پیاز',
    nameRomanUrdu: 'Pyaz',
    categoryId: 'vegetables',
  },
  {
    id: 'oil',
    canonical_name: 'Cooking Oil',
    english_name: 'Cooking Oil',
    urdu_name: 'تیل',
    roman_urdu_names: ['Cooking Oil', 'Tail', 'Tel', 'Ghee'],
    aliases: [
      'oil', 'cooking oil', 'vegetable oil', 'mustard oil', 'sunflower oil', 'canola oil',
      'tail', 'tel', 'meetha tail', 'sarson ka tail', 'ghee', 'banaspati ghee',
      'تیل', 'کوکنگ آئل', 'گھی',
    ],
    category: 'cooking_essentials',
    subcategory: 'Oils & Ghee',
    common_spellings: ['cooking oil', 'oil', 'tail', 'tel', 'ghee'],
    confidence: 0.98,
    active: true,
    emoji: '🛢️',
    defaultUnit: 'bottle',
    canonicalName: 'Cooking Oil',
    nameUrdu: 'تیل',
    nameRomanUrdu: 'Cooking Oil',
    categoryId: 'cooking_essentials',
  },
  {
    id: 'biscuits',
    canonical_name: 'Biscuits',
    english_name: 'Biscuits',
    urdu_name: 'بسکٹ',
    roman_urdu_names: ['Biscuits', 'Biscuit', 'Cookies'],
    aliases: [
      'biscuits', 'biscuit', 'cookies', 'cookie', 'biskut', 'rusk', 'cake rusk',
      'بسکٹ', 'کوکیز',
    ],
    category: 'snacks',
    subcategory: 'Bakery & Biscuits',
    common_spellings: ['biskut', 'biscut', 'biscits', 'cookies'],
    confidence: 0.98,
    active: true,
    emoji: '🍪',
    defaultUnit: 'packet',
    canonicalName: 'Biscuits',
    nameUrdu: 'بسکٹ',
    nameRomanUrdu: 'Biscuits',
    categoryId: 'snacks',
  },
  {
    id: 'bread',
    canonical_name: 'Bread',
    english_name: 'Bread',
    urdu_name: 'ڈبل روٹی',
    roman_urdu_names: ['Bread', 'Double Roti'],
    aliases: [
      'bread', 'breads', 'white bread', 'brown bread', 'double roti', 'dabal roti', 'duble roti',
      'ڈبل روٹی', 'بریڈ',
    ],
    category: 'bakery',
    subcategory: 'Fresh Breads',
    common_spellings: ['dabal roti', 'double roti', 'bread'],
    confidence: 0.98,
    active: true,
    emoji: '🍞',
    defaultUnit: 'piece',
    canonicalName: 'Bread',
    nameUrdu: 'ڈبل روٹی',
    nameRomanUrdu: 'Bread',
    categoryId: 'bakery',
  },
  {
    id: 'rice',
    canonical_name: 'Rice',
    english_name: 'Rice',
    urdu_name: 'چاول',
    roman_urdu_names: ['Chawal', 'Basmati Chawal', 'Rice'],
    aliases: [
      'rice', 'rices', 'chawal', 'chaawal', 'chawul', 'basmati', 'basmati rice', 'sella rice', 'totay chawal',
      'چاول', 'باسمتی چاول',
    ],
    category: 'rice',
    subcategory: 'Rice & Grains',
    common_spellings: ['chawal', 'chaawal', 'chawul'],
    confidence: 0.98,
    active: true,
    emoji: '🍚',
    defaultUnit: 'kg',
    canonicalName: 'Rice',
    nameUrdu: 'چاول',
    nameRomanUrdu: 'Chawal',
    categoryId: 'rice',
  },
];

/**
 * Scalable In-Memory Catalog Engine with O(1) Pre-Indexed Hash Lookups
 */
export class ItemCatalog implements ItemCatalogProvider {
  private itemMap = new Map<string, CanonicalItemRecord>();
  private exactMap = new Map<string, CanonicalItemRecord>();
  private phoneticMap = new Map<string, CanonicalItemRecord>();
  private commonSpellingMap = new Map<string, CanonicalItemRecord>();
  private allItems: CanonicalItemRecord[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // 1. Register Priority Core Items
    this.registerItems(CORE_CANONICAL_ITEMS);

    // 2. Register Master Catalog items (covering all household & regional categories)
    const convertedMasterItems: CanonicalItemRecord[] = INITIAL_MASTER_CATALOG
      .filter((item) => !this.itemMap.has(item.id))
      .map((item) => ({
        id: item.id,
        canonical_name: item.canonical_name,
        english_name: item.english_name,
        urdu_name: item.urdu_name,
        roman_urdu_names: item.roman_urdu_names,
        aliases: item.aliases,
        category: item.category_id,
        subcategory: item.subcategory_id,
        common_spellings: item.common_misspellings,
        confidence: 0.98,
        active: item.active,
        emoji: item.emoji,
        defaultUnit: item.default_unit,
        canonicalName: item.canonical_name,
        nameUrdu: item.urdu_name,
        nameRomanUrdu: item.roman_urdu_names[0] || '',
        categoryId: item.category_id,
      }));
    this.registerItems(convertedMasterItems);

    // 3. Hydrate from Pakistani Grocery Database (expanding with any additional items)
    const convertedPakistaniItems: CanonicalItemRecord[] = PAKISTANI_GROCERY_ITEMS
      // Do not overwrite core or master items if already registered
      .filter((item) => !this.itemMap.has(item.id))
      .map((item) => ({
        id: item.id,
        canonical_name: item.canonicalName,
        english_name: item.canonicalName,
        urdu_name: item.nameUrdu,
        roman_urdu_names: [item.nameRomanUrdu],
        aliases: item.aliases,
        category: item.categoryId,
        common_spellings: [],
        confidence: 0.98,
        active: true,
        defaultUnit: item.defaultUnit,
        canonicalName: item.canonicalName,
        nameUrdu: item.nameUrdu,
        nameRomanUrdu: item.nameRomanUrdu,
        categoryId: item.categoryId,
      }));

    this.registerItems(convertedPakistaniItems);
  }

  /**
   * Registers or updates canonical items into the O(1) indices.
   * Enables seamless runtime extension with thousands of records without frontend bloat.
   */
  public registerItems(items: CanonicalItemRecord[]): void {
    for (const item of items) {
      if (!item.active) continue;

      this.itemMap.set(item.id, item);
      if (!this.allItems.some((existing) => existing.id === item.id)) {
        this.allItems.push(item);
      }

      // Index Canonical English Name
      const normCanonical = normalizeBaseText(item.canonical_name || item.canonicalName);
      if (normCanonical) {
        if (!this.exactMap.has(normCanonical)) this.exactMap.set(normCanonical, item);
        const phon = normalizePhonetic(normCanonical);
        if (!this.phoneticMap.has(phon)) this.phoneticMap.set(phon, item);
      }

      // Index Urdu Name
      const normUrdu = normalizeBaseText(item.urdu_name || item.nameUrdu);
      if (normUrdu) {
        if (!this.exactMap.has(normUrdu)) this.exactMap.set(normUrdu, item);
        if (!this.phoneticMap.has(normUrdu)) this.phoneticMap.set(normUrdu, item);
      }

      // Index Roman Urdu Names
      for (const roman of item.roman_urdu_names || [item.nameRomanUrdu]) {
        const normRoman = normalizeBaseText(roman);
        if (normRoman) {
          if (!this.exactMap.has(normRoman)) this.exactMap.set(normRoman, item);
          const phon = normalizePhonetic(normRoman);
          if (!this.phoneticMap.has(phon)) this.phoneticMap.set(phon, item);
        }
      }

      // Index Aliases
      for (const alias of item.aliases || []) {
        const normAlias = normalizeBaseText(alias);
        if (normAlias) {
          if (!this.exactMap.has(normAlias)) this.exactMap.set(normAlias, item);
          const phon = normalizePhonetic(normAlias);
          if (!this.phoneticMap.has(phon)) this.phoneticMap.set(phon, item);
        }
      }

      // Index Common Spellings
      for (const spelling of item.common_spellings || []) {
        const normSpelling = normalizeBaseText(spelling);
        if (normSpelling) {
          if (!this.commonSpellingMap.has(normSpelling)) this.commonSpellingMap.set(normSpelling, item);
          const phon = normalizePhonetic(normSpelling);
          if (!this.phoneticMap.has(phon)) this.phoneticMap.set(phon, item);
        }
      }
    }
  }

  public getItem(id: string): CanonicalItemRecord | undefined {
    return this.itemMap.get(id);
  }

  public findById(id: string): CanonicalItemRecord | undefined {
    return this.itemMap.get(id);
  }

  public getAllItems(): CanonicalItemRecord[] {
    return this.allItems;
  }

  public findExact(term: string): CanonicalItemRecord | undefined {
    const norm = normalizeBaseText(term);
    return this.exactMap.get(norm);
  }

  public findPrefix(term: string): CanonicalItemRecord | undefined {
    const norm = normalizeBaseText(term);
    if (!norm || norm.length < 3) return undefined;
    // Check if any alias or canonical term starts with this prefix
    for (const [key, item] of this.exactMap.entries()) {
      if (key.startsWith(norm)) return item;
    }
    return undefined;
  }

  public findPhonetic(phoneticTerm: string): CanonicalItemRecord | undefined {
    return this.phoneticMap.get(phoneticTerm);
  }

  public findCommonSpelling(spelling: string): CanonicalItemRecord | undefined {
    const norm = normalizeBaseText(spelling);
    return this.commonSpellingMap.get(norm);
  }

  /**
   * Fast fuzzy similarity search with length gating and phonetic fallback
   */
  public findFuzzy(
    term: string,
    minScore: number = FUZZY_MIN_ACCEPTABLE_SCORE
  ): { item: CanonicalItemRecord; score: number } | null {
    const normTerm = normalizeBaseText(term);
    if (!normTerm) return null;
    const phoneticTerm = normalizePhonetic(normTerm);

    let bestItem: CanonicalItemRecord | null = null;
    let bestScore = 0;

    for (const item of this.allItems) {
      const candidates: string[] = [
        item.canonical_name,
        item.urdu_name,
        ...(item.roman_urdu_names || []),
        ...(item.aliases || []),
        ...(item.common_spellings || []),
      ];

      for (const candidate of candidates) {
        const normCand = normalizeBaseText(candidate);
        if (!normCand) continue;

        // Skip candidates with vast length difference unless one is a prefix
        const lenDiff = Math.abs(normCand.length - normTerm.length);
        if (lenDiff > 4 && !normCand.startsWith(normTerm) && !normTerm.startsWith(normCand)) {
          continue;
        }

        // 1. Literal normalized similarity
        const score = stringSimilarity(normTerm, normCand);
        if (score > bestScore) {
          bestScore = score;
          bestItem = item;
        }

        // 2. Phonetic normalized similarity
        if (phoneticTerm && phoneticTerm.length >= 3) {
          const phoneticCand = normalizePhonetic(normCand);
          if (phoneticCand) {
            const pScore = stringSimilarity(phoneticTerm, phoneticCand);
            if (pScore >= 0.85 && pScore > bestScore) {
              bestScore = pScore;
              bestItem = item;
            }
          }
        }
      }
    }

    if (bestItem && bestScore >= minScore) {
      return { item: bestItem, score: bestScore };
    }

    return null;
  }
}

// Global Singleton Catalog
export const defaultItemCatalog = new ItemCatalog();
