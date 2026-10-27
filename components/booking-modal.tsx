'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Calendar, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Listing } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '@/lib/store';
import { useToast } from './toast-provider';
import { getWhatsAppBookingLink, SITE_CONFIG } from '@/lib/constants';
import { CopyButton } from './ui/copy-button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  initialType?: 'car_rental' | 'car_test_drive' | 'property_inspection';
}

export function BookingModal({
  isOpen,
  onClose,
  listing,
  initialType
}: BookingModalProps) {
  const { createBooking } = useStore();
  const { toast } = useToast();

  const isRent = listing.category.includes('rent');
  const isCar = listing.category.startsWith('car');

  const defaultType =
    initialType || (isCar ? (isRent ? 'car_rental' : 'car_test_drive') : 'property_inspection');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [endDate, setEndDate] = useState(isRent && isCar ? '2026-10-28' : '');
  const [driverOption, setDriverOption] = useState<'Self-drive' | 'Chauffeured'>('Self-drive');
  const [notes, setNotes] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: 'Missing information',
        description: 'Please provide your full name and phone number.',
        variant: 'warning'
      });
      return;
    }

    const booking = await createBooking({
      type: defaultType,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0],
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || '',
      startDate: date,
      endDate: endDate || undefined,
      driverOption: isCar && isRent ? driverOption : undefined,
      pickupLocation: listing.location,
      totalAmount: isRent && isCar ? listing.price * 3 : listing.price,
      paymentStatus: 'pending',
      bookingStatus: 'requested',
      notes
    });

    setConfirmedBookingId(booking.id);

    toast({
      title: 'Booking requested successfully',
      description: `Reference: ${booking.id}. Our concierge will contact you shortly.`,
      variant: 'success'
    });
  };

  const handleOpenWhatsApp = () => {
    if (!confirmedBookingId) return;
    const link = getWhatsAppBookingLink(confirmedBookingId, listing.title, `Scheduled Date: ${date}. Driver: ${driverOption}`);
    window.open(link, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-border-subtle no-scrollbar animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-subtle hover:text-text-main hover:bg-surface-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBookingId ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
                {defaultType === 'car_rental'
                  ? 'Car Rental Reservation'
                  : defaultType === 'car_test_drive'
                  ? 'Schedule Test Drive'
                  : 'Property Inspection Booking'}
              </span>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                {defaultType === 'car_rental'
                  ? 'Reserve This Vehicle'
                  : defaultType === 'car_test_drive'
                  ? 'Request Test Drive'
                  : 'Schedule Viewing'}
              </h3>
            </div>

            {/* Selected Listing Card Preview */}
            <div className="mb-6 p-4 rounded-2xl bg-surface-bg border border-border-subtle flex items-center gap-4">
              <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-white border border-border-subtle">
                <Image
                  src={listing.images[0] || '/photos/car-suv-white.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-text-main truncate">{listing.title}</h4>
                <div className="flex items-center gap-1 text-xs text-text-subtle mt-0.5">
                  <MapPin className="w-3 h-3 text-wine-700" />
                  <span className="truncate">{listing.location}</span>
                </div>
                <div className="text-xs font-bold text-wine-900 mt-1">
                  ₦{listing.price.toLocaleString()} {listing.pricePeriod}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Chidi Okafor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <Input
                  label="Phone / WhatsApp"
                  placeholder={SITE_CONFIG.phoneDisplay}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="client@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={defaultType === 'car_rental' ? 'Start Date' : 'Preferred Inspection Date'}
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />

                {isRent && isCar && (
                  <Input
                    label="Return Date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                )}
              </div>

              {isCar && isRent && (
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Driver Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDriverOption('Self-drive')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        driverOption === 'Self-drive'
                          ? 'bg-wine-800 text-white border-wine-700'
                          : 'bg-white text-text-secondary border-border-subtle hover:bg-wine-50'
                      }`}
                    >
                      Self-drive
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverOption('Chauffeured')}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        driverOption === 'Chauffeured'
                          ? 'bg-wine-800 text-white border-wine-700'
                          : 'bg-white text-text-secondary border-border-subtle hover:bg-wine-50'
                      }`}
                    >
                      Chauffeured VIP
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3">
                <Button type="submit" size="lg" className="w-full font-bold shadow-md">
                  <span>Confirm and Request Booking</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-subtle pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero advance deposit needed for initial viewing/inspection</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation View */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Reservation Logged
              </span>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                Booking Reference Confirmed
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">
                Your reservation has been created with reference number below. Connect directly with our concierge team on WhatsApp for vehicle preparation and schedule alignment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle inline-flex items-center gap-3">
              <span className="text-xs text-text-subtle">Booking Ticket:</span>
              <strong className="text-base font-mono font-bold text-wine-900">{confirmedBookingId}</strong>
              <CopyButton value={confirmedBookingId} />
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button onClick={handleOpenWhatsApp} size="lg" className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageSquare className="w-4 h-4" />
                <span>Continue on WhatsApp ({SITE_CONFIG.phoneDisplay})</span>
              </Button>
              <Button onClick={onClose} variant="outline" size="sm" className="w-full">
                Back to Listings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
