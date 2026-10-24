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
  Check,
  FileCheck,
  FileText
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

export default function PropertySaleDetailPage() {
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
  const [inspectionMode, setInspectionMode] = useState<'physical' | 'virtual'>('physical');
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-26');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <h2 className="font-serif text-3xl font-semibold">Property Not Found</h2>
          <p className="text-[15px] text-[#716769] max-w-sm">
            The requested property listing may have been sold or archived.
          </p>
          <Link href="/properties/buy">
            <Button className="bg-[#81141f] text-white">View Available Properties for Sale</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const specs = property.propertySpecs;
  const similarProperties = listings
    .filter(l => l.category === 'property_sale' && l.id !== property.id)
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
    `PROP-${property.id.slice(-4).toUpperCase()}`,
    property.title,
    `Guide Price: ₦${property.price.toLocaleString()}. I would like to book a ${inspectionMode === 'physical' ? 'physical viewing' : 'virtual tour'} on ${preferredDate} at ${preferredTime}.`
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
              <Link href="/properties/buy" className="hover:text-[#81141f] transition-colors">Property for sale</Link>
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
                  src={property.images[0] || '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-[6px] bg-white/95 text-[#81141f] text-xs font-semibold shadow-xs">
                    For sale
                  </span>
                  <span className="px-3 py-1 rounded-[6px] bg-[#81141f] text-white text-xs font-semibold shadow-xs">
                    {specs?.titleDocument ? 'C of O Verified' : 'Clean Title'}
                  </span>
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
                      alt={`${property.title} perspective ${idx + 2}`}
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

          {/* Details & Sticky Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column (Details) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#81141f]">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#81141f]/10 uppercase tracking-wider">
                    {specs?.titleDocument || 'Certificate of Occupancy'}
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
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.bedrooms ? `${specs.bedrooms} Beds` : 'N/A'}</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Bathrooms</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.bathrooms ? `${specs.bathrooms} Baths` : 'N/A'}</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Area</span>
                  <span className="text-[16px] font-bold text-[#1b1416] mt-0.5 block">{specs?.areaSqm || 1200}m²</span>
                </div>
                <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-center">
                  <span className="text-[12px] uppercase text-[#716769] font-medium block">Title</span>
                  <span className="text-[16px] font-bold text-emerald-700 mt-0.5 block">C of O</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  About this property
                </h2>
                <div className="text-[15px] text-[#716769] leading-relaxed space-y-3">
                  <p>{property.description}</p>
                  <p>
                    Strategically developed with premium imported marble, soaring ceilings, acoustic double-glazed windows, and automated ambient lighting. Fully documented legal title free from encumbrances, ready for instantaneous registration at land registries.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Amenities Checklist */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Property amenities & architecture
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    'All bedrooms en-suite with walk-in Italian closets',
                    'Private infinity pool with sanitary facilities',
                    'Bespoke fully fitted kitchen with Siemens appliances',
                    'Private 8-seat cinema room & integrated sound',
                    '2-room detached domestic staff quarters (BQ)',
                    '4-car covered parking with EV charging pre-wiring',
                    'Automated biometric perimeter and entrance doors',
                    'Industrial water filtration and solar inverter plant'
                  ].map(amenity => (
                    <div key={amenity} className="flex items-start gap-2.5 text-[14px] text-[#1b1416]">
                      <Check className="w-4 h-4 text-[#81141f] shrink-0 mt-0.5" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Title & Legal Due Diligence */}
              <div className="space-y-4">
                <h2 className="font-serif text-[24px] font-semibold text-[#1b1416]">
                  Title & legal documentation
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] flex items-start gap-3">
                    <FileCheck className="w-5 h-5 text-[#81141f] shrink-0 mt-0.5" />
                    <div className="text-[14px]">
                      <strong className="text-[#1b1416] block">{specs?.titleDocument || 'Certificate of Occupancy (C of O)'}</strong>
                      <span className="text-[#716769] mt-0.5 block">
                        Fully verified at the Federal Capital Development Authority (FCDA). Zero caveats, bank charges, or pending court injunctions.
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#81141f] shrink-0 mt-0.5" />
                    <div className="text-[14px]">
                      <strong className="text-[#1b1416] block">Building Plan Approval & Registered Survey</strong>
                      <span className="text-[#716769] mt-0.5 block">
                        Architectural, structural, and M&E approvals all cleared by urban development authorities.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-[20px] border border-[#eae3e4] p-7 shadow-xl space-y-6">
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#716769] font-medium block">
                    Outright sale price
                  </span>
                  <div className="font-sans font-bold text-[32px] sm:text-[38px] text-[#81141f] mt-1">
                    ₦{property.price.toLocaleString()}
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
                    onClick={() => setInspectionMode('virtual')}
                    className={`flex-1 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                      inspectionMode === 'virtual' ? 'bg-[#81141f] text-white shadow-xs' : 'text-[#716769] hover:text-[#1b1416]'
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
                        <option value="11:00 AM">11:00 AM (Morning)</option>
                        <option value="02:00 PM">02:00 PM (Afternoon)</option>
                        <option value="04:30 PM">04:30 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] text-[13px] text-[#716769] space-y-1">
                    <div className="flex justify-between">
                      <span>Agency viewing fee:</span>
                      <strong className="text-emerald-700">₦0 (Zero fee)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Surveyor accompaniment:</span>
                      <strong className="text-[#1b1416]">Allowed & Recommended</strong>
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
                    <span>Book private inspection</span>
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
                  Strictly by appointment. Licensed concierge greets you at the estate gate.
                </p>
              </div>
            </div>
          </div>

          {/* Similar properties */}
          {similarProperties.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#eae3e4]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-[28px] font-semibold text-[#1b1416]">
                    Similar prime properties for sale
                  </h3>
                  <p className="text-[14px] text-[#716769]">
                    Other verified residential and commercial opportunities in Abuja and Asaba.
                  </p>
                </div>
                <Link
                  href="/properties/buy"
                  className="hidden sm:inline-flex items-center gap-1 text-[14px] font-semibold text-[#81141f] hover:underline"
                >
                  <span>View all properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map(p => (
                  <CardProperty key={p.id} property={p} />
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
