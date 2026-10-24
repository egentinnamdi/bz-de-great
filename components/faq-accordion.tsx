'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItemData {
  question: string;
  answer: string;
  category?: string;
}

export const DEFAULT_FAQS: FAQItemData[] = [
  {
    question: 'How do car rentals and driver options work?',
    answer: 'You can choose between Self-drive (requires a valid driver\'s license and identity verification) or Chauffeured VIP (our professional executive driver is provided). Rental terms are flexible by the day, week, or month with airport pick-up/drop-off available in Abuja and Lagos.',
  },
  {
    question: 'How does BZ Group ensure properties and cars are authentic?',
    answer: 'Every car undergoes a mechanical scan and Carfax/customs duty inspection before listing. Real estate listings have their legal documentation (C of O, Governor\'s Consent, or Gazette) vetted by our in-house property attorneys before public offering.',
  },
  {
    question: 'How fast is RMB and Naira currency exchange settled?',
    answer: 'Once your WeChat Pay, Alipay, or Nigerian bank transfer is confirmed by our treasury desk, funds are disbursed within 30 minutes. We lock your exchange rate at the moment your ticket is generated.',
  },
  {
    question: 'Can I inspect a home or test drive a car before paying?',
    answer: 'Yes! We believe in full transparency. Simply click "Book inspection" or "Schedule test drive", select your preferred date, and our concierge will arrange your private viewing accompanied by a representative.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Nigerian Naira direct bank transfers (GTBank, Zenith, Access), Chinese RMB via WeChat Pay and Alipay, and international USD wire transfers for accredited sales transactions.',
  },
];

export function FAQAccordion({
  items = DEFAULT_FAQS,
  className
}: {
  items?: FAQItemData[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={cn('flex flex-col space-y-3 w-full', className)}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className="rounded-2xl border border-border-subtle bg-white overflow-hidden transition-all shadow-2xs hover:border-wine-200"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-text-main gap-4 select-none cursor-pointer"
            >
              <span>{item.question}</span>
              <div
                className={cn(
                  'p-1 rounded-full bg-surface-bg text-wine-900 transition-transform duration-200 shrink-0',
                  isOpen && 'rotate-180 bg-wine-50 text-wine-800'
                )}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-subtle/50 pt-3 animate-in fade-in">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
