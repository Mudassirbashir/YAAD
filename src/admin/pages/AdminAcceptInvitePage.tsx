import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight, Copy, Check, Download, ShieldAlert, X } from 'lucide-react';
import { useAdminToast } from '../components/AdminToasts';
import { safeFetchJson } from '../utils/apiClient';
import { ROLE_LABELS, AdminRole } from '../types';

interface AdminAcceptInvitePageProps {
  token: string;
  onNavigate: (path: string) => void;
}

export const AdminAcceptInvitePage: React.FC<AdminAcceptInvitePageProps> = ({
  token,
  onNavigate,
}) => {
  const toast = useAdminToast();

  const [inviteData, setInviteData] = useState<{
    email: string;
    name: string;
    role: AdminRole;
    expiresAt: number;
  } | null>(null);

  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery codes stage
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  // 1. Verify invite token on load
  useEffect(() => {
    const verifyToken = async () => {
      setIsVerifying(true);
      setError(null);
      try {
        const res = await safeFetchJson<{ email: string; name: string; role: AdminRole; expiresAt: number }>(
          `/api/admin/invites/verify?token=${encodeURIComponent(token)}`
        );
        if (!res.ok || !res.data) {
          setError(res.error || 'Invalid or expired invitation token.');
          return;
        }

        setInviteData(res.data);

        // Fetch 2FA secret & QR code for onboarding
        const qrRes = await safeFetchJson<{ secret: string; qrCodeDataUrl: string }>(
          '/api/admin/auth/setup-2fa',
          {
            method: 'POST',
            body: JSON.stringify({ tempToken: token }),
          }
        );
        if (qrRes.ok && qrRes.data) {
          setSetupData(qrRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to server.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setError('No invitation token was provided in the URL.');
    }
  }, [token]);

  const passwordChecks = {
    length: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    matchesConfirm: Boolean(password && confirmPassword && password === confirmPassword),
  };
  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSymbol;

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    toast.info('Secret Copied', 'Manual TOTP key copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text = `YAAD ADMIN EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${inviteData?.email}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      '\n\nNote: Each code can only be used once if you lose access to your 2FA authenticator app.';
    navigator.clipboard.writeText(text);
    setCopiedAllCodes(true);
    toast.info('Codes Copied', 'All 10 recovery codes copied to clipboard.');
    setTimeout(() => setCopiedAllCodes(false), 2500);
  };

  const handleDownloadCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text = `YAAD ADMIN EMERGENCY RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${inviteData?.email}\n\n` +
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Password must meet all complexity requirements (min 12 chars, upper/lower/number/symbol).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!totpCode || !/^\d{6}$/.test(totpCode.trim())) {
      setError('Please enter the 6-digit TOTP verification code from your authenticator app.');
      return;
    }

    if (!setupData?.secret) {
      setError('2FA configuration error. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await safeFetchJson<{ token?: string; recoveryCodes?: string[]; error?: string }>(
        '/api/admin/invites/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            token,
            password,
            totpSecret: setupData.secret,
            totpCode: totpCode.trim(),
          }),
        }
      );

      if (!res.ok || !res.data) {
        setError(res.error || 'Failed to accept invitation.');
        toast.error('Onboarding Failed', res.error || 'Failed to accept invitation.');
        return;
      }

      if (res.data.token) {
        localStorage.setItem('yaad_admin_bearer_token', res.data.token);
      }

      toast.success('Account Activated', 'Welcome to the YAAD Admin Team!');

      if (res.data.recoveryCodes && res.data.recoveryCodes.length > 0) {
        setRecoveryCodes(res.data.recoveryCodes);
      } else {
        onNavigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleMeta = inviteData ? ROLE_LABELS[inviteData.role] : null;

  return (
    <div className="min-h-screen bg-[#FDF6E3]/35 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-[#FCBC1F]/30">
      <div className="w-full max-w-lg mb-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-neutral-200/80 shadow-xs mb-1">
          <img src="/logo.png" alt="YAAD" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
            {recoveryCodes ? 'Save Emergency Recovery Codes' : 'Accept Staff Invitation'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {recoveryCodes
              ? 'Store these 10 single-use codes safely. They will only be shown ONCE.'
              : 'Configure your staff credentials and enforce mandatory 2FA'}
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

        {/* RECOVERY CODES STAGE */}
        {recoveryCodes ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Critical Security Notice</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800">
                These 10 emergency recovery codes allow you to regain access if you lose your phone or authenticator app. Each code can only be used once.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
                <span>10 Emergency Recovery Codes</span>
                <span className="text-[#003527] font-mono font-bold">10 / 10 Remaining</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {recoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-[#003527] flex items-center justify-between shadow-2xs font-semibold"
                  >
                    <span className="text-neutral-400 text-[10px] w-4">{idx + 1}.</span>
                    <span className="font-bold tracking-wider">{code}</span>
                  </div>
                ))}
              </div>
            </div>

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
        ) : isVerifying ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#003527] animate-spin" />
            <span className="text-xs text-neutral-500">Verifying staff invite authorization...</span>
          </div>
        ) : inviteData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Staff Role Badge Banner */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-neutral-900">{inviteData.name}</div>
                  <div className="text-xs text-neutral-500 font-mono">{inviteData.email}</div>
                </div>
                {roleMeta && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-emerald-50 text-[#003527] border-emerald-200"
                  >
                    {roleMeta.title}
                  </span>
                )}
              </div>
              {roleMeta && <p className="text-[11px] text-neutral-500 leading-relaxed">{roleMeta.description}</p>}
            </div>

            {/* Set Password */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                1. Create Strong Password (min 12 chars)
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password (min 12 chars)"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
              </div>

              {/* Password complexity checklist */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Min 12 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.hasSymbol ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Symbol (!@#$...)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.matchesConfirm ? 'text-emerald-700 font-semibold' : 'text-neutral-400'}`}>
                    {passwordChecks.matchesConfirm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enforce 2FA Setup */}
            {setupData && (
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  2. Scan Authenticator QR Code (Mandatory 2FA)
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                  {setupData.qrCodeDataUrl && (
                    <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-xs border border-neutral-200">
                      <img
                        src={setupData.qrCodeDataUrl}
                        alt="2FA QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-neutral-600">Secret Key:</div>
                    <div className="font-mono text-xs text-[#003527] bg-white px-3 py-1.5 rounded-xl border border-neutral-200 break-all select-all font-semibold">
                      {setupData.secret}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900 px-2.5 py-1 rounded-md bg-neutral-200/70 hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-neutral-700 block">Enter 6-digit code from app:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    disabled={isSubmitting}
                    className="w-full bg-white border border-neutral-300 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 text-center text-xl tracking-[0.3em] font-mono text-neutral-900 rounded-xl py-2 outline-none font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || password !== confirmPassword || totpCode.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Activate Account &amp; Access Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-neutral-500">
              The invitation token is invalid or has expired (invitations expire after 24 hours). Please contact a Super Admin to re-issue your invite.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="py-2.5 px-5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer"
            >
              Back to Admin Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
