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
  FileText,
  Download
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { cn, formatPhoneForWhatsApp } from '@/lib/utils';

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
  destinationChannel?: string;
  destinationAccountDetails?: string;
  senderBank?: string;
  senderAccountName?: string;
  receiptUrl?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'paid_out' | 'rejected';
  rejectionReason?: string;
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const { rmbRequests: storeRmb, bookings: storeBookings, updateRmbRequest, updateBooking, addActivity } = useStore();
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('This week');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid_out' | 'rejected'>('all');

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Interactive state for Pay RMB, get naira requests (middle card)
  const rmbRequests: PayRmbRequest[] = React.useMemo(() => {
    return storeRmb
      .filter(r => r.direction === 'rmb_to_naira')
      .map(r => {
        let status: PayRmbRequest['status'] = 'new';
        if (r.status === 'account_sent') status = 'account_sent';
        else if (r.status === 'receipt_received') status = 'rmb_received';
        else if (r.status === 'paid_out') status = 'naira_paid';

        return {
          id: r.id,
          reference: r.reference || r.id,
          customerName: r.customerName,
          customerPhone: r.customerWhatsApp || '0803 *** 4412',
          paysRmb: r.sourceAmount,
          wePayNaira: r.destinationAmount,
          requestedAt: formatDateDisplay(r.createdAt),
          status
        };
      });
  }, [storeRmb]);

  // Interactive state for All payments table
  const payments: PaymentRow[] = React.useMemo(() => {
    const rmbRows: PaymentRow[] = storeRmb.map(r => ({
      id: r.id,
      reference: r.reference || r.id,
      customerName: r.customerName,
      customerPhone: r.customerWhatsApp,
      type: r.direction === 'naira_to_rmb' ? 'Naira → RMB' : 'RMB → Naira',
      amount: r.direction === 'naira_to_rmb' ? r.sourceAmount : r.destinationAmount,
      amountFormatted: `₦${Number(r.direction === 'naira_to_rmb' ? r.sourceAmount : r.destinationAmount).toLocaleString('en-NG')}`,
      destinationChannel: r.destinationChannel,
      destinationAccountDetails: r.destinationAccountDetails,
      senderBank: r.senderBank,
      senderAccountName: r.senderAccountName,
      receiptUrl: r.receiptUrl,
      submittedAt: formatDateDisplay(r.createdAt),
      status: (r.status === 'approved' ? 'approved' : r.status === 'paid_out' ? 'paid_out' : r.status === 'rejected' ? 'rejected' : 'pending'),
      rejectionReason: r.notes
    }));

    const bookingRows: PaymentRow[] = storeBookings.map(b => ({
      id: b.id,
      reference: b.reference || b.id,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      type: b.type === 'car_rental' ? 'Car rental' : (b.type === 'car_test_drive' ? 'Test drive' : 'Property inspection'),
      amount: b.totalAmount || 0,
      amountFormatted: `₦${Number(b.totalAmount || 0).toLocaleString('en-NG')}`,
      receiptUrl: b.receiptUrl,
      submittedAt: formatDateDisplay(b.createdAt),
      status: (b.paymentStatus === 'verified' ? 'approved' : b.paymentStatus === 'refunded' ? 'rejected' : 'pending'),
      rejectionReason: b.notes
    }));

    return [...rmbRows, ...bookingRows];
  }, [storeRmb, storeBookings]);

  // Dynamic live aggregations for payments
  const paymentMetrics = React.useMemo(() => {
    const pendingList = payments.filter(p => p.status === 'pending');
    const awaitingReviewSum = pendingList.reduce((sum, p) => sum + (p.amount || 0), 0);
    const awaitingReviewCount = pendingList.length;

    const approvedList = payments.filter(p => p.status === 'approved' || p.status === 'paid_out');
    const confirmedSum = approvedList.reduce((sum, p) => sum + (p.amount || 0), 0);
    const confirmedCount = approvedList.length;

    const paidOutRmbList = storeRmb.filter(r => r.direction === 'naira_to_rmb' && (r.status === 'paid_out' || r.status === 'approved'));
    const paidOutRmbSum = paidOutRmbList.reduce((sum, r) => sum + (Number(r.destinationAmount) || 0), 0);
    const paidOutRmbCount = paidOutRmbList.length;

    const rejectedList = payments.filter(p => p.status === 'rejected');
    const rejectedCount = rejectedList.length;
    const latestRejectionReason = rejectedList[0]?.rejectionReason || 'Transfer verification failed';

    const rmbActionCount = rmbRequests.filter(r => r.status === 'new' || r.status === 'account_sent' || r.status === 'rmb_received').length;

    return {
      awaitingReviewSum,
      awaitingReviewCount,
      confirmedSum,
      confirmedCount,
      paidOutRmbSum,
      paidOutRmbCount,
      rejectedCount,
      latestRejectionReason,
      rmbActionCount
    };
  }, [payments, storeRmb, rmbRequests]);

  // Modal inspection state
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRow | null>(null);

  // Actions for middle card
  const handleSendRmbAccount = async (req: PayRmbRequest) => {
    await updateRmbRequest(req.id, { status: 'account_sent' });
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'sent RMB collection account',
      target: `${req.reference} · ${req.customerName}`,
      category: 'payments'
    });

    toast({
      title: "RMB account sent to customer's WhatsApp",
      description: `Sent corporate ICBC credentials for ${req.reference} to ${req.customerName}.`,
      variant: 'success'
    });
  };

  const handleMarkRmbReceived = async (req: PayRmbRequest) => {
    await updateRmbRequest(req.id, { status: 'receipt_received' });
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'confirmed RMB payment received',
      target: `${req.reference} · ¥${req.paysRmb.toLocaleString()}`,
      category: 'payments'
    });

    toast({
      title: 'RMB received',
      description: `Confirmed ¥${req.paysRmb.toLocaleString()} received for ${req.reference}.`,
      variant: 'success'
    });
  };

  const handleMarkNairaPaid = async (req: PayRmbRequest) => {
    await updateRmbRequest(req.id, { status: 'paid_out' });
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'paid out Naira to customer',
      target: `${req.reference} · ₦${req.wePayNaira.toLocaleString()}`,
      category: 'payments'
    });

    toast({
      title: 'Naira paid out',
      description: `Sent ₦${req.wePayNaira.toLocaleString()} to ${req.customerName}. Order complete.`,
      variant: 'success'
    });
  };

  // Actions for bottom table
  const handleApprove = async (payment: PaymentRow) => {
    if (payment.reference.startsWith('RMB')) {
      await updateRmbRequest(payment.id, { status: 'approved' });
    } else {
      await updateBooking(payment.id, { paymentStatus: 'verified', bookingStatus: 'confirmed' });
    }
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'approved payment',
      target: `${payment.reference} · ${payment.amountFormatted}`,
      category: 'payments'
    });

    toast({
      title: 'Payment approved',
      description: `${payment.reference} (${payment.amountFormatted}) confirmed and verified.`,
      variant: 'success'
    });
    if (selectedReceipt?.id === payment.id) setSelectedReceipt(null);
  };

  const handleReject = async (payment: PaymentRow) => {
    const rejectionNote = 'Transfer receipt verification failed. Please verify with your bank or send updated proof.';
    if (payment.reference.startsWith('RMB')) {
      await updateRmbRequest(payment.id, { status: 'rejected', notes: rejectionNote });
    } else {
      await updateBooking(payment.id, { paymentStatus: 'refunded', notes: rejectionNote });
    }
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'rejected payment',
      target: `${payment.reference} · ${payment.amountFormatted}`,
      category: 'payments'
    });

    toast({
      title: 'Payment rejected',
      description: `${payment.reference} marked as rejected.`,
      variant: 'error'
    });
    if (selectedReceipt?.id === payment.id) setSelectedReceipt(null);
  };

  const handleMarkPaidOut = async (payment: PaymentRow) => {
    if (payment.reference.startsWith('RMB')) {
      await updateRmbRequest(payment.id, { status: 'paid_out' });
    }
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Treasury Desk',
      action: 'marked as paid out',
      target: `${payment.reference} · ${payment.amountFormatted}`,
      category: 'payments'
    });

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
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Awaiting review</span>
            <div className="w-6 h-6 rounded-full bg-[#fdf5e8] text-[#b45309] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            ₦{paymentMetrics.awaitingReviewSum >= 1_000_000 ? `${(paymentMetrics.awaitingReviewSum / 1_000_000).toFixed(1)}M` : paymentMetrics.awaitingReviewSum.toLocaleString('en-NG')}
          </div>
          <div className="text-[11px] text-[#b45309] font-medium mt-1">
            {paymentMetrics.awaitingReviewCount} receipt{paymentMetrics.awaitingReviewCount === 1 ? '' : 's'} to check
          </div>
        </div>

        {/* Confirmed today */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Verified / Cleared</span>
            <div className="w-6 h-6 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            ₦{paymentMetrics.confirmedSum >= 1_000_000 ? `${(paymentMetrics.confirmedSum / 1_000_000).toFixed(1)}M` : paymentMetrics.confirmedSum.toLocaleString('en-NG')}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            {paymentMetrics.confirmedCount} payment{paymentMetrics.confirmedCount === 1 ? '' : 's'} verified
          </div>
        </div>

        {/* Paid out this week */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">RMB Disbursed</span>
            <div className="w-6 h-6 rounded-full bg-[#fdf3f4] text-[#7A0C1A] flex items-center justify-center text-xs font-bold">
              ¥
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            ¥{paymentMetrics.paidOutRmbSum.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#716769] font-medium mt-1">
            {paymentMetrics.paidOutRmbCount} RMB order{paymentMetrics.paidOutRmbCount === 1 ? '' : 's'}
          </div>
        </div>

        {/* Rejected */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-xs text-[#716769]">
            <span className="font-medium">Flagged / Rejected</span>
            <div className="w-6 h-6 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            {paymentMetrics.rejectedCount}
          </div>
          <div className="text-[11px] text-[#dc2626] font-medium mt-1 truncate max-w-[170px]" title={paymentMetrics.latestRejectionReason}>
            {paymentMetrics.rejectedCount > 0 ? paymentMetrics.latestRejectionReason : 'No errors flagged'}
          </div>
        </div>
      </div>

      {/* Middle Card: Pay RMB, get naira · requests */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#eae3e4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1b1416]">Pay RMB, get naira · requests</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                {paymentMetrics.rmbActionCount} need action
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
                            href={`https://wa.me/${formatPhoneForWhatsApp(row.customerPhone)}?text=${encodeURIComponent(`Hello ${row.customerName}, regarding request ${row.reference}...`)}`}
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
                          href={`https://wa.me/${formatPhoneForWhatsApp(row.customerPhone)}?text=${encodeURIComponent(`Hello ${row.customerName}, payment for ${row.reference} has been completed.`)}`}
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
                            onClick={() => setSelectedReceipt(row)}
                            className="px-2.5 py-1 rounded-md border border-[#eae3e4] bg-white text-[#716769] hover:text-[#1b1416] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            View slip
                          </button>
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

              {/* RMB Payout Target or Bank Destination */}
              {(selectedReceipt.destinationAccountDetails || selectedReceipt.destinationChannel) && (
                <div className="p-3 rounded-lg bg-[#f8f5f5] border border-[#eae3e4] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#716769] text-[10px] uppercase font-semibold">Payout Destination</span>
                    <span className="px-2 py-0.5 rounded bg-[#7A0C1A] text-white font-bold text-[10px]">
                      {selectedReceipt.destinationChannel || 'Disbursement Desk'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-[#1b1416] text-[13px] break-all">
                    {selectedReceipt.destinationAccountDetails || 'Confirmed on WhatsApp'}
                  </div>
                </div>
              )}

              {/* Sender Bank details if available */}
              {(selectedReceipt.senderBank || selectedReceipt.senderAccountName) && (
                <div className="p-2.5 rounded-lg bg-[#faf7f7] border border-[#eae3e4] text-xs flex items-center justify-between">
                  <span className="text-[#716769]">Sender Account:</span>
                  <span className="font-semibold text-[#1b1416]">
                    {selectedReceipt.senderAccountName || selectedReceipt.customerName} ({selectedReceipt.senderBank || 'Direct Transfer'})
                  </span>
                </div>
              )}

              {/* Receipt slip inspection image / document */}
              <div className="border border-[#eae3e4] rounded-xl p-4 bg-[#fdfbfb] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#716769]">
                  <span className="font-semibold text-[#1b1416]">Payment Transfer Slip / Receipt</span>
                  {selectedReceipt.receiptUrl && (
                    <a
                      href={selectedReceipt.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7A0C1A] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Size
                    </a>
                  )}
                </div>

                {selectedReceipt.receiptUrl ? (
                  selectedReceipt.receiptUrl.startsWith('data:application/pdf') || selectedReceipt.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="space-y-2">
                      <div className="h-64 rounded-lg bg-white border border-[#eae3e4] overflow-hidden">
                        <iframe
                          src={selectedReceipt.receiptUrl}
                          title={`Receipt ${selectedReceipt.reference}`}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#716769]">
                        <span>PDF Document attached</span>
                        <a
                          href={selectedReceipt.receiptUrl}
                          download={`receipt-${selectedReceipt.reference}.pdf`}
                          className="font-semibold text-[#7A0C1A] hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="max-h-72 rounded-lg bg-black/5 border border-[#eae3e4] overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={selectedReceipt.receiptUrl}
                          alt={`Receipt ${selectedReceipt.reference}`}
                          className="max-h-64 w-auto object-contain rounded-md"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#716769]">
                        <span>Image receipt proof</span>
                        <a
                          href={selectedReceipt.receiptUrl}
                          download={`receipt-${selectedReceipt.reference}.png`}
                          className="font-semibold text-[#7A0C1A] hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download Image
                        </a>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-36 rounded-lg bg-[#faf7f7] border border-dashed border-[#eae3e4] flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-8 h-8 text-[#716769]/50 mb-2" />
                    <p className="text-xs font-semibold text-[#1b1416]">No Transfer Slip Uploaded Yet</p>
                    <p className="text-[11px] text-[#716769] mt-0.5">
                      The client has not attached a screenshot or PDF slip for this transaction.
                    </p>
                    <span className="mt-2 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#eae3e4] text-[#716769]">
                      Awaiting verification proof
                    </span>
                  </div>
                )}
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
                  href={`https://wa.me/${formatPhoneForWhatsApp(selectedReceipt.customerPhone)}?text=${encodeURIComponent(
                    `Hello ${selectedReceipt.customerName}, regarding payment ${selectedReceipt.reference} of ${selectedReceipt.amountFormatted}...`
                  )}`}
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
