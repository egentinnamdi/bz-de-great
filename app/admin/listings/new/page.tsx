'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  MapPin,
  Users,
  Settings,
  Fuel,
  ArrowRight,
  Upload,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';

export default function AdminAddListingPage() {
  const router = useRouter();
  const { addListing, addActivity } = useStore();
  const { toast } = useToast();

  // Form State matching Screenshot 4
  const [category, setCategory] = useState<'Car' | 'Property'>('Car');
  const [listingType, setListingType] = useState<'For rent' | 'For sale'>('For rent');
  const [title, setTitle] = useState('Toyota Land Cruiser 2023');
  const [location, setLocation] = useState('Garki, Abuja');
  const [price, setPrice] = useState('200,000');
  const [pricePeriod, setPricePeriod] = useState('Day');

  // Car Details
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Land Cruiser');
  const [year, setYear] = useState('2023');
  const [seats, setSeats] = useState('7');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuel, setFuel] = useState('Diesel');

  // Property Details (if property chosen)
  const [propType, setPropType] = useState('Duplex');
  const [bedrooms, setBedrooms] = useState('5');
  const [bathrooms, setBathrooms] = useState('6');

  // Photos
  const [photos, setPhotos] = useState<string[]>([
    '/photos/car-suv-white.jpg',
    '/photos/car-suv-grey.jpg',
    '/photos/car-sedan-black.jpg',
    '/photos/hero-villa-suv.jpg'
  ]);

  // Description
  const [description, setDescription] = useState(
    'Full-size SUV with leather seating for seven. Ideal for airport runs and family trips. Available self-drive or with a driver.'
  );

  // Publish Settings
  const [status, setStatus] = useState<'Live' | 'Draft'>('Live');
  const [featureOnHomepage, setFeatureOnHomepage] = useState(true);
  const [acceptBookings, setAcceptBookings] = useState(true);
  const [offerWithDriver, setOfferWithDriver] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const numericPrice = parseFloat(price.replace(/,/g, '')) || 200000;

    const newListing = addListing({
      category: category === 'Car' ? (listingType === 'For rent' ? 'car_rent' : 'car_sale') : (listingType === 'For rent' ? 'property_rent' : 'property_sale'),
      title,
      subtitle: `${make} ${model}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      price: numericPrice,
      currency: 'NGN',
      pricePeriod: listingType === 'For rent' ? '/day' : 'total',
      location,
      images: photos,
      status: status === 'Live' ? 'published' : 'draft',
      featured: featureOnHomepage,
      vehicleSpecs: category === 'Car' ? {
        make,
        model,
        year: parseInt(year) || 2023,
        transmission: transmission as any,
        seats: parseInt(seats) || 7,
        fuelType: fuel as any,
        driverOption: offerWithDriver ? 'Both' : 'Self-drive'
      } : undefined
    });

    addActivity({
      actorName: 'Operations Admin',
      actorRole: 'Inventory Desk',
      action: `Created new listing: ${title}`
    });

    toast({
      title: 'Listing published successfully',
      description: `${title} is now visible in the catalog.`,
      variant: 'default'
    });

    setIsSubmitting(false);
    router.push('/admin/listings');
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: `${title} saved to drafts.`,
      variant: 'default'
    });
    router.push('/admin/listings');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. TOP BAR (Figma: Top bar)
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] font-bold text-[#1b1416] tracking-tight">
            Add a listing
          </h1>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#716769] font-normal">
            <Link href="/admin/listings" className="hover:text-[#81141f]">
              Listings
            </Link>
            <span>›</span>
            <span className="text-[#1b1416] font-medium">New listing</span>
          </nav>
        </div>

        {/* Global Search + Notifications + Add Listing */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, listings, customers"
              className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>

          <div className="relative w-10 h-10 rounded-[8px] bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#81141f]" />
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="h-[40px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add listing</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. TWO-COLUMN GRID: Form (Left) & Publish/Preview (Right)
         ======================================================== */}
      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Form Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basics */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
            <h2 className="text-[18px] font-bold text-[#1b1416]">Basics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Category
                </label>
                <div className="flex items-center gap-2">
                  {(['Car', 'Property'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`h-[40px] px-5 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-[#81141f] text-white shadow-2xs'
                          : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listing type */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Listing type
                </label>
                <div className="flex items-center gap-2">
                  {(['For rent', 'For sale'] as const).map(lt => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setListingType(lt)}
                      className={`h-[40px] px-5 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer ${
                        listingType === lt
                          ? 'bg-[#81141f] text-white shadow-2xs'
                          : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]'
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#716769] block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                required
              />
            </div>

            {/* Location & Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full h-[46px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Price (₦)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Per
                </label>
                <input
                  type="text"
                  value={pricePeriod}
                  onChange={e => setPricePeriod(e.target.value)}
                  className="w-full h-[46px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors text-center"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Details (Car details / Property details) */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
            <h2 className="text-[18px] font-bold text-[#1b1416]">
              {category === 'Car' ? 'Car details' : 'Property details'}
            </h2>

            {category === 'Car' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Make</label>
                    <input
                      type="text"
                      value={make}
                      onChange={e => setMake(e.target.value)}
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Seats</label>
                    <input
                      type="text"
                      value={seats}
                      onChange={e => setSeats(e.target.value)}
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Transmission</label>
                    <div className="relative">
                      <select
                        value={transmission}
                        onChange={e => setTransmission(e.target.value)}
                        className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-8"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Fuel</label>
                    <div className="relative">
                      <select
                        value={fuel}
                        onChange={e => setFuel(e.target.value)}
                        className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-8"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#716769] block">Property Type</label>
                  <input
                    type="text"
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#716769] block">Bedrooms</label>
                  <input
                    type="text"
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#716769] block">Bathrooms</label>
                  <input
                    type="text"
                    value={bathrooms}
                    onChange={e => setBathrooms(e.target.value)}
                    className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Photos */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#1b1416]">Photos</h2>
              <span className="text-[12px] text-[#716769]">
                {photos.length} of 12 · drag to reorder
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {photos.map((src, index) => (
                <div
                  key={index}
                  className="relative w-24 h-20 rounded-[8px] overflow-hidden bg-slate-100 shrink-0 border border-[#eae3e4] group"
                >
                  <Image src={src} alt="Uploaded thumbnail" fill sizes="96px" className="object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[4px] bg-[#81141f] text-white text-[10px] font-bold uppercase tracking-wider">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Add Photos Button */}
              <label className="w-24 h-20 rounded-[8px] border-2 border-dashed border-[#ebc7cb] hover:border-[#81141f] bg-[#fbf3f4] flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors">
                <Upload className="w-4 h-4 text-[#81141f]" />
                <span className="text-[10px] font-bold text-[#81141f]">Add photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      toast({
                        title: 'Photo attached',
                        description: e.target.files[0].name,
                        variant: 'default'
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Card 4: Description */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <h2 className="text-[18px] font-bold text-[#1b1416]">Description</h2>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Publish Settings + Live Card Preview) (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Publish Settings */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
            <h2 className="text-[18px] font-bold text-[#1b1416]">Publish</h2>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#716769] block">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] font-semibold focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-8"
                >
                  <option value="Live">Live</option>
                  <option value="Draft">Draft</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Toggle 1: Feature on homepage */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-[13px] font-semibold text-[#1b1416]">Feature on homepage</div>
                <div className="text-[11px] text-[#716769]">Shows in “Ready when you are”</div>
              </div>
              <button
                type="button"
                onClick={() => setFeatureOnHomepage(!featureOnHomepage)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  featureOnHomepage ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    featureOnHomepage ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Accept bookings */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-[13px] font-semibold text-[#1b1416]">Accept bookings</div>
                <div className="text-[11px] text-[#716769]">Customers can request dates</div>
              </div>
              <button
                type="button"
                onClick={() => setAcceptBookings(!acceptBookings)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  acceptBookings ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    acceptBookings ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Offer with driver */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-[13px] font-semibold text-[#1b1416]">Offer with driver</div>
                <div className="text-[11px] text-[#716769]">Adds the driver option</div>
              </div>
              <button
                type="button"
                onClick={() => setOfferWithDriver(!offerWithDriver)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  offerWithDriver ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    offerWithDriver ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[46px] rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Publish listing</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full h-[44px] rounded-[8px] bg-white border border-[#eae3e4] hover:bg-[#f8f5f5] text-[#1b1416] font-semibold text-[13px] flex items-center justify-center transition-colors cursor-pointer"
              >
                Save draft
              </button>
            </div>
          </div>

          {/* Card 2: Live Preview Card */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-5 shadow-xs space-y-4">
            <h3 className="text-[14px] font-bold text-[#716769] uppercase tracking-wider">
              Preview
            </h3>

            {/* Rendered Preview Card (Figma: Card/Car) */}
            <div className="rounded-[14px] border border-[#eae3e4] overflow-hidden bg-white shadow-2xs">
              <div className="relative h-[180px] w-full bg-slate-100">
                <Image
                  src={photos[0] || '/photos/car-suv-white.jpg'}
                  alt={title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#1b1416] text-[11px] font-bold uppercase tracking-wider shadow-xs">
                  {listingType}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-[16px] text-[#1b1416] leading-tight">
                    {title || 'Toyota Land Cruiser 2023'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#716769] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#716769]" />
                    <span>{location || 'Garki, Abuja'}</span>
                  </div>
                </div>

                {/* Specs Row */}
                {category === 'Car' ? (
                  <div className="flex items-center gap-3 text-[11px] text-[#4a4245] pt-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#716769]" />
                      <span>{seats} seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5 text-[#716769]" />
                      <span>{transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-[#716769]" />
                      <span>{fuel}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[11px] text-[#4a4245] pt-1">
                    <span>{bedrooms} beds</span>
                    <span>·</span>
                    <span>{bathrooms} baths</span>
                    <span>·</span>
                    <span>{propType}</span>
                  </div>
                )}

                <div className="h-[1px] bg-[#eae3e4] w-full" />

                {/* Price Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[16px] font-bold text-[#1b1416]">
                      ₦{price || '200,000'}
                    </span>
                    <span className="text-[12px] text-[#716769] ml-1">
                      / {pricePeriod || 'day'}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#81141f]">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
