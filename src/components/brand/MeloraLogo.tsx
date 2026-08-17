"use client";

import React from "react";
import Link from "next/link";

interface MeloraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "gradient" | "monochrome" | "white";
  showWordmark?: boolean;
  showTagline?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { icon: 28, text: "text-lg", tagline: "text-[10px]" },
  md: { icon: 38, text: "text-2xl", tagline: "text-xs" },
  lg: { icon: 48, text: "text-3xl", tagline: "text-xs" },
  xl: { icon: 64, text: "text-4xl", tagline: "text-sm" },
};

export default function MeloraLogo({
  size = "md",
  variant = "gradient",
  showWordmark = true,
  showTagline = false,
  href,
  className = "",
}: MeloraLogoProps) {
  const { icon: iconSize, text: textSize, tagline: taglineSize } = sizeMap[size];

  const logoIcon = (
    <div
      className={`relative flex items-center justify-center shrink-0 group`}
      style={{ width: iconSize, height: iconSize }}
    >
      {/* Ambient soft glow aura behind logo */}
      {variant === "gradient" && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-40 blur-lg group-hover:opacity-75 transition-opacity duration-slow"
          style={{ transform: "scale(1.2)" }}
        />
      )}

      {/* SVG Icon: Two flowing soundwaves converging to form an M */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-base group-hover:scale-105"
      >
        <defs>
          {/* Melora Signature Gradient */}
          <linearGradient
            id="meloraWaveGrad"
            x1="4"
            y1="4"
            x2="44"
            y2="44"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7B5CFF" />
            <stop offset="50%" stopColor="#FF4D7D" />
            <stop offset="100%" stopColor="#FFB45C" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer squircle base if large or app icon mode */}
        <rect
          width="48"
          height="48"
          rx="14"
          fill="#0B0F16"
          className="stroke-[1.5] stroke-white/10"
        />

        {/* Left Wave forming the first peak of M */}
        <path
          d="M10 34 C12 34 14 14 18 14 C22 14 23 28 24 28"
          stroke={variant === "gradient" ? "url(#meloraWaveGrad)" : "#FFFFFF"}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Right Wave forming the second peak of M */}
        <path
          d="M24 28 C25 28 26 14 30 14 C34 14 36 34 38 34"
          stroke={variant === "gradient" ? "url(#meloraWaveGrad)" : "#FFFFFF"}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Flowing harmonic central pulse dot */}
        <circle
          cx="24"
          cy="28"
          r="2"
          fill={variant === "gradient" ? "#FF4D7D" : "#FFFFFF"}
        />
        <circle
          cx="18"
          cy="14"
          r="1.75"
          fill={variant === "gradient" ? "#7B5CFF" : "#FFFFFF"}
        />
        <circle
          cx="30"
          cy="14"
          r="1.75"
          fill={variant === "gradient" ? "#FFB45C" : "#FFFFFF"}
        />
      </svg>
    </div>
  );

  const content = (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {logoIcon}

      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-extrabold tracking-tight text-white leading-none ${textSize} flex items-center gap-1.5`}
          >
            <span>MELORA</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-melora-pink animate-pulse" />
          </span>
          {showTagline && (
            <span
              className={`text-melora-textMuted tracking-wider uppercase font-medium mt-1 ${taglineSize}`}
            >
              Feel Every Melody
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
