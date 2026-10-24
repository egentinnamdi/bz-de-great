'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchMode = 'rent' | 'buy';
export type SearchCategory = 'cars' | 'houses' | 'apartments' | 'land';

export function SearchPanel({ className }: { className?: string }) {
  const router = useRouter();

  const [mode, setMode] = useState<SearchMode>('rent');
  const [category, setCategory] = useState<SearchCategory>('cars');

  // Form states
  const [location, setLocation] = useState('Abuja, FCT');
  const [pickupDate, setPickupDate] = useState('2026-10-24');
  const [returnDate, setReturnDate] = useState('2026-10-27');
  const [driverOption, setDriverOption] = useState<'Self-drive' | 'Chauffeured'>('Self-drive');
  const [bedrooms, setBedrooms] = useState('Any');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (category === 'cars') {
      if (mode === 'rent') {
        router.push(`/cars/rent?location=${encodeURIComponent(location)}&driver=${driverOption}`);
      } else {
        router.push(`/cars/buy?location=${encodeURIComponent(location)}`);
      }
    } else if (category === 'land') {
      router.push(`/properties/buy?type=Land`);
    } else {
      if (mode === 'rent') {
        router.push(`/homes/rent?location=${encodeURIComponent(location)}&beds=${bedrooms}`);
      } else {
        router.push(`/properties/buy?location=${encodeURIComponent(location)}&beds=${bedrooms}`);
      }
    }
  };

  const getButtonLabel = () => {
    if (category === 'cars') return 'Search cars';
    if (category === 'houses') return 'Search houses';
    if (category === 'apartments') return 'Search apartments';
    return 'Search land';
  };

  return (
    <div
      className={cn(
        'w-full max-w-[1200px] rounded-2xl bg-white p-5 lg:p-6 shadow-xl border border-[#eae3e4]',
        className
      )}
    >
      {/* 1. Mode and Category Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
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
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              category === 'cars'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            Cars
          </button>
          <button
            type="button"
            onClick={() => setCategory('houses')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              category === 'houses'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            Houses
          </button>
          <button
            type="button"
            onClick={() => setCategory('apartments')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              category === 'apartments'
                ? 'bg-[#7A0C1A] text-white font-semibold'
                : 'border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7]'
            )}
          >
            Apartments
          </button>
          <button
            type="button"
            onClick={() => setCategory('land')}
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
      <form onSubmit={handleSearch} className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Location Field */}
          <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
            <span className="text-[11px] font-medium text-[#716769]">Location</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none pr-4 w-full truncate"
                >
                  <option value="Abuja, FCT">Abuja, FCT</option>
                  <option value="Maitama, Abuja">Maitama, Abuja</option>
                  <option value="Asokoro, Abuja">Asokoro, Abuja</option>
                  <option value="Wuse 2, Abuja">Wuse 2, Abuja</option>
                  <option value="Jabi, Abuja">Jabi, Abuja</option>
                  <option value="Guzape, Abuja">Guzape, Abuja</option>
                </select>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none" />
            </div>
          </div>

          {category === 'cars' ? (
            <>
              {/* Pick-up Date */}
              <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Pick-up date</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                    <span className="text-xs font-bold text-[#1b1416]">Fri, 24 Oct</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769]" />
                </div>
              </div>

              {/* Return Date */}
              <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Return date</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                    <span className="text-xs font-bold text-[#1b1416]">Mon, 27 Oct</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769]" />
                </div>
              </div>

              {/* Driver */}
              <div className="lg:col-span-2 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Driver</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
                    <select
                      value={driverOption}
                      onChange={e => setDriverOption(e.target.value as 'Self-drive' | 'Chauffeured')}
                      className="bg-transparent text-xs font-bold text-[#1b1416] focus:outline-none cursor-pointer appearance-none pr-4"
                    >
                      <option value="Self-drive">Self-drive</option>
                      <option value="Chauffeured">Chauffeured</option>
                    </select>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none" />
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
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769] pointer-events-none" />
                </div>
              </div>

              {/* Requirement */}
              <div className="lg:col-span-3 h-16 rounded-xl border border-[#eae3e4] px-4 py-2 flex flex-col justify-between hover:border-[#7A0C1A]/60 transition-colors bg-white relative">
                <span className="text-[11px] font-medium text-[#716769]">Requirement</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1b1416]">Fully Serviced</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#716769]" />
                </div>
              </div>
            </>
          )}

          {/* Search Button */}
          <div className="lg:col-span-3 h-16 flex items-center justify-end">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#7A0C1A] hover:bg-[#600814] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
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
