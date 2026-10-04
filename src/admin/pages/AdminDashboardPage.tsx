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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [teamRes, auditRes, invitesRes] = await Promise.all([
          fetch('/api/admin/team?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/audit-logs?limit=5', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/admin/invites', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
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
      } catch (err) {
        console.error('Error loading admin dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const roleMeta = admin?.role ? ROLE_LABELS[admin.role] : null;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Module 1 Live
              </span>
              <span className="text-xs text-slate-400">Authentication &amp; Access Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Manrope']">
              Welcome, {admin?.name || 'Staff Member'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              You are authenticated as{' '}
              <strong className="text-white">{roleMeta?.title || admin?.role}</strong> with enforced TOTP 2FA.
              Manage authorized staff members, issue secure expiring invitations, and monitor the append-only audit trail.
            </p>
          </div>

          {admin?.role === 'super_admin' && (
            <button
              type="button"
              onClick={() => onNavigate('/admin/team')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards (Module 1 Scope: Staff, 2FA, Invites, Audit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Admins */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.totalAdmins}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{stats.activeAdmins} active accounts</span>
          </div>
        </div>

        {/* Card 2: 2FA Enforcement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">2FA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</div>
          <div className="text-[11px] text-slate-400">Enforced for all admin roles</div>
        </div>

        {/* Card 3: Pending Invites */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Invites</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.pendingInvites}</div>
          <div className="text-[11px] text-slate-400">7-day expiring tokens</div>
        </div>

        {/* Card 4: Audit Entries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Log Events</span>
            <History className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.auditLogCount}</div>
          <div className="text-[11px] text-slate-400">Cryptographically tracked</div>
        </div>
      </div>

      {/* Module 1 Definition of Done Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Module 1 Verification Checklist</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Ready for User Testing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Isolated Staff Authentication</strong>
              Separate admin login page with email, password, and mandatory RFC 6238 TOTP 2FA.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Session Security &amp; Inactivity</strong>
              Automatic 30-minute idle session termination with client countdown timer.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Super Admin Role Gating</strong>
              Public signup is permanently disabled. Only Super Admins can issue staff invitations.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Append-Only Audit Trail</strong>
              Every login, failure, invite, reset, and suspension writes an immutable audit record.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Recent Activity Feed */}
      {recentLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Recent Admin Activity</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('/admin/audit-log')}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View full audit log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {log.action}
                  </span>
                  <span className="text-slate-300 truncate">
                    {log.adminEmail || 'System'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
