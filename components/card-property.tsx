'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, Heart, ArrowRight, MapPin } from 'lucide-react';
import { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from './toast-provider';

interface CardPropertyProps {
  property: Listing;
  className?: string;
}

export function CardProperty({ property, className }: CardPropertyProps) {
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const isRent = property.category === 'property_rent';
  const detailUrl = isRent ? `/homes/rent/${property.id}` : `/properties/buy/${property.id}`;
  const specs = property.propertySpecs;

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    toast({
      title: next ? 'Saved to favorites' : 'Removed from favorites',
      description: property.title,
      variant: 'default',
      duration: 2000
    });
  };

  return (
    <div
      className={cn(
        'group relative h-[400px] sm:h-[420px] rounded-[16px] overflow-hidden border border-[#eae3e4] bg-[#f8f5f5] hover-luxury-lift hover:border-[#81141f]/50 w-full max-w-[384px]',
        className
      )}
    >
      {/* Full-bleed Photo */}
      <Image
        src={property.images[0] || '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg'}
        alt={property.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 384px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

      {/* Top Overlay Badges & Save Button */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <span className="h-7 px-3 rounded-full bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider flex items-center shadow-xs">
          {isRent ? 'For rent' : 'For sale'}
        </span>
      </div>

      <button
        type="button"
        onClick={handleToggleSave}
        className="absolute top-3.5 right-3.5 z-10 w-[38px] h-[38px] rounded-full bg-white/90 hover:bg-white text-[#716769] hover:text-[#81141f] flex items-center justify-center shadow-xs transition-transform duration-150 active:scale-75 cursor-pointer"
        aria-label="Save property"
      >
        <Heart className={cn('w-[18px] h-[18px] transition-colors duration-200', saved && 'fill-[#81141f] text-[#81141f]')} />
      </button>

      {/* Bottom Translucent Glass Details Card */}
      <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl bg-white/88 backdrop-blur-md border border-white/80 p-4 shadow-lg transition-all duration-300 group-hover:bg-white/95">
        <h3 className="font-sans font-bold text-[16px] text-[#1b1416] group-hover:text-[#81141f] transition-colors duration-200 line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[12px] text-[#5a5052] mt-1">
          <MapPin className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Minimal Spec Strip */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#5a5052] mt-2">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            <span>{specs?.bedrooms || 4} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            <span>{specs?.bathrooms || 5} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{specs?.areaSqm ? `${specs.areaSqm}m²` : '950m²'}</span>
          </div>
        </div>

        {/* Price & Link */}
        <div className="mt-3 pt-2.5 border-t border-[#eae3e4]/80 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-sans font-extrabold text-[18px] text-[#1b1416]">
              ₦{property.price.toLocaleString()}
            </span>
            {property.pricePeriod && property.pricePeriod !== 'total' && (
              <span className="text-[11px] font-medium text-[#5a5052]">
                {property.pricePeriod}
              </span>
            )}
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#81141f] hover:bg-[#6b121c] text-white text-[11px] font-bold shrink-0 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
