'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = 'md'
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex items-center rounded-xl bg-surface-bg p-1 border border-border-subtle select-none',
        className
      )}
    >
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-wine-600',
              size === 'sm' && 'px-3 py-1 text-xs',
              size === 'md' && 'px-4 py-1.5 text-sm',
              size === 'lg' && 'px-5 py-2 text-base font-semibold',
              isSelected
                ? 'bg-white text-wine-900 shadow-xs font-semibold'
                : 'text-text-secondary hover:text-text-main hover:bg-white/50'
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
