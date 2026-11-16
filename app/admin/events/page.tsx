'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MapPin,
  Plus,
  QrCode,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import {
  DigitalTicket,
  DigitalTicketStatus,
  EventItem,
  EventTicketTier,
} from '@/lib/types';
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
  formatShortDate,
} from '@/components/admin/commerce-ui';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

type EventsTab = 'gate' | 'events';
type TicketFilter = 'all' | 'ready' | 'checked_in' | 'pending_payment' | 'cancelled';

export default function AdminEventsPage() {
  const {
    events,
    digitalTickets,
    addEvent,
    updateEvent,
    deleteEvent,
    updateDigitalTicket,
    checkInDigitalTicket,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<EventsTab>('gate');
  const [search, setSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('all');
  const [eventScopeId, setEventScopeId] = useState<string>('all');

  // Gate Scanner State
  const [scanInput, setScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{
    ok: boolean;
    message: string;
    reason?: string;
  } | null>(null);

  // Ticket Inspector Drawer
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Event Editor Drawer (Create / Edit)
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evName, setEvName] = useState('');
  const [evVenue, setEvVenue] = useState('Eko Hotel & Suites, Victoria Island');
  const [evCity, setEvCity] = useState('Lagos State');
  const [evDate, setEvDate] = useState('2026-12-20');
  const [evStartTime, setEvStartTime] = useState('06:00 PM');
  const [evEndTime, setEvEndTime] = useState('11:00 PM');
  const [evOrganizer, setEvOrganizer] = useState('BZ De Great Group');
  const [evStatus, setEvStatus] = useState<EventItem['status']>('published');
  const [evFeatured, setEvFeatured] = useState(true);
  const [evImage, setEvImage] = useState('/photos/hero-villa-suv.jpg');
  const [evDescription, setEvDescription] = useState('');
  const [evTiers, setEvTiers] = useState<EventTicketTier[]>([]);

  const selectedTicket = useMemo(
    () => digitalTickets.find((t) => t.id === selectedTicketId) || null,
    [digitalTickets, selectedTicketId]
  );

  const metrics = useMemo(() => {
    const publishedCount = events.filter((e) => e.status === 'published').length;
    const totalPasses = digitalTickets
      .filter((t) => t.ticketStatus !== 'cancelled')
      .reduce((sum, t) => sum + t.quantity, 0);
    const checkedInOrders = digitalTickets.filter(
      (t) => t.ticketStatus === 'checked_in'
    ).length;
    const readyAtGate = digitalTickets.filter((t) => t.ticketStatus === 'valid').length;
    const unverifiedPayments = digitalTickets.filter(
      (t) =>
        t.ticketStatus !== 'cancelled' &&
        (t.paymentStatus === 'pending' || t.paymentStatus === 'receipt_uploaded')
    ).length;

    const verifiedRevenue = digitalTickets
      .filter((t) => t.paymentStatus === 'verified' && t.ticketStatus !== 'cancelled')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      publishedCount,
      totalPasses,
      checkedInOrders,
      readyAtGate,
      unverifiedPayments,
      verifiedRevenue,
    };
  }, [events, digitalTickets]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return digitalTickets.filter((t) => {
      if (eventScopeId !== 'all' && t.eventId !== eventScopeId) return false;
      if (ticketFilter === 'ready' && t.ticketStatus !== 'valid') return false;
      if (ticketFilter === 'checked_in' && t.ticketStatus !== 'checked_in') return false;
      if (
        ticketFilter === 'pending_payment' &&
        t.paymentStatus !== 'pending' &&
        t.paymentStatus !== 'receipt_uploaded' &&
        t.ticketStatus !== 'pending_payment'
      ) {
        return false;
      }
      if (ticketFilter === 'cancelled' && t.ticketStatus !== 'cancelled') return false;

      if (q) {
        return (
          t.id.toLowerCase().includes(q) ||
          t.ticketCode.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.eventName.toLowerCase().includes(q) ||
          t.tierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [digitalTickets, eventScopeId, ticketFilter, search]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
    );
  }, [events, search]);

  // Gate Check-in Handlers
  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const res = await checkInDigitalTicket(
      scanInput.trim(),
      user?.name || 'Admin Gate Scanner'
    );
    setScanFeedback({
      ok: res.ok,
      message: res.message,
      reason: res.reason,
    });
    if (res.ok) {
      setScanInput('');
      toast({
        title: 'Attendee admitted',
        description: res.message,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Check-in blocked',
        description: res.message,
        variant: 'error',
      });
    }
  };

  const handleQuickCheckIn = async (ticket: DigitalTicket, source: string) => {
    const res = await checkInDigitalTicket(ticket.ticketCode, user?.name || source);
    setScanFeedback({
      ok: res.ok,
      message: res.message,
      reason: res.reason,
    });
    toast({
      title: res.ok ? 'Attendee checked in' : 'Check-in rejected',
      description: res.message,
      variant: res.ok ? 'success' : 'error',
    });
  };

  const handleTicketUpdate = async (
    ticket: DigitalTicket,
    updates: Partial<DigitalTicket>,
    actionNote: string
  ) => {
    await updateDigitalTicket(ticket.id, updates);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Events Box Office',
      action: `${actionNote} for ticket ${ticket.id}`,
      target: `${ticket.customerName} · ${ticket.eventName}`,
      targetId: ticket.id,
      category: 'payments',
    });
    toast({
      title: `Ticket ${ticket.id} updated`,
      description: actionNote,
      variant: 'success',
    });
  };

  // Event Drawer Handlers
  const openCreateEvent = () => {
    const stamp = Date.now();
    setEditingEventId(null);
    setEvName('');
    setEvVenue('Eko Hotel & Suites, Victoria Island');
    setEvCity('Lagos State');
    setEvDate('2026-12-20');
    setEvStartTime('06:00 PM');
    setEvEndTime('11:00 PM');
    setEvOrganizer('BZ De Great Group');
    setEvStatus('published');
    setEvFeatured(true);
    setEvImage('/photos/hero-villa-suv.jpg');
    setEvDescription('');
    setEvTiers([
      {
        id: `tier-reg-${stamp}`,
        name: 'Regular Pass',
        price: 35000,
        capacity: 100,
        sold: 0,
        perks: ['General Admission', 'Welcome Refreshments'],
      },
      {
        id: `tier-vip-${stamp + 1}`,
        name: 'VIP Executive Seat',
        price: 120000,
        capacity: 40,
        sold: 0,
        perks: ['VIP Front Lounge Seating', 'Executive Networking'],
      },
      {
        id: `tier-vvip-${stamp + 2}`,
        name: 'VVIP Table Experience',
        price: 450000,
        capacity: 15,
        sold: 0,
        perks: ['Reserved VVIP Table', 'Founder & Executive Access'],
      },
    ]);
    setEventDrawerOpen(true);
  };

  const openEditEvent = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEvName(ev.name);
    setEvVenue(ev.venue);
    setEvCity(ev.city);
    setEvDate(ev.date);
    setEvStartTime(ev.startTime);
    setEvEndTime(ev.endTime);
    setEvOrganizer(ev.organizer);
    setEvStatus(ev.status);
    setEvFeatured(Boolean(ev.featured));
    setEvImage(ev.image || '/photos/hero-villa-suv.jpg');
    setEvDescription(ev.description);
    setEvTiers(ev.ticketTiers.map((t) => ({ ...t, perks: [...t.perks] })));
    setEventDrawerOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evName.trim()) return;

    const cleanTiers = evTiers.filter((t) => t.name.trim());
    const payload = {
      name: evName.trim(),
      description:
        evDescription.trim() ||
        'Exclusive BZ Group event with digital QR ticket verification.',
      image: evImage.trim() || '/photos/hero-villa-suv.jpg',
      venue: evVenue.trim(),
      city: evCity.trim(),
      date: evDate,
      startTime: evStartTime.trim(),
      endTime: evEndTime.trim(),
      organizer: evOrganizer.trim() || 'BZ De Great Group',
      status: evStatus,
      featured: evFeatured,
      ticketTiers: cleanTiers,
    };

    if (editingEventId) {
      await updateEvent(editingEventId, payload);
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Events Box Office',
        action: `updated event: ${payload.name}`,
        targetId: editingEventId,
        category: 'content',
      });
      toast({
        title: 'Event updated',
        description: `${payload.name} changes saved.`,
        variant: 'success',
      });
    } else {
      await addEvent({
        ...payload,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Events Box Office',
        action: `published new event: ${payload.name}`,
        category: 'content',
      });
      toast({
        title: 'Event published',
        description: `${payload.name} and ticket tiers are now live.`,
        variant: 'success',
      });
    }

    setEventDrawerOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!editingEventId) return;
    const label = evName || 'event';
    await deleteEvent(editingEventId);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Events Box Office',
      action: `removed event: ${label}`,
      targetId: editingEventId,
      category: 'content',
    });
    toast({
      title: 'Event removed',
      description: `${label} deleted.`,
      variant: 'default',
    });
    setEventDrawerOpen(false);
  };

  const handleAddTier = () => {
    setEvTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}`,
        name: 'General Tier',
        price: 50000,
        capacity: 50,
        sold: 0,
        perks: ['Event Entry'],
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      <CommerceHeader
        title="Events & QR Gate"
        subtitle="Gate check-in validator, issued passes & ticket tier capacity"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ticket codes, guests, events..."
        primaryAction={
          <button
            type="button"
            onClick={openCreateEvent}
            className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        }
      />

      <CommerceMetricStrip
        metrics={[
          {
            label: 'Live Events',
            value: metrics.publishedCount,
            hint: `${events.length} total events`,
            tone: 'neutral',
          },
          {
            label: 'Passes Issued',
            value: metrics.totalPasses,
            hint: `${digitalTickets.length} ticket orders`,
            tone: 'neutral',
          },
          {
            label: 'Checked In at Gate',
            value: metrics.checkedInOrders,
            hint: `${metrics.readyAtGate} ready for admission`,
            tone: metrics.readyAtGate > 0 ? 'wine' : 'neutral',
          },
          {
            label: 'Verified Box Office',
            value: formatCompactNgn(metrics.verifiedRevenue),
            hint:
              metrics.unverifiedPayments > 0
                ? `${metrics.unverifiedPayments} awaiting payment check`
                : 'All passes verified',
            tone: metrics.unverifiedPayments > 0 ? 'amber' : 'emerald',
          },
        ]}
      />

      <CommerceTabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'gate',
            label: 'Gate & Tickets',
            count: digitalTickets.length,
            attentionCount: metrics.unverifiedPayments,
          },
          {
            id: 'events',
            label: 'Events',
            count: events.length,
          },
        ]}
      />

      {/* ====================================================================
          TAB 1: GATE & TICKETS
         ==================================================================== */}
      {tab === 'gate' && (
        <div className="space-y-4">
          {/* Minimalist Gate Validator Strip */}
          <div className="bg-white rounded-2xl border border-[#eae3e4] p-4 shadow-2xs space-y-3">
            <form
              onSubmit={handleScanCheckIn}
              className="flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#fbf3f4] border border-[#ebc7cb]/70 text-[#81141f] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <input
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan QR payload or enter Ticket Code (e.g. BZ-TKT-8821-7E4A)..."
                  className="flex-1 h-10 rounded-xl border border-[#eae3e4] px-3.5 text-xs font-mono text-[#1b1416] bg-[#fcfafa] focus:bg-white focus:outline-none focus:border-[#81141f] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
              >
                Validate &amp; Admit
              </button>
            </form>

            {scanFeedback && (
              <div
                className={cn(
                  'rounded-xl px-4 py-3 border flex items-center justify-between gap-3 text-xs',
                  scanFeedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {scanFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold mr-2">
                      {scanFeedback.ok ? 'Admitted:' : 'Rejected:'}
                    </span>
                    <span className="font-medium">{scanFeedback.message}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setScanFeedback(null)}
                  aria-label="Dismiss check-in notice"
                  className="opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CommerceFilterPills
              value={ticketFilter}
              onChange={setTicketFilter}
              options={[
                { id: 'all', label: 'All Passes', count: digitalTickets.length },
                { id: 'ready', label: 'Ready at Gate', count: metrics.readyAtGate },
                { id: 'checked_in', label: 'Checked In', count: metrics.checkedInOrders },
                { id: 'pending_payment', label: 'Pending Payment' },
                { id: 'cancelled', label: 'Cancelled' },
              ]}
            />

            {events.length > 1 && (
              <select
                value={eventScopeId}
                onChange={(e) => setEventScopeId(e.target.value)}
                aria-label="Filter tickets by event"
                className="h-9 rounded-xl border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f] max-w-[260px]"
              >
                <option value="all">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {filteredTickets.length === 0 ? (
            <CommerceEmptyState
              icon={<Ticket className="w-5 h-5" />}
              title="No matching digital tickets"
              description="Issued QR event passes appear here for payment verification and gate admission."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Ticket</th>
                      <th className="py-3.5 px-4">Attendee</th>
                      <th className="py-3.5 px-4">Event &amp; Tier</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-5 text-right">Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredTickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-[#81141f]">{t.id}</div>
                          <div className="font-mono text-[11px] text-[#716769]">
                            {t.ticketCode}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[13px] text-[#1b1416]">
                            {t.customerName}
                          </p>
                          <p className="text-[11px] text-[#716769]">{t.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#1b1416] max-w-[260px] truncate">
                            {t.eventName}
                          </p>
                          <p className="text-[11px] text-[#81141f] font-medium">
                            {t.quantity}x {t.tierName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1b1416] mb-1">
                            {formatNgn(t.totalAmount)}
                          </div>
                          <CommerceStatusPill status={t.paymentStatus} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2.5 justify-end">
                            <CommerceStatusPill status={t.ticketStatus} />
                            {t.ticketStatus === 'valid' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickCheckIn(t, 'Gate Table');
                                }}
                                className="h-8 px-3 rounded-lg bg-[#81141f] hover:bg-[#680e18] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Check In
                              </button>
                            )}
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
          TAB 2: EVENTS
         ==================================================================== */}
      {tab === 'events' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <CommerceEmptyState
              icon={<Calendar className="w-5 h-5" />}
              title="No events scheduled"
              description="Create an event and configure Regular, VIP, and VVIP ticket capacities."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => {
                const totalCap = ev.ticketTiers.reduce((s, t) => s + t.capacity, 0);
                const totalSold = ev.ticketTiers.reduce((s, t) => s + t.sold, 0);

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => openEditEvent(ev)}
                    className="group text-left bg-white rounded-2xl border border-[#eae3e4] p-5 hover:border-[#81141f]/40 hover:shadow-xs transition-all space-y-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.image || '/photos/hero-villa-suv.jpg'}
                        alt={ev.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#eae3e4] shrink-0 bg-[#f8f5f5]"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#81141f]">
                            {ev.date} · {ev.startTime} · {ev.city}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <CommerceStatusPill status={ev.status} />
                            <RowChevron />
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-[#1b1416] line-clamp-1">
                          {ev.name}
                        </h3>
                        <p className="text-xs text-[#716769] truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{ev.venue}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tier Capacity Progress */}
                    <div className="pt-3 border-t border-[#f0eaeb] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#716769] font-medium">
                        <span>Ticket Tiers ({ev.ticketTiers.length})</span>
                        <span>
                          {totalSold} / {totalCap} total sold
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ev.ticketTiers.map((tier) => {
                          const pct =
                            tier.capacity > 0
                              ? Math.min(100, Math.round((tier.sold / tier.capacity) * 100))
                              : 0;
                          return (
                            <div
                              key={tier.id}
                              className="rounded-xl bg-[#fcfafa] border border-[#eae3e4] p-2.5 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className="font-semibold text-[#1b1416] truncate">
                                  {tier.name}
                                </span>
                                <span className="text-[#716769] font-mono shrink-0">
                                  {tier.sold}/{tier.capacity}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[#eae3e4] overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full rounded-full bg-[#81141f]"
                                />
                              </div>
                              <div className="text-[11px] font-bold text-[#4a4245]">
                                {formatNgn(tier.price)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          DRAWER 1: TICKET INSPECTOR
         ==================================================================== */}
      <CommerceDrawer
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicketId(null)}
        eyebrow="Digital Pass"
        title={selectedTicket ? selectedTicket.id : ''}
        subtitle={
          selectedTicket
            ? `${selectedTicket.quantity}x ${selectedTicket.tierName} · ${selectedTicket.eventName}`
            : ''
        }
        footer={
          selectedTicket ? (
            <>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#716769]">
                <span>{selectedTicket.ticketCode}</span>
                <CopyButton value={selectedTicket.ticketCode} label="Copy Code" />
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] cursor-pointer"
              >
                Close
              </button>
            </>
          ) : null
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <CommerceCustomerCard
              name={selectedTicket.customerName}
              phone={selectedTicket.customerPhone}
              email={selectedTicket.customerEmail}
              whatsappMessage={`Hello ${selectedTicket.customerName}, contacting you from BZ Group Box Office regarding ticket ${selectedTicket.ticketCode} for ${selectedTicket.eventName}.`}
            />

            {/* Event & Gate Info */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769]">
                  Gate Verification
                </span>
                <CommerceStatusPill status={selectedTicket.ticketStatus} />
              </div>

              <div className="text-[#1b1416] font-semibold">{selectedTicket.eventName}</div>
              <div className="text-[#716769]">
                {selectedTicket.eventDate} · {selectedTicket.eventTime}
              </div>
              <div className="text-[#716769] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
                <span>{selectedTicket.eventVenue}</span>
              </div>

              {selectedTicket.checkedInAt && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-900 font-medium">
                  Checked in on {formatShortDate(selectedTicket.checkedInAt)}
                  {selectedTicket.checkedInBy ? ` by ${selectedTicket.checkedInBy}` : ''}
                </div>
              )}

              {selectedTicket.ticketStatus === 'valid' && (
                <button
                  type="button"
                  onClick={() => handleQuickCheckIn(selectedTicket, 'Ticket Drawer')}
                  className="w-full h-9 rounded-lg bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Admit &amp; Check In Attendee</span>
                </button>
              )}

              <div className="pt-2 border-t border-[#f0eaeb] flex items-center justify-between">
                <span className="text-[11px] text-[#716769]">Override Pass Status</span>
                <select
                  value={selectedTicket.ticketStatus}
                  onChange={(e) =>
                    handleTicketUpdate(
                      selectedTicket,
                      { ticketStatus: e.target.value as DigitalTicketStatus },
                      `set pass status to ${e.target.value}`
                    )
                  }
                  className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-semibold bg-white"
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="valid">Valid Pass</option>
                  <option value="checked_in">Checked In</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <CommercePaymentCard
              paymentStatus={selectedTicket.paymentStatus}
              receiptUrl={selectedTicket.receiptUrl}
              amount={selectedTicket.totalAmount}
              paymentsLink={`/admin/payments?order=${encodeURIComponent(selectedTicket.id)}`}
              verifyLabel="Verify Payment & Validate Pass"
              onVerifyAndConfirm={() =>
                handleTicketUpdate(
                  selectedTicket,
                  {
                    paymentStatus: 'verified',
                    ticketStatus:
                      selectedTicket.ticketStatus === 'pending_payment'
                        ? 'valid'
                        : selectedTicket.ticketStatus,
                  },
                  'verified ticket payment'
                )
              }
              onChangePaymentStatus={(next) =>
                handleTicketUpdate(
                  selectedTicket,
                  { paymentStatus: next },
                  `updated payment status to ${next}`
                )
              }
            />

            {selectedTicket.notes && (
              <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
                  Attendee Notes
                </span>
                <p className="text-xs text-[#1b1416]">{selectedTicket.notes}</p>
              </div>
            )}
          </div>
        )}
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 2: EVENT INSPECTOR & EDITOR
         ==================================================================== */}
      <CommerceDrawer
        open={eventDrawerOpen}
        onClose={() => setEventDrawerOpen(false)}
        eyebrow={editingEventId ? 'Edit Event' : 'New Event'}
        title={editingEventId ? evName || 'Event Details' : 'Create Event & Tiers'}
        subtitle="Configure event schedule, venue, and Regular / VIP / VVIP capacities"
        footer={
          <>
            <div>
              {editingEventId && (
                <CommerceTwoStepDelete label="Delete Event" onConfirm={handleDeleteEvent} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEventDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="event-editor-form"
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold cursor-pointer"
              >
                {editingEventId ? 'Save Event' : 'Publish Event'}
              </button>
            </div>
          </>
        }
      >
        <form id="event-editor-form" onSubmit={handleSaveEvent} className="space-y-4">
          <CommerceImageField
            label="Event Banner Image"
            value={evImage}
            onChange={setEvImage}
            fallback="/photos/hero-villa-suv.jpg"
          />

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Event Title *
            </label>
            <input
              required
              value={evName}
              onChange={(e) => setEvName(e.target.value)}
              placeholder="e.g. Lagos Luxury Property & Tech Expo"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Venue *</label>
              <input
                required
                value={evVenue}
                onChange={(e) => setEvVenue(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">City *</label>
              <input
                required
                value={evCity}
                onChange={(e) => setEvCity(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Date *</label>
              <input
                type="date"
                required
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-2.5 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Start</label>
              <input
                value={evStartTime}
                onChange={(e) => setEvStartTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-2.5 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">End</label>
              <input
                value={evEndTime}
                onChange={(e) => setEvEndTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-2.5 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Organizer
              </label>
              <input
                value={evOrganizer}
                onChange={(e) => setEvOrganizer(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Status</label>
              <select
                value={evStatus}
                onChange={(e) => setEvStatus(e.target.value as EventItem['status'])}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="flex items-center justify-between h-10 px-3 rounded-xl border border-[#eae3e4] bg-[#fcfafa] cursor-pointer">
              <span className="text-xs font-semibold text-[#1b1416]">Featured</span>
              <input
                type="checkbox"
                checked={evFeatured}
                onChange={(e) => setEvFeatured(e.target.checked)}
                className="accent-[#81141f] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={evDescription}
              onChange={(e) => setEvDescription(e.target.value)}
              placeholder="Event highlights, dress code, and guest agenda..."
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          {/* Ticket Tiers Editor */}
          <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b1416]">
                Ticket Tiers ({evTiers.length})
              </span>
              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#eae3e4] text-[11px] font-semibold text-[#81141f] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {evTiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="bg-white rounded-xl border border-[#eae3e4] p-3 space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={tier.name}
                      onChange={(e) =>
                        setEvTiers((prev) =>
                          prev.map((t, i) => (i === idx ? { ...t, name: e.target.value } : t))
                        )
                      }
                      placeholder="Tier name"
                      className="col-span-5 h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-semibold text-[#1b1416]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) =>
                        setEvTiers((prev) =>
                          prev.map((t, i) =>
                            i === idx ? { ...t, price: Number(e.target.value) || 0 } : t
                          )
                        )
                      }
                      placeholder="Price (₦)"
                      className="col-span-3 h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-semibold text-[#1b1416]"
                    />
                    <input
                      type="number"
                      min={1}
                      value={tier.capacity}
                      onChange={(e) =>
                        setEvTiers((prev) =>
                          prev.map((t, i) =>
                            i === idx
                              ? { ...t, capacity: Math.max(1, Number(e.target.value) || 1) }
                              : t
                          )
                        )
                      }
                      placeholder="Cap"
                      className="col-span-3 h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-semibold text-[#1b1416]"
                    />
                    <button
                      type="button"
                      onClick={() => setEvTiers((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove tier"
                      className="col-span-1 flex justify-center text-[#716769] hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#716769]">
                    <input
                      value={tier.perks.join(', ')}
                      onChange={(e) =>
                        setEvTiers((prev) =>
                          prev.map((t, i) =>
                            i === idx
                              ? {
                                  ...t,
                                  perks: e.target.value
                                    .split(',')
                                    .map((p) => p.trim())
                                    .filter(Boolean),
                                }
                              : t
                          )
                        )
                      }
                      placeholder="Perks (comma-separated)"
                      className="flex-1 h-7 rounded-md border border-[#eae3e4] px-2 text-[11px] text-[#4a4245]"
                    />
                    <span className="shrink-0 font-mono">{tier.sold} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CommerceDrawer>
    </div>
  );
}
