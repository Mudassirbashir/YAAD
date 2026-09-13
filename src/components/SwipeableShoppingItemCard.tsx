import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Check, Circle, Trash2 } from 'lucide-react';
import { ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { ItemVisualIcon } from './ItemVisualIcon';
import { BidiText } from '../utils/bidi';

interface SwipeableShoppingItemCardProps {
  item: ShoppingItem;
  isChecked: boolean;
  formattedQty?: string;
  justCompletedLocally: boolean;
  onComplete: (itemId: string, forcePurchased?: boolean) => void;
  onDelete?: (itemId: string) => void;
  onEditQuantity: (item: ShoppingItem) => void;
  onCategoryChange: (itemId: string, categoryId: CategoryId) => void;
  getCategoryName: (id: CategoryId) => string;
  isUrdu: boolean;
}

export const SwipeableShoppingItemCard: React.FC<SwipeableShoppingItemCardProps> = ({
  item,
  isChecked,
  formattedQty,
  justCompletedLocally,
  onComplete,
  onDelete,
  onEditQuantity,
  onCategoryChange,
  getCategoryName,
  isUrdu,
}) => {
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const x = useMotionValue(0);

  // Smooth transforms based on drag direction
  // Swipe Right (>0): Complete (Emerald)
  const completeOpacity = useTransform(x, [10, 45, 90], [0, 0.8, 1]);
  const completeScale = useTransform(x, [10, 50, 95], [0.75, 1, 1.15]);

  // Swipe Left (<0): Delete (Crimson/Rose)
  const deleteOpacity = useTransform(x, [-90, -45, -10], [1, 0.8, 0]);
  const deleteScale = useTransform(x, [-95, -50, -10], [1.15, 1, 0.75]);

  const handleCardClick = () => {
    // If a swipe gesture occurred, suppress the synthetic tap/click event
    if (isDraggingRef.current || Math.abs(dragDistanceRef.current) > 6) {
      dragDistanceRef.current = 0;
      return;
    }
    // Instant tap-to-complete response
    onComplete(item.id);
  };

  return (
    <div
      id={`shopping-item-wrapper-${item.id}`}
      className="relative overflow-hidden rounded-2xl select-none touch-pan-y"
    >
      {/* Background Directional Feedback Layer */}
      {/* 1. Complete Background (Revealed on Swipe Right) */}
      <motion.div
        style={{ opacity: completeOpacity }}
        aria-hidden="true"
        className="absolute inset-0 bg-[#0F3D2E] rounded-2xl flex items-center justify-start px-4 text-white pointer-events-none"
      >
        <motion.div
          style={{ scale: completeScale }}
          className="flex items-center gap-2 font-['Manrope']"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shadow-xs">
            <Check className="w-4 h-4 text-emerald-100 stroke-[3]" />
          </div>
          <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">
            {isUrdu ? '✓ مکمل' : '✓ Complete'}
          </span>
        </motion.div>
      </motion.div>

      {/* 2. Delete Background (Revealed on Swipe Left) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        aria-hidden="true"
        className="absolute inset-0 bg-[#881337] rounded-2xl flex items-center justify-end px-4 text-white pointer-events-none"
      >
        <motion.div
          style={{ scale: deleteScale }}
          className="flex items-center gap-2 font-['Manrope']"
        >
          <span className="text-xs font-bold tracking-wider text-rose-100 uppercase">
            {isUrdu ? 'حذف کریں' : 'Delete'}
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-500/30 border border-rose-400/40 flex items-center justify-center shadow-xs">
            <Trash2 className="w-4 h-4 text-rose-100 stroke-[2.5]" />
          </div>
        </motion.div>
      </motion.div>

      {/* Foreground Draggable & Tappable Item Card */}
      <motion.div
        id={`shopping-item-card-${item.id}`}
        tabIndex={0}
        role="button"
        aria-pressed={isChecked}
        aria-label={`${item.name}, ${isChecked ? 'completed' : 'not completed'}. Tap to toggle, swipe right to complete, swipe left to delete.`}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.45, right: 0.45 }}
        dragTransition={{ bounceStiffness: 480, bounceDamping: 28 }}
        onDragStart={() => {
          isDraggingRef.current = true;
          dragDistanceRef.current = 0;
        }}
        onDrag={(_e, info) => {
          dragDistanceRef.current = info.offset.x;
        }}
        onDragEnd={(_e, info) => {
          const offsetX = info.offset.x;
          const velocityX = info.velocity.x;

          // Swipe Right -> Complete / Buy
          if (offsetX > 60 || velocityX > 260) {
            onComplete(item.id, true);
          }
          // Swipe Left -> Delete with safety undo
          else if (offsetX < -60 || velocityX < -260) {
            if (onDelete) {
              onDelete(item.id);
            }
          }

          setTimeout(() => {
            isDraggingRef.current = false;
            dragDistanceRef.current = 0;
          }, 100);
        }}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onComplete(item.id);
          }
        }}
        animate={
          justCompletedLocally
            ? {
                scale: [1, 1.015, 1],
                backgroundColor: ['#ECFDF5', '#F0FDF4', '#F4F4F4'],
                transition: { duration: 0.22, ease: 'easeOut' },
              }
            : {
                scale: 1,
              }
        }
        className={`relative flex items-center justify-between gap-3.5 p-3 rounded-2xl cursor-pointer select-none transition-all duration-180 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isChecked
            ? 'bg-surface-container-low/60 opacity-65 border border-transparent'
            : justCompletedLocally
            ? 'bg-emerald-50/90 border border-emerald-400/50 shadow-xs'
            : 'bg-surface-bright hover:bg-surface-container-low active:bg-surface-container border border-surface-dim/55 shadow-2xs'
        }`}
      >
        {/* Left Side: Check Circle + Visual Icon + Item Name & Category */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Instant Checkmark Transition */}
          <motion.div
            animate={justCompletedLocally ? { scale: [0.8, 1.22, 1], rotate: [0, 6, 0] } : {}}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-180 ${
              isChecked
                ? 'bg-[#0F3D2E] text-white shadow-2xs border border-emerald-800'
                : 'border-2 border-surface-dim hover:border-primary/60 text-transparent'
            }`}
          >
            {isChecked ? (
              <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
            ) : (
              <Circle className="w-2.5 h-2.5 text-transparent" />
            )}
          </motion.div>

          {/* Item Visual Icon */}
          <ItemVisualIcon
            name={item.name}
            canonicalName={item.canonicalName || item.canonical_name}
            displayName={item.name}
            categoryId={item.categoryId}
            size={38}
            className={`w-9 h-9 rounded-xl shrink-0 transition-opacity duration-180 ${
              isChecked ? 'opacity-50 grayscale-[35%]' : 'opacity-100'
            }`}
          />

          {/* Name & Subtle Strike-through */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap" dir="auto">
              <BidiText
                as="span"
                className={`font-['Newsreader'] text-base font-semibold leading-snug tracking-tight transition-all duration-180 ${
                  isChecked
                    ? 'line-through text-outline opacity-60'
                    : 'text-on-surface'
                }`}
              >
                {item.name}
              </BidiText>
              {item.nameUrdu && (
                <span
                  className={`font-urdu text-xs transition-opacity duration-180 ${
                    isChecked ? 'opacity-50 text-outline' : 'text-on-surface-variant font-normal'
                  }`}
                >
                  ({item.nameUrdu})
                </span>
              )}
            </div>

            {/* Sub-details: Category selector + raw input */}
            <div
              className="flex items-center gap-1.5 flex-wrap mt-0.5"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <select
                value={item.categoryId || 'uncategorized'}
                onChange={(e) => onCategoryChange(item.id, e.target.value as CategoryId)}
                aria-label={`Change category for ${item.name}`}
                className={`text-[10px] font-['Manrope'] font-medium px-1.5 py-0.5 rounded-md border outline-none cursor-pointer transition-colors ${
                  item.categoryId === 'uncategorized'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-dim/80'
                }`}
              >
                {CATEGORIES_LIST.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryName(c.id)}
                  </option>
                ))}
              </select>
              {item.categoryId === 'uncategorized' && (
                <span className="text-[10px] font-['Manrope'] text-amber-600 dark:text-amber-400 font-semibold">
                  Tap to assign
                </span>
              )}
              {item.rawInput &&
                item.rawInput.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                  <span className="text-[10px] font-['Manrope'] text-outline opacity-70 truncate max-w-[120px]">
                    • typed: "<bdi>{item.rawInput}</bdi>"
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Right Side: Quantity & Unit Badge */}
        {formattedQty ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditQuantity(item);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Tap to change quantity or unit"
            className={`font-['Manrope'] tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all active:scale-95 cursor-pointer ${
              isChecked
                ? 'bg-surface-container text-outline hover:bg-surface-container-high'
                : 'bg-surface-container-high hover:bg-surface-container text-primary border border-surface-dim shadow-2xs'
            }`}
          >
            <bdi dir="ltr">{formattedQty}</bdi>
          </button>
        ) : !isChecked ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditQuantity(item);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Add quantity"
            className="text-[11px] font-['Manrope'] font-semibold text-outline hover:text-primary px-2 py-0.5 rounded-md hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
          >
            + qty
          </button>
        ) : null}
      </motion.div>
    </div>
  );
};
