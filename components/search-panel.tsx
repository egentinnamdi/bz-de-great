'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, ChevronDown, ArrowRight, Search, Car, Building2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchMode = 'rent' | 'buy';
export type SearchCategory = 'cars' | 'houses' | 'apartments' | 'land';

export function SearchPanel({ className }: { className?: string }) {
  const router = useRouter();

  const [mode, setMode] = useState<SearchMode>('rent');
  const [category, setCategory] = useState<SearchCategory>('cars');

  // Search keyword (e.g. "G-Wagon", "Maitama Penthouse")
  const [query, setQuery] = useState('');

  // Location filter
  const [location, setLocation] = useState('Abuja, FCT');

  // Car Rental dates (Default to today and 3 days from today)
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const threeDaysDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const threeDaysStr = threeDaysDate.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(threeDaysStr);
  const [driverOption, setDriverOption] = useState<'All' | 'Self-drive' | 'Chauffeured'>('All');

  // Car Sale options
  const [carBrand, setCarBrand] = useState('all');
  const [carCondition, setCarCondition] = useState('all');

  // Property options
  const [bedrooms, setBedrooms] = useState('Any');
  const [requirement, setRequirement] = useState('all');
  const [landType, setLandType] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Query keyword if typed
    if (query.trim()) {
      params.set('q', query.trim());
    }

    // Location
    if (location && location !== 'Abuja, FCT') {
      params.set('location', location);
    }

    if (category === 'cars') {
      if (mode === 'rent') {
        if (driverOption !== 'All') {
          params.set('driver', driverOption);
        }
        if (pickupDate) params.set('pickup', pickupDate);
        if (returnDate) params.set('return', returnDate);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        router.push(`/cars/rent${queryStr}`);
      } else {
        if (carBrand !== 'all') params.set('brand', carBrand);
        if (carCondition !== 'all') params.set('condition', carCondition);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        router.push(`/cars/buy${queryStr}`);
      }
    } else if (category === 'land') {
      params.set('type', 'Land');
      if (landType !== 'all') params.set('landType', landType);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      router.push(`/properties/buy${queryStr}`);
    } else {
      // Houses or Apartments
      const propType = category === 'apartments' ? 'Apartment' : 'Duplex';
      params.set('type', propType);

      if (bedrooms !== 'Any') {
        params.set('beds', bedrooms);
      }
      if (requirement !== 'all') {
        params.set('req', requirement);
      }

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      if (mode === 'rent') {
        router.push(`/homes/rent${queryStr}`);
      } else {
        router.push(`/properties/buy${queryStr}`);
      }
    }
  };

  const getButtonLabel = () => {
    if (category === 'cars') return mode === 'rent' ? 'Search rental cars' : 'Search showroom cars';
    if (category === 'houses') return mode === 'rent' ? 'Search rental houses' : 'Search houses for sale';
    if (category === 'apartments') return mode === 'rent' ? 'Search apartments' : 'Search apartments for sale';
    return 'Search land & plots';
  };

  return (
    <div
      className={cn(
        'w-full max-w-[1200px] rounded-2xl bg-white p-5 lg:p-6 shadow-xl border border-[#eae3e4]',
        className
      )}
    >
      {/* 1. Mode and Category Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae3e4]/60">
        {/* Rent / Buy Pill Switcher */}
        <div className="inline-flex items-center h-10 rounded-xl bg-[#f8f5f5] p-1 self-start border border-[#eae3e4]/60">
          <button
            type="button"
            onClick={() => setMode('rent')}
            className={cn(
              'h-8 px-5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'rent'
                ? 'bg-[#7A0C1A] text-white shadow-xs'
                : 'text-[#716769] hover:text-[#1b1416]'
            )}
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => setMode('buy')}
            className={cn(
              'h-8 px-5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              mode === 'buy'
                ? 'bg-[#7A0C1A] text-white shadow-xs'
                : 'text-[#716769] hover:text-[#1b1416]'
            )}
          >
            Buy
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory('cars')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
              category === 'cars'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('houses')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
              category === 'houses'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Houses</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('apartments')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
              category === 'apartments'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Apartments</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCategory('land');
              setMode('buy');
            }}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              category === 'land'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            Land &amp; plots
          </button>
        </div>
      </div>

      {/* 2. Form Input Grid */}
      <form onSubmit={handleSearch} className="mt-4 space-y-3">
        {/* Quick Keyword Search Row */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              category === 'cars'
                ? 'Search by model, brand or keyword (e.g. Mercedes G-Wagon, Land Cruiser, Rolls-Royce)...'
                : 'Search by keyword, estate or feature (e.g. Maitama Penthouse, Swimming Pool, Diplomatic Zone)...'
            }
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#eae3e4] bg-[#faf7f7]/60 text-xs text-[#1b1416] placeholder:text-[#716769] focus:outline-none focus:border-[#7A0C1A] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Location Field */}
          <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
            <span className="text-[11px] font-medium text-[#716769]">Prime Location</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 w-full">
                <MapPin className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none pr-4 w-full truncate"
                >
                  <option value="Abuja, FCT">All Abuja</option>
                  <option value="Maitama, Abuja">Maitama, Abuja</option>
                  <option value="Asokoro, Abuja">Asokoro, Abuja</option>
                  <option value="Wuse 2, Abuja">Wuse 2, Abuja</option>
                  <option value="Jabi, Abuja">Jabi, Abuja</option>
                  <option value="Guzape, Abuja">Guzape, Abuja</option>
                  <option value="Gwarinpa, Abuja">Gwarinpa, Abuja</option>
                  <option value="Katampe, Abuja">Katampe Extension, Abuja</option>
                </select>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
            </div>
          </div>

          {/* Conditional Filters based on Category & Mode */}
          {category === 'cars' ? (
            mode === 'rent' ? (
              <>
                {/* Pick-up Date Input */}
                <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-3.5 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                  <span className="text-[11px] font-medium text-[#716769]">Pick-up date</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                    <input
                      type="date"
                      value={pickupDate}
                      min={todayStr}
                      onChange={e => setPickupDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer w-full"
                    />
                  </div>
                </div>

                {/* Return Date Input */}
                <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-3.5 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                  <span className="text-[11px] font-medium text-[#716769]">Return date</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                    <input
                      type="date"
                      value={returnDate}
                      min={pickupDate || todayStr}
                      onChange={e => setReturnDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer w-full"
                    />
                  </div>
                </div>

                {/* Driver Option */}
                <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                  <span className="text-[11px] font-medium text-[#716769]">Driver</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                      <Users className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                      <select
                        value={driverOption}
                        onChange={e => setDriverOption(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none pr-4 w-full"
                      >
                        <option value="All">All Drivers</option>
                        <option value="Self-drive">Self-drive</option>
                        <option value="Chauffeured">Chauffeured</option>
                      </select>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Car Brand */}
                <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                  <span className="text-[11px] font-medium text-[#716769]">Make &amp; Brand</span>
                  <div className="flex items-center justify-between">
                    <select
                      value={carBrand}
                      onChange={e => setCarBrand(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none w-full"
                    >
                      <option value="all">All Makes</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Land Rover">Land Rover</option>
                      <option value="Rolls-Royce">Rolls-Royce</option>
                      <option value="BMW">BMW</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* Car Condition */}
                <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                  <span className="text-[11px] font-medium text-[#716769]">Condition</span>
                  <div className="flex items-center justify-between">
                    <select
                      value={carCondition}
                      onChange={e => setCarCondition(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none w-full"
                    >
                      <option value="all">All Conditions</option>
                      <option value="Brand New">Brand New</option>
                      <option value="Foreign Used">Foreign Used (Tokunbo)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                  </div>
                </div>
              </>
            )
          ) : category === 'land' ? (
            <>
              {/* Land Zoning / Type */}
              <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Zoning / Land Use</span>
                <div className="flex items-center justify-between">
                  <select
                    value={landType}
                    onChange={e => setLandType(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none w-full"
                  >
                    <option value="all">All Zoning Types</option>
                    <option value="Residential">Residential Plot</option>
                    <option value="Commercial">Commercial Land</option>
                    <option value="Mixed Use">Mixed Use</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                </div>
              </div>

              {/* Title Document */}
              <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Title Deed</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1b1416]">C of O / Gov. Consent</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Bedrooms */}
              <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Bedrooms</span>
                <div className="flex items-center justify-between">
                  <select
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none w-full"
                  >
                    <option value="Any">Any bedrooms</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                </div>
              </div>

              {/* Requirement */}
              <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Requirement</span>
                <div className="flex items-center justify-between">
                  <select
                    value={requirement}
                    onChange={e => setRequirement(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none w-full"
                  >
                    <option value="all">Any Requirement</option>
                    <option value="Fully Serviced">Fully Serviced</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Newly Built">Newly Built</option>
                    <option value="Swimming Pool">Swimming Pool</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none shrink-0" />
                </div>
              </div>
            </>
          )}

          {/* Search Action Button */}
          <div className="lg:col-span-3 h-16 flex items-center justify-end">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#7A0C1A] hover:bg-[#600814] active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>{getButtonLabel()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
