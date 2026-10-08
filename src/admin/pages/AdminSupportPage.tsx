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
  X,
  ExternalLink,
  Check,
  Send,
  Tag,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface SupportTicket {
  id: string;
  ticket_number?: string;
  ticketNumber?: string;
  user_name?: string;
  userName?: string;
  user_email?: string;
  userEmail?: string;
  user_phone?: string;
  userPhone?: string;
  subject: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
  createdAt?: string;
  resolved_at?: string;
  resolvedAt?: string;
}

export const AdminSupportPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Status update & reply state inside modal
  const [newStatus, setNewStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>('open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const getTicketNumber = (t: SupportTicket) => t.ticket_number || t.ticketNumber || `#${t.id.slice(0, 8)}`;
  const getUserName = (t: SupportTicket) => t.user_name || t.userName || 'Shopper';
  const getUserEmail = (t: SupportTicket) => t.user_email || t.userEmail || '';
  const getUserPhone = (t: SupportTicket) => t.user_phone || t.userPhone || '';
  const getCreatedAt = (t: SupportTicket) => t.created_at || t.createdAt || new Date().toISOString();

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

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setResolutionNotes('');
    setReplyMessage('');
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !token) return;
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: resolutionNotes.trim() || undefined,
          replyMessage: replyMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        const updatedTicket = {
          ...selectedTicket,
          status: newStatus,
          resolved_at: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : undefined,
        };
        setSelectedTicket(updatedTicket);
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t))
        );
        adminCache.invalidatePrefix('/api/admin/tickets');
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update ticket status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Support Desk
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Resolve shopper inquiries, reported grocery issues, and feedback submitted directly from the app.
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
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Zero Support Inquiries</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            All shopper inquiries have been addressed. New support requests submitted via the mobile or web app settings will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => {
            const ticketNo = getTicketNumber(t);
            const userName = getUserName(t);
            const userEmail = getUserEmail(t);
            const dateStr = new Date(getCreatedAt(t)).toLocaleDateString();

            return (
              <div
                key={t.id}
                onClick={() => handleOpenTicket(t)}
                className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-3 shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2 py-0.5 rounded">
                    {ticketNo}
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
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm line-clamp-1">{t.subject}</h4>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{t.description}</p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                    <User className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{userName}</span>
                  </div>
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {getTicketNumber(selectedTicket)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    selectedTicket.status === 'open'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : selectedTicket.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subject */}
            <div>
              <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                {selectedTicket.subject}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Submitted on {new Date(getCreatedAt(selectedTicket)).toLocaleString()}
              </p>
            </div>

            {/* Customer Details Box */}
            <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-100 space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Shopper Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-700">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-semibold">{getUserName(selectedTicket)}</span>
                </div>
                {getUserEmail(selectedTicket) && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <a
                      href={`mailto:${getUserEmail(selectedTicket)}?subject=YAAD Support: ${getTicketNumber(selectedTicket)}`}
                      className="text-[#003527] hover:underline flex items-center gap-1 font-medium truncate"
                    >
                      <span className="truncate">{getUserEmail(selectedTicket)}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
                {getUserPhone(selectedTicket) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{getUserPhone(selectedTicket)}</span>
                  </div>
                )}
                {selectedTicket.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="capitalize">{selectedTicket.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Body */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Message / Inquiry
              </label>
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedTicket.description}
              </div>
            </div>

            {/* Status Update & Resolution */}
            <div className="pt-2 border-t border-neutral-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Update Ticket Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-800 font-semibold focus:outline-none focus:border-[#003527]"
                  >
                    <option value="open">Open (Needs Attention)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Direct Email Reply
                  </label>
                  {getUserEmail(selectedTicket) ? (
                    <a
                      href={`mailto:${getUserEmail(selectedTicket)}?subject=Re: YAAD Support Ticket ${getTicketNumber(selectedTicket)} - ${encodeURIComponent(selectedTicket.subject)}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Reply via Email</span>
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No email provided</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#003527] mb-1 flex items-center justify-between">
                  <span>Send In-App Reply to Shopper</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Dispatched to Shopper Bell
                  </span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type message or solution to send to the shopper. They will receive an immediate in-app notification alert with this response..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527] bg-emerald-50/20 text-neutral-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Internal Resolution Notes (Optional)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record internal actions taken or notes for the staff team..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527]"
                />
              </div>

              {updateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ticket status successfully updated!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-xs hover:bg-neutral-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#003527] hover:bg-[#00281d] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

