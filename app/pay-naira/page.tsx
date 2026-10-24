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

  const orderId = searchParams.get('order') || 'RMB-0142';
  const targetRequest = rmbRequests.find(r => r.id === orderId);

  const paramSource = searchParams.get('source') ? Number(searchParams.get('source')) : null;
  const paramDest = searchParams.get('dest') ? Number(searchParams.get('dest')) : null;

  // Exact Figma Order RMB-0142 defaults: ₦2,154,000 for ¥10,000 at 215.40
  const sourceAmount = targetRequest?.sourceAmount || paramSource || 2154000;
  const rateApplied = targetRequest?.rateApplied || rmbRates.payNairaRate || 215.40;
  const destinationAmount = targetRequest?.destinationAmount || paramDest || 10000;
  const customerName = targetRequest?.customerName || 'Chidi Okafor';
  const customerEmail = targetRequest?.customerEmail || 'chidi.o@email.com';
  const customerPhone = targetRequest?.customerWhatsApp || '0803 000 0000';

  return (
    <PayNairaView
      orderId={orderId}
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
