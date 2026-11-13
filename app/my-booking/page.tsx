'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Phone,
  AlertCircle,
  FileText,
  ExternalLink,
  Download,
  ArrowRight,
  Building,
  RefreshCw
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useStore } from '@/lib/store';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import type { Booking } from '@/lib/types';

function MyBookingContent() {
  const { bookings, refreshData } = useStore();
  const searchParams = useSearchParams();

  const initialParamTicket = searchParams.get('ref') || searchParams.get('id') || searchParams.get('ticket') || '';

  const [searchTicket, setSearchTicket] = useState(initialParamTicket || 'BK-2292');
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  // Poll remote data every 10 seconds to keep live confirmation status in accurate sync with admin desk
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Sync selected ticket from bookings or URL
  useEffect(() => {
    const targetCode = (initialParamTicket || searchTicket).trim().toLowerCase();

    const foundBooking = bookings.find(b => b.id.toLowerCase() === targetCode || (b.reference && b.reference.toLowerCase() === targetCode));
    if (foundBooking) {
      setBookingData(foundBooking);
      return;
    }

    // Default to first booking if no specific ticket is specified
    if (!initialParamTicket && bookings.length > 0 && !bookingData) {
      setBookingData(bookings[0]);
    }
  }, [initialParamTicket, searchTicket, bookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchTicket.trim().toLowerCase();

    const foundBooking = bookings.find(b => b.id.toLowerCase() === code || (b.reference && b.reference.toLowerCase() === code));
    if (foundBooking) {
      setBookingData(foundBooking);
      return;
    }

    setBookingData(null);
  };

  // Step calculation for Bookings
  const steps = [
    { label: 'Requested', desc: 'Ticket logged' },
    { label: 'Confirmed', desc: 'Concierge approved' },
    { label: 'Payment Verified', desc: 'Proof settled' },
    { label: 'Active', desc: 'In service' },
    { label: 'Completed', desc: 'Inspection/return concluded' }
  ];

  const getBookingStep = (b: Booking) => {
    if (b.bookingStatus === 'declined') return -1;
    if (b.bookingStatus === 'returned') return 4;
    if (b.bookingStatus === 'active') return 3;
    if (b.paymentStatus === 'verified') return 2;
    if (b.bookingStatus === 'confirmed') return 1;
    return 0;
  };

  const currentStep = bookingData ? getBookingStep(bookingData) : 0;
  const receiptUrl = bookingData?.receiptUrl;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main">
      <SiteHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle">
            <Link href="/" className="hover:text-wine-800 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-main font-semibold">Track Live Reservation &amp; Receipt</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-wine-800">
                Live Booking Tracker
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-text-main mt-1">
                Booking Confirmation Status
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your booking or inspection reference (e.g. BK-2292, TD-0091 or INS-0318) to check confirmation status and verify your receipt.
              </p>
            </div>

            {/* Quick Demo Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-subtle mr-1">Recent Bookings:</span>
              {bookings.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSearchTicket(b.id);
                    setBookingData(b);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    bookingData?.id === b.id
                      ? 'bg-wine-800 text-white'
                      : 'bg-white border text-text-secondary hover:bg-wine-50'
                  }`}
                >
                  {b.id}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter booking or inspection reference (e.g. BK-2292, INS-0318)..."
                value={searchTicket}
                onChange={e => setSearchTicket(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" size="default" className="font-bold shrink-0 bg-[#7A0C1A] hover:bg-[#600814]">
              Track Booking
            </Button>
          </form>

          {/* Selected Booking Details Card */}
          {bookingData ? (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xl overflow-hidden">
              {/* Stepper Progress Bar */}
              <div className="p-6 sm:p-8 bg-surface-bg/60 border-b border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-text-subtle font-semibold">Reference Ticket:</span>
                    <strong className="text-lg font-mono font-extrabold text-wine-900">{bookingData.id}</strong>
                    <CopyButton value={bookingData.id} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle">Live Confirmation Status:</span>
                    <StatusBadge status={bookingData.bookingStatus} />
                  </div>
                </div>

                {/* Visual Step Progress */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {steps.map((st, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={st.label} className="flex flex-col space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            isDone ? 'bg-[#7A0C1A]' : 'bg-border-subtle'
                          }`}
                        />
                        <div className="flex items-center gap-1.5 pt-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${isCurrent ? 'text-[#7A0C1A]' : isDone ? 'text-text-main' : 'text-text-subtle'}`}>
                            {st.label}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-text-subtle">{st.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Left col: Asset info & schedule */}
                <div className="md:col-span-7 space-y-6">
                  {/* Vehicle or Property Booking Details */}
                  <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
                          {bookingData.type === 'car_rental'
                            ? 'Car Rental Agreement'
                            : bookingData.type === 'car_test_drive'
                            ? 'Test Drive Reservation'
                            : 'Property Inspection Walkthrough'}
                        </span>
                        <h3 className="text-2xl font-bold text-text-main mt-1">
                          {bookingData.listingTitle}
                        </h3>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-text-subtle flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-wine-700" />
                            Scheduled Date
                          </span>
                          <strong className="text-text-main font-semibold">
                            {bookingData.startDate} {bookingData.endDate ? `to ${bookingData.endDate}` : ''}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-text-subtle flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-wine-700" />
                            Meeting / Pickup Location
                          </span>
                          <strong className="text-text-main font-semibold">
                            {bookingData.pickupLocation || 'Abuja, FCT'}
                          </strong>
                        </div>

                        {bookingData.driverOption && (
                          <div className="flex items-center justify-between">
                            <span className="text-text-subtle">Driver Preference</span>
                            <strong className="text-text-main font-semibold">
                              {bookingData.driverOption}
                            </strong>
                          </div>
                        )}
                      </div>

                      {bookingData.notes && (
                        <div className="p-4 rounded-2xl bg-wine-50 border border-wine-100 text-xs space-y-1">
                          <span className="font-bold text-wine-900">Concierge Notes:</span>
                          <p className="text-wine-900/80">{bookingData.notes}</p>
                        </div>
                      )}
                  </div>

                  {/* Receipt Proof Section on the Site */}
                  <div className="rounded-2xl border border-border-subtle p-5 bg-[#fdfbfb] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-wine-800" />
                        <h4 className="text-sm font-bold text-text-main">Uploaded Payment Receipt Slip</h4>
                      </div>
                      {receiptUrl && (
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-wine-800 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Full</span>
                        </a>
                      )}
                    </div>

                    {receiptUrl ? (
                      receiptUrl.startsWith('data:application/pdf') || receiptUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="space-y-2">
                          <div className="h-64 rounded-xl border border-border-subtle overflow-hidden bg-white">
                            <iframe
                              src={receiptUrl}
                              title="Transfer Receipt Slip"
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-text-subtle">
                            <span>PDF Transfer Slip Verified</span>
                            <a
                              href={receiptUrl}
                              download={`receipt-${bookingData.id}.pdf`}
                              className="font-bold text-wine-800 hover:underline inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="max-h-72 rounded-xl border border-border-subtle overflow-hidden bg-black/5 flex items-center justify-center p-2">
                            <img
                              src={receiptUrl}
                              alt="Transfer Receipt Slip"
                              className="max-h-64 w-auto object-contain rounded-lg"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-text-subtle">
                            <span>Image Transfer Slip Verified</span>
                            <a
                              href={receiptUrl}
                              download={`receipt-${bookingData.id}.png`}
                              className="font-bold text-wine-800 hover:underline inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Image</span>
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-border-subtle text-center bg-white space-y-2">
                        <FileText className="w-8 h-8 text-text-subtle/50 mx-auto" />
                        <p className="text-xs font-semibold text-text-main">No receipt slip attached yet</p>
                        <p className="text-[11px] text-text-subtle">
                          If you have made a transfer, you can notify our desk directly on WhatsApp with your proof.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right col: Settlement & Support actions */}
                <div className="md:col-span-5 space-y-6 p-6 rounded-2xl bg-surface-bg/80 border border-border-subtle">
                  <div>
                    <span className="text-xs font-bold uppercase text-text-subtle block">
                      Booking Amount
                    </span>
                    <div className="text-2xl font-extrabold text-wine-900 mt-1">
                      {bookingData.totalAmount
                        ? `₦${Number(bookingData.totalAmount).toLocaleString('en-NG')}.00`
                        : 'Custom Quote'}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                        `Hello BZ Group, checking status of my booking ${bookingData.id}...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat Concierge on WhatsApp</span>
                      </Button>
                    </a>

                    <Link href="/cars/rent" className="block w-full">
                      <Button variant="ghost" size="default" className="w-full text-xs text-text-secondary hover:text-wine-900">
                        <span>Browse more listings</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-border-subtle text-[11px] text-text-subtle space-y-1">
                    <p>Concierge Hotline: <strong>{SITE_CONFIG.phoneDisplay}</strong></p>
                    <p>Office: {SITE_CONFIG.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-white border border-border-subtle space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-lg font-bold">Transaction Ticket Not Found</h3>
              <p className="text-xs text-text-secondary">
                Please verify the reference code on your email receipt or select one of the recent tickets above.
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-bg flex items-center justify-center text-xs text-text-subtle">Loading transaction tracker...</div>}>
      <MyBookingContent />
    </Suspense>
  );
}
