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
  Edit,
  Trash2,
  X,
  ExternalLink,
  Image as ImageIcon,
  Share2,
  Clock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  titleUr?: string;
  titleRomanUrdu?: string;
  excerpt: string;
  excerptUr?: string;
  excerptRomanUrdu?: string;
  body: string;
  headingSize?: 'h1' | 'h2' | 'h3';
  coverImageUrl?: string;
  authorName: string;
  authorEmail?: string;
  category: string;
  tags: string[];
  socialLinks?: SocialLinks;
  status: 'draft' | 'published';
  publishedAt?: number;
  readTimeMinutes: number;
  viewsCount: number;
  createdAt: number;
  updatedAt: number;
}

const CATEGORIES = [
  'Seasonal Rashan',
  'Grocery Guide',
  'Shopping Tips',
  'Pakistani Recipes',
  'Budgeting & Savings',
  'Market Intelligence',
  'General',
];

export const AdminCmsPage: React.FC = () => {
  const { token, admin } = useAdminAuth();
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<CmsArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [headingSize, setHeadingSize] = useState<'h1' | 'h2' | 'h3'>('h2');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState(admin?.name || 'Staff Editor');
  const [authorEmail, setAuthorEmail] = useState(admin?.email || 'admin@yaad.app');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  
  // Social Links
  const [fbUrl, setFbUrl] = useState('');
  const [igUrl, setIgUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [liUrl, setLiUrl] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [xUrl, setXUrl] = useState('');

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

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setHeadingSize('h2');
    setCategory(CATEGORIES[0]);
    setExcerpt('');
    setBody('');
    setCoverImageUrl('');
    setAuthorName(admin?.name || 'Staff Editor');
    setAuthorEmail(admin?.email || 'admin@yaad.app');
    setTagsInput('');
    setStatus('published');
    setFbUrl('');
    setIgUrl('');
    setTiktokUrl('');
    setLiUrl('');
    setYtUrl('');
    setXUrl('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (art: CmsArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setHeadingSize(art.headingSize || 'h2');
    setCategory(art.category || CATEGORIES[0]);
    setExcerpt(art.excerpt || '');
    setBody(art.body || '');
    setCoverImageUrl(art.coverImageUrl || '');
    setAuthorName(art.authorName || admin?.name || 'Staff Editor');
    setAuthorEmail(art.authorEmail || admin?.email || 'admin@yaad.app');
    setTagsInput((art.tags || []).join(', '));
    setStatus(art.status);
    setFbUrl(art.socialLinks?.facebook || '');
    setIgUrl(art.socialLinks?.instagram || '');
    setTiktokUrl(art.socialLinks?.tiktok || '');
    setLiUrl(art.socialLinks?.linkedin || '');
    setYtUrl(art.socialLinks?.youtube || '');
    setXUrl(art.socialLinks?.twitter || '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Article Title and Body content are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      headingSize,
      category,
      excerpt: excerpt.trim(),
      body: body.trim(),
      coverImageUrl: coverImageUrl.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      socialLinks: {
        facebook: fbUrl.trim() || undefined,
        instagram: igUrl.trim() || undefined,
        tiktok: tiktokUrl.trim() || undefined,
        linkedin: liUrl.trim() || undefined,
        youtube: ytUrl.trim() || undefined,
        twitter: xUrl.trim() || undefined,
      },
    };

    try {
      const endpoint = editingArticle
        ? `/api/admin/cms/articles/${editingArticle.id}`
        : '/api/admin/cms/articles';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article.');
      }

      setSuccessMsg(editingArticle ? 'Article updated successfully!' : 'New article published successfully!');
      adminCache.invalidatePrefix('/api/admin/cms');
      await fetchArticles(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, artTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${artTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/cms/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete article');
      }
      adminCache.invalidatePrefix('/api/admin/cms');
      fetchArticles(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight font-['Manrope'] flex items-center gap-2">
            <span>Grocery Guides &amp; Content CMS</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {total} Total
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Publish seasonal grocery guides, Pakistani recipe lists, and household budgeting tips with author credits &amp; social links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchArticles(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer shadow-2xs"
            title="Refresh articles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
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
            placeholder="Search guides, recipes or tags..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-700 focus:outline-none focus:border-[#003527]"
          >
            <option value="all">All Statuses ({total})</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Article Cards Grid */}
      {articles.length === 0 ? (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Zero Articles Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              No grocery guides match your criteria. Click below to compose and publish your first article.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Article</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-[#003527]/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Cover Image */}
              {art.coverImageUrl ? (
                <div className="h-40 w-full overflow-hidden bg-neutral-100 relative">
                  <img
                    src={art.coverImageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                        art.status === 'published'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                      {art.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-28 w-full bg-gradient-to-br from-emerald-900 to-[#003527] p-3 flex flex-col justify-between text-white relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider self-start bg-white/20 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full absolute top-3 right-3 ${
                      art.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-neutral-900'
                    }`}
                  >
                    {art.status}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  {art.excerpt && (
                    <p className="text-xs text-neutral-500 line-clamp-2">{art.excerpt}</p>
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-medium text-neutral-700">
                      <User className="w-3 h-3 text-neutral-400" />
                      {art.authorName || 'YAAD Staff'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {art.readTimeMinutes || 3} min read
                    </span>
                  </div>

                  {art.authorEmail && (
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 truncate">
                      <Mail className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{art.authorEmail}</span>
                    </div>
                  )}

                  {/* Social Handles Badges */}
                  {art.socialLinks && Object.values(art.socialLinks).some(Boolean) && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Channels:</span>
                      {art.socialLinks.facebook && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">FB</span>
                      )}
                      {art.socialLinks.instagram && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-semibold">IG</span>
                      )}
                      {art.socialLinks.tiktok && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-semibold">TikTok</span>
                      )}
                      {art.socialLinks.linkedin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">LinkedIn</span>
                      )}
                      {art.socialLinks.youtube && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold">YT</span>
                      )}
                      {art.socialLinks.twitter && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-900 font-semibold">X</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <Eye className="w-3 h-3" />
                    <span>{art.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(art)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-neutral-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(art.id, art.title)}
                      className="inline-flex items-center p-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                    {editingArticle ? 'Edit Grocery Guide / Article' : 'Create New Grocery Guide'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Share household tips, seasonal mandi guides, and Pakistani recipes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Ramadan Rashan Guide 2026: Complete Family Checklist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="ramadan-rashan-guide-2026"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Heading Size</label>
                    <select
                      value={headingSize}
                      onChange={(e) => setHeadingSize(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527] bg-white"
                    >
                      <option value="h1">Large Header (H1)</option>
                      <option value="h2">Medium Header (H2 - Recommended)</option>
                      <option value="h3">Compact Header (H3)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527] bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527] bg-white"
                  >
                    <option value="published">Published (Visible in App)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Cover Image / Screenshot URL</span>
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                />
                {coverImageUrl && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-neutral-200 w-44 bg-neutral-50">
                    <img
                      src={coverImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Short Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise summary explaining what shoppers will learn from this guide..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Article Body (Markdown supported) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="## Heading 2&#10;&#10;Write the guide contents here with bullet points, checklist items, and budgeting advice..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-mono text-[11px]"
                />
              </div>

              {/* Author Info */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Author Details</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-600 mb-1">Author Name</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Mudassir Bashir"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-600 mb-1">Author Email</label>
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="mudassirbashir530@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Official Social Media &amp; Sharing Links</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">Facebook Page</label>
                    <input
                      type="url"
                      value={fbUrl}
                      onChange={(e) => setFbUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">Instagram Profile</label>
                    <input
                      type="url"
                      value={igUrl}
                      onChange={(e) => setIgUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">TikTok Account</label>
                    <input
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={liUrl}
                      onChange={(e) => setLiUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">YouTube Video / Channel</label>
                    <input
                      type="url"
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-500 mb-0.5">X / Twitter</label>
                    <input
                      type="url"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Tags (Comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ramadan, Rashan, Rice, Budgeting, Sabzi"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#003527] text-white font-bold hover:bg-[#00281e] cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
