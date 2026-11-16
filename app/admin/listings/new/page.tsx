'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ChevronDown,
  Trash2,
  Camera,
  X,
  Check,
  Lock,
  Building2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { Listing, ListingCategory } from '@/lib/types';
import { NIGERIA_STATES, inferStateFromLocation } from '@/lib/locations';
import { isMasterAdmin } from '@/lib/staff';
import { compressImageForUpload, formatBytesCompact } from '@/lib/image-upload';
import { supabaseService } from '@/lib/supabase/service';
import { AdminRowsSkeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

function AddListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { listings, branchOffices, addListing, updateListing, addActivity, isLoading } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const master = isMasterAdmin(user);
  const allowedCats: ListingCategory[] = user?.allowedCategories?.length
    ? user.allowedCategories
    : ['car_sale', 'car_rent', 'property_rent', 'property_sale'];

  const allowCar = allowedCats.includes('car_sale') || allowedCats.includes('car_rent');
  const allowProperty = allowedCats.includes('property_sale') || allowedCats.includes('property_rent');
  const allowedStates =
    master || !user?.assignedStates?.length || user.assignedStates.includes('ALL')
      ? NIGERIA_STATES.map(s => s.value)
      : user.assignedStates;

  // Form State
  const [category, setCategory] = useState<'Car' | 'Property'>(allowCar ? 'Car' : 'Property');
  const [listingType, setListingType] = useState<'For rent' | 'For sale'>(
    allowedCats.includes('car_sale') && !allowedCats.includes('car_rent') ? 'For sale' : 'For rent'
  );
  const [title, setTitle] = useState('');
  const [stateName, setStateName] = useState<string>(allowedStates[0] || 'FCT Abuja');
  const [location, setLocation] = useState('');
  const [branchOffice, setBranchOffice] = useState(user?.branchOffice || '');
  const [price, setPrice] = useState('');
  const [partnerNetPrice, setPartnerNetPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState('day');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Car Details
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [seats, setSeats] = useState('');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuel, setFuel] = useState('Petrol');

  // Property Details
  const [propType, setPropType] = useState<'House' | 'Apartment' | 'Duplex' | 'Land & plots'>('House');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  // Photos - Starts completely empty
  const [photos, setPhotos] = useState<string[]>([]);

  // Description
  const [description, setDescription] = useState('');

  // Publish Settings
  const [status, setStatus] = useState<'Live' | 'Draft'>('Live');
  const [featureOnHomepage, setFeatureOnHomepage] = useState(false);
  const [acceptBookings, setAcceptBookings] = useState(true);
  const [offerWithDriver, setOfferWithDriver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default state & allowed category/mode for scoped partners when not editing
  useEffect(() => {
    if (editId || !user) return;
    if (!master && user.assignedStates.length > 0 && !user.assignedStates.includes('ALL')) {
      setStateName(user.assignedStates[0]);
    }
    if (user.branchOffice) {
      setBranchOffice(user.branchOffice);
    }
    if (!allowCar && allowProperty) {
      setCategory('Property');
    } else if (allowCar && !allowProperty) {
      setCategory('Car');
    }
  }, [editId, user, master, allowCar, allowProperty]);

  // Keep listingType valid for selected Category
  useEffect(() => {
    const rentCat: ListingCategory = category === 'Car' ? 'car_rent' : 'property_rent';
    const saleCat: ListingCategory = category === 'Car' ? 'car_sale' : 'property_sale';
    const canRent = allowedCats.includes(rentCat);
    const canSale = allowedCats.includes(saleCat);
    if (listingType === 'For rent' && !canRent && canSale) {
      setListingType('For sale');
    } else if (listingType === 'For sale' && !canSale && canRent) {
      setListingType('For rent');
    }
  }, [category, listingType, allowedCats]);

  // Pre-load data if in edit mode (?edit=id)
  useEffect(() => {
    if (editId) {
      const existing = listings.find(l => l.id === editId);
      if (existing) {
        const isCar = existing.category.startsWith('car');
        const isRent = existing.category.includes('rent');

        setCategory(isCar ? 'Car' : 'Property');
        setListingType(isRent ? 'For rent' : 'For sale');
        setTitle(existing.title || '');
        setLocation(existing.location || '');
        setStateName(existing.state || inferStateFromLocation(existing.location));
        setBranchOffice(existing.branchOffice || user?.branchOffice || '');
        setPrice(existing.price ? Number(existing.price).toLocaleString('en-NG') : '');
        setPartnerNetPrice(
          existing.partnerNetPrice ? Number(existing.partnerNetPrice).toLocaleString('en-NG') : ''
        );
        setPricePeriod(existing.pricePeriod === '/day' ? 'day' : existing.pricePeriod === '/year' ? 'year' : 'total');
        setPhotos(existing.images || []);
        setDescription(existing.description || '');
        setStatus(existing.status === 'published' ? 'Live' : 'Draft');
        setFeatureOnHomepage(Boolean(existing.featured));

        if (isCar && existing.vehicleSpecs) {
          setMake(existing.vehicleSpecs.make || '');
          setModel(existing.vehicleSpecs.model || '');
          setYear(existing.vehicleSpecs.year ? String(existing.vehicleSpecs.year) : '');
          setSeats(existing.vehicleSpecs.seats ? String(existing.vehicleSpecs.seats) : '');
          setTransmission(existing.vehicleSpecs.transmission || 'Automatic');
          setFuel(existing.vehicleSpecs.fuelType || 'Petrol');
          setOfferWithDriver(existing.vehicleSpecs.driverOption === 'Both' || existing.vehicleSpecs.driverOption === 'Chauffeured');
        } else if (!isCar && existing.propertySpecs) {
          setPropType(existing.propertySpecs.type || 'House');
          setBedrooms(existing.propertySpecs.bedrooms ? String(existing.propertySpecs.bedrooms) : '');
          setBathrooms(existing.propertySpecs.bathrooms ? String(existing.propertySpecs.bathrooms) : '');
        }
      }
    }
  }, [editId, listings]);

  // Handle Photo Upload with automatic mobile compression & Supabase Storage upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selected = Array.from(files).slice(0, Math.max(1, 12 - photos.length));
    setIsUploadingPhotos(true);
    let savedBytes = 0;

    try {
      const uploadedUrls = await Promise.all(
        selected.map(async file => {
          const compressed = await compressImageForUpload(file, 1400, 0.8);
          if (compressed.usedCompression) {
            savedBytes += compressed.originalBytes - compressed.compressedBytes;
          }
          return supabaseService.uploadListingPhoto(compressed.blob, compressed.filename);
        })
      );

      setPhotos(prev => [...prev, ...uploadedUrls].slice(0, 12));
      toast({
        title: `${uploadedUrls.length} photo(s) uploaded`,
        description:
          savedBytes > 0
            ? `Compressed to save ${formatBytesCompact(savedBytes)} for fast 4G upload.`
            : 'Photos attached and ready to publish.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Photo upload issue',
        description: 'Some photos could not be processed. Try smaller JPEG/PNG files.',
        variant: 'error',
      });
    } finally {
      setIsUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMakeCoverPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos(prev => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    toast({
      title: 'Cover photo set',
      description: 'The selected image is now the primary card cover.',
      variant: 'info'
    });
  };

  // Build the Listing Payload
  const buildListingPayload = (publishStatus: 'published' | 'draft'): Omit<Listing, 'id' | 'createdAt'> => {
    const numericPrice = parseFloat(price.replace(/,/g, '')) || 0;
    const numericNet = parseFloat(partnerNetPrice.replace(/,/g, '')) || 0;
    const computedSlug = (title || 'listing')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const resolvedCategory =
      category === 'Car'
        ? listingType === 'For rent'
          ? 'car_rent'
          : 'car_sale'
        : listingType === 'For rent'
        ? 'property_rent'
        : 'property_sale';

    const cleanLoc = location.trim();
    const shortState = stateName.replace(' State', '');
    const formattedLocation = cleanLoc
      ? cleanLoc.toLowerCase().includes(shortState.toLowerCase())
        ? cleanLoc
        : `${cleanLoc}, ${shortState}`
      : stateName;

    const needsOwnerApproval =
      publishStatus === 'published' && Boolean(user?.requireApprovalBeforeLive) && !master;

    return {
      category: resolvedCategory,
      title: title.trim() || (publishStatus === 'draft' ? 'Untitled Draft' : 'New Listing'),
      subtitle: category === 'Car' ? `${make} ${model}`.trim() || undefined : undefined,
      slug: computedSlug,
      description: description.trim(),
      price: numericPrice,
      currency: 'NGN',
      pricePeriod: listingType === 'For rent' ? (pricePeriod.toLowerCase().includes('year') ? '/year' : '/day') : 'total',
      location: formattedLocation,
      state: stateName,
      branchOffice: branchOffice.trim() || user?.branchOffice || `${shortState} Branch`,
      createdById: user?.id,
      createdByName: user?.name || 'Admin',
      partnerNetPrice: numericNet > 0 ? numericNet : undefined,
      requiresApproval: needsOwnerApproval,
      images: photos.length > 0 ? photos : ['/photos/car-suv-white.jpg'],
      status: needsOwnerApproval ? 'draft' : publishStatus,
      featured: master ? featureOnHomepage : false,
      vehicleSpecs:
        category === 'Car'
          ? {
              make: make.trim() || 'Vehicle',
              model: model.trim() || 'Model',
              year: parseInt(year) || new Date().getFullYear(),
              transmission: (transmission as any) || 'Automatic',
              seats: parseInt(seats) || 5,
              fuelType: (fuel as any) || 'Petrol',
              driverOption: offerWithDriver ? 'Both' : 'Self-drive'
            }
          : undefined,
      propertySpecs:
        category === 'Property'
          ? {
              type: propType,
              bedrooms: parseInt(bedrooms) || undefined,
              bathrooms: parseInt(bathrooms) || undefined,
              amenities: ['24/7 Security', 'Serviced', 'Parking']
            }
          : undefined
    };
  };

  // End-to-end Publish Listing
  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !price.trim()) {
      toast({
        title: 'Missing required details',
        description: 'Please provide Title, Location, and Price before publishing.',
        variant: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildListingPayload('published');
      const actorName = user?.name || 'Admin';
      const actorRole = `${user?.role || 'Master Admin'} · ${payload.state}`;

      if (editId) {
        await updateListing(editId, payload);
        await addActivity({
          actorName,
          actorRole,
          action: `updated listing (${payload.state}): ${payload.title}`,
          target: payload.title,
          category: 'listings'
        });
        toast({
          title: 'Listing updated successfully',
          description: `${payload.title} has been updated live on the website.`,
          variant: 'success'
        });
      } else {
        const created = await addListing(payload);
        await addActivity({
          actorName,
          actorRole,
          action: payload.requiresApproval
            ? `submitted listing for approval (${payload.state}): ${payload.title}`
            : `published new listing (${payload.state}): ${payload.title}`,
          target: payload.title,
          category: 'listings'
        });
        toast({
          title: payload.requiresApproval ? 'Submitted for Master Approval' : 'Listing published live',
          description: payload.requiresApproval
            ? `${created.title} has been sent to Owner for quick sign-off.`
            : `${created.title} (${payload.state}) is now live on the website.`,
          variant: 'success'
        });
      }

      router.push('/admin/listings');
    } catch (err) {
      toast({
        title: 'Error publishing listing',
        description: 'Unable to save the listing to inventory.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // End-to-end Save Draft
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildListingPayload('draft');
      const actorName = user?.name || 'Admin';
      const actorRole = `${user?.role || 'Master Admin'} · ${payload.state}`;

      if (editId) {
        await updateListing(editId, payload);
        await addActivity({
          actorName,
          actorRole,
          action: `saved draft for: ${payload.title}`,
          target: payload.title,
          category: 'listings'
        });
      } else {
        await addListing(payload);
        await addActivity({
          actorName,
          actorRole,
          action: `saved new draft listing (${payload.state}): ${payload.title}`,
          target: payload.title,
          category: 'listings'
        });
      }

      toast({
        title: 'Draft saved successfully',
        description: `${payload.title} saved to drafts. It will not appear publicly until published.`,
        variant: 'default'
      });

      router.push('/admin/listings');
    } catch (err) {
      toast({
        title: 'Error saving draft',
        description: 'Could not store listing draft.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (editId && isLoading && !listings.some(l => l.id === editId)) {
    return (
      <div className="space-y-6">
        <div className="text-sm font-medium text-[#716769]">Loading listing details from backend...</div>
        <AdminRowsSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] font-bold text-[#1b1416] tracking-tight">
            {editId ? 'Edit listing' : 'Add a listing'}
          </h1>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#716769] font-normal">
            <Link href="/admin/listings" className="hover:text-[#81141f]">
              Listings
            </Link>
            <span>›</span>
            <span className="text-[#1b1416] font-medium">
              {editId ? 'Edit listing' : 'New listing'}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, listings, customers"
              className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div className="relative w-10 h-10 rounded-[8px] bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] cursor-pointer">
            <Bell className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form (8 Cols) + Right Sidebar (4 Cols) */}
      <form onSubmit={handlePublishListing} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Inputs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 0: Branch / Stand Scope Banner for Regional & Stand Reps */}
          {user && !master && (
            <div className="rounded-[14px] bg-[#fbf3f4] border border-[#ebc7cb] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#81141f] text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#81141f]">
                  Uploading for {user.branchOffice} ({user.assignedStates.join(', ')})
                </div>
                <div className="text-[#4a4245]">
                  Posted under <strong>{user.name}</strong> ·{' '}
                  {user.requireApprovalBeforeLive
                    ? 'Submitted for Owner approval before appearing live.'
                    : 'Publishes live immediately and notifies Master Admin when marked Sold.'}
                </div>
              </div>
            </div>
          )}

          {/* Card 1: Basics */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
            <h2 className="text-[18px] font-bold text-[#1b1416]">Basics</h2>

            {/* Category & Listing Type Toggles (Respecting Role Scope) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">Category</label>
                <div className="flex items-center gap-2">
                  {(['Car', 'Property'] as const).map(cat => {
                    const permitted = cat === 'Car' ? allowCar : allowProperty;
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={!permitted}
                        onClick={() => permitted && setCategory(cat)}
                        className={cn(
                          'h-[40px] px-5 rounded-[8px] text-[13px] font-semibold transition-all',
                          !permitted && 'opacity-40 cursor-not-allowed',
                          permitted && 'cursor-pointer',
                          category === cat
                            ? 'bg-[#81141f] text-white shadow-2xs'
                            : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]'
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">Listing type</label>
                <div className="flex items-center gap-2">
                  {(['For rent', 'For sale'] as const).map(lt => {
                    const needed: ListingCategory =
                      category === 'Car'
                        ? lt === 'For rent'
                          ? 'car_rent'
                          : 'car_sale'
                        : lt === 'For rent'
                          ? 'property_rent'
                          : 'property_sale';
                    const permitted = allowedCats.includes(needed);
                    return (
                      <button
                        key={lt}
                        type="button"
                        disabled={!permitted}
                        onClick={() => permitted && setListingType(lt)}
                        className={cn(
                          'h-[40px] px-5 rounded-[8px] text-[13px] font-semibold transition-all',
                          !permitted && 'opacity-40 cursor-not-allowed',
                          permitted && 'cursor-pointer',
                          listingType === lt
                            ? 'bg-[#81141f] text-white shadow-2xs'
                            : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]'
                        )}
                      >
                        {lt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#716769] block">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={category === 'Car' ? 'e.g. 2021 Lexus RX 350 F-Sport' : 'e.g. 5-Bedroom Detached Villa'}
                className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
              />
            </div>

            {/* State & Car Stand / Branch Office Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Nigerian State *
                </label>
                <div className="relative">
                  <select
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    disabled={!master && allowedStates.length === 1}
                    className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer disabled:bg-[#fbf3f4] disabled:text-[#81141f] disabled:border-[#ebc7cb]"
                  >
                    {allowedStates.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Car Stand / Branch Office
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    list={master ? 'branch-offices-datalist' : undefined}
                    value={branchOffice}
                    onChange={e => setBranchOffice(e.target.value)}
                    placeholder="e.g. Awka Car Stand · Aroma"
                    readOnly={!master}
                    className="w-full h-[46px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] read-only:bg-[#f8f5f5]"
                  />
                  {master && (
                    <datalist id="branch-offices-datalist">
                      {branchOffices
                        .filter(b => b.isActive !== false)
                        .map(b => (
                          <option key={b.id} value={b.name}>
                            {b.city}, {b.state}
                          </option>
                        ))}
                    </datalist>
                  )}
                </div>
              </div>
            </div>

            {/* Area/Location & Prices Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  City / Exact Stand Area *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Aroma Junction, Awka or Okpanam Rd, Asaba"
                    className="w-full h-[46px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Public Price (₦) *
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 54,000,000"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block">
                  Per
                </label>
                <input
                  type="text"
                  value={listingType === 'For sale' ? 'total' : pricePeriod}
                  onChange={e => setPricePeriod(e.target.value)}
                  disabled={listingType === 'For sale'}
                  placeholder="day"
                  className="w-full h-[46px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors text-center disabled:bg-stone-50"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[12px] font-semibold text-[#716769] block truncate" title="Internal partner/stand cost — never shown publicly">
                  Stand Net (₦)
                </label>
                <input
                  type="text"
                  value={partnerNetPrice}
                  onChange={e => setPartnerNetPrice(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-[46px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
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
                      placeholder="e.g. Toyota"
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      placeholder="e.g. Land Cruiser"
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#716769] block">Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      placeholder="e.g. 2023"
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
                      placeholder="e.g. 7"
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
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
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
                  <div className="relative">
                    <select
                      value={propType}
                      onChange={e => setPropType(e.target.value as any)}
                      className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-8"
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Land & plots">Land & plots</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#716769] block">Bedrooms</label>
                  <input
                    type="text"
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#716769] block">Bathrooms</label>
                  <input
                    type="text"
                    value={bathrooms}
                    onChange={e => setBathrooms(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full h-[44px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Photos (Mobile Camera + Auto-Compressed Storage Upload) */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[18px] font-bold text-[#1b1416] flex items-center gap-2">
                  <span>Photos</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    4G Compressed
                  </span>
                </h2>
                <p className="text-[12px] text-[#716769]">
                  {photos.length} of 12 uploaded · Snap directly from phone camera or select multiple gallery images
                </p>
              </div>

              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPhotos([])}
                  className="text-[11px] text-rose-600 hover:underline shrink-0 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {photos.map((src, index) => (
                <div
                  key={index}
                  onClick={() => handleMakeCoverPhoto(index)}
                  className="relative w-24 h-20 rounded-[8px] overflow-hidden bg-slate-100 shrink-0 border border-[#eae3e4] group cursor-pointer transition-transform hover:scale-105"
                  title={index === 0 ? 'Primary cover image' : 'Click to set as cover'}
                >
                  <img
                    src={src}
                    alt={`Listing photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[4px] bg-[#81141f] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      Cover
                    </span>
                  ) : (
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      Set cover
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Camera Photo Button (Mobile Friendly) */}
              <button
                type="button"
                disabled={isUploadingPhotos || photos.length >= 12}
                onClick={() => cameraInputRef.current?.click()}
                className="w-24 h-20 rounded-[8px] border-2 border-dashed border-[#ebc7cb] hover:border-[#81141f] bg-[#fbf3f4] flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors disabled:opacity-50"
              >
                {isUploadingPhotos ? (
                  <Loader2 className="w-4 h-4 text-[#81141f] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-[#81141f]" />
                )}
                <span className="text-[10px] font-bold text-[#81141f]">Take photo</span>
              </button>

              {/* Gallery Upload Button */}
              <button
                type="button"
                disabled={isUploadingPhotos || photos.length >= 12}
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-20 rounded-[8px] border-2 border-dashed border-[#eae3e4] hover:border-[#81141f] bg-[#faf8f8] flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#4a4245]" />
                <span className="text-[10px] font-bold text-[#4a4245]">Gallery</span>
              </button>
            </div>
          </div>

          {/* Card 4: Description */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <h2 className="text-[18px] font-bold text-[#1b1416]">Description</h2>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide key details, condition, terms, and luxury features of this asset..."
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

            {/* Toggle 1: Feature on homepage (Master Admin only) */}
            {master && (
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
            )}

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
            {category === 'Car' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-[13px] font-semibold text-[#1b1416]">Offer with driver</div>
                  <div className="text-[11px] text-[#716769]">Adds chauffeured option</div>
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
            )}

            {/* Action Buttons: Publish listing and Save draft */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhotos}
                className="w-full h-[46px] rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isUploadingPhotos
                    ? 'Uploading photos...'
                    : isSubmitting
                      ? 'Saving...'
                      : editId
                        ? 'Update listing'
                        : user?.requireApprovalBeforeLive && !master
                          ? 'Submit for Owner Approval'
                          : 'Publish listing live'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isUploadingPhotos}
                className="w-full h-[44px] rounded-[8px] bg-white border border-[#eae3e4] hover:bg-[#f8f5f5] text-[#1b1416] font-semibold text-[13px] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                Save draft
              </button>
            </div>
          </div>

          {/* Card 2: Live Preview Card (Updates dynamically in real time) */}
          <div className="bg-white rounded-[16px] border border-[#eae3e4] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#716769] uppercase tracking-wider">
                Preview
              </h3>
              <span className="text-[11px] text-[#81141f] font-semibold">Live update</span>
            </div>

            {/* Rendered Preview Card */}
            <div className="rounded-[14px] border border-[#eae3e4] overflow-hidden bg-white shadow-2xs">
              {photos.length > 0 ? (
                <div className="relative h-[180px] w-full bg-slate-100">
                  <img
                    src={photos[0]}
                    alt={title || 'Listing Preview'}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#1b1416] text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {listingType}
                  </span>
                </div>
              ) : (
                <div className="relative h-[180px] w-full bg-stone-100 flex flex-col items-center justify-center text-[#716769] gap-1.5 border-b border-[#eae3e4]">
                  <Camera className="w-8 h-8 text-[#a8a1a3]" />
                  <span className="text-xs font-medium text-[#716769]">Add photos to preview asset</span>
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#1b1416] text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {listingType}
                  </span>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-[16px] text-[#1b1416] leading-tight">
                    {title || 'Listing Title Preview'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#716769] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#716769]" />
                    <span>{location || 'Location Preview'}</span>
                  </div>
                </div>

                {/* Specs Row */}
                {category === 'Car' ? (
                  <div className="flex items-center gap-3 text-[11px] text-[#4a4245] pt-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#716769]" />
                      <span>{seats || '5'} seats</span>
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
                    <span>{bedrooms || '—'} beds</span>
                    <span>·</span>
                    <span>{bathrooms || '—'} baths</span>
                    <span>·</span>
                    <span>{propType}</span>
                  </div>
                )}

                <div className="h-[1px] bg-[#eae3e4] w-full" />

                {/* Price Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[16px] font-bold text-[#1b1416]">
                      ₦{price || '0'}
                    </span>
                    {listingType === 'For rent' && (
                      <span className="text-[12px] text-[#716769] ml-1">
                        / {pricePeriod || 'day'}
                      </span>
                    )}
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

export default function AdminAddListingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#716769]">Loading listing editor...</div>}>
      <AddListingForm />
    </Suspense>
  );
}
