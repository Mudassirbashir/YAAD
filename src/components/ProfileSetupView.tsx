import React, { useState, useEffect } from 'react';
import {
  User,
  Globe,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { Avatar } from './Avatar';

interface ProfileSetupViewProps {
  onComplete: () => void;
}

export const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({ onComplete }) => {
  const { user, profile, updateUserProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language || 'en');
  const [usagePurpose, setUsagePurpose] = useState<string>('');
  const [referralSource, setReferralSource] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    } else if (user?.user_metadata?.name) {
      setFullName(user.user_metadata.name);
    }
  }, [profile, user]);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage(t('profileSetup.nameRequired') || 'Please enter your name to continue.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await updateUserProfile({
        full_name: fullName.trim(),
        language: selectedLanguage,
        usage_purpose: usagePurpose || undefined,
        referral_source: referralSource || undefined,
        has_completed_setup: true,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      // Mark locally as well
      localStorage.setItem('yaad_profile_setup_done', 'true');
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error completing setup';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const usageOptions = [
    { id: 'groceries', label: t('profileSetup.usageOptionGroceries') || 'Weekly Groceries & Staples', icon: '🛒' },
    { id: 'household', label: t('profileSetup.usageOptionHousehold') || 'Household & Personal Care', icon: '🧴' },
    { id: 'party', label: t('profileSetup.usageOptionParty') || 'Events, Parties & Gatherings', icon: '🎉' },
    { id: 'family', label: t('profileSetup.usageOptionFamily') || 'Family & Daily Errands', icon: '👨‍👩‍👧' },
    { id: 'other', label: t('profileSetup.usageOptionOther') || 'General Shopping & To-Do', icon: '📝' },
  ];

  const referralOptions = [
    { id: 'friends', label: t('profileSetup.referralFriends') || 'Friends or Family' },
    { id: 'social', label: t('profileSetup.referralSocial') || 'Social Media' },
    { id: 'search', label: t('profileSetup.referralSearch') || 'Search Engine (Google)' },
    { id: 'app_store', label: t('profileSetup.referralAppStore') || 'App Store / Recommendation' },
    { id: 'other', label: t('profileSetup.referralOther') || 'Other' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-dim space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary tracking-tight">
            {t('profileSetup.title') || 'Welcome to YAAD!'}
          </h1>
          <p className="font-['Manrope'] text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {t('profileSetup.subtitle') || "Let's personalize your shopping experience in two quick steps."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-error-container/30 border border-error/30 rounded-2xl text-xs text-error font-['Manrope'] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Name (Required) */}
          <div className="space-y-1.5">
            <label className="font-['Manrope'] text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{t('profileSetup.nameLabel') || 'Your Full Name'}</span>
              <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('profileSetup.namePlaceholder') || 'e.g. Sara Ahmed'}
                className="w-full h-12 bg-surface-container text-on-surface font-['Manrope'] text-sm rounded-2xl px-4 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                autoFocus
              />
            </div>
          </div>

          {/* Preferred Language (Required) */}
          <div className="space-y-2">
            <label className="font-['Manrope'] text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{t('profileSetup.languageLabel') || 'Preferred Language'}</span>
              <span className="text-error">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageSelect('en')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedLanguage === 'en'
                    ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-xs'
                    : 'border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="block font-['Plus_Jakarta_Sans'] text-xs font-bold">English</span>
                <span className="text-[10px] text-on-surface-variant">Default</span>
              </button>

              <button
                type="button"
                onClick={() => handleLanguageSelect('roman-urdu')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedLanguage === 'roman-urdu'
                    ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-xs'
                    : 'border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="block font-['Plus_Jakarta_Sans'] text-xs font-bold">Roman Urdu</span>
                <span className="text-[10px] text-on-surface-variant">Aasan</span>
              </button>

              <button
                type="button"
                onClick={() => handleLanguageSelect('ur')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedLanguage === 'ur'
                    ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-xs'
                    : 'border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="block font-['Plus_Jakarta_Sans'] text-xs font-bold">اردو</span>
                <span className="text-[10px] text-on-surface-variant">Urdu</span>
              </button>
            </div>
          </div>

          {/* Usage Purpose (Optional) */}
          <div className="space-y-2 pt-1">
            <label className="font-['Manrope'] text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span>{t('profileSetup.usageLabel') || 'What do you mainly use YAAD for? (Optional)'}</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {usageOptions.map((opt) => {
                const isSelected = usagePurpose === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUsagePurpose(isSelected ? '' : opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-['Manrope'] transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/60'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Referral Source (Optional) */}
          <div className="space-y-1.5 pt-1">
            <label className="font-['Manrope'] text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>{t('profileSetup.referralLabel') || 'How did you hear about YAAD? (Optional)'}</span>
            </label>

            <select
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full h-11 bg-surface-container text-on-surface font-['Manrope'] text-xs rounded-2xl px-3.5 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="">Select an option (optional)</option>
              {referralOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-primary text-on-primary font-['Manrope'] text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('profileSetup.saving') || 'Setting up your profile...'}</span>
              </>
            ) : (
              <>
                <span>{t('profileSetup.submitBtn') || 'Save & Start Shopping'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
