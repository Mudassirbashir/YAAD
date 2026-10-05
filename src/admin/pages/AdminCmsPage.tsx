import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  title_ur?: string;
  author_name: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  views_count: number;
  read_time_minutes: number;
  created_at: string;
}

export const AdminCmsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchArticles = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const url = `/api/admin/cms/articles?${params.toString()}`;
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await adminCache.fetchWithSwr<{ articles: CmsArticle[]; total: number }>(
        url,
        headers,
        (fresh) => {
          if (fresh) {
            setArticles(fresh.articles || []);
            setTotal(fresh.total || 0);
          }
        },
        forceRefresh
      );

      if (data) {
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      }
      setIsLoading(false);
    },
    [token, search, statusFilter]
  );

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            Grocery Guides &amp; Content CMS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Publish seasonal grocery guides, Pakistani recipe lists, and household budgeting tips.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchArticles(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides and articles..."
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
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Article Cards */}
      {articles.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Zero Articles Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            No published grocery guides or articles in the database. When content editors create articles, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-[#003527] transition-all cursor-pointer space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {art.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {art.status}
                </span>
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">{art.title}</h4>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>By {art.author_name}</span>
                <span>{art.read_time_minutes} min read</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
