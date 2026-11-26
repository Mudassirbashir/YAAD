import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  X,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Badge, BadgeAnchor } from './common/Badge';
import { useRemoteConfig } from '../hooks/useRemoteConfig';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onAvatarClick?: () => void;
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
  rightAction?: React.ReactNode;
  hideNotifications?: boolean;
  hideSettings?: boolean;
}

interface InAppNotification {
  id: string;
  category?: 'mandi' | 'reminder' | 'update' | 'announcement';
  titleEn: string;
  titleUr: string;
  bodyEn: string;
  bodyUr: string;
  iconUrl?: string;
  sentAt?: number | string;
}

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_mandi',
    category: 'mandi',
    titleEn: 'Weekend Sabzi Mandi Reminder 🛒',
    titleUr: 'ہفتہ وار سبزی منڈی کی یاد دہانی 🛒',
    bodyEn: 'Fresh mandi vegetables restocked! Check your YAAD parchi before heading out.',
    bodyUr: 'تازہ سبزیوں اور منڈی کی خریداری کے لیے اپنی پرچی چیک کریں۔',
    sentAt: Date.now() - 3600 * 1000 * 2, // 2 hours ago
  },
  {
    id: 'notif_rashan',
    category: 'reminder',
    titleEn: 'Ramadan Rashan List Ready 🌙',
    titleUr: 'رمضان راشن لسٹ تیار ہے 🌙',
    bodyEn: 'Review the essential Ramadan 2026 checklist in your Grocery Guides.',
    bodyUr: 'رمضان 2026 کے ضروری راشن کی فہرست اپنے گائیڈز میں دیکھیں۔',
    sentAt: Date.now() - 86400 * 1000 * 1, // 1 day ago
  },
  {
    id: 'notif_welcome',
    category: 'announcement',
    titleEn: 'Smart Price & Mandi Insights ✨',
    titleUr: 'اسمارٹ منڈی ریٹس اور بچت ✨',
    bodyEn: 'Compare retail and mandi wholesale prices to maximize your savings.',
    bodyUr: 'منڈی کے نرخ دیکھیں اور ہر خریداری پر بچت حاصل کریں۔',
    sentAt: Date.now() - 86400 * 1000 * 3, // 3 days ago
  },
];

function formatRelativeTime(timestamp: number | string | undefined, lang: string): string {
  if (!timestamp) return lang === 'ur' ? 'ابھی' : 'Just now';
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(time)) return lang === 'ur' ? 'ابھی' : 'Just now';

  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));

  if (diffSec < 60) {
    return lang === 'ur' ? 'ابھی ابھی' : 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return lang === 'ur' ? `${diffMin} منٹ پہلے` : `${diffMin}m ago`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return lang === 'ur'
      ? `${diffHour} گھنٹہ پہلے`
      : diffHour === 1
      ? '1 hour ago'
      : `${diffHour} hours ago`;
  }
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) {
    return lang === 'ur'
      ? `${diffDays} دن پہلے`
      : diffDays === 1
      ? '1 day ago'
      : `${diffDays} days ago`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  return lang === 'ur'
    ? `${diffWeeks} ہفتے پہلے`
    : diffWeeks === 1
    ? '1 week ago'
    : `${diffWeeks} weeks ago`;
}

function getNotificationIcon(category?: string) {
  switch (category) {
    case 'mandi':
      return <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />;
    case 'reminder':
      return <Calendar className="w-3.5 h-3.5 text-amber-700" />;
    case 'announcement':
      return <Sparkles className="w-3.5 h-3.5 text-sky-700" />;
    default:
      return <Bell className="w-3.5 h-3.5 text-emerald-800" />;
  }
}

function getNotificationBadgeBg(category?: string) {
  switch (category) {
    case 'mandi':
      return 'bg-emerald-50 border-emerald-200/60';
    case 'reminder':
      return 'bg-amber-50 border-amber-200/60';
    case 'announcement':
      return 'bg-sky-50 border-sky-200/60';
    default:
      return 'bg-neutral-100 border-neutral-200';
  }
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'YAAD',
  showBack = false,
  onBack,
  onNotificationsClick,
  rightAction,
  hideNotifications = false,
}) => {
  const { language } = useLanguage();
  const { config: remoteConfig } = useRemoteConfig();
  const [notifications, setNotifications] = useState<InAppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(false);

  // By default, if showBack is true (inside a list, edit screen, etc.), do not crowd the header with bell
  const effectiveHideNotifications = hideNotifications || showBack;

  const showNotificationBell = remoteConfig.header?.showNotificationBell !== false && !effectiveHideNotifications;
  const showBellBadge = remoteConfig.header?.showBellBadgeCount !== false && hasUnread;
  const showAvatarLogo = remoteConfig.header?.showAvatarButton !== false;

  useEffect(() => {
    // Fetch live announcements from public endpoint
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});

    // Check unread status
    const lastRead = localStorage.getItem('yaad_last_notif_read');
    if (!lastRead) {
      setHasUnread(true);
    }
  }, []);

  const handleOpenNotifications = () => {
    setHasUnread(false);
    localStorage.setItem('yaad_last_notif_read', String(Date.now()));
    fetch('/api/notifications/open', { method: 'POST' }).catch(() => {});

    if (onNotificationsClick) {
      onNotificationsClick();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/notifications');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.pushState({}, '', '/home');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-xl border-b border-surface-dim/40 transition-colors select-none">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 lg:px-8 h-14 w-full max-w-7xl mx-auto gap-2">
          {/* Left Action: Back Arrow on non-home screens, Official Logo on Home */}
          <div className="flex items-center justify-start min-w-[44px]">
            {showBack ? (
              <button
                id="top_header_back_btn"
                type="button"
                onClick={handleBackClick}
                aria-label="Go back"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            ) : showAvatarLogo ? (
              <div id="top_header_logo_area" className="flex items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-2xs p-1">
                  <picture className="h-full w-full flex items-center justify-center">
                    <source srcSet="/logo-128.webp" type="image/webp" />
                    <img
                      id="top_header_logo"
                      src="/logo.png"
                      alt="YAAD Logo"
                      width={36}
                      height={36}
                      draggable={false}
                      className="h-full w-full object-contain select-none transition-transform duration-200 hover:scale-105 active:scale-95"
                    />
                  </picture>
                </div>
              </div>
            ) : (
              <div className="w-11" />
            )}
          </div>

          {/* Center Title - Standard English Wordmark YAAD Centered without overlap */}
          <div
            id="top_header_title"
            className="flex items-center justify-center text-center px-1 min-w-0"
          >
            <h1 className="text-lg sm:text-xl font-extrabold font-display text-primary tracking-tight truncate flex items-center justify-center">
              <div
                id="top_header_wordmark"
                className="inline-flex items-center gap-2 justify-center select-none"
                dir="ltr"
              >
                <span className="font-extrabold text-primary tracking-tight text-lg sm:text-xl font-display leading-none">
                  YAAD
                </span>
              </div>
            </h1>
          </div>

          {/* Right Action: Cleanly aligned without crowding or collision */}
          <div className="flex items-center justify-end gap-2 shrink-0 min-w-[44px]">
            {rightAction && (
              <div className="flex items-center gap-2">
                {rightAction}
              </div>
            )}

            {/* Push Notification Bell Button in trailing-most slot with top-right dot badge */}
            {showNotificationBell && (
              <BadgeAnchor
                placement="top-right"
                badge={
                  showBellBadge ? (
                    <Badge dot tone="warning" pulse ariaLabel="Unread notifications" />
                  ) : null
                }
              >
                <button
                  id="top_header_notification_btn"
                  type="button"
                  onClick={handleOpenNotifications}
                  aria-label="Notifications"
                  title="Notifications & Alerts"
                  className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low active:bg-surface-container active:scale-95 transition-[transform,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 cursor-pointer"
                >
                  <Bell className="w-5 h-5 stroke-[2]" />
                </button>
              </BadgeAnchor>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
