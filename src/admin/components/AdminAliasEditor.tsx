import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2, Languages } from 'lucide-react';

interface AliasRow {
  id: string;
  alias: string;
  language: string;
}

interface AdminAliasEditorProps {
  token: string | null;
  itemId: string;
  notify: (msg: string, kind: 'success' | 'error') => void;
}

/**
 * P4 — per-item search alias editor. Adds Urdu-script / Roman-Urdu / English
 * variants so every item is findable in all three (سیب = seb = apple).
 * Writes to the `item_aliases` sidecar table; the app merges them into the
 * search index on sync.
 */
export const AdminAliasEditor: React.FC<AdminAliasEditorProps> = ({ token, itemId, notify }) => {
  const [aliases, setAliases] = useState<AliasRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAlias, setNewAlias] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog/products/${encodeURIComponent(itemId)}/aliases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setAliases(data.aliases || []);
    } catch (err: any) {
      notify(err.message || 'Failed to load aliases', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, itemId, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const addAlias = async () => {
    const alias = newAlias.trim();
    if (!alias || !token || isAdding) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/admin/catalog/products/${encodeURIComponent(itemId)}/aliases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ alias }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setNewAlias('');
      await load();
      notify(`"${alias}" added — searchable after next app sync`, 'success');
    } catch (err: any) {
      notify(err.message || 'Failed to add alias', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const removeAlias = async (alias: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/catalog/products/${encodeURIComponent(itemId)}/aliases`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ alias }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setAliases((prev) => prev.filter((a) => a.alias !== alias));
    } catch (err: any) {
      notify(err.message || 'Failed to remove alias', 'error');
    }
  };

  return (
    <div className="border border-neutral-200 rounded-2xl p-3.5 bg-neutral-50/60">
      <div className="flex items-center gap-2 mb-2">
        <Languages className="w-4 h-4 text-[#003527]" />
        <span className="font-bold text-neutral-700">Search aliases</span>
        <span className="text-[10px] text-neutral-400">Urdu · Roman · English — har spelling pe milega</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {aliases.length === 0 && (
            <span className="text-[11px] text-neutral-400">Koi alias nahi — neeche se add karo.</span>
          )}
          {aliases.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-medium text-neutral-700"
            >
              <span dir="auto">{a.alias}</span>
              <span className="text-[9px] text-neutral-400 font-mono">{a.language}</span>
              <button
                type="button"
                onClick={() => removeAlias(a.alias)}
                className="p-0.5 rounded-full hover:bg-rose-100 text-neutral-400 hover:text-rose-600 cursor-pointer"
                aria-label={`Remove alias ${a.alias}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAlias();
            }
          }}
          placeholder="e.g. سیب, saib, seeb…"
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-neutral-900 text-xs focus:outline-none focus:border-[#003527] bg-white"
        />
        <button
          type="button"
          onClick={addAlias}
          disabled={isAdding || !newAlias.trim()}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#003527] text-white text-xs font-bold hover:bg-[#00281e] disabled:opacity-50 cursor-pointer"
        >
          {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add
        </button>
      </div>
    </div>
  );
};
