'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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
  Check,
  FileCheck
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

export default function CarSaleDetailPage() {
  const params = useParams();
  const { listings } = useStore();
  const { toast } = useToast();

  const carId = params.id as string;
  const car = listings.find(l => l.id === carId || l.slug === carId);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Inspection Card state
  const [inspectionType, setInspectionType] = useState<'test_drive' | 'mechanic'>('test_drive');
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-27');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <h2 className="font-serif text-3xl font-semibold">Vehicle Not Found</h2>
          <p className="text-[15px] text-[#716769] max-w-sm">
            The requested vehicle listing may have been sold or archived.
          </p>
          <Link href="/cars/buy">
            <Button className="bg-[#81141f] text-white">View Available Cars for Sale</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const specs = car.vehicleSpecs;
  const similarCars = listings
    .filter(l => l.category === 'car_sale' && l.id !== car.id)
    .slice(0, 3);

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
    `SALE-${car.id.slice(-4).toUpperCase()}`,
    car.title,
    `Price: ₦${car.price.toLocaleString()}. I would like to book a ${inspectionType === 'test_drive' ? 'test drive' : 'mechanic inspection'} on ${preferredDate} at ${preferredTime}.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
      <SiteHeader />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#716769]">
              <Link href="/" className="hover:text-[#81141f] transition-colors">Home</Link>
              <span className="text-[#a89d9f]">/</span>
              <Link href="/cars/buy" className="hover:text-[#81141f] transition-colors">Cars for sale</Link>
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

          {/* Photo Gallery Grid */}
          <div className="relative mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 rounded-[20px] overflow-hidden bg-white p-2 border border-[#eae3e4] shadow-xs">
              <div
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
                className="md:col-span-2 relative h-[320px] sm:h-[440px] rounded-[16px] overflow-hidden cursor-pointer group bg-[#f8f5f5]"
              >
                <Image
                  src={car.images[0] || '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg'}
                  alt={car.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-[6px] bg-white/95 text-[#81141f] text-xs font-semibold shadow-xs">
                    For sale
                  </span>
                  <span className="px-3 py-1 rounded-[6px] bg-[#81141f] text-white text-xs font-semibold shadow-xs">
                    Customs duty cleared
                  </span>
                </div>
              </div>

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
                        <span>View all {car.images.length > 4 ? car.images.length : 6} photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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

          {/* Two-Column Details & Sticky Purchase/Test Drive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column (Details) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#81141f]">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#81141f]/10 uppercase tracking-wider">
                    Foreign Used · Clean Carfax
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#716769]">
                    <MapPin className="w-3.5 h-3.5 text-[#81141f]" />
                    {car.location}
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

              {/* 4-Pill Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Mileage</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.mileage || '34,000 km'}</span>
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
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.year || 2021}</span>
                </div>
              </div>

              {/* About This Vehicle */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Vehicle overview & condition
                </h2>
                <div className="text-[15px] text-[#716769] leading-relaxed space-y-3">
                  <p>{car.description}</p>
                  <p>
                    Clean, non-accident vehicle with verified odometer reading. All mechanical elements, suspension linkages, and onboard electronics have undergone rigorous inspection by certified master technicians.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Customs & Documentation Checklist */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Documentation & customs verification
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    'Nigerian Customs Single Goods Declaration (SGD) fully cleared',
                    'Original Bill of Lading & assessment notice verified',
                    'Federal Road Safety Corps (FRSC) plate allocation assistance',
                    'Computer diagnostic scan certificate (zero error codes)',
                    'Original manufacturer duplicate keys included',
                    'Pre-delivery full detailing and oil service completed'
                  ].map(doc => (
                    <div key={doc} className="flex items-start gap-2.5 text-[14px] text-[#1b1416]">
                      <FileCheck className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Vehicle Specifications Table */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Full technical specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[14px]">
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Make</span>
                    <span className="font-semibold text-[#1b1416]">{specs?.make}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Model</span>
                    <span className="font-semibold text-[#1b1416]">{specs?.model}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Year of Manufacture</span>
                    <span className="font-semibold text-[#1b1416]">{specs?.year}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Engine</span>
                    <span className="font-semibold text-[#1b1416]">{specs?.engine || '3.0L Turbo Inline-6'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Exterior Color</span>
                    <span className="font-semibold text-[#1b1416]">{specs?.color || 'Mineral Grey Metallic'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eae3e4]">
                    <span className="text-[#716769]">Customs Status</span>
                    <span className="font-semibold text-emerald-700">100% Cleared</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-[20px] border border-[#eae3e4] p-7 shadow-xl space-y-6">
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#716769] font-medium block">
                    Outright sale price (Duty paid)
                  </span>
                  <div className="font-sans font-bold text-[32px] sm:text-[38px] text-[#81141f] mt-1">
                    ₦{car.price.toLocaleString()}
                  </div>
                </div>

                {/* Inspection Type Selector */}
                <div className="flex bg-[#f8f5f5] p-1 rounded-[12px] border border-[#eae3e4]">
                  <button
                    type="button"
                    onClick={() => setInspectionType('test_drive')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      inspectionType === 'test_drive' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionType('mechanic')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      inspectionType === 'mechanic' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    Bring Mechanic
                  </button>
                </div>

                {/* Date & Time Picker */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-[#1b1416]">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        className="w-full h-[42px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-[#1b1416]">Preferred Time</label>
                      <select
                        value={preferredTime}
                        onChange={e => setPreferredTime(e.target.value)}
                        className="w-full h-[42px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] cursor-pointer"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-[13px] text-[#716769] space-y-1">
                    <div className="flex justify-between">
                      <span>Inspection fee:</span>
                      <strong className="text-emerald-700">Free of charge</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <strong className="text-[#1b1416]">Wuse 2 Showroom, Abuja</strong>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#eae3e4] w-full" />

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setTestDriveModalOpen(true)}
                    className="w-full h-[50px] rounded-[12px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[15px] shadow-sm cursor-pointer"
                  >
                    <span>Book test drive & inspection</span>
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

                <p className="text-[12px] text-center text-[#716769] leading-relaxed">
                  Bring your technician or diagnostic scanner. You only pay after complete satisfaction.
                </p>
              </div>
            </div>
          </div>

          {/* Similar cars */}
          {similarCars.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#eae3e4]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-[28px] font-semibold text-[#1b1416]">
                    Similar vehicles for sale
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    Other cleared, documented luxury vehicles currently in our showroom.
                  </p>
                </div>
                <Link
                  href="/cars/buy"
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

      <GalleryViewer
        images={car.images}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={car.title}
      />

      <BookingModal
        isOpen={testDriveModalOpen}
        onClose={() => setTestDriveModalOpen(false)}
        listing={car}
        initialType="car_test_drive"
      />
    </div>
  );
}
