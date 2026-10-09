import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  MessageSquare,
  Copy,
  Check,
  Upload,
  Send,
  HelpCircle,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
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

export interface CmsComment {
  id: string;
  articleId: string;
  name: string;
  email?: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  reply?: string;
  repliedAt?: number;
  repliedBy?: string;
  createdAt: number;
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
  commentsCount?: number;
  comments?: CmsComment[];
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

export const OFFICIAL_SOCIAL_DEFAULTS = {
  facebook: 'https://www.facebook.com/yaadapppk/',
  instagram: 'https://www.instagram.com/yaadapppk/',
  youtube: 'https://www.youtube.com/@yaadapppk',
  linkedin: 'https://www.linkedin.com/in/yaadapppk/',
  tiktok: 'https://www.tiktok.com/@yaadapppk',
  twitter: 'https://x.com/yaadapppk',
};

export function formatArticleRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

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
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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

  // Official Social Links States
  const [includeOfficialSocial, setIncludeOfficialSocial] = useState(true);
  const [socialToggles, setSocialToggles] = useState({
    facebook: true,
    instagram: true,
    tiktok: true,
    linkedin: true,
    youtube: true,
    twitter: true,
  });
  const [fbUrl, setFbUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.facebook);
  const [igUrl, setIgUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.instagram);
  const [tiktokUrl, setTiktokUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.tiktok);
  const [liUrl, setLiUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.linkedin);
  const [ytUrl, setYtUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.youtube);
  const [xUrl, setXUrl] = useState(OFFICIAL_SOCIAL_DEFAULTS.twitter);

  // Cloudinary Guide State
  const [showCloudinaryGuide, setShowCloudinaryGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments Moderation Modal State
  const [commentsModalArticle, setCommentsModalArticle] = useState<CmsArticle | null>(null);
  const [articleComments, setArticleComments] = useState<CmsComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

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

  const copyShortLink = (artSlug: string) => {
    const fullLink = `${window.location.origin}/blog#${artSlug}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopiedSlug(artSlug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

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
    setIncludeOfficialSocial(true);
    setSocialToggles({
      facebook: true,
      instagram: true,
      tiktok: true,
      linkedin: true,
      youtube: true,
      twitter: true,
    });
    setFbUrl(OFFICIAL_SOCIAL_DEFAULTS.facebook);
    setIgUrl(OFFICIAL_SOCIAL_DEFAULTS.instagram);
    setTiktokUrl(OFFICIAL_SOCIAL_DEFAULTS.tiktok);
    setLiUrl(OFFICIAL_SOCIAL_DEFAULTS.linkedin);
    setYtUrl(OFFICIAL_SOCIAL_DEFAULTS.youtube);
    setXUrl(OFFICIAL_SOCIAL_DEFAULTS.twitter);
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

    const links = art.socialLinks || {};
    const hasAnySocial = Object.values(links).some(Boolean);
    setIncludeOfficialSocial(hasAnySocial);
    setSocialToggles({
      facebook: Boolean(links.facebook),
      instagram: Boolean(links.instagram),
      tiktok: Boolean(links.tiktok),
      linkedin: Boolean(links.linkedin),
      youtube: Boolean(links.youtube),
      twitter: Boolean(links.twitter),
    });
    setFbUrl(links.facebook || OFFICIAL_SOCIAL_DEFAULTS.facebook);
    setIgUrl(links.instagram || OFFICIAL_SOCIAL_DEFAULTS.instagram);
    setTiktokUrl(links.tiktok || OFFICIAL_SOCIAL_DEFAULTS.tiktok);
    setLiUrl(links.linkedin || OFFICIAL_SOCIAL_DEFAULTS.linkedin);
    setYtUrl(links.youtube || OFFICIAL_SOCIAL_DEFAULTS.youtube);
    setXUrl(links.twitter || OFFICIAL_SOCIAL_DEFAULTS.twitter);

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

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCoverImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Article Title and Body content are required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const socialLinksPayload = includeOfficialSocial
      ? {
          facebook: socialToggles.facebook ? fbUrl.trim() || undefined : undefined,
          instagram: socialToggles.instagram ? igUrl.trim() || undefined : undefined,
          tiktok: socialToggles.tiktok ? tiktokUrl.trim() || undefined : undefined,
          linkedin: socialToggles.linkedin ? liUrl.trim() || undefined : undefined,
          youtube: socialToggles.youtube ? ytUrl.trim() || undefined : undefined,
          twitter: socialToggles.twitter ? xUrl.trim() || undefined : undefined,
        }
      : undefined;

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
      socialLinks: socialLinksPayload,
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

      setSuccessMsg(editingArticle ? 'Article updated successfully!' : 'New article published successfully and is live in the app!');
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

  // Open Comments Modal
  const openCommentsModal = async (art: CmsArticle) => {
    setCommentsModalArticle(art);
    setIsLoadingComments(true);
    setArticleComments(art.comments || []);
    try {
      const res = await fetch(`/api/admin/cms/articles/${art.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setArticleComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!commentsModalArticle) return;
    const reply = replyInputs[commentId]?.trim();
    if (!reply) return;

    setSubmittingReplyId(commentId);
    try {
      const res = await fetch(`/api/admin/cms/articles/${commentsModalArticle.id}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        setArticleComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  reply,
                  repliedAt: Date.now(),
                  repliedBy: admin?.name || 'YAAD Team',
                }
              : c
          )
        );
        setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      } else {
        const err = await res.json();
        alert(`Failed to reply: ${err.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error replying: ${err.message}`);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentsModalArticle) return;
    if (!window.confirm('Delete this comment permanently?')) return;

    try {
      const res = await fetch(`/api/admin/cms/articles/${commentsModalArticle.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setArticleComments((prev) => prev.filter((c) => c.id !== commentId));
        // Also update local articles list commentsCount
        setArticles((prev) =>
          prev.map((a) =>
            a.id === commentsModalArticle.id
              ? { ...a, commentsCount: Math.max(0, (a.commentsCount || 1) - 1) }
              : a
          )
        );
      }
    } catch (err: any) {
      alert(`Failed to delete comment: ${err.message}`);
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
            Publish seasonal grocery guides and Pakistani recipe lists. All published articles are instantly live in the app with direct short links.
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
            <option value="published">Published (Live in App)</option>
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
              {/* Short Link Bar at top of Card */}
              <div className="px-3.5 py-2 bg-neutral-50/90 border-b border-neutral-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-neutral-600 truncate font-mono text-[10.5px]">
                  <LinkIcon className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">/blog#{art.slug}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyShortLink(art.slug)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-neutral-200 hover:bg-neutral-100 text-[10px] font-bold text-neutral-600 cursor-pointer shadow-2xs"
                    title="Copy short link"
                  >
                    {copiedSlug === art.slug ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`/blog#${art.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold text-[#003527] cursor-pointer shadow-2xs"
                    title="Open live article in app"
                  >
                    <span>View</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

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
                      {art.status === 'published' ? 'Live in App' : 'Draft'}
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
                    {art.status === 'published' ? 'Live in App' : 'Draft'}
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

                <div className="space-y-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-medium text-neutral-700">
                      <User className="w-3 h-3 text-neutral-400" />
                      {art.authorName || 'YAAD Staff'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-neutral-400">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {formatArticleRelativeTime(art.publishedAt || art.createdAt)}
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
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Official:</span>
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

                {/* Card Actions & Comments Count */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  {/* Comments Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => openCommentsModal(art)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold cursor-pointer transition-colors"
                    title="View and reply to reader comments"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-700" />
                    <span>{art.commentsCount ?? art.comments?.length ?? 0} Comments</span>
                  </button>

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

      {/* ============================================================== */}
      {/* Comments Moderation & Reply Modal                              */}
      {/* ============================================================== */}
      {commentsModalArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                    Comments on Guide
                  </h3>
                  <p className="text-[11px] text-neutral-500 truncate max-w-xs sm:max-w-md">
                    {commentsModalArticle.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCommentsModalArticle(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {isLoadingComments ? (
                <div className="py-12 text-center text-neutral-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading reader comments...</span>
                </div>
              ) : articleComments.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-neutral-700">No comments yet</p>
                  <p className="text-neutral-400 text-[11px] max-w-xs mx-auto">
                    When readers post advice, tips, or questions from the app article page, they will appear here.
                  </p>
                </div>
              ) : (
                articleComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">{comment.name}</span>
                        {comment.email && (
                          <span className="text-[10px] text-neutral-400">({comment.email})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-400">
                          {formatArticleRelativeTime(comment.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-neutral-700 text-xs leading-relaxed bg-white p-2.5 rounded-xl border border-neutral-100">
                      {comment.content}
                    </p>

                    {/* Existing Admin Reply */}
                    {comment.reply && (
                      <div className="pl-3 border-l-2 border-[#003527] bg-emerald-50/60 p-2.5 rounded-r-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#003527]">
                            Reply from {comment.repliedBy || 'YAAD Team'}
                          </span>
                          {comment.repliedAt && (
                            <span className="text-neutral-400">
                              {formatArticleRelativeTime(comment.repliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-800 text-xs">{comment.reply}</p>
                      </div>
                    )}

                    {/* Inline Reply Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyInputs[comment.id] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                        }
                        placeholder={comment.reply ? 'Update reply...' : 'Write an official reply...'}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs focus:outline-none focus:border-[#003527]"
                      />
                      <button
                        type="button"
                        disabled={submittingReplyId === comment.id || !replyInputs[comment.id]?.trim()}
                        onClick={() => handleReplySubmit(comment.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                      >
                        {submittingReplyId === comment.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-neutral-100 flex justify-end bg-neutral-50/50">
              <button
                type="button"
                onClick={() => setCommentsModalArticle(null)}
                className="px-4 py-2 rounded-xl bg-neutral-200 text-neutral-800 font-bold text-xs hover:bg-neutral-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Create / Edit Article Modal                                    */}
      {/* ============================================================== */}
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
                    Publish guides with direct editable short links, author credits, and official social channels.
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

              {/* Title & Editable Short Link Slug */}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-700">Editable Short Link Slug</label>
                      <span className="text-[10px] text-emerald-700 font-mono">yaad.app/blog#{slug || 'slug'}</span>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="ramadan-rashan-guide-2026"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-mono text-[11px] focus:outline-none focus:border-[#003527]"
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
                    <option value="published">Published (Instantly Live in App)</option>
                    <option value="draft">Draft (Private in Admin)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL & Upload from Computer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Cover Image (URL or Upload)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCloudinaryGuide(!showCloudinaryGuide)}
                    className="text-[11px] text-emerald-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Cloudinary مفت 25GB رہنمائی</span>
                  </button>
                </div>

                {/* Cloudinary Step-by-Step Helper Banner */}
                {showCloudinaryGuide && (
                  <div className="mb-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-[11.5px] leading-relaxed">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>Cloudinary پر فری اکاؤنٹ سیٹ اپ کرنے کا آسان طریقہ:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-emerald-900">
                      <li>
                        <strong>cloudinary.com</strong> کھولیں اور فری سائن اپ کریں۔
                      </li>
                      <li>
                        ڈیش بورڈ پر جا کر اپنا <strong>Cloud Name</strong> دیکھیں (جیسے yaad-cloud)۔
                      </li>
                      <li>
                        اوپر دائیں طرف سیٹنگز (Settings ⚙️) پر کلک کریں ➔ <strong>Upload</strong> پر جائیں۔
                      </li>
                      <li>
                        نیچے سکرول کر کے <strong>Add upload preset</strong> پر کلک کریں۔
                      </li>
                      <li>
                        Signing Mode کو <strong>Unsigned</strong> سلیکٹ کریں اور Save کر دیں۔
                      </li>
                      <li>
                        اب آپ کسی بھی تصویر کو ایک کلک میں اپلوڈ کر کے اس کا لنک یہاں لگا سکتے ہیں۔
                      </li>
                    </ol>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="Paste image URL (Unsplash, Cloudinary, etc.)"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>

                {coverImageUrl && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-20 w-36 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-2xs">
                      <img
                        src={coverImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Remove Image
                    </button>
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
                  Article Body (Markdown, Headings &amp; Bullet Points supported) <span className="text-red-500">*</span>
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

              {/* Official Social Media Channels with Master and Individual Toggles */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Official Social Media &amp; Sharing Channels</span>
                  </span>
                  {/* Master Toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[11px] font-semibold text-neutral-600">
                      {includeOfficialSocial ? 'All Channels Active' : 'Channels Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={includeOfficialSocial}
                      onChange={(e) => setIncludeOfficialSocial(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-4.5 rounded-full transition-colors relative ${
                        includeOfficialSocial ? 'bg-[#003527]' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          includeOfficialSocial ? 'left-4' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                <p className="text-[11px] text-neutral-500">
                  Pre-filled with verified YAAD official links. Content writers do not need to copy-paste URLs manually. Turn individual channels on/off below:
                </p>

                {includeOfficialSocial && (
                  <div className="space-y-2.5 pt-1">
                    {/* Facebook */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.facebook}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, facebook: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>Facebook</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.facebook}
                        value={fbUrl}
                        onChange={(e) => setFbUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.facebook}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.instagram}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, instagram: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>Instagram</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.instagram}
                        value={igUrl}
                        onChange={(e) => setIgUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.instagram}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>

                    {/* YouTube */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.youtube}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, youtube: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>YouTube</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.youtube}
                        value={ytUrl}
                        onChange={(e) => setYtUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.youtube}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.linkedin}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, linkedin: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>LinkedIn</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.linkedin}
                        value={liUrl}
                        onChange={(e) => setLiUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.linkedin}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>

                    {/* TikTok */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.tiktok}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, tiktok: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>TikTok</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.tiktok}
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.tiktok}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>

                    {/* X / Twitter */}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 w-28 shrink-0 cursor-pointer text-[11px] font-medium text-neutral-700">
                        <input
                          type="checkbox"
                          checked={socialToggles.twitter}
                          onChange={(e) =>
                            setSocialToggles((prev) => ({ ...prev, twitter: e.target.checked }))
                          }
                          className="rounded border-neutral-300 text-[#003527] focus:ring-[#003527]"
                        />
                        <span>X (Twitter)</span>
                      </label>
                      <input
                        type="url"
                        disabled={!socialToggles.twitter}
                        value={xUrl}
                        onChange={(e) => setXUrl(e.target.value)}
                        placeholder={OFFICIAL_SOCIAL_DEFAULTS.twitter}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] disabled:bg-neutral-100 disabled:text-neutral-400"
                      />
                    </div>
                  </div>
                )}
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
