"use client";

import React, { useEffect, useMemo, useState } from "react";

interface MeloraWaveformProps {
  isPlaying?: boolean;
  barCount?: number;
  height?: number;
  className?: string;
  variant?: "bars" | "wave" | "minimal";
  color?: "gradient" | "purple" | "pink" | "orange";
}

export default function MeloraWaveform({
  isPlaying = false,
  barCount = 28,
  height = 36,
  className = "",
  variant = "bars",
  color = "gradient",
}: MeloraWaveformProps) {
  // Generate random base heights for dynamic visualizer look
  const baseHeights = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Natural bell curve / acoustic frequency distribution
      const norm = i / (barCount - 1);
      const curve = Math.sin(norm * Math.PI);
      return Math.max(0.18, curve * 0.9);
    });
  }, [barCount]);

  const [amplitudes, setAmplitudes] = useState<number[]>(baseHeights);

  useEffect(() => {
    if (!isPlaying) {
      setAmplitudes(baseHeights.map((h) => h * 0.35));
      return;
    }

    const interval = setInterval(() => {
      setAmplitudes(
        baseHeights.map((base) => {
          const jitter = (Math.random() - 0.5) * 0.6;
          return Math.min(1, Math.max(0.15, base + jitter));
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, baseHeights]);

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-[3px] h-4 ${className}`}>
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className={`w-[3px] rounded-full bg-gradient-primary transition-all duration-150 ${
              isPlaying ? "animate-pulse" : "h-1.5 opacity-40"
            }`}
            style={{
              height: isPlaying ? `${Math.max(6, (idx + 1) * 4 * (amplitudes[idx] || 0.5))}px` : "6px",
              animationDelay: `${idx * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-end justify-center gap-[2.5px] px-2 overflow-hidden ${className}`}
      style={{ height }}
    >
      {amplitudes.map((amp, index) => {
        // Color gradient interpolation along the wave
        const progress = index / (barCount - 1);
        let barBg = "linear-gradient(to top, #7B5CFF, #FF4D7D)";
        if (color === "gradient") {
          if (progress > 0.6) {
            barBg = "linear-gradient(to top, #FF4D7D, #FFB45C)";
          } else if (progress > 0.3) {
            barBg = "linear-gradient(to top, #7B5CFF, #FF4D7D)";
          } else {
            barBg = "linear-gradient(to top, #6E8CFF, #7B5CFF)";
          }
        } else if (color === "pink") {
          barBg = "linear-gradient(to top, #FF4D7D, #FF8EAA)";
        } else if (color === "purple") {
          barBg = "linear-gradient(to top, #5C42D9, #B18CFF)";
        } else if (color === "orange") {
          barBg = "linear-gradient(to top, #FF4D7D, #FFB45C)";
        }

        const barHeight = Math.max(4, Math.round(amp * height));

        return (
          <div
            key={index}
            className="w-[3px] rounded-full transition-all ease-out"
            style={{
              height: `${barHeight}px`,
              background: barBg,
              transitionDuration: isPlaying ? "120ms" : "400ms",
              opacity: isPlaying ? 0.9 : 0.4,
              boxShadow: isPlaying ? "0 0 8px rgba(123,92,255,0.4)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}
