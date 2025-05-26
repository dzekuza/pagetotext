"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "../../components/WalletProvider";
import Image from "next/image";
import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import { useState } from "react";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <nav className="w-full flex items-center justify-between px-8 py-6 z-10 relative">
            <Link href="/">
              <Image src="/branding/alphasnap.svg" alt="Snap Anything Logo" width={160} height={32} priority />
            </Link>
            {/* Desktop Menu */}
            <div className="flex-1 justify-center hidden md:flex">
              <div className="flex items-center gap-6">
                <a href="#features" className="text-white text-sm font-semibold hover:text-green-300 transition-colors">How it works</a>
                <a href="#mission" className="text-white text-sm font-semibold hover:text-green-300 transition-colors">Our mission</a>
                <a href="#coming-features" className="text-white text-sm font-semibold hover:text-green-300 transition-colors">Upcoming features</a>
                <a href="#token" className="text-white text-sm font-semibold hover:text-green-300 transition-colors">$ALPHA</a>
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
                  <a href="#features" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={() => setMenuOpen(false)}>How it works</a>
                  <a href="#mission" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={() => setMenuOpen(false)}>Our mission</a>
                  <a href="#coming-features" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={() => setMenuOpen(false)}>Upcoming features</a>
                  <a href="#token" className="text-white text-2xl font-bold hover:text-green-300 transition-colors" onClick={() => setMenuOpen(false)}>$ALPHA</a>
                </div>
              </div>
            )}
          </nav>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
