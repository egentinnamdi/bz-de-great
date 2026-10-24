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
        'group flex flex-col rounded-[16px] bg-white border border-[#eae3e4] hover:shadow-xl hover:border-[#81141f]/40 transition-all duration-300 overflow-hidden w-full max-w-[384px]',
        className
      )}
    >
      {/* Photo Container (Figma: [382x248]) */}
      <div className="relative w-full h-[248px] overflow-hidden bg-[#f8f5f5]">
        <Image
          src={property.images[0] || '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg'}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 384px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge (Figma: [69x28] r=6 fill=#ffffff text=#81141f font=500 12px) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="h-7 px-3 rounded-[6px] bg-white/95 text-[#81141f] text-xs font-medium flex items-center shadow-xs">
            {isRent ? 'For rent' : 'For sale'}
          </span>
        </div>

        {/* Save button (Figma: [38x38] r=19 fill=#ffffff) */}
        <button
          type="button"
          onClick={handleToggleSave}
          className="absolute top-3 right-3 z-10 w-[38px] h-[38px] rounded-full bg-white/95 hover:bg-white text-[#716769] hover:text-[#81141f] flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
          aria-label="Save property"
        >
          <Heart className={cn('w-[18px] h-[18px] transition-colors', saved && 'fill-[#81141f] text-[#81141f]')} />
        </button>
      </div>

      {/* Body Content (Figma: [382x183] p=20px) */}
      <div className="flex flex-col justify-between p-5 min-h-[183px] bg-white">
        <div>
          {/* Title (Figma: font=Plus Jakarta Sans 600 18px text=#1b1416) */}
          <h3 className="font-sans font-semibold text-[18px] text-[#1b1416] group-hover:text-[#81141f] transition-colors line-clamp-1">
            {property.title}
          </h3>

          {/* Location (Figma: font=Plus Jakarta Sans 400 13px text=#716769) */}
          <div className="flex items-center gap-1.5 text-[13px] text-[#716769] mt-1.5">
            <MapPin className="w-4 h-4 text-[#716769] shrink-0" />
            <span>{property.location}</span>
          </div>

          {/* Specs (Figma: 3 specs with icons, gap 18px, font=Plus Jakarta Sans 13px text=#716769) */}
          <div className="flex items-center gap-4 text-[13px] text-[#716769] mt-3">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#716769]" />
              <span>{specs?.bedrooms || 4} beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#716769]" />
              <span>{specs?.bathrooms || 5} baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#716769]" />
              <span>{specs?.areaSqm ? `${specs.areaSqm}m²` : '950m²'}</span>
            </div>
          </div>
        </div>

        {/* Divider (Figma: [342x1] fill=#eae3e4) */}
        <div className="w-full h-[1px] bg-[#eae3e4] my-3" />

        {/* Price row (Figma: [342x28]) */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-sans font-bold text-[20px] text-[#81141f]">
              ₦{property.price.toLocaleString()}
            </span>
            {property.pricePeriod && property.pricePeriod !== 'total' && (
              <span className="text-[13px] font-normal text-[#716769]">
                {property.pricePeriod}
              </span>
            )}
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#81141f] hover:underline"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
