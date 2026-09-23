"use client";

import React, { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function StayInformedBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div className="w-full bg-[#EBF2F7] border-t border-[#E2EBF0] mt-16 pt-12 pb-10 text-[#191919]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 3-Way Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left: Stay Informed & Newsletter Form (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-[18px] font-bold text-[#191919]">
              Stay Informed
            </h3>
            
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border border-[#CBD5E0] rounded-[8px] px-3.5 py-2 text-[14px] text-[#191919] placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="shrink-0 px-5 py-2 font-semibold"
              >
                {submitted ? "Subscribed!" : "Signup"}
              </Button>
            </form>
          </div>

          {/* Center: Brand Motif & Mission (Cols 5-8) */}
          <div className="lg:col-span-4 space-y-2">
            <Logo size="md" />
            <p className="text-[13px] text-[#4A5566] leading-relaxed max-w-xs">
              Chronicle of news insights for informed product and news teams.
            </p>
          </div>

          {/* Right: Company, Help, Connect (Cols 9-12) */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-4 text-[13px]">
            {/* Company */}
            <div className="space-y-2">
              <span className="font-bold text-[#191919] block">Company</span>
              <ul className="space-y-1.5 text-[#4A5566]">
                <li><a href="#about" className="hover:text-[#191919]">About</a></li>
                <li><a href="#access" className="hover:text-[#191919]">Access</a></li>
                <li><a href="#press" className="hover:text-[#191919]">Press</a></li>
                <li><a href="#contact" className="hover:text-[#191919]">Contact</a></li>
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-2">
              <span className="font-bold text-[#191919] block">Help</span>
              <ul className="space-y-1.5 text-[#4A5566]">
                <li><a href="#help" className="hover:text-[#191919]">Help Center</a></li>
                <li><a href="#guides" className="hover:text-[#191919]">Guides</a></li>
                <li><a href="#privacy" className="hover:text-[#191919]">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-[#191919]">Terms of Service</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-2">
              <span className="font-bold text-[#191919] block">Connect</span>
              <div className="flex items-center gap-2.5 text-[#191919] pt-1">
                {/* X */}
                <a href="https://twitter.com" aria-label="X" className="hover:text-[#3182CE]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-[#3182CE]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com" aria-label="Facebook" className="hover:text-[#3182CE]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com" aria-label="YouTube" className="hover:text-[#3182CE]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Design System status line & Copyright */}
        <div className="pt-8 border-t border-[#D2DEE7] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#4A5566]">
          <div>
            Gazette Design System v2.1 // Open Source Insight Chronicle // Design System Status: Final // April 15, 2027
          </div>
          <div>
            © 2026 Gazette. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}
