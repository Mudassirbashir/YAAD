import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Check, Circle } from 'lucide-react';
import { ShoppingItem, CategoryId, CATEGORIES_LIST } from '../types';
import { ItemVisualIcon } from './ItemVisualIcon';
import { BidiText } from '../utils/bidi';

interface SwipeableShoppingItemCardProps {
  item: ShoppingItem;
  isChecked: boolean;
  formattedQty?: string;
  justCompletedLocally: boolean;
  onComplete: (itemId: string, forcePurchased?: boolean) => void;
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
  onEditQuantity,
  onCategoryChange,
  getCategoryName,
  isUrdu,
}) => {
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const x = useMotionValue(0);

  // Background visual indicators as user drags
  const bgOpacity = useTransform(x, [-110, -35, 0, 35, 110], [1, 0.75, 0, 0.75, 1]);
  const leftIconScale = useTransform(x, [0, 45, 95], [0.7, 1, 1.15]);
  const rightIconScale = useTransform(x, [-95, -45, 0], [1.15, 1, 0.7]);

  const handleCardClick = () => {
    // If a swipe gesture just finished, suppress the synthetic click event
    if (isDraggingRef.current || Math.abs(dragDistanceRef.current) > 8) {
      dragDistanceRef.current = 0;
      return;
    }
    onComplete(item.id);
  };

  return (
    <div
      id={`shopping-item-wrapper-${item.id}`}
      className="relative overflow-hidden rounded-2xl select-none touch-pan-y"
    >
      {/* Background confirmation visual revealed during swipe */}
      <motion.div
        style={{ opacity: bgOpacity }}
        aria-hidden="true"
        className="absolute inset-0 bg-[#0F3D2E] rounded-2xl flex items-center justify-between px-4 text-white pointer-events-none transition-colors duration-150"
      >
        {/* Left swipe indicator (swiping right) */}
        <motion.div
          style={{ scale: leftIconScale }}
          className="flex items-center gap-2 font-['Manrope']"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            {isUrdu ? 'خرید لیا' : 'Purchased'}
          </span>
        </motion.div>

        {/* Right swipe indicator (swiping left) */}
        <motion.div
          style={{ scale: rightIconScale }}
          className="flex items-center gap-2 font-['Manrope']"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            {isUrdu ? 'خرید لیا' : 'Purchased'}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        </motion.div>
      </motion.div>

      {/* Foreground Draggable / Tappable Card */}
      <motion.div
        id={`shopping-item-card-${item.id}`}
        tabIndex={0}
        role="button"
        aria-pressed={isChecked}
        aria-label={`${item.name}, ${isChecked ? 'purchased' : 'not purchased'}. Tap or swipe to toggle.`}
        style={{ x }}
        drag={isChecked ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.65, right: 0.65 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
        onDragStart={() => {
          isDraggingRef.current = true;
          dragDistanceRef.current = 0;
        }}
        onDrag={(_e, info) => {
          dragDistanceRef.current = info.offset.x;
        }}
        onDragEnd={(_e, info) => {
          const offset = Math.abs(info.offset.x);
          const velocity = Math.abs(info.velocity.x);

          if (offset > 60 || velocity > 280) {
            onComplete(item.id, true);
          }

          setTimeout(() => {
            isDraggingRef.current = false;
            dragDistanceRef.current = 0;
          }, 120);
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
                transition: { duration: 0.35, ease: 'easeOut' },
              }
            : {
                scale: 1,
              }
        }
        className={`relative flex items-center justify-between gap-3.5 p-3 rounded-2xl cursor-pointer select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isChecked
            ? 'bg-surface-container-low/65 opacity-65 border border-transparent'
            : justCompletedLocally
            ? 'bg-emerald-50/90 border border-emerald-400/50 shadow-xs'
            : 'bg-surface-bright hover:bg-surface-container-low active:bg-surface-container border border-surface-dim/55 shadow-2xs'
        }`}
      >
        {/* Left Side: Check Circle + Visual Icon + Name & Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Completion Checkmark */}
          <motion.div
            animate={justCompletedLocally ? { scale: [0.85, 1.25, 1], rotate: [0, 8, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
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
            className={`w-9 h-9 rounded-xl shrink-0 transition-opacity duration-200 ${
              isChecked ? 'opacity-50 grayscale-[35%]' : 'opacity-100'
            }`}
          />

          {/* Name & Details */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap" dir="auto">
              <BidiText
                as="span"
                className={`font-['Newsreader'] text-base font-semibold leading-snug tracking-tight transition-all duration-200 ${
                  isChecked
                    ? 'line-through text-outline opacity-60'
                    : 'text-on-surface'
                }`}
              >
                {item.name}
              </BidiText>
              {item.nameUrdu && (
                <span
                  className={`font-urdu text-xs transition-opacity ${
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
              {item.rawInput && item.rawInput.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                <span className="text-[10px] font-['Manrope'] text-outline opacity-70 truncate max-w-[120px]">
                  • typed: "<bdi>{item.rawInput}</bdi>"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quantity & Unit Badge (Tappable to modify) */}
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
