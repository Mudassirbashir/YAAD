import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  History,
  UserPlus,
  ArrowRight,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ROLE_LABELS } from '../types';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { admin, token } = useAdminAuth();

  const [stats, setStats] = useState<{
    totalAdmins: number;
    activeAdmins: number;
    pendingInvites: number;
    auditLogCount: number;
  }>({
    totalAdmins: 1,
    activeAdmins: 1,
    pendingInvites: 0,
    auditLogCount: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [teamRes, auditRes, invitesRes, alertsRes] = await Promise.all([
          fetch('/api/admin/team?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/audit-logs?limit=5', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/admin/invites', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/admin/security-alerts', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          const active = teamData.admins.filter((a: any) => a.status === 'active').length;
          setStats((prev) => ({
            ...prev,
            totalAdmins: teamData.total || teamData.admins.length,
            activeAdmins: active,
          }));
        }

        if (invitesRes && invitesRes.ok) {
          const invData = await invitesRes.json();
          const pending = (invData.invites || []).filter((i: any) => i.status === 'pending').length;
          setStats((prev) => ({ ...prev, pendingInvites: pending }));
        }

        if (auditRes && auditRes.ok) {
          const auditData = await auditRes.json();
          setRecentLogs(auditData.logs || []);
          setStats((prev) => ({ ...prev, auditLogCount: auditData.total || 0 }));
        }

        if (alertsRes && alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setSecurityAlerts(alertsData.alerts || []);
        }
      } catch (err) {
        console.error('Error loading admin dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

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
      {/* Security Alerts Banner (Triggered upon 5 failed attempts / lockouts) */}
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
                className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
                title="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#003527] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Staff Gateway Active
              </span>
              <span className="text-xs text-neutral-500">Access Governance &amp; Controls</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Welcome, {admin?.name || 'Staff Member'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Authenticated as{' '}
              <strong className="text-neutral-900 font-bold">{roleMeta?.title || admin?.role}</strong> with mandatory TOTP 2FA.
              Manage authorized staff members, issue secure single-use expiring invitations, and monitor the append-only audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {admin?.role === 'super_admin' && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/team')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#003527] hover:bg-[#004734] active:bg-[#00251b] text-white font-bold text-xs shadow-md shadow-emerald-950/15 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Staff Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Admins */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-[#003527]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#003527] font-mono">{stats.totalAdmins}</div>
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
          <div className="text-[11px] text-neutral-500">Enforced for all admin roles</div>
        </div>

        {/* Card 3: Pending Invites */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Invites</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{stats.pendingInvites}</div>
          <div className="text-[11px] text-neutral-500">24-hour expiring tokens</div>
        </div>

        {/* Card 4: Audit Entries */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Trail Events</span>
            <History className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-800 font-mono">{stats.auditLogCount}</div>
          <div className="text-[11px] text-neutral-500">Append-only security log</div>
        </div>
      </div>

      {/* Security & Access Verification Checklist */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Security &amp; Access Controls Operational</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Hardened
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-700">
          <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">Self-Destructing Bootstrap Flow</span>
              <span className="text-neutral-500">/admin/setup permanently returns 404 once Super Admin is initialized.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">Mandatory TOTP 2FA + Recovery Backup</span>
              <span className="text-neutral-500">No admin can log in without 6-digit TOTP verification or emergency recovery code.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">Invite-Only Access (No Public Signup)</span>
              <span className="text-neutral-500">/admin/signup returns 404. Only Super Admins can issue single-use 24h invites.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">5-Failure Lockout &amp; Super Admin Alerts</span>
              <span className="text-neutral-500">5 consecutive failed attempts trigger 15-minute account lock and security alerts.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <span>Recent Audit Events</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Append-only operational and security log</p>
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
            No audit events recorded yet.
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
