import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
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
  ArrowLeft,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminRole, ROLE_LABELS } from '../types';
import { AdminSecurityModal } from './AdminSecurityModal';
import { AdminNotificationsDrawer } from './AdminNotificationsDrawer';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
}

export const ROLE_PERMITTED_ROUTES: Record<AdminRole, string[]> = {
  super_admin: [
    '/admin',
    '/admin/users',
    '/admin/lists',
    '/admin/catalog',
    '/admin/tickets',
    '/admin/cms',
    '/admin/push',
    '/admin/analytics',
    '/admin/team',
    '/admin/audit-log',
    '/admin/settings',
  ],
  content_editor: [
    '/admin',
    '/admin/catalog',
    '/admin/cms',
  ],
  support_agent: [
    '/admin',
    '/admin/tickets',
    '/admin/users',
  ],
  analyst: [
    '/admin',
    '/admin/analytics',
    '/admin/lists',
    '/admin/users',
  ],
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activePath = '/admin',
  onNavigate,
  title,
  subtitle,
}) => {
  const { admin, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Real-time polling for notifications count (instant alert for super admin)
  React.useEffect(() => {
    if (!admin) return;
    const fetchCount = () => {
      const activeToken = localStorage.getItem('yaad_admin_bearer_token');
      if (!activeToken) return;
      fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (typeof d?.unreadCount === 'number') {
            setUnreadNotifCount(d.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    window.addEventListener('focus', fetchCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchCount);
    };
  }, [admin]);

  const roleMeta = admin?.role ? ROLE_LABELS[admin.role] : null;
  const userRole: AdminRole = admin?.role || 'super_admin';
  const permittedRoutes = ROLE_PERMITTED_ROUTES[userRole] || ['/admin'];
  const isCurrentPathAllowed = permittedRoutes.includes(activePath);

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

  const filteredListNav = listNavItems.filter((item) => permittedRoutes.includes(item.path));
  const filteredCommNav = commNavItems.filter((item) => permittedRoutes.includes(item.path));
  const filteredGovNav = govNavItems.filter((item) => permittedRoutes.includes(item.path));

  return (
    <div className="min-h-screen bg-[#FDF6E3]/25 text-neutral-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Top Admin Header Bar - Clean, simplified and professional */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 h-16 flex items-center justify-between px-3 sm:px-6 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-neutral-100 text-neutral-700 hover:text-neutral-900 shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => onNavigate('/admin')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center p-1 shrink-0">
              <img src="/logo.png" alt="YAAD" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-[#003527] text-sm sm:text-base tracking-tight font-['Manrope'] truncate">
                  YAAD Admin
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#003527] border border-emerald-200 shrink-0">
                  {roleMeta?.title || 'Control Center'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Status: Staff Profile & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {admin && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#003527] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0">
                  {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-neutral-900 leading-tight truncate max-w-[140px]">
                    {admin.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                    {admin.email}
                  </div>
                </div>
              </div>

              {roleMeta && (
                <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border bg-emerald-50 text-[#003527] border-emerald-200">
                  {roleMeta.title}
                </span>
              )}

              {/* Admin Notification Center Bell */}
              <button
                type="button"
                onClick={() => setNotificationsDrawerOpen(true)}
                className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Admin Notifications & Alerts"
                aria-label="Admin Notifications & Alerts"
              >
                <Bell className="w-4 h-4 text-[#003527]" />
                <span className="hidden sm:inline">Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSecurityModalOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Security & 2FA Settings"
                aria-label="Security & 2FA Settings"
              >
                <Shield className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Security</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 border border-neutral-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Sign out of Admin Panel"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar & Drawer */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-lg md:shadow-none ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Mobile Header Inside Drawer */}
            <div className="md:hidden p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
              <div className="text-xs font-bold text-neutral-900 leading-tight">{admin?.name}</div>
              <div className="text-[11px] text-neutral-500 truncate">{admin?.email}</div>
              <div className="flex items-center justify-between pt-1">
                {roleMeta && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    {roleMeta.title}
                  </span>
                )}
              </div>
            </div>

            {/* 1. Shopping & Parchi Operations */}
            {filteredListNav.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                  Shopping &amp; Lists
                </div>
                {filteredListNav.map((item) => {
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
            )}

            {/* 2. Communications & Guides */}
            {filteredCommNav.length > 0 && (
              <div className="space-y-1 pt-3 border-t border-neutral-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                  Shopper Support &amp; Guides
                </div>
                {filteredCommNav.map((item) => {
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
            )}

            {/* 3. Governance & Audit */}
            {filteredGovNav.length > 0 && (
              <div className="space-y-1 pt-3 border-t border-neutral-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 mb-1.5">
                  Staff &amp; Governance
                </div>
                {filteredGovNav.map((item) => {
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
            )}
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

            {isCurrentPathAllowed ? (
              children
            ) : (
              <div className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-lg mx-auto my-12 space-y-5 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-neutral-900 font-['Manrope']">Module Access Restricted</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                    Your assigned role (<strong>{roleMeta?.title || userRole}</strong>) does not have permission to access this module.
                    If you require access, please contact your Super Administrator.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] hover:bg-[#004734] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Security & 2FA Modal */}
      <AdminSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      {/* Admin Notifications Center Drawer */}
      <AdminNotificationsDrawer
        isOpen={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
        onNavigate={onNavigate}
        onUnreadCountChange={setUnreadNotifCount}
      />
    </div>
  );
};
