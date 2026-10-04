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

  // Active Tab: 'members' | 'invites'
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');

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

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (activeTab === 'invites' && isSuperAdmin) {
      fetchInvites();
    }
  }, [activeTab, isSuperAdmin, fetchInvites]);

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

      toast.success('Staff Invited', `Expiring invite generated for ${inviteEmail}.`);
      setCreatedInviteResult({
        inviteUrl: data.inviteUrl,
        email: inviteEmail.trim(),
      });
      setInviteName('');
      setInviteEmail('');
      fetchInvites();
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle Suspend / Reactivate
  const handleConfirmStatusChange = async () => {
    const { targetAdmin, action, reason } = actionModal;
    if (!targetAdmin || isActionLoading) return;

    setIsActionLoading(true);
    try {
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      const res = await fetch(`/api/admin/team/${targetAdmin.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Action Failed', data.error);
        return;
      }

      toast.success(
        action === 'suspend' ? 'Admin Suspended' : 'Admin Reactivated',
        `Account for ${targetAdmin.email} updated.`
      );
      setActionModal({ targetAdmin: null, action: 'suspend', reason: '' });
      fetchStaff();
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Revoke Invite
  const handleConfirmRevokeInvite = async () => {
    if (!revokeInviteTarget || isRevoking) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/admin/invites/${revokeInviteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error('Failed to revoke invite');
        return;
      }

      toast.success('Invite Revoked', `Invitation for ${revokeInviteTarget.email} is no longer valid.`);
      setRevokeInviteTarget(null);
      fetchInvites();
    } catch (err: any) {
      toast.error('Error', err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  const copyInviteLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.info('Copied', 'Invite link copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Manrope']">
            Staff &amp; Team Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized staff members, role tiers, and secure staff invitations
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
      </div>

      {activeTab === 'members' ? (
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
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          {isLoadingStaff ? (
            <AdminTableSkeleton rows={5} columns={5} />
          ) : staff.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Staff Members Found</h4>
              <p className="text-xs text-slate-400">
                {search || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search query or filters.'
                  : 'No admin staff members currently in directory.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Staff Member</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">2FA Status</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5">Last Active</th>
                      {isSuperAdmin && <th className="px-5 py-3.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {staff.map((member) => {
                      const roleMeta = ROLE_LABELS[member.role];
                      const isSelf = member.id === admin?.id;
                      return (
                        <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{member.email}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            {roleMeta ? (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleMeta.badgeClass}`}
                              >
                                {roleMeta.title}
                              </span>
                            ) : (
                              member.role
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enforced</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            {member.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                            {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>

                          {isSuperAdmin && (
                            <td className="px-5 py-3.5 text-right">
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
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    member.status === 'active'
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
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
      ) : (
        /* Pending Invites Tab */
        <div className="space-y-4">
          {isLoadingInvites ? (
            <AdminTableSkeleton rows={3} columns={4} />
          ) : invites.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Invitations Sent</h4>
              <p className="text-xs text-slate-400">
                You can invite new team members using the "Invite New Admin" button.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Invitee</th>
                      <th className="px-5 py-3.5">Assigned Role</th>
                      <th className="px-5 py-3.5">Invited By</th>
                      <th className="px-5 py-3.5">Status &amp; Expiry</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invites.map((inv) => {
                      const isExpired = Date.now() > inv.expiresAt;
                      const roleMeta = ROLE_LABELS[inv.role];
                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white">{inv.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{inv.email}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            {roleMeta && (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleMeta.badgeClass}`}
                              >
                                {roleMeta.title}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-slate-400">
                            {inv.invitedBy?.name || inv.invitedBy?.email || 'Super Admin'}
                          </td>

                          <td className="px-5 py-3.5">
                            {inv.status === 'accepted' ? (
                              <span className="text-emerald-400 text-xs font-semibold">Accepted</span>
                            ) : inv.status === 'revoked' ? (
                              <span className="text-rose-400 text-xs font-semibold">Revoked</span>
                            ) : isExpired ? (
                              <span className="text-amber-400 text-xs font-semibold">Expired</span>
                            ) : (
                              <div className="text-xs">
                                <span className="text-sky-400 font-semibold">Pending</span>
                                <div className="text-[10px] text-slate-500">
                                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {inv.status === 'pending' && !isExpired && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => copyInviteLink(`/admin/accept-invite?token=${inv.token}`)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title="Copy invite link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRevokeInviteTarget(inv)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                  title="Revoke invitation"
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

      {/* Invite Admin Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Invite New Staff Member</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a secure 7-day single-use token requiring mandatory TOTP 2FA setup.
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
                    <strong className="text-white">{createdInviteResult.email}</strong>:
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
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
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
                    placeholder="colleague@yaad.app"
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
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite || !inviteName || !inviteEmail}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Generate Invitation</span>
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
