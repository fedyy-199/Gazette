import React from "react";
import { cn } from "@/lib/utils";

export interface SpectrumBarProps {
  leftPercent?: number;
  centerPercent?: number;
  rightPercent?: number;
  leftColor?: string;
  centerColor?: string;
  rightColor?: string;
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
  height?: string;
  className?: string;
}

export function SpectrumBar({
  leftPercent = 33.33,
  centerPercent = 33.33,
  rightPercent = 33.34,
  leftColor = "bg-[#FBBF24]",
  centerColor = "bg-[#3182CE]",
  rightColor = "bg-[#38A169]",
  leftLabel = "Low",
  centerLabel = "Medium",
  rightLabel = "High",
  height = "h-4",
  className,
}: SpectrumBarProps) {
  return (
    <div className={cn("w-full flex flex-col gap-1.5 select-none", className)}>
      {/* 3-segment Bar with rounded ends */}
      <div className={cn("w-full flex overflow-hidden rounded-full shadow-inner", height)}>
        <div
          className={cn("transition-all duration-300", leftColor)}
          style={{ width: `${leftPercent}%` }}
          title={`${leftLabel}: ${Math.round(leftPercent)}%`}
        />
        <div
          className={cn("transition-all duration-300", centerColor)}
          style={{ width: `${centerPercent}%` }}
          title={`${centerLabel}: ${Math.round(centerPercent)}%`}
        />
        <div
          className={cn("transition-all duration-300", rightColor)}
          style={{ width: `${rightPercent}%` }}
          title={`${rightLabel}: ${Math.round(rightPercent)}%`}
        />
      </div>

      {/* Labels below */}
      {(leftLabel || centerLabel || rightLabel) && (
        <div className="flex justify-between items-center text-[12px] font-medium text-[#4A5566] px-1">
          <span>{leftLabel}</span>
          <span>{centerLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
