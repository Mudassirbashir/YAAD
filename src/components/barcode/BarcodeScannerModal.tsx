import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  Flashlight,
  FlashlightOff,
  Keyboard,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Package,
  Plus,
  Minus,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CategoryId, CATEGORIES_LIST, ShoppingItem, normalizeCategoryId } from '../../types';
import { defaultBarcodeService } from '../../lib/barcode/service';
import { normalizeBarcode } from '../../lib/barcode/normalizer';
import { ScannedProduct } from '../../lib/barcode/types';
import { ItemVisualIcon } from '../ItemVisualIcon';
import { CategoryIcon } from '../CategoryIcon';
import { triggerHaptic } from '../../lib/sound';
import { generateUUID } from '../../lib/uuid';

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
}

type ScannerView = 'scanning' | 'searching' | 'review' | 'manual' | 'error';

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Scanner state
  const [view, setView] = useState<ScannerView>('scanning');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Scanned item review state
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewBrand, setReviewBrand] = useState('');
  const [reviewPackageSize, setReviewPackageSize] = useState('');
  const [reviewCategory, setReviewCategory] = useState<CategoryId>('other');
  const [reviewQuantity, setReviewQuantity] = useState('1');
  const [reviewUnit, setReviewUnit] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [scannedCode, setScannedCode] = useState('');

  // Refs for camera management
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Track already stopped
        }
      });
      streamRef.current = null;
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Process a detected barcode string
  const handleBarcodeDetected = useCallback(async (rawCode: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    triggerHaptic(25);

    stopCamera();
    setView('searching');
    setSearchError(null);
    setScannedCode(rawCode);

    try {
      const result = await defaultBarcodeService.lookupBarcode(rawCode);

      if (!isMountedRef.current) return;

      if (result.status === 'FOUND' && result.product) {
        setScannedProduct(result.product);
        setReviewName(result.product.name);
        setReviewBrand(result.product.brand || '');
        setReviewPackageSize(result.product.packageSize || '');
        setReviewCategory(result.product.categoryId || 'other');
        setReviewQuantity('1');
        setReviewUnit('');
        setReviewNote('');
        setView('review');
      } else {
        // Product not found or error: allow user to add it directly with the scanned barcode
        const normalized = normalizeBarcode(rawCode);
        setScannedProduct(null);
        setReviewName('');
        setReviewBrand('');
        setReviewPackageSize('');
        setReviewCategory('other');
        setReviewQuantity('1');
        setReviewUnit('');
        setReviewNote('');

        if (result.status === 'INVALID_BARCODE') {
          setSearchError((t as any)?.barcode?.invalidBarcode || 'Invalid barcode format');
        } else if (result.status === 'NETWORK_ERROR') {
          setSearchError((t as any)?.barcode?.networkError || 'Network connection issue');
        } else {
          setSearchError((t as any)?.barcode?.notFound || 'Product not found in database');
        }

        setView('review');
      }
    } catch {
      if (isMountedRef.current) {
        setSearchError('Error looking up barcode');
        setView('review');
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [stopCamera, t]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setView('scanning');
    isProcessingRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError((t as any)?.barcode?.cameraUnavailable || 'Camera is not available on this device');
      setView('manual');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Guard if user closed modal during getUserMedia prompt
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as any;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      }

      // Detection loop using BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const BarcodeDetectorClass = (window as any).BarcodeDetector;
        try {
          const detector = new BarcodeDetectorClass({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'],
          });

          const scanLoop = async () => {
            if (!isMountedRef.current || isProcessingRef.current || !videoRef.current) return;

            if (videoRef.current.readyState >= 2) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0 && !isProcessingRef.current) {
                  const rawVal = barcodes[0].rawValue;
                  if (rawVal) {
                    handleBarcodeDetected(rawVal);
                    return;
                  }
                }
              } catch {
                // Ignore transient frame detection error
              }
            }

            if (isMountedRef.current && !isProcessingRef.current) {
              animationFrameRef.current = requestAnimationFrame(scanLoop);
            }
          };

          animationFrameRef.current = requestAnimationFrame(scanLoop);
        } catch {
          // Fallback to manual entry if detector fails
        }
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;

      const isPermissionDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');

      if (isPermissionDenied) {
        setCameraError((t as any)?.barcode?.cameraDenied || 'Camera permission denied');
      } else {
        setCameraError((t as any)?.barcode?.cameraInitError || 'Could not start camera');
      }
      setView('manual');
    }
  }, [stopCamera, handleBarcodeDetected, t]);

  // Torch Toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setIsTorchOn(nextState);
    } catch {
      // Torch toggle not supported
    }
  };

  // Mount/Unmount & Open/Close Lifecycle
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus manual input when manual view opens
  useEffect(() => {
    if (view === 'manual') {
      setTimeout(() => manualInputRef.current?.focus(), 150);
    }
  }, [view]);

  // Handle manual submit
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    handleBarcodeDetected(trimmed);
  };

  // Confirm and add item
  const handleConfirmAddItem = () => {
    const finalName = reviewName.trim() || scannedCode || 'Scanned Item';
    const itemId = generateUUID();

    const newItem: ShoppingItem = {
      id: itemId,
      name: finalName,
      categoryId: reviewCategory,
      completed: false,
      quantity: reviewQuantity.trim() || '1',
      unit: reviewUnit.trim() || undefined,
      note: reviewNote.trim() || undefined,
      barcode: scannedCode || undefined,
      brand: reviewBrand.trim() || undefined,
      packageSize: reviewPackageSize.trim() || undefined,
      imageUrl: scannedProduct?.imageUrl || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onAddItem(newItem);
    triggerHaptic(18);
    onClose();
  };

  if (!isOpen) return null;

  const barcodeCopy = (t as any)?.barcode || {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={barcodeCopy.scanTitle || 'Scan Barcode'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-surface-container-high/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-container-high/40 bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-primary">
              {barcodeCopy.scanTitle || 'Scan Barcode'}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-red-600 text-white shadow-2xs">
              {barcodeCopy.beta || 'BETA'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {view === 'scanning' && hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                title={isTorchOn ? barcodeCopy.torchOff || 'Turn torch off' : barcodeCopy.torchOn || 'Turn torch on'}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-primary transition-colors cursor-pointer"
              >
                {isTorchOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={barcodeCopy.close || 'Close Scanner'}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* 1. Camera Scanning View */}
          {view === 'scanning' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer dim mask */}
                  <div className="relative w-3/4 h-3/4 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Corner Reticles */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-bounce duration-1000" />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-center text-on-surface-variant font-['Manrope']">
                {barcodeCopy.scanSubtitle || 'Point your camera at a packaged product barcode'}
              </p>

              {/* Manual switch button */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setView('manual');
                }}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-primary bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
                <span>{barcodeCopy.manualEntry || 'Enter Barcode Manually'}</span>
              </button>
            </div>
          )}

          {/* 2. Searching Spinner View */}
          {view === 'searching' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary mb-1">
                {barcodeCopy.searching || 'Searching for product...'}
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {scannedCode}
              </p>
            </div>
          )}

          {/* 3. Manual Entry View */}
          {view === 'manual' && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              {cameraError && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    {cameraError}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  {barcodeCopy.scanItem || 'Barcode Number'}
                </label>
                <div className="relative">
                  <input
                    ref={manualInputRef}
                    type="text"
                    inputMode="numeric"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder={barcodeCopy.barcodePlaceholder || 'Enter barcode digits (e.g. 896400012345)'}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono text-primary placeholder:text-on-surface-variant/50"
                  />
                  <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-on-primary font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {barcodeCopy.lookupBtn || 'Search Product'}
                </button>

                {navigator.mediaDevices && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{barcodeCopy.scanMode || 'Camera'}</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* 4. Product Confirmation / Review View */}
          {view === 'review' && (
            <div className="flex flex-col gap-4">
              {searchError && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                  {searchError}
                </div>
              )}

              {/* Scanned Card Header with Product Image */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/50">
                <ItemVisualIcon
                  name={reviewName}
                  displayName={reviewName}
                  categoryId={reviewCategory}
                  imageUrl={scannedProduct?.imageUrl}
                  size={52}
                  className="w-13 h-13 rounded-2xl shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-on-surface-variant truncate">
                    {scannedCode}
                  </div>
                  <div className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary truncate">
                    {reviewName || (barcodeCopy.notFound || 'Unknown Product')}
                  </div>
                  {(reviewBrand || reviewPackageSize) && (
                    <div className="text-xs text-on-surface-variant flex items-center gap-2 flex-wrap">
                      {reviewBrand && <span className="font-medium">{reviewBrand}</span>}
                      {reviewBrand && reviewPackageSize && <span>•</span>}
                      {reviewPackageSize && <span>{reviewPackageSize}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    {barcodeCopy.productName || 'Product Name'}
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmAddItem();
                      }
                    }}
                    placeholder="e.g. Milk, Rice, Biscuit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary text-sm text-primary"
                  />
                </div>

                {/* Category & Quantity Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      {barcodeCopy.category || 'Category'}
                    </label>
                    <div className="relative">
                      <select
                        value={reviewCategory}
                        onChange={(e) => setReviewCategory(e.target.value as CategoryId)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary text-xs font-medium text-primary cursor-pointer truncate"
                      >
                        {CATEGORIES_LIST.map((c) => (
                          <option key={c.id} value={c.id}>
                            {getCategoryName(c.id)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      {barcodeCopy.quantity || 'Quantity'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={reviewQuantity}
                        onChange={(e) => setReviewQuantity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmAddItem();
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-primary text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    {barcodeCopy.note || 'Note (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmAddItem();
                      }
                    }}
                    placeholder="e.g. 2 packs, expiry check"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary text-xs text-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmAddItem}
                  className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-on-primary font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{barcodeCopy.confirmAdd || 'Add to Shopping List'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('scanning');
                    startCamera();
                  }}
                  className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {barcodeCopy.scanAnother || 'Scan Another'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
