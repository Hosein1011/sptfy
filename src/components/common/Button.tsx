import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  // Base classes applied to all buttons
  const baseClasses = `
    inline-flex items-center justify-center 
    rounded-btn font-semibold text-sm md:text-base
    transition-all duration-base ease-out
    px-6 py-3
    focus:outline-none focus:ring-2 focus:ring-melora-purple/50 focus:ring-offset-2 focus:ring-offset-melora-bgPrimary
  `;

  // Melora specific variant styling
  const variants = {
    primary: `
      bg-gradient-01 text-white 
      hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
    `,
    secondary: `
      bg-melora-surfaceLayer/50 backdrop-blur-md text-melora-textPrimary
      border border-white/10 hover:border-melora-purple hover:bg-melora-surfaceLayer
      active:scale-[0.98]
    `,
    danger: `
      bg-melora-pink/10 text-melora-pink 
      hover:bg-melora-pink hover:text-white hover:shadow-[0_0_20px_rgba(255,77,125,0.4)]
      active:scale-[0.98]
    `,
  };

  // Disabled styling to prevent interactions while looking soft
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none active:scale-100"
    : "cursor-pointer";

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}