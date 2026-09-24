"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MainNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "For You", href: "/for-you" },

  ];

  const isNavActive = (item: (typeof navItems)[0]) => {
    if (item.href === "/") return pathname === "/";
    if (item.href.startsWith("/")) return pathname.startsWith(item.href);
    return false;
  };

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E2EBF0] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Brand + Navigation Links */}
        <div className="flex items-center gap-8 md:gap-10">
          <Link href="/" className="shrink-0 flex items-center">
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = isNavActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-[15px] transition-colors relative py-1 cursor-pointer ${active
                      ? "font-bold text-[#191919]"
                      : "font-medium text-[#4A5566] hover:text-[#191919]"
                    }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FBBF24] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button
                variant="primary"
                size="md"
                className="px-6 py-2 h-9 text-[14px] font-semibold tracking-wide"
              >
                Sign Up
              </Button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button
                type="button"
                className="text-[14px] font-medium border border-[#E2EBF0] rounded-lg py-[7px] px-6 text-[#191919] hover:text-[#3182CE] hover:border-[#CBD5E0] transition-colors cursor-pointer"
              >
                Login
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-[#E2EBF0]",
                },
              }}
            />
          </Show>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#4A5566] hover:text-[#191919] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2EBF0] px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const active = isNavActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-[14px] ${active
                    ? "font-bold bg-[#F8FAFC] text-[#191919]"
                    : "text-[#4A5566]"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
