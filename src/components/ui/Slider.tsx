"use client";

import React, { InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  accentColor?: "purple" | "pink" | "orange" | "gradient";
  showThumbOnHover?: boolean;
}

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  accentColor = "purple",
  showThumbOnHover = true,
  className = "",
  disabled = false,
  ...props
}: SliderProps) {
  const safeMax = Math.max(min + 0.001, max);
  const percentage = Math.min(100, Math.max(0, ((value - min) / (safeMax - min)) * 100));

  const getGradient = () => {
    switch (accentColor) {
      case "pink":
        return "linear-gradient(to right, #FF4D7D, #FF8EAA)";
      case "orange":
        return "linear-gradient(to right, #FF4D7D, #FFB45C)";
      case "gradient":
        return "linear-gradient(to right, #7B5CFF, #FF4D7D, #FFB45C)";
      case "purple":
      default:
        return "linear-gradient(to right, #7B5CFF, #FF4D7D)";
    }
  };

  return (
    <div className={`relative flex items-center w-full h-5 group touch-none cursor-pointer ${className}`}>
      {/* Track Background */}
      <div className="relative w-full h-1.5 rounded-full bg-white/10 overflow-hidden group-hover:h-2 transition-all duration-micro">
        {/* Filled Gradient Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-75"
          style={{
            width: `${percentage}%`,
            background: getGradient(),
            boxShadow: "0 0 10px rgba(123, 92, 255, 0.4)",
          }}
        />
      </div>

      {/* Range Input Overlay */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10
          disabled:cursor-not-allowed
        `}
        {...props}
      />

      {/* Visible Thumb indicator */}
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none
          transition-all duration-micro
          ${
            showThumbOnHover
              ? "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
              : "opacity-100 scale-100"
          }
        `}
        style={{
          left: `calc(${percentage}% - 7px)`,
        }}
      />
    </div>
  );
}
