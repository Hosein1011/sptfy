"use client";

import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "gold" | "silver";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "primary",
  size = "sm",
  children,
  className = "",
}: BadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  const variants = {
    primary: "bg-melora-purple/15 text-melora-lavender border border-melora-purple/30",
    secondary: "bg-white/8 text-melora-textSecondary border border-white/10",
    success: "bg-melora-success/15 text-melora-success border border-melora-success/30",
    warning: "bg-melora-warning/15 text-melora-warning border border-melora-warning/30",
    error: "bg-melora-error/15 text-melora-error border border-melora-error/30",
    gold: "bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-yellow-300 border border-yellow-400/30",
    silver: "bg-white/15 text-slate-200 border border-slate-300/30",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-full select-none
        ${sizeClasses[size]}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
