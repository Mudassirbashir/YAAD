import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight, Check, X } from 'lucide-react';
import { useAdminToast } from '../components/AdminToasts';
import { AdminNotFoundPage } from './AdminNotFoundPage';

interface AdminSetupBootstrapPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSetupBootstrapPage: React.FC<AdminSetupBootstrapPageProps> = ({ onNavigate }) => {
  const toast = useAdminToast();

  // Status check state
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSetupAllowed, setIsSetupAllowed] = useState<boolean | null>(null);

  // Flow stages: 'key' | 'form' | 'success'
  const [stage, setStage] = useState<'key' | 'form' | 'success'>('key');

  // Stage 1: Key verification
  const [setupKey, setSetupKey] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [bootstrapToken, setBootstrapToken] = useState<string | null>(null);

  // Stage 2: Super Admin form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Check if setup is allowed on mount
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/setup/status');
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setIsSetupAllowed(data.allowed === true);
        } else {
          setIsSetupAllowed(false);
        }
      } catch {
        if (mounted) setIsSetupAllowed(false);
      } finally {
        if (mounted) setIsCheckingStatus(false);
      }
    };

    checkStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // Password rules evaluation (min 12 chars, upper/lower/number/symbol)
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

  // Handle Key Verification
  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(null);

    const cleanKey = setupKey.trim();
    if (!cleanKey) {
      setKeyError('Please enter the administrative setup key.');
      return;
    }

    setIsVerifyingKey(true);
    try {
      const res = await fetch('/api/admin/setup/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupKey: cleanKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setKeyError(data.error || 'Access denied: Invalid setup key.');
        toast.error('Bootstrap Verification Failed', data.error || 'Invalid secret key.');
        return;
      }

      setBootstrapToken(data.bootstrapToken);
      setStage('form');
      toast.success('Key Verified', 'Please enter your Super Admin account details.');
    } catch (err: any) {
      setKeyError(err.message || 'Network error verifying secret key.');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Handle Super Admin Account Creation
  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Full name is required.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setFormError('Password does not meet all security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!bootstrapToken) {
      setFormError('Setup authorization session expired. Please re-enter your setup key.');
      setStage('key');
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      const res = await fetch('/api/admin/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bootstrapToken,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create Super Admin.');
        toast.error('Setup Failed', data.error);
        return;
      }

      // Success! Setup is now permanently closed
      setIsSetupAllowed(false);
      setStage('success');
      toast.success('Super Admin Created', 'Setup closed. Please sign in to enroll mandatory 2FA.');
    } catch (err: any) {
      setFormError(err.message || 'Network error during bootstrap creation.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // 1. Loading state
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs font-mono">Verifying Bootstrap Authorization...</span>
      </div>
    );
  }

  // 2. If setup is permanently disabled or an admin already exists -> Return 404
  if (isSetupAllowed === false && stage !== 'success') {
    return <AdminNotFoundPage onNavigate={onNavigate} isSetupDisabled={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand Header */}
      <div className="w-full max-w-lg mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xl shadow-lg mb-1">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Manrope']">
          First Super Admin Bootstrap
        </h1>
        <p className="text-xs text-slate-400">
          One-time self-destructing initialization flow for YAAD Admin
        </p>
      </div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Security Notice */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Admin Bootstrap Protocol</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
            Self-Destructs on Completion
          </span>
        </div>

        {/* STAGE 1: KEY ENTRY (Shows NOTHING else until key is verified) */}
        {stage === 'key' && (
          <form onSubmit={handleVerifyKey} className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Administrative Setup Key (<code className="text-emerald-400 font-mono">ADMIN_SETUP_KEY</code>)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={setupKey}
                  onChange={(e) => {
                    setSetupKey(e.target.value);
                    if (keyError) setKeyError(null);
                  }}
                  placeholder="Enter secret bootstrap key..."
                  disabled={isVerifyingKey}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This secret key is configured in your deployment environment variables.
              </p>
            </div>

            {keyError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-relaxed">{keyError}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingKey || !setupKey.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Verify Secret Key</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STAGE 2: SUPER ADMIN CREATION FORM (Appears ONLY after key verified) */}
        {stage === 'form' && (
          <form onSubmit={handleCreateSuperAdmin} className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Key accepted. Create your primary Super Admin account:</span>
            </div>

            {formError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-relaxed">{formError}</div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mudassir Bashir"
                disabled={isSubmittingAdmin}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Super Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                disabled={isSubmittingAdmin}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Strong Password (min 12 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmittingAdmin}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmittingAdmin}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none"
                required
              />
            </div>

            {/* Live Password Complexity Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password Security Checklist:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Min 12 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasSymbol ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Symbol (!@#$...)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.matchesConfirm ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  {passwordChecks.matchesConfirm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAdmin || !isPasswordValid || password !== confirmPassword}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Create Super Admin &amp; Lock Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STAGE 3: SUCCESS (Setup permanently disabled) */}
        {stage === 'success' && (
          <div className="text-center space-y-5 py-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Super Admin Created</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The setup route <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400 font-mono">/admin/setup</code> has now permanently self-destructed and will return 404 for all future visits.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 space-y-1 text-left">
                <span className="font-bold block text-amber-400">Mandatory Next Step:</span>
                <span>
                  Log in now with your email and password. On your first login, you will be required to enroll your TOTP authenticator (Google Authenticator, Apple Passwords, etc.) and save your 10 emergency recovery codes.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/login')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              Proceed to Admin Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
