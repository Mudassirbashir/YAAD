import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  HelpCircle,
  Info,
  CheckCircle2,
  Send,
  Loader2,
  User,
  Mail,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../lib/sound';
import { APP_VERSION } from '../../version';

interface LegalDocModalProps {
  activeModal: 'privacy' | 'terms' | 'help' | 'about' | null;
  onClose: () => void;
}

export const LegalDocModal: React.FC<LegalDocModalProps> = ({
  activeModal,
  onClose,
}) => {
  const { t, isRTL, language } = useLanguage();
  const { user, profile } = useAuth();

  // Support Ticket Form State
  const [supportCategory, setSupportCategory] = useState<'lists' | 'account' | 'sync' | 'bug' | 'other'>('lists');
  const [supportMessage, setSupportMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEmail = user?.email || guestEmail.trim();
    if (!effectiveEmail || !supportMessage.trim()) {
      setTicketError('Please provide your issue description and an email address.');
      return;
    }

    setIsSubmittingTicket(true);
    setTicketError(null);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          userName: profile?.full_name || user?.user_metadata?.full_name || effectiveEmail.split('@')[0],
          userEmail: effectiveEmail,
          userPhone: profile?.phone_number || user?.user_metadata?.phone_number || user?.phone,
          subject: supportMessage.trim().substring(0, 50),
          description: supportMessage.trim(),
          category: supportCategory,
          priority: 'medium',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.ticket) {
        triggerHaptic(14);
        setCreatedTicketNumber(data.ticket.ticketNumber || data.ticket.ticket_number || 'TKT-RECEIVED');
        setSupportMessage('');
      } else {
        setTicketError(data.error || 'Failed to submit support ticket.');
      }
    } catch {
      setTicketError('Network error connecting to support desk. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  if (!activeModal) return null;

  const getTitle = () => {
    switch (activeModal) {
      case 'about':
        return t('settings.aboutYaad') || 'About YAAD';
      case 'privacy':
        return t('settings.privacyPolicy') || 'Privacy Policy';
      case 'terms':
        return t('settings.termsOfService') || 'Terms of Service';
      case 'help':
        return t('settings.helpFeedback') || t('settings.helpSupport') || 'Help & Feedback';
    }
  };

  const getIcon = () => {
    switch (activeModal) {
      case 'about':
        return <Info className="w-5 h-5 text-primary" />;
      case 'privacy':
        return <Shield className="w-5 h-5 text-primary" />;
      case 'terms':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'help':
        return <HelpCircle className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div
      id="legal_doc_modal_backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="legal_doc_modal_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-surface-dim space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-surface-dim/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-2xs">
              {getIcon()}
            </div>
            <h3 className="text-lg font-bold text-on-surface font-['Manrope'] tracking-tight">
              {getTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-on-surface-variant space-y-3.5 leading-relaxed max-h-80 overflow-y-auto pr-1">
          {activeModal === 'about' && (
            <>
              <p>
                <strong>YAAD</strong> is a minimalist, smart shopping memory
                application designed to make grocery and bazaar shopping
                effortless and organized.
              </p>
              <p>
                Built with support for grocery staples in simple English and friendly Roman Urdu, YAAD
                understands local units (pao, darjan, gucchi) and automatically
                organizes your trip by category.
              </p>
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-surface-dim/70 flex items-center justify-between text-xs">
                <span className="text-outline font-medium">Application Version</span>
                <span className="font-mono font-bold text-primary">v{APP_VERSION}</span>
              </div>
            </>
          )}

          {activeModal === 'privacy' && (
            <>
              <p>
                At YAAD, your privacy is a foundational priority. We never sell
                or monetize your shopping lists, personal notes, or grocery
                routines.
              </p>
              <p>
                All synchronization is powered by encrypted database connections
                via Supabase. When using YAAD offline or as a PWA, your lists
                reside locally on your device storage.
              </p>
              <p>
                You remain in full control of your account credentials and
                personal details at all times.
              </p>
            </>
          )}

          {activeModal === 'terms' && (
            <>
              <p>
                Welcome to YAAD. By using this service, you agree to simple,
                fair terms designed to provide a pleasant, reliable shopping
                assistant.
              </p>
              <p>
                YAAD is provided for personal grocery and shopping list
                management. Content is preserved to help you plan and execute
                daily errands efficiently.
              </p>
              <p>
                We continually improve the application with new features and
                optimizations for bilingual shopping experiences in English,
                Roman Urdu, and Urdu.
              </p>
            </>
          )}

          {activeModal === 'help' && (
            <div className="space-y-3.5">
              {createdTicketNumber ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm sm:text-base">
                      {language === 'ur' ? 'درخواست موصول ہو گئی!' : 'Support Inquiry Received!'}
                    </h4>
                    <p className="text-xs text-outline mt-0.5">
                      {language === 'ur'
                        ? 'آپ کی درخواست ایڈمن سپورٹ ڈیسک کو ارسال کر دی گئی ہے۔'
                        : 'Your inquiry has been submitted directly to our Support Desk.'}
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 bg-white dark:bg-stone-800 rounded-xl border border-emerald-200 font-mono text-xs font-bold text-primary">
                    Ticket #{createdTicketNumber}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCreatedTicketNumber(null)}
                      className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'ایک اور میسج بھیجیں' : 'Submit another question'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-3">
                  {/* Authenticated User Auto-Prefill Card */}
                  {user ? (
                    <div className="p-3 bg-primary-fixed/20 border border-primary/20 rounded-2xl flex items-center gap-2.5 text-xs font-['Manrope']">
                      <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-on-surface truncate flex items-center gap-1.5">
                          <span>{profile?.full_name || user.user_metadata?.full_name || 'Shopper'}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            Verified
                          </span>
                        </div>
                        <div className="text-[11px] text-outline truncate">{user.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant block">Your Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-outline absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-surface-dim focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Category Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant block">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'lists', label: 'Shopping Lists' },
                        { id: 'bug', label: 'App Issue' },
                        { id: 'account', label: 'Account' },
                        { id: 'sync', label: 'Offline / Sync' },
                        { id: 'other', label: 'Feedback' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSupportCategory(cat.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            supportCategory === cat.id
                              ? 'bg-primary text-white shadow-2xs'
                              : 'bg-surface-container-low text-outline hover:text-on-surface border border-surface-dim/60'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Issue Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant block">
                      {language === 'ur' ? 'اپنا مسئلہ یا تجویز لکھیں' : 'Describe your issue or question'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder={
                        language === 'ur'
                          ? 'یہاں اپنا سوال یا مسئلہ تفصیل سے لکھیں...'
                          : 'Type your question, bug report, or grocery suggestion here...'
                      }
                      className="w-full p-3 text-xs rounded-xl bg-surface border border-surface-dim focus:outline-none focus:border-primary resize-none placeholder:text-outline/70"
                    />
                  </div>

                  {ticketError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{ticketError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingTicket || !supportMessage.trim()}
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending to Support Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{language === 'ur' ? 'سپورٹ ٹیم کو بھیجیں' : 'Submit Support Request'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-1 text-center">
                <span className="text-[11px] text-outline">
                  Direct email: <a href="mailto:yaadapppk@gmail.com" className="text-primary font-bold hover:underline">yaadapppk@gmail.com</a>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            {t('settings.done') || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
