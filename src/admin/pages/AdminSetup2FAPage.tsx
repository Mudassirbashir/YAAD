import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, AlertCircle, Loader2, ArrowRight, Download, KeyRound, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../components/AdminToasts';

interface AdminSetup2FAPageProps {
  tempToken?: string;
  onNavigate: (path: string) => void;
}

export const AdminSetup2FAPage: React.FC<AdminSetup2FAPageProps> = ({
  tempToken,
  onNavigate,
}) => {
  const { get2faSetupData, confirm2faSetup } = useAdminAuth();
  const toast = useAdminToast();

  const [setupData, setSetupData] = useState<{
    secret: string;
    otpAuthUri: string;
    qrCodeDataUrl: string;
    email: string;
  } | null>(null);

  const [testCode, setTestCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery codes stage
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  const loadSetup = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const data = await get2faSetupData(tempToken);
      if (!data) {
        setError('Failed to initialize 2FA setup. Please try signing in again.');
        return;
      }
      setSetupData(data);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadSetup();
  }, [tempToken]);

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    toast.info('Secret Copied', 'Manual TOTP secret copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyAllCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text = `YAAD ADMIN EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${setupData?.email || 'Super Admin'}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      '\n\nNote: Each code can only be used once if you lose access to your 2FA authenticator app.';
    navigator.clipboard.writeText(text);
    setCopiedAllCodes(true);
    toast.info('Codes Copied', 'All 10 recovery codes copied to clipboard.');
    setTimeout(() => setCopiedAllCodes(false), 2500);
  };

  const handleDownloadCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text = `YAAD ADMIN EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${setupData?.email || 'Super Admin'}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      '\n\nNote: Each code can only be used once if you lose access to your 2FA authenticator app.';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaad-admin-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded', 'Recovery codes text file saved.');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData?.secret || !testCode.trim() || isSubmitting) return;

    if (!/^\d{6}$/.test(testCode.trim())) {
      setError('Please enter the 6-digit code shown on your authenticator app.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await confirm2faSetup(setupData.secret, testCode.trim(), tempToken);
      if (!res.success) {
        setError(res.error || 'Verification code incorrect. Please verify the code.');
        toast.error('Verification Failed', res.error || 'Check that your clock is synchronized.');
        return;
      }

      toast.success('2FA Configured', 'Your admin account is now secured with TOTP two-factor authentication.');

      if (res.recoveryCodes && res.recoveryCodes.length > 0) {
        setRecoveryCodes(res.recoveryCodes);
      } else {
        onNavigate('/admin');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]/35 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-[#FCBC1F]/30">
      <div className="w-full max-w-lg mb-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-neutral-200/80 shadow-xs mb-1">
          <img src="/logo.png" alt="YAAD" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            {recoveryCodes ? 'Save Emergency Recovery Codes' : 'Configure Mandatory 2FA'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {recoveryCodes
              ? 'Store these 10 single-use codes safely. They will only be shown ONCE.'
              : 'YAAD Admin requires Time-based One-Time Password (TOTP) two-factor authentication'}
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-neutral-900">
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* STAGE: RECOVERY CODES DISPLAY */}
        {recoveryCodes ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Critical Security Warning</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800">
                These 10 emergency recovery codes allow you to regain access if you ever lose your phone or authenticator app. Each code can be used exactly once.
              </p>
            </div>

            {/* 10 Codes Grid */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
                <span>10 Single-Use Recovery Codes</span>
                <span className="text-[#003527] font-mono font-bold">10 / 10 Remaining</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {recoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-[#003527] flex items-center justify-between shadow-2xs"
                  >
                    <span className="text-neutral-400 text-[10px] w-4">{idx + 1}.</span>
                    <span className="font-bold tracking-wider">{code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyAllCodes}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedAllCodes ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAllCodes ? 'Copied All' : 'Copy All Codes'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCodes}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download (.txt)</span>
              </button>
            </div>

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasSavedCodes}
                onChange={(e) => setHasSavedCodes(e.target.checked)}
                className="mt-0.5 accent-[#003527] w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-xs text-neutral-700 leading-snug">
                I have securely saved these 10 recovery codes in my password manager or offline storage.
              </span>
            </label>

            <button
              type="button"
              disabled={!hasSavedCodes}
              onClick={() => onNavigate('/admin')}
              className="w-full py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Enter YAAD Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isFetching ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#003527] animate-spin" />
            <span className="text-xs text-neutral-500">Generating secure 2FA keys...</span>
          </div>
        ) : setupData ? (
          <div className="space-y-6">
            {/* Step 1: Scan QR Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#003527] flex items-center justify-center text-[11px] font-bold">
                  1
                </span>
                <span>Scan QR Code with Authenticator App</span>
              </div>
              <p className="text-xs text-neutral-500">
                Use Google Authenticator, Microsoft Authenticator, 1Password, or Apple Passwords to scan:
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                {setupData.qrCodeDataUrl ? (
                  <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-xs border border-neutral-200">
                    <img
                      src={setupData.qrCodeDataUrl}
                      alt="TOTP 2FA QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                ) : null}

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-neutral-600">Manual Entry Secret Key:</div>
                  <div className="font-mono text-xs text-[#003527] bg-white px-3 py-2 rounded-xl border border-neutral-200 break-all select-all font-semibold">
                    {setupData.secret}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900 px-3 py-1 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to clipboard' : 'Copy secret key'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Verification Code */}
            <form onSubmit={handleConfirm} className="space-y-4 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#003527] flex items-center justify-center text-[11px] font-bold">
                  2
                </span>
                <span>Verify 6-digit Code to Confirm</span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit token"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-neutral-300 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 text-center text-xl tracking-[0.3em] font-mono text-neutral-900 rounded-xl py-2.5 outline-none font-bold"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || testCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Activate 2FA &amp; Generate Recovery Codes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <p className="text-xs text-neutral-500">Session context expired. Please sign in again.</p>
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="py-2 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
