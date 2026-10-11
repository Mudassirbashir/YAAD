import React, { useState, useEffect } from 'react';
import { ShoppingItem } from '../types';
import { UNIT_MAP } from '../lib/recognition/quantityExtractor';
import { Minus, Plus, X, Check, Trash2, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { ItemVisualIcon } from './ItemVisualIcon';
import { ItemPhotoCaptureModal } from './common/ItemPhotoCaptureModal';

export interface QuantityEditModalProps {
  isOpen: boolean;
  item: ShoppingItem | null;
  onClose: () => void;
  onSave: (itemId: string, quantity?: string, unit?: string, imageUrl?: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
}

const QUICK_QUANTITIES = [
  { val: '0.5', label: '0.5' },
  { val: '0.75', label: '0.75' },
  { val: '1', label: '1' },
  { val: '1.25', label: '1.25' },
  { val: '1.5', label: '1.5' },
  { val: '2', label: '2' },
  { val: '2.5', label: '2.5' },
  { val: '3', label: '3' },
  { val: '5', label: '5' },
];

const COMMON_UNITS = [
  { id: 'kg', en: 'kg' },
  { id: 'g', en: 'g' },
  { id: 'dozen', en: 'dozen' },
  { id: 'piece', en: 'piece' },
  { id: 'packet', en: 'packet' },
  { id: 'bottle', en: 'bottle' },
  { id: 'l', en: 'litre' },
  { id: 'ml', en: 'ml' },
  { id: 'box', en: 'box' },
  { id: 'can', en: 'can' },
  { id: 'bag', en: 'bag' },
  { id: 'pao', en: 'pao' },
];

export const QuantityEditModal: React.FC<QuantityEditModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onDeleteItem,
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.planned_quantity ? String(item.planned_quantity) : item.quantity ? String(item.quantity) : '');
      const rawUnit = item.planned_unit || item.unit || '';
      const normalized = UNIT_MAP[rawUnit.toLowerCase()]?.standard || rawUnit;
      setUnit(normalized);
      setImageUrl(item.imageUrl || null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleStep = (delta: number) => {
    const current = parseFloat(quantity) || 0;
    const next = Math.max(0, current + delta);
    // Round to 2 decimals to avoid floating-point drift like 1.5000000000000002
    const rounded = Math.round(next * 100) / 100;
    setQuantity(rounded > 0 ? String(rounded) : '');
  };

  const handleSave = () => {
    const cleanQty = quantity.trim() ? quantity.trim() : undefined;
    const cleanUnit = unit.trim() ? unit.trim() : undefined;
    onSave(item.id, cleanQty, cleanUnit, imageUrl);
    onClose();
  };

  const handleClear = () => {
    onSave(item.id, undefined, undefined, imageUrl);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteItem) {
      onDeleteItem(item.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl border border-surface-container-high shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
          <div className="flex items-center gap-3 min-w-0">
            <ItemVisualIcon
              name={item.name}
              canonicalName={item.canonicalName}
              displayName={item.name}
              categoryId={item.categoryId}
              imageUrl={imageUrl || item.imageUrl}
              size={42}
              className="w-11 h-11 rounded-2xl shrink-0 border border-surface-dim"
            />
            <div className="min-w-0">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-primary truncate leading-tight">
                {item.name}
              </h3>
              {item.nameUrdu && (
                <p className="font-urdu text-xs text-on-surface-variant mt-0.5">
                  {item.nameUrdu}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quantity editor"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Item Photo Attachment Card */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container/50 border border-surface-dim/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-['Manrope'] font-bold text-primary block truncate">
                {imageUrl ? (isUrdu ? 'تصویر منسلک ہے' : 'Item Photo Attached') : (isUrdu ? 'پروڈکٹ کی تصویر' : 'Product Photo')}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium block truncate">
                {imageUrl ? (isUrdu ? 'کلاؤڈ نری پر محفوظ' : 'Stored in Cloudinary') : (isUrdu ? 'تیز رفتار کیمرہ یا گیلری سے شامل کریں' : 'Snap fast photo or upload')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="p-1.5 rounded-xl text-error hover:bg-error-container/20 transition-colors"
                title={isUrdu ? 'تصویر ہٹائیں' : 'Remove photo'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold font-['Manrope'] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{imageUrl ? (isUrdu ? 'تبدیل کریں' : 'Change') : (isUrdu ? 'تصویر لیں' : 'Add Photo')}</span>
            </button>
          </div>
        </div>

        {/* Stepper + Manual Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-['Manrope'] font-medium text-outline">
            {t('quantity') || 'Quantity'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep(-0.5)}
              aria-label="Decrease quantity"
              className="w-11 h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 2, 1.5, 500"
                className="w-full h-11 px-3 text-center font-['Manrope'] font-bold text-lg text-primary bg-surface-container-low border border-surface-container-high rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStep(0.5)}
              aria-label="Increase quantity"
              className="w-11 h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Quantity Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-['Manrope'] font-semibold text-outline uppercase tracking-wider">
            Quick Fractions & Numbers
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {QUICK_QUANTITIES.map((q) => {
              const isSelected = quantity === q.val;
              return (
                <button
                  key={q.val}
                  type="button"
                  onClick={() => setQuantity(q.val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-['Manrope'] font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-['Manrope'] font-semibold text-outline uppercase tracking-wider">
              {t('unit') || 'Unit'}
            </span>
            {unit && (
              <button
                type="button"
                onClick={() => setUnit('')}
                className="text-[11px] text-error font-semibold hover:underline"
              >
                Clear Unit
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {COMMON_UNITS.map((u) => {
              const isSelected = unit === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnit(isSelected ? '' : u.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-['Manrope'] font-semibold transition-all flex items-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span>{u.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60 mt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            {onDeleteItem && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-['Manrope'] font-bold text-error bg-error/10 hover:bg-error/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Delete this item from the list"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Item</span>
              </button>
            )}
            {(quantity || unit) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-2 rounded-xl text-xs font-['Manrope'] font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span>Clear Qty</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-['Manrope'] font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-['Manrope'] font-bold text-on-primary bg-primary hover:bg-primary/90 shadow-xs flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fast Item Photo Capture Bottom Sheet */}
      <ItemPhotoCaptureModal
        isOpen={isPhotoModalOpen}
        itemName={item.name}
        currentImageUrl={imageUrl}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoCaptured={(url) => {
          setImageUrl(url);
          setIsPhotoModalOpen(false);
        }}
        onRemovePhoto={() => setImageUrl(null)}
      />
    </div>
  );
};
