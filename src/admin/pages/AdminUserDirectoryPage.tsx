import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Ban,
  RotateCcw,
  ShoppingBag,
  Calendar,
  Globe,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

export interface AuthoritativeUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  language?: string;
  avatarUrl?: string;
  signupDate: number;
  lastActiveAt: number;
  status: 'active' | 'suspended';
  suspendReason?: string;
  listsCount: number;
  completedTripsCount: number;
}

export const AdminUserDirectoryPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const { showToast } = useAdminToast();

  const [users, setUsers] = useState<AuthoritativeUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Suspend modal state
  const [selectedUser, setSelectedUser] = useState<AuthoritativeUser | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to load users`);
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load users from the database.');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended', reason?: string) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update user status.');
      }

      showToast({
        type: 'success',
        title: 'User Status Updated',
        message: `Account is now ${newStatus}.`,
      });

      setSelectedUser(null);
      setSuspendReason('');
      fetchUsers();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuperAdmin = admin?.role === 'super_admin';

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
              <span className="text-xs text-neutral-500">public.profiles + public.shopping_lists</span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Shopper Directory
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Live records directly from the production Supabase database. Real shopper accounts, active shopping lists, and moderation controls.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-fetch from Database</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {(['all', 'active', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setStatusFilter(filter);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#003527] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
          <span className="text-xs text-neutral-500 font-mono ml-2">
            Total: <strong>{total}</strong>
          </span>
        </div>
      </div>

      {/* Database Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 text-sm">DATA ERROR: Unable to load users from Supabase</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchUsers()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* User Records Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#003527] animate-spin mx-auto" />
            <div className="text-xs font-mono text-neutral-500">Querying Supabase production profiles...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-3 text-neutral-500">
            <Users className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="font-bold text-neutral-800 text-sm">No Shoppers Found</div>
            <p className="text-xs max-w-sm mx-auto text-neutral-500">
              {searchQuery || statusFilter !== 'all'
                ? 'No user records match your filter criteria.'
                : 'Zero shopper accounts in Supabase database. When users sign up in the YAAD app, their actual profiles will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Shopper</th>
                  <th className="py-3.5 px-4">Contact &amp; Language</th>
                  <th className="py-3.5 px-4">Shopping Activity</th>
                  <th className="py-3.5 px-4">Signup Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isSuperAdmin && <th className="py-3.5 px-4 text-right">Moderation</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => {
                  const initial = (u.name || 'U').charAt(0).toUpperCase();
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#003527]/10 text-[#003527] font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{u.name}</div>
                            <div className="font-mono text-[10px] text-neutral-400">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600">
                        <div className="space-y-0.5">
                          {u.email && (
                            <div className="flex items-center gap-1.5 text-neutral-700">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <span>{u.email}</span>
                            </div>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-neutral-700 font-mono">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                            <Globe className="w-3 h-3" />
                            <span className="uppercase">{u.language || 'en'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#003527]" />
                            <span>{u.listsCount} list(s)</span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {u.completedTripsCount} completed trip(s)
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{new Date(u.signupDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="capitalize">{u.status}</span>
                        </span>
                        {u.suspendReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-xs truncate" title={u.suspendReason}>
                            Reason: {u.suspendReason}
                          </div>
                        )}
                      </td>

                      {isSuperAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSuspendReason('');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Suspend User Account"
                            >
                              <Ban className="w-3 h-3 text-rose-500" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(u.id, 'active')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Reactivate User Account"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-600" />
                              <span>Reactivate</span>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total users)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Suspend Shopper Account</h3>
                <p className="text-xs text-neutral-500">{selectedUser.name} ({selectedUser.email || selectedUser.id})</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Suspended accounts cannot log in to the YAAD application or sync shopping lists. This action is permanently logged to the Supabase audit trail.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Reason for Suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g., Abusive language in shared lists, suspicious automated activity..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !suspendReason.trim()}
                onClick={() => handleStatusChange(selectedUser.id, 'suspended', suspendReason)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
