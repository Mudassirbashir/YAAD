import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Bell, X, CheckCircle2, Clock } from 'lucide-react';
import { APP_IMAGES } from '../data/initialData';
import { BidiText } from '../utils/bidi';
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
  titleEn: string;
  titleUr: string;
  bodyEn: string;
  bodyUr: string;
  iconUrl?: string;
  sentAt?: number | string;
}

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_welcome',
    titleEn: 'Welcome to YAAD! 🛒',
    titleUr: 'یاد ایپ میں خوش آمدید!',
    bodyEn: 'Create smart grocery lists, organize your mandi trips, and save money effortlessly.',
    bodyUr: 'اپنی گھریلو خریداری اور سبزی منڈی کی پرچیاں آسانی سے منظم کریں۔',
    sentAt: Date.now() - 3600000,
  },
  {
    id: 'notif_mandi',
    titleEn: 'Friday Mandi Reminder 🥕',
    titleUr: 'جمعہ بازار اور منڈی کی یاد دہانی',
    bodyEn: 'Fresh vegetables, chakki atta, and daily staples are restocked for the weekend.',
    bodyUr: 'ہفتہ وار تازہ سبزیوں اور راشن کی خریداری کے لیے اپنی پرچی چیک کریں۔',
    sentAt: Date.now() - 86400000,
  },
];

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
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGearTapped(true);
    setTimeout(() => setIsGearTapped(false), 400);

    const handler = onSettingsClick || onMenuClick || onAvatarClick;
    if (handler) {
      handler();
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/40 transition-colors select-none">
        <div className="relative flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14 w-full max-w-7xl mx-auto">
          {/* Left Action / Brand Anchor */}
          <div className="flex items-center z-10 min-w-[40px]">
            {showBack ? (
              <button
                id="top_header_back_btn"
                onClick={onBack}
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

          {/* Center Title - Visually Centered */}
          <div
            id="top_header_title"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4 max-w-[62%] sm:max-w-[70%]"
          >
            <h1 className="text-lg sm:text-xl font-extrabold font-['Plus_Jakarta_Sans'] text-primary tracking-tight truncate flex items-center justify-center">
              {title === 'YAAD' ? (
                <div
                  id="top_header_wordmark"
                  className="inline-flex items-center gap-2 justify-center select-none"
                  dir="ltr"
                >
                  <span className="font-extrabold text-primary tracking-tight text-lg sm:text-xl font-['Plus_Jakarta_Sans'] leading-none">
                    YAAD
                  </span>
                </div>
              ) : (
                <BidiText>{title}</BidiText>
              )}
            </h1>
          </div>

          {/* Right Action: Notifications & Settings */}
          <div className="flex items-center justify-end gap-1 min-w-[40px] z-10">
            {rightAction ? (
              rightAction
            ) : (
              <>
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
                {(onSettingsClick || onMenuClick || onAvatarClick) && (
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
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Drawer / Modal */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-dim overflow-hidden animate-in zoom-in-95 duration-200 mt-12 sm:mt-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-dim bg-surface-container-lowest">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 font-['Manrope']">
                    {language === 'ur' ? 'نوٹیفکیشنز اور اعلانات' : 'Notifications & Alerts'}
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    {language === 'ur' ? 'منڈی اور خریداری کے الرٹس' : 'Mandi updates and grocery reminders'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification List */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto divide-y divide-neutral-100">
              {notifications.map((n) => (
                <div key={n.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-neutral-900 leading-tight">
                      {language === 'ur' ? n.titleUr || n.titleEn : n.titleEn}
                    </h4>
                    {n.sentAt && (
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {language === 'ur' ? n.bodyUr || n.bodyEn : n.bodyEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-dim flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'سب پڑھ لیے گئے' : 'Up to date'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen(false);
                  if (onSettingsClick) onSettingsClick();
                }}
                className="text-[#003527] font-bold text-xs hover:underline cursor-pointer"
              >
                {language === 'ur' ? 'نوٹیفکیشن سیٹنگز' : 'Notification Settings'} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
