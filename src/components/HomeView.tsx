import React, { useState, useMemo } from 'react';
import {
  Plus,
  ChevronRight,
  Clock,
  Heart,
  Grid,
  TrendingUp,
  MoreVertical,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  Home,
  Calendar,
  ClipboardList,
  Package,
  Sparkles,
} from 'lucide-react';
import { ShoppingList, CategoryId } from '../types';
import { TopHeader } from './TopHeader';
import { Avatar } from './Avatar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isNetworkOrOfflineError } from '../lib/supabase';
import { BidiText } from '../utils/bidi';
import { RecommendationCandidate } from '../lib/recommendations';
import { GroceryBasketIllustration } from './GroceryBasketIllustration';
import { EssentialProductVisual } from './EssentialProductVisual';
import { EssentialItemVisual } from './EssentialItemVisual';
import {
  getRankedPopularEssentials,
  getItemStatusInActiveList,
  EssentialDisplayItem,
} from '../lib/recommendations/popularEssentials';
import { ShoppingStatisticsModal } from './ShoppingStatisticsModal';
import { QuickFavoritesModal } from './QuickFavoritesModal';
import { CategoryBrowserModal } from './CategoryBrowserModal';
import { playItemAddSound, triggerHaptic } from '../lib/sound';
import { ListIcon } from './ListIcon';
import { formatExactDate, formatExactTime } from '../utils/dateFormatting';

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
}) => {
  const { t, language, getCategoryName } = useLanguage();
  const { user, profile } = useAuth();

  // Modal visibility states
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isCategoryBrowserOpen, setIsCategoryBrowserOpen] = useState(false);

  // Added items micro-feedback tracker: canonicalName -> boolean
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  // Prevent rapid double-click race condition on add
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Active dropdown menu for list card
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Find most recent active (non-completed) list
  const mostRecentActiveList = useMemo(() => {
    return lists.find((l) => !l.isCompleted);
  }, [lists]);

  // Selected category for filtering essentials
  const [selectedEssentialCategory, setSelectedEssentialCategory] = useState<string>('all');

  // Ranked popular essentials: personalized for existing users, curated staples for new users (up to 12 items)
  const { items: rankedEssentials, hasPersonalized: hasPersonalizedEssentials } = useMemo(() => {
    return getRankedPopularEssentials(lists, 12);
  }, [lists]);

  // Available categories in ranked essentials
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(rankedEssentials.map((i) => i.category)));
    return ['all', ...cats];
  }, [rankedEssentials]);

  // Filtered essentials based on active category filter
  const filteredEssentials = useMemo(() => {
    if (selectedEssentialCategory === 'all') return rankedEssentials;
    return rankedEssentials.filter((i) => i.category === selectedEssentialCategory);
  }, [rankedEssentials, selectedEssentialCategory]);

  // Determine time-of-day greeting
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

    // Extract user first name
    const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (rawName && typeof rawName === 'string') {
      const firstName = rawName.trim().split(' ')[0];
      if (language === 'ur') {
        return `${timeGreeting}، ${firstName} 👋`;
      }
      return `${timeGreeting}, ${firstName} 👋`;
    }

    return `${timeGreeting} 👋`;
  }, [profile, user, t, language]);

  // Handle adding an essential candidate item with sound, haptic, and instant state change
  const handleAddEssential = (item: EssentialDisplayItem) => {
    if (addingItemId === item.canonicalName) return; // Prevent duplicate rapid clicks

    setAddingItemId(item.canonicalName);
    playItemAddSound();
    triggerHaptic(12);

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
        cycleUrgencyScore: 1,
        regularityScore: 1,
        coPurchaseScore: 0,
        weekdayScore: 0,
        dismissalPenalty: 1,
        confidence: 1,
        totalScore: 1,
      },
    };

    if (onQuickAddRecommendation) {
      onQuickAddRecommendation(candidate, mostRecentActiveList?.id);
    } else {
      onCreateList();
    }

    // Immediate tactile feedback: button changes state for 1.6s
    setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [item.canonicalName]: false }));
      setAddingItemId(null);
    }, 1600);
  };

  // Helper to format relative time for lists
  const formatRelativeTime = (timestamp?: number | string) => {
    if (!timestamp) return t('home.updatedRecently');
    const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    if (isNaN(time)) return t('home.updatedRecently');

    const diffMinutes = Math.floor((Date.now() - time) / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return t('home.updatedJustNow');
    if (diffMinutes < 60) return t('home.updatedMinutesAgo', { minutes: diffMinutes });
    if (diffHours === 1) return t('home.updatedHourAgo');
    if (diffHours < 24) return t('home.updatedHoursAgo', { hours: diffHours });
    if (diffDays === 1) return t('home.updatedYesterday');
    return t('home.updatedDaysAgo', { days: diffDays });
  };

  // Localized name helper for essential items
  const getEssentialDisplayName = (item: EssentialDisplayItem) => {
    if (language === 'ur' && item.nameUrdu) return item.nameUrdu;
    if (language === 'roman-urdu' && item.nameRomanUrdu) return item.nameRomanUrdu;
    return item.displayName;
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col antialiased bg-background pb-28 selection:bg-primary-container selection:text-on-primary-container">
      {/* 1. TOP HEADER (Height 56px, original logo, centered title, settings gear) */}
      <TopHeader
        title={t('appName')}
        onSettingsClick={onOpenProfile || onOpenMenu}
        onAvatarClick={onOpenProfile}
        onMenuClick={onOpenMenu}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 flex flex-col gap-6" onClick={() => setActiveMenuId(null)}>
        {/* 2. PERSONALIZED GREETING & PROFILE AVATAR */}
        <section id="home_greeting_section" className="flex items-center justify-between gap-3 select-none">
          <div className="flex flex-col min-w-0">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[26px] font-bold text-on-surface tracking-tight leading-tight truncate">
              {greetingText}
            </h1>
            <p className="font-['Manrope'] text-xs sm:text-sm text-outline mt-0.5 font-normal">
              {t('home.subtitle')}
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

        {/* 3. PRIMARY ACTION: CREATE NEW LIST CARD */}
        <section aria-label={t('home.createListTitle')}>
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
            className="w-full min-h-[112px] sm:min-h-[116px] rounded-2xl sm:rounded-3xl bg-[#0F3D2E] p-4 sm:p-5 text-white flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(15,61,46,0.18)] cursor-pointer relative overflow-hidden transition-all duration-200 hover:shadow-[0_6px_22px_rgba(15,61,46,0.25)] hover:bg-[#124836] active:scale-[0.99] select-none group border border-emerald-900/30"
          >
            {/* Left side: Plus icon + titles */}
            <div className="flex items-center gap-3.5 min-w-0 z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15 shadow-2xs group-hover:bg-white/15 transition-all">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.4] transition-transform duration-300 group-hover:rotate-90" />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  {t('home.createListTitle')}
                </h2>
                <p className="font-['Manrope'] text-xs sm:text-[13px] text-emerald-100/80 mt-1 font-normal leading-snug">
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

        {/* 4. QUICK ACTIONS SHORTCUTS GRID (4 cards) */}
        <section aria-label={t('home.quickActions.title')}>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 select-none">
            {/* 1. Recent Lists */}
            <button
              type="button"
              id="quick_action_recent_lists"
              onClick={onOpenHistory || (() => onSelectList('recent'))}
              className="h-[74px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white border border-surface-dim/60 shadow-xs hover:border-[#0F3D2E]/30 hover:shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
                {t('home.quickActions.recentLists')}
              </span>
            </button>

            {/* 2. Favorites */}
            <button
              type="button"
              id="quick_action_favorites"
              onClick={() => setIsFavoritesModalOpen(true)}
              className="h-[74px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white border border-surface-dim/60 shadow-xs hover:border-[#0F3D2E]/30 hover:shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#0F3D2E]/15 stroke-[2.2]" />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
                {t('home.quickActions.favorites')}
              </span>
            </button>

            {/* 3. Categories */}
            <button
              type="button"
              id="quick_action_categories"
              onClick={() => setIsCategoryBrowserOpen(true)}
              className="h-[74px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white border border-surface-dim/60 shadow-xs hover:border-[#0F3D2E]/30 hover:shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Grid className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
                {t('home.quickActions.categories')}
              </span>
            </button>

            {/* 4. Statistics */}
            <button
              type="button"
              id="quick_action_statistics"
              onClick={() => {
                if (onOpenStatistics) {
                  onOpenStatistics();
                } else {
                  setIsStatsModalOpen(true);
                }
              }}
              className="h-[74px] sm:h-[84px] md:h-[92px] rounded-2xl sm:rounded-3xl bg-white border border-surface-dim/60 shadow-xs hover:border-[#0F3D2E]/30 hover:shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#0F3D2E] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-on-surface font-['Manrope'] truncate max-w-[95%]">
                {t('home.quickActions.statistics')}
              </span>
            </button>
          </div>
        </section>

        {/* 5. POPULAR ESSENTIALS SECTION */}
        <section
          id="home_essentials_section"
          aria-label={t('home.essentials.title') || t('home.popularEssentials')}
          className="flex flex-col gap-3 select-none"
        >
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
                {hasPersonalizedEssentials
                  ? t('home.essentials.personalizedTitle') || t('home.essentials.title')
                  : t('home.essentials.title') || t('home.popularEssentials')}
              </h3>
              {hasPersonalizedEssentials && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  <Sparkles className="w-3 h-3 text-emerald-600 stroke-[2]" />
                  {language === 'ur' ? 'آپ کی پسند' : language === 'roman-urdu' ? 'Aap ke liye' : 'For You'}
                </span>
              )}
            </div>
            <button
              type="button"
              id="essentials_view_all_btn"
              onClick={() => setIsCategoryBrowserOpen(true)}
              className="text-xs sm:text-sm font-semibold text-[#0F3D2E] hover:underline cursor-pointer"
            >
              {t('home.essentials.viewAll') || t('home.viewAll')}
            </button>
          </div>

          {/* Target Active List notification chip */}
          {mostRecentActiveList && (
            <div className="text-[11px] text-emerald-900 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-outline truncate">
                  {language === 'ur' ? 'براہ راست شامل کریں:' : 'Adding directly to:'}{' '}
                  <strong className="text-[#0F3D2E]">{mostRecentActiveList.title}</strong>
                </span>
              </div>
              <span className="text-[10px] text-outline shrink-0 font-medium">
                {t('home.itemsCount', { count: (mostRecentActiveList.items || []).length })}
              </span>
            </div>
          )}

          {/* Category filter pills */}
          {availableCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {availableCategories.map((cat) => {
                const isSelected = selectedEssentialCategory === cat;
                const label = cat === 'all'
                  ? (language === 'ur' ? 'تمام' : 'All')
                  : getCategoryName(cat as CategoryId);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedEssentialCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F3D2E] text-white shadow-2xs'
                        : 'bg-white text-on-surface hover:bg-surface-container border border-surface-dim/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Responsive grid: 2 columns on mobile, 3-4 on tablet, 6 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {filteredEssentials.map((item) => {
              const isAdded = !!addedItemsMap[item.canonicalName];
              const isAdding = addingItemId === item.canonicalName;
              const displayName = getEssentialDisplayName(item);
              const activeStatus = getItemStatusInActiveList(item.canonicalName, mostRecentActiveList);

              return (
                <div
                  key={item.canonicalName}
                  id={`essential_card_${item.canonicalName}`}
                  className="rounded-2xl bg-white border border-surface-dim/60 shadow-xs hover:border-[#0F3D2E]/25 hover:shadow-sm transition-all p-3 flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <EssentialItemVisual
                      canonicalName={item.canonicalName}
                      displayName={displayName}
                      categoryId={item.category}
                      size={44}
                    />
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-md bg-surface-container-low text-outline max-w-[85px] truncate border border-surface-dim/40">
                        {getCategoryName(item.category)}
                      </span>
                      {activeStatus.inList && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-200/40">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          {t('home.essentials.inList')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-on-surface truncate leading-tight">
                      {displayName}
                    </span>
                    <span className="font-['Manrope'] text-xs text-outline font-medium mt-0.5 truncate">
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddEssential(item)}
                    aria-label={`Add ${displayName} ${item.quantity} ${item.unit} to shopping list`}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 active:scale-95 cursor-pointer select-none ${
                      isAdded
                        ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                        : 'bg-[#0F3D2E] hover:bg-[#145B3A] active:bg-[#0A291F] text-white shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in duration-200" />
                        <span className="truncate">{t('home.essentials.added') || t('recommendations.addedToList')}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="truncate">{t('home.essentials.add') || t('recommendations.addToList')}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. YOUR SHOPPING LISTS SECTION */}
        <section id="home_lists_section" aria-label={t('home.yourListsTitle')} className="flex flex-col gap-3 select-none">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
              {t('home.yourListsTitle')}
            </h3>
            {lists.length > 0 && onOpenHistory && (
              <button
                type="button"
                id="see_all_lists_btn"
                onClick={onOpenHistory}
                className="text-xs sm:text-sm font-semibold text-[#0F3D2E] hover:underline cursor-pointer"
              >
                {t('home.seeAll')}
              </button>
            )}
          </div>

          {/* Error Banner */}
          {error && !isNetworkOrOfflineError(error) && (
            <div className="p-3.5 bg-error-container/30 border border-error/20 rounded-2xl text-xs font-['Manrope'] text-error flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-2.5 py-1 bg-surface-container rounded-lg font-bold text-primary hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t('common.retry')}</span>
                </button>
              )}
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="flex flex-col gap-2.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-xs border border-surface-dim/60 animate-pulse"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-container shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="w-36 h-4 bg-surface-container rounded" />
                      <div className="w-24 h-3 bg-surface-container-low rounded" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
                </div>
              ))}
            </div>
          ) : lists.length === 0 ? (
            /* Clean Empty State */
            <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs border border-surface-dim/60 my-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0F3D2E] mb-3 border border-emerald-100">
                <ShoppingBag className="w-7 h-7 text-[#0F3D2E] stroke-[1.8]" />
              </div>
              <h4 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-on-surface">
                {t('home.emptyTitle')}
              </h4>
              <p className="font-['Manrope'] text-xs sm:text-sm text-outline max-w-xs mt-1 leading-relaxed">
                {t('home.emptyDesc')}
              </p>
              <button
                type="button"
                id="home_empty_create_btn"
                onClick={onCreateList}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#0F3D2E] hover:bg-[#145B3A] text-white font-['Manrope'] text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.4]" />
                <span>{t('home.createFirstList')}</span>
              </button>
            </div>
          ) : (
            /* Populated Lists (Responsive: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on wide) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
              {lists.slice(0, 8).map((list) => {
                const totalItems = (list.items || []).length;
                const completedItems = (list.items || []).filter((i) => i.completed).length;
                const isAllDone = list.isCompleted || (totalItems > 0 && completedItems === totalItems);
                const isMenuOpen = activeMenuId === list.id;

                const exactDateStr = formatExactDate(list.createdTimestamp || list.createdAt);
                const completionTimeStr = (isAllDone && (list.completedTimestamp || list.completedAt))
                  ? formatExactTime(list.completedTimestamp || list.completedAt)
                  : null;

                return (
                  <article
                    key={list.id}
                    id={`home_list_card_${list.id}`}
                    onClick={() => onSelectList(list)}
                    className="bg-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs border border-surface-dim/60 hover:border-[#0F3D2E]/30 transition-all active:scale-[0.99] group select-none cursor-pointer relative"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pe-2">
                      {/* Meaningful List Icon */}
                      <ListIcon
                        title={list.title}
                        explicitIcon={list.icon}
                        items={list.items}
                        size="md"
                      />

                      {/* List Information */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <BidiText
                            as="h4"
                            className="font-['Plus_Jakarta_Sans'] text-sm sm:text-[15px] font-bold text-on-surface truncate group-hover:text-[#0F3D2E] transition-colors"
                          >
                            {list.title}
                          </BidiText>

                          {/* Status Badge */}
                          {isAllDone ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/50 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('home.completed')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200/50 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{t('home.inProgress') || 'In Progress'}</span>
                            </span>
                          )}

                          {list.isSynced === false && (
                            <span
                              title="Offline cached"
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface-container text-outline"
                            >
                              Cached
                            </span>
                          )}
                        </div>

                        {/* Date, item count, and optional completion time */}
                        <div className="flex items-center gap-2 text-xs font-['Manrope'] text-outline mt-0.5 flex-wrap">
                          <span className="text-on-surface-variant font-medium">{exactDateStr}</span>
                          <span>•</span>
                          <span>{t('home.itemsCount', { count: totalItems })}</span>
                          {completionTimeStr && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700/90 font-medium">
                                {t('history.completedAt', { time: completionTimeStr }) || `Done ${completionTimeStr}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Actions and Navigation Arrow */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Contextual menu button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : list.id);
                          }}
                          aria-label="List options"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popup */}
                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-9 z-30 w-40 rounded-xl bg-white border border-surface-dim shadow-lg p-1 animate-fade-in text-xs font-['Manrope']"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectList(list);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container flex items-center gap-2 text-on-surface font-medium"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-[#0F3D2E]" />
                              <span>{t('home.openShoppingMode')}</span>
                            </button>
                            {onEditList && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onEditList(list.id);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container flex items-center gap-2 text-on-surface font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-outline" />
                                <span>{t('home.editList')}</span>
                              </button>
                            )}
                            {onDeleteList && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteList(list.id);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('home.deleteList')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Navigation Arrow */}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-outline group-hover:text-[#0F3D2E] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all rtl:rotate-180">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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
