import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  resolved_at?: string;
}

export const AdminSupportPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '50');

      const url = `/api/admin/tickets?${params.toString()}`;
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await adminCache.fetchWithSwr<{ tickets: SupportTicket[]; total: number }>(
        url,
        headers,
        (fresh) => {
          if (fresh) {
            setTickets(fresh.tickets || []);
            setTotal(fresh.total || 0);
          }
        },
        forceRefresh
      );

      if (data) {
        setTickets(data.tickets || []);
        setTotal(data.total || 0);
      }
      setIsLoading(false);
    },
    [token, search, statusFilter]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Support Desk
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Resolve shopper inquiries, reported grocery item misclassifications, and account support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchTickets(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject, user or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-700 focus:outline-none focus:border-[#003527]"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="open">Open (Needs Attention)</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Zero Open Support Inquiries</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            All shopper inquiries have been resolved. New support requests submitted via the mobile or web app will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2 py-0.5 rounded">
                  {t.ticket_number}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.status === 'open'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : t.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">{t.subject}</h4>
                <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{t.description}</p>
              </div>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>{t.user_name}</span>
                <span>{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
