'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, Camera, CheckCircle2, Clock, MapPin, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import { validateStudioSlotConflict } from '@/lib/commerce-engine';
import { StudioBooking, StudioBookingStatus, StudioService } from '@/lib/types';
import {
  CommerceCustomerCard,
  CommerceDrawer,
  CommerceEmptyState,
  CommerceFilterPills,
  CommerceHeader,
  CommerceImageField,
  CommerceMetricStrip,
  CommercePaymentCard,
  CommerceStatusPill,
  CommerceTabs,
  CommerceTwoStepDelete,
  RowChevron,
  formatCompactNgn,
  formatNgn,
} from '@/components/admin/commerce-ui';
import { cn } from '@/lib/utils';

type StudioTab = 'sessions' | 'packages';
type SessionFilter = 'all' | 'action' | 'confirmed' | 'completed' | 'cancelled';

const STUDIO_STATUS_STEPS: Array<{ value: StudioBookingStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled (Frees Slot)' },
];

const SERVICE_TYPES = [
  'Portrait Session',
  'Studio Session',
  'Photo + Video Session',
  'Event Photography',
  'Product Photography',
];

export default function AdminStudioPage() {
  const {
    studioServices,
    studioBookings,
    addStudioService,
    updateStudioService,
    deleteStudioService,
    createStudioBooking,
    updateStudioBooking,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<StudioTab>('sessions');
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');

  // Session Inspector Drawer
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Package Drawer (Create / Edit)
  const [packageDrawerOpen, setPackageDrawerOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvType, setSrvType] = useState('Studio Session');
  const [srvDuration, setSrvDuration] = useState('2');
  const [srvPrice, setSrvPrice] = useState('150000');
  const [srvLocation, setSrvLocation] = useState('BZ De Great Creative Studio');
  const [srvSlots, setSrvSlots] = useState('09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM');
  const [srvIncludes, setSrvIncludes] = useState(
    'Full Lighting Rig\nStudio Assistant\nUninterrupted Power'
  );
  const [srvDescription, setSrvDescription] = useState('');
  const [srvImage, setSrvImage] = useState('/photos/founder-bz-3.jpg');
  const [srvStatus, setSrvStatus] = useState<StudioService['status']>('active');

  // Walk-in Booking Drawer
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [bkServiceId, setBkServiceId] = useState('');
  const [bkDate, setBkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bkSlot, setBkSlot] = useState('12:00 PM');
  const [bkName, setBkName] = useState('');
  const [bkPhone, setBkPhone] = useState('');
  const [bkEmail, setBkEmail] = useState('');
  const [bkNotes, setBkNotes] = useState('');

  const selectedSession = useMemo(
    () => studioBookings.find((b) => b.id === selectedSessionId) || null,
    [studioBookings, selectedSessionId]
  );

  const metrics = useMemo(() => {
    const needsAction = studioBookings.filter(
      (b) =>
        b.bookingStatus !== 'cancelled' &&
        b.bookingStatus !== 'completed' &&
        (b.bookingStatus === 'pending' ||
          b.bookingStatus === 'payment_pending' ||
          b.paymentStatus === 'pending' ||
          b.paymentStatus === 'receipt_uploaded')
    ).length;

    const activeCount = studioBookings.filter(
      (b) => b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed'
    ).length;

    const completedCount = studioBookings.filter(
      (b) => b.bookingStatus === 'completed'
    ).length;

    const activePackagesCount = studioServices.filter((s) => s.status === 'active').length;

    const verifiedRevenue = studioBookings
      .filter((b) => b.paymentStatus === 'verified' && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      needsAction,
      activeCount,
      completedCount,
      activePackagesCount,
      verifiedRevenue,
    };
  }, [studioBookings, studioServices]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studioBookings.filter((b) => {
      if (sessionFilter === 'action') {
        const needsAction =
          b.bookingStatus !== 'cancelled' &&
          b.bookingStatus !== 'completed' &&
          (b.bookingStatus === 'pending' ||
            b.bookingStatus === 'payment_pending' ||
            b.paymentStatus === 'pending' ||
            b.paymentStatus === 'receipt_uploaded');
        if (!needsAction) return false;
      } else if (sessionFilter !== 'all' && b.bookingStatus !== sessionFilter) {
        return false;
      }

      if (q) {
        return (
          b.id.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.date.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studioBookings, sessionFilter, search]);

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studioServices;
    return studioServices.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.serviceType.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [studioServices, search]);

  const activeServices = useMemo(
    () => studioServices.filter((s) => s.status === 'active'),
    [studioServices]
  );

  const chosenBookingService = useMemo(
    () => activeServices.find((s) => s.id === bkServiceId) || activeServices[0] || null,
    [activeServices, bkServiceId]
  );

  const slotConflictCheck = useMemo(() => {
    if (!chosenBookingService || !bkDate || !bkSlot) return { conflict: false };
    return validateStudioSlotConflict(
      studioBookings,
      chosenBookingService.id,
      bkDate,
      bkSlot
    );
  }, [chosenBookingService, studioBookings, bkDate, bkSlot]);

  // Handlers
  const handleSessionUpdate = async (
    booking: StudioBooking,
    updates: Partial<StudioBooking>,
    actionNote: string
  ) => {
    await updateStudioBooking(booking.id, updates);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Studio Desk',
      action: `${actionNote} for studio session ${booking.id}`,
      target: `${booking.customerName} · ${booking.date} ${booking.timeSlot}`,
      targetId: booking.id,
      category: 'bookings',
    });
    toast({
      title: `Session ${booking.id} updated`,
      description: actionNote,
      variant: 'success',
    });
  };

  const openCreatePackage = () => {
    setEditingServiceId(null);
    setSrvName('');
    setSrvType('Studio Session');
    setSrvDuration('2');
    setSrvPrice('150000');
    setSrvLocation('BZ De Great Creative Studio');
    setSrvSlots('09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM');
    setSrvIncludes('Full Lighting Rig\nStudio Assistant\nUninterrupted Power');
    setSrvDescription('');
    setSrvImage('/photos/founder-bz-3.jpg');
    setSrvStatus('active');
    setPackageDrawerOpen(true);
  };

  const openEditPackage = (srv: StudioService) => {
    setEditingServiceId(srv.id);
    setSrvName(srv.name);
    setSrvType(srv.serviceType);
    setSrvDuration(String(srv.durationHours));
    setSrvPrice(String(srv.price));
    setSrvLocation(srv.location);
    setSrvSlots(srv.availableSlots.join(', '));
    setSrvIncludes(srv.includes.join('\n'));
    setSrvDescription(srv.description);
    setSrvImage(srv.images[0] || '/photos/founder-bz-3.jpg');
    setSrvStatus(srv.status);
    setPackageDrawerOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    const cleanPayload = {
      name: srvName.trim(),
      serviceType: srvType,
      description:
        srvDescription.trim() || 'Professional studio session at BZ De Great Studio.',
      durationHours: Math.max(1, Number(srvDuration) || 2),
      price: Math.max(0, Number(srvPrice) || 150000),
      images: [srvImage.trim() || '/photos/founder-bz-3.jpg'],
      location: srvLocation.trim() || 'BZ De Great Creative Studio',
      includes: srvIncludes
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      availableSlots: srvSlots
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: srvStatus,
    };

    if (editingServiceId) {
      await updateStudioService(editingServiceId, cleanPayload);
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Studio Desk',
        action: `updated studio package: ${cleanPayload.name}`,
        targetId: editingServiceId,
        category: 'content',
      });
      toast({
        title: 'Studio package updated',
        description: `${cleanPayload.name} changes saved.`,
        variant: 'success',
      });
    } else {
      await addStudioService({
        ...cleanPayload,
        slug: cleanPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Studio Desk',
        action: `added studio package: ${cleanPayload.name}`,
        category: 'content',
      });
      toast({
        title: 'Studio package created',
        description: `${cleanPayload.name} is now available for bookings.`,
        variant: 'success',
      });
    }

    setPackageDrawerOpen(false);
  };

  const handleDeletePackage = async () => {
    if (!editingServiceId) return;
    const label = srvName || 'Studio package';
    await deleteStudioService(editingServiceId);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Studio Desk',
      action: `removed studio package: ${label}`,
      targetId: editingServiceId,
      category: 'content',
    });
    toast({
      title: 'Package removed',
      description: `${label} deleted.`,
      variant: 'default',
    });
    setPackageDrawerOpen(false);
  };

  const openBookSession = () => {
    const first = activeServices[0];
    setBkServiceId(first?.id || '');
    setBkSlot(first?.availableSlots[0] || '09:00 AM');
    setBkName('');
    setBkPhone('');
    setBkEmail('');
    setBkNotes('');
    setBookingDrawerOpen(true);
  };

  const handleCreateWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenBookingService || !bkName.trim() || !bkPhone.trim()) return;

    const result = await createStudioBooking({
      serviceId: chosenBookingService.id,
      date: bkDate,
      timeSlot: bkSlot,
      customerName: bkName.trim(),
      customerPhone: bkPhone.trim(),
      customerEmail: bkEmail.trim() || 'client@bzgroup.ng',
      notes: bkNotes.trim() || undefined,
    });

    if (!result.ok) {
      toast({
        title: 'Slot unavailable',
        description: result.error,
        variant: 'error',
      });
      return;
    }

    toast({
      title: 'Studio session booked',
      description: `${result.booking?.id} scheduled for ${bkDate} at ${bkSlot}.`,
      variant: 'success',
    });
    setBookingDrawerOpen(false);
    setTab('sessions');
  };

  return (
    <div className="space-y-6 pb-12">
      <CommerceHeader
        title="Studio"
        subtitle="Session schedule, client bookings & creative packages"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sessions, clients, packages..."
        secondaryAction={
          <button
            type="button"
            onClick={openBookSession}
            className="h-10 px-3.5 rounded-xl border border-[#eae3e4] bg-white hover:border-[#81141f] text-[13px] font-semibold text-[#1b1416] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#81141f]" />
            <span>Book Session</span>
          </button>
        }
        primaryAction={
          <button
            type="button"
            onClick={openCreatePackage}
            className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Package</span>
          </button>
        }
      />

      <CommerceMetricStrip
        metrics={[
          {
            label: 'Active Sessions',
            value: metrics.activeCount,
            hint:
              metrics.needsAction > 0
                ? `${metrics.needsAction} awaiting confirmation`
                : 'All active sessions confirmed',
            tone: metrics.needsAction > 0 ? 'amber' : 'neutral',
          },
          {
            label: 'Completed Shoots',
            value: metrics.completedCount,
            hint: `${studioBookings.length} total bookings`,
            tone: 'neutral',
          },
          {
            label: 'Studio Packages',
            value: metrics.activePackagesCount,
            hint: `of ${studioServices.length} configured`,
            tone: 'neutral',
          },
          {
            label: 'Verified Revenue',
            value: formatCompactNgn(metrics.verifiedRevenue),
            hint: 'Cleared studio payments',
            tone: 'emerald',
          },
        ]}
      />

      <CommerceTabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'sessions',
            label: 'Sessions',
            count: studioBookings.length,
            attentionCount: metrics.needsAction,
          },
          {
            id: 'packages',
            label: 'Packages',
            count: studioServices.length,
          },
        ]}
      />

      {/* ====================================================================
          TAB 1: SESSIONS
         ==================================================================== */}
      {tab === 'sessions' && (
        <div className="space-y-4">
          <CommerceFilterPills
            value={sessionFilter}
            onChange={setSessionFilter}
            options={[
              { id: 'all', label: 'All Sessions', count: studioBookings.length },
              { id: 'action', label: 'Needs Action', count: metrics.needsAction },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ]}
          />

          {filteredSessions.length === 0 ? (
            <CommerceEmptyState
              icon={<Camera className="w-5 h-5" />}
              title="No studio sessions found"
              description="Booked photography and production sessions appear here. Use Book Session to add a walk-in booking."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Session</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Package</th>
                      <th className="py-3.5 px-4">Schedule</th>
                      <th className="py-3.5 px-5 text-right">Amount &amp; Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredSessions.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedSessionId(b.id)}
                        className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-[#81141f]">{b.id}</div>
                          <div className="text-[11px] text-[#716769]">{b.serviceType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[13px] text-[#1b1416]">
                            {b.customerName}
                          </p>
                          <p className="text-[11px] text-[#716769]">{b.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#1b1416] max-w-[260px] truncate">
                            {b.serviceName}
                          </p>
                          <p className="text-[11px] text-[#716769]">{b.durationHours} hrs</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1b1416]">{b.date}</div>
                          <div className="text-[11px] text-[#716769]">{b.timeSlot}</div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2.5 flex-wrap justify-end">
                            <span className="font-semibold text-[13px] text-[#1b1416] mr-1">
                              {formatNgn(b.totalAmount)}
                            </span>
                            <CommerceStatusPill status={b.paymentStatus} />
                            <CommerceStatusPill status={b.bookingStatus} />
                            <RowChevron />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 2: PACKAGES
         ==================================================================== */}
      {tab === 'packages' && (
        <div className="space-y-4">
          {filteredPackages.length === 0 ? (
            <CommerceEmptyState
              icon={<Camera className="w-5 h-5" />}
              title="No studio packages found"
              description="Create a photography or production stage package to accept online bookings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPackages.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => openEditPackage(srv)}
                  className="group text-left bg-white rounded-2xl border border-[#eae3e4] p-5 hover:border-[#81141f]/40 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srv.images[0] || '/photos/founder-bz-3.jpg'}
                    alt={srv.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#eae3e4] shrink-0 bg-[#f8f5f5]"
                  />

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-[#81141f]">
                          {srv.serviceType} · {srv.durationHours} hrs
                        </span>
                        <h3 className="text-sm font-bold text-[#1b1416] truncate">
                          {srv.name}
                        </h3>
                      </div>
                      <RowChevron />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-serif text-base font-bold text-[#1b1416]">
                        {formatNgn(srv.price)}
                      </span>
                      <CommerceStatusPill status={srv.status} />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#716769]">
                      <span>{srv.availableSlots.length} daily slots</span>
                      <span>·</span>
                      <span>{srv.includes.length} inclusions</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          DRAWER 1: SESSION INSPECTOR
         ==================================================================== */}
      <CommerceDrawer
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSessionId(null)}
        eyebrow="Studio Session"
        title={selectedSession ? selectedSession.id : ''}
        subtitle={
          selectedSession
            ? `${selectedSession.serviceName} · ${selectedSession.date}`
            : ''
        }
        footer={
          selectedSession ? (
            <>
              <span className="text-[11px] text-[#716769]">
                Ref: <strong className="font-mono">{selectedSession.reference}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSessionId(null)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] cursor-pointer"
              >
                Close
              </button>
            </>
          ) : null
        }
      >
        {selectedSession && (
          <div className="space-y-4">
            <CommerceCustomerCard
              name={selectedSession.customerName}
              phone={selectedSession.customerPhone}
              email={selectedSession.customerEmail}
              whatsappMessage={`Hello ${selectedSession.customerName}, contacting you from BZ De Great Studio regarding session ${selectedSession.id} on ${selectedSession.date} at ${selectedSession.timeSlot}.`}
            />

            {/* Schedule & Location Summary */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#716769] block">Date &amp; Time Slot</span>
                <div className="font-semibold text-[#1b1416] mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#81141f]" />
                  <span>
                    {selectedSession.date} · {selectedSession.timeSlot}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[#716769] block">Duration</span>
                <div className="font-semibold text-[#1b1416] mt-0.5">
                  {selectedSession.durationHours} hours ({selectedSession.serviceType})
                </div>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#f0eaeb]">
                <span className="text-[11px] text-[#716769] block">Studio Venue</span>
                <div className="font-medium text-[#1b1416] mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
                  <span>{selectedSession.location}</span>
                </div>
              </div>
            </div>

            <CommercePaymentCard
              paymentStatus={selectedSession.paymentStatus}
              receiptUrl={selectedSession.receiptUrl}
              amount={selectedSession.totalAmount}
              paymentsLink={`/admin/payments?order=${encodeURIComponent(selectedSession.id)}`}
              verifyLabel="Verify Payment & Confirm Session"
              onVerifyAndConfirm={() =>
                handleSessionUpdate(
                  selectedSession,
                  { paymentStatus: 'verified', bookingStatus: 'confirmed' },
                  'verified payment & confirmed studio slot'
                )
              }
              onChangePaymentStatus={(next) =>
                handleSessionUpdate(
                  selectedSession,
                  { paymentStatus: next },
                  `updated payment status to ${next}`
                )
              }
            />

            {/* Session Status Steps */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769]">
                  Session Status
                </span>
                <CommerceStatusPill status={selectedSession.bookingStatus} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STUDIO_STATUS_STEPS.map((step) => {
                  const active = selectedSession.bookingStatus === step.value;
                  return (
                    <button
                      key={step.value}
                      type="button"
                      onClick={() =>
                        handleSessionUpdate(
                          selectedSession,
                          { bookingStatus: step.value },
                          `marked session ${step.label.toLowerCase()}`
                        )
                      }
                      className={cn(
                        'h-9 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        step.value === 'cancelled' && 'col-span-2',
                        active
                          ? 'bg-[#81141f] border-[#81141f] text-white'
                          : 'bg-white border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]/50'
                      )}
                    >
                      {active && <CheckCircle2 className="w-3 h-3" />}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSession.notes && (
              <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
                  Shoot Brief / Notes
                </span>
                <p className="text-xs text-[#1b1416] leading-relaxed">{selectedSession.notes}</p>
              </div>
            )}
          </div>
        )}
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 2: PACKAGE INSPECTOR & EDITOR
         ==================================================================== */}
      <CommerceDrawer
        open={packageDrawerOpen}
        onClose={() => setPackageDrawerOpen(false)}
        eyebrow={editingServiceId ? 'Edit Package' : 'New Studio Package'}
        title={editingServiceId ? srvName || 'Studio Package' : 'Create Studio Package'}
        subtitle="Configure pricing, time slots, and included deliverables"
        footer={
          <>
            <div>
              {editingServiceId && (
                <CommerceTwoStepDelete
                  label="Delete Package"
                  onConfirm={handleDeletePackage}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPackageDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="studio-package-form"
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold cursor-pointer"
              >
                {editingServiceId ? 'Save Package' : 'Publish Package'}
              </button>
            </div>
          </>
        }
      >
        <form id="studio-package-form" onSubmit={handleSavePackage} className="space-y-4">
          <CommerceImageField
            label="Package Cover Image"
            value={srvImage}
            onChange={setSrvImage}
            fallback="/photos/founder-bz-3.jpg"
          />

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Package Name *
            </label>
            <input
              required
              value={srvName}
              onChange={(e) => setSrvName(e.target.value)}
              placeholder="e.g. Music Video Cyclorama Full Day"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Session Type
              </label>
              <select
                value={srvType}
                onChange={(e) => setSrvType(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={srvPrice}
                onChange={(e) => setSrvPrice(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min={1}
                value={srvDuration}
                onChange={(e) => setSrvDuration(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Location
              </label>
              <input
                value={srvLocation}
                onChange={(e) => setSrvLocation(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Status
              </label>
              <select
                value={srvStatus}
                onChange={(e) => setSrvStatus(e.target.value as StudioService['status'])}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                <option value="active">Active (Bookable)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Available Time Slots (comma-separated)
            </label>
            <input
              value={srvSlots}
              onChange={(e) => setSrvSlots(e.target.value)}
              placeholder="09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Included Deliverables (one per line)
            </label>
            <textarea
              rows={3}
              value={srvIncludes}
              onChange={(e) => setSrvIncludes(e.target.value)}
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={srvDescription}
              onChange={(e) => setSrvDescription(e.target.value)}
              placeholder="Stage amenities, lighting setup, and turnaround details"
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>
        </form>
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 3: WALK-IN BOOKING
         ==================================================================== */}
      <CommerceDrawer
        open={bookingDrawerOpen}
        onClose={() => setBookingDrawerOpen(false)}
        eyebrow="Walk-in / Phone Booking"
        title="Schedule Studio Session"
        subtitle="Automatically checks for double-booked studio slots"
        widthClass="max-w-lg"
        footer={
          <>
            <span className="text-xs font-semibold text-[#1b1416]">
              {chosenBookingService ? formatNgn(chosenBookingService.price) : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBookingDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="walkin-studio-form"
                disabled={slotConflictCheck.conflict || !chosenBookingService}
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                Create Booking
              </button>
            </div>
          </>
        }
      >
        <form id="walkin-studio-form" onSubmit={handleCreateWalkInBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Studio Package *
            </label>
            <select
              value={chosenBookingService?.id || ''}
              onChange={(e) => {
                const next = activeServices.find((s) => s.id === e.target.value);
                setBkServiceId(e.target.value);
                if (next && next.availableSlots.length > 0) {
                  setBkSlot(next.availableSlots[0]);
                }
              }}
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            >
              {activeServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatNgn(s.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Date *</label>
              <input
                type="date"
                required
                value={bkDate}
                onChange={(e) => setBkDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Time Slot *
              </label>
              <select
                value={bkSlot}
                onChange={(e) => setBkSlot(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                {(chosenBookingService?.availableSlots || [
                  '09:00 AM',
                  '12:00 PM',
                  '03:00 PM',
                  '06:00 PM',
                ]).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {slotConflictCheck.conflict && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
              Slot already booked by{' '}
              <strong>{slotConflictCheck.conflictingBooking?.customerName}</strong> (
              {slotConflictCheck.conflictingBooking?.id}). Pick another time or date.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Client Name *
              </label>
              <input
                required
                value={bkName}
                onChange={(e) => setBkName(e.target.value)}
                placeholder="Full name"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Phone *
              </label>
              <input
                required
                value={bkPhone}
                onChange={(e) => setBkPhone(e.target.value)}
                placeholder="+234 800 ..."
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">Email</label>
            <input
              type="email"
              value={bkEmail}
              onChange={(e) => setBkEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Session Notes
            </label>
            <textarea
              rows={2}
              value={bkNotes}
              onChange={(e) => setBkNotes(e.target.value)}
              placeholder="Lighting requirements, wardrobe rooms, or set notes..."
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>
        </form>
      </CommerceDrawer>
    </div>
  );
}
