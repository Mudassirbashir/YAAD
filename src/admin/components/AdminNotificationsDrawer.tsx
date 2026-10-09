import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  ShieldAlert,
  HelpCircle,
  UserPlus,
  ShoppingBag,
  AlertCircle,
  CheckCheck,
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from './AdminToasts';
import { AdminNotification } from '../types';
import { adminCache } from '../utils/adminCache';

interface AdminNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const AdminNotificationsDrawer: React.FC<AdminNotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onUnreadCountChange,
}) => {
  const { token, admin } = useAdminAuth();
  const toast = useAdminToast();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'security' | 'ticket' | 'request' | 'moderation'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDismissingAll, setIsDismissingAll] = useState<boolean>(false);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;
      const url = '/api/admin/notifications';
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const { data } = await adminCache.fetchWithSwr<{
          notifications: AdminNotification[];
          unreadCount: number;
        }>(
          url,
          headers,
          (fresh) => {
            if (fresh) {
              setNotifications(fresh.notifications || []);
              setUnreadCount(fresh.unreadCount || 0);
              onUnreadCountChange?.(fresh.unreadCount || 0);
            }
          },
          forceRefresh
        );

        if (data) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          onUnreadCountChange?.(data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('[AdminNotifications] Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [token, onUnreadCountChange]
  );

  // Poll for notifications periodically & on window focus for immediate alerts
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchNotifications]);

  const handleDismissOne = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!token) return;

    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        onUnreadCountChange?.(next);
        return next;
      });

      await fetch(`/api/admin/notifications/${id}/dismiss`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      adminCache.invalidatePrefix('/api/admin/notifications');
    } catch (err) {
      console.error('[AdminNotifications] Failed to dismiss:', err);
      toast.error('Dismiss Failed', 'Could not clear notification.');
      fetchNotifications(true);
    }
  };

  const handleDismissAll = async () => {
    if (!token || isDismissingAll || notifications.length === 0) return;
    setIsDismissingAll(true);

    try {
      setNotifications([]);
      setUnreadCount(0);
      onUnreadCountChange?.(0);

      await fetch('/api/admin/notifications/dismiss-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      adminCache.invalidatePrefix('/api/admin/notifications');
      toast.success('All Notifications Cleared', 'All alerts and pending items marked as acknowledged.');
    } catch (err) {
      console.error('[AdminNotifications] Failed to dismiss all:', err);
      toast.error('Failed to Clear', 'Could not clear all notifications.');
      fetchNotifications(true);
    } finally {
      setIsDismissingAll(false);
    }
  };

  const handleNotificationClick = (n: AdminNotification) => {
    handleDismissOne(n.id);
    onClose();
    if (n.link) {
      onNavigate(n.link);
    } else if (n.type === 'request') {
      onNavigate('/admin/team?tab=requests');
    }
  };

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'ticket':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'request':
        return <UserPlus className="w-4 h-4 text-sky-600" />;
      case 'moderation':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getIconBg = (type: AdminNotification['type']) => {
    switch (type) {
      case 'security':
        return 'bg-rose-50 border-rose-200';
      case 'ticket':
        return 'bg-amber-50 border-amber-200';
      case 'request':
        return 'bg-sky-50 border-sky-200';
      case 'moderation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Flyout Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col pointer-events-auto transform transition-transform duration-200 ease-in-out">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200/90 flex items-center justify-between bg-neutral-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#003527] text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#003527] font-['Manrope']">
                    Admin Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Live operational alerts &amp; staff tasks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  fetchNotifications(true);
                }}
                disabled={isLoading}
                title="Refresh notifications"
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70 transition-colors cursor-pointer"
                aria-label="Close notifications drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Bar & Filter Chips */}
          <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-white text-xs gap-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'security', label: 'Security' },
                  { id: 'ticket', label: 'Support' },
                  { id: 'request', label: 'Staff' },
                  { id: 'moderation', label: 'Lists' },
                ] as const
              ).map((tab) => {
                const count =
                  tab.id === 'all'
                    ? notifications.length
                    : notifications.filter((n) => n.type === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeFilter === tab.id
                        ? 'bg-[#003527] text-white shadow-2xs'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear All Action */}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleDismissAll}
                disabled={isDismissingAll}
                className="shrink-0 text-[11px] font-bold text-neutral-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark all as read & dismiss"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-[#FDF6E3]/20">
            {filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200/90 flex items-center justify-center mx-auto text-neutral-300 shadow-2xs">
                  <Bell className="w-6 h-6 text-emerald-800/40" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-800">All caught up!</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    No active alerts, urgent support tickets, or pending access requests for your role.
                  </p>
                </div>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md cursor-pointer group space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getIconBg(
                        n.type
                      )}`}
                    >
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                          {n.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(n.timestamp)}</span>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-neutral-900 mt-1 line-clamp-1 group-hover:text-[#003527] transition-colors">
                        {n.title}
                      </h5>

                      <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                    <span className="text-[#003527] font-bold flex items-center gap-1 group-hover:underline">
                      <span>{n.type === 'request' ? 'درخواست کھولیں (Open Request)' : 'Take Action'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDismissOne(n.id, e)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-neutral-200 bg-white text-[11px] text-neutral-500 flex items-center justify-between">
            <span className="truncate">Staff: {admin?.name || 'Staff User'}</span>
            <span className="font-mono text-[10px] text-neutral-400">YAAD Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
