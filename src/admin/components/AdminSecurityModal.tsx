import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Copy,
  Check,
  Download,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wand2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from './AdminToasts';
import { generateStrongPassword } from '../../utils/passwordGenerator';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({ isOpen, onClose }) => {
  const { admin, changePassword, regenerateRecoveryCodes } = useAdminAuth();
  const toast = useAdminToast();

  const [activeTab, setActiveTab] = useState<'password' | 'recovery'>('password');

  // Change Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Recovery Codes state
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleSuggestStrongPassword = async () => {
    const pwd = generateStrongPassword(16);
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setShowPwd(true);
    await navigator.clipboard.writeText(pwd);
    toast.success('Strong Password Generated', 'Secure 16-character password copied to clipboard!');
  };

  if (!isOpen) return null;

  // Password rules validation
  const passwordChecks = {
    length: newPassword.length >= 12,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPassword),
    matchesConfirm: Boolean(newPassword && confirmPassword && newPassword === confirmPassword),
  };
  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSymbol &&
    passwordChecks.matchesConfirm;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || isChangingPassword) return;

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await changePassword(newPassword);
      if (!res.success) {
        setPasswordError(res.error || 'Failed to update password.');
        toast.error('Password Update Failed', res.error);
        return;
      }

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password Updated', 'Your staff password has been updated securely.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRegenerateCodes = async () => {
    setIsRegenerating(true);
    try {
      const res = await regenerateRecoveryCodes();
      if (!res.success || !res.recoveryCodes) {
        toast.error('Failed to regenerate codes', res.error);
        return;
      }

      setRecoveryCodes(res.recoveryCodes);
      toast.success('10 Fresh Recovery Codes Generated', 'Store these codes in a safe offline location.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text =
      `YAAD ADMIN EMERGENCY RECOVERY CODES\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Staff Account: ${admin?.email || 'Super Admin'}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nNote: Each code can only be used once if you lose access to your authenticator app.`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.info('Codes Copied', 'All 10 recovery codes copied to clipboard.');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadCodes = () => {
    if (!recoveryCodes || recoveryCodes.length === 0) return;
    const text =
      `YAAD ADMIN EMERGENCY RECOVERY CODES\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Staff Account: ${admin?.email || 'Super Admin'}\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nNote: Each code can only be used once if you lose access to your authenticator app.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaad-admin-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded', 'Recovery codes saved as text file.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 text-neutral-900 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#003527] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#003527] tracking-tight font-['Manrope']">
              Admin Security &amp; Credentials
            </h3>
            <p className="text-xs text-neutral-500">
              Manage account password, two-factor enforcement, and single-use emergency recovery codes
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'password'
                ? 'text-[#003527] border-b-2 border-[#003527]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recovery')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'recovery'
                ? 'text-[#003527] border-b-2 border-[#003527]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Emergency Recovery Codes
          </button>
        </div>

        {/* TAB 1: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password has been successfully updated!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Strong Password Generator Button */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-neutral-500 font-medium">Need a secure password?</span>
              <button
                type="button"
                id="suggest_strong_pwd_btn"
                onClick={handleSuggestStrongPassword}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#003527] border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Suggest Strong Password</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">New Password (Min 12 characters)</label>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPwd ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-200 focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.length ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Min 12 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasUpper ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasLower ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasNumber ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Number (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasSymbol ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Symbol (!@#$...)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.matchesConfirm ? 'text-emerald-700 font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {passwordChecks.matchesConfirm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword || !isPasswordValid}
              className="w-full py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Update Password</span>
            </button>
          </form>
        )}

        {/* TAB 2: EMERGENCY RECOVERY CODES */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Single-Use Emergency Access</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800">
                Generating fresh recovery codes immediately invalidates any previously generated codes. Store new codes in your password manager or secure offline vault.
              </p>
            </div>

            {recoveryCodes ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
                    <span>10 New Single-Use Codes</span>
                    <span className="text-[#003527] font-mono font-bold">Ready</span>
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
                    onClick={handleCopyCodes}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
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
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Lost your existing emergency recovery codes or want to rotate them for security hygiene? Click below to generate 10 new emergency codes.
                </p>

                <button
                  type="button"
                  onClick={handleRegenerateCodes}
                  disabled={isRegenerating}
                  className="w-full py-3 px-4 rounded-xl bg-[#003527] hover:bg-[#00271c] active:bg-[#001d14] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Regenerate 10 New Emergency Codes</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
