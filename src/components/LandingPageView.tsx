import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowRight,
  ShoppingBag,
  Globe,
  Lock,
  Smartphone,
  ExternalLink,
  HelpCircle,
  FileText,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { User } from '@supabase/supabase-js';

interface LandingPageViewProps {
  user: User | null;
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenLegalPage: (page: 'about' | 'privacy' | 'terms' | 'help' | 'legal') => void;
  onOpenRashanList: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  onGetStarted,
  onSignIn,
  onOpenLegalPage,
  onOpenRashanList,
}) => {
  const { language, setLanguage, isRTL } = useLanguage();

  return (
    <div
      className={`min-h-screen bg-[#fbf9f5] text-[#1c2826] font-sans antialiased selection:bg-[#005039]/15 selection:text-[#005039] ${
        isRTL ? 'rtl' : 'ltr'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. TOP HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e5e1d8]/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="YAAD Logo"
              className="w-9 h-9 object-contain drop-shadow-sm rounded-lg"
              onError={(e) => {
                // fallback if needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#005039]">YAAD</span>
              <span className="text-sm font-semibold text-[#005039]/80 bg-[#005039]/10 px-1.5 py-0.5 rounded text-xs font-urdu">
                یاد
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#556960]">
            <button
              onClick={() => onOpenLegalPage('about')}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'ہمارے متعلق' : language === 'roman-urdu' ? 'About' : 'About'}
            </button>
            <button
              onClick={onOpenRashanList}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'ماہانہ راشن' : language === 'roman-urdu' ? 'Rashan List' : 'Rashan List'}
            </button>
            <button
              onClick={() => onOpenLegalPage('help')}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'مدد اور رہنمائی' : language === 'roman-urdu' ? 'Help' : 'Help & FAQ'}
            </button>
            <button
              onClick={() => onOpenLegalPage('privacy')}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'پرائیویسی' : language === 'roman-urdu' ? 'Privacy' : 'Privacy'}
            </button>
          </nav>

          {/* Language Selector & Auth CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Language Pill Switcher */}
            <div className="flex items-center bg-white border border-[#e5e1d8] rounded-full p-0.5 text-xs font-medium shadow-2xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#005039] text-white font-semibold'
                    : 'text-[#556960] hover:text-[#1c2826]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-2 py-1 rounded-full font-urdu transition-all cursor-pointer ${
                  language === 'ur'
                    ? 'bg-[#005039] text-white font-semibold'
                    : 'text-[#556960] hover:text-[#1c2826]'
                }`}
              >
                اردو
              </button>
              <button
                onClick={() => setLanguage('roman-urdu')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'roman-urdu'
                    ? 'bg-[#005039] text-white font-semibold'
                    : 'text-[#556960] hover:text-[#1c2826]'
                }`}
              >
                Roman
              </button>
            </div>

            {/* User Auth Action */}
            {user ? (
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 bg-[#005039] hover:bg-[#00402e] text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>{language === 'ur' ? 'ڈیش بورڈ کھولیں' : 'Go to Lists'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onSignIn}
                  className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-[#005039] hover:text-[#00402e] px-3 py-2 transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'لاگ ان' : language === 'roman-urdu' ? 'Sign In' : 'Sign In'}
                </button>
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-1.5 bg-[#005039] hover:bg-[#00402e] text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>{language === 'ur' ? 'شروع کریں' : language === 'roman-urdu' ? 'Shuru Karein' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. AUTHENTICATED USER GREETING BANNER (If already logged in) */}
      {user && (
        <aside aria-label="Account status" className="bg-[#005039]/10 border-b border-[#005039]/20 py-2.5 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs sm:text-sm text-[#005039]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'ur'
                  ? `خوش آمدید! آپ سائن ان ہیں (${user.email || 'صارف'})`
                  : `Signed in as ${user.email || 'User'}`}
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="font-semibold underline hover:no-underline cursor-pointer"
            >
              {language === 'ur' ? 'اپنا سودا سلف دیکھیں ←' : 'Open Shopping Lists →'}
            </button>
          </div>
        </aside>
      )}

      {/* 3. HERO SECTION */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        {/* Subtle Brand Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#e5e1d8] rounded-full px-3.5 py-1.5 mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#005039]" />
          <span className="text-xs sm:text-sm font-medium text-[#556960]">
            {language === 'ur'
              ? 'سودا سلف یاد رکھنے کی آسان ایپ'
              : language === 'roman-urdu'
              ? 'Sauda salaf yaad rakhne ki aasan app'
              : 'Smart Shopping Memory & Grocery Reminder'}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1c2826] tracking-tight leading-[1.15] mb-5">
          {language === 'ur' ? (
            <span className="font-urdu leading-relaxed">
              کبھی سودا سلف مت بھولیں
            </span>
          ) : language === 'roman-urdu' ? (
            <span>
              Ghar aa kar yaad aya... <br />
              <span className="text-[#005039]">Shop pe ja kar yaad aya.</span>
            </span>
          ) : (
            <span>
              Never forget what you <br />
              <span className="text-[#005039]">went to the shop to buy.</span>
            </span>
          )}
        </h1>

        {/* Short Relatable Description */}
        <p className="text-base sm:text-lg text-[#556960] max-w-2xl mx-auto mb-8 leading-relaxed">
          {language === 'ur'
            ? 'یاد (YAAD) ایک آسان شاپنگ لسٹ ایپ ہے جو آپ کو سودا سلف اور ماہانہ راشن خریدتے وقت ضروری اشیاء یاد رکھنے میں مدد دیتی ہے۔'
            : language === 'roman-urdu'
            ? 'YAAD ek aasan shopping list app hai jo grocery, rashan aur rozmarrah ki zaroori cheezein yaad rakhne mein madad karti hai.'
            : 'YAAD is a simple, smart shopping reminder built for everyday households. Create grocery lists in seconds, shop with confidence, and never leave essentials behind.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#005039] hover:bg-[#00402e] text-white font-semibold text-base px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>{user ? 'Open Shopping Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRashanList}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f2efe9] text-[#1c2826] font-semibold text-base px-5 py-3.5 rounded-2xl border border-[#e5e1d8] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#005039]" />
            <span>{language === 'ur' ? 'راشن لسٹ گائیڈ' : 'Explore Rashan List'}</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#556960] font-medium pt-2">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#005039]" />
            100% Free to Use
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#005039]" />
            English &amp; اردو Support
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#005039]" />
            Google Secure Sign-In
          </span>
        </div>
      </section>

      {/* 4. THE 3 CORE PILLARS (Clean, Focused, 3 Points as requested) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#e5e1d8]">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2826] mb-3">
            {language === 'ur'
              ? 'یاد ایپ آپ کی مدد کیسے کرتی ہے؟'
              : language === 'roman-urdu'
              ? 'YAAD kaise madad karti hai?'
              : 'How YAAD Solves Everyday Shopping'}
          </h2>
          <p className="text-sm text-[#556960]">
            {language === 'ur'
              ? 'تین آسان طریقوں سے آپ کے روزمرہ سودا سلف کا مکمل حل'
              : 'Three simple pillars designed around real everyday shopping habits.'}
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Point 1: Create & Check Off */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-5">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1c2826] mb-2.5">
                {language === 'ur'
                  ? 'سودا سلف کی آسان فہرست'
                  : language === 'roman-urdu'
                  ? 'Aasan Shopping List'
                  : 'Fast, Clutter-Free Lists'}
              </h3>
              <p className="text-sm text-[#556960] leading-relaxed">
                {language === 'ur'
                  ? 'گھر سے نکلنے سے پہلے مطلوبہ اشیاء درج کریں۔ دکان پر ایک ہی ٹچ میں اشیاء چیک آف کریں تاکہ کچھ رہ نہ جائے۔'
                  : language === 'roman-urdu'
                  ? 'Dukaan jaane se pehle zaroori items add karein aur shop par ek click se check-off karein.'
                  : 'Jot down needed items before heading to the market. Check them off one-by-one as you shop so you never miss a single item.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#f2efe9] text-xs font-semibold text-[#005039] flex items-center gap-1">
              <span>{language === 'ur' ? 'تیز اور آسان' : 'Effortless checklist'}</span>
            </div>
          </div>

          {/* Point 2: Pakistani Households & Units */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1c2826] mb-2.5">
                {language === 'ur'
                  ? 'روایتی پیمانے اور راشن'
                  : language === 'roman-urdu'
                  ? 'Pakistani Units & Rashan'
                  : 'Pakistani Units & Rashan'}
              </h3>
              <p className="text-sm text-[#556960] leading-relaxed">
                {language === 'ur'
                  ? 'پاکستانی گھرانوں کے لیے روایتی پیمانے (پاؤ، کلو، درجن) اور مکمل ماہانہ راشن لسٹ جو اردو اور انگلش دونوں میں دستیاب ہے۔'
                  : language === 'roman-urdu'
                  ? 'Traditional Pakistani units (páo, kg, darjan) aur monthly rashan template Urdu aur English mein.'
                  : 'Built specifically for everyday grocery routines with full support for local Pakistani units (páo, kg, darjan) and curated monthly rashan guides.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#f2efe9] text-xs font-semibold text-[#005039] flex items-center gap-1">
              <span>{language === 'ur' ? 'پاؤ، کلو، درجن' : 'Native units supported'}</span>
            </div>
          </div>

          {/* Point 3: Secure Sync & Privacy */}
          <div className="bg-white border border-[#e5e1d8] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#005039]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#005039]/10 text-[#005039] flex items-center justify-center mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1c2826] mb-2.5">
                {language === 'ur'
                  ? 'محفوظ اور نجی ڈیٹا'
                  : language === 'roman-urdu'
                  ? 'Mehfooz Aur Private'
                  : 'Private & Secure Sync'}
              </h3>
              <p className="text-sm text-[#556960] leading-relaxed">
                {language === 'ur'
                  ? 'گوگل اکاؤنٹ کے ذریعے محفوظ لاگ ان تاکہ آپ کی لسٹس آپ کے موبائل اور کمپیوٹر پر ہمیشہ ہم آہنگ رہیں۔ آپ کا ڈیٹا مکمل طور پر نجی ہے۔'
                  : language === 'roman-urdu'
                  ? 'Google sign-in ke zariye aapki lists har device par sync rehti hain aur data hamesha private rehta hai.'
                  : 'Sign in smoothly with your Google account to back up and synchronize lists across your phone, tablet, and browser. Your data is strictly private.'}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#f2efe9] text-xs font-semibold text-[#005039] flex items-center gap-1">
              <span>{language === 'ur' ? 'گوگل سے تصدیق' : 'Google Auth protected'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DATA TRANSPARENCY & GOOGLE OAUTH COMPLIANCE (Explicitly meeting Google Review Criteria) */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-[#e5e1d8] rounded-3xl p-6 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#005039]/10 text-[#005039] flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1c2826]">
                {language === 'ur'
                  ? 'گوگل اکاؤنٹ اور رازداری کی تفصیل • ڈیٹا کی شفافیت'
                  : 'Why YAAD Uses Google Authentication & Data Transparency'}
              </h3>
              <p className="text-xs sm:text-sm text-[#556960] mt-1">
                {language === 'ur'
                  ? 'یاد ایپ آپ کی رازداری کا احترام کرتی ہے۔ جانیے کہ ہم آپ کا ڈیٹا کس مقصد کے لیے استعمال کرتے ہیں۔'
                  : 'YAAD is committed to complete transparency regarding how your data is accessed, stored, and protected.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Box 1: Why Google Sign-In */}
            <div className="bg-[#fbf9f5] border border-[#e5e1d8]/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#1c2826]">
                <Lock className="w-4 h-4 text-[#005039]" />
                <span>
                  {language === 'ur' ? 'گوگل سائن ان کا مقصد' : 'Purpose of Google Sign-In'}
                </span>
              </div>
              <p className="text-xs text-[#556960] leading-relaxed">
                {language === 'ur'
                  ? 'ہم صرف آپ کا بنیادی نام اور ای میل استعمال کرتے ہیں تاکہ آپ کی خریداری کی لسٹیں محفوظ طریقے سے آپ کے اکاؤنٹ کے ساتھ وابستہ رہیں۔'
                  : 'We request your basic Google profile (Name and Email) strictly to authenticate your account and securely back up your personal shopping lists across your devices.'}
              </p>
            </div>

            {/* Box 2: What we NEVER access */}
            <div className="bg-[#fbf9f5] border border-[#e5e1d8]/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#1c2826]">
                <CheckCircle2 className="w-4 h-4 text-[#005039]" />
                <span>
                  {language === 'ur' ? 'ہم کیا حاصل نہیں کرتے' : 'What We Never Access'}
                </span>
              </div>
              <p className="text-xs text-[#556960] leading-relaxed">
                {language === 'ur'
                  ? 'ہم آپ کے جی میل، رابطوں، گوگل ڈرائیو یا مقام کا کوئی ڈیٹا طلب نہیں کرتے۔ آپ کا ذاتی ڈیٹا کبھی بھی فروخت یا شیئر نہیں کیا جاتا۔'
                  : 'YAAD never accesses your Gmail, contacts, Google Drive files, or calendar. We do not track you for ads, and your data is never sold or shared with third parties.'}
              </p>
            </div>
          </div>

          {/* User Data Deletion & Consent Links */}
          <div className="border-t border-[#e5e1d8] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#556960]">
            <span>
              {language === 'ur'
                ? 'آپ کسی بھی وقت سیٹنگز سے اپنا ڈیٹا اور اکاؤنٹ مستقل طور پر ڈیلیٹ کر سکتے ہیں۔'
                : 'You have full control to export or permanently delete your shopping lists and account at any time.'}
            </span>
            <div className="flex flex-wrap items-center gap-4 font-semibold text-[#005039] shrink-0">
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage('privacy');
                }}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage('terms');
                }}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </a>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage('help');
                }}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help &amp; FAQ</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="bg-[#005039] text-white rounded-3xl p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {language === 'ur'
              ? 'آج ہی اپنی شاپنگ لسٹ بنائیں'
              : language === 'roman-urdu'
              ? 'Aaj hi apni shopping list banayein'
              : 'Ready to remember everything you need?'}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-md mx-auto mb-6">
            {language === 'ur'
              ? 'کوئی فیس نہیں، کوئی غیر ضروری اشتہارات نہیں — بس آسان اور تیز سودا سلف۔'
              : 'No hidden fees, no unnecessary noise. Just a fast, reliable shopping memory.'}
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-white text-[#005039] hover:bg-[#fbf9f5] font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <span>{user ? 'Open Dashboard' : 'Open YAAD App'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-10 border-t border-[#e5e1d8] bg-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#556960]">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="YAAD" className="w-6 h-6 object-contain" />
            <span className="font-semibold text-[#1c2826]">YAAD (یاد)</span>
            <span className="text-xs text-[#556960]">
              &copy; {new Date().getFullYear()} YAAD. All rights reserved.
            </span>
          </div>

          {/* Legal and Compliance Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegalPage('about');
              }}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              About
            </a>
            <a
              href="/rashan-list"
              onClick={(e) => {
                e.preventDefault();
                onOpenRashanList();
              }}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              Monthly Rashan List
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegalPage('privacy');
              }}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegalPage('terms');
              }}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              href="/help"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegalPage('help');
              }}
              className="hover:text-[#005039] transition-colors cursor-pointer"
            >
              Help &amp; FAQ
            </a>
            <a
              href="mailto:useyaadapp@gmail.com"
              className="hover:text-[#005039] transition-colors"
            >
              useyaadapp@gmail.com
            </a>
          </div>
        </div>

        {/* Verification & Domain Notice */}
        <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-[#f2efe9] text-center text-xs text-[#556960]/80">
          Official Domain: <span className="font-mono text-[#005039]">https://yaadapppk.vercel.app</span>
        </div>
      </footer>
    </div>
  );
};
