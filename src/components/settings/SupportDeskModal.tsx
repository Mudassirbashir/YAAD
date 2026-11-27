import React, { useState } from 'react';
import {
  X,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useShouldAnimate } from '../../lib/motionPreference';

interface SupportDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
}

export const SupportDeskModal: React.FC<SupportDeskModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  userPhone,
}) => {
  const { t, language, isRTL } = useLanguage();
  const canAnimate = useShouldAnimate();

  const [category, setCategory] = useState<'app_issue' | 'grocery_catalog' | 'account' | 'feedback' | 'other'>('app_issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; ticketNumber?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedName = userName?.trim() || 'YAAD Shopper';
  const resolvedEmail = userEmail?.trim() || '';
  const resolvedPhone = userPhone?.trim() || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim()) {
      setErrorMessage(
        language === 'ur'
          ? 'براہ کرم اپنے مسئلے یا سوال کی تفصیل درج کریں۔'
          : 'Please describe your inquiry or problem.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryLabels: Record<string, string> = {
        app_issue: 'App Technical Issue',
        grocery_catalog: 'Grocery Catalog / Items',
        account: 'Account & Profile',
        feedback: 'Suggestion & Feedback',
        other: 'General Inquiry',
      };

      const payload = {
        userId: userId || undefined,
        userName: resolvedName,
        userEmail: resolvedEmail || 'shopper@yaad.app',
        userPhone: resolvedPhone || undefined,
        category,
        subject: subject.trim() || `${categoryLabels[category]} - ${resolvedName}`,
        description: description.trim(),
        priority: 'medium',
      };

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit support ticket.');
      }

      setSubmittedTicket({
        id: data.ticket?.id || 'tkt_new',
        ticketNumber: data.ticket?.ticketNumber || data.ticket?.ticket_number || `#${String(data.ticket?.id || '').slice(0, 8)}`,
      });
      setDescription('');
      setSubject('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending support inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setSubmittedTicket(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="support_modal_backdrop"
      onClick={() => !isSubmitting && handleDone()}
      style={!canAnimate ? { animationDuration: '80ms' } : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 yaad-enter-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support_modal_title"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="support_modal_container"
        onClick={(e) => e.stopPropagation()}
        style={!canAnimate ? { animationDuration: '80ms' } : undefined}
        className={`yaad-settings-card p-5 sm:p-6 max-w-md w-full text-on-surface space-y-4 max-h-[90vh] overflow-y-auto ${
          canAnimate ? 'yaad-enter-zoom' : 'yaad-enter-fade'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b yaad-settings-divider">
          <div className="flex items-center gap-3 min-w-0">
            <div className="yaad-settings-tile">
              <Headphones className="w-5 h-5 stroke-[1.9]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 id="support_modal_title" className="text-base font-bold text-on-surface font-display truncate">
                {language === 'ur' ? 'یاڈ کسٹمر سپورٹ ڈیسک' : 'Customer Support Desk'}
              </h3>
              <p className="text-xs text-outline font-body truncate">
                {language === 'ur' ? 'براہ راست ایڈمن سپورٹ سے رابطہ کریں' : 'Direct inquiry to YAAD Support'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDone}
            disabled={isSubmitting}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {submittedTicket ? (
          /* Submission Success State */
          <div className={`space-y-4 py-3 text-center ${canAnimate ? 'yaad-enter-state' : ''}`}>
            <div className="w-14 h-14 rounded-2xl bg-primary/12 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-on-surface font-display">
                {language === 'ur' ? 'شکایت کامیابی سے درج ہو گئی!' : 'Inquiry Submitted Successfully!'}
              </h4>
              <p className="text-[13px] text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                {language === 'ur'
                  ? `آپ کا ٹکٹ نمبر ${submittedTicket.ticketNumber} ہے۔ ایڈمن کا جواب آپ کے ایپ نوٹیفکیشن میں موصول ہوگا۔`
                  : `Your ticket ${submittedTicket.ticketNumber} has been logged. Admin responses will appear in your notification alerts.`}
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-dim/65 text-xs text-on-surface-variant flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>{language === 'ur' ? 'ہماری سپورٹ ٹیم جلد جائزہ لے گی۔' : 'Our team will review your inquiry shortly.'}</span>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {language === 'ur' ? 'ٹھیک ہے' : 'Done & Close'}
            </button>
          </div>
        ) : (
          /* Complaint Submission Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Auto-filled User Details Card */}
            <div className="bg-surface-container-low border border-surface-dim/65 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-primary font-bold">
                <span>{language === 'ur' ? 'خودکار تصدیق شدہ شناخت' : 'Account Profile'}</span>
                <span className="text-[11px] font-semibold text-primary font-mono">
                  {language === 'ur' ? 'لاگ ان شدہ' : 'Synced'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span className="font-semibold truncate text-on-surface">{resolvedName}</span>
                </div>
                {resolvedEmail && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span dir="ltr" className="truncate">{resolvedEmail}</span>
                  </div>
                )}
                {resolvedPhone && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span dir="ltr" className="font-mono truncate">{resolvedPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className={`p-3 bg-error-container/40 border border-error/25 text-error rounded-2xl flex items-center gap-2 ${canAnimate ? 'yaad-enter-state' : ''}`}>
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="support_category_select" className="text-xs font-semibold text-on-surface block">
                {language === 'ur' ? 'معاملہ کی نوعیت' : 'Inquiry Category'}
              </label>
              <select
                id="support_category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl border border-surface-dim/80 text-xs sm:text-sm text-on-surface bg-surface font-medium focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="app_issue">{language === 'ur' ? 'تکنیکی خرابی (App Issue)' : 'App Technical Issue'}</option>
                <option value="grocery_catalog">{language === 'ur' ? 'اشیاء اور پرچی (Grocery Items / Parchi)' : 'Grocery Items / Parchi'}</option>
                <option value="account">{language === 'ur' ? 'اکاؤنٹ اور لاگ ان (Account & Security)' : 'Account & Security'}</option>
                <option value="feedback">{language === 'ur' ? 'تجویز اور فیڈ بیک (Suggestion / Feedback)' : 'Suggestion & Feedback'}</option>
                <option value="other">{language === 'ur' ? 'دیگر عمومی سوال (Other)' : 'Other Inquiry'}</option>
              </select>
            </div>

            {/* Optional Subject */}
            <div className="space-y-1.5">
              <label htmlFor="support_subject_input" className="text-xs font-semibold text-on-surface block">
                {language === 'ur' ? 'مختصر عنوان (اختیاری)' : 'Subject (Optional)'}
              </label>
              <input
                id="support_subject_input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={language === 'ur' ? 'مثال: سبزیوں کی قیمت میں مسئلہ' : 'e.g. Issue saving shopping list'}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl border border-surface-dim/80 bg-surface text-on-surface text-xs sm:text-sm placeholder:text-outline focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="support_description_input" className="text-xs font-semibold text-on-surface block">
                {language === 'ur' ? 'اپنا مسئلہ یا شکایت لکھیں *' : 'Explain your issue or inquiry *'}
              </label>
              <textarea
                id="support_description_input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'ur'
                    ? 'براہ کرم تفصیل لکھیں۔ ہماری سپورٹ ٹیم جلد جواب دے گی۔'
                    : 'Describe what happened or what assistance you need from our team...'
                }
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-surface-dim/80 bg-surface text-on-surface text-xs sm:text-sm placeholder:text-outline focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDone}
                disabled={isSubmitting}
                className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-surface-dim/70 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t('settings.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className={`min-h-[48px] px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  canAnimate ? 'transition-[transform,opacity] duration-150 yaad-ease-premium active:scale-[0.98]' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{language === 'ur' ? 'بھیجا جا رہا ہے...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{language === 'ur' ? 'شکایت جمع کریں' : 'Submit Inquiry'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
