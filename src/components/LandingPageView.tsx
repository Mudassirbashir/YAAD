import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowRight,
  ShoppingBag,
  Lock,
  Newspaper,
  Check,
  Scale,
  WifiOff,
  User as UserIcon,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { LegalPageType } from './legal/legalContent';

interface LandingPageViewProps {
  user: User | null;
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenLegalPage: (page: LegalPageType) => void;
  onOpenRashanList: () => void;
}

interface InteractiveDemoItem {
  id: string;
  nameEn: string;
  nameUr: string;
  quantity: string;
  icon: string;
  completed: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  onGetStarted,
  onSignIn,
  onOpenLegalPage,
  onOpenRashanList,
}) => {
  // Ultra-clear, child-friendly interactive checklist
  const [demoItems, setDemoItems] = useState<InteractiveDemoItem[]>([
    { id: '1', nameEn: 'Fresh Milk', nameUr: 'تازہ دودھ', quantity: '2 Litre', icon: '🥛', completed: true },
    { id: '2', nameEn: 'Eggs', nameUr: 'انڈے', quantity: '1 Dozen', icon: '🥚', completed: true },
    { id: '3', nameEn: 'Biscuits & Snacks', nameUr: 'بسکٹ', quantity: '2 Packs', icon: '🍪', completed: false },
    { id: '4', nameEn: 'Pyaz (Onions)', nameUr: 'پیاز', quantity: '1 دھڑی (5 kg)', icon: '🧅', completed: false },
    { id: '5', nameEn: 'Chakki Atta', nameUr: 'چکی کا آٹا', quantity: '10 kg', icon: '🌾', completed: false },
  ]);

  const toggleDemoItem = (id: string) => {
    setDemoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addQuickItem = (nameEn: string, nameUr: string, quantity: string, icon: string) => {
    const newItem: InteractiveDemoItem = {
      id: Date.now().toString(),
      nameEn,
      nameUr,
      quantity,
      icon,
      completed: false,
    };
    setDemoItems((prev) => [...prev, newItem]);
  };

  const resetDemo = () => {
    setDemoItems([
      { id: '1', nameEn: 'Fresh Milk', nameUr: 'تازہ دودھ', quantity: '2 Litre', icon: '🥛', completed: false },
      { id: '2', nameEn: 'Eggs', nameUr: 'انڈے', quantity: '1 Dozen', icon: '🥚', completed: false },
      { id: '3', nameEn: 'Biscuits & Snacks', nameUr: 'بسکٹ', quantity: '2 Packs', icon: '🍪', completed: false },
      { id: '4', nameEn: 'Pyaz (Onions)', nameUr: 'پیاز', quantity: '1 دھڑی (5 kg)', icon: '🧅', completed: false },
      { id: '5', nameEn: 'Chakki Atta', nameUr: 'چکی کا آٹا', quantity: '10 kg', icon: '🌾', completed: false },
    ]);
  };

  const completedCount = demoItems.filter((i) => i.completed).length;
  const isAllCompleted = completedCount === demoItems.length && demoItems.length > 0;

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1c2826] font-sans antialiased selection:bg-[#005039]/15 selection:text-[#005039]">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER (Logo Left, YAAD Center, Sign-in Right) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e5e1d8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="YAAD Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="hidden sm:inline-block font-urdu text-base text-[#005039] font-bold">
                یاد
              </span>
            </a>
          </div>

          {/* Center: Clean, Authoritative YAAD Brand Heading */}
          <div className="text-center">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block"
            >
              <span className="text-xl sm:text-2xl font-black tracking-widest text-[#005039] font-['Plus_Jakarta_Sans',sans-serif]">
                YAAD
              </span>
            </a>
          </div>

          {/* Right: Clean Account / Sign In Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-[#005039] hover:bg-[#00402e] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Go to Lists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#005039] hover:text-[#00402e] bg-[#005039]/8 hover:bg-[#005039]/12 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#005039]/15 transition-all active:scale-95 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign in to your account</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Authenticated user quick bar if logged in */}
      {user && (
        <aside
          aria-label="Account status"
          className="bg-[#005039]/8 border-b border-[#005039]/15 py-2 px-4 text-center text-xs sm:text-sm text-[#005039] font-medium"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Signed in as <strong>{user.email || 'User'}</strong></span>
            </div>
            <button
              onClick={onGetStarted}
              className="font-bold underline hover:no-underline cursor-pointer"
            >
              Open Shopping Lists &rarr;
            </button>
          </div>
        </aside>
      )}

      {/* ==================================================================== */}
      {/* 2. HERO SECTION — SO SIMPLE AN 8-YEAR-OLD GETS IT IN 3 SECONDS */}
      {/* ==================================================================== */}
      <section className="pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Friendly visual pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#e5e1d8] rounded-full px-4 py-1.5 mb-5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#005039]" />
            <span className="text-xs sm:text-sm font-bold text-[#005039]">
              کاغذ پینسل چھوڑیں — دکان پر جانا اب بالکل آسان!
            </span>
          </div>

          {/* Simple, Emotional, Crystal-Clear Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-[#1c2826] tracking-tight leading-[1.18] mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
            دکان پر جا کر بھول گئے <br className="hidden sm:inline" />
            کہ کیا لانا تھا؟
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-[#005039] mb-3 font-['Plus_Jakarta_Sans',sans-serif]">
            Never Forget What to Buy Again!
          </p>

          {/* Crystal Clear 8-Year-Old Explanation */}
          <p className="text-sm sm:text-base text-[#556960] max-w-2xl mx-auto mb-8 leading-relaxed">
            امی نے سودا لینے بھیجا ہو یا گھر کا راشن لانا ہو: <strong>جو چاہیے وہ لکھ لیں</strong>، اور دکان پر ملتے ہی <strong>ٹک کر دیں</strong>۔ کوئی چیز کبھی نہیں بھولے گی!
          </p>

          {/* Main Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#005039] hover:bg-[#00402e] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>{user ? 'Open Your Shopping Lists' : 'ابھی لسٹ بنائیں — بالکل مفت'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenRashanList}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f3f0e8] text-[#1c2826] font-semibold text-sm sm:text-base px-5 py-3.5 rounded-2xl border border-[#e5e1d8] shadow-2xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#005039]" />
              <span>Monthly Rashan Guide (راشن لسٹ)</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3 STEP STORY CARD (Super easy to grasp in 1 glance) */}
        {/* ==================================================================== */}
        <div className="max-w-3xl mx-auto mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white/80 border border-[#e5e1d8] rounded-2xl p-4 text-center shadow-2xs flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#005039]/10 text-[#005039] font-black text-sm flex items-center justify-center mb-2">
              ۱
            </div>
            <h3 className="text-sm font-bold text-[#1c2826] font-urdu">
              پہلے لکھیں 📝
            </h3>
            <p className="text-xs text-[#556960] mt-1">
              جو چیز بھی لانی ہے (دودھ، انڈے، آٹا) اس کو لسٹ میں ڈال لیں۔
            </p>
          </div>

          <div className="bg-white/80 border border-[#e5e1d8] rounded-2xl p-4 text-center shadow-2xs flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#005039]/10 text-[#005039] font-black text-sm flex items-center justify-center mb-2">
              ۲
            </div>
            <h3 className="text-sm font-bold text-[#1c2826] font-urdu">
              دکان پر جائیں 🏪
            </h3>
            <p className="text-xs text-[#556960] mt-1">
              انٹرنیٹ بند بھی ہو تو پریشانی نہیں، لسٹ فون میں کھلی رہے گی!
            </p>
          </div>

          <div className="bg-white/80 border border-[#e5e1d8] rounded-2xl p-4 text-center shadow-2xs flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-2">
              ۳
            </div>
            <h3 className="text-sm font-bold text-[#1c2826] font-urdu">
              ٹک کریں ✅
            </h3>
            <p className="text-xs text-[#556960] mt-1">
              چیز تھیلے میں ڈالی، انگلی سے دبایا اور ٹک ہو گیا!
            </p>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* INTERACTIVE PLAYGROUND CARD (Live demo an 8-year-old can play with!) */}
        {/* ==================================================================== */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-[#005039]/20 shadow-md p-5 sm:p-6 relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#f2efe9]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center text-lg">
                🛒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1c2826]">
                    امتحانی لسٹ (خود چلا کر دیکھیں)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Try it now
                  </span>
                </div>
                <p className="text-xs text-[#556960]">
                  کسی بھی چیز پر کلک کریں تاکہ وہ ٹک ہو جائے
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetDemo}
                title="Reset list"
                className="p-1.5 rounded-lg text-outline hover:text-[#005039] hover:bg-[#faf8f5] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#005039] bg-[#005039]/10 px-2.5 py-1 rounded-full">
                {completedCount}/{demoItems.length}
              </span>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="my-3 bg-[#faf8f5] rounded-xl p-2.5 border border-[#e5e1d8]/70 flex items-center justify-between text-xs">
            <span className="text-[#3d5046] font-medium">
              {isAllCompleted
                ? '🎉 زبردست! سب چیزیں مل گئیں، اب گھر چلیں!'
                : `${completedCount} چیز مل گئی، باقی ${demoItems.length - completedCount} لینا رہتی ہیں`}
            </span>
            <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#005039] h-2 transition-all duration-300 rounded-full"
                style={{ width: `${(completedCount / Math.max(demoItems.length, 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-[#f5f2ec]">
            {demoItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleDemoItem(item.id)}
                className={`py-3 flex items-center justify-between group cursor-pointer select-none transition-all px-2.5 rounded-xl ${
                  item.completed ? 'bg-emerald-50/50' : 'hover:bg-[#faf8f5]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      item.completed
                        ? 'bg-[#005039] border-[#005039] text-white scale-105'
                        : 'border-[#c5bfb4] bg-white group-hover:border-[#005039]'
                    }`}
                  >
                    {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div className="truncate flex items-center gap-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span
                      className={`text-sm font-medium transition-all ${
                        item.completed
                          ? 'line-through text-[#8b9992]'
                          : 'text-[#1c2826] font-bold'
                      }`}
                    >
                      {item.nameEn}
                    </span>
                    <span className="text-xs text-[#b0a99c]">•</span>
                    <span
                      className={`text-xs font-urdu ${
                        item.completed ? 'text-[#8b9992] line-through' : 'text-[#556960]'
                      }`}
                    >
                      {item.nameUr}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f3efe6] text-[#3d5046] shrink-0">
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Quick-add chips to show how easy it is */}
          <div className="mt-4 pt-3 border-t border-[#f2efe9]">
            <p className="text-[11px] font-bold text-[#556960] mb-2 font-urdu">
              کچھ اور شامل کر کے دیکھیں:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addQuickItem('Chocolate', 'چاکلیٹ', '1 Bar', '🍫')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#005039]" />
                <span>🍫 چاکلیٹ</span>
              </button>
              <button
                type="button"
                onClick={() => addQuickItem('Juice', 'جوس', '1 Pack', '🧃')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#005039]" />
                <span>🧃 جوس</span>
              </button>
              <button
                type="button"
                onClick={() => addQuickItem('Dahi (Yogurt)', 'دہی', '1 پاؤ', '🥣')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#faf8f5] hover:bg-[#f0ebe1] border border-[#e5e1d8] text-[#1c2826] font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#005039]" />
                <span>🥣 دہی (1 پاؤ)</span>
              </button>
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="mt-4 pt-3 border-t border-[#f2efe9] flex items-center justify-between text-xs text-[#556960]">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              انٹرنیٹ کے بغیر بھی کام کرتا ہے
            </span>
            <button
              type="button"
              onClick={onGetStarted}
              className="text-[#005039] font-bold hover:underline cursor-pointer"
            >
              اپنی اصلی لسٹ بنائیں &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. THREE CORE PILLARS (Simple Words for 8-Year-Old + Preserves Tests) */}
      {/* ==================================================================== */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#e5e1d8]">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c2826] tracking-tight">
            یہ ایپ اتنی آسان کیوں ہے؟
          </h2>
          <p className="text-xs sm:text-sm text-[#556960] mt-2">
            کسی مشکل مینو یا الجھن کے بغیر — صرف ۳ بنیادی چیزیں
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Fast, Clutter-Free Lists */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c2826] mb-2">
                Fast, Clutter-Free Lists
              </h3>
              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                کاغذ اور پینسل کی طرح آسان! دکان جانے سے پہلے جو چاہیے لکھ لیں، اور سودا لیتے ہی ٹک کر دیں۔ کوئی فالتو بٹن نہیں۔
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
              سودا سلف کی آسان فہرست
            </div>
          </div>

          {/* Pillar 2: Pakistani Units & Rashan */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c2826] mb-2">
                Pakistani Units &amp; Rashan
              </h3>
              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                پاؤ، کلو، درجن اور دھڑی — وہی الفاظ جو دکاندار بولتا ہے۔ ساتھ ہی پورے مہینے کے راشن کی ریڈی میڈ لسٹ بھی موجود ہے۔
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
              روایتی پیمانے اور راشن
            </div>
          </div>

          {/* Pillar 3: Private & Secure Sync */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 shadow-2xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1c2826] mb-2">
                Private &amp; Secure Sync
              </h3>
              <p className="text-xs sm:text-sm text-[#556960] leading-relaxed">
                امی، ابو یا آپ — کسی بھی فون پر گوگل سے کھولیں، لسٹ سامنے آ جائے گی۔ آپ کا ڈیٹا ۱۰۰٪ محفوظ اور نجی رہتا ہے۔
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#f2efe9] text-xs font-bold text-[#005039]">
              محفوظ اور نجی ڈیٹا
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. GOOGLE OAUTH TRANSPARENCY & PRIVACY NOTICE (Reviewer Compliance) */}
      {/* ==================================================================== */}
      <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-[#e5e1d8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1c2826]">
                Why YAAD Uses Google Authentication &amp; Data Transparency
              </h3>
              <p className="text-xs text-[#556960]">
                We request your basic Google profile (Name and Email) strictly to identify your account and sync lists across your devices.
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

      {/* ==================================================================== */}
      {/* 5. PROFESSIONAL REORGANIZED FOOTER WITH BLOG & EDITORIAL SECTION */}
      {/* ==================================================================== */}
      <footer className="mt-12 border-t border-[#e5e1d8] bg-white pt-12 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#e5e1d8]">
          {/* Col 1: Brand & Verified Domain */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="YAAD" className="w-7 h-7 object-contain" />
              <span className="font-bold text-base text-[#1c2826]">YAAD</span>
              <span className="font-urdu text-sm text-[#005039] font-semibold">یاد</span>
            </div>
            <p className="text-xs text-[#556960] leading-relaxed">
              Thoughtful shopping memory and monthly rashan checklist for Pakistani households. Built for real kiryana trips.
            </p>
            <div className="pt-1 text-[11px] text-[#556960]">
              <span className="text-[#788880]">Verified Home:</span>{' '}
              <span className="font-mono text-[#005039] font-medium">yaadapppk.vercel.app</span>
            </div>
          </div>

          {/* Col 2: App & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
              App &amp; Features
            </h4>
            <ul className="space-y-2 text-xs text-[#556960]">
              <li>
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Open Shopping Lists
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenRashanList}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Monthly Rashan Guide (ماہانہ راشن)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('about')}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  About YAAD
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('help')}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Help &amp; FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: YAAD Blog & Articles */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-[#005039]" />
              <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
                YAAD Blog &amp; Guides
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-[#556960]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('blog')}
                  className="text-[#005039] font-bold hover:underline transition-colors cursor-pointer"
                >
                  Browse All Articles (بلاگ) &rarr;
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('blog')}
                  className="hover:text-[#005039] transition-colors cursor-pointer text-left"
                >
                  5 Smart Ways to Plan Monthly Rashan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('blog')}
                  className="hover:text-[#005039] transition-colors cursor-pointer text-left"
                >
                  Understanding Pakistani Units: Pao &amp; Dharri
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('blog')}
                  className="hover:text-[#005039] transition-colors cursor-pointer text-left"
                >
                  Offline Shopping in Basement Bazaars
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Legal & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
              Privacy &amp; Contact
            </h4>
            <ul className="space-y-2 text-xs text-[#556960]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('privacy')}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('terms')}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalPage('legal')}
                  className="hover:text-[#005039] transition-colors cursor-pointer"
                >
                  Legal Information Hub
                </button>
              </li>
              <li className="pt-1">
                <a
                  href="mailto:yaadapppk@gmail.com"
                  className="text-[#005039] font-medium hover:underline"
                >
                  yaadapppk@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#788880]">
          <p>&copy; {new Date().getFullYear()} YAAD (یاد). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenLegalPage('privacy')}
              className="hover:text-[#1c2826] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => onOpenLegalPage('terms')}
              className="hover:text-[#1c2826] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => onOpenLegalPage('blog')}
              className="hover:text-[#1c2826] transition-colors cursor-pointer"
            >
              Blog
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
