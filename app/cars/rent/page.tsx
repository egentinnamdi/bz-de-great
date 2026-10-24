'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CatalogHeader } from '@/components/catalog-header';
import { CardCar } from '@/components/card-car';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

function CarRentalsContent() {
  const { listings } = useStore();
  const searchParams = useSearchParams();

  const initialDriver = searchParams.get('driver') || 'all';

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<string>(initialDriver);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc'>('recommended');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const toggleType = (t: string) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleBrand = (b: string) => {
    setSelectedBrands(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedDriver('all');
    setSelectedTypes([]);
    setSelectedBrands([]);
    setMaxPrice(300000);
    setSortBy('recommended');
  };

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    selectedDriver !== 'all' ||
    selectedTypes.length > 0 ||
    selectedBrands.length > 0 ||
    maxPrice < 300000;

  // Filter listings
  const filteredCars = useMemo(() => {
    return listings
      .filter(item => item.category === 'car_rent')
      .filter(item => {
        if (selectedLocation === 'all') return true;
        return item.location.toLowerCase().includes(selectedLocation.toLowerCase());
      })
      .filter(item => {
        if (selectedDriver === 'all') return true;
        const driver = item.vehicleSpecs?.driverOption;
        return driver === selectedDriver || driver === 'Both';
      })
      .filter(item => {
        if (selectedTypes.length === 0) return true;
        return selectedTypes.some(t => item.tags?.includes(t) || item.title.includes(t));
      })
      .filter(item => {
        if (selectedBrands.length === 0) return true;
        const make = item.vehicleSpecs?.make || '';
        return selectedBrands.includes(make);
      })
      .filter(item => item.price <= maxPrice)
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [listings, selectedLocation, selectedDriver, selectedTypes, selectedBrands, maxPrice, sortBy]);

  return (
    <>
      {/* Figma Page Header [1440x254] */}
      <CatalogHeader
        breadcrumbItem="Rent a car"
        title="Cars for rent in Abuja"
        subtitle="24 cars available · Self-drive or with a driver"
        activeMode="rent"
        activeCategory="Cars"
      />

      {/* Figma Body [1440x1631] */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Filters Sidebar [288px] */}
          <aside className="w-full lg:w-[288px] shrink-0">
            <div className="bg-white rounded-[16px] border border-[#eae3e4] p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#eae3e4]">
                <h2 className="font-sans font-semibold text-[17px] text-[#1b1416] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#81141f]" />
                  <span>Filters</span>
                </h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[13px] text-[#81141f] font-semibold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Location Select */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Pickup & dropoff location
                </label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] cursor-pointer"
                >
                  <option value="all">Abuja (All areas)</option>
                  <option value="Maitama">Maitama</option>
                  <option value="Wuse">Wuse 2</option>
                  <option value="Asokoro">Asokoro</option>
                  <option value="Central">Central Area</option>
                  <option value="Garki">Garki</option>
                  <option value="Airport">Nnamdi Azikiwe Airport</option>
                </select>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Price Range */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[#1b1416]">Daily rate</span>
                  <span className="font-bold text-[#81141f]">
                    Up to ₦{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={300000}
                  step={10000}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#81141f] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#716769] font-mono">
                  <span>₦50k</span>
                  <span>₦300k+/day</span>
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Vehicle Type */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Car type
                </label>
                <div className="space-y-2">
                  {[
                    { label: 'Luxury SUV', count: 12 },
                    { label: 'Executive Sedan', count: 6 },
                    { label: 'Sports / Exotic', count: 2 }
                  ].map(item => (
                    <label
                      key={item.label}
                      className="flex items-center justify-between text-[13px] text-[#1b1416] cursor-pointer group"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(item.label)}
                          onChange={() => toggleType(item.label)}
                          className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f]"
                        />
                        <span className="group-hover:text-[#81141f] transition-colors">{item.label}</span>
                      </span>
                      <span className="text-[12px] text-[#716769]">({item.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Brand Filter */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Brand
                </label>
                <div className="space-y-2">
                  {['Lincoln', 'Mercedes-Benz', 'BMW', 'Toyota', 'Lexus'].map(brand => (
                    <label
                      key={brand}
                      className="flex items-center justify-between text-[13px] text-[#1b1416] cursor-pointer group"
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f]"
                        />
                        <span className="group-hover:text-[#81141f] transition-colors">{brand}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* Driver Option */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Driver option
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Options' },
                    { id: 'Self-drive', label: 'Self-drive' },
                    { id: 'Chauffeured', label: 'Chauffeured VIP' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedDriver(opt.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer ${
                        selectedDriver === opt.id
                          ? 'bg-[#81141f]/10 text-[#81141f] font-semibold border border-[#81141f]/30'
                          : 'text-[#716769] hover:bg-[#f8f5f5]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedDriver === opt.id && <Check className="w-3.5 h-3.5 text-[#81141f]" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {}}
                className="w-full h-[46px] rounded-[10px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[14px] shadow-xs cursor-pointer"
              >
                Apply filters
              </Button>
            </div>
          </aside>

          {/* Right Results Column [880px] */}
          <main className="w-full flex-1">
            {/* Results bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#eae3e4] mb-8">
              <div className="text-[15px] text-[#716769]">
                Showing <strong className="text-[#1b1416] font-semibold">1–{filteredCars.length}</strong> of{' '}
                <strong className="text-[#1b1416] font-semibold">{filteredCars.length}</strong> vehicles
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#716769]" />
                <span className="text-[13px] text-[#716769]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[13px] font-semibold text-[#1b1416] border border-[#eae3e4] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#81141f] cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* 2-Column Cards Grid (Figma: Row 1, Row 2, Row 3) */}
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                {filteredCars.map(car => (
                  <CardCar key={car.id} car={car} className="max-w-none w-full" />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#eae3e4] p-8 space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-[#1b1416]">No vehicles found</h3>
                <p className="text-[14px] text-[#716769] max-w-sm mx-auto">
                  Try widening your budget filter or switching driver options to explore our luxury fleet.
                </p>
                <Button onClick={clearFilters} variant="wineOutline" size="sm">
                  Reset all filters
                </Button>
              </div>
            )}

            {/* Pagination (Figma: [Pagination] < 1 2 3 >) */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-full border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:bg-[#f8f5f5] disabled:opacity-40 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-10 h-10 rounded-full text-[14px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                  currentPage === 1 ? 'bg-[#81141f] text-white shadow-xs' : 'border border-[#eae3e4] text-[#1b1416] hover:bg-[#f8f5f5]'
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-10 h-10 rounded-full text-[14px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                  currentPage === 2 ? 'bg-[#81141f] text-white shadow-xs' : 'border border-[#eae3e4] text-[#1b1416] hover:bg-[#f8f5f5]'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-10 h-10 rounded-full text-[14px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                  currentPage === 3 ? 'bg-[#81141f] text-white shadow-xs' : 'border border-[#eae3e4] text-[#1b1416] hover:bg-[#f8f5f5]'
                }`}
              >
                3
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
                className="w-10 h-10 rounded-full border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:bg-[#f8f5f5] cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function CarRentalsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbfb] text-[#1b1416]">
      <SiteHeader />
      <div className="flex-1">
        <Suspense fallback={<div className="text-center py-20 text-xs text-[#716769]">Loading fleet catalog...</div>}>
          <CarRentalsContent />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
