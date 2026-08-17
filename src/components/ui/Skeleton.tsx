"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rect",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    rect: "rounded-card",
    circle: "rounded-full",
    text: "rounded-md h-4",
  };

  return (
    <div
      className={`
        bg-[#171D2E] skeleton-shimmer
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

export function SongRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton variant="text" width={20} height={16} />
        <Skeleton variant="rect" width={48} height={48} className="rounded-lg shrink-0" />
        <div className="space-y-2 flex-1 max-w-xs">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" width={40} height={14} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-card bg-melora-cardSurface/40 border border-white/5 space-y-3">
      <Skeleton variant="rect" className="w-full aspect-square rounded-xl" />
      <Skeleton variant="text" height={16} className="w-4/5" />
      <Skeleton variant="text" height={12} className="w-1/2" />
    </div>
  );
}
