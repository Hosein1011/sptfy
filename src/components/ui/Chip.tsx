"use client";

import React from "react";

interface ChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "gradient";
  className?: string;
}

export default function Chip({
  label,
  isActive = false,
  onClick,
  icon,
  variant = "default",
  className = "",
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
        transition-all duration-micro cubic-bezier(0.16, 1, 0.3, 1) select-none whitespace-nowrap
        active:scale-95
        ${
          isActive
            ? variant === "gradient"
              ? "bg-gradient-primary text-white shadow-glow border border-white/20"
              : "bg-melora-purple text-white shadow-glow border border-melora-purple"
            : "bg-melora-cardSurface/80 text-melora-textSecondary hover:text-white hover:bg-melora-surfaceHover border border-white/6"
        }
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
