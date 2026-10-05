import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface AnalyticsReport {
  range: string;
  metrics: {
    totalShoppers: number;
    activeShoppers: number;
    totalShoppingLists: number;
    completedShoppingLists: number;
    completionRate: number;
  };
  topCategories: Array<{ category: string; count: number }>;
}

export const AdminAnalyticsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      const url = `/api/admin/analytics?range=${range}`;
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await adminCache.fetchWithSwr<AnalyticsReport>(
        url,
        headers,
        (fresh) => {
          if (fresh) setReport(fresh);
        },
        forceRefresh
      );

      if (data) {
        setReport(data);
      }
      setIsLoading(false);
    },
    [token, range]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Shopper &amp; List Usage Analytics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track user grocery list creation habits, popular Pakistani staples, and checkoff completion rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 shadow-2xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  range === r
                    ? 'bg-[#003527] text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer shadow-2xs"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Shopper Accounts
              </span>
              <div className="text-2xl font-black text-[#003527] font-mono">
                {report.metrics.totalShoppers}
              </div>
              <p className="text-[11px] text-neutral-400">Total registered shoppers</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Active Shoppers
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {report.metrics.activeShoppers}
              </div>
              <p className="text-[11px] text-neutral-400">Active in selected {range}</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Lists Created
              </span>
              <div className="text-2xl font-black text-sky-800 font-mono">
                {report.metrics.totalShoppingLists}
              </div>
              <p className="text-[11px] text-neutral-400">Parchis authored</p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                List Completion Rate
              </span>
              <div className="text-2xl font-black text-amber-700 font-mono">
                {report.metrics.completionRate}%
              </div>
              <p className="text-[11px] text-neutral-400">
                {report.metrics.completedShoppingLists} completed shopping lists (parchis)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center text-xs text-neutral-400">
          Loading usage analytics...
        </div>
      )}
    </div>
  );
};
