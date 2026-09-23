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
      en: 'Flour, Rice & Staples', romanUrdu: 'Atta, Chawal Aur Bunyadi Anaaj', ur: 'Flour, Rice & Staples',
    },
    description: {
      en: 'Primary kitchen fuel for everyday rotis, parathas, and rice dishes.', romanUrdu: 'Roti, paratha aur chawal k liye mahana bunyadi zarooriyat.', ur: 'Primary kitchen fuel for everyday rotis, parathas, and rice dishes.',
    },
    icon: '🌾',
    items: [
      {
        id: 'atta',
        name: { en: 'Whole Wheat Chakki Atta', romanUrdu: 'Chakki Ka Atta', ur: 'Whole Wheat Chakki Atta' },
        typicalQty: '20 kg',
        category: 'grains',
        note: { en: 'Check milling freshness; store in airtight tin.', romanUrdu: 'Hawa-band dabbe mein rakhein.', ur: 'Check milling freshness; store in airtight tin.' },
      },
      {
        id: 'basmati-rice',
        name: { en: 'Super Kernel Basmati Rice', romanUrdu: 'Basmati Chawal', ur: 'Super Kernel Basmati Rice' },
        typicalQty: '5 kg',
        category: 'grains',
        note: { en: 'Aged rice absorbs water better for biryani & pulao.', romanUrdu: 'Biryani aur pulao k liye purana chawal behtar hai.', ur: 'Aged rice absorbs water better for biryani & pulao.' },
      },
      {
        id: 'sella-rice',
        name: { en: 'Sella Rice (Optional)', romanUrdu: 'Sella Chawal', ur: 'Sella Rice (Optional)' },
        typicalQty: '2 kg',
        category: 'grains',
        note: { en: 'Ideal for zarda and special dishes.', romanUrdu: 'Zarday k liye mufeed.', ur: 'Ideal for zarda and special dishes.' },
      },
      {
        id: 'maida',
        name: { en: 'All-Purpose Flour (Maida)', romanUrdu: 'Maida', ur: 'All-Purpose Flour (Maida)' },
        typicalQty: '1 kg',
        category: 'grains',
      },
      {
        id: 'suji',
        name: { en: 'Semolina (Suji)', romanUrdu: 'Suji', ur: 'Semolina (Suji)' },
        typicalQty: '1 kg',
        category: 'grains',
        note: { en: 'Slightly roast before storage to avoid moisture.', romanUrdu: 'Halka bhun kar rakhein taakay keera na lagay.', ur: 'Slightly roast before storage to avoid moisture.' },
      },
      {
        id: 'besan',
        name: { en: 'Gram Flour (Besan)', romanUrdu: 'Besan', ur: 'Gram Flour (Besan)' },
        typicalQty: '2 kg',
        category: 'grains',
      },
    ],
  },
  {
    id: 'pulses',
    title: {
      en: 'Pulses & Lentils (Daalein)', romanUrdu: 'Daalein Aur Sabut Chane', ur: 'Pulses & Lentils (Daalein)',
    },
    description: {
      en: 'Essential daily protein staples for South Asian cooking.', romanUrdu: 'Pakistani dastarkhwan ka lazmi protein aur ghiza.', ur: 'Essential daily protein staples for South Asian cooking.',
    },
    icon: '🥣',
    items: [
      {
        id: 'daal-chana',
        name: { en: 'Split Bengal Gram (Daal Chana)', romanUrdu: 'Daal Chana', ur: 'Split Bengal Gram (Daal Chana)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-moong',
        name: { en: 'Yellow Lentils (Daal Moong)', romanUrdu: 'Daal Moong Dhuli', ur: 'Yellow Lentils (Daal Moong)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-masoor',
        name: { en: 'Red Lentils (Daal Masoor)', romanUrdu: 'Daal Masoor', ur: 'Red Lentils (Daal Masoor)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'daal-mash',
        name: { en: 'White Lentils (Daal Mash)', romanUrdu: 'Daal Mash Dhuli', ur: 'White Lentils (Daal Mash)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'white-chana',
        name: { en: 'White Chickpeas (Kabuli Chana)', romanUrdu: 'Safed Chane', ur: 'White Chickpeas (Kabuli Chana)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'kala-chana',
        name: { en: 'Black Chickpeas (Kala Chana)', romanUrdu: 'Kala Chana', ur: 'Black Chickpeas (Kala Chana)' },
        typicalQty: '1 kg',
        category: 'pulses',
      },
      {
        id: 'lobia',
        name: { en: 'Red Kidney Beans / Black-eyed Beans', romanUrdu: 'Lobia / Rajma', ur: 'Red Kidney Beans / Black-eyed Beans' },
        typicalQty: '500g',
        category: 'pulses',
      },
    ],
  },
  {
    id: 'oils',
    title: {
      en: 'Cooking Oil, Ghee & Sweeteners', romanUrdu: 'Cooking Oil, Ghee Aur Meetha', ur: 'Cooking Oil, Ghee & Sweeteners',
    },
    description: {
      en: 'Core cooking mediums and everyday household sweeteners.', romanUrdu: 'Handi, salan aur rozaana meethay k bunyadi ajza.', ur: 'Core cooking mediums and everyday household sweeteners.',
    },
    icon: '🫒',
    items: [
      {
        id: 'oil-ghee',
        name: { en: 'Cooking Oil / Banaspati Ghee', romanUrdu: 'Cooking Oil ya Ghee', ur: 'Cooking Oil / Banaspati Ghee' },
        typicalQty: '5 Liters',
        category: 'oils',
        note: { en: 'Pouch or tin depending on household preference.', romanUrdu: '5 liter pouch ya tin.', ur: 'Pouch or tin depending on household preference.' },
      },
      {
        id: 'mustard-oil',
        name: { en: 'Mustard Oil (Sarson Ka Tel)', romanUrdu: 'Sarson Ka Tel', ur: 'Mustard Oil (Sarson Ka Tel)' },
        typicalQty: '1 Liter',
        category: 'oils',
        note: { en: 'For traditional pickles, frying, or hair care.', romanUrdu: 'Achar aur tarqay k liye.', ur: 'For traditional pickles, frying, or hair care.' },
      },
      {
        id: 'sugar',
        name: { en: 'Refined White Sugar (Cheeni)', romanUrdu: 'Cheeni', ur: 'Refined White Sugar (Cheeni)' },
        typicalQty: '5 kg',
        category: 'oils',
      },
      {
        id: 'salt',
        name: { en: 'Iodized Table Salt (Namak)', romanUrdu: 'Iodized Namak', ur: 'Iodized Table Salt (Namak)' },
        typicalQty: '2 kg',
        category: 'oils',
      },
      {
        id: 'gurr',
        name: { en: 'Traditional Jaggery (Gurr)', romanUrdu: 'Desi Gurr', ur: 'Traditional Jaggery (Gurr)' },
        typicalQty: '500g',
        category: 'oils',
      },
    ],
  },
  {
    id: 'spices',
    title: {
      en: 'Spices & Whole Masalas', romanUrdu: 'Masalay Aur Khushk Masalajat', ur: 'Spices & Whole Masalas',
    },
    description: {
      en: 'The heart of Pakistani cuisine. Fresh spices prevent bland curries.', romanUrdu: 'Pakistani khanay ki jaan. Tazgi barqarar rakhne k liye khushk dabbon mein rakhein.', ur: 'The heart of Pakistani cuisine. Fresh spices prevent bland curries.',
    },
    icon: '🌶️',
    items: [
      {
        id: 'lal-mirch',
        name: { en: 'Red Chili Powder (Lal Mirch)', romanUrdu: 'Pissi Lal Mirch', ur: 'Red Chili Powder (Lal Mirch)' },
        typicalQty: '500g (2 pao)',
        category: 'spices',
      },
      {
        id: 'kuti-mirch',
        name: { en: 'Crushed Chili Flakes (Kuti Lal Mirch)', romanUrdu: 'Darrra / Kuti Mirch', ur: 'Crushed Chili Flakes (Kuti Lal Mirch)' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'haldi',
        name: { en: 'Turmeric Powder (Haldi)', romanUrdu: 'Haldi Powder', ur: 'Turmeric Powder (Haldi)' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'dhanya-powder',
        name: { en: 'Coriander Powder (Pissa Dhanya)', romanUrdu: 'Pissa Dhanya', ur: 'Coriander Powder (Pissa Dhanya)' },
        typicalQty: '500g (2 pao)',
        category: 'spices',
      },
      {
        id: 'zeera',
        name: { en: 'White Cumin Seeds (Safed Zeera)', romanUrdu: 'Sabut Safed Zeera', ur: 'White Cumin Seeds (Safed Zeera)' },
        typicalQty: '250g (1 pao)',
        category: 'spices',
      },
      {
        id: 'kali-mirch',
        name: { en: 'Whole Black Peppercorns (Kali Mirch)', romanUrdu: 'Sabut Kali Mirch', ur: 'Whole Black Peppercorns (Kali Mirch)' },
        typicalQty: '100g',
        category: 'spices',
      },
      {
        id: 'garam-masala',
        name: { en: 'All-Spice Powder (Garam Masala)', romanUrdu: 'Pissa Garam Masala', ur: 'All-Spice Powder (Garam Masala)' },
        typicalQty: '100g',
        category: 'spices',
      },
      {
        id: 'darchini-laung',
        name: { en: 'Cinnamon & Cloves (Darchini / Laung)', romanUrdu: 'Darchini Aur Laung', ur: 'Cinnamon & Cloves (Darchini / Laung)' },
        typicalQty: '50g each',
        category: 'spices',
      },
      {
        id: 'recipe-mixes',
        name: { en: 'National or Shan Recipe Mixes (Biryani/Karahi)', romanUrdu: 'Biryani / Karahi Masala Packets', ur: 'National or Shan Recipe Mixes (Biryani/Karahi)' },
        typicalQty: '2-4 packs',
        category: 'spices',
      },
    ],
  },
  {
    id: 'dairy',
    title: {
      en: 'Tea, Milk & Breakfast', romanUrdu: 'Chai Patti, Doodh Aur Nashta', ur: 'Tea, Milk & Breakfast',
    },
    description: {
      en: 'Morning chai rituals and daily breakfast essentials.', romanUrdu: 'Subah ki chai aur ghareloo nashtay k zaroori items.', ur: 'Morning chai rituals and daily breakfast essentials.',
    },
    icon: '☕',
    items: [
      {
        id: 'chai-patti',
        name: { en: 'Black Tea Leaves (Tapal / Danedar)', romanUrdu: 'Chai Patti (Danedar)', ur: 'Black Tea Leaves (Tapal / Danedar)' },
        typicalQty: '900g pack',
        category: 'dairy',
      },
      {
        id: 'dry-milk',
        name: { en: 'Dry Powdered Milk or Tetra Pak', romanUrdu: 'Khushk Doodh ya Tetra Pak', ur: 'Dry Powdered Milk or Tetra Pak' },
        typicalQty: '2-4 Liters',
        category: 'dairy',
      },
      {
        id: 'anday',
        name: { en: 'Farm Fresh Eggs', romanUrdu: 'Anday (Eggs)', ur: 'Farm Fresh Eggs' },
        typicalQty: '2-3 Darjan (Dozen)',
        category: 'dairy',
        note: { en: '1 Darjan = 12 eggs. Buy fortnightly for freshness.', romanUrdu: '1 darjan = 12 anday.', ur: '1 Darjan = 12 eggs. Buy fortnightly for freshness.' },
      },
      {
        id: 'jam-spread',
        name: { en: 'Breakfast Jam / Honey', romanUrdu: 'Jam ya Shehad', ur: 'Breakfast Jam / Honey' },
        typicalQty: '1 bottle',
        category: 'dairy',
      },
    ],
  },
  {
    id: 'cleaning',
    title: {
      en: 'Hygiene & Household Cleaning', romanUrdu: 'Safai, Surf Aur Ghareloo Saman', ur: 'Hygiene & Household Cleaning',
    },
    description: {
      en: 'Laundry detergents, dish cleaners, and sanitization staples.', romanUrdu: 'Kapray, bartan aur ghar ki safai ka mahana rashan.', ur: 'Laundry detergents, dish cleaners, and sanitization staples.',
    },
    icon: '🧼',
    items: [
      {
        id: 'surf',
        name: { en: 'Washing Powder / Detergent (Surf)', romanUrdu: 'Washing Powder (Surf)', ur: 'Washing Powder / Detergent (Surf)' },
        typicalQty: '3 kg',
        category: 'cleaning',
      },
      {
        id: 'dishwash',
        name: { en: 'Dishwashing Bar or Liquid (Lemon Max)', romanUrdu: 'Bartan Dhonay Ka Sabun', ur: 'Dishwashing Bar or Liquid (Lemon Max)' },
        typicalQty: '3-4 bars',
        category: 'cleaning',
      },
      {
        id: 'bath-soap',
        name: { en: 'Bathing Soaps (Multi-Pack)', romanUrdu: 'Nehanay K Sabun (Packs)', ur: 'Bathing Soaps (Multi-Pack)' },
        typicalQty: '4-6 bars',
        category: 'cleaning',
      },
      {
        id: 'toilet-cleaner',
        name: { en: 'Toilet & Bathroom Cleaner (Harpic)', romanUrdu: 'Toilet Cleaner', ur: 'Toilet & Bathroom Cleaner (Harpic)' },
        typicalQty: '1 bottle',
        category: 'cleaning',
      },
      {
        id: 'toothpaste',
        name: { en: 'Toothpaste (Family Pack)', romanUrdu: 'Toothpaste', ur: 'Toothpaste (Family Pack)' },
        typicalQty: '2 tubes',
        category: 'cleaning',
      },
      {
        id: 'matchbox',
        name: { en: 'Safety Matchboxes / Lighter', romanUrdu: 'Maachis (Matchbox)', ur: 'Safety Matchboxes / Lighter' },
        typicalQty: '1 pack (10 pcs)',
        category: 'cleaning',
      },
      {
        id: 'trash-bags',
        name: { en: 'Dustbin Trash Bags', romanUrdu: 'Kachray K Lifafay (Trash Bags)', ur: 'Dustbin Trash Bags' },
        typicalQty: '1 roll',
        category: 'cleaning',
      },
    ],
  },
  {
    id: 'perishables',
    title: {
      en: 'Weekly Vegetables & Staples', romanUrdu: 'Haftawar Sabzi Aur Taza Saman', ur: 'Weekly Vegetables & Staples',
    },
    description: {
      en: 'Perishables typically purchased weekly or bi-weekly from subzi mandis.', romanUrdu: 'Aloo, pyaz aur tamatar jo haftay ya 10 din baad khareeday jaatay hain.', ur: 'Perishables typically purchased weekly or bi-weekly from subzi mandis.',
    },
    icon: '🥔',
    items: [
      {
        id: 'pyaz',
        name: { en: 'Onions (Pyaz)', romanUrdu: 'Pyaz', ur: 'Onions (Pyaz)' },
        typicalQty: '5 kg (1 Dhari)',
        category: 'perishables',
        note: { en: '1 Dhari = 5 kg in traditional wholesale markets.', romanUrdu: '1 dhari = 5 kilo.', ur: '1 Dhari = 5 kg in traditional wholesale markets.' },
      },
      {
        id: 'aloo',
        name: { en: 'Potatoes (Aloo)', romanUrdu: 'Aloo', ur: 'Potatoes (Aloo)' },
        typicalQty: '5 kg (1 Dhari)',
        category: 'perishables',
      },
      {
        id: 'tamatar',
        name: { en: 'Fresh Tomatoes (Tamatar)', romanUrdu: 'Tamatar', ur: 'Fresh Tomatoes (Tamatar)' },
        typicalQty: '2 kg weekly',
        category: 'perishables',
      },
      {
        id: 'adrak-lehsan',
        name: { en: 'Ginger & Garlic (Adrak Lehsan)', romanUrdu: 'Adrak Aur Lehsan', ur: 'Ginger & Garlic (Adrak Lehsan)' },
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
    unit: 'Pao (250g)',
    nameUrdu: 'Pao',
    metricEquivalent: '250 Grams (0.25 kg)',
    usageContext: 'Ubiquitous for spices (haldi, zeera, mirch), ginger, garlic, and specialty loose dry fruits.',
  },
  {
    unit: 'Adha Kilo (500g)',
    nameUrdu: 'Adha Kilo',
    metricEquivalent: '500 Grams (0.5 kg)',
    usageContext: 'Standard grocery unit for everyday lentils, sugar for small families, and butter.',
  },
  {
    unit: 'Kilo (1000g)',
    nameUrdu: 'Kilo',
    metricEquivalent: '1,000 Grams (1.0 kg)',
    usageContext: 'Primary base measurement for rice, flour, pulses, and large vegetables.',
  },
  {
    unit: 'Darjan (12 pcs)',
    nameUrdu: 'Darjan',
    metricEquivalent: '12 Units (Dozen)',
    usageContext: 'Standard count for fresh farm eggs, bananas, oranges, and bundled soap bars.',
  },
  {
    unit: 'Dhari (5kg)',
    nameUrdu: 'Dhari',
    metricEquivalent: '5 Kilograms (5.0 kg)',
    usageContext: 'Traditional wholesale unit used in Pakistani subzi mandis for bulk potatoes and onions.',
  },
  {
    unit: 'Chattank (60g)',
    nameUrdu: 'Chattank',
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
      en: 'What is a monthly rashan list in Pakistan?', romanUrdu: 'Pakistan mein monthly rashan list kya hoti hai?', ur: 'What is a monthly rashan list in Pakistan?',
    },
    answer: {
      en: 'A monthly rashan list is the recurring inventory of kitchen staples, cooking oils, pulses, flour, spices, and cleaning supplies bought once a month by Pakistani households to sustain daily cooking and prevent mid-month shortages.', romanUrdu: 'Monthly rashan list ghareloo kitchen ki un bunyadi cheezon ki fahreest hoti hai (jaisay atta, daalein, ghee, cheeni aur masalay) jo har maah k aaghaz mein khareedi jaati hain taakay ghar ka nizam asani se chal sakay.', ur: 'A monthly rashan list is the recurring inventory of kitchen staples, cooking oils, pulses, flour, spices, and cleaning supplies bought once a month by Pakistani households to sustain daily cooking and prevent mid-month shortages.',
    },
  },
  {
    id: 'how-much-for-family-of-4',
    question: {
      en: 'How much rashan is typically needed for a family of 4 to 5 people?', romanUrdu: '4 se 5 afrad k khandan k liye kitna rashan kafi hota hai?', ur: 'How much rashan is typically needed for a family of 4 to 5 people?',
    },
    answer: {
      en: 'For an average urban Pakistani family of 4–5 members, typical monthly quantities include: 20 kg whole wheat atta, 5 kg basmati rice, 5 liters cooking oil or banaspati ghee, 4–5 kg sugar, 4 kg mixed pulses (daalein), 900g tea leaves, and 2–3 dozen eggs, along with household detergents and spices.', romanUrdu: '4-5 afrad k liye aam tor par mahana 20 kilo chakki atta, 5 kilo basmati chawal, 5 liter cooking oil ya ghee, 4-5 kilo cheeni, 4 kilo mukhtalif daalein, aur 900g chai patti kafi hoti hai.', ur: 'For an average urban Pakistani family of 4–5 members, typical monthly quantities include: 20 kg whole wheat atta, 5 kg basmati rice, 5 liters cooking oil or banaspati ghee, 4–5 kg sugar, 4 kg mixed pulses (daalein), 900g tea leaves, and 2–3 dozen eggs, along with household detergents and spices.',
    },
  },
  {
    id: 'how-yaad-helps-rashan',
    question: {
      en: 'How does YAAD make monthly rashan shopping faster and organized?', romanUrdu: 'YAAD app mahana rashan ki shopping ko kaise asaan banati hai?', ur: 'How does YAAD make monthly rashan shopping faster and organized?',
    },
    answer: {
      en: 'YAAD eliminates handwritten paper notes and forgotten items by automatically organizing your rashan into smart categories (Grains, Pulses, Spices, Dairy, Cleaning). You can type items colloquially in Roman Urdu ("daal chana aik kilo") or Urdu script, check them off as you shop, and rely on 100% offline access inside concrete bazaars.', romanUrdu: 'YAAD aapki rashan list ko khud-ba-khud aisles aur categories mein sort karti hai. Aap Roman Urdu mein type kar sakte hain, offline market mein check-off kar sakte hain, aur koi zaroori masala ya cheez nahi bhooltay.', ur: 'YAAD eliminates handwritten paper notes and forgotten items by automatically organizing your rashan into smart categories (Grains, Pulses, Spices, Dairy, Cleaning). You can type items colloquially in Roman Urdu ("daal chana aik kilo") or Urdu script, check them off as you shop, and rely on 100% offline access inside concrete bazaars.',
    },
  },
  {
    id: 'difference-pao-kilo',
    question: {
      en: 'What is the difference between a Pao, Chattank, and Kilo in Pakistani markets?', romanUrdu: 'Pao aur Kilo mein kya farq hota hai?', ur: 'What is the difference between a Pao, Chattank, and Kilo in Pakistani markets?',
    },
    answer: {
      en: 'In Pakistan, 1 Kilo is 1,000 grams. A "Pao" is exactly one-quarter of a kilo, meaning 250 grams. "Adha Kilo" is 500 grams (half a kilo), and "Dhari" is 5 kilograms. A traditional "Chattank" is roughly 60 grams, historically used for valuable spices and herbal seeds.', romanUrdu: '1 Kilo = 1,000 grams. 1 Pao = 250 grams (aik kilo ka choutha hissa). 2 Pao = Adha Kilo (500 grams). 1 Dhari = 5 kilo.', ur: 'In Pakistan, 1 Kilo is 1,000 grams. A "Pao" is exactly one-quarter of a kilo, meaning 250 grams. "Adha Kilo" is 500 grams (half a kilo), and "Dhari" is 5 kilograms. A traditional "Chattank" is roughly 60 grams, historically used for valuable spices and herbal seeds.',
    },
  },
  {
    id: 'offline-market-usage',
    question: {
      en: 'Can I view and check off my rashan list when the kiryana store has zero mobile signal?', romanUrdu: 'Kya internet na honay par bhi YAAD mein rashan list chal sakti hai?', ur: 'Can I view and check off my rashan list when the kiryana store has zero mobile signal?',
    },
    answer: {
      en: 'Yes. YAAD is built with an offline-first local database (IndexedDB). Your rashan lists load instantaneously even in underground supermarkets, crowded bazaars, or during mobile network outages with zero internet connection.', romanUrdu: 'Jee haan! YAAD mukammal tor par offline kaam karti hai. Bazaaron aur underground supermarkets mein baghair cellular data k aap apni list dekh aur tick kar sakte hain.', ur: 'Yes. YAAD is built with an offline-first local database (IndexedDB). Your rashan lists load instantaneously even in underground supermarkets, crowded bazaars, or during mobile network outages with zero internet connection.',
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
      en: 'Small Family', romanUrdu: 'Chota Gharana', ur: 'Small Family',
    },
    persons: '2–3 Persons',
    multiplier: 0.6,
  },
  {
    id: 'medium',
    label: {
      en: 'Standard Family', romanUrdu: 'Darmyana Gharana', ur: 'Standard Family',
    },
    persons: '4–6 Persons',
    multiplier: 1.0,
  },
  {
    id: 'joint',
    label: {
      en: 'Joint Family', romanUrdu: 'Joint / Bara Gharana', ur: 'Joint Family',
    },
    persons: '7+ Persons',
    multiplier: 1.8,
  },
];
