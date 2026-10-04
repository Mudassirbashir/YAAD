import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  X,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { AuditLogEntry } from '../types';

export const AdminAuditLogPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const toast = useAdminToast();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Inspector modal state
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.append('search', search.trim());
      if (actionFilter) params.append('action', actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 403) {
          toast.error('Permission Denied', 'Only Super Admins can view the system audit trail.');
        } else {
          toast.error('Error', 'Failed to load audit logs.');
        }
        return;
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      toast.error('Network Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, search, actionFilter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export current filtered logs to CSV
  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast.info('No Data', 'No audit logs to export.');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'IP Address'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toISOString(),
      l.adminEmail || 'System',
      l.action,
      l.targetType,
      l.targetId || '',
      l.ip || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yaad_admin_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Audit Log Exported', `${logs.length} audit records exported to CSV.`);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Manrope'] flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Append-Only Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable cryptographic activity ledger. Every administrative mutation and access attempt is logged.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
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
            placeholder="Search by action, admin email, or target..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="">All Actions</option>
            <option value="admin_login_success">admin_login_success</option>
            <option value="admin_login_failed">admin_login_failed</option>
            <option value="admin_2fa_enabled">admin_2fa_enabled</option>
            <option value="admin_invited">admin_invited</option>
            <option value="admin_invite_accepted">admin_invite_accepted</option>
            <option value="admin_suspended">admin_suspended</option>
            <option value="admin_reactivated">admin_reactivated</option>
            <option value="admin_password_reset_completed">admin_password_reset_completed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <AdminTableSkeleton rows={8} columns={5} />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          <Database className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Audit Records Found</h4>
          <p className="text-xs text-slate-400">
            {search || actionFilter ? 'Try clearing your filters.' : 'The audit ledger is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 font-sans font-medium text-white truncate max-w-[180px]">
                      {log.adminEmail || 'System'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          log.action.includes('failed') || log.action.includes('blocked')
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : log.action.includes('login') || log.action.includes('enabled')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-300">
                      <span>{log.targetType}</span>
                      {log.targetId && (
                        <span className="text-slate-500 ml-1 text-[10px]">({log.targetId.substring(0, 10)}...)</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">{log.ip || '—'}</td>

                    <td className="px-5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => setInspectEntry(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-white">{Math.min(page * limit, total)}</strong> of{' '}
              <strong className="text-white">{total}</strong> events
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Inspect Modal */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100 relative">
            <button
              type="button"
              onClick={() => setInspectEntry(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                Audit Record Details
              </div>
              <h3 className="text-base font-bold text-white font-mono">{inspectEntry.action}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(inspectEntry.timestamp).toUTCString()} &bull; ID: {inspectEntry.id}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Actor:</span>
                  <span className="text-white font-bold">{inspectEntry.adminEmail || 'System'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IP Address:</span>
                  <span className="text-white font-mono">{inspectEntry.ip || '—'}</span>
                </div>
              </div>

              {inspectEntry.beforeValue && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">Before Value:</span>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                    {JSON.stringify(inspectEntry.beforeValue, null, 2)}
                  </pre>
                </div>
              )}

              {inspectEntry.afterValue && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">After Value:</span>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    {JSON.stringify(inspectEntry.afterValue, null, 2)}
                  </pre>
                </div>
              )}

              {inspectEntry.metadata && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">Metadata:</span>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(inspectEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectEntry(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
