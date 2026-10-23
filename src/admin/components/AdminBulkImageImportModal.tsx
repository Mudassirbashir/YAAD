import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { CatalogItem } from '../pages/AdminCatalogPage';
import {
  CATALOG_IMAGE_ACCEPT,
  isAllowedImageFile,
} from './AdminItemImageModal';

/**
 * Slugifies a catalog item name:
 * Lowercase, spaces and underscores to '-', strip non-alphanumerics.
 */
export function slugifyCatalogName(name: string): string {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Matches a dropped file stem against catalog items:
 * Strip the extension; match the stem against:
 *   1. Exact catalog item id (veg_potato.webp -> veg_potato)
 *   2. Slugified canonical_name / english_name / name (cooking-oil.jpg -> "Cooking Oil")
 */
export function matchCatalogFile(
  filename: string,
  catalogItems: CatalogItem[]
): { item: CatalogItem | null; matchType?: 'id' | 'slug' } {
  const dotIdx = filename.lastIndexOf('.');
  const stem = (dotIdx >= 0 ? filename.slice(0, dotIdx) : filename).trim();
  const lowerStem = stem.toLowerCase();

  // 1. Exact catalog item id
  const exactIdMatch = catalogItems.find(
    (it) => it.id.toLowerCase() === lowerStem
  );
  if (exactIdMatch) {
    return { item: exactIdMatch, matchType: 'id' };
  }

  // 2. Slugified canonical_name / english_name / name
  const slugStem = slugifyCatalogName(stem);
  const slugMatch = catalogItems.find((it) => {
    const slugName = slugifyCatalogName(it.name);
    return slugName === slugStem;
  });
  if (slugMatch) {
    return { item: slugMatch, matchType: 'slug' };
  }

  return { item: null };
}

export interface BulkFileEntry {
  file: File;
  id: string; // unique internal tracking id
  filename: string;
  matchedItem: CatalogItem | null;
  matchType?: 'id' | 'slug' | 'manual';
  status: 'matched' | 'unmatched' | 'skipped' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  resultStats?: {
    format?: string;
    width?: number;
    height?: number;
    bytes?: number;
  };
}

interface AdminBulkImageImportModalProps {
  isOpen: boolean;
  catalogItems: CatalogItem[];
  token: string | null;
  onClose: () => void;
  onImportComplete: () => void;
}

export const AdminBulkImageImportModal: React.FC<AdminBulkImageImportModalProps> = ({
  isOpen,
  catalogItems,
  token,
  onClose,
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [files, setFiles] = useState<BulkFileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    setGlobalError(null);
    const newEntries: BulkFileEntry[] = [];

    Array.from(incomingFiles).forEach((file, idx) => {
      if (!isAllowedImageFile(file)) {
        return; // Ignore non-images per headline rule
      }

      const matchResult = matchCatalogFile(file.name, catalogItems);
      const matched = matchResult.item;

      let status: BulkFileEntry['status'] = 'unmatched';
      let errorMessage: string | undefined;

      if (matched) {
        const hasExisting = Boolean(matched.cloudinaryPublicId || matched.imageUrl);
        if (hasExisting && !replaceExisting) {
          status = 'skipped';
          errorMessage = 'already has image — skipped';
        } else {
          status = 'matched';
        }
      }

      newEntries.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${idx}`,
        filename: file.name,
        matchedItem: matched,
        matchType: matchResult.matchType,
        status,
        errorMessage,
      });
    });

    setFiles((prev) => [...prev, ...newEntries]);
  };

  const handleToggleReplaceExisting = (newVal: boolean) => {
    setReplaceExisting(newVal);
    // Re-evaluate skipped files when the checkbox changes
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.status === 'success' || entry.status === 'uploading') return entry;
        if (entry.matchedItem) {
          const hasExisting = Boolean(
            entry.matchedItem.cloudinaryPublicId || entry.matchedItem.imageUrl
          );
          if (hasExisting && !newVal) {
            return {
              ...entry,
              status: 'skipped',
              errorMessage: 'already has image — skipped',
            };
          }
          return {
            ...entry,
            status: 'matched',
            errorMessage: undefined,
          };
        }
        return entry;
      })
    );
  };

  const handleManualMap = (fileId: string, itemId: string) => {
    const selectedItem = catalogItems.find((it) => it.id === itemId) || null;
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== fileId) return entry;
        if (!selectedItem) {
          return {
            ...entry,
            matchedItem: null,
            matchType: undefined,
            status: 'unmatched',
            errorMessage: undefined,
          };
        }
        const hasExisting = Boolean(
          selectedItem.cloudinaryPublicId || selectedItem.imageUrl
        );
        if (hasExisting && !replaceExisting) {
          return {
            ...entry,
            matchedItem: selectedItem,
            matchType: 'manual',
            status: 'skipped',
            errorMessage: 'already has image — skipped',
          };
        }
        return {
          ...entry,
          matchedItem: selectedItem,
          matchType: 'manual',
          status: 'matched',
          errorMessage: undefined,
        };
      })
    );
  };

  const handleStartUpload = async () => {
    if (!token) {
      setGlobalError('Admin session token is missing.');
      return;
    }

    const uploadable = files.filter(
      (f) => f.status === 'matched' && f.matchedItem
    );
    if (uploadable.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    for (const entry of uploadable) {
      if (!entry.matchedItem) continue;

      // Mark uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file into memory'));
          reader.readAsDataURL(entry.file);
        });

        const res = await fetch(
          `/api/admin/catalog/products/${encodeURIComponent(entry.matchedItem.id)}/image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fileDataUri: dataUri }),
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed.');
        }

        // Update item in local list and mark success
        entry.matchedItem.imageUrl = data.imageUrl;
        entry.matchedItem.cloudinaryPublicId = data.cloudinaryPublicId;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: 'success',
                  resultStats: data.cloudinary || undefined,
                }
              : f
          )
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: 'error',
                  errorMessage: err.message || 'Upload failed',
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    onImportComplete();
  };

  const matchedCount = files.filter((f) => f.status === 'matched').length;
  const skippedCount = files.filter((f) => f.status === 'skipped').length;
  const unmatchedCount = files.filter((f) => f.status === 'unmatched').length;
  const successCount = files.filter((f) => f.status === 'success').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 font-display">
              Bulk Import Catalog Images
            </h2>
            <p className="text-xs text-neutral-500 font-body">
              Automatic matching by filename stem (<code className="text-primary font-mono">veg_potato.webp</code> or{' '}
              <code className="text-primary font-mono">cooking-oil.jpg</code>)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Library Guidance Standard (Verbatim Intent) */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed font-body">
            <span className="font-bold text-[#003527] block mb-1">
              Library display standard:
            </span>
            A plain <strong className="text-neutral-900">WHITE background product photo</strong>, item centred, no hands,
            no packaging clutter. Any format is fine (JPG, PNG, WEBP, HEIC…) — the system
            converts and standardises it automatically.
          </div>

          {/* Multi-file Dropzone */}
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesAdded(e.dataTransfer.files);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-neutral-300 hover:border-primary/60 hover:bg-neutral-50/80 bg-neutral-50/30'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={CATALOG_IMAGE_ACCEPT}
              onChange={(e) => {
                if (e.target.files) handleFilesAdded(e.target.files);
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 font-body block">
                  Drag & drop multiple images here, or{' '}
                  <span className="text-primary underline">browse</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-body block mt-0.5">
                  Accepts all formats: JPG, PNG, WEBP, GIF, AVIF, HEIC, BMP, TIFF, SVG
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Replace Existing Checkbox & Summary */}
          {files.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  disabled={isUploading}
                  onChange={(e) => handleToggleReplaceExisting(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span>Replace existing images</span>
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {matchedCount} ready
                </span>
                {skippedCount > 0 && (
                  <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    {skippedCount} skipped
                  </span>
                )}
                {unmatchedCount > 0 && (
                  <span className="text-neutral-600 bg-neutral-200/60 px-2.5 py-0.5 rounded-full">
                    {unmatchedCount} unmatched
                  </span>
                )}
                {successCount > 0 && (
                  <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {successCount} uploaded
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 max-h-72 overflow-y-auto text-xs">
              {files.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-neutral-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-500 font-mono text-[10px]">
                      {entry.filename.split('.').pop()?.toUpperCase() || 'IMG'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-neutral-800 truncate block">
                        {entry.filename}
                      </span>
                      {entry.matchedItem ? (
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          Matched: <strong className="text-neutral-700">{entry.matchedItem.name}</strong>
                          <span className="text-[10px] text-neutral-400">({entry.matchedItem.id})</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-amber-700 font-semibold">
                            Unmatched — map manually:
                          </span>
                          <select
                            disabled={isUploading}
                            onChange={(e) => handleManualMap(entry.id, e.target.value)}
                            className="bg-white border border-neutral-300 rounded-lg px-2 py-0.5 text-xs text-neutral-700 outline-none max-w-xs cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select catalog item...
                            </option>
                            {catalogItems.map((ci) => (
                              <option key={ci.id} value={ci.id}>
                                {ci.name} ({ci.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-right">
                    {entry.status === 'uploading' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </span>
                    ) : entry.status === 'success' ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Uploaded
                        </span>
                        {entry.resultStats && (
                          <span className="block text-[9px] text-neutral-400">
                            {entry.resultStats.format?.toUpperCase()} · {entry.resultStats.bytes ? Math.round(entry.resultStats.bytes / 1024) : 0} KB
                          </span>
                        )}
                      </div>
                    ) : entry.status === 'skipped' ? (
                      <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                        {entry.errorMessage || 'Skipped'}
                      </span>
                    ) : entry.status === 'error' ? (
                      <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md" title={entry.errorMessage}>
                        {entry.errorMessage || 'Failed'}
                      </span>
                    ) : entry.status === 'matched' ? (
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-semibold">
                        Will not upload
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {globalError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setFiles([])}
                disabled={isUploading}
                className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 cursor-pointer disabled:opacity-50"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={handleStartUpload}
              disabled={isUploading || matchedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading {matchedCount} Images...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload {matchedCount} Matched Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
