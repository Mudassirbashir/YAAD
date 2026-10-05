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
import { AdminSecurityModal } from './AdminSecurityModal';

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
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const formatInactivityTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const isLowTime = inactivitySecondsRemaining < 5 * 60;
  const roleMeta = admin?.role ? ROLE_LABELS[admin.role] : null;

  const listNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'users', label: 'Shopper Accounts', path: '/admin/users', icon: Users },
    { id: 'lists', label: 'Shopping Lists (Parchi)', path: '/admin/lists', icon: ShoppingBag },
    { id: 'catalog', label: 'Grocery Item Catalog', path: '/admin/catalog', icon: FileText },
  ];

  const commNavItems = [
    { id: 'support', label: 'Support Desk', path: '/admin/tickets', icon: HelpCircle },
    { id: 'cms', label: 'Grocery Guides (CMS)', path: '/admin/cms', icon: FileText },
    { id: 'push', label: 'Push Notifications', path: '/admin/push', icon: Bell },
    { id: 'analytics', label: 'Usage Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const govNavItems = [
    { id: 'team', label: 'Staff & Team', path: '/admin/team', icon: Shield },
    { id: 'audit', label: 'Audit Trail', path: '/admin/audit-log', icon: History },
    { id: 'settings', label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6E3]/25 text-neutral-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:text-neutral-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/admin')}>
            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center p-1.5">
              <img src="/logo.png" alt="YAAD" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#003527] text-base tracking-tight font-['Manrope']">
                  YAAD Admin
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#003527] border border-emerald-200">
                  Control Center
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Status */}
        <div className="flex items-center gap-3">
          {/* Inactivity countdown pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isLowTime
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
            title="Session automatically expires after 30 minutes of inactivity for staff security"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Idle: {formatInactivityTime(inactivitySecondsRemaining)}</span>
          </div>

          {/* Active Admin Profile */}
          {admin && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-neutral-900 leading-tight">{admin.name}</div>
                <div className="text-[11px] text-neutral-500">{admin.email}</div>
              </div>

              {roleMeta && (
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-emerald-50 text-[#003527] border-emerald-200"
                >
                  {roleMeta.title}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSecurityModalOpen(true)}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Security & 2FA Settings"
                aria-label="Security & 2FA Settings"
              >
                <Shield className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Security</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 border border-neutral-200 hover:border-rose-200 transition-all cursor-pointer"
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
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-sm md:shadow-none ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-5 overflow-y-auto">
            {/* 1. Shopping & Parchi Operations */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                Shopping &amp; Lists
              </div>
              {listNavItems.map((item) => {
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#003527] text-white shadow-md shadow-emerald-950/15'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 2. Communications & Guides */}
            <div className="space-y-1 pt-3 border-t border-neutral-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                Shopper Support &amp; Guides
              </div>
              {commNavItems.map((item) => {
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#003527] text-white shadow-md shadow-emerald-950/15'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 3. Governance & Audit */}
            <div className="space-y-1 pt-3 border-t border-neutral-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                Staff &amp; Governance
              </div>
              {govNavItems.map((item) => {
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#003527] text-white shadow-md shadow-emerald-950/15'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-2 bg-neutral-50/70">
            <button
              type="button"
              onClick={() => setSecurityModalOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2 text-[#003527] font-semibold text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>2FA &amp; Security</span>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-emerald-700 font-bold">&rarr;</span>
            </button>
            <p className="text-[10px] text-neutral-400 leading-relaxed px-1">
              Internal staff only. Audit trail logs all actions.
            </p>
          </div>
        </aside>

        {/* Overlay for mobile drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-neutral-900/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#FDF6E3]/20 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {(title || subtitle) && (
              <div className="border-b border-neutral-200/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {title && <h1 className="text-xl sm:text-2xl font-extrabold text-[#003527] tracking-tight font-['Manrope']">{title}</h1>}
                  {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-1">{subtitle}</p>}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>

      {/* Security & 2FA Modal */}
      <AdminSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
};
