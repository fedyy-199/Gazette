import React from "react";

export function ArticleCategoryBar() {
  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E2EBF0] py-2.5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#3182CE] text-white">
          Politics
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#3182CE] text-white">
          US
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#E2EBF0] text-[#191919]">
          Feature Adoption Spectrums
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#38A169] text-white">
          Gazette Green
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#E2EBF0] text-[#191919]">
          Business Items
        </span>
        <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#E2EBF0] text-[#4A5566]">
          More
        </span>
      </div>
    </div>
  );
}
