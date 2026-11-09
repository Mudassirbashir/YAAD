import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
          config: { ...DEFAULT_REMOTE_CONFIG, ...parsed.config },
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

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchConfig = useCallback(async () => {
    try {
      const url = userId ? `/api/public/config?userId=${encodeURIComponent(userId)}` : '/api/public/config';
      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.config) {
        const mergedConfig: RemoteConfigDocument = {
          ...DEFAULT_REMOTE_CONFIG,
          ...data.config,
          header: { ...DEFAULT_REMOTE_CONFIG.header, ...(data.config.header || {}) },
          home: { ...DEFAULT_REMOTE_CONFIG.home, ...(data.config.home || {}) },
          bottomNav: { ...DEFAULT_REMOTE_CONFIG.bottomNav, ...(data.config.bottomNav || {}) },
          screens: { ...DEFAULT_REMOTE_CONFIG.screens, ...(data.config.screens || {}) },
          settings: { ...DEFAULT_REMOTE_CONFIG.settings, ...(data.config.settings || {}) },
          features: { ...DEFAULT_REMOTE_CONFIG.features, ...(data.config.features || {}) },
          essentials: { ...DEFAULT_REMOTE_CONFIG.essentials, ...(data.config.essentials || {}) },
          system: { ...DEFAULT_REMOTE_CONFIG.system, ...(data.config.system || {}) },
          abuse: { ...DEFAULT_REMOTE_CONFIG.abuse, ...(data.config.abuse || {}) },
        };

        setConfig(mergedConfig);
        setUserStatus(data.userStatus || 'active');
        setIsReadOnly(Boolean(data.isReadOnly));
        setTargetedMessages(Array.isArray(data.targetedMessages) ? data.targetedMessages : []);

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              config: mergedConfig,
              userStatus: data.userStatus || 'active',
              isReadOnly: Boolean(data.isReadOnly),
              targetedMessages: data.targetedMessages || [],
              cachedAt: Date.now(),
            })
          );
        } catch {}
      }
    } catch (err) {
      // Fail-open: network error maintains current config or default
      console.warn('[RemoteConfig] Background refresh failed, using cached config:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch on mount & whenever user changes
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Poll in background every 30 seconds & on focus/online
  useEffect(() => {
    const interval = setInterval(fetchConfig, 30_000);
    const handleFocus = () => fetchConfig();
    const handleOnline = () => fetchConfig();

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
      let current: any = config;
      for (const part of parts) {
        if (current === undefined || current === null) return true;
        current = current[part];
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
      const val = (config.features as any)?.[actionKey];
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
