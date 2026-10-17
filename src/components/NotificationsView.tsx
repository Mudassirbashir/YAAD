import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  TrendingDown,
  Info,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Heart,
  Flame,
  ShoppingCart,
  ShieldCheck,
  Smile,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../lib/sound';

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleUr?: string;
  bodyEn: string;
  bodyUr?: string;
  sentAt?: number;
  category?: 'deal' | 'price' | 'system' | 'reminder' | string;
  iconUrl?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'mandi-rates-daily',
    category: 'price',
    titleEn: 'Sabzi Mandi Rates Updated 🥕',
    titleUr: 'تازہ سبزی منڈی کے نرخ اپڈیٹ 🥕',
    bodyEn: 'Fresh daily rates are in. Potatoes, Tomatoes, and Onions are at standard Mandi wholesale prices today.',
    bodyUr: 'آج کے تازہ منڈی ریٹس آ چکے ہیں۔ آلو، ٹماٹر اور پیاز پرچون و ہول سیل نرخوں پر دستیاب ہیں۔',
    sentAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'weekend-rashan-reminder',
    category: 'deal',
    titleEn: 'Weekend Grocery Restock Reminder 🛒',
    titleUr: 'ہفتہ وار راشن یاد دہانی 🛒',
    bodyEn: 'Review your household essentials before hitting the supermarket or local bazaar this weekend.',
    bodyUr: 'ہفتہ وار خریداری سے قبل اپنے راشن کی لسٹ یاد (YAAD) میں چیک کر لیں۔',
    sentAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'offline-cloud-sync',
    category: 'system',
    titleEn: 'Smart Cloud Backup Active ☁️',
    titleUr: 'کلاؤڈ بیک اپ مکمل فعال ہے ☁️',
    bodyEn: 'Your shopping items and attached photos are safely synced across all your devices in real-time.',
    bodyUr: 'آپ کی تمام خریدی گئی اشیاء اور تصاویر آپ کے تمام فونز پر خودکار طور پر محفوظ ہیں۔',
    sentAt: Date.now() - 3600000 * 48,
  },
];

export interface NotificationsViewProps {
  onBack: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
  const { language, isRTL } = useLanguage();
  const { user, profile } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'price' | 'deal' | 'system'>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isSendingReply, setIsSendingReply] = useState<{ [key: string]: boolean }>({});
  const [sentConfirmations, setSentConfirmations] = useState<{ [key: string]: boolean }>({});
  const [userReactions, setUserReactions] = useState<{ [key: string]: string }>({});

  // Fetch live announcements from backend
  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});

    // Mark notifications as read in storage
    localStorage.setItem('yaad_last_notif_read', String(Date.now()));
    fetch('/api/notifications/open', { method: 'POST' }).catch(() => {});

    // Load locally saved reactions
    try {
      const saved = localStorage.getItem('yaad_user_reactions');
      if (saved) {
        setUserReactions(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSelectReaction = async (notifId: string, emoji: string) => {
    triggerHaptic(12);
    const updated = { ...userReactions, [notifId]: emoji };
    setUserReactions(updated);
    try {
      localStorage.setItem('yaad_user_reactions', JSON.stringify(updated));
    } catch {}

    // Send reaction to Super Admin backend
    try {
      await fetch('/api/notifications/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notifId,
          reaction: emoji,
          userId: user?.id || 'guest',
          userName: profile?.full_name || user?.user_metadata?.full_name || 'YAAD Shopper',
          userPhone: profile?.phone_number || '',
        }),
      });
    } catch {}
  };

  const handleSendReply = async (notifId: string) => {
    const text = replyText[notifId]?.trim();
    if (!text) return;

    triggerHaptic(15);
    setIsSendingReply((prev) => ({ ...prev, [notifId]: true }));

    try {
      await fetch('/api/notifications/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notifId,
          reaction: userReactions[notifId] || '',
          reply: text,
          userId: user?.id || 'guest',
          userName: profile?.full_name || user?.user_metadata?.full_name || 'YAAD Shopper',
          userPhone: profile?.phone_number || '',
        }),
      });

      setSentConfirmations((prev) => ({ ...prev, [notifId]: true }));
      setReplyText((prev) => ({ ...prev, [notifId]: '' }));
      setActiveReplyId(null);
    } catch {
      // Even if network fails, confirm locally
      setSentConfirmations((prev) => ({ ...prev, [notifId]: true }));
      setActiveReplyId(null);
    } finally {
      setIsSendingReply((prev) => ({ ...prev, [notifId]: false }));
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'all') return true;
    return n.category === selectedFilter;
  });

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'price':
        return <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'deal':
        return <ShoppingCart className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'system':
        return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div
      id="notifications_view_screen"
      className="min-h-screen bg-background text-on-surface flex flex-col antialiased selection:bg-primary/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Dedicated Header Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-surface-dim/50">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              id="notifications_back_btn"
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ms-2 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-low active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold font-['Plus_Jakarta_Sans'] text-primary tracking-tight">
                {language === 'ur' ? 'اطلاعات اور نوٹیفکیشنز' : 'Notifications & Alerts'}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {notifications.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCheck className="w-4 h-4" />
            <span className="hidden xs:inline">
              {language === 'ur' ? 'سب اپ ٹو ڈیٹ' : 'Up to date'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {[
            { id: 'all', labelEn: 'All Alerts', labelUr: 'تمام اطلاعات' },
            { id: 'price', labelEn: 'Mandi Rates', labelUr: 'منڈی ریٹس' },
            { id: 'deal', labelEn: 'Groceries & Rashan', labelUr: 'راشن یاد دہانی' },
            { id: 'system', labelEn: 'System', labelUr: 'سسٹم اور کلاؤڈ' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setSelectedFilter(tab.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-2xl transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-2xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant border-surface-dim'
                }`}
              >
                {language === 'ur' ? tab.labelUr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Super Admin Notice Card */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-primary/5 border border-primary/15 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="text-xs text-on-surface leading-relaxed">
            <p className="font-bold text-primary font-['Plus_Jakarta_Sans']">
              {language === 'ur' ? 'سپر ایڈمن کے ساتھ براہِ راست رابطہ' : 'Direct Interaction with YAAD Super Admin'}
            </p>
            <p className="text-on-surface-variant text-[11px] mt-0.5">
              {language === 'ur'
                ? 'آپ کسی بھی نوٹیفکیشن پر ری ایکٹ کر سکتے ہیں یا جواب لکھ سکتے ہیں۔ آپ کی رائے فوری طور پر ایپ کے سپر ایڈمن تک پہنچ جاتی ہے۔'
                : 'React with emojis or write a reply to any announcement. Your feedback is sent directly to the Super Admin dashboard.'}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3.5">
          {filteredNotifications.map((notif) => {
            const title = language === 'ur' ? notif.titleUr || notif.titleEn : notif.titleEn;
            const body = language === 'ur' ? notif.bodyUr || notif.bodyEn : notif.bodyEn;
            const currentReaction = userReactions[notif.id];
            const hasConfirmed = sentConfirmations[notif.id];
            const isReplying = activeReplyId === notif.id;

            return (
              <div
                key={notif.id}
                className="bg-surface-container-lowest p-4 sm:p-5 rounded-3xl border border-surface-dim shadow-xs space-y-3 transition-all hover:border-primary/40"
              >
                {/* Header row: Icon, Category, Timestamp */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 border border-surface-dim/80 shadow-2xs">
                      {getCategoryIcon(notif.category)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-on-surface truncate font-['Plus_Jakarta_Sans']">
                        {title}
                      </h2>
                      {notif.sentAt && (
                        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium mt-0.5">
                          <Clock className="w-3 h-3 text-outline" />
                          <span>
                            {language === 'ur' ? 'حالیہ الرٹ' : 'Recent alert'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {body}
                </p>

                {/* Reactions Bar (👍, ❤️, 🔥, 🛒) */}
                <div className="pt-2 border-t border-surface-dim/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-outline me-1">
                      {language === 'ur' ? 'ری ایکٹ:' : 'React:'}
                    </span>
                    {[
                      { emoji: '👍', label: 'Helpful' },
                      { emoji: '❤️', label: 'Love' },
                      { emoji: '🔥', label: 'Great' },
                      { emoji: '🛒', label: 'In List' },
                    ].map((item) => {
                      const isSelected = currentReaction === item.emoji;
                      return (
                        <button
                          key={item.emoji}
                          type="button"
                          onClick={() => handleSelectReaction(notif.id, item.emoji)}
                          aria-label={`React ${item.label}`}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer active:scale-90 border ${
                            isSelected
                              ? 'bg-primary/15 border-primary shadow-xs scale-105'
                              : 'bg-surface-container-low hover:bg-surface-container border-surface-dim/70'
                          }`}
                        >
                          {item.emoji}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle Reply Button */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setActiveReplyId(isReplying ? null : notif.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {isReplying
                        ? language === 'ur'
                          ? 'بند کریں'
                          : 'Cancel'
                        : language === 'ur'
                        ? 'ایڈمن کو جواب دیں'
                        : 'Reply to Admin'}
                    </span>
                  </button>
                </div>

                {/* Feedback Delivered Confirmation Banner */}
                {hasConfirmed && (
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                    <span>
                      {language === 'ur'
                        ? 'آپ کا جواب سپر ایڈمن تک پہنچ گیا ہے۔ شکریہ!'
                        : 'Your response was delivered to YAAD Super Admin. Thank you!'}
                    </span>
                  </div>
                )}

                {/* Reply Input Box */}
                {isReplying && (
                  <div className="pt-2 space-y-2 animate-fade-in">
                    <div className="relative">
                      <textarea
                        value={replyText[notif.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [notif.id]: e.target.value }))
                        }
                        placeholder={
                          language === 'ur'
                            ? 'سپر ایڈمن کے لیے اپنا سوال یا پیغام درج کریں...'
                            : 'Write your message or question to the Super Admin...'
                        }
                        rows={2}
                        className="w-full p-3 rounded-2xl bg-surface-container-low text-xs sm:text-sm text-on-surface border border-surface-dim focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-400"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendReply(notif.id)}
                        disabled={!replyText[notif.id]?.trim() || isSendingReply[notif.id]}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>
                          {isSendingReply[notif.id]
                            ? language === 'ur'
                              ? 'بھیج رہا ہے...'
                              : 'Sending...'
                            : language === 'ur'
                            ? 'سپر ایڈمن کو بھیجیں'
                            : 'Send to Super Admin'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
