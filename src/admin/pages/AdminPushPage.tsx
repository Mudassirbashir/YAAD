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
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface PushCampaign {
  id: string;
  title_en: string;
  title_ur?: string;
  body_en: string;
  target_audience: string;
  status: 'sent' | 'scheduled' | 'draft';
  estimated_recipients: number;
  actual_sent_count: number;
  delivered_count: number;
  opened_count: number;
  created_at: string;
  sent_at?: string;
}

export const AdminPushPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
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

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Push Notifications
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Broadcast shopping reminders, weekend market alerts, and family list updates to shoppers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchCampaigns(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Zero Active Broadcast Campaigns</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            No push notification broadcasts have been scheduled. Broadcast campaigns created for seasonal rashan alerts or shopping reminders will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#003527]">{c.title_en}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-neutral-600">{c.body_en}</p>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Audience: {c.target_audience}</span>
                <span>Sent: {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : 'Draft'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
