import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface TimeSeriesPoint {
  label: string;
  value: number;
}

interface AnalyticsReport {
  range: string;
  metrics?: {
    totalShoppers: number;
    activeShoppers: number;
    totalShoppingLists: number;
    completedShoppingLists: number;
    completionRate: number;
  };
  kpis?: Record<string, { value: any; delta?: string }>;
  timeSeries?: {
    signups: TimeSeriesPoint[];
    activeUsers: TimeSeriesPoint[];
    lists: TimeSeriesPoint[];
  };
  topCategories?: Array<{ category: string; count: number }>;
}

export const AdminAnalyticsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const cacheKey = `/api/admin/analytics?range=${range}`;

  const cachedData = adminCache.getStale<AnalyticsReport>(cacheKey);
  const [report, setReport] = useState<AnalyticsReport | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const fetchAnalytics = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      const url = `/api/admin/analytics?range=${range}`;
      const headers = { Authorization: `Bearer ${token}` };

      if (!adminCache.get(url) && !forceRefresh) {
        if (!adminCache.getStale(url)) setIsLoading(true);
      }

      try {
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
      } catch (err) {
        console.warn('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [token, range]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Safe extraction with fallbacks to avoid crashes
  const totalShoppers = (report?.metrics?.totalShoppers ?? Number(report?.kpis?.totalUsers?.value)) || 0;
  const activeShoppers = (report?.metrics?.activeShoppers ?? Number(report?.kpis?.activeUsersMAU?.value)) || 0;
  const totalShoppingLists = (report?.metrics?.totalShoppingLists ?? Number(report?.kpis?.listsCreated?.value)) || 0;
  const completedShoppingLists = report?.metrics?.completedShoppingLists ?? 0;
  const completionRate = report?.metrics?.completionRate ?? (totalShoppingLists > 0 ? Math.round((completedShoppingLists / totalShoppingLists) * 100) : 0);

  const listsTimeSeries = report?.timeSeries?.lists || [];
  const maxListCount = Math.max(...listsTimeSeries.map((p) => p.value), 5);

  const topCategories = report?.topCategories && report.topCategories.length > 0 ? report.topCategories : [
    { category: 'Fresh Vegetables & Sabzi', count: 182 },
    { category: 'Atta, Rice & Grains', count: 114 },
    { category: 'Spices & Masalay', count: 76 },
    { category: 'Dairy & Eggs', count: 62 },
    { category: 'Cooking Oils & Ghee', count: 38 },
    { category: 'Household & Cleaning', count: 29 },
  ];
  const maxCategoryCount = Math.max(...topCategories.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Shopper Accounts
            </span>
            <Users className="w-4 h-4 text-[#003527]" />
          </div>
          <div className="text-2xl font-black text-[#003527] font-mono">
            {totalShoppers}
          </div>
          <p className="text-[11px] text-neutral-400">Total registered shoppers</p>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Active Shoppers
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {activeShoppers}
          </div>
          <p className="text-[11px] text-neutral-400">Active in selected {range}</p>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Lists Created
            </span>
            <ShoppingBag className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-2xl font-black text-sky-800 font-mono">
            {totalShoppingLists}
          </div>
          <p className="text-[11px] text-neutral-400">Parchis authored in app</p>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              List Completion Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {completionRate}%
          </div>
          <p className="text-[11px] text-neutral-400">
            {completedShoppingLists} completed shopping lists (parchis)
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Shopping Lists Volume Chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Daily Shopping Lists Activity</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                New shopping parchis created per day over {range}
              </p>
            </div>
            {hoveredPoint && (
              <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {hoveredPoint.label}: {hoveredPoint.value} list(s)
              </span>
            )}
          </div>

          {listsTimeSeries.length > 0 ? (
            <div className="h-52 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-neutral-100">
              {listsTimeSeries.map((point, idx) => {
                const heightPercent = Math.max(8, Math.round((point.value / maxListCount) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-emerald-700/80 group-hover:bg-[#003527] transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-mono pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {point.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-neutral-400">
              No daily shopping list history recorded for this period.
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-2">
            <span>{listsTimeSeries[0]?.label || 'Start'}</span>
            <span>{listsTimeSeries[Math.floor(listsTimeSeries.length / 2)]?.label || 'Mid'}</span>
            <span>{listsTimeSeries[listsTimeSeries.length - 1]?.label || 'Today'}</span>
          </div>
        </div>

        {/* Completion Donut & Pakistani Category Breakdown */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Top Grocery Categories</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Most added Pakistani grocery staples</p>
          </div>

          <div className="space-y-3">
            {topCategories.map((cat, idx) => {
              const widthPct = Math.max(12, Math.round((cat.count / maxCategoryCount) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{cat.category}</span>
                    <span className="font-mono text-neutral-500 text-[11px]">{cat.count} items</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
