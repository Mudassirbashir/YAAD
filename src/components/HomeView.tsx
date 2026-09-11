import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { Avatar } from './Avatar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RecommendationCandidate } from '../lib/recommendations';
import { GroceryBasketIllustration } from './GroceryBasketIllustration';
import { EssentialDisplayItem } from '../lib/recommendations/popularEssentials';
import { ShoppingStatisticsModal } from './ShoppingStatisticsModal';
import { QuickFavoritesModal } from './QuickFavoritesModal';
import { CategoryBrowserModal } from './CategoryBrowserModal';
import { PhoneNumberNotification } from './home/PhoneNumberNotification';
import { PasskeyCard } from './home/PasskeyCard';
import { QuickActionsGrid } from './home/QuickActionsGrid';
import { FrequentEssentialsSection } from './home/FrequentEssentialsSection';
import { HomeListsSection } from './home/HomeListsSection';

interface HomeViewProps {
  lists: ShoppingList[];
  onCreateList: () => void;
  onSelectList: (list: ShoppingList | string) => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  onOpenHistory?: () => void;
  onEditList?: (listId: string) => void;
  onDeleteList?: (listId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onQuickAddRecommendation?: (item: RecommendationCandidate, targetListId?: string) => void;
  onOpenStatistics?: () => void;
  onOpenPhoneSettings?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lists,
  onCreateList,
  onSelectList,
  onOpenProfile,
  onOpenMenu,
  onOpenHistory,
  onEditList,
  onDeleteList,
  isLoading = false,
  error = null,
  onRetry,
  onQuickAddRecommendation,
  onOpenStatistics,
  onOpenPhoneSettings,
}) => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();

  // Modals visibility states
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isCategoryBrowserOpen, setIsCategoryBrowserOpen] = useState(false);

  // Find most recent active (non-completed) list
  const mostRecentActiveList = useMemo(() => {
    return lists.find((l) => !l.isCompleted);
  }, [lists]);

  // Determine time-of-day greeting with user first name
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = t('home.greeting');
    if (hour < 12) {
      timeGreeting = t('home.goodMorning');
    } else if (hour < 17) {
      timeGreeting = t('home.goodAfternoon');
    } else {
      timeGreeting = t('home.goodEvening');
    }

    const rawName =
      profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (rawName && typeof rawName === 'string') {
      const firstName = rawName.trim().split(' ')[0];
      if (language === 'ur') {
        return `${timeGreeting}، ${firstName} 👋`;
      }
      return `${timeGreeting}, ${firstName} 👋`;
    }

    return `${timeGreeting} 👋`;
  }, [profile, user, t, language]);

  // Handle adding an essential item to the current list or creating a new list
  const handleAddEssentialItem = (item: EssentialDisplayItem) => {
    const candidate: RecommendationCandidate = {
      profile: {
        id: `essential_${item.canonicalName}`,
        userId: user?.id || '',
        canonicalName: item.canonicalName,
        displayName: item.displayName,
        nameUrdu: item.nameUrdu,
        nameRomanUrdu: item.nameRomanUrdu,
        category: item.category as CategoryId,
        purchaseCount: item.purchaseCount || 1,
        firstPurchasedAt: new Date().toISOString(),
        lastPurchasedAt: new Date().toISOString(),
        purchaseHistory: [],
        averageIntervalDays: 7,
        intervalStdDevDays: 0,
        purchaseFrequency: 'weekly',
        preferredQuantity: item.quantity,
        preferredUnit: item.unit,
        quantityFrequencies: { [item.quantity]: 1 },
        unitFrequencies: { [item.unit]: 1 },
        weekdayDistribution: [0, 0, 0, 0, 0, 0, 0],
        dismissalCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      canonicalName: item.canonicalName,
      displayName: item.displayName,
      nameUrdu: item.nameUrdu,
      nameRomanUrdu: item.nameRomanUrdu,
      category: item.category as CategoryId,
      suggestedQuantity: item.quantity,
      suggestedUnit: item.unit,
      score: item.score || 1.0,
      confidence: 1.0,
      explanation: {
        type: item.isPersonalized ? 'recent_repeat' : 'popular_starter',
        textKey: item.isPersonalized
          ? 'recommendations.reasons.frequentlyPurchased'
          : 'recommendations.reasons.frequentStaple',
      },
      isStarterCatalog: !item.isPersonalized,
      scoringFactors: {
        frequencyScore: 1,
        confidence: 1,
        dismissalPenalty: 1,
        totalScore: 1,
      },
    };

    if (onQuickAddRecommendation) {
      onQuickAddRecommendation(candidate, mostRecentActiveList?.id);
    } else {
      onCreateList();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-primary-container selection:text-on-primary-container">
      {/* 1. TOP HEADER (Height 56px, original YAAD logo, centered title, settings gear) */}
      <TopHeader
        title={t('appName')}
        onSettingsClick={onOpenProfile || onOpenMenu}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
      />

      {/* Main Content Feed */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 flex flex-col gap-5 sm:gap-6">
        {/* 2. PERSONALIZED GREETING & AVATAR */}
        <section
          id="home_greeting_section"
          className="flex items-center justify-between gap-3 select-none"
        >
          <div className="flex flex-col min-w-0">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[26px] font-bold text-on-surface tracking-tight leading-tight truncate">
              {greetingText}
            </h1>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5 font-normal">
              {t('home.subtitle') || 'What would you like to buy today?'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open Profile & Settings"
            className="w-10 h-10 rounded-full ring-2 ring-surface-dim hover:ring-primary/40 active:scale-95 transition-all shrink-0 cursor-pointer overflow-hidden flex items-center justify-center bg-surface-container"
          >
            <Avatar
              name={profile?.full_name || user?.email || 'User'}
              avatarUrl={profile?.avatar_url}
              size="md"
            />
          </button>
        </section>

        {/* 3. NON-BLOCKING PHONE NUMBER NOTIFICATION (At top of Home if missing) */}
        <PhoneNumberNotification
          user={user}
          profile={profile}
          onOpenPhoneSettings={onOpenPhoneSettings || onOpenProfile}
        />

        {/* 4. COMPACT STATE-AWARE PASSKEY CARD ("Passkey Ready" or "Set Up") */}
        <PasskeyCard onOpenSecuritySettings={onOpenProfile} />

        {/* 5. PRIMARY ACTION: CREATE NEW LIST CARD */}
        <section aria-label={t('home.createListTitle') || 'Create New List'}>
          <div
            id="home_create_list_btn"
            role="button"
            tabIndex={0}
            onClick={onCreateList}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCreateList();
              }
            }}
            className="w-full min-h-[112px] sm:min-h-[116px] rounded-2xl sm:rounded-3xl bg-primary hover:bg-primary-container p-4 sm:p-5 text-on-primary flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(15,61,46,0.18)] hover:shadow-[0_6px_22px_rgba(15,61,46,0.25)] cursor-pointer relative overflow-hidden transition-all duration-200 active:scale-[0.99] select-none group border border-primary-container/40"
          >
            {/* Left side: Plus icon + titles */}
            <div className="flex items-center gap-3.5 min-w-0 z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15 shadow-2xs group-hover:bg-white/20 transition-all">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.4] transition-transform duration-300 group-hover:rotate-90" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  {t('home.createListTitle')}
                </h2>
                <p className="font-['Manrope'] text-xs sm:text-[13px] text-emerald-100/90 mt-1 font-normal leading-snug">
                  {t('home.createListDesc')}
                </p>
              </div>
            </div>

            {/* Right side: Grocery Basket Visual & Circular Arrow */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-10">
              <div className="hidden xs:block relative transform group-hover:scale-105 transition-all duration-300">
                <GroceryBasketIllustration size={76} />
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 group-hover:scale-105 transition-all rtl:rotate-180 border border-white/20 shadow-2xs">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. QUICK ACTIONS SHORTCUTS GRID */}
        <QuickActionsGrid
          onOpenRecentLists={onOpenHistory || (() => onSelectList('recent'))}
          onOpenFavorites={() => setIsFavoritesModalOpen(true)}
          onOpenCategories={() => setIsCategoryBrowserOpen(true)}
          onOpenStatistics={() => {
            if (onOpenStatistics) {
              onOpenStatistics();
            } else {
              setIsStatsModalOpen(true);
            }
          }}
        />

        {/* 7. FREQUENT ESSENTIALS SECTION (Quick-add with real user behavior / curated staples) */}
        <FrequentEssentialsSection
          lists={lists}
          mostRecentActiveList={mostRecentActiveList}
          onAddItem={handleAddEssentialItem}
          onViewAllCategories={() => setIsCategoryBrowserOpen(true)}
        />

        {/* 8. SHOPPING LISTS SECTION (Responsive skeletons, friendly empty state, populated lists) */}
        <HomeListsSection
          lists={lists}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          onCreateList={onCreateList}
          onSelectList={(selected) => onSelectList(selected)}
          onOpenHistory={onOpenHistory}
          onEditList={onEditList}
          onDeleteList={onDeleteList}
        />
      </main>

      {/* MODALS */}
      {/* 1. Statistics Modal */}
      <ShoppingStatisticsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        lists={lists}
        isLoading={isLoading}
        onViewFullStatistics={onOpenStatistics}
      />

      {/* 2. Quick Favorites Modal */}
      <QuickFavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        onAddItem={(item) => {
          if (onQuickAddRecommendation) {
            onQuickAddRecommendation(item, mostRecentActiveList?.id);
          } else {
            onCreateList();
          }
        }}
        activeListTitle={mostRecentActiveList?.title}
      />

      {/* 3. Category & All Items Browser Modal */}
      <CategoryBrowserModal
        isOpen={isCategoryBrowserOpen}
        onClose={() => setIsCategoryBrowserOpen(false)}
        onAddItem={(item) => {
          if (onQuickAddRecommendation) {
            onQuickAddRecommendation(item, mostRecentActiveList?.id);
          } else {
            onCreateList();
          }
        }}
        activeListTitle={mostRecentActiveList?.title}
      />
    </div>
  );
};
