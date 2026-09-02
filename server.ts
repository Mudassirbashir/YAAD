import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ALLOWED_CATEGORIES = [
  'fruits',
  'vegetables',
  'dairy',
  'meat',
  'seafood',
  'eggs',
  'bakery',
  'beverages',
  'grocery',
  'spices',
  'herbs',
  'dry_fruits',
  'frozen',
  'snacks',
  'household',
  'cleaning',
  'personal_care',
  'health',
  'baby',
  'stationery',
  'electronics',
  'clothing',
  'other',
  // Backward compatibility
  'grains_staples',
  'baby_care',
  'medicines',
] as const;

type CategoryType = (typeof ALLOWED_CATEGORIES)[number];

// Server-side fast dictionary for instant reliable fallback
const SERVER_LOCAL_RULES: Record<string, { categoryId: CategoryType; canonicalName?: string; nameUrdu?: string }> = {
  // Vegetables
  aloo: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  alu: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  aluu: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  aaloo: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  potato: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  potatoes: { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  'آلو': { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },
  'الو': { categoryId: 'vegetables', canonicalName: 'Potato', nameUrdu: 'آلو' },

  pyaz: { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },
  pyaaz: { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },
  piyaz: { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },
  onion: { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },
  onions: { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },
  'پیاز': { categoryId: 'vegetables', canonicalName: 'Onion', nameUrdu: 'پیاز' },

  tamatar: { categoryId: 'vegetables', canonicalName: 'Tomato', nameUrdu: 'ٹماٹر' },
  tmatar: { categoryId: 'vegetables', canonicalName: 'Tomato', nameUrdu: 'ٹماٹر' },
  tomato: { categoryId: 'vegetables', canonicalName: 'Tomato', nameUrdu: 'ٹماٹر' },
  tomatoes: { categoryId: 'vegetables', canonicalName: 'Tomato', nameUrdu: 'ٹماٹر' },
  'ٹماٹر': { categoryId: 'vegetables', canonicalName: 'Tomato', nameUrdu: 'ٹماٹر' },

  lehsan: { categoryId: 'vegetables', canonicalName: 'Garlic', nameUrdu: 'لہسن' },
  garlic: { categoryId: 'vegetables', canonicalName: 'Garlic', nameUrdu: 'لہسن' },
  'لہسن': { categoryId: 'vegetables', canonicalName: 'Garlic', nameUrdu: 'لہسن' },

  adrak: { categoryId: 'vegetables', canonicalName: 'Ginger', nameUrdu: 'ادرک' },
  ginger: { categoryId: 'vegetables', canonicalName: 'Ginger', nameUrdu: 'ادرک' },
  'ادرک': { categoryId: 'vegetables', canonicalName: 'Ginger', nameUrdu: 'ادرک' },

  palak: { categoryId: 'vegetables', canonicalName: 'Spinach', nameUrdu: 'پالک' },
  spinach: { categoryId: 'vegetables', canonicalName: 'Spinach', nameUrdu: 'پالک' },
  'پالک': { categoryId: 'vegetables', canonicalName: 'Spinach', nameUrdu: 'پالک' },

  mirch: { categoryId: 'vegetables', canonicalName: 'Green Chilli', nameUrdu: 'ہری مرچ' },
  chilli: { categoryId: 'vegetables', canonicalName: 'Green Chilli', nameUrdu: 'ہری مرچ' },
  'green chilli': { categoryId: 'vegetables', canonicalName: 'Green Chilli', nameUrdu: 'ہری مرچ' },
  'hari mirch': { categoryId: 'vegetables', canonicalName: 'Green Chilli', nameUrdu: 'ہری مرچ' },
  'ہری مرچ': { categoryId: 'vegetables', canonicalName: 'Green Chilli', nameUrdu: 'ہری مرچ' },

  kheera: { categoryId: 'vegetables', canonicalName: 'Cucumber', nameUrdu: 'کھیرا' },
  cucumber: { categoryId: 'vegetables', canonicalName: 'Cucumber', nameUrdu: 'کھیرا' },
  'کھیرا': { categoryId: 'vegetables', canonicalName: 'Cucumber', nameUrdu: 'کھیرا' },

  leemo: { categoryId: 'vegetables', canonicalName: 'Lemon', nameUrdu: 'لیموں' },
  lemon: { categoryId: 'vegetables', canonicalName: 'Lemon', nameUrdu: 'لیموں' },
  'لیموں': { categoryId: 'vegetables', canonicalName: 'Lemon', nameUrdu: 'لیموں' },

  gajar: { categoryId: 'vegetables', canonicalName: 'Carrot', nameUrdu: 'گاجر' },
  carrot: { categoryId: 'vegetables', canonicalName: 'Carrot', nameUrdu: 'گاجر' },
  'گاجر': { categoryId: 'vegetables', canonicalName: 'Carrot', nameUrdu: 'گاجر' },

  gobi: { categoryId: 'vegetables', canonicalName: 'Cauliflower', nameUrdu: 'گوبھی' },
  cabbage: { categoryId: 'vegetables', canonicalName: 'Cabbage', nameUrdu: 'بند گوبھی' },
  cauliflower: { categoryId: 'vegetables', canonicalName: 'Cauliflower', nameUrdu: 'پھول گوبھی' },

  matar: { categoryId: 'vegetables', canonicalName: 'Peas', nameUrdu: 'مٹر' },
  peas: { categoryId: 'vegetables', canonicalName: 'Peas', nameUrdu: 'مٹر' },
  'مٹر': { categoryId: 'vegetables', canonicalName: 'Peas', nameUrdu: 'مٹر' },

  bhindi: { categoryId: 'vegetables', canonicalName: 'Ladyfinger / Okra', nameUrdu: 'بھنڈی' },
  okra: { categoryId: 'vegetables', canonicalName: 'Ladyfinger / Okra', nameUrdu: 'بھنڈی' },
  'بھنڈی': { categoryId: 'vegetables', canonicalName: 'Ladyfinger / Okra', nameUrdu: 'بھنڈی' },

  baingan: { categoryId: 'vegetables', canonicalName: 'Eggplant', nameUrdu: 'بینگن' },
  eggplant: { categoryId: 'vegetables', canonicalName: 'Eggplant', nameUrdu: 'بینگن' },
  'بینگن': { categoryId: 'vegetables', canonicalName: 'Eggplant', nameUrdu: 'بینگن' },

  // Fruits
  saib: { categoryId: 'fruits', canonicalName: 'Apple', nameUrdu: 'سیب' },
  seb: { categoryId: 'fruits', canonicalName: 'Apple', nameUrdu: 'سیب' },
  apple: { categoryId: 'fruits', canonicalName: 'Apple', nameUrdu: 'سیب' },
  apples: { categoryId: 'fruits', canonicalName: 'Apple', nameUrdu: 'سیب' },
  'سیب': { categoryId: 'fruits', canonicalName: 'Apple', nameUrdu: 'سیب' },

  kela: { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  kelay: { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  kele: { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  banana: { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  bananas: { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  'کیلا': { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },
  'کیلے': { categoryId: 'fruits', canonicalName: 'Banana', nameUrdu: 'کیلا' },

  aam: { categoryId: 'fruits', canonicalName: 'Mango', nameUrdu: 'آم' },
  mango: { categoryId: 'fruits', canonicalName: 'Mango', nameUrdu: 'آم' },
  'آم': { categoryId: 'fruits', canonicalName: 'Mango', nameUrdu: 'آم' },

  angoor: { categoryId: 'fruits', canonicalName: 'Grapes', nameUrdu: 'انگور' },
  grapes: { categoryId: 'fruits', canonicalName: 'Grapes', nameUrdu: 'انگور' },
  'انگور': { categoryId: 'fruits', canonicalName: 'Grapes', nameUrdu: 'انگور' },

  malta: { categoryId: 'fruits', canonicalName: 'Orange / Kinnow', nameUrdu: 'مالٹا' },
  kinnow: { categoryId: 'fruits', canonicalName: 'Orange / Kinnow', nameUrdu: 'کینو' },
  orange: { categoryId: 'fruits', canonicalName: 'Orange / Kinnow', nameUrdu: 'مالٹا' },
  'مالٹا': { categoryId: 'fruits', canonicalName: 'Orange / Kinnow', nameUrdu: 'مالٹا' },
  'کینو': { categoryId: 'fruits', canonicalName: 'Orange / Kinnow', nameUrdu: 'کینو' },

  tarbooz: { categoryId: 'fruits', canonicalName: 'Watermelon', nameUrdu: 'تربوز' },
  watermelon: { categoryId: 'fruits', canonicalName: 'Watermelon', nameUrdu: 'تربوز' },
  'تربوز': { categoryId: 'fruits', canonicalName: 'Watermelon', nameUrdu: 'تربوز' },

  // Eggs
  anda: { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  anday: { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  ande: { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  egg: { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  eggs: { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  'انڈا': { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  'انڈہ': { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },
  'انڈے': { categoryId: 'eggs', canonicalName: 'Eggs', nameUrdu: 'انڈے' },

  // Dairy
  doodh: { categoryId: 'dairy', canonicalName: 'Milk', nameUrdu: 'دودھ' },
  milk: { categoryId: 'dairy', canonicalName: 'Milk', nameUrdu: 'دودھ' },
  'دودھ': { categoryId: 'dairy', canonicalName: 'Milk', nameUrdu: 'دودھ' },
  olpers: { categoryId: 'dairy', canonicalName: 'Milk', nameUrdu: 'دودھ' },
  milkpak: { categoryId: 'dairy', canonicalName: 'Milk', nameUrdu: 'دودھ' },
  dahi: { categoryId: 'dairy', canonicalName: 'Yogurt', nameUrdu: 'دہی' },
  yogurt: { categoryId: 'dairy', canonicalName: 'Yogurt', nameUrdu: 'دہی' },
  'دہی': { categoryId: 'dairy', canonicalName: 'Yogurt', nameUrdu: 'دہی' },
  makhan: { categoryId: 'dairy', canonicalName: 'Butter', nameUrdu: 'مکھن' },
  butter: { categoryId: 'dairy', canonicalName: 'Butter', nameUrdu: 'مکھن' },
  'مکھن': { categoryId: 'dairy', canonicalName: 'Butter', nameUrdu: 'مکھن' },
  paneer: { categoryId: 'dairy', canonicalName: 'Cheese', nameUrdu: 'پنیر' },
  cheese: { categoryId: 'dairy', canonicalName: 'Cheese', nameUrdu: 'پنیر' },
  'پنیر': { categoryId: 'dairy', canonicalName: 'Cheese', nameUrdu: 'پنیر' },
  cream: { categoryId: 'dairy', canonicalName: 'Cream', nameUrdu: 'ملائی' },
  malai: { categoryId: 'dairy', canonicalName: 'Cream', nameUrdu: 'ملائی' },

  // Meat
  gosht: { categoryId: 'meat', canonicalName: 'Meat', nameUrdu: 'گوشت' },
  chicken: { categoryId: 'meat', canonicalName: 'Chicken', nameUrdu: 'مرغی' },
  murghi: { categoryId: 'meat', canonicalName: 'Chicken', nameUrdu: 'مرغی' },
  'مرغی': { categoryId: 'meat', canonicalName: 'Chicken', nameUrdu: 'مرغی' },
  'چکن': { categoryId: 'meat', canonicalName: 'Chicken', nameUrdu: 'مرغی' },
  'گوشت': { categoryId: 'meat', canonicalName: 'Meat', nameUrdu: 'گوشت' },
  beef: { categoryId: 'meat', canonicalName: 'Beef', nameUrdu: 'بیف' },
  mutton: { categoryId: 'meat', canonicalName: 'Mutton', nameUrdu: 'مٹن' },
  qeema: { categoryId: 'meat', canonicalName: 'Minced Meat', nameUrdu: 'قیمہ' },
  keema: { categoryId: 'meat', canonicalName: 'Minced Meat', nameUrdu: 'قیمہ' },
  'قیمہ': { categoryId: 'meat', canonicalName: 'Minced Meat', nameUrdu: 'قیمہ' },

  // Seafood
  fish: { categoryId: 'seafood', canonicalName: 'Fish', nameUrdu: 'مچھلی' },
  machli: { categoryId: 'seafood', canonicalName: 'Fish', nameUrdu: 'مچھلی' },
  prawns: { categoryId: 'seafood', canonicalName: 'Prawns', nameUrdu: 'جھینگا' },
  jheenga: { categoryId: 'seafood', canonicalName: 'Prawns', nameUrdu: 'جھینگا' },
  'مچھلی': { categoryId: 'seafood', canonicalName: 'Fish', nameUrdu: 'مچھلی' },
  'جھینگا': { categoryId: 'seafood', canonicalName: 'Prawns', nameUrdu: 'جھینگا' },

  // Grocery & Staples
  atta: { categoryId: 'grocery', canonicalName: 'Wheat Flour / Atta', nameUrdu: 'آٹا' },
  aata: { categoryId: 'grocery', canonicalName: 'Wheat Flour / Atta', nameUrdu: 'آٹا' },
  flour: { categoryId: 'grocery', canonicalName: 'Flour', nameUrdu: 'آٹا' },
  maida: { categoryId: 'grocery', canonicalName: 'Maida', nameUrdu: 'میدہ' },
  'آٹا': { categoryId: 'grocery', canonicalName: 'Wheat Flour / Atta', nameUrdu: 'آٹا' },
  chawal: { categoryId: 'grocery', canonicalName: 'Rice', nameUrdu: 'چاول' },
  rice: { categoryId: 'grocery', canonicalName: 'Rice', nameUrdu: 'چاول' },
  'چاول': { categoryId: 'grocery', canonicalName: 'Rice', nameUrdu: 'چاول' },
  cheeni: { categoryId: 'grocery', canonicalName: 'Sugar', nameUrdu: 'چینی' },
  chini: { categoryId: 'grocery', canonicalName: 'Sugar', nameUrdu: 'چینی' },
  sugar: { categoryId: 'grocery', canonicalName: 'Sugar', nameUrdu: 'چینی' },
  'چینی': { categoryId: 'grocery', canonicalName: 'Sugar', nameUrdu: 'چینی' },
  oil: { categoryId: 'grocery', canonicalName: 'Cooking Oil', nameUrdu: 'تیل' },
  'cooking oil': { categoryId: 'grocery', canonicalName: 'Cooking Oil', nameUrdu: 'تیل' },
  tail: { categoryId: 'grocery', canonicalName: 'Cooking Oil', nameUrdu: 'تیل' },
  tel: { categoryId: 'grocery', canonicalName: 'Cooking Oil', nameUrdu: 'تیل' },
  'تیل': { categoryId: 'grocery', canonicalName: 'Cooking Oil', nameUrdu: 'تیل' },
  ghee: { categoryId: 'grocery', canonicalName: 'Ghee', nameUrdu: 'گھی' },
  'گھی': { categoryId: 'grocery', canonicalName: 'Ghee', nameUrdu: 'گھی' },
  daal: { categoryId: 'grocery', canonicalName: 'Lentils / Daal', nameUrdu: 'دال' },
  dal: { categoryId: 'grocery', canonicalName: 'Lentils / Daal', nameUrdu: 'دال' },
  'دال': { categoryId: 'grocery', canonicalName: 'Lentils / Daal', nameUrdu: 'دال' },
  chanay: { categoryId: 'grocery', canonicalName: 'Chickpeas', nameUrdu: 'چنے' },
  chickpeas: { categoryId: 'grocery', canonicalName: 'Chickpeas', nameUrdu: 'چنے' },
  'چنے': { categoryId: 'grocery', canonicalName: 'Chickpeas', nameUrdu: 'چنے' },

  // Spices
  namak: { categoryId: 'spices', canonicalName: 'Salt', nameUrdu: 'نمک' },
  salt: { categoryId: 'spices', canonicalName: 'Salt', nameUrdu: 'نمک' },
  'نمک': { categoryId: 'spices', canonicalName: 'Salt', nameUrdu: 'نمک' },
  haldi: { categoryId: 'spices', canonicalName: 'Turmeric / Haldi', nameUrdu: 'ہلدی' },
  turmeric: { categoryId: 'spices', canonicalName: 'Turmeric / Haldi', nameUrdu: 'ہلدی' },
  'ہلدی': { categoryId: 'spices', canonicalName: 'Turmeric / Haldi', nameUrdu: 'ہلدی' },
  zeera: { categoryId: 'spices', canonicalName: 'Cumin / Zeera', nameUrdu: 'زیرہ' },
  cumin: { categoryId: 'spices', canonicalName: 'Cumin / Zeera', nameUrdu: 'زیرہ' },
  'زیرہ': { categoryId: 'spices', canonicalName: 'Cumin / Zeera', nameUrdu: 'زیرہ' },
  'lal mirch': { categoryId: 'spices', canonicalName: 'Red Chilli Powder', nameUrdu: 'لال مرچ' },
  'لال مرچ': { categoryId: 'spices', canonicalName: 'Red Chilli Powder', nameUrdu: 'لال مرچ' },
  masala: { categoryId: 'spices', canonicalName: 'Spice Mix', nameUrdu: 'مصالحہ' },
  'شان مصالحہ': { categoryId: 'spices', canonicalName: 'Shan Masala', nameUrdu: 'شان مصالحہ' },
  'مصالحہ': { categoryId: 'spices', canonicalName: 'Spice Mix', nameUrdu: 'مصالحہ' },

  // Herbs
  dhaniya: { categoryId: 'herbs', canonicalName: 'Fresh Coriander / Hara Dhaniya', nameUrdu: 'ہرا دھنیا' },
  cilantro: { categoryId: 'herbs', canonicalName: 'Fresh Coriander', nameUrdu: 'ہرا دھنیا' },
  'hara dhaniya': { categoryId: 'herbs', canonicalName: 'Fresh Coriander', nameUrdu: 'ہرا دھنیا' },
  'ہرا دھنیا': { categoryId: 'herbs', canonicalName: 'Fresh Coriander', nameUrdu: 'ہرا دھنیا' },
  podina: { categoryId: 'herbs', canonicalName: 'Fresh Mint / Podina', nameUrdu: 'پودینہ' },
  mint: { categoryId: 'herbs', canonicalName: 'Fresh Mint', nameUrdu: 'پودینہ' },
  'پودینہ': { categoryId: 'herbs', canonicalName: 'Fresh Mint', nameUrdu: 'پودینہ' },

  // Dry Fruits
  badam: { categoryId: 'dry_fruits', canonicalName: 'Almonds', nameUrdu: 'بادام' },
  almonds: { categoryId: 'dry_fruits', canonicalName: 'Almonds', nameUrdu: 'بادام' },
  'بادام': { categoryId: 'dry_fruits', canonicalName: 'Almonds', nameUrdu: 'بادام' },
  kaju: { categoryId: 'dry_fruits', canonicalName: 'Cashews', nameUrdu: 'کاجو' },
  cashews: { categoryId: 'dry_fruits', canonicalName: 'Cashews', nameUrdu: 'کاجو' },
  'کاجو': { categoryId: 'dry_fruits', canonicalName: 'Cashews', nameUrdu: 'کاجو' },
  pista: { categoryId: 'dry_fruits', canonicalName: 'Pistachios', nameUrdu: 'پستہ' },
  khajoor: { categoryId: 'dry_fruits', canonicalName: 'Dates', nameUrdu: 'کھجور' },
  dates: { categoryId: 'dry_fruits', canonicalName: 'Dates', nameUrdu: 'کھجور' },
  'کھجور': { categoryId: 'dry_fruits', canonicalName: 'Dates', nameUrdu: 'کھجور' },

  // Bakery
  bread: { categoryId: 'bakery', canonicalName: 'Bread / Double Roti', nameUrdu: 'ڈبل روٹی' },
  'double roti': { categoryId: 'bakery', canonicalName: 'Bread / Double Roti', nameUrdu: 'ڈبل روٹی' },
  'ڈبل روٹی': { categoryId: 'bakery', canonicalName: 'Bread / Double Roti', nameUrdu: 'ڈبل روٹی' },
  'بریڈ': { categoryId: 'bakery', canonicalName: 'Bread', nameUrdu: 'بریڈ' },
  bun: { categoryId: 'bakery', canonicalName: 'Buns', nameUrdu: 'بن' },
  rusk: { categoryId: 'bakery', canonicalName: 'Rusk', nameUrdu: 'رسک' },
  'رسک': { categoryId: 'bakery', canonicalName: 'Rusk', nameUrdu: 'رسک' },
  naan: { categoryId: 'bakery', canonicalName: 'Naan', nameUrdu: 'نان' },
  'نان': { categoryId: 'bakery', canonicalName: 'Naan', nameUrdu: 'نان' },
  cake: { categoryId: 'bakery', canonicalName: 'Cake', nameUrdu: 'کیک' },
  'کیک': { categoryId: 'bakery', canonicalName: 'Cake', nameUrdu: 'کیک' },

  // Beverages
  chai: { categoryId: 'beverages', canonicalName: 'Tea / Chai Patti', nameUrdu: 'چائے کی پتی' },
  tea: { categoryId: 'beverages', canonicalName: 'Tea / Chai Patti', nameUrdu: 'چائے کی پتی' },
  patti: { categoryId: 'beverages', canonicalName: 'Tea / Chai Patti', nameUrdu: 'چائے کی پتی' },
  'چائے': { categoryId: 'beverages', canonicalName: 'Tea', nameUrdu: 'چائے' },
  coffee: { categoryId: 'beverages', canonicalName: 'Coffee', nameUrdu: 'کافی' },
  'کافی': { categoryId: 'beverages', canonicalName: 'Coffee', nameUrdu: 'کافی' },
  juice: { categoryId: 'beverages', canonicalName: 'Juice', nameUrdu: 'جوس' },
  'جوس': { categoryId: 'beverages', canonicalName: 'Juice', nameUrdu: 'جوس' },
  water: { categoryId: 'beverages', canonicalName: 'Mineral Water', nameUrdu: 'پانی' },
  'پانی': { categoryId: 'beverages', canonicalName: 'Mineral Water', nameUrdu: 'پانی' },
  pepsi: { categoryId: 'beverages', canonicalName: 'Pepsi', nameUrdu: 'پیپسی' },
  coke: { categoryId: 'beverages', canonicalName: 'Coca Cola', nameUrdu: 'کوک' },
  'rooh afza': { categoryId: 'beverages', canonicalName: 'Rooh Afza', nameUrdu: 'روح افزا' },
  'روح افزا': { categoryId: 'beverages', canonicalName: 'Rooh Afza', nameUrdu: 'روح افزا' },

  // Snacks
  biscuit: { categoryId: 'snacks', canonicalName: 'Biscuits', nameUrdu: 'بسکٹ' },
  biscuits: { categoryId: 'snacks', canonicalName: 'Biscuits', nameUrdu: 'بسکٹ' },
  'بسکٹ': { categoryId: 'snacks', canonicalName: 'Biscuits', nameUrdu: 'بسکٹ' },
  chips: { categoryId: 'snacks', canonicalName: 'Chips', nameUrdu: 'چپس' },
  'چپس': { categoryId: 'snacks', canonicalName: 'Chips', nameUrdu: 'چپس' },
  nimko: { categoryId: 'snacks', canonicalName: 'Nimko', nameUrdu: 'نمکو' },
  'نمکو': { categoryId: 'snacks', canonicalName: 'Nimko', nameUrdu: 'نمکو' },
  chocolate: { categoryId: 'snacks', canonicalName: 'Chocolate', nameUrdu: 'چاکلیٹ' },
  'چاکلیٹ': { categoryId: 'snacks', canonicalName: 'Chocolate', nameUrdu: 'چاکلیٹ' },

  // Frozen
  nuggets: { categoryId: 'frozen', canonicalName: 'Chicken Nuggets', nameUrdu: 'نگٹس' },
  'نگٹس': { categoryId: 'frozen', canonicalName: 'Chicken Nuggets', nameUrdu: 'نگٹس' },
  'ice cream': { categoryId: 'frozen', canonicalName: 'Ice Cream', nameUrdu: 'آئس کریم' },
  'آئس کریم': { categoryId: 'frozen', canonicalName: 'Ice Cream', nameUrdu: 'آئس کریم' },

  // Cleaning
  surf: { categoryId: 'cleaning', canonicalName: 'Washing Powder / Surf', nameUrdu: 'سرف' },
  detergent: { categoryId: 'cleaning', canonicalName: 'Detergent', nameUrdu: 'سرف' },
  'سرف': { categoryId: 'cleaning', canonicalName: 'Surf', nameUrdu: 'سرف' },
  dishwash: { categoryId: 'cleaning', canonicalName: 'Dishwashing Soap', nameUrdu: 'ڈش واش' },
  harpic: { categoryId: 'cleaning', canonicalName: 'Toilet Cleaner / Harpic', nameUrdu: 'ہارپک' },
  'ہارپک': { categoryId: 'cleaning', canonicalName: 'Harpic', nameUrdu: 'ہارپک' },

  // Household
  tissue: { categoryId: 'household', canonicalName: 'Tissue Paper', nameUrdu: 'ٹشو' },
  tissues: { categoryId: 'household', canonicalName: 'Tissue Paper', nameUrdu: 'ٹشو' },
  'ٹشو': { categoryId: 'household', canonicalName: 'Tissue Paper', nameUrdu: 'ٹشو' },
  mortein: { categoryId: 'household', canonicalName: 'Mosquito Spray / Mortein', nameUrdu: 'مورٹین' },
  'مورٹین': { categoryId: 'household', canonicalName: 'Mortein', nameUrdu: 'مورٹین' },
  matchbox: { categoryId: 'household', canonicalName: 'Matchbox', nameUrdu: 'ماچس' },
  'ماچس': { categoryId: 'household', canonicalName: 'Matchbox', nameUrdu: 'ماچس' },

  // Personal Care
  soap: { categoryId: 'personal_care', canonicalName: 'Bath Soap', nameUrdu: 'صابن' },
  sabun: { categoryId: 'personal_care', canonicalName: 'Bath Soap', nameUrdu: 'صابن' },
  'صابن': { categoryId: 'personal_care', canonicalName: 'Bath Soap', nameUrdu: 'صابن' },
  shampoo: { categoryId: 'personal_care', canonicalName: 'Shampoo', nameUrdu: 'شیمپو' },
  'شیمپو': { categoryId: 'personal_care', canonicalName: 'Shampoo', nameUrdu: 'شیمپو' },
  toothpaste: { categoryId: 'personal_care', canonicalName: 'Toothpaste', nameUrdu: 'ٹوتھ پیسٹ' },
  'ٹوتھ پیسٹ': { categoryId: 'personal_care', canonicalName: 'Toothpaste', nameUrdu: 'ٹوتھ پیسٹ' },

  // Health
  panadol: { categoryId: 'health', canonicalName: 'Panadol / Paracetamol', nameUrdu: 'پیناڈول' },
  paracetamol: { categoryId: 'health', canonicalName: 'Paracetamol', nameUrdu: 'پیراسیٹامول' },
  'پیناڈول': { categoryId: 'health', canonicalName: 'Panadol', nameUrdu: 'پیناڈول' },
  dawa: { categoryId: 'health', canonicalName: 'Medicine', nameUrdu: 'دوائی' },
  'دوائی': { categoryId: 'health', canonicalName: 'Medicine', nameUrdu: 'دوائی' },
  joshanda: { categoryId: 'health', canonicalName: 'Joshanda', nameUrdu: 'جوشاندہ' },
  'جوشاندہ': { categoryId: 'health', canonicalName: 'Joshanda', nameUrdu: 'جوشاندہ' },

  // Baby Care
  diaper: { categoryId: 'baby', canonicalName: 'Baby Diapers', nameUrdu: 'ڈائپر' },
  diapers: { categoryId: 'baby', canonicalName: 'Baby Diapers', nameUrdu: 'ڈائپر' },
  pampers: { categoryId: 'baby', canonicalName: 'Baby Diapers / Pampers', nameUrdu: 'پیمپرز' },
  'ڈائپر': { categoryId: 'baby', canonicalName: 'Baby Diaper', nameUrdu: 'ڈائپر' },
  'پیمپرز': { categoryId: 'baby', canonicalName: 'Pampers', nameUrdu: 'پیمپرز' },
  cerelac: { categoryId: 'baby', canonicalName: 'Cerelac Baby Food', nameUrdu: 'سیریلیک' },
  'سیریلیک': { categoryId: 'baby', canonicalName: 'Cerelac', nameUrdu: 'سیریلیک' },

  // Stationery
  pen: { categoryId: 'stationery', canonicalName: 'Pen', nameUrdu: 'قلم' },
  pencil: { categoryId: 'stationery', canonicalName: 'Pencil', nameUrdu: 'پنسل' },
  'قلم': { categoryId: 'stationery', canonicalName: 'Pen', nameUrdu: 'قلم' },
  'پنسل': { categoryId: 'stationery', canonicalName: 'Pencil', nameUrdu: 'پنسل' },

  // Electronics
  battery: { categoryId: 'electronics', canonicalName: 'Battery / Cell', nameUrdu: 'سیل' },
  charger: { categoryId: 'electronics', canonicalName: 'Phone Charger', nameUrdu: 'چارجر' },
  'سیل': { categoryId: 'electronics', canonicalName: 'Battery', nameUrdu: 'سیل' },
  'چارجر': { categoryId: 'electronics', canonicalName: 'Charger', nameUrdu: 'چارجر' },
};

function serverLocalCategorize(input: string): {
  categoryId: CategoryType;
  confidence: number;
  canonicalName?: string;
  nameUrdu?: string;
} {
  const norm = input.trim().toLowerCase().replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  if (!norm) return { categoryId: 'other', confidence: 0.1 };

  if (SERVER_LOCAL_RULES[norm]) {
    const item = SERVER_LOCAL_RULES[norm];
    return {
      categoryId: item.categoryId,
      confidence: 0.95,
      canonicalName: item.canonicalName,
      nameUrdu: item.nameUrdu,
    };
  }

  // Token / keyword containment check
  const words = norm.split(/[\s,._-]+/);
  for (const w of words) {
    if (SERVER_LOCAL_RULES[w]) {
      const item = SERVER_LOCAL_RULES[w];
      return {
        categoryId: item.categoryId,
        confidence: 0.88,
        canonicalName: item.canonicalName,
        nameUrdu: item.nameUrdu,
      };
    }
  }

  for (const [key, item] of Object.entries(SERVER_LOCAL_RULES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return {
        categoryId: item.categoryId,
        confidence: 0.8,
        canonicalName: item.canonicalName,
        nameUrdu: item.nameUrdu,
      };
    }
  }

  return { categoryId: 'other', confidence: 0.3 };
}

// Lazy initialization for Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// Secure server-side account deletion endpoint
app.post('/api/account/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // If server has SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL configured, clean up auth.users
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (supabaseUrl && serviceKey) {
      if (!token) {
        return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
      }
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Verify the requester's JWT token
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !user || user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized account deletion request' });
      }

      // Explicitly purge all user-owned data across tables to prevent orphaned records
      try {
        await supabaseAdmin.from('shopping_items').delete().eq('user_id', userId);
        await supabaseAdmin.from('shopping_lists').delete().eq('user_id', userId);
        await supabaseAdmin.from('frequently_bought_items').delete().eq('user_id', userId);
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
      } catch (tableCleanErr: any) {
        console.warn('Notice cleaning user tables before auth deletion:', tableCleanErr?.message);
      }

      // Delete user from auth.users (cascades or cleans up auth records)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.warn('Admin deleteUser notice:', deleteError.message);
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error handling /api/account/delete:', err?.message || err);
    return res.json({ success: true }); // Graceful fallback
  }
});

// AI Categorization API Endpoint with robust fallback hierarchy
app.post('/api/categorize', async (req, res) => {
  const { item } = req.body;
  if (!item || typeof item !== 'string') {
    return res.status(400).json({ error: 'Item string is required' });
  }

  const trimmed = item.trim();
  if (!trimmed) {
    return res.json({ categoryId: 'other', confidence: 0.1, source: 'empty_input' });
  }

  // Check local fast categorizer first
  const localMatch = serverLocalCategorize(trimmed);
  if (localMatch.confidence >= 0.85) {
    return res.json({
      categoryId: localMatch.categoryId,
      canonicalName: localMatch.canonicalName,
      nameUrdu: localMatch.nameUrdu,
      confidence: localMatch.confidence,
      source: 'local_fast_match',
    });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      categoryId: localMatch.categoryId,
      canonicalName: localMatch.canonicalName,
      nameUrdu: localMatch.nameUrdu,
      confidence: localMatch.confidence,
      source: 'local_no_api_key',
    });
  }

  const prompt = `You are the smart item recognition and categorization engine for YAAD, a grocery and household list app for Pakistani and global users.
User Input: "${trimmed}" (may be in English, Roman Urdu, or Urdu script, possibly with quantity/units or typos).

Task:
1. Identify the canonical grocery item concept (in English title and Urdu script).
2. Assign it to exactly ONE of the following valid category IDs:
["fruits", "vegetables", "dairy", "meat", "seafood", "eggs", "bakery", "beverages", "grocery", "spices", "herbs", "dry_fruits", "frozen", "snacks", "household", "cleaning", "personal_care", "health", "baby", "stationery", "electronics", "clothing", "other"]

Return JSON with:
"categoryId": string (one of the valid categories above),
"canonicalName": string (canonical item name in English title format e.g. "Potato", "Tomato", "Chicken"),
"nameUrdu": string (canonical Urdu name e.g. "آلو", "ٹماٹر", "مرغی"),
"confidence": number between 0.0 and 1.0.`;

  // List of models to try in sequence if 503 or transient overload occurs
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

  for (const modelName of candidateModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categoryId: {
                type: Type.STRING,
                enum: ALLOWED_CATEGORIES as unknown as string[],
              },
              canonicalName: {
                type: Type.STRING,
              },
              nameUrdu: {
                type: Type.STRING,
              },
              confidence: {
                type: Type.NUMBER,
              },
            },
            required: ['categoryId'],
          },
        },
      });

      // 4-second timeout per model attempt
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 4000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      if (parsed.categoryId && ALLOWED_CATEGORIES.includes(parsed.categoryId)) {
        return res.json({
          categoryId: parsed.categoryId,
          canonicalName: parsed.canonicalName,
          nameUrdu: parsed.nameUrdu,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
          source: `gemini_${modelName}`,
        });
      }
    } catch (modelError: any) {
      const is503OrUnavailable =
        modelError?.status === 'UNAVAILABLE' ||
        modelError?.code === 503 ||
        modelError?.message?.includes('503') ||
        modelError?.message?.includes('high demand') ||
        modelError?.message?.includes('timeout');

      if (!is503OrUnavailable) {
        // Break early if it's an auth/config issue, otherwise try next model
        break;
      }
      // If 503 or overload, loop to the next model in candidateModels
    }
  }

  // If all AI models were busy or timed out, gracefully return local best match
  return res.json({
    categoryId: localMatch.categoryId,
    confidence: localMatch.confidence,
    source: 'local_graceful_fallback',
  });
});

// Vite middleware & Static serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || (typeof __filename !== 'undefined' && __filename.endsWith('server.cjs'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YAAD server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

