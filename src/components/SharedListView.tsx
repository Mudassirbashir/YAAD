import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';
import { fetchSharedList, SharedListPayload } from '../lib/supabase';
import { ItemVisualIcon } from './ItemVisualIcon';
import { ItemImageLightboxModal } from './common/ItemImageLightboxModal';
import { ListIcon } from './ListIcon';
import { useLanguage } from '../context/LanguageContext';
import { BidiText } from '../utils/bidi';

export interface SharedListViewProps {
  token: string;
  onOpenApp?: () => void;
}

export const SharedListView: React.FC<SharedListViewProps> = ({ token, onOpenApp }) => {
  const { language, isRTL, t } = useLanguage();
  const [list, setList] = useState<SharedListPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    imageUrl: string;
    itemName: string;
  } | null>(null);

  // Set noindex robots meta for public shared lists
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
      created = true;
    }
    const previousContent = robotsMeta.getAttribute('content');
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');

    return () => {
      if (created && robotsMeta?.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      } else if (robotsMeta && previousContent !== null) {
        robotsMeta.setAttribute('content', previousContent);
      }
    };
  }, []);

  // Fetch list on mount or token change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    fetchSharedList(token)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setHasError(true);
          setList(null);
        } else {
          setList(data);
          setHasError(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Error fetching shared list:', err);
        setHasError(true);
        setList(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleOpenAppClick = () => {
    if (onOpenApp) {
      onOpenApp();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-on-background flex flex-col selection:bg-emerald-100 selection:text-emerald-900"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Public Branded Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-container-lowest/80 backdrop-blur-md border-b border-surface-dim/70 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-2xs p-1">
              <picture className="h-full w-full flex items-center justify-center">
                <source srcSet="/logo-128.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="YAAD Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </picture>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-on-surface font-display">
                YAAD
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-outline mx-2">
                •
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-primary">
                {language === 'ur' ? 'شیئر کردہ خریداری فہرست' : 'Shared Shopping List'}
              </span>
            </div>
          </div>

          <button
            id="shared_list_cta_btn"
            type="button"
            onClick={handleOpenAppClick}
            className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{language === 'ur' ? 'یاد ایپ کھولیں' : 'Open YAAD'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-xs text-outline font-medium">
              {language === 'ur' ? 'فہرست لوڈ ہو رہی ہے...' : 'Loading shared shopping list...'}
            </p>
          </div>
        )}

        {!isLoading && (hasError || !list) && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[50vh]">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center mb-4 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-on-surface font-display mb-2">
              {language === 'ur' ? 'یہ فہرست اب دستیاب نہیں ہے' : 'This shared list is no longer available'}
            </h1>
            <p className="text-xs sm:text-sm text-outline max-w-sm mb-6 leading-relaxed">
              {language === 'ur'
                ? 'لنک کی میعاد ختم ہو چکی ہے یا مالک نے شیئرنگ بند کر دی ہے۔'
                : 'The owner may have disabled sharing or generated a new share link.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAppClick}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              {language === 'ur' ? 'اپنا گروسری لسٹ بنائیں' : 'Create your own shopping list'}
            </button>
          </div>
        )}

        {!isLoading && list && (
          <>
            {/* List Hero Card */}
            <section
              id="shared_list_hero_card"
              className="bg-white dark:bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-dim/80 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ListIcon
                    title={list.title}
                    explicitIcon={list.icon}
                    size="lg"
                    className="shadow-2xs shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {language === 'ur' ? 'خریداری فہرست' : 'Shopping List'}
                    </span>
                    <BidiText
                      as="h1"
                      className="text-xl sm:text-2xl font-extrabold text-on-surface font-display truncate leading-tight"
                    >
                      {list.title}
                    </BidiText>
                  </div>
                </div>

                {list.isCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/70 dark:border-emerald-900/40 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ur' ? 'مکمل ہو گئی' : 'Completed'}</span>
                  </span>
                )}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 text-xs font-semibold text-outline pt-2 border-t border-surface-dim/60">
                <span>
                  {(list.items || []).length}{' '}
                  {(list.items || []).length === 1
                    ? (language === 'ur' ? 'چیز' : 'item')
                    : (language === 'ur' ? 'چیزیں' : 'items')}
                </span>
                <span>•</span>
                <span className="text-primary font-bold">
                  {(list.items || []).filter((i) => i.isCompleted).length} {language === 'ur' ? 'خریدی جا چکی' : 'bought'}
                </span>
                <span>•</span>
                <span className="text-[11px] text-on-surface-variant">
                  {language === 'ur' ? 'صرف دیکھنے کے لیے (Read-only)' : 'Read-only view'}
                </span>
              </div>
            </section>

            {/* Read-Only Items List */}
            <section
              id="shared_list_items_container"
              className="bg-white dark:bg-surface-container-lowest rounded-3xl p-4 sm:p-5 shadow-xs border border-surface-dim/80 divide-y divide-surface-dim/60"
            >
              {(!list.items || list.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-outline">
                  {language === 'ur' ? 'اس فہرست میں کوئی چیز موجود نہیں ہے۔' : 'No items in this list.'}
                </div>
              ) : (
                list.items.map((item, idx) => {
                  const isBought = Boolean(item.isCompleted);
                  const hasPhoto = Boolean(item.imageUrl);

                  return (
                    <article
                      key={idx}
                      className={`py-3 sm:py-3.5 flex items-center justify-between gap-3 ${
                        isBought ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Visual Icon (or Photo Thumbnail) */}
                        <div className="relative shrink-0">
                          <ItemVisualIcon
                            name={item.name}
                            imageUrl={item.imageUrl || undefined}
                            size={40}
                            className="rounded-xl shadow-2xs"
                            onClick={
                              hasPhoto && item.imageUrl
                                ? () =>
                                    setSelectedPhoto({
                                      imageUrl: item.imageUrl!,
                                      itemName: item.name,
                                    })
                                : undefined
                            }
                            title={hasPhoto ? 'Tap to view full-size photo' : undefined}
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm sm:text-base font-bold font-display text-on-surface truncate ${
                              isBought ? 'line-through text-outline' : ''
                            }`}
                          >
                            {item.name}
                          </span>

                          {(item.quantity || item.unit) && (
                            <span className="text-xs text-outline font-body font-medium">
                              {item.quantity ? String(item.quantity) : ''}
                              {item.quantity && item.unit ? ' ' : ''}
                              {item.unit || ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Purchased status indicator */}
                      <div className="shrink-0">
                        {isBought ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'ur' ? 'خریدی گئی' : 'Bought'}</span>
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            {/* Bottom App Promo Banner */}
            <aside className="p-4 sm:p-5 bg-surface-container/60 rounded-3xl border border-surface-dim/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left rtl:sm:text-right">
              <div>
                <h4 className="text-sm font-bold text-on-surface font-display">
                  {language === 'ur' ? 'کیا آپ گروسری لسٹ بنانا چاہتے ہیں؟' : 'Need an easy shopping list?'}
                </h4>
                <p className="text-xs text-outline font-body">
                  {language === 'ur'
                    ? 'یاد ایپ ڈاؤن لوڈ کریں یا ویب پر مفت استعمال کریں۔'
                    : 'Organize your grocery trips with YAAD. Free & works offline.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAppClick}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {language === 'ur' ? 'شروع کریں' : 'Get Started Free'}
              </button>
            </aside>
          </>
        )}
      </main>

      {/* Borderless Full-Screen Photo Lightbox */}
      <ItemImageLightboxModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        imageUrl={selectedPhoto?.imageUrl}
        itemName={selectedPhoto?.itemName}
      />
    </div>
  );
};
