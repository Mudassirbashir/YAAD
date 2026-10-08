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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="support_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-neutral-200 text-neutral-900 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#003527] font-['Manrope']">
                {language === 'ur' ? 'یاڈ کسٹمر سپورٹ ڈیسک' : 'Customer Support Desk'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {language === 'ur' ? 'براہ راست ایڈمن سپورٹ سے رابطہ کریں' : 'Direct inquiry to YAAD Admin Desk'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDone}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedTicket ? (
          /* Submission Success State */
          <div className="space-y-4 py-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900">
                {language === 'ur' ? 'شکایت کامیابی سے درج ہو گئی!' : 'Inquiry Submitted Successfully!'}
              </h4>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
                {language === 'ur'
                  ? `آپ کا ٹکٹ نمبر ${submittedTicket.ticketNumber} ہے۔ ایڈمن کا جواب آپ کے ایپ نوٹیفکیشن میں موصول ہوگا۔`
                  : `Your ticket ${submittedTicket.ticketNumber} has been logged. Admin responses will appear in your notification alerts.`}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'ur' ? 'ہماری سپورٹ ٹیم جلد جائزہ لے گی۔' : 'Our team will review your inquiry shortly.'}</span>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="w-full py-2.5 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
            >
              {language === 'ur' ? 'ٹھیک ہے' : 'Done & Close'}
            </button>
          </div>
        ) : (
          /* Complaint Submission Form */
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Auto-filled User Details Card */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                <span>{language === 'ur' ? 'خودکار تصدیق شدہ شناخت' : 'Auto-Verified Account Profile'}</span>
                <span className="text-[10px] bg-emerald-200/70 text-[#003527] px-2 py-0.5 rounded-full font-mono">
                  {language === 'ur' ? 'لاگ ان شدہ' : 'Synced'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-700">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-semibold truncate">{resolvedName}</span>
                </div>
                {resolvedEmail && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{resolvedEmail}</span>
                  </div>
                )}
                {resolvedPhone && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-mono">{resolvedPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">
                {language === 'ur' ? 'معاملہ کی نوعیت' : 'Inquiry Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 bg-white font-semibold focus:outline-none focus:border-[#003527]"
              >
                <option value="app_issue">{language === 'ur' ? 'تکنیکی خرابی (App Issue)' : 'App Technical Issue'}</option>
                <option value="grocery_catalog">{language === 'ur' ? 'اشیاء اور پرچی (Grocery Items / Parchi)' : 'Grocery Items / Parchi'}</option>
                <option value="account">{language === 'ur' ? 'اکاؤنٹ اور لاگ ان (Account & Security)' : 'Account & Security'}</option>
                <option value="feedback">{language === 'ur' ? 'تجویز اور فیڈ بیک (Suggestion / Feedback)' : 'Suggestion & Feedback'}</option>
                <option value="other">{language === 'ur' ? 'دیگر عمومی سوال (Other)' : 'Other Inquiry'}</option>
              </select>
            </div>

            {/* Optional Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">
                {language === 'ur' ? 'مختصر عنوان (اختیاری)' : 'Subject (Optional)'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={language === 'ur' ? 'مثال: سبزیوں کی قیمت میں مسئلہ' : 'e.g. Issue saving shopping list'}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527]"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">
                {language === 'ur' ? 'اپنا مسئلہ یا شکایت لکھیں *' : 'Explain your issue or inquiry *'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'ur'
                    ? 'براہ کرم تفصیل لکھیں۔ ہماری سپورٹ ٹیم جلد جواب دے گی۔'
                    : 'Describe what happened or what assistance you need from our team...'
                }
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#003527] resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleDone}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                {t('settings.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2 rounded-xl bg-[#003527] hover:bg-[#00271c] text-white font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ur' ? 'بھیجا جا رہا ہے...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
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
