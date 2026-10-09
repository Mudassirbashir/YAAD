import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  User,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Ban,
  Undo2,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';
import { useAdminRealtime } from '../hooks/useAdminRealtime';
import { adminCache } from '../utils/adminCache';

export interface AuthoritativeList {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  title: string;
  status?: 'clean' | 'flagged' | 'under_review' | 'resolved';
  isCompleted: boolean;
  itemsCount: number;
  flaggedItemsCount?: number;
  createdAt: number;
  updatedAt: number;
  items: Array<{
    id: string;
    name: string;
    category: string;
    quantity?: string;
    unit?: string;
    completed: boolean;
    isFlagged?: boolean;
    flagReason?: string;
    moderationStatus?: 'pending' | 'approved' | 'removed';
  }>;
}

export const AdminListModerationPage: React.FC = () => {
  const { token, logout } = useAdminAuth();
  const toast = useAdminToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cached initial state
  const cacheKey = `/api/admin/lists?page=${page}&limit=25&search=${encodeURIComponent(searchQuery.trim())}&completion=${completionFilter}`;
  const initialCached = adminCache.getStale<any>(cacheKey);

  const [lists, setLists] = useState<AuthoritativeList[]>(initialCached?.lists || []);
  const [total, setTotal] = useState(initialCached?.total || 0);
  const [isLoading, setIsLoading] = useState(!initialCached);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLists = useCallback(async (force = false) => {
    if (!token) return;
    const currentKey = `/api/admin/lists?page=${page}&limit=25&search=${encodeURIComponent(searchQuery.trim())}&completion=${completionFilter}`;

    if (!adminCache.get(currentKey) && !force) {
      const stale = adminCache.getStale<any>(currentKey);
      if (!stale) setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await adminCache.fetchWithSwr(
        currentKey,
        async () => {
          const params = new URLSearchParams();
          params.set('page', String(page));
          params.set('limit', '25');
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          if (completionFilter === 'completed') params.set('isCompleted', 'true');
          if (completionFilter === 'active') params.set('isCompleted', 'false');

          const res = await fetch(`/api/admin/lists?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              return { lists: [], total: 0, totalPages: 1 };
            }
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}: Failed to load shopping lists`);
          }
          return res.json();
        },
        {
          ttl: 300_000,
          onRevalidate: (freshData) => {
            if (freshData) {
              setLists(freshData.lists || []);
              setTotal(freshData.total || 0);
              setTotalPages(freshData.totalPages || 1);
            }
          },
        }
      );

      if (data) {
        setLists(data.lists || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load shopping lists from database.');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, searchQuery, completionFilter]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Phase 6: Live Realtime subscription for shopping lists & items
  useAdminRealtime({
    tables: ['shopping_lists', 'shopping_items'],
    onDatabaseChange: () => {
      fetchLists(true);
    },
    enabled: Boolean(token),
  });

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleUpdateListStatus = async (
    listId: string,
    newStatus: 'clean' | 'flagged' | 'under_review' | 'resolved'
  ) => {
    if (!token) return;
    setActionInProgress(`status_${listId}`);
    try {
      const res = await fetch(`/api/admin/lists/${listId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update list status');
      }
      toast.success('Status Updated', `List is now marked as ${newStatus.replace('_', ' ')}.`);
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, status: newStatus } : l))
      );
      adminCache.invalidatePrefix('/api/admin/lists');
    } catch (err: any) {
      toast.error('Moderation Failed', err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleModerateItem = async (
    listId: string,
    itemId: string,
    action: 'approved' | 'removed'
  ) => {
    if (!token) return;
    setActionInProgress(`item_${itemId}`);
    try {
      const res = await fetch(`/api/admin/lists/${listId}/items/${itemId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          reason: action === 'removed' ? 'Inappropriate entry removed by moderator' : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to moderate list item');
      }
      toast.success('Item Moderated', `Item has been ${action === 'removed' ? 'removed' : 'approved'}.`);
      setLists((prev) =>
        prev.map((l) => {
          if (l.id !== listId) return l;
          return {
            ...l,
            items: l.items.map((it) =>
              it.id === itemId
                ? {
                    ...it,
                    moderationStatus: action,
                    isFlagged: action === 'removed' ? false : it.isFlagged,
                  }
                : it
            ),
          };
        })
      );
      adminCache.invalidatePrefix('/api/admin/lists');
    } catch (err: any) {
      toast.error('Item Moderation Failed', err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteList = async (listId: string, listTitle: string) => {
    if (!token) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the list "${listTitle || 'Untitled'}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    setActionInProgress(`delete_${listId}`);
    try {
      const res = await fetch(`/api/admin/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete shopping list');
      }
      toast.success('List Deleted', 'Shopping list removed from system.');
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setTotal((t) => Math.max(0, t - 1));
      adminCache.invalidatePrefix('/api/admin/lists');
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleExpand = (listId: string) => {
    setExpandedListId((prev) => (prev === listId ? null : listId));
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
              <span className="text-xs text-neutral-500">Live Grocery Lists &amp; Parchis</span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Shopping Lists (Parchis)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Real application lists and items created by shoppers. Direct relational join with owner profiles and item statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchLists()}
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
            placeholder="Search list title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setCompletionFilter(filter);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                completionFilter === filter
                  ? 'bg-[#003527] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter === 'active' ? 'In Progress' : filter}
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
              <div className="font-bold text-rose-800 text-sm">DATA ERROR: Unable to load lists from Supabase</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchLists()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Lists Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#003527] animate-spin mx-auto" />
            <div className="text-xs font-mono text-neutral-500">Querying Supabase production shopping_lists...</div>
          </div>
        ) : lists.length === 0 ? (
          <div className="py-20 text-center space-y-3 text-neutral-500">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="font-bold text-neutral-800 text-sm">No Shopping Lists Recorded</div>
            <p className="text-xs max-w-sm mx-auto text-neutral-500">
              {searchQuery || completionFilter !== 'all'
                ? 'No lists match your search or filter.'
                : 'Zero shopping lists found in Supabase database. When users create lists in the YAAD app, they will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {lists.map((l) => {
              const isExpanded = expandedListId === l.id;
              const completedItemsCount = l.items.filter((i) => i.completed).length;

              return (
                <div key={l.id} className="transition-colors hover:bg-neutral-50/50">
                  <div
                    onClick={() => toggleExpand(l.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">{l.title || 'Untitled Shopping List'}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {l.isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>In Progress</span>
                            </>
                          )}
                        </span>

                        {/* Moderation Status Pill */}
                        {l.status === 'flagged' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Flagged</span>
                          </span>
                        )}
                        {l.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Under Review</span>
                          </span>
                        )}
                        {l.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Resolved</span>
                          </span>
                        )}
                        {(l.status === 'clean' || !l.status) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                            <span>Clean</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-neutral-400" />
                          <strong className="text-neutral-700">{l.userName}</strong>
                        </span>
                        <span className="font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">ID: {l.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-neutral-800">
                          {l.itemsCount} item(s)
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {completedItemsCount} purchased
                        </div>
                      </div>

                      {/* Quick Moderation Actions */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={l.status || 'clean'}
                          disabled={actionInProgress === `status_${l.id}`}
                          onChange={(e) => handleUpdateListStatus(l.id, e.target.value as any)}
                          className="text-[11px] font-bold py-1 px-2 rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#003527] cursor-pointer"
                        >
                          <option value="clean">Clean</option>
                          <option value="flagged">Flagged</option>
                          <option value="under_review">Under Review</option>
                          <option value="resolved">Resolved</option>
                        </select>

                        <button
                          type="button"
                          title="Delete List"
                          disabled={actionInProgress === `delete_${l.id}`}
                          onClick={() => handleDeleteList(l.id, l.title)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-1 rounded-lg bg-neutral-100 text-neutral-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items Preview */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-neutral-50/70 border-t border-neutral-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        List Items ({l.items.length})
                      </div>
                      {l.items.length === 0 ? (
                        <div className="text-xs text-neutral-400 italic">This list contains 0 items.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {l.items.map((item) => {
                            const isRemoved = item.moderationStatus === 'removed';
                            const isFlagged = item.isFlagged;

                            return (
                              <div
                                key={item.id}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                  isRemoved
                                    ? 'bg-rose-50/50 border-rose-200 text-rose-900 line-through opacity-75'
                                    : item.completed
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 line-through'
                                    : isFlagged
                                    ? 'bg-amber-50/50 border-amber-300 text-amber-900'
                                    : 'bg-white border-neutral-200 text-neutral-800'
                                }`}
                              >
                                <div className="truncate flex-1">
                                  <span className="font-medium">{item.name}</span>
                                  {item.quantity && (
                                    <span className="text-[10px] text-neutral-500 ml-1.5 font-mono">
                                      ({item.quantity} {item.unit || ''})
                                    </span>
                                  )}
                                  {isRemoved && (
                                    <span className="ml-2 text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                      Removed
                                    </span>
                                  )}
                                  {isFlagged && !isRemoved && (
                                    <span className="ml-2 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                      Flagged
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                    {item.category || 'General'}
                                  </span>

                                  {isRemoved ? (
                                    <button
                                      type="button"
                                      title="Approve / Restore item"
                                      disabled={actionInProgress === `item_${item.id}`}
                                      onClick={() => handleModerateItem(l.id, item.id, 'approved')}
                                      className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                    >
                                      <Undo2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      title="Remove inappropriate item"
                                      disabled={actionInProgress === `item_${item.id}`}
                                      onClick={() => handleModerateItem(l.id, item.id, 'removed')}
                                      className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total lists)
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
    </div>
  );
};
