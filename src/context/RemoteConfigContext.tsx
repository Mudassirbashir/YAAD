import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RemoteConfigDocument,
  DEFAULT_REMOTE_CONFIG,
  FixedEssentialItem,
  TargetedUserMessage,
} from '../types/remoteConfig';
import { useAuth } from './AuthContext';

interface RemoteConfigContextValue {
  config: RemoteConfigDocument;
  isLoading: boolean;
  userStatus: 'active' | 'suspended' | 'blocked';
  isReadOnly: boolean;
  targetedMessages: TargetedUserMessage[];
  dismissMessage: (messageId: string) => void;
  refetchConfig: () => Promise<void>;
  isControlVisible: (path: string) => boolean;
  isActionAllowed: (actionKey: string) => boolean;
  essentialsList: FixedEssentialItem[];
}

const CACHE_KEY = 'yaad_remote_config_cache';
const DISMISSED_MESSAGES_KEY = 'yaad_dismissed_targeted_msgs';
const FOCUS_REFETCH_MIN_INTERVAL_MS = 60_000;

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (!deepEqual(objA[key], objB[key])) return false;
  }
  return true;
}

const RemoteConfigContext = createContext<RemoteConfigContextValue>({
  config: DEFAULT_REMOTE_CONFIG,
  isLoading: false,
  userStatus: 'active',
  isReadOnly: false,
  targetedMessages: [],
  dismissMessage: () => {},
  refetchConfig: async () => {},
  isControlVisible: () => true,
  isActionAllowed: () => true,
  essentialsList: DEFAULT_REMOTE_CONFIG.essentials.fixedList,
});

function mergeWithDefaults(rawConfig: Partial<RemoteConfigDocument>): RemoteConfigDocument {
  return {
    ...DEFAULT_REMOTE_CONFIG,
    ...rawConfig,
    header: { ...DEFAULT_REMOTE_CONFIG.header, ...(rawConfig.header || {}) },
    home: { ...DEFAULT_REMOTE_CONFIG.home, ...(rawConfig.home || {}) },
    bottomNav: { ...DEFAULT_REMOTE_CONFIG.bottomNav, ...(rawConfig.bottomNav || {}) },
    screens: { ...DEFAULT_REMOTE_CONFIG.screens, ...(rawConfig.screens || {}) },
    settings: { ...DEFAULT_REMOTE_CONFIG.settings, ...(rawConfig.settings || {}) },
    features: { ...DEFAULT_REMOTE_CONFIG.features, ...(rawConfig.features || {}) },
    essentials: { ...DEFAULT_REMOTE_CONFIG.essentials, ...(rawConfig.essentials || {}) },
    system: { ...DEFAULT_REMOTE_CONFIG.system, ...(rawConfig.system || {}) },
    abuse: { ...DEFAULT_REMOTE_CONFIG.abuse, ...(rawConfig.abuse || {}) },
  };
}

function loadCachedConfig(): {
  config: RemoteConfigDocument;
  userStatus: 'active' | 'suspended' | 'blocked';
  isReadOnly: boolean;
  targetedMessages: TargetedUserMessage[];
} {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.config) {
        return {
          config: mergeWithDefaults(parsed.config),
          userStatus: parsed.userStatus || 'active',
          isReadOnly: Boolean(parsed.isReadOnly),
          targetedMessages: Array.isArray(parsed.targetedMessages) ? parsed.targetedMessages : [],
        };
      }
    }
  } catch {}

  return {
    config: DEFAULT_REMOTE_CONFIG,
    userStatus: 'active',
    isReadOnly: false,
    targetedMessages: [],
  };
}

export const RemoteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [cachedData] = useState(() => loadCachedConfig());
  const [config, setConfig] = useState<RemoteConfigDocument>(cachedData.config);
  const [userStatus, setUserStatus] = useState<'active' | 'suspended' | 'blocked'>(cachedData.userStatus);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(cachedData.isReadOnly);
  const [targetedMessages, setTargetedMessages] = useState<TargetedUserMessage[]>(cachedData.targetedMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const configRef = useRef<RemoteConfigDocument>(config);
  const userStatusRef = useRef<'active' | 'suspended' | 'blocked'>(userStatus);
  const isReadOnlyRef = useRef<boolean>(isReadOnly);
  const targetedMessagesRef = useRef<TargetedUserMessage[]>(targetedMessages);
  const lastSuccessfulFetchRef = useRef<number>(0);

  configRef.current = config;
  userStatusRef.current = userStatus;
  isReadOnlyRef.current = isReadOnly;
  targetedMessagesRef.current = targetedMessages;

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchConfig = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    try {
      const url = userId ? `/api/public/config?userId=${encodeURIComponent(userId)}` : '/api/public/config';
      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.config) {
        lastSuccessfulFetchRef.current = Date.now();

        const mergedConfig = mergeWithDefaults(data.config);

        const nextUserStatus: 'active' | 'suspended' | 'blocked' = data.userStatus || 'active';
        const nextIsReadOnly = Boolean(data.isReadOnly);
        const nextMessages: TargetedUserMessage[] = Array.isArray(data.targetedMessages)
          ? data.targetedMessages
          : [];

        let hasChanged = false;

        if (!deepEqual(configRef.current, mergedConfig)) {
          configRef.current = mergedConfig;
          setConfig(mergedConfig);
          hasChanged = true;
        }
        if (userStatusRef.current !== nextUserStatus) {
          userStatusRef.current = nextUserStatus;
          setUserStatus(nextUserStatus);
          hasChanged = true;
        }
        if (isReadOnlyRef.current !== nextIsReadOnly) {
          isReadOnlyRef.current = nextIsReadOnly;
          setIsReadOnly(nextIsReadOnly);
          hasChanged = true;
        }
        if (!deepEqual(targetedMessagesRef.current, nextMessages)) {
          targetedMessagesRef.current = nextMessages;
          setTargetedMessages(nextMessages);
          hasChanged = true;
        }

        if (hasChanged) {
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                config: mergedConfig,
                userStatus: nextUserStatus,
                isReadOnly: nextIsReadOnly,
                targetedMessages: nextMessages,
                cachedAt: Date.now(),
              })
            );
          } catch {}
        }
      }
    } catch (err) {
      // Fail-open: network error maintains current config or default
      console.warn('[RemoteConfig] Background refresh failed, using cached config:', err);
    } finally {
      setIsLoading((prev) => (prev ? false : prev));
    }
  }, [userId]);

  // Initial fetch on mount & whenever user changes
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Poll in background every 30s (only when online), throttle focus refetch (>60s), resume on online
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return;
      }
      fetchConfig();
    }, 30_000);

    const handleFocus = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return;
      }
      if (Date.now() - lastSuccessfulFetchRef.current > FOCUS_REFETCH_MIN_INTERVAL_MS) {
        fetchConfig();
      }
    };

    const handleOnline = () => {
      fetchConfig();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchConfig]);

  const dismissMessage = useCallback((messageId: string) => {
    setDismissedIds((prev) => {
      const next = [...prev, messageId];
      try {
        localStorage.setItem(DISMISSED_MESSAGES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const activeTargetedMessages = useMemo(() => {
    return targetedMessages.filter((m) => !dismissedIds.includes(m.id));
  }, [targetedMessages, dismissedIds]);

  /**
   * Evaluates if a given control path is visible.
   * Path example: "header.showSettingsGear" or "home.showHeroCard"
   * Defaults to TRUE (fail-open) if not explicitly set to false.
   */
  const isControlVisible = useCallback(
    (path: string): boolean => {
      if (!path) return true;
      const parts = path.split('.');
      let current: unknown = config;
      for (const part of parts) {
        if (current === undefined || current === null || typeof current !== 'object') return true;
        current = (current as Record<string, unknown>)[part];
      }
      return current !== false;
    },
    [config]
  );

  /**
   * Evaluates if an action or feature is allowed.
   * If readOnly is true and the action is a mutation action, returns false.
   */
  const isActionAllowed = useCallback(
    (actionKey: string): boolean => {
      if (isReadOnly) {
        // Block all write actions in read-only mode
        if (
          actionKey.startsWith('action_') ||
          actionKey === 'create_list' ||
          actionKey === 'edit_list' ||
          actionKey === 'delete_list' ||
          actionKey === 'add_item' ||
          actionKey === 'delete_item'
        ) {
          return false;
        }
      }

      // Check features object
      const features = config.features as unknown as Record<string, unknown> | undefined;
      const val = features?.[actionKey];
      return val !== false;
    },
    [config, isReadOnly]
  );

  const essentialsList = useMemo(() => {
    if (config.essentials?.fixedList && Array.isArray(config.essentials.fixedList) && config.essentials.fixedList.length > 0) {
      return config.essentials.fixedList;
    }
    return DEFAULT_REMOTE_CONFIG.essentials.fixedList;
  }, [config.essentials?.fixedList]);

  const value = useMemo(
    () => ({
      config,
      isLoading,
      userStatus,
      isReadOnly,
      targetedMessages: activeTargetedMessages,
      dismissMessage,
      refetchConfig: fetchConfig,
      isControlVisible,
      isActionAllowed,
      essentialsList,
    }),
    [
      config,
      isLoading,
      userStatus,
      isReadOnly,
      activeTargetedMessages,
      dismissMessage,
      fetchConfig,
      isControlVisible,
      isActionAllowed,
      essentialsList,
    ]
  );

  return <RemoteConfigContext.Provider value={value}>{children}</RemoteConfigContext.Provider>;
};

export const useRemoteConfig = () => useContext(RemoteConfigContext);
