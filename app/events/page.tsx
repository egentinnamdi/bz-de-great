'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Upload,
  ShoppingBag,
  Camera,
  Video,
  MessageSquare,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';
import { QrCodeBadge } from '@/components/qr-code-badge';
import { useStore } from '@/lib/store';
import { DigitalTicket } from '@/lib/types';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import { supabaseService } from '@/lib/supabase/service';

export default function EventsTicketingPage() {
  const { events, purchaseEventTicket } = useStore();

  const publishedEvents = useMemo(
    () => events.filter((e) => e.status === 'published'),
    [events]
  );

  const [selectedEventId, setSelectedEventId] = useState<string>(
    publishedEvents[0]?.id || 'evt-lagos-gala-2026'
  );
  const [selectedTierId, setSelectedTierId] = useState<string>(
    publishedEvents[0]?.ticketTiers[0]?.id || 'tier-gala-reg'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<DigitalTicket | null>(null);

  const activeEvent =
    publishedEvents.find((e) => e.id === selectedEventId) || publishedEvents[0];

  const activeTier =
    activeEvent?.ticketTiers.find((t) => t.id === selectedTierId) ||
    activeEvent?.ticketTiers[0];

  const remainingCapacity = activeTier ? activeTier.capacity - activeTier.sold : 0;
  const totalAmount = activeTier ? activeTier.price * quantity : 0;

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const url = await supabaseService.uploadReceipt(file, `TKT-TEMP-${Date.now()}`);
      if (url) setReceiptUrl(url);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeEvent || !activeTier) {
      setErrorMsg('Please select an event and ticket tier.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please provide your full name, phone number, and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await purchaseEventTicket({
        eventId: activeEvent.id,
        tierId: activeTier.id,
        quantity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        receiptUrl: receiptUrl || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.ok || !res.ticket) {
        setErrorMsg(res.error || 'Could not issue digital ticket.');
        return;
      }

      setIssuedTicket(res.ticket);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      {/* Hero Header */}
      <section className="bg-[#4e0b13] text-white py-14 lg:py-16 border-b border-[#630f1a]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#81141f] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f6e3e5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LAGOS &amp; ABUJA EVENTS · INSTANT QR PASSES</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.12]">
                Upcoming Events &amp; Digital Tickets
              </h1>
              <p className="text-sm sm:text-base text-[#ebc7cb] leading-relaxed">
                Reserve Regular, VIP, and VVIP tickets for exclusive BZ De Great galas, creative studio masterclasses, and private real estate briefings — complete with cryptographic QR digital passes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#ebc7cb]" />
                <span>Marketplace</span>
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#ebc7cb]" />
                <span>Lagos Studio Booking</span>
              </Link>
              <Link
                href="/equipment-rental"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Video className="w-4 h-4 text-[#ebc7cb]" />
                <span>Camera &amp; Gear Rental</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4e0b13] px-4 py-2.5 text-xs font-bold shadow-xs"
              >
                <Ticket className="w-4 h-4 text-[#81141f]" />
                <span>Events &amp; Tickets</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Event Cards & Ticket Tiers */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
                UPCOMING CALENDAR
              </span>
              <h2 className="text-2xl font-bold text-[#1b1416] mt-1">
                Select an Event &amp; Ticket Tier
              </h2>
            </div>

            <div className="space-y-6">
              {publishedEvents.map((evt) => {
                const isSelected = activeEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id);
                      if (!evt.ticketTiers.some((t) => t.id === selectedTierId)) {
                        setSelectedTierId(evt.ticketTiers[0]?.id || '');
                      }
                      setIssuedTicket(null);
                      setErrorMsg(null);
                    }}
                    className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#81141f] bg-[#fbf3f4]/50 shadow-md ring-1 ring-[#81141f]'
                        : 'border-[#eae3e4] bg-white hover:border-[#81141f]/50'
                    }`}
                  >
                    <div className="relative h-56 bg-[#f8f5f5]">
                      <img
                        src={evt.image || '/photos/hero-villa-suv.jpg'}
                        alt={evt.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="rounded-md bg-[#4e0b13]/95 text-white px-3 py-1 text-xs font-bold">
                          {evt.city}
                        </span>
                        <span className="rounded-md bg-white/95 text-[#1b1416] px-3 py-1 text-xs font-bold shadow-xs">
                          {evt.date}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#1b1416]">{evt.name}</h3>
                        <p className="text-xs text-[#4d4547] mt-1.5 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#716769]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#1b1416]">
                          <Calendar className="w-3.5 h-3.5 text-[#81141f]" />
                          {evt.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#1b1416]">
                          <Clock className="w-3.5 h-3.5 text-[#81141f]" />
                          {evt.startTime} – {evt.endTime}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#81141f]" />
                          {evt.venue}
                        </span>
                      </div>

                      {/* Configurable Ticket Tiers */}
                      <div className="pt-3 border-t border-[#eae3e4]">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#716769] mb-2">
                          Available Ticket Tiers
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {evt.ticketTiers.map((tier) => {
                            const left = tier.capacity - tier.sold;
                            const isTierChosen =
                              isSelected && activeTier?.id === tier.id;
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                disabled={left <= 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEventId(evt.id);
                                  setSelectedTierId(tier.id);
                                  setIssuedTicket(null);
                                }}
                                className={`rounded-xl border p-3 text-left transition-all ${
                                  left <= 0
                                    ? 'bg-neutral-100 border-neutral-200 opacity-60 cursor-not-allowed'
                                    : isTierChosen
                                    ? 'bg-[#81141f] border-[#81141f] text-white cursor-pointer'
                                    : 'bg-white border-[#eae3e4] hover:border-[#81141f] cursor-pointer'
                                }`}
                              >
                                <span
                                  className={`block text-xs font-bold ${
                                    isTierChosen ? 'text-white' : 'text-[#1b1416]'
                                  }`}
                                >
                                  {tier.name}
                                </span>
                                <span
                                  className={`block text-sm font-extrabold mt-0.5 ${
                                    isTierChosen ? 'text-[#f6e3e5]' : 'text-[#81141f]'
                                  }`}
                                >
                                  ₦{tier.price.toLocaleString()}
                                </span>
                                <span
                                  className={`block text-[10px] mt-1 font-semibold ${
                                    isTierChosen ? 'text-white/80' : 'text-[#716769]'
                                  }`}
                                >
                                  {left > 0 ? `${left} seats left` : 'Sold Out'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Columns: Digital Ticket Checkout or Issued QR Pass */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 sm:p-7 shadow-lg">
              {issuedTicket ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-[#4e0b13] text-white p-6 space-y-4 border border-[#81141f]">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ebc7cb]">
                          BZ DIGITAL EVENT PASS
                        </span>
                        <h3 className="text-lg font-extrabold">{issuedTicket.tierName}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
                        {issuedTicket.quantity}x Admit
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#f6e3e5]">
                      <p className="font-bold text-white text-sm">{issuedTicket.eventName}</p>
                      <p>
                        {issuedTicket.eventDate} · {issuedTicket.eventTime}
                      </p>
                      <p className="text-[#ebc7cb]">{issuedTicket.eventVenue}</p>
                    </div>

                    {/* QR Code & Unique Verification Code */}
                    <div className="bg-white rounded-xl p-4 text-[#1b1416] flex flex-col items-center space-y-2.5">
                      <QrCodeBadge value={issuedTicket.qrPayload} size={156} />
                      <div className="text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#716769]">
                          UNIQUE TICKET VERIFICATION CODE
                        </span>
                        <span className="block text-base font-extrabold tracking-wider text-[#81141f]">
                          {issuedTicket.ticketCode}
                        </span>
                        <span className="block text-[11px] text-[#4d4547] font-semibold mt-0.5">
                          Holder: {issuedTicket.customerName} ({issuedTicket.id})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={getWhatsAppBookingLink(
                        issuedTicket.id,
                        `${issuedTicket.eventName} (${issuedTicket.tierName})`,
                        `Ticket Code: ${issuedTicket.ticketCode} | Qty: ${issuedTicket.quantity} | Total: ₦${issuedTicket.totalAmount.toLocaleString()}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl gap-2 justify-center cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>Send Ticket Copy to My WhatsApp</span>
                      </Button>
                    </a>
                    <Link href={`/my-booking?ref=${issuedTicket.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-[#eae3e4] text-xs font-bold cursor-pointer"
                      >
                        Open in My Booking Wallet ({issuedTicket.id})
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIssuedTicket(null)}
                      className="text-xs font-semibold text-[#716769]"
                    >
                      Purchase Another Ticket
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePurchase} className="space-y-4">
                  <div className="pb-3 border-b border-[#eae3e4]">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#81141f]">
                      DIGITAL TICKET BOX OFFICE
                    </span>
                    <h3 className="text-lg font-bold text-[#1b1416] mt-0.5">
                      {activeEvent?.name}
                    </h3>
                    <p className="text-xs text-[#716769]">
                      {activeTier?.name} — ₦{activeTier?.price.toLocaleString()} per pass (
                      {remainingCapacity} remaining)
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Perks Included */}
                  {activeTier && activeTier.perks.length > 0 && (
                    <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-3.5 space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81141f]">
                        {activeTier.name} Privileges
                      </span>
                      {activeTier.perks.map((perk) => (
                        <div
                          key={perk}
                          className="flex items-center gap-1.5 text-xs text-[#1b1416]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Ticket Tier *
                      </label>
                      <select
                        value={activeTier?.id || ''}
                        onChange={(e) => setSelectedTierId(e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416]"
                      >
                        {activeEvent?.ticketTiers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (₦{t.price.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={Math.max(1, remainingCapacity)}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Attendee Full Name *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Name printed on QR badge"
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
                        placeholder="+234 803 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Email Address (For Digital Ticket Delivery) *
                    </label>
                    <Input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="attendee@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Table / Guest Seating Notes (Optional)
                    </label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dietary preference or VIP table guest names"
                    />
                  </div>

                  {/* Bank Transfer Box */}
                  <div className="rounded-xl bg-[#fbf3f4] border border-[#e6d3d6] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                        TOTAL TICKET AMOUNT
                      </span>
                      <span className="text-sm font-extrabold text-[#1b1416]">
                        ₦{totalAmount.toLocaleString()}
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
                          : 'Attach Transfer Receipt (Optional)'}
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
                    disabled={submitting || remainingCapacity <= 0}
                    className="w-full h-11 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-sm gap-2 justify-center cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>
                      {submitting
                        ? 'Generating Digital Ticket...'
                        : `Generate QR Ticket (₦${totalAmount.toLocaleString()})`}
                    </span>
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
