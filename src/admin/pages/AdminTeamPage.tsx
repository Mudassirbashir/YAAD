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
  User,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { AdminUser, AdminInvite, AdminRole, ROLE_LABELS } from '../types';
import { adminCache } from '../utils/adminCache';

export const AdminTeamPage: React.FC = () => {
  const { admin, token, logout } = useAdminAuth();
  const toast = useAdminToast();

  const isSuperAdmin = admin?.role === 'super_admin';

  // Active Tab: 'members' | 'invites' | 'allowlist' | 'requests'
  const [activeTab, setActiveTab] = useState<'members' | 'invites' | 'allowlist' | 'requests'>('members');

  // Access Requests State
  interface AccessRequestItem {
    id: string;
    name: string;
    email: string;
    phone?: string;
    requestedRole: string;
    department?: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
  }
  const [requests, setRequests] = useState<AccessRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Staff Members State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const staffCacheKey = `/api/admin/team?page=${page}&limit=10&search=${encodeURIComponent(search.trim())}&role=${roleFilter}&status=${statusFilter}`;
  const initialStaff = adminCache.getStale<any>(staffCacheKey);

  const [staff, setStaff] = useState<AdminUser[]>(initialStaff?.admins || []);
  const [totalStaff, setTotalStaff] = useState(initialStaff?.total || 0);
  const [isLoadingStaff, setIsLoadingStaff] = useState(!initialStaff);

  // Invites State
  const initialInvites = adminCache.getStale<any>('/api/admin/invites');
  const [invites, setInvites] = useState<AdminInvite[]>(initialInvites?.invites || []);
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
  const fetchStaff = useCallback(async (force = false) => {
    if (!token) return;
    const queryKey = `/api/admin/team?page=${page}&limit=10&search=${encodeURIComponent(search.trim())}&role=${roleFilter}&status=${statusFilter}`;
    if (!adminCache.get(queryKey) && !force) {
      const stale = adminCache.getStale<any>(queryKey);
      if (!stale) setIsLoadingStaff(true);
    }
    try {
      const data = await adminCache.fetchWithSwr(
        queryKey,
        async () => {
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
            if (res.status === 401) {
              logout();
              throw new Error('Unauthorized');
            }
            if (res.status === 403) {
              return { admins: [], total: 0 };
            }
            toast.error('Failed to load team members');
            throw new Error('Failed to load team members');
          }

          return res.json();
        },
        {
          ttl: 120_000,
          onRevalidate: (fresh) => {
            if (fresh) {
              setStaff(fresh.admins || []);
              setTotalStaff(fresh.total || 0);
            }
          },
        }
      );

      if (data) {
        setStaff(data.admins || []);
        setTotalStaff(data.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching staff members:', err);
    } finally {
      setIsLoadingStaff(false);
    }
  }, [token, page, search, roleFilter, statusFilter, logout, toast]);

  // 2. Fetch Invites
  const fetchInvites = useCallback(async (force = false) => {
    if (!token || !isSuperAdmin) return;
    const cacheKey = '/api/admin/invites';
    if (!adminCache.get(cacheKey) && !force) {
      const stale = adminCache.getStale<any>(cacheKey);
      if (!stale) setIsLoadingInvites(true);
    }
    try {
      const data = await adminCache.fetchWithSwr(
        cacheKey,
        async () => {
          const res = await fetch('/api/admin/invites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 401) {
            logout();
            throw new Error('Unauthorized');
          }
          if (res.ok) {
            return res.json();
          }
          return { invites: [] };
        },
        {
          ttl: 120_000,
          onRevalidate: (fresh) => {
            if (fresh) {
              setInvites(fresh.invites || []);
            }
          },
        }
      );
      if (data) {
        setInvites(data.invites || []);
      }
    } catch (err: any) {
      console.error('Error fetching invites:', err);
    } finally {
      setIsLoadingInvites(false);
    }
  }, [token, isSuperAdmin, logout]);

  // 3. Fetch Allowlist
  const fetchAllowlist = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    setIsLoadingAllowlist(true);
    try {
      const res = await fetch('/api/admin/settings/allowlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAllowlist(data.allowlist || []);
      }
    } catch (err: any) {
      console.error('Error fetching allowlist:', err);
    } finally {
      setIsLoadingAllowlist(false);
    }
  }, [token, isSuperAdmin, logout]);

  // 4. Fetch Access Requests
  const fetchAccessRequests = useCallback(async () => {
    if (!token || !isSuperAdmin) return;
    setIsLoadingRequests(true);
    try {
      const res = await fetch('/api/admin/access-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err: any) {
      console.error('Error fetching access requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [token, isSuperAdmin, logout]);

  useEffect(() => {
    fetchStaff();
    if (isSuperAdmin) {
      fetchAccessRequests();
    }
  }, [fetchStaff, fetchAccessRequests, isSuperAdmin]);

  useEffect(() => {
    if (activeTab === 'invites' && isSuperAdmin) {
      fetchInvites();
    } else if (activeTab === 'allowlist' && isSuperAdmin) {
      fetchAllowlist();
    } else if (activeTab === 'requests' && isSuperAdmin) {
      fetchAccessRequests();
    }
  }, [activeTab, isSuperAdmin, fetchInvites, fetchAllowlist, fetchAccessRequests]);

  const handleApproveRequest = async (req: AccessRequestItem) => {
    setInviteName(req.name);
    setInviteEmail(req.email);
    const validRoles: AdminRole[] = ['support_agent', 'content_editor', 'analyst', 'super_admin'];
    const assignedRole = validRoles.includes(req.requestedRole as AdminRole)
      ? (req.requestedRole as AdminRole)
      : 'support_agent';
    setInviteRole(assignedRole);
    setCreatedInviteResult(null);
    setInviteModalOpen(true);

    try {
      await fetch(`/api/admin/access-requests/${req.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      fetchAccessRequests();
    } catch (e) {
      console.error('Error updating access request status', e);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        toast.info('Request Declined', 'Access application was declined.');
        fetchAccessRequests();
      }
    } catch (err: any) {
      toast.error('Action Failed', err.message);
    }
  };

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
      adminCache.invalidatePrefix('/api/admin/invites');
      adminCache.invalidatePrefix('/api/admin/metrics');
      fetchInvites(true);
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
      adminCache.invalidatePrefix('/api/admin/team');
      adminCache.invalidatePrefix('/api/admin/metrics');
      fetchStaff(true);
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
      adminCache.invalidatePrefix('/api/admin/invites');
      adminCache.invalidatePrefix('/api/admin/metrics');
      fetchInvites(true);
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
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Staff &amp; Access Governance
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New Admin</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer relative ${
            activeTab === 'members'
              ? 'text-[#003527] border-b-2 border-[#003527]'
              : 'text-neutral-500 hover:text-neutral-900'
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
                ? 'text-[#003527] border-b-2 border-[#003527]'
                : 'text-neutral-500 hover:text-neutral-900'
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
                ? 'text-[#003527] border-b-2 border-[#003527]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Email Allowlist ({allowlist.length})
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'requests'
                ? 'text-[#003527] border-b-2 border-[#003527]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Access Requests ({requests.filter((r) => r.status === 'pending').length})
          </button>
        )}
      </div>

      {/* TAB 1: MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search staff by name or email..."
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700 outline-none focus:border-[#003527]"
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
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700 outline-none focus:border-[#003527]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoadingStaff ? (
            <AdminTableSkeleton rows={5} columns={5} />
          ) : staff.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <Users className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-neutral-800">No staff members found</p>
              <p className="text-xs text-neutral-500">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Staff Member</th>
                      <th className="py-3.5 px-4">Role Tier</th>
                      <th className="py-3.5 px-4">2FA Security</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      {isSuperAdmin && <th className="py-3.5 px-4 text-right">Governance Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {staff.map((member) => {
                      const isSelf = member.id === admin?.id;
                      const roleConfig = ROLE_LABELS[member.role];
                      return (
                        <tr key={member.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-[#003527] font-extrabold flex items-center justify-center font-mono text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                  <span>{member.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] font-mono text-[#003527] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-500 font-mono">{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-neutral-800">{roleConfig?.title || member.role}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {member.isTotpEnabled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Enforced</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending 1st Login</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {member.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-700 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
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
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-[#003527] border border-emerald-200'
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
            <AdminTableSkeleton rows={3} columns={4} />
          ) : invites.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <Clock className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-neutral-800">No active invitations</p>
              <p className="text-xs text-neutral-500">Click &quot;Invite New Admin&quot; to issue single-use onboarding tokens.</p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Invited Recipient</th>
                      <th className="py-3.5 px-4">Target Role</th>
                      <th className="py-3.5 px-4">Token Expiration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {invites.map((inv) => {
                      const isExpired = Date.now() > inv.expiresAt;
                      return (
                        <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-900">{inv.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{inv.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-neutral-800">
                              {ROLE_LABELS[inv.role]?.title || inv.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                            {new Date(inv.expiresAt).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4">
                            {inv.status === 'accepted' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Accepted
                              </span>
                            ) : inv.status === 'revoked' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200">
                                Revoked
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                Pending (24h)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {inv.status === 'pending' && !isExpired && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => copyInviteLink(`/admin/accept-invite?token=${inv.token}`)}
                                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-medium cursor-pointer transition-colors"
                                  title="Copy invite link"
                                >
                                  Copy Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRevokeInviteTarget(inv)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors"
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
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#003527] tracking-tight flex items-center gap-2 font-['Manrope']">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Email Allowlist &amp; Domain Restrictions</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Restrict staff invitations and Super Admin logins to specific email domains (e.g.{' '}
              <code className="text-[#003527] font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">@yaad.app</code>) or individual email addresses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <label className="text-xs font-bold text-neutral-700 block">Add Allowed Domain or Email</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllowlistEntry}
                onChange={(e) => setNewAllowlistEntry(e.target.value)}
                placeholder="e.g. @yaad.app or security-lead@yaad.app"
                className="flex-1 bg-white border border-neutral-200 focus:border-[#003527] rounded-xl px-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none"
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
                className="px-4 py-2.5 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* Current Rules List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Configured Allowlist Rules ({allowlist.length})
            </div>

            {allowlist.length === 0 ? (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 text-center">
                Allowlist is currently open (unrestricted). Any email address can be invited by a Super Admin.
              </div>
            ) : (
              <div className="space-y-2">
                {allowlist.map((rule) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-[#003527] font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rule}</span>
                      <span className="text-[10px] text-neutral-400 font-sans font-normal">
                        {rule.startsWith('@') ? '(Domain Rule)' : '(Exact Email Rule)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllowlistRule(rule)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer transition-colors"
                      title="Remove rule"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-end">
            <button
              type="button"
              onClick={handleSaveAllowlist}
              disabled={isSavingAllowlist}
              className="px-5 py-2.5 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSavingAllowlist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Allowlist Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ACCESS REQUESTS */}
      {activeTab === 'requests' && isSuperAdmin && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Admin Access Applications</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review and approve staff members applying for portal access from the <code className="text-[#003527] bg-emerald-50 px-1 py-0.5 rounded font-mono">/admin</code> login page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchAccessRequests()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingRequests ? (
            <AdminTableSkeleton rows={3} columns={4} />
          ) : requests.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003527] flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">No Access Applications</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                When new staff or contractors request admin access via the portal login page, their applications will appear here for Super Admin approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs hover:border-[#003527] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-[#003527] font-extrabold flex items-center justify-center font-mono text-sm">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{req.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <a
                            href={`mailto:${req.email}`}
                            className="hover:underline text-neutral-600 flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span>{req.email}</span>
                          </a>
                          {req.phone && (
                            <span className="flex items-center gap-1">
                              &bull; {req.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        req.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-800 capitalize">
                      Role: {req.requestedRole.replace('_', ' ')}
                    </span>
                    {req.department && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-800 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-neutral-400" />
                        <span>{req.department}</span>
                      </span>
                    )}
                  </div>

                  <div className="bg-neutral-50/80 rounded-xl p-3 text-xs text-neutral-700 border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Stated Purpose / Reason
                    </span>
                    <p className="whitespace-pre-wrap">{req.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Applied {new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold shadow-2xs cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve &amp; Invite</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-500 font-medium">
                        Reviewed {req.reviewedBy ? `by ${req.reviewedBy}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Invite Admin Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-neutral-900 relative">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#003527] tracking-tight flex items-center gap-2 font-['Manrope']">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Invite New Staff Member</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Generates a single-use 24-hour token requiring mandatory TOTP 2FA enrollment and recovery codes.
              </p>
            </div>

            {createdInviteResult ? (
              <div className="space-y-4 py-2 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#003527] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Invitation Successfully Generated</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Share this onboarding link with{' '}
                    <strong className="text-neutral-900">{createdInviteResult.email}</strong> (valid for 24 hours):
                  </p>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${createdInviteResult.inviteUrl}`}
                      className="bg-transparent text-xs text-[#003527] font-mono flex-1 outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copyInviteLink(createdInviteResult.inviteUrl)}
                      className="px-3 py-1.5 rounded-lg bg-[#003527] hover:bg-[#00271c] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Mudassir Bashir"
                    required
                    className="w-full bg-white border border-neutral-200 focus:border-[#003527] rounded-xl px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">Staff Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@domain.com"
                    required
                    className="w-full bg-white border border-neutral-200 focus:border-[#003527] rounded-xl px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block">Assigned Staff Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    className="w-full bg-white border border-neutral-200 focus:border-[#003527] rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                  >
                    <option value="support_agent">Support Agent (User help &amp; tickets)</option>
                    <option value="content_editor">Content Editor (Catalog &amp; in-app content)</option>
                    <option value="analyst">Analyst (Read-only reports)</option>
                    <option value="super_admin">Super Admin (Full system control)</option>
                  </select>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {ROLE_LABELS[inviteRole].description}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite || !inviteName || !inviteEmail}
                    className="flex-1 py-2.5 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
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
