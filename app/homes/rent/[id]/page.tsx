'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
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
import { CardProperty } from '@/components/card-property';
import { GalleryViewer } from '@/components/gallery-viewer';
import { BookingModal } from '@/components/booking-modal';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { getWhatsAppBookingLink } from '@/lib/constants';

export default function HomeRentDetailPage() {
  const params = useParams();
  const { listings } = useStore();
  const { toast } = useToast();

  const id = params.id as string;
  const property = listings.find(l => l.id === id || l.slug === id);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Inspection Card state
  const [inspectionMode, setInspectionMode] = useState<'physical' | 'video'>('physical');
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-26');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <h2 className="font-serif text-3xl font-semibold">Home Not Found</h2>
          <p className="text-[15px] text-[#716769] max-w-sm">
            The requested rental home may have been leased or archived.
          </p>
          <Link href="/homes/rent">
            <Button className="bg-[#81141f] text-white">View Available Homes for Rent</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const specs = property.propertySpecs;
  const similarHomes = listings
    .filter(l => l.category === 'property_rent' && l.id !== property.id)
    .slice(0, 3);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Listing link copied',
        description: 'You can now paste and share this property.',
        variant: 'default'
      });
    }
  };

  const handleToggleSave = () => {
    setSaved(!saved);
    toast({
      title: !saved ? 'Saved to favorites' : 'Removed from favorites',
      description: property.title,
      variant: 'default'
    });
  };

  const waLink = getWhatsAppBookingLink(
    `RENT-${property.id.slice(-4).toUpperCase()}`,
    property.title,
    `Annual Rent: ₦${property.price.toLocaleString()}. I would like to book a ${inspectionMode === 'physical' ? 'physical inspection' : 'virtual tour'} on ${preferredDate} at ${preferredTime}.`
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
              <Link href="/homes/rent" className="hover:text-[#81141f] transition-colors">Homes for rent</Link>
              <span className="text-[#a89d9f]">/</span>
              <span className="text-[#1b1416] font-medium truncate max-w-xs">{property.title}</span>
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
                  src={property.images[0] || '/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-[6px] bg-white/95 text-[#81141f] text-xs font-semibold shadow-xs">
                    For rent
                  </span>
                  {specs?.serviced && (
                    <span className="px-3 py-1 rounded-[6px] bg-[#81141f] text-white text-xs font-semibold shadow-xs">
                      Fully Serviced
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-3.5">
                {(property.images.slice(1, 5).concat([property.images[0], property.images[0], property.images[0]])).slice(0, 4).map((img, idx) => (
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
                      alt={`${property.title} angle ${idx + 2}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {idx === 3 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold gap-1.5 group-hover:bg-black/70 transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>View all photos</span>
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

          {/* Details & Inspection Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column (Details) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#81141f]">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#81141f]/10 uppercase tracking-wider">
                    Diplomatic & Serviced Living
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#716769]">
                    <MapPin className="w-3.5 h-3.5 text-[#81141f]" />
                    {property.location}
                  </span>
                </div>

                <h1 className="font-serif text-[36px] sm:text-[44px] font-semibold text-[#1b1416] leading-tight">
                  {property.title}
                </h1>
                {property.subtitle && (
                  <p className="text-[16px] text-[#716769] font-normal">
                    {property.subtitle}
                  </p>
                )}
              </div>

              {/* 4-Pill Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Bedrooms</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.bedrooms || 3} Beds</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Bathrooms</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.bathrooms || 3} Baths</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Area</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.areaSqm || 280}m²</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Power</span>
                  <span className="text-[16px] font-bold text-emerald-700 mt-0.5 block">24/7 Serviced</span>
                </div>
              </div>

              {/* About This Residence */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Residence overview & location
                </h2>
                <div className="text-[15px] text-[#716769] leading-relaxed space-y-3">
                  <p>{property.description}</p>
                  <p>
                    Nestled in an exclusive diplomatic and executive neighborhood. Features high security perimeter fencing, silent central generators, water treatment facility, and professional on-site facility managers.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Amenities & Security Checklist */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Included amenities & security
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    '24/7 uninterrupted power supply (Dual generator backup)',
                    'Fitted Italian designer kitchen with built-in appliances',
                    'Dedicated swimming pool and resident fitness gym',
                    'Perimeter electric fencing with uniformed 24h guards',
                    'Spacious en-suite domestic staff quarters (BQ)',
                    'Industrial borehole with reverse osmosis water plant',
                    'Covered multi-vehicle parking garage',
                    'High-speed fiber optic internet infrastructure'
                  ].map(amenity => (
                    <div key={amenity} className="flex items-start gap-2.5 text-[14px] text-[#1b1416]">
                      <Check className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sticky Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-[20px] border border-[#eae3e4] p-7 shadow-xl space-y-6">
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#716769] font-medium block">
                    Rental Price
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-sans font-bold text-[32px] sm:text-[38px] text-[#81141f]">
                      ₦{property.price.toLocaleString()}
                    </span>
                    <span className="text-[15px] text-[#716769] font-normal">{property.pricePeriod || '/ year'}</span>
                  </div>
                </div>

                {/* Inspection Type Selector */}
                <div className="flex bg-[#f8f5f5] p-1 rounded-[12px] border border-[#eae3e4]">
                  <button
                    type="button"
                    onClick={() => setInspectionMode('physical')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      inspectionMode === 'physical' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    Physical Viewing
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionMode('video')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      inspectionMode === 'video' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
                    }`}
                  >
                    Virtual Video Tour
                  </button>
                </div>

                {/* Date & Time Picker */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-[#1b1416]">Inspection Date</label>
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
                        <option value="10:00 AM">10:00 AM (Morning)</option>
                        <option value="01:00 PM">01:00 PM (Afternoon)</option>
                        <option value="04:00 PM">04:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-[13px] text-[#716769] space-y-1">
                    <div className="flex justify-between">
                      <span>Agency viewing fee:</span>
                      <strong className="text-emerald-700">₦0 (Free)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Service charge:</span>
                      <strong className="text-[#1b1416]">Included in package</strong>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#eae3e4] w-full" />

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setInspectionModalOpen(true)}
                    className="w-full h-[50px] rounded-[12px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[15px] shadow-sm cursor-pointer"
                  >
                    <span>Schedule private inspection</span>
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
                  Our licensed real estate concierge meets you directly at the property.
                </p>
              </div>
            </div>
          </div>

          {/* Similar properties */}
          {similarHomes.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#eae3e4]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-[28px] font-semibold text-[#1b1416]">
                    Similar rental residences
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    Other serviced homes and apartments currently vacant in prime Abuja locations.
                  </p>
                </div>
                <Link
                  href="/homes/rent"
                  className="hidden sm:inline-flex items-center gap-1 text-[14px] font-semibold text-[#81141f] hover:underline"
                >
                  <span>View all homes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarHomes.map(h => (
                  <CardProperty key={h.id} property={h} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />

      <GalleryViewer
        images={property.images}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={property.title}
      />

      <BookingModal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        listing={property}
        initialType="property_inspection"
      />
    </div>
  );
}
