export type LegalPageType = 'terms' | 'privacy' | 'about' | 'help' | 'legal' | 'blog';

export interface BlogPost {
  id: string;
  slug: string;
  category: { en: string; romanUrdu: string; ur: string };
  title: { en: string; romanUrdu: string; ur: string };
  summary: { en: string; romanUrdu: string; ur: string };
  readTime: string;
  publishDate: string;
  content: {
    en: string[];
    romanUrdu: string[];
    ur: string[];
  };
}

export interface LegalSection {
  id: string;
  title: {
    en: string;
    romanUrdu: string;
    ur: string;
  };
  content: {
    en: string[];
    romanUrdu: string[];
    ur: string[];
  };
}

export interface FAQItem {
  id: string;
  category: 'general' | 'offline' | 'security' | 'language';
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

export const LEGAL_METADATA: Record<
  LegalPageType,
  {
    path: string;
    badge: string;
    title: { en: string; romanUrdu: string; ur: string };
    subtitle: { en: string; romanUrdu: string; ur: string };
    lastUpdated: string;
  }
> = {
  terms: {
    path: '/terms',
    badge: 'Legal Terms',
    title: {
      en: 'Terms & Conditions',
      romanUrdu: 'Terms & Conditions (Sharaait)',
      ur: 'Terms & Conditions',
    },
    subtitle: {
      en: 'Clear, straightforward terms regarding your use of YAAD Smart Shopping Memory.',
      romanUrdu: 'YAAD app istemal karne ki aasan aur wazeh sharaait.',
      ur: 'Clear, straightforward terms regarding your use of YAAD Smart Shopping Memory.',
    },
    lastUpdated: 'September 2026',
  },
  privacy: {
    path: '/privacy',
    badge: 'Privacy & Security',
    title: {
      en: 'Privacy Policy',
      romanUrdu: 'Privacy Policy (Raazdari)',
      ur: 'Privacy Policy',
    },
    subtitle: {
      en: 'How we safeguard your shopping lists, account credentials, and offline data.',
      romanUrdu: 'Aapki shopping lists, account aur data ko mehfooz rakhne ki policy.',
      ur: 'How we safeguard your shopping lists, account credentials, and offline data.',
    },
    lastUpdated: 'September 2026',
  },
  about: {
    path: '/about',
    badge: 'Our Story & Mission',
    title: {
      en: 'About YAAD',
      romanUrdu: 'YAAD K Baaray Mein',
      ur: 'About YAAD',
    },
    subtitle: {
      en: 'The story, craftsmanship, and bilingual intelligence behind your daily shopping memory.',
      romanUrdu: 'YAAD app ki kahani, bilingual intelligence aur maqsad.',
      ur: 'The story, craftsmanship, and bilingual intelligence behind your daily shopping memory.',
    },
    lastUpdated: 'September 2026',
  },
  help: {
    path: '/help',
    badge: 'Help & FAQ',
    title: {
      en: 'Help & Support',
      romanUrdu: 'Madad Aur Support',
      ur: 'Help & Support',
    },
    subtitle: {
      en: 'Frequently asked questions, troubleshooting tips, and direct contact with our team.',
      romanUrdu: 'Aam sawalat k jawabat aur hamari team se rabtay ki maloomat.',
      ur: 'Frequently asked questions, troubleshooting tips, and direct contact with our team.',
    },
    lastUpdated: 'September 2026',
  },
  legal: {
    path: '/legal',
    badge: 'Information Hub',
    title: {
      en: 'Legal & Information Hub',
      romanUrdu: 'Legal & Info Hub',
      ur: 'Legal & Information Hub',
    },
    subtitle: {
      en: 'Quick access to all YAAD policies, company information, and support channels.',
      romanUrdu: 'YAAD ki tamam policies aur maloomati safhaat ka markaz.',
      ur: 'Quick access to all YAAD policies, company information, and support channels.',
    },
    lastUpdated: 'September 2026',
  },
  blog: {
    path: '/blog',
    badge: 'Articles & Guides',
    title: {
      en: 'YAAD Blog & Guides',
      romanUrdu: 'YAAD Blog Aur Guides',
      ur: 'YAAD Blog & Guides',
    },
    subtitle: {
      en: 'Smart shopping strategies, monthly rashan planning, and everyday grocery tips for Pakistani homes.',
      romanUrdu: 'Gharelu rashan, smart shopping aur budget bachane k mufeed mashwaray.',
      ur: 'Smart shopping strategies, monthly rashan planning, and everyday grocery tips for Pakistani homes.',
    },
    lastUpdated: 'September 2026',
  },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'monthly-rashan-guide',
    slug: 'monthly-rashan-guide-pakistan',
    category: {
      en: 'Grocery Budgeting',
      romanUrdu: 'Budgeting & Rashan',
      ur: 'Grocery Budgeting',
    },
    title: {
      en: '5 Smart Ways to Plan Monthly Rashan Without Overspending',
      romanUrdu: 'Mahana Rashan Ki Planning: Budget Bachane K 5 Asan Tareeqay',
      ur: '5 Smart Ways to Plan Monthly Rashan Without Overspending',
    },
    summary: {
      en: 'How writing down a structured checklist beforehand saves Pakistani families thousands of rupees every month.',
      romanUrdu: 'Pehle se list bana kar dukaan jaane se rashan par har maah hazaron rupay kaisay bachtay hain.',
      ur: 'How writing down a structured checklist beforehand saves Pakistani families thousands of rupees every month.',
    },
    readTime: '3 min read',
    publishDate: 'September 2026',
    content: {
      en: [
        'Every household faces the challenge of rising prices and forgotten essentials at the local store. When you enter a kiryana shop without an itemized checklist, unplanned impulse buys quickly inflate your monthly bill.',
        '1. Audit your pantry before making the list: Check leftover spices, oil, and staples like lentils before writing down new quantities.',
        '2. Separate staples from perishables: Buy grains and oil in bulk (10kg or 5kg sacks), but get vegetables and dairy weekly to ensure freshness.',
        '3. Use native units accurately: Confusing 1 Pao (250g) with half kilo leads to food waste. YAAD supports traditional local units natively.',
        '4. Tick off items as they go into the basket: Having a real-time strike-through list prevents running back to the market later for salt or tea bags.',
      ],
      romanUrdu: [
        'Kiryana shop par baghair list k jaane se hamesha extra kharcha ho jata hai aur zaroori cheezein bhool jati hain.',
        '1. Pehle ghar ki kitchen pantry check karein taakay pata chalay kon sa aatta, daalein ya masalay pehle se mojood hain.',
        '2. Mahana staples (aatta, tail, ghee) ko alag rakhein aur sabzi/doodh ko weekly schedule par karein.',
        '3. Páo aur kilo k paimanon ka sahi hisab rakhein taakay zaroorat k mutabiq cheez khareedi jaye.',
        '4. Dukaan par item basket mein daalte hi YAAD app par check-off karein taakay kuch reh na jaye.',
      ],
      ur: [
        'Every household faces the challenge of rising prices and forgotten essentials at the local store. When you enter a kiryana shop without an itemized checklist, unplanned impulse buys quickly inflate your monthly bill.',
        '1. Audit your pantry before making the list: Check leftover spices, oil, and staples like lentils before writing down new quantities.',
        '2. Separate staples from perishables: Buy grains and oil in bulk (10kg or 5kg sacks), but get vegetables and dairy weekly to ensure freshness.',
        '3. Use native units accurately: Confusing 1 Pao (250g) with half kilo leads to food waste. YAAD supports traditional local units natively.',
        '4. Tick off items as they go into the basket: Having a real-time strike-through list prevents running back to the market later for salt or tea bags.',
      ],
    },
  },
  {
    id: 'local-units-demystified',
    slug: 'pakistani-grocery-units-guide',
    category: {
      en: 'Local Culture & Weights',
      romanUrdu: 'Paimany & Units',
      ur: 'Local Culture & Weights',
    },
    title: {
      en: 'Understanding Pakistani Grocery Units: Pao, Ser, and Dharri',
      romanUrdu: 'Pakistani Units: Páo, Kilo Aur Dharri Ka Sahi Hisab',
      ur: 'Understanding Pakistani Grocery Units: Pao, Ser, and Dharri',
    },
    summary: {
      en: 'A handy quick-reference conversion guide for everyday Pakistani grocery shoppers and market visits.',
      romanUrdu: 'Dukaan par khareedari k liye Pakistani paimanon ki asaan tafseel aur conversion guide.',
      ur: 'A handy quick-reference conversion guide for everyday Pakistani grocery shoppers and market visits.',
    },
    readTime: '4 min read',
    publishDate: 'September 2026',
    content: {
      en: [
        'Modern smartphones often show generic international units like ounces or pounds, while Pakistani shopkeepers and sabzi vendors exclusively use Pao, Dharri, and Dozen.',
        '1 Pao = 250 grams (1/4 of a kilogram). Standard for ginger, garlic, cardamoms, and whole spices.',
        '1 Dharri = 5 kilograms. Used commonly in vegetable markets (Mandi) for potatoes, onions, and tomatoes.',
        '1 Dozen = 12 units. The universal standard for bananas and eggs.',
        'YAAD lets you choose these exact traditional units with one tap, matching your local shopping speech naturally.',
      ],
      romanUrdu: [
        'Hamare Pakistani bazaron mein pound ya ounce nahi chaltay, balke Páo, Kilo aur Dharri boli jati hai.',
        '1 Páo = 250 grams (yani kilo ka chotha hissa). Adrak, lehsan aur masalon k liye istemal hota hai.',
        '1 Dharri = 5 Kilograms. Sabzi mandi mein aaloo aur pyaz k liye dharri boli jati hai.',
        '1 Darjan = 12 adad. Andon aur kelon ki khareedari ka aam paimana.',
        'YAAD app in tamam rawaiti paimanon ko natively support karti hai.',
      ],
      ur: [
        'Modern smartphones often show generic international units like ounces or pounds, while Pakistani shopkeepers and sabzi vendors exclusively use Pao, Dharri, and Dozen.',
        '1 Pao = 250 grams (1/4 of a kilogram). Standard for ginger, garlic, cardamoms, and whole spices.',
        '1 Dharri = 5 kilograms. Used commonly in vegetable markets (Mandi) for potatoes, onions, and tomatoes.',
        '1 Dozen = 12 units. The universal standard for bananas and eggs.',
        'YAAD lets you choose these exact traditional units with one tap, matching your local shopping speech naturally.',
      ],
    },
  },
  {
    id: 'offline-shopping-memory',
    slug: 'offline-smart-shopping-in-basement-markets',
    category: {
      en: 'Product & Tech',
      romanUrdu: 'Offline Intelligence',
      ur: 'Product & Tech',
    },
    title: {
      en: 'Why Offline-First Memory Matters in Crowded Pakistani Bazaars',
      romanUrdu: 'Bazaron Mein Net Na Chalnay Par YAAD Kaisay Madad Karti Hai',
      ur: 'Why Offline-First Memory Matters in Crowded Pakistani Bazaars',
    },
    summary: {
      en: 'Never get stranded at the checkout line due to poor 4G signals. YAAD works completely offline.',
      romanUrdu: 'Basement shops ya crowded bazaron mein baghair internet k shopping list dekhnay aur tick karnay ki sahoolat.',
      ur: 'Never get stranded at the checkout line due to poor 4G signals. YAAD works completely offline.',
    },
    readTime: '3 min read',
    publishDate: 'September 2026',
    content: {
      en: [
        'Pakistani supermarkets and basement kiryana stores are infamous for weak cell reception. A cloud-only grocery app often spins endlessly while you stand at the counter.',
        'YAAD stores your entire shopping database directly inside your device memory (IndexedDB).',
        'You can create lists, add quantities, and mark items off without any active internet connection.',
        'As soon as your phone reconnects to Wi-Fi or mobile data, your changes safely sync with your Google account in the background.',
      ],
      romanUrdu: [
        'Aksar super stores ya basement kiryana dukano mein mobile internet signals drop ho jatay hain.',
        'YAAD app aapki list ko aap k phone k local database mein mehfooz rakhti hai.',
        'Aap baghair kisi internet connection k items check-off kar saktay hain.',
        'Jab bhi mobile internet dobara connect hoga, aapka data automatically Google account k sath sync ho jayega.',
      ],
      ur: [
        'Pakistani supermarkets and basement kiryana stores are infamous for weak cell reception. A cloud-only grocery app often spins endlessly while you stand at the counter.',
        'YAAD stores your entire shopping database directly inside your device memory (IndexedDB).',
        'You can create lists, add quantities, and mark items off without any active internet connection.',
        'As soon as your phone reconnects to Wi-Fi or mobile data, your changes safely sync with your Google account in the background.',
      ],
    },
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: {
      en: '1. Acceptance of Terms',
      romanUrdu: '1. Sharaait Ki Qubooliyat',
      ur: '1. Acceptance of Terms',
    },
    content: {
      en: [
        'By accessing, registering for, or using the YAAD application ("YAAD", "the Service", "we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our application.',
        'These terms apply to all visitors, registered users, and others who access or use the application via web browser, Progressive Web App (PWA), or mobile device.',
      ],
      romanUrdu: [
        'YAAD application istemal kar k ya is par account bana kar aap in tamam Terms & Conditions ko qubool karte hain. Agar aapko koi bhi shart manzoor nahi to aap is app ko istemal na karein.',
        'Yeh sharaait tamam aam users, registered accounts aur browser ya PWA k zariye app istemal karne walon par laagu hoti hain.',
      ],
      ur: [
        'By accessing, registering for, or using the YAAD application ("YAAD", "the Service", "we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our application.',
        'These terms apply to all visitors, registered users, and others who access or use the application via web browser, Progressive Web App (PWA), or mobile device.',
      ],
    },
  },
  {
    id: 'service-desc',
    title: {
      en: '2. The YAAD Service & Offline Capabilities',
      romanUrdu: '2. YAAD Service Aur Offline Sahoolat',
      ur: '2. The YAAD Service & Offline Capabilities',
    },
    content: {
      en: [
        'YAAD is designed as a smart shopping list and grocery memory utility. Key features include local-first list creation, smart bilingual auto-categorization (English, Roman Urdu, and Urdu), smart unit parsing, restock recommendations, and cross-device synchronization.',
        'YAAD is built with an offline-first architecture. When internet connectivity is unavailable (such as inside basement supermarket aisles), lists remain fully accessible and editable on your device using client-side IndexedDB storage. Syncing resumes automatically once online connectivity is restored.',
      ],
      romanUrdu: [
        'YAAD aik smart shopping list aur grocery memory app hai. Is mein shopping lists banana, English aur Urdu/Roman Urdu mein ashyan ki pehchan, quantity tracking aur mukhtalif devices par sync ki sahoolat shamil hai.',
        'YAAD offline-first technology par kaam karti hai. Agar supermarket mein internet signal na ho, tab bhi aapki lists phone mein chalti hain aur dobara net aane par khud ba khud sync ho jati hain.',
      ],
      ur: [
        'YAAD is designed as a smart shopping list and grocery memory utility. Key features include local-first list creation, smart bilingual auto-categorization (English, Roman Urdu, and Urdu), smart unit parsing, restock recommendations, and cross-device synchronization.',
        'YAAD is built with an offline-first architecture. When internet connectivity is unavailable (such as inside basement supermarket aisles), lists remain fully accessible and editable on your device using client-side IndexedDB storage. Syncing resumes automatically once online connectivity is restored.',
      ],
    },
  },
  {
    id: 'accounts',
    title: {
      en: '3. User Accounts, Phone Verification, & Passkeys',
      romanUrdu: '3. User Account, Phone Aur Passkeys',
      ur: '3. User Accounts, Phone Verification, & Passkeys',
    },
    content: {
      en: [
        'To synchronize shopping lists across multiple devices, users create an account using email, verified phone number, Google OAuth, or FIDO2/WebAuthn Passkeys.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. If you suspect unauthorized access, notify us immediately at yaadapppk@gmail.com.',
        'We reserve the right to suspend or terminate accounts that provide fraudulent information or violate security integrity.',
      ],
      romanUrdu: [
        'Apni shopping lists ko mukhtalif phones par sync karne k liye aap email, verified phone number, Google ya Passkey ke zariye account banate hain.',
        'Apne account aur password ki hifazat aapki zimadari hai. Agar aapko shak ho k kisi ne aapka account khola hai to foran yaadapppk@gmail.com par rabta karein.',
        'Ghalat ya jaali maloomat faraham karne walay accounts ko band karne ka haq mehfooz hai.',
      ],
      ur: [
        'To synchronize shopping lists across multiple devices, users create an account using email, verified phone number, Google OAuth, or FIDO2/WebAuthn Passkeys.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. If you suspect unauthorized access, notify us immediately at yaadapppk@gmail.com.',
        'We reserve the right to suspend or terminate accounts that provide fraudulent information or violate security integrity.',
      ],
    },
  },
  {
    id: 'content-ownership',
    title: {
      en: '4. User Content & Data Ownership',
      romanUrdu: '4. User Ka Data Aur Milkiyat',
      ur: '4. User Content & Data Ownership',
    },
    content: {
      en: [
        'You retain 100% ownership and copyright over the shopping lists, notes, and items you create in YAAD. We claim no ownership over your personal grocery choices.',
        'You grant YAAD only the limited license necessary to store, transmit, format, and display your data to provide you with the application service.',
        'You have the right at any time to delete individual shopping lists or permanently delete your entire account and associated records via the Settings screen.',
      ],
      romanUrdu: [
        'Aapki shopping lists, items aur notes par 100% aapka haq aur milkiyat hai. Ham aapke zaati grocery data par koi daawa nahi karte.',
        'Aap sirf app chalane aur data sync karne ki hadd tak hamein data process karne ki ijazat dete hain.',
        'Aap jab chahein Settings mein ja kar apni lists ya apna poora account hamesha k liye delete kar sakte hain.',
      ],
      ur: [
        'You retain 100% ownership and copyright over the shopping lists, notes, and items you create in YAAD. We claim no ownership over your personal grocery choices.',
        'You grant YAAD only the limited license necessary to store, transmit, format, and display your data to provide you with the application service.',
        'You have the right at any time to delete individual shopping lists or permanently delete your entire account and associated records via the Settings screen.',
      ],
    },
  },
  {
    id: 'acceptable-use',
    title: {
      en: '5. Acceptable Use Policy',
      romanUrdu: '5. Istemal K Qawaneen',
      ur: '5. Acceptable Use Policy',
    },
    content: {
      en: [
        'You agree to use YAAD solely for lawful personal or household shopping management purposes. You agree not to attempt to reverse engineer the application, abuse API endpoints, launch denial of service attacks, or interfere with other users.',
        'Automated scraping, bulk spamming, or exploitation of the server recognition infrastructure is strictly prohibited.',
      ],
      romanUrdu: [
        'Aap YAAD ko sirf qanooni aur gharelu shopping k maqasid k liye istemal karne k paband hain. App k system ko nuqsan pohanchana ya ghalat istemal karna mana hai.',
        'Automated scraping ya servers par be-ja bojh daalna sakhti se mana hai.',
      ],
      ur: [
        'You agree to use YAAD solely for lawful personal or household shopping management purposes. You agree not to attempt to reverse engineer the application, abuse API endpoints, launch denial of service attacks, or interfere with other users.',
        'Automated scraping, bulk spamming, or exploitation of the server recognition infrastructure is strictly prohibited.',
      ],
    },
  },
  {
    id: 'disclaimers',
    title: {
      en: '6. Disclaimer of Warranties & Limitation of Liability',
      romanUrdu: '6. Zimadari Ki Hadd Aur Disclaimer',
      ur: '6. Disclaimer of Warranties & Limitation of Liability',
    },
    content: {
      en: [
        'YAAD is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. While we employ rigorous database integrity, automated backups, and offline caching, we cannot guarantee uninterrupted service under all local network conditions.',
        'To the maximum extent permitted by law, YAAD and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the service.',
      ],
      romanUrdu: [
        'YAAD service ko "jaise hai" faraham kiya jata hai. Hum behtareen koshish karte hain k app hamesha chalay aur data mehfooz rahay, lekin internet ya phone kharab hone par nuqsan k zimadar nahi hain.',
        'Qanoon k mutabiq app istemal karne k dauran kisi ghalti ya nuqsan par hamari liability mehdood hai.',
      ],
      ur: [
        'YAAD is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. While we employ rigorous database integrity, automated backups, and offline caching, we cannot guarantee uninterrupted service under all local network conditions.',
        'To the maximum extent permitted by law, YAAD and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the service.',
      ],
    },
  },
  {
    id: 'contact-terms',
    title: {
      en: '7. Amendments & Contact',
      romanUrdu: '7. Tabdeeliyan Aur Rabta',
      ur: '7. Amendments & Contact',
    },
    content: {
      en: [
        'We may revise these Terms & Conditions from time to time. When changes occur, the "Last Updated" date at the top of this page will be refreshed. Continued use of the application constitutes acceptance of any revised terms.',
        'If you have questions regarding these terms, contact us at yaadapppk@gmail.com.',
      ],
      romanUrdu: [
        'Hum in terms mein waqt k sath zaroori tabdeeliyan kar sakte hain. Tabdeeli ki soorat mein Last Updated date update ho jayegi.',
        'Agar aapko in sharaait k baray mein koi sawal ho to yaadapppk@gmail.com par email karein.',
      ],
      ur: [
        'We may revise these Terms & Conditions from time to time. When changes occur, the "Last Updated" date at the top of this page will be refreshed. Continued use of the application constitutes acceptance of any revised terms.',
        'If you have questions regarding these terms, contact us at yaadapppk@gmail.com.',
      ],
    },
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'pledge',
    title: {
      en: '1. Our Privacy Pledge: Zero Data Selling',
      romanUrdu: '1. Hamara Raazdari Ka Waada',
      ur: '1. Our Privacy Pledge: Zero Data Selling',
    },
    content: {
      en: [
        'At YAAD, we respect your privacy as a foundational principle. We do NOT sell, rent, monetize, or broker your personal information or shopping lists to third-party advertisers, data aggregators, or marketing firms.',
        'Your grocery lists, item preferences, and dietary patterns are strictly yours. We monetize through future optional premium utility features, not through your personal habits.',
      ],
      romanUrdu: [
        'YAAD par aapki privacy hamari awaleen tarjeeh hai. Hum aapka data, shopping lists ya zaati maloomat kisi bhi advertising company ya third party ko nahi bechtay.',
        'Aapki shopping lists sirf aapki hain aur kisi marketing k liye istemal nahi hotin.',
      ],
      ur: [
        'At YAAD, we respect your privacy as a foundational principle. We do NOT sell, rent, monetize, or broker your personal information or shopping lists to third-party advertisers, data aggregators, or marketing firms.',
        'Your grocery lists, item preferences, and dietary patterns are strictly yours. We monetize through future optional premium utility features, not through your personal habits.',
      ],
    },
  },
  {
    id: 'collection',
    title: {
      en: '2. Information We Collect',
      romanUrdu: '2. Hum Konsi Maloomat Lete Hain',
      ur: '2. Information We Collect',
    },
    content: {
      en: [
        'Account Information: When creating an account, we collect your email address, chosen display name, optional phone number for SMS verification/recovery, and avatar selection.',
        'Shopping Data: Shopping list titles, items added, checked/completed statuses, quantities, units, and timestamps.',
        'Authentication Security: If you enable WebAuthn Passkeys, we store the public credential ID and public key. Your actual biometric fingerprint or face scan NEVER leaves your local phone or hardware security enclave.',
        'Diagnostic & Network Telemetry: Basic anonymous error logs and online/offline connectivity status to ensure dependable synchronization.',
      ],
      romanUrdu: [
        'Account Data: Account banate waqt aapka email, naam, phone number aur avatar save hota hai.',
        'Shopping Lists: Lists k naam, items, unki tadaad (quantity) aur mukammal hone ki tareekh.',
        'Passkey Data: Agar aap biometric passkey lagayein to sirf public key save hoti hai, aapka fingerprint hamesha aapke phone k andar hi rehta hai.',
        'Technical Logs: App k errors theek karne aur sync behtar karne k liye bunyadi technical logs.',
      ],
      ur: [
        'Account Information: When creating an account, we collect your email address, chosen display name, optional phone number for SMS verification/recovery, and avatar selection.',
        'Shopping Data: Shopping list titles, items added, checked/completed statuses, quantities, units, and timestamps.',
        'Authentication Security: If you enable WebAuthn Passkeys, we store the public credential ID and public key. Your actual biometric fingerprint or face scan NEVER leaves your local phone or hardware security enclave.',
        'Diagnostic & Network Telemetry: Basic anonymous error logs and online/offline connectivity status to ensure dependable synchronization.',
      ],
    },
  },
  {
    id: 'how-we-use',
    title: {
      en: '3. How We Use Your Information',
      romanUrdu: '3. Data Kaise Istemal Hota Hai',
      ur: '3. How We Use Your Information',
    },
    content: {
      en: [
        'To synchronize your grocery lists in real time across all logged-in devices.',
        'To parse raw inputs (e.g., "2kg aloo", "1 packet bread") into normalized categories and quantities using our bilingual smart categorizer.',
        'To provide intelligent restock suggestions based exclusively on your past purchase intervals (calculated privately for your account).',
        'To deliver customer support and account security notifications when requested.',
      ],
      romanUrdu: [
        'Aapki shopping lists ko aapke tamam phones aur devices par sync karne k liye.',
        'Urdu aur English mein likhay gaye items (jaise "2 kilo aloo") ko category aur quantity mein tabdeel karne k liye.',
        'Aapki pichli shopping dekh kar aapko zaroori ashyan ki tajweez dene k liye.',
        'Madad ya password recovery k liye rabta karne k liye.',
      ],
      ur: [
        'To synchronize your grocery lists in real time across all logged-in devices.',
        'To parse raw inputs (e.g., "2kg aloo", "1 packet bread") into normalized categories and quantities using our bilingual smart categorizer.',
        'To provide intelligent restock suggestions based exclusively on your past purchase intervals (calculated privately for your account).',
        'To deliver customer support and account security notifications when requested.',
      ],
    },
  },
  {
    id: 'storage-security',
    title: {
      en: '4. Data Storage, Encryption, & Local Storage',
      romanUrdu: '4. Data Storage Aur Hifazat',
      ur: '4. Data Storage, Encryption, & Local Storage',
    },
    content: {
      en: [
        'Local Storage: YAAD uses IndexedDB and browser CacheStorage on your device to ensure instant loading and 100% offline capability.',
        'Transport Security: All communications between your device and our servers are encrypted using Transport Layer Security (TLS/HTTPS).',
        'Cloud Database: Cloud data is hosted on enterprise-grade Supabase infrastructure with PostgreSQL Row Level Security (RLS) enforcing strict per-user data isolation.',
      ],
      romanUrdu: [
        'Phone Storage: Phone k andar IndexedDB istemal hoti hai taakay bina internet bhi app taizi se chalay.',
        'Online Encryption: Phone aur server k darmiyan tamam data HTTPS/TLS k zariye encrypted hota hai.',
        'Cloud Security: Server par Supabase Row Level Security har user ka data doosre users se bilkul alag aur mehfooz rakhti hai.',
      ],
      ur: [
        'Local Storage: YAAD uses IndexedDB and browser CacheStorage on your device to ensure instant loading and 100% offline capability.',
        'Transport Security: All communications between your device and our servers are encrypted using Transport Layer Security (TLS/HTTPS).',
        'Cloud Database: Cloud data is hosted on enterprise-grade Supabase infrastructure with PostgreSQL Row Level Security (RLS) enforcing strict per-user data isolation.',
      ],
    },
  },
  {
    id: 'rights-deletion',
    title: {
      en: '5. Your Rights & Permanent Account Deletion',
      romanUrdu: '5. Aap K Huqooq Aur Account Deletion',
      ur: '5. Your Rights & Permanent Account Deletion',
    },
    content: {
      en: [
        'You have full control over your data. You may view, edit, or delete any shopping list at any time.',
        'Permanent Deletion: If you decide to stop using YAAD, you can permanently delete your entire account and all associated shopping lists via Settings > Delete Account. Upon confirmation, your lists, purchase histories, credentials, and profile records are immediately and irreversibly purged from our database.',
      ],
      romanUrdu: [
        'Aap apne tamam data par mukammal ikhtiyar rakhte hain. Kisi bhi waqt koi bhi lsit delete kar sakte hain.',
        'Account Khatam Karna: Agar aap YAAD chorna chahein to Settings mein ja kar Delete Account daba kar apna poora record hamesha k liye mita sakte hain.',
      ],
      ur: [
        'You have full control over your data. You may view, edit, or delete any shopping list at any time.',
        'Permanent Deletion: If you decide to stop using YAAD, you can permanently delete your entire account and all associated shopping lists via Settings > Delete Account. Upon confirmation, your lists, purchase histories, credentials, and profile records are immediately and irreversibly purged from our database.',
      ],
    },
  },
  {
    id: 'contact-privacy',
    title: {
      en: '6. Privacy Inquiries',
      romanUrdu: '6. Privacy K Sawalat',
      ur: '6. Privacy Inquiries',
    },
    content: {
      en: [
        'For questions, concerns, or data requests regarding this Privacy Policy, please email our team directly at yaadapppk@gmail.com. We respond to all privacy inquiries within 48 hours.',
      ],
      romanUrdu: [
        'Privacy k baray mein kisi bhi sawal k liye hamari team ko yaadapppk@gmail.com par email karein. Hum 48 ghanton mein jawab dete hain.',
      ],
      ur: [
        'For questions, concerns, or data requests regarding this Privacy Policy, please email our team directly at yaadapppk@gmail.com. We respond to all privacy inquiries within 48 hours.',
      ],
    },
  },
];

export const ABOUT_HIGHLIGHTS = [
  {
    icon: 'languages',
    title: {
      en: 'Native Bilingual Intelligence',
      romanUrdu: 'Bilingual Intelligence',
      ur: 'Native Bilingual Intelligence',
    },
    desc: {
      en: 'Type in English, Roman Urdu ("doodh, aloo, pyaz"), or everyday words ("aloo, doodh"). YAAD recognizes Pakistani kitchen staples and categorizes them automatically.',
      romanUrdu: 'Chahe English likhein ya Roman Urdu ("doodh, aloo, cheeni"), YAAD har item ko foran pehchan kar durust category mein daal deti hai.',
      ur: 'Type in English, Roman Urdu ("doodh, aloo, pyaz"), or everyday words ("aloo, doodh"). YAAD recognizes Pakistani kitchen staples and categorizes them automatically.',
    },
  },
  {
    icon: 'wifi-off',
    title: {
      en: 'Unstoppable Offline First',
      romanUrdu: 'Bina Internet Kaam Kare',
      ur: 'Unstoppable Offline First',
    },
    desc: {
      en: 'Supermarkets are notorious for dead zones. YAAD works completely offline, letting you check off items and create lists anywhere, syncing when reconnected.',
      romanUrdu: 'Supermarket k andar signal na bhi hon to YAAD ruki nahi. Items tick karein, nayi cheezein likhein, net aane par khud sync hogi.',
      ur: 'Supermarkets are notorious for dead zones. YAAD works completely offline, letting you check off items and create lists anywhere, syncing when reconnected.',
    },
  },
  {
    icon: 'shield-check',
    title: {
      en: 'Zero Ad Tracking & Privacy First',
      romanUrdu: '100% Mehfooz Aur Pur-sukoon',
      ur: 'Zero Ad Tracking & Privacy First',
    },
    desc: {
      en: 'No intrusive banner ads, no popups, and no tracking cookies. Your grocery spending habits are never sold to advertisers.',
      romanUrdu: 'Koi tang karne walay ads nahi aur na hi aapka data kisi ko becha jata hai. Sirf saaf suthra aur aasan tajurba.',
      ur: 'No intrusive banner ads, no popups, and no tracking cookies. Your grocery spending habits are never sold to advertisers.',
    },
  },
  {
    icon: 'sparkles',
    title: {
      en: 'Smart Restock Memory',
      romanUrdu: 'Smart Restock Suggestions',
      ur: 'Smart Restock Memory',
    },
    desc: {
      en: 'YAAD gently remembers how often you purchase essentials like milk, cooking oil, and tea, offering one-tap restock chips right when you need them.',
      romanUrdu: 'Doodh, patti ya tail kab khatam ho sakta hai, YAAD aapki shopping dekh kar zaroori cheezein pehle hi suggest kar deti hai.',
      ur: 'YAAD gently remembers how often you purchase essentials like milk, cooking oil, and tea, offering one-tap restock chips right when you need them.',
    },
  },
];

export const FAQS: FAQItem[] = [
  {
    id: 'offline-how',
    category: 'offline',
    question: {
      en: 'How does YAAD work when I have no internet in the store?',
      romanUrdu: 'Dukaan par internet na ho to YAAD kaise kaam karti hai?',
      ur: 'How does YAAD work when I have no internet in the store?',
    },
    answer: {
      en: 'YAAD caches your lists locally on your phone using modern browser storage (IndexedDB). You can tick items, add new items, and adjust quantities completely offline. As soon as your device catches Wi-Fi or cellular data, all changes automatically upload and sync.',
      romanUrdu: 'YAAD aapke phone ki local storage mein data mehfooz rakhti hai. Aap bina net k items check off kar sakte hain aur nayi lists bana sakte hain. Net aate hi sab sync ho jata hai.',
      ur: 'YAAD caches your lists locally on your phone using modern browser storage (IndexedDB). You can tick items, add new items, and adjust quantities completely offline. As soon as your device catches Wi-Fi or cellular data, all changes automatically upload and sync.',
    },
  },
  {
    id: 'language-switch',
    category: 'language',
    question: {
      en: 'Can I write items in Urdu or Roman Urdu?',
      romanUrdu: 'Kya mein Urdu ya Roman Urdu mein items likh sakta hoon?',
      ur: 'Can I write items in Urdu or Roman Urdu?',
    },
    answer: {
      en: 'Yes! YAAD includes a custom catalog trained on over 2,000 Pakistani and international grocery items. You can type "aloo", "doodh", "chawal", "tamatar", or everyday words "aloo", "daal", and YAAD recognizes the item and assigns it to Vegetables, Dairy, or Groceries automatically.',
      romanUrdu: 'Ji haan! YAAD mein 2,000 se zyada grocery items ki dictionary hai. Aap "aloo", "doodh", "chawal" likhein ya Urdu rasm-ul-khat mein likhein, app foran pehchan leti hai.',
      ur: 'Yes! YAAD includes a custom catalog trained on over 2,000 Pakistani and international grocery items. You can type "aloo", "doodh", "chawal", "tamatar", or everyday words "aloo", "daal", and YAAD recognizes the item and assigns it to Vegetables, Dairy, or Groceries automatically.',
    },
  },
  {
    id: 'passkeys-how',
    category: 'security',
    question: {
      en: 'What is a Passkey and why should I use it?',
      romanUrdu: 'Passkey kya hai aur iska kya faida hai?',
      ur: 'What is a Passkey and why should I use it?',
    },
    answer: {
      en: 'Passkeys allow you to sign in instantly using your fingerprint, Face ID, or screen lock. Passkeys are phishing-resistant, require no password to remember, and your biometric scan stays 100% secure on your device.',
      romanUrdu: 'Passkey k zariye aap fingerprint ya Face ID se foran sign in kar sakte hain. Password yaad rakhne ki zaroorat nahi rehti aur yeh nihayat mehfooz hai.',
      ur: 'Passkeys allow you to sign in instantly using your fingerprint, Face ID, or screen lock. Passkeys are phishing-resistant, require no password to remember, and your biometric scan stays 100% secure on your device.',
    },
  },
  {
    id: 'pwa-install',
    category: 'general',
    question: {
      en: 'How do I install YAAD on my iPhone, Android, or Computer?',
      romanUrdu: 'YAAD ko phone ya computer par app ki tarah kaise install karein?',
      ur: 'How do I install YAAD on my iPhone, Android, or Computer?',
    },
    answer: {
      en: 'YAAD is an installable Progressive Web App (PWA). On Android or Chrome, tap the "Install App" button in the menu or address bar. On iPhone/Safari, tap the Share button and select "Add to Home Screen". It then runs just like an App Store app with offline support!',
      romanUrdu: 'Chrome ya Android par menu se "Install App" dabayein. iPhone par Share icon daba kar "Add to Home Screen" karein. App phone ki screen par icon ban jayegi.',
      ur: 'YAAD is an installable Progressive Web App (PWA). On Android or Chrome, tap the "Install App" button in the menu or address bar. On iPhone/Safari, tap the Share button and select "Add to Home Screen". It then runs just like an App Store app with offline support!',
    },
  },
  {
    id: 'delete-account-how',
    category: 'security',
    question: {
      en: 'How do I delete my account and erase all my lists?',
      romanUrdu: 'Apna account aur lists kaise delete karein?',
      ur: 'How do I delete my account and erase all my lists?',
    },
    answer: {
      en: 'Go to Settings > Account > Delete Account. Confirm your request, and all your shopping lists, profile data, and passkeys will be immediately and permanently deleted from our servers.',
      romanUrdu: 'Settings mein jayein aur "Delete Account" par click karein. Tasdeeq karne par aapka tamam data server se foran mita diya jayega.',
      ur: 'Go to Settings > Account > Delete Account. Confirm your request, and all your shopping lists, profile data, and passkeys will be immediately and permanently deleted from our servers.',
    },
  },
];
