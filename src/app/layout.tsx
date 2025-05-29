"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "../../components/WalletProvider";
import Image from "next/image";
import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import { useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <title>Alpha Snap – Snap Anything, Get the Alpha</title>
        <meta name="description" content="Understand complex content in seconds" />
        <meta property="og:title" content="Alpha Snap – Snap Anything, Get the Alpha" />
        <meta property="og:description" content="Understand complex content in seconds" />
        <meta property="og:image" content="/branding/alphasoc.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alpha Snap – Snap Anything, Get the Alpha" />
        <meta name="twitter:description" content="Understand complex content in seconds" />
        <meta name="twitter:image" content="/branding/alphasoc.png" />
        <link rel="icon" href="/branding/newfaviconalpha.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <nav className="w-full flex items-center justify-between px-4 md:px-8 py-6 z-10 relative bg-transparent">
            <Link href="/" className="flex items-center gap-2 text-[#406824]">
              <Image src="/branding/newlogoalpha.png" alt="Alpha Snap Logo" width={160} height={32} priority />
            </Link>
            {/* Desktop Menu */}
            <div className="flex-1 justify-center hidden md:flex">
              <div className="flex items-center gap-6">
                <a href="#features" className="text-white text-sm font-semibold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a>
                <a href="#mission" className="text-white text-sm font-semibold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' }); }}>Our mission</a>
                <a href="#coming-features" className="text-white text-sm font-semibold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); document.getElementById('coming-features')?.scrollIntoView({ behavior: 'smooth' }); }}>Upcoming features</a>
                <a href="#token" className="text-white text-sm font-semibold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); document.getElementById('token')?.scrollIntoView({ behavior: 'smooth' }); }}>$ALPHA</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletConnectButton />
              {/* Hamburger for mobile */}
              <button
                className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
            </div>
            {/* Mobile Menu Modal */}
            {menuOpen && (
              <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111] bg-opacity-95">
                <button
                  className="absolute top-6 right-8 text-gray-400 hover:text-green-300 text-4xl font-bold"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
                <div className="flex flex-col gap-8 items-center">
                  <a href="#features" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); setMenuOpen(false); setTimeout(() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>How it works</a>
                  <a href="#mission" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); setMenuOpen(false); setTimeout(() => { document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Our mission</a>
                  <a href="#coming-features" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); setMenuOpen(false); setTimeout(() => { document.getElementById('coming-features')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Upcoming features</a>
                  <a href="#token" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={e => { e.preventDefault(); setMenuOpen(false); setTimeout(() => { document.getElementById('token')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>$ALPHA</a>
                </div>
              </div>
            )}
          </nav>
          {children}
        </WalletProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
