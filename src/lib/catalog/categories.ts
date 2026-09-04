import { CategoryId, CategoryRecord, SubcategoryRecord } from '../../types';

export const MASTER_CATEGORIES: CategoryRecord[] = [
  {
    id: 'vegetables',
    name_en: 'Vegetables',
    name_ur: 'سبزیاں',
    name_roman_urdu: 'Sabziyan',
    icon: 'eco',
    sort_order: 1,
    active: true,
  },
  {
    id: 'fruits',
    name_en: 'Fruits',
    name_ur: 'پھل',
    name_roman_urdu: 'Phal',
    icon: 'nutrition',
    sort_order: 2,
    active: true,
  },
  {
    id: 'grocery',
    name_en: 'Grocery & Staples',
    name_ur: 'راشن اور گروسری',
    name_roman_urdu: 'Rashan & Grocery',
    icon: 'inventory_2',
    sort_order: 3,
    active: true,
  },
  {
    id: 'spices',
    name_en: 'Spices & Seasoning',
    name_ur: 'مصالحہ جات',
    name_roman_urdu: 'Masalay',
    icon: 'local_fire_department',
    sort_order: 4,
    active: true,
  },
  {
    id: 'herbal',
    name_en: 'Herbal & Traditional',
    name_ur: 'جڑی بوٹیاں اور پنسار',
    name_roman_urdu: 'Pansar & Jari Boti',
    icon: 'spa',
    sort_order: 5,
    active: true,
  },
  {
    id: 'dairy',
    name_en: 'Dairy & Milk',
    name_ur: 'دودھ اور ڈیری',
    name_roman_urdu: 'Doodh & Dairy',
    icon: 'water_drop',
    sort_order: 6,
    active: true,
  },
  {
    id: 'bakery',
    name_en: 'Bakery & Bread',
    name_ur: 'بیکری اور روٹی',
    name_roman_urdu: 'Bakery & Roti',
    icon: 'bakery_dining',
    sort_order: 7,
    active: true,
  },
  {
    id: 'meat',
    name_en: 'Meat & Poultry',
    name_ur: 'گوشت اور چکن',
    name_roman_urdu: 'Gosht & Chicken',
    icon: 'set_meal',
    sort_order: 8,
    active: true,
  },
  {
    id: 'seafood',
    name_en: 'Seafood & Fish',
    name_ur: 'مچھلی اور سی فوڈ',
    name_roman_urdu: 'Machli & Seafood',
    icon: 'phishing',
    sort_order: 9,
    active: true,
  },
  {
    id: 'eggs',
    name_en: 'Eggs',
    name_ur: 'انڈے',
    name_roman_urdu: 'Anday',
    icon: 'egg',
    sort_order: 10,
    active: true,
  },
  {
    id: 'beverages',
    name_en: 'Beverages & Drinks',
    name_ur: 'مشروبات اور چائے',
    name_roman_urdu: 'Chai & Mashroobat',
    icon: 'local_cafe',
    sort_order: 11,
    active: true,
  },
  {
    id: 'personal_care',
    name_en: 'Personal Care',
    name_ur: 'ذاتی دیکھ بھال',
    name_roman_urdu: 'Zati Dekhbhal',
    icon: 'soap',
    sort_order: 12,
    active: true,
  },
  {
    id: 'household',
    name_en: 'Household & Kitchen',
    name_ur: 'گھریلو اشیاء',
    name_roman_urdu: 'Gharelu Ashiya',
    icon: 'home',
    sort_order: 13,
    active: true,
  },
  {
    id: 'cleaning',
    name_en: 'Cleaning & Laundry',
    name_ur: 'صفائی اور لانڈری',
    name_roman_urdu: 'Safai & Laundry',
    icon: 'cleaning_services',
    sort_order: 14,
    active: true,
  },
  {
    id: 'health',
    name_en: 'Health & Pharmacy',
    name_ur: 'صحت اور ادویات',
    name_roman_urdu: 'Sehat & Dawaiyan',
    icon: 'medication',
    sort_order: 15,
    active: true,
  },
  {
    id: 'baby_care',
    name_en: 'Baby Care',
    name_ur: 'بچوں کی دیکھ بھال',
    name_roman_urdu: 'Bachon ki Dekhbhal',
    icon: 'child_care',
    sort_order: 16,
    active: true,
  },
  {
    id: 'pet_supplies',
    name_en: 'Pet Supplies',
    name_ur: 'پالتو جانوروں کا سامان',
    name_roman_urdu: 'Paltu Janwaron ka Saman',
    icon: 'pets',
    sort_order: 17,
    active: true,
  },
  {
    id: 'home',
    name_en: 'Home & Living',
    name_ur: 'گھر اور سجاوٹ',
    name_roman_urdu: 'Ghar & Living',
    icon: 'home',
    sort_order: 18,
    active: true,
  },
  {
    id: 'hardware',
    name_en: 'Hardware & Maintenance',
    name_ur: 'ہارڈویئر اور اوزار',
    name_roman_urdu: 'Hardware & Auzaar',
    icon: 'build',
    sort_order: 19,
    active: true,
  },
  {
    id: 'stationery',
    name_en: 'Stationery & Office',
    name_ur: 'اسٹیشنری اور کتب',
    name_roman_urdu: 'Stationery & Office',
    icon: 'edit_note',
    sort_order: 20,
    active: true,
  },
  {
    id: 'clothing',
    name_en: 'Clothing & Fabric',
    name_ur: 'کپڑے اور ملبوسات',
    name_roman_urdu: 'Kapray & Libas',
    icon: 'checkroom',
    sort_order: 21,
    active: true,
  },
  {
    id: 'snacks',
    name_en: 'Snacks & Confectionery',
    name_ur: 'اسنیکس اور نمکو',
    name_roman_urdu: 'Snacks & Nimco',
    icon: 'cookie',
    sort_order: 22,
    active: true,
  },
  {
    id: 'frozen',
    name_en: 'Frozen Foods',
    name_ur: 'منجمد خوراک',
    name_roman_urdu: 'Frozen Food',
    icon: 'ac_unit',
    sort_order: 23,
    active: true,
  },
  {
    id: 'canned_food',
    name_en: 'Canned Food',
    name_ur: 'ڈبہ بند خوراک',
    name_roman_urdu: 'Canned Khana',
    icon: 'inventory_2',
    sort_order: 24,
    active: true,
  },
  {
    id: 'sauces_condiments',
    name_en: 'Sauces & Condiments',
    name_ur: 'سوس اور چٹنیاں',
    name_roman_urdu: 'Sauces & Chutneys',
    icon: 'liquor',
    sort_order: 25,
    active: true,
  },
  {
    id: 'grains',
    name_en: 'Grains & Flours',
    name_ur: 'اناج اور آٹا',
    name_roman_urdu: 'Anaaj & Atta',
    icon: 'grain',
    sort_order: 26,
    active: true,
  },
  {
    id: 'pulses',
    name_en: 'Pulses & Lentils',
    name_ur: 'دالیں اور چنے',
    name_roman_urdu: 'Daalain & Chanay',
    icon: 'grain',
    sort_order: 27,
    active: true,
  },
  {
    id: 'herbs',
    name_en: 'Fresh Herbs',
    name_ur: 'تازہ جڑی بوٹیاں اور ہرا دھنیا',
    name_roman_urdu: 'Taza Jari Boti & Herbs',
    icon: 'spa',
    sort_order: 28,
    active: true,
  },
  {
    id: 'poultry',
    name_en: 'Poultry & Eggs',
    name_ur: 'مرغی اور انڈے',
    name_roman_urdu: 'Poultry & Anday',
    icon: 'egg',
    sort_order: 29,
    active: true,
  },
  {
    id: 'cooking_essentials',
    name_en: 'Cooking Essentials',
    name_ur: 'کھانا پکانے کی ضروریات',
    name_roman_urdu: 'Cooking Essentials',
    icon: 'inventory_2',
    sort_order: 30,
    active: true,
  },
  {
    id: 'rice',
    name_en: 'Rice Varieties',
    name_ur: 'چاول اور اقسام',
    name_roman_urdu: 'Chawal Varieties',
    icon: 'grain',
    sort_order: 31,
    active: true,
  },
  {
    id: 'kitchen',
    name_en: 'Kitchen Items',
    name_ur: 'باورچی خانہ کا سامان',
    name_roman_urdu: 'Kitchen ka Samaan',
    icon: 'home',
    sort_order: 32,
    active: true,
  },
  {
    id: 'uncategorized',
    name_en: 'Uncategorized',
    name_ur: 'غیر زمرہ بند',
    name_roman_urdu: 'Baghair Category',
    icon: 'category',
    sort_order: 33,
    active: true,
  },
  {
    id: 'other',
    name_en: 'Other Items',
    name_ur: 'دیگر اشیاء',
    name_roman_urdu: 'Dusri Cheezein',
    icon: 'category',
    sort_order: 34,
    active: true,
  },
];

export const MASTER_SUBCATEGORIES: SubcategoryRecord[] = [
  // VEGETABLES
  { id: 'veg_roots', category_id: 'vegetables', name_en: 'Root Vegetables', name_ur: 'جڑ والی سبزیاں', name_roman_urdu: 'Jarr Wali Sabziyan', sort_order: 1, active: true },
  { id: 'veg_leafy', category_id: 'vegetables', name_en: 'Leafy Greens & Herbs', name_ur: 'پتے دار سبزیاں اور دھنیا پودینہ', name_roman_urdu: 'Pattay Wali Sabziyan', sort_order: 2, active: true },
  { id: 'veg_gourds', category_id: 'vegetables', name_en: 'Gourds & Squashes', name_ur: 'کدو اور تورئی وغیرہ', name_roman_urdu: 'Kaddoo & Torai', sort_order: 3, active: true },
  { id: 'veg_nightshades', category_id: 'vegetables', name_en: 'Nightshades & Peppers', name_ur: 'ٹماٹر، مرچ اور بینگن', name_roman_urdu: 'Tamatar & Mirchein', sort_order: 4, active: true },
  { id: 'veg_cruciferous', category_id: 'vegetables', name_en: 'Cruciferous Vegetables', name_ur: 'گوبھی اور بروکولی', name_roman_urdu: 'Gobhi & Band Gobhi', sort_order: 5, active: true },
  { id: 'veg_pods', category_id: 'vegetables', name_en: 'Pods & Legumes', name_ur: 'مٹر اور پھلیاں', name_roman_urdu: 'Matar & Phaliyan', sort_order: 6, active: true },

  // FRUITS
  { id: 'fruit_tropical', category_id: 'fruits', name_en: 'Tropical & Bananas', name_ur: 'آم، کیلے اور گرم علاقوں کے پھل', name_roman_urdu: 'Aam & Keelay', sort_order: 1, active: true },
  { id: 'fruit_citrus', category_id: 'fruits', name_en: 'Citrus & Lemons', name_ur: 'مالٹا، کینو اور لیموں', name_roman_urdu: 'Kinnow & Leemu', sort_order: 2, active: true },
  { id: 'fruit_pome', category_id: 'fruits', name_en: 'Apples & Pears', name_ur: 'سیب اور ناشپاتی', name_roman_urdu: 'Saib & Nashpati', sort_order: 3, active: true },
  { id: 'fruit_melons', category_id: 'fruits', name_en: 'Melons & Watermelons', name_ur: 'تربوز اور خربوزہ', name_roman_urdu: 'Tarbooz & Kharbooza', sort_order: 4, active: true },
  { id: 'fruit_berries', category_id: 'fruits', name_en: 'Grapes & Berries', name_ur: 'انگور اور انار وغیرہ', name_roman_urdu: 'Angoor & Anaar', sort_order: 5, active: true },

  // GROCERY
  { id: 'groc_flours', category_id: 'grocery', name_en: 'Flours & Grains', name_ur: 'آٹا، میدہ اور سوجی', name_roman_urdu: 'Atta & Maida', sort_order: 1, active: true },
  { id: 'groc_rice', category_id: 'grocery', name_en: 'Rice Varieties', name_ur: 'چاول (باسمتی اور سیلا)', name_roman_urdu: 'Chawal', sort_order: 2, active: true },
  { id: 'groc_pulses', category_id: 'grocery', name_en: 'Pulses & Lentils (Daalain)', name_ur: 'دالیں اور چنے', name_roman_urdu: 'Daalain & Chanay', sort_order: 3, active: true },
  { id: 'groc_oil_ghee', category_id: 'grocery', name_en: 'Cooking Oil & Ghee', name_ur: 'کوکنگ آئل اور گھی', name_roman_urdu: 'Oil & Ghee', sort_order: 4, active: true },
  { id: 'groc_sugar_sweeteners', category_id: 'grocery', name_en: 'Sugar & Sweeteners', name_ur: 'چینی، شکر اور گڑ', name_roman_urdu: 'Cheeni & Gur', sort_order: 5, active: true },
  { id: 'groc_salts', category_id: 'grocery', name_en: 'Salts', name_ur: 'نمک اور کالا نمک', name_roman_urdu: 'Namak', sort_order: 6, active: true },

  // SPICES
  { id: 'spice_ground', category_id: 'spices', name_en: 'Ground Spices', name_ur: 'پسی ہوئی مصالحہ جات', name_roman_urdu: 'Pisay Masalay', sort_order: 1, active: true },
  { id: 'spice_whole', category_id: 'spices', name_en: 'Whole Spices (Sabut Masala)', name_ur: 'ثابت گرم مصالحہ اور بیج', name_roman_urdu: 'Sabut Masalay', sort_order: 2, active: true },
  { id: 'spice_blends', category_id: 'spices', name_en: 'Recipe Masala Blends', name_ur: 'بریانی اور قورمہ مصالحہ', name_roman_urdu: 'Mix Masalay', sort_order: 3, active: true },

  // HERBAL
  { id: 'herbal_pansar', category_id: 'herbal', name_en: 'Traditional Herbs & Extracts', name_ur: 'پنسار اشیاء (فٹکری، اسپغول وغیرہ)', name_roman_urdu: 'Pansar & Hikmat', sort_order: 1, active: true },
  { id: 'herbal_seeds', category_id: 'herbal', name_en: 'Herbal Seeds & Gums', name_ur: 'تخم ملنگا، گوند کتیرا اور بیج', name_roman_urdu: 'Tukh Malanga & Gond', sort_order: 2, active: true },

  // DAIRY
  { id: 'dairy_milk', category_id: 'dairy', name_en: 'Milk & Cream', name_ur: 'دودھ، ٹیٹرا پیک اور ملائی', name_roman_urdu: 'Doodh & Malai', sort_order: 1, active: true },
  { id: 'dairy_yogurt_butter', category_id: 'dairy', name_en: 'Yogurt, Butter & Cheese', name_ur: 'دہی، مکھن اور پنیر', name_roman_urdu: 'Dahi, Makhan & Cheese', sort_order: 2, active: true },

  // BAKERY
  { id: 'bakery_breads', category_id: 'bakery', name_en: 'Bread & Buns', name_ur: 'ڈبل روٹی اور برگر بن', name_roman_urdu: 'Double Roti & Bun', sort_order: 1, active: true },
  { id: 'bakery_rusks', category_id: 'bakery', name_en: 'Rusks & Biscuits', name_ur: 'رس، بسکٹ اور نان خطائی', name_roman_urdu: 'Rusk & Biscuits', sort_order: 2, active: true },

  // MEAT
  { id: 'meat_poultry', category_id: 'meat', name_en: 'Chicken & Poultry', name_ur: 'چکن اور مرغی کا گوشت', name_roman_urdu: 'Chicken', sort_order: 1, active: true },
  { id: 'meat_mutton', category_id: 'meat', name_en: 'Mutton & Lamb', name_ur: 'بکرے کا گوشت اور دنبہ', name_roman_urdu: 'Mutton & Bakra', sort_order: 2, active: true },
  { id: 'meat_beef', category_id: 'meat', name_en: 'Beef & Veal', name_ur: 'گائے اور بچھڑے کا گوشت', name_roman_urdu: 'Beef & Gaye ka Gosht', sort_order: 3, active: true },

  // SEAFOOD
  { id: 'seafood_fish', category_id: 'seafood', name_en: 'Fresh & Sea Fish', name_ur: 'روہو، سرمئی اور مچھلی', name_roman_urdu: 'Machli', sort_order: 1, active: true },
  { id: 'seafood_shellfish', category_id: 'seafood', name_en: 'Prawns & Shrimps', name_ur: 'جھینگا اور پرانز', name_roman_urdu: 'Jheenga', sort_order: 2, active: true },

  // EGGS
  { id: 'eggs_farm', category_id: 'eggs', name_en: 'Farm & Organic Eggs', name_ur: 'فارمی اور دیسی انڈے', name_roman_urdu: 'Farmi & Desi Anday', sort_order: 1, active: true },

  // BEVERAGES
  { id: 'bev_tea_coffee', category_id: 'beverages', name_en: 'Tea & Coffee', name_ur: 'چائے کی پتی اور کافی', name_roman_urdu: 'Chai Patti & Coffee', sort_order: 1, active: true },
  { id: 'bev_syrups', category_id: 'beverages', name_en: 'Sharbat & Juices', name_ur: 'روح افزا، شربت اور جوس', name_roman_urdu: 'Sharbat & Juice', sort_order: 2, active: true },
  { id: 'bev_water_soda', category_id: 'beverages', name_en: 'Water & Soft Drinks', name_ur: 'منرل واٹر اور کولڈ ڈرنکس', name_roman_urdu: 'Paani & Cold Drinks', sort_order: 3, active: true },

  // PERSONAL CARE
  { id: 'pc_bath', category_id: 'personal_care', name_en: 'Soaps & Body Wash', name_ur: 'صابن اور باڈی واش', name_roman_urdu: 'Sabun & Body Wash', sort_order: 1, active: true },
  { id: 'pc_hair', category_id: 'personal_care', name_en: 'Hair Care & Oils', name_ur: 'شیمپو اور تیل', name_roman_urdu: 'Shampoo & Tail', sort_order: 2, active: true },
  { id: 'pc_dental', category_id: 'personal_care', name_en: 'Dental & Shaving', name_ur: 'ٹوتھ پیسٹ اور شیونگ', name_roman_urdu: 'Toothpaste & Shaving', sort_order: 3, active: true },

  // HOUSEHOLD
  { id: 'hh_paper', category_id: 'household', name_en: 'Kitchen Paper & Foils', name_ur: 'ٹشو رول اور ایلومینیم فوائل', name_roman_urdu: 'Tissue & Foil', sort_order: 1, active: true },
  { id: 'hh_bags_utility', category_id: 'household', name_en: 'Bags, Matches & Utility', name_ur: 'کچرے کے شاپر اور ماچس', name_roman_urdu: 'Trash Bags & Machis', sort_order: 2, active: true },

  // CLEANING
  { id: 'clean_dish', category_id: 'cleaning', name_en: 'Dishwashing', name_ur: 'برتن دھونے کا صابن اور اسفنج', name_roman_urdu: 'Bartan Dhonay ka Sabun', sort_order: 1, active: true },
  { id: 'clean_laundry', category_id: 'cleaning', name_en: 'Laundry Detergents', name_ur: 'سرف اور واشنگ پاؤڈر', name_roman_urdu: 'Surf & Washing Powder', sort_order: 2, active: true },
  { id: 'clean_floor', category_id: 'cleaning', name_en: 'Floor & Toilet Cleaners', name_ur: 'فنائل، ہارپک اور جھاڑو', name_roman_urdu: 'Phenyl, Harpic & Jharoo', sort_order: 3, active: true },

  // HEALTH
  { id: 'health_firstaid', category_id: 'health', name_en: 'First Aid & Common OTC', name_ur: 'سنی پلاس، ڈیٹول اور پیناڈول', name_roman_urdu: 'Saniplast, Dettol & Panadol', sort_order: 1, active: true },

  // BABY CARE
  { id: 'baby_diapers', category_id: 'baby_care', name_en: 'Diapers & Wipes', name_ur: 'ڈائپرز اور گیلے ٹشو', name_roman_urdu: 'Diapers & Wipes', sort_order: 1, active: true },
  { id: 'baby_nutrition', category_id: 'baby_care', name_en: 'Baby Food & Care', name_ur: 'سیریلاک اور بے بی آئل', name_roman_urdu: 'Cerelac & Baby Oil', sort_order: 2, active: true },

  // PET SUPPLIES
  { id: 'pet_food', category_id: 'pet_supplies', name_en: 'Pet Food & Feed', name_ur: 'بلی اور پرندوں کی خوراک', name_roman_urdu: 'Billi aur Parindon ki Khorak', sort_order: 1, active: true },

  // HOME
  { id: 'home_linen', category_id: 'home', name_en: 'Linen & Mats', name_ur: 'بیڈ شیٹ اور تولیہ', name_roman_urdu: 'Bedsheet & Towel', sort_order: 1, active: true },

  // HARDWARE
  { id: 'hw_materials', category_id: 'hardware', name_en: 'Building & Whitewash', name_ur: 'چونا، سیمنٹ اور ایلفی', name_roman_urdu: 'Choona, Cement & Elfy', sort_order: 1, active: true },
  { id: 'hw_electrical', category_id: 'hardware', name_en: 'Electrical & Bulbs', name_ur: 'ایل ای ڈی بلب اور بیٹریاں', name_roman_urdu: 'LED Bulb & Cells', sort_order: 2, active: true },

  // STATIONERY
  { id: 'stat_notebooks', category_id: 'stationery', name_en: 'Paper & Registers', name_ur: 'رجسٹر اور کاپیاں', name_roman_urdu: 'Register & Copiyan', sort_order: 1, active: true },
  { id: 'stat_writing', category_id: 'stationery', name_en: 'Pens & Adhesives', name_ur: 'پین، پنسل اور ٹیپ', name_roman_urdu: 'Pen, Pencil & Tape', sort_order: 2, active: true },

  // CLOTHING
  { id: 'cloth_basic', category_id: 'clothing', name_en: 'Basics & Hosiery', name_ur: 'جرابیں اور بنیان', name_roman_urdu: 'Jurabein & Banyan', sort_order: 1, active: true },

  // OTHER
  { id: 'other_general', category_id: 'other', name_en: 'General Miscellaneous', name_ur: 'متفرق اشیاء', name_roman_urdu: 'Mutafarriq Saman', sort_order: 1, active: true },
];

export const CATEGORY_LOOKUP = new Map<CategoryId, CategoryRecord>(
  MASTER_CATEGORIES.map((c) => [c.id, c])
);

export const SUBCATEGORY_LOOKUP = new Map<string, SubcategoryRecord>(
  MASTER_SUBCATEGORIES.map((s) => [s.id, s])
);
