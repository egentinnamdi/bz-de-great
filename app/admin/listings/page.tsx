'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  RotateCcw,
  MapPin,
  Tag,
  X,
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminRowsSkeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';
import { Listing } from '@/lib/types';
import { NIGERIA_STATES } from '@/lib/locations';
import { canManageListing, getListingState, isMasterAdmin } from '@/lib/staff';

interface AdminListingItem {
  id: string;
  title: string;
  location: string;
  state: string;
  branchLabel: string;
  image: string;
  category: 'Car' | 'House' | 'Apartment' | 'Land';
  mode: 'Rent' | 'Sale';
  priceDisplay: string;
  partnerNetDisplay?: string;
  status: 'Available' | 'Booked' | 'Rented' | 'Sold' | 'Pending Review';
  isOnSite: boolean;
  updatedTime: string;
  slug: string;
  raw: Listing;
}

export default function AdminListingsPage() {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const { listings, isLoading, updateListing, markListingSold, deleteListing, addActivity } = useStore();

  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Cars' | 'Property' | 'Land' | 'Sold' | 'Pending' | 'Drafts'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Available' | 'Booked' | 'Rented' | 'Sold' | 'Pending Review'
  >('All');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  // Mark Sold confirmation modal state
  const [soldModalTarget, setSoldModalTarget] = useState<AdminListingItem | null>(null);
  const [saleNoteInput, setSaleNoteInput] = useState('');

  const master = isMasterAdmin(user);

  const scopedListings = useMemo(
    () => listings.filter(l => canManageListing(user, l)),
    [listings, user]
  );

  const items: AdminListingItem[] = useMemo(() => {
    return scopedListings.map(l => {
      const isCar = l.category.startsWith('car');
      const isRent = l.category.includes('rent');

      let category: AdminListingItem['category'] = 'Car';
      if (!isCar) {
        if (
          l.propertySpecs?.type === 'Land & plots' ||
          l.title.toLowerCase().includes('plot') ||
          l.title.toLowerCase().includes('land') ||
          (l.tags && l.tags.some(t => t.toLowerCase().includes('land') || t.toLowerCase().includes('plot')))
        ) {
          category = 'Land';
        } else if (
          l.title.toLowerCase().includes('apartment') ||
          l.propertySpecs?.type === 'Apartment'
        ) {
          category = 'Apartment';
        } else {
          category = 'House';
        }
      }

      let status: AdminListingItem['status'] = 'Available';
      if (l.status === 'sold') status = 'Sold';
      else if (l.status === 'rented') status = 'Rented';
      else if (l.status === 'reserved') status = 'Booked';
      else if (l.status === 'draft' && l.requiresApproval) status = 'Pending Review';
      else if (l.status === 'draft' || l.status === 'archived') status = 'Booked';

      const priceDisplay = `₦${Number(l.price).toLocaleString('en-NG')}${
        l.pricePeriod === '/day' ? ' / day' : l.pricePeriod === '/year' ? ' / yr' : ''
      }`;

      let slugPath = '/cars/rent';
      if (isCar) {
        slugPath = isRent ? `/cars/rent/${l.id}` : `/cars/buy/${l.id}`;
      } else {
        slugPath = isRent ? `/homes/rent/${l.id}` : `/properties/buy/${l.id}`;
      }

      const resolvedState = getListingState(l);
      const branchLabel = l.branchOffice
        ? l.createdByName
          ? `${l.branchOffice} · ${l.createdByName}`
          : l.branchOffice
        : l.createdByName || resolvedState;

      return {
        id: l.id,
        title: l.title,
        location: l.location,
        state: resolvedState,
        branchLabel,
        image: (l.images && l.images[0]) || '/photos/car-suv-white.jpg',
        category,
        mode: isRent ? 'Rent' : 'Sale',
        priceDisplay,
        partnerNetDisplay:
          l.partnerNetPrice && l.partnerNetPrice > 0
            ? `₦${Number(l.partnerNetPrice).toLocaleString('en-NG')}`
            : undefined,
        status,
        isOnSite: l.status === 'published',
        updatedTime: l.soldAt
          ? `Sold ${new Date(l.soldAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}`
          : 'Recently',
        slug: slugPath,
        raw: l,
      };
    });
  }, [scopedListings]);

  const recentPartnerSold = useMemo(
    () => items.filter(i => i.status === 'Sold').slice(0, 3),
    [items]
  );

  const counts = useMemo(() => {
    return {
      all: items.length,
      cars: items.filter(i => i.category === 'Car' && i.status !== 'Sold').length,
      property: items.filter(i => (i.category === 'House' || i.category === 'Apartment') && i.status !== 'Sold').length,
      land: items.filter(i => i.category === 'Land' && i.status !== 'Sold').length,
      sold: items.filter(i => i.status === 'Sold').length,
      pending: items.filter(i => i.status === 'Pending Review').length,
      drafts: items.filter(i => !i.isOnSite && i.status !== 'Sold').length,
    };
  }, [items]);

  const liveCount = useMemo(() => items.filter(i => i.isOnSite).length, [items]);

  const toggleOnSite = async (item: AdminListingItem) => {
    const nextState = !item.isOnSite;
    await updateListing(item.id, {
      status: nextState ? 'published' : 'draft',
      requiresApproval: false,
    });
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: `${user?.role || 'Staff'} · ${item.state}`,
      action: nextState ? 'published listing live' : 'took listing off site',
      target: item.title,
      category: 'listings',
    });
    toast({
      title: nextState ? 'Listing Live On Website' : 'Listing Removed From Website',
      description: item.title,
      variant: 'default',
    });
  };

  const handleConfirmSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soldModalTarget) return;
    const item = soldModalTarget;
    const actorName = user?.name || 'Partner Admin';
    const actorRole = `${user?.role || 'Staff'} · ${user?.branchOffice || item.state}`;

    await markListingSold(item.id, {
      soldByName: actorName,
      soldByRole: actorRole,
      saleNote: saleNoteInput,
    });

    await addActivity({
      actorName,
      actorRole,
      action: `marked SOLD & removed from public site${saleNoteInput.trim() ? ` (${saleNoteInput.trim()})` : ''}`,
      target: `${item.title} · ${item.state}`,
      details: `${item.branchLabel} · Off website immediately`,
      category: 'listings',
    });

    toast({
      title: 'Marked as Sold & Removed From Site',
      description: `${item.title} is off the public site and Master Admin has been notified.`,
      variant: 'success',
    });
    setSoldModalTarget(null);
    setSaleNoteInput('');
  };

  const handleToggleRented = async (item: AdminListingItem) => {
    const isNowRented = item.status !== 'Rented';
    await updateListing(item.id, { status: isNowRented ? 'rented' : 'published' });
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: `${user?.role || 'Staff'} · ${item.state}`,
      action: isNowRented ? 'marked rental unit as Rented Out (off site)' : 'marked rental unit Available again',
      target: item.title,
      category: 'listings',
    });
    toast({
      title: isNowRented ? 'Marked Rented Out' : 'Available on Website Again',
      description: item.title,
      variant: 'default',
    });
  };

  const handleRelistSold = async (item: AdminListingItem) => {
    await updateListing(item.id, {
      status: 'published',
      requiresApproval: false,
      soldAt: undefined,
      soldByName: undefined,
      saleNote: undefined,
    });
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: `${user?.role || 'Staff'} · ${item.state}`,
      action: 're-listed previously sold item back live',
      target: item.title,
      category: 'listings',
    });
    toast({
      title: 'Listing Restored Live',
      description: `${item.title} is live on the website again.`,
      variant: 'success',
    });
  };

  const handleApproveLive = async (item: AdminListingItem) => {
    await updateListing(item.id, { status: 'published', requiresApproval: false });
    await addActivity({
      actorName: user?.name || 'Master Admin',
      actorRole: 'Master Admin',
      action: `approved partner upload live (${item.state})`,
      target: item.title,
      category: 'listings',
    });
    toast({
      title: 'Approved Live',
      description: `${item.title} is now visible across the website.`,
      variant: 'success',
    });
  };

  const handleDelete = async (item: AdminListingItem) => {
    if (!master && !user?.canDeleteListings) {
      toast({
        title: 'Use Mark Sold instead',
        description: 'Only Master Admin can permanently delete records. Stand reps should use "Mark Sold" so history stays tracked.',
        variant: 'error',
      });
      return;
    }
    if (confirm(`Permanently delete "${item.title}"? This removes it from Sold/Audit history too.`)) {
      await deleteListing(item.id);
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Master Admin',
        action: 'permanently deleted listing',
        target: item.title,
        category: 'listings',
      });
      toast({
        title: 'Listing deleted',
        description: `${item.title} was removed from inventory.`,
        variant: 'default',
      });
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeFilter === 'Cars' && (item.category !== 'Car' || item.status === 'Sold')) return false;
      if (activeFilter === 'Property' && ((item.category !== 'House' && item.category !== 'Apartment') || item.status === 'Sold')) return false;
      if (activeFilter === 'Land' && (item.category !== 'Land' || item.status === 'Sold')) return false;
      if (activeFilter === 'Sold' && item.status !== 'Sold') return false;
      if (activeFilter === 'Pending' && item.status !== 'Pending Review') return false;
      if (activeFilter === 'Drafts' && (item.isOnSite || item.status === 'Sold')) return false;

      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (master && stateFilter !== 'ALL' && item.state !== stateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.branchLabel.toLowerCase().includes(q) ||
          item.priceDisplay.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, activeFilter, statusFilter, stateFilter, master, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1b1416] tracking-tight">
            {master ? 'Nationwide Listings & Sales' : `${user?.branchOffice || 'Branch'} Inventory`}
          </h1>
          <p className="text-[13px] text-[#716769] font-normal">
            {master
              ? `${counts.all} listings nationwide · ${liveCount} live on website · ${counts.sold} sold`
              : `Scoped to ${user?.assignedStates.join(', ')} · ${liveCount} live · ${counts.sold} sold`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden sm:block">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search car, area, stand..."
              className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>

          <Link href="/admin/listings/new">
            <button
              type="button"
              className="h-[40px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{master ? 'Add listing' : 'Upload photos / Add'}</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Master Admin Live Sold Alert Banner */}
      {master && recentPartnerSold.length > 0 && (
        <div className="rounded-[14px] bg-[#fbf3f4] border border-[#ebc7cb] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[13px] font-bold text-[#81141f] flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>
                {counts.sold} Sold {counts.sold === 1 ? 'Item' : 'Items'} Removed From Public Website
              </span>
            </div>
            <div className="text-[12px] text-[#4a4245]">
              {recentPartnerSold
                .map(s => `${s.title} (${s.raw.soldByName || s.branchLabel} · ${s.state})`)
                .join('  •  ')}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveFilter('Sold')}
            className="h-9 px-3.5 rounded-lg bg-white border border-[#ebc7cb] text-[#81141f] hover:bg-[#81141f] hover:text-white text-xs font-bold transition-colors shrink-0 cursor-pointer self-start sm:self-center"
          >
            View Sold History ({counts.sold})
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'All' as const, label: `All · ${counts.all}` },
            { id: 'Cars' as const, label: `Cars · ${counts.cars}` },
            { id: 'Property' as const, label: `Property · ${counts.property}` },
            { id: 'Land' as const, label: `Land · ${counts.land}` },
            { id: 'Sold' as const, label: `Sold History · ${counts.sold}` },
            ...(counts.pending > 0 ? [{ id: 'Pending' as const, label: `Needs Approval · ${counts.pending}` }] : []),
            { id: 'Drafts' as const, label: `Drafts · ${counts.drafts}` },
          ].map(pill => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={cn(
                  'h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-[#81141f] text-white shadow-2xs'
                    : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f] hover:text-[#81141f]'
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {master && (
            <div className="relative">
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                className="h-[36px] pl-3 pr-8 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] font-medium focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer"
              >
                <option value="ALL">State: All Nigeria</option>
                {NIGERIA_STATES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-[36px] pl-3 pr-8 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked / Draft</option>
              <option value="Rented">Rented Out</option>
              <option value="Sold">Sold (Off site)</option>
              <option value="Pending Review">Pending Review</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#716769] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Cards View (Car-stand phone friendly) */}
      {isLoading ? (
        <AdminRowsSkeleton rows={6} />
      ) : (
      <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredItems.map(row => (
          <div
            key={row.id}
            className="bg-white rounded-[14px] border border-[#eae3e4] p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={row.image}
                alt={row.title}
                className="w-20 h-16 rounded-[8px] object-cover bg-slate-100 shrink-0 border border-[#eae3e4]"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/photos/car-suv-white.jpg';
                }}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-bold text-[14px] text-[#1b1416] leading-snug">{row.title}</div>
                <div className="text-[11px] text-[#716769] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#81141f] shrink-0" />
                  <span className="truncate">{row.location} · {row.state}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-[13px] text-[#1b1416]">{row.priceDisplay}</span>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      row.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : row.status === 'Sold'
                          ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            </div>

            {row.raw.soldByName && row.status === 'Sold' && (
              <div className="text-[11px] text-[#716769] bg-[#f8f5f5] px-2.5 py-1.5 rounded-lg">
                Marked Sold by <strong>{row.raw.soldByName}</strong>
                {row.raw.saleNote ? ` · ${row.raw.saleNote}` : ''}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#eae3e4]">
              {row.mode === 'Sale' && row.status !== 'Sold' && (
                <button
                  type="button"
                  onClick={() => {
                    setSoldModalTarget(row);
                    setSaleNoteInput('');
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#81141f] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Mark Sold &amp; Remove</span>
                </button>
              )}
              {row.mode === 'Rent' && row.status !== 'Sold' && (
                <button
                  type="button"
                  onClick={() => handleToggleRented(row)}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#fbf3f4] border border-[#ebc7cb] text-[#81141f] text-xs font-bold cursor-pointer"
                >
                  {row.status === 'Rented' ? 'Set Available' : 'Mark Rented Out'}
                </button>
              )}
              {row.status === 'Sold' && (
                <button
                  type="button"
                  onClick={() => handleRelistSold(row)}
                  className="flex-1 h-9 px-3 rounded-lg border border-[#eae3e4] text-xs font-bold text-[#1b1416] cursor-pointer"
                >
                  Re-list Live
                </button>
              )}
              <Link
                href={`/admin/listings/new?edit=${row.id}`}
                className="h-9 px-3 rounded-lg border border-[#eae3e4] text-xs font-semibold text-[#1b1416] inline-flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Listings Table */}
      <div className="hidden md:block bg-white rounded-[16px] border border-[#eae3e4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#eae3e4] text-[#716769] font-medium bg-[#faf8f8]">
                <th className="py-3.5 px-5 font-normal">Listing</th>
                <th className="py-3.5 px-4 font-normal">State · Stand / Rep</th>
                <th className="py-3.5 px-4 font-normal">Price</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal">Live on Site</th>
                <th className="py-3.5 px-5 font-normal text-right">Quick Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eae3e4]">
              {filteredItems.map(row => (
                <tr key={row.id} className="hover:bg-[#fdfbfb] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-10 rounded-[6px] overflow-hidden bg-slate-100 shrink-0 border border-[#eae3e4]">
                        <img
                          src={row.image}
                          alt={row.title}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/photos/car-suv-white.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1b1416] truncate max-w-[230px]">
                          {row.title}
                        </div>
                        <div className="text-[11px] text-[#716769] truncate max-w-[230px]">
                          {row.location} · {row.category} ({row.mode})
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f8f5f5] border border-[#eae3e4] text-[11px] font-semibold text-[#1b1416]">
                        {row.state}
                      </span>
                      <div className="text-[11px] text-[#716769] truncate max-w-[190px]">
                        {row.branchLabel}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1b1416]">{row.priceDisplay}</div>
                    {row.partnerNetDisplay && (
                      <div className="text-[10px] text-[#716769]">Stand net: {row.partnerNetDisplay}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                          row.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.status === 'Sold'
                              ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              : row.status === 'Pending Review'
                                ? 'bg-[#fbf3f4] text-[#81141f] border-[#ebc7cb]'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {row.status === 'Sold' ? 'Sold · Off site' : row.status}
                      </span>
                      {row.status === 'Sold' && row.raw.soldByName && (
                        <div className="text-[10px] text-[#716769]">
                          By {row.raw.soldByName}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      disabled={row.status === 'Sold'}
                      onClick={() => toggleOnSite(row)}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                        row.status === 'Sold' ? 'opacity-40 cursor-not-allowed bg-[#d8d0d1]' : 'cursor-pointer',
                        row.isOnSite ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                      )}
                      aria-label="Toggle live on site"
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200',
                          row.isOnSite ? 'translate-x-4' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </td>

                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 text-[12px] font-semibold">
                      {master && row.status === 'Pending Review' && (
                        <button
                          type="button"
                          onClick={() => handleApproveLive(row)}
                          className="h-7 px-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve Live</span>
                        </button>
                      )}

                      {row.mode === 'Sale' && row.status !== 'Sold' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSoldModalTarget(row);
                            setSaleNoteInput('');
                          }}
                          className="h-7 px-2.5 rounded-md bg-[#fbf3f4] border border-[#ebc7cb] text-[#81141f] hover:bg-[#81141f] hover:text-white inline-flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Mark Sold</span>
                        </button>
                      )}

                      {row.mode === 'Rent' && row.status !== 'Sold' && (
                        <button
                          type="button"
                          onClick={() => handleToggleRented(row)}
                          className="h-7 px-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-[11px] font-bold cursor-pointer"
                        >
                          {row.status === 'Rented' ? 'Set Available' : 'Mark Rented'}
                        </button>
                      )}

                      {row.status === 'Sold' && (
                        <button
                          type="button"
                          onClick={() => handleRelistSold(row)}
                          className="h-7 px-2.5 rounded-md border border-[#eae3e4] text-[#1b1416] hover:border-[#81141f] inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-list</span>
                        </button>
                      )}

                      <Link
                        href={`/admin/listings/new?edit=${row.id}`}
                        className="text-[#1b1416] hover:text-[#81141f] px-1.5 inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <Link
                        href={row.slug}
                        target="_blank"
                        className="text-[#81141f] hover:underline px-1 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {(master || user?.canDeleteListings) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#716769] text-sm">
                    No listings found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Mark Sold Modal */}
      {soldModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmSold}
            className="w-full max-w-md bg-white rounded-2xl border border-[#eae3e4] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                  Instant Site Removal + Owner Alert
                </span>
                <h3 className="text-lg font-bold text-[#1b1416] mt-0.5">
                  Mark Listing as Sold
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSoldModalTarget(null)}
                className="p-1.5 rounded-lg text-[#716769] hover:bg-[#f8f5f5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f8f5f5] border border-[#eae3e4] flex items-center gap-3">
              <img
                src={soldModalTarget.image}
                alt={soldModalTarget.title}
                className="w-14 h-11 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-xs text-[#1b1416] truncate">{soldModalTarget.title}</div>
                <div className="text-[11px] text-[#716769] truncate">
                  {soldModalTarget.location} · {soldModalTarget.priceDisplay}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4a4245] leading-relaxed">
              This will immediately hide <strong>{soldModalTarget.title}</strong> from customers on the public website and log the sale under <strong>{user?.name || 'Admin'}</strong> so Master Admin sees it sold.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1416] block">
                Sale Note / Closed Price (Optional, Admin Only)
              </label>
              <input
                type="text"
                value={saleNoteInput}
                onChange={e => setSaleNoteInput(e.target.value)}
                placeholder="e.g. Closed walk-in buyer at Awka stand — ₦52.5M"
                className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSoldModalTarget(null)}
                className="h-10 px-4 rounded-lg border border-[#eae3e4] text-xs font-semibold text-[#1b1416] hover:bg-[#f8f5f5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Sold &amp; Take Off Site
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
