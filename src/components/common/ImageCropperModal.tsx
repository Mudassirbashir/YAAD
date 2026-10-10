import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Move,
  Crop,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { triggerHaptic } from '../../lib/sound';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const { language, isRTL } = useLanguage();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinchDistStart, setPinchDistStart] = useState<number | null>(null);
  const [pinchZoomStart, setPinchZoomStart] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset transforms whenever a new image is loaded or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc]);

  // Handle pointer / mouse / touch dragging for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' || (e.target as HTMLElement).tagName.toLowerCase() === 'button') {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore pointer release error
    }
  };

  // Touch pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchDistStart(dist);
      setPinchZoomStart(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistStart !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / pinchDistStart;
      const newZoom = Math.min(Math.max(pinchZoomStart * ratio, 1), 3.5);
      setZoom(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    setPinchDistStart(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3.5));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    triggerHaptic(6);
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset
  const handleReset = () => {
    triggerHaptic(6);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Crop execution on Canvas
  const handleCrop = useCallback(async () => {
    if (!imgRef.current || !containerRef.current) return;
    setIsProcessing(true);
    triggerHaptic(12);

    try {
      const img = imgRef.current;
      const cropSize = 512; // 1:1 output size in px

      const canvas = document.createElement('canvas');
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Measure current on-screen crop viewport
      const viewportRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = viewportRect.width;
      const viewportHeight = viewportRect.height;

      // Scale factor between viewport and output canvas
      const scaleToOutput = cropSize / viewportWidth;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, cropSize, cropSize);

      ctx.save();
      // Center of canvas
      ctx.translate(cropSize / 2, cropSize / 2);

      // Apply Pan (scaled to output)
      ctx.translate(position.x * scaleToOutput, position.y * scaleToOutput);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply Zoom
      ctx.scale(zoom, zoom);

      // Draw the image centered
      // First find how the image was sized inside viewport
      const naturalWidth = img.naturalWidth || 500;
      const naturalHeight = img.naturalHeight || 500;

      // Aspect fill ratio for viewport
      const scaleFit = Math.max(viewportWidth / naturalWidth, viewportHeight / naturalHeight);
      const drawnWidth = naturalWidth * scaleFit * scaleToOutput;
      const drawnHeight = naturalHeight * scaleFit * scaleToOutput;

      ctx.drawImage(
        img,
        -drawnWidth / 2,
        -drawnHeight / 2,
        drawnWidth,
        drawnHeight
      );

      ctx.restore();

      // Export as Blob and Data URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onCropComplete(blob, dataUrl);
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.9
      );
    } catch (err) {
      console.error('Cropping error:', err);
      setIsProcessing(false);
    }
  }, [position, rotation, zoom, onCropComplete]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      id="image_cropper_modal_backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        id="image_cropper_modal_container"
        className="bg-surface-container-lowest text-on-surface rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-surface-dim/80 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-dim/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface font-['Plus_Jakarta_Sans'] leading-tight">
                {language === 'ur'
                  ? 'تصویر ایڈجسٹ اور کراپ کریں'
                  : 'Crop & Adjust Image'}
              </h3>
              <p className="text-[11px] text-outline font-['Manrope']">
                {language === 'ur'
                  ? '1:1 تناسب — تصویر کو ڈریگ اور زوم کر کے سیٹ کریں'
                  : '1:1 Ratio • Drag & zoom to position'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1:1 Crop Viewport Box */}
        <div className="flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="relative w-64 h-64 sm:w-72 sm:h-72 aspect-square rounded-2xl overflow-hidden bg-zinc-950 border-2 border-primary/40 shadow-inner cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center"
          >
            {/* The Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              className="select-none pointer-events-none"
            />

            {/* Circular Avatar Guide Overlay (Shows how it will appear as circle) */}
            <div className="absolute inset-0 pointer-events-none rounded-full ring-2 ring-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] m-3" />

            {/* Grid overlay for precision alignment */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-xs text-white/90 text-[10px] px-2.5 py-0.5 rounded-full font-['Manrope'] flex items-center gap-1 shadow-xs">
                <Move className="w-2.5 h-2.5" />
                <span>
                  {language === 'ur'
                    ? 'تصویر منتقل کرنے کے لیے گھسیٹیں'
                    : 'Drag to adjust position'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom Slider + Rotate + Reset */}
        <div className="bg-surface-container rounded-2xl p-3 space-y-2.5 border border-surface-dim/60">
          {/* Zoom row */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
              className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-dim text-on-surface flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-primary h-1.5 bg-surface-dim rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
              className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-dim text-on-surface flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-outline w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Quick actions: Rotate & Reset */}
          <div className="flex items-center justify-between pt-1 border-t border-surface-dim/40 text-xs">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-dim text-on-surface transition-colors cursor-pointer text-xs font-semibold"
            >
              <RotateCw className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ur' ? 'گھمائیں (90°)' : 'Rotate 90°'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-dim text-outline hover:text-on-surface transition-colors cursor-pointer text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'ری سیٹ' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 text-xs font-semibold text-outline hover:text-on-surface bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer"
          >
            {language === 'ur' ? 'منسوخ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={!imageLoaded || isProcessing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {isProcessing ? (
              <span>{language === 'ur' ? 'کراپ ہو رہا ہے...' : 'Cropping...'}</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'ur' ? 'اپلائی کریں' : 'Apply & Use'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
