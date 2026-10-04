import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { ItemVisualIcon } from './ItemVisualIcon';
import { CategoryIcon } from './CategoryIcon';
import { BidiText } from '../utils/bidi';
import { CelebrationCheckbox } from './CelebrationCheckbox';
import { formatItemTitle } from '../lib/recognition/normalizer';

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

  const itemCatId = (item.categoryId || 'other') as CategoryId;

  return (
    <div
      id={`shopping-item-wrapper-${item.id}`}
      className="relative overflow-hidden rounded-2xl select-none touch-pan-y min-h-[64px] sm:min-h-[70px] w-full shrink-0 flex-shrink-0"
    >
      {/* Background Directional Feedback Layer */}
      {/* 1. Complete Background (Revealed on Swipe Right) */}
      <motion.div
        style={{ opacity: completeOpacity }}
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 rounded-2xl flex items-center justify-start px-4 text-white pointer-events-none"
      >
        <motion.div
          style={{ scale: completeScale }}
          className="flex items-center gap-2 font-['Manrope']"
        >
          <CelebrationCheckbox isChecked={true} size={26} />
          <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">
            ✓ Complete
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
            Delete
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
        dragDirectionLock={true}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.35, right: 0.35 }}
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
                scale: [1, 1.025, 0.995, 1],
                boxShadow: [
                  '0 0 0 0 rgba(16,185,129,0)',
                  '0 0 0 4px rgba(16,185,129,0.28)',
                  '0 0 0 0 rgba(16,185,129,0)',
                ],
                transition: { duration: 0.38, ease: 'easeOut' },
              }
            : {
                scale: 1,
              }
        }
        className={`relative flex items-center justify-between gap-3 py-2.5 px-3.5 rounded-2xl cursor-pointer select-none transition-all duration-200 outline-none w-full min-h-[64px] sm:min-h-[70px] focus-visible:ring-2 focus-visible:ring-primary ${
          isChecked
            ? 'bg-surface-container-low/70 opacity-70 border border-surface-container-high/40'
            : justCompletedLocally
            ? 'bg-emerald-50/95 dark:bg-emerald-950/40 border border-emerald-400/60 shadow-xs'
            : 'bg-surface-bright hover:bg-surface-container-low active:bg-surface-container border border-surface-dim/70 shadow-2xs hover:shadow-xs'
        }`}
      >
        {/* Left Side: Item Logo / Visual Icon + 3-line details (Name, Quantity, Category) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Item Visual Icon */}
          <ItemVisualIcon
            name={item.name}
            canonicalName={item.canonicalName || item.canonical_name}
            displayName={item.name}
            categoryId={itemCatId}
            size={36}
            className={`w-9 h-9 rounded-xl shrink-0 transition-all duration-200 ${
              isChecked
                ? 'opacity-50 grayscale-[35%] scale-95'
                : justCompletedLocally
                ? 'scale-105'
                : 'opacity-100'
            }`}
          />

          {/* 3-Tier Info: Name -> Quantity -> Category */}
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            {/* Line 1: Item Name */}
            <div className="flex items-center gap-1.5 flex-wrap" dir="auto">
              <BidiText
                as="span"
                className={`font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold leading-tight tracking-tight transition-all duration-200 truncate ${
                  isChecked
                    ? 'line-through text-outline opacity-60 decoration-emerald-600/70 dark:decoration-emerald-400/70 decoration-2'
                    : 'text-primary'
                }`}
              >
                {item.name}
              </BidiText>

              {/* Secondary bilingual translation */}
              {item.nameUrdu && !isUrdu && item.nameUrdu !== item.name && (
                <span className="font-urdu text-xs text-on-surface-variant font-normal shrink-0">
                  ({item.nameUrdu})
                </span>
              )}
              {item.canonicalName && isUrdu && formatItemTitle(item.canonicalName.replace(/_/g, ' ')).toLowerCase() !== item.name.toLowerCase() && (
                <span className="font-['Manrope'] text-xs text-on-surface-variant font-medium shrink-0">
                  ({formatItemTitle(item.canonicalName.replace(/_/g, ' '))})
                </span>
              )}
            </div>

            {/* Line 2: Quantity (below name) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditQuantity(item);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-xs font-['Manrope'] font-medium text-primary/80 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer w-fit text-start"
              title="Tap to change quantity"
            >
              <span className="bg-surface-container px-2 py-0.5 rounded-md border border-surface-dim/60 font-semibold text-[11px]">
                {formattedQty || (item.quantity ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}` : '1x')}
              </span>
            </button>

            {/* Line 3: Category (below quantity) */}
            <div
              className="flex items-center gap-1 text-[11px] font-['Manrope'] text-on-surface-variant"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <CategoryIcon
                categoryId={itemCatId}
                className="w-3 h-3 text-primary/70 shrink-0"
              />
              <select
                value={itemCatId}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  onCategoryChange(item.id, e.target.value as CategoryId);
                }}
                aria-label={`Change category for ${item.name}`}
                className="bg-transparent outline-none cursor-pointer hover:text-primary transition-colors truncate max-w-[140px] text-[11px]"
              >
                {CATEGORIES_LIST.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryName(c.id)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Celebration Checkbox for marking completed / bought */}
        <div className="flex items-center gap-2 shrink-0">
          <CelebrationCheckbox
            isChecked={isChecked}
            isJustCompleted={justCompletedLocally}
            size={26}
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(item.id);
            }}
            ariaLabel={`Mark ${item.name} as ${isChecked ? 'incomplete' : 'complete'}`}
          />
        </div>
      </motion.div>
    </div>
  );
};
