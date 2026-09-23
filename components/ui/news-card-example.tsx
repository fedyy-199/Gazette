import React from "react";
import { Badge } from "./badge";
import { Clock, Users, Bookmark } from "lucide-react";

export function NewsCardExample() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2EBF0] rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-all max-w-md w-full">
      {/* Chart Graphic Area */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2EBF0] rounded-[8px] p-3 mb-4 select-none">
        <div className="h-36 w-full flex flex-col justify-between">
          <svg viewBox="0 0 320 130" className="w-full h-full">
            {/* Grid lines */}
            <line x1="25" y1="15" x2="310" y2="15" stroke="#E2EBF0" strokeWidth="1" />
            <line x1="25" y1="35" x2="310" y2="35" stroke="#E2EBF0" strokeWidth="1" />
            <line x1="25" y1="55" x2="310" y2="55" stroke="#E2EBF0" strokeWidth="1" />
            <line x1="25" y1="75" x2="310" y2="75" stroke="#E2EBF0" strokeWidth="1" />
            <line x1="25" y1="95" x2="310" y2="95" stroke="#E2EBF0" strokeWidth="1" />
            <line x1="25" y1="115" x2="310" y2="115" stroke="#E2EBF0" strokeWidth="1" />

            {/* Y axis labels */}
            <text x="5" y="18" fill="#A0AEC0" fontSize="8">140%</text>
            <text x="5" y="38" fill="#A0AEC0" fontSize="8">120%</text>
            <text x="5" y="58" fill="#A0AEC0" fontSize="8">100%</text>
            <text x="5" y="78" fill="#A0AEC0" fontSize="8">80%</text>
            <text x="5" y="98" fill="#A0AEC0" fontSize="8">40%</text>
            <text x="5" y="118" fill="#A0AEC0" fontSize="8">0%</text>

            {/* Green and Amber Bars */}
            <rect x="35" y="25" width="10" height="90" fill="#38A169" rx="1" />
            <rect x="70" y="45" width="10" height="70" fill="#38A169" rx="1" />
            <rect x="82" y="60" width="10" height="55" fill="#FBBF24" rx="1" />
            
            <rect x="110" y="60" width="10" height="55" fill="#38A169" rx="1" />
            <rect x="122" y="62" width="10" height="53" fill="#FBBF24" rx="1" />

            <rect x="150" y="70" width="10" height="45" fill="#38A169" rx="1" />
            <rect x="162" y="75" width="10" height="40" fill="#FBBF24" rx="1" />

            <rect x="190" y="80" width="10" height="35" fill="#38A169" rx="1" />
            <rect x="202" y="82" width="10" height="33" fill="#FBBF24" rx="1" />

            <rect x="230" y="85" width="10" height="30" fill="#38A169" rx="1" />
            <rect x="242" y="87" width="10" height="28" fill="#FBBF24" rx="1" />

            <rect x="270" y="90" width="10" height="25" fill="#38A169" rx="1" />
            <rect x="282" y="92" width="10" height="23" fill="#FBBF24" rx="1" />

            {/* Trend line */}
            <polyline
              points="40,25 75,45 115,60 155,70 195,80 235,85 275,90"
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Category / Source */}
      <div className="text-[13px] font-medium text-[#4A5566] mb-1.5">
        Gazette Analytics
      </div>

      {/* Title */}
      <h3 className="text-[20px] font-semibold text-[#191919] leading-[1.3] mb-2.5">
        Experiment: New &apos;Sign-up Flow&apos; boosts day-3 retention
      </h3>

      {/* Description */}
      <p className="text-[14px] text-[#4A5566] leading-[1.6] mb-4">
        Initial data from the A/B test is showing an immediate uplift in core conversion metrics. Feature flag rollout is at 50%.
      </p>

      {/* Badge / Chip */}
      <div className="mb-4">
        <Badge variant="amber">High Impact</Badge>
      </div>

      {/* Footer Meta Row */}
      <div className="flex items-center gap-4 pt-3 border-t border-[#E2EBF0] text-[13px] text-[#4A5566]">
        <span className="flex items-center gap-1.5">
          <Clock size={15} strokeWidth={1.8} className="text-[#4A5566]" />
          2h min
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={15} strokeWidth={1.8} className="text-[#4A5566]" />
          0 → 1
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Bookmark size={15} strokeWidth={1.8} className="text-[#4A5566]" />
          Coverage (97%)
        </span>
      </div>
    </div>
  );
}
