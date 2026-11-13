import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { ShoppingList } from '../types';
import { Language } from '../translations';
import { setPerfCountdownActive } from '../lib/perfMeter';

interface AutoFinishCountdownBannerProps {
  targetList: ShoppingList | null;
  language: Language;
  onUndo: () => void;
  onFinishNow: (targetList: ShoppingList) => void;
}

/**
 * Isolated 8-second auto-finish countdown banner.
 * Owns the 1-second remainingSeconds state so ticks only re-render this small
 * banner rather than the entire ShoppingListView and its item cards.
 */
export const AutoFinishCountdownBanner: React.FC<AutoFinishCountdownBannerProps> = React.memo(
  ({ targetList, language, onUndo, onFinishNow }) => {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(8);
    const onFinishNowRef = useRef(onFinishNow);
    onFinishNowRef.current = onFinishNow;

    useEffect(() => {
      if (!targetList) {
        setPerfCountdownActive(false);
        return;
      }

      setRemainingSeconds(8);
      setPerfCountdownActive(true);

      const intervalId = setInterval(() => {
        setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);

      const timeoutId = setTimeout(() => {
        onFinishNowRef.current(targetList);
      }, 8000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        setPerfCountdownActive(false);
      };
    }, [targetList]);

    return (
      <AnimatePresence>
        {targetList && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="sticky top-16 z-30 mx-4 sm:mx-6 md:mx-8 mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#0F3D2E] to-emerald-800 text-white shadow-xl border border-emerald-400/30 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold font-display truncate">
                  {language === 'ur' ? 'تمام اشیاء مکمل ہو گئیں! 🎉' : 'All items checked! Trip complete 🎉'}
                </span>
                <span className="text-[11px] text-white/80">
                  {language === 'ur'
                    ? `${remainingSeconds} سیکنڈ میں خودکار اختتام...`
                    : `Finishing in ${remainingSeconds}s...`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onUndo}
                className="px-3.5 py-1.5 rounded-full bg-white text-primary text-xs font-bold hover:bg-neutral-100 active:scale-95 transition-[transform,background-color] duration-150 cursor-pointer shadow-xs"
              >
                {language === 'ur' ? 'منسوخ (Undo)' : 'Undo'}
              </button>
              <button
                type="button"
                onClick={() => onFinishNow(targetList)}
                className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95 transition-[transform,background-color] duration-150 cursor-pointer shadow-xs"
              >
                {language === 'ur' ? 'ابھی ختم کریں' : 'Finish Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

AutoFinishCountdownBanner.displayName = 'AutoFinishCountdownBanner';
