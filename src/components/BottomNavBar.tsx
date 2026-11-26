import React, { useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { CalendarDays, Home, PencilLine, Plus, Settings, ShoppingBasket } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NavigationTab } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { triggerHaptic } from '../lib/sound';
import { AnimatedHomeIcon } from './common/AnimatedHomeIcon';
import { AnimatedHistoryIcon } from './common/AnimatedHistoryIcon';
import { useShouldAnimate } from '../lib/motionPreference';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onCreateClick?: () => void;
  onCreateOption?: (title: string) => void;
}

type NavItemKey = 'home' | 'lists' | 'settings' | 'create';
type PillTabKey = 'home' | 'lists' | 'settings';

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onCreateClick,
  onCreateOption,
}) => {
  const { t, isRTL } = useLanguage();
  const canAnimate = useShouldAnimate();
  const { config: remoteConfig } = useRemoteConfig();

  const [homeAnimationTrigger, setHomeAnimationTrigger] = useState(0);
  const [historyAnimationTrigger, setHistoryAnimationTrigger] = useState(0);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Optimistic visual tab so the sliding indicator reacts immediately on tap before route work
  const [visualTab, setVisualTab] = useState<NavigationTab>(activeTab);
  useEffect(() => {
    setVisualTab(activeTab);
  }, [activeTab]);

  const homeBtnRef = useRef<HTMLButtonElement>(null);
  const listsBtnRef = useRef<HTMLButtonElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const createContainerRef = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const wasMenuOpenRef = useRef(false);
  const suppressReturnFocusRef = useRef(false);

  const showHome = remoteConfig.bottomNav?.showHomeTab !== false;
  const showHistory = remoteConfig.bottomNav?.showHistoryTab !== false;
  const showSettings = remoteConfig.bottomNav?.showSettingsTab !== false;
  const showCreate = remoteConfig.bottomNav?.showCreateTab !== false;

  const visibleTabs = useMemo(() => {
    const tabs: Array<{
      id: PillTabKey;
      label: string;
      ariaLabel: string;
      domId: string;
      ref: React.RefObject<HTMLButtonElement | null>;
    }> = [];

    if (showHome) {
      const label = t('nav.home') || 'Home';
      tabs.push({
        id: 'home',
        label,
        ariaLabel: label,
        domId: 'nav_tab_home',
        ref: homeBtnRef,
      });
    }
    if (showHistory) {
      const label = t('nav.history') || t('history.title') || 'History';
      tabs.push({
        id: 'lists',
        label,
        ariaLabel: label,
        domId: 'nav_tab_lists',
        ref: listsBtnRef,
      });
    }
    if (showSettings) {
      const label = t('settings.title') || 'Settings';
      tabs.push({
        id: 'settings',
        label,
        ariaLabel: label,
        domId: 'nav_tab_settings',
        ref: settingsBtnRef,
      });
    }
    return tabs;
  }, [showHome, showHistory, showSettings, t]);

  const navOrder = useMemo<NavItemKey[]>(() => {
    const order: NavItemKey[] = visibleTabs.map((tab) => tab.id);
    if (showCreate) {
      order.push('create');
    }
    return order;
  }, [visibleTabs, showCreate]);

  const activeTabIndex = visibleTabs.findIndex((tab) => tab.id === visualTab);

  const createMenuOptions = useMemo(
    () => [
      {
        id: 'weekly_grocery',
        label: t('createList.types.weekly_grocery.title') || 'Weekly Grocery',
        isCustom: false,
        Icon: ShoppingBasket,
      },
      {
        id: 'monthly_shopping',
        label: t('createList.types.monthly_shopping.title') || 'Monthly Shopping',
        isCustom: false,
        Icon: CalendarDays,
      },
      {
        id: 'household',
        label: t('createList.types.household.title') || 'Home Essentials',
        isCustom: false,
        Icon: Home,
      },
      {
        id: 'custom',
        label: t('createList.customSectionTitle') || 'Custom List',
        isCustom: true,
        Icon: PencilLine,
      },
    ],
    [t]
  );

  const closeMenu = (opts?: { restoreFocus?: boolean }) => {
    suppressReturnFocusRef.current = opts?.restoreFocus === false;
    setIsCreateMenuOpen(false);
  };

  // Return focus to Create button when menu closes (unless closed by switching tabs/navigating)
  useEffect(() => {
    if (wasMenuOpenRef.current && !isCreateMenuOpen) {
      if (!suppressReturnFocusRef.current) {
        createBtnRef.current?.focus({ preventScroll: true });
      }
      suppressReturnFocusRef.current = false;
    }
    wasMenuOpenRef.current = isCreateMenuOpen;
  }, [isCreateMenuOpen]);

  // Close menu whenever activeTab changes or browser history route changes
  useEffect(() => {
    if (isCreateMenuOpen) {
      closeMenu({ restoreFocus: false });
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      closeMenu({ restoreFocus: false });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close menu on outside tap
  useEffect(() => {
    if (!isCreateMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        createContainerRef.current &&
        target &&
        !createContainerRef.current.contains(target)
      ) {
        const clickedTab = visibleTabs.some(
          (tab) => tab.ref.current && tab.ref.current.contains(target)
        );
        closeMenu({ restoreFocus: !clickedTab });
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isCreateMenuOpen, visibleTabs]);

  const selectTab = (tab: PillTabKey) => {
    triggerHaptic(10);
    closeMenu({ restoreFocus: false });
    setVisualTab(tab);

    if (tab === 'home') {
      setHomeAnimationTrigger((c) => c + 1);
    } else if (tab === 'lists') {
      setHistoryAnimationTrigger((c) => c + 1);
    }

    startTransition(() => {
      onTabChange(tab);
    });
  };

  const toggleCreateMenu = () => {
    triggerHaptic(14);
    suppressReturnFocusRef.current = false;
    setIsCreateMenuOpen((prev) => !prev);
  };

  const handleCreateOptionSelect = (option: (typeof createMenuOptions)[number]) => {
    triggerHaptic(14);
    closeMenu({ restoreFocus: false });

    if (option.isCustom) {
      if (onCreateClick) {
        onCreateClick();
      } else {
        onTabChange('create');
      }
      return;
    }

    if (onCreateOption) {
      onCreateOption(option.label);
    } else if (onCreateClick) {
      onCreateClick();
    } else {
      onTabChange('create');
    }
  };

  // Global keyboard shortcuts: 1/H = Home, 2/L = History, 3/S = Settings, C/+ = toggle Create menu, Esc = close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreateMenuOpen) {
        e.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const lower = e.key.toLowerCase();

      if ((e.key === '1' || lower === 'h') && showHome) {
        e.preventDefault();
        selectTab('home');
      } else if ((e.key === '2' || lower === 'l') && showHistory) {
        e.preventDefault();
        selectTab('lists');
      } else if ((e.key === '3' || lower === 's') && showSettings) {
        e.preventDefault();
        selectTab('settings');
      } else if ((lower === 'c' || e.key === '+') && showCreate) {
        e.preventDefault();
        toggleCreateMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateMenuOpen, showHome, showHistory, showSettings, showCreate, onTabChange, onCreateClick, onCreateOption]);

  const focusNavItem = (key: NavItemKey) => {
    if (key === 'home') homeBtnRef.current?.focus();
    else if (key === 'lists') listsBtnRef.current?.focus();
    else if (key === 'settings') settingsBtnRef.current?.focus();
    else if (key === 'create') createBtnRef.current?.focus();
  };

  // RTL-aware arrow key navigation across Home -> History -> Settings -> Create
  const handleNavKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    current: NavItemKey
  ) => {
    if (navOrder.length === 0) return;

    const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft';
    const currentIndex = navOrder.indexOf(current);

    if (e.key === nextKey && currentIndex !== -1) {
      e.preventDefault();
      const nextItem = navOrder[(currentIndex + 1) % navOrder.length];
      focusNavItem(nextItem);
    } else if (e.key === prevKey && currentIndex !== -1) {
      e.preventDefault();
      const prevItem = navOrder[(currentIndex - 1 + navOrder.length) % navOrder.length];
      focusNavItem(prevItem);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusNavItem(navOrder[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusNavItem(navOrder[navOrder.length - 1]);
    } else if (current === 'create' && isCreateMenuOpen && e.key === 'ArrowUp') {
      e.preventDefault();
      menuItemRefs.current[createMenuOptions.length - 1]?.focus();
    } else if (current === 'create' && isCreateMenuOpen && e.key === 'ArrowDown') {
      e.preventDefault();
      menuItemRefs.current[0]?.focus();
    }
  };

  const handleMenuItemKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const count = createMenuOptions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      menuItemRefs.current[(index + 1) % count]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      menuItemRefs.current[(index - 1 + count) % count]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      menuItemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      menuItemRefs.current[count - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  };

  const dirSign = isRTL ? -1 : 1;
  const indicatorTranslateX = activeTabIndex >= 0 ? activeTabIndex * 100 * dirSign : 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none flex justify-center px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] sm:pb-3.5">
      <nav
        id="bottom_navigation_bar"
        role="navigation"
        aria-label={t('nav.mainNavigation') || 'Main Navigation'}
        className="pointer-events-auto flex items-center justify-center gap-[10px] w-full max-w-[420px] select-none"
      >
        {/* Main Liquid-Glass Pill */}
        {visibleTabs.length > 0 && (
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="relative flex-1 min-w-0 rounded-full p-1 bg-surface-container-lowest/80 dark:bg-surface-container-lowest/80 backdrop-blur-lg [backdrop-filter:blur(18px)_saturate(160%)] [-webkit-backdrop-filter:blur(18px)_saturate(160%)] border border-primary/12 dark:border-white/15 shadow-[0_8px_28px_-6px_rgba(15,61,46,0.16)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.55)] overflow-hidden before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            <div
              className="relative grid w-full items-center"
              style={{
                gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`,
              }}
            >
              {/* Transform-only sliding glass indicator (no blur on moving element, no layoutId) */}
              {activeTabIndex >= 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 start-0 rounded-full bg-primary/12 dark:bg-primary/25 border border-primary/20 dark:border-primary/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  style={{
                    width: `${100 / visibleTabs.length}%`,
                    transform: `translateX(${indicatorTranslateX}%)`,
                    willChange: canAnimate ? 'transform' : undefined,
                    transition: canAnimate
                      ? 'transform 200ms ease-out'
                      : 'none',
                  }}
                />
              )}

              {visibleTabs.map((tab, idx) => {
                const isActive = visualTab === tab.id;
                const tabFocusable = isActive || (activeTabIndex === -1 && idx === 0);

                return (
                  <button
                    key={tab.id}
                    ref={tab.ref}
                    id={tab.domId}
                    role="tab"
                    type="button"
                    tabIndex={tabFocusable ? 0 : -1}
                    onClick={() => selectTab(tab.id)}
                    onMouseEnter={() => {
                      if (tab.id === 'home') setHomeAnimationTrigger((c) => c + 1);
                      else if (tab.id === 'lists') setHistoryAnimationTrigger((c) => c + 1);
                    }}
                    onKeyDown={(e) => handleNavKeyDown(e, tab.id)}
                    aria-selected={isActive}
                    aria-label={tab.ariaLabel}
                    className={`relative z-10 flex flex-col items-center justify-center gap-0.5 min-h-[48px] px-1.5 py-1 rounded-full text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                      canAnimate
                        ? 'transition-transform duration-150 ease-out active:scale-95'
                        : ''
                    } ${
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-on-surface-variant/80 hover:text-on-surface font-medium'
                    }`}
                  >
                    {tab.id === 'home' && (
                      <AnimatedHomeIcon
                        isActive={isActive}
                        playTrigger={homeAnimationTrigger}
                        size={22}
                      />
                    )}
                    {tab.id === 'lists' && (
                      <AnimatedHistoryIcon
                        isActive={isActive}
                        playTrigger={historyAnimationTrigger}
                        size={22}
                      />
                    )}
                    {tab.id === 'settings' && (
                      <Settings
                        className={`w-[22px] h-[22px] shrink-0 ${
                          isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-[11px] sm:text-xs font-body font-semibold whitespace-nowrap leading-none max-w-full truncate">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trailing Circular Create Button + Anchored Glass Menu */}
        {showCreate && (
          <div ref={createContainerRef} className="relative shrink-0 flex items-center justify-center">
            <AnimatePresence>
              {isCreateMenuOpen && (
                <motion.div
                  id="nav_create_menu"
                  role="menu"
                  aria-label={t('nav.create') || 'Create'}
                  initial={
                    canAnimate
                      ? { opacity: 0, scale: 0.92, y: 6 }
                      : { opacity: 0 }
                  }
                  animate={
                    canAnimate
                      ? {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            duration: 0.18,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }
                      : {
                          opacity: 1,
                          transition: { duration: 0.08 },
                        }
                  }
                  exit={
                    canAnimate
                      ? {
                          opacity: 0,
                          scale: 0.92,
                          y: 6,
                          transition: {
                            duration: 0.14,
                            ease: [0.4, 0, 1, 1],
                          },
                        }
                      : {
                          opacity: 0,
                          transition: { duration: 0.08 },
                        }
                  }
                  style={{
                    transformOrigin: isRTL ? 'bottom left' : 'bottom right',
                  }}
                  className="absolute bottom-[calc(100%+10px)] end-0 w-[224px] max-w-[calc(100vw-24px)] rounded-3xl p-1.5 bg-surface-container-lowest/80 dark:bg-surface-container-lowest/80 backdrop-blur-lg [backdrop-filter:blur(18px)_saturate(160%)] [-webkit-backdrop-filter:blur(18px)_saturate(160%)] border border-primary/14 dark:border-white/15 shadow-[0_12px_32px_-8px_rgba(15,61,46,0.22)] dark:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.6)] overflow-hidden before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <div className="relative z-10 flex flex-col gap-0.5">
                    {createMenuOptions.map((option, idx) => {
                      const Icon = option.Icon;
                      return (
                        <motion.button
                          key={option.id}
                          ref={(el) => {
                            menuItemRefs.current[idx] = el;
                          }}
                          id={`nav_create_option_${option.id}`}
                          type="button"
                          role="menuitem"
                          onClick={() => handleCreateOptionSelect(option)}
                          onKeyDown={(e) => handleMenuItemKeyDown(e, idx)}
                          initial={
                            canAnimate
                              ? { opacity: 0, y: 4 }
                              : false
                          }
                          animate={
                            canAnimate
                              ? {
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    duration: 0.15,
                                    delay: idx * 0.025,
                                    ease: [0.22, 1, 0.36, 1],
                                  },
                                }
                              : { opacity: 1, transition: { duration: 0 } }
                          }
                          whileTap={canAnimate ? { scale: 0.98 } : undefined}
                          className={`w-full min-h-[48px] px-3 py-2 rounded-2xl flex items-center gap-3 text-start text-sm font-body font-semibold text-on-surface hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            option.isCustom
                              ? 'mt-0.5 border-t border-primary/10 dark:border-white/10 rounded-t-xl'
                              : ''
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              option.isCustom
                                ? 'bg-primary text-white'
                                : 'bg-primary/12 dark:bg-primary/25 text-primary'
                            }`}
                          >
                            <Icon className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                          </span>
                          <span className="truncate flex-1">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              ref={createBtnRef}
              id="nav_tab_create"
              type="button"
              onClick={toggleCreateMenu}
              onKeyDown={(e) => handleNavKeyDown(e, 'create')}
              aria-label={t('nav.create') || 'Create'}
              aria-haspopup="menu"
              aria-expanded={isCreateMenuOpen}
              aria-controls={isCreateMenuOpen ? 'nav_create_menu' : undefined}
              className="relative w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-gradient-to-tr from-primary/95 to-primary-container/90 text-white flex items-center justify-center backdrop-blur-md [backdrop-filter:blur(16px)_saturate(160%)] [-webkit-backdrop-filter:blur(16px)_saturate(160%)] border border-white/25 dark:border-white/20 shadow-[0_8px_22px_-4px_rgba(15,61,46,0.36)] dark:shadow-[0_8px_22px_-4px_rgba(0,0,0,0.55)] overflow-hidden before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span
                className="relative z-10 flex items-center justify-center"
                style={{
                  transform: `rotate(${isCreateMenuOpen ? 45 : 0}deg)`,
                  transition: canAnimate
                    ? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'none',
                }}
              >
                <Plus className="w-6 h-6 text-white stroke-[2.5]" aria-hidden="true" />
              </span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
