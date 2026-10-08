import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Bell,
  X,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { APP_IMAGES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onAvatarClick?: () => void;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
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
  onSettingsClick,
  onAvatarClick,
  onMenuClick,
  rightAction,
}) => {
  const { language } = useLanguage();
  const [isGearTapped, setIsGearTapped] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(false);

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
    setIsNotifOpen(true);
    setHasUnread(false);
    localStorage.setItem('yaad_last_notif_read', String(Date.now()));
    fetch('/api/notifications/open', { method: 'POST' }).catch(() => {});
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGearTapped(true);
    setTimeout(() => setIsGearTapped(false), 400);

    const handler = onSettingsClick || onMenuClick || onAvatarClick;
    if (handler) {
      handler();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/settings');
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
      <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40 transition-colors select-none">
        <div className="relative flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14 w-full max-w-7xl mx-auto">
          {/* Left Action: Back Arrow on non-home screens, Official Logo on Home */}
          <div className="flex items-center z-10 min-w-[40px]">
            {showBack ? (
              <button
                id="top_header_back_btn"
                type="button"
                onClick={handleBackClick}
                aria-label="Go back"
                className="w-10 h-10 -ms-2 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-primary active:scale-95 duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            ) : (
              <div id="top_header_logo_area" className="flex items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-2xs p-1">
                  <img
                    id="top_header_logo"
                    src={APP_IMAGES.logoTransparent || '/logo.png'}
                    alt="YAAD Logo"
                    draggable={false}
                    className="h-full w-full object-contain select-none transition-transform duration-200 hover:scale-105 active:scale-95"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Title - Standard English Wordmark YAAD Centered */}
          <div
            id="top_header_title"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4 max-w-[62%] sm:max-w-[70%]"
          >
            <h1 className="text-lg sm:text-xl font-extrabold font-['Plus_Jakarta_Sans'] text-primary tracking-tight truncate flex items-center justify-center">
              <div
                id="top_header_wordmark"
                className="inline-flex items-center gap-2 justify-center select-none"
                dir="ltr"
              >
                <span className="font-extrabold text-primary tracking-tight text-lg sm:text-xl font-['Plus_Jakarta_Sans'] leading-none">
                  YAAD
                </span>
              </div>
            </h1>
          </div>

          {/* Right Action: Notifications & Settings always present */}
          <div className="flex items-center justify-end gap-1 min-w-[40px] z-10">
            {rightAction && (
              <div className="me-1">
                {rightAction}
              </div>
            )}

            {/* Push Notification Bell Button */}
            <button
              id="top_header_notification_btn"
              type="button"
              onClick={handleOpenNotifications}
              aria-label="Notifications"
              title="Notifications & Alerts"
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low active:bg-surface-container active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </button>

            {/* Settings Gear Button */}
            <button
              id="top_header_settings_btn"
              data-testid="top_header_settings_btn"
              type="button"
              onClick={handleSettingsClick}
              aria-label="Settings"
              title="Settings"
              className="w-10 h-10 -me-2 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low active:bg-surface-container active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer group"
            >
              <Settings
                className={`w-5 h-5 text-primary stroke-[2] transition-transform duration-300 ease-out group-hover:rotate-45 motion-reduce:transform-none ${
                  isGearTapped ? 'rotate-90' : 'rotate-0'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer / Modal (Redesigned per Screenshot 2) */}
      {isNotifOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsNotifOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-200 mt-12 sm:mt-16 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center shadow-xs">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 font-['Plus_Jakarta_Sans']">
                    {language === 'ur' ? 'نوٹیفکیشنز اور الرٹس' : 'Notifications & Alerts'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {language === 'ur' ? 'منڈی اپڈیٹس اور راشن یاد دہانی' : 'Mandi updates and grocery reminders'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification List with Relative Timestamps & Category Badges */}
            <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto divide-y divide-neutral-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="pt-2.5 first:pt-0 group hover:bg-neutral-50/60 -mx-2 px-2.5 py-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getNotificationBadgeBg(
                        n.category
                      )}`}
                    >
                      {getNotificationIcon(n.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-neutral-900 truncate">
                          {language === 'ur' ? n.titleUr || n.titleEn : n.titleEn}
                        </h4>
                        {n.sentAt && (
                          <span className="text-[10px] font-medium text-neutral-400 shrink-0 flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{formatRelativeTime(n.sentAt, language)}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {language === 'ur' ? n.bodyUr || n.bodyEn : n.bodyEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Redesigned Footer per Screenshot 2 */}
            <div className="px-5 py-3.5 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'سب پڑھ لیے گئے' : 'Up to date'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen(false);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/settings/notifications');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="inline-flex items-center gap-1 text-[#003527] hover:text-[#002b1f] font-bold text-xs group cursor-pointer transition-colors"
              >
                <span>{language === 'ur' ? 'نوٹیفکیشن سیٹنگز' : 'Notification Settings'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
