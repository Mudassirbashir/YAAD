import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Search,
  User,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Settings,
  ShoppingBag,
  ListPlus,
  Compass,
  FileText,
  Sparkles,
  Barcode,
  Camera,
  Share2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  Wrench,
  Ban,
  Clock,
  Send,
  MessageSquare,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';
import {
  RemoteConfigDocument,
  DEFAULT_REMOTE_CONFIG,
  DEFAULT_FIXED_ESSENTIALS,
  FixedEssentialItem,
  UserOverrideRecord,
  AbuseEventRecord,
} from '../../types/remoteConfig';

type AppControlTab = 'ui' | 'features' | 'essentials' | 'overrides' | 'abuse' | 'system';

export const AdminAppControlPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const { showToast } = useAdminToast();

  const [activeTab, setActiveTab] = useState<AppControlTab>('ui');
  const [config, setConfig] = useState<RemoteConfigDocument>(DEFAULT_REMOTE_CONFIG);
  const [initialConfig, setInitialConfig] = useState<RemoteConfigDocument>(DEFAULT_REMOTE_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // User Overrides state
  const [userOverrides, setUserOverrides] = useState<UserOverrideRecord[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [selectedUserForOverride, setSelectedUserForOverride] = useState<any | null>(null);
  const [currentEditingOverride, setCurrentEditingOverride] = useState<Record<string, any>>({});
  const [overrideStatus, setOverrideStatus] = useState<'active' | 'suspended' | 'blocked'>('active');
  const [overrideReadOnly, setOverrideReadOnly] = useState<boolean>(false);
  const [overrideNotes, setOverrideNotes] = useState<string>('');
  const [isSearchingUsers, setIsSearchingUsers] = useState<boolean>(false);

  // Abuse review queue state
  const [abuseEvents, setAbuseEvents] = useState<AbuseEventRecord[]>([]);
  const [isLoadingAbuse, setIsLoadingAbuse] = useState<boolean>(false);

  // Fetch current remote config
  const fetchConfig = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/remote-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const merged = { ...DEFAULT_REMOTE_CONFIG, ...data };
          setConfig(merged);
          setInitialConfig(JSON.parse(JSON.stringify(merged)));
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to load configuration', message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [token, showToast]);

  // Fetch user overrides
  const fetchOverrides = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/user-overrides', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserOverrides(data.overrides || []);
      }
    } catch {}
  }, [token]);

  // Fetch abuse review events
  const fetchAbuseQueue = useCallback(async () => {
    if (!token) return;
    setIsLoadingAbuse(true);
    try {
      const res = await fetch('/api/admin/abuse/queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAbuseEvents(data.events || []);
      }
    } catch {} finally {
      setIsLoadingAbuse(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
    fetchOverrides();
    fetchAbuseQueue();
  }, [fetchConfig, fetchOverrides, fetchAbuseQueue]);

  // Save changes to remote config
  const handleSaveConfig = async (overridePayload?: Partial<RemoteConfigDocument>) => {
    if (!token) return;
    setIsSaving(true);
    const toSave = overridePayload || config;
    try {
      const res = await fetch('/api/admin/remote-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toSave),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update remote config.');
      }

      const resData = await res.json();
      setConfig(resData.config);
      setInitialConfig(JSON.parse(JSON.stringify(resData.config)));
      showToast({
        type: 'success',
        title: 'Remote Config Saved',
        message: 'Live app reflects updated controls within seconds.',
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper toggle updater
  const toggleControl = (section: keyof RemoteConfigDocument, key: string) => {
    setConfig((prev) => {
      const secObj = (prev[section] as any) || {};
      const currentVal = secObj[key];
      const newVal = typeof currentVal === 'boolean' ? !currentVal : false;
      return {
        ...prev,
        [section]: {
          ...secObj,
          [key]: newVal,
        },
      };
    });
  };

  // Helper numeric updater
  const setNumericControl = (section: keyof RemoteConfigDocument, key: string, val: number) => {
    setConfig((prev) => {
      const secObj = (prev[section] as any) || {};
      return {
        ...prev,
        [section]: {
          ...secObj,
          [key]: val,
        },
      };
    });
  };

  // Search users for per-user override
  const handleSearchUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (!query.trim() || !token) {
      setSearchedUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?limit=10&search=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedUsers(data.users || []);
      }
    } catch {} finally {
      setIsSearchingUsers(false);
    }
  };

  // Select user for override
  const handleSelectUser = async (u: any) => {
    setSelectedUserForOverride(u);
    setSearchedUsers([]);
    // Find existing override if any
    const existing = userOverrides.find((o) => o.userId === u.id);
    if (existing) {
      setCurrentEditingOverride(existing.overrides || {});
      setOverrideStatus(existing.status || 'active');
      setOverrideReadOnly(Boolean(existing.isReadOnly));
      setOverrideNotes(existing.notes || '');
    } else {
      setCurrentEditingOverride({});
      setOverrideStatus('active');
      setOverrideReadOnly(false);
      setOverrideNotes('');
    }
  };

  const handleSaveUserOverride = async () => {
    if (!selectedUserForOverride || !token) return;
    try {
      const res = await fetch(`/api/admin/user-overrides/${selectedUserForOverride.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          overrides: currentEditingOverride,
          status: overrideStatus,
          isReadOnly: overrideReadOnly,
          notes: overrideNotes,
        }),
      });

      if (!res.ok) throw new Error('Failed to save user override.');
      showToast({ type: 'success', title: 'Override Saved', message: `Custom overrides set for ${selectedUserForOverride.name}` });
      fetchOverrides();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  const handleClearUserOverride = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/user-overrides/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete override.');
      showToast({ type: 'success', title: 'Override Cleared', message: 'User reverted to global config.' });
      if (selectedUserForOverride?.id === userId) {
        setCurrentEditingOverride({});
        setOverrideStatus('active');
        setOverrideReadOnly(false);
      }
      fetchOverrides();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  // Essentials list manipulation
  const moveEssentialItem = (idx: number, direction: 'up' | 'down') => {
    const list = [...(config.essentials?.fixedList || DEFAULT_FIXED_ESSENTIALS)];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setConfig((prev) => ({
      ...prev,
      essentials: { ...prev.essentials, fixedList: list },
    }));
  };

  const updateEssentialItem = (idx: number, patch: Partial<FixedEssentialItem>) => {
    const list = [...(config.essentials?.fixedList || DEFAULT_FIXED_ESSENTIALS)];
    list[idx] = { ...list[idx], ...patch };
    setConfig((prev) => ({
      ...prev,
      essentials: { ...prev.essentials, fixedList: list },
    }));
  };

  const deleteEssentialItem = (idx: number) => {
    const list = [...(config.essentials?.fixedList || DEFAULT_FIXED_ESSENTIALS)];
    list.splice(idx, 1);
    setConfig((prev) => ({
      ...prev,
      essentials: { ...prev.essentials, fixedList: list },
    }));
  };

  const addEssentialItem = () => {
    const list = [...(config.essentials?.fixedList || DEFAULT_FIXED_ESSENTIALS)];
    list.push({
      canonicalName: `item_${Date.now()}`,
      displayName: 'New Essential Item',
      category: 'pantry',
      quantity: '1',
      unit: 'kg',
      isPersonalized: false,
    });
    setConfig((prev) => ({
      ...prev,
      essentials: { ...prev.essentials, fixedList: list },
    }));
  };

  // Abuse action handler
  const handleAbuseAction = async (eventId: string, userId: string, action: 'suspend' | 'warn' | 'dismiss' | 'resolve', reason?: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/abuse/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, userId, action, reason }),
      });
      if (!res.ok) throw new Error('Action failed.');
      showToast({ type: 'success', title: 'Action Executed', message: `Abuse action ${action} applied.` });
      fetchAbuseQueue();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner Header */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Live Remote Control
              </span>
              <span className="text-xs text-neutral-500">v{config.version || 1} • Fail-Open Mode</span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-body">
              App Control System
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Control what users see and can do in the YAAD app globally and per-user. Toggle UI sections, features, fixed essentials, and manage abuse in real-time without app updates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasUnsavedChanges && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSaveConfig()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#003527] hover:bg-[#0c4736] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Live Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-6 border-t border-neutral-100 mt-6 no-scrollbar">
          {[
            { id: 'ui', label: 'Screens & UI Controls', icon: Layers },
            { id: 'features', label: 'Feature Toggles', icon: Sparkles },
            { id: 'essentials', label: 'Essentials Editor', icon: ShoppingBag },
            { id: 'overrides', label: 'Per-User Overrides', icon: User },
            { id: 'abuse', label: 'Abuse Review Queue', icon: AlertTriangle, badge: abuseEvents.filter((e) => e.status === 'pending').length },
            { id: 'system', label: 'System & Safety', icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AppControlTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#003527] text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SCREENS & UI CONTROLS */}
      {activeTab === 'ui' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Top Header Controls</h3>
                  <p className="text-xs text-neutral-500">Toggle header icons across all mobile views</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'showSettingsGear', label: 'Settings Gear Button', desc: 'Opens profile & settings screen' },
                { key: 'showNotificationBell', label: 'Notification Bell', desc: 'Push & mandi announcement alert center' },
                { key: 'showBellBadgeCount', label: 'Bell Badge Unread Dot', desc: 'Red warning dot on notification bell' },
                { key: 'showAvatarButton', label: 'Avatar / Profile Button', desc: 'User profile avatar icon in greeting' },
                { key: 'showMiloCompanion', label: 'Milo Companion Pet', desc: 'Floating companion character in top corner' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-800 block truncate">{item.label}</span>
                    <span className="text-[11px] text-neutral-500 block truncate">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleControl('header', item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (config.header as any)[item.key] !== false ? 'bg-[#003527]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        (config.header as any)[item.key] !== false ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Home Screen Controls */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Home Screen Controls</h3>
                  <p className="text-xs text-neutral-500">Configure sections, quick action tiles, and list cards</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'showGreeting', label: 'Personalized Greeting', desc: 'Good Morning and shopper name' },
                { key: 'showHeroCard', label: 'Current List Hero Card', desc: 'Top active list summary banner' },
                { key: 'showCreateListButton', label: 'Create New List Banner', desc: 'Primary green action tile' },
                { key: 'showTileRecentLists', label: 'Tile: Recent Lists', desc: 'First quick action tile' },
                { key: 'showTileFavorites', label: 'Tile: Favorites', desc: 'Staples & favorites catalog browser' },
                { key: 'showTileCategories', label: 'Tile: Categories', desc: 'Browse all grocery categories' },
                { key: 'showTileStatistics', label: 'Tile: Statistics', desc: 'Summary metrics & completion rate' },
                { key: 'showFrequentEssentials', label: 'Frequent Essentials Section', desc: 'Fixed staples 2-column grid' },
                { key: 'showEssentialsViewAll', label: 'Essentials "View All" Link', desc: 'Top right link on essentials header' },
                { key: 'showYourLists', label: 'Your Lists Section', desc: 'Lists feed with action cards' },
                { key: 'showListMenuDetails', label: 'List ⋮ Menu: View Details', desc: 'Opens items and trip breakdown' },
                { key: 'showListMenuShare', label: 'List ⋮ Menu: Share List', desc: 'WhatsApp & family share link' },
                { key: 'showListMenuReuse', label: 'List ⋮ Menu: Reuse List', desc: 'Clone completed list for next trip' },
                { key: 'showListMenuDelete', label: 'List ⋮ Menu: Delete List', desc: 'Direct removal from menu' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-800 block truncate">{item.label}</span>
                    <span className="text-[11px] text-neutral-500 block truncate">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleControl('home', item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (config.home as any)[item.key] !== false ? 'bg-[#003527]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        (config.home as any)[item.key] !== false ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Essentials Count on Home */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between max-w-sm">
              <div>
                <span className="font-bold text-xs text-neutral-900 block">Home Essentials Item Count</span>
                <span className="text-[11px] text-neutral-500 block">Number of fixed staple cards displayed (default 8)</span>
              </div>
              <input
                type="number"
                min={2}
                max={20}
                value={config.home?.essentialsCount || 8}
                onChange={(e) => setNumericControl('home', 'essentialsCount', Math.max(2, parseInt(e.target.value, 10) || 8))}
                className="w-20 px-3 py-1.5 rounded-xl border border-neutral-300 font-bold text-sm text-center"
              />
            </div>
          </div>

          {/* Bottom Nav & Screen Gates */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Bottom Navigation & Whole Screens</h3>
                  <p className="text-xs text-neutral-500">Toggle individual bottom tabs or whole screens</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { section: 'bottomNav', key: 'showHomeTab', label: 'Bottom Tab: Home', desc: 'First tab in bottom bar' },
                { section: 'bottomNav', key: 'showCreateTab', label: 'Bottom Tab: Create (+)', desc: 'Center circular create list tab' },
                { section: 'bottomNav', key: 'showHistoryTab', label: 'Bottom Tab: History', desc: 'Previous completed lists tab' },
                { section: 'screens', key: 'historyScreenEnabled', label: 'History Screen Allowed', desc: 'Allows access to /history view' },
                { section: 'screens', key: 'statisticsScreenEnabled', label: 'Statistics Screen Allowed', desc: 'Allows access to /stats view' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-800 block truncate">{item.label}</span>
                    <span className="text-[11px] text-neutral-500 block truncate">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleControl(item.section as any, item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (config as any)[item.section][item.key] !== false ? 'bg-[#003527]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        (config as any)[item.section][item.key] !== false ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User-facing Settings Screen Rows */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Settings Screen Options</h3>
                  <p className="text-xs text-neutral-500">Enable or hide rows in user-facing /settings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'showEditProfile', label: 'Edit Profile Modal', desc: 'Shopper name & phone update' },
                { key: 'showPhotoUpload', label: 'Avatar Photo Upload', desc: 'Cloudinary custom avatar upload' },
                { key: 'showChangePassword', label: 'Change Password', desc: 'In-app password reset flow' },
                { key: 'showLanguageRow', label: 'Language Selector', desc: 'English, Urdu, and Roman Urdu' },
                { key: 'showSoundEffects', label: 'Sound Effects Toggle', desc: 'Checkmark & feedback chimes' },
                { key: 'showThemeRow', label: 'Theme & Palettes', desc: 'Calm, Dark, and custom palettes' },
                { key: 'showMiloRow', label: 'Milo Pet Options', desc: 'Pet sound and visibility' },
                { key: 'showSupportDesk', label: 'Support Desk Link', desc: 'Submit help requests to admin desk' },
                { key: 'showAboutRow', label: 'About YAAD Section', desc: 'Version info & legal policies' },
                { key: 'showSignOut', label: 'Sign Out Button', desc: 'Standard sign-out action' },
                { key: 'showDeleteAccount', label: 'Delete Account (Safety)', desc: 'Permanent account destruction (default: hidden)' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-800 block truncate">{item.label}</span>
                    <span className="text-[11px] text-neutral-500 block truncate">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleControl('settings', item.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (config.settings as any)[item.key] === true ? 'bg-[#003527]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        (config.settings as any)[item.key] === true ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE TOGGLES */}
      {activeTab === 'features' && (
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Application Action & Feature Toggles</h3>
            <p className="text-xs text-neutral-500">
              Disabling a feature unmounts its UI and disables the underlying server action. Layout reflows automatically without gaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { key: 'barcodeScanner', label: 'Barcode Scanner (BETA)', desc: 'Camera barcode scanner on Add Items screen. When hidden, search expands full-width.' },
              { key: 'itemPhotoUpload', label: 'Item Row Photo Attachment', desc: 'Allows attaching and taking photos on individual list items.' },
              { key: 'smartSuggestions', label: 'Smart Suggestions & Score', desc: 'AI & rule-based item suggestions while composing lists.' },
              { key: 'shareList', label: 'Share Shopping List', desc: 'External list sharing via link or WhatsApp.' },
              { key: 'actionReuseList', label: 'Reuse List as New', desc: 'Copies a past list into an active list.' },
              { key: 'actionMarkComplete', label: 'Mark Trip Complete', desc: 'Celebration flow and trip archive.' },
              { key: 'actionDeleteSession', label: 'Delete Trip Session', desc: 'Removes trip from history record.' },
              { key: 'actionDeleteList', label: 'Delete List', desc: 'Permanently removes shopping list.' },
              { key: 'actionHistoryManage', label: 'History Manage Mode', desc: 'Bulk Select All / Delete Selected / Clear All in history.' },
              { key: 'enableAiCategorizer', label: 'AI Smart Categorizer', desc: 'Automated item classification engine.' },
              { key: 'enableOfflineSync', label: 'Offline Sync & IndexedDB', desc: 'Local IndexedDB persistence when internet is down.' },
              { key: 'enableSoundEffects', label: 'Global Sound System', desc: 'Audio sound chimes on check and add.' },
              { key: 'enablePushNotifications', label: 'Push Notifications', desc: 'Browser WebPush alerts and reminders.' },
              { key: 'enableRashanGuide', label: 'Ramadan Rashan Guide', desc: 'Curated Ramadan grocery checklist.' },
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 flex items-start justify-between gap-3 hover:bg-white transition-colors"
              >
                <div className="space-y-1">
                  <span className="font-bold text-xs text-neutral-900 block">{item.label}</span>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleControl('features', item.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    (config.features as any)[item.key] !== false ? 'bg-[#003527]' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      (config.features as any)[item.key] !== false ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESSENTIALS EDITOR */}
      {activeTab === 'essentials' && (
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Fixed Essentials Curated List</h3>
              <p className="text-xs text-neutral-500">
                Admin-controlled fixed list for EVERY shopper. Same items, identical order, no random shifts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    essentials: { fixedList: DEFAULT_FIXED_ESSENTIALS },
                  }));
                  showToast({ type: 'info', title: 'Restored Defaults', message: 'Standard 8 staples loaded.' });
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default 8</span>
              </button>

              <button
                type="button"
                onClick={addEssentialItem}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#003527] border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(config.essentials?.fixedList || DEFAULT_FIXED_ESSENTIALS).map((item, idx) => (
              <div
                key={item.canonicalName + idx}
                className="p-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={item.displayName}
                      onChange={(e) => updateEssentialItem(idx, { displayName: e.target.value })}
                      placeholder="Display Name"
                      className="px-2.5 py-1 rounded-lg border border-neutral-300 text-xs font-bold w-36"
                    />
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateEssentialItem(idx, { quantity: e.target.value })}
                      placeholder="Qty"
                      className="px-2 py-1 rounded-lg border border-neutral-300 text-xs w-16 text-center"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateEssentialItem(idx, { unit: e.target.value })}
                      placeholder="Unit"
                      className="px-2 py-1 rounded-lg border border-neutral-300 text-xs w-20 text-center"
                    />
                    <input
                      type="text"
                      value={item.nameUrdu || ''}
                      onChange={(e) => updateEssentialItem(idx, { nameUrdu: e.target.value })}
                      placeholder="Urdu Name"
                      dir="rtl"
                      className="px-2.5 py-1 rounded-lg border border-neutral-300 text-xs w-28"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end md:self-auto">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveEssentialItem(idx, 'up')}
                    className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === (config.essentials?.fixedList?.length || 8) - 1}
                    onClick={() => moveEssentialItem(idx, 'down')}
                    className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEssentialItem(idx)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PER-USER OVERRIDES */}
      {activeTab === 'overrides' && (
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Per-User Override Rules</h3>
            <p className="text-xs text-neutral-500">
              User overrides always win over global settings (e.g. hide settings globally, but grant it to 3 VIP users).
            </p>
          </div>

          {/* User Search & Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700">Search Shopper Account</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-300 text-xs font-body outline-none focus:border-[#003527]"
              />
            </div>

            {searchedUsers.length > 0 && (
              <div className="p-2 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-1">
                {searchedUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-2.5 rounded-xl text-left hover:bg-white flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-neutral-900">{u.name}</span>
                      <span className="text-neutral-500 ml-2 font-mono">{u.email || u.phone || u.id}</span>
                    </div>
                    <span className="text-emerald-700 font-bold">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Selection Override Form */}
          {selectedUserForOverride && (
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">
                    Customizing: {selectedUserForOverride.name}
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">{selectedUserForOverride.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveUserOverride}
                    className="px-4 py-1.5 rounded-xl bg-[#003527] text-white text-xs font-bold cursor-pointer"
                  >
                    Save Override
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearUserOverride(selectedUserForOverride.id)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
                  >
                    Clear Override
                  </button>
                </div>
              </div>

              {/* Status & Read Only Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Account State</label>
                  <select
                    value={overrideStatus}
                    onChange={(e: any) => setOverrideStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                  >
                    <option value="active">Active (Normal)</option>
                    <option value="suspended">Suspended (Temporary)</option>
                    <option value="blocked">Blocked (Hard Blocked from login)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Read-Only Mode</label>
                  <select
                    value={overrideReadOnly ? 'true' : 'false'}
                    onChange={(e) => setOverrideReadOnly(e.target.value === 'true')}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                  >
                    <option value="false">Allow Add / Edit / Delete (Normal)</option>
                    <option value="true">Read-Only (View lists only, block mutations)</option>
                  </select>
                </div>
              </div>

              {/* Quick UI Overrides for this user */}
              <div className="pt-2">
                <span className="text-xs font-bold text-neutral-800 block mb-2">Specific UI Overrides</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'header.showSettingsGear', label: 'Settings Gear' },
                    { key: 'header.showNotificationBell', label: 'Notification Bell' },
                    { key: 'screens.historyScreenEnabled', label: 'History Screen' },
                    { key: 'features.barcodeScanner', label: 'Barcode Scanner' },
                    { key: 'features.shareList', label: 'Share List' },
                    { key: 'settings.showDeleteAccount', label: 'Delete Account' },
                  ].map((row) => {
                    const currentVal = currentEditingOverride[row.key];
                    return (
                      <div key={row.key} className="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between">
                        <span className="font-medium text-neutral-800">{row.label}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentEditingOverride((prev) => {
                                const copy = { ...prev };
                                delete copy[row.key];
                                return copy;
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentVal === undefined ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:bg-neutral-100'
                            }`}
                          >
                            Global
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentEditingOverride((prev) => ({ ...prev, [row.key]: true }));
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentVal === true ? 'bg-emerald-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
                            }`}
                          >
                            Show
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentEditingOverride((prev) => ({ ...prev, [row.key]: false }));
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentVal === false ? 'bg-rose-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'
                            }`}
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Admin Private Notes</label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Internal notes visible only to staff administration..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-body outline-none"
                />
              </div>
            </div>
          )}

          {/* List of existing overrides */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h4 className="font-bold text-xs text-neutral-700 uppercase tracking-wider">
              Active User Overrides ({userOverrides.length})
            </h4>
            {userOverrides.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">No active per-user overrides. All users obey the global remote configuration.</p>
            ) : (
              <div className="space-y-2">
                {userOverrides.map((ov) => (
                  <div key={ov.userId} className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 font-mono">{ov.userId}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ov.status === 'blocked' ? 'bg-rose-100 text-rose-800' : ov.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ov.status}
                        </span>
                        {ov.isReadOnly && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Read-Only</span>}
                        {ov.notes && <span className="text-neutral-500 truncate max-w-xs">"{ov.notes}"</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClearUserOverride(ov.userId)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ABUSE REVIEW QUEUE */}
      {activeTab === 'abuse' && (
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Abuse Detection Rules & Review Queue</h3>
              <p className="text-xs text-neutral-500">
                Server-side detection flags unusual activity. Review flagged incidents and take immediate action.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAbuseQueue}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAbuse ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Editable Abuse Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(config.abuse?.rules || []).map((rule, idx) => (
              <div key={rule.id} className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900">{rule.name}</span>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => {
                      const rules = [...(config.abuse?.rules || [])];
                      rules[idx].enabled = e.target.checked;
                      setConfig((prev) => ({ ...prev, abuse: { rules } }));
                    }}
                    className="rounded text-[#003527] focus:ring-0"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">{rule.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-neutral-600 font-bold">Limit:</span>
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={(e) => {
                      const rules = [...(config.abuse?.rules || [])];
                      rules[idx].threshold = parseInt(e.target.value, 10) || 10;
                      setConfig((prev) => ({ ...prev, abuse: { rules } }));
                    }}
                    className="w-16 px-2 py-1 rounded border border-neutral-300 text-xs text-center font-bold"
                  />
                  <span className="text-[10px] text-neutral-500">per {rule.windowMinutes}m</span>
                </div>
              </div>
            ))}
          </div>

          {/* Queue Items */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h4 className="font-bold text-xs text-neutral-700 uppercase tracking-wider">
              Flagged Incidents ({abuseEvents.length})
            </h4>

            {abuseEvents.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold">All clear! No unusual activity detected.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {abuseEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                          {ev.ruleName}
                        </span>
                        <span className="text-neutral-500 font-mono text-[11px]">
                          User: {ev.userEmail || ev.userId}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          ev.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-neutral-700 font-medium">{ev.details}</p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAbuseAction(ev.id, ev.userId, 'warn', `Unusual activity alert for ${ev.ruleName}`)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold cursor-pointer"
                      >
                        Warn
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAbuseAction(ev.id, ev.userId, 'suspend', `Suspended due to ${ev.ruleName}`)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold cursor-pointer"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAbuseAction(ev.id, ev.userId, 'dismiss')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM & SAFETY */}
      {activeTab === 'system' && (
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">System Kill Switch & Maintenance</h3>
            <p className="text-xs text-neutral-500">
              Emergency maintenance gate, minimum app version enforcement, and system-wide limits.
            </p>
          </div>

          {/* Maintenance Mode / Kill Switch */}
          <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-neutral-900 block">Maintenance Mode Kill Switch</span>
                <span className="text-xs text-neutral-600 block">When active, all shoppers see the maintenance screen</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    system: {
                      ...prev.system,
                      maintenanceMode: {
                        ...prev.system.maintenanceMode,
                        enabled: !prev.system.maintenanceMode.enabled,
                      },
                    },
                  }));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.system?.maintenanceMode?.enabled ? 'bg-rose-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    config.system?.maintenanceMode?.enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                value={config.system?.maintenanceMode?.message || ''}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    system: {
                      ...prev.system,
                      maintenanceMode: { ...prev.system.maintenanceMode, message: e.target.value },
                    },
                  }));
                }}
                placeholder="English maintenance message..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-body"
              />
              <input
                type="text"
                value={config.system?.maintenanceMode?.messageUr || ''}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    system: {
                      ...prev.system,
                      maintenanceMode: { ...prev.system.maintenanceMode, messageUr: e.target.value },
                    },
                  }));
                }}
                dir="rtl"
                placeholder="Urdu maintenance message..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs font-body"
              />
            </div>
          </div>

          {/* Force Update Gate */}
          <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-neutral-900 block">Minimum Required App Version</span>
              <span className="text-xs text-neutral-500 block">Clients below this version will see "Update Required"</span>
            </div>
            <input
              type="text"
              value={config.system?.minAppVersion || '1.0.0'}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  system: { ...prev.system, minAppVersion: e.target.value },
                }));
              }}
              className="w-28 px-3 py-1.5 rounded-xl border border-neutral-300 font-mono font-bold text-xs text-center"
            />
          </div>

          {/* Limits */}
          <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
            <span className="font-bold text-xs text-neutral-900 block">Usage Thresholds & Limits</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-neutral-600 block mb-1">Max Lists Per User</label>
                <input
                  type="number"
                  value={config.system?.limits?.maxListsPerUser || 50}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 50;
                    setConfig((prev) => ({
                      ...prev,
                      system: {
                        ...prev.system,
                        limits: { ...(prev.system?.limits || { maxListsPerUser: 50, maxItemsPerList: 100, maxPhotoSizeMb: 5 }), maxListsPerUser: val },
                      },
                    }));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-600 block mb-1">Max Items Per List</label>
                <input
                  type="number"
                  value={config.system?.limits?.maxItemsPerList || 100}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 100;
                    setConfig((prev) => ({
                      ...prev,
                      system: {
                        ...prev.system,
                        limits: { ...(prev.system?.limits || { maxListsPerUser: 50, maxItemsPerList: 100, maxPhotoSizeMb: 5 }), maxItemsPerList: val },
                      },
                    }));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-600 block mb-1">Max Item Photo Size (MB)</label>
                <input
                  type="number"
                  value={config.system?.limits?.maxPhotoSizeMb || 5}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 5;
                    setConfig((prev) => ({
                      ...prev,
                      system: {
                        ...prev.system,
                        limits: { ...(prev.system?.limits || { maxListsPerUser: 50, maxItemsPerList: 100, maxPhotoSizeMb: 5 }), maxPhotoSizeMb: val },
                      },
                    }));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
