'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageSquare, Menu, X, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from './ui/button';
import { SITE_CONFIG, NAV_LINKS } from '@/lib/constants';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const { rmbRates } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all shadow-xs">
      {/* 1. Top Utility Bar (Figma: 1440x40, fill=#4e0b13, p=10px 120px) */}
      <div className="bg-[#4e0b13] text-white text-xs border-b border-[#630f1a]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] h-10 flex items-center justify-between gap-4">
          {/* RMB rate ticker */}
          <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar text-[12px] sm:text-[13px]">
            <span className="w-4 h-4 rounded-full bg-[#81141f] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              ¥
            </span>
            <span className="text-[#ebc7cb] font-medium shrink-0">
              RMB rates today
            </span>
            <span className="font-semibold text-white shrink-0">
              Pay RMB ¥1 = ₦{rmbRates.payRmbRate.toFixed(2)}  ·  Pay naira ¥1 = ₦{rmbRates.payNairaRate.toFixed(2)}
            </span>
            <span className="hidden md:inline text-[#ebc7cb] font-normal text-xs shrink-0">
              Updated {rmbRates.updatedAt}
            </span>
          </div>

          {/* Quick contact actions (Figma: gap 24px, #ebc7cb) */}
          <div className="flex items-center gap-6 shrink-0 text-xs text-[#ebc7cb]">
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="inline-flex items-center gap-2 hover:text-white transition-colors font-medium text-white"
            >
              <Phone className="w-3.5 h-3.5 text-[#ebc7cb]" />
              <span>Call us</span>
            </a>
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-white transition-colors font-medium text-[#ebc7cb]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#ebc7cb]" />
              <span className="text-white font-semibold">WhatsApp us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Figma: 1440x101, fill=#ffffff, stroke=#eae3e4, p=14px 120px) */}
      <div className="border-b border-[#eae3e4] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] h-[88px] lg:h-[101px] flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <BrandLogo tone="dark" size="md" href="/" />

          {/* Desktop Nav Links (Figma: gap 36px, font=Plus Jakarta Sans 600 15px, #1b1416) */}
          <nav className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-[15px] font-semibold tracking-tight transition-colors duration-150 py-1 relative',
                    isActive
                      ? 'text-[#81141f] font-bold'
                      : 'text-[#1b1416] hover:text-[#81141f]'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#81141f] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTA (Figma: Button [139x44] r=8 fill=#81141f text=#ffffff 14px font 600) */}
          <div className="hidden sm:flex items-center">
            <Link href="/cars/rent">
              <Button
                className="h-11 px-5 rounded-lg bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-sm shadow-xs transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>Book inspection</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1b1416] hover:bg-[#f8f5f5] border border-[#eae3e4] transition-colors active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 animate-scale-in" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#eae3e4] bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in-down duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-base font-semibold transition-colors',
                  pathname === link.href
                    ? 'bg-[#fbf3f4] text-[#81141f] font-bold'
                    : 'text-[#1b1416] hover:bg-[#f8f5f5]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#eae3e4] flex flex-col gap-2.5">
            <Link href="/cars/rent" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold">
                Book inspection
              </Button>
            </Link>
            <div className="flex items-center justify-between gap-2 pt-2 text-xs">
              <Link
                href="/my-booking"
                onClick={() => setMobileMenuOpen(false)}
                className="font-semibold text-[#81141f]"
              >
                Track My Booking
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-[#716769]"
              >
                Staff Portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
