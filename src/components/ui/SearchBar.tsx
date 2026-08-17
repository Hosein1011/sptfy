"use client";

import React, { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for songs, artists, albums, or moods...",
  onClear,
  autoFocus = false,
  className = "",
  size = "md",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sizeClasses = {
    sm: "h-9 text-xs pl-9 pr-8",
    md: "h-11 md:h-12 text-sm pl-11 pr-12",
    lg: "h-13 md:h-14 text-base pl-13 pr-14",
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-melora-textMuted pointer-events-none transition-colors ${
          size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
        }`}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full bg-melora-cardSurface/70 backdrop-blur-md
          border border-white/10 rounded-full
          text-white placeholder:text-melora-textMuted
          transition-all duration-base ease-out
          focus:outline-none focus:border-melora-purple/60 focus:ring-2 focus:ring-melora-purple/20 focus:bg-melora-cardSurface
          hover:border-white/15
          ${sizeClasses[size]}
        `}
      />

      {value ? (
        <button
          onClick={() => {
            onChange("");
            onClear?.();
            inputRef.current?.focus();
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-melora-textMuted hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-melora-textMuted bg-white/5 border border-white/10 rounded">
            /
          </kbd>
        </div>
      )}
    </div>
  );
}
