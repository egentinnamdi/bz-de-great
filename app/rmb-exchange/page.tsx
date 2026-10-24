'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Check
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { RmbCalculator } from '@/components/rmb-calculator';
import { useStore } from '@/lib/store';

export default function RmbExchangeLandingPage() {
  const { rmbRates } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416] font-sans">
      {/* 1. Global Site Header */}
      <SiteHeader />

      <main className="flex-1">
        {/* 2. Hero Section matching Screenshot 1 */}
        <section className="bg-[#4e0b13] text-white py-16 lg:py-24">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Heading, Subtitle & Rate Cards */}
              <div className="lg:col-span-7 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[#ebc7cb]">
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                  <span>&gt;</span>
                  <span className="text-white font-medium">RMB exchange</span>
                </div>

                {/* Eyebrow */}
                <span className="text-xs font-bold uppercase tracking-widest text-[#ebc7cb] block">
                  RMB EXCHANGE
                </span>

                {/* Heading */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-semibold text-white leading-[1.1] tracking-tight">
                  Change RMB and naira at a<br />
                  rate you can see.
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-[#f6e3e5] leading-relaxed max-w-xl">
                  Pay RMB and get naira, or pay naira and get RMB. Our rates are set every morning and shown upfront — no hidden spread.
                </p>

                {/* Two Rate Preview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4.5 backdrop-blur-xs">
                    <span className="text-xs text-[#ebc7cb] block font-medium">
                      Pay RMB, get naira
                    </span>
                    <span className="text-2xl font-bold font-serif text-white block mt-1">
                      ¥1 = ₦{rmbRates.payRmbRate.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/15 bg-white/5 p-4.5 backdrop-blur-xs">
                    <span className="text-xs text-[#ebc7cb] block font-medium">
                      Pay naira, get RMB
                    </span>
                    <span className="text-2xl font-bold font-serif text-white block mt-1">
                      ¥1 = ₦{rmbRates.payNairaRate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Footnote */}
                <div className="flex items-center gap-2 text-xs text-[#ebc7cb] pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated today at {rmbRates.updatedAt || '9:30 AM'}</span>
                </div>
              </div>

              {/* Right Column: Live Interactive RMB Calculator */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <RmbCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* 3. "HOW IT WORKS" / "Two ways to exchange" matching Screenshot 2 */}
        <section className="py-20 lg:py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] space-y-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A0C1A] block mb-2">
                HOW IT WORKS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1b1416]">
                Two ways to exchange
              </h2>
              <p className="text-xs sm:text-sm text-[#716769] leading-relaxed mt-1">
                Start with the calculator, tap Get account, and add your name, email and WhatsApp number.
              </p>
            </div>

            {/* Two Side-by-Side Step Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Pay RMB, get naira */}
              <div className="rounded-2xl border border-[#eae3e4] bg-[#faf7f7] p-7 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-[#1b1416]">
                    Pay RMB, get naira
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7A0C1A] text-white text-[11px] font-bold">
                    ¥ → ₦
                  </span>
                </div>

                <div className="space-y-4 text-xs text-[#1b1416]">
                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Calculate with today&apos;s rate</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Tap Get account</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>Enter your name, email and WhatsApp number</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>We send our RMB account to your WhatsApp</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      5
                    </span>
                    <span>Pay the RMB and send us the screenshot</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      6
                    </span>
                    <span>Receive naira in your bank account</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Pay naira, get RMB */}
              <div className="rounded-2xl border border-[#eae3e4] bg-[#faf7f7] p-7 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-[#1b1416]">
                    Pay naira, get RMB
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7A0C1A] text-white text-[11px] font-bold">
                    ₦ → ¥
                  </span>
                </div>

                <div className="space-y-4 text-xs text-[#1b1416]">
                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Calculate with today&apos;s rate</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Tap Get account</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>Enter your name, email and WhatsApp number</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>See our company account and pay the naira</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      5
                    </span>
                    <span>Upload your receipt</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border border-[#eae3e4] bg-white text-[#716769] font-bold text-[10px] flex items-center justify-center shrink-0">
                      6
                    </span>
                    <span>Receive RMB via Alipay, WeChat Pay or bank</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Three Feature Benefit Cards matching Screenshot 2 bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 space-y-2.5 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#fdf3f4] text-[#7A0C1A] flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#1b1416]">Rates set every morning</h4>
                <p className="text-xs text-[#716769] leading-relaxed">
                  Both rates are shown before you commit.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 space-y-2.5 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#fdf3f4] text-[#7A0C1A] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#1b1416]">Checked by our team</h4>
                <p className="text-xs text-[#716769] leading-relaxed">
                  Every payment is confirmed by a person before we pay out.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 space-y-2.5 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#fdf3f4] text-[#7A0C1A] flex items-center justify-center mb-3">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#1b1416]">Real people on WhatsApp</h4>
                <p className="text-xs text-[#716769] leading-relaxed">
                  Ask anything before, during or after your exchange.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Global Site Footer */}
      <SiteFooter />
    </div>
  );
}
