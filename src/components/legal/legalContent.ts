export type LegalPageType = 'terms' | 'privacy' | 'about' | 'help' | 'legal' | 'blog' | 'features' | 'how_it_works';

export interface BlogArticleSection {
  heading: { en: string; romanUrdu: string; ur: string };
  paragraphs: { en: string[]; romanUrdu: string[]; ur: string[] };
  bullets?: { en: string[]; romanUrdu: string[]; ur: string[] };
}

export interface BlogCitation {
  claim: string;
  sourceTitle: string;
  sourcePublisher: string;
  sourceUrl?: string;
  citationYear?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  category: { en: string; romanUrdu: string; ur: string };
  title: { en: string; romanUrdu: string; ur: string };
  summary: { en: string; romanUrdu: string; ur: string };
  directAnswer?: { en: string; romanUrdu: string; ur: string };
  readTime: string;
  publishDate: string;
  sections?: BlogArticleSection[];
  citations?: BlogCitation[];
  internalLinks?: { label: string; path: string }[];
  conclusion?: { en: string; romanUrdu: string; ur: string };
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
  features: {
    path: '/features',
    badge: 'Features & Capabilities',
    title: {
      en: 'YAAD Features',
      romanUrdu: 'YAAD Features Aur Khususiyaat',
      ur: 'YAAD Features',
    },
    subtitle: {
      en: 'Explore the bilingual grocery intelligence, instant offline memory, and smart list tools built into YAAD.',
      romanUrdu: 'YAAD ki bilingual grocery intelligence aur offline list tools ki tafseel.',
      ur: 'Explore the bilingual grocery intelligence, instant offline memory, and smart list tools built into YAAD.',
    },
    lastUpdated: 'October 2026',
  },
  how_it_works: {
    path: '/how-it-works',
    badge: 'How It Works',
    title: {
      en: 'See How YAAD Works',
      romanUrdu: 'YAAD Kaise Kaam Karti Hai',
      ur: 'See How YAAD Works',
    },
    subtitle: {
      en: 'A step-by-step walkthrough of planning groceries, auto-categorizing items, and checking off staples in the market.',
      romanUrdu: 'Ghar k rashan aur sauda salaf ki list banane aur market mein istemal karne ka asan tareeqa.',
      ur: 'A step-by-step walkthrough of planning groceries, auto-categorizing items, and checking off staples in the market.',
    },
    lastUpdated: 'October 2026',
  },
};

export { BLOG_POSTS } from './blogArticlesData';

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
      en: '3. User Accounts, Profile Details, & Security',
      romanUrdu: '3. User Account, Profile Aur Security',
      ur: '3. User Accounts, Profile Details, & Security',
    },
    content: {
      en: [
        'To synchronize shopping lists across multiple devices, users create an account using email and password or Google OAuth. You can optionally add a contact phone number and display name in your profile settings.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. If you suspect unauthorized access, notify us immediately at yaadapppk@gmail.com.',
        'We reserve the right to suspend or terminate accounts that provide fraudulent information or violate security integrity.',
      ],
      romanUrdu: [
        'Apni shopping lists ko mukhtalif phones par sync karne k liye aap email aur password ya Google ke zariye account banate hain. Profile settings mein optional phone number aur naam bhi shamil kiya ja sakta hai.',
        'Apne account aur password ki hifazat aapki zimadari hai. Agar aapko shak ho k kisi ne aapka account khola hai to foran yaadapppk@gmail.com par rabta karein.',
        'Ghalat ya jaali maloomat faraham karne walay accounts ko band karne ka haq mehfooz hai.',
      ],
      ur: [
        'To synchronize shopping lists across multiple devices, users create an account using email and password or Google OAuth. You can optionally add a contact phone number and display name in your profile settings.',
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
        'Account Information: When creating an account, we collect your email address, chosen display name, optional phone number for profile contact, and avatar selection.',
        'Shopping Data: Shopping list titles, items added, checked/completed statuses, quantities, units, and timestamps.',
        'Authentication Security: Account passwords are cryptographically hashed and salted. When signing in with Google, authentication tokens are verified securely via Google OAuth without exposing sensitive credentials.',
        'Diagnostic & Network Telemetry: Basic anonymous error logs and online/offline connectivity status to ensure dependable synchronization.',
      ],
      romanUrdu: [
        'Account Data: Account banate waqt aapka email, naam, optional phone number aur avatar save hota hai.',
        'Shopping Lists: Lists k naam, items, unki tadaad (quantity) aur mukammal hone ki tareekh.',
        'Account Security: Passwords ko cryptographic hash k zariye mehfooz banaya jata hai aur Google sign-in k zariye baghair password k mehfooz login hota hai.',
        'Technical Logs: App k errors theek karne aur sync behtar karne k liye bunyadi technical logs.',
      ],
      ur: [
        'Account Information: When creating an account, we collect your email address, chosen display name, optional phone number for profile contact, and avatar selection.',
        'Shopping Data: Shopping list titles, items added, checked/completed statuses, quantities, units, and timestamps.',
        'Authentication Security: Account passwords are cryptographically hashed and salted. When signing in with Google, authentication tokens are verified securely via Google OAuth without exposing sensitive credentials.',
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
    id: 'what-is-yaad',
    category: 'general',
    question: {
      en: 'What is YAAD and who is it designed for?',
      romanUrdu: 'YAAD kya hai aur yeh kin logon k liye banayi gayi hai?',
      ur: 'What is YAAD and who is it designed for?',
    },
    answer: {
      en: 'YAAD is a shopping list and reminder app built for people who regularly shop for groceries, household items, and everyday kitchen essentials. It helps you quickly write down what you need before leaving home and keep track of items while shopping so nothing gets forgotten.',
      romanUrdu: 'YAAD gharelu sauda salaf aur grocery ki list banane aur yaad rakhne ki app hai. Yeh un tamam logon k liye hai jo bazaar ya store se saman khareedte hain aur cheezein bhoolna nahi chahte.',
      ur: 'YAAD is a shopping list and reminder app built for people who regularly shop for groceries, household items, and everyday kitchen essentials. It helps you quickly write down what you need before leaving home and keep track of items while shopping so nothing gets forgotten.',
    },
  },
  {
    id: 'how-yaad-helps',
    category: 'general',
    question: {
      en: 'How does YAAD help me stop forgetting grocery items?',
      romanUrdu: 'YAAD shopping k waqt cheezein bhoolne se kaise bachati hai?',
      ur: 'How does YAAD help me stop forgetting grocery items?',
    },
    answer: {
      en: 'YAAD solves this by providing instant natural language capture, common staple suggestions, automated aisle department sorting, and a 1-tap checklist that works completely offline. You cross off items as they go into your basket, leaving only pending items visible.',
      romanUrdu: 'YAAD mein aap asani se items likh sakte hain, rozmarra k staples ek tap mein add hote hain aur market mein offline rehte hue bhi items ko check-off kar sakte hain taake koi cheez reh na jaye.',
      ur: 'YAAD solves this by providing instant natural language capture, common staple suggestions, automated aisle department sorting, and a 1-tap checklist that works completely offline. You cross off items as they go into your basket, leaving only pending items visible.',
    },
  },
  {
    id: 'multiple-lists',
    category: 'general',
    question: {
      en: 'Can I manage multiple lists for different stores or occasions?',
      romanUrdu: 'Kya alag alag dukano ya trips k liye alag lists ban sakti hain?',
      ur: 'Can I manage multiple lists for different stores or occasions?',
    },
    answer: {
      en: 'Yes. You can create separate lists for weekly local kiryana trips, monthly rashan hauls, bakery runs, or special occasions. Past trips are saved in your personal history archive so you can review purchases or reuse previous lists with one tap.',
      romanUrdu: 'Ji haan! Aap kiryana store, monthly rashan, sabzi mandi ya bakery k liye alag alag lists bana sakte hain aur purani lists ko dubara use bhi kar sakte hain.',
      ur: 'Yes. You can create separate lists for weekly local kiryana trips, monthly rashan hauls, bakery runs, or special occasions. Past trips are saved in your personal history archive so you can review purchases or reuse previous lists with one tap.',
    },
  },
  {
    id: 'pricing-and-privacy',
    category: 'security',
    question: {
      en: 'Is YAAD free to use, and does it show advertisements?',
      romanUrdu: 'Kya YAAD bilkul free hai aur isme ads aate hain?',
      ur: 'Is YAAD free to use, and does it show advertisements?',
    },
    answer: {
      en: 'YAAD is completely free to use. We do not display banner ads, popup interruptions, or tracking pixels. Your lists and shopping habits are stored securely and privately, and we never sell your personal data.',
      romanUrdu: 'YAAD bilkul muft hai. Isme koi commercial ads ya tracking nahi hai. Aapka grocery data mukammal tor par mehfooz aur private rehta hai.',
      ur: 'YAAD is completely free to use. We do not display banner ads, popup interruptions, or tracking pixels. Your lists and shopping habits are stored securely and privately, and we never sell your personal data.',
    },
  },
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
    id: 'account-security-how',
    category: 'security',
    question: {
      en: 'How do I sign in and keep my account secure?',
      romanUrdu: 'YAAD par sign in kaise karein aur account mehfooz kaise rakhein?',
      ur: 'How do I sign in and keep my account secure?',
    },
    answer: {
      en: 'You can sign in securely using Google Sign-In or your email and password. You can also change your password at any time in Settings → Security.',
      romanUrdu: 'Aap Google Sign-In ya email aur password k zariye aasani se sign in kar sakte hain. Password tabdeel karne k liye Settings → Security mein jayein.',
      ur: 'You can sign in securely using Google Sign-In or your email and password. You can also change your password at any time in Settings → Security.',
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
      en: 'Go to Settings > Account > Delete Account. Confirm your request, and all your shopping lists and profile data will be immediately and permanently deleted from our servers.',
      romanUrdu: 'Settings mein jayein aur "Delete Account" par click karein. Tasdeeq karne par aapka tamam data server se foran mita diya jayega.',
      ur: 'Go to Settings > Account > Delete Account. Confirm your request, and all your shopping lists and profile data will be immediately and permanently deleted from our servers.',
    },
  },
];

export interface FeatureItem {
  id: string;
  iconName: string;
  badge: { en: string; romanUrdu: string; ur: string };
  title: { en: string; romanUrdu: string; ur: string };
  description: { en: string; romanUrdu: string; ur: string };
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: 'bilingual-ai',
    iconName: 'languages',
    badge: { en: 'Bilingual Engine', romanUrdu: 'Bilingual Engine', ur: 'Bilingual Engine' },
    title: {
      en: 'Bilingual Urdu & English Grocery Recognition',
      romanUrdu: 'Urdu & English Sauda Salaf Recognition',
      ur: 'Bilingual Urdu & English Grocery Recognition',
    },
    description: {
      en: 'Type natural kitchen staples in English, Nastaliq Urdu, or Roman Urdu (like "cheeni", "doodh", "dahi", "aloo"). YAAD recognizes items instantly and categorizes them automatically.',
      romanUrdu: 'English ya Roman Urdu mein likhein jaise doodh, dahi, pyaz, chawal. YAAD foran samajh kar category mein daal deti hai.',
      ur: 'Type natural kitchen staples in English, Nastaliq Urdu, or Roman Urdu (like "cheeni", "doodh", "dahi", "aloo"). YAAD recognizes items instantly and categorizes them automatically.',
    },
  },
  {
    id: 'offline-first',
    iconName: 'wifiOff',
    badge: { en: 'Zero Internet Needed', romanUrdu: 'Offline Kaam', ur: 'Zero Internet Needed' },
    title: {
      en: '100% Offline-First Memory Engine',
      romanUrdu: 'Baghair Internet List Ka Istemal',
      ur: '100% Offline-First Memory Engine',
    },
    description: {
      en: 'Every item is stored safely in your device local IndexedDB. Even in basement markets, concrete superstores, or load-shedding zones with zero reception, your list stays fast and accessible.',
      romanUrdu: 'Basement bazaar ya kamzor signal mein bhi aapki list foran khulti hai. Tamam data phone k IndexedDB mein mehfooz rehta hai.',
      ur: 'Every item is stored safely in your device local IndexedDB. Even in basement markets, concrete superstores, or load-shedding zones with zero reception, your list stays fast and accessible.',
    },
  },
  {
    id: 'pakistani-units',
    iconName: 'scale',
    badge: { en: 'Local Measurements', romanUrdu: 'Desi Paimane', ur: 'Local Measurements' },
    title: {
      en: 'Pakistani Weights & Grocery Units',
      romanUrdu: 'Pakistani Paimane (Kg, Darjan, Pao)',
      ur: 'Pakistani Weights & Grocery Units',
    },
    description: {
      en: 'Seamlessly pick units made for Pakistani grocery shopping: kg, grams, pao, darjan (dozens), packets, bundles (gaddi), bottles, and pieces.',
      romanUrdu: 'Asaan Pakistani units chunain: kg, pao, darjan, packet, bundle aur gaddi.',
      ur: 'Seamlessly pick units made for Pakistani grocery shopping: kg, grams, pao, darjan (dozens), packets, bundles (gaddi), bottles, and pieces.',
    },
  },
  {
    id: 'smart-sync',
    iconName: 'database',
    badge: { en: 'Cloud Sync', romanUrdu: 'Cloud Sync', ur: 'Cloud Sync' },
    title: {
      en: 'Instant Cross-Device Sync',
      romanUrdu: 'Household Devices Mein Foran Sync',
      ur: 'Instant Cross-Device Sync',
    },
    description: {
      en: 'Plan your list on your laptop or tablet at home, and pick it up on your phone at the store. Changes sync silently with Supabase database as soon as you have network.',
      romanUrdu: 'Ghar par computer ya tablet par list banayein aur market mein phone par open karein. Cloud sync k sath har tabdeeli mehfooz rehti hai.',
      ur: 'Plan your list on your laptop or tablet at home, and pick it up on your phone at the store. Changes sync silently with Supabase database as soon as you have network.',
    },
  },
  {
    id: 'one-tap-checklist',
    iconName: 'checkCircle',
    badge: { en: 'Fast Shopping Mode', romanUrdu: 'Aisle Mode', ur: 'Fast Shopping Mode' },
    title: {
      en: 'Aisle Organization & Tap-to-Check Checklist',
      romanUrdu: '1-Tap Checklist Aur Aisle Sorting',
      ur: 'Aisle Organization & Tap-to-Check Checklist',
    },
    description: {
      en: 'Items are cleanly grouped by supermarket department (Dairy, Spices, Vegetables, Household) so you do not have to wander back and forth across store aisles.',
      romanUrdu: 'Saman category k hisaab se arrange hota hai taake market mein baar baar idhar udhar na jana paray.',
      ur: 'Items are cleanly grouped by supermarket department (Dairy, Spices, Vegetables, Household) so you do not have to wander back and forth across store aisles.',
    },
  },
  {
    id: 'privacy-first',
    iconName: 'lock',
    badge: { en: 'No Ads or Tracking', romanUrdu: 'Mukammal Raazdari', ur: 'No Ads or Tracking' },
    title: {
      en: 'Zero Ad-Tracking & Private Data Isolation',
      romanUrdu: 'Zero Ads Aur Mukammal Security',
      ur: 'Zero Ad-Tracking & Private Data Isolation',
    },
    description: {
      en: 'No intrusive popups, no third-party ad pixels, and no selling your shopping data to brokers. Protected with Row Level Security (RLS) and secure authentication.',
      romanUrdu: 'Koi ads nahi, koi tracking nahi. Aapka shopping data sirf aapka hai aur mukammal secure hai.',
      ur: 'No intrusive popups, no third-party ad pixels, and no selling your shopping data to brokers. Protected with Row Level Security (RLS) and secure authentication.',
    },
  },
];

export interface HowItWorksStep {
  step: number;
  badge: { en: string; romanUrdu: string; ur: string };
  title: { en: string; romanUrdu: string; ur: string };
  description: { en: string; romanUrdu: string; ur: string };
  details: { en: string[]; romanUrdu: string[]; ur: string[] };
}

export const HOW_IT_WORKS_DATA: HowItWorksStep[] = [
  {
    step: 1,
    badge: { en: 'Step 1: Create', romanUrdu: 'Pehla Qadam', ur: 'Step 1: Create' },
    title: {
      en: 'Create Your Shopping List in Seconds',
      romanUrdu: 'Apni Shopping List Ka Naam Dein',
      ur: 'Create Your Shopping List in Seconds',
    },
    description: {
      en: 'Tap New List and name it (e.g. "Weekly Kiryana", "Monthly Rashan", "Baking Supplies").',
      romanUrdu: 'Nayi list banayein aur uska naam rakhein jaise Weekly Kiryana ya Mahana Rashan.',
      ur: 'Tap New List and name it (e.g. "Weekly Kiryana", "Monthly Rashan", "Baking Supplies").',
    },
    details: {
      en: [
        'Organize different trips separately (Supermarket vs Local Kiryana).',
        'Reuse past lists or start completely fresh with one tap.',
      ],
      romanUrdu: [
        'Mukhtalif trips k liye alag alag lists banayein.',
        'Pichli lists ko dubara reuse bhi kar sakte hain.',
      ],
      ur: [
        'Organize different trips separately (Supermarket vs Local Kiryana).',
        'Reuse past lists or start completely fresh with one tap.',
      ],
    },
  },
  {
    step: 2,
    badge: { en: 'Step 2: Add Items', romanUrdu: 'Doosra Qadam', ur: 'Step 2: Add Items' },
    title: {
      en: 'Add Items Naturally in English or Urdu',
      romanUrdu: 'Asaan Zuban Mein Cheezein Likhein',
      ur: 'Add Items Naturally in English or Urdu',
    },
    description: {
      en: 'Type naturally like you would tell a shopkeeper: "Milk 2 litres", "Cheeni 5 kg", or "Eggs 1 dozen".',
      romanUrdu: 'Seedhe alfaaz mein likhein jaise "Milk 2 litres", "Cheeni 5 kg" ya "Anday 1 dozen".',
      ur: 'Type naturally like you would tell a shopkeeper: "Milk 2 litres", "Cheeni 5 kg", or "Eggs 1 dozen".',
    },
    details: {
      en: [
        'Automatic quantity and unit detection saves you typing time.',
        'Frequent essentials suggestions let you tap staples straight into the list.',
      ],
      romanUrdu: [
        'Quantity aur unit khud bakhud pehchan li jati hai.',
        'Aam sauda salaf ko ek click mein list mein shaamil karein.',
      ],
      ur: [
        'Automatic quantity and unit detection saves you typing time.',
        'Frequent essentials suggestions let you tap staples straight into the list.',
      ],
    },
  },
  {
    step: 3,
    badge: { en: 'Step 3: In the Shop', romanUrdu: 'Teesra Qadam', ur: 'Step 3: In the Shop' },
    title: {
      en: 'Shop at the Store & Check Off with 1 Tap',
      romanUrdu: 'Market Mein Saman Check Off Karein',
      ur: 'Shop at the Store & Check Off with 1 Tap',
    },
    description: {
      en: 'Open YAAD at the store. Works 100% offline even if your phone has zero signal or mobile data.',
      romanUrdu: 'Market mein phone open karein aur jo cheez mil jaye uspe tap karein. Internet na bhi ho to chalega.',
      ur: 'Open YAAD at the store. Works 100% offline even if your phone has zero signal or mobile data.',
    },
    details: {
      en: [
        'Checked items move down cleanly so you only see what is left to buy.',
        'Live progress bar shows how much of your grocery shopping is completed.',
      ],
      romanUrdu: [
        'Check ki hui cheezein neeche chali jati hain taake baaqi sauda asani se nazar aaye.',
        'Progress bar se pata chal jata hai kitna shopping mukammal ho gaya.',
      ],
      ur: [
        'Checked items move down cleanly so you only see what is left to buy.',
        'Live progress bar shows how much of your grocery shopping is completed.',
      ],
    },
  },
  {
    step: 4,
    badge: { en: 'Step 4: Memory', romanUrdu: 'Choutha Qadam', ur: 'Step 4: Memory' },
    title: {
      en: 'Finish Trip & Build Your Shopping Memory',
      romanUrdu: 'Trip Mukammal Karein Aur Record Mehfooz Rakhein',
      ur: 'Finish Trip & Build Your Shopping Memory',
    },
    description: {
      en: 'Mark the trip complete. YAAD saves the date, time, and purchased items to your personal history archive.',
      romanUrdu: 'Complete Trip par tap karein. YAAD tareekh aur saman ka record mehfooz kar leti hai.',
      ur: 'Mark the trip complete. YAAD saves the date, time, and purchased items to your personal history archive.',
    },
    details: {
      en: [
        'Review past shopping sessions and track your favorite household staples.',
        'Never guess what you bought last week or how much you paid.',
      ],
      romanUrdu: [
        'Pichle hafton ki khareedari ka hisaab dekhein.',
        'Agle mahine k rashan k liye pura record hamesha haazir rehta hai.',
      ],
      ur: [
        'Review past shopping sessions and track your favorite household staples.',
        'Never guess what you bought last week or how much you paid.',
      ],
    },
  },
];
