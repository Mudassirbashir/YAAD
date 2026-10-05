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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-neutral-900 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDestructive
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {isDestructive ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight font-['Manrope']">{title}</h3>
            <p className="text-xs text-neutral-500">Explicit confirmation required</p>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Target Item</div>
          <div className="text-sm font-bold text-[#003527] break-words">{itemName}</div>
          <div className="text-xs text-rose-700 leading-relaxed pt-2 border-t border-neutral-200 mt-2">
            ⚠️ <strong>Consequence:</strong> {consequence}
          </div>
        </div>

        {confirmWord && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 block">
              Type <strong className="text-rose-600 font-mono select-all bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{confirmWord}</strong> to confirm:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={confirmWord}
              disabled={isLoading}
              className="w-full bg-white border border-neutral-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-neutral-900 text-sm rounded-xl px-4 py-2.5 outline-none font-mono transition-all"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={!isRequirementMet || isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
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

