'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Bell,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';

interface AdminListingItem {
  id: string;
  title: string;
  location: string;
  image: string;
  category: 'Car' | 'House' | 'Apartment' | 'Land';
  mode: 'Rent' | 'Sale';
  priceDisplay: string;
  status: 'Available' | 'Booked' | 'Sold';
  isOnSite: boolean;
  updatedTime: string;
  slug: string;
}

import { useStore } from '@/lib/store';

export default function AdminListingsPage() {
  const { toast } = useToast();
  const { listings, updateListing, addActivity } = useStore();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Cars' | 'Property' | 'Land' | 'Drafts'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Booked' | 'Sold'>('All');

  const items: AdminListingItem[] = useMemo(() => {
    return listings.map(l => {
      const isCar = l.category.startsWith('car');
      const isRent = l.category.includes('rent');

      let category: AdminListingItem['category'] = 'Car';
      if (!isCar) {
        if (l.title.toLowerCase().includes('apartment') || l.propertySpecs?.type === 'Apartment') {
          category = 'Apartment';
        } else if (l.title.toLowerCase().includes('plot') || l.propertySpecs?.type === 'Land & plots') {
          category = 'Land';
        } else {
          category = 'House';
        }
      }

      let status: AdminListingItem['status'] = 'Available';
      if (l.status === 'draft') status = 'Booked';

      const priceDisplay = `₦${Number(l.price).toLocaleString('en-NG')}${l.pricePeriod === '/day' ? ' / day' : (l.pricePeriod === '/year' ? ' / yr' : '')}`;

      let slugPath = '/cars/rent';
      if (isCar) {
        slugPath = isRent ? `/cars/rent/${l.id}` : `/cars/buy/${l.id}`;
      } else {
        slugPath = isRent ? `/homes/rent/${l.id}` : `/properties/buy/${l.id}`;
      }

      return {
        id: l.id,
        title: l.title,
        location: l.location,
        image: (l.images && l.images[0]) || '/photos/car-suv-white.jpg',
        category,
        mode: isRent ? 'Rent' : 'Sale',
        priceDisplay,
        status,
        isOnSite: l.status === 'published',
        updatedTime: 'Recently',
        slug: slugPath
      };
    });
  }, [listings]);

  const toggleOnSite = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const nextState = !item.isOnSite;
    await updateListing(id, { status: nextState ? 'published' : 'draft' });
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Master Admin',
      action: nextState ? 'published listing live' : 'deactivated listing from site',
      target: item.title,
      category: 'listings'
    });
    toast({
      title: nextState ? 'Listing Live On Website' : 'Listing Deactivated From Website',
      description: item.title,
      variant: 'default'
    });
  };


  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category / Tab filter
      if (activeFilter === 'Cars' && item.category !== 'Car') return false;
      if (activeFilter === 'Property' && item.category !== 'House' && item.category !== 'Apartment') return false;
      if (activeFilter === 'Land' && item.category !== 'Land') return false;
      if (activeFilter === 'Drafts' && item.isOnSite) return false;

      // Status dropdown filter
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.priceDisplay.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, activeFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. TOP BAR (Figma: Top bar)
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] font-bold text-[#1b1416] tracking-tight">
            Listings
          </h1>
          <p className="text-[13px] text-[#716769] font-normal">
            {items.length} listings · {items.filter(i => i.isOnSite).length} live on the website
          </p>
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

          <Link href="/admin/listings/new">
            <button
              type="button"
              className="h-[40px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add listing</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ========================================================
          2. FILTERS BAR (Figma: Filters)
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'All', label: 'All · 42' },
            { id: 'Cars', label: 'Cars · 24' },
            { id: 'Property', label: 'Property · 14' },
            { id: 'Land', label: 'Land · 4' },
            { id: 'Drafts', label: 'Drafts · 3' }
          ].map(pill => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id as any)}
                className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#81141f] text-white shadow-2xs'
                    : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f] hover:text-[#81141f]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls (Search + Status) */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search listings"
              className="w-full h-[36px] pl-8 pr-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-[36px] pl-3 pr-8 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. LISTINGS TABLE (Figma: Listings table)
         ======================================================== */}
      <div className="bg-white rounded-[16px] border border-[#eae3e4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#eae3e4] text-[#716769] font-medium bg-[#faf8f8]">
                <th className="py-3.5 px-5 font-normal">Listing</th>
                <th className="py-3.5 px-4 font-normal">Category</th>
                <th className="py-3.5 px-4 font-normal">Mode</th>
                <th className="py-3.5 px-4 font-normal">Price</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal">On site</th>
                <th className="py-3.5 px-4 font-normal">Updated</th>
                <th className="py-3.5 px-5 font-normal text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-[#eae3e4]">
              {filteredItems.map(row => (
                <tr key={row.id} className="hover:bg-[#fdfbfb] transition-colors">
                  {/* Listing Column with Thumbnail */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-9 rounded-[6px] overflow-hidden bg-slate-100 shrink-0 border border-[#eae3e4]">
                        <Image
                          src={row.image}
                          alt={row.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1b1416] text-[13px] truncate">
                          {row.title}
                        </div>
                        <div className="text-[11px] text-[#716769] truncate">
                          {row.location}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-[#4a4245]">{row.category}</td>

                  {/* Mode */}
                  <td className="py-3.5 px-4 text-[#4a4245]">{row.mode}</td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-medium text-[#1b1416]">
                    {row.priceDisplay}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status === 'Booked'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* On Site Toggle Switch */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleOnSite(row.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        row.isOnSite ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                      }`}
                      aria-label="Toggle live on site"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          row.isOnSite ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Updated Time */}
                  <td className="py-3.5 px-4 text-[#716769] text-[12px]">
                    {row.updatedTime}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-3 text-[12px] font-semibold">
                      <Link
                        href="/admin/listings/new"
                        className="text-[#1b1416] hover:text-[#81141f] hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={row.slug}
                        className="text-[#81141f] hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[14px] text-[#716769]">
                    No listings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
