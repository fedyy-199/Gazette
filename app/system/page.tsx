import React from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpectrumBar } from "@/components/ui/spectrum-bar";
import { NewsCardExample } from "@/components/ui/news-card-example";
import { Icons } from "@/components/ui/icons";
import {
  H1,
  H2,
  H3,
  H4,
  BodyLarge,
  BodyMedium,
  BodySmall,
  Caption,
} from "@/components/ui/typography";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#DDE6ED] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* BRAND PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0]">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase mb-4">
                BRAND
              </div>
              <div className="py-2">
                <Logo size="lg" showTagline={true} />
              </div>
            </div>

            {/* COLORS PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0] space-y-5">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase">
                COLORS
              </div>

              {/* Primary */}
              <div>
                <div className="text-[11px] font-semibold text-[#718096] uppercase mb-2">
                  PRIMARY
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#191919] shadow-inner" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Text Primary
                    </span>
                    <span className="text-[11px] text-[#718096]">#191919</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#4A5566] shadow-inner" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Text Secondary
                    </span>
                    <span className="text-[11px] text-[#718096]">#4A5566</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#FFFFFF] border border-[#E2EBF0] shadow-sm" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Surface
                    </span>
                    <span className="text-[11px] text-[#718096]">#FFFFFF</span>
                  </div>
                </div>
              </div>

              {/* Semantic */}
              <div>
                <div className="text-[11px] font-semibold text-[#718096] uppercase mb-2">
                  SEMANTIC
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#38A169] shadow-inner" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Gazette Green
                    </span>
                    <span className="text-[11px] text-[#718096]">#38A169</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#FBBF24] shadow-inner" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Gazette Amber
                    </span>
                    <span className="text-[11px] text-[#718096]">#FBBF24</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="h-16 rounded-[8px] bg-[#3182CE] shadow-inner" />
                    <span className="text-[11px] font-semibold text-[#191919] leading-tight">
                      Gazette Blue
                    </span>
                    <span className="text-[11px] text-[#718096]">#3182CE</span>
                  </div>
                </div>
              </div>

              {/* Neutrals */}
              <div>
                <div className="text-[11px] font-semibold text-[#718096] uppercase mb-2">
                  NEUTRALS
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="h-12 rounded-[6px] bg-[#E2EBF0]" />
                    <span className="text-[11px] font-medium text-[#191919]">Subtle bg</span>
                    <span className="text-[10px] text-[#718096]">#E2EBF0</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-12 rounded-[6px] bg-[#E2EBF0] border border-[#CBD5E0]" />
                    <span className="text-[11px] font-medium text-[#191919]">Borders</span>
                    <span className="text-[10px] text-[#718096]">#E2EBF0</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-12 rounded-[6px] bg-[#E2EBF0]" />
                    <span className="text-[11px] font-medium text-[#191919]">Dividers</span>
                    <span className="text-[10px] text-[#718096]">#E2EBF0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="h-12 rounded-[6px] bg-[#F8FAFC] border border-[#E2EBF0]" />
                    <span className="text-[11px] font-medium text-[#191919]">BG Secondary</span>
                    <span className="text-[10px] text-[#718096]">#F8FAFC</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-12 rounded-[6px] bg-[#FFFFFF] border border-[#E2EBF0]" />
                    <span className="text-[11px] font-medium text-[#191919]">Border</span>
                    <span className="text-[10px] text-[#718096]">#E2EBF0</span>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="pt-2">
                <SpectrumBar
                  leftPercent={35}
                  centerPercent={35}
                  rightPercent={30}
                  leftColor="bg-[#38A169]"
                  centerColor="bg-[#4A5568]"
                  rightColor="bg-[#FBBF24]"
                  leftLabel="Churning Users"
                  centerLabel="Stabilizing Users"
                  rightLabel="Active Users"
                  height="h-3.5"
                />
              </div>
            </div>

            {/* SPACING SYSTEM */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0]">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase mb-4">
                SPACING SYSTEM (4px BASE UNIT)
              </div>

              <div className="flex items-end justify-between gap-2 h-36 pb-3 border-b border-[#E2EBF0]">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#38A169] rounded-t-[4px] h-[10px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">4px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#38A169] rounded-t-[4px] h-[20px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">8px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#38A169] rounded-t-[4px] h-[40px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">16px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#4A7A6E] rounded-t-[4px] h-[60px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">24px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#718096] rounded-t-[4px] h-[80px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">32px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#E2A03F] rounded-t-[4px] h-[100px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">40px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#FBBF24] rounded-t-[4px] h-[125px]" />
                  <span className="text-[11px] font-medium text-[#4A5566]">64px</span>
                </div>
              </div>

              <div className="text-[12px] text-[#4A5566] mt-3">
                Consistent spacing scale based on 4px unit
              </div>
            </div>

          </div>

          {/* MIDDLE COLUMN (Cols 5-8) */}
          <div className="lg:col-span-4 space-y-6">

            {/* TYPOGRAPHY PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0] space-y-4">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase">
                TYPOGRAPHY
              </div>

              <div>
                <div className="text-[11px] font-semibold text-[#718096] uppercase mb-1">
                  FONT FAMILY
                </div>
                <div className="text-[26px] font-bold text-[#191919]">
                  Gazette Satoshi
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-[#718096] border-b border-[#E2EBF0] pb-1">
                <span>STYLE / TITLE</span>
                <span>SIZE / WEIGHT / LINE</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* H1 */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-bold text-[#191919]">H1</span>
                    <H1 className="text-[22px]">Page / Screen Title</H1>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    32px · Bold · 1.2
                  </span>
                </div>

                {/* H2 */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-bold text-[#191919]">H2</span>
                    <H2 className="text-[18px]">Section Title</H2>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    24px · Semibold · 1.3
                  </span>
                </div>

                {/* H3 */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-bold text-[#191919]">H3</span>
                    <H3 className="text-[16px]">Card / Module Title</H3>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    20px · Semibold · 1.3
                  </span>
                </div>

                {/* H4 */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-bold text-[#191919]">H4</span>
                    <H4 className="text-[14px]">Subheading</H4>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    16px · Medium · 1.4
                  </span>
                </div>

                {/* Body Large */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[12px] font-semibold text-[#191919] block">Body Large</span>
                    <BodyLarge className="text-[14px]">Important content</BodyLarge>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    18px · Regular · 1.6
                  </span>
                </div>

                {/* Body Medium */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[12px] font-semibold text-[#191919] block">Body Medium</span>
                    <BodyMedium className="text-[13px]">Body text</BodyMedium>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    14px · Regular · 1.6
                  </span>
                </div>

                {/* Body Small */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[12px] font-semibold text-[#191919] block">Body Small</span>
                    <BodySmall className="text-[12px]">Supporting text</BodySmall>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    13px · Regular · 1.6
                  </span>
                </div>

                {/* Caption */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#191919] block">Caption</span>
                    <Caption className="text-[11px]">Labels, mute text</Caption>
                  </div>
                  <span className="text-[11px] text-[#718096] text-right shrink-0">
                    11px · Regular · 1.4
                  </span>
                </div>
              </div>
            </div>

            {/* ICONS PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0]">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase mb-4">
                ICONS
              </div>

              <div className="grid grid-cols-5 gap-y-5 gap-x-3 place-items-center py-2">
                <Icons.menu size={22} />
                <Icons.search size={22} />
                <Icons.bookmark size={22} />
                <Icons.clock size={22} />
                <Icons.info size={22} />

                <Icons.share size={22} />
                <Icons.externalLink size={22} />
                <Icons.calendar size={22} />
                <Icons.chart size={22} />
                <Icons.tag size={22} />

                <Icons.user size={22} />
                <Icons.bell size={22} />
                <Icons.sliders size={22} />
                <Icons.checkCircle size={22} />
                <Icons.moreHorizontal size={22} />

                <Icons.xCircle size={22} />
                <Icons.plus size={22} />
                <Icons.maximize size={22} />
                <Icons.code size={22} />
                <Icons.moreVertical size={22} />
              </div>

              <div className="text-[12px] text-[#4A5566] text-center mt-4 pt-3 border-t border-[#E2EBF0]">
                Line style · Stroke · Rounded caps
              </div>
            </div>

            {/* GRID SYSTEM PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0]">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase mb-4">
                GRID SYSTEM
              </div>

              <div className="flex gap-4 items-center">
                {/* 12-column visualization */}
                <div className="flex-1 grid grid-cols-12 gap-1 h-36 bg-[#F8FAFC] p-2 rounded-[6px] border border-[#E2EBF0]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full rounded-[2px]"
                      style={{
                        backgroundColor:
                          i === 0
                            ? "#81C784"
                            : i === 1
                            ? "#A5D6A7"
                            : i >= 2 && i <= 8
                            ? "#B0BEC5"
                            : "#FFE082",
                      }}
                    />
                  ))}
                </div>

                {/* Metrics */}
                <div className="flex flex-col justify-between text-[12px] text-[#4A5566] space-y-1 shrink-0 font-medium">
                  <div>
                    <span className="text-[#191919] block font-semibold">Container</span>
                    1280px
                  </div>
                  <div>
                    <span className="text-[#191919] block font-semibold">Columns</span>
                    12
                  </div>
                  <div>
                    <span className="text-[#191919] block font-semibold">Padding</span>
                    24px
                  </div>
                  <div>
                    <span className="text-[#191919] block font-semibold">Gutter</span>
                    24px
                  </div>
                  <div>
                    <span className="text-[#191919] block font-semibold">Margin</span>
                    24px
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-6">

            {/* UI ELEMENTS PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0] space-y-5">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase">
                UI ELEMENTS
              </div>

              {/* Buttons */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold text-[#718096] uppercase">
                  BUTTONS
                </div>
                <Button variant="primary" size="full">
                  PRIMARY
                </Button>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[12px] text-[#718096] w-16">Primary</span>
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="primary-hover" size="sm">Hover</Button>
                  <Button variant="primary" size="sm" className="opacity-70">Button</Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#718096] w-16">Secondary</span>
                  <Button variant="secondary" size="sm" className="w-full">Button</Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#718096] w-16">Text</span>
                  <Button variant="text" size="sm">Button</Button>
                  <Button variant="text" size="sm" className="text-[#3182CE]">Button</Button>
                </div>
              </div>

              {/* Chip / Category */}
              <div className="space-y-2 pt-2 border-t border-[#E2EBF0]">
                <div className="text-[11px] font-semibold text-[#718096] uppercase">
                  CHIP / CATEGORY
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="green">Gazette Green</Badge>
                  <Badge variant="blue">IPL</Badge>
                  <Badge variant="teal">Business &amp; Markets</Badge>
                  <Badge variant="dark">Gazette</Badge>
                  <Badge variant="neutral">More</Badge>
                </div>
              </div>

              {/* Feature Adoption Spectrum */}
              <div className="space-y-2 pt-2 border-t border-[#E2EBF0]">
                <div className="text-[12px] font-medium text-[#191919]">
                  Feature Adoption Spectrum: Low, Medium, High
                </div>
                <SpectrumBar
                  leftPercent={35}
                  centerPercent={35}
                  rightPercent={30}
                  leftColor="bg-[#FBBF24]"
                  centerColor="bg-[#3182CE]"
                  rightColor="bg-[#38A169]"
                  leftLabel="Low"
                  centerLabel="Medium"
                  rightLabel="High"
                  height="h-4"
                />
              </div>
            </div>

            {/* CARD EXAMPLE PANEL */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase px-1">
                CARD EXAMPLE
              </div>
              <NewsCardExample />
            </div>

            {/* SHADOWS & BORDER RADIUS PANEL */}
            <div className="bg-white rounded-[12px] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0] space-y-4">
              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase">
                SHADOWS
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-16 bg-white border border-[#E2EBF0] rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]" />
                  <span className="text-[12px] font-medium text-[#4A5566]">Small 4px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-16 bg-white border border-[#E2EBF0] rounded-[8px] shadow-[0_4px_8px_rgba(0,0,0,0.08)]" />
                  <span className="text-[12px] font-medium text-[#4A5566]">Medium 8px</span>
                </div>
              </div>

              <div className="text-[11px] font-bold tracking-wider text-[#191919] uppercase pt-2 border-t border-[#E2EBF0]">
                BORDER RADIUS
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-16 bg-white border border-[#FBBF24] rounded-[12px]" />
                  <span className="text-[12px] font-medium text-[#4A5566]">Large 12px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-16 bg-white border border-[#FBBF24] rounded-full" />
                  <span className="text-[12px] font-medium text-[#4A5566]">Full 9999px</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM FOOTER BRAND & STATUS */}
        <div className="bg-white rounded-[12px] p-4 px-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#E2EBF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#4A5566]">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>
              Gazette Design System v2.1 // Open Source Insight Chronicle // Design System Status: Final // April 15, 2027
            </span>
          </div>
          <div className="italic font-medium text-[#191919]">
            &apos;Your product&apos;s official record.&apos;
          </div>
        </div>

      </div>
    </div>
  );
}
