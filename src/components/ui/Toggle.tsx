"use client";

import React from "react";

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({
  isOn,
  onToggle,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2.5 group">
      {(label || description) && (
        <div className="pr-4 select-none">
          {label && (
            <p className="text-white font-medium text-sm group-hover:text-melora-textPrimary transition-colors">
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-melora-textSecondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={onToggle}
        className={`
          w-12 h-6 rounded-full relative flex-shrink-0 transition-all duration-base ease-out
          focus:outline-none focus:ring-2 focus:ring-melora-purple/40
          ${
            isOn
              ? "bg-gradient-primary shadow-glow"
              : "bg-white/10 border border-white/8 hover:bg-white/15"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div
          className={`
            absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-base ease-out shadow-sm
            ${isOn ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}
