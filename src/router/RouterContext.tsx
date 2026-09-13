import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { parseRoute, ParsedRoute, normalizePathname, buildCanonicalPath, AppRouteId } from './routes';

interface RouterContextValue {
  currentPath: string;
  route: ParsedRoute;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  replace: (to: string) => void;
  goBack: () => void;
  saveIntendedDestination: (path: string) => void;
  getIntendedDestination: () => string | null;
  clearIntendedDestination: () => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

const STORAGE_INTENDED_DESTINATION = 'yaad_intended_destination';

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialPath = (): string => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Parse current route
  const route = useMemo<ParsedRoute>(() => {
    return parseRoute(currentPath);
  }, [currentPath]);

  // Synchronize on browser popstate (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname || '/';
      setCurrentPath(newPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;

    const normalizedTarget = normalizePathname(to);
    const currentNormalized = normalizePathname(window.location.pathname || '/');

    if (normalizedTarget === currentNormalized && !options?.replace) {
      // Avoid duplicate history stack entries for identical URLs
      return;
    }

    try {
      if (options?.replace) {
        window.history.replaceState(null, '', normalizedTarget);
      } else {
        window.history.pushState(null, '', normalizedTarget);
      }
    } catch {
      // Fallback
    }

    setCurrentPath(normalizedTarget);
  }, []);

  const replace = useCallback((to: string) => {
    navigate(to, { replace: true });
  }, [navigate]);

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/home');
    }
  }, [navigate]);

  const saveIntendedDestination = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    try {
      const norm = normalizePathname(path);
      // Only save if it is a meaningful non-auth protected path
      if (norm !== '/auth' && norm !== '/login' && norm !== '/reset-password' && norm !== '/') {
        sessionStorage.setItem(STORAGE_INTENDED_DESTINATION, norm);
      }
    } catch (e) {
      console.warn('Notice saving intended destination:', e);
    }
  }, []);

  const getIntendedDestination = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem(STORAGE_INTENDED_DESTINATION);
      if (saved && saved !== '/auth' && saved !== '/login') {
        return saved;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const clearIntendedDestination = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(STORAGE_INTENDED_DESTINATION);
    } catch {}
  }, []);

  const value = useMemo<RouterContextValue>(() => ({
    currentPath,
    route,
    navigate,
    replace,
    goBack,
    saveIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
  }), [
    currentPath,
    route,
    navigate,
    replace,
    goBack,
    saveIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
  ]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export function useAppRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useAppRouter must be used within a RouterProvider');
  }
  return ctx;
}
