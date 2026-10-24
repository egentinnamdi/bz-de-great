'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import {
  ChevronRight,
  MapPin,
  Users,
  Fuel,
  Gauge,
  Calendar,
  CheckCircle2,
  Heart,
  Share2,
  Camera,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { CardCar } from '@/components/card-car';
import { GalleryViewer } from '@/components/gallery-viewer';
import { BookingModal } from '@/components/booking-modal';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { getWhatsAppBookingLink } from '@/lib/constants';

export default function CarDetailPage() {
  const params = useParams();
  const { listings } = useStore();
  const { toast } = useToast();

  const carId = params.id as string;
  const car = listings.find(l => l.id === carId || l.slug === carId);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Booking Card State
  const [driverMode, setDriverMode] = useState<'self' | 'chauffeur'>('chauffeur');
  const [days, setDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>('2026-10-25');
  const [pickupLoc, setPickupLoc] = useState<string>('Abuja Central Delivery');

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <h2 className="font-serif text-3xl font-semibold">Vehicle Not Found</h2>
          <p className="text-[15px] text-[#716769] max-w-sm">
            The requested vehicle listing may have been rented or archived.
          </p>
          <Link href="/cars/rent">
            <Button className="bg-[#81141f] text-white">View Available Car Rentals</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const specs = car.vehicleSpecs;
  const similarCars = listings
    .filter(l => l.category === 'car_rent' && l.id !== car.id)
    .slice(0, 3);

  // Dynamic cost calculation matching screenshot (₦755,000 for Lincoln Navigator with driver over 3 days)
  const baseRate = car.price;
  const baseSubtotal = baseRate * days;
  const chauffeurFee = driverMode === 'chauffeur' ? 20000 * days : 0;
  const cautionDeposit = 100000;
  const serviceFee = 55000;
  const totalAmount = baseSubtotal + chauffeurFee + cautionDeposit + serviceFee;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: car.title,
        text: car.description,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Listing link copied',
        description: 'You can now paste and share this vehicle.',
        variant: 'default'
      });
    }
  };

  const handleToggleSave = () => {
    setSaved(!saved);
    toast({
      title: !saved ? 'Saved to favorites' : 'Removed from favorites',
      description: car.title,
      variant: 'default'
    });
  };

  const waLink = getWhatsAppBookingLink(
    `CAR-${car.id.slice(-4).toUpperCase()}`,
    car.title,
    `Duration: ${days} days (${driverMode === 'chauffeur' ? 'With driver' : 'Self-drive'}). Location: ${pickupLoc}. Total estimated: ₦${totalAmount.toLocaleString()}.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
      <SiteHeader />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumbs (Figma: [FRAME] Breadcrumb) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#716769]">
              <Link href="/" className="hover:text-[#81141f] transition-colors">Home</Link>
              <span className="text-[#a89d9f]">/</span>
              <Link href="/cars/rent" className="hover:text-[#81141f] transition-colors">Cars for rent</Link>
              <span className="text-[#a89d9f]">/</span>
              <span className="text-[#1b1416] font-medium truncate max-w-xs">{car.title}</span>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSave}
                className="gap-1.5 rounded-full text-[13px] border-[#eae3e4]"
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-[#81141f] text-[#81141f]' : 'text-[#716769]'}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 rounded-full text-[13px] border-[#eae3e4]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#716769]" />
                <span>Share</span>
              </Button>
            </div>
          </div>

          {/* Photo Gallery Grid (Figma: [FRAME] Gallery) */}
          <div className="relative mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[20px] overflow-hidden bg-white p-2 border border-[#eae3e4] shadow-xs">
              {/* Primary 1 large photo on left */}
              <div
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
                className="md:col-span-2 relative h-[320px] sm:h-[440px] rounded-[16px] overflow-hidden cursor-pointer group bg-[#f8f5f5]"
              >
                <Image
                  src={car.images[0] || '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg'}
                  alt={car.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-[6px] bg-white/95 text-[#81141f] text-xs font-semibold shadow-xs">
                    For rent
                  </span>
                  {car.featured && (
                    <span className="px-3 py-1 rounded-[6px] bg-[#81141f] text-white text-xs font-semibold shadow-xs">
                      Featured fleet
                    </span>
                  )}
                </div>
              </div>

              {/* Right 2x2 grid (4 photos) */}
              <div className="md:col-span-2 grid grid-cols-2 gap-3.5">
                {(car.images.slice(1, 5).concat([car.images[0], car.images[0], car.images[0]])).slice(0, 4).map((img, idx) => (
                  <div
                    key={img + idx}
                    onClick={() => {
                      setGalleryIndex(idx + 1);
                      setGalleryOpen(true);
                    }}
                    className="relative h-[155px] sm:h-[213px] rounded-[14px] overflow-hidden cursor-pointer group bg-[#f8f5f5]"
                  >
                    <Image
                      src={img}
                      alt={`${car.title} angle ${idx + 2}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {idx === 3 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold gap-1.5 group-hover:bg-black/70 transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>View all {car.images.length > 4 ? car.images.length : 8} photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pill trigger on bottom right */}
            <button
              type="button"
              onClick={() => {
                setGalleryIndex(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-6 right-6 hidden md:inline-flex items-center gap-2 bg-white/95 hover:bg-white text-[#1b1416] font-semibold text-xs px-4 py-2.5 rounded-full shadow-md border border-[#eae3e4] transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#81141f]" />
              <span>View all photos</span>
            </button>
          </div>

          {/* Two-Column Details & Sticky Booking Card (Figma: [FRAME] Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column (Details) */}
            <div className="lg:col-span-7 space-y-10">
              {/* Title & Location Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#81141f]">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#81141f]/10 uppercase tracking-wider">
                    {specs?.driverOption === 'Both' ? 'Self-drive / With driver' : specs?.driverOption || 'Chauffeured VIP'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#716769]">
                    <MapPin className="w-3.5 h-3.5 text-[#81141f]" />
                    {car.location} · Delivery available across FCT
                  </span>
                </div>

                <h1 className="font-serif text-[36px] sm:text-[44px] font-semibold text-[#1b1416] leading-tight">
                  {car.title}
                </h1>
                {car.subtitle && (
                  <p className="text-[16px] text-[#716769] font-normal">
                    {car.subtitle}
                  </p>
                )}
              </div>

              {/* 4-Pill Specs Strip (Figma: [FRAME] Specs) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Seats</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.seats || 7} Seats</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Transmission</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.transmission || 'Automatic'}</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Fuel</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.fuelType || 'Petrol'}</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Year</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.year || 2022}</span>
                </div>
              </div>

              {/* About This Vehicle (Figma: [FRAME] About) */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  About this vehicle
                </h2>
                <div className="text-[15px] text-[#716769] leading-relaxed space-y-3">
                  <p>{car.description}</p>
                  <p>
                    Maintained directly according to original factory schedule. Spotless interior, calibrated active suspension, and multi-zone climate control ensure supreme comfort for corporate executives, diplomatic transit, or high-profile weddings.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Features & Amenities (Figma: [FRAME] Features) */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Features & amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    'Premium leather upholstery & wood trim',
                    'Multi-zone automatic climate control',
                    '360-degree high-definition surround camera',
                    'Tinted privacy glass (FCT compliant)',
                    'Apple CarPlay & Android Auto integration',
                    'Uniformed corporate chauffeur available',
                    'Comprehensive insurance coverage',
                    'Full tank on pickup / delivery'
                  ].map(feat => (
                    <div key={feat} className="flex items-start gap-2.5 text-[14px] text-[#1b1416]">
                      <Check className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Rental terms & conditions (Figma: [FRAME] Rental terms) */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Rental terms & conditions
                </h2>
                <ul className="space-y-3 text-[14px] text-[#716769]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                    <span><strong>Refundable caution deposit:</strong> ₦100,000 required, returned within 24 hours of vehicle drop-off.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                    <span><strong>Self-drive requirement:</strong> Valid Nigerian driver’s license or international passport required for identity verification.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                    <span><strong>Mileage allowance:</strong> 200 km daily within Abuja FCT. Interstate travel requires prior authorization and custom rate.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                    <span><strong>Minimum rental:</strong> 24 hours (1 calendar day).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Sticky Booking Card (Figma: [FRAME] Booking card) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-[20px] border border-[#eae3e4] p-7 shadow-xl space-y-6">
                {/* Price Display */}
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#716769] font-medium block">
                    Daily rental rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-sans font-bold text-[32px] sm:text-[38px] text-[#81141f]">
                      ₦{car.price.toLocaleString()}
                    </span>
                    <span className="text-[15px] text-[#716769] font-normal">/ day</span>
                  </div>
                </div>

                {/* Driver Option Segmented Control (Figma: [INSTANCE] Segmented control) */}
                <div className="flex bg-[#f8f5f5] p-1 rounded-[12px] border border-[#eae3e4]">
                  <button
                    type="button"
                    onClick={() => setDriverMode('self')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      driverMode === 'self' ? 'bg-white text-[#1b1416] shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    Self-drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverMode('chauffeur')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      driverMode === 'chauffeur' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    With driver (+₦20k)
                  </button>
                </div>

                {/* Duration & Date Selectors */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-[#1b1416]">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full h-[42px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-[#1b1416]">Duration (Days)</label>
                      <select
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                        className="w-full h-[42px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 7, 14, 30].map(d => (
                          <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pick-up location */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-semibold text-[#1b1416]">Pick-up location</label>
                    <select
                      value={pickupLoc}
                      onChange={e => setPickupLoc(e.target.value)}
                      className="w-full h-[42px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] cursor-pointer"
                    >
                      <option value="Abuja Central Delivery">Abuja Central Delivery (Free)</option>
                      <option value="Maitama Office">Maitama Office Pick-up</option>
                      <option value="Airport VIP Delivery">Nnamdi Azikiwe Airport VIP Delivery</option>
                      <option value="Transcorp Hilton">Transcorp Hilton Hotel Delivery</option>
                    </select>
                  </div>
                </div>

                <div className="h-[1px] bg-[#eae3e4] w-full" />

                {/* Price Breakdown (Figma: [FRAME] Price breakdown) */}
                <div className="space-y-2 text-[13px] text-[#716769]">
                  <div className="flex justify-between">
                    <span>₦{baseRate.toLocaleString()} × {days} days</span>
                    <span className="font-semibold text-[#1b1416]">₦{baseSubtotal.toLocaleString()}</span>
                  </div>
                  {driverMode === 'chauffeur' && (
                    <div className="flex justify-between">
                      <span>Chauffeur fee ({days} days)</span>
                      <span className="font-semibold text-[#1b1416]">₦{chauffeurFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Refundable caution deposit</span>
                    <span className="font-semibold text-[#1b1416]">₦{cautionDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service & insurance fee</span>
                    <span className="font-semibold text-[#1b1416]">₦{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[#eae3e4] flex justify-between items-baseline text-[15px]">
                    <span className="font-bold text-[#1b1416]">Total</span>
                    <span className="font-bold text-[20px] text-[#81141f]">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary & Secondary Buttons (Figma: [INSTANCE] Button) */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full h-[50px] rounded-[12px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[15px] shadow-sm cursor-pointer"
                  >
                    <span>Request booking</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-[50px] rounded-[12px] border-[#eae3e4] hover:bg-[#f8f5f5] text-[#1b1416] font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#81141f]" />
                      <span>Chat on WhatsApp</span>
                    </Button>
                  </a>
                </div>

                {/* Micro-copy */}
                <p className="text-[12px] text-center text-[#716769] leading-relaxed">
                  No instant debit. Our concierge confirms vehicle availability before payment.
                </p>
              </div>
            </div>
          </div>

          {/* Similar cars (Figma: [FRAME] Similar cars) */}
          {similarCars.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#eae3e4]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-[28px] font-semibold text-[#1b1416]">
                    Similar vehicles you may like
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    Alternative luxury cars in our Abuja fleet available for immediate reservation.
                  </p>
                </div>
                <Link
                  href="/cars/rent"
                  className="hidden sm:inline-flex items-center gap-1 text-[14px] font-semibold text-[#81141f] hover:underline"
                >
                  <span>View all cars</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarCars.map(c => (
                  <CardCar key={c.id} car={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />

      {/* Lightbox Gallery */}
      <GalleryViewer
        images={car.images}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={car.title}
      />

      {/* Booking Drawer Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        listing={car}
        initialType="car_rental"
      />
    </div>
  );
}
