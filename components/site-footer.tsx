import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { SITE_CONFIG } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="bg-[#4e0b13] text-white pt-20 pb-9 border-t border-[#630f1a]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
        {/* Top Section (Figma: [1200x244] layout=HORIZONTAL gap=72) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 pb-14">
          {/* Brand Col (Figma: [380x244] layout=VERTICAL gap=20) */}
          <div className="lg:col-span-5 flex flex-col space-y-5">
            <BrandLogo tone="light" size="lg" href="/" />

            {/* Figma exact copy: [340x72] fill=#f6e3e5 font=Plus Jakarta Sans 400 15px */}
            <p className="text-[15px] text-[#f6e3e5] leading-relaxed max-w-[340px]">
              Cars and homes to rent or own, plus RMB exchange — handled by a team you can actually reach.
            </p>

            {/* Direct Contact (Figma: Contact [380x80] layout=VERTICAL gap=10) */}
            <div className="flex flex-col space-y-2.5 pt-1 text-[13px] text-[#ebc7cb]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ebc7cb] shrink-0" />
                <a href="tel:+2348139690031" className="hover:text-white transition-colors">
                  0813 969 0031
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ebc7cb] shrink-0" />
                <a href="mailto:support@bzdegreat.com" className="hover:text-white transition-colors">
                  support@bzdegreat.com
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#ebc7cb] pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#ebc7cb] shrink-0 mt-0.5" />
                <span>City Mart Plaza, New Market Road, Onitsha, Anambra State</span>
              </div>
            </div>
          </div>

          {/* Link columns (Figma: [645x168] layout=HORIZONTAL gap=72: Rent, Buy, Services, Company) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* 1. Rent Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="text-[15px] font-semibold text-white tracking-tight">Rent</h4>
              <ul className="space-y-2.5 text-sm text-[#f6e3e5]">
                <li>
                  <Link href="/cars/rent" className="hover:text-white transition-colors">Cars</Link>
                </li>
                <li>
                  <Link href="/homes/rent" className="hover:text-white transition-colors">Houses</Link>
                </li>
                <li>
                  <Link href="/homes/rent?type=Apartment" className="hover:text-white transition-colors">Apartments</Link>
                </li>
                <li>
                  <Link href="/homes/rent?type=Shortlet" className="hover:text-white transition-colors">Short-lets</Link>
                </li>
              </ul>
            </div>

            {/* 2. Buy Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="text-[15px] font-semibold text-white tracking-tight">Buy</h4>
              <ul className="space-y-2.5 text-sm text-[#f6e3e5]">
                <li>
                  <Link href="/cars/buy" className="hover:text-white transition-colors">Cars</Link>
                </li>
                <li>
                  <Link href="/properties/buy" className="hover:text-white transition-colors">Houses</Link>
                </li>
                <li>
                  <Link href="/properties/buy?type=Land" className="hover:text-white transition-colors">Land & plots</Link>
                </li>
                <li>
                  <Link href="/properties/buy?type=Commercial" className="hover:text-white transition-colors">Commercial</Link>
                </li>
              </ul>
            </div>

            {/* 3. Services Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="text-[15px] font-semibold text-white tracking-tight">Services</h4>
              <ul className="space-y-2.5 text-sm text-[#f6e3e5]">
                <li>
                  <Link href="/rmb-exchange" className="hover:text-white transition-colors font-medium text-white">RMB exchange</Link>
                </li>
                <li>
                  <Link href="/help#inspection" className="hover:text-white transition-colors">Property inspection</Link>
                </li>
                <li>
                  <Link href="/cars/rent?driver=Chauffeured" className="hover:text-white transition-colors">Chauffeur service</Link>
                </li>
                <li>
                  <Link href="/cars/rent" className="hover:text-white transition-colors">Car delivery</Link>
                </li>
              </ul>
            </div>

            {/* 4. Company Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="text-[15px] font-semibold text-white tracking-tight">Company</h4>
              <ul className="space-y-2.5 text-sm text-[#f6e3e5]">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">About BZ Group</Link>
                </li>
                <li>
                  <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">FAQs</Link>
                </li>
                <li>
                  <Link href="/help#rental-terms" className="hover:text-white transition-colors">Terms</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider (Figma: Divider [1200x1] fill=#81141f) */}
        <div className="w-full h-[1px] bg-[#81141f]" />

        {/* Bottom Bar (Figma: [1200x20] layout=HORIZONTAL) */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#ebc7cb]">
          <p>© 2026 BZ Group · Global Universal Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/help#privacy" className="hover:text-white transition-colors">
              Privacy policy
            </Link>
            <Link href="/help#rental-terms" className="hover:text-white transition-colors">
              Terms of service
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors font-medium">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
