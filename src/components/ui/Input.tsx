"use client";

import React, { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 pointer-events-none text-melora-textMuted flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full h-11 md:h-12 bg-melora-cardElevated/80 
              border border-white/8 rounded-input
              text-sm text-white placeholder:text-melora-textMuted
              transition-all duration-base ease-out
              focus:outline-none focus:border-melora-purple/60 focus:ring-2 focus:ring-melora-purple/20 focus:bg-melora-cardSurface
              hover:border-white/15
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? "pl-11" : "pl-4"}
              ${rightIcon ? "pr-11" : "pr-4"}
              ${error ? "border-melora-error/60 focus:border-melora-error focus:ring-melora-error/20" : ""}
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 text-melora-textMuted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-melora-error ml-1 font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-melora-textMuted ml-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
