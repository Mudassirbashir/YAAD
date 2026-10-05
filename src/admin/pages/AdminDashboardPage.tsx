import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  History,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X,
  ShoppingBag,
  CheckCheck,
  Package,
  Headphones,
  RefreshCw,
  Database,
  Radio,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ROLE_LABELS } from '../types';
import { useAdminRealtime } from '../hooks/useAdminRealtime';

import { adminCache } from '../utils/adminCache';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export interface AuthoritativeDashboardStats {
  totalUsers: number;
  activeUsers30d: number;
  activeUsers7d: number;
  totalLists: number;
  completedLists: number;
  totalItems: number;
  completedItems: number;
  totalAdmins: number;
  activeAdmins: number;
  pendingInvites: number;
  totalAuditLogs: number;
  openTickets: number;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { admin, token, logout } = useAdminAuth();

  const [stats, setStats] = useState<AuthoritativeDashboardStats>(() => {
    // 0ms instant initialization from cache if available
    const cached = adminCache.getStale<AuthoritativeDashboardStats>('/api/admin/dashboard/stats');
    return (
      cached || {
        totalUsers: 0,
        activeUsers30d: 0,
        activeUsers7d: 0,
        totalLists: 0,
        completedLists: 0,
        totalItems: 0,
        completedItems: 0,
        totalAdmins: 1,
        activeAdmins: 1,
        pendingInvites: 0,
        totalAuditLogs: 0,
        openTickets: 0,
      }
    );
  });

  const [recentLogs, setRecentLogs] = useState<any[]>(() => {
    const cached = adminCache.getStale<{ logs: any[] }>('/api/admin/audit-logs?limit=5');
    return cached?.logs || [];
  });

  const [securityAlerts, setSecurityAlerts] = useState<any[]>(() => {
    const cached = adminCache.getStale<{ alerts: any[] }>('/api/admin/security-alerts');
    return cached?.alerts || [];
  });

  const [isLoading, setIsLoading] = useState(() => {
    return !adminCache.get('/api/admin/dashboard/stats');
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      if (forceRefresh || !adminCache.get('/api/admin/dashboard/stats')) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const { data: statsData } = await adminCache.fetchWithSwr<AuthoritativeDashboardStats>(
          '/api/admin/dashboard/stats',
          headers,
          (fresh) => {
            if (fresh) {
              setStats({
                totalUsers: fresh.totalUsers ?? 0,
                activeUsers30d: fresh.activeUsers30d ?? 0,
                activeUsers7d: fresh.activeUsers7d ?? 0,
                totalLists: fresh.totalLists ?? 0,
                completedLists: fresh.completedLists ?? 0,
                totalItems: fresh.totalItems ?? 0,
                completedItems: fresh.completedItems ?? 0,
                totalAdmins: fresh.totalAdmins ?? 1,
                activeAdmins: fresh.activeAdmins ?? 1,
                pendingInvites: fresh.pendingInvites ?? 0,
                totalAuditLogs: fresh.totalAuditLogs ?? 0,
                openTickets: fresh.openTickets ?? 0,
              });
            }
          },
          forceRefresh
        );

        if (statsData) {
          setStats({
            totalUsers: statsData.totalUsers ?? 0,
            activeUsers30d: statsData.activeUsers30d ?? 0,
            activeUsers7d: statsData.activeUsers7d ?? 0,
            totalLists: statsData.totalLists ?? 0,
            completedLists: statsData.completedLists ?? 0,
            totalItems: statsData.totalItems ?? 0,
            completedItems: statsData.completedItems ?? 0,
            totalAdmins: statsData.totalAdmins ?? 1,
            activeAdmins: statsData.activeAdmins ?? 1,
            pendingInvites: statsData.pendingInvites ?? 0,
            totalAuditLogs: statsData.totalAuditLogs ?? 0,
            openTickets: statsData.openTickets ?? 0,
          });
        }

        // Secondary async queries with SWR
        adminCache
          .fetchWithSwr<{ logs: any[] }>(
            '/api/admin/audit-logs?limit=5',
            headers,
            (fresh) => {
              if (fresh?.logs) setRecentLogs(fresh.logs);
            },
            forceRefresh
          )
          .then(({ data }) => {
            if (data?.logs) setRecentLogs(data.logs);
          });

        adminCache
          .fetchWithSwr<{ alerts: any[] }>(
            '/api/admin/security-alerts',
            headers,
            (fresh) => {
              if (fresh?.alerts) setSecurityAlerts(fresh.alerts);
            },
            forceRefresh
          )
          .then(({ data }) => {
            if (data?.alerts) setSecurityAlerts(data.alerts);
          });
      } catch (err: any) {
        setErrorMessage(err.message || 'Error communicating with Supabase data layer.');
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Phase 6: Authoritative Supabase Realtime subscription
  useAdminRealtime({
    tables: ['shopping_lists', 'admin_audit_logs', 'support_tickets'],
    onDatabaseChange: () => {
      fetchDashboardData(true);
    },
    enabled: Boolean(token),
  });

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleDismissAlert = async (alertId: string) => {
    if (!token) return;
    try {
      await fetch('/api/admin/security-alerts/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId }),
      });
      setSecurityAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const roleMeta = admin?.role ? ROLE_LABELS[admin.role] : null;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Security Alerts Banner */}
      {securityAlerts.length > 0 && (
        <div className="space-y-2">
          {securityAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs animate-in slide-in-from-top-2"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-800 text-sm">{alert.title}</div>
                  <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">{alert.message}</div>
                  <div className="text-[10px] text-rose-500 font-mono mt-1">
                    Logged: {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDismissAlert(alert.id)}
                className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Database Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 text-sm">DATA ERROR: Authoritative Supabase Query Failed</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shrink-0 cursor-pointer hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Welcome Banner with Source-of-Truth Pill */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#003527] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-700" />
                <span>Supabase Single Source of Truth</span>
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50/50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Welcome, {admin?.name || 'Staff Member'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Authenticated as{' '}
              <strong className="text-neutral-900 font-bold">{roleMeta?.title || admin?.role}</strong> with mandatory TOTP 2FA.
              All statistics are calculated strictly from the production database schema.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh database metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {admin?.role === 'super_admin' && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/team')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#003527] hover:bg-[#004734] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Staff</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: Authoritative Application KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
              Live App Shopper &amp; List Metrics
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">Real-Time Sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: App Shoppers */}
          <div
            onClick={() => onNavigate('/admin/users')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-[#003527]/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#003527] transition-colors">
                Shopper Accounts
              </span>
              <Users className="w-4 h-4 text-[#003527]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#003527] font-mono">
              {isLoading ? '...' : stats.totalUsers}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>{stats.activeUsers30d} active in last 30d</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded">App Accounts</span>
            </div>
          </div>

          {/* Card 2: Shopping Lists */}
          <div
            onClick={() => onNavigate('/admin/lists')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-emerald-600/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                Shopping Lists (Parchis)
              </span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
              {isLoading ? '...' : stats.totalLists}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>{stats.completedLists} completed shopping lists</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded">Active Lists</span>
            </div>
          </div>

          {/* Card 3: Items in Lists */}
          <div
            onClick={() => onNavigate('/admin/lists')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-sky-600/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-sky-700 transition-colors">
                List Items Added
              </span>
              <CheckCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-800 font-mono">
              {isLoading ? '...' : stats.totalItems}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>{stats.completedItems} items checked off (done)</span>
              <span className="text-[10px] font-mono text-sky-700 bg-sky-50/60 px-1.5 py-0.5 rounded">Parchi Items</span>
            </div>
          </div>

          {/* Card 4: Support & Inquiries */}
          <div 
            onClick={() => onNavigate('/admin/tickets')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-amber-600/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-700 transition-colors">Support Inquiries</span>
              <Headphones className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
              {isLoading ? '...' : stats.openTickets}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Awaiting staff response</span>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50/60 px-1.5 py-0.5 rounded">Support Desk</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Staff & Governance KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
            Staff &amp; Access Governance
          </h3>
          <span className="text-[10px] text-neutral-400 font-mono">Secure Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Admins */}
          <div
            onClick={() => onNavigate('/admin/team')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-[#003527]/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#003527] transition-colors">
                Staff Members
              </span>
              <Users className="w-4 h-4 text-[#003527]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#003527] font-mono">
              {isLoading ? '...' : stats.totalAdmins}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats.activeAdmins} active account(s)</span>
            </div>
          </div>

          {/* Card 2: 2FA Enforcement */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">2FA Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">100%</div>
            <div className="text-[11px] text-neutral-500">Strictly enforced for all roles</div>
          </div>

          {/* Card 3: Pending Invites */}
          <div
            onClick={() => onNavigate('/admin/team')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-amber-600/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-700 transition-colors">
                Pending Invites
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
              {isLoading ? '...' : stats.pendingInvites}
            </div>
            <div className="text-[11px] text-neutral-500">24-hour expiring single-use tokens</div>
          </div>

          {/* Card 4: Audit Entries */}
          <div
            onClick={() => onNavigate('/admin/audit-log')}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-sky-600/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-sky-700 transition-colors">
                Audit Trail Events
              </span>
              <History className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-800 font-mono">
              {isLoading ? '...' : stats.totalAuditLogs}
            </div>
            <div className="text-[11px] text-neutral-500">Verified audit records</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('/admin/users')}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm group-hover:text-[#003527]">
              Shopper Accounts &amp; Activity
            </span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#003527] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            View registered shoppers, mobile numbers, signup dates, and moderation status.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/lists')}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm group-hover:text-[#003527]">
              Shopping Lists (Parchis)
            </span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#003527] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Inspect live grocery lists, added items, and completed checkoffs created by users.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/admin/catalog')}
          className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm group-hover:text-[#003527]">
              Grocery Item Catalog
            </span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#003527] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Manage Pakistani grocery vocabulary, Urdu/Roman Urdu terms, and category auto-suggestions.
          </p>
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <span>Recent Security &amp; Activity Events</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Authoritative audit log of staff actions and system events</p>
          </div>
          {admin?.role === 'super_admin' && (
            <button
              type="button"
              onClick={() => onNavigate('/admin/audit-log')}
              className="text-xs text-[#003527] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400">
            No audit events recorded yet in database.
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 text-xs text-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#003527] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {log.action}
                  </span>
                  <span className="text-neutral-700 font-medium">{log.adminEmail || 'System'}</span>
                  {log.metadata?.note && (
                    <span className="text-neutral-400 hidden sm:inline">&bull; {log.metadata.note}</span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
