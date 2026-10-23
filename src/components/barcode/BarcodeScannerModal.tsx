import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  PackageSearch,
  ImageOff,
  Plus,
  Minus,
  ExternalLink,
  Zap,
  Globe,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CategoryId, CATEGORIES_LIST, ShoppingItem, normalizeCategoryId } from '../../types';
import { defaultBarcodeService } from '../../lib/barcode/service';
import { normalizeBarcode } from '../../lib/barcode/normalizer';
import { ScannedProduct } from '../../lib/barcode/types';
import { resolveGS1Prefix, GS1PrefixInfo } from '../../lib/barcode/gs1Prefix';
import { getRetailerLinksForQuery } from '../../lib/barcode/retailerLinks';
import { ItemVisualIcon } from '../ItemVisualIcon';
import { CategoryIcon } from '../CategoryIcon';
import { ItemPhotoCaptureModal } from '../common/ItemPhotoCaptureModal';
import { triggerHaptic } from '../../lib/sound';
import { generateUUID } from '../../lib/uuid';

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
}

type ScannerView = 'scanning' | 'searching' | 'review' | 'manual' | 'error' | 'not_found';

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
  const [isQuickScanMode, setIsQuickScanMode] = useState(false);
  const [quickScanSuccessCode, setQuickScanSuccessCode] = useState<string | null>(null);

  // Scanned item review state
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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

  // GS1 Prefix Origin Information
  const gs1Info = useMemo<GS1PrefixInfo | null>(() => {
    return resolveGS1Prefix(scannedCode);
  }, [scannedCode]);

  // Retailer deep-links for price checking
  const retailerLinks = useMemo(() => {
    const query = reviewName || scannedCode;
    return getRetailerLinksForQuery(query);
  }, [reviewName, scannedCode]);

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

    setScannedCode(rawCode);

    // If in quick scan mode, do not stop camera unless needed
    if (!isQuickScanMode) {
      stopCamera();
      setView('searching');
    }
    setSearchError(null);

    try {
      const result = await defaultBarcodeService.lookupBarcode(rawCode);

      if (!isMountedRef.current) return;

      if (result.status === 'FOUND' && result.product && result.product.name.trim()) {
        const prod = result.product;

        // In Quick Scan Mode, immediately add item and keep scanning
        if (isQuickScanMode) {
          const newItem: ShoppingItem = {
            id: generateUUID(),
            name: prod.name.trim(),
            categoryId: prod.categoryId || 'other',
            completed: false,
            quantity: '1',
            unit: undefined,
            note: undefined,
            barcode: rawCode,
            brand: prod.brand || undefined,
            packageSize: prod.packageSize || undefined,
            imageUrl: prod.imageUrl || undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          onAddItem(newItem);
          triggerHaptic(30);
          setQuickScanSuccessCode(prod.name.trim());
          setTimeout(() => {
            if (isMountedRef.current) {
              setQuickScanSuccessCode(null);
              isProcessingRef.current = false;
            }
          }, 1600);
          return;
        }

        // Standard Review Mode
        setScannedProduct(prod);
        setCustomPhotoUrl(null);
        setReviewName(prod.name.trim());
        setReviewBrand(prod.brand || '');
        setReviewPackageSize(prod.packageSize || '');
        setReviewCategory(prod.categoryId || 'other');
        setReviewQuantity('1');
        setReviewUnit('');
        setReviewNote('');
        setView('review');
      } else {
        // Dedicated NOT_FOUND view: Never allow raw barcode serial numbers to be auto-added!
        stopCamera();
        setScannedProduct(null);
        setCustomPhotoUrl(null);
        setReviewName('');
        setReviewBrand('');
        setReviewPackageSize('');
        setReviewCategory('other');
        setReviewQuantity('1');
        setReviewUnit('');
        setReviewNote('');

        if (result.status === 'INVALID_BARCODE') {
          setSearchError((t as any)?.barcode?.invalidBarcode || (isUrdu ? 'غلط یا نامکمل بارکوڈ' : 'Invalid barcode format'));
        } else if (result.status === 'NETWORK_ERROR') {
          setSearchError((t as any)?.barcode?.networkError || (isUrdu ? 'سروس سے رابطہ نہیں ہو سکا' : 'Network connection issue'));
        } else {
          setSearchError((t as any)?.barcode?.notFound || (isUrdu ? 'پروڈکٹ کیٹلاگ میں نہیں ملی' : 'Product not found in database'));
        }

        setView('not_found');
      }
    } catch {
      if (isMountedRef.current) {
        stopCamera();
        setSearchError(isUrdu ? 'بارکوڈ تلاش کرنے میں خرابی پیش آئی' : 'Error looking up barcode');
        setView('not_found');
      }
    } finally {
      if (!isQuickScanMode) {
        isProcessingRef.current = false;
      }
    }
  }, [stopCamera, t, isQuickScanMode, onAddItem, isUrdu]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setView('scanning');
    isProcessingRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError((t as any)?.barcode?.cameraUnavailable || (isUrdu ? 'اس ڈیوائس پر کیمرہ دستیاب نہیں' : 'Camera is not available on this device'));
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
        setCameraError((t as any)?.barcode?.cameraDenied || (isUrdu ? 'کیمرہ کی اجازت مسترد ہو گئی۔ براؤزر سیٹنگز چیک کریں۔' : 'Camera permission denied'));
      } else {
        setCameraError((t as any)?.barcode?.cameraInitError || (isUrdu ? 'کیمرہ شروع نہیں ہو سکا۔' : 'Could not start camera'));
      }
      setView('manual');
    }
  }, [stopCamera, handleBarcodeDetected, t, isUrdu]);

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

  // Keyboard Escape & Hardware Shutter listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.key === ' ' || e.key === 'v') && view === 'scanning') {
        // Spacebar / 'v' triggers camera focus / re-arm
        triggerHaptic(10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, view]);

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
    const trimmedName = reviewName.trim();
    if (!trimmedName) {
      setSearchError(isUrdu ? 'پروڈکٹ کا نام درج کرنا لازمی ہے' : 'Please enter a product name');
      return;
    }
    const finalName = trimmedName;
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
      imageUrl: customPhotoUrl || scannedProduct?.imageUrl || undefined,
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
      aria-label={barcodeCopy.scanTitle || (isUrdu ? 'بارکوڈ اسکینر' : 'Scan Barcode')}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-surface-container-high/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-container-high/40 bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base sm:text-lg text-primary">
              {barcodeCopy.scanTitle || (isUrdu ? 'بارکوڈ اسکینر' : 'Scan Barcode')}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-600 text-white shadow-2xs">
              PRO
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Scan Continuous Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsQuickScanMode(!isQuickScanMode);
                triggerHaptic(15);
              }}
              title={isQuickScanMode ? 'Quick Scan Mode Active' : 'Enable Continuous Quick Scan'}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isQuickScanMode
                  ? 'bg-amber-500 text-amber-950 font-bold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isUrdu ? 'فوری موڈ' : 'Quick'}</span>
            </button>

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

                {/* Quick Scan Toast pill inside camera */}
                {quickScanSuccessCode && (
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-center animate-zoom-in-95">
                    <div className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="truncate max-w-[200px]">{quickScanSuccessCode}</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs sm:text-sm text-center text-on-surface-variant font-body">
                {barcodeCopy.scanSubtitle || (isUrdu ? 'پیک شدہ پروڈکٹ کے بارکوڈ پر کیمرہ فوکس کریں' : 'Point your camera at a packaged product barcode')}
              </p>

              {/* Action Buttons below scanner */}
              <div className="mt-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setView('manual');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-primary bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <Keyboard className="w-4 h-4" />
                  <span>{barcodeCopy.manualEntry || (isUrdu ? 'بارکوڈ خود درج کریں' : 'Enter Barcode Manually')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Searching Spinner View */}
          {view === 'searching' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="font-display font-bold text-base text-primary mb-1">
                {barcodeCopy.searching || (isUrdu ? 'پروڈکٹ تلاش ہو رہی ہے...' : 'Searching for product...')}
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {scannedCode}
              </p>
              {gs1Info && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant">
                  <span>{gs1Info.flag}</span>
                  <span>{gs1Info.country}</span>
                </div>
              )}
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {isUrdu ? 'بارکوڈ نمبر' : 'Barcode Number'}
                </label>
                <div className="relative">
                  <input
                    ref={manualInputRef}
                    type="text"
                    inputMode="numeric"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="896400012345"
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
                  {barcodeCopy.lookupBtn || (isUrdu ? 'پروڈکٹ تلاش کریں' : 'Search Product')}
                </button>

                {navigator.mediaDevices && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{barcodeCopy.scanMode || (isUrdu ? 'کیمرہ' : 'Camera')}</span>
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
                  imageUrl={customPhotoUrl || scannedProduct?.imageUrl}
                  size={52}
                  className="w-13 h-13 rounded-2xl shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-on-surface-variant flex items-center gap-2 truncate">
                    <span>{scannedCode}</span>
                    {gs1Info && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-surface-container-high">
                        <span>{gs1Info.flag}</span>
                        <span>{gs1Info.country}</span>
                      </span>
                    )}
                  </div>
                  <div className="font-display font-bold text-base text-primary truncate">
                    {reviewName || (barcodeCopy.notFound || (isUrdu ? 'نامعلوم پروڈکٹ' : 'Unknown Product'))}
                  </div>
                  {(reviewBrand || reviewPackageSize) && (
                    <div className="text-xs text-on-surface-variant flex items-center gap-2 flex-wrap">
                      {reviewBrand && <span className="font-medium">{reviewBrand}</span>}
                      {reviewBrand && reviewPackageSize && <span>•</span>}
                      {reviewPackageSize && <span>{reviewPackageSize}</span>}
                    </div>
                  )}

                  {/* Catalog Image Status */}
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {customPhotoUrl || scannedProduct?.imageUrl ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>{isUrdu ? 'تصویر موجود ہے' : 'Image available'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-amber-300/40"
                      >
                        <Camera className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                        <span>{isUrdu ? 'تصویر اٹیچ کریں' : 'Attach photo'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Tap Retailer & Price Check Buttons */}
              <div className="p-3 rounded-2xl bg-surface-container/60 border border-surface-container-high/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-primary" />
                    <span>{isUrdu ? 'آن لائن قیمت اور اسٹورز چیک کریں' : 'Check Prices & Stores'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {retailerLinks.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs font-semibold text-primary transition-colors"
                    >
                      <span>{r.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    {barcodeCopy.productName || (isUrdu ? 'پروڈکٹ کا نام' : 'Product Name')}
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
                      {barcodeCopy.category || (isUrdu ? 'کیٹگری' : 'Category')}
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
                      {barcodeCopy.quantity || (isUrdu ? 'مقدار' : 'Quantity')}
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
                    {barcodeCopy.note || (isUrdu ? 'نوٹ (اختیاری)' : 'Note (Optional)')}
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
                  <span>{barcodeCopy.confirmAdd || (isUrdu ? 'لسٹ میں شامل کریں' : 'Add to Shopping List')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('scanning');
                    startCamera();
                  }}
                  className="px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {barcodeCopy.scanAnother || (isUrdu ? 'مزید اسکین کریں' : 'Scan Another')}
                </button>
              </div>
            </div>
          )}

          {/* 5. Product Not Found View */}
          {view === 'not_found' && (
            <div className="flex flex-col items-center justify-center text-center py-6 px-2 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-sm">
                <PackageSearch className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-display font-bold text-lg text-primary">
                  {isUrdu ? 'کوئی پروڈکٹ نہیں ملی' : 'No Product Found'}
                </h3>
                {scannedCode && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-mono font-semibold text-on-surface-variant border border-surface-container-high/60">
                    <span>Code: {scannedCode}</span>
                    {gs1Info && (
                      <span className="font-sans font-medium text-[11px] text-primary/80">
                        • {gs1Info.flag} {gs1Info.country}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                  {isUrdu
                    ? 'اس بارکوڈ کی تفصیلات خودکار کیٹلاگ میں موجود نہیں ہیں۔ آپ نیچے دیے گئے بٹن سے آن لائن تلاش کر سکتے ہیں یا خود نام درج کر کے شامل کر سکتے ہیں۔'
                    : 'We could not find catalog details for this barcode. You can search online or enter the product name directly.'}
                </p>
              </div>

              {/* 1-Tap Retailer Price & Catalog Search when not found */}
              {scannedCode && (
                <div className="w-full p-3 rounded-2xl bg-surface-container/60 border border-surface-container-high/40 max-w-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    {isUrdu ? 'آن لائن تلاش کریں' : 'Search on Online Stores'}
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(scannedCode)}&tbm=shop`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs font-semibold text-primary transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-500" />
                      <span>Google Shopping</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <a
                      href={`https://www.amazon.com/s?k=${encodeURIComponent(scannedCode)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs font-semibold text-primary transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      <span>Amazon</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <a
                      href={`https://www.daraz.pk/catalog/?q=${encodeURIComponent(scannedCode)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs font-semibold text-primary transition-colors"
                    >
                      <Store className="w-3.5 h-3.5 text-orange-500" />
                      <span>Daraz PK</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>
              )}

              <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 pt-2 max-w-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView('scanning');
                    startCamera();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isUrdu ? 'دوبارہ اسکین کریں' : 'Scan Another'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReviewName('');
                    setView('review');
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-on-primary font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  <span>{isUrdu ? 'خود نام درج کریں' : 'Enter Name Manually'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Photo Capture for Scanned Products */}
      <ItemPhotoCaptureModal
        isOpen={isPhotoModalOpen}
        itemName={reviewName || 'Product'}
        currentImageUrl={customPhotoUrl || scannedProduct?.imageUrl}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoCaptured={(url) => {
          setCustomPhotoUrl(url);
          setIsPhotoModalOpen(false);
          triggerHaptic(15);
        }}
        onRemovePhoto={() => {
          setCustomPhotoUrl(null);
          setIsPhotoModalOpen(false);
        }}
      />
    </div>
  );
};
