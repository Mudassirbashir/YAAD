import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside a specified element ref.
 * - Handles both mouse clicks and touch events.
 * - Supports an optional triggerRef so clicking the original trigger toggles/handles cleanly
 *   without firing an accidental double-toggle or unexpected navigation.
 * - Prevents accidental background navigation when closing overlays.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  triggerRef?: RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!target) return;

      // Do nothing if clicking inside the referenced menu/popover element
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      // Do nothing if clicking the original trigger element (let trigger's own handler execute)
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }

      handler(event);
    };

    // Use mousedown and touchstart to capture clicks before navigation changes happen
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, triggerRef, enabled]);
}
