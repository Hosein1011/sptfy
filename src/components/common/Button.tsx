"use client";

import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  // Base classes applied to all buttons
  const baseClasses = `
    inline-flex items-center justify-center gap-2.5
    font-semibold select-none
    transition-all duration-base cubic-bezier(0.16, 1, 0.3, 1)
    focus:outline-none focus:ring-2 focus:ring-melora-purple/50 focus:ring-offset-2 focus:ring-offset-melora-bgPrimary
  `;

  const sizeClasses = {
    sm: "h-9 px-4 text-xs rounded-sm",
    md: "h-11 px-6 text-sm rounded-btn",
    lg: "h-12 md:h-13 px-8 text-base rounded-btn",
  };

  // Melora variant styling
  const variants = {
    primary: `
      bg-gradient-primary text-white 
      hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
      border border-white/10
    `,
    secondary: `
      bg-melora-cardSurface text-white
      border border-white/10 hover:border-melora-purple/40 hover:bg-melora-surfaceHover
      hover:shadow-soft-sm active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-melora-textSecondary hover:text-white
      hover:bg-white/5 active:scale-[0.98]
    `,
    outline: `
      bg-transparent text-white border border-white/15
      hover:border-melora-purple hover:bg-melora-purple/10 active:scale-[0.98]
    `,
    danger: `
      bg-melora-pink/15 text-melora-pink border border-melora-pink/20
      hover:bg-melora-pink hover:text-white hover:shadow-glow-pink
      active:scale-[0.98]
    `,
  };

  const disabledClasses = disabled || isLoading
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}