import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-wine-50 text-wine-900 border border-wine-200/80',
        wine:
          'bg-wine-800 text-white shadow-xs',
        success:
          'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        warning:
          'bg-amber-50 text-amber-900 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        danger:
          'bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        neutral:
          'bg-surface-bg text-text-secondary border border-border-subtle',
        outline:
          'border border-border-subtle text-text-main bg-white',
      },
      size: {
        sm: 'text-[11px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-emerald-600',
            variant === 'warning' && 'bg-amber-600',
            variant === 'danger' && 'bg-rose-600',
            variant === 'wine' && 'bg-white',
            (!variant || variant === 'default') && 'bg-wine-700',
            variant === 'neutral' && 'bg-text-subtle'
          )}
        />
      )}
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (['approved', 'published', 'active', 'verified', 'completed', 'paid'].includes(normalized)) {
    return <Badge variant="success" dot>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  }
  if (['pending', 'requested', 'account_sent', 'receipt_uploaded', 'receipt_received'].includes(normalized)) {
    return <Badge variant="warning" dot>{status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>;
  }
  if (['rejected', 'declined', 'archived', 'cancelled'].includes(normalized)) {
    return <Badge variant="danger" dot>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  }
  if (['returned'].includes(normalized)) {
    return <Badge variant="neutral" dot>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  }
  return <Badge variant="default" dot>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
