import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  AlertTriangle,
  MessageSquare,
  Copy,
  Check,
  Upload,
  Send,
  HelpCircle,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  ListOrdered,
  CalendarClock,
  FileSpreadsheet,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';
import { validateArticleSeoGate } from '../../../server/admin/seoValidator';

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
  coverImageAlt?: string;
  authorName: string;
  authorEmail?: string;
  category: string;
  tags: string[];
  socialLinks?: SocialLinks;
  commentsCount?: number;
  comments?: CmsComment[];
  status: 'draft' | 'published';
  publishedAt?: number;
  scheduledFor?: number;
  readTimeMinutes: number;
  viewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  searchIntent?: 'informational' | 'list' | 'comparison' | 'template';
  cluster?: string;
  quickAnswer?: string;
  keyTakeaways?: string[];
  faqs?: { q: string; a: string }[];
  hashtags?: string[];
  relatedSlugs?: string[];
  queueStatus?: 'idea' | 'draft_ready' | 'scheduled' | 'published' | 'needs_review';
  publishDate?: string;
  priority?: number;
  wordCount?: number;
  sourceSet?: string;
  needsReviewReasons?: string[];
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

export function compressDataUrl(dataUrl: string, maxWidth = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxWidth) {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function compressImageFile(file: File, maxWidth = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) {
        resolve('');
        return;
      }
      compressDataUrl(raw, maxWidth, quality).then(resolve);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

  // Cloudinary Guide & Direct Upload State
  const [showCloudinaryGuide, setShowCloudinaryGuide] = useState(false);
  const [cloudName, setCloudName] = useState(() => localStorage.getItem('yaad_cloudinary_cloud_name') || '');
  const [uploadPreset, setUploadPreset] = useState(() => localStorage.getItem('yaad_cloudinary_upload_preset') || 'yaad_preset');
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments Moderation Modal State
  const [commentsModalArticle, setCommentsModalArticle] = useState<CmsArticle | null>(null);
  const [articleComments, setArticleComments] = useState<CmsComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // View Navigation: 'library' | 'queue' | 'import'
  const [activeTab, setActiveTab] = useState<'library' | 'queue' | 'import'>('library');

  // Daily Auto-Publish State
  const [isAutoPublishing, setIsAutoPublishing] = useState(false);
  const [publishReport, setPublishReport] = useState<{
    targetDate: string;
    published: Array<{ id: string; title: string; slug: string; url: string }>;
    blocked: Array<{ id: string; title: string; slug: string; reasons: string[] }>;
    totalAttempted: number;
    totalPublished: number;
    totalBlocked: number;
  } | null>(null);

  // Queue Scheduling Settings
  const [articlesPerDay, setArticlesPerDay] = useState(2);
  const [isSchedulingQueue, setIsSchedulingQueue] = useState(false);

  // Idea Bank Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDryRun, setImportDryRun] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success?: boolean;
    imported: number;
    skippedDuplicates: number;
    persistedCount?: number;
    totalInSystemAfter?: number;
    errors: string[];
    dryRun?: boolean;
    code?: string;
  } | null>(null);

  // Extended SEO Form Fields (Phase 1 & 3)
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [cluster, setCluster] = useState('Monthly Rashan');
  const [searchIntent, setSearchIntent] = useState<'informational' | 'list' | 'comparison' | 'template'>('informational');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [keyTakeawaysText, setKeyTakeawaysText] = useState('');
  const [faqsList, setFaqsList] = useState<Array<{ q: string; a: string }>>([
    { q: '', a: '' },
  ]);
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [relatedSlugsInput, setRelatedSlugsInput] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [priorityNum, setPriorityNum] = useState<number>(100);
  const [queueStatus, setQueueStatus] = useState<'idea' | 'draft_ready' | 'scheduled' | 'published' | 'needs_review'>('draft_ready');

  const fetchArticles = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!token) return;
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const url = `/api/admin/cms/articles?${params.toString()}`;
      const headers = { Authorization: `Bearer ${token}` };

      try {
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
      } catch (err) {
        console.error('[AdminCmsPage] Failed to fetch articles:', err);
      } finally {
        setIsLoading(false);
      }
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

    // Reset extended SEO fields
    setSeoTitle('');
    setSeoDescription('');
    setFocusKeyword('');
    setCoverImageAlt('');
    setOgImageUrl('');
    setCanonicalUrl('');
    setCluster('Monthly Rashan');
    setSearchIntent('informational');
    setQuickAnswer('');
    setKeyTakeawaysText('');
    setFaqsList([{ q: '', a: '' }]);
    setHashtagsInput('');
    setRelatedSlugsInput('');
    setPublishDate('');
    setPriorityNum(100);
    setQueueStatus('draft_ready');

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

    // Populate extended SEO fields
    setSeoTitle(art.seoTitle || art.title);
    setSeoDescription(art.seoDescription || art.excerpt || '');
    setFocusKeyword(art.focusKeyword || '');
    setCoverImageAlt(art.coverImageAlt || '');
    setOgImageUrl(art.ogImageUrl || art.coverImageUrl || '');
    setCanonicalUrl(art.canonicalUrl || `/blog/${art.slug}`);
    setCluster(art.cluster || 'Monthly Rashan');
    setSearchIntent(art.searchIntent || 'informational');
    setQuickAnswer(art.quickAnswer || '');
    setKeyTakeawaysText((art.keyTakeaways || []).join('\n'));
    setFaqsList(art.faqs && art.faqs.length > 0 ? art.faqs : [{ q: '', a: '' }]);
    setHashtagsInput((art.hashtags || []).join(', '));
    setRelatedSlugsInput((art.relatedSlugs || []).join(', '));
    setPublishDate(art.publishDate || '');
    setPriorityNum(art.priority !== undefined ? art.priority : 100);
    setQueueStatus(art.queueStatus || (art.status === 'published' ? 'published' : 'draft_ready'));

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
      if (!seoTitle || seoTitle === title) {
        setSeoTitle(val.length <= 60 ? val : val.slice(0, 57) + '...');
      }
    }
  };

  const handleUploadTodayArticlesAutomatically = async () => {
    if (!token) return;
    setIsAutoPublishing(true);
    try {
      const res = await fetch('/api/admin/cms/articles/publish-today', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ limit: articlesPerDay }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auto-publishing failed');
      }
      setPublishReport(data);
      adminCache.invalidatePrefix('/api/admin/cms');
      await fetchArticles(true);
    } catch (err: any) {
      alert(`Auto-publish error: ${err.message}`);
    } finally {
      setIsAutoPublishing(false);
    }
  };

  const handleAutoScheduleQueue = async () => {
    if (!token) return;
    setIsSchedulingQueue(true);
    try {
      const res = await fetch('/api/admin/cms/articles/auto-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articlesPerDay }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auto-scheduling failed');
      }
      alert(`Auto-scheduled ${data.scheduledCount} articles across ${data.datesCount || data.scheduledDates?.length || 0} publishing days.`);
      adminCache.invalidatePrefix('/api/admin/cms');
      await fetchArticles(true);
    } catch (err: any) {
      alert(`Schedule error: ${err.message}`);
    } finally {
      setIsSchedulingQueue(false);
    }
  };

  const handleImportBank = async (useDefault = false) => {
    if (!token) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      let bodyData: any = { dryRun: importDryRun };
      if (!useDefault && importFile) {
        const text = await importFile.text();
        if (importFile.name.endsWith('.json')) {
          bodyData.items = JSON.parse(text);
        } else {
          bodyData.csvContent = text;
        }
      }

      const res = await fetch('/api/admin/cms/articles/import-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        setImportResult({
          imported: data.imported || 0,
          skippedDuplicates: data.skippedDuplicates || 0,
          persistedCount: data.persistedCount || 0,
          totalInSystemAfter: total,
          errors: [data.error || 'Import request failed'],
          code: data.code,
          success: false,
          dryRun: importDryRun,
        });
        return;
      }

      setImportResult(data);
      if (!importDryRun) {
        adminCache.invalidatePrefix('/api/admin/cms');
        await fetchArticles(true);
      }
    } catch (err: any) {
      setImportResult({
        imported: 0,
        skippedDuplicates: 0,
        persistedCount: 0,
        totalInSystemAfter: total,
        errors: [`Request failed: ${err.message}`],
        success: false,
        dryRun: importDryRun,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handlePriorityChange = async (art: CmsArticle, delta: number) => {
    if (!token) return;
    const newPriority = Math.max(1, (art.priority ?? 100) + delta);
    try {
      const res = await fetch(`/api/admin/cms/articles/${art.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, priority: newPriority } : a))
        );
      }
    } catch (err: any) {
      console.error('Failed to change priority', err);
    }
  };

  const handlePublishDateChange = async (art: CmsArticle, newDate: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/cms/articles/${art.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          publishDate: newDate,
          queueStatus: newDate ? 'scheduled' : 'draft_ready',
        }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, publishDate: newDate, queueStatus: newDate ? 'scheduled' : 'draft_ready' } : a))
        );
      }
    } catch (err: any) {
      console.error('Failed to update date', err);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    const currentCloudName = cloudName.trim();
    const currentPreset = uploadPreset.trim() || 'yaad_preset';

    // If Cloudinary Cloud Name is set, upload directly to Cloudinary using unsigned preset!
    if (currentCloudName) {
      setIsUploadingToCloudinary(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', currentPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${currentCloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
        }

        if (data.secure_url) {
          setCoverImageUrl(data.secure_url);
          setIsUploadingToCloudinary(false);
          return;
        }
      } catch (err: any) {
        console.warn('Cloudinary upload warning:', err.message);
        alert(`Cloudinary notice: ${err.message}. Using direct local image preview.`);
      } finally {
        setIsUploadingToCloudinary(false);
      }
    }

    // Direct Compressed Fallback (Brings multi-MB photos down to ~70KB to prevent 413)
    try {
      const compressed = await compressImageFile(file, 1200, 0.78);
      setCoverImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) setCoverImageUrl(base64);
      };
      reader.readAsDataURL(file);
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

    // Auto-compress large Base64 cover images if present to ensure payload never exceeds server limits
    let finalCoverImageUrl = coverImageUrl.trim();
    if (finalCoverImageUrl.startsWith('data:image/') && finalCoverImageUrl.length > 250000) {
      try {
        finalCoverImageUrl = await compressDataUrl(finalCoverImageUrl, 1200, 0.75);
      } catch (err) {
        console.warn('Image auto-compression notice:', err);
      }
    }

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
      coverImageUrl: finalCoverImageUrl,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      socialLinks: socialLinksPayload,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || excerpt.trim(),
      focusKeyword: focusKeyword.trim(),
      coverImageAlt: coverImageAlt.trim(),
      ogImageUrl: ogImageUrl.trim() || finalCoverImageUrl,
      canonicalUrl: canonicalUrl.trim() || `/blog/${slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      cluster: cluster.trim(),
      searchIntent,
      quickAnswer: quickAnswer.trim(),
      keyTakeaways: keyTakeawaysText.split('\n').map((l) => l.trim()).filter(Boolean),
      faqs: faqsList.filter((f) => f.q.trim() && f.a.trim()),
      hashtags: hashtagsInput.split(',').map((h) => h.trim().replace(/^#/, '')).filter(Boolean),
      relatedSlugs: relatedSlugsInput.split(',').map((s) => s.trim().replace(/^\/blog\//, '')).filter(Boolean),
      publishDate: publishDate || undefined,
      priority: Number(priorityNum) || 100,
      queueStatus,
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

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        const text = await res.text();
        if (res.status === 413) {
          throw new Error('Image or article content exceeds server size limit (HTTP 413 Payload Too Large). Please upload a smaller image or connect Cloudinary.');
        }
        throw new Error(text.slice(0, 150) || `Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Failed to save article (${res.status}).`);
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

  const currentSlugsSet = useMemo(() => new Set(articles.map((a) => a.slug)), [articles]);

  const seoChecklist = useMemo(() => {
    return validateArticleSeoGate(
      {
        title,
        slug,
        body,
        quickAnswer,
        seoTitle,
        seoDescription,
        focusKeyword,
        coverImageUrl,
        coverImageAlt,
        hashtags: hashtagsInput.split(',').map((h) => h.trim().replace(/^#/, '')).filter(Boolean),
        relatedSlugs: relatedSlugsInput.split(',').map((s) => s.trim().replace(/^\/blog\//, '')).filter(Boolean),
      },
      currentSlugsSet
    );
  }, [
    title,
    slug,
    body,
    quickAnswer,
    seoTitle,
    seoDescription,
    focusKeyword,
    coverImageUrl,
    coverImageAlt,
    hashtagsInput,
    relatedSlugsInput,
    currentSlugsSet,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-[#003527] to-[#002219] rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                SEO Content Pipeline
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                {total} Articles in System
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Manrope']">
              In-App Articles &amp; SEO Auto-Upload
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              256-idea bank scheduled queue, 1-click daily publishing gate, verified feature claims, and public indexable article pages.
            </p>
          </div>

          {/* Prominent Daily Auto-Upload Button */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleUploadTodayArticlesAutomatically}
              disabled={isAutoPublishing}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              title="Publish today's scheduled batch passing all SEO checks"
            >
              <Sparkles className={`w-4 h-4 text-emerald-900 ${isAutoPublishing ? 'animate-spin' : ''}`} />
              <span>{isAutoPublishing ? 'Publishing Today’s Batch...' : "Upload Today's Articles Automatically"}</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-all border border-white/15"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
            <button
              type="button"
              onClick={() => fetchArticles(true)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all border border-white/15"
              title="Refresh articles"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Article Library</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
              {articles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Publishing Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700/40 text-emerald-200">
              {articles.filter((a) => a.queueStatus === 'scheduled' || a.queueStatus === 'draft_ready').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Idea Bank (256)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Auto-Publish Results Modal / Report                           */}
      {/* ============================================================== */}
      {publishReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">Daily Auto-Upload Report</h3>
                  <p className="text-xs text-neutral-500">Date: {publishReport.targetDate}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPublishReport(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-[11px] font-bold text-neutral-500 uppercase">Attempted</span>
                <p className="text-xl font-black text-neutral-800 mt-0.5">{publishReport.totalAttempted}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Published</span>
                <p className="text-xl font-black text-emerald-800 mt-0.5">{publishReport.totalPublished}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-700 uppercase">Blocked</span>
                <p className="text-xl font-black text-amber-800 mt-0.5">{publishReport.totalBlocked}</p>
              </div>
            </div>

            {/* Published List */}
            {publishReport.published.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Published Successfully (Live Now)</span>
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {publishReport.published.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-emerald-950 truncate max-w-[280px]">{p.title}</span>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                      >
                        <span>View Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked List */}
            {publishReport.blocked.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Blocked by Pre-Publish Gate</span>
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {publishReport.blocked.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1"
                    >
                      <p className="font-bold text-amber-950">{b.title}</p>
                      <ul className="list-disc list-inside text-[11px] text-amber-900/80 space-y-0.5">
                        {b.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {publishReport.totalAttempted === 0 && (
              <div className="p-4 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-500">
                No articles were scheduled for today ({publishReport.targetDate}). Visit the <strong>Publishing Queue</strong> tab to schedule or auto-schedule upcoming articles.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPublishReport(null)}
                className="px-5 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ARTICLE LIBRARY                                         */}
      {/* ============================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-6">
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
                <option value="draft">Drafts / Queued</option>
              </select>
            </div>
          </div>

          {/* Article Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 bg-neutral-200 rounded-md w-28" />
                    <div className="h-4 bg-neutral-200 rounded-full w-14" />
                  </div>
                  <div className="h-5 bg-neutral-200 rounded-md w-4/5" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-neutral-100 rounded-md w-full" />
                    <div className="h-3.5 bg-neutral-100 rounded-md w-3/4" />
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="h-3.5 bg-neutral-100 rounded w-20" />
                    <div className="h-6 bg-neutral-200 rounded-lg w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
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
                      <span className="truncate">/blog/{art.slug}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyShortLink(art.slug)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-neutral-200 hover:bg-neutral-100 text-[10px] font-bold text-neutral-600 cursor-pointer shadow-2xs"
                        title="Copy article link"
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
                        href={`/blog/${art.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold text-[#003527] cursor-pointer shadow-2xs"
                        title="Open live article page"
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
                        alt={art.coverImageAlt || art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
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

                      {art.queueStatus && (
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="font-bold text-neutral-400 uppercase">Queue:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                              art.queueStatus === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : art.queueStatus === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : art.queueStatus === 'needs_review'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {art.queueStatus}
                          </span>
                          {art.publishDate && <span>📅 {art.publishDate}</span>}
                        </div>
                      )}
                    </div>

                    {/* Card Actions & Comments Count */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => openCommentsModal(art)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold cursor-pointer transition-colors"
                        title="View and reply to reader comments"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-700" />
                        <span>{art.commentsCount ?? art.comments?.length ?? 0}</span>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PUBLISHING QUEUE & SCHEDULER VIEW                       */}
      {/* ============================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#003527]" />
                <span>Publishing Queue &amp; Auto-Scheduler</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Organize draft articles by publish date and priority. The daily button publishes today's batch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="font-bold text-neutral-600">Articles / day:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={articlesPerDay}
                  onChange={(e) => setArticlesPerDay(Math.max(1, parseInt(e.target.value) || 2))}
                  className="w-12 px-1.5 py-0.5 rounded border border-neutral-300 font-bold text-center text-xs focus:outline-none focus:border-[#003527]"
                />
              </div>

              <button
                type="button"
                onClick={handleAutoScheduleQueue}
                disabled={isSchedulingQueue}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CalendarClock className={`w-3.5 h-3.5 ${isSchedulingQueue ? 'animate-spin' : ''}`} />
                <span>{isSchedulingQueue ? 'Auto-Scheduling...' : 'Auto-schedule queue'}</span>
              </button>
            </div>
          </div>

          {/* Queue Status Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider">Scheduled</span>
              <p className="text-xl font-black text-blue-700 mt-0.5">
                {articles.filter((a) => a.queueStatus === 'scheduled').length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider">Draft Ready</span>
              <p className="text-xl font-black text-purple-700 mt-0.5">
                {articles.filter((a) => a.queueStatus === 'draft_ready').length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider">Needs Review</span>
              <p className="text-xl font-black text-red-600 mt-0.5">
                {articles.filter((a) => a.queueStatus === 'needs_review').length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider">Published</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {articles.filter((a) => a.queueStatus === 'published' || a.status === 'published').length}
              </p>
            </div>
          </div>

          {/* Scheduled by Date */}
          {(() => {
            const scheduled = articles
              .filter((a) => a.queueStatus === 'scheduled' || a.queueStatus === 'needs_review')
              .sort((a, b) => {
                const dateCmp = (a.publishDate || '9999').localeCompare(b.publishDate || '9999');
                if (dateCmp !== 0) return dateCmp;
                return (a.priority ?? 100) - (b.priority ?? 100);
              });

            if (isLoading) {
              return (
                <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 space-y-4 animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-48" />
                  <div className="space-y-3">
                    <div className="h-16 bg-neutral-100 rounded-xl w-full" />
                    <div className="h-16 bg-neutral-100 rounded-xl w-full" />
                  </div>
                </div>
              );
            }

            if (scheduled.length === 0) {
              return (
                <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center space-y-3">
                  <CalendarClock className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="text-sm font-bold text-neutral-700">No scheduled articles in the queue</p>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    Click <strong>Auto-schedule queue</strong> above to automatically assign publishing dates to draft articles at {articlesPerDay} articles per day.
                  </p>
                </div>
              );
            }

            // Group by publishDate
            const datesMap: Record<string, CmsArticle[]> = {};
            for (const art of scheduled) {
              const d = art.publishDate || 'No Date';
              if (!datesMap[d]) datesMap[d] = [];
              datesMap[d].push(art);
            }

            return (
              <div className="space-y-6">
                {Object.entries(datesMap).map(([pDate, groupArticles]) => (
                  <div key={pDate} className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                          Publish Date: {pDate}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {groupArticles.length} Article{groupArticles.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {groupArticles.map((art) => (
                        <div key={art.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  art.queueStatus === 'needs_review'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {art.queueStatus}
                              </span>
                              {art.cluster && (
                                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                                  {art.cluster}
                                </span>
                              )}
                              {art.searchIntent && (
                                <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                                  {art.searchIntent}
                                </span>
                              )}
                              <span className="text-[10px] text-neutral-400">
                                {art.wordCount || (art.body ? art.body.trim().split(/\s+/).length : 0)} words
                              </span>
                            </div>

                            <h4 className="font-bold text-neutral-900 text-sm truncate">{art.title}</h4>

                            {art.needsReviewReasons && art.needsReviewReasons.length > 0 && (
                              <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg space-y-0.5 border border-red-200">
                                <span className="font-bold">Failing Pre-Publish Checks:</span>
                                <ul className="list-disc list-inside">
                                  {art.needsReviewReasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Reordering & Date Controls */}
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {/* Priority Reordering Buttons */}
                            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                              <span className="text-[11px] font-bold text-neutral-500 px-1.5" title="Priority order">
                                #{art.priority ?? 100}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePriorityChange(art, -1)}
                                className="p-1 rounded-lg bg-white hover:bg-neutral-200 text-neutral-700 cursor-pointer shadow-2xs"
                                title="Move up in priority"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePriorityChange(art, 1)}
                                className="p-1 rounded-lg bg-white hover:bg-neutral-200 text-neutral-700 cursor-pointer shadow-2xs"
                                title="Move down in priority"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Per-Article Date Picker */}
                            <input
                              type="date"
                              value={art.publishDate || ''}
                              onChange={(e) => handlePublishDateChange(art, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 focus:outline-none focus:border-[#003527]"
                            />

                            <button
                              type="button"
                              onClick={() => openEditModal(art)}
                              className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: IMPORT IDEA BANK (256)                                 */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
          <div className="space-y-1.5">
            <h3 className="font-bold text-neutral-900 text-base sm:text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#003527]" />
              <span>Import 256-Idea Bank into CMS Queue</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Upload or auto-load the 256 SEO article ideas. Title and slug deduplication is enforced automatically. Running import twice is completely idempotent (0 duplicates added).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700">
                Option A: Choose Bank CSV / JSON File
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#003527] file:text-white hover:file:bg-[#00281e] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Option B: Use built-in bank file</span>
              <button
                type="button"
                onClick={() => handleImportBank(true)}
                disabled={isImporting}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs hover:bg-emerald-200 cursor-pointer disabled:opacity-50"
              >
                Auto-Load built-in 256 Bank
              </button>
            </div>
          </div>

          {/* Dry Run Toggle */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="dryRunToggle"
              checked={importDryRun}
              onChange={(e) => setImportDryRun(e.target.checked)}
              className="w-4 h-4 rounded text-[#003527] focus:ring-[#003527]"
            />
            <label htmlFor="dryRunToggle" className="text-xs font-bold text-neutral-700 cursor-pointer">
              Dry-run mode (calculate counts and verify deduplication without writing to database)
            </label>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleImportBank(false)}
              disabled={isImporting || (!importFile && !importDryRun)}
              className="px-6 py-3 rounded-xl bg-[#003527] text-white font-bold text-xs sm:text-sm hover:bg-[#00281e] cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isImporting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{isImporting ? 'Importing Bank...' : importDryRun ? 'Run Import Dry-Run' : 'Import File into Queue'}</span>
            </button>
          </div>

          {/* Import Result Summary */}
          {importResult && (() => {
            const isPersistenceFailed =
              !importResult.dryRun &&
              (importResult.success === false ||
                (importResult.persistedCount !== undefined && importResult.persistedCount < importResult.imported) ||
                importResult.errors.length > 0);

            return (
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isPersistenceFailed
                    ? 'bg-red-50/80 border-red-300 text-red-950'
                    : importResult.dryRun
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    {isPersistenceFailed ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>
                          {importResult.code === 'BANK_FILE_NOT_FOUND'
                            ? 'Bank File Not Found (BANK_FILE_NOT_FOUND)'
                            : importResult.persistedCount === 0 && importResult.imported > 0
                            ? 'Import Failed — Supabase Persistence Incomplete'
                            : 'Import Completed With Persistence Warnings'}
                        </span>
                      </>
                    ) : importResult.dryRun ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>Import Summary (Dry Run Simulation — No DB Writes)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>Import Summary (Saved to Supabase Database)</span>
                      </>
                    )}
                  </h4>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isPersistenceFailed
                        ? 'bg-red-200 text-red-900'
                        : importResult.dryRun
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isPersistenceFailed ? 'Action Required' : importResult.dryRun ? 'Dry Run' : 'Persisted'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                    <span className="text-neutral-500 font-medium">Unique Ideas:</span>
                    <p className="text-lg font-black text-neutral-900 mt-0.5">{importResult.imported}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                    <span className="text-neutral-500 font-medium">Persisted to DB:</span>
                    <p
                      className={`text-lg font-black mt-0.5 ${
                        !importResult.dryRun && importResult.persistedCount !== undefined && importResult.persistedCount < importResult.imported
                          ? 'text-red-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {importResult.dryRun ? '0 (Simulated)' : (importResult.persistedCount ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                    <span className="text-neutral-500 font-medium">Duplicates Skipped:</span>
                    <p className="text-lg font-black text-amber-700 mt-0.5">{importResult.skippedDuplicates}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                    <span className="text-neutral-500 font-medium">Total In System:</span>
                    <p className="text-lg font-black text-blue-700 mt-0.5">
                      {importResult.totalInSystemAfter ?? total}
                    </p>
                  </div>
                </div>

                {isPersistenceFailed && (
                  <div className="p-3.5 bg-white rounded-xl border border-red-200 text-xs text-red-800 space-y-1.5 shadow-2xs">
                    <div className="font-bold flex items-center gap-1.5 text-red-900">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Required Action — Supabase Database Migration Needed:</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      Articles could not be persisted to Supabase because the required SEO columns do not exist yet. Please execute the SQL migration file in the Supabase Dashboard:
                    </p>
                    <code className="block p-2 bg-neutral-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                      supabase/migrations/20261021_cms_articles_seo_fields.sql
                    </code>
                    <p className="text-[11px] text-neutral-500">
                      Steps: Open Supabase Dashboard → SQL Editor → New Query → paste contents of this file → Run. Once executed, click Import again.
                    </p>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="text-xs text-red-700 bg-white p-3 rounded-xl border border-red-200 shadow-2xs">
                    <span className="font-bold flex items-center gap-1">
                      <span>Error details:</span>
                    </span>
                    <ul className="list-disc list-inside mt-1.5 space-y-1 font-mono text-[11px]">
                      {importResult.errors.map((e, idx) => (
                        <li key={idx} className="break-words">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
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

                {/* Cloudinary Step-by-Step Helper Banner & Credentials */}
                {showCloudinaryGuide && (
                  <div className="mb-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 text-[11.5px] leading-relaxed">
                    <p className="font-bold text-emerald-900 flex items-center justify-between">
                      <span>Cloudinary 25GB فری سیٹ اپ اور کریڈینشلز:</span>
                      {cloudName.trim() && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold">
                          کنیکٹڈ ✓ ({uploadPreset || 'yaad_preset'})
                        </span>
                      )}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-0.5 text-[10.5px]">Cloud Name (ڈیش بورڈ سے):</label>
                        <input
                          type="text"
                          value={cloudName}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setCloudName(val);
                            localStorage.setItem('yaad_cloudinary_cloud_name', val);
                          }}
                          placeholder="مثلاً dxyz123"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#003527]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-neutral-700 mb-0.5 text-[10.5px]">Upload Preset Name:</label>
                        <input
                          type="text"
                          value={uploadPreset}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setUploadPreset(val);
                            localStorage.setItem('yaad_cloudinary_upload_preset', val);
                          }}
                          placeholder="yaad_preset"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#003527]"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-900">
                      <strong>نوٹ:</strong> آپ کا اپلوڈ پریسیت <code>yaad_preset</code> کامیابی سے Unsigned موڈ میں تیار ہے۔ بس اوپر اپنا <strong>Cloud Name</strong> درج کریں تو ہر تصویر خودکار طریقے سے کلاؤڈ نری پر اپلوڈ ہو کر لائیو لنک بن جائے گی۔
                    </p>
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
                    disabled={isUploadingToCloudinary}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isUploadingToCloudinary ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingToCloudinary ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
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

              {/* ============================================================== */}
              {/* SEO & On-Page Quality Engine Specification                      */}
              {/* ============================================================== */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-neutral-50 border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>On-Page SEO &amp; Publishing Gate Specification</span>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${seoChecklist.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                    {seoChecklist.passed ? '✓ Ready for Publishing Gate' : `! ${seoChecklist.errors.length} Gate Checks Pending`}
                  </span>
                </div>

                {/* Focus Keyword & Pillar Cluster */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Focus Keyword <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="e.g. monthly rashan list"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                    <span className="text-[10px] text-neutral-500">Target search query for this guide</span>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Pillar Cluster</label>
                    <input
                      type="text"
                      value={cluster}
                      onChange={(e) => setCluster(e.target.value)}
                      placeholder="Monthly Rashan, Ramadan, Kiryana"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                    <span className="text-[10px] text-neutral-500">Internal pillar grouping</span>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Search Intent</label>
                    <select
                      value={searchIntent}
                      onChange={(e) => setSearchIntent(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    >
                      <option value="informational">Informational Guide</option>
                      <option value="list">Master Checklist / List</option>
                      <option value="comparison">Comparison / Review</option>
                      <option value="template">Budget Template / Calculator</option>
                    </select>
                    <span className="text-[10px] text-neutral-500">One clear search intent</span>
                  </div>
                </div>

                {/* Meta Title & Meta Description with Character Counters */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">
                        Meta Title (seoTitle) <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${seoTitle.length > 60 ? 'text-red-600 font-black' : seoTitle.length >= 45 ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {seoTitle.length}/60 chars {seoTitle.length > 60 && '(Exceeds 60 max)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Front-load keyword ≤ 60 chars (e.g. Monthly Rashan List for Pakistani Family 2026)"
                      className={`w-full px-3.5 py-2 rounded-xl border bg-white text-neutral-900 focus:outline-none ${seoTitle.length > 60 ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-[#003527]'}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">
                        Meta Description (seoDescription) <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${seoDescription.length >= 140 && seoDescription.length <= 160 ? 'text-emerald-700' : seoDescription.length > 160 ? 'text-red-600' : 'text-amber-700'}`}>
                        {seoDescription.length} chars (Target: 140–160 chars)
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="One-line direct answer + what reader gets + soft CTA (140-160 characters)"
                      className={`w-full px-3.5 py-2 rounded-xl border bg-white text-neutral-900 focus:outline-none ${seoDescription.length > 160 || (seoDescription.length > 0 && seoDescription.length < 140) ? 'border-amber-300 focus:border-[#003527]' : 'border-neutral-200 focus:border-[#003527]'}`}
                    />
                  </div>
                </div>

                {/* Quick Answer Box (40-60 words) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-neutral-800">
                      Quick Answer Box <span className="text-red-500">*</span>
                    </label>
                    {(() => {
                      const words = quickAnswer.trim().split(/\s+/).filter(Boolean).length;
                      return (
                        <span className={`text-[11px] font-mono font-bold ${words >= 40 && words <= 60 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {words} words (Target: 40–60 words)
                        </span>
                      );
                    })()}
                  </div>
                  <textarea
                    rows={2}
                    value={quickAnswer}
                    onChange={(e) => setQuickAnswer(e.target.value)}
                    placeholder="Answers the article title outright in 40–60 words for reader search engines and AI previews..."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                  />
                </div>

                {/* Key Takeaways & Cover Image Alt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Key Takeaways (3-4 bullets, one per line)</label>
                    <textarea
                      rows={3}
                      value={keyTakeawaysText}
                      onChange={(e) => setKeyTakeawaysText(e.target.value)}
                      placeholder="Staples needed per person per month&#10;How local units (pao, darjan) convert&#10;Offline store check-off saves 40% time"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Cover Image Alt Text (Required if image set)</label>
                    <textarea
                      rows={3}
                      value={coverImageAlt}
                      onChange={(e) => setCoverImageAlt(e.target.value)}
                      placeholder="Descriptive alt text describing the photo (e.g. Traditional Pakistani kitchen pantry shelf with chakki atta, pulses, and spices)"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                </div>

                {/* Hashtags & Internal Related Slugs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">Hashtags (Comma-separated)</label>
                      <span className="text-[10px] text-neutral-500">Target: 3–5 tags</span>
                    </div>
                    <input
                      type="text"
                      value={hashtagsInput}
                      onChange={(e) => setHashtagsInput(e.target.value)}
                      placeholder="MonthlyRashan, GroceryList, PakistanKitchen, YaadApp"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">Related Guide Slugs (3-5 internal links)</label>
                      <span className="text-[10px] text-neutral-500">Real published slugs</span>
                    </div>
                    <input
                      type="text"
                      value={relatedSlugsInput}
                      onChange={(e) => setRelatedSlugsInput(e.target.value)}
                      placeholder="how-to-make-grocery-list, stop-forgetting-groceries, grocery-budget-pakistan"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                </div>

                {/* Repeatable FAQs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Visible FAQs (Schema FAQPage entity, 3-5 questions)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFaqsList((prev) => [...prev, { q: '', a: '' }])}
                      className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      + Add FAQ Row
                    </button>
                  </div>
                  {faqsList.map((faq, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">Question {idx + 1}</span>
                        {faqsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFaqsList((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-[10px] text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFaqsList((prev) => prev.map((f, i) => (i === idx ? { ...f, q: val } : f)));
                        }}
                        placeholder="e.g. How much atta does a family of 5 need for one month?"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#003527]"
                      />
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFaqsList((prev) => prev.map((f, i) => (i === idx ? { ...f, a: val } : f)));
                        }}
                        placeholder="2-4 sentence direct, authoritative answer..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#003527]"
                      />
                    </div>
                  ))}
                </div>

                {/* Queue Scheduling Status & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white border border-neutral-200">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Queue Status</label>
                    <select
                      value={queueStatus}
                      onChange={(e) => setQueueStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#003527]"
                    >
                      <option value="draft_ready">Draft Ready (Eligible for Queue)</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="needs_review">Needs Review</option>
                      <option value="idea">Idea (Bank Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Target Publish Date</label>
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Priority (Lower publishes earlier)</label>
                    <input
                      type="number"
                      value={priorityNum}
                      onChange={(e) => setPriorityNum(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                </div>

                {/* Live Pre-Publish Gate Checklist Panel */}
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2">
                  <span className="font-bold text-xs text-neutral-900 flex items-center justify-between">
                    <span>Pre-Publish Gate Verification Checklist</span>
                    <span className="text-[10px] text-neutral-400 font-mono">11 Quality Rules</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={title.trim() ? 'text-emerald-600' : 'text-red-500'}>
                        {title.trim() ? '✓' : '✗'}
                      </span>
                      <span>Title provided</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={slug.trim() ? 'text-emerald-600' : 'text-red-500'}>
                        {slug.trim() ? '✓' : '✗'}
                      </span>
                      <span>URL slug provided</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.wordCount >= 700 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.wordCount >= 700 ? '✓' : '✗'}
                      </span>
                      <span>Body ≥ 700 words ({seoChecklist.stats.wordCount} words)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.quickAnswerWords >= 40 && seoChecklist.stats.quickAnswerWords <= 60 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.quickAnswerWords >= 40 && seoChecklist.stats.quickAnswerWords <= 60 ? '✓' : '✗'}
                      </span>
                      <span>Quick Answer 40–60 words ({seoChecklist.stats.quickAnswerWords} words)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoTitle.length > 0 && seoTitle.length <= 60 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoTitle.length > 0 && seoTitle.length <= 60 ? '✓' : '✗'}
                      </span>
                      <span>Meta title ≤ 60 chars ({seoTitle.length} chars)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoDescription.length >= 140 && seoDescription.length <= 160 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoDescription.length >= 140 && seoDescription.length <= 160 ? '✓' : '✗'}
                      </span>
                      <span>Meta description 140–160 chars ({seoDescription.length} chars)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.keywordInTitle ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.keywordInTitle ? '✓' : '✗'}
                      </span>
                      <span>Keyword in Title</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.keywordInFirst100Words ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.keywordInFirst100Words ? '✓' : '✗'}
                      </span>
                      <span>Keyword in first 100 words</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.keywordInH2 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.keywordInH2 ? '✓' : '✗'}
                      </span>
                      <span>Keyword in at least one H2 heading</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.hasCoverOrAlt ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.hasCoverOrAlt ? '✓' : '✗'}
                      </span>
                      <span>Cover image with descriptive alt</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.hashtagCount >= 3 && seoChecklist.stats.hashtagCount <= 5 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.hashtagCount >= 3 && seoChecklist.stats.hashtagCount <= 5 ? '✓' : '✗'}
                      </span>
                      <span>3–5 hashtags ({seoChecklist.stats.hashtagCount})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={seoChecklist.stats.bannedPhrasesFound.length === 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {seoChecklist.stats.bannedPhrasesFound.length === 0 ? '✓' : '✗'}
                      </span>
                      <span>Zero banned AI phrases {seoChecklist.stats.bannedPhrasesFound.length > 0 && `(Found: ${seoChecklist.stats.bannedPhrasesFound.join(', ')})`}</span>
                    </div>
                  </div>
                </div>
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
