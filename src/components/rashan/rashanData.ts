/**
/**
 * Authentic Pakistani Monthly Rashan Data & Editorial Content
 * Multi-Language Content Model (English, Roman Urdu, Urdu)
 */

export interface RashanItem {
  id: string;
  name: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  typicalQty: string;
  category: 'grains' | 'pulses' | 'oils' | 'spices' | 'dairy' | 'cleaning' | 'perishables';
  note?: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
}

export interface RashanCategory {
  id: 'grains' | 'pulses' | 'oils' | 'spices' | 'dairy' | 'cleaning' | 'perishables';
  title: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  description: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  icon: string;
  items: RashanItem[];
}

export const RASHAN_CATEGORIES: RashanCategory[] = [
  {
    id: 'grains',
    title: {
      en: 'Flour, Rice & Staples',
      romanUrdu: 'Atta, Chawal Aur Bunyadi Anaaj',
      ur: 'آٹا، چاول اور بنیادی اناج',
    },
    description: {
      en: 'Primary kitchen fuel for everyday rotis, parathas, and rice dishes.',
      romanUrdu: 'Roti, paratha aur chawal k liye mahana bunyadi zarooriyat.',
      ur: 'روزمرہ روٹی، پراٹھا اور چاول کے لیے ماہانہ بنیادی ضروریات۔',
    },
    icon: '🌾',
    items: [
      {
        id: 'atta',
        name: { en: 'Whole Wheat Chakki Atta', romanUrdu: 'Chakki Ka Atta', ur: 'چکی کا آٹا' },
        typicalQty: '20 kg',
        category: 'grains',
        note: { en: 'Check milling freshness; store in airtight tin.', romanUrdu: 'Hawa-band dabbe mein rakhein.', ur: 'ہوا بند ڈبے میں رکھیں۔' },
      },
      {
        id: 'basmati-rice',
        name: { en: 'Super Kernel Basmati Rice', romanUrdu: 'Basmati Chawal', ur: 'باس متی چاول' },
        typicalQty: '5 kg',
        category: 'grains',
        note: { en: 'Aged rice absorbs water better for biryani & pulao.', romanUrdu: 'Biryani aur pulao k liye purana chawal behtar hai.', ur: 'بریانی اور پلاؤ کے لیے پرانا چاول بہترین ہے۔' },
      },
      {
        id: 'sella-rice',
        name: { en: 'Sella Rice (Optional)', romanUrdu: 'Sella Chawal', ur: 'سیلہ چاول' },
        typicalQty: '2 kg',
        category: 'grains',
        note: { en: 'Ideal for zarda and special dishes.', romanUrdu: 'Zarday k liye mufeed.', ur: 'زردہ کے لیے مفید۔' },
      },
      {
        id: 'maida',
        name: { en: 'All-Purpose Flour (Maida)', romanUrdu: 'Maida', ur: 'میدہ' },
        typicalQty: '1 kg',
        category: 'grains',
      },
      {
        id: 'suji',
        name: { en: 'Semolina (Suji)', romanUrdu: 'Suji', ur: 'سوجی' },
        typicalQty: '1 kg',
        category: 'grains',
        note: { en: 'Slightly roast before storage to avoid moisture.', romanUrdu: 'Halka bhun kar rakhein taakay keera na lagay.', ur: 'ہلکا بھون کر رکھیں تاکہ نمی اور کیڑا نہ لگے۔' },
      },
      {
        id: 'besan',
        name: { en: 'Gram Flour (Besan)', romanUrdu: 'Besan', ur: 'بیسن' },
        typicalQty: '2 kg',
        category: 'grains',
      },
    ],
  },
  {
    id: 'pulses',
    title: {
      en: 'Pulses & Lentils (Daalein)',
      romanUrdu: 'Daalein Aur Sabut Chane',
      ur: 'دالیں اور اناج',
    },
    description: {
      en: 'Essential daily protein staples for South Asian cooking.',
      romanUrdu: 'Pakistani dastarkhwan ka lazmi protein aur ghiza.',
      ur: 'پاکستانی دسترخوان کا لازمی پروٹین اور روزمرہ غذا۔',
    },
    icon: '🥣',
    items: [
      {
        id: 'daal-chana',
        name: { en: 'Split Bengal Gram (Daal Chana)', romanUrdu: 'Daal Chana', ur: 'دال چنا' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-moong',
        name: { en: 'Yellow Lentils (Daal Moong)', romanUrdu: 'Daal Moong Dhuli', ur: 'دال مونگ دھلی' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-masoor',
        name: { en: 'Red Lentils (Daal Masoor)', romanUrdu: 'Daal Masoor', ur: 'دال مسور' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-mash',
        name: { en: 'White Lentils (Daal Mash)', romanUrdu: 'Daal Mash Dhuli', ur: 'دال ماش' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'white-chana',
        name: { en: 'White Chickpeas (Kabuli Chana)', romanUrdu: 'Safed Chane', ur: 'سفید چنے' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'kala-chana',
        name: { en: 'Black Chickpeas (Kala Chana)', romanUrdu: 'Kala Chana', ur: 'کالے چنے' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'lobia',
        name: { en: 'Red Kidney Beans / Black-eyed Beans', romanUrdu: 'Lobia / Rajma', ur: 'لوبیا / راجما' },
        typicalQty: '500g',
        category: 'pulses',
      },
    ],
  },
  {
    id: 'oils',
    title: {
      en: 'Cooking Oil, Ghee & Sweeteners',
      romanUrdu: 'Cooking Oil, Ghee Aur Meetha',
      ur: 'کوکنگ آئل، گھی اور میٹھا',
    },
    description: {
      en: 'Core cooking mediums and everyday household sweeteners.',
      romanUrdu: 'Handi, salan aur rozaana meethay k bunyadi ajza.',
      ur: 'ہانڈی، سالن اور روزمرہ کے بنیادی اجزاء۔',
    },
    icon: '🫒',
    items: [
      {
        id: 'oil-ghee',
        name: { en: 'Cooking Oil / Banaspati Ghee', romanUrdu: 'Cooking Oil ya Ghee', ur: 'کوکنگ آئل یا بانسپتی گھی' },
        typicalQty: '5 Liters',
        category: 'oils',
        note: { en: 'Pouch or tin depending on household preference.', romanUrdu: '5 liter pouch ya tin.', ur: '۵ لیٹر پاؤچ یا کنستر۔' },
      },
      {
        id: 'mustard-oil',
        name: { en: 'Mustard Oil (Sarson Ka Tel)', romanUrdu: 'Sarson Ka Tel', ur: 'سرسوں کا تیل' },
        typicalQty: '1 Liter',
        category: 'oils',
        note: { en: 'For traditional pickles, frying, or hair care.', romanUrdu: 'Achar aur tarqay k liye.', ur: 'اچار اور تڑکے کے لیے۔' },
      },
      {
        id: 'sugar',
        name: { en: 'Refined White Sugar (Cheeni)', romanUrdu: 'Cheeni', ur: 'چینی' },
        typicalQty: '5 kg',
        category: 'oils',
      },
      {
        id: 'salt',
        name: { en: 'Iodized Table Salt (Namak)', romanUrdu: 'Iodized Namak', ur: 'آیوڈین ملا نمک' },
        typicalQty: '2 kg',
        category: 'oils',
      },
      {
        id: 'gurr',
        name: { en: 'Traditional Jaggery (Gurr)', romanUrdu: 'Desi Gurr', ur: 'دیسی گڑ' },
        typicalQty: '500g',
        category: 'oils',
      },
    ],
  },
  {
    id: 'spices',
    title: {
      en: 'Spices & Whole Masalas (مصالحہ جات)',
      romanUrdu: 'Masalay Aur Khushk Masalajat',
      ur: 'مصالحہ جات اور ثابت مصالحے',
    },
    description: {
      en: 'The heart of Pakistani cuisine. Fresh spices prevent bland curries.',
      romanUrdu: 'Pakistani khanay ki jaan. Tazgi barqarar rakhne k liye khushk dabbon mein rakhein.',
      ur: 'پاکستانی کھانوں کی روح۔ تازگی برقرار رکھنے کے لیے خشک ڈبوں میں رکھیں۔',
    },
    icon: '🌶️',
    items: [
      {
        id: 'lal-mirch',
        name: { en: 'Red Chili Powder (Lal Mirch)', romanUrdu: 'Pissi Lal Mirch', ur: 'پسی لال مرچ' },
        typicalQty: '500g (2 pao)',
        category: 'spices',
      },
      {
        id: 'kuti-mirch',
        name: { en: 'Crushed Chili Flakes (Kuti Lal Mirch)', romanUrdu: 'Darrra / Kuti Mirch', ur: 'کٹی لال مرچ' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'haldi',
        name: { en: 'Turmeric Powder (Haldi)', romanUrdu: 'Haldi Powder', ur: 'ہلدی پاؤڈر' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'dhanya-powder',
        name: { en: 'Coriander Powder (Pissa Dhanya)', romanUrdu: 'Pissa Dhanya', ur: 'پسا دھنیا' },
        typicalQty: '500g (2 pao)',
        category: 'spices',
      },
      {
        id: 'zeera',
        name: { en: 'White Cumin Seeds (Safed Zeera)', romanUrdu: 'Sabut Safed Zeera', ur: 'ثابت سفید زیرہ' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'kali-mirch',
        name: { en: 'Whole Black Peppercorns (Kali Mirch)', romanUrdu: 'Sabut Kali Mirch', ur: 'ثابت کالی مرچ' },
        typicalQty: '100g',
        category: 'spices',
      },
      {
        id: 'garam-masala',
        name: { en: 'All-Spice Powder (Garam Masala)', romanUrdu: 'Pissa Garam Masala', ur: 'پسا گرم مصالحہ' },
        typicalQty: '100g',
        category: 'spices',
      },
      {
        id: 'darchini-laung',
        name: { en: 'Cinnamon & Cloves (Darchini / Laung)', romanUrdu: 'Darchini Aur Laung', ur: 'دارچینی اور لونگ' },
        typicalQty: '50g each',
        category: 'spices',
      },
      {
        id: 'recipe-mixes',
        name: { en: 'National or Shan Recipe Mixes (Biryani/Karahi)', romanUrdu: 'Biryani / Karahi Masala Packets', ur: 'بریانی اور کڑاہی مصالحہ پیکیٹ' },
        typicalQty: '2-4 packs',
        category: 'spices',
      },
    ],
  },
  {
    id: 'dairy',
    title: {
      en: 'Tea, Milk & Breakfast',
      romanUrdu: 'Chai Patti, Doodh Aur Nashta',
      ur: 'چائے، دودھ اور ناشتہ',
    },
    description: {
      en: 'Morning chai rituals and daily breakfast essentials.',
      romanUrdu: 'Subah ki chai aur ghareloo nashtay k zaroori items.',
      ur: 'صبح کی چائے اور گھریلو ناشتے کے ضروری لوازمات۔',
    },
    icon: '☕',
    items: [
      {
        id: 'chai-patti',
        name: { en: 'Black Tea Leaves (Tapal / Danedar)', romanUrdu: 'Chai Patti (Danedar)', ur: 'چائے کی پتی (دانے دار)' },
        typicalQty: '900g pack',
        category: 'dairy',
      },
      {
        id: 'dry-milk',
        name: { en: 'Dry Powdered Milk or Tetra Pak', romanUrdu: 'Khushk Doodh ya Tetra Pak', ur: 'خشک دودھ یا ٹیٹرا پیک' },
        typicalQty: '2-4 Liters',
        category: 'dairy',
      },
      {
        id: 'anday',
        name: { en: 'Farm Fresh Eggs', romanUrdu: 'Anday (Eggs)', ur: 'تازہ انڈے' },
        typicalQty: '2-3 Darjan (Dozen)',
        category: 'dairy',
        note: { en: '1 Darjan = 12 eggs. Buy fortnightly for freshness.', romanUrdu: '1 darjan = 12 anday.', ur: '۱ درجن = ۱۲ انڈے۔ تازگی کے لیے پندرہ روزہ خریدیں۔' },
      },
      {
        id: 'jam-spread',
        name: { en: 'Breakfast Jam / Honey', romanUrdu: 'Jam ya Shehad', ur: 'جام یا شہد' },
        typicalQty: '1 bottle',
        category: 'dairy',
      },
    ],
  },
  {
    id: 'cleaning',
    title: {
      en: 'Hygiene & Household Cleaning',
      romanUrdu: 'Safai, Surf Aur Ghareloo Saman',
      ur: 'صفائی، سرف اور گھریلو سامان',
    },
    description: {
      en: 'Laundry detergents, dish cleaners, and sanitization staples.',
      romanUrdu: 'Kapray, bartan aur ghar ki safai ka mahana rashan.',
      ur: 'کپڑے، برتن اور گھر کی صفائی کا ماہانہ راشن۔',
    },
    icon: '🧼',
    items: [
      {
        id: 'surf',
        name: { en: 'Washing Powder / Detergent (Surf)', romanUrdu: 'Washing Powder (Surf)', ur: 'واشنگ پاؤڈر / سرف' },
        typicalQty: '3 kg',
        category: 'cleaning',
      },
      {
        id: 'dishwash',
        name: { en: 'Dishwashing Bar or Liquid (Lemon Max)', romanUrdu: 'Bartan Dhonay Ka Sabun', ur: 'برتن دھونے کا صابن / لیکوئڈ' },
        typicalQty: '3-4 bars',
        category: 'cleaning',
      },
      {
        id: 'bath-soap',
        name: { en: 'Bathing Soaps (Multi-Pack)', romanUrdu: 'Nehanay K Sabun (Packs)', ur: 'نہانے کے صابن (پیک)' },
        typicalQty: '4-6 bars',
        category: 'cleaning',
      },
      {
        id: 'toilet-cleaner',
        name: { en: 'Toilet & Bathroom Cleaner (Harpic)', romanUrdu: 'Toilet Cleaner', ur: 'ٹوائلٹ کلینر / فینائل' },
        typicalQty: '1 bottle',
        category: 'cleaning',
      },
      {
        id: 'toothpaste',
        name: { en: 'Toothpaste (Family Pack)', romanUrdu: 'Toothpaste', ur: 'ٹوتھ پیسٹ' },
        typicalQty: '2 tubes',
        category: 'cleaning',
      },
      {
        id: 'matchbox',
        name: { en: 'Safety Matchboxes / Lighter', romanUrdu: 'Maachis (Matchbox)', ur: 'ماچس' },
        typicalQty: '1 pack (10 pcs)',
        category: 'cleaning',
      },
      {
        id: 'trash-bags',
        name: { en: 'Dustbin Trash Bags', romanUrdu: 'Kachray K Lifafay (Trash Bags)', ur: 'کوڑا دان کے تھیلے' },
        typicalQty: '1 roll',
        category: 'cleaning',
      },
    ],
  },
  {
    id: 'perishables',
    title: {
      en: 'Weekly Vegetables & Staples (سبزی و مصالحہ)',
      romanUrdu: 'Haftawar Sabzi Aur Taza Saman',
      ur: 'ہفتہ وار سبزی اور تازہ سودا سلف',
    },
    description: {
      en: 'Perishables typically purchased weekly or bi-weekly from subzi mandis.',
      romanUrdu: 'Aloo, pyaz aur tamatar jo haftay ya 10 din baad khareeday jaatay hain.',
      ur: 'آلو، پیاز اور ٹماٹر جو ہفتے یا دس دن بعد خریدے جاتے ہیں۔',
    },
    icon: '🥔',
    items: [
      {
        id: 'pyaz',
        name: { en: 'Onions (Pyaz)', romanUrdu: 'Pyaz', ur: 'پیاز' },
        typicalQty: '5 kg (1 Dhari)',
        category: 'perishables',
        note: { en: '1 Dhari = 5 kg in traditional wholesale markets.', romanUrdu: '1 dhari = 5 kilo.', ur: '۱ دھڑی = ۵ کلو۔ منڈی سے اکٹھی خرید کر ہوا دار جگہ پر رکھیں۔' },
      },
      {
        id: 'aloo',
        name: { en: 'Potatoes (Aloo)', romanUrdu: 'Aloo', ur: 'آلو' },
        typicalQty: '5 kg (1 Dhari)',
        category: 'perishables',
      },
      {
        id: 'tamatar',
        name: { en: 'Fresh Tomatoes (Tamatar)', romanUrdu: 'Tamatar', ur: 'ٹماٹر' },
        typicalQty: '2 kg weekly',
        category: 'perishables',
      },
      {
        id: 'adrak-lehsan',
        name: { en: 'Ginger & Garlic (Adrak Lehsan)', romanUrdu: 'Adrak Aur Lehsan', ur: 'ادرک اور لہسن' },
        typicalQty: '500g each (2 pao)',
        category: 'perishables',
      },
    ],
  },
];

export interface UnitGuide {
  unit: string;
  nameUrdu: string;
  metricEquivalent: string;
  usageContext: string;
}

export const PAKISTANI_UNITS_GUIDE: UnitGuide[] = [
  {
    unit: 'Pao (پاؤ)',
    nameUrdu: 'پاؤ',
    metricEquivalent: '250 Grams (0.25 kg)',
    usageContext: 'Ubiquitous for spices (haldi, zeera, mirch), ginger, garlic, and specialty loose dry fruits.',
  },
  {
    unit: 'Adha Kilo (آدھا کلو)',
    nameUrdu: 'آدھا کلو',
    metricEquivalent: '500 Grams (0.5 kg)',
    usageContext: 'Standard grocery unit for everyday lentils, sugar for small families, and butter.',
  },
  {
    unit: 'Kilo (کلو)',
    nameUrdu: 'کلو',
    metricEquivalent: '1,000 Grams (1.0 kg)',
    usageContext: 'Primary base measurement for rice, flour, pulses, and large vegetables.',
  },
  {
    unit: 'Darjan (درجن)',
    nameUrdu: 'درجن',
    metricEquivalent: '12 Units (Dozen)',
    usageContext: 'Standard count for fresh farm eggs, bananas, oranges, and bundled soap bars.',
  },
  {
    unit: 'Dhari (دھڑی)',
    nameUrdu: 'دھڑی',
    metricEquivalent: '5 Kilograms (5.0 kg)',
    usageContext: 'Traditional wholesale unit used in Pakistani subzi mandis for bulk potatoes and onions.',
  },
  {
    unit: 'Chattank (چھٹانک)',
    nameUrdu: 'چھٹانک',
    metricEquivalent: '~60 Grams (Historical 1/16 Ser)',
    usageContext: 'Used by traditional herbalists (pansari) and older kiryana shopkeepers for rare whole spices like saffron and cardamom.',
  },
];

export interface RashanFaq {
  id: string;
  question: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  answer: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
}

export const RASHAN_FAQS: RashanFaq[] = [
  {
    id: 'what-is-rashan-list',
    question: {
      en: 'What is a monthly rashan list in Pakistan?',
      romanUrdu: 'Pakistan mein monthly rashan list kya hoti hai?',
      ur: 'پاکستان میں ماہانہ راشن لسٹ کیا ہوتی ہے؟',
    },
    answer: {
      en: 'A monthly rashan list (راشن لسٹ) is the recurring inventory of kitchen staples, cooking oils, pulses, flour, spices, and cleaning supplies bought once a month by Pakistani households to sustain daily cooking and prevent mid-month shortages.',
      romanUrdu: 'Monthly rashan list ghareloo kitchen ki un bunyadi cheezon ki fahreest hoti hai (jaisay atta, daalein, ghee, cheeni aur masalay) jo har maah k aaghaz mein khareedi jaati hain taakay ghar ka nizam asani se chal sakay.',
      ur: 'ماہانہ راشن لسٹ گھریلو باورچی خانے کے ان بنیادی اجزاء (جیسے آٹا، چاول، دالیں، گھی، چینی اور صفائی کا سامان) کی فہرست ہوتی ہے جو ہر مہینے کے آغاز پر خاندانی ضروریات کے مطابق خریدی جاتی ہے۔',
    },
  },
  {
    id: 'how-much-for-family-of-4',
    question: {
      en: 'How much rashan is typically needed for a family of 4 to 5 people?',
      romanUrdu: '4 se 5 afrad k khandan k liye kitna rashan kafi hota hai?',
      ur: '۴ سے ۵ افراد کے خاندان کے لیے کتنا راشن درکار ہوتا ہے؟',
    },
    answer: {
      en: 'For an average urban Pakistani family of 4–5 members, typical monthly quantities include: 20 kg whole wheat atta, 5 kg basmati rice, 5 liters cooking oil or banaspati ghee, 4–5 kg sugar, 4 kg mixed pulses (daalein), 900g tea leaves, and 2–3 dozen eggs, along with household detergents and spices.',
      romanUrdu: '4-5 afrad k liye aam tor par mahana 20 kilo chakki atta, 5 kilo basmati chawal, 5 liter cooking oil ya ghee, 4-5 kilo cheeni, 4 kilo mukhtalif daalein, aur 900g chai patti kafi hoti hai.',
      ur: 'چار سے پانچ افراد کے اوسط خاندان کے لیے عام طور پر ۲۰ کلو چکی کا آٹا، ۵ کلو باسمتی چاول، ۵ لیٹر کوکنگ آئل یا گھی، ۵ کلو چینی، ۴ کلو مختلف دالیں اور ۹۰۰ گرام چائے کی پتی ماہانہ درکار ہوتی ہے۔',
    },
  },
  {
    id: 'how-yaad-helps-rashan',
    question: {
      en: 'How does YAAD make monthly rashan shopping faster and organized?',
      romanUrdu: 'YAAD app mahana rashan ki shopping ko kaise asaan banati hai?',
      ur: 'یاد ایپ ماہانہ راشن کی خریداری کو کس طرح آسان اور منظم بناتی ہے؟',
    },
    answer: {
      en: 'YAAD eliminates handwritten paper notes and forgotten items by automatically organizing your rashan into smart categories (Grains, Pulses, Spices, Dairy, Cleaning). You can type items colloquially in Roman Urdu ("daal chana aik kilo") or Urdu script, check them off as you shop, and rely on 100% offline access inside concrete bazaars.',
      romanUrdu: 'YAAD aapki rashan list ko khud-ba-khud aisles aur categories mein sort karti hai. Aap Roman Urdu mein type kar sakte hain, offline market mein check-off kar sakte hain, aur koi zaroori masala ya cheez nahi bhooltay.',
      ur: 'یاد ایپ آپ کی راشن لسٹ کو خودکار طور پر زمرہ جات (دالیں، مصالحے، گھی، صفائی) میں تقسیم کرتی ہے۔ آپ رومن اردو یا اردو میں لکھ سکتے ہیں اور بازار کے اندر بغیر انٹرنیٹ لسٹ کا استعمال کر سکتے ہیں۔',
    },
  },
  {
    id: 'difference-pao-kilo',
    question: {
      en: 'What is the difference between a Pao, Chattank, and Kilo in Pakistani markets?',
      romanUrdu: 'Pao aur Kilo mein kya farq hota hai?',
      ur: 'پاؤ اور کلو میں کیا فرق ہوتا ہے؟',
    },
    answer: {
      en: 'In Pakistan, 1 Kilo is 1,000 grams. A "Pao" (پاؤ) is exactly one-quarter of a kilo, meaning 250 grams. "Adha Kilo" is 500 grams (half a kilo), and "Dhari" (دھڑی) is 5 kilograms. A traditional "Chattank" is roughly 60 grams, historically used for valuable spices and herbal seeds.',
      romanUrdu: '1 Kilo = 1,000 grams. 1 Pao = 250 grams (aik kilo ka choutha hissa). 2 Pao = Adha Kilo (500 grams). 1 Dhari = 5 kilo.',
      ur: '۱ کلو برابر ہے ۱۰۰۰ گرام کے۔ ۱ پاؤ کلو کا چوتھائی حصہ یعنی ۲۵۰ گرام ہوتا ہے۔ آدھا کلو ۵۰۰ گرام کا، اور ۱ دھڑی ۵ کلو کے برابر ہوتی ہے۔',
    },
  },
  {
    id: 'offline-market-usage',
    question: {
      en: 'Can I view and check off my rashan list when the kiryana store has zero mobile signal?',
      romanUrdu: 'Kya internet na honay par bhi YAAD mein rashan list chal sakti hai?',
      ur: 'کیا موبائل انٹرنیٹ نہ ہونے کی صورت میں بھی یاد ایپ پر راشن لسٹ کام کرتی ہے؟',
    },
    answer: {
      en: 'Yes. YAAD is built with an offline-first local database (IndexedDB). Your rashan lists load instantaneously even in underground supermarkets, crowded bazaars, or during mobile network outages with zero internet connection.',
      romanUrdu: 'Jee haan! YAAD mukammal tor par offline kaam karti hai. Bazaaron aur underground supermarkets mein baghair cellular data k aap apni list dekh aur tick kar sakte hain.',
      ur: 'جی ہاں! یاد ایپ مکمل طور پر آف لائن کام کرتی ہے۔ کسی بھی تنگ بازار یا تہہ خانے والی دکان میں انٹرنیٹ کے بغیر آپ کی لسٹ کھلتی اور اپ ڈیٹ ہوتی ہے۔',
    },
  },
];

export const RASHAN_ITEMS: RashanItem[] = RASHAN_CATEGORIES.flatMap((c) => c.items);

export interface HouseholdSizeProfile {
  id: 'small' | 'medium' | 'joint';
  label: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  persons: string;
  multiplier: number;
}

export const HOUSEHOLD_SIZE_PROFILES: HouseholdSizeProfile[] = [
  {
    id: 'small',
    label: {
      en: 'Small Family',
      romanUrdu: 'Chota Gharana',
      ur: 'چھوٹا گھرانہ',
    },
    persons: '2–3 Persons',
    multiplier: 0.6,
  },
  {
    id: 'medium',
    label: {
      en: 'Standard Family',
      romanUrdu: 'Darmyana Gharana',
      ur: 'درمیانہ گھرانہ',
    },
    persons: '4–6 Persons',
    multiplier: 1.0,
  },
  {
    id: 'joint',
    label: {
      en: 'Joint Family',
      romanUrdu: 'Joint / Bara Gharana',
      ur: 'مشترکہ خاندان',
    },
    persons: '7+ Persons',
    multiplier: 1.8,
  },
];
