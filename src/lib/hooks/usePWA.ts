"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePlayerStore } from "../../store/playerStore";

// Interface for BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  // Check if running in standalone/installed mode
  const checkIsInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");
    return isStandalone;
  }, []);

  // Register service worker and listen for updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial state
    setIsOnline(navigator.onLine);
    setIsInstalled(checkIsInstalled());

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default mini-infobar on mobile
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setIsInstallable(false);
      setIsInstalled(true);
      console.log("[Melora PWA] Application successfully installed.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[Melora PWA] Service Worker registered with scope:", registration.scope);

          // If a waiting worker already exists on initial load
          if (registration.waiting) {
            waitingWorkerRef.current = registration.waiting;
            setHasUpdate(true);
          }

          // Listen for newly installed workers
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New update is available and waiting
                waitingWorkerRef.current = newWorker;
                setHasUpdate(true);
                console.log("[Melora PWA] New version is available and ready to install.");
              }
            });
          });
        })
        .catch((error) => {
          console.warn("[Melora PWA] Service Worker registration failed:", error);
        });

      // Reload when controller changes after skipWaiting
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [checkIsInstalled]);

  // Trigger the installation prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPromptRef.current) {
      return false;
    }

    try {
      await deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      
      if (choiceResult.outcome === "accepted") {
        console.log("[Melora PWA] User accepted the install prompt.");
        setIsInstallable(false);
        deferredPromptRef.current = null;
        return true;
      } else {
        console.log("[Melora PWA] User dismissed the install prompt.");
        return false;
      }
    } catch (err) {
      console.warn("[Melora PWA] Error triggering install prompt:", err);
      return false;
    }
  }, []);

  // Apply service worker update safely
  const applyUpdate = useCallback(() => {
    const isPlaying = usePlayerStore.getState().isPlaying;

    if (isPlaying) {
      console.log("[Melora PWA] Song is playing. Updating with safe handover.");
    }

    setIsUpdating(true);

    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
    } else if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  }, []);

  return {
    isOnline,
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    hasUpdate,
    isUpdating,
    promptInstall,
    applyUpdate,
  };
}
