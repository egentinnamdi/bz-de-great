'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Upload,
  FileText,
  X,
  ChevronDown,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';

interface PayNairaViewProps {
  orderId?: string;
  sourceAmount?: number;
  rateApplied?: number;
  destinationAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export function PayNairaView({
  orderId = 'RMB-0142',
  sourceAmount = 2154000,
  rateApplied = 215.40,
  destinationAmount = 10000,
  customerName = 'Chidi Okafor',
  customerEmail = 'chidi.o@email.com',
  customerPhone = '0803 000 0000'
}: PayNairaViewProps) {
  const { toast } = useToast();

  // Rate lock countdown timer (defaults to 24:18 = 1458 seconds)
  const [secondsLeft, setSecondsLeft] = useState(1458);

  // Copy states for each row
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [receiptFile, setReceiptFile] = useState<{ name: string; size: string } | null>({
    name: 'transfer-receipt.pdf',
    size: '248 KB · Uploaded just now'
  });
  const [senderName, setSenderName] = useState(customerName);
  const [sendingBank, setSendingBank] = useState('Select your bank');
  const [confirmedCheck, setConfirmedCheck] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = (text: string, fieldId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: text,
        variant: 'default'
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setReceiptFile({
        name: file.name,
        size: `${sizeStr} · Uploaded just now`
      });
      toast({
        title: 'Receipt attached',
        description: file.name,
        variant: 'default'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast({
        title: 'Please attach transfer receipt',
        description: 'Upload a screenshot or PDF slip of your payment.',
        variant: 'warning'
      });
      return;
    }
    if (!confirmedCheck) {
      toast({
        title: 'Confirmation required',
        description: 'Please confirm that you have sent the exact amount.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: 'Payment submitted for confirmation',
      description: 'Our treasury desk is verifying the inflow.',
      variant: 'default'
    });
  };

  const waLink = `https://wa.me/2348139690031?text=${encodeURIComponent(
    `Hello BZ Group, I have completed the Naira transfer for Order ${orderId} (₦${sourceAmount.toLocaleString('en-NG')} for ¥${destinationAmount.toLocaleString('en-NG')} RMB). Please confirm receipt.`
  )}`;

  return (
    <div className="w-full bg-white text-[#1b1416]">
      {/* ========================================================
          1. PAGE HEADER (Figma: Page header [1440x249] fill=#ffffff, stroke=#eae3e4)
         ======================================================== */}
      <section className="w-full bg-white border-b border-[#eae3e4] pt-7 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb: Home > RMB exchange */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#716769] mb-4">
            <Link href="/" className="hover:text-[#81141f] transition-colors">
              Home
            </Link>
            <span className="text-[#716769] font-normal">&gt;</span>
            <span className="text-[#1b1416] font-normal">RMB exchange</span>
          </nav>

          {/* Title Row with Shield Verification */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[36px] sm:text-[40px] font-semibold text-[#1b1416] tracking-tight leading-tight">
                Pay naira, get RMB
              </h1>
              <p className="text-[15px] text-[#4a4245] mt-1.5 font-normal">
                Order {orderId} · You pay <strong className="text-[#1b1416] font-semibold">₦{sourceAmount.toLocaleString('en-NG')}</strong> and get{' '}
                <strong className="text-[#81141f] font-semibold">¥{destinationAmount.toLocaleString('en-NG')}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#4a4245] font-semibold pb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Every payment is checked by our team before payout</span>
            </div>
          </div>

          {/* 4-Step Progress Stepper (Figma: Stepper) */}
          <div className="mt-8 flex items-center justify-between max-w-[820px]">
            {/* Step 1: Your details (Done) */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-[26px] h-[26px] rounded-full bg-[#81141f] text-white flex items-center justify-center text-[12px] font-bold shadow-2xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 1</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">Your details</span>
              </div>
            </div>

            {/* Connecting Bar 1 (Wine #81141f) */}
            <div className="flex-1 h-[2px] bg-[#81141f] mx-3 sm:mx-4" />

            {/* Step 2: Transfer naira (Active) */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-[26px] h-[26px] rounded-full border border-[#81141f] bg-white text-[#81141f] flex items-center justify-center text-[13px] font-semibold">
                2
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 2</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">Transfer naira</span>
              </div>
            </div>

            {/* Connecting Bar 2 (Gray #eae3e4) */}
            <div className="flex-1 h-[2px] bg-[#eae3e4] mx-3 sm:mx-4" />

            {/* Step 3: Upload receipt */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-[26px] h-[26px] rounded-full border border-[#81141f] bg-white text-[#81141f] flex items-center justify-center text-[13px] font-semibold">
                3
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 3</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">Upload receipt</span>
              </div>
            </div>

            {/* Connecting Bar 3 (Gray #eae3e4) */}
            <div className="flex-1 h-[2px] bg-[#eae3e4] mx-3 sm:mx-4" />

            {/* Step 4: Receive RMB */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-[26px] h-[26px] rounded-full border border-[#eae3e4] bg-white text-[#716769] flex items-center justify-center text-[13px] font-semibold">
                4
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 4</span>
                <span className="text-[15px] font-semibold text-[#716769]">Receive RMB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MAIN BODY (Figma: Body [1440x1373] fill=#ffffff)
         ======================================================== */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Main flow (8 cols = ~768px in 1200px container) */}
          <div className="lg:col-span-8 space-y-6">
            {/* ----------------------------------------------------
                Card 1: Rate lock banner (Figma: fill=#fbf0df r=12)
               ---------------------------------------------------- */}
            <div className="rounded-[12px] bg-[#fbf0df] p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f6e4c7] flex items-center justify-center shrink-0 text-[#9a5800]">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1b1416] leading-snug">
                    Your rate of ¥1 = ₦{rateApplied.toFixed(2)} is locked for {formatTimer(secondsLeft)}
                  </h3>
                  <p className="text-[13px] text-[#4a4245] mt-0.5 font-normal">
                    If the timer runs out before you upload a receipt, we'll re-quote at the current rate.
                  </p>
                </div>
              </div>

              {/* Countdown Pill Badge */}
              <div className="shrink-0 bg-white px-4 py-1.5 rounded-[8px] shadow-xs">
                <span className="font-sans text-[22px] font-bold text-[#9a5800] tracking-wide">
                  {formatTimer(secondsLeft)}
                </span>
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 2: Bank transfer details (Figma: fill=#ffffff stroke=#eae3e4 r=18)
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1b1416] tracking-tight">
                  Pay ₦{sourceAmount.toLocaleString('en-NG')}.00 into our company account
                </h2>
                <p className="text-[15px] text-[#4a4245] mt-1 leading-relaxed">
                  Use your bank app to send the exact amount below. Add the reference so we can match your payment quickly.
                </p>
              </div>

              {/* 5 Rows Bank Table */}
              <div className="border border-[#eae3e4] rounded-[12px] overflow-hidden divide-y divide-[#eae3e4]">
                {/* Row 1: Bank */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                  <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Bank</span>
                  <span className="text-[15px] font-semibold text-[#1b1416] flex-1">Premium Trust Bank</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('Premium Trust Bank', 'bank')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                  >
                    {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                    <span>{copiedField === 'bank' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Row 2: Account name */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                  <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Account name</span>
                  <span className="text-[15px] font-semibold text-[#1b1416] flex-1">BZ DE GREAT HOMES AND PROPERTIES</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('BZ DE GREAT HOMES AND PROPERTIES', 'accountName')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                  >
                    {copiedField === 'accountName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                    <span>{copiedField === 'accountName' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Row 3: Account number */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                  <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Account number</span>
                  <span className="text-[15px] font-semibold text-[#1b1416] flex-1">0010252664</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('0010252664', 'accountNumber')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                  >
                    {copiedField === 'accountNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                    <span>{copiedField === 'accountNumber' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Row 4: Amount */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                  <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Amount</span>
                  <span className="text-[15px] font-semibold text-[#1b1416] flex-1">₦{sourceAmount.toLocaleString('en-NG')}.00</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${sourceAmount}.00`, 'amount')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                    <span>{copiedField === 'amount' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Row 5: Reference (Highlight pink/wine tint #fcf3f4) */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-[#fcf3f4]">
                  <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Reference</span>
                  <span className="text-[18px] font-semibold text-[#81141f] flex-1 tracking-wide">{orderId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderId, 'reference')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'reference' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                    <span>{copiedField === 'reference' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 3: Upload payment receipt (Figma: fill=#ffffff stroke=#eae3e4 r=18)
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1b1416] tracking-tight">
                  Upload your payment receipt
                </h2>
                <p className="text-[15px] text-[#4a4245] mt-1 font-normal">
                  A screenshot or PDF from your bank app is fine.
                </p>
              </div>

              {/* Dashed Dropzone (Figma: fill=#fbf3f4, stroke=#ebc7cb dashed [6,5], r=14) */}
              <label className="flex flex-col items-center justify-center p-7 sm:p-8 rounded-[14px] border border-dashed border-[#ebc7cb] bg-[#fbf3f4] hover:bg-[#f8ecee] cursor-pointer transition-colors text-center group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#81141f] mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-[15px] text-[#1b1416] font-semibold">
                  Drag your receipt here or <span className="text-[#81141f] underline font-semibold">browse files</span>
                </div>
                <div className="text-[13px] text-[#716769] mt-1 font-normal">
                  PNG, JPG or PDF · up to 10 MB
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded File Bar (Figma: stroke=#eae3e4 r=12) */}
              {receiptFile && (
                <div className="rounded-[12px] border border-[#eae3e4] bg-white p-3.5 sm:px-4 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-[8px] bg-rose-50 flex items-center justify-center shrink-0 text-[#81141f]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] text-[#1b1416] truncate">
                        {receiptFile.name}
                      </div>
                      <div className="text-[13px] text-[#716769] font-normal">
                        {receiptFile.size}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptFile(null)}
                      className="p-1 text-[#716769] hover:text-[#1b1416] transition-colors cursor-pointer"
                      aria-label="Remove uploaded file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Form Inputs (2 Columns) */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender's account name */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#1b1416] block">
                      Sender's account name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Chidi Okafor"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[15px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                      required
                    />
                  </div>

                  {/* Sending bank */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-[#1b1416] block">
                      Sending bank
                    </label>
                    <div className="relative">
                      <select
                        value={sendingBank}
                        onChange={e => setSendingBank(e.target.value)}
                        className="w-full h-[48px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[15px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-10 font-normal"
                      >
                        <option value="Select your bank">Select your bank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                        <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                        <option value="Providus Bank">Providus Bank</option>
                        <option value="Stanbic IBTC">Stanbic IBTC</option>
                        <option value="Fintech">Fintech (OPay / PalmPay / Kuda)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#716769] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Checkbox with reference confirmation */}
                <label className="flex items-center gap-3 cursor-pointer pt-1 group">
                  <input
                    type="checkbox"
                    checked={confirmedCheck}
                    onChange={e => setConfirmedCheck(e.target.checked)}
                    className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f] cursor-pointer"
                  />
                  <span className="text-[15px] text-[#1b1416] group-hover:text-[#81141f] transition-colors font-normal">
                    I've sent the exact amount with reference <strong>{orderId}</strong>
                  </span>
                </label>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-6 pt-3">
                  <button
                    type="submit"
                    className="h-[52px] px-7 rounded-[8px] bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-[15px] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Submit for confirmation</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Cancel this exchange order?')) {
                        setReceiptFile(null);
                        setConfirmedCheck(false);
                      }
                    }}
                    className="text-[14px] font-medium text-[#716769] hover:text-[#1b1416] hover:underline cursor-pointer"
                  >
                    Cancel order
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4 cols = ~400px in 1200px container) */}
          <div className="lg:col-span-4 space-y-6">
            {/* ----------------------------------------------------
                Card 1: Order Summary (Figma: fill=#ffffff stroke=#eae3e4 r=18)
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
              <h3 className="text-[18px] font-semibold text-[#1b1416]">
                Order summary
              </h3>

              <div className="space-y-3.5 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#716769] font-normal">You pay</span>
                  <span className="font-bold text-[#1b1416] text-[15px]">₦{sourceAmount.toLocaleString('en-NG')}.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#716769] font-normal">Exchange rate</span>
                  <span className="font-normal text-[#1b1416]">¥1 = ₦{rateApplied.toFixed(2)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#716769] font-normal">Receive RMB via</span>
                  <span className="font-normal text-[#1b1416] text-right">Alipay, WeChat Pay or bank</span>
                </div>
              </div>

              {/* Divider (Figma: Rectangle fill=#eae3e4) */}
              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* You Get Highlight */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-semibold text-[15px] text-[#1b1416]">You get</span>
                <span className="font-sans font-bold text-[24px] text-[#81141f]">
                  ¥{destinationAmount.toLocaleString('en-NG')}.00
                </span>
              </div>

              {/* Customer Pill Card (Figma: fill=#f8f5f5 r=12) */}
              <div className="rounded-[12px] bg-[#f8f5f5] p-3 flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-[#4e0b13] text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                  CO
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] text-[#1b1416] leading-snug">{customerName}</div>
                  <div className="text-[12px] text-[#716769] truncate font-normal">{customerEmail} · {customerPhone}</div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 2: What happens next (Figma: fill=#ffffff stroke=#eae3e4 r=18)
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
              <h3 className="text-[18px] font-semibold text-[#1b1416]">
                What happens next
              </h3>

              {/* 4-Step Vertical Timeline */}
              <div className="space-y-0 relative">
                {/* Step 1: Order created */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[20px] rounded-full bg-[#81141f] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div className="w-[2px] h-9 bg-[#81141f] mt-1" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#1b1416] leading-tight">Order created</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">Today, 10:04 AM</div>
                  </div>
                </div>

                {/* Step 2: Receipt uploaded */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[20px] rounded-full bg-white border-2 border-[#81141f] flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#81141f]" />
                    </div>
                    <div className="w-[2px] h-9 bg-[#eae3e4] mt-1" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#1b1416] leading-tight">Receipt uploaded</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">Waiting for your receipt</div>
                  </div>
                </div>

                {/* Step 3: Confirmed by BZ */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[20px] rounded-full bg-white border border-[#a89d9f] shrink-0" />
                    <div className="w-[2px] h-9 bg-[#eae3e4] mt-1" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#716769] leading-tight">Confirmed by BZ</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">We check the transfer landed</div>
                  </div>
                </div>

                {/* Step 4: RMB sent to you */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[20px] rounded-full bg-white border border-[#a89d9f] shrink-0" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#716769] leading-tight">RMB sent to you</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">Details confirmed on WhatsApp</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 3: Questions About Your Exchange CTA (Figma: fill=#4e0b13 r=16)
               ---------------------------------------------------- */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[16px] bg-[#4e0b13] hover:bg-[#3d090f] text-white p-4 sm:p-5 transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-white leading-tight">
                      Questions about your exchange?
                    </div>
                    <div className="text-[13px] text-white/80 mt-0.5 font-normal">
                      Chat with the RMB desk on WhatsApp
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
