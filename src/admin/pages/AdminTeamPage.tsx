import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Copy,
  Check,
  Loader2,
  Trash2,
  Ban,
  RefreshCw,
  Globe,
  Plus,
  Lock,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { AdminUser, AdminInvite, AdminRole, ROLE_LABELS } from '../types';

export const AdminTeamPage: React.FC = () => {
  const { admin, token } = useAdminAuth();
  const toast = useAdminToast();

  const isSuperAdmin = admin?.role === 'super_admin';

  // Active Tab: 'members' | 'invites' | 'allowlist'
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'allowlist'>('members');

  // Staff Members State
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  // Invites State
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  // Allowlist State
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [newAllowlistEntry, setNewAllowlistEntry] = useState('');
  const [isLoadingAllowlist, setIsLoadingAllowlist] = useState(false);
  const [isSavingAllowlist, setIsSavingAllowlist] = useState(false);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('support_agent');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [createdInviteResult, setCreatedInviteResult] = useState<{ inviteUrl: string; email: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Suspend/Reactivate Modal
  const [actionModal, setActionModal] = useState<{
    targetAdmin: AdminUser | null;
    action: 'suspend' | 'reactivate';
    reason: string;
  }>({ targetAdmin: null, action: 'suspend', reason: '' });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Revoke Invite Modal
  const [revokeInviteTarget, setRevokeInviteTarget] = useState<AdminInvite | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // 1. Fetch Staff Members
  const fetchStaff = useCallback(async () => {
    if (!token) return;
    setIsLoadingStaff(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/team?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error('Failed to load team members');
        return;
      }

      const data = await res.json();
      setStaff(data.admins || []);
      setTotalStaff(data.total || 0);
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsLoadingStaff(false);
    }
  }, [token, page, search, roleFilter, statusFilter, toast]);

  // 2. Fetch Invites
  const fetchInvites = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    setIsLoadingInvites(true);
    try {
      const res = await fetch('/api/admin/invites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch (err: any) {
      console.error('Error fetching invites:', err);
    } finally {
      setIsLoadingInvites(false);
    }
  }, [token, isSuperAdmin]);

  // 3. Fetch Allowlist
  const fetchAllowlist = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    setIsLoadingAllowlist(true);
    try {
      const res = await fetch('/api/admin/settings/allowlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllowlist(data.allowlist || []);
      }
    } catch (err: any) {
      console.error('Error fetching allowlist:', err);
    } finally {
      setIsLoadingAllowlist(false);
    }
  }, [token, isSuperAdmin]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (activeTab === 'invites' && isSuperAdmin) {
      fetchInvites();
    } else if (activeTab === 'allowlist' && isSuperAdmin) {
      fetchAllowlist();
    }
  }, [activeTab, isSuperAdmin, fetchInvites, fetchAllowlist]);

  // Handle Invite Creation
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || isSubmittingInvite) return;

    setIsSubmittingInvite(true);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Invite Failed', data.error);
        return;
      }

      toast.success('Staff Invited', `Single-use 24-hour invite generated for ${inviteEmail}.`);
      setCreatedInviteResult({
        inviteUrl: data.inviteUrl,
        email: inviteEmail.trim(),
      });
      fetchInvites();
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Copy Invite Link
  const copyInviteLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.info('Link Copied', 'Invitation onboarding URL copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Status Change (Suspend / Reactivate)
  const handleConfirmStatusChange = async () => {
    if (!actionModal.targetAdmin || !token) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/team/${actionModal.targetAdmin.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: actionModal.action === 'suspend' ? 'suspended' : 'active',
          reason: actionModal.reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Action Failed', data.error);
        return;
      }

      toast.success(
        actionModal.action === 'suspend' ? 'Account Suspended' : 'Account Reactivated',
        data.message
      );
      setActionModal({ targetAdmin: null, action: 'suspend', reason: '' });
      fetchStaff();
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Revoking an Invite
  const handleConfirmRevokeInvite = async () => {
    if (!revokeInviteTarget || !token) return;

    setIsRevoking(true);
    try {
      const res = await fetch(`/api/admin/invites/${revokeInviteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Failed to revoke invite', data.error);
        return;
      }

      toast.success('Invite Revoked', `Invitation for ${revokeInviteTarget.email} was invalidated.`);
      setRevokeInviteTarget(null);
      fetchInvites();
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  // Allowlist Handlers
  const handleAddAllowlistRule = () => {
    const clean = newAllowlistEntry.trim().toLowerCase();
    if (!clean) return;
    if (!clean.startsWith('@') && !clean.includes('@')) {
      toast.error('Invalid Format', 'Rule must be a domain (e.g. "@company.com") or specific email.');
      return;
    }
    if (allowlist.includes(clean)) {
      toast.info('Duplicate Rule', 'This rule is already in the allowlist.');
      return;
    }
    setAllowlist([...allowlist, clean]);
    setNewAllowlistEntry('');
  };

  const handleRemoveAllowlistRule = (ruleToRemove: string) => {
    setAllowlist(allowlist.filter((r) => r !== ruleToRemove));
  };

  const handleSaveAllowlist = async () => {
    if (!token) return;
    setIsSavingAllowlist(true);
    try {
      const res = await fetch('/api/admin/settings/allowlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allowlist }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Save Failed', data.error);
        return;
      }

      toast.success('Allowlist Updated', 'Email domain restrictions successfully saved.');
      setAllowlist(data.allowlist || []);
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsSavingAllowlist(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Manrope']">
            Staff &amp; Access Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized staff members, role tiers, 24-hour expiring invites, and organization allowlists
          </p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setCreatedInviteResult(null);
              setInviteModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New Admin</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer relative ${
            activeTab === 'members'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Staff Directory ({totalStaff})
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('invites')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'invites'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Invitations (
            {invites.filter((i) => i.status === 'pending').length}
            )
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('allowlist')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'allowlist'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email Allowlist ({allowlist.length})
          </button>
        )}
      </div>

      {/* TAB 1: MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search staff by name or email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="support_agent">Support Agent</option>
                <option value="content_editor">Content Editor</option>
                <option value="analyst">Analyst</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoadingStaff ? (
            <AdminTableSkeleton rows={5} cols={5} />
          ) : staff.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No staff members found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Staff Member</th>
                      <th className="py-3.5 px-4">Role Tier</th>
                      <th className="py-3.5 px-4">2FA Security</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      {isSuperAdmin && <th className="py-3.5 px-4 text-right">Governance Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {staff.map((member) => {
                      const isSelf = member.id === admin?.id;
                      const roleConfig = ROLE_LABELS[member.role];
                      return (
                        <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center font-mono text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{member.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-200">{roleConfig?.title || member.role}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {member.isTotpEnabled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Enforced</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3" />
                                <span>Pending 1st Login</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {member.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>

                          {isSuperAdmin && (
                            <td className="py-3.5 px-4 text-right">
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActionModal({
                                      targetAdmin: member,
                                      action: member.status === 'active' ? 'suspend' : 'reactivate',
                                      reason: '',
                                    })
                                  }
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    member.status === 'active'
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {member.status === 'active' ? 'Suspend' : 'Reactivate'}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING INVITATIONS */}
      {activeTab === 'invites' && isSuperAdmin && (
        <div className="space-y-4">
          {isLoadingInvites ? (
            <AdminTableSkeleton rows={3} cols={4} />
          ) : invites.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No active invitations</p>
              <p className="text-xs text-slate-400">Click &quot;Invite New Admin&quot; to issue single-use onboarding tokens.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Invited Recipient</th>
                      <th className="py-3.5 px-4">Target Role</th>
                      <th className="py-3.5 px-4">Token Expiration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invites.map((inv) => {
                      const isExpired = Date.now() > inv.expiresAt;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{inv.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{inv.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-200">
                              {ROLE_LABELS[inv.role]?.title || inv.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {new Date(inv.expiresAt).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4">
                            {inv.status === 'accepted' ? (
                              <span className="text-emerald-400 text-xs font-semibold">Accepted</span>
                            ) : inv.status === 'revoked' ? (
                              <span className="text-slate-500 text-xs">Revoked</span>
                            ) : isExpired ? (
                              <span className="text-rose-400 text-xs font-semibold">Expired</span>
                            ) : (
                              <span className="text-amber-400 text-xs font-semibold">Pending (24h)</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {inv.status === 'pending' && !isExpired && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => copyInviteLink(`/admin/accept-invite?token=${inv.token}`)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                                  title="Copy invite link"
                                >
                                  Copy Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRevokeInviteTarget(inv)}
                                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                  title="Revoke invite"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EMAIL ALLOWLIST & DOMAIN RESTRICTION */}
      {activeTab === 'allowlist' && isSuperAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Email Allowlist &amp; Domain Restrictions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Restrict staff invitations and Super Admin logins to specific email domains (e.g.{' '}
              <code className="text-emerald-400 font-mono">@yaad.app</code>) or individual email addresses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">Add Allowed Domain or Email</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllowlistEntry}
                onChange={(e) => setNewAllowlistEntry(e.target.value)}
                placeholder="e.g. @yaad.app or security-lead@yaad.app"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllowlistRule();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAllowlistRule}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* Current Rules List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Configured Allowlist Rules ({allowlist.length})
            </div>

            {allowlist.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
                Allowlist is currently open (unrestricted). Any email address can be invited by a Super Admin.
              </div>
            ) : (
              <div className="space-y-2">
                {allowlist.map((rule) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-emerald-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{rule}</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {rule.startsWith('@') ? '(Domain Rule)' : '(Exact Email Rule)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllowlistRule(rule)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                      title="Remove rule"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllowlist}
              disabled={isSavingAllowlist}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingAllowlist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Allowlist Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Invite New Staff Member</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a single-use 24-hour token requiring mandatory TOTP 2FA enrollment and recovery codes.
              </p>
            </div>

            {createdInviteResult ? (
              <div className="space-y-4 py-2 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Invitation Successfully Generated</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Share this onboarding link with{' '}
                    <strong className="text-white">{createdInviteResult.email}</strong> (valid for 24 hours):
                  </p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${createdInviteResult.inviteUrl}`}
                      className="bg-transparent text-xs text-emerald-300 font-mono flex-1 outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copyInviteLink(createdInviteResult.inviteUrl)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Mudassir Bashir"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Staff Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Assigned Staff Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="support_agent">Support Agent (User help &amp; tickets)</option>
                    <option value="content_editor">Content Editor (Catalog &amp; in-app content)</option>
                    <option value="analyst">Analyst (Read-only reports)</option>
                    <option value="super_admin">Super Admin (Full system control)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {ROLE_LABELS[inviteRole].description}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite || !inviteName || !inviteEmail}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Generate 24h Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!actionModal.targetAdmin}
        title={actionModal.action === 'suspend' ? 'Suspend Staff Account' : 'Reactivate Staff Account'}
        itemName={actionModal.targetAdmin ? `${actionModal.targetAdmin.name} (${actionModal.targetAdmin.email})` : ''}
        consequence={
          actionModal.action === 'suspend'
            ? 'The admin will be immediately evicted from all active sessions and denied login.'
            : 'The admin will regain access to their assigned portal functions.'
        }
        confirmWord={actionModal.action === 'suspend' ? 'SUSPEND' : undefined}
        confirmButtonText={actionModal.action === 'suspend' ? 'Suspend Account' : 'Reactivate Account'}
        isDestructive={actionModal.action === 'suspend'}
        isLoading={isActionLoading}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setActionModal({ targetAdmin: null, action: 'suspend', reason: '' })}
      />

      {/* Revoke Invite Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!revokeInviteTarget}
        title="Revoke Staff Invitation"
        itemName={revokeInviteTarget ? `${revokeInviteTarget.name} (${revokeInviteTarget.email})` : ''}
        consequence="The invite token will be immediately invalidated and cannot be used to activate an account."
        confirmButtonText="Revoke Invite"
        isDestructive={true}
        isLoading={isRevoking}
        onConfirm={handleConfirmRevokeInvite}
        onClose={() => setRevokeInviteTarget(null)}
      />
    </div>
  );
};
