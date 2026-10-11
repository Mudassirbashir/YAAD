import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  Plus,
  AlertCircle,
  Check,
  Search,
  ExternalLink,
  Loader2,
  Package,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  NormalizedProduct,
  barcodeLookupService,
  normalizeBarcode,
} from '../../lib/barcode';
import { CategoryId, CATEGORIES_LIST, ShoppingItem, normalizeCategoryId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ItemVisualIcon } from '../ItemVisualIcon';
import { triggerHaptic, playItemCheckSound } from '../../lib/sound';
import { generateUUID } from '../../lib/uuid';
import { mergeQuantities } from '../../lib/recognition';

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (item: ShoppingItem) => void;
  existingItems?: ShoppingItem[];
}

type ScannerStep =
  | 'permission_prompt'
  | 'scanning'
  | 'looking_up'
  | 'product_preview'
  | 'not_found'
  | 'error';

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  existingItems = [],
}) => {
  const { t, getCategoryName, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Scanner state machine
  const [step, setStep] = useState<ScannerStep>('permission_prompt');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [productData, setProductData] = useState<NormalizedProduct | null>(null);

  // Editable confirmation form state
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<CategoryId>('cooking_essentials');
  const [editQuantity, setEditQuantity] = useState<string>('1');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manual fallback input state
  const [manualInput, setManualInput] = useState<string>('');
  const [manualError, setManualError] = useState<string>('');

  // Hardware / Torch controls
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  // References
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const sessionSeqCounter = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scannerContainerId = 'yaad-barcode-scanner-viewport';

  // Check if item is already present in list
  const existingMatch = useCallback(
    (name: string, barcode?: string) => {
      const cleanName = name.trim().toLowerCase();
      return existingItems.find((it) => {
        if (barcode && it.barcode && it.barcode === barcode) return true;
        return it.name.trim().toLowerCase() === cleanName;
      });
    },
    [existingItems]
  );

  // Stop camera tracks cleanly and release all MediaStreams
  const stopScanner = useCallback(async () => {
    // Invalidate any in-flight startup promises
    sessionSeqCounter.current++;
    isStartingRef.current = false;
    isScanningRef.current = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const scanner = html5QrCodeRef.current;
    html5QrCodeRef.current = null;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        console.warn('Notice stopping camera:', err);
      }
    }

    // Direct MediaStream track stop guard to ensure zero orphaned camera hardware lights
    try {
      const container = document.getElementById(scannerContainerId);
      if (container) {
        const videos = container.querySelectorAll('video');
        videos.forEach((v) => {
          if (v.srcObject instanceof MediaStream) {
            v.srcObject.getTracks().forEach((track) => track.stop());
            v.srcObject = null;
          }
        });
      }
    } catch {}

    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Safe Close Handler
  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Process decoded or typed barcode and query product database
  const handleBarcodeDecoded = useCallback(
    async (rawCode: string) => {
      const clean = normalizeBarcode(rawCode);
      if (!clean) return;

      setScannedBarcode(clean);
      setStep('looking_up');
      setErrorMessage('');
      setImageError(false);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await barcodeLookupService.lookup(clean, controller.signal);

        if (controller.signal.aborted) return;

        if (result.success && result.product) {
          const prod = result.product;
          setProductData(prod);
          setEditName(prod.productName);
          setEditCategory(prod.categoryId || 'cooking_essentials');
          setEditQuantity('1');
          setStep('product_preview');
        } else {
          setProductData(null);
          setEditName('');
          setEditCategory('cooking_essentials');
          setEditQuantity('1');

          if (result.errorCode === 'NOT_FOUND') {
            setStep('not_found');
          } else if (result.errorCode === 'NETWORK_ERROR') {
            setErrorMessage(
              t('barcode.cameraGenericError') ||
                'Unable to reach the product database. Please check your internet connection.'
            );
            setStep('error');
          } else {
            setErrorMessage(result.errorMessage || t('barcode.productNotFound') || 'Product record not found.');
            setStep('not_found');
          }
        }
      } catch (e: unknown) {
        if (!controller.signal.aborted) {
          setStep('not_found');
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [t]
  );

  // Start real-time camera scanning
  const startScanning = useCallback(async () => {
    const currentSessionId = ++sessionSeqCounter.current;
    isStartingRef.current = true;
    isScanningRef.current = false;

    setErrorMessage('');
    setImageError(false);
    setStep('scanning');

    // Give DOM a microtick to mount
    await new Promise((resolve) => setTimeout(resolve, 30));

    // Abort if closed during tick
    if (sessionSeqCounter.current !== currentSessionId) {
      isStartingRef.current = false;
      return;
    }

    const element = document.getElementById(scannerContainerId);
    if (!element) {
      setErrorMessage(t('barcode.cameraGenericError') || 'Scanner container could not be initialized.');
      setStep('error');
      isStartingRef.current = false;
      return;
    }

    // Stop any existing instance cleanly
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }

    if (sessionSeqCounter.current !== currentSessionId) {
      isStartingRef.current = false;
      return;
    }

    try {
      const scanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = scanner;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          // Optimized aspect ratio for standard 1D grocery barcodes
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const width = Math.floor(minEdge * 0.85);
          const height = Math.floor(width * 0.55);
          return { width: Math.max(width, 220), height: Math.max(height, 140) };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        async (decodedText: string) => {
          // Prevent multiple concurrent triggers or debounced duplicates
          if (!isScanningRef.current || isStartingRef.current) return;
          if (barcodeLookupService.shouldIgnoreDuplicateScan(decodedText)) return;

          isScanningRef.current = false;
          triggerHaptic(20);
          playItemCheckSound();

          // Stop camera before showing preview
          try {
            await scanner.stop();
            scanner.clear();
          } catch {}

          handleBarcodeDecoded(decodedText);
        },
        () => {
          // Continuous scanning frame loop
        }
      );

      // Check if user dismissed modal while scanner.start was resolving
      if (sessionSeqCounter.current !== currentSessionId) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
          scanner.clear();
        } catch {}
        html5QrCodeRef.current = null;
        isStartingRef.current = false;
        return;
      }

      isScanningRef.current = true;
      isStartingRef.current = false;

      // Inspect track capabilities for flashlight/torch support
      try {
        const video = element.querySelector('video');
        const track = (video?.srcObject as MediaStream)?.getVideoTracks?.()?.[0];
        const caps = track?.getCapabilities?.();
        const qrcodeCaps = (scanner as any).getRunningTrackCameraCapabilities?.();
        if ((caps && (caps as any).torch) || (qrcodeCaps && qrcodeCaps.torch)) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      if (sessionSeqCounter.current !== currentSessionId) {
        return;
      }
      isScanningRef.current = false;
      isStartingRef.current = false;
      html5QrCodeRef.current = null;
      const errorStr = String(err);
      console.warn('Camera start error:', errorStr);

      if (
        errorStr.includes('NotAllowedError') ||
        errorStr.includes('Permission denied') ||
        errorStr.includes('PermissionDismissedError')
      ) {
        setErrorMessage(
          t('barcode.cameraPermissionDenied') ||
            'Camera permission was denied. Please allow camera access in your browser settings to scan barcodes, or enter the barcode below.'
        );
      } else if (
        errorStr.includes('NotFoundError') ||
        errorStr.includes('DevicesNotFoundError')
      ) {
        setErrorMessage(
          t('barcode.noCameraHardware') || 'No camera hardware found on this device.'
        );
      } else {
        setErrorMessage(
          t('barcode.cameraGenericError') ||
            'Could not access the camera. Check your permissions or type the barcode manually.'
        );
      }
      setStep('error');
    }
  }, [t, handleBarcodeDecoded]);

  // Handle flashlight toggle
  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await (html5QrCodeRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
      triggerHaptic(10);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Manual code or name entry handler
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setManualError(t('barcode.manualErrorEmpty') || 'Please enter a barcode number or product name.');
      return;
    }
    setManualError('');
    stopScanner();

    // Check if it's numeric/barcode-like
    const isBarcodeLike = /^\d{6,14}$/.test(normalizeBarcode(trimmed));
    if (isBarcodeLike) {
      handleBarcodeDecoded(trimmed);
    } else {
      // User entered product name directly
      const newItem: ShoppingItem = {
        id: generateUUID(),
        name: trimmed,
        canonicalName: trimmed,
        original_input: trimmed,
        original_name: trimmed,
        normalized_name: trimmed.toLowerCase(),
        categoryId: 'cooking_essentials',
        completed: false,
        quantity: '1',
        isRecognized: false,
      };
      onAddProduct(newItem);
      triggerHaptic(15);
      playItemCheckSound();
      handleClose();
    }
  };

  // Add confirmed product to the active list
  const handleConfirmAdd = () => {
    if (isSubmitting || isSubmittingRef.current) return;
    const finalName = editName.trim() || productData?.productName || scannedBarcode;
    if (!finalName) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    triggerHaptic(15);
    playItemCheckSound();

    const existing = existingMatch(finalName, scannedBarcode);
    let finalQty = editQuantity.trim() || '1';
    let finalUnit = productData?.unit;

    if (existing) {
      const merged = mergeQuantities(existing.quantity, existing.unit, finalQty, finalUnit);
      finalQty = merged.quantity || finalQty;
      finalUnit = merged.unit || finalUnit || existing.unit;
    }

    const newItem: ShoppingItem = {
      id: existing ? existing.id : generateUUID(),
      name: finalName,
      canonicalName: finalName,
      canonical_name: finalName,
      original_input: scannedBarcode ? `Barcode: ${scannedBarcode}` : finalName,
      original_name: finalName,
      normalized_item: finalName,
      normalized_name: finalName.toLowerCase(),
      categoryId: editCategory,
      category: getCategoryName(editCategory),
      completed: false,
      quantity: finalQty,
      unit: finalUnit || undefined,
      barcode: scannedBarcode || undefined,
      barcode_format: productData?.barcodeFormat,
      brand: productData?.brand,
      imageUrl: imageError ? undefined : productData?.imageUrl,
      image_url: imageError ? undefined : productData?.imageUrl,
      package_size: productData?.packageQuantity,
      confidence: 0.95,
      isRecognized: true,
      note: productData?.brand ? `Brand: ${productData.brand}` : undefined,
    };

    onAddProduct(newItem);
    setIsSubmitting(false);
    handleClose();
  };

  // Reset scanner state to scan again
  const handleScanAgain = async () => {
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    await stopScanner();
    setProductData(null);
    setScannedBarcode('');
    setEditName('');
    setErrorMessage('');
    setImageError(false);
    startScanning();
  };

  // Auto-start scanner when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('permission_prompt');
      setErrorMessage('');
      setScannedBarcode('');
      setProductData(null);
      setManualInput('');
      setManualError('');
      startScanning();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanning, stopScanner]);

  if (!isOpen) return null;

  const alreadyInList = editName ? existingMatch(editName, scannedBarcode) : undefined;
  const isScanningView = step === 'scanning' || step === 'permission_prompt';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="barcode_modal_title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-surface-container-high/80 shadow-2xl flex flex-col overflow-hidden max-h-[92vh] text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-surface-dim/70 flex items-center justify-between bg-surface-container-low/50 shrink-0">
          <div className="flex items-center gap-2">
            <h2
              id="barcode_modal_title"
              className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-primary flex items-center gap-2"
            >
              <span>{t('barcode.scanTitle') || 'Scan your item'}</span>
            </h2>
            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none shadow-2xs">
              BETA
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={t('barcode.closeScanner') || 'Close scanner'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP: SCANNING / CAMERA VIEW (Always mounted to prevent DOM mount race conditions) */}
          <div className={isScanningView ? 'space-y-4' : 'hidden'}>
            <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[340px] mx-auto rounded-2xl overflow-hidden bg-neutral-950 shadow-inner flex items-center justify-center border-2 border-primary/20">
              {/* HTML5 QR Code Mount Element */}
              <div
                id={scannerContainerId}
                className="w-full h-full object-cover overflow-hidden"
              />

              {/* Animated Scanning Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                {/* Outer Frame with Corner Notches */}
                <div className="relative w-[82%] h-[60%] border-2 border-white/70 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Viewfinder Corners */}
                  <div className="absolute -top-1 -start-1 w-5 h-5 border-t-4 border-s-4 border-emerald-400 rounded-tl-sm" />
                  <div className="absolute -top-1 -end-1 w-5 h-5 border-t-4 border-e-4 border-emerald-400 rounded-tr-sm" />
                  <div className="absolute -bottom-1 -start-1 w-5 h-5 border-b-4 border-s-4 border-emerald-400 rounded-bl-sm" />
                  <div className="absolute -bottom-1 -end-1 w-5 h-5 border-b-4 border-e-4 border-emerald-400 rounded-br-sm" />

                  {/* Animated Scanning Laser Beam */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-[bounce_2s_infinite]" />
                </div>

                <p className="mt-4 px-3 py-1 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold rounded-full border border-white/20 select-none shadow-xs text-center">
                  {t('barcode.instruction') || 'Place barcode inside the frame'}
                </p>
              </div>

              {/* Torch / Flashlight Button (if supported) */}
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  aria-label={
                    isTorchOn
                      ? t('barcode.torchOff') || 'Turn flashlight off'
                      : t('barcode.torchOn') || 'Turn flashlight on'
                  }
                  className={`absolute bottom-3 end-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer z-10 ${
                    isTorchOn
                      ? 'bg-amber-400 text-neutral-900 ring-2 ring-amber-300'
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                >
                  {isTorchOn ? (
                    <FlashlightOff className="w-5 h-5" />
                  ) : (
                    <Flashlight className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Manual Barcode Search Fallback */}
            <div className="pt-1">
              <form onSubmit={handleManualSearch} className="space-y-2">
                <label
                  htmlFor="manual_barcode_input"
                  className="block text-xs font-medium text-on-surface-variant font-['Manrope']"
                >
                  {t('barcode.enterManually') || 'Or enter barcode number / item name manually:'}
                </label>
                <div className="relative flex items-center">
                  <input
                    id="manual_barcode_input"
                    type="text"
                    dir="auto"
                    value={manualInput}
                    onChange={(e) => {
                      setManualInput(e.target.value);
                      if (manualError) setManualError('');
                    }}
                    placeholder={t('barcode.manualPlaceholder') || 'e.g. 5000159459228 or Twix...'}
                    className="w-full h-11 bg-surface-container-low rounded-xl ps-3 pe-24 text-sm text-on-surface font-['Manrope'] border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    className="absolute end-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t('search') || 'Look up'}</span>
                  </button>
                </div>
                {manualError && (
                  <p className="text-xs text-rose-600 font-medium">{manualError}</p>
                )}
              </form>
            </div>
          </div>

          {/* STEP: LOOKING UP SPINNER */}
          {step === 'looking_up' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary">
                  {t('barcode.lookingUp') || 'Looking up product...'}
                </p>
                <p className="font-mono text-xs text-outline tracking-wider">
                  {scannedBarcode}
                </p>
                <p className="text-xs text-on-surface-variant font-['Manrope']">
                  {t('barcode.queryingDatabase') || 'Querying Open Food Facts database'}
                </p>
              </div>
            </div>
          )}

          {/* STEP: PRODUCT PREVIEW & CONFIRMATION */}
          {step === 'product_preview' && productData && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmAdd();
              }}
              className="space-y-4 animate-in fade-in duration-200"
            >
              {/* Product Card with Real Image */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/80 flex gap-3.5 items-start">
                {/* Product Image or Fallback Visual Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-surface-dim overflow-hidden shrink-0 flex items-center justify-center p-1 relative shadow-2xs">
                  {productData.imageUrl && !imageError ? (
                    <img
                      src={productData.imageUrl}
                      alt={productData.productName}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <ItemVisualIcon
                      name={productData.productName}
                      categoryId={editCategory}
                      size={48}
                      className="w-12 h-12"
                    />
                  )}
                  {productData.brand && (
                    <span className="absolute bottom-0.5 inset-x-0.5 text-[8px] bg-neutral-900/80 text-white font-bold text-center py-0.5 rounded truncate px-1">
                      {productData.brand}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {productData.barcodeFormat || 'EAN/UPC'}
                    </span>
                    <span className="text-[10px] font-mono text-outline">
                      {productData.barcode}
                    </span>
                  </div>

                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary leading-snug">
                    {productData.productName}
                  </h3>

                  {productData.packageQuantity && (
                    <p className="text-xs font-semibold text-on-surface-variant font-['Manrope']">
                      Package: {productData.packageQuantity}
                    </p>
                  )}

                  {productData.nutritionSummary && (
                    <p className="text-[11px] text-outline font-medium">
                      {productData.nutritionSummary}
                    </p>
                  )}
                </div>
              </div>

              {/* Already in List Notice */}
              {alreadyInList && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {t('barcode.alreadyInList', { count: alreadyInList.quantity || 1 }) ||
                      `Already in your list (Qty: ${alreadyInList.quantity || 1}). Adding will update quantity.`}
                  </span>
                </div>
              )}

              {/* Editable Name & Category Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1 font-['Manrope']">
                    {t('item') || 'Item Name'}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 bg-surface-container-lowest rounded-xl px-3 text-sm text-on-surface font-['Manrope'] border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1 font-['Manrope']">
                      {t('category') || 'Category'}
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(normalizeCategoryId(e.target.value))}
                      className="w-full h-10 bg-surface-container-lowest rounded-xl px-2.5 text-xs text-on-surface font-['Manrope'] border border-outline-variant focus:border-primary outline-none cursor-pointer"
                    >
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getCategoryName(cat.id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1 font-['Manrope']">
                      {t('quantity') || 'Quantity'}
                    </label>
                    <input
                      type="text"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full h-10 bg-surface-container-lowest rounded-xl px-3 text-sm text-on-surface font-['Manrope'] border border-outline-variant focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-outline">
                <span className="flex items-center gap-1">
                  {t('barcode.source') || 'Source'}: {productData.dataSource}
                </span>
                {productData.dataSourceUrl && (
                  <a
                    href={productData.dataSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-0.5 text-primary"
                  >
                    <span>{t('barcode.viewRecord') || 'View Record'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting || !editName.trim()}
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addToList') || 'Add to list'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="h-12 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm border border-surface-container-high active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('barcode.scanAgain') || 'Scan again'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP: NOT FOUND IN DATABASE */}
          {step === 'not_found' && (
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary">
                  {t('barcode.productNotFound') || 'Product Not Found'}
                </h3>
                <p className="font-mono text-xs text-outline">{scannedBarcode}</p>
                <p className="text-xs text-on-surface-variant font-['Manrope'] max-w-xs mx-auto">
                  {t('barcode.notFoundExplanation') ||
                    'This barcode is not yet listed in the open product database. You can still add it by typing its name below:'}
                </p>
              </div>

              {/* Add with custom name form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmAdd();
                }}
                className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/80 text-start space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('item') || 'Product Name'}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter item name..."
                    autoFocus
                    className="w-full h-10 bg-surface-container-lowest rounded-xl px-3 text-sm text-on-surface border border-outline-variant focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {t('category') || 'Category'}
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(normalizeCategoryId(e.target.value))}
                      className="w-full h-10 bg-surface-container-lowest rounded-xl px-2 text-xs border border-outline-variant outline-none"
                    >
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getCategoryName(cat.id)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {t('quantity') || 'Quantity'}
                    </label>
                    <input
                      type="text"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full h-10 bg-surface-container-lowest rounded-xl px-3 text-sm border border-outline-variant outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={!editName.trim()}
                    className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('addToList') || 'Add to list'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleScanAgain}
                    className="h-11 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-dim text-on-surface font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('barcode.scanAgain') || 'Scan again'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP: ERROR STATE (Permissions, No Camera, etc.) */}
          {step === 'error' && (
            <div className="py-4 space-y-4 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-primary">
                  {t('barcode.cameraUnavailable') || 'Camera Unavailable'}
                </h3>
                <p className="text-xs text-on-surface-variant font-['Manrope'] max-w-xs mx-auto">
                  {errorMessage ||
                    t('barcode.cameraGenericError') ||
                    'Please verify camera permissions or type your item manually.'}
                </p>
              </div>

              {/* Direct manual entry fallback */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/80 text-start">
                <form onSubmit={handleManualSearch} className="space-y-2.5">
                  <label className="block text-xs font-bold text-on-surface">
                    {t('barcode.enterManually') || 'Enter item name or barcode:'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      dir="auto"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={t('barcode.manualPlaceholder') || 'e.g. Milk, Apples, or barcode...'}
                      autoFocus
                      className="w-full h-11 bg-surface-container-lowest rounded-xl ps-3 pe-24 text-sm text-on-surface border border-outline-variant focus:border-primary outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute end-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('add') || 'Add'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={startScanning}
                  className="h-10 px-4 rounded-xl bg-surface-container-high hover:bg-surface-dim text-on-surface font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('barcode.tryCameraAgain') || 'Try camera again'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-10 px-4 rounded-xl bg-surface-container-low text-outline hover:text-on-surface font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t('close') || 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
