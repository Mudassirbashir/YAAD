import { CategoryId, CategorizeResult, CATEGORIES_LIST } from '../types';

const OVERRIDES_STORAGE_KEY = 'yaad_user_category_overrides';

// Normalize text for matching (strip diacritics, lowercase, remove quantity prefixes)
export function normalizeItemText(input: string): string {
  if (!input) return '';

  let text = input.trim().toLowerCase();

  // Remove Urdu/Arabic diacritics
  text = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

  // Normalize common Urdu character variations (like alef madd, teh marbuta, etc.)
  text = text
    .replace(/[آا]/g, 'ا')
    .replace(/[يیئ]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .replace(/[هہھ]/g, 'ہ');

  // Remove common leading numbers/quantities like "1kg ", "2x ", "500g ", "1 packet "
  text = text.replace(/^(\d+\.?\d*|\d+\/\d+)\s*(kg|kilo|g|gram|gms|ml|l|ltr|liter|litre|dozen|darjan|pkt|packet|pack|bunch|pcs|pieces|x)?\s*/i, '');

  // Strip excessive punctuation and collapse whitespace
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'۔،]/g, ' ').replace(/\s+/g, ' ').trim();

  return text;
}

// Extensive dictionary for English, Roman Urdu, and Urdu Script
const DICTIONARY: Record<string, CategoryId> = {
  // VEGETABLES (سبزیاں)
  'potato': 'vegetables',
  'potatoes': 'vegetables',
  'aloo': 'vegetables',
  'aaloo': 'vegetables',
  'alo': 'vegetables',
  'allu': 'vegetables',
  'aalu': 'vegetables',
  'الو': 'vegetables',
  'آلو': 'vegetables',

  'onion': 'vegetables',
  'onions': 'vegetables',
  'pyaaz': 'vegetables',
  'pyaz': 'vegetables',
  'piyaz': 'vegetables',
  'payaz': 'vegetables',
  'پیاز': 'vegetables',

  'tomato': 'vegetables',
  'tomatoes': 'vegetables',
  'tamatar': 'vegetables',
  'tamaatar': 'vegetables',
  'ٹماٹر': 'vegetables',

  'garlic': 'vegetables',
  'lehsan': 'vegetables',
  'lehsun': 'vegetables',
  'lahsan': 'vegetables',
  'لہسن': 'vegetables',

  'ginger': 'vegetables',
  'adrak': 'vegetables',
  'adrik': 'vegetables',
  'ادرک': 'vegetables',

  'spinach': 'vegetables',
  'palak': 'vegetables',
  'paalak': 'vegetables',
  'پالک': 'vegetables',

  'coriander': 'vegetables',
  'cilantro': 'vegetables',
  'dhaniya': 'vegetables',
  'dhania': 'vegetables',
  'ہرا دھنیا': 'vegetables',
  'دھنیا': 'vegetables',

  'mint': 'vegetables',
  'podina': 'vegetables',
  'pudina': 'vegetables',
  'پودینہ': 'vegetables',

  'chilli': 'vegetables',
  'chilies': 'vegetables',
  'chili': 'vegetables',
  'green chilli': 'vegetables',
  'hari mirch': 'vegetables',
  'mirch': 'vegetables',
  'مرچ': 'vegetables',
  'ہری مرچ': 'vegetables',

  'cucumber': 'vegetables',
  'kheera': 'vegetables',
  'khira': 'vegetables',
  'کھیرا': 'vegetables',

  'lemon': 'vegetables',
  'lime': 'vegetables',
  'leemo': 'vegetables',
  'limu': 'vegetables',
  'nimbu': 'vegetables',
  'لیموں': 'vegetables',

  'carrot': 'vegetables',
  'carrots': 'vegetables',
  'gajar': 'vegetables',
  'gaajar': 'vegetables',
  'گاجر': 'vegetables',

  'cabbage': 'vegetables',
  'band gobi': 'vegetables',
  'patta gobi': 'vegetables',
  'بند گوبھی': 'vegetables',

  'cauliflower': 'vegetables',
  'phool gobi': 'vegetables',
  'gobi': 'vegetables',
  'پھول گوبھی': 'vegetables',
  'گوبھی': 'vegetables',

  'peas': 'vegetables',
  'matar': 'vegetables',
  'mutter': 'vegetables',
  'مٹر': 'vegetables',

  'capsicum': 'vegetables',
  'shimla mirch': 'vegetables',
  'bell pepper': 'vegetables',
  'شملہ مرچ': 'vegetables',

  'brinjal': 'vegetables',
  'eggplant': 'vegetables',
  'baingan': 'vegetables',
  'بینگن': 'vegetables',

  'okra': 'vegetables',
  'lady finger': 'vegetables',
  'bhindi': 'vegetables',
  'بھنڈی': 'vegetables',

  'pumpkin': 'vegetables',
  'kaddu': 'vegetables',
  'kaddoo': 'vegetables',
  'halwa kaddu': 'vegetables',
  'کدو': 'vegetables',

  'bitter gourd': 'vegetables',
  'karela': 'vegetables',
  'کریلا': 'vegetables',

  'turnip': 'vegetables',
  'shalgham': 'vegetables',
  'shalgam': 'vegetables',
  'شلجم': 'vegetables',

  'radish': 'vegetables',
  'mooli': 'vegetables',
  'مولی': 'vegetables',

  // FRUITS (پھل)
  'apple': 'fruits',
  'apples': 'fruits',
  'saib': 'fruits',
  'seb': 'fruits',
  'سیب': 'fruits',

  'banana': 'fruits',
  'bananas': 'fruits',
  'kela': 'fruits',
  'kelay': 'fruits',
  'kele': 'fruits',
  'کیلا': 'fruits',
  'کیلے': 'fruits',

  'orange': 'fruits',
  'oranges': 'fruits',
  'malta': 'fruits',
  'kinnow': 'fruits',
  'kino': 'fruits',
  'santra': 'fruits',
  'مالٹا': 'fruits',
  'کینو': 'fruits',

  'mango': 'fruits',
  'mangoes': 'fruits',
  'aam': 'fruits',
  'آم': 'fruits',

  'grapes': 'fruits',
  'angoor': 'fruits',
  'انگور': 'fruits',

  'watermelon': 'fruits',
  'tarbooz': 'fruits',
  'تربوز': 'fruits',

  'melon': 'fruits',
  'kharbooza': 'fruits',
  'kharbuza': 'fruits',
  'خربوزہ': 'fruits',

  'guava': 'fruits',
  'amrood': 'fruits',
  'amrud': 'fruits',
  'امرود': 'fruits',

  'peach': 'fruits',
  'aadoo': 'fruits',
  'aaru': 'fruits',
  'آڑو': 'fruits',

  'pomegranate': 'fruits',
  'anaar': 'fruits',
  'anar': 'fruits',
  'انار': 'fruits',

  'papaya': 'fruits',
  'papeeta': 'fruits',
  'پپیتا': 'fruits',

  'strawberries': 'fruits',
  'strawberry': 'fruits',
  'سٹرابیری': 'fruits',

  // DAIRY & EGGS (دودھ اور انڈے)
  'milk': 'dairy',
  'doodh': 'dairy',
  'dodh': 'dairy',
  'دودھ': 'dairy',
  'olpers': 'dairy',
  'milkpak': 'dairy',
  'fresh milk': 'dairy',

  'egg': 'dairy',
  'eggs': 'dairy',
  'anday': 'dairy',
  'ande': 'dairy',
  'anday/ande': 'dairy',
  'anda': 'dairy',
  'انڈے': 'dairy',
  'انڈا': 'dairy',

  'yogurt': 'dairy',
  'curd': 'dairy',
  'dahi': 'dairy',
  'دہی': 'dairy',

  'butter': 'dairy',
  'makhan': 'dairy',
  'makkhan': 'dairy',
  'مکھن': 'dairy',

  'cheese': 'dairy',
  'paneer': 'dairy',
  'پنیر': 'dairy',
  'چیز': 'dairy',

  'cream': 'dairy',
  'malai': 'dairy',
  'balai': 'dairy',
  'بالائی': 'dairy',
  'ملائی': 'dairy',
  'کریم': 'dairy',

  'condensed milk': 'dairy',

  // GRAINS & STAPLES (اناج اور راشن / گروسری)
  'flour': 'grains_staples',
  'atta': 'grains_staples',
  'aata': 'grains_staples',
  'aatta': 'grains_staples',
  'chakki atta': 'grains_staples',
  'maida': 'grains_staples',
  'fine atta': 'grains_staples',
  'آٹا': 'grains_staples',
  'میدہ': 'grains_staples',

  'rice': 'grains_staples',
  'chawal': 'grains_staples',
  'chaawal': 'grains_staples',
  'basmati': 'grains_staples',
  'چاول': 'grains_staples',

  'sugar': 'grains_staples',
  'cheeni': 'grains_staples',
  'chini': 'grains_staples',
  'شکر': 'grains_staples',
  'چینی': 'grains_staples',
  'gurr': 'grains_staples',
  'gur': 'grains_staples',
  'گڑ': 'grains_staples',

  'oil': 'grains_staples',
  'cooking oil': 'grains_staples',
  'tail': 'grains_staples',
  'tel': 'grains_staples',
  'sarson ka tail': 'grains_staples',
  'تیل': 'grains_staples',
  'کوکنگ آئل': 'grains_staples',

  'ghee': 'grains_staples',
  'desi ghee': 'grains_staples',
  'banaspati': 'grains_staples',
  'گھی': 'grains_staples',
  'دیسی گھی': 'grains_staples',

  'lentils': 'grains_staples',
  'daal': 'grains_staples',
  'dal': 'grains_staples',
  'daal chana': 'grains_staples',
  'daal masoor': 'grains_staples',
  'daal moong': 'grains_staples',
  'daal mash': 'grains_staples',
  'دال': 'grains_staples',
  'دال چنا': 'grains_staples',
  'دال مسور': 'grains_staples',

  'chickpeas': 'grains_staples',
  'cholay': 'grains_staples',
  'chanay': 'grains_staples',
  'safaid chanay': 'grains_staples',
  'کالے چنے': 'grains_staples',
  'سفید چنے': 'grains_staples',
  'چنے': 'grains_staples',

  'salt': 'grains_staples',
  'namak': 'grains_staples',
  'نمک': 'grains_staples',

  'spices': 'grains_staples',
  'masala': 'grains_staples',
  'masalay': 'grains_staples',
  'lal mirch': 'grains_staples',
  'haldi': 'grains_staples',
  'zeera': 'grains_staples',
  'garam masala': 'grains_staples',
  'chaat masala': 'grains_staples',
  'biryani masala': 'grains_staples',
  'shan masala': 'grains_staples',
  'national masala': 'grains_staples',
  'ہلدی': 'grains_staples',
  'لال مرچ': 'grains_staples',
  'زیرہ': 'grains_staples',
  'گرم مصالحہ': 'grains_staples',
  'مصالحہ': 'grains_staples',

  'pasta': 'grains_staples',
  'macaroni': 'grains_staples',
  'spaghetti': 'grains_staples',
  'noodles': 'grains_staples',
  'sewaiyan': 'grains_staples',
  'سیویاں': 'grains_staples',
  'نوڈلز': 'grains_staples',

  'cereal': 'grains_staples',
  'oats': 'grains_staples',
  'corn flakes': 'grains_staples',
  'daliya': 'grains_staples',
  'دلیہ': 'grains_staples',

  // MEAT & SEAFOOD (گوشت اور مچھلی)
  'chicken': 'meat',
  'murghi': 'meat',
  'murgi': 'meat',
  'چکن': 'meat',
  'مرغی': 'meat',

  'beef': 'meat',
  'bada gosht': 'meat',
  'bara gosht': 'meat',
  'گائے کا گوشت': 'meat',
  'بڑا گوشت': 'meat',

  'mutton': 'meat',
  'bakra': 'meat',
  'chota gosht': 'meat',
  'lamb': 'meat',
  'بکرے کا گوشت': 'meat',
  'چھوٹا گوشت': 'meat',

  'meat': 'meat',
  'gosht': 'meat',
  'گوشت': 'meat',
  'keema': 'meat',
  'qeema': 'meat',
  'قیمہ': 'meat',

  'fish': 'meat',
  'machli': 'meat',
  'machhli': 'meat',
  'seafood': 'meat',
  'prawns': 'meat',
  'jheenga': 'meat',
  'مچھلی': 'meat',
  'جھینگا': 'meat',

  // BAKERY (بیکری)
  'bread': 'bakery',
  'double roti': 'bakery',
  'double-roti': 'bakery',
  'roti': 'bakery',
  'bread slice': 'bakery',
  'ڈبل روٹی': 'bakery',
  'بریڈ': 'bakery',

  'buns': 'bakery',
  'bun': 'bakery',
  'burger bun': 'bakery',
  'بن': 'bakery',

  'rusk': 'bakery',
  'paapay': 'bakery',
  'papey': 'bakery',
  'رسک': 'bakery',
  'پاپے': 'bakery',

  'cake': 'bakery',
  'cupcake': 'bakery',
  'pastry': 'bakery',
  'کیک': 'bakery',
  'پیسٹری': 'bakery',

  'naan': 'bakery',
  'sheermal': 'bakery',
  'taftan': 'bakery',
  'paratha': 'bakery',
  'نان': 'bakery',
  'شیرمال': 'bakery',
  'پراٹھا': 'bakery',

  'bakery biscuits': 'bakery',
  'croissant': 'bakery',

  // BEVERAGES (مشروبات اور چائے)
  'tea': 'beverages',
  'chai': 'beverages',
  'patti': 'beverages',
  'tea bags': 'beverages',
  'tapal': 'beverages',
  'lipton': 'beverages',
  'chaye': 'beverages',
  'چائے': 'beverages',
  'چائے کی پتی': 'beverages',
  'پتی': 'beverages',

  'coffee': 'beverages',
  'nescafe': 'beverages',
  'کافی': 'beverages',

  'juice': 'beverages',
  'juices': 'beverages',
  'apple juice': 'beverages',
  'orange juice': 'beverages',
  'nestle juice': 'beverages',
  'جوس': 'beverages',

  'water': 'beverages',
  'mineral water': 'beverages',
  'pepsi': 'beverages',
  'coke': 'beverages',
  'coca cola': 'beverages',
  'sprite': 'beverages',
  '7up': 'beverages',
  'cold drink': 'beverages',
  'soda': 'beverages',
  'sharbat': 'beverages',
  'rooh afza': 'beverages',
  'jam-e-shirin': 'beverages',
  'جام شیریں': 'beverages',
  'روح افزا': 'beverages',
  'کولڈ ڈرنک': 'beverages',
  'پانی': 'beverages',

  // SNACKS (سنیکس اور بسکٹ)
  'biscuits': 'snacks',
  'biscuit': 'snacks',
  'cookies': 'snacks',
  'sooper': 'snacks',
  'oreo': 'snacks',
  'prince': 'snacks',
  'بسکٹ': 'snacks',

  'chips': 'snacks',
  'lays': 'snacks',
  'kurkure': 'snacks',
  'nimko': 'snacks',
  'dal moth': 'snacks',
  'چپس': 'snacks',
  'نمکو': 'snacks',

  'chocolate': 'snacks',
  'candies': 'snacks',
  'candy': 'snacks',
  'toffees': 'snacks',
  'dairy milk': 'snacks',
  'چاکلیٹ': 'snacks',
  'ٹافیاں': 'snacks',

  'nuts': 'snacks',
  'dry fruit': 'snacks',
  'badam': 'snacks',
  'kaju': 'snacks',
  'pista': 'snacks',
  'akhrot': 'snacks',
  'moongphali': 'snacks',
  'بادام': 'snacks',
  'پستہ': 'snacks',
  'کاجو': 'snacks',
  'مونگ پھلی': 'snacks',

  // FROZEN (منجمد اشیاء)
  'frozen': 'frozen',
  'nuggets': 'frozen',
  'k&ns': 'frozen',
  'frozen paratha': 'frozen',
  'samosa': 'frozen',
  'roll': 'frozen',
  'seekh kabab': 'frozen',
  'kabab': 'frozen',
  'کباب': 'frozen',
  'سموسے': 'frozen',
  'نگٹس': 'frozen',
  'ice cream': 'frozen',
  'آئس کریم': 'frozen',

  // PERSONAL CARE & SOAPS (ذاتی نگہداشت اور صابن)
  'soap': 'personal_care',
  'soaps': 'personal_care',
  'sabun': 'personal_care',
  'sabon': 'personal_care',
  'safeguard': 'personal_care',
  'lux': 'personal_care',
  'dettol': 'personal_care',
  'lifebuoy': 'personal_care',
  'صابن': 'personal_care',

  'shampoo': 'personal_care',
  'head and shoulders': 'personal_care',
  'sunsilk': 'personal_care',
  'pantene': 'personal_care',
  'conditioner': 'personal_care',
  'شیمپو': 'personal_care',

  'toothpaste': 'personal_care',
  'colgate': 'personal_care',
  'sensodyne': 'personal_care',
  'close up': 'personal_care',
  'toothbrush': 'personal_care',
  'ٹوتھ پیسٹ': 'personal_care',
  'ٹوتھ برش': 'personal_care',

  'face wash': 'personal_care',
  'body wash': 'personal_care',
  'lotion': 'personal_care',
  'cream (face)': 'personal_care',
  'vaseline': 'personal_care',
  'sunblock': 'personal_care',
  'facewash': 'personal_care',
  'لوشن': 'personal_care',
  'فیس واش': 'personal_care',

  'razor': 'personal_care',
  'shaving cream': 'personal_care',
  'gillette': 'personal_care',
  'شیونگ کریم': 'personal_care',

  'deodorant': 'personal_care',
  'perfume': 'personal_care',
  'body spray': 'personal_care',
  'عطر': 'personal_care',
  'پرفیوم': 'personal_care',

  // CLEANING & HOUSEHOLD (صفائی اور گھریلو اشیاء)
  'detergent': 'cleaning',
  'surf': 'cleaning',
  'washing powder': 'cleaning',
  'ariel': 'cleaning',
  'bonus': 'cleaning',
  'brite': 'cleaning',
  'سرف': 'cleaning',
  'واشنگ پاؤڈر': 'cleaning',

  'dishwash': 'cleaning',
  'dish soap': 'cleaning',
  'max': 'cleaning',
  'lemon max': 'cleaning',
  'vim': 'cleaning',
  'ڈش واش': 'cleaning',

  'harpic': 'cleaning',
  'toilet cleaner': 'cleaning',
  'bleach': 'cleaning',
  'robin': 'cleaning',
  'fenil': 'cleaning',
  'harpic/cleaner': 'cleaning',
  'ہارپک': 'cleaning',
  'فینائل': 'cleaning',

  'sponge': 'cleaning',
  'scrubber': 'cleaning',
  'broom': 'cleaning',
  'jharoo': 'cleaning',
  'mop': 'cleaning',
  'pocha': 'cleaning',
  'جھاڑو': 'cleaning',
  'پوچھا': 'cleaning',

  'tissue': 'household',
  'tissues': 'household',
  'toilet paper': 'household',
  'kitchen roll': 'household',
  'ٹشو': 'household',
  'ٹشو پیپر': 'household',

  'garbage bag': 'household',
  'trash bag': 'household',
  'shoppers': 'household',
  'lifafay': 'household',
  'تھلیاں': 'household',
  'شاپر': 'household',

  'matches': 'household',
  'matchbox': 'household',
  'machis': 'household',
  'ماچس': 'household',

  'foil': 'household',
  'aluminum foil': 'household',
  'plastic wrap': 'household',

  'bulb': 'household',
  'led bulb': 'household',
  'battery': 'household',
  'cell': 'household',
  'سیل': 'household',
  'بلب': 'household',

  // BABY CARE (بچوں کی دیکھ بھال)
  'diaper': 'baby_care',
  'diapers': 'baby_care',
  'pampers': 'baby_care',
  'huggies': 'baby_care',
  'canbebe': 'baby_care',
  'ڈائپر': 'baby_care',
  'پیمپرز': 'baby_care',

  'baby wipes': 'baby_care',
  'wipes': 'baby_care',
  'baby lotion': 'baby_care',
  'baby oil': 'baby_care',
  'cerelac': 'baby_care',
  'baby formula': 'baby_care',
  'lactogen': 'baby_care',
  'فیڈر': 'baby_care',
  'سیریلیک': 'baby_care',

  // MEDICINES (ادویات)
  'panadol': 'medicines',
  'paracetamol': 'medicines',
  'disprin': 'medicines',
  'brufen': 'medicines',
  'arinac': 'medicines',
  'rigix': 'medicines',
  'saniplast': 'medicines',
  'bandage': 'medicines',
  'dawa': 'medicines',
  'dawai': 'medicines',
  'medicine': 'medicines',
  'syrup': 'medicines',
  'پیناڈول': 'medicines',
  'دوائی': 'medicines',
  'بینڈیج': 'medicines',

  // STATIONERY (اسٹیشنری)
  'pen': 'stationery',
  'pencil': 'stationery',
  'notebook': 'stationery',
  'register': 'stationery',
  'eraser': 'stationery',
  'sharpener': 'stationery',
  'scale': 'stationery',
  'paper': 'stationery',
  'قلم': 'stationery',
  'پینسل': 'stationery',
  'کاپی': 'stationery',

  // ELECTRONICS (الیکٹرانکس)
  'charger': 'electronics',
  'cable': 'electronics',
  'usb': 'electronics',
  'headphones': 'electronics',
  'handsfree': 'electronics',
  'ہینڈز فری': 'electronics',
  'چارجر': 'electronics',

  // CLOTHING (کپڑے)
  'socks': 'clothing',
  'shirt': 'clothing',
  't-shirt': 'clothing',
  'towel': 'clothing',
  'toliya': 'clothing',
  'جورابیں': 'clothing',
  'تولیہ': 'clothing',
  'کپڑے': 'clothing',
};

// Keyword containment rules for compound inputs like "Fresh Apples", "1kg Red Potatoes", etc.
const KEYWORD_RULES: Array<{ keywords: string[]; category: CategoryId }> = [
  {
    category: 'vegetables',
    keywords: [
      'aloo', 'aaloo', 'potato', 'pyaaz', 'pyaz', 'onion', 'tamatar', 'tomato', 'palak', 'spinach',
      'lehsan', 'garlic', 'adrak', 'ginger', 'mirch', 'chilli', 'kheera', 'cucumber', 'leemo', 'lemon',
      'gajar', 'carrot', 'gobi', 'cauliflower', 'cabbage', 'matar', 'peas', 'bhindi', 'okra', 'karela',
      'baingan', 'mooli', 'kaddu', 'sabzi', 'sabziyan', 'آلو', 'پیاز', 'ٹماٹر', 'لہسن', 'ادرک', 'مرچ', 'سبزی',
    ],
  },
  {
    category: 'fruits',
    keywords: [
      'saib', 'apple', 'kela', 'banana', 'aam', 'mango', 'angoor', 'grape', 'malta', 'orange', 'kinnow',
      'tarbooz', 'watermelon', 'amrood', 'guava', 'anaar', 'pomegranate', 'berry', 'phal', 'fruit',
      'سیب', 'کیلا', 'آم', 'انگور', 'پھل',
    ],
  },
  {
    category: 'dairy',
    keywords: [
      'doodh', 'milk', 'dahi', 'yogurt', 'curd', 'makhan', 'butter', 'paneer', 'cheese', 'malai', 'cream',
      'anda', 'anday', 'ande', 'egg', 'eggs', 'olpers', 'milkpak', 'دودھ', 'انڈے', 'دہی', 'مکھن', 'پنیر',
    ],
  },
  {
    category: 'grains_staples',
    keywords: [
      'atta', 'aata', 'flour', 'maida', 'chawal', 'rice', 'cheeni', 'sugar', 'tail', 'oil', 'ghee',
      'daal', 'lentil', 'dal', 'chanay', 'chana', 'namak', 'salt', 'masala', 'zeera', 'haldi', 'pasta',
      'macaroni', 'noodle', 'sewaiyan', 'oats', 'daliya', 'آٹا', 'چاول', 'چینی', 'تیل', 'گھی', 'دال', 'نمک',
    ],
  },
  {
    category: 'meat',
    keywords: [
      'gosht', 'meat', 'chicken', 'murghi', 'beef', 'mutton', 'machli', 'fish', 'qeema', 'keema',
      'prawn', 'jheenga', 'مرغی', 'گوشت', 'مچھلی', 'قیمہ', 'چکن',
    ],
  },
  {
    category: 'bakery',
    keywords: [
      'bread', 'roti', 'double roti', 'bun', 'rusk', 'paapay', 'papey', 'cake', 'pastry', 'naan',
      'sheermal', 'paratha', 'croissant', 'ڈبل روٹی', 'نان', 'کیک', 'بریڈ',
    ],
  },
  {
    category: 'beverages',
    keywords: [
      'chai', 'tea', 'patti', 'coffee', 'juice', 'sharbat', 'rooh afza', 'pepsi', 'coke', 'soda',
      'water', 'drink', 'چائے', 'جوس', 'پانی', 'کافی',
    ],
  },
  {
    category: 'snacks',
    keywords: [
      'biscuit', 'biscuits', 'cookie', 'chips', 'lays', 'kurkure', 'nimko', 'chocolate', 'toffee',
      'badam', 'kaju', 'pista', 'nuts', 'بسکٹ', 'چپس', 'نمکو', 'چاکلیٹ',
    ],
  },
  {
    category: 'frozen',
    keywords: [
      'nugget', 'nuggets', 'kabab', 'samosa', 'roll', 'frozen', 'ice cream', 'نگٹس', 'کباب', 'سموسے', 'آئس کریم',
    ],
  },
  {
    category: 'personal_care',
    keywords: [
      'sabun', 'soap', 'shampoo', 'toothpaste', 'brush', 'facewash', 'face wash', 'lotion', 'cream',
      'perfume', 'spray', 'razor', 'shave', 'صابن', 'شیمپو', 'ٹوتھ پیسٹ',
    ],
  },
  {
    category: 'cleaning',
    keywords: [
      'surf', 'detergent', 'washing powder', 'dishwash', 'harpic', 'bleach', 'jharoo', 'pocha',
      'broom', 'mop', 'cleaner', 'سرف', 'ہارپک', 'جھاڑو', 'صفائی',
    ],
  },
  {
    category: 'household',
    keywords: [
      'tissue', 'shopper', 'bag', 'foil', 'bulb', 'match', 'machis', 'cell', 'battery', 'ٹشو', 'ماچس', 'بلب',
    ],
  },
  {
    category: 'baby_care',
    keywords: [
      'diaper', 'pampers', 'wipes', 'baby', 'cerelac', 'ڈائپر', 'پیمپرز',
    ],
  },
  {
    category: 'medicines',
    keywords: [
      'panadol', 'disprin', 'brufen', 'medicine', 'dawa', 'dawai', 'syrup', 'bandage', 'پیناڈول', 'دوائی',
    ],
  },
  {
    category: 'stationery',
    keywords: [
      'pen', 'pencil', 'notebook', 'register', 'eraser', 'paper', 'پینسل', 'قلم', 'کاپی',
    ],
  },
  {
    category: 'electronics',
    keywords: [
      'charger', 'cable', 'usb', 'handsfree', 'headphone', 'چارجر', 'ہینڈز فری',
    ],
  },
  {
    category: 'clothing',
    keywords: [
      'shirt', 'socks', 'towel', 'toliya', 'kapray', 'تولیہ', 'کپڑے',
    ],
  },
];

// Helper to get user saved overrides from localStorage
export function getUserCategoryOverrides(): Record<string, CategoryId> {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save user manual category correction
export function saveUserCategoryOverride(itemName: string, categoryId: CategoryId): void {
  try {
    const norm = normalizeItemText(itemName);
    if (!norm) return;
    const current = getUserCategoryOverrides();
    current[norm] = categoryId;
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

/**
 * Local Synchronous Categorizer:
 * 1. Checks user manual overrides first.
 * 2. Checks exact normalized dictionary match.
 * 3. Checks keyword containment.
 * 4. Defaults to 'other' if unknown.
 */
export function categorizeItemLocally(rawInput: string): CategorizeResult {
  const norm = normalizeItemText(rawInput);
  if (!norm) {
    return {
      categoryId: 'other',
      confidence: 0.1,
      matchedVia: 'fallback',
      normalizedItemName: '',
    };
  }

  // 1. User manual correction history
  const overrides = getUserCategoryOverrides();
  if (overrides[norm]) {
    return {
      categoryId: overrides[norm],
      confidence: 1.0,
      matchedVia: 'user_override',
      normalizedItemName: norm,
    };
  }

  // 2. Exact match in dictionary
  if (DICTIONARY[norm]) {
    return {
      categoryId: DICTIONARY[norm],
      confidence: 0.95,
      matchedVia: 'local_rule',
      normalizedItemName: norm,
    };
  }

  // 3. Multi-word phrase or token check in dictionary
  const tokens = norm.split(' ');
  for (const token of tokens) {
    if (DICTIONARY[token]) {
      return {
        categoryId: DICTIONARY[token],
        confidence: 0.88,
        matchedVia: 'local_rule',
        normalizedItemName: norm,
      };
    }
  }

  // 4. Keyword containment rules
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (norm.includes(kw) || kw.includes(norm)) {
        return {
          categoryId: rule.category,
          confidence: 0.8,
          matchedVia: 'local_rule',
          normalizedItemName: norm,
        };
      }
    }
  }

  // 5. Fallback
  return {
    categoryId: 'other',
    confidence: 0.3,
    matchedVia: 'fallback',
    normalizedItemName: norm,
  };
}

/**
 * Hybrid Smart Categorization (with server-side AI fallback):
 * Instant response if matched locally with >= 0.8 confidence.
 * Calls `/api/categorize` asynchronously when confidence < 0.8 and returns refined category.
 */
export async function smartCategorizeItem(rawInput: string): Promise<CategorizeResult> {
  const localResult = categorizeItemLocally(rawInput);

  // If local confidence is high, return immediately without network call
  if (localResult.confidence >= 0.8) {
    return localResult;
  }

  // Otherwise, request server-side AI classification with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: rawInput }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.categoryId && CATEGORIES_LIST.some((c) => c.id === data.categoryId)) {
        // Cache this AI match in local overrides for instant lookup in future
        saveUserCategoryOverride(rawInput, data.categoryId as CategoryId);

        return {
          categoryId: data.categoryId as CategoryId,
          confidence: data.confidence || 0.9,
          matchedVia: 'ai',
          normalizedItemName: normalizeItemText(rawInput),
        };
      }
    }
  } catch {
    // Network, timeout, or server error - graceful fallback to local result
  }

  return localResult;
}
