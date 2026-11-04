import React, { useState } from 'react';
import {
  HeartPulse,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { buildCatalogImageUrl, extractCloudinaryVersion } from '../../utils/cloudinary';
import { AdminConfirmModal } from './AdminConfirmModal';

interface DeadImageItem {
  id: string;
  name: string;
  cloudinaryPublicId: string;
  imageUrl: string;
  alive: boolean;
}

interface HealthData {
  total: number;
  healthy: number;
  broken: number;
  items: DeadImageItem[];
}

interface AdminImageHealthPanelProps {
  token: string | null;
  onCleared: () => void;
  notify: (msg: string, kind: 'success' | 'error') => void;
}

/**
 * P0 — Image health sweep. Detects catalog items whose Cloudinary asset is gone
 * (e.g. deleted directly in the Cloudinary console) while the DB still references
 * it, and clears those stale refs with one explicit tap. Clearing is DB-only and
 * never touches Cloudinary.
 */
export const AdminImageHealthPanel: React.FC<AdminImageHealthPanelProps> = ({
  token,
  onCleared,
  notify,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checkHealth = async () => {
    if (!token || isChecking) return;
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/catalog/images/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Health check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const clearDead = async () => {
    if (!token || !health || isClearing) return;
    const deadIds = health.items.filter((i) => !i.alive).map((i) => i.id);
    if (deadIds.length === 0) return;
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/catalog/images/clear-dead', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: deadIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const clearedCount = (data.cleared || []).length;
      notify(`${clearedCount} dead image refs cleared`, 'success');
      if ((data.failed || []).length > 0) {
        notify(`${data.failed.length} could not be cleared`, 'error');
      }
      setHealth(null);
      setShowConfirm(false);
      onCleared();
    } catch (err: any) {
      notify(err.message || 'Clear failed', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const deadItems = health ? health.items.filter((i) => !i.alive) : [];

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          if (!health && !isChecking) checkHealth();
        }}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </span>
          <span className="text-left">
            <span className="block text-xs font-bold text-neutral-800">Image health</span>
            <span className="block text-[11px] text-neutral-500">
              {health
                ? `${health.healthy} healthy · ${health.broken} broken`
                : 'Find images deleted from Cloudinary but still listed'}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {health && health.broken > 0 && (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              {health.broken} broken
            </span>
          )}
          {health && health.broken === 0 && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              All healthy
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
          <div className="flex items-center gap-2 py-3">
            <button
              type="button"
              onClick={checkHealth}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking…' : health ? 'Re-check' : 'Check now'}
            </button>
            {deadItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isClearing}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Clear {deadItems.length} dead refs
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {isChecking && !health && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking every Cloudinary asset…
            </div>
          )}

          {health && deadItems.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              All {health.total} catalog images exist on Cloudinary. Nothing to clear.
            </div>
          )}

          {deadItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-neutral-500">
                These images were deleted from Cloudinary but are still listed in the catalog.
                Clearing removes the DB reference only — Cloudinary is untouched.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {deadItems.map((item) => {
                  const version = extractCloudinaryVersion(item.imageUrl);
                  const thumb = item.cloudinaryPublicId
                    ? buildCatalogImageUrl(item.cloudinaryPublicId, 'icon', version)
                    : '';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 border border-rose-100 bg-rose-50/50 rounded-xl px-2 py-1.5"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          crossOrigin="anonymous"
                          className="w-8 h-8 rounded-lg object-cover bg-white border border-neutral-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">?</span>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-neutral-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">{item.id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <AdminConfirmModal
        isOpen={showConfirm}
        title="Clear dead image refs?"
        itemName={`${deadItems.length} broken references`}
        consequence="These image references will be removed from the catalog database. Cloudinary is not touched (the assets are already gone). This cannot be undone."
        confirmButtonText={isClearing ? 'Clearing…' : `Clear ${deadItems.length}`}
        isDestructive
        isLoading={isClearing}
        onConfirm={clearDead}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};
