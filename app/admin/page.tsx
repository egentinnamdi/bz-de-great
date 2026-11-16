'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Building,
  CreditCard,
  Plus,
  CheckCircle2,
  Activity,
  CalendarCheck,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Camera,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { useAdminAuth } from '@/lib/admin-auth';
import { formatPhoneForWhatsApp } from '@/lib/utils';
import { formatActivityTimestamp, formatFullActivityDateTime } from '@/lib/activity-time';
import { AdminKpiSkeleton, AdminRowsSkeleton } from '@/components/ui/loading-skeleton';
import {
  canAccessAdminModule,
  canManageBooking,
  canManageListing,
  getListingState,
  isListingLive,
  isMasterAdmin,
  matchesAssignedStates
} from '@/lib/staff';

export default function AdminDashboardPage() {
  const {
    listings,
    bookings,
    staffAccounts,
    branchOffices,
    productOrders,
    studioBookings,
    equipmentRentals,
    digitalTickets,
    updateBooking,
    activities,
    addActivity,
    clearActivities,
    isLoading,
  } = useStore();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const master = isMasterAdmin(user);
  const showPayments = canAccessAdminModule(user, 'payments');
  const showBookings = canAccessAdminModule(user, 'bookings');
  const showTeam = canAccessAdminModule(user, 'team');

  const listingsById = React.useMemo(
    () => new Map(listings.map(l => [l.id, l])),
    [listings]
  );

  const scopedListings = React.useMemo(
    () => listings.filter(l => canManageListing(user, l)),
    [listings, user]
  );

  const scopedBookings = React.useMemo(
    () => bookings.filter(b => canManageBooking(user, b, listingsById)),
    [bookings, user, listingsById]
  );

  const scopedActivities = React.useMemo(() => {
    if (master) return activities;
    const branch = (user?.branchOffice || '').toLowerCase();
    const states = (user?.assignedStates || []).map(s => s.replace(/ state$/i, '').toLowerCase());
    return activities.filter(act => {
      if (act.actorName === user?.name) return true;
      const hay = `${act.actorRole} ${act.details || ''} ${act.target || ''} ${act.action}`.toLowerCase();
      if (branch && hay.includes(branch)) return true;
      return states.some(st => st && hay.includes(st));
    });
  }, [activities, master, user]);

  const [activityPage, setActivityPage] = React.useState(1);
  const activityPageSize = 10;
  const totalActivityPages = Math.ceil(scopedActivities.length / activityPageSize) || 1;

  const pagedActivities = React.useMemo(() => {
    return scopedActivities.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize);
  }, [scopedActivities, activityPage]);

  React.useEffect(() => {
    if (activityPage > totalActivityPages) {
      setActivityPage(Math.max(1, totalActivityPages));
    }
  }, [totalActivityPages, activityPage]);

  const handleClearActivities = async () => {
    if (!master) return;
    if (window.confirm('Are you sure you want to clear all staff activity history? This cannot be undone.')) {
      await clearActivities();
      setActivityPage(1);
      toast({
        title: 'Activity log cleared',
        description: 'All past activity entries have been cleared successfully.',
        variant: 'success'
      });
    }
  };

  const isPendingReceipt = (status: string) =>
    status === 'receipt_uploaded' || status === 'pending';

  const activeRentals = scopedBookings.filter(b => b.type === 'car_rental' && b.bookingStatus === 'confirmed');
  const pendingReceiptsCount = showPayments
    ? bookings.filter(b => isPendingReceipt(b.paymentStatus)).length +
      productOrders.filter(o => isPendingReceipt(o.paymentStatus)).length +
      studioBookings.filter(s => isPendingReceipt(s.paymentStatus)).length +
      equipmentRentals.filter(r => isPendingReceipt(r.paymentStatus)).length +
      digitalTickets.filter(t => isPendingReceipt(t.paymentStatus)).length
    : 0;
  const publishedListings = scopedListings.filter(l => isListingLive(l));
  const soldOrRentedListings = scopedListings.filter(l => l.status === 'sold' || l.status === 'rented');
  const pendingApprovalListings = scopedListings.filter(l => l.status === 'draft');
  const scheduledInspections = scopedBookings.filter(b => b.type === 'property_inspection' || b.type === 'car_test_drive');

  const recentSoldAlerts = React.useMemo(() => {
    return [...soldOrRentedListings]
      .sort((a, b) => new Date(b.soldAt || b.createdAt).getTime() - new Date(a.soldAt || a.createdAt).getTime())
      .slice(0, 4);
  }, [soldOrRentedListings]);

  const branchCoverage = React.useMemo(() => {
    if (!master) return [];
    return branchOffices.map(branch => {
      const branchListings = listings.filter(l => matchesAssignedStates(getListingState(l), [branch.state]));
      const liveCount = branchListings.filter(l => isListingLive(l)).length;
      const soldCount = branchListings.filter(l => l.status === 'sold' || l.status === 'rented').length;
      const repsCount = staffAccounts.filter(
        s => s.isActive && s.role !== 'Master Admin' && s.assignedStates.some(st => matchesAssignedStates(branch.state, [st]))
      ).length;
      return {
        ...branch,
        liveCount,
        soldCount,
        repsCount,
      };
    });
  }, [master, branchOffices, listings, staffAccounts]);

  const pendingOrRecentBookings = React.useMemo(() => {
    return [...scopedBookings].sort((a, b) => {
      const aPending = a.paymentStatus === 'receipt_uploaded' || a.paymentStatus === 'pending' ? 1 : 0;
      const bPending = b.paymentStatus === 'receipt_uploaded' || b.paymentStatus === 'pending' ? 1 : 0;
      if (bPending !== aPending) return bPending - aPending;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }).slice(0, 5);
  }, [scopedBookings]);

  const handleApproveBookingPayment = (bookingId: string) => {
    updateBooking(bookingId, {
      paymentStatus: 'verified',
      bookingStatus: 'confirmed'
    });
    addActivity({
      actorName: user?.name || 'Staff Admin',
      actorRole: user?.role || 'Operations Desk',
      action: `Approved payment receipt for ${bookingId}`,
      targetId: bookingId
    });
    toast({
      title: 'Payment approved',
      description: `Booking ${bookingId} marked as verified and confirmed.`,
      variant: 'success'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-wine-800">
              {master ? 'Operations Control' : 'Regional Partner Desk'}
            </span>
            {user?.role && (
              <span className="px-2 py-0.5 rounded-full bg-wine-50 text-wine-900 border border-wine-200 text-[10px] font-bold">
                {user.role}
              </span>
            )}
            {user?.branchOffice && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-text-main border border-border-subtle text-[10px] font-semibold">
                <MapPin className="w-3 h-3 text-wine-800" />
                <span>{user.branchOffice}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mt-0.5">
            {user?.name ? `Welcome back, ${user.name}` : 'Admin Overview Dashboard'}
          </h1>
          <p className="text-xs text-text-subtle mt-0.5">
            Signed in as <span className="font-semibold text-text-main">{user?.email || 'admin@bzgroup.com'}</span>
            {!master && user?.assignedStates?.length
              ? ` · Territory: ${user.assignedStates.join(', ')}`
              : ' · BZ Group Operations Desk'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {showPayments && (
            <Link href="/admin/payments">
              <Button variant="wineOutline" size="sm" className="font-semibold gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Review Payments</span>
              </Button>
            </Link>
          )}

          {showTeam && (
            <Link href="/admin/team">
              <Button variant="wineOutline" size="sm" className="font-semibold gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Team & Branches</span>
              </Button>
            </Link>
          )}

          <Link href="/admin/listings/new">
            <Button size="sm" className="font-semibold gap-1.5 shadow-sm">
              {master ? <Plus className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span>{master ? 'Add Listing' : 'Upload Photos / Add Item'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {isLoading ? (
        <AdminKpiSkeleton count={4} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {showPayments ? (
          <>
            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-75">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Active Car Rentals</span>
                <Car className="w-4 h-4 text-wine-800 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-wine-900 tracking-tight">
                {activeRentals.length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">Fleet deployed on road</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-150">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Pending Payment Receipts</span>
                <CreditCard className="w-4 h-4 text-amber-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight">
                {pendingReceiptsCount}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Require review & verification</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-200">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Scheduled Inspections</span>
                <CalendarCheck className="w-4 h-4 text-wine-800 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-wine-900 tracking-tight">
                {scheduledInspections.length}
              </div>
              <div className="text-[11px] text-text-subtle font-medium">Walkthroughs & test drives</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-300">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Published Listings</span>
                <Building className="w-4 h-4 text-emerald-600 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                {publishedListings.length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Live vehicles & properties ({soldOrRentedListings.length} sold/rented)
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-75">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Live Branch Inventory</span>
                <Building className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                {publishedListings.length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">Visible now on public site</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-150">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Sold / Rented & Removed</span>
                <CheckSquare className="w-4 h-4 text-wine-800" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-wine-900 tracking-tight">
                {soldOrRentedListings.length}
              </div>
              <div className="text-[11px] text-text-subtle font-medium">Hidden automatically from storefront</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-200">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>Awaiting HQ Approval</span>
                <Camera className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight">
                {pendingApprovalListings.length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Drafts / pending owner review</div>
            </div>

            <div className="hover-luxury-lift p-5 rounded-2xl bg-white border border-border-subtle shadow-xs space-y-2 transition-all duration-300 animate-fade-in-up delay-300">
              <div className="flex items-center justify-between text-xs text-text-subtle font-semibold">
                <span>{showBookings ? 'Branch Appointments' : 'Assigned Territory'}</span>
                {showBookings ? <CalendarCheck className="w-4 h-4 text-wine-800" /> : <MapPin className="w-4 h-4 text-wine-800" />}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-wine-900 tracking-tight">
                {showBookings ? scheduledInspections.length : user?.assignedStates?.length || 1}
              </div>
              <div className="text-[11px] text-text-subtle font-medium truncate">
                {showBookings ? 'Inspections, test drives & rentals' : (user?.assignedStates || ['Assigned Stand']).join(', ')}
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {/* Main Grid: Pending Approvals & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <AdminRowsSkeleton rows={5} />
          ) : (
          <>
          {master && recentSoldAlerts.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-[#fcf3f4] to-white border border-[#f0cfd4] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#f0cfd4] flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-[#81141f]">
                    Partner Sold & Rented Alerts
                  </h3>
                  <p className="text-xs text-text-subtle mt-0.5">
                    Recently closed by regional branches and automatically removed from public catalog
                  </p>
                </div>
                <Link href="/admin/listings" className="text-xs font-semibold text-wine-800 hover:underline shrink-0">
                  Manage Sold History →
                </Link>
              </div>
              <div className="divide-y divide-[#f2e2e5]">
                {recentSoldAlerts.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#81141f] text-white">
                          {item.status === 'rented' ? 'Rented Out' : 'Marked Sold'}
                        </span>
                        <span className="text-xs font-semibold text-text-subtle">
                          {getListingState(item)}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-text-main truncate">{item.title}</div>
                      <div className="text-xs text-text-subtle">
                        Marked by <strong className="text-text-main">{item.soldByName || item.createdByName || 'Branch Desk'}</strong>
                        {item.branchOffice ? ` · ${item.branchOffice}` : ''}
                      </div>
                    </div>
                    <Link
                      href="/admin/listings"
                      className="shrink-0 text-xs font-semibold text-wine-800 hover:underline"
                    >
                      Inspect
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {master && (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-main">
                    Regional Branches & Car Stands
                  </h3>
                  <p className="text-xs text-text-subtle mt-0.5">
                    Inventory coverage and assigned stand reps across active Nigerian states
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/admin/team?tab=branches" className="text-xs font-semibold text-wine-800 hover:underline">
                    Manage Branches →
                  </Link>
                  <Link href="/admin/team" className="text-xs font-semibold text-text-subtle hover:text-text-main hover:underline">
                    Partners →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                {branchCoverage.map(branch => (
                  <div
                    key={branch.id}
                    className="p-3.5 rounded-2xl bg-[#faf8f8] border border-border-subtle space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-text-main truncate">{branch.city}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-border-subtle text-wine-900">
                        {branch.repsCount} {branch.repsCount === 1 ? 'rep' : 'reps'}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-subtle truncate">{branch.name}</div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-semibold text-emerald-700">{branch.liveCount} live</span>
                      <span className="text-text-subtle">{branch.soldCount} sold/rented</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showBookings || showPayments ? (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-main">
                    {showPayments ? 'Pending Bookings & Receipts' : 'Branch Inspections & Bookings'}
                  </h3>
                  <p className="text-xs text-text-subtle mt-0.5">
                    {showPayments
                      ? 'Client transfer receipts requiring verification'
                      : 'Scheduled test drives, rentals and walkthroughs for your branch office'}
                  </p>
                </div>
                <Link href="/admin/bookings" className="text-xs font-semibold text-wine-800 hover:underline">
                  View All Bookings →
                </Link>
              </div>

              <div className="divide-y divide-border-subtle overflow-x-auto">
                {pendingOrRecentBookings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-subtle">
                    No active bookings for this branch right now.
                  </div>
                ) : (
                  pendingOrRecentBookings.map(b => (
                    <div key={b.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fbf3f4]/60 transition-colors duration-200">
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
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(b.customerPhone)}?text=${encodeURIComponent(`Hello ${b.customerName}, contacting you from BZ Group regarding booking ${b.id} (${b.listingTitle})...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-border-subtle bg-white text-text-subtle hover:text-[#25D366] hover:bg-[#faf7f7] transition-colors"
                          title={`Message ${b.customerName} on WhatsApp`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        {showPayments && b.paymentStatus !== 'verified' && (
                          <Button
                            size="xs"
                            onClick={() => handleApproveBookingPayment(b.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify & Approve</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-border-subtle shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-main">
                    Recent Branch Uploads
                  </h3>
                  <p className="text-xs text-text-subtle mt-0.5">
                    Cars & listings you manage in {user?.branchOffice || 'your stand'} — mark items sold as soon as payment clears
                  </p>
                </div>
                <Link href="/admin/listings" className="text-xs font-semibold text-wine-800 hover:underline">
                  Manage Listings →
                </Link>
              </div>

              <div className="divide-y divide-border-subtle">
                {scopedListings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-subtle">
                    No uploads in your territory yet. Tap &quot;Upload Photos / Add Item&quot; to publish your first unit.
                  </div>
                ) : (
                  scopedListings.slice(0, 6).map(item => (
                    <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fbf3f4]/60 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-wine-800">
                            {getListingState(item)}
                          </span>
                          <span className="text-[11px] text-text-subtle">· {item.status}</span>
                        </div>
                        <div className="text-sm font-bold text-text-main truncate">{item.title}</div>
                        <div className="text-xs text-text-subtle truncate">{item.location}</div>
                      </div>
                      <Link href="/admin/listings" className="shrink-0">
                        <Button variant="wineOutline" size="xs">Open</Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-border-subtle p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-wine-800 font-bold text-sm uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                <span>{master ? 'Staff Activity Trail' : 'Your Branch Activity'}</span>
              </div>
              {master && scopedActivities.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearActivities}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#716769] hover:text-[#81141f] hover:bg-[#fcf3f4] rounded-md transition-colors cursor-pointer"
                  title="Clear all activity history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <AdminRowsSkeleton rows={4} />
            ) : scopedActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-subtle space-y-1">
                <p className="font-semibold text-text-main">No activity recorded</p>
                <p>New staff and system actions will appear here in real-time.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3.5 divide-y divide-border-subtle/50 text-xs">
                  {pagedActivities.map(act => (
                    <div key={act.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between text-text-subtle text-[11px]">
                        <span className="font-semibold text-wine-900">{act.actorName}</span>
                        <span title={formatFullActivityDateTime(act.createdAt, act.timestamp)}>
                          {formatActivityTimestamp(act.createdAt, act.timestamp)}
                        </span>
                      </div>
                      <p className="text-text-main font-medium leading-relaxed">
                        {act.action}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pagination bar (10 per page) */}
                {totalActivityPages > 1 ? (
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-subtle">
                    <span>
                      {(activityPage - 1) * activityPageSize + 1}–{Math.min(activityPage * activityPageSize, scopedActivities.length)} of {scopedActivities.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={activityPage === 1}
                        onClick={() => setActivityPage(p => Math.max(p - 1, 1))}
                        className="px-2 py-1 rounded border border-border-subtle bg-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 flex items-center gap-1 font-medium text-[11px] cursor-pointer"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        <span>Prev</span>
                      </button>
                      <span className="font-semibold text-text-main px-1 text-[11px]">
                        {activityPage} / {totalActivityPages}
                      </span>
                      <button
                        type="button"
                        disabled={activityPage === totalActivityPages}
                        onClick={() => setActivityPage(p => Math.min(p + 1, totalActivityPages))}
                        className="px-2 py-1 rounded border border-border-subtle bg-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 flex items-center gap-1 font-medium text-[11px] cursor-pointer"
                        title="Next page"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-right text-[10px] text-text-subtle">
                    {scopedActivities.length} {scopedActivities.length === 1 ? 'activity' : 'activities'} logged
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
