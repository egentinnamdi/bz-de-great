'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageSquare, RefreshCw, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from './toast-provider';
import { getWhatsAppRmbLink, SITE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function RmbCalculator({
  className,
  onOpenGetAccount
}: {
  className?: string;
  onOpenGetAccount?: (direction: 'rmb_to_naira' | 'naira_to_rmb', sourceAmount: number, destAmount: number) => void;
}) {
  const router = useRouter();
  const { rmbRates, createRmbRequest } = useStore();
  const { toast } = useToast();

  const [direction, setDirection] = useState<'rmb_to_naira' | 'naira_to_rmb'>('rmb_to_naira');
  const [sourceAmount, setSourceAmount] = useState<number>(10000);

  const rate = direction === 'rmb_to_naira' ? rmbRates.payRmbRate : rmbRates.payNairaRate;

  // Calculation
  const destinationAmount =
    direction === 'rmb_to_naira'
      ? sourceAmount * rate
      : sourceAmount > 0
      ? Math.round(sourceAmount / rate)
      : 0;

  const handleGetAccount = () => {
    if (onOpenGetAccount) {
      onOpenGetAccount(direction, sourceAmount, destinationAmount);
      return;
    }

    // Direct navigation to the settlement desk as requested by user
    router.push(`/pay-naira?direction=${direction}&source=${sourceAmount}&dest=${destinationAmount}`);
  };

  return (
    <div
      className={cn(
        'w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-4 text-left border border-[#eae3e4]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-bold text-base text-[#1b1416]">
          RMB exchange
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[#716769]">
          <Clock className="w-3.5 h-3.5 text-[#716769]" />
          <span>Rates updated 9:30 AM</span>
        </div>
      </div>

      {/* Direction Switcher */}
      <div className="h-10 rounded-xl bg-[#f8f5f5] p-1 flex items-center border border-[#eae3e4]/60">
        <button
          type="button"
          onClick={() => {
            setDirection('rmb_to_naira');
            if (sourceAmount === 2000000) setSourceAmount(10000);
          }}
          className={cn(
            'flex-1 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            direction === 'rmb_to_naira'
              ? 'bg-[#7A0C1A] text-white shadow-xs'
              : 'text-[#716769] hover:text-[#1b1416]'
          )}
        >
          Pay RMB · Get naira
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection('naira_to_rmb');
            if (sourceAmount === 10000) setSourceAmount(2000000);
          }}
          className={cn(
            'flex-1 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            direction === 'naira_to_rmb'
              ? 'bg-[#7A0C1A] text-white shadow-xs'
              : 'text-[#716769] hover:text-[#1b1416]'
          )}
        >
          Pay naira · Get RMB
        </button>
      </div>

      {/* You pay */}
      <div className="rounded-xl bg-[#f8f5f5] p-3.5 flex flex-col justify-between border border-[#eae3e4]/60 focus-within:border-[#7A0C1A]">
        <span className="text-[11px] font-medium text-[#716769]">You pay</span>
        <div className="flex items-center justify-between gap-3 mt-1">
          <input
            type="number"
            value={sourceAmount || ''}
            onChange={e => setSourceAmount(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent text-xl font-bold font-mono text-[#1b1416] focus:outline-none"
            placeholder="0"
          />
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-white border border-[#eae3e4] text-xs font-bold text-[#1b1416] shadow-2xs">
            {direction === 'rmb_to_naira' ? '¥ CNY' : '₦ NGN'}
          </span>
        </div>
      </div>

      {/* Rate indicator strip */}
      <div className="flex items-center gap-2 py-0.5 text-xs text-[#716769]">
        <RefreshCw className="w-3.5 h-3.5 text-[#7A0C1A] shrink-0" />
        <span className="font-semibold text-[#1b1416]">
          ¥1 = ₦{rate.toFixed(2)}
        </span>
        <span>today&apos;s rate, set by BZ</span>
      </div>

      {/* You get */}
      <div className="rounded-xl bg-[#f8f5f5] p-3.5 flex flex-col justify-between border border-[#eae3e4]/60">
        <span className="text-[11px] font-medium text-[#716769]">You get</span>
        <div className="flex items-center justify-between gap-3 mt-1">
          <span className="text-xl font-bold font-mono text-[#1b1416]">
            {destinationAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-white border border-[#eae3e4] text-xs font-bold text-[#1b1416] shadow-2xs">
            {direction === 'rmb_to_naira' ? '₦ NGN' : '¥ CNY'}
          </span>
        </div>
      </div>

      {/* Get account Button */}
      <button
        type="button"
        onClick={handleGetAccount}
        className="w-full py-3 rounded-xl bg-[#7A0C1A] hover:bg-[#600814] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer mt-1"
      >
        <span>Get account</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Footnote */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#716769] pt-1">
        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Our RMB account details will be sent to your WhatsApp.</span>
      </div>
    </div>
  );
}
