import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Gazette — Insight chronicle for product teams",
  description: "Production-style AI-powered news and insight chronicle for product teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#191919] antialiased">
        <ClerkProvider>
          <Analytics />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}