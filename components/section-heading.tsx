import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionText,
  actionHref,
  centered = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12',
        centered && 'text-center md:items-center mx-auto max-w-3xl',
        className
      )}
    >
      <div className={cn('flex flex-col space-y-3.5', centered && 'items-center')}>
        {eyebrow && (
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#81141f]">
            {eyebrow}
          </span>
        )}
        <h2 className="font-serif text-[32px] sm:text-[40px] font-semibold text-[#1b1416] leading-tight">
          {title}
        </h2>
        {description && (
          <p className="font-sans text-[16px] sm:text-[18px] text-[#4a4245] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <div className="shrink-0">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 h-11 px-4.5 rounded-[8px] border border-[#ebc7cb] text-[#81141f] font-semibold text-[13px] hover:bg-[#fbf3f4] transition-colors"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
