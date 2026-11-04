import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  ImagePlus,
} from 'lucide-react';
import { CatalogItem } from '../pages/AdminCatalogPage';
import { matchCatalogFile } from './AdminBulkImageImportModal';
import { CATALOG_IMAGE_ACCEPT, isAllowedImageFile } from './AdminItemImageModal';
import { compressCatalogImage } from '../lib/compressCatalogImage';

interface DropEntry {
  uid: string;
  file: File;
  previewUrl: string;
  matchedItem: CatalogItem | null;
  matchType?: 'id' | 'slug' | 'manual';
  status: 'matched' | 'unmatched' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  savedBytes?: number;
}

interface AdminDropStripProps {
  token: string | null;
  allItems: CatalogItem[];
  onUploadComplete: () => void;
  notify: (msg: string, kind: 'success' | 'error') => void;
}

/**
 * P1 — Persistent top drop zone. Drag an image from Google/browser, drop it here,
 * it auto-matches to a catalog item by filename and uploads. No per-listing clicks.
 */
export const AdminDropStrip: React.FC<AdminDropStripProps> = ({
  token,
  allItems,
  onUploadComplete,
  notify,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [entries, setEntries] = useState<DropEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [urlNote, setUrlNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const addFiles = useCallback(
    (incoming: File[]) => {
      setUrlNote(null);
      const fresh: DropEntry[] = [];
      for (const file of incoming) {
        if (!isAllowedImageFile(file)) continue;
        const match = matchCatalogFile(file.name, allItems);
        fresh.push({
          uid: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          matchedItem: match.item,
          matchType: match.matchType,
          status: match.item ? 'matched' : 'unmatched',
        });
      }
      if (fresh.length > 0) setEntries((prev) => [...prev, ...fresh]);
    },
    [allItems]
  );

  // Window-level drag detection: highlight the strip wherever the drop happens.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types || []).includes('Files');
    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current += 1;
      setIsDragOver(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragOver(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      const files: File[] = [];
      const items = e.dataTransfer?.items;
      if (items) {
        for (const item of Array.from(items)) {
          if (item.kind === 'file') {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
      }
      if (files.length === 0 && e.dataTransfer?.files) {
        for (const f of Array.from(e.dataTransfer.files)) files.push(f);
      }
      if (files.length > 0) {
        addFiles(files);
      } else {
        // Only a URL/text was dropped (hotlink) — we never hotlink.
        setUrlNote('Direct link drop hua — image save karke phir drop karo. Bahar ke links upload nahi hote.');
      }
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [addFiles]);

  const setEntryItem = (uid: string, itemId: string) => {
    setEntries((prev) =>
      prev.map((en) => {
        if (en.uid !== uid) return en;
        const item = allItems.find((it) => it.id === itemId) || null;
        return {
          ...en,
          matchedItem: item,
          matchType: item ? 'manual' : undefined,
          status: item ? 'matched' : 'unmatched',
          errorMessage: undefined,
        };
      })
    );
  };

  const removeEntry = (uid: string) => {
    setEntries((prev) => {
      const en = prev.find((e) => e.uid === uid);
      if (en) URL.revokeObjectURL(en.previewUrl);
      return prev.filter((e) => e.uid !== uid);
    });
  };

  const uploadEntry = async (entry: DropEntry): Promise<boolean> => {
    if (!token || !entry.matchedItem) return false;
    setEntries((prev) => prev.map((e) => (e.uid === entry.uid ? { ...e, status: 'uploading', errorMessage: undefined } : e)));
    try {
      // P2 plugs real compression in here — one shared call site.
      const fileToUpload = await compressCatalogImage(entry.file);
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(fileToUpload);
      });
      const res = await fetch(
        `/api/admin/catalog/products/${encodeURIComponent(entry.matchedItem.id)}/image`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileDataUri: dataUri }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setEntries((prev) =>
        prev.map((e) =>
          e.uid === entry.uid
            ? { ...e, status: 'success', savedBytes: fileToUpload.size }
            : e
        )
      );
      return true;
    } catch (err: any) {
      setEntries((prev) =>
        prev.map((e) =>
          e.uid === entry.uid ? { ...e, status: 'error', errorMessage: err.message || 'Upload failed' } : e
        )
      );
      return false;
    }
  };

  const uploadAll = async () => {
    const ready = entries.filter((e) => e.status === 'matched' && e.matchedItem);
    if (ready.length === 0 || isUploading) return;
    setIsUploading(true);
    let ok = 0;
    for (const entry of ready) {
      if (await uploadEntry(entry)) ok += 1;
    }
    setIsUploading(false);
    notify(`${ok}/${ready.length} images uploaded`, ok === ready.length ? 'success' : 'error');
    onUploadComplete();
  };

  const matchedCount = entries.filter((e) => e.status === 'matched').length;

  return (
    <div
      className={`bg-white border-2 border-dashed rounded-2xl transition-colors ${
        isDragOver ? 'border-[#003527] bg-emerald-50/60' : 'border-neutral-200'
      }`}
    >
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
      >
        <span
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            isDragOver ? 'bg-[#003527] text-white' : 'bg-emerald-50 text-[#003527]'
          }`}
        >
          <CloudUpload className="w-5 h-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-neutral-800">
            {isDragOver ? 'Yahin drop karo!' : 'Image drop zone'}
          </span>
          <span className="block text-[11px] text-neutral-500">
            Google/browser se image drag karo, yahan drop karo — khud sahi item pe lag jayegi. Ya click karke file chuno.
          </span>
        </span>
        {entries.length > 0 && (
          <span className="ml-auto text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full shrink-0">
            {entries.length} files
          </span>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={CATALOG_IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />

      {urlNote && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {urlNote}
        </div>
      )}

      {entries.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-neutral-500">
              {matchedCount} matched · {entries.filter((e) => e.status === 'unmatched').length} need item
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  entries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
                  setEntries([]);
                }}
                className="text-[11px] font-bold text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={uploadAll}
                disabled={isUploading || matchedCount === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003527] hover:bg-[#00281e] text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                Upload {matchedCount > 0 ? `${matchedCount}` : ''}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.uid}
                className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200/70 rounded-xl px-2.5 py-2"
              >
                <img
                  src={entry.previewUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-white border border-neutral-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-neutral-700 truncate">{entry.file.name}</p>
                  <select
                    value={entry.matchedItem?.id || ''}
                    onChange={(e) => setEntryItem(entry.uid, e.target.value)}
                    className="mt-0.5 w-full text-[11px] rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#003527]/20"
                    aria-label={`Item for ${entry.file.name}`}
                  >
                    <option value="">— item chuno —</option>
                    {allItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.id})
                      </option>
                    ))}
                  </select>
                  {entry.status === 'error' && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{entry.errorMessage}</p>
                  )}
                  {entry.matchType && entry.status !== 'error' && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      auto-matched: {entry.matchType === 'id' ? 'by item id' : entry.matchType === 'slug' ? 'by name' : 'manual'}
                    </p>
                  )}
                </div>
                <span className="shrink-0">
                  {entry.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />}
                  {entry.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {entry.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  {entry.status === 'unmatched' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {entry.status === 'matched' && <CheckCircle2 className="w-4 h-4 text-neutral-300" />}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.uid)}
                  className="shrink-0 text-neutral-300 hover:text-neutral-500 cursor-pointer"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
