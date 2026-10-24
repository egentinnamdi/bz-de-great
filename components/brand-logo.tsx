'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export function BrandLogo({
  tone = 'dark',
  size = 'md',
  showSubtitle = true,
  className,
  href = '/'
}: BrandLogoProps) {
  const content = (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      {/* Emblem Icon (f90d15c629ec0ad06b7be77d4ef45d172a7bb1f1) */}
      <div
        className={cn(
          'relative shrink-0 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs overflow-hidden',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-11 h-11',
          size === 'lg' && 'w-13 h-13'
        )}
      >
        <Image
          src="/figma-images/f90d15c629ec0ad06b7be77d4ef45d172a7bb1f1.jpg"
          alt="BZ Group Emblem"
          width={52}
          height={52}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Typography Wordmark (Figma Wordmark [163x43]) */}
      <div className="flex flex-col justify-center">
        <span
          className={cn(
            'font-brand tracking-[0.16em] uppercase font-bold leading-none',
            tone === 'light' ? 'text-white' : 'text-[#81141f]',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-[17px]',
            size === 'lg' && 'text-[20px] tracking-[0.18em]'
          )}
        >
          BZ GROUP
        </span>
        {showSubtitle && (
          <span
            className={cn(
              'font-sans uppercase tracking-[0.2em] font-medium leading-tight mt-1',
              tone === 'light' ? 'text-[#f6e3e5]' : 'text-[#4a4245]',
              size === 'sm' && 'text-[7.5px]',
              size === 'md' && 'text-[9px]',
              size === 'lg' && 'text-[10.5px]'
            )}
          >
            Global Universal Solutions
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#81141f] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

export function BrandEmblem({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn('relative shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-2xs', className)}
    >
      <Image
        src="/figma-images/f90d15c629ec0ad06b7be77d4ef45d172a7bb1f1.jpg"
        alt="BZ Group Emblem"
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
