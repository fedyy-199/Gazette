"use client";

import React, { useState } from "react";
import { Info, AlertCircle } from "lucide-react";

interface BiasAnalysisSidebarProps {
  summary?: string | null;
  biasLabel?: string | null;
  leftPercentage?: number;
  centerPercentage?: number;
  rightPercentage?: number;
  confidence?: number;
  framingNotes?: string | null;
  loadedTerms?: string[] | null;
  disclaimer?: string | null;
  isPending?: boolean;
}

export function BiasAnalysisSidebar({
  summary,
  biasLabel = "unclear",
  leftPercentage = 33,
  centerPercentage = 34,
  rightPercentage = 33,
  confidence = 0.5,
  framingNotes,
  loadedTerms = [],
  disclaimer = "Political framing and sentiment ratings are AI-estimated assessments based strictly on text analysis.",
  isPending = false,
}: BiasAnalysisSidebarProps) {
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  const getLabelColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "left":
        return "text-[#38A169]";
      case "center":
        return "text-[#D97706]";
      case "right":
        return "text-[#3182CE]";
      default:
        return "text-[#4A5566]";
    }
  };

  const safeBiasLabel = biasLabel || "unclear";
  const displayLabel = safeBiasLabel.charAt(0).toUpperCase() + safeBiasLabel.slice(1);

  return (
    <aside className="space-y-6 select-none">
      
      {/* CARD 1: BIAS ANALYSIS */}
      <div className="bg-white border border-[#E2EBF0] rounded-[12px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        <h3 className="text-[17px] font-bold text-[#191919]">
          Bias Analysis
        </h3>

        {isPending ? (
          <div className="bg-[#F8FAFC] border border-[#E2EBF0] rounded-[8px] p-4 text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#D97706]">
              <AlertCircle size={14} /> AI Analysis Pending
            </span>
            <p className="text-[12px] text-[#718096]">
              Full political framing, sentiment, and neutrality breakdown will appear once AI analysis is processed.
            </p>
          </div>
        ) : (
          <>
            <div>
              <span className="text-[12px] font-semibold text-[#718096] uppercase tracking-wide block">
                AI-Estimated Framing
              </span>
              <div className={`text-[24px] font-extrabold ${getLabelColor(safeBiasLabel)} tracking-tight`}>
                {displayLabel} ({Math.max(leftPercentage, centerPercentage, rightPercentage)}%)
              </div>
            </div>

            {/* Mini Tri-Color Spectrum Bar (Left=Green, Center=Amber, Right=Blue) */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full overflow-hidden flex shadow-xs">
                <div className="bg-[#38A169] h-full" style={{ width: `${leftPercentage}%` }} />
                <div className="bg-[#FBBF24] h-full" style={{ width: `${centerPercentage}%` }} />
                <div className="bg-[#3182CE] h-full" style={{ width: `${rightPercentage}%` }} />
              </div>

              <div className="flex justify-between items-center text-[12px] font-bold px-0.5">
                <span className="text-[#38A169]">Left {leftPercentage}%</span>
                <span className="text-[#D97706]">Center {centerPercentage}%</span>
                <span className="text-[#3182CE]">Right {rightPercentage}%</span>
              </div>
            </div>

            <div className="text-[12px] font-medium text-[#718096]">
              Confidence: {Math.round(confidence * 100)}% · Text-based evidence only
            </div>
          </>
        )}

        {/* How We Analyze Bias Button */}
        <button
          type="button"
          onClick={() => setShowMethodologyModal(!showMethodologyModal)}
          className="w-full py-2 px-3 rounded-[8px] border border-[#CBD5E0] bg-[#F8FAFC] text-[13px] font-semibold text-[#191919] hover:bg-[#EDF2F7] transition-colors cursor-pointer"
        >
          How We Analyze Bias
        </button>

        {showMethodologyModal && (
          <div className="p-3 bg-[#F8FAFC] border border-[#E2EBF0] rounded-[8px] text-[11.5px] text-[#4A5566] leading-relaxed space-y-1.5">
            <span className="font-bold block text-[#191919]">Methodology & Ethics:</span>
            <p>
              Political framing is an AI-estimated evaluation of emphasis, perspectives highlighted or omitted, source selection, and rhetoric. It is derived solely from the text content and does not represent objective truth.
            </p>
          </div>
        )}

        <p className="text-[11.5px] text-[#718096] leading-relaxed">
          {disclaimer}
        </p>
      </div>

      {/* CARD 2: AI SUMMARY */}
      <div className="bg-white border border-[#E2EBF0] rounded-[12px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] space-y-3.5">
        <h3 className="text-[17px] font-bold text-[#191919]">
          AI Summary
        </h3>

        {summary ? (
          <p className="text-[13px] text-[#2D3748] leading-relaxed">
            {summary}
          </p>
        ) : (
          <p className="text-[13px] text-[#718096] italic">
            Summary will be generated upon AI analysis.
          </p>
        )}

        {framingNotes && (
          <div className="pt-2 border-t border-[#E2EBF0]/70 space-y-1">
            <span className="text-[12px] font-bold text-[#191919] block">Framing Notes:</span>
            <p className="text-[12px] text-[#4A5566] leading-relaxed">
              {framingNotes}
            </p>
          </div>
        )}
      </div>

      {/* CARD 3: LOADED TERMS */}
      {loadedTerms && loadedTerms.length > 0 && (
        <div className="bg-white border border-[#E2EBF0] rounded-[12px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] space-y-3.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-bold text-[#191919]">
              Loaded Terms
            </h3>
            <span title="Words or phrases carrying notable emotional or rhetoric weight">
              <Info size={14} className="text-[#718096]" />
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {loadedTerms.map((term, index) => (
              <span
                key={`${term}-${index}`}
                className="px-2.5 py-1 bg-[#F1F5F9] text-[#334155] rounded-full text-[11.5px] font-medium border border-[#E2EBF0]"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
