'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CatalogHeaderProps {
  breadcrumbItem: string;
  title: string;
  subtitle: string;
  activeMode: 'rent' | 'buy';
  activeCategory: 'Cars' | 'Houses' | 'Apartments' | 'Land & plots';
}

export function CatalogHeader({
  breadcrumbItem,
  title,
  subtitle,
  activeMode,
  activeCategory
}: CatalogHeaderProps) {
  // Mode links depending on category context
  const isCarContext = activeCategory === 'Cars';
  const rentUrl = isCarContext ? '/cars/rent' : '/homes/rent';
  const buyUrl = isCarContext ? '/cars/buy' : '/properties/buy';

  const categories = [
    { name: 'Cars', href: activeMode === 'rent' ? '/cars/rent' : '/cars/buy' },
    { name: 'Houses', href: activeMode === 'rent' ? '/homes/rent' : '/properties/buy' },
    { name: 'Apartments', href: activeMode === 'rent' ? '/homes/rent' : '/properties/buy' },
    { name: 'Land & plots', href: '/properties/buy' }
  ];

  return (
    <section className="w-full bg-[#f8f5f5] border-b border-[#eae3e4] pt-8 pb-9">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb (Figma: [128x20] font=13px) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#716769]">
          <Link href="/" className="hover:text-[#81141f] transition-colors">
            Home
          </Link>
          <span className="text-[#a89d9f]">/</span>
          <span className="text-[#1b1416] font-medium">{breadcrumbItem}</span>
        </nav>

        {/* Title row (Figma: [1200x78]) */}
        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[40px] font-semibold text-[#1b1416] tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-[15px] text-[#716769] mt-1.5 font-normal">
              {subtitle}
            </p>
          </div>

          {/* Rent / Buy segmented toggle (Figma: [188x48] r=9999px) */}
          <div className="shrink-0 flex items-center bg-white border border-[#eae3e4] rounded-full p-1 shadow-xs h-[48px]">
            <Link
              href={rentUrl}
              className={cn(
                'px-5 h-full rounded-full flex items-center justify-center text-[15px] font-semibold transition-all',
                activeMode === 'rent'
                  ? 'bg-[#81141f] text-white shadow-xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              )}
            >
              Rent
            </Link>
            <Link
              href={buyUrl}
              className={cn(
                'px-5 h-full rounded-full flex items-center justify-center text-[15px] font-semibold transition-all',
                activeMode === 'buy'
                  ? 'bg-[#81141f] text-white shadow-xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              )}
            >
              Buy
            </Link>
          </div>
        </div>

        {/* Categories Chips Row (Figma: [387x40]) */}
        <div className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const isActive = cat.name === activeCategory;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={cn(
                  'h-[40px] px-5 rounded-full text-[13px] font-semibold flex items-center justify-center transition-all shrink-0',
                  isActive
                    ? 'bg-[#81141f] text-white shadow-xs'
                    : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#eae3e4]/50'
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
