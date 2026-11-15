'use client';

import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminEventsPage() {
  const {
    events,
    digitalTickets,
    addEvent,
    deleteEvent,
    updateDigitalTicket,
    checkInDigitalTicket,
  } = useStore();

  // QR Check-In Validator State
  const [scanInput, setScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{
    ok: boolean;
    message: string;
    reason?: string;
  } | null>(null);

  // Add Event State
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('Eko Hotel & Suites, Victoria Island');
  const [city, setCity] = useState('Lagos State');
  const [date, setDate] = useState('2026-12-20');
  const [startTime, setStartTime] = useState('06:00 PM');
  const [endTime, setEndTime] = useState('11:00 PM');
  const [regPrice, setRegPrice] = useState('35000');
  const [vipPrice, setVipPrice] = useState('120000');
  const [vvipPrice, setVvipPrice] = useState('450000');
  const [description, setDescription] = useState('');

  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const res = await checkInDigitalTicket(scanInput.trim(), 'Admin Gate Scanner');
    setScanFeedback({
      ok: res.ok,
      message: res.message,
      reason: res.reason,
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addEvent({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description:
        description.trim() ||
        'Exclusive BZ Group event with digital QR ticket verification.',
      image: '/photos/hero-villa-suv.jpg',
      venue,
      city,
      date,
      startTime,
      endTime,
      organizer: 'BZ De Great Group',
      status: 'published',
      featured: true,
      ticketTiers: [
        {
          id: `tier-reg-${Date.now()}`,
          name: 'Regular Pass',
          price: Number(regPrice) || 35000,
          capacity: 100,
          sold: 0,
          perks: ['General Admission', 'Welcome Refreshments'],
        },
        {
          id: `tier-vip-${Date.now()}`,
          name: 'VIP Executive Seat',
          price: Number(vipPrice) || 120000,
          capacity: 40,
          sold: 0,
          perks: ['VIP Front Lounge Seating', 'Executive Networking'],
        },
        {
          id: `tier-vvip-${Date.now()}`,
          name: 'VVIP Table Experience',
          price: Number(vvipPrice) || 450000,
          capacity: 15,
          sold: 0,
          perks: ['Reserved VVIP Table', 'Founder & Executive Access'],
        },
      ],
    });

    setName('');
    setDescription('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
          EVENTS BOX OFFICE &amp; GATE ACCESS
        </span>
        <h1 className="text-2xl font-extrabold text-[#1b1416]">
          Events, Ticket Tiers &amp; QR Check-In Validator
        </h1>
        <p className="text-xs text-[#716769]">
          Create events, configure Regular/VIP/VVIP ticket capacities, and scan or verify digital tickets at the gate.
        </p>
      </div>

      {/* QR Code / Ticket ID Check-In Scanner Box */}
      <div className="rounded-2xl border-2 border-[#81141f] bg-[#fbf3f4] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#81141f] text-white flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1b1416]">
              Gate QR Ticket Verification &amp; Duplicate Check-In Guard
            </h2>
            <p className="text-xs text-[#4d4547]">
              Enter a Ticket ID (e.g. <code>TKT-8821</code>), Ticket Verification Code (e.g.{' '}
              <code>BZ-TKT-8821-7E4A</code>), or raw QR payload to admit an attendee.
            </p>
          </div>
        </div>

        <form onSubmit={handleScanCheckIn} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Scan QR payload or enter Ticket Code (e.g. BZ-TKT-8821-7E4A)..."
            className="flex-1 h-11 bg-white border-[#e6d3d6] font-mono text-xs"
          />
          <Button
            type="submit"
            className="h-11 px-6 bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Validate &amp; Check In Attendee
          </Button>
        </form>

        {scanFeedback && (
          <div
            className={`rounded-xl p-4 border flex items-start gap-3 text-xs font-bold ${
              scanFeedback.ok
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {scanFeedback.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-extrabold">
                {scanFeedback.ok ? 'ADMITTED — VALID TICKET' : 'CHECK-IN REJECTED'}
              </p>
              <p className="mt-0.5 font-semibold">{scanFeedback.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Issued Digital Tickets Table */}
      <div className="rounded-2xl border border-[#eae3e4] bg-white overflow-x-auto">
        <div className="px-5 py-4 border-b border-[#eae3e4] bg-[#f8f5f5]">
          <h2 className="text-sm font-bold text-[#1b1416]">
            Issued Digital Tickets ({digitalTickets.length})
          </h2>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f5f5] border-b border-[#eae3e4] text-[#716769] uppercase">
            <tr>
              <th className="py-3 px-4">Ticket ID &amp; Code</th>
              <th className="py-3 px-4">Attendee</th>
              <th className="py-3 px-4">Event &amp; Tier</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Gate Status</th>
              <th className="py-3 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae3e4]">
            {digitalTickets.map((t) => (
              <tr key={t.id}>
                <td className="py-3 px-4">
                  <p className="font-extrabold text-[#81141f]">{t.id}</p>
                  <p className="font-mono text-[11px] text-[#4d4547]">{t.ticketCode}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-[#1b1416]">{t.customerName}</p>
                  <p className="text-[11px] text-[#716769]">{t.customerPhone}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-[#1b1416]">{t.eventName}</p>
                  <p className="text-[11px] text-[#81141f] font-semibold">
                    {t.quantity}x {t.tierName}
                  </p>
                </td>
                <td className="py-3 px-4 font-extrabold">
                  ₦{t.totalAmount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={t.paymentStatus}
                    onChange={(e) =>
                      updateDigitalTicket(t.id, { paymentStatus: e.target.value as any })
                    }
                    className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="receipt_uploaded">Receipt Uploaded</option>
                    <option value="verified">Verified ✓</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      t.ticketStatus === 'checked_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.ticketStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {t.ticketStatus === 'checked_in'
                      ? `Checked In ✓`
                      : t.ticketStatus.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    type="button"
                    disabled={t.ticketStatus === 'checked_in'}
                    onClick={async () => {
                      const res = await checkInDigitalTicket(t.ticketCode, 'Admin Table');
                      setScanFeedback({
                        ok: res.ok,
                        message: res.message,
                        reason: res.reason,
                      });
                    }}
                    className="h-8 px-3 rounded-lg bg-[#81141f] text-white text-[11px] font-bold cursor-pointer"
                  >
                    {t.ticketStatus === 'checked_in' ? 'Admitted' : 'Check In'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Events List & Add Event Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold text-[#1b1416]">
            Published Events ({events.length})
          </h3>
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-[#eae3e4] bg-white p-4 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-[#81141f]">
                  {ev.date} · {ev.startTime} · {ev.city}
                </span>
                <h4 className="text-sm font-bold text-[#1b1416]">{ev.name}</h4>
                <p className="text-xs text-[#716769]">{ev.venue}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ev.ticketTiers.map((tier) => (
                    <span
                      key={tier.id}
                      className="rounded-md bg-[#f8f5f5] border border-[#eae3e4] px-2 py-0.5 text-[11px] font-semibold"
                    >
                      {tier.name}: ₦{tier.price.toLocaleString()} ({tier.sold}/{tier.capacity} sold)
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteEvent(ev.id)}
                className="p-2 text-[#716769] hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleCreateEvent}
          className="lg:col-span-5 rounded-2xl border border-[#eae3e4] bg-white p-5 space-y-3 h-fit"
        >
          <h3 className="text-sm font-bold text-[#1b1416] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#81141f]" />
            <span>Create New Event</span>
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Event Title *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lagos Luxury Property & Tech Expo"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Venue *</label>
              <Input
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">City *</label>
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Date *</label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Start Time</label>
              <Input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">End Time</label>
              <Input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Regular (₦)</label>
              <Input
                type="number"
                value={regPrice}
                onChange={(e) => setRegPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">VIP (₦)</label>
              <Input
                type="number"
                value={vipPrice}
                onChange={(e) => setVipPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">VVIP (₦)</label>
              <Input
                type="number"
                value={vvipPrice}
                onChange={(e) => setVvipPrice(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Event Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 bg-[#81141f] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Publish Event &amp; Tiers
          </Button>
        </form>
      </div>
    </div>
  );
}
