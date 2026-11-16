'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { ListingStatus } from '@/lib/types';

interface ListingUnavailableStateProps {
  title: string;
  location?: string;
  status: ListingStatus;
  backHref: string;
  backLabel: string;
  assetKindLabel: string;
}

const STATUS_META: Record<Exclude<ListingStatus, 'published'>, { badge: string; headline: string; note: string }> = {
  sold: {
    badge: 'Sold Out',
    headline: 'marked as sold',
    note: 'Our regional branch has closed this transaction and removed the unit from public listings.',
  },
  rented: {
    badge: 'Currently Rented / Occupied',
    headline: 'marked as rented out',
    note: 'This unit has been rented out by our branch office and is temporarily unavailable.',
  },
  reserved: {
    badge: 'Reserved',
    headline: 'currently reserved',
    note: 'A client hold is active on this listing while verification is finalized.',
  },
  draft: {
    badge: 'Pending Approval',
    headline: 'under review',
    note: 'This listing was uploaded by a regional stand and is awaiting verification before going live.',
  },
  archived: {
    badge: 'Archived',
    headline: 'no longer listed',
    note: 'This item has been archived from the active BZ Group catalog.',
  },
};

export function ListingUnavailableState({
  title,
  location,
  status,
  backHref,
  backLabel,
  assetKindLabel,
}: ListingUnavailableStateProps) {
  const meta =
    status === 'published'
      ? STATUS_META.archived
      : STATUS_META[status] || STATUS_META.archived;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-border-subtle p-8 sm:p-10 text-center shadow-xs space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf3f4] border border-[#f0cfd4] text-[#81141f] text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{meta.badge}</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
              This {assetKindLabel} is {meta.headline}
            </h1>
            <p className="text-sm font-semibold text-wine-900">{title}</p>
            {location && (
              <p className="text-xs text-text-subtle inline-flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-wine-800" />
                <span>{location}</span>
              </p>
            )}
          </div>

          <p className="text-sm text-text-subtle leading-relaxed">{meta.note}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={backHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>{backLabel}</span>
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="wineOutline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
