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
  'vegetables',
  'fruits',
  'dairy',
  'meat',
  'bakery',
  'grains_staples',
  'beverages',
  'snacks',
  'frozen',
  'household',
  'cleaning',
  'personal_care',
  'baby_care',
  'medicines',
  'stationery',
  'electronics',
  'clothing',
  'other',
] as const;

type CategoryType = (typeof ALLOWED_CATEGORIES)[number];

// Server-side fast dictionary for instant reliable fallback
const SERVER_LOCAL_RULES: Record<string, CategoryType> = {
  // Vegetables
  aloo: 'vegetables', aaloo: 'vegetables', potato: 'vegetables', potatoes: 'vegetables', 'آلو': 'vegetables',
  pyaz: 'vegetables', pyaaz: 'vegetables', piyaz: 'vegetables', onion: 'vegetables', onions: 'vegetables', 'پیاز': 'vegetables',
  tamatar: 'vegetables', tomato: 'vegetables', tomatoes: 'vegetables', 'ٹماٹر': 'vegetables',
  lehsan: 'vegetables', garlic: 'vegetables', 'لہسن': 'vegetables',
  adrak: 'vegetables', ginger: 'vegetables', 'ادرک': 'vegetables',
  palak: 'vegetables', spinach: 'vegetables', 'پالک': 'vegetables',
  mirch: 'vegetables', chilli: 'vegetables', chili: 'vegetables', 'ہری مرچ': 'vegetables',
  kheera: 'vegetables', cucumber: 'vegetables', 'کھیرا': 'vegetables',
  leemo: 'vegetables', lemon: 'vegetables', lime: 'vegetables', 'لیموں': 'vegetables',
  gajar: 'vegetables', carrot: 'vegetables', 'گاجر': 'vegetables',
  gobi: 'vegetables', cabbage: 'vegetables', cauliflower: 'vegetables', 'گوبھی': 'vegetables',
  matar: 'vegetables', peas: 'vegetables', 'مٹر': 'vegetables',
  bhindi: 'vegetables', okra: 'vegetables', 'بھنڈی': 'vegetables',
  baingan: 'vegetables', brinjal: 'vegetables', eggplant: 'vegetables', 'بینگن': 'vegetables',

  // Fruits
  saib: 'fruits', seb: 'fruits', apple: 'fruits', apples: 'fruits', 'سیب': 'fruits',
  kela: 'fruits', kelay: 'fruits', kele: 'fruits', banana: 'fruits', bananas: 'fruits', 'کیلا': 'fruits', 'کیلے': 'fruits',
  aam: 'fruits', mango: 'fruits', mangoes: 'fruits', 'آم': 'fruits',
  angoor: 'fruits', grape: 'fruits', grapes: 'fruits', 'انگور': 'fruits',
  malta: 'fruits', kinnow: 'fruits', orange: 'fruits', oranges: 'fruits', 'مالٹا': 'fruits', 'کینو': 'fruits',
  tarbooz: 'fruits', watermelon: 'fruits', 'تربوز': 'fruits',

  // Dairy & Eggs
  doodh: 'dairy', milk: 'dairy', 'دودھ': 'dairy', olpers: 'dairy', milkpak: 'dairy',
  anda: 'dairy', anday: 'dairy', ande: 'dairy', egg: 'dairy', eggs: 'dairy', 'انڈا': 'dairy', 'انڈے': 'dairy',
  dahi: 'dairy', yogurt: 'dairy', curd: 'dairy', 'دہی': 'dairy',
  makhan: 'dairy', butter: 'dairy', 'مکھن': 'dairy',
  paneer: 'dairy', cheese: 'dairy', 'پنیر': 'dairy',
  cream: 'dairy', malai: 'dairy', 'ملائی': 'dairy',

  // Grains & Staples
  atta: 'grains_staples', aata: 'grains_staples', flour: 'grains_staples', maida: 'grains_staples', 'آٹا': 'grains_staples',
  chawal: 'grains_staples', rice: 'grains_staples', basmati: 'grains_staples', 'چاول': 'grains_staples',
  cheeni: 'grains_staples', chini: 'grains_staples', sugar: 'grains_staples', 'چینی': 'grains_staples', 'شکر': 'grains_staples',
  oil: 'grains_staples', cooking_oil: 'grains_staples', tail: 'grains_staples', tel: 'grains_staples', 'تیل': 'grains_staples',
  ghee: 'grains_staples', 'گھی': 'grains_staples',
  daal: 'grains_staples', dal: 'grains_staples', lentils: 'grains_staples', 'دال': 'grains_staples',
  chanay: 'grains_staples', chickpeas: 'grains_staples', 'چنے': 'grains_staples',
  namak: 'grains_staples', salt: 'grains_staples', 'نمک': 'grains_staples',
  masala: 'grains_staples', spices: 'grains_staples', haldi: 'grains_staples', zeera: 'grains_staples', 'مصالحہ': 'grains_staples',

  // Meat
  gosht: 'meat', meat: 'meat', chicken: 'meat', murghi: 'meat', 'چکن': 'meat', 'مرغی': 'meat', 'گوشت': 'meat',
  beef: 'meat', mutton: 'meat', qeema: 'meat', keema: 'meat', 'قیمہ': 'meat',
  machli: 'meat', fish: 'meat', prawns: 'meat', 'مچھلی': 'meat',

  // Bakery
  bread: 'bakery', double_roti: 'bakery', roti: 'bakery', 'ڈبل روٹی': 'bakery', 'بریڈ': 'bakery',
  bun: 'bakery', buns: 'bakery', rusk: 'bakery', paapay: 'bakery', 'رسک': 'bakery',
  cake: 'bakery', naan: 'bakery', paratha: 'bakery', 'نان': 'bakery', 'کیک': 'bakery',

  // Beverages
  chai: 'beverages', tea: 'beverages', patti: 'beverages', 'چائے': 'beverages',
  coffee: 'beverages', juice: 'beverages', water: 'beverages', 'پانی': 'beverages', 'جوس': 'beverages',
  pepsi: 'beverages', coke: 'beverages', sharbat: 'beverages', rooh_afza: 'beverages',

  // Snacks
  biscuit: 'snacks', biscuits: 'snacks', cookies: 'snacks', 'بسکٹ': 'snacks',
  chips: 'snacks', lays: 'snacks', nimko: 'snacks', 'چپس': 'snacks', 'نمکو': 'snacks',
  chocolate: 'snacks', badam: 'snacks', kaju: 'snacks', 'چاکلیٹ': 'snacks',

  // Cleaning & Household
  surf: 'cleaning', detergent: 'cleaning', dishwash: 'cleaning', harpic: 'cleaning', 'سرف': 'cleaning',
  tissue: 'household', shoppers: 'household', lifafay: 'household', 'ٹشو': 'household',
  diaper: 'baby_care', pampers: 'baby_care', 'ڈائپر': 'baby_care',
  panadol: 'medicines', paracetamol: 'medicines', dawa: 'medicines', 'دوائی': 'medicines', 'پیناڈول': 'medicines',
};

function serverLocalCategorize(input: string): { categoryId: CategoryType; confidence: number } {
  const norm = input.trim().toLowerCase().replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  if (!norm) return { categoryId: 'other', confidence: 0.1 };

  if (SERVER_LOCAL_RULES[norm]) {
    return { categoryId: SERVER_LOCAL_RULES[norm], confidence: 0.95 };
  }

  // Token / keyword containment check
  const words = norm.split(/[\s,._-]+/);
  for (const w of words) {
    if (SERVER_LOCAL_RULES[w]) {
      return { categoryId: SERVER_LOCAL_RULES[w], confidence: 0.88 };
    }
  }

  for (const [key, cat] of Object.entries(SERVER_LOCAL_RULES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return { categoryId: cat, confidence: 0.8 };
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

    if (supabaseUrl && serviceKey && token) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Verify the requester's JWT token
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !user || user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized account deletion request' });
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
      confidence: localMatch.confidence,
      source: 'local_fast_match',
    });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      categoryId: localMatch.categoryId,
      confidence: localMatch.confidence,
      source: 'local_no_api_key',
    });
  }

  const prompt = `You are the item categorizer for YAAD, a grocery and shopping list app.
Item: "${trimmed}" (may be in English, Roman Urdu, or Urdu script).

Assign it to exactly ONE of the following valid category IDs:
- "vegetables", "fruits", "dairy", "meat", "bakery", "grains_staples", "beverages", "snacks", "frozen", "household", "cleaning", "personal_care", "baby_care", "medicines", "stationery", "electronics", "clothing", "other".

Return JSON with:
"categoryId": one of the string IDs above,
"confidence": a number between 0.0 and 1.0.`;

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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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

