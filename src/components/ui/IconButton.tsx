"use client";

import React, { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "secondary" | "primary" | "glass";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  tooltip?: string;
}

export default function IconButton({
  variant = "ghost",
  size = "md",
  isActive = false,
  tooltip,
  children,
  className = "",
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-[10px]",
    md: "w-10 h-10 rounded-[12px]",
    lg: "w-12 h-12 rounded-[14px]",
  };

  const variants = {
    ghost: "bg-transparent text-melora-textSecondary hover:text-white hover:bg-white/8",
    secondary: "bg-melora-cardSurface border border-white/10 text-melora-textSecondary hover:text-white hover:bg-melora-surfaceHover hover:border-white/20",
    primary: "bg-gradient-primary text-white shadow-glow hover:scale-105",
    glass: "glass-surface text-melora-textSecondary hover:text-white hover:border-melora-purple/40",
  };

  const activeClasses = isActive
    ? "text-melora-pink bg-melora-pink/15 border-melora-pink/30 shadow-glow-pink"
    : "";

  return (
    <button
      title={tooltip}
      className={`
        inline-flex items-center justify-center
        transition-all duration-micro active:scale-95
        focus:outline-none focus:ring-1 focus:ring-melora-purple/40
        ${sizeClasses[size]}
        ${variants[variant]}
        ${activeClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
