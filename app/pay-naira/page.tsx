'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PayNairaView } from '@/components/pay-naira-view';
import { useStore } from '@/lib/store';

function PayNairaContent() {
  const searchParams = useSearchParams();
  const { rmbRequests, rmbRates } = useStore();

  const directionParam = searchParams.get('direction');
  const direction: 'rmb_to_naira' | 'naira_to_rmb' =
    directionParam === 'naira_to_rmb' ? 'naira_to_rmb' : 'rmb_to_naira';

  const orderId = searchParams.get('order') || null;
  const targetRequest = orderId ? rmbRequests.find(r => r.id === orderId) : null;

  const paramSource = searchParams.get('source') ? Number(searchParams.get('source')) : null;
  const paramDest = searchParams.get('dest') ? Number(searchParams.get('dest')) : null;
  const paramName = searchParams.get('name') || null;
  const paramEmail = searchParams.get('email') || null;
  const paramPhone = searchParams.get('phone') || null;

  // Defaults based on direction:
  // If rmb_to_naira: source default 10,000 RMB, dest default 2,050,000 NGN
  // If naira_to_rmb: source default 2,154,000 NGN, dest default 10,000 RMB
  const sourceAmount =
    targetRequest?.sourceAmount ||
    paramSource ||
    (direction === 'rmb_to_naira' ? 10000 : 2154000);

  const rateApplied =
    targetRequest?.rateApplied ||
    (direction === 'rmb_to_naira'
      ? paramSource && paramDest
        ? Number((paramDest / paramSource).toFixed(2))
        : rmbRates.payRmbRate
      : paramSource && paramDest
      ? Number((paramSource / paramDest).toFixed(2))
      : rmbRates.payNairaRate);

  const destinationAmount =
    targetRequest?.destinationAmount ||
    paramDest ||
    (direction === 'rmb_to_naira'
      ? Math.round(sourceAmount * rateApplied)
      : Math.round(sourceAmount / rateApplied));

  const customerName = targetRequest?.customerName || paramName || '';
  const customerEmail = targetRequest?.customerEmail || paramEmail || '';
  const customerPhone = targetRequest?.customerWhatsApp || paramPhone || '';

  return (
    <PayNairaView
      orderId={orderId || undefined}
      direction={direction}
      sourceAmount={sourceAmount}
      rateApplied={rateApplied}
      destinationAmount={destinationAmount}
      customerName={customerName}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
    />
  );
}

export default function PayNairaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />
      <div className="flex-1">
        <Suspense fallback={<div className="text-center py-24 text-sm text-[#716769]">Loading RMB settlement desk...</div>}>
          <PayNairaContent />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
