'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Lock,
  Phone,
  Plus,
  X,
  ShieldAlert,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_CONFIG } from '@/lib/constants';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I book a car?',
    answer:
      'Choose a car, pick your dates and send a booking request. We confirm availability on WhatsApp, then you pay by bank transfer and upload your receipt on the site.'
  },
  {
    question: 'What do I need for a self–drive rental?',
    answer:
      "A valid driver's licence and a government-issued ID. If you'd rather not drive, choose the “with driver” option and one of our drivers will handle it."
  },
  {
    question: 'What is the caution fee?',
    answer:
      "A refundable deposit held during your rental. It's returned after the car is checked back in, less any agreed charges for damage or fuel."
  },
  {
    question: 'Can I inspect a property before I pay?',
    answer:
      "Yes. Inspections are free — book one from any property page and we'll confirm the time and address on WhatsApp."
  },
  {
    question: 'How does RMB exchange work?',
    answer:
      "Use the calculator, tap Get account and add your name, email and WhatsApp number. Paying RMB to get naira? We send our RMB account details to your WhatsApp. Paying naira to get RMB? You'll see our company account straight away."
  },
  {
    question: 'What happens if the rate changes before I pay?',
    answer:
      "Your rate is locked for 30 minutes after you tap Get account. If you pay after that, we'll confirm the current rate with you on WhatsApp first."
  },
  {
    question: 'How do I receive my naira or RMB?',
    answer:
      'Naira is paid into your Nigerian bank account. RMB can be sent to Alipay, WeChat Pay or a Chinese bank account. Share the details with us on WhatsApp.'
  },
  {
    question: 'How long does an exchange take?',
    answer:
      'Most payments are confirmed within 30 minutes during business hours, and we pay out right after confirmation.'
  }
];

const TOPICS = [
  { id: 'faqs', label: 'FAQs', icon: MessageSquare },
  { id: 'terms', label: 'Terms of service', icon: FileText },
  { id: 'privacy', label: 'Privacy policy', icon: Lock },
  { id: 'contact', label: 'Contact us', icon: Phone }
];

export default function HelpAndLegalPage() {
  const [activeTopic, setActiveTopic] = useState<'faqs' | 'terms' | 'privacy' | 'contact'>('faqs');
  // FAQ #0 starts open as seen in Figma screenshot
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  const scrollToSection = (id: 'faqs' | 'terms' | 'privacy' | 'contact') => {
    setActiveTopic(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const waLink = `https://wa.me/2348139690031?text=${encodeURIComponent(
    'Hello BZ Group Help Desk, I have a question regarding your services.'
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      {/* ========================================================
          1. PAGE HEADER (Figma: Page header fill=#4e0b13)
         ======================================================== */}
      <section className="w-full bg-[#4e0b13] text-white pt-12 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb: Home > Help & legal */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#f6e3e5] mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#ebc7cb]" />
            <span className="text-white font-medium">Help & legal</span>
          </nav>

          {/* Heading */}
          <h1 className="font-serif text-[42px] sm:text-[48px] font-semibold text-white tracking-tight leading-tight">
            Help & legal
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] text-[#f6e3e5] mt-2.5 font-normal max-w-2xl leading-relaxed">
            Answers to common questions about rentals, property and RMB exchange, plus our terms and privacy policy.
          </p>
        </div>
      </section>

      {/* ========================================================
          2. BODY (Figma: Body [1200px container, sidebar 264px + main])
         ======================================================== */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ----------------------------------------------------
              LEFT SIDEBAR: On this page (Topics)
             ---------------------------------------------------- */}
          <aside className="lg:col-span-3 sticky top-28 space-y-2">
            <div className="text-[11px] font-bold text-[#716769] uppercase tracking-[0.14em] px-3.5 mb-2">
              On this page
            </div>

            <nav className="space-y-1">
              {TOPICS.map(item => {
                const Icon = item.icon;
                const isActive = activeTopic === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#fcf3f4] text-[#81141f]'
                        : 'text-[#1b1416] hover:bg-[#f8f5f5] hover:text-[#81141f]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#81141f]' : 'text-[#716769]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ----------------------------------------------------
              RIGHT COLUMN: Main Content Sections
             ---------------------------------------------------- */}
          <div className="lg:col-span-9 space-y-14">
            {/* ==================================================
                SECTION 1: FAQs (Frequently asked questions)
               ================================================== */}
            <section id="faqs" className="space-y-6 scroll-mt-28">
              <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                Frequently asked questions
              </h2>

              <div className="space-y-3.5">
                {FAQ_ITEMS.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-[14px] border transition-all ${
                        isOpen
                          ? 'border-[#ebc7cb] bg-white shadow-xs'
                          : 'border-[#eae3e4] bg-white hover:border-[#ebc7cb]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full p-5 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                        aria-expanded={isOpen}
                      >
                        <span className="text-[16px] font-semibold text-[#1b1416] leading-snug">
                          {faq.question}
                        </span>

                        {/* Toggle button: Filled wine with × when open, rose circle with + when closed */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isOpen
                              ? 'bg-[#81141f] text-white'
                              : 'bg-[#fcf3f4] text-[#81141f] hover:bg-[#f8e5e7]'
                          }`}
                        >
                          {isOpen ? (
                            <X className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-[15px] text-[#4a4245] leading-relaxed font-normal border-t border-[#eae3e4]/60">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ==================================================
                SECTION 2: Terms of service
               ================================================== */}
            <section id="terms" className="space-y-6 pt-4 scroll-mt-28">
              <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                Terms of service
              </h2>

              {/* Legal Notice Banner */}
              <div className="rounded-[10px] bg-[#fbf0df] border border-[#f5dfb8] px-4 py-3 flex items-center gap-3 text-[13px] text-[#8a4e00]">
                <ShieldAlert className="w-4 h-4 text-[#8a4e00] shrink-0" />
                <span>Placeholder — final wording to be supplied by BZ Group's legal adviser.</span>
              </div>

              {/* 5 Numbered Items */}
              <div className="space-y-5 text-[#1b1416] pt-1">
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    1. Bookings and availability
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [How bookings are confirmed, and when a booking becomes binding.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    2. Payments and receipts
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Bank transfer terms, receipt verification and refunds.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    3. Car rentals
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Licence requirements, caution fee, fuel, damage and late returns.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    4. Property
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Inspections, offers, title documents and agency terms.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    5. RMB exchange
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Rate locks, payout timelines and limits of liability.]
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                SECTION 3: Privacy policy
               ================================================== */}
            <section id="privacy" className="space-y-6 pt-4 scroll-mt-28">
              <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                Privacy policy
              </h2>

              {/* Legal Notice Banner */}
              <div className="rounded-[10px] bg-[#fbf0df] border border-[#f5dfb8] px-4 py-3 flex items-center gap-3 text-[13px] text-[#8a4e00]">
                <ShieldAlert className="w-4 h-4 text-[#8a4e00] shrink-0" />
                <span>Placeholder — final wording to be supplied by BZ Group's legal adviser.</span>
              </div>

              {/* 4 Privacy Items */}
              <div className="space-y-5 text-[#1b1416] pt-1">
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    What we collect
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Contact details, ID documents, payment receipts and booking history.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    How we use it
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [To verify payments, confirm bookings and contact you on WhatsApp or email.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    Who we share it with
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [Payment partners in China for payouts; never sold to third parties.]
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#1b1416]">
                    Your rights
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    [How to request a copy or deletion of your data.]
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                SECTION 4: Contact us (Still have a question banner)
               ================================================== */}
            <section id="contact" className="pt-4 scroll-mt-28">
              <div className="rounded-[18px] bg-[#4e0b13] text-white p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-[28px] sm:text-[32px] font-semibold text-white leading-tight">
                    Still have a question?
                  </h3>
                  <p className="text-[14px] text-[#f6e3e5] font-normal">
                    Talk to the team on WhatsApp or call <strong>0706 448 2628</strong>.
                  </p>
                </div>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-white hover:bg-[#f6e3e5] text-[#81141f] font-semibold text-[14px] shadow-sm transition-colors cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
