"use client";

import React, { useState } from "react";
import { Download, Check, Sparkles } from "lucide-react";
import { usePWA } from "../../lib/hooks/usePWA";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "topbar" | "banner" | "menu" | "compact";
  showText?: boolean;
}

export default function PWAInstallButton({
  className = "",
  variant = "topbar",
  showText = true,
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (!isInstallable && !justInstalled) {
    return null;
  }

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInstalling(true);
    const success = await promptInstall();
    setInstalling(false);
    if (success) {
      setJustInstalled(true);
    }
  };

  if (justInstalled || isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  if (variant === "menu") {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        aria-label="Install Melora as desktop or mobile app"
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-melora-purple hover:text-white hover:bg-melora-purple/10 rounded-xl transition-colors font-medium ${className}`}
      >
        <Download className={`w-4 h-4 ${installing ? "animate-bounce" : ""}`} />
        <span>{installing ? "Opening Install..." : "Install Melora App"}</span>
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        aria-label="Install Melora App"
        className={`px-4 py-2 bg-gradient-01 hover:opacity-95 text-white text-xs md:text-sm font-semibold rounded-full shadow-soft transition-all duration-base flex items-center gap-2 ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{installing ? "Installing..." : "Install App"}</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        aria-label="Install Melora as App"
        title="Install Melora App"
        className={`p-2 rounded-full bg-melora-surfaceLayer/60 border border-white/10 hover:border-melora-purple hover:bg-melora-purple/10 text-melora-textSecondary hover:text-white transition-all duration-base ${className}`}
      >
        <Download className={`w-4 h-4 ${installing ? "animate-bounce" : ""}`} />
      </button>
    );
  }

  // Default: Topbar button
  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      aria-label="Install Melora App"
      title="Install Melora for a smoother, offline-ready desktop or mobile experience"
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-full bg-melora-surfaceLayer/60 hover:bg-melora-purple/20 border border-white/10 hover:border-melora-purple/40 text-melora-textSecondary hover:text-white transition-all duration-base text-xs font-semibold shadow-soft ${className}`}
    >
      <Download className={`w-3.5 h-3.5 text-melora-purple group-hover:text-white transition-colors ${installing ? "animate-bounce" : ""}`} />
      {showText && (
        <span className="hidden sm:inline">
          {installing ? "Installing..." : "Install App"}
        </span>
      )}
    </button>
  );
}
