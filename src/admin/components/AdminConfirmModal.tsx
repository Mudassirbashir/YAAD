import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  consequence: string;
  confirmWord?: string; // Optional: requires typing this word to enable confirm button
  confirmButtonText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  consequence,
  confirmWord,
  confirmButtonText = 'Confirm Action',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const [typedInput, setTypedInput] = useState('');

  if (!isOpen) return null;

  const isRequirementMet = !confirmWord || typedInput.trim().toLowerCase() === confirmWord.toLowerCase();

  const handleAction = async () => {
    if (!isRequirementMet || isLoading) return;
    await onConfirm();
    setTypedInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isDestructive ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400">Explicit confirmation required</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Item</div>
          <div className="text-sm font-bold text-white break-words">{itemName}</div>
          <div className="text-xs text-rose-400/90 leading-relaxed pt-1 border-t border-slate-800/60 mt-2">
            ⚠️ <strong>Consequence:</strong> {consequence}
          </div>
        </div>

        {confirmWord && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Type <strong className="text-rose-400 font-mono select-all">{confirmWord}</strong> to confirm:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={confirmWord}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none font-mono transition-all"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={!isRequirementMet || isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
