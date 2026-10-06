import React, { useState, useMemo, useEffect } from 'react';
import { Plus, ChevronRight, Check, ArrowRight, X } from 'lucide-react';
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
import { QuickActionsGrid } from './home/QuickActionsGrid';
import { FrequentEssentialsSection } from './home/FrequentEssentialsSection';
import { HomeListsSection } from './home/HomeListsSection';
import { NoActiveListModal } from './home/NoActiveListModal';

interface HomeViewProps {
  lists: ShoppingList[];
  onCreateList: () => void;
  onSelectList: (list: ShoppingList) => void;
  onContinueShopping?: (list: ShoppingList) => void;
  onMarkComplete?: (list: ShoppingList) => void;
  onReuseList?: (list: ShoppingList) => void;
  onOpenProfile: () => void;
  onOpenMenu: () => void;
  onOpenHistory?: () => void;
  onEditList?: (listId: string) => void;
  onDeleteList?: (listId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onQuickAddRecommendation?: (
    item: RecommendationCandidate,
    targetListId?: string,
    openShoppingMode?: boolean
  ) => void;
  onOpenStatistics?: () => void;
  onOpenPhoneSettings?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lists,
  onCreateList,
  onSelectList,
  onContinueShopping,
  onMarkComplete,
  onReuseList,
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

  // Frequent essential item awaiting target list choice if no active list exists
  const [pendingEssentialItem, setPendingEssentialItem] = useState<EssentialDisplayItem | null>(null);

  // Quick feedback toast when item is added to active list
  const [addedItemToast, setAddedItemToast] = useState<{
    message: string;
    listTitle: string;
    targetList: ShoppingList;
  } | null>(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!addedItemToast) return;
    const timer = setTimeout(() => {
      setAddedItemToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [addedItemToast]);

  // Find most recent active (non-completed) list
  const mostRecentActiveList = useMemo(() => {
    return lists.find((l) => !l.isCompleted);
  }, [lists]);

  // Determine time-of-day greeting with user first name
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = t('home.greeting');
    if (hour >= 5 && hour < 12) {
      timeGreeting = t('home.goodMorning');
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = t('home.goodAfternoon');
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = t('home.goodEvening');
    } else {
      timeGreeting = t('home.goodNight') || t('home.goodEvening');
    }

    const rawName =
      profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
    const userName =
      rawName && typeof rawName === 'string' && rawName.trim().length > 0
        ? rawName.trim().split(' ')[0]
        : user?.email
        ? user.email.split('@')[0]
        : 'User';

    return { timeGreeting, userName };
  }, [profile, user, t]);

  const buildCandidate = (item: EssentialDisplayItem): RecommendationCandidate => {
    return {
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
  };

  // Handle adding an essential item to the current list or prompting for new list
  const handleAddEssentialItem = (item: EssentialDisplayItem) => {
    if (!mostRecentActiveList) {
      setPendingEssentialItem(item);
      return;
    }

    const candidate = buildCandidate(item);
    if (onQuickAddRecommendation) {
      onQuickAddRecommendation(candidate, mostRecentActiveList.id, false);
    }

    const itemLabel = language === 'ur' && item.nameUrdu ? item.nameUrdu : item.displayName;
    setAddedItemToast({
      message: `${itemLabel} (${item.quantity} ${item.unit})`,
      listTitle: mostRecentActiveList.title,
      targetList: mostRecentActiveList,
    });
  };

  const handleAddToNewList = (item: EssentialDisplayItem) => {
    const candidate = buildCandidate(item);
    if (onQuickAddRecommendation) {
      onQuickAddRecommendation(candidate, undefined, true);
    }
    setPendingEssentialItem(null);
  };

  const handleCreateListFirst = () => {
    setPendingEssentialItem(null);
    onCreateList();
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
      <main className="flex-1 px-3.5 sm:px-6 lg:px-8 pt-2 sm:pt-4 flex flex-col gap-3.5 sm:gap-5">
        {/* 2. PERSONALIZED GREETING & AVATAR */}
        <section
          id="home_greeting_section"
          className="flex items-center justify-between gap-3 select-none"
        >
          <div className="flex flex-col min-w-0">
            {/* Top: Time greeting slightly increased */}
            <span className="font-['Manrope'] text-[13.5px] sm:text-[15px] font-semibold text-outline leading-tight">
              {greetingData.timeGreeting}
            </span>
            {/* Middle: User's name prominently enlarged */}
            <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-tight truncate mt-0.5">
              {greetingData.userName}
            </h1>
            {/* Bottom: Let's make a list in solid proper black */}
            <p className="font-['Manrope'] text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {t('home.letsMakeAList') || "Let's make a list"}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open Profile & Settings"
            className="w-11 h-11 rounded-full ring-2 ring-surface-dim hover:ring-primary/40 active:scale-95 transition-all shrink-0 cursor-pointer overflow-hidden flex items-center justify-center bg-surface-container shadow-2xs"
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

        {/* 4. PRIMARY ACTION: CREATE NEW LIST CARD */}
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
            className="w-full min-h-[76px] sm:min-h-[96px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-4 sm:p-5 text-on-primary flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(15,61,46,0.18)] hover:shadow-[0_6px_24px_rgba(15,61,46,0.25)] cursor-pointer relative overflow-hidden transition-all duration-200 active:scale-[0.99] select-none group border border-white/10"
          >
            {/* Background subtle radial glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Left side: Plus icon + Enlarged Create List Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 z-10">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 shadow-2xs group-hover:bg-white/25 transition-all">
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.4] transition-transform duration-300 group-hover:rotate-90" />
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                {t('home.createListTitle')}
              </h2>
            </div>

            {/* Right side: Grocery Basket Visual & Circular Arrow */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
              <div className="hidden xs:block relative transform group-hover:scale-105 transition-all duration-300">
                <GroceryBasketIllustration size={68} />
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 group-hover:scale-105 transition-all rtl:rotate-180 border border-white/20 shadow-2xs">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. QUICK ACTIONS SHORTCUTS GRID */}
        <QuickActionsGrid
          lists={lists}
          onOpenRecentLists={onOpenHistory || (lists[0] ? () => onSelectList(lists[0]) : () => {})}
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
          onContinueShopping={onContinueShopping}
          onMarkComplete={onMarkComplete}
          onReuseList={onReuseList}
          onOpenHistory={onOpenHistory}
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

      {/* 4. No Active List Modal for Frequent Essentials */}
      <NoActiveListModal
        isOpen={!!pendingEssentialItem}
        item={pendingEssentialItem}
        onClose={() => setPendingEssentialItem(null)}
        onAddToNewList={handleAddToNewList}
        onCreateListFirst={handleCreateListFirst}
      />

      {/* 5. Quick Add Success Toast */}
      {addedItemToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] p-3 rounded-2xl bg-white dark:bg-stone-900 border border-primary/20 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-on-surface truncate">
                {t('home.addedToListToast') || 'Added to list'}:{' '}
                <span className="text-primary">{addedItemToast.message}</span>
              </span>
              <span className="font-['Manrope'] text-[11px] text-outline truncate">
                {addedItemToast.listTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="toast_shop_now_btn"
              onClick={() => {
                onSelectList(addedItemToast.targetList);
                setAddedItemToast(null);
              }}
              className="h-7 px-3 rounded-full bg-primary text-on-primary text-[11px] font-bold font-['Manrope'] flex items-center gap-1 active:scale-95 transition-transform cursor-pointer shadow-xs"
            >
              <span>{t('home.shopNow') || 'Shop Now'}</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setAddedItemToast(null)}
              aria-label="Dismiss toast"
              className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
