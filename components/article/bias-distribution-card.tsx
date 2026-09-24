"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface BiasDistributionCardProps {
  leftPercentage?: number;
  centerPercentage?: number;
  rightPercentage?: number;
  sourceCount?: number;
}

export function BiasDistributionCard({
  leftPercentage = 20,
  centerPercentage = 31,
  rightPercentage = 49,
  sourceCount = 12,
}: BiasDistributionCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-[#FFFFFF] border border-[#E2EBF0] rounded-[12px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] space-y-3.5 select-none my-6">

      {/* Title & Info Icon */}
      <div className="flex items-center gap-1.5 relative">
        <span className="text-[14px] font-bold text-[#191919]">
          Bias Distribution
        </span>
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-[#718096] hover:text-[#191919] transition-colors cursor-pointer"
          aria-label="How bias distribution is calculated"
        >
          <Info size={14} />
        </button>

        {showTooltip && (
          <div className="absolute left-0 top-6 w-64 p-2.5 bg-[#191919] text-white text-[11px] rounded-[6px] shadow-lg z-20 leading-relaxed">
            AI analysis aggregates reporting across publications to measure left, center, and right coverage framing.
          </div>
        )}
      </div>

      {/* Tri-Color Spectrum Bar (Gazette Design System Colors: Left=Green, Center=Amber, Right=Blue) */}
      <div className="w-full h-[22px] rounded-full overflow-hidden flex text-[11px] font-bold shadow-xs">
        {/* Left (Green) */}
        <div
          className="bg-[#38A169] text-white flex items-center justify-center px-1 truncate transition-all"
          style={{ width: `${leftPercentage}%` }}
        >
          Left {leftPercentage}%
        </div>

        {/* Center (Amber) */}
        <div
          className="bg-[#FBBF24] text-[#191919] flex items-center justify-center px-1 truncate transition-all"
          style={{ width: `${centerPercentage}%` }}
        >
          Center {centerPercentage}%
        </div>

        {/* Right (Blue) */}
        <div
          className="bg-[#3182CE] text-white flex items-center justify-center px-1 truncate transition-all"
          style={{ width: `${rightPercentage}%` }}
        >
          Right {rightPercentage}%
        </div>
      </div>

      {/* Source Count */}


      {/* Footnote description matching mockup */}


    </div>
  );
}
