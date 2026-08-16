"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, X, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { usePWA } from "../../lib/hooks/usePWA";
import { usePlayerStore } from "../../store/playerStore";

export default function PWAManager() {
  const {
    isOnline,
    hasUpdate,
    isUpdating,
    applyUpdate,
    isInstallable,
    promptInstall,
  } = usePWA();

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentSong = usePlayerStore((state) => state.currentSong);

  const [dismissedUpdate, setDismissedUpdate] = useState(false);
  const [dismissedOffline, setDismissedOffline] = useState(false);
  const [dismissedInstallBanner, setDismissedInstallBanner] = useState(false);

  // Reset offline dismissal when coming back online
  useEffect(() => {
    if (isOnline) {
      setDismissedOffline(false);
    }
  }, [isOnline]);

  return (
    <>
      {/* 1. OFFLINE STATUS NOTIFICATION */}
      {!isOnline && !dismissedOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-0 right-0 z-50 px-4 md:px-10 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-base"
        >
          <div className="max-w-4xl mx-auto bg-melora-surfaceLayer/95 backdrop-blur-[20px] border border-melora-pink/30 rounded-2xl p-3 md:p-4 shadow-soft pointer-events-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-melora-pink/10 border border-melora-pink/20 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4 text-melora-pink" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs md:text-sm font-semibold truncate">
                  You are currently offline
                </p>
                <p className="text-melora-textSecondary text-[11px] md:text-xs truncate">
                  Cached music and visited screens remain accessible. Reconnecting automatically...
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissedOffline(true)}
              aria-label="Dismiss offline banner"
              className="p-1.5 rounded-full hover:bg-white/10 text-melora-textMuted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. APP UPDATE NOTIFICATION */}
      {hasUpdate && !dismissedUpdate && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-24 md:bottom-28 right-4 md:right-8 z-50 max-w-md w-full px-2 animate-in fade-in slide-in-from-bottom-5 duration-base"
        >
          <div className="bg-melora-cardElevated/95 backdrop-blur-[24px] border border-melora-purple/40 rounded-panel p-5 shadow-glow space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-01 flex items-center justify-center text-white shadow-soft shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">New Version Available</h4>
                  <p className="text-xs text-melora-textSecondary">
                    A fresh update with improvements is ready.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDismissedUpdate(true)}
                aria-label="Dismiss update notification"
                className="p-1 rounded-full hover:bg-white/10 text-melora-textMuted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isPlaying && currentSong && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-melora-orange/10 border border-melora-orange/20 text-xs text-melora-orange">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Playing: &quot;{currentSong.title}&quot;. You can update now or continue listening.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setDismissedUpdate(true)}
                className="px-4 py-2 text-xs font-semibold text-melora-textSecondary hover:text-white transition-colors"
              >
                Later
              </button>

              <button
                onClick={applyUpdate}
                disabled={isUpdating}
                className="px-4 py-2 rounded-full bg-gradient-01 hover:opacity-90 text-white text-xs font-bold shadow-soft transition-all duration-base flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                <span>{isUpdating ? "Updating..." : "Update Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOBILE DISCOVERABILITY BANNER (Only when installable and on mobile) */}
      {isInstallable && !dismissedInstallBanner && (
        <div className="block lg:hidden fixed bottom-24 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-base">
          <div className="bg-melora-surfaceLayer/95 backdrop-blur-[20px] border border-white/10 rounded-card p-3 shadow-glow flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-01 flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Install Melora App</p>
                <p className="text-[10px] text-melora-textSecondary truncate">
                  Offline playback & smoother streaming
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={promptInstall}
                className="px-3 py-1.5 bg-gradient-01 text-white text-xs font-bold rounded-full shadow-soft flex items-center gap-1"
              >
                <span>Install</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setDismissedInstallBanner(true)}
                aria-label="Dismiss install prompt"
                className="p-1 text-melora-textMuted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
