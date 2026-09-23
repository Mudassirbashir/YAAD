import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  ListPlus,
  Lock,
  Scale,
  Share2,
  ShoppingBag,
  Sparkles,
  WifiOff,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../translations';
import {
  RASHAN_CATEGORIES,
  PAKISTANI_UNITS_GUIDE,
  RASHAN_FAQS,
  RashanCategory,
} from './rashanData';
import { generateUUID } from '../../lib/uuid';
import { ShoppingList, ShoppingItem } from '../../types';

interface RashanListPageProps {
  onBackToApp: () => void;
  onOpenAppWithList?: (newList: ShoppingList) => void;
  onNavigatePage: (page: string) => void;
}

export const RashanListPage: React.FC<RashanListPageProps> = ({
  onBackToApp,
  onOpenAppWithList,
  onNavigatePage,
}) => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { user } = useAuth();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(
    new Set(['what-is-rashan-list', 'how-yaad-helps-rashan', 'difference-pao-kilo'])
  );
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isAddingList, setIsAddingList] = useState<boolean>(false);
  const [addedListSuccess, setAddedListSuccess] = useState<boolean>(false);

  const currentLangKey = (
    language === 'ur' ? 'ur' : language === 'roman-urdu' ? 'romanUrdu' : 'en'
  ) as 'en' | 'romanUrdu' | 'ur';

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyCategoryItems = async (cat: RashanCategory) => {
    try {
      const lines = cat.items.map(
        (item) => `• ${item.name[currentLangKey]} — ${item.typicalQty}`
      );
      const text = `${cat.title[currentLangKey]}\n${lines.join('\n')}\n\nVia YAAD • yaadapppk.vercel.app`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedCategory(cat.id);
        setTimeout(() => setCopiedCategory(null), 2500);
      }
    } catch (err) {
      console.warn('Could not copy category:', err);
    }
  };

  const handleSharePage = async () => {
    try {
      const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    } catch (err) {
      console.warn('Could not share:', err);
    }
  };

  // Convert the curated rashan list into an active YAAD shopping list
  const handleLoadRashanIntoYaad = () => {
    setIsAddingList(true);
    const now = new Date().toISOString();

    const title = 'Monthly Household Rashan';

    // Flatten curated items into YAAD ShoppingItems
    const newItems: ShoppingItem[] = [];
    RASHAN_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        const mappedCat = item.category === 'perishables' ? 'vegetables' : (item.category as any);
        newItems.push({
          id: generateUUID(),
          name: item.name[currentLangKey] || item.name.en,
          quantity: item.typicalQty,
          categoryId: mappedCat,
          category: mappedCat,
          completed: false,
          note: item.note ? item.note[currentLangKey] : undefined,
        });
      });
    });

    const newList: ShoppingList = {
      id: generateUUID(),
      title,
      items: newItems,
      createdAt: now,
      isCompleted: false,
      userId: user?.id,
    };

    if (onOpenAppWithList) {
      onOpenAppWithList(newList);
    } else {
      // Fallback: Store guest list if standalone
      try {
        const key = user ? `yaad_shopping_lists_u_${user.id}` : 'yaad_shopping_lists_guest';
        const raw = localStorage.getItem(key);
        const existing: ShoppingList[] = raw ? JSON.parse(raw) : [];
        existing.unshift(newList);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.warn('Failed to save rashan list to localStorage:', e);
      }
      setAddedListSuccess(true);
      setTimeout(() => {
        onBackToApp();
      }, 1200);
    }
  };

  const filteredCategories =
    activeCategoryId === 'all'
      ? RASHAN_CATEGORIES
      : RASHAN_CATEGORIES.filter((c) => c.id === activeCategoryId);

  return (
    <div
      className={`min-h-screen bg-[#fbf9f5] text-[#1c1c1c] font-['Plus_Jakarta_Sans',sans-serif] ${
        isRTL ? 'text-right' : 'text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#005039]/10 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl text-[#005039] hover:bg-[#005039]/10 transition-colors cursor-pointer flex items-center gap-1.5 font-medium text-sm"
              title="Return to YAAD App"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">
                {'Back to App'}
              </span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#005039] text-[#ffffff] flex items-center justify-center font-extrabold text-sm shadow-xs">
                Y
              </div>
              <span className="font-bold text-[#005039] text-base tracking-tight">
                YAAD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#005039] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('roman-urdu')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  language === 'roman-urdu'
                    ? 'bg-[#005039] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Roman
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  language === 'ur'
                    ? 'bg-[#005039] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Urdu
              </button>
            </div>

            {/* Share / Copy Link */}
            <button
              onClick={handleSharePage}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 bg-white cursor-pointer"
              title="Share or Copy Link"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-[#005039]" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onBackToApp}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005039] text-white text-xs font-bold hover:bg-[#003d2b] transition-all cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{'Open YAAD'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-16">
        
        {/* 1. Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#005039]/10 text-[#005039] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'roman-urdu'
                ? 'Pakistan Household Rashan Checklist'
                : 'Definitive Pakistan Household Rashan Guide'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#003d2b] tracking-tight leading-tight sm:leading-snug">
            {language === 'roman-urdu' ? (
              <>Mahana Rashan Ki Mukammal Checklist Aur Planning Guide</>
            ) : (
              <>The Essential Monthly Rashan Checklist & Household Guide</>
            )}
          </h1>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
            {language === 'roman-urdu'
              ? 'Chakki k atta aur basmati chawal se le kar daalein, cooking oil, chai patti aur safai k saman tak. Pakistani khandan k liye mahana rashan baghair kisi cheez ko bhoolay plan karne ka behtareen tareeqa.'
              : 'From chakki atta and aged basmati rice to lentils, cooking oils, spices, and cleaning essentials. A practical, waste-reducing monthly grocery blueprint crafted for Pakistani homes.'}
          </p>

          {/* Direct CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLoadRashanIntoYaad}
              disabled={isAddingList}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#005039] text-white font-bold text-sm sm:text-base hover:bg-[#003d2b] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {addedListSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{'List Added to YAAD!'}</span>
                </>
              ) : (
                <>
                  <ListPlus className="w-5 h-5" />
                  <span>
                    {language === 'roman-urdu'
                      ? 'Ye List YAAD Mein Load Karein'
                      : 'Load This Rashan List into YAAD'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={onBackToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm sm:text-base hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <span>{'Create Custom List'}</span>
              <ArrowLeft className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-[#005039]" /> 100% Offline Capable
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#005039]" /> No Ad Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#005039]" /> Trilingual Native
            </span>
          </div>
        </section>

        {/* 2. The Problem with Monthly Rashan Shopping */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#003d2b]">
            {language === 'roman-urdu'
              ? 'Mahana Rashan Kharidte Waqt Aam Masail'
              : 'The Dilemma of Monthly Grocery Shopping in Pakistan'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 leading-relaxed pt-2">
            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                ✕
              </div>
              <h3 className="font-bold text-slate-900">
                {'Lost Notes & Forgotten Items'}
              </h3>
              <p>
                {'Handwritten chits get crumpled, lost, or smudged in busy markets, leading to forgotten essentials.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                ⟲
              </div>
              <h3 className="font-bold text-slate-900">
                {'Aisle Backtracking Fatigue'}
              </h3>
              <p>
                {'Unorganized lists force you to run back and forth between the spice rack, grain sacks, and detergent counters.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#005039] flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <h3 className="font-bold text-slate-900">
                {'YAAD’s Intelligent Memory'}
              </h3>
              <p>
                {'YAAD auto-sorts every entered item into logical store aisles, saving time and keeping your mind at ease.'}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Interactive Category Filter & Rashan Checklist */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003d2b]">
                {language === 'roman-urdu'
                  ? 'Categorized Mahana Rashan Checklist'
                  : 'Categorized Monthly Rashan Checklist (Family of 4-5)'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {'Standard 4-week pantry estimates for an average household. Adjust based on your family size.'}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategoryId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryId === 'all'
                    ? 'bg-[#005039] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {'All Categories'}
              </button>
              {RASHAN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategoryId === cat.id
                      ? 'bg-[#005039] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  <span>{cat.title[currentLangKey].split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Cards */}
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-2xl bg-white shadow-2xs border border-slate-200">
                      {cat.icon}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {cat.title[currentLangKey]}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cat.description[currentLangKey]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyCategoryItems(cat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      title="Copy section items"
                    >
                      {copiedCategory === cat.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#005039]" />
                          <span className="text-[#005039]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-slate-100 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-slate-900">
                            {item.name[currentLangKey]}
                          </p>
                          {item.note && (
                            <p className="text-xs text-slate-500 leading-snug">
                              {item.note[currentLangKey]}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-white text-[#005039] font-bold text-xs border border-slate-200 whitespace-nowrap">
                          {item.typicalQty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Load Banner */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-[#005039] to-[#003d2b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-bold">
                {'Ready to take this checklist with you to the store?'}
              </h4>
              <p className="text-xs text-white/80">
                {'Loads instantly into YAAD. Tick off items in the aisle even with zero mobile signal.'}
              </p>
            </div>

            <button
              onClick={handleLoadRashanIntoYaad}
              disabled={isAddingList}
              className="px-5 py-3 rounded-2xl bg-white text-[#005039] font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              {addedListSuccess
                ? 'Added to YAAD ✓'
                : 'Load Checklist'}
            </button>
          </div>
        </section>

        {/* 4. Subcontinental Traditional Units Guide */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#005039] font-bold text-xs">
              <Scale className="w-4 h-4" />
              <span>MARKET KNOWLEDGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#003d2b]">
              {'Traditional Pakistani Measurement Units Guide'}
            </h2>
            <p className="text-sm text-slate-600">
              {'Understanding traditional Bazaar measurements ensures you get exact quantities without confusing metric terms.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PAKISTANI_UNITS_GUIDE.map((u) => (
              <div
                key={u.unit}
                className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-200/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#005039]">{u.unit}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                    {u.metricEquivalent}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{u.usageContext}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Practical Household Pantry & Storage Tips */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#003d2b]">
              {'4 Golden Rules for Household Rashan Management'}
            </h2>
            <p className="text-sm text-slate-600">
              {'Practical pantry audit and storage advice to minimize grocery waste and stretch monthly budgets.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-1.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#005039] text-white flex items-center justify-center text-xs">1</span>
                <span>{'The "Dry Pantry Shake"'}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {'Always inspect your existing pantry containers before finalizing the list. Households routinely overbuy staples they already have sitting in dark cabinets.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-1.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#005039] text-white flex items-center justify-center text-xs">2</span>
                <span>{'Weevil Protection for Atta'}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {'During humid summer or monsoon months, insert a few whole cloves or dried bay leaves (tez paat) into large flour bins to deter weevils.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-1.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#005039] text-white flex items-center justify-center text-xs">3</span>
                <span>{'Buy Whole Spices in Bulk'}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {'Whole spices (zeera, kali mirch, darchini) retain their essential oils and aroma far longer than pre-ground powders and prevent adulteration.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-100 space-y-1.5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#005039] text-white flex items-center justify-center text-xs">4</span>
                <span>{'Kiryana Provision vs Supermarket'}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {'Wholesale grains and pulses from trusted neighborhood kiryana provision merchants often cost 15-20% less than modern hypermarket chains.'}
              </p>
            </div>
          </div>
        </section>

        {/* 6. AEO & FAQ Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#003d2b]">
              {'Frequently Asked Questions About Rashan Planning'}
            </h2>
            <p className="text-sm text-slate-600">
              {'Direct answers on monthly budgeting, local quantities, and using YAAD offline.'}
            </p>
          </div>

          <div className="divide-y divide-slate-200/70">
            {RASHAN_FAQS.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-[#005039] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question[currentLangKey]}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#005039] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.answer[currentLangKey]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Bottom Conversion CTA Block */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-[#005039] text-white space-y-5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto text-xl font-extrabold font-['Plus_Jakarta_Sans']">
            Y
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {'Never Forget What You Need to Buy Again'}
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            {'YAAD is built specifically around South Asian grocery habits. Private, fast, offline-ready, and completely free.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLoadRashanIntoYaad}
              disabled={isAddingList}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-[#005039] font-bold text-sm sm:text-base hover:bg-slate-100 transition-all cursor-pointer shadow-md"
            >
              {addedListSuccess ? 'Rashan List Created ✓' : 'Start Your Rashan List in YAAD'}
            </button>
            <button
              onClick={onBackToApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#003d2b] border border-white/20 text-white font-medium text-sm sm:text-base hover:bg-[#002d20] transition-colors cursor-pointer"
            >
              {'Open YAAD Directly'}
            </button>
          </div>
        </section>

        {/* 8. Related Public Resources Footer */}
        <footer className="pt-8 border-t border-slate-200/80 text-xs text-slate-500 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#005039]">YAAD</span>
              <span>•</span>
              <span>Smart Shopping Memory</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage('/about');
                }}
                className="hover:text-[#005039] hover:underline cursor-pointer"
              >
                About YAAD
              </a>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage('/help');
                }}
                className="hover:text-[#005039] hover:underline cursor-pointer"
              >
                Help & FAQ
              </a>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage('/privacy');
                }}
                className="hover:text-[#005039] hover:underline cursor-pointer"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage('/terms');
                }}
                className="hover:text-[#005039] hover:underline cursor-pointer"
              >
                Terms of Service
              </a>
              <a
                href="/legal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage('/legal');
                }}
                className="hover:text-[#005039] hover:underline cursor-pointer"
              >
                Legal Notices
              </a>
            </div>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} YAAD. Designed for household grocery shoppers in Pakistan and the global diaspora.
          </p>
        </footer>

      </main>
    </div>
  );
};
