'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '@/lib/store';
import { useToast } from './toast-provider';
import { CopyButton } from './ui/copy-button';

interface GetAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: 'rmb_to_naira' | 'naira_to_rmb';
  sourceAmount: number;
  destinationAmount: number;
}

export function GetAccountModal({
  isOpen,
  onClose,
  direction,
  sourceAmount,
  destinationAmount,
}: GetAccountModalProps) {
  const router = useRouter();
  const { createRmbRequest, rmbRates, addActivity } = useStore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsApp, setWhatsApp] = useState('+234 ');

  // Destination fields for Pay Naira -> Get RMB
  const [rmbChannel, setRmbChannel] = useState<'Alipay' | 'WeChat Pay' | 'Chinese Bank'>('Alipay');
  const [rmbAccountDetails, setRmbAccountDetails] = useState('');

  // Destination fields for Pay RMB -> Get Naira
  const [nigerianBank, setNigerianBank] = useState('Zenith Bank');
  const [nigerianAccountNumber, setNigerianAccountNumber] = useState('');
  const [nigerianAccountName, setNigerianAccountName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const rate = direction === 'rmb_to_naira' ? rmbRates.payRmbRate : rmbRates.payNairaRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsApp.trim() || whatsApp.trim() === '+234') {
      toast({
        title: 'Missing contact info',
        description: 'Please provide your full name and WhatsApp contact number.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    const destinationChannel = direction === 'naira_to_rmb' ? rmbChannel : 'Nigerian Bank';
    const destinationDetails = direction === 'naira_to_rmb'
      ? `${rmbChannel}: ${rmbAccountDetails || 'To be confirmed on WhatsApp'}`
      : `${nigerianBank} - ${nigerianAccountNumber} (${nigerianAccountName || name})`;

    const req = await createRmbRequest({
      direction,
      sourceAmount,
      rateApplied: rate,
      destinationAmount,
      customerName: name.trim(),
      customerEmail: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@client.com`,
      customerWhatsApp: whatsApp.trim(),
      destinationChannel,
      destinationAccountDetails: destinationDetails,
      notes: direction === 'naira_to_rmb'
        ? `Customer wants ¥${destinationAmount.toLocaleString()} to ${rmbChannel} (${rmbAccountDetails || 'Not specified'})`
        : `Customer paying ¥${sourceAmount.toLocaleString()} for ₦${destinationAmount.toLocaleString()} to ${destinationDetails}`,
      status: direction === 'naira_to_rmb' ? 'requested' : 'account_sent'
    });

    await addActivity({
      actorName: name.trim(),
      actorRole: 'Customer',
      action: `initiated RMB exchange request ${req.id}`,
      targetId: req.id,
      target: req.id,
      details: direction === 'naira_to_rmb'
        ? `Pay ₦${sourceAmount.toLocaleString('en-NG')} → Get ¥${destinationAmount.toLocaleString()}`
        : `Pay ¥${sourceAmount.toLocaleString()} → Get ₦${destinationAmount.toLocaleString('en-NG')}`,
      category: 'payments'
    });

    setIsSubmitting(false);

    if (direction === 'naira_to_rmb') {
      toast({
        title: 'Order ticket registered',
        description: `Reference ${req.id}. Loading payment instructions...`,
        variant: 'default'
      });
      // Redirect to the Pay Naira settlement desk with order prefilled
      router.push(
        `/pay-naira?order=${req.id}&source=${sourceAmount}&dest=${destinationAmount}&name=${encodeURIComponent(
          name.trim()
        )}&email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(whatsApp.trim())}`
      );
      onClose();
    } else {
      setSubmittedRef(req.id);
      toast({
        title: 'RMB ticket logged',
        description: `Reference code: ${req.id}`,
        variant: 'default'
      });
    }
  };

  const handleOpenWhatsApp = () => {
    if (!submittedRef) return;
    const msg = `Hello BZ Group, I just placed order ${submittedRef} to exchange ¥${sourceAmount.toLocaleString()} RMB for ₦${destinationAmount.toLocaleString('en-NG')} Naira.\n\nMy Naira Payout Account: ${nigerianBank} - ${nigerianAccountNumber} (${nigerianAccountName || name}).\n\nPlease send your RMB collection account details.`;
    const link = `https://wa.me/2348139690031?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-[24px] bg-white p-6 sm:p-8 shadow-2xl border border-[#eae3e4] max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#716769] hover:text-[#1b1416] hover:bg-[#f8f5f5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedRef ? (
          <div>
            {/* Header */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                Official RMB Treasury Desk
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1b1416] mt-0.5">
                {direction === 'rmb_to_naira' ? 'Pay RMB, Get Naira' : 'Pay Naira, Get RMB'}
              </h3>
              <p className="text-xs text-[#716769] mt-1 leading-relaxed">
                {direction === 'rmb_to_naira'
                  ? 'Enter your contact and Nigerian bank details. We will send our RMB account to your WhatsApp and disburse Naira to your account.'
                  : 'Enter your contact details and where you wish to receive your RMB (Alipay, WeChat, or Chinese Bank).'}
              </p>
            </div>

            {/* Summary Box */}
            <div className="mb-5 p-4 rounded-xl bg-[#fcf3f4] border border-[#f3d3d7] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#716769] block font-medium">You transfer:</span>
                <span className="text-base font-bold text-[#81141f]">
                  {direction === 'rmb_to_naira'
                    ? `¥${sourceAmount.toLocaleString()}`
                    : `₦${sourceAmount.toLocaleString('en-NG')}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#716769] block font-medium">You receive guaranteed:</span>
                <span className="text-base font-bold text-[#81141f]">
                  {direction === 'rmb_to_naira'
                    ? `₦${destinationAmount.toLocaleString('en-NG')}`
                    : `¥${destinationAmount.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Contact Info */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1b1416]">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chidi Okafor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1b1416]">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 813 969 0031"
                    value={whatsApp}
                    onChange={e => setWhatsApp(e.target.value)}
                    className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1b1416]">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>
              </div>

              {/* Direction Specific Fields */}
              {direction === 'naira_to_rmb' ? (
                <div className="p-3.5 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] space-y-3 mt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b1416] block">
                    Where should we disburse your RMB?
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {(['Alipay', 'WeChat Pay', 'Chinese Bank'] as const).map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setRmbChannel(ch)}
                        className={`py-2 px-2 rounded-[8px] text-xs font-semibold border transition-all cursor-pointer ${
                          rmbChannel === ch
                            ? 'bg-[#81141f] text-white border-[#81141f]'
                            : 'bg-white text-[#1b1416] border-[#eae3e4] hover:border-[#81141f]'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4a4245]">
                      {rmbChannel === 'Alipay' && 'Alipay Account (Email or Mobile)'}
                      {rmbChannel === 'WeChat Pay' && 'WeChat ID / Phone Number'}
                      {rmbChannel === 'Chinese Bank' && 'Card Number, Bank & Account Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={rmbChannel === 'Alipay' ? 'e.g. user@alipay.com or +86 ...' : 'Enter recipient details'}
                      value={rmbAccountDetails}
                      onChange={e => setRmbAccountDetails(e.target.value)}
                      className="w-full h-[40px] px-3 bg-white border border-[#eae3e4] rounded-[6px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-[12px] bg-[#f8f5f5] border border-[#eae3e4] space-y-3 mt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1b1416] block">
                    Your Nigerian Payout Account (To receive ₦{destinationAmount.toLocaleString('en-NG')})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#4a4245]">Bank Name</label>
                      <select
                        value={nigerianBank}
                        onChange={e => setNigerianBank(e.target.value)}
                        className="w-full h-[40px] px-2.5 bg-white border border-[#eae3e4] rounded-[6px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      >
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="UBA">United Bank for Africa (UBA)</option>
                        <option value="Kuda Bank">Kuda Bank</option>
                        <option value="OPay">OPay</option>
                        <option value="PalmPay">PalmPay</option>
                        <option value="Providus Bank">Providus Bank</option>
                        <option value="Stanbic IBTC">Stanbic IBTC</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#4a4245]">Account Number (10 digits)</label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="0123456789"
                        value={nigerianAccountNumber}
                        onChange={e => setNigerianAccountNumber(e.target.value)}
                        className="w-full h-[40px] px-3 bg-white border border-[#eae3e4] rounded-[6px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4a4245]">Account Name</label>
                    <input
                      type="text"
                      placeholder="Account name as registered on bank"
                      value={nigerianAccountName}
                      onChange={e => setNigerianAccountName(e.target.value)}
                      className="w-full h-[40px] px-3 bg-white border border-[#eae3e4] rounded-[6px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full font-bold bg-[#81141f] hover:bg-[#680e18] text-white shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Registering order ticket...</span>
                  ) : direction === 'naira_to_rmb' ? (
                    <>
                      <span>Continue to Bank Payment & Transfer</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Submit & Request RMB Collection Account</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#716769] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by BZ Group Institutional Treasury Policy</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State for RMB -> Naira */
          <div className="text-center py-4 space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Ticket Registered
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1b1416] mt-1">
                RMB Collection Account Dispatched
              </h3>
              <p className="text-xs text-[#716769] max-w-sm mx-auto mt-2 leading-relaxed">
                Your ticket has been logged with reference <strong>{submittedRef}</strong>. Our treasury team is sending our verified RMB collection details to your WhatsApp (<strong>{whatsApp}</strong>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f5f5] border border-[#eae3e4] inline-flex items-center gap-3">
              <span className="text-xs text-[#716769]">Order Reference:</span>
              <strong className="text-base font-mono font-bold text-[#81141f]">{submittedRef}</strong>
              <CopyButton value={submittedRef} />
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                onClick={handleOpenWhatsApp}
                size="lg"
                className="w-full gap-2 font-bold bg-[#25D366] hover:bg-[#1ebd5a] text-white cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Concierge Now</span>
              </Button>
              <Button onClick={onClose} variant="outline" size="sm" className="w-full cursor-pointer">
                Close Window
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
