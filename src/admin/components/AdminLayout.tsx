import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Clock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
  History,
  ShoppingBag,
  Bell,
  BarChart3,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ROLE_LABELS } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activePath = '/admin',
  onNavigate,
  title,
  subtitle,
}) => {
  const { admin, logout, inactivitySecondsRemaining } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatInactivityTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = inactivitySecondsRemaining < 5 * 60;
  const roleMeta = admin?.role ? ROLE_LABELS[admin.role] : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'team', label: 'Staff & Team', path: '/admin/team', icon: Users },
    { id: 'audit', label: 'Audit Trail', path: '/admin/audit-log', icon: History },
  ];

  const futureModules = [
    { label: 'Role Matrix', icon: Shield, note: 'Module 2' },
    { label: 'User Directory', icon: Users, note: 'Module 4' },
    { label: 'List Moderation', icon: ShoppingBag, note: 'Module 5' },
    { label: 'Product Catalog', icon: FileText, note: 'Module 6' },
    { label: 'Content CMS', icon: FileText, note: 'Module 7' },
    { label: 'Push Notifications', icon: Bell, note: 'Module 8' },
    { label: 'Reports & Analytics', icon: BarChart3, note: 'Module 10' },
    { label: 'Support Tickets', icon: HelpCircle, note: 'Module 11' },
    { label: 'System Settings', icon: Settings, note: 'Module 12' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/admin')}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm tracking-wider">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight font-['Manrope']">
                  YAAD Admin
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Staff Portal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Status: Role Badge + Inactivity Timer + User */}
        <div className="flex items-center gap-3">
          {/* Inactivity countdown pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isLowTime
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Session automatically expires after 30 minutes of inactivity for staff security"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Idle Timeout: {formatInactivityTime(inactivitySecondsRemaining)}</span>
          </div>

          {/* Active Admin Profile */}
          {admin && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-white leading-tight">{admin.name}</div>
                <div className="text-[11px] text-slate-400">{admin.email}</div>
              </div>

              {roleMeta && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${roleMeta.badgeClass}`}
                >
                  {roleMeta.title}
                </span>
              )}

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
                title="Sign out of Admin Panel"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Active Navigation */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Core Access &amp; Operations
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modules Roadmap */}
            <div className="space-y-1 pt-3 border-t border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center justify-between">
                <span>Upcoming Modules</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Stepwise</span>
              </div>
              {futureModules.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-800/40 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="truncate">{m.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">
                      {m.note}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer with Security Note */}
          <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2 bg-slate-950/40">
            <div className="flex items-center gap-2 text-slate-400 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOTP 2FA Enforced</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Internal staff only. All actions are cryptographically signed into the append-only audit trail.
            </p>
          </div>
        </aside>

        {/* Overlay for mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {(title || subtitle) && (
              <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {title && <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h1>}
                  {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
