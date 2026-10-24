'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

interface PayRmbRequest {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  paysRmb: number;
  wePayNaira: number;
  requestedAt: string;
  status: 'new' | 'account_sent' | 'rmb_received' | 'naira_paid';
}

interface PaymentRow {
  id: string;
  reference: string;
  customerName: string;
  customerPhone?: string;
  type: string;
  amount: number;
  amountFormatted: string;
  receiptUrl?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'paid_out' | 'rejected';
  rejectionReason?: string;
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('This week');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid_out' | 'rejected'>('all');

  // Interactive state for Pay RMB, get naira requests (middle card)
  const [rmbRequests, setRmbRequests] = useState<PayRmbRequest[]>([
    {
      id: 'req-1',
      reference: 'RMB-0144',
      customerName: 'Chidi Okafor',
      customerPhone: '0803 *** 4412',
      paysRmb: 10000,
      wePayNaira: 2050000,
      requestedAt: '10 min ago',
      status: 'new'
    },
    {
      id: 'req-2',
      reference: 'RMB-0145',
      customerName: 'Kemi Lawal',
      customerPhone: '0805 *** 7712',
      paysRmb: 3000,
      wePayNaira: 615900,
      requestedAt: '25 min ago',
      status: 'account_sent'
    },
    {
      id: 'req-3',
      reference: 'RMB-0137',
      customerName: 'Uche Ojo',
      customerPhone: '0701 *** 4420',
      paysRmb: 8000,
      wePayNaira: 1640000,
      requestedAt: 'Yesterday',
      status: 'rmb_received'
    },
    {
      id: 'req-4',
      reference: 'RMB-0136',
      customerName: 'Musa Aliyu',
      customerPhone: '0806 *** 1290',
      paysRmb: 20000,
      wePayNaira: 4100000,
      requestedAt: 'Mon',
      status: 'naira_paid'
    }
  ]);

  // Interactive state for All payments table
  const [payments, setPayments] = useState<PaymentRow[]>([
    {
      id: 'pay-1',
      reference: 'RMB-0142',
      customerName: 'Chidi Okafor',
      customerPhone: '0803 441 2099',
      type: 'Naira → RMB',
      amount: 2154000,
      amountFormatted: '₦2,154,000',
      submittedAt: '10 min ago',
      status: 'pending'
    },
    {
      id: 'pay-2',
      reference: 'BK-2291',
      customerName: 'Amaka Eze',
      customerPhone: '0816 229 0112',
      type: 'Car rental',
      amount: 750000,
      amountFormatted: '₦750,000',
      submittedAt: '30 min ago',
      status: 'pending'
    },
    {
      id: 'pay-3',
      reference: 'RMB-0143',
      customerName: 'Ngozi Ojo',
      customerPhone: '0802 881 3320',
      type: 'Naira → RMB',
      amount: 861600,
      amountFormatted: '₦861,600',
      submittedAt: '45 min ago',
      status: 'pending'
    },
    {
      id: 'pay-4',
      reference: 'INS-0317',
      customerName: 'Musa Bello',
      customerPhone: '0703 119 2200',
      type: 'Property deposit',
      amount: 2500000,
      amountFormatted: '₦2,500,000',
      submittedAt: '1 hr ago',
      status: 'pending'
    },
    {
      id: 'pay-5',
      reference: 'RMB-0141',
      customerName: 'Tunde Bello',
      customerPhone: '0809 778 1234',
      type: 'Naira → RMB',
      amount: 4308000,
      amountFormatted: '₦4,308,000',
      submittedAt: '1 hr ago',
      status: 'approved'
    },
    {
      id: 'pay-6',
      reference: 'BK-2290',
      customerName: 'Fatima Sule',
      customerPhone: '0812 003 4599',
      type: 'Apartment rental',
      amount: 12000000,
      amountFormatted: '₦12,000,000',
      submittedAt: '3 hrs ago',
      status: 'approved'
    },
    {
      id: 'pay-7',
      reference: 'RMB-0140',
      customerName: 'Ada Nnamani',
      customerPhone: '0803 772 1190',
      type: 'Naira → RMB',
      amount: 3231000,
      amountFormatted: '₦3,231,000',
      submittedAt: 'Yesterday',
      status: 'paid_out'
    },
    {
      id: 'pay-8',
      reference: 'RMB-0139',
      customerName: 'Emeka Nwosu',
      customerPhone: '0817 330 2211',
      type: 'Naira → RMB',
      amount: 1077000,
      amountFormatted: '₦1,077,000',
      submittedAt: 'Yesterday',
      status: 'paid_out'
    },
    {
      id: 'pay-9',
      reference: 'RMB-0138',
      customerName: 'Bola Ade',
      customerPhone: '0805 119 4432',
      type: 'Naira → RMB',
      amount: 540000,
      amountFormatted: '₦540,000',
      submittedAt: 'Mon',
      status: 'rejected',
      rejectionReason: 'Bank transfer slip amount does not match invoice total.'
    }
  ]);

  // Modal inspection state
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRow | null>(null);

  // Actions for middle card
  const handleSendRmbAccount = (req: PayRmbRequest) => {
    setRmbRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'account_sent' } : r));
    toast({
      title: "RMB account sent to customer's WhatsApp",
      description: `Sent corporate ICBC credentials for ${req.reference} to ${req.customerName}.`,
      variant: 'success'
    });
  };

  const handleMarkRmbReceived = (req: PayRmbRequest) => {
    setRmbRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rmb_received' } : r));
    toast({
      title: 'RMB received',
      description: `Confirmed ¥${req.paysRmb.toLocaleString()} received for ${req.reference}.`,
      variant: 'success'
    });
  };

  const handleMarkNairaPaid = (req: PayRmbRequest) => {
    setRmbRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'naira_paid' } : r));
    toast({
      title: 'Naira paid out',
      description: `Sent ₦${req.wePayNaira.toLocaleString()} to ${req.customerName}. Order complete.`,
      variant: 'success'
    });
  };

  // Actions for bottom table
  const handleApprove = (payment: PaymentRow) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'approved' } : p));
    toast({
      title: 'Payment approved',
      description: `${payment.reference} (${payment.amountFormatted}) confirmed and verified.`,
      variant: 'success'
    });
    if (selectedReceipt?.id === payment.id) setSelectedReceipt(null);
  };

  const handleReject = (payment: PaymentRow) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'rejected', rejectionReason: 'Transfer receipt verification failed' } : p));
    toast({
      title: 'Payment rejected',
      description: `${payment.reference} marked as rejected. Notified customer.`,
      variant: 'error'
    });
    if (selectedReceipt?.id === payment.id) setSelectedReceipt(null);
  };

  const handleMarkPaidOut = (payment: PaymentRow) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid_out' } : p));
    toast({
      title: 'Marked as paid out',
      description: `${payment.reference} payout verified successfully.`,
      variant: 'success'
    });
  };

  // Filtered rows for bottom table
  const filteredPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return p.reference.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Payments</h1>
          <p className="text-xs text-[#716769] mt-0.5">Every manual transfer, from receipt to payout</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search orders, listings, customers"
              className="pl-8 pr-3 py-1.5 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-64 focus:outline-none focus:border-[#7A0C1A]"
            />
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Awaiting review */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Awaiting review</span>
            <div className="w-6 h-6 rounded-full bg-[#fdf5e8] text-[#b45309] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">₦6.3M</div>
          <div className="text-[11px] text-[#b45309] font-medium mt-1">6 receipts to check</div>
        </div>

        {/* Confirmed today */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Confirmed today</span>
            <div className="w-6 h-6 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">₦18.4M</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">11 payments</div>
        </div>

        {/* Paid out this week */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Paid out this week</span>
            <div className="w-6 h-6 rounded-full bg-[#fdf3f4] text-[#7A0C1A] flex items-center justify-center text-xs font-bold">
              ¥
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">¥184,500</div>
          <div className="text-[11px] text-[#716769] font-medium mt-1">23 RMB orders</div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Rejected</span>
            <div className="w-6 h-6 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">1</div>
          <div className="text-[11px] text-[#dc2626] font-medium mt-1">Amount mismatch</div>
        </div>
      </div>

      {/* Middle Card: Pay RMB, get naira · requests */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#eae3e4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1b1416]">Pay RMB, get naira · requests</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                2 need action
              </span>
            </div>
            <p className="text-xs text-[#716769] mt-0.5">
              Send our RMB account on WhatsApp, confirm the RMB arrived, then pay the naira.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Reference</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Pays</th>
                <th className="py-3 px-5">We pay</th>
                <th className="py-3 px-5">Requested</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {rmbRequests.map(row => (
                <tr key={row.id} className="hover:bg-[#fcf8f8]/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-medium text-[#1b1416]">{row.reference}</td>
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#1b1416]">{row.customerName}</div>
                    <div className="text-[11px] text-[#716769]">{row.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-[#1b1416]">¥{row.paysRmb.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-medium text-[#1b1416]">₦{row.wePayNaira.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-[#716769]">{row.requestedAt}</td>
                  <td className="py-3.5 px-5">
                    {row.status === 'new' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                        New
                      </span>
                    )}
                    {row.status === 'account_sent' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                        Account sent
                      </span>
                    )}
                    {row.status === 'rmb_received' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                        RMB received
                      </span>
                    )}
                    {row.status === 'naira_paid' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#4b5563] text-[10px] font-bold">
                        Naira paid
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.status === 'new' && (
                        <button
                          type="button"
                          onClick={() => handleSendRmbAccount(row)}
                          className="px-3 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold transition-colors"
                        >
                          Send RMB account
                        </button>
                      )}
                      {row.status === 'account_sent' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkRmbReceived(row)}
                            className="px-3 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold transition-colors"
                          >
                            Mark RMB received
                          </button>
                          <a
                            href={`https://wa.me/2348139690031?text=${encodeURIComponent(`Hello ${row.customerName}, regarding request ${row.reference}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7] text-xs font-medium transition-colors"
                          >
                            WhatsApp
                          </a>
                        </>
                      )}
                      {row.status === 'rmb_received' && (
                        <button
                          type="button"
                          onClick={() => handleMarkNairaPaid(row)}
                          className="px-3 py-1.5 rounded-lg bg-[#1b1416] hover:bg-black text-white text-xs font-semibold transition-colors"
                        >
                          Mark naira paid
                        </button>
                      )}
                      {row.status === 'naira_paid' && (
                        <a
                          href={`https://wa.me/2348139690031?text=${encodeURIComponent(`Hello ${row.customerName}, payment for ${row.reference} has been completed.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg border border-[#eae3e4] bg-white text-[#716769] hover:bg-[#faf7f7] text-xs font-medium transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Card: All payments table */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        {/* Table Filters & Search Bar */}
        <div className="p-4 border-b border-[#eae3e4] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-[#1b1416] text-white font-bold'
                  : 'text-[#716769] hover:bg-[#faf7f7]'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === 'pending'
                  ? 'bg-[#1b1416] text-white font-bold'
                  : 'text-[#716769] hover:bg-[#faf7f7]'
              )}
            >
              Pending · 4
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === 'approved'
                  ? 'bg-[#1b1416] text-white font-bold'
                  : 'text-[#716769] hover:bg-[#faf7f7]'
              )}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid_out')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === 'paid_out'
                  ? 'bg-[#1b1416] text-white font-bold'
                  : 'text-[#716769] hover:bg-[#faf7f7]'
              )}
            >
              Paid out
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === 'rejected'
                  ? 'bg-[#1b1416] text-white font-bold'
                  : 'text-[#716769] hover:bg-[#faf7f7]'
              )}
            >
              Rejected
            </button>
          </div>

          {/* Right Search & Period Select */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Search reference or name..."
                className="pl-8 pr-3 py-1.5 bg-[#fdfbfb] border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-48 focus:outline-none focus:border-[#7A0C1A]"
              />
            </div>
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#fdfbfb] border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none cursor-pointer"
            >
              <option value="This week">This week</option>
              <option value="Last week">Last week</option>
              <option value="This month">This month</option>
              <option value="All time">All time</option>
            </select>
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Reference</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Receipt</th>
                <th className="py-3 px-5">Submitted</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {filteredPayments.map(row => (
                <tr key={row.id} className="hover:bg-[#fcf8f8]/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-medium text-[#1b1416]">{row.reference}</td>
                  <td className="py-3.5 px-5 font-semibold text-[#1b1416]">{row.customerName}</td>
                  <td className="py-3.5 px-5 text-[#716769]">{row.type}</td>
                  <td className="py-3.5 px-5 font-bold text-[#1b1416]">{row.amountFormatted}</td>
                  <td className="py-3.5 px-5">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(row)}
                      className="inline-flex items-center gap-1 text-[#7A0C1A] hover:underline font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-[#716769]">{row.submittedAt}</td>
                  <td className="py-3.5 px-5">
                    {row.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                        Pending
                      </span>
                    )}
                    {row.status === 'approved' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                        Approved
                      </span>
                    )}
                    {row.status === 'paid_out' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#4b5563] text-[10px] font-bold">
                        Paid out
                      </span>
                    )}
                    {row.status === 'rejected' && (
                      <span className="px-2.5 py-1 rounded-full bg-[#fef2f2] text-[#dc2626] text-[10px] font-bold">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(row)}
                            className="px-3 py-1 rounded-md bg-[#7A0C1A] hover:bg-[#600814] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(row)}
                            className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] hover:text-[#dc2626] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {row.status === 'approved' && (
                        row.type.includes('RMB') ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaidOut(row)}
                            className="px-3 py-1 rounded-md bg-[#7A0C1A] hover:bg-[#600814] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Mark paid out
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(row)}
                            className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        )
                      )}
                      {row.status === 'paid_out' && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(row)}
                          className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          View proof
                        </button>
                      )}
                      {row.status === 'rejected' && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(row)}
                          className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          View reason
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-[#eae3e4] flex items-center justify-between text-xs text-[#716769]">
          <span>Showing 1–9 of 64</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Review Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#eae3e4]">
            <div className="p-5 border-b border-[#eae3e4] flex items-center justify-between bg-[#faf7f7]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A0C1A]">Receipt Inspection</span>
                <h3 className="text-base font-serif font-bold text-[#1b1416]">{selectedReceipt.reference}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-[#716769] hover:text-[#1b1416] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Key details grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <span className="text-[#716769] block text-[10px] uppercase">Customer</span>
                  <span className="font-bold text-[#1b1416] text-sm block mt-0.5">{selectedReceipt.customerName}</span>
                  <span className="text-[11px] text-[#716769]">{selectedReceipt.customerPhone || '0803 *** 4412'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <span className="text-[#716769] block text-[10px] uppercase">Amount Verified</span>
                  <span className="font-bold font-serif text-[#7A0C1A] text-lg block mt-0.5">{selectedReceipt.amountFormatted}</span>
                  <span className="text-[11px] text-[#716769]">{selectedReceipt.type}</span>
                </div>
              </div>

              {/* Receipt slip simulation image */}
              <div className="border border-[#eae3e4] rounded-xl p-4 bg-[#fdfbfb] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#716769]">
                  <span className="font-medium">Bank Transfer Slip</span>
                  <span className="font-mono text-[10px]">Verified via NIBSS</span>
                </div>
                <div className="h-44 rounded-lg bg-[#1b1416]/5 border border-dashed border-[#eae3e4] flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="w-8 h-8 text-[#7A0C1A] mb-2" />
                  <p className="text-xs font-semibold text-[#1b1416]">Transfer Receipt #{selectedReceipt.reference}</p>
                  <p className="text-[11px] text-[#716769]">Payer: {selectedReceipt.customerName}</p>
                  <p className="text-[11px] text-[#716769]">Beneficiary: BZ Global Universal Solutions Ltd</p>
                  <span className="mt-2 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#eae3e4]">
                    Ref: 99420019283741
                  </span>
                </div>
              </div>

              {selectedReceipt.rejectionReason && (
                <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#dc2626]">
                  <span className="font-bold block">Rejection Reason:</span>
                  {selectedReceipt.rejectionReason}
                </div>
              )}

              {/* Modal footer actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={`https://wa.me/2348139690031?text=${encodeURIComponent(`Hello ${selectedReceipt.customerName}, regarding payment ${selectedReceipt.reference} of ${selectedReceipt.amountFormatted}...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#eae3e4] text-xs font-semibold text-[#1b1416] hover:bg-[#faf7f7] transition-colors"
                >
                  WhatsApp Customer
                </a>

                {selectedReceipt.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(selectedReceipt)}
                      className="px-4 py-2 rounded-lg border border-[#fecaca] text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedReceipt)}
                      className="px-5 py-2 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold transition-colors"
                    >
                      Approve Payment
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="px-5 py-2 rounded-lg bg-[#1b1416] text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
