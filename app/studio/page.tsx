'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Upload,
  ShoppingBag,
  Video,
  Ticket,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';
import { useStore } from '@/lib/store';
import { StudioBooking } from '@/lib/types';
import { validateStudioSlotConflict } from '@/lib/commerce-engine';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import { supabaseService } from '@/lib/supabase/service';

export default function StudioBookingPage() {
  const { studioServices, studioBookings, createStudioBooking } = useStore();

  const activeServices = useMemo(
    () => studioServices.filter((s) => s.status === 'active'),
    [studioServices]
  );

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    activeServices[0]?.id || 'stu-srv-1'
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-25');
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<StudioBooking | null>(null);

  const selectedService =
    activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const url = await supabaseService.uploadReceipt(file, `STU-TEMP-${Date.now()}`);
      if (url) setReceiptUrl(url);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedService) {
      setErrorMsg('Please select a studio service package.');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setErrorMsg('Please select a session date and time slot.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please provide your full name, phone number, and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createStudioBooking({
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        receiptUrl: receiptUrl || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.ok || !res.booking) {
        setErrorMsg(res.error || 'Could not complete studio booking.');
        return;
      }

      setConfirmedBooking(res.booking);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#4e0b13] text-white py-14 lg:py-16 border-b border-[#630f1a]">
        {/* Background Studio Image (70% visibility over #4e0b13) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85"
            alt=""
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4e0b13]/80 via-[#4e0b13]/50 to-[#4e0b13]/70" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-xs">
                Book a Photography or Studio Session in Lagos
              </h1>
              <p className="text-sm sm:text-base text-[#f6e3e5] leading-relaxed">
                Our acoustic-treated Lekki-Ajah creative studio features a full cyclorama wall, Profoto strobes, Aputure cinema lighting, private wardrobe green rooms, and 24/7 uninterrupted solar + generator power.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4e0b13]/75 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#f6e3e5]" />
                <span>Marketplace</span>
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4e0b13] px-4 py-2.5 text-xs font-bold shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#81141f]" />
                <span>Lagos Studio Booking</span>
              </Link>
              <Link
                href="/equipment-rental"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4e0b13]/75 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Video className="w-4 h-4 text-[#f6e3e5]" />
                <span>Camera &amp; Gear Rental</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4e0b13]/75 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Ticket className="w-4 h-4 text-[#f6e3e5]" />
                <span>Events &amp; Tickets</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Studio Packages */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
                SELECT YOUR SESSION PACKAGE
              </span>
              <h2 className="text-2xl font-bold text-[#1b1416] mt-1">
                Lagos Studio &amp; Photography Packages
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeServices.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      if (!srv.availableSlots.includes(selectedSlot)) {
                        setSelectedSlot(srv.availableSlots[0] || '09:00 AM');
                      }
                      setConfirmedBooking(null);
                    }}
                    className={`h-[380px] rounded-2xl relative overflow-hidden border transition-all duration-300 cursor-pointer group ${
                      isSelected
                        ? 'border-[#81141f] ring-2 ring-[#81141f] shadow-lg'
                        : 'border-[#eae3e4] bg-[#f8f5f5] shadow-xs hover:shadow-xl'
                    }`}
                  >
                    {/* Full-bleed Studio Image */}
                    <img
                      src={srv.images[0] || '/photos/founder-bz-3.jpg'}
                      alt={srv.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#4e0b13]/85 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider truncate">
                        {srv.serviceType}
                      </span>
                      <span className="rounded-full bg-white/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#1b1416] shadow-xs shrink-0">
                        {srv.durationHours} Hours
                      </span>
                    </div>

                    {/* Bottom Translucent Glass Details Card */}
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/88 backdrop-blur-md border border-white/80 p-4 shadow-lg transition-all duration-300 group-hover:bg-white/95">
                      <h3 className="text-[15px] sm:text-base font-bold text-[#1b1416] line-clamp-1 leading-snug">
                        {srv.name}
                      </h3>
                      <p className="text-[11px] font-medium text-[#5a5052] line-clamp-1 mt-0.5">
                        {srv.includes.slice(0, 2).join(' · ') || srv.description}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-[#5a5052] mt-1">
                        <MapPin className="w-3 h-3 text-[#81141f] shrink-0" />
                        <span className="truncate">{srv.location}</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#eae3e4]/80 flex items-center justify-between gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-[#1b1416]">
                          ₦{srv.price.toLocaleString()}
                        </span>
                        <span
                          className={`h-8 px-3 rounded-lg inline-flex items-center text-[11px] font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#81141f] text-white'
                              : 'bg-white border border-[#eae3e4] text-[#1b1416] group-hover:border-[#81141f]'
                          }`}
                        >
                          {isSelected ? 'Selected ✓' : 'Select Package'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Columns: Sticky Date/Time Slot Availability & Booking Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 sm:p-7 shadow-lg">
              {confirmedBooking ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                      STUDIO SLOT RESERVED
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#1b1416]">
                      {confirmedBooking.id}
                    </h3>
                    <p className="text-xs text-[#4d4547]">
                      {confirmedBooking.serviceName} · {confirmedBooking.date} at{' '}
                      {confirmedBooking.timeSlot}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eae3e4] p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Studio Location</span>
                      <span className="font-bold text-right">{confirmedBooking.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Session Total</span>
                      <span className="font-extrabold text-[#81141f]">
                        ₦{confirmedBooking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={getWhatsAppBookingLink(
                        confirmedBooking.id,
                        confirmedBooking.serviceName,
                        `Date: ${confirmedBooking.date} @ ${confirmedBooking.timeSlot} | Total: ₦${confirmedBooking.totalAmount.toLocaleString()}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl gap-2 justify-center cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>Send Studio Confirmation via WhatsApp</span>
                      </Button>
                    </a>
                    <Link href={`/my-booking?ref=${confirmedBooking.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-[#eae3e4] text-xs font-bold cursor-pointer"
                      >
                        Track Studio Booking ({confirmedBooking.id})
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmedBooking(null)}
                      className="text-xs font-semibold text-[#716769]"
                    >
                      Book Another Session
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-[#eae3e4]">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#81141f]">
                      CONFLICT-PROTECTED STUDIO SCHEDULER
                    </span>
                    <h3 className="text-lg font-bold text-[#1b1416] mt-0.5">
                      {selectedService?.name}
                    </h3>
                    <p className="text-xs text-[#716769]">
                      ₦{selectedService?.price.toLocaleString()} ·{' '}
                      {selectedService?.durationHours} Hours Session
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Date Picker */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#1b1416] mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#81141f]" />
                      <span>Preferred Session Date *</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Live Time Slot Conflict Checker */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#1b1416] mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#81141f]" />
                      <span>Available Time Slots ({selectedDate}) *</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(selectedService?.availableSlots || ['09:00 AM', '12:00 PM', '03:00 PM']).map(
                        (slot) => {
                          const { conflict } = validateStudioSlotConflict(
                            studioBookings,
                            selectedService?.id || '',
                            selectedDate,
                            slot
                          );
                          const isChosen = selectedSlot === slot && !conflict;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={conflict}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                                conflict
                                  ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed line-through'
                                  : isChosen
                                  ? 'bg-[#81141f] border-[#81141f] text-white cursor-pointer'
                                  : 'bg-white border-[#eae3e4] text-[#1b1416] hover:border-[#81141f] cursor-pointer'
                              }`}
                            >
                              <span>{slot}</span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  conflict
                                    ? 'text-red-500 no-underline'
                                    : isChosen
                                    ? 'text-[#f6e3e5]'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {conflict ? 'Booked' : 'Open'}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Client Full Name *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Amaka Eze"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Phone / WhatsApp *
                      </label>
                      <Input
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+234 812 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@domain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Creative Brief / Crew Size Notes
                    </label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Backdrop color preference, number of talents, etc."
                    />
                  </div>

                  {/* Bank Transfer Details */}
                  <div className="rounded-xl bg-[#fbf3f4] border border-[#e6d3d6] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                        STUDIO BOOKING TRANSFER
                      </span>
                      <span className="text-sm font-extrabold text-[#1b1416]">
                        ₦{(selectedService?.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#eae3e4] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#716769]">
                          {SITE_CONFIG.bankDetails.bankName}
                        </p>
                        <p className="text-base font-extrabold tracking-wider text-[#1b1416]">
                          {SITE_CONFIG.bankDetails.accountNumber}
                        </p>
                        <p className="text-[11px] font-bold text-[#4d4547]">
                          {SITE_CONFIG.bankDetails.accountName}
                        </p>
                      </div>
                      <CopyButton
                        text={SITE_CONFIG.bankDetails.accountNumber}
                        label="Copy"
                      />
                    </div>

                    <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#81141f]/50 bg-white px-4 py-2 text-xs font-semibold text-[#81141f] hover:bg-[#fbf3f4] cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingReceipt
                          ? 'Uploading receipt...'
                          : receiptUrl
                          ? 'Receipt Uploaded ✓'
                          : 'Attach Payment Receipt (Optional)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-sm cursor-pointer"
                  >
                    {submitting
                      ? 'Reserving Studio Slot...'
                      : `Confirm Studio Booking (₦${(
                          selectedService?.price || 0
                        ).toLocaleString()})`}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
