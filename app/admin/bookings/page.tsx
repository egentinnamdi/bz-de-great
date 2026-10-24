'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  CalendarDays,
  Check,
  Clock,
  X,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface BookingRow {
  id: string;
  reference: string;
  customer: string;
  listing: string;
  when: string;
  type: 'Car rental' | 'Inspection' | 'Apartment' | 'Test drive';
  status: 'Pending' | 'Approved' | 'In progress' | 'Declined';
}

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const { bookings: storeBookings, updateBooking, addActivity } = useStore();
  const [timeFilter, setTimeFilter] = useState<'This week' | 'Next week' | 'This month'>('This week');
  const [searchQuery, setSearchQuery] = useState('');

  const bookings: BookingRow[] = useMemo(() => {
    return storeBookings.map(b => {
      let mappedType: BookingRow['type'] = 'Car rental';
      if (b.type === 'car_rental') mappedType = 'Car rental';
      else if (b.type === 'car_test_drive') mappedType = 'Test drive';
      else if (b.type === 'property_inspection') mappedType = 'Inspection';
      else if (b.listingTitle.toLowerCase().includes('apartment')) mappedType = 'Apartment';

      let mappedStatus: BookingRow['status'] = 'Pending';
      if (b.bookingStatus === 'confirmed') mappedStatus = 'Approved';
      else if (b.bookingStatus === 'active') mappedStatus = 'In progress';
      else if (b.bookingStatus === 'declined') mappedStatus = 'Declined';
      else mappedStatus = 'Pending';

      const whenStr = b.endDate ? `${b.startDate} → ${b.endDate}` : b.startDate;

      return {
        id: b.id,
        reference: b.reference || b.id,
        customer: b.customerName,
        listing: b.listingTitle,
        when: whenStr,
        type: mappedType,
        status: mappedStatus
      };
    });
  }, [storeBookings]);

  const needsConfirmation = useMemo(() => {
    return storeBookings
      .filter(b => b.bookingStatus === 'requested')
      .map(b => ({
        id: b.id,
        reference: b.reference || b.id,
        title: b.listingTitle,
        customerDate: `${b.customerName} · ${b.startDate}${b.endDate ? ` → ${b.endDate}` : ''}`,
        timeAgo: 'Just now'
      }));
  }, [storeBookings]);

  const handleConfirm = async (refOrId: string) => {
    const target = storeBookings.find(b => b.id === refOrId || b.reference === refOrId);
    if (target) {
      await updateBooking(target.id, { bookingStatus: 'confirmed' });
      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'confirmed booking',
        target: `${target.reference || target.id} · ${target.customerName}`,
        details: target.listingTitle,
        category: 'bookings'
      });
    }
    toast({
      title: 'Booking confirmed',
      description: `Notification sent to client.`,
      variant: 'default'
    });
  };

  const handleDecline = async (id: string, title: string) => {
    const target = storeBookings.find(b => b.id === id || b.reference === id);
    if (target) {
      await updateBooking(target.id, { bookingStatus: 'declined' });
      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'declined booking',
        target: `${target.reference || target.id} · ${target.customerName}`,
        details: title,
        category: 'bookings'
      });
    }
    toast({
      title: 'Booking declined',
      description: title,
      variant: 'default'
    });
  };

  const handleReschedule = (title: string) => {
    toast({
      title: 'Reschedule request sent',
      description: `Client invited to pick a revised slot for ${title}.`,
      variant: 'default'
    });
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      b =>
        b.reference.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.listing.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. TOP BAR (Figma: Top bar)
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] font-bold text-[#1b1416] tracking-tight">
            Bookings
          </h1>
          <p className="text-[13px] text-[#716769] font-normal">
            Rentals, test drives and inspections · 20–26 October
          </p>
        </div>

        {/* Global Search + Notifications + New Booking */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, listings, customers"
              className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>

          <div className="relative w-10 h-10 rounded-[8px] bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#81141f]" />
          </div>

          <button
            type="button"
            onClick={() =>
              toast({
                title: 'New reservation modal',
                description: 'Ready to record walk-in or phone reservation.',
                variant: 'default'
              })
            }
            className="h-[40px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New booking</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. FILTERS & LEGEND ROW
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Time Tabs */}
        <div className="flex items-center gap-2">
          {(['This week', 'Next week', 'This month'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setTimeFilter(tab)}
              className={`h-[36px] px-4 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer ${
                timeFilter === tab
                  ? 'bg-[#81141f] text-white shadow-2xs'
                  : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f] hover:text-[#81141f]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[12px] font-medium text-[#716769]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#81141f]" />
            <span>Car rentals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b1416]" />
            <span>Test drives</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span>Inspections</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. CALENDAR & NEEDS CONFIRMATION ROW
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs overflow-x-auto">
          <div className="min-w-[580px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 gap-2 pb-3 border-b border-[#eae3e4] text-center text-[12px] font-semibold">
              <div className="text-left text-[#716769] font-normal">Time</div>
              <div className="text-[#4a4245]">Mon 20</div>
              <div className="text-[#81141f] font-bold bg-[#fcf3f4] py-1 rounded-md">Tue 21</div>
              <div className="text-[#4a4245]">Wed 22</div>
              <div className="text-[#4a4245]">Thu 23</div>
              <div className="text-[#4a4245]">Fri 24</div>
              <div className="text-[#4a4245]">Sat 25</div>
              <div className="text-[#716769]">Sun 26</div>
            </div>

            {/* Time Grid with Dynamic Interactive Event Chips from Backend */}
            <div className="divide-y divide-[#eae3e4]/60 text-[11px] relative">
              {[
                { time: '8:00', slotBookings: storeBookings.filter((_, i) => i === 0) },
                { time: '9:00', slotBookings: storeBookings.filter((_, i) => i === 1) },
                { time: '10:00', slotBookings: storeBookings.filter((_, i) => i === 2) },
                { time: '11:00', slotBookings: storeBookings.filter((_, i) => i === 3) },
                { time: '12:00', slotBookings: storeBookings.filter((_, i) => i === 4) },
                { time: '13:00', slotBookings: [] },
                { time: '14:00', slotBookings: storeBookings.filter((_, i) => i === 5) },
                { time: '15:00', slotBookings: [] },
                { time: '16:00', slotBookings: [] },
                { time: '17:00', slotBookings: [] }
              ].map(slot => (
                <div key={slot.time} className="grid grid-cols-8 gap-2 py-3.5 items-center">
                  <div className="text-[#716769] font-mono">{slot.time}</div>
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const matchedBooking = slot.slotBookings[0] && (dayIdx === (slot.slotBookings[0].id.charCodeAt(slot.slotBookings[0].id.length - 1) % 6) + 1)
                      ? slot.slotBookings[0]
                      : null;

                    if (!matchedBooking) {
                      return <div key={dayIdx} />;
                    }

                    const isRental = matchedBooking.type === 'car_rental';
                    const isTestDrive = matchedBooking.type === 'car_test_drive';
                    const isInspection = matchedBooking.type === 'property_inspection';

                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          'p-2 rounded-[6px] leading-tight shadow-xs text-[10px] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer',
                          isRental && 'bg-[#81141f] text-white',
                          isTestDrive && 'bg-[#1b1416] text-white',
                          isInspection && 'bg-[#fef3c7] border border-[#fcd34d] text-[#92400e]'
                        )}
                        title={`${matchedBooking.listingTitle} (${matchedBooking.customerName})`}
                      >
                        <div className="font-semibold truncate">
                          {isRental ? `Rental · ${matchedBooking.listingTitle}` : isTestDrive ? `Drive · ${matchedBooking.listingTitle}` : `Inspect · ${matchedBooking.listingTitle}`}
                        </div>
                        <div className={cn('truncate', isInspection ? 'text-[#92400e]/80' : 'text-white/80')}>
                          {matchedBooking.customerName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Confirmation Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1b1416]">Needs confirmation</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
              {needsConfirmation.length} new
            </span>
          </div>

          <div className="space-y-3.5">
            {needsConfirmation.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-[12px] bg-[#faf8f8] border border-[#eae3e4] space-y-2.5 text-[12px]"
              >
                <div>
                  <div className="font-bold text-[13px] text-[#1b1416]">{item.title}</div>
                  <div className="text-[#716769]">{item.customerDate}</div>
                  <div className="text-[11px] text-[#716769] mt-0.5">{item.timeAgo}</div>
                </div>

                {/* 3 Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirm(item.id)}
                    className="flex-1 h-[32px] rounded-[6px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReschedule(item.title)}
                    className="flex-1 h-[32px] rounded-[6px] bg-white border border-[#eae3e4] hover:bg-[#f8f5f5] text-[#4a4245] font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecline(item.id, item.title)}
                    className="h-[32px] px-2.5 rounded-[6px] bg-white border border-[#eae3e4] hover:bg-rose-50 hover:text-rose-700 text-[#716769] font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}

            {needsConfirmation.length === 0 && (
              <div className="py-8 text-center text-[13px] text-[#716769]">
                All pending bookings have been confirmed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. ALL BOOKINGS TABLE
         ======================================================== */}
      <div className="bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[18px] font-bold text-[#1b1416]">All bookings</h2>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bookings"
              className="w-full h-[36px] pl-8 pr-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#eae3e4] text-[#716769] font-medium bg-[#faf8f8]">
                <th className="py-3 px-4 font-normal">Reference</th>
                <th className="py-3 px-4 font-normal">Customer</th>
                <th className="py-3 px-4 font-normal">Listing</th>
                <th className="py-3 px-4 font-normal">When</th>
                <th className="py-3 px-4 font-normal">Type</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {filteredBookings.map(row => (
                <tr key={row.id} className="hover:bg-[#fdfbfb] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#81141f]">
                    {row.reference}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1b1416]">{row.customer}</td>
                  <td className="py-3.5 px-4 text-[#4a4245]">{row.listing}</td>
                  <td className="py-3.5 px-4 text-[#716769] text-[12px]">{row.when}</td>
                  <td className="py-3.5 px-4 text-[#4a4245]">{row.type}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status === 'In progress'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => handleConfirm(row.reference)}
                        className="h-[30px] px-3.5 rounded-[6px] bg-[#81141f] hover:bg-[#680e18] text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: `Viewing Booking ${row.reference}`,
                            description: `${row.customer} · ${row.listing}`,
                            variant: 'default'
                          })
                        }
                        className="h-[30px] px-3.5 rounded-[6px] bg-white border border-[#eae3e4] hover:bg-[#f8f5f5] text-[#4a4245] font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
