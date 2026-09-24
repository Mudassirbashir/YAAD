import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  Lock,
  PenLine,
  Plus,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { AppPublicHeader } from './common/AppPublicHeader';
import { AppPublicFooter } from './common/AppPublicFooter';

interface LandingPageViewProps {
  user: any;
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenLegalPage: (page: 'about' | 'terms' | 'privacy' | 'help' | 'blog' | 'legal') => void;
  onOpenRashanList: () => void;
}

interface DemoItem {
  id: string;
  name: string;
  quantity: string;
  completed: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  onGetStarted,
  onSignIn,
  onOpenLegalPage,
  onOpenRashanList,
}) => {
  // Interactive grocery preview state
  const [demoItems, setDemoItems] = useState<DemoItem[]>([
    { id: '1', name: 'Basmati Rice', quantity: '5 kg', completed: false },
    { id: '2', name: 'Cooking Oil', quantity: '2 Liters', completed: false },
    { id: '3', name: 'Desi Eggs', quantity: '1 Dozen', completed: true },
    { id: '4', name: 'Chai Patti (Tea)', quantity: '450 g', completed: false },
  ]);

  const toggleDemoItem = (id: string) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addQuickItem = (name: string, quantity: string) => {
    if (demoItems.some((i) => i.name.toLowerCase() === name.toLowerCase())) return;
    const newItem: DemoItem = {
      id: Date.now().toString(),
      name,
      quantity,
      completed: false,
    };
    setDemoItems((prev) => [newItem, ...prev]);
  };

  const completedCount = demoItems.filter((i) => i.completed).length;

  return (
    <div
      id="landing_page_container"
      className="min-h-screen bg-[#faf8f5] text-[#1c2826] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-[#005039]/15"
    >
      {/* 1. Global Public Header with Screen-Centered YAAD & Smooth Animated Sign In */}
      <AppPublicHeader
        user={user}
        onSignIn={onSignIn}
        title="YAAD"
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main className="flex-1 pt-20 sm:pt-24">
        {/* ==================================================================== */}
        {/* 2. HERO SECTION */}
        {/* ==================================================================== */}
        <section className="pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          {/* Subtle Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e5e1d8] text-[#005039] text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="whitespace-nowrap">Simple, Private Grocery Memory</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1c2826] tracking-tight leading-[1.15]">
            Never forget what you came to buy.
          </h1>

          {/* Clean subheadline */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-[#556960] max-w-2xl mx-auto leading-relaxed">
            Fast, clutter-free shopping lists designed for real grocery trips. Works 100% offline, anywhere.
          </p>

          {/* Two Prominent Action Buttons with Tactile Embossed Feel */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Primary Action: Make First List Now */}
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#005039] hover:bg-[#003d2b] text-white font-bold text-sm sm:text-base shadow-[0_4px_0_0_#003324,0_8px_20px_rgba(0,80,57,0.28)] active:translate-y-1 active:shadow-[0_0px_0_0_#003324] border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>List Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Action: Monthly Grocery Guide */}
            <button
              type="button"
              onClick={onOpenRashanList}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-50 text-[#1c2826] font-bold text-sm sm:text-base shadow-[0_4px_0_0_#d8d3c7,0_8px_16px_rgba(0,0,0,0.06)] active:translate-y-1 active:shadow-[0_0px_0_0_#d8d3c7] border border-[#d8d3c7] transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-[#005039]" />
              <span>Monthly Grocery Guide</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#556960]">
            <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Works without internet
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              No ads or spam
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Pakistani units (kg, grams, pao)
            </span>
          </div>

          {/* Invisible Crawlable SEO Content for Search Engines */}
          <div className="sr-only" aria-hidden="false">
            <h2>About YAAD Smart Grocery Memory &amp; Shopping Assistant</h2>
            <p>
              YAAD is an intelligent, bilingual grocery shopping checklist and rashan manager built for Pakistani households.
              Features include: 100% offline functionality in basement markets, native Roman Urdu and Nastaliq item recognition,
              Pakistani units including kg, pao, darjan, and chattak, automatic categorization, and private zero-ad data storage.
            </p>
            <h3>Official Community &amp; Social Channels</h3>
            <ul>
              <li><a href="https://www.tiktok.com/@yaadapp" rel="noopener noreferrer">YAAD on TikTok</a></li>
              <li><a href="https://www.facebook.com/yaadapp" rel="noopener noreferrer">YAAD on Facebook</a></li>
              <li><a href="https://www.instagram.com/yaadapp" rel="noopener noreferrer">YAAD on Instagram</a></li>
              <li><a href="https://www.linkedin.com/company/yaadapp" rel="noopener noreferrer">YAAD on LinkedIn</a></li>
            </ul>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. THREE UNIFIED FEATURE CARDS (NO EMOJIS, UNIFIED ICONS & SIZES) */}
        {/* ==================================================================== */}
        <section className="py-10 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Write It Down */}
            <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                  <PenLine className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-lg font-bold text-[#1c2826] mb-2 tracking-tight">
                  Write It Down
                </h3>
                <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                  Add items the moment you remember them at home. Add quantities, units, and brands in seconds before leaving.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                Zero clutter
              </div>
            </div>

            {/* Card 2: Go to the Shop */}
            <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                  <Store className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-lg font-bold text-[#1c2826] mb-2 tracking-tight">
                  Go to the Shop
                </h3>
                <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                  Take YAAD into grocery stores and basement bazaars. No Wi-Fi or mobile data needed to view your list.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                100% offline ready
              </div>
            </div>

            {/* Card 3: Check It Off */}
            <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                  <CheckSquare className="w-5 h-5 text-[#005039]" />
                </div>
                <h3 className="text-lg font-bold text-[#1c2826] mb-2 tracking-tight">
                  Check It Off
                </h3>
                <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                  Tap each item as you put it in your basket. Completed items fade out so you never buy duplicates or miss a thing.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
                Clear satisfaction
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. INTERACTIVE GROCERY DEMO & PROMINENT CENTERED CTA */}
        {/* ==================================================================== */}
        <section className="py-10 px-4 sm:px-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c2826] tracking-tight">
              Interactive Grocery List
            </h2>
            <p className="text-xs sm:text-sm text-[#556960] mt-1.5">
              Tap any item below to try out checking items off:
            </p>
          </div>

          <div className="bg-white border border-[#e5e1d8] rounded-3xl p-5 sm:p-7 shadow-xs">
            {/* Header info - Structured single line, never wrapping awkwardly */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#f2efe9]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-extrabold text-sm sm:text-base text-[#1c2826] tracking-tight whitespace-nowrap">
                  Today&apos;s Groceries
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#005039]/10 text-[#005039] shrink-0 whitespace-nowrap">
                  {completedCount} of {demoItems.length} Done
                </span>
              </div>
              <span className="text-xs font-medium text-[#556960] shrink-0 whitespace-nowrap">
                Tap item to check
              </span>
            </div>

            {/* Items List - Single line layout with clean truncate and shrink-0 badges */}
            <div className="divide-y divide-[#f2efe9] mt-2">
              {demoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleDemoItem(item.id)}
                  className={`py-3 px-3 flex items-center justify-between gap-3 rounded-xl transition-all select-none cursor-pointer ${
                    item.completed ? 'bg-[#faf8f5]/80 opacity-60' : 'hover:bg-[#faf8f5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        item.completed
                          ? 'bg-[#005039] border-[#005039] text-white'
                          : 'border-[#cfc9be] bg-white'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-sm font-semibold truncate ${
                        item.completed ? 'line-through text-[#788880]' : 'text-[#1c2826]'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f3efe6] text-[#3d5046] shrink-0 whitespace-nowrap">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Chips */}
            <div className="mt-4 pt-3.5 border-t border-[#f2efe9]">
              <p className="text-xs font-bold text-[#556960] mb-2.5 whitespace-nowrap">
                Try adding an item:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addQuickItem('Chocolate', '1 Bar')}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#005039]" />
                  <span>Chocolate</span>
                </button>
                <button
                  type="button"
                  onClick={() => addQuickItem('Fruit Juice', '1 Pack')}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#005039]" />
                  <span>Fruit Juice</span>
                </button>
                <button
                  type="button"
                  onClick={() => addQuickItem('Fresh Yogurt', '1 Cup')}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#005039]" />
                  <span>Fresh Yogurt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prominent, Centered "Create Your Own List" CTA Button with Tactile Embossed Feel */}
          <div className="mt-8 flex flex-col items-center justify-center gap-2.5 text-center">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#005039] hover:bg-[#003d2b] text-white font-black text-sm sm:text-base shadow-[0_4px_0_0_#003324,0_8px_20px_rgba(0,80,57,0.28)] active:translate-y-1 active:shadow-[0_0px_0_0_#003324] border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Create Your Own List</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-xs text-[#788880] font-medium whitespace-nowrap">
              Sign in to sync across your household devices
            </span>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. PRIVACY TRANSPARENCY NOTICE */}
        {/* ==================================================================== */}
        <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="bg-white border border-[#e5e1d8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#005039]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1c2826]">
                  Data Privacy &amp; Sync Transparency
                </h3>
                <p className="text-xs text-[#556960]">
                  We request your basic profile strictly to identify your account and synchronize lists across your family devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#556960]">
              <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e5e1d8]/70">
                <strong className="text-[#1c2826] block mb-1">What we use:</strong>
                Name &amp; email strictly for authentication and list sync.
              </div>
              <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e5e1d8]/70">
                <strong className="text-[#1c2826] block mb-1">What we never access:</strong>
                Zero access to Gmail, Google Drive, contacts, or location data.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Clean Global Public Footer */}
      <AppPublicFooter
        onOpenShopping={onGetStarted}
        onOpenRashan={onOpenRashanList}
        onOpenLegal={onOpenLegalPage}
      />
    </div>
  );
};
