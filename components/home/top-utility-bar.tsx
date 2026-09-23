"use client";

import React, { useState } from "react";
import { Globe, ChevronDown, MapPin } from "lucide-react";

export function TopUtilityBar() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");

  return (
    <div className="w-full bg-[#EBF2F7] border-b border-[#E2EBF0] text-[12px] text-[#4A5566]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">

        {/* Left Links */}
        <div className="flex items-center gap-4">
          <a
            href="#extension"
            className="hover:text-[#191919] transition-colors cursor-pointer"
          >
            Browser Extension
          </a>
          <span className="text-[#CBD5E0]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#718096]">Theme:</span>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`hover:text-[#191919] cursor-pointer ${theme === "light" ? "font-semibold text-[#191919]" : ""
                }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`hover:text-[#191919] cursor-pointer ${theme === "dark" ? "font-semibold text-[#191919]" : ""
                }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme("auto")}
              className={`hover:text-[#191919] cursor-pointer ${theme === "auto" ? "font-semibold text-[#191919]" : ""
                }`}
            >
              Auto
            </button>
          </div>
        </div>

        {/* Right Info */}
        <div className="hidden sm:flex items-center gap-5">
          <span className="text-[#718096]">Monday, June 1, 2026</span>
          <span className="text-[#CBD5E0]">|</span>
          <button
            type="button"
            className="hover:text-[#191919] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <MapPin size={13} className="text-[#718096]" />
            Set Location
          </button>
          <span className="text-[#CBD5E0]">|</span>
          <button
            type="button"
            className="hover:text-[#191919] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <Globe size={13} className="text-[#718096]" />
            International Edition
            <ChevronDown size={12} className="text-[#718096]" />
          </button>
        </div>

      </div>
    </div>
  );
}
