import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sliders,
  Bell,
  Clock,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

export const AdminSettingsPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const { showToast } = useAdminToast();

  const [settings, setSettings] = useState<any>(null);
  const [roleMatrix, setRoleMatrix] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'flags' | 'roles'>('flags');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSuperAdmin = admin?.role === 'super_admin';

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [settingsRes, rolesRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/role-matrix', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!settingsRes.ok || !rolesRes.ok) {
        throw new Error('Failed to load settings or role matrix.');
      }

      const sData = await settingsRes.json();
      const rData = await rolesRes.json();
      setSettings(sData);
      setRoleMatrix(rData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with settings API.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async () => {
    if (!token || !isSuperAdmin) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save settings.');
      }

      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'System settings persisted to Supabase database.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!token || !isSuperAdmin) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/role-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleMatrix),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save role matrix.');
      }

      showToast({
        type: 'success',
        title: 'Role Matrix Saved',
        message: 'RBAC permissions persisted to Supabase database.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Authoritative Supabase Source
              </span>
              <span className="text-xs text-neutral-500">public.admin_settings</span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              System Settings &amp; Governance
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Control application runtime feature flags, idle session timeouts, and role-based access matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-fetch</span>
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={activeTab === 'flags' ? handleSaveSettings : handleSaveRoles}
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#003527] hover:bg-[#004734] text-white font-bold text-xs shadow-md transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'flags'
                ? 'bg-[#003527] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Feature Flags &amp; Runtime</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-[#003527] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>RBAC Role Matrix</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 text-sm">DATA ERROR: Failed to communicate with settings API</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchData()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-neutral-200">
          <RefreshCw className="w-8 h-8 text-[#003527] animate-spin mx-auto" />
          <div className="text-xs font-mono text-neutral-500">Loading settings from Supabase...</div>
        </div>
      ) : activeTab === 'flags' && settings ? (
        <div className="space-y-6">
          {/* Feature Flags Card */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#003527] tracking-tight">Application Feature Flags</h3>
            <p className="text-xs text-neutral-500">Toggles apply dynamically across all connected client applications.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.entries(settings.featureFlags || {}).map(([flag, val]) => (
                <div
                  key={flag}
                  className="p-4 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-neutral-800">{flag}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {flag === 'enableAiCategorizer' && 'AI auto-categorization for added items'}
                      {flag === 'enableOfflineSync' && 'IndexedDB offline queueing and background sync'}
                      {flag === 'enableSoundEffects' && 'Audio feedback upon item strike'}
                      {flag === 'enablePushNotifications' && 'Push alerts for list activity'}
                      {flag === 'enableRashanGuide' && 'Monthly Pakistani pantry rashan guide'}
                      {flag === 'enableUserPublicRegistration' && 'Shopper signup via phone/email'}
                      {flag === 'enableFamilySharing' && 'Real-time collaborative shopping lists'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    disabled={!isSuperAdmin}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        featureFlags: {
                          ...settings.featureFlags,
                          [flag]: e.target.checked,
                        },
                      });
                    }}
                    className="w-5 h-5 accent-[#003527] rounded cursor-pointer disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Session Security */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>Staff Inactivity Timeout</span>
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={120}
                value={settings.sessionTimeoutMinutes || 30}
                disabled={!isSuperAdmin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionTimeoutMinutes: parseInt(e.target.value, 10) || 30,
                  })
                }
                className="w-24 px-3 py-2 text-xs rounded-xl border border-neutral-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#003527]/20"
              />
              <span className="text-xs text-neutral-600">Minutes of idle inactivity before staff session locks</span>
            </div>
          </div>
        </div>
      ) : activeTab === 'roles' && roleMatrix ? (
        /* Role Matrix */
        <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-base font-bold text-[#003527]">Role-Based Access Control Matrix (RBAC)</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defines authorization privileges per staff role. Super Admin privileges are permanent and immutable.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Permission Key</th>
                  <th className="py-3.5 px-4 text-center">Super Admin</th>
                  <th className="py-3.5 px-4 text-center">Support Agent</th>
                  <th className="py-3.5 px-4 text-center">Content Editor</th>
                  <th className="py-3.5 px-4 text-center">Analyst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {Object.entries(roleMatrix).map(([permKey, roles]: [string, any]) => (
                  <tr key={permKey} className="hover:bg-neutral-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{permKey}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                        ✓
                      </span>
                    </td>
                    {(['support_agent', 'content_editor', 'analyst'] as const).map((role) => (
                      <td key={role} className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(roles[role])}
                          disabled={!isSuperAdmin}
                          onChange={(e) => {
                            setRoleMatrix({
                              ...roleMatrix,
                              [permKey]: {
                                ...roles,
                                [role]: e.target.checked,
                              },
                            });
                          }}
                          className="w-4 h-4 accent-[#003527] rounded cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
