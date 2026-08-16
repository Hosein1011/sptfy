"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Music2, Home, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsChecking(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 md:p-12">
      <div className="max-w-xl w-full bg-melora-surfaceLayer/60 backdrop-blur-[24px] border border-white/10 rounded-panel p-8 md:p-10 shadow-glow text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-melora-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-melora-pink/20 rounded-full blur-3xl pointer-events-none" />

        {/* Status Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-01 p-0.5 shadow-soft flex items-center justify-center">
          <div className="w-full h-full bg-melora-bgPrimary rounded-full flex items-center justify-center">
            {isOnline ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-in fade-in zoom-in duration-base" />
            ) : (
              <WifiOff className="w-10 h-10 text-melora-pink animate-pulse" />
            )}
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-3">
          {isOnline ? "Connection Restored!" : "You're Currently Offline"}
        </h1>

        <p className="text-melora-textSecondary text-sm md:text-base leading-relaxed mb-8">
          {isOnline
            ? "Your internet connection is back. You can now reload to access real-time streams and content."
            : "Melora is operating in offline mode. Cached application shells and previously visited pages remain accessible."}
        </p>

        {/* Offline Features Info Card */}
        <div className="text-left bg-melora-bgSecondary/60 border border-white/5 rounded-card p-5 mb-8 space-y-3">
          <p className="text-xs uppercase font-bold tracking-wider text-melora-textMuted mb-2">
            Offline Capabilities
          </p>

          <div className="flex items-start gap-3 text-sm text-melora-textSecondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Active music player & loaded tracks continue playing seamlessly.</span>
          </div>

          <div className="flex items-start gap-3 text-sm text-melora-textSecondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Previously visited playlists, albums, and navigation shells stay cached.</span>
          </div>

          <div className="flex items-start gap-3 text-sm text-melora-textMuted">
            <AlertCircle className="w-4 h-4 text-melora-orange shrink-0 mt-0.5" />
            <span>Live streaming of uncached audio and server syncing will resume once reconnected.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full sm:w-auto py-3 px-6 text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking Connection..." : "Retry Connection"}
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full py-3 px-6 text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
