"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoadingScreen } from ".";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingCount, setPendingCount] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const showDelayTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef(0);
  const isFirstRouteRenderRef = useRef(true);
  const isLoading = pendingCount > 0;

  const startLoading = useCallback(() => {
    setPendingCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setPendingCount((count) => Math.max(0, count - 1));
  }, []);

  // Initial app boot loading.
  useEffect(() => {
    startLoading();
    const timer = window.setTimeout(() => {
      stopLoading();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [startLoading, stopLoading]);

  // Start loading BEFORE route transition for internal links and history navigation.
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;
      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash
      ) {
        return;
      }

      startLoading();
    };

    const handlePopState = () => {
      startLoading();
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startLoading]);

  // Complete loading AFTER route settles.
  useEffect(() => {
    const routeSignal = `${pathname}?${searchParams.toString()}`;
    void routeSignal;

    if (isFirstRouteRenderRef.current) {
      isFirstRouteRenderRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      stopLoading();
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, searchParams, stopLoading]);

  // Delayed show / smooth hide to avoid flicker.
  useEffect(() => {
    if (isLoading) {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (!showLoading && showDelayTimerRef.current === null) {
        showDelayTimerRef.current = window.setTimeout(() => {
          shownAtRef.current = Date.now();
          setShowLoading(true);
          showDelayTimerRef.current = null;
        }, 120);
      }
      return;
    }

    if (showDelayTimerRef.current !== null) {
      window.clearTimeout(showDelayTimerRef.current);
      showDelayTimerRef.current = null;
    }

    if (!showLoading) {
      return;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const minVisibleMs = 220;
    const remaining = Math.max(0, minVisibleMs - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setShowLoading(false);
      hideTimerRef.current = null;
    }, remaining);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isLoading, showLoading]);

  useEffect(() => {
    return () => {
      if (showDelayTimerRef.current !== null) {
        window.clearTimeout(showDelayTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {showLoading && <LoadingScreen />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
