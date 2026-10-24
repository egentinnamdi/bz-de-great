'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '@/lib/store';
import { useToast } from './toast-provider';
import { getWhatsAppRmbLink, SITE_CONFIG } from '@/lib/constants';
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
  const { createRmbRequest, rmbRates } = useStore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsApp, setWhatsApp] = useState('+234 ');
  const [notes, setNotes] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const rate = direction === 'rmb_to_naira' ? rmbRates.payRmbRate : rmbRates.payNairaRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsApp) {
      toast({
        title: 'Missing information',
        description: 'Please provide your full name and WhatsApp number.',
        variant: 'warning'
      });
      return;
    }

    const req = await createRmbRequest({
      direction,
      sourceAmount,
      rateApplied: rate,
      destinationAmount,
      customerName: name,
      customerEmail: email || 'not-provided@client.com',
      customerWhatsApp: whatsApp,
      notes,
      status: 'account_sent'
    });

    setSubmittedRef(req.id);

    toast({
      title: "RMB account details sent to your WhatsApp",
      description: `Reference code: ${req.id}`,
      variant: 'success'
    });
  };

  const handleOpenWhatsApp = () => {
    if (!submittedRef) return;
    const link = getWhatsAppRmbLink(submittedRef, direction, sourceAmount);
    window.open(link, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-border-subtle">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-subtle hover:text-text-main hover:bg-surface-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedRef ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
                Official Treasury Desk
              </span>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                {direction === 'rmb_to_naira' ? 'Get RMB Account' : 'Get Naira Account'}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Add your details and we will send our verified settlement account directly to your WhatsApp.
              </p>
            </div>

            {/* Summary Box */}
            <div className="mb-6 p-4 rounded-2xl bg-wine-50 border border-wine-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-text-subtle block">You transfer:</span>
                <span className="text-base font-bold text-wine-900">
                  {direction === 'rmb_to_naira' ? `¥${sourceAmount.toLocaleString()}` : `₦${sourceAmount.toLocaleString()}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-subtle block">You receive guaranteed:</span>
                <span className="text-base font-bold text-wine-900">
                  {direction === 'rmb_to_naira' ? `₦${destinationAmount.toLocaleString()}` : `¥${destinationAmount.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Chidi Okafor"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <Input
                label="WhatsApp Phone Number"
                placeholder="+234 813 969 0031"
                value={whatsApp}
                onChange={e => setWhatsApp(e.target.value)}
                required
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="client@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full font-bold shadow-md">
                  <span>Send account to my WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-subtle pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by BZ Group Institutional Treasury Policy</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Request Dispatched
              </span>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                Account Details Sent
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-2 leading-relaxed">
                Your transaction ticket has been queued. Our treasury officers will verify settlement and disburse funds within 30 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-bg border border-border-subtle inline-flex items-center gap-3">
              <span className="text-xs text-text-subtle">Reference Ticket:</span>
              <strong className="text-base font-mono font-bold text-wine-900">{submittedRef}</strong>
              <CopyButton value={submittedRef} />
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button onClick={handleOpenWhatsApp} size="lg" className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Concierge Now</span>
              </Button>
              <Button onClick={onClose} variant="outline" size="sm" className="w-full">
                Close Window
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
