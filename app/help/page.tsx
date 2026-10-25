'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Lock,
  Phone,
  Plus,
  X,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  Building,
  CheckCircle2,
  Scale,
  AlertTriangle
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
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
      "Your rate is locked for 25 minutes after you tap Get account. If you pay after that, we'll confirm the current rate with you on WhatsApp first."
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const isClickScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  const scrollToSection = (id: 'faqs' | 'terms' | 'privacy' | 'contact') => {
    setActiveTopic(id);
    isClickScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 850);
    }
  };

  // Synchronize scrolling with the left navigation bar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check initial hash on mount
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash === 'terms' || initialHash === 'privacy' || initialHash === 'contact' || initialHash === 'faqs') {
      setActiveTopic(initialHash as any);
      setTimeout(() => {
        const el = document.getElementById(initialHash);
        if (el) {
          const headerOffset = 110;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 150);
    }

    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Bottom of page: always highlight Contact us
      if (windowHeight + scrollY >= documentHeight - 80) {
        setActiveTopic('contact');
        return;
      }

      const sectionIds: ('faqs' | 'terms' | 'privacy' | 'contact')[] = ['faqs', 'terms', 'privacy', 'contact'];
      const headerOffset = 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= headerOffset) {
            setActiveTopic(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const waLink = `https://wa.me/2347064482628?text=${encodeURIComponent(
    'Hello BZ Group Help Desk, I have a question regarding your services.'
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      {/* ========================================================
          1. PAGE HEADER (Figma fill=#4e0b13)
         ======================================================== */}
      <section className="w-full bg-[#4e0b13] text-white pt-12 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#f6e3e5] mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#ebc7cb]" />
            <span className="text-white font-medium">Help &amp; legal</span>
          </nav>

          <h1 className="font-serif text-[40px] sm:text-[48px] font-semibold text-white tracking-tight leading-tight">
            Help &amp; Legal
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#f6e3e5] mt-2.5 font-normal max-w-2xl leading-relaxed">
            Answers to common questions about rentals, property and RMB exchange, plus our complete official terms of service and statutory privacy policy.
          </p>
        </div>
      </section>

      {/* ========================================================
          2. BODY (Container: 1200px, Sidebar: 264px + Main: 9 cols)
         ======================================================== */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ----------------------------------------------------
              LEFT SIDEBAR: On this page (Topics)
             ---------------------------------------------------- */}
          <aside className="lg:col-span-3 sticky top-28 space-y-4">
            <div className="text-[11px] font-bold text-[#716769] uppercase tracking-[0.14em] px-3.5">
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
                        ? 'bg-[#fcf3f4] text-[#81141f] shadow-sm'
                        : 'text-[#1b1416] hover:bg-[#f8f5f5] hover:text-[#81141f]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#81141f]' : 'text-[#716769]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Official Support & Anti-Scam Callout */}
            <div className="rounded-xl border border-[#ebc7cb] bg-[#fbf3f4] p-4 space-y-2 text-xs">
              <span className="font-bold text-[#81141f] uppercase tracking-wider block">
                Official Help Desk
              </span>
              <p className="text-[#4a4245] leading-relaxed">
                Need direct assistance or want to verify an account before paying?
              </p>
              <a
                href="tel:+2347064482628"
                className="font-bold text-[#81141f] text-sm block hover:underline"
              >
                +234 706 448 2628
              </a>
            </div>
          </aside>

          {/* ----------------------------------------------------
              RIGHT COLUMN: Main Content Sections
             ---------------------------------------------------- */}
          <div className="lg:col-span-9 space-y-16">
            {/* ==================================================
                SECTION 1: FAQs (Frequently asked questions)
               ================================================== */}
            <ScrollReveal animation="fade-in-up">
              <section id="faqs" className="space-y-6 scroll-mt-28">
                <div className="border-b border-[#eae3e4] pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#81141f] block mb-1">
                    Knowledge Base
                  </span>
                  <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                    Frequently asked questions
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {FAQ_ITEMS.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className={`rounded-[14px] border transition-all duration-300 ${
                          isOpen
                            ? 'border-[#ebc7cb] bg-white shadow-sm'
                            : 'border-[#eae3e4] bg-white hover:border-[#ebc7cb]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          className="w-full p-5 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none group"
                          aria-expanded={isOpen}
                        >
                          <span
                            className={`text-[16px] font-semibold leading-snug transition-colors duration-200 ${
                              isOpen ? 'text-[#81141f]' : 'text-[#1b1416] group-hover:text-[#81141f]'
                            }`}
                          >
                            {faq.question}
                          </span>

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              isOpen
                                ? 'bg-[#81141f] text-white rotate-90'
                                : 'bg-[#fcf3f4] text-[#81141f] group-hover:bg-[#f8e5e7]'
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
                          <div className="px-5 sm:px-6 pb-6 pt-1 text-[15px] text-[#4a4245] leading-relaxed font-normal border-t border-[#eae3e4]/60 animate-fade-in-up">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </ScrollReveal>

            {/* ==================================================
                SECTION 2: Terms of service (Verbatim from PDF Part A)
               ================================================== */}
            <ScrollReveal animation="fade-in-up">
              <section id="terms" className="space-y-8 pt-6 border-t border-[#eae3e4] scroll-mt-28">
                <div className="border-b border-[#eae3e4] pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#81141f] block mb-1">
                    Part A — Terms &amp; Conditions
                  </span>
                  <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                    Terms of service
                  </h2>
                  <p className="text-sm text-[#716769] mt-1">
                    Official Terms &amp; Conditions for the BZ Group website (www.bzdegreat.com), covering car rentals, car sales, home rentals and RMB exchange.
                  </p>
                </div>

                {/* Anti-Scam Notice Callout */}
                <div className="rounded-xl border border-[#f0d1a4] bg-[#fbf6ef] p-5 text-[#8a4e00] space-y-2 text-sm leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#9a5800]">
                    <ShieldAlert className="w-4 h-4 text-[#9a5800]" />
                    <span>Official Anti-Scam Notice &amp; Corporate Bank Credentials</span>
                  </div>
                  <p>
                    BZ Group will only ask you to pay into <strong>official company accounts</strong> shown on our invoices:
                  </p>
                  <div className="bg-white/90 border border-[#edd7b6] rounded-lg p-3 text-xs sm:text-sm font-mono text-[#633800] space-y-0.5">
                    <div><strong>Bank:</strong> Premium Trust Bank</div>
                    <div><strong>Account Number:</strong> 0010252664</div>
                    <div><strong>Account Name:</strong> BZ DE GREAT HOMES AND PROPERTIES</div>
                  </div>
                  <p className="text-xs text-[#8a4e00]">
                    We are not responsible for payments made to individuals or accounts not confirmed by us. If in doubt, call <strong>07064482628 / +234 706 448 2628</strong> before paying.
                  </p>
                </div>

                {/* All 7 Clauses Exactly From PDF Part A */}
                <div className="space-y-10 text-[#1b1416] text-[15px] leading-relaxed">
                  {/* 1. About Us and Acceptance */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        About Us and Acceptance
                      </h3>
                    </div>

                    <p>
                      <strong>1.1 Who we are.</strong> This website (<strong>www.bzdegreat.com</strong>) is operated by <strong>BZ Group — Global Universal Solutions</strong> (&ldquo;BZ Group&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), together with its divisions, including <strong>BZ de Great Homes and Properties</strong>.
                    </p>

                    <div>
                      <strong>1.2 Our offices:</strong>
                      <div className="mt-2.5 overflow-x-auto rounded-xl border border-[#eae3e4]">
                        <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                          <thead className="bg-[#fbf9f9] border-b border-[#eae3e4] text-[#716769]">
                            <tr>
                              <th className="py-2.5 px-4 font-semibold w-40">Office</th>
                              <th className="py-2.5 px-4 font-semibold">Address</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eae3e4]">
                            <tr>
                              <td className="py-2.5 px-4 font-bold text-[#81141f]">Head Office</td>
                              <td className="py-2.5 px-4">Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-4 font-bold text-[#81141f]">Branch Office 1</td>
                              <td className="py-2.5 px-4">Opp. Solar House, Beside NTA, Okpanam Road, Asaba, Delta State</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-4 font-bold text-[#81141f]">Branch Office 2</td>
                              <td className="py-2.5 px-4">No. 2 Thomas Estate, Ajah, Lagos State</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-4 font-bold text-[#81141f]">Branch Office 3</td>
                              <td className="py-2.5 px-4">STEM PARK, Ochacho Junction, After Nyzamie Hospital, Karmo, Abuja</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-2 text-xs text-[#716769]">
                        Phone: <strong>07064482628 · +234 706 448 2628</strong> · Email: <strong>support@bzdegreat.com</strong>
                      </p>
                    </div>

                    <p>
                      <strong>1.3 Our services.</strong> Through this website and our offices we offer: <strong>car rentals</strong>, <strong>car sales</strong>, <strong>home rentals and property services</strong>, and <strong>RMB (Chinese Yuan) exchange</strong>. Each service has its own section below, which applies together with these general terms.
                    </p>

                    <p>
                      <strong>1.4 Acceptance.</strong> By using this website, submitting an enquiry or form, making a booking, or paying for any of our services, you agree to these Terms and to our Privacy Policy (Part B). If you do not agree, please do not use the website or our services.
                    </p>

                    <p>
                      <strong>1.5 Separate agreements.</strong> Some services also need a signed agreement (for example, a car rental agreement, vehicle sale agreement or tenancy agreement). If that agreement conflicts with these Terms, the signed agreement applies.
                    </p>
                  </div>

                  {/* 2. Using the Website */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Using the Website
                      </h3>
                    </div>

                    <p>
                      <strong>2.1 Information on the website.</strong> Vehicle and property listings, photos, prices and exchange rates are for general information. They can change at any time and are confirmed only when we issue a written quote, invoice or agreement.
                    </p>

                    <p>
                      <strong>2.2 Enquiries and bookings.</strong> Submitting a form or WhatsApp enquiry is a request, not a confirmed booking or purchase. A booking or sale is confirmed only when we confirm it in writing and receive any required payment.
                    </p>

                    <p>
                      <strong>2.3 Accurate information.</strong> You must give true, complete and up-to-date details, and be at least 18 years old to book, buy or exchange with us.
                    </p>

                    <div className="space-y-1.5">
                      <strong>2.4 Prohibited use.</strong> You must not:
                      <ol className="list-decimal pl-6 space-y-1 text-sm text-[#4a4245]">
                        <li>use the website for fraud, money laundering or any unlawful purpose;</li>
                        <li>impersonate another person or give false identity documents;</li>
                        <li>copy, scrape or resell our listings, photos or content;</li>
                        <li>try to hack, overload or disrupt the website;</li>
                        <li>post or send harmful, offensive or misleading content.</li>
                      </ol>
                    </div>

                    <p>
                      <strong>2.5 Fake agents and scams.</strong> BZ Group will only ask you to pay into official company accounts shown on our invoices or confirmed by our offices. We are not responsible for payments made to individuals or accounts not confirmed by us. If in doubt, call <strong>07064482628</strong> before paying.
                    </p>

                    <p>
                      <strong>2.6 Intellectual property.</strong> The BZ Group name, logo, website design, text and photos belong to BZ Group or are used with permission. You may not use them without our written consent.
                    </p>

                    <p>
                      <strong>2.7 Links to other sites.</strong> We are not responsible for the content or practices of websites we link to.
                    </p>
                  </div>

                  {/* 3. Car Rentals */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Car Rentals
                      </h3>
                    </div>

                    <p>
                      <strong>3.1 Who can rent.</strong> The renter must be at least 21 years old, hold a valid driver&apos;s licence (for self-drive) and provide a valid ID (NIN slip, international passport, driver&apos;s licence or voter&apos;s card) and proof of address. We may refuse a rental at our discretion.
                    </p>

                    <p>
                      <strong>3.2 Booking and payment.</strong> A booking is confirmed when the rental fee and refundable security deposit are paid in full. Rates are per day (24 hours) unless stated otherwise.
                    </p>

                    <p>
                      <strong>3.3 Chauffeur or self-drive.</strong> Chauffeur-driven rentals include the driver; the renter covers the driver&apos;s feeding and accommodation on out-of-town trips unless agreed otherwise. Self-drive rentals are only for approved drivers named in the rental agreement.
                    </p>

                    <p>
                      <strong>3.4 Fuel, tolls and fines.</strong> The renter pays for fuel, tolls, parking and any traffic fines or penalties incurred during the rental. Vehicles are returned with the same fuel level as at pick-up.
                    </p>

                    <p>
                      <strong>3.5 Use of the vehicle.</strong> The vehicle must not be used for illegal activities, carrying goods for hire, racing, towing, off-road driving, or by anyone under the influence of alcohol or drugs. It must not leave the agreed state or route without our written consent.
                    </p>

                    <p>
                      <strong>3.6 Late return.</strong> Late returns are charged at the hourly or daily rate. If a vehicle is not returned and the renter cannot be reached within 12 hours of the agreed time, we may report it to the police as stolen.
                    </p>

                    <p>
                      <strong>3.7 Damage and accidents.</strong> The renter must report any accident, damage or theft to us and to the police immediately. The renter is responsible for loss or damage during the rental caused by negligence or breach of these terms, which may be deducted from the security deposit, with any balance payable on demand.
                    </p>

                    <p>
                      <strong>3.8 Cancellations.</strong> Cancellations more than 48 hours before pick-up receive a full refund; later cancellations or no-shows may lose up to 50% of the rental fee.
                    </p>

                    <p>
                      <strong>3.9 Breakdowns.</strong> If the vehicle breaks down through no fault of the renter, we will repair or replace it as soon as practicable, or refund the unused days.
                    </p>
                  </div>

                  {/* 4. Car Sales */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Car Sales
                      </h3>
                    </div>

                    <p>
                      <strong>4.1 Listings.</strong> We describe each vehicle (make, model, year, mileage, condition, whether foreign-used or Nigerian-used) as accurately as we can. Buyers are encouraged to inspect the vehicle, test-drive it and, if they wish, bring their own mechanic before paying.
                    </p>

                    <p>
                      <strong>4.2 Reservation deposit.</strong> A vehicle may be reserved with a deposit for 3 to 7 days. If the buyer does not complete payment in that time, the reservation lapses and the deposit is refundable less 10% administrative cost.
                    </p>

                    <p>
                      <strong>4.3 Price and payment.</strong> The agreed price is stated in the sale agreement or invoice. Payment must be made to an official BZ Group account. The vehicle, keys and documents are released only after full payment is confirmed.
                    </p>

                    <p>
                      <strong>4.4 Documents.</strong> On full payment we hand over the documents we hold for the vehicle, such as the customs papers (for imported vehicles), purchase receipt, vehicle licence, proof of ownership and, where applicable, the change-of-ownership forms. Registration and change-of-ownership fees are paid by the buyer unless agreed otherwise.
                    </p>

                    <p>
                      <strong>4.5 Condition and warranty.</strong> Used vehicles are sold &ldquo;as seen and inspected&rdquo; unless a written warranty is given in the sale agreement. Nothing here removes rights you have under the Federal Competition and Consumer Protection Act 2018, such as the right to accurate descriptions.
                    </p>

                    <p>
                      <strong>4.6 Returns.</strong> Once a vehicle is delivered and accepted, sales are final unless the vehicle was materially misdescribed or a written warranty applies.
                    </p>

                    <p>
                      <strong>4.7 Trade-ins and sourcing.</strong> Trade-in values and vehicles sourced on request (including imports) are agreed in writing case by case, including timelines, deposits and what happens if the vehicle cannot be delivered.
                    </p>
                  </div>

                  {/* 5. Home Rentals and Property */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        5
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Home Rentals and Property
                      </h3>
                    </div>

                    <p>
                      <strong>5.1 Our role.</strong> BZ de Great Homes and Properties acts as agent and property manager for landlords. Each tenancy is between the landlord and the tenant, under a written tenancy agreement prepared through us.
                    </p>

                    <p>
                      <strong>5.2 Inspections.</strong> Prospective tenants may book inspections through the website or our offices. Any inspection fee is stated before the inspection and is not refundable.
                    </p>

                    <p>
                      <strong>5.3 Fees.</strong> Rent, legal fees, agency or management fees and any other charges are shown on the offer letter or invoice before payment. All payments must be made to the landlord&apos;s or BZ Group&apos;s official account, against an official receipt.
                    </p>

                    <p>
                      <strong>5.4 Tenant screening.</strong> We may verify a prospective tenant&apos;s identity, employment or business, and references before an offer is made. We may decline an application without giving reasons.
                    </p>

                    <p>
                      <strong>5.5 Keys and move-in.</strong> Keys are handed over only after full payment and signing of the tenancy agreement. Any agreed repairs or maintenance before move-in are carried out after full payment.
                    </p>

                    <p>
                      <strong>5.6 During the tenancy.</strong> The tenancy agreement sets out the rights and duties of the landlord and tenant, including use of the property, repairs, damage on relocation, renewal and notice. In any conflict, the signed tenancy agreement applies.
                    </p>

                    <p>
                      <strong>5.7 Listings.</strong> Property photos and descriptions are a guide only; the property as inspected is what is let. Availability is not guaranteed until the offer is accepted and paid for.
                    </p>
                  </div>

                  {/* 6. RMB (Chinese Yuan) Exchange */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        6
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        RMB (Chinese Yuan) Exchange
                      </h3>
                    </div>

                    <p>
                      <strong>6.1 The service.</strong> We help customers exchange Naira for Chinese Yuan (RMB) and RMB for Naira, including payments to suppliers&apos; accounts in China (for example, bank accounts, Alipay or WeChat Pay), in compliance with the foreign exchange rules of the Central Bank of Nigeria (CBN).
                    </p>

                    <p>
                      <strong>6.2 Know your customer.</strong> Before any exchange we must verify your identity (BVN or NIN, valid ID and phone number) and, for business payments, your business details and the purpose of the payment, such as an invoice from the supplier. We may ask for more information at any time.
                    </p>

                    <p>
                      <strong>6.3 Rates.</strong> Exchange rates move constantly. The rate shown on the website or in a chat is indicative only. Your rate is fixed only when we confirm it in writing and receive your full payment within the time stated in the quote (usually 25 minutes). If payment arrives later, the rate on the day of receipt applies.
                    </p>

                    <p>
                      <strong>6.4 Payment and delivery.</strong> You must pay into the official BZ Group account in the quote (<strong>Premium Trust Bank · 0010252664 · BZ DE GREAT HOMES AND PROPERTIES</strong>). We send the RMB (or Naira) to the account details you give us, usually within business hours of receiving cleared funds. You are responsible for giving correct recipient details; we will send a payment confirmation or receipt.
                    </p>

                    <p>
                      <strong>6.5 Wrong details.</strong> If you give wrong recipient details, we will try to recover the funds but cannot guarantee it. Any charges for recovery or re-sending are paid by you.
                    </p>

                    <p>
                      <strong>6.6 Delays.</strong> Payments can be delayed by bank holidays in Nigeria or China, checks by banks or payment platforms, or regulatory requirements. We are not liable for losses caused by such delays outside our control, but we will keep you informed.
                    </p>

                    <p>
                      <strong>6.7 Prohibited transactions.</strong> We will refuse, hold or report any transaction we reasonably suspect involves fraud, money laundering, terrorist financing, sanctions breaches, illegal goods or false documents. We comply with Nigerian anti-money-laundering laws, and may share information with the authorities where required.
                    </p>

                    <p>
                      <strong>6.8 Cancellations and refunds.</strong> Once RMB has been sent, a transaction cannot be cancelled. If we cannot complete a transaction, we refund the Naira you paid to the account it came from, less any bank charges, within 1 to 3 business days.
                    </p>
                  </div>

                  {/* 7. Payments, Liability and Disputes */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        7
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Payments, Liability and Disputes
                      </h3>
                    </div>

                    <p>
                      <strong>7.1 Payments.</strong> All prices are in Naira unless stated. Pay only into official BZ Group accounts shown on our invoices; always get an official receipt. A screenshot or alert is not proof of payment until the money reaches our account.
                    </p>

                    <p>
                      <strong>7.2 Refunds.</strong> Refunds follow the rules of each service in sections 3–6 or the signed agreement. Approved refunds are paid to the account the payment came from.
                    </p>

                    <p>
                      <strong>7.3 Our liability.</strong> We are responsible for losses caused by our own negligence or breach of these Terms. We are not liable for indirect losses (such as lost profit or business), or for delays and failures caused by events beyond our reasonable control. Except where the law does not allow it, our total liability for any claim is limited to the amount you paid us for the service concerned. Nothing in these Terms limits liability for death or personal injury caused by negligence, or for fraud.
                    </p>

                    <p>
                      <strong>7.4 Your responsibility.</strong> You agree to cover our reasonable losses and legal costs caused by your breach of these Terms, false information or unlawful use of our services.
                    </p>

                    <p>
                      <strong>7.5 Complaints.</strong> Contact us first at any office, by phone (<strong>07064482628</strong>) or by email (<strong>support@bzdegreat.com</strong>). We aim to respond within 7 business days.
                    </p>

                    <p>
                      <strong>7.6 Disputes and governing law.</strong> These Terms are governed by the laws of the Federal Republic of Nigeria. Both sides will first try to settle any dispute amicably, then by mediation, before going to court. The courts of <strong>Anambra State</strong> have jurisdiction.
                    </p>

                    <p>
                      <strong>7.7 Changes.</strong> We may update these Terms. The updated version, with its date, will be posted on this page.
                    </p>

                    <p>
                      <strong>7.8 Severability.</strong> If any part of these Terms is found invalid, the rest remains in force.
                    </p>

                    <div className="pt-4 border-t border-[#eae3e4] text-xs text-[#716769]">
                      <p><strong>Last updated:</strong> 25 / 10 / 2026</p>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            {/* ==================================================
                SECTION 3: Privacy policy (Verbatim from PDF Part B)
               ================================================== */}
            <ScrollReveal animation="fade-in-up">
              <section id="privacy" className="space-y-8 pt-6 border-t border-[#eae3e4] scroll-mt-28">
                <div className="border-b border-[#eae3e4] pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#81141f] block mb-1">
                    Part B — Privacy Policy
                  </span>
                  <h2 className="font-serif text-[32px] sm:text-[36px] font-semibold text-[#1b1416] tracking-tight">
                    Privacy policy
                  </h2>
                  <p className="text-sm text-[#716769] mt-1">
                    BZ Group respects your privacy. This policy explains what personal data we collect through our website, offices and WhatsApp, why we use it, and your rights under the Nigeria Data Protection Act 2023.
                  </p>
                </div>

                {/* All 11 Sections Exactly From PDF Part B */}
                <div className="space-y-10 text-[#1b1416] text-[15px] leading-relaxed">
                  {/* 1. Who Controls Your Data */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Who Controls Your Data
                      </h3>
                    </div>

                    <p>
                      <strong>BZ Group</strong> (<strong>BZ Group — Global Universal Solutions Ltd</strong>, together with its divisions, including <strong>BZ de Great Homes and Properties</strong>), Head Office: Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State.
                    </p>
                    <div className="rounded-xl border border-[#eae3e4] bg-[#fbf9f9] p-4 text-xs sm:text-sm space-y-1 text-[#4a4245]">
                      <div><strong>Data Protection Officer:</strong> support@bzdegreat.com</div>
                      <div><strong>Email:</strong> support@bzdegreat.com</div>
                      <div><strong>Phone:</strong> 07064482628 · +234 706 448 2628</div>
                    </div>
                  </div>

                  {/* 2. What We Collect */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        What We Collect
                      </h3>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#eae3e4]">
                      <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                        <thead className="bg-[#fbf9f9] border-b border-[#eae3e4] text-[#716769]">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold w-36">Service</th>
                            <th className="py-2.5 px-4 font-semibold">Data we collect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eae3e4]">
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">All enquiries</td>
                            <td className="py-2.5 px-4">Name, phone, email, WhatsApp number, message, preferred contact time</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">Car rentals</td>
                            <td className="py-2.5 px-4">
                              ID document, driver&apos;s licence, proof of address, booking dates, pick-up/drop-off locations, payment details; vehicle GPS location during the rental (where trackers are fitted)
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">Car sales</td>
                            <td className="py-2.5 px-4">
                              ID document, contact details, vehicle chosen, trade-in details, payment records, ownership-transfer details
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">Home rentals</td>
                            <td className="py-2.5 px-4">
                              ID document, employment or business details, references, guarantor details, payment records, tenancy agreement
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">RMB exchange</td>
                            <td className="py-2.5 px-4">
                              BVN or NIN, ID document, business details, purpose of payment, supplier invoices, recipient details in China, transaction records
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4 font-bold text-[#81141f]">Website</td>
                            <td className="py-2.5 px-4">
                              IP address, device and browser type, pages visited, cookies (see section 8)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Why We Use It */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Why We Use It
                      </h3>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#eae3e4]">
                      <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                        <thead className="bg-[#fbf9f9] border-b border-[#eae3e4] text-[#716769]">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">Purpose</th>
                            <th className="py-2.5 px-4 font-semibold w-56">Legal basis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eae3e4]">
                          <tr>
                            <td className="py-2.5 px-4">To respond to enquiries and provide the service you request</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Contract, or steps before a contract</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4">To verify identity and prevent fraud, money laundering and theft</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Legal obligation; legitimate interests</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4">To process payments, issue receipts and keep accounting records</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Contract; legal obligation</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4">To track rental vehicles for safety and recovery</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Legitimate interests (you are told before the rental)</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4">To send offers and news about our services</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Consent (you can opt out at any time)</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-4">To improve the website</td>
                            <td className="py-2.5 px-4 font-semibold text-[#81141f]">Legitimate interests</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 4. Who We Share It With */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Who We Share It With
                      </h3>
                    </div>

                    <p>We do not sell your data. We share it only with:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-[#4a4245]">
                      <li>banks and payment providers that process your payments;</li>
                      <li>identity verification providers (for BVN/NIN checks);</li>
                      <li>landlords (for home rentals), and vehicle registration authorities (for car sales);</li>
                      <li>for RMB exchange, our payment partners and the recipient&apos;s bank or payment platform in China;</li>
                      <li>IT, hosting and messaging providers working for us under contract;</li>
                      <li>the police, regulators or courts, where the law requires it.</li>
                    </ul>
                  </div>

                  {/* 5. Transfers Outside Nigeria */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        5
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Transfers Outside Nigeria
                      </h3>
                    </div>

                    <p>
                      RMB exchange payments, and some IT services, involve sending data outside Nigeria (for example, to China). We do this only as needed to provide the service, and with safeguards required by the Nigeria Data Protection Act.
                    </p>
                  </div>

                  {/* 6. How Long We Keep It */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        6
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        How Long We Keep It
                      </h3>
                    </div>

                    <p>
                      We keep data only as long as needed: transaction and identity records for at least 5 years after the business relationship ends (as anti-money-laundering rules require), tenancy and sales records for the duration of the agreement plus 6 years, and enquiries that don&apos;t lead to business for up to 12 months.
                    </p>
                  </div>

                  {/* 7. Security */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        7
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Security
                      </h3>
                    </div>

                    <p>
                      We protect your data with access controls, staff confidentiality obligations and secure storage. No system is completely secure; if a data breach affecting you occurs, we will notify you and the Nigeria Data Protection Commission as the law requires.
                    </p>
                  </div>

                  {/* 8. Cookies */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        8
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Cookies
                      </h3>
                    </div>

                    <p>
                      Our website uses essential cookies to work properly and analytics cookies to understand how it is used. You can block or delete cookies in your browser settings; some parts of the site may then not work as intended.
                    </p>
                  </div>

                  {/* 9. Your Rights */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        9
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Your Rights
                      </h3>
                    </div>

                    <p>
                      You have the right to: be told how your data is used; access a copy of your data; correct inaccurate data; ask us to delete data we no longer need; object to or restrict certain uses; withdraw consent to marketing; and ask for your data in a portable format. Email <strong>support@bzdegreat.com</strong> to use these rights. We will respond within the time the law requires. If you are not satisfied, you can complain to the <strong>Nigeria Data Protection Commission (NDPC)</strong> (<a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="text-[#81141f] underline">ndpc.gov.ng</a>).
                    </p>
                  </div>

                  {/* 10. Children */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        10
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Children
                      </h3>
                    </div>

                    <p>
                      Our services are for adults (18+). We do not knowingly collect data from children.
                    </p>
                  </div>

                  {/* 11. Changes to This Policy */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae3e4]">
                      <span className="w-7 h-7 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center font-bold text-xs">
                        11
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#1b1416]">
                        Changes to This Policy
                      </h3>
                    </div>

                    <p>
                      We may update this policy. The latest version, with its date, will always be on this page.
                    </p>

                    <div className="pt-4 border-t border-[#eae3e4] text-xs text-[#716769]">
                      <p><strong>Last updated:</strong> 25 / 10 / 2026</p>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            {/* ==================================================
                SECTION 4: Contact us (Still have a question banner)
               ================================================== */}
            <ScrollReveal animation="fade-in-up">
              <section id="contact" className="pt-4 scroll-mt-28">
                <div className="rounded-[18px] bg-[#4e0b13] text-white p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md transition-all duration-300 hover:shadow-wine-900/30">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-[28px] sm:text-[32px] font-semibold text-white leading-tight">
                      Still have a question?
                    </h3>
                    <p className="text-[14px] text-[#f6e3e5] font-normal">
                      Talk to our concierge desk on WhatsApp or call <strong>+234 706 448 2628</strong>.
                    </p>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-white hover:bg-[#f6e3e5] text-[#81141f] font-semibold text-[14px] shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Chat on WhatsApp</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </a>
                </div>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
