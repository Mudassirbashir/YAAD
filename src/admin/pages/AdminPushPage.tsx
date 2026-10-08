import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Search,
  Plus,
  RefreshCw,
  Send,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Smartphone,
  ExternalLink,
  X,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface PushCampaign {
  id: string;
  titleEn?: string;
  title_en?: string;
  titleUr?: string;
  title_ur?: string;
  bodyEn?: string;
  body_en?: string;
  bodyUr?: string;
  body_ur?: string;
  iconUrl?: string;
  targetAudience?: string;
  target_audience?: string;
  status: 'sent' | 'scheduled' | 'draft';
  estimatedRecipients?: number;
  estimated_recipients?: number;
  actualSentCount?: number;
  actual_sent_count?: number;
  deliveredCount?: number;
  delivered_count?: number;
  openedCount?: number;
  opened_count?: number;
  sentAt?: number | string;
  sent_at?: number | string;
  createdAt?: number | string;
  created_at?: number | string;
  createdBy?: string;
}

interface PushTemplate {
  id: string;
  name: string;
  titleEn: string;
  titleUr: string;
  bodyEn: string;
  bodyUr: string;
  category: string;
}

const DEFAULT_TEMPLATES: PushTemplate[] = [
  {
    id: 'tpl_mandi_rates',
    name: 'Sabzi Mandi Rates 🛒',
    titleEn: 'Sabzi Mandi Fresh Rate Alert 🛒',
    titleUr: 'سبزی منڈی تازہ ترین ریٹ اپڈیٹ',
    bodyEn: "Today's fresh arrivals: Onions, Tomatoes, and Ginger at wholesale Mandi rates. Update your YAAD parchi before heading out!",
    bodyUr: 'آج کی تازہ سبزیاں: پیاز، ٹماٹر اور ادرک ہول سیل منڈی ریٹ پر۔ خریداری سے پہلے اپنی یاد پرچی تیار کر لیں۔',
    category: 'mandi',
  },
  {
    id: 'tpl_rashan_guide',
    name: 'Ramadan Rashan Guide 🌙',
    titleEn: 'Ramadan Rashan Package Guide 🌙',
    titleUr: 'ماہانہ راشن پیکیج اور ضروری سامان کی لسٹ',
    bodyEn: "Plan your monthly ration budget. Check today's official rates for Baisan, Chakki Atta, Daal Chana, and Cooking Oil.",
    bodyUr: 'ماہانہ راشن کا بجٹ بنائیں: بیسن، چکی کا آٹا، دال چنا اور گھی کے سرکاری نرخ چیک کریں۔',
    category: 'rashan',
  },
  {
    id: 'tpl_jumma_bazaar',
    name: 'Friday Jumma Bazaar 🏷️',
    titleEn: 'Friday Jumma Bazaar Specials 🏷️',
    titleUr: 'جمعہ بازار اسپیشل بچت ڈیلز',
    bodyEn: 'Compare supermarket prices vs local weekly bazaars directly in YAAD. Save up to 25% on poultry and dry rations today.',
    bodyUr: 'یوٹیلیٹی اسٹور اور ہفتہ وار بازار کے ریٹس کا موازنہ کریں اور 25 فیصد تک بچت کریں۔',
    category: 'savings',
  },
  {
    id: 'tpl_parchi_reminder',
    name: 'Parchi Reminder 📝',
    titleEn: "Don't Forget Your YAAD Grocery List! 📝",
    titleUr: 'اپنی گروسری پرچی چیک کرنا نہ بھولیں',
    bodyEn: 'You have uncrossed items on your active parchi. Open YAAD to check prices and tick off your pantry essentials.',
    bodyUr: 'آپ کی پرچی میں کچھ اشیاء باقی ہیں۔ ایپ کھولیں اور چیک کر لیں۔',
    category: 'reminder',
  },
  {
    id: 'tpl_price_drop',
    name: 'Mandi Price Drop 💡',
    titleEn: 'Mandi Price Drop Alert 💡',
    titleUr: 'سبزیوں اور دالوں کے دام کم ہو گئے',
    bodyEn: 'Mandi rates for potatoes and lentils have decreased by 15%. Stock up your home kitchen smartly with YAAD!',
    bodyUr: 'منڈی میں آلو اور دالوں کے نرخ 15 فیصد گر گئے۔ ابھی خریداری کی لسٹ بنائیں۔',
    category: 'deals',
  },
];

export const AdminPushPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [templates, setTemplates] = useState<PushTemplate[]>(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Broadcast Form Fields
  const [titleEn, setTitleEn] = useState('');
  const [titleUr, setTitleUr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyUr, setBodyUr] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all_active' | 'all' | 'inactive_30d'>('all_active');
  const [iconUrl, setIconUrl] = useState('/logo.png');

  // Device Test State
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const fetchCampaigns = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      if (forceRefresh) {
        adminCache.invalidatePrefix('/api/admin/push');
      }
      const url = '/api/admin/push/campaigns';
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await adminCache.fetchWithSwr<{ campaigns: PushCampaign[] }>(
        url,
        headers,
        (fresh) => {
          if (fresh) setCampaigns(fresh.campaigns || []);
        },
        forceRefresh
      );

      if (data) {
        setCampaigns(data.campaigns || []);
      }
      setIsLoading(false);
    },
    [token]
  );

  const fetchTemplates = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/push/templates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
            setTemplates(data.templates);
          }
        }
      } catch {}
    },
    [token]
  );

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [fetchCampaigns, fetchTemplates]);

  const handleApplyTemplate = (tpl: PushTemplate) => {
    setTitleEn(tpl.titleEn);
    setTitleUr(tpl.titleUr || '');
    setBodyEn(tpl.bodyEn);
    setBodyUr(tpl.bodyUr || '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleTestDeviceNotification = async () => {
    if (!('Notification' in window)) {
      setTestStatus('Browser notifications not supported in this browser.');
      setTimeout(() => setTestStatus(null), 3000);
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        new Notification(titleEn || 'YAAD Market Reminder 🛒', {
          body: bodyEn || 'Don’t forget fresh Sabzi and Chakki Atta for this weekend!',
          icon: '/logo.png',
          badge: '/logo.png',
        });
        setTestStatus('✓ Test notification delivered to your screen!');
      } else {
        setTestStatus('Notification permission was blocked in browser settings.');
      }
    } catch (err: any) {
      setTestStatus(`Error triggering notification: ${err.message}`);
    }

    setTimeout(() => setTestStatus(null), 4000);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !bodyEn.trim()) {
      setErrorMsg('English Title and Message Body are required.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    const payload = {
      title_en: titleEn.trim(),
      title_ur: titleUr.trim() || undefined,
      body_en: bodyEn.trim(),
      body_ur: bodyUr.trim() || undefined,
      icon_url: iconUrl.trim() || '/logo.png',
      target_audience: targetAudience,
    };

    try {
      const res = await fetch('/api/admin/push/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch broadcast');
      }

      setSuccessMsg('Push broadcast dispatched successfully to shoppers!');
      adminCache.invalidatePrefix('/api/admin/push');
      await fetchCampaigns(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setTitleEn('');
        setTitleUr('');
        setBodyEn('');
        setBodyUr('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error dispatching broadcast.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope'] flex items-center gap-2">
            <span>Push Notifications &amp; Alerts</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {campaigns.length} Broadcasts
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Broadcast shopping reminders, weekend mandi updates, and seasonal rashan alerts to shoppers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchCampaigns(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer shadow-2xs"
            title="Refresh broadcasts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleTestDeviceNotification}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 cursor-pointer transition-all"
            title="Send real browser push test"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test On My Device</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Alert toast for device test */}
      {testStatus && (
        <div className="p-3 rounded-2xl bg-neutral-900 text-white text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Quick Pre-written Templates Section */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-[#003527]">Pre-written Grocery &amp; Mandi Templates</h3>
          </div>
          <span className="text-[11px] text-neutral-400">Click to use, edit, or customize</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/60 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex flex-col justify-between gap-2.5"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-900 block">{tpl.titleEn}</span>
                {tpl.titleUr && (
                  <span className="text-[11px] font-semibold text-neutral-500 font-urdu block dir-rtl" dir="rtl">
                    {tpl.titleUr}
                  </span>
                )}
                <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1">{tpl.bodyEn}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="w-full py-1.5 px-3 rounded-lg bg-[#003527] text-white font-bold text-[11px] hover:bg-[#00281e] cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Use Template</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Zero Active Broadcast Campaigns</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              No push broadcasts have been sent yet. Broadcasts created for seasonal rashan alerts or shopping reminders will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Broadcast</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const title = c.titleEn || c.title_en || 'Untitled Broadcast';
            const titleUrdu = c.titleUr || c.title_ur;
            const body = c.bodyEn || c.body_en || '';
            const bodyUrdu = c.bodyUr || c.body_ur;
            const audience = c.targetAudience || c.target_audience || 'all_active';
            const sentAtRaw = c.sentAt || c.sent_at || c.createdAt || c.created_at;
            const sentAtFormatted = sentAtRaw ? new Date(sentAtRaw).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Draft';
            const recipients = c.actualSentCount ?? c.actual_sent_count ?? c.estimatedRecipients ?? c.estimated_recipients ?? 0;
            const delivered = c.deliveredCount ?? c.delivered_count ?? recipients;
            const opened = c.openedCount ?? c.opened_count ?? 0;
            const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;

            return (
              <div
                key={c.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527]/40 hover:shadow-md transition-all space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#003527] block leading-snug">{title}</span>
                    {titleUrdu && (
                      <span className="text-xs font-semibold text-neutral-500 font-urdu block dir-rtl" dir="rtl">
                        {titleUrdu}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-700 leading-relaxed">{body}</p>
                  {bodyUrdu && (
                    <p className="text-xs text-neutral-500 font-urdu pt-1 border-t border-neutral-200/60" dir="rtl">
                      {bodyUrdu}
                    </p>
                  )}
                </div>

                {/* Delivery Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-center">
                  <div className="p-2 rounded-xl bg-neutral-50">
                    <span className="block text-[10px] text-neutral-400 font-medium">Audience</span>
                    <span className="text-xs font-bold text-neutral-800 capitalize">
                      {audience.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50">
                    <span className="block text-[10px] text-neutral-400 font-medium">Delivered</span>
                    <span className="text-xs font-bold text-emerald-700">{delivered}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50">
                    <span className="block text-[10px] text-neutral-400 font-medium">Opened</span>
                    <span className="text-xs font-bold text-emerald-800">{opened}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50">
                    <span className="block text-[10px] text-neutral-400 font-medium">Open Rate</span>
                    <span className="text-xs font-bold text-emerald-800">{openRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Dispatched: {sentAtFormatted}</span>
                  </span>
                  <span>Target: Web &amp; Mobile</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                    Compose Push Notification Broadcast
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Send market alerts, deals, or grocery reminders to YAAD shoppers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendBroadcast} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Pre-written Template Selector */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <label className="block font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Load From Pre-written Template</span>
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const chosen = templates.find((t) => t.id === e.target.value);
                    if (chosen) {
                      setTitleEn(chosen.titleEn);
                      setTitleUr(chosen.titleUr || '');
                      setBodyEn(chosen.bodyEn);
                      setBodyUr(chosen.bodyUr || '');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-neutral-800 focus:outline-none focus:border-[#003527] text-xs font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Select a pre-written template to auto-fill --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* English Title & Urdu Title */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Notification Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Weekend Sabzi Mandi Reminder 🛒"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Notification Title (Urdu - Optional)
                </label>
                <input
                  type="text"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  placeholder="ویک اینڈ سبزی منڈی گروسری یاد دہانی"
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-urdu text-right"
                />
              </div>

              {/* English Body & Urdu Body */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Message Body (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  placeholder="Add fresh vegetables and dairy to your YAAD parchi before heading to the market this morning!"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Message Body (Urdu - Optional)
                </label>
                <textarea
                  rows={2}
                  value={bodyUr}
                  onChange={(e) => setBodyUr(e.target.value)}
                  placeholder="منڈی جانے سے پہلے اپنی یاد ایپ میں سبزیاں اور دودھ شامل کر لیں۔"
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-urdu text-right"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-800 focus:outline-none focus:border-[#003527] bg-white"
                >
                  <option value="all_active">Active Shoppers (Active in last 30 days)</option>
                  <option value="all">All Registered Customers</option>
                  <option value="inactive_30d">Inactive Re-engagement Campaign (&gt;30 days)</option>
                </select>
              </div>

              {/* App Icon */}
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">Icon URL</label>
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="/logo.png"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-[#003527] text-white font-bold hover:bg-[#00281e] cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
