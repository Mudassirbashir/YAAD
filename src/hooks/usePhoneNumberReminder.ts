import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, ScreenType } from '../types';

export interface UsePhoneNumberReminderOptions {
  user: User | null;
  profile: UserProfile | null;
  currentScreen: ScreenType;
  isTourActive?: boolean;
  isAuthModalOpen?: boolean;
  hasOnboarded?: boolean;
  onOpenPhoneSettings: () => void;
}

// Sensible timing constants:
// Immediate appearance on Home for email users without phone: 1.2 seconds
// Cooldown between reminders when dismissed ("Not Now"): 10 minutes (600,000 ms)
// Minimum buffer on fresh page reload: 1.2 seconds
const INITIAL_DELAY_MS = 1200;
const COOLDOWN_MS = 10 * 60 * 1000;
const PAGE_LOAD_BUFFER_MS = 1200;

export function checkUserHasPhone(
  profile: UserProfile | null,
  user: User | null
): boolean {
  if (!user) return false;

  const profilePhone = (
    profile?.phone_number ||
    profile?.phone ||
    ''
  ).trim();
  if (profilePhone.length > 0) return true;

  const userPhone = (
    user.phone ||
    user.user_metadata?.phone_number ||
    user.user_metadata?.phone ||
    ''
  ).trim();
  if (userPhone.length > 0) return true;

  return false;
}

export function usePhoneNumberReminder({
  user,
  profile,
  currentScreen,
  isTourActive = false,
  isAuthModalOpen = false,
  hasOnboarded = true,
  onOpenPhoneSettings,
}: UsePhoneNumberReminderOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isPendingRef = useRef<boolean>(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Check if user has a verified/persisted phone number
  const hasPhone = checkUserHasPhone(profile, user);

  // Screens and states where reminder should appear:
  // ONLY when user is on Home screen, not in a tour, not in auth modal, and has completed onboarding
  const isSafeScreen =
    !isTourActive &&
    !isAuthModalOpen &&
    hasOnboarded &&
    currentScreen === 'home';

  const storageKey = user?.id ? `yaad_phone_reminder_cooldown_${user.id}` : null;

  // Clear existing scheduled timer safely
  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Main evaluation and scheduling effect
  useEffect(() => {
    // 1. If not authenticated or user already has a phone number:
    // NEVER show the reminder and tear down all timers.
    if (!user || hasPhone) {
      clearCurrentTimer();
      setIsOpen(false);
      isPendingRef.current = false;
      return;
    }

    if (!storageKey) return;

    // 2. Read existing cooldown timestamp from localStorage
    let nextAllowedTimestamp = 0;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        nextAllowedTimestamp = parseInt(stored, 10) || 0;
      }
    } catch {
      nextAllowedTimestamp = 0;
    }

    const now = Date.now();

    // If no cooldown timestamp was ever set, initialize it with the 5-minute first prompt delay
    if (!nextAllowedTimestamp) {
      nextAllowedTimestamp = now + INITIAL_DELAY_MS;
      try {
        localStorage.setItem(storageKey, nextAllowedTimestamp.toString());
      } catch {}
    }

    // Calculate delay until next prompt
    let delay = Math.max(0, nextAllowedTimestamp - now);

    // If cooldown has already passed, ensure at least PAGE_LOAD_BUFFER_MS from page load
    // so user is not interrupted instantly upon refresh or login
    const timeSinceMount = now - mountTimeRef.current;
    if (delay < PAGE_LOAD_BUFFER_MS && timeSinceMount < PAGE_LOAD_BUFFER_MS) {
      delay = Math.max(delay, PAGE_LOAD_BUFFER_MS - timeSinceMount);
    }

    // Clean up any stale timer before scheduling new one (prevents duplicate timers)
    clearCurrentTimer();

    // 3. Schedule the reminder
    timerRef.current = window.setTimeout(() => {
      // Re-check persisted phone status before presenting
      const currentHasPhone = checkUserHasPhone(profile, user);
      if (currentHasPhone) {
        setIsOpen(false);
        return;
      }

      // Check if current screen is safe
      if (isSafeScreen) {
        setIsOpen(true);
        isPendingRef.current = false;
      } else {
        // If user is currently busy (shopping, settings, completion, etc.),
        // defer the reminder until they transition back to a safe screen
        isPendingRef.current = true;
      }
    }, delay);

    return () => {
      clearCurrentTimer();
    };
  }, [user, hasPhone, storageKey, isSafeScreen, profile, clearCurrentTimer]);

  // If a reminder became pending while the user was busy, show it once they return to a safe screen
  useEffect(() => {
    if (isPendingRef.current && isSafeScreen && user && !hasPhone && !isOpen) {
      // Verify that cooldown is actually satisfied
      let nextAllowedTimestamp = 0;
      if (storageKey) {
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) nextAllowedTimestamp = parseInt(stored, 10) || 0;
        } catch {}
      }

      if (Date.now() >= nextAllowedTimestamp) {
        setIsOpen(true);
        isPendingRef.current = false;
      }
    }
  }, [isSafeScreen, user, hasPhone, isOpen, storageKey]);

  // If user enters a non-safe screen while modal was open, close it gracefully
  useEffect(() => {
    if (isOpen && !isSafeScreen) {
      setIsOpen(false);
      isPendingRef.current = true;
    }
  }, [isOpen, isSafeScreen]);

  // User taps "Not Now" or dismisses
  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    isPendingRef.current = false;

    // Apply sensible cooldown (~7 minutes of active app usage)
    if (storageKey) {
      const nextAllowed = Date.now() + COOLDOWN_MS;
      try {
        localStorage.setItem(storageKey, nextAllowed.toString());
      } catch {}
    }

    // Reschedule next check
    clearCurrentTimer();
    timerRef.current = window.setTimeout(() => {
      if (isSafeScreen && user && !hasPhone) {
        setIsOpen(true);
      } else {
        isPendingRef.current = true;
      }
    }, COOLDOWN_MS);
  }, [storageKey, isSafeScreen, user, hasPhone, clearCurrentTimer]);

  // User taps "Add Number"
  const handleAddNumber = useCallback(() => {
    setIsOpen(false);
    isPendingRef.current = false;

    // Set a generous cooldown so they aren't interrupted while in settings
    if (storageKey) {
      const nextAllowed = Date.now() + 15 * 60 * 1000;
      try {
        localStorage.setItem(storageKey, nextAllowed.toString());
      } catch {}
    }

    clearCurrentTimer();
    onOpenPhoneSettings();
  }, [storageKey, clearCurrentTimer, onOpenPhoneSettings]);

  // Expose convenient test hooks on window for developer/automated testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__yaad_phone_reminder_test = {
        trigger: () => {
          if (!hasPhone) {
            setIsOpen(true);
          }
        },
        resetCooldown: () => {
          if (storageKey) {
            localStorage.removeItem(storageKey);
          }
          setIsOpen(false);
          isPendingRef.current = false;
        },
        getState: () => ({
          hasPhone,
          isOpen,
          isPending: isPendingRef.current,
          isSafeScreen,
          storageKey,
        }),
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__yaad_phone_reminder_test;
      }
    };
  }, [hasPhone, isOpen, isSafeScreen, storageKey]);

  return {
    isOpen,
    hasPhone,
    handleDismiss,
    handleAddNumber,
  };
}
