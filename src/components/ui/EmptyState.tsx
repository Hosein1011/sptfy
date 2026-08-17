"use client";

import React from "react";
import Button from "../common/Button";
import MeloraWaveform from "../brand/MeloraWaveform";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No songs here yet",
  description = "Let's give this space a soundtrack and feel every melody.",
  actionLabel,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 md:p-12
        rounded-panel glass-card max-w-md mx-auto my-8
        ${className}
      `}
    >
      {/* Decorative Wave Aura Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary/15 border border-melora-purple/30 flex items-center justify-center text-melora-purple shadow-glow">
          {icon || (
            <div className="flex items-center justify-center">
              <MeloraWaveform isPlaying={false} barCount={12} height={24} />
            </div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-melora-textSecondary max-w-xs mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
