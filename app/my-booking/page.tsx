'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileText,
  ExternalLink,
  Download,
  ArrowRight,
  ShoppingBag,
  Camera,
  Video,
  Ticket,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { QrCodeBadge } from '@/components/qr-code-badge';
import { useStore } from '@/lib/store';
import { SITE_CONFIG } from '@/lib/constants';
import type {
  Booking,
  ProductOrder,
  StudioBooking,
  EquipmentRental,
  DigitalTicket,
} from '@/lib/types';

type UnifiedTrackingItem =
  | { kind: 'booking'; data: Booking }
  | { kind: 'order'; data: ProductOrder }
  | { kind: 'studio'; data: StudioBooking }
  | { kind: 'rental'; data: EquipmentRental }
  | { kind: 'ticket'; data: DigitalTicket };

function MyBookingContent() {
  const {
    bookings,
    productOrders,
    studioBookings,
    equipmentRentals,
    digitalTickets,
    refreshData,
  } = useStore();
  const searchParams = useSearchParams();

  const initialParamTicket =
    searchParams.get('ref') ||
    searchParams.get('id') ||
    searchParams.get('ticket') ||
    '';

  const [searchTicket, setSearchTicket] = useState(initialParamTicket || 'BK-2292');
  const [trackedItem, setTrackedItem] = useState<UnifiedTrackingItem | null>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const findAcrossAllDomains = React.useCallback(
    (rawQuery: string): UnifiedTrackingItem | null => {
      const code = rawQuery.trim().toLowerCase();
      if (!code) return null;

      const foundOrder = productOrders.find(
        (o) =>
          o.id.toLowerCase() === code ||
          o.reference.toLowerCase() === code
      );
      if (foundOrder) return { kind: 'order', data: foundOrder };

      const foundStudio = studioBookings.find(
        (s) =>
          s.id.toLowerCase() === code ||
          s.reference.toLowerCase() === code
      );
      if (foundStudio) return { kind: 'studio', data: foundStudio };

      const foundRental = equipmentRentals.find(
        (r) =>
          r.id.toLowerCase() === code ||
          r.reference.toLowerCase() === code
      );
      if (foundRental) return { kind: 'rental', data: foundRental };

      const foundTicket = digitalTickets.find(
        (t) =>
          t.id.toLowerCase() === code ||
          t.ticketCode.toLowerCase() === code
      );
      if (foundTicket) return { kind: 'ticket', data: foundTicket };

      const foundBooking = bookings.find(
        (b) =>
          b.id.toLowerCase() === code ||
          (b.reference && b.reference.toLowerCase() === code)
      );
      if (foundBooking) return { kind: 'booking', data: foundBooking };

      return null;
    },
    [bookings, productOrders, studioBookings, equipmentRentals, digitalTickets]
  );

  useEffect(() => {
    const targetCode = initialParamTicket || searchTicket;
    const found = findAcrossAllDomains(targetCode);
    if (found) {
      setTrackedItem(found);
      return;
    }
    if (!initialParamTicket && bookings.length > 0 && !trackedItem) {
      setTrackedItem({ kind: 'booking', data: bookings[0] });
    }
  }, [initialParamTicket, searchTicket, findAcrossAllDomains, bookings, trackedItem]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findAcrossAllDomains(searchTicket);
    setTrackedItem(found);
  };

  const quickSamples = [
    { id: 'BK-2292', label: 'BK-2292 (Car)' },
    { id: productOrders[0]?.id || 'ORD-4101', label: `${productOrders[0]?.id || 'ORD-4101'} (Order)` },
    { id: studioBookings[0]?.id || 'STU-1041', label: `${studioBookings[0]?.id || 'STU-1041'} (Studio)` },
    { id: equipmentRentals[0]?.id || 'RNT-3081', label: `${equipmentRentals[0]?.id || 'RNT-3081'} (Gear)` },
    { id: digitalTickets[0]?.id || 'TKT-8821', label: `${digitalTickets[0]?.id || 'TKT-8821'} (Event QR)` },
  ];

  const steps = [
    { label: 'Requested', desc: 'Reference logged' },
    { label: 'Confirmed', desc: 'Desk approved' },
    { label: 'Payment Verified', desc: 'Proof settled' },
    { label: 'Active / Dispatched', desc: 'In service' },
    { label: 'Completed', desc: 'Fulfilled / Checked in' },
  ];

  const getStepIndex = (item: UnifiedTrackingItem | null): number => {
    if (!item) return 0;
    if (item.kind === 'booking') {
      const b = item.data;
      if (b.bookingStatus === 'declined') return -1;
      if (b.bookingStatus === 'returned') return 4;
      if (b.bookingStatus === 'active') return 3;
      if (b.paymentStatus === 'verified') return 2;
      if (b.bookingStatus === 'confirmed') return 1;
      return 0;
    }
    if (item.kind === 'order') {
      const o = item.data;
      if (o.orderStatus === 'cancelled') return -1;
      if (o.orderStatus === 'delivered') return 4;
      if (o.orderStatus === 'dispatched' || o.orderStatus === 'processing') return 3;
      if (o.paymentStatus === 'verified') return 2;
      if (o.orderStatus === 'confirmed') return 1;
      return 0;
    }
    if (item.kind === 'studio') {
      const s = item.data;
      if (s.bookingStatus === 'cancelled') return -1;
      if (s.bookingStatus === 'completed') return 4;
      if (s.paymentStatus === 'verified') return 2;
      if (s.bookingStatus === 'confirmed') return 1;
      return 0;
    }
    if (item.kind === 'rental') {
      const r = item.data;
      if (r.rentalStatus === 'cancelled') return -1;
      if (r.rentalStatus === 'returned') return 4;
      if (r.rentalStatus === 'active') return 3;
      if (r.paymentStatus === 'verified') return 2;
      if (r.rentalStatus === 'confirmed') return 1;
      return 0;
    }
    const t = item.data;
    if (t.ticketStatus === 'cancelled') return -1;
    if (t.ticketStatus === 'checked_in') return 4;
    if (t.paymentStatus === 'verified') return 2;
    return 1;
  };

  const currentStep = getStepIndex(trackedItem);
  const activeRefId = trackedItem ? trackedItem.data.id : '';
  const receiptUrl = trackedItem ? trackedItem.data.receiptUrl : undefined;
  const totalAmount = trackedItem ? trackedItem.data.totalAmount || 0 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main">
      <SiteHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle">
            <Link href="/" className="hover:text-wine-800 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-main font-semibold">
              Track Orders, Bookings, Rentals &amp; Event Tickets
            </span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-wine-800">
                Unified Customer Tracker
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-text-main mt-1">
                Track Booking, Order or Ticket
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your reference code (e.g. <code>ORD-4101</code>, <code>STU-1041</code>,{' '}
                <code>RNT-3081</code>, <code>TKT-8821</code>, or <code>BK-2292</code>) to view live status, receipts, or your QR event pass.
              </p>
            </div>

            {/* Quick Sample Selectors */}
            <div className="flex flex-wrap items-center gap-1.5">
              {quickSamples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSearchTicket(s.id);
                    const f = findAcrossAllDomains(s.id);
                    if (f) setTrackedItem(f);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeRefId === s.id
                      ? 'bg-[#81141f] text-white'
                      : 'bg-white border border-[#eae3e4] text-text-secondary hover:bg-wine-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter reference (e.g. ORD-4101, STU-1041, RNT-3081, TKT-8821, BK-2292)..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              type="submit"
              size="default"
              className="font-bold shrink-0 bg-[#7A0C1A] hover:bg-[#600814]"
            >
              Track Reference
            </Button>
          </form>

          {/* Tracked Item Details Card */}
          {trackedItem ? (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xl overflow-hidden">
              {/* Stepper Header */}
              <div className="p-6 sm:p-8 bg-surface-bg/60 border-b border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-text-subtle font-semibold">
                      Reference Code:
                    </span>
                    <strong className="text-lg font-mono font-extrabold text-wine-900">
                      {activeRefId}
                    </strong>
                    <CopyButton value={activeRefId} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle">Payment Status:</span>
                    <StatusBadge status={trackedItem.data.paymentStatus} />
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
                          <span
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-[#7A0C1A]'
                                : isDone
                                ? 'text-text-main'
                                : 'text-text-subtle'
                            }`}
                          >
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
                <div className="md:col-span-7 space-y-6">
                  {/* CASE 1: CAR / PROPERTY BOOKING */}
                  {trackedItem.kind === 'booking' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
                          {trackedItem.data.type === 'car_rental'
                            ? 'Car Rental Agreement'
                            : trackedItem.data.type === 'car_test_drive'
                            ? 'Test Drive Reservation'
                            : 'Property Inspection Walkthrough'}
                        </span>
                        <h3 className="text-2xl font-bold text-text-main mt-1">
                          {trackedItem.data.listingTitle}
                        </h3>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-text-subtle flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-wine-700" />
                            Scheduled Date
                          </span>
                          <strong className="text-text-main font-semibold">
                            {trackedItem.data.startDate}{' '}
                            {trackedItem.data.endDate ? `to ${trackedItem.data.endDate}` : ''}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-subtle flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-wine-700" />
                            Location
                          </span>
                          <strong className="text-text-main font-semibold">
                            {trackedItem.data.pickupLocation || 'Abuja, FCT'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE 2: MARKETPLACE PRODUCT ORDER */}
                  {trackedItem.kind === 'order' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-wine-800">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Marketplace Product Order ({trackedItem.data.orderStatus.toUpperCase()})
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {trackedItem.data.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-surface-bg border border-border-subtle flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-sm text-text-main">
                                {item.quantity}x {item.productName}
                              </p>
                              {item.variantLabel && (
                                <p className="text-wine-800 font-semibold">
                                  Variant: {item.variantLabel}
                                </p>
                              )}
                            </div>
                            <span className="font-extrabold text-sm">
                              ₦{item.lineTotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Customer</span>
                          <strong className="font-semibold">
                            {trackedItem.data.customerName} ({trackedItem.data.customerPhone})
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Delivery Destination</span>
                          <strong className="font-semibold">
                            {trackedItem.data.deliveryAddress}, {trackedItem.data.deliveryState}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE 3: LAGOS STUDIO BOOKING */}
                  {trackedItem.kind === 'studio' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-wine-800">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Lagos Studio Session ({trackedItem.data.bookingStatus.toUpperCase()})
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-text-main">
                        {trackedItem.data.serviceName}
                      </h3>
                      <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Date &amp; Time Slot</span>
                          <strong className="font-bold text-wine-900">
                            {trackedItem.data.date} @ {trackedItem.data.timeSlot} (
                            {trackedItem.data.durationHours} hrs)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Studio Address</span>
                          <strong className="font-semibold text-right">
                            {trackedItem.data.location}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE 4: EQUIPMENT RENTAL */}
                  {trackedItem.kind === 'rental' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-wine-800">
                        <Video className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Camera &amp; Media Gear Rental ({trackedItem.data.rentalStatus.toUpperCase()})
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-text-main">
                        {trackedItem.data.quantity}x {trackedItem.data.equipmentName}
                      </h3>
                      <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Rental Window</span>
                          <strong className="font-bold">
                            {trackedItem.data.startDate} to {trackedItem.data.endDate} (
                            {trackedItem.data.days} days)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Refundable Caution Deposit</span>
                          <strong className="font-bold">
                            ₦{trackedItem.data.depositAmount.toLocaleString()}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Pickup Branch</span>
                          <strong className="font-semibold">
                            {trackedItem.data.pickupLocation}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE 5: DIGITAL EVENT TICKET WITH QR CODE */}
                  {trackedItem.kind === 'ticket' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-wine-800">
                        <Ticket className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Digital Event Ticket ({trackedItem.data.ticketStatus.toUpperCase()})
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-text-main">
                        {trackedItem.data.eventName}
                      </h3>

                      <div className="rounded-2xl bg-[#4e0b13] text-white p-6 flex flex-col sm:flex-row items-center gap-6 border border-[#81141f]">
                        <QrCodeBadge value={trackedItem.data.qrPayload} size={140} />
                        <div className="space-y-2 text-xs">
                          <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                            {trackedItem.data.quantity}x {trackedItem.data.tierName}
                          </span>
                          <p className="font-mono text-base font-extrabold text-[#f6e3e5]">
                            {trackedItem.data.ticketCode}
                          </p>
                          <p className="text-[#ebc7cb]">
                            {trackedItem.data.eventDate} · {trackedItem.data.eventTime}
                          </p>
                          <p className="text-[#ebc7cb]">{trackedItem.data.eventVenue}</p>
                          <p className="text-white font-bold pt-1">
                            Attendee: {trackedItem.data.customerName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Receipt Proof Section */}
                  <div className="rounded-2xl border border-border-subtle p-5 bg-[#fdfbfb] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-wine-800" />
                        <h4 className="text-sm font-bold text-text-main">
                          Uploaded Payment Receipt Slip
                        </h4>
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
                      <div className="space-y-2">
                        <div className="max-h-72 rounded-xl border border-border-subtle overflow-hidden bg-black/5 flex items-center justify-center p-2">
                          <img
                            src={receiptUrl}
                            alt="Transfer Receipt Slip"
                            className="max-h-64 w-auto object-contain rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-subtle">
                          <span>Transfer Slip Attached</span>
                          <a
                            href={receiptUrl}
                            download={`receipt-${activeRefId}.png`}
                            className="font-bold text-wine-800 hover:underline inline-flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Slip</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-border-subtle text-center bg-white space-y-2">
                        <FileText className="w-8 h-8 text-text-subtle/50 mx-auto" />
                        <p className="text-xs font-semibold text-text-main">
                          No receipt slip attached yet
                        </p>
                        <p className="text-[11px] text-text-subtle">
                          If you have completed your transfer to {SITE_CONFIG.bankDetails.bankName} ({SITE_CONFIG.bankDetails.accountNumber}), share your proof with our concierge desk on WhatsApp.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Total & Concierge Support */}
                <div className="md:col-span-5 space-y-6 p-6 rounded-2xl bg-surface-bg/80 border border-border-subtle">
                  <div>
                    <span className="text-xs font-bold uppercase text-text-subtle block">
                      Total Amount
                    </span>
                    <div className="text-2xl font-extrabold text-wine-900 mt-1">
                      {totalAmount > 0
                        ? `₦${Number(totalAmount).toLocaleString('en-NG')}.00`
                        : 'Scheduled Inspection / Test Drive'}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                        `Hello BZ Group Concierge, checking status of my reference ${activeRefId}...`
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

                    <Link href="/marketplace" className="block w-full">
                      <Button
                        variant="ghost"
                        size="default"
                        className="w-full text-xs text-text-secondary hover:text-wine-900"
                      >
                        <span>Explore Marketplace &amp; Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-border-subtle text-[11px] text-text-subtle space-y-1">
                    <p>
                      Concierge Hotline: <strong>{SITE_CONFIG.phoneDisplay}</strong>
                    </p>
                    <p>Office: {SITE_CONFIG.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-white border border-border-subtle space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-lg font-bold">Reference Not Found</h3>
              <p className="text-xs text-text-secondary">
                Please verify your reference code (e.g. ORD-4101, STU-1041, RNT-3081, TKT-8821, or BK-2292) or click one of the sample pills above.
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-bg flex items-center justify-center text-xs text-text-subtle">
          Loading transaction tracker...
        </div>
      }
    >
      <MyBookingContent />
    </Suspense>
  );
}
