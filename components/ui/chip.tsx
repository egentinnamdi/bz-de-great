'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export function Chip({
  children,
  active = false,
  count,
  icon,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-all duration-200 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-wine-600',
        active
          ? 'bg-wine-800 text-white shadow-sm shadow-wine-950/20 hover:bg-wine-900 border border-wine-700'
          : 'bg-white text-text-secondary hover:bg-wine-50/60 hover:text-wine-900 border border-border-subtle shadow-xs',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full text-[11px] px-1.5 py-0.2 font-semibold min-w-5',
            active ? 'bg-white/20 text-white' : 'bg-surface-bg text-text-subtle'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
