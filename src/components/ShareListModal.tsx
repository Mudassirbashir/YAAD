import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
} from 'lucide-react';
import { ShoppingList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { setListSharing, regenerateListShareToken } from '../lib/supabase';
import { triggerHaptic } from '../lib/sound';

export interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingList | null;
  onListUpdated?: (updatedList: ShoppingList) => void;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({
  isOpen,
  onClose,
  list,
  onListUpdated,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && list) {
      setIsEnabled(Boolean(list.shareEnabled));
      setShareToken(list.shareToken || null);
      setErrorMessage(null);
      setCopied(false);
      setShowRegenerateConfirm(false);
      setIsLoading(false);
    }
  }, [isOpen, list]);

  if (!isOpen || !list) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yaad.pk';
  const shareUrl = shareToken ? `${origin}/share/${shareToken}` : '';

  const handleToggleSharing = async () => {
    if (!user) {
      setErrorMessage(language === 'ur' ? 'شیئر کرنے کے لیے لاگ ان ہونا ضروری ہے' : 'You must be logged in to share lists');
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(language === 'ur' ? 'آپ آف لائن ہیں۔ شیئرنگ کے لیے انٹرنیٹ درکار ہے' : "You're offline. Internet connection is required to manage sharing.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    triggerHaptic(10);

    const nextState = !isEnabled;
    const res = await setListSharing(user.id, list.id, nextState);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error.message || 'Failed to update sharing settings');
      return;
    }

    if (res.data) {
      setIsEnabled(res.data.shareEnabled);
      setShareToken(res.data.shareToken);
      if (onListUpdated) {
        onListUpdated({
          ...list,
          shareEnabled: res.data.shareEnabled,
          shareToken: res.data.shareToken,
        });
      }
    }
  };

  const handleRegenerate = async () => {
    if (!user) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(language === 'ur' ? 'آپ آف لائن ہیں۔ نیا لنک بنانے کے لیے انٹرنیٹ درکار ہے' : "You're offline. Internet connection is required to regenerate link.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setShowRegenerateConfirm(false);
    triggerHaptic(12);

    const res = await regenerateListShareToken(user.id, list.id);
    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.error.message || 'Failed to regenerate share token');
      return;
    }

    if (res.data) {
      setShareToken(res.data.shareToken);
      setIsEnabled(true);
      if (onListUpdated) {
        onListUpdated({
          ...list,
          shareEnabled: true,
          shareToken: res.data.shareToken,
        });
      }
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    triggerHaptic(8);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setErrorMessage('Failed to copy link to clipboard');
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    triggerHaptic(10);
    const text = `${list.title} — ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div
        id="share_list_modal_backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          id="share_list_modal_container"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] } }}
          exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.14, ease: [0.36, 0, 0.66, 0] } }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-surface-container-lowest rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-surface-dim space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-on-surface font-display leading-tight">
                  {language === 'ur' ? 'فہرست شیئر کریں' : 'Share Shopping List'}
                </h3>
                <p className="text-xs text-on-surface-variant font-body truncate max-w-[220px] sm:max-w-[260px]">
                  {list.title}
                </p>
              </div>
            </div>
            <button
              id="share_list_close_btn"
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Toggle Sharing Card */}
          <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-surface-dim/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isEnabled ? 'bg-primary/15 text-primary' : 'bg-surface-dim/60 text-outline'
              }`}>
                {isEnabled ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-on-surface">
                  {isEnabled
                    ? (language === 'ur' ? 'پبلک لنک فعال ہے' : 'Public link is active')
                    : (language === 'ur' ? 'شیئرنگ غیر فعال ہے' : 'Sharing is private / disabled')}
                </p>
                <p className="text-[11px] text-outline">
                  {isEnabled
                    ? (language === 'ur' ? 'کوئی بھی یہ لنک دیکھ سکتا ہے (لاگ ان کے بغیر)' : 'Anyone with the link can view (read-only)')
                    : (language === 'ur' ? 'لنک کے ذریعے کوئی نہیں دیکھ سکتا' : 'Only you can view this list')}
                </p>
              </div>
            </div>

            <button
              id="share_list_toggle_btn"
              type="button"
              disabled={isLoading}
              onClick={handleToggleSharing}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? 'bg-primary' : 'bg-surface-dim'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sharing Controls (Visible when enabled) */}
          {isEnabled && shareToken && (
            <div className="space-y-3.5">
              {/* URL Display with Copy Button */}
              <div className="flex items-center gap-2 p-2 bg-surface-container/60 rounded-xl border border-surface-dim">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-on-surface flex-1 px-2 py-1 outline-none font-mono truncate"
                />
                <button
                  id="share_list_copy_btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'ur' ? 'کاپی ہوگیا!' : 'Copied!') : (language === 'ur' ? 'کاپی کریں' : 'Copy')}</span>
                </button>
              </div>

              {/* Action Buttons: WhatsApp & Open in browser */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="share_list_whatsapp_btn"
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'ur' ? 'لنک کھولیں' : 'Open Link'}</span>
                </a>
              </div>

              {/* Regenerate Section */}
              <div className="pt-2 border-t border-surface-dim/50">
                {showRegenerateConfirm ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-xl space-y-2">
                    <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                      {language === 'ur'
                        ? 'پرانا لنک فوراً کام کرنا بند کر دے گا۔ کیا آپ نیا لنک بنانا چاہتے ہیں؟'
                        : 'The existing share link will stop working immediately. Are you sure?'}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowRegenerateConfirm(false)}
                        className="px-2.5 py-1 text-xs text-on-surface-variant hover:text-on-surface font-semibold"
                      >
                        {t('cancel') || 'Cancel'}
                      </button>
                      <button
                        id="share_list_confirm_regenerate_btn"
                        type="button"
                        disabled={isLoading}
                        onClick={handleRegenerate}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (language === 'ur' ? 'ہاں، نیا بنائیں' : 'Yes, Regenerate')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="share_list_regenerate_btn"
                    type="button"
                    onClick={() => setShowRegenerateConfirm(true)}
                    className="w-full text-center text-xs text-outline hover:text-on-surface py-1 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{language === 'ur' ? 'نیا لنک بنائیں (پرانا غیر فعال کریں)' : 'Regenerate link (revokes old link)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
