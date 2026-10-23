import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { CatalogItem } from '../pages/AdminCatalogPage';
import { buildCatalogImageUrl } from '../../utils/cloudinary';

export const CATALOG_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff,.svg,image/*';

export const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.heic',
  '.heif',
  '.bmp',
  '.tif',
  '.tiff',
  '.svg',
];

export function isAllowedImageFile(file: { name?: string; type?: string }): boolean {
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true;
  const name = (file.name || '').toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

interface AdminItemImageModalProps {
  isOpen: boolean;
  item: CatalogItem | null;
  token: string | null;
  onClose: () => void;
  onImageUpdated: (updatedItem: CatalogItem) => void;
}

export const AdminItemImageModal: React.FC<AdminItemImageModalProps> = ({
  isOpen,
  item,
  token,
  onClose,
  onImageUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    format?: string;
    width?: number;
    height?: number;
    bytes?: number;
  } | null>(null);

  // Sync check state
  const [syncStatus, setSyncStatus] = useState<{
    isLoading: boolean;
    inSync: boolean;
    cloudinaryExists: boolean;
    details?: { format?: string; width?: number; height?: number; bytes?: number };
  }>({
    isLoading: false,
    inSync: false,
    cloudinaryExists: false,
  });

  // Fetch sync check when modal opens
  useEffect(() => {
    if (!isOpen || !item || !token) return;
    setErrorMsg(null);
    setShowDeleteConfirm(false);
    setUploadStats(null);

    let isMounted = true;
    setSyncStatus({ isLoading: true, inSync: false, cloudinaryExists: false });

    fetch(`/api/admin/catalog/products/${encodeURIComponent(item.id)}/image/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to check image status');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setSyncStatus({
          isLoading: false,
          inSync: Boolean(data.inSync),
          cloudinaryExists: Boolean(data.cloudinaryExists),
          details: data.cloudinary || undefined,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setSyncStatus({
          isLoading: false,
          inSync: false,
          cloudinaryExists: false,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, item?.id, token]);

  if (!isOpen || !item) return null;

  const currentPublicId = item.cloudinaryPublicId;
  const currentImageUrl = item.imageUrl;
  const previewUrl = currentPublicId
    ? buildCatalogImageUrl(currentPublicId, 'large')
    : currentImageUrl;

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    setUploadStats(null);

    // Headline validation rule: image/* MIME or recognized extension
    if (!isAllowedImageFile(file)) {
      setErrorMsg(
        'Please upload a supported image file (.jpg, .jpeg, .png, .webp, .gif, .avif, .heic, .heif, .bmp, .tif, .tiff, .svg).'
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMsg('Failed to read the selected file from disk.');
    };
    reader.onload = async () => {
      const dataUri = reader.result as string;
      try {
        const res = await fetch(
          `/api/admin/catalog/products/${encodeURIComponent(item.id)}/image`,
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
          throw new Error(data.error || 'Upload to Cloudinary failed.');
        }

        const updated: CatalogItem = {
          ...item,
          imageUrl: data.imageUrl,
          cloudinaryPublicId: data.cloudinaryPublicId,
        };

        setUploadStats(data.cloudinary || null);
        setSyncStatus({
          isLoading: false,
          inSync: true,
          cloudinaryExists: true,
          details: data.cloudinary || undefined,
        });

        onImageUpdated(updated);
      } catch (err: any) {
        setErrorMsg(err.message || 'Image upload failed.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/catalog/products/${encodeURIComponent(item.id)}/image`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove image.');
      }

      const updated: CatalogItem = {
        ...item,
        imageUrl: undefined,
        cloudinaryPublicId: undefined,
      };

      setSyncStatus({
        isLoading: false,
        inSync: false,
        cloudinaryExists: false,
      });
      setShowDeleteConfirm(false);
      onImageUpdated(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove image.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 font-display">
                Catalog Image — {item.name}
              </h2>
              {/* Sync Badge */}
              {syncStatus.isLoading ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Checking sync...
                </span>
              ) : syncStatus.inSync ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  In sync ✓
                </span>
              ) : currentPublicId || currentImageUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Missing in Cloudinary ⚠
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  No image
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 font-body">
              Target public ID: <code className="font-mono text-primary font-bold">yaad-catalog/{item.id}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Library Guidance Standard (Verbatim Intent) */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed font-body">
            <span className="font-bold text-[#003527] block mb-1">
              Library display standard:
            </span>
            A plain <strong className="text-neutral-900">WHITE background product photo</strong>, item centred, no hands,
            no packaging clutter. Any format is fine (JPG, PNG, WEBP, HEIC…) — the system
            converts and standardises it automatically.
          </div>

          {/* Current Image Preview */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50/60 border border-neutral-200/60">
            <div className="w-24 h-24 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={item.name}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-3xl text-neutral-400">{item.emoji || '📦'}</div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-xs font-bold text-neutral-800 block">
                {currentPublicId ? 'Cloudinary Master Asset' : 'No library image attached'}
              </span>
              {currentPublicId && (
                <span className="text-[11px] font-mono text-neutral-500 block truncate">
                  {currentPublicId}
                </span>
              )}
              {uploadStats && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {uploadStats.format?.toUpperCase()} · {uploadStats.width}×{uploadStats.height}px ·{' '}
                  {uploadStats.bytes ? Math.round(uploadStats.bytes / 1024) : 0} KB
                </span>
              )}
              {previewUrl && (
                <div className="pt-1">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove image
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-600 font-semibold">Confirm remove?</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isDeleting}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? 'Removing...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-xs hover:bg-neutral-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Dropzone (Headline Requirement) */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              accept={CATALOG_IMAGE_ACCEPT}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs font-bold text-primary font-body">
                    Uploading & optimizing with Cloudinary...
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-800 font-body block">
                      Drag & drop an image here, or{' '}
                      <span className="text-primary underline">browse</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-body block mt-0.5">
                      Accepts JPG, PNG, WEBP, GIF, AVIF, HEIC, BMP, TIFF, SVG
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1 font-body">
                <span className="font-bold block">Error:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-end bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
