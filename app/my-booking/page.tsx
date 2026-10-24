'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  AlertCircle
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { useStore } from '@/lib/store';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';

export default function MyBookingPage() {
  const { bookings } = useStore();

  const [searchTicket, setSearchTicket] = useState('BK-2292');
  const [selectedBooking, setSelectedBooking] = useState(
    bookings.find(b => b.id === 'BK-2292') || bookings[0]
  );

  React.useEffect(() => {
    if (!selectedBooking && bookings.length > 0) {
      setSelectedBooking(bookings.find(b => b.id === searchTicket) || bookings[0]);
    }
  }, [bookings, selectedBooking, searchTicket]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = bookings.find(
      b => b.id.toLowerCase() === searchTicket.trim().toLowerCase()
    );
    if (found) {
      setSelectedBooking(found);
    }
  };

  const steps = [
    { label: 'Requested', desc: 'Ticket logged' },
    { label: 'Confirmed', desc: 'Concierge approved' },
    { label: 'Payment Verified', desc: 'Proof settled' },
    { label: 'Active', desc: 'In service' },
    { label: 'Completed', desc: 'Inspection/return concluded' }
  ];

  const getActiveStep = () => {
    if (!selectedBooking) return 0;
    if (selectedBooking.bookingStatus === 'declined') return -1;
    if (selectedBooking.bookingStatus === 'returned') return 4;
    if (selectedBooking.bookingStatus === 'active') return 3;
    if (selectedBooking.paymentStatus === 'verified') return 2;
    if (selectedBooking.bookingStatus === 'confirmed') return 1;
    return 0;
  };

  const currentStep = getActiveStep();

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main">
      <SiteHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle">
            <Link href="/" className="hover:text-wine-800 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-main font-semibold">Track My Booking</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-wine-800">
                Live Reservation Tracker
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-text-main mt-1">
                My Booking Status
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your ticket reference code (e.g. BK-2292 or INS-0318) to check status and payment confirmation.
              </p>
            </div>

            {/* Quick Demo Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-subtle mr-1">Demo Tickets:</span>
              {bookings.slice(0, 3).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSearchTicket(b.id);
                    setSelectedBooking(b);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedBooking?.id === b.id
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
                placeholder="Enter booking ticket reference (e.g. BK-2292)..."
                value={searchTicket}
                onChange={e => setSearchTicket(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" size="default" className="font-bold shrink-0">
              Track Ticket
            </Button>
          </form>

          {/* Selected Booking Details Card */}
          {selectedBooking ? (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xl overflow-hidden">
              {/* Stepper Progress Bar */}
              <div className="p-6 sm:p-8 bg-surface-bg/60 border-b border-border-subtle">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-text-subtle font-semibold">Reference Ticket:</span>
                    <strong className="text-lg font-mono font-extrabold text-wine-900">{selectedBooking.id}</strong>
                    <CopyButton value={selectedBooking.id} />
                  </div>
                  <StatusBadge status={selectedBooking.bookingStatus} />
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
                            isDone ? 'bg-wine-800' : 'bg-border-subtle'
                          }`}
                        />
                        <div className="flex items-center gap-1.5 pt-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-wine-800 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${isCurrent ? 'text-wine-900' : isDone ? 'text-text-main' : 'text-text-subtle'}`}>
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
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
                      {selectedBooking.type === 'car_rental'
                        ? 'Car Rental Agreement'
                        : selectedBooking.type === 'car_test_drive'
                        ? 'Test Drive Reservation'
                        : 'Property Inspection Walkthrough'}
                    </span>
                    <h3 className="text-2xl font-bold text-text-main mt-1">
                      {selectedBooking.listingTitle}
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-subtle flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-wine-700" />
                        Scheduled Date
                      </span>
                      <strong className="text-text-main font-semibold">
                        {selectedBooking.startDate} {selectedBooking.endDate ? `to ${selectedBooking.endDate}` : ''}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-subtle flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-wine-700" />
                        Meeting / Pickup Location
                      </span>
                      <strong className="text-text-main font-semibold">
                        {selectedBooking.pickupLocation || 'Abuja, FCT'}
                      </strong>
                    </div>

                    {selectedBooking.driverOption && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-subtle">Driver Preference</span>
                        <strong className="text-text-main font-semibold">
                          {selectedBooking.driverOption}
                        </strong>
                      </div>
                    )}
                  </div>

                  {selectedBooking.notes && (
                    <div className="p-4 rounded-2xl bg-wine-50 border border-wine-100 text-xs space-y-1">
                      <span className="font-bold text-wine-900">Concierge Notes:</span>
                      <p className="text-wine-900/80">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right col: Settlement & Support actions */}
                <div className="md:col-span-5 space-y-6 p-6 rounded-2xl bg-surface-bg/80 border border-border-subtle">
                  <div>
                    <span className="text-xs font-bold uppercase text-text-subtle block">
                      Payment Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedBooking.paymentStatus} />
                    </div>
                  </div>

                  {selectedBooking.totalAmount && (
                    <div>
                      <span className="text-xs text-text-subtle block">Total Amount</span>
                      <div className="text-2xl font-extrabold text-wine-900">
                        ₦{selectedBooking.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 pt-2">
                    {selectedBooking.paymentStatus === 'pending' && (
                      <Link href={`/pay-naira?ticket=${selectedBooking.id}`}>
                        <Button size="lg" className="w-full font-bold shadow-md">
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Naira / Upload Receipt</span>
                        </Button>
                      </Link>
                    )}

                    <a
                      href={getWhatsAppBookingLink(selectedBooking.id, selectedBooking.listingTitle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </Button>
                    </a>
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
              <h3 className="text-lg font-bold">Booking Reference Not Found</h3>
              <p className="text-xs text-text-secondary">Please check your ticket code or select one of the demo tickets above.</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
