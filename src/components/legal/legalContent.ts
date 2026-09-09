export type LegalPageType = 'terms' | 'privacy' | 'about' | 'help' | 'legal';

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
      ur: 'شرائط و ضوابط',
    },
    subtitle: {
      en: 'Clear, straightforward terms regarding your use of YAAD Smart Shopping Memory.',
      romanUrdu: 'YAAD app istemal karne ki aasan aur wazeh sharaait.',
      ur: 'یاد ایپ کے استعمال سے متعلق شفاف اور آسان شرائط و ضوابط۔',
    },
    lastUpdated: 'September 2026',
  },
  privacy: {
    path: '/privacy',
    badge: 'Privacy & Security',
    title: {
      en: 'Privacy Policy',
      romanUrdu: 'Privacy Policy (Raazdari)',
      ur: 'پرائیویسی پالیسی',
    },
    subtitle: {
      en: 'How we safeguard your shopping lists, account credentials, and offline data.',
      romanUrdu: 'Aapki shopping lists, account aur data ko mehfooz rakhne ki policy.',
      ur: 'آپ کی خریداری کی لسٹوں اور ذاتی ڈیٹا کے تحفظ کی مکمل ضمانت۔',
    },
    lastUpdated: 'September 2026',
  },
  about: {
    path: '/about',
    badge: 'Our Story & Mission',
    title: {
      en: 'About YAAD',
      romanUrdu: 'YAAD K Baaray Mein',
      ur: 'یاد ایپ کے بارے میں',
    },
    subtitle: {
      en: 'The story, craftsmanship, and bilingual intelligence behind your daily shopping memory.',
      romanUrdu: 'YAAD app ki kahani, bilingual intelligence aur maqsad.',
      ur: 'یاد ایپ کا مقصد، کہانی اور دو لسانی خصوصیات۔',
    },
    lastUpdated: 'September 2026',
  },
  help: {
    path: '/help',
    badge: 'Help & FAQ',
    title: {
      en: 'Help & Support',
      romanUrdu: 'Madad Aur Support',
      ur: 'مدد اور رہنمائی',
    },
    subtitle: {
      en: 'Frequently asked questions, troubleshooting tips, and direct contact with our team.',
      romanUrdu: 'Aam sawalat k jawabat aur hamari team se rabtay ki maloomat.',
      ur: 'اکثر پوچھے جانے والے سوالات کے جوابات اور سپورٹ ٹیم سے رابطہ۔',
    },
    lastUpdated: 'September 2026',
  },
  legal: {
    path: '/legal',
    badge: 'Information Hub',
    title: {
      en: 'Legal & Information Hub',
      romanUrdu: 'Legal & Info Hub',
      ur: 'معلومات اور قانونی مرکز',
    },
    subtitle: {
      en: 'Quick access to all YAAD policies, company information, and support channels.',
      romanUrdu: 'YAAD ki tamam policies aur maloomati safhaat ka markaz.',
      ur: 'یاد ایپ کی تمام پالیسیز اور وضاحتی صفحات تک آسان رسائی۔',
    },
    lastUpdated: 'September 2026',
  },
};

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: {
      en: '1. Acceptance of Terms',
      romanUrdu: '1. Sharaait Ki Qubooliyat',
      ur: '۱. شرائط کی قبولیت',
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
        'یاد ایپلیکیشن کو استعمال کر کے یا اس پر اکاؤنٹ بنا کر آپ ان تمام شرائط و ضوابط کے پابند ہونے کا اقرار کرتے ہیں۔ اگر آپ ان شرائط سے متفق نہیں ہیں تو براہ کرم ایپلیکیشن استعمال نہ کریں۔',
        'یہ شرائط تمام صارفین، رجسٹرڈ اکاؤنٹس اور براؤزر یا موبائل پی ڈبلیو اے کے ذریعے ایپ استعمال کرنے والے تمام افراد پر لاگو ہوتی ہیں۔',
      ],
    },
  },
  {
    id: 'service-desc',
    title: {
      en: '2. The YAAD Service & Offline Capabilities',
      romanUrdu: '2. YAAD Service Aur Offline Sahoolat',
      ur: '۲. یاد ایپ کی سروس اور آف لائن سہولت',
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
        'یاد ایپ کو ایک سمارٹ شاپنگ لسٹ اور گروسری میموری کے طور پر ڈیزائن کیا گیا ہے۔ اس میں لسٹ بنانا، اردو، رومن اردو اور انگریزی اشیاء کی فوری خودکار پہچان، مقدار کا تعین اور کلاؤڈ سنکنگ شامل ہیں۔',
        'یاد ایپ آف لائن فرسٹ اصول پر بنائی گئی ہے۔ اگر سپر مارکیٹ کے اندر انٹرنیٹ سگنل دستیاب نہ بھی ہوں، تب بھی آپ کی لسٹ مکمل طور پر کام کرتی ہے اور انٹرنیٹ بحال ہوتے ہی خودکار سنک ہو جاتی ہے۔',
      ],
    },
  },
  {
    id: 'accounts',
    title: {
      en: '3. User Accounts, Phone Verification, & Passkeys',
      romanUrdu: '3. User Account, Phone Aur Passkeys',
      ur: '۳. صارف کا اکاؤنٹ، فون نمبر اور پاس کیز',
    },
    content: {
      en: [
        'To synchronize shopping lists across multiple devices, users create an account using email, verified phone number, Google OAuth, or FIDO2/WebAuthn Passkeys.',
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. If you suspect unauthorized access, notify us immediately at useyaadapp@gmail.com.',
        'We reserve the right to suspend or terminate accounts that provide fraudulent information or violate security integrity.',
      ],
      romanUrdu: [
        'Apni shopping lists ko mukhtalif phones par sync karne k liye aap email, verified phone number, Google ya Passkey ke zariye account banate hain.',
        'Apne account aur password ki hifazat aapki zimadari hai. Agar aapko shak ho k kisi ne aapka account khola hai to foran useyaadapp@gmail.com par rabta karein.',
        'Ghalat ya jaali maloomat faraham karne walay accounts ko band karne ka haq mehfooz hai.',
      ],
      ur: [
        'اپنی خریداری کی لسٹوں کو مختلف ڈیوائسز پر سنک کرنے کے لیے صارف ای میل، تصدیق شدہ فون نمبر، گوگل یا بائیو میٹرک پاس کیز کے ذریعے اکاؤنٹ بنا سکتا ہے۔',
        'اپنے اکاؤنٹ کی معلومات اور پاس ورڈ کو خفیہ رکھنا صارف کی ذمہ داری ہے۔ اگر آپ کو کسی غیر مجاز رسائی کا شبہ ہو تو فوری طور پر useyaadapp@gmail.com پر اطلاع دیں۔',
        'غلط یا مشتبہ معلومات فراہم کرنے والے اکاؤنٹس کو معطل یا ختم کرنے کا حق محفوظ ہے۔',
      ],
    },
  },
  {
    id: 'content-ownership',
    title: {
      en: '4. User Content & Data Ownership',
      romanUrdu: '4. User Ka Data Aur Milkiyat',
      ur: '۴. صارف کا ڈیٹا اور لسٹوں کی ملکیت',
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
        'آپ کی بنائی گئی تمام شاپنگ لسٹوں اور نوٹوں کی سو فیصد ملکیت آپ کی اپنی ہے۔ ہم صارف کی لسٹوں پر کسی قسم کی ملکیت کا دعویٰ نہیں کرتے۔',
        'آپ ہمیں صرف اتنا اختیار دیتے ہیں کہ ہم آپ کا ڈیٹا محفوظ کر کے آپ کی مختلف ڈیوائسز تک پہنچا سکیں۔',
        'آپ کسی بھی وقت سیٹنگز اسکرین سے اپنی تمام لسٹیں یا پورا اکاؤنٹ مکمل طور پر ڈیلیٹ کر سکتے ہیں۔',
      ],
    },
  },
  {
    id: 'acceptable-use',
    title: {
      en: '5. Acceptable Use Policy',
      romanUrdu: '5. Istemal K Qawaneen',
      ur: '۵. استعمال کے رہنما اصول',
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
        'آپ یاد ایپ کو صرف جائز اور ذاتی یا گھریلو خریداری کے مقاصد کے لیے استعمال کرنے کے پابند ہیں۔ ایپ کے سسٹم کو نقصان پہنچانے، ہیک کرنے یا غلط استعمال کرنے کی قطعی اجازت نہیں ہے۔',
        'سرورز پر غیر ضروری بوجھ ڈالنا یا خودکار طریقہ کار سے ڈیٹا چرانا سخت منع ہے۔',
      ],
    },
  },
  {
    id: 'disclaimers',
    title: {
      en: '6. Disclaimer of Warranties & Limitation of Liability',
      romanUrdu: '6. Zimadari Ki Hadd Aur Disclaimer',
      ur: '۶. ذمہ داری کی حدود اور وضاحت',
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
        'یاد ایپ کو بغیر کسی غیر معقول ضمانت کے فراہم کیا جاتا ہے۔ اگرچہ ہم مکمل ڈیٹا تحفظ اور بیک اپ فراہم کرتے ہیں، تاہم انٹرنیٹ یا ڈیوائس کے مسائل کی صورت میں ہم کسی غیر متوقع نقصان کے ذمہ دار نہیں ہیں۔',
        'قانون کے مطابق ایپ کے استعمال یا عدم دستیابی کے نتیجے میں ہونے والے کسی بھی بالواسطہ نقصان پر ہماری ذمہ داری محدود ہوگی۔',
      ],
    },
  },
  {
    id: 'contact-terms',
    title: {
      en: '7. Amendments & Contact',
      romanUrdu: '7. Tabdeeliyan Aur Rabta',
      ur: '۷. ترامیم اور رابطہ',
    },
    content: {
      en: [
        'We may revise these Terms & Conditions from time to time. When changes occur, the "Last Updated" date at the top of this page will be refreshed. Continued use of the application constitutes acceptance of any revised terms.',
        'If you have questions regarding these terms, contact us at useyaadapp@gmail.com.',
      ],
      romanUrdu: [
        'Hum in terms mein waqt k sath zaroori tabdeeliyan kar sakte hain. Tabdeeli ki soorat mein Last Updated date update ho jayegi.',
        'Agar aapko in sharaait k baray mein koi sawal ho to useyaadapp@gmail.com par email karein.',
      ],
      ur: [
        'ہم وقتاً فوقتاً ان شرائط میں ترمیم کر سکتے ہیں۔ تبدیلی کی صورت میں صفحہ کے اوپر تاریخ اپ ڈیٹ کر دی جائے گی۔',
        'اگر آپ کے پاس ان شرائط کے حوالے سے کوئی سوال ہے تو useyaadapp@gmail.com پر رابطہ کریں۔',
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
      ur: '۱. ہمارا رازداری کا عہد: ڈیٹا فروخت نہ کرنے کی گارنٹی',
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
        'یاد ایپ میں آپ کی رازداری ہمارے لیے بنیادی حیثیت رکھتی ہے۔ ہم آپ کی ذاتی معلومات یا خریداری کی لسٹیں کسی بھی اشتہاری کمپنی یا تیسرے فریق کو فروخت نہیں کرتے۔',
        'آپ کے گھریلو سودا سلف کی فہرستیں اور عادات مکمل طور پر نجی ہیں اور محفوظ رکھی جاتی ہیں۔',
      ],
    },
  },
  {
    id: 'collection',
    title: {
      en: '2. Information We Collect',
      romanUrdu: '2. Hum Konsi Maloomat Lete Hain',
      ur: '۲. ہم کون سی معلومات اکٹھی کرتے ہیں',
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
        'اکاؤنٹ معلومات: اکاؤنٹ بناتے وقت آپ کا ای میل، نام، فون نمبر اور اواتار محفوظ کیا جاتا ہے۔',
        'شاپنگ ڈیٹا: لسٹوں کے نام، شامل کردہ اشیاء، مقداریں اور مکمل ہونے کا وقت۔',
        'پاس کیز: بائیو میٹرک تصدیق کی صورت میں آپ کے فنگر پرنٹ یا چہرے کا ڈیٹا فون کے اندر ہی رہتا ہے، سرور پر صرف پبلک کی محفوظ ہوتی ہے۔',
        'تکنیکی لاگز: ایپ کی کارکردگی اور سنکنگ کو بہتر بنانے کے لیے بنیادی تکنیکی لاگز۔',
      ],
    },
  },
  {
    id: 'how-we-use',
    title: {
      en: '3. How We Use Your Information',
      romanUrdu: '3. Data Kaise Istemal Hota Hai',
      ur: '۳. ہم آپ کی معلومات کیسے استعمال کرتے ہیں',
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
        'آپ کی خریداری کی لسٹوں کو تمام ڈیوائسز پر فوری سنک رکھنے کے لیے۔',
        'اردو اور انگریزی میں لکھی گئی اشیاء (مثلاً "۲ کلو آلو") کو سمجھ کر درست کیٹیگری میں شامل کرنے کے لیے۔',
        'ماضی کی خریداری کی بنیاد پر آپ کو ضروری اشیاء کی یاد دہانی کرانے کے لیے۔',
        'کسٹمر سپورٹ اور اکاؤنٹ سیکیورٹی کے مقاصد کے لیے۔',
      ],
    },
  },
  {
    id: 'storage-security',
    title: {
      en: '4. Data Storage, Encryption, & Local Storage',
      romanUrdu: '4. Data Storage Aur Hifazat',
      ur: '۴. ڈیٹا اسٹوریج، انکرپشن اور مقامی میموری',
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
        'مقامی اسٹوریج: بغیر انٹرنیٹ کے لسٹوں تک فوری رسائی کے لیے آپ کے براؤزر کی انڈیکسڈ ڈی بی استعمال کی جاتی ہے۔',
        'آن لائن انکرپشن: فون اور سرور کے درمیان ڈیٹا کا تمام تبادلہ جدید ترین سیکیورٹی انکرپشن (TLS/HTTPS) کے تحت ہوتا ہے۔',
        'کلاؤڈ سیکیورٹی: کلاؤڈ ڈیٹا بیس میں ہر صارف کا ڈیٹا الگ الگ اور محفوظ انکرپشن کے ساتھ بند ہوتا ہے۔',
      ],
    },
  },
  {
    id: 'rights-deletion',
    title: {
      en: '5. Your Rights & Permanent Account Deletion',
      romanUrdu: '5. Aap K Huqooq Aur Account Deletion',
      ur: '۵. صارف کے حقوق اور اکاؤنٹ کا مستقل خاتمہ',
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
        'آپ کو اپنے ڈیٹا پر مکمل اختیار حاصل ہے۔ آپ کسی بھی وقت کوئی بھی لسٹ ڈیلیٹ کر سکتے ہیں۔',
        'اکاؤنٹ کا مستقل خاتمہ: اگر آپ یاد ایپ کا اکاؤنٹ ختم کرنا چاہیں تو سیٹنگز میں جا کر "Delete Account" کے ذریعے اپنا تمام ڈیٹا اور لسٹیں فوری طور پر ہمیشہ کے لیے صاف کر سکتے ہیں۔',
      ],
    },
  },
  {
    id: 'contact-privacy',
    title: {
      en: '6. Privacy Inquiries',
      romanUrdu: '6. Privacy K Sawalat',
      ur: '۶. پرائیویسی سے متعلق رابطہ',
    },
    content: {
      en: [
        'For questions, concerns, or data requests regarding this Privacy Policy, please email our team directly at useyaadapp@gmail.com. We respond to all privacy inquiries within 48 hours.',
      ],
      romanUrdu: [
        'Privacy k baray mein kisi bhi sawal k liye hamari team ko useyaadapp@gmail.com par email karein. Hum 48 ghanton mein jawab dete hain.',
      ],
      ur: [
        'پرائیویسی سے متعلق کسی بھی سوال یا رہنمائی کے لیے ہماری ٹیم سے useyaadapp@gmail.com پر رابطہ کریں۔ ہم ۴۸ گھنٹوں کے اندر جواب دیتے ہیں۔',
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
      ur: 'اردو اور انگریزی کی ذہانت',
    },
    desc: {
      en: 'Type in English, Roman Urdu ("doodh, aloo, pyaz"), or pure Urdu ("آلو، دودھ"). YAAD recognizes Pakistani kitchen staples and categorizes them automatically.',
      romanUrdu: 'Chahe English likhein ya Roman Urdu ("doodh, aloo, cheeni"), YAAD har item ko foran pehchan kar durust category mein daal deti hai.',
      ur: 'خواہ انگریزی میں لکھیں یا رومن اردو اور نستعلیق اردو میں، یاد ایپ دیسی سودا سلف اور کچن کی اشیاء کو خود بخود درست کیٹیگری میں ڈالتی ہے۔',
    },
  },
  {
    icon: 'wifi-off',
    title: {
      en: 'Unstoppable Offline First',
      romanUrdu: 'Bina Internet Kaam Kare',
      ur: 'بغیر انٹرنیٹ کے مکمل فعال',
    },
    desc: {
      en: 'Supermarkets are notorious for dead zones. YAAD works completely offline, letting you check off items and create lists anywhere, syncing when reconnected.',
      romanUrdu: 'Supermarket k andar signal na bhi hon to YAAD ruki nahi. Items tick karein, nayi cheezein likhein, net aane par khud sync hogi.',
      ur: 'سپر مارکیٹ کے تہہ خانے میں انٹرنیٹ نہ بھی ہو، یاد ایپ بغیر رکے چلتی ہے۔ انٹرنیٹ بحال ہوتے ہی تمام لسٹیں سنک ہو جاتی ہیں۔',
    },
  },
  {
    icon: 'shield-check',
    title: {
      en: 'Zero Ad Tracking & Privacy First',
      romanUrdu: '100% Mehfooz Aur Pur-sukoon',
      ur: 'مکمل رازداری اور اشتہارات سے پاک',
    },
    desc: {
      en: 'No intrusive banner ads, no popups, and no tracking cookies. Your grocery spending habits are never sold to advertisers.',
      romanUrdu: 'Koi tang karne walay ads nahi aur na hi aapka data kisi ko becha jata hai. Sirf saaf suthra aur aasan tajurba.',
      ur: 'کوئی پریشان کن اشتہارات نہیں اور نہ ہی آپ کا ڈیٹا کسی کو بیچا جاتا ہے۔ صرف ایک پرسکون اور صاف ستھرا تجربہ۔',
    },
  },
  {
    icon: 'sparkles',
    title: {
      en: 'Smart Restock Memory',
      romanUrdu: 'Smart Restock Suggestions',
      ur: 'ضروری اشیاء کی سمارٹ یاد دہانی',
    },
    desc: {
      en: 'YAAD gently remembers how often you purchase essentials like milk, cooking oil, and tea, offering one-tap restock chips right when you need them.',
      romanUrdu: 'Doodh, patti ya tail kab khatam ho sakta hai, YAAD aapki shopping dekh kar zaroori cheezein pehle hi suggest kar deti hai.',
      ur: 'دودھ، چائے کی پتی یا کوکنگ آئل کب ختم ہو سکتا ہے، یاد ایپ وقت پر ایک ہی کلک میں یاد دہانی کراتی ہے۔',
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
      ur: 'دکان پر انٹرنیٹ نہ ہو تو یاد ایپ کیسے کام کرتی ہے؟',
    },
    answer: {
      en: 'YAAD caches your lists locally on your phone using modern browser storage (IndexedDB). You can tick items, add new items, and adjust quantities completely offline. As soon as your device catches Wi-Fi or cellular data, all changes automatically upload and sync.',
      romanUrdu: 'YAAD aapke phone ki local storage mein data mehfooz rakhti hai. Aap bina net k items check off kar sakte hain aur nayi lists bana sakte hain. Net aate hi sab sync ho jata hai.',
      ur: 'یاد ایپ آپ کے فون کی مقامی میموری میں لسٹیں محفوظ رکھتی ہے۔ آپ بغیر انٹرنیٹ کے اشیاء کو ٹک یا شامل کر سکتے ہیں، اور انٹرنیٹ ملتے ہی تمام تبدیلیاں خود بخود کلاؤڈ پر محفوظ ہو جاتی ہیں۔',
    },
  },
  {
    id: 'language-switch',
    category: 'language',
    question: {
      en: 'Can I write items in Urdu or Roman Urdu?',
      romanUrdu: 'Kya mein Urdu ya Roman Urdu mein items likh sakta hoon?',
      ur: 'کیا میں اردو یا رومن اردو میں لسٹ بنا سکتا ہوں؟',
    },
    answer: {
      en: 'Yes! YAAD includes a custom catalog trained on over 2,000 Pakistani and international grocery items. You can type "aloo", "doodh", "chawal", "tamatar", or in Urdu script "آلو", "دال", and YAAD recognizes the item and assigns it to Vegetables, Dairy, or Groceries automatically.',
      romanUrdu: 'Ji haan! YAAD mein 2,000 se zyada grocery items ki dictionary hai. Aap "aloo", "doodh", "chawal" likhein ya Urdu rasm-ul-khat mein likhein, app foran pehchan leti hai.',
      ur: 'جی ہاں! یاد ایپ میں ۲۰۰۰ سے زائد اشیاء کی لغت شامل ہے۔ آپ "آلو"، "دال"، "گوشت" لکھیں یا رومن میں "aloo", "doodh" لکھیں، ایپ فوری طور پر پہچان لیتی ہے۔',
    },
  },
  {
    id: 'passkeys-how',
    category: 'security',
    question: {
      en: 'What is a Passkey and why should I use it?',
      romanUrdu: 'Passkey kya hai aur iska kya faida hai?',
      ur: 'پاس کی کیا ہے اور اس کا کیا فائدہ ہے؟',
    },
    answer: {
      en: 'Passkeys allow you to sign in instantly using your fingerprint, Face ID, or screen lock. Passkeys are phishing-resistant, require no password to remember, and your biometric scan stays 100% secure on your device.',
      romanUrdu: 'Passkey k zariye aap fingerprint ya Face ID se foran sign in kar sakte hain. Password yaad rakhne ki zaroorat nahi rehti aur yeh nihayat mehfooz hai.',
      ur: 'پاس کی کی مدد سے آپ فنگر پرنٹ یا فیس آئی ڈی کے ذریعے فوری سائن ان کر سکتے ہیں۔ پاس ورڈ یاد رکھنے کی ضرورت نہیں رہتی اور یہ انتہائی محفوظ ہے۔',
    },
  },
  {
    id: 'pwa-install',
    category: 'general',
    question: {
      en: 'How do I install YAAD on my iPhone, Android, or Computer?',
      romanUrdu: 'YAAD ko phone ya computer par app ki tarah kaise install karein?',
      ur: 'یاد ایپ کو اپنے فون یا کمپیوٹر پر کیسے انسٹال کریں؟',
    },
    answer: {
      en: 'YAAD is an installable Progressive Web App (PWA). On Android or Chrome, tap the "Install App" button in the menu or address bar. On iPhone/Safari, tap the Share button and select "Add to Home Screen". It then runs just like an App Store app with offline support!',
      romanUrdu: 'Chrome ya Android par menu se "Install App" dabayein. iPhone par Share icon daba kar "Add to Home Screen" karein. App phone ki screen par icon ban jayegi.',
      ur: 'اینڈرائیڈ یا کروم پر مینو سے "Install App" دبائیں۔ آئی فون پر شیئر بٹن دبا کر "Add to Home Screen" منتخب کریں۔ ایپ عام موبائل ایپ کی طرح انسٹال ہو جائے گی۔',
    },
  },
  {
    id: 'delete-account-how',
    category: 'security',
    question: {
      en: 'How do I delete my account and erase all my lists?',
      romanUrdu: 'Apna account aur lists kaise delete karein?',
      ur: 'اپنا اکاؤنٹ اور تمام ڈیٹا کیسے ڈیلیٹ کریں؟',
    },
    answer: {
      en: 'Go to Settings > Account > Delete Account. Confirm your request, and all your shopping lists, profile data, and passkeys will be immediately and permanently deleted from our servers.',
      romanUrdu: 'Settings mein jayein aur "Delete Account" par click karein. Tasdeeq karne par aapka tamam data server se foran mita diya jayega.',
      ur: 'سیٹنگز میں جائیں اور "Delete Account" منتخب کریں۔ تصدیق کے بعد آپ کا تمام ڈیٹا اور لسٹیں فوری طور پر ہمیشہ کے لیے مٹا دی جائیں گی۔',
    },
  },
];
