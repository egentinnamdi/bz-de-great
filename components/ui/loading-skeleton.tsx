import React from 'react';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-[#efe9ea]', className)}
    />
  );
}

export function ListingCardSkeleton({ variant = 'catalog' }: { variant?: 'catalog' | 'home' }) {
  if (variant === 'home') {
    return (
      <div className="relative h-[400px] sm:h-[420px] overflow-hidden rounded-2xl border border-[#eae3e4] bg-[#faf7f7] p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="rounded-xl border border-white bg-white p-4 space-y-3 shadow-xs">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#f0eaeb]">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[16px] border border-[#eae3e4] bg-white overflow-hidden shadow-2xs">
      <Skeleton className="h-[220px] w-full rounded-none" />
      <div className="p-5 space-y-3.5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#f0eaeb]">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({
  count = 6,
  columnsClass = 'grid-cols-1 md:grid-cols-2',
  variant = 'catalog',
}: {
  count?: number;
  columnsClass?: string;
  variant?: 'catalog' | 'home';
}) {
  return (
    <div className={cn('grid gap-6', columnsClass)} role="status" aria-label="Loading live inventory">
      {Array.from({ length: count }).map((_, idx) => (
        <ListingCardSkeleton key={idx} variant={variant} />
      ))}
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SiteHeader />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 lg:px-[120px] py-8 sm:py-12 space-y-8" role="status" aria-label="Loading listing details">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-[340px] sm:h-[440px] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl bg-white border border-[#eae3e4] p-6 space-y-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-44" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function AdminRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#f0eaeb] bg-white rounded-2xl border border-[#eae3e4] overflow-hidden" role="status" aria-label="Loading records">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-7 w-24 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function AdminKpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="status" aria-label="Loading metrics">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-5 rounded-2xl bg-white border border-[#eae3e4] space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}
