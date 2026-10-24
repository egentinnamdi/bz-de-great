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
  MessageSquare,
  QrCode,
  Building,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { supabaseService } from '@/lib/supabase/service';
import { sendTransactionEmail } from '@/lib/email/service';

interface PayNairaViewProps {
  orderId?: string;
  direction?: 'rmb_to_naira' | 'naira_to_rmb';
  sourceAmount?: number;
  rateApplied?: number;
  destinationAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const NIGERIAN_BANKS = [
  'Zenith Bank',
  'Guaranty Trust Bank (GTBank)',
  'Access Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Providus Bank',
  'Stanbic IBTC',
  'Fidelity Bank',
  'Wema Bank',
  'Sterling Bank',
  'OPay Digital Services',
  'PalmPay',
  'Kuda Microfinance Bank',
  'Moniepoint MFB'
];

export function PayNairaView({
  orderId: initialOrderId,
  direction = 'rmb_to_naira',
  sourceAmount = 10000,
  rateApplied = 205.00,
  destinationAmount = 2050000,
  customerName: initialCustomerName = '',
  customerEmail: initialCustomerEmail = '',
  customerPhone: initialCustomerPhone = ''
}: PayNairaViewProps) {
  const { toast } = useToast();
  const { createRmbRequest, updateRmbRequest, addActivity, rmbRates } = useStore();

  // Stable order reference
  const [orderId] = useState<string>(() => {
    if (initialOrderId) return initialOrderId;
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `RMB-0${randomNum}`;
  });

  // Rate lock countdown timer: exactly 25 minutes (1500 seconds)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  // Copy states for each row
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states - Customer contact
  const [name, setName] = useState(initialCustomerName || '');
  const [email, setEmail] = useState(initialCustomerEmail || 'egentinnamdi10@gmail.com');
  const [phone, setPhone] = useState(initialCustomerPhone || '');

  // Payout destination - When paying RMB to get Naira (Nigerian Bank)
  const [payoutBank, setPayoutBank] = useState('Zenith Bank');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
  const [payoutAccountName, setPayoutAccountName] = useState(initialCustomerName || '');

  // Payout destination - When paying Naira to get RMB (Alipay/WeChat/Chinese Bank)
  const [rmbChannel, setRmbChannel] = useState<'Alipay' | 'WeChat Pay' | 'Chinese Bank'>('Alipay');
  const [rmbAccountDetails, setRmbAccountDetails] = useState('');
  const [rmbRecipientName, setRmbRecipientName] = useState('');

  // Payment proof & upload (strictly null initially - only shows when user uploads)
  const [receiptFile, setReceiptFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
    file?: File;
  } | null>(null);
  const [confirmedCheck, setConfirmedCheck] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResetTimer = () => {
    setSecondsLeft(25 * 60);
    setIsTimerExpired(false);
    toast({
      title: 'Rate lock refreshed',
      description: 'Your rate has been re-locked for 25 minutes.',
      variant: 'default'
    });
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

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setReceiptFile({
          name: file.name,
          size: `${sizeStr} · Attached`,
          dataUrl,
          file
        });
        toast({
          title: 'Receipt attached',
          description: file.name,
          variant: 'default'
        });
      };
      reader.onerror = () => {
        toast({
          title: 'Error reading file',
          description: 'Could not read receipt file. Please select another image or PDF.',
          variant: 'error'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your full name.',
        variant: 'warning'
      });
      return;
    }
    if (!phone.trim() || phone.trim() === '+234') {
      toast({
        title: 'WhatsApp number required',
        description: 'Please provide a valid WhatsApp number so our treasury desk can reach you.',
        variant: 'warning'
      });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Valid email required',
        description: 'Please provide your email address to receive your official receipt and live status tracking link.',
        variant: 'warning'
      });
      return;
    }
    if (!receiptFile) {
      toast({
        title: 'Please attach transfer receipt',
        description: 'Upload a screenshot or PDF slip of your payment transfer.',
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

    setIsSubmitting(true);

    try {
      let finalReceiptUrl: string | undefined = undefined;

      if (receiptFile) {
        if (receiptFile.file) {
          try {
            finalReceiptUrl = await supabaseService.uploadReceipt(receiptFile.file, receiptFile.name);
          } catch (uploadErr) {
            console.warn('Storage upload fallback to dataUrl:', uploadErr);
            finalReceiptUrl = receiptFile.dataUrl;
          }
        } else if (receiptFile.dataUrl) {
          finalReceiptUrl = receiptFile.dataUrl;
        }
      }

      const destinationChannel = direction === 'rmb_to_naira' ? payoutBank : rmbChannel;
      const destinationDetails = direction === 'rmb_to_naira'
        ? `${payoutBank} - ${payoutAccountNumber} (${payoutAccountName || name})`
        : `${rmbChannel}: ${rmbAccountDetails || 'To be confirmed'} (${rmbRecipientName || name})`;

      await createRmbRequest({
        id: orderId,
        reference: orderId,
        direction,
        sourceAmount,
        rateApplied,
        destinationAmount,
        customerName: name.trim(),
        customerEmail: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@client.com`,
        customerWhatsApp: phone.trim(),
        destinationChannel,
        destinationAccountDetails: destinationDetails,
        senderBank: direction === 'naira_to_rmb' ? payoutBank : 'WeChat / Alipay / Chinese Bank',
        senderAccountName: name.trim(),
        receiptUrl: finalReceiptUrl,
        notes: direction === 'rmb_to_naira'
          ? `Pay ¥${sourceAmount.toLocaleString()} → Payout ₦${destinationAmount.toLocaleString('en-NG')} to ${destinationDetails}`
          : `Pay ₦${sourceAmount.toLocaleString('en-NG')} → Payout ¥${destinationAmount.toLocaleString()} to ${destinationDetails}`,
        status: 'receipt_received'
      });

      await addActivity({
        actorName: name.trim(),
        actorRole: 'Customer',
        action: `submitted payment receipt for ${orderId}`,
        targetId: orderId,
        target: `${orderId} · ${direction === 'rmb_to_naira' ? `¥${sourceAmount.toLocaleString()} → ₦${destinationAmount.toLocaleString('en-NG')}` : `₦${sourceAmount.toLocaleString('en-NG')} → ¥${destinationAmount.toLocaleString()}`}`,
        details: `Payout to: ${destinationDetails}`,
        category: 'payments'
      });

      // Dispatch automated standard luxury email receipt to customer
      sendTransactionEmail({
        recipientEmail: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@client.com`,
        recipientName: name.trim(),
        transactionId: orderId,
        transactionType: direction,
        event: 'order_submitted',
        statusDisplay: 'Receipt Under Treasury Review',
        statusBadgeColor: 'amber',
        sourceAmountFormatted: direction === 'rmb_to_naira' ? `¥${sourceAmount.toLocaleString('en-US')}.00 RMB` : `₦${sourceAmount.toLocaleString('en-NG')}.00 Naira`,
        rateAppliedFormatted: `¥1 = ₦${rateApplied.toFixed(2)}`,
        amountFormatted: direction === 'rmb_to_naira' ? `₦${destinationAmount.toLocaleString('en-NG')}.00 Naira` : `¥${destinationAmount.toLocaleString('en-US')}.00 RMB`,
        payoutDetails: destinationDetails,
        receiptUrl: finalReceiptUrl
      });

      setIsSubmitted(true);
      toast({
        title: 'Payment submitted successfully',
        description: `Order ${orderId} is now under verification by our treasury desk. An email receipt has been sent to ${email.trim() || name}.`,
        variant: 'success'
      });
    } catch (err) {
      console.warn('Submission error:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRmbToNaira = direction === 'rmb_to_naira';

  // Dynamic WhatsApp prefilled link with full order ticket
  const waLink = `https://wa.me/2348139690031?text=${encodeURIComponent(
    isRmbToNaira
      ? `Hello BZ Group, I have completed the RMB transfer for Order ${orderId}.\n\n- You Pay: ¥${sourceAmount.toLocaleString('en-US')} RMB\n- Rate: ¥1 = ₦${rateApplied.toFixed(2)}\n- Payout To Me: ₦${destinationAmount.toLocaleString('en-NG')} Naira\n- My Nigerian Bank: ${payoutBank} - ${payoutAccountNumber} (${payoutAccountName || name})\n- Customer: ${name} (${phone})\n\nPlease confirm receipt and disburse Naira.`
      : `Hello BZ Group, I have completed the Naira transfer for Order ${orderId}.\n\n- You Pay: ₦${sourceAmount.toLocaleString('en-NG')} Naira\n- Rate: ¥1 = ₦${rateApplied.toFixed(2)}\n- Payout To Me: ¥${destinationAmount.toLocaleString('en-US')} RMB\n- My RMB Target: ${rmbChannel} - ${rmbAccountDetails} (${rmbRecipientName || name})\n- Customer: ${name} (${phone})\n\nPlease confirm receipt and disburse RMB.`
  )}`;

  return (
    <div className="w-full bg-white text-[#1b1416]">
      {/* ========================================================
          1. PAGE HEADER (Figma: Page header [1440x249] fill=#ffffff, stroke=#eae3e4)
         ======================================================== */}
      <section className="w-full bg-white border-b border-[#eae3e4] pt-7 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb: Home > RMB exchange > Current direction */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#716769] mb-4">
            <Link href="/" className="hover:text-[#81141f] transition-colors">
              Home
            </Link>
            <span className="text-[#716769] font-normal">&gt;</span>
            <Link href="/rmb-exchange" className="hover:text-[#81141f] transition-colors">
              RMB exchange
            </Link>
            <span className="text-[#716769] font-normal">&gt;</span>
            <span className="text-[#1b1416] font-normal">
              {isRmbToNaira ? 'Pay RMB, get naira' : 'Pay naira, get RMB'}
            </span>
          </nav>

          {/* Title Row with Shield Verification */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[36px] sm:text-[40px] font-semibold text-[#1b1416] tracking-tight leading-tight">
                {isRmbToNaira ? 'Pay RMB, get naira' : 'Pay naira, get RMB'}
              </h1>
              <p className="text-[15px] text-[#4a4245] mt-1.5 font-normal">
                Order <strong className="text-[#1b1416] font-semibold">{orderId}</strong> · You pay{' '}
                <strong className="text-[#1b1416] font-semibold">
                  {isRmbToNaira ? `¥${sourceAmount.toLocaleString('en-US')} RMB` : `₦${sourceAmount.toLocaleString('en-NG')} Naira`}
                </strong>{' '}
                and get{' '}
                <strong className="text-[#81141f] font-semibold">
                  {isRmbToNaira ? `₦${destinationAmount.toLocaleString('en-NG')} Naira` : `¥${destinationAmount.toLocaleString('en-US')} RMB`}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#4a4245] font-semibold pb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Every payment is checked by our treasury team before payout</span>
            </div>
          </div>

          {/* 4-Step Progress Stepper (Figma: Stepper) */}
          <div className="mt-8 flex items-center justify-between max-w-[820px]">
            {/* Step 1: Details */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-[26px] h-[26px] rounded-full bg-[#81141f] text-white flex items-center justify-center text-[12px] font-bold shadow-2xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 1</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">Order created</span>
              </div>
            </div>

            {/* Connecting Bar 1 */}
            <div className="flex-1 h-[2px] bg-[#81141f] mx-3 sm:mx-4" />

            {/* Step 2: Transfer */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-[26px] h-[26px] rounded-full ${isSubmitted ? 'bg-[#81141f] text-white font-bold' : 'border border-[#81141f] bg-white text-[#81141f] font-semibold'} flex items-center justify-center text-[12px]`}>
                {isSubmitted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 2</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">
                  {isRmbToNaira ? 'Transfer RMB' : 'Transfer naira'}
                </span>
              </div>
            </div>

            {/* Connecting Bar 2 */}
            <div className={`flex-1 h-[2px] ${isSubmitted ? 'bg-[#81141f]' : 'bg-[#eae3e4]'} mx-3 sm:mx-4`} />

            {/* Step 3: Upload receipt */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-[26px] h-[26px] rounded-full ${isSubmitted ? 'bg-[#81141f] text-white font-bold' : 'border border-[#81141f] bg-white text-[#81141f] font-semibold'} flex items-center justify-center text-[12px]`}>
                {isSubmitted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 3</span>
                <span className="text-[15px] font-semibold text-[#1b1416]">Upload receipt</span>
              </div>
            </div>

            {/* Connecting Bar 3 */}
            <div className={`flex-1 h-[2px] ${isSubmitted ? 'bg-[#81141f]' : 'bg-[#eae3e4]'} mx-3 sm:mx-4`} />

            {/* Step 4: Receive funds */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-[26px] h-[26px] rounded-full ${isSubmitted ? 'border-2 border-[#81141f] bg-[#fcf3f4] text-[#81141f] font-bold animate-pulse' : 'border border-[#eae3e4] bg-white text-[#716769] font-semibold'} flex items-center justify-center text-[13px]`}>
                4
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] text-[#716769] font-medium">Step 4</span>
                <span className={`text-[15px] font-semibold ${isSubmitted ? 'text-[#81141f]' : 'text-[#716769]'}`}>
                  {isRmbToNaira ? 'Receive naira' : 'Receive RMB'}
                </span>
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
                Card 1: Rate lock banner (25-minute timer as requested)
               ---------------------------------------------------- */}
            <div className="rounded-[12px] bg-[#fbf0df] p-5 sm:p-6 flex items-center justify-between gap-4 border border-[#f3d9b5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f6e4c7] flex items-center justify-center shrink-0 text-[#9a5800]">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1b1416] leading-snug">
                    {isTimerExpired
                      ? `Rate lock expired for ¥1 = ₦${rateApplied.toFixed(2)}`
                      : `Your rate of ¥1 = ₦${rateApplied.toFixed(2)} is locked for ${formatTimer(secondsLeft)}`}
                  </h3>
                  <p className="text-[13px] text-[#4a4245] mt-0.5 font-normal">
                    {isTimerExpired
                      ? 'The 25-minute lock expired. Tap refresh to lock in with current treasury rates.'
                      : 'If the timer runs out before you upload a receipt, we will re-quote at the current rate.'}
                  </p>
                </div>
              </div>

              {/* Countdown Pill Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {isTimerExpired ? (
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#81141f] text-white text-xs font-semibold hover:bg-[#680e18] transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh lock</span>
                  </button>
                ) : (
                  <div className="bg-white px-4 py-1.5 rounded-[8px] shadow-xs flex items-center gap-2 border border-[#f0d1a4]">
                    <span className="w-2 h-2 rounded-full bg-[#9a5800] animate-pulse-subtle" />
                    <span className="font-sans text-[22px] font-bold text-[#9a5800] tracking-wide">
                      {formatTimer(secondsLeft)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 2: Account Transfer Details Table
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1b1416] tracking-tight">
                  {isRmbToNaira
                    ? `Transfer ¥${sourceAmount.toLocaleString('en-US')}.00 to our official RMB account`
                    : `Pay ₦${sourceAmount.toLocaleString('en-NG')}.00 into our company account`}
                </h2>
                <p className="text-[15px] text-[#4a4245] mt-1 leading-relaxed">
                  {isRmbToNaira
                    ? `Send from your WeChat, Alipay or Chinese Bank app. Add reference ${orderId} in the transfer note so we can match your payment instantly.`
                    : `Use your bank app to send the exact amount below. Add the reference ${orderId} so we can match your payment quickly.`}
                </p>
              </div>

              {/* Transfer Details Rows */}
              {isRmbToNaira ? (
                /* RMB Collection Channels */
                <div className="border border-[#eae3e4] rounded-[12px] overflow-hidden divide-y divide-[#eae3e4]">
                  {/* Channel 1: WeChat Pay */}
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[14px] text-[#716769] w-36 sm:w-44 shrink-0 font-medium">WeChat Pay (微信支付)</span>
                    <span className="text-[15px] font-semibold text-[#1b1416] flex-1">
                      BZ Global Treasury · <strong className="font-mono text-[#81141f]">bzgroup_cny</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('bzgroup_cny', 'wechat')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'wechat' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'wechat' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Channel 2: Alipay */}
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[14px] text-[#716769] w-36 sm:w-44 shrink-0 font-medium">Alipay (支付宝)</span>
                    <span className="text-[15px] font-semibold text-[#1b1416] flex-1">
                      BZ DE GREAT GLOBAL · <strong className="font-mono text-[#81141f]">payments@bzdegreat.com</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('payments@bzdegreat.com', 'alipay')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'alipay' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'alipay' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Channel 3: Chinese Bank Transfer (UnionPay) */}
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[14px] text-[#716769] w-36 sm:w-44 shrink-0 font-medium">Bank (中国工商银行 ICBC)</span>
                    <span className="text-[15px] font-semibold text-[#1b1416] flex-1">
                      6222 0210 0112 8894 · BZ GLOBAL UNIVERSAL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('6222021001128894', 'bank')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'bank' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Row 4: Amount to transfer */}
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[14px] text-[#716769] w-36 sm:w-44 shrink-0 font-medium">Amount to send</span>
                    <span className="text-[16px] font-bold font-mono text-[#1b1416] flex-1">
                      ¥{sourceAmount.toLocaleString('en-US')}.00 RMB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${sourceAmount}.00`, 'amount')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'amount' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Row 5: Reference */}
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-[#fcf3f4]">
                    <span className="text-[14px] text-[#716769] w-36 sm:w-44 shrink-0 font-medium">Reference / Note</span>
                    <span className="text-[18px] font-mono font-bold text-[#81141f] flex-1 tracking-wide">{orderId}</span>
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
              ) : (
                /* Nigerian Bank Accounts */
                <div className="border border-[#eae3e4] rounded-[12px] overflow-hidden divide-y divide-[#eae3e4]">
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

                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Account number</span>
                    <span className="text-[15px] font-semibold text-[#1b1416] flex-1 font-mono">0010252664</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('0010252664', 'accountNumber')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'accountNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'accountNumber' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-4 sm:px-6 flex items-center justify-between bg-white">
                    <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Amount</span>
                    <span className="text-[15px] font-semibold text-[#1b1416] flex-1 font-mono">₦{sourceAmount.toLocaleString('en-NG')}.00</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${sourceAmount}.00`, 'amount')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-[#eae3e4] bg-white hover:bg-[#f8f5f5] text-[12px] font-medium text-[#4a4245] transition-colors cursor-pointer"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#716769]" />}
                      <span>{copiedField === 'amount' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-4 sm:px-6 flex items-center justify-between bg-[#fcf3f4]">
                    <span className="text-[15px] text-[#716769] w-36 sm:w-44 shrink-0 font-normal">Reference</span>
                    <span className="text-[18px] font-mono font-bold text-[#81141f] flex-1 tracking-wide">{orderId}</span>
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
              )}
            </div>

            {/* ----------------------------------------------------
                Card 3: Upload Receipt & Payout Destination Form
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 sm:p-8 shadow-xs space-y-6">
              {isSubmitted ? (
                /* Confirmed Success State */
                <div className="text-center py-6 space-y-5 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Payment Proof Logged · Treasury Verification In Progress
                    </span>
                    <h2 className="font-serif text-[26px] font-bold text-[#1b1416] tracking-tight">
                      Order {orderId} Submitted
                    </h2>
                    <p className="text-[14px] text-[#4a4245] max-w-lg mx-auto leading-relaxed">
                      Thank you! Your payment receipt has been received. Our treasury officers are verifying the inflow and will disburse{' '}
                      <strong className="text-[#81141f] font-semibold">
                        {isRmbToNaira ? `₦${destinationAmount.toLocaleString('en-NG')}.00 Naira` : `¥${destinationAmount.toLocaleString('en-US')}.00 RMB`}
                      </strong>{' '}
                      to your specified payout account immediately.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8f5f5] border border-[#eae3e4] max-w-md mx-auto text-xs text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#716769]">Order Reference:</span>
                      <strong className="font-mono text-sm text-[#81141f]">{orderId}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#716769]">Customer:</span>
                      <span className="font-semibold text-[#1b1416]">{name} ({phone})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#716769]">Payout Target:</span>
                      <span className="font-bold text-[#81141f]">
                        {isRmbToNaira
                          ? `${payoutBank} · ${payoutAccountNumber} (${payoutAccountName})`
                          : `${rmbChannel} · ${rmbAccountDetails || 'To be confirmed'}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#716769]">Payout Amount:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {isRmbToNaira ? `₦${destinationAmount.toLocaleString('en-NG')}.00` : `¥${destinationAmount.toLocaleString('en-US')}.00`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-[14px] transition-colors shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Notify Treasury on WhatsApp</span>
                    </a>
                    <Link
                      href="/rmb-exchange"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-[8px] border border-[#eae3e4] bg-white text-[#1b1416] font-semibold text-[14px] hover:bg-[#f8f5f5] transition-colors"
                    >
                      Return to RMB Exchange
                    </Link>
                  </div>
                </div>
              ) : (
                /* Input Form */
                <>
                  <div>
                    <h2 className="text-[22px] font-bold text-[#1b1416] tracking-tight">
                      Upload your payment receipt & payout details
                    </h2>
                    <p className="text-[15px] text-[#4a4245] mt-1 font-normal">
                      Attach a screenshot or PDF slip of your transfer, and tell us where to disburse your funds.
                    </p>
                  </div>

                  {/* Dashed Dropzone */}
                  <label className="flex flex-col items-center justify-center p-7 sm:p-8 rounded-[14px] border border-dashed border-[#ebc7cb] bg-[#fbf3f4] hover:bg-[#f8ecee] cursor-pointer transition-colors text-center group">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#81141f] mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-[15px] text-[#1b1416] font-semibold">
                      Drag your transfer slip here or <span className="text-[#81141f] underline font-semibold">browse files</span>
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

                  {/* Uploaded File Bar */}
                  {receiptFile && (
                    <div className="rounded-[12px] border border-[#eae3e4] bg-white p-3.5 sm:px-4 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {receiptFile.dataUrl && receiptFile.dataUrl.startsWith('data:image/') ? (
                          <img
                            src={receiptFile.dataUrl}
                            alt="Receipt Slip"
                            className="w-10 h-10 rounded-[8px] object-cover border border-[#eae3e4] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-[8px] bg-rose-50 flex items-center justify-center shrink-0 text-[#81141f]">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
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

                  {/* Form Inputs */}
                  <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {/* Customer Contact Section */}
                    <div>
                      <h3 className="text-sm font-bold text-[#1b1416] mb-3">1. Your contact details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#1b1416] block">
                            Full name <span className="text-[#81141f]">*</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Chidi Okafor"
                            className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#1b1416] block">
                            WhatsApp number <span className="text-[#81141f]">*</span>
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+234 813 000 0000"
                            className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#1b1416] block">
                            Email address (for receipt &amp; tracker) <span className="text-[#81141f]">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payout Destination Section (As confirmed with user) */}
                    <div className="pt-2 border-t border-[#eae3e4]">
                      <h3 className="text-sm font-bold text-[#1b1416] mb-1">
                        {isRmbToNaira
                          ? `2. Where should we send your ₦${destinationAmount.toLocaleString('en-NG')}.00 Naira payout?`
                          : `2. Where should we send your ¥${destinationAmount.toLocaleString('en-US')}.00 RMB payout?`}
                      </h3>
                      <p className="text-xs text-[#716769] mb-3">
                        {isRmbToNaira
                          ? 'Provide your verified Nigerian commercial or fintech bank account for immediate disbursement.'
                          : 'Provide your Alipay ID, WeChat Pay account, or Chinese UnionPay bank account.'}
                      </p>

                      {isRmbToNaira ? (
                        /* Nigerian Bank Inputs */
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              Receiving Bank <span className="text-[#81141f]">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={payoutBank}
                                onChange={e => setPayoutBank(e.target.value)}
                                className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-10 font-normal"
                              >
                                {NIGERIAN_BANKS.map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-[#716769] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              Account Number <span className="text-[#81141f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={payoutAccountNumber}
                              onChange={e => setPayoutAccountNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                              placeholder="10-digit NUBAN"
                              maxLength={10}
                              className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] font-mono text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              Account Name <span className="text-[#81141f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={payoutAccountName}
                              onChange={e => setPayoutAccountName(e.target.value)}
                              placeholder="Name on bank account"
                              className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        /* RMB Channel Inputs */
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              RMB Payout Channel <span className="text-[#81141f]">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={rmbChannel}
                                onChange={e => setRmbChannel(e.target.value as any)}
                                className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] appearance-none cursor-pointer pr-10 font-normal"
                              >
                                <option value="Alipay">Alipay (支付宝)</option>
                                <option value="WeChat Pay">WeChat Pay (微信支付)</option>
                                <option value="Chinese Bank">Chinese Bank (UnionPay)</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-[#716769] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              {rmbChannel === 'Alipay' ? 'Alipay ID / Mobile' : rmbChannel === 'WeChat Pay' ? 'WeChat ID / Mobile' : 'Card Number'} <span className="text-[#81141f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={rmbAccountDetails}
                              onChange={e => setRmbAccountDetails(e.target.value)}
                              placeholder="Account ID or card"
                              className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-[#1b1416] block">
                              Recipient Name in China <span className="text-[#81141f]">*</span>
                            </label>
                            <input
                              type="text"
                              value={rmbRecipientName}
                              onChange={e => setRmbRecipientName(e.target.value)}
                              placeholder="Chinese or English name"
                              className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors font-normal"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Checkbox confirmation */}
                    <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                      <input
                        type="checkbox"
                        checked={confirmedCheck}
                        onChange={e => setConfirmedCheck(e.target.checked)}
                        className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f] cursor-pointer"
                      />
                      <span className="text-[14px] text-[#1b1416] group-hover:text-[#81141f] transition-colors font-normal">
                        I confirm that I have transferred the exact amount with reference <strong>{orderId}</strong> and provided accurate payout details.
                      </span>
                    </label>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-6 pt-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-[52px] px-8 rounded-[8px] bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-[15px] flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>{isSubmitting ? 'Logging order...' : 'Submit for confirmation'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <Link
                        href="/rmb-exchange"
                        className="text-[14px] font-medium text-[#716769] hover:text-[#1b1416] hover:underline cursor-pointer"
                      >
                        Cancel order
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (4 cols = ~400px in 1200px container) */}
          <div className="lg:col-span-4 space-y-6">
            {/* ----------------------------------------------------
                Card 1: Order Summary
               ---------------------------------------------------- */}
            <div className="bg-white rounded-[18px] border border-[#eae3e4] p-6 shadow-xs space-y-5">
              <h3 className="text-[18px] font-semibold text-[#1b1416]">
                Order summary
              </h3>

              <div className="space-y-3.5 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#716769] font-normal">You pay</span>
                  <span className="font-bold text-[#1b1416] text-[15px]">
                    {isRmbToNaira ? `¥${sourceAmount.toLocaleString('en-US')}.00 RMB` : `₦${sourceAmount.toLocaleString('en-NG')}.00 Naira`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#716769] font-normal">Exchange rate</span>
                  <span className="font-normal text-[#1b1416]">¥1 = ₦{rateApplied.toFixed(2)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[#716769] font-normal">Payout destination</span>
                  <span className="font-medium text-[#1b1416] text-right truncate max-w-[200px]">
                    {isRmbToNaira
                      ? `${payoutBank} · ${payoutAccountNumber || '...'}`
                      : `${rmbChannel} · ${rmbAccountDetails || '...'}`}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-[#eae3e4] w-full" />

              {/* You Get Highlight */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-semibold text-[15px] text-[#1b1416]">You get</span>
                <span className="font-sans font-bold text-[24px] text-[#81141f]">
                  {isRmbToNaira
                    ? `₦${destinationAmount.toLocaleString('en-NG')}.00`
                    : `¥${destinationAmount.toLocaleString('en-US')}.00`}
                </span>
              </div>

              {/* Customer Pill Card */}
              <div className="rounded-[12px] bg-[#f8f5f5] p-3 flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-[#4e0b13] text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                  {name ? name.slice(0, 2).toUpperCase() : 'BZ'}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] text-[#1b1416] leading-snug truncate">
                    {name || 'Prospective Client'}
                  </div>
                  <div className="text-[12px] text-[#716769] truncate font-normal">
                    {phone || 'WhatsApp contact'} {email ? `· ${email}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                Card 2: What happens next (Timeline)
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
                    <div className="font-semibold text-[15px] text-[#1b1416] leading-tight">Order initialized</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">Rate locked for 25 minutes</div>
                  </div>
                </div>

                {/* Step 2: Receipt uploaded */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-[20px] h-[20px] rounded-full ${isSubmitted ? 'bg-[#81141f] text-white flex items-center justify-center shrink-0 shadow-2xs' : 'bg-white border-2 border-[#81141f] flex items-center justify-center shrink-0'}`}>
                      {isSubmitted ? <Check className="w-3 h-3 stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#81141f]" />}
                    </div>
                    <div className={`w-[2px] h-9 ${isSubmitted ? 'bg-[#81141f]' : 'bg-[#eae3e4]'} mt-1`} />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#1b1416] leading-tight">Receipt uploaded</div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">
                      {isSubmitted ? 'Submitted just now' : 'Attach transfer proof above'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Confirmed by BZ */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-[20px] h-[20px] rounded-full ${isSubmitted ? 'bg-white border-2 border-[#81141f] flex items-center justify-center shrink-0' : 'bg-white border border-[#a89d9f] shrink-0'}`}>
                      {isSubmitted && <div className="w-1.5 h-1.5 rounded-full bg-[#81141f] animate-ping" />}
                    </div>
                    <div className="w-[2px] h-9 bg-[#eae3e4] mt-1" />
                  </div>
                  <div>
                    <div className={`font-semibold text-[15px] leading-tight ${isSubmitted ? 'text-[#1b1416]' : 'text-[#716769]'}`}>Confirmed by BZ</div>
                    <div className={`text-[13px] mt-0.5 ${isSubmitted ? 'text-[#81141f] font-semibold' : 'text-[#716769] font-normal'}`}>
                      {isSubmitted ? 'Treasury matching inflow...' : 'We verify the funds landed'}
                    </div>
                  </div>
                </div>

                {/* Step 4: Disbursed to you */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[20px] rounded-full bg-white border border-[#a89d9f] shrink-0" />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#716769] leading-tight">
                      {isRmbToNaira ? 'Naira disbursed to your bank' : 'RMB disbursed to your account'}
                    </div>
                    <div className="text-[13px] text-[#716769] mt-0.5 font-normal">Immediate payout clearance</div>
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
