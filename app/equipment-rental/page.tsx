'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Video,
  Camera,
  ShoppingBag,
  Ticket,
  Sparkles,
  CheckCircle2,
  Upload,
  AlertCircle,
  MessageSquare,
  Shield,
  Calendar,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';
import { useStore } from '@/lib/store';
import { EquipmentRental } from '@/lib/types';
import {
  calculateEquipmentAvailableQty,
  calculateEquipmentRentalAuthoritative,
} from '@/lib/commerce-engine';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import { supabaseService } from '@/lib/supabase/service';

const EQUIPMENT_CATEGORIES = [
  'All',
  'Cameras',
  'Lenses',
  'Lighting',
  'Tripods',
  'Audio Equipment',
  'Microphones',
  'Video Equipment',
  'Other Media Equipment',
];

export default function EquipmentRentalPage() {
  const { equipmentItems, equipmentRentals, createEquipmentRental } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    equipmentItems[0]?.id || 'eq-cam-1'
  );
  const [startDate, setStartDate] = useState<string>('2026-11-24');
  const [endDate, setEndDate] = useState<string>('2026-11-26');
  const [quantity, setQuantity] = useState<number>(1);
  const [pickupLocation, setPickupLocation] = useState<string>(
    'BZ De Great Studio — Lekki-Ajah, Lagos State'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedRental, setConfirmedRental] = useState<EquipmentRental | null>(null);

  const availableEquipment = useMemo(
    () => equipmentItems.filter((e) => e.status !== 'archived'),
    [equipmentItems]
  );

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return availableEquipment;
    return availableEquipment.filter(
      (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [availableEquipment, selectedCategory]);

  const selectedItem =
    availableEquipment.find((e) => e.id === selectedItemId) || availableEquipment[0];

  const liveQuote = useMemo(() => {
    if (!selectedItem) return null;
    return calculateEquipmentRentalAuthoritative(
      selectedItem,
      equipmentRentals,
      startDate,
      endDate,
      quantity
    );
  }, [selectedItem, equipmentRentals, startDate, endDate, quantity]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const url = await supabaseService.uploadReceipt(file, `RNT-TEMP-${Date.now()}`);
      if (url) setReceiptUrl(url);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedItem) {
      setErrorMsg('Please select an equipment item.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please provide your full name, phone number, and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createEquipmentRental({
        equipmentId: selectedItem.id,
        startDate,
        endDate,
        quantity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        pickupLocation,
        receiptUrl: receiptUrl || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.ok || !res.rental) {
        setErrorMsg(res.error || 'Could not complete equipment rental.');
        return;
      }

      setConfirmedRental(res.rental);
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
                <span>CINEMA CAMERAS, LIGHTING &amp; AUDIO GEAR</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.12]">
                Camera &amp; Media Equipment Rental
              </h1>
              <p className="text-sm sm:text-base text-[#ebc7cb] leading-relaxed">
                Rent cinema cameras, G-Master lenses, Aputure COB lighting, fluid-head tripods, and broadcast wireless audio kits inspected by our studio technicians.
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
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4e0b13] px-4 py-2.5 text-xs font-bold shadow-xs"
              >
                <Video className="w-4 h-4 text-[#81141f]" />
                <span>Camera &amp; Gear Rental</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Ticket className="w-4 h-4 text-[#ebc7cb]" />
                <span>Events &amp; Tickets</span>
              </Link>
            </div>
          </div>

          {/* Equipment Category Chips */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-[#4e0b13]'
                    : 'bg-[#63101a]/70 text-[#f6e3e5] hover:bg-[#81141f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Equipment Catalog */}
          <div className="lg:col-span-7 space-y-5">
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const availForDates = calculateEquipmentAvailableQty(
                item,
                equipmentRentals,
                startDate,
                endDate
              );

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setConfirmedRental(null);
                    setErrorMsg(null);
                  }}
                  className={`rounded-2xl border p-6 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#81141f] bg-[#fbf3f4]/60 shadow-sm ring-1 ring-[#81141f]'
                      : 'border-[#eae3e4] bg-white hover:border-[#81141f]/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    <img
                      src={item.images[0] || '/photos/gallery-bz-1.jpg'}
                      alt={item.name}
                      className="w-full sm:w-44 h-36 rounded-xl object-cover border border-[#eae3e4] shrink-0"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#4e0b13] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                            <span className="text-xs font-semibold text-[#716769]">
                              {item.condition}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#1b1416] mt-1">
                            {item.name}
                          </h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-xl font-extrabold text-[#81141f]">
                            ₦{item.dailyRate.toLocaleString()}/day
                          </span>
                          <span className="text-[11px] text-[#716769] font-semibold">
                            Deposit: ₦{item.depositAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#4d4547] leading-relaxed">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#eae3e4]">
                        {Object.entries(item.specifications).map(([k, v]) => (
                          <div key={k} className="text-xs truncate">
                            <span className="text-[#716769] font-medium">{k}: </span>
                            <span className="font-semibold text-[#1b1416]">{v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span
                          className={`font-bold ${
                            availForDates > 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {availForDates > 0
                            ? `${availForDates} of ${item.quantityTotal} available (${startDate} → ${endDate})`
                            : `Booked out for ${startDate} → ${endDate}`}
                        </span>
                        <span className="font-bold text-[#81141f]">
                          {isSelected ? 'Selected for Rental ✓' : 'Select Gear →'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: Sticky Rental Date-Range Calculator & Booking Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="rounded-2xl border border-[#eae3e4] bg-white p-6 sm:p-7 shadow-lg">
              {confirmedRental ? (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                      EQUIPMENT RENTAL RESERVED
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#1b1416]">
                      {confirmedRental.id}
                    </h3>
                    <p className="text-xs text-[#4d4547]">
                      {confirmedRental.quantity}x {confirmedRental.equipmentName}
                    </p>
                    <p className="text-xs font-semibold text-[#81141f]">
                      {confirmedRental.startDate} to {confirmedRental.endDate} ({confirmedRental.days}{' '}
                      day{confirmedRental.days > 1 ? 's' : ''})
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eae3e4] p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Pickup Desk</span>
                      <span className="font-bold text-right">
                        {confirmedRental.pickupLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Total (Incl. Refundable Deposit)</span>
                      <span className="font-extrabold text-[#81141f]">
                        ₦{confirmedRental.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={getWhatsAppBookingLink(
                        confirmedRental.id,
                        confirmedRental.equipmentName,
                        `Dates: ${confirmedRental.startDate} to ${confirmedRental.endDate} | Total: ₦${confirmedRental.totalAmount.toLocaleString()}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl gap-2 justify-center cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>Confirm Gear Pickup via WhatsApp</span>
                      </Button>
                    </a>
                    <Link href={`/my-booking?ref=${confirmedRental.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-[#eae3e4] text-xs font-bold cursor-pointer"
                      >
                        Track Rental ({confirmedRental.id})
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmedRental(null)}
                      className="text-xs font-semibold text-[#716769]"
                    >
                      Rent Another Item
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-[#eae3e4]">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#81141f]">
                      GEAR RENTAL RESERVATION
                    </span>
                    <h3 className="text-lg font-bold text-[#1b1416] mt-0.5">
                      {selectedItem?.name}
                    </h3>
                    <p className="text-xs text-[#716769]">
                      ₦{selectedItem?.dailyRate.toLocaleString()}/day + ₦
                      {selectedItem?.depositAmount.toLocaleString()} Refundable Caution Deposit
                    </p>
                  </div>

                  {(errorMsg || (liveQuote && !liveQuote.ok)) && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg || liveQuote?.error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-[#1b1416] mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#81141f]" />
                        <span>Pickup Date *</span>
                      </label>
                      <Input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-[#1b1416] mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#81141f]" />
                        <span>Return Date *</span>
                      </label>
                      <Input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Units *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={selectedItem?.quantityTotal || 5}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Pickup Branch *
                      </label>
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416]"
                      >
                        <option value="BZ De Great Studio — Lekki-Ajah, Lagos State">
                          Lagos Studio (Lekki-Ajah)
                        </option>
                        <option value="Abuja Desk — Karmo / Wuse 2, Abuja">
                          Abuja Office Desk
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Live Rental Breakdown */}
                  {liveQuote && liveQuote.ok && (
                    <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-3.5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#716769]">
                          Rental ({liveQuote.days} day{liveQuote.days > 1 ? 's' : ''} × {quantity} unit
                          {quantity > 1 ? 's' : ''})
                        </span>
                        <span className="font-bold text-[#1b1416]">
                          ₦{(liveQuote.dailyRate * liveQuote.days * quantity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#716769] flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-[#81141f]" />
                          Refundable Caution Deposit
                        </span>
                        <span className="font-bold text-[#1b1416]">
                          ₦{liveQuote.depositAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#eae3e4] text-sm">
                        <span className="font-bold text-[#1b1416]">Total Payable</span>
                        <span className="font-extrabold text-[#81141f]">
                          ₦{liveQuote.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Production / Client Name"
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
                        placeholder="+234 809 000 0000"
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
                      placeholder="producer@studio.ng"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Production / ID Verification Notes
                    </label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Shoot location, lens mount adapter preference, etc."
                    />
                  </div>

                  {/* Bank Transfer Box */}
                  <div className="rounded-xl bg-[#fbf3f4] border border-[#e6d3d6] p-4 space-y-2.5">
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
                    disabled={submitting || Boolean(liveQuote && !liveQuote.ok)}
                    className="w-full h-11 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-sm cursor-pointer"
                  >
                    {submitting
                      ? 'Reserving Equipment...'
                      : `Book Equipment Rental (₦${(
                          liveQuote?.totalAmount || 0
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
