"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, Heart, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "heart";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 3200) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-24 md:bottom-28 right-4 md:right-8 z-[90] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-btn glass-player border border-white/10 shadow-soft-lg animate-in slide-in-from-bottom-4 fade-in duration-base"
          >
            <div className="flex items-center gap-3 min-w-0">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-melora-success shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-melora-error shrink-0" />
              )}
              {t.type === "heart" && (
                <Heart className="w-5 h-5 text-melora-pink fill-current shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-5 h-5 text-melora-lavender shrink-0" />
              )}

              <p className="text-sm font-medium text-white truncate">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-melora-textMuted hover:text-white transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
