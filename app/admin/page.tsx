'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Building,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminDashboardPage() {
  const { listings, bookings, rmbRequests, updateBooking, updateRmbRequest, activities, addActivity } = useStore();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const activeRentals = bookings.filter(b => b.type === 'car_rental' && b.bookingStatus === 'confirmed');
  const pendingReceipts = bookings.filter(b => b.paymentStatus === 'receipt_uploaded');
  const pendingRmb = rmbRequests.filter(r => r.status === 'receipt_received' || r.status === 'requested');
  const scheduledInspections = bookings.filter(b => b.type === 'property_inspection' || b.type === 'car_test_drive');

  const handleApproveBookingPayment = (bookingId: string) => {
    updateBooking(bookingId, {
      paymentStatus: 'verified',
      bookingStatus: 'confirmed'
    });
    addActivity({
      actorName: user?.name || 'Staff Admin',
      actorRole: user?.role || 'Treasury Desk',
      action: `Approved payment receipt for ${bookingId}`,
      targetId: bookingId
    });
    toast({
      title: 'Payment approved',
      description: `Booking ${bookingId} marked as verified and confirmed.`,
      variant: 'success'
    });
  };

  const handleApproveRmbRequest = (reqId: string) => {
    updateRmbRequest(reqId, {
      status: 'approved'
    });
    addActivity({
      actorName: user?.name || 'Staff Admin',
      actorRole: user?.role || 'Senior Trader',
      action: `Approved RMB exchange payout ${reqId}`,
      targetId: reqId
    });
    toast({
      title: 'RMB exchange payout approved',
      description: `Transaction ${reqId} cleared for disbursement.`,
      variant: 'success'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
              Operations & Treasury Control
            </span>
            {user?.role && (
              <span className="px-2 py-0.5 rounded-full bg-wine-50 text-wine-900 border border-wine-200 text-[10px] font-bold">
                {user.role}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mt-0.5">
            {user?.name ? `Welcome back, ${user.name}` : 'Admin Overview Dashboard'}
          </h1>
          <p className="text-xs text-text-subtle mt-0.5">
            Signed in as <span className="font-semibold text-text-main">{user?.email || 'admin@bzgroup.com'}</span> · BZ Group Operations Desk
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/rmb-rate">
            <Button variant="wineOutline" size="sm" className="font-semibold gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Update RMB Rate</span>
            </Button>
          </Link>

          <Link href="/admin/listings/new">
            <Button size="sm" className="font-semibold gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Add Listing</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
            <span>Active Car Rentals</span>
            <Car className="w-4 h-4 text-wine-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-wine-900">
            {activeRentals.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Fleet deployed on road</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
            <span>Pending Payment Receipts</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            {pendingReceipts.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">Require review & verification</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
            <span>Scheduled Inspections</span>
            <CalendarCheck className="w-4 h-4 text-wine-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-wine-900">
            {scheduledInspections.length}
          </div>
          <div className="text-[11px] text-text-subtle font-medium">Walkthroughs & test drives</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
            <span>Pending RMB Inflows</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {pendingRmb.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">WeChat / Alipay settlements</div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pending Actions & Inflow Verification */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pending Bookings Table */}
          <div className="rounded-3xl bg-white border border-border-subtle shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text-main">
                  Pending Bookings & Receipts
                </h3>
                <p className="text-xs text-text-subtle mt-0.5">
                  Client transfer receipts requiring treasury clearance
                </p>
              </div>
              <Link href="/admin/bookings" className="text-xs font-semibold text-wine-800 hover:underline">
                View All Bookings →
              </Link>
            </div>

            <div className="divide-y divide-border-subtle overflow-x-auto">
              {bookings.slice(0, 4).map(b => (
                <div key={b.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-bg/50 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-mono font-bold text-wine-900">{b.id}</strong>
                      <StatusBadge status={b.paymentStatus} />
                    </div>
                    <div className="text-sm font-bold text-text-main truncate">{b.listingTitle}</div>
                    <div className="text-xs text-text-subtle">
                      Client: <strong>{b.customerName}</strong> ({b.customerPhone}) · {b.startDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.paymentStatus !== 'verified' && (
                      <Button
                        size="xs"
                        onClick={() => handleApproveBookingPayment(b.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Approve</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending RMB Settlements */}
          <div className="rounded-3xl bg-white border border-border-subtle shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text-main">
                  RMB Currency Trade Queue
                </h3>
                <p className="text-xs text-text-subtle mt-0.5">
                  Two-way currency transfers awaiting disbursement confirmation
                </p>
              </div>
              <Link href="/admin/payments" className="text-xs font-semibold text-wine-800 hover:underline">
                Payments Desk →
              </Link>
            </div>

            <div className="divide-y divide-border-subtle overflow-x-auto">
              {rmbRequests.slice(0, 3).map(r => (
                <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-bg/50 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-mono font-bold text-wine-900">{r.id}</strong>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-sm font-bold text-text-main">
                      {r.direction === 'rmb_to_naira' ? `¥${r.sourceAmount.toLocaleString()} → ₦${r.destinationAmount.toLocaleString()}` : `₦${r.sourceAmount.toLocaleString()} → ¥${r.destinationAmount.toLocaleString()}`}
                    </div>
                    <div className="text-xs text-text-subtle">
                      Customer: {r.customerName} ({r.customerWhatsApp}) · Rate: ¥1 = ₦{r.rateApplied}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {r.status !== 'approved' && r.status !== 'paid_out' && (
                      <Button
                        size="xs"
                        onClick={() => handleApproveRmbRequest(r.id)}
                        className="bg-wine-800 text-white font-bold"
                      >
                        Approve Payout
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-border-subtle p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-wine-800 font-bold text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Staff Activity Trail</span>
            </div>

            <div className="space-y-3.5 divide-y divide-border-subtle/50 text-xs">
              {activities.map(act => (
                <div key={act.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-text-subtle text-[11px]">
                    <span className="font-semibold text-wine-900">{act.actorName}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-text-main font-medium leading-relaxed">
                    {act.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
