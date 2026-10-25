'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
  isValid
} from 'date-fns';
import {
  Search,
  Bell,
  Plus,
  CalendarDays,
  Check,
  Clock,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  User,
  MessageSquare,
  Car,
  Home,
  Compass,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Booking, Listing } from '@/lib/types';

interface BookingRow {
  id: string;
  reference: string;
  customer: string;
  listing: string;
  when: string;
  type: 'Car rental' | 'Inspection' | 'Apartment' | 'Test drive';
  status: 'Pending' | 'Approved' | 'In progress' | 'Declined' | 'Rescheduled';
  raw: Booking;
}

const WORKING_HOURS = [
  '8:00',
  '9:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00'
];

/**
 * Extracts normalized Date and starting hour (0..23) for a booking.
 */
function parseBookingDateTime(booking: Booking): { date: Date | null; hour: number } {
  try {
    if (!booking.startDate) return { date: null, hour: 10 };

    const dateObj = new Date(booking.startDate);
    if (!isValid(dateObj)) return { date: null, hour: 10 };

    // Check if startDate explicitly has an hour component
    if (booking.startDate.includes('T') || (booking.startDate.includes(' ') && booking.startDate.includes(':'))) {
      return { date: dateObj, hour: dateObj.getHours() };
    }

    // Inspect booking notes for explicit time mentions, e.g. "at 11:00 AM", "02:00 PM", "9:00 AM"
    if (booking.notes) {
      const match = booking.notes.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const meridiem = match[3]?.toUpperCase();
        if (meridiem === 'PM' && hour < 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;
        return { date: dateObj, hour };
      }
    }

    // Default business hours based on booking category
    const fallbackHour = booking.type === 'car_rental' ? 9 : booking.type === 'property_inspection' ? 11 : 14;
    return { date: dateObj, hour: fallbackHour };
  } catch {
    return { date: null, hour: 10 };
  }
}

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const { bookings: storeBookings, listings, createBooking, updateBooking, addActivity } = useStore();

  // Navigation & Filtering
  const [timeFilter, setTimeFilter] = useState<'This week' | 'Next week' | 'This month'>('This week');
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [newBookingSlot, setNewBookingSlot] = useState<{ date: string; hour: string } | null>(null);

  // New Booking Form State
  const [formType, setFormType] = useState<Booking['type']>('car_rental');
  const [formListingId, setFormListingId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartHour, setFormStartHour] = useState('10:00');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDriverOption, setFormDriverOption] = useState<'Self-drive' | 'Chauffeured'>('Chauffeured');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------------------------------------------------------------------
  // Calendar Intervals & Dates (using date-fns)
  // --------------------------------------------------------------------------
  const weekStart = useMemo(() => startOfWeek(activeDate, { weekStartsOn: 1 }), [activeDate]);
  const weekEnd = useMemo(() => endOfWeek(activeDate, { weekStartsOn: 1 }), [activeDate]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const monthStart = useMemo(() => startOfMonth(activeDate), [activeDate]);
  const monthEnd = useMemo(() => endOfMonth(activeDate), [activeDate]);
  const monthGridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const monthGridEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);
  const monthDays = useMemo(
    () => eachDayOfInterval({ start: monthGridStart, end: monthGridEnd }),
    [monthGridStart, monthGridEnd]
  );

  // Handlers for switching time tabs
  const handleSelectTab = (tab: 'This week' | 'Next week' | 'This month') => {
    setTimeFilter(tab);
    if (tab === 'This week') {
      setActiveDate(new Date());
    } else if (tab === 'Next week') {
      setActiveDate(addWeeks(new Date(), 1));
    }
  };

  const handlePrev = () => {
    if (timeFilter === 'This month') {
      setActiveDate(prev => subMonths(prev, 1));
    } else {
      setActiveDate(prev => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (timeFilter === 'This month') {
      setActiveDate(prev => addMonths(prev, 1));
    } else {
      setActiveDate(prev => addWeeks(prev, 1));
    }
  };

  const handleGoToday = () => {
    setActiveDate(new Date());
    setTimeFilter('This week');
  };

  // --------------------------------------------------------------------------
  // Map Store Bookings to Slots and Rows
  // --------------------------------------------------------------------------
  const parsedBookings = useMemo(() => {
    return storeBookings.map(b => {
      const { date, hour } = parseBookingDateTime(b);
      return {
        booking: b,
        date,
        hour
      };
    });
  }, [storeBookings]);

  // Find bookings matching a specific day and hour slot
  const getBookingsForSlot = (day: Date, hourStr: string) => {
    const slotHour = parseInt(hourStr.split(':')[0], 10);
    return parsedBookings.filter(item => {
      if (!item.date) return false;
      return isSameDay(item.date, day) && item.hour === slotHour;
    });
  };

  // Find bookings for an entire day (for Month View)
  const getBookingsForDay = (day: Date) => {
    return parsedBookings.filter(item => {
      if (!item.date) return false;
      return isSameDay(item.date, day);
    });
  };

  // Needs confirmation list
  const needsConfirmation = useMemo(() => {
    return storeBookings
      .filter(b => b.bookingStatus === 'requested')
      .map(b => ({
        id: b.id,
        reference: b.reference || b.id,
        title: b.listingTitle,
        customerDate: `${b.customerName} · ${b.startDate}${b.endDate ? ` → ${b.endDate}` : ''}`,
        timeAgo: 'Just now',
        raw: b
      }));
  }, [storeBookings]);

  // All bookings table data
  const bookingsTableRows: BookingRow[] = useMemo(() => {
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
      else if (b.bookingStatus === 'rescheduled') mappedStatus = 'Rescheduled';
      else mappedStatus = 'Pending';

      const whenStr = b.endDate ? `${b.startDate.split('T')[0]} → ${b.endDate.split('T')[0]}` : b.startDate.split('T')[0];

      return {
        id: b.id,
        reference: b.reference || b.id,
        customer: b.customerName,
        listing: b.listingTitle,
        when: whenStr,
        type: mappedType,
        status: mappedStatus,
        raw: b
      };
    });
  }, [storeBookings]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookingsTableRows;
    const q = searchQuery.toLowerCase();
    return bookingsTableRows.filter(
      b =>
        b.reference.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.listing.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
    );
  }, [bookingsTableRows, searchQuery]);

  // --------------------------------------------------------------------------
  // Booking Action Handlers
  // --------------------------------------------------------------------------
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
      if (selectedBooking && selectedBooking.id === target.id) {
        setSelectedBooking(prev => prev ? { ...prev, bookingStatus: 'confirmed' } : null);
      }
    }
    toast({
      title: 'Booking confirmed',
      description: `Reservation ${refOrId} has been successfully approved.`,
      variant: 'default'
    });
  };

  const handleDecline = async (id: string, title?: string) => {
    const target = storeBookings.find(b => b.id === id || b.reference === id);
    if (target) {
      await updateBooking(target.id, { bookingStatus: 'declined' });
      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'declined booking',
        target: `${target.reference || target.id} · ${target.customerName}`,
        details: title || target.listingTitle,
        category: 'bookings'
      });
      if (selectedBooking && selectedBooking.id === target.id) {
        setSelectedBooking(prev => prev ? { ...prev, bookingStatus: 'declined' } : null);
      }
    }
    toast({
      title: 'Booking declined',
      description: `Status for ${title || id} marked as declined.`,
      variant: 'default'
    });
  };

  const handleReschedule = async (refOrId: string, title?: string) => {
    const target = storeBookings.find(b => b.id === refOrId || b.reference === refOrId || b.listingTitle === refOrId);
    if (target) {
      await updateBooking(target.id, { bookingStatus: 'rescheduled' });
      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'requested reschedule for booking',
        target: `${target.reference || target.id} · ${target.customerName}`,
        details: target.listingTitle,
        category: 'bookings'
      });
      if (selectedBooking && selectedBooking.id === target.id) {
        setSelectedBooking(prev => prev ? { ...prev, bookingStatus: 'rescheduled' } : null);
      }
    }
    toast({
      title: 'Reschedule requested',
      description: `Client invited to select a revised appointment slot.`,
      variant: 'default'
    });
  };

  const handleOpenNewBookingForSlot = (day: Date, hourStr: string) => {
    const dateFormatted = format(day, 'yyyy-MM-dd');
    setFormStartDate(dateFormatted);
    setFormStartHour(hourStr);
    setNewBookingSlot({ date: format(day, 'EEEE, d MMMM yyyy'), hour: hourStr });
    setIsNewBookingModalOpen(true);
  };

  const handleCreateNewBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formCustomerPhone.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide customer name and phone number.',
        variant: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedListing = listings.find(l => l.id === formListingId) || listings[0];
      const startDateTime = `${formStartDate || format(activeDate, 'yyyy-MM-dd')}T${formStartHour.padStart(5, '0')}:00`;

      const newBooking = await createBooking({
        type: formType,
        listingId: selectedListing ? selectedListing.id : 'custom-listing',
        listingTitle: selectedListing ? selectedListing.title : 'General Reservation',
        listingImage: selectedListing?.images?.[0] || '/photos/car-suv-white.jpg',
        customerName: formCustomerName.trim(),
        customerPhone: formCustomerPhone.trim(),
        customerEmail: formCustomerEmail.trim() || 'customer@bzgroup.ng',
        startDate: startDateTime,
        endDate: formEndDate ? `${formEndDate}T18:00:00` : undefined,
        driverOption: formType === 'car_rental' ? formDriverOption : undefined,
        totalAmount: selectedListing ? selectedListing.price : 0,
        bookingStatus: 'confirmed',
        paymentStatus: 'pending',
        notes: formNotes.trim() ? `${formNotes} (Slot: ${formStartHour})` : `Appointment scheduled at ${formStartHour}`
      });

      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'created manual booking',
        target: `${newBooking.reference || newBooking.id} · ${formCustomerName}`,
        details: selectedListing?.title || 'Reservation',
        category: 'bookings'
      });

      toast({
        title: 'Booking created successfully',
        description: `Booking ${newBooking.reference || newBooking.id} recorded for ${formCustomerName}.`,
        variant: 'default'
      });

      setIsNewBookingModalOpen(false);
      // Reset form
      setFormCustomerName('');
      setFormCustomerPhone('');
      setFormCustomerEmail('');
      setFormNotes('');
    } catch (err) {
      toast({
        title: 'Failed to create booking',
        description: 'An error occurred while saving the booking.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {timeFilter === 'This month'
              ? `Rentals, test drives and inspections · ${format(activeDate, 'MMMM yyyy')}`
              : `Rentals, test drives and inspections · ${format(weekStart, 'd')}–${format(weekEnd, 'd MMMM yyyy')}`}
          </p>
        </div>

        {/* Global Search + Notifications + New Booking */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders, listings, customers"
              className="w-full h-[40px] pl-9 pr-3.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
            />
          </div>

          <div className="relative w-10 h-10 rounded-[8px] bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] cursor-pointer">
            <Bell className="w-4 h-4" />
            {needsConfirmation.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#81141f]" />
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setNewBookingSlot(null);
              setFormStartDate(format(activeDate, 'yyyy-MM-dd'));
              setIsNewBookingModalOpen(true);
            }}
            className="h-[40px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New booking</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. FILTERS & NAVIGATION & LEGEND ROW
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Time Tabs & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {(['This week', 'Next week', 'This month'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => handleSelectTab(tab)}
              className={`h-[36px] px-4 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer ${
                timeFilter === tab
                  ? 'bg-[#81141f] text-white shadow-2xs'
                  : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f] hover:text-[#81141f]'
              }`}
            >
              {tab}
            </button>
          ))}

          {/* Prev / Today / Next Controls */}
          <div className="flex items-center bg-white border border-[#eae3e4] rounded-[8px] overflow-hidden ml-1">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous interval"
              className="w-8 h-[36px] flex items-center justify-center text-[#716769] hover:text-[#1b1416] hover:bg-[#faf8f8] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleGoToday}
              title="Jump to current week"
              className="px-2.5 h-[36px] text-[11px] font-medium text-[#716769] hover:text-[#81141f] border-x border-[#eae3e4] hover:bg-[#faf8f8] transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next interval"
              className="w-8 h-[36px] flex items-center justify-center text-[#716769] hover:text-[#1b1416] hover:bg-[#faf8f8] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
        {/* Calendar Grid Container (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs overflow-x-auto">
          {timeFilter !== 'This month' ? (
            /* ====================================================
               WEEK TIME GRID VIEW (8:00 - 18:00)
               ==================================================== */
            <div className="min-w-[620px]">
              {/* Days Header */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 pb-3.5 border-b border-[#eae3e4] text-center text-[12px] font-semibold items-center">
                <div className="text-left text-[#716769] font-normal pl-1">Time</div>
                {weekDays.map(day => {
                  const isCurrentDay = isToday(day);
                  const isSunday = day.getDay() === 0;

                  return (
                    <div key={day.toISOString()} className="flex justify-center">
                      {isCurrentDay ? (
                        <div className="text-[#81141f] font-bold bg-[#fcf3f4] px-2.5 py-1 rounded-md inline-flex items-center justify-center shadow-2xs">
                          {format(day, 'EEE d')}
                        </div>
                      ) : (
                        <div className={cn(isSunday ? 'text-[#716769]' : 'text-[#4a4245]', 'py-1 font-semibold')}>
                          {format(day, 'EEE d')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Grid with Real Store Bookings */}
              <div className="divide-y divide-[#eae3e4]/60 text-[11px]">
                {WORKING_HOURS.map(hourStr => (
                  <div
                    key={hourStr}
                    className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 py-3 items-stretch min-h-[58px]"
                  >
                    {/* Hour Column Label */}
                    <div className="text-[#716769] font-mono text-[12px] font-medium flex items-center select-none pl-1">
                      {hourStr}
                    </div>

                    {/* 7 Days Slot Cells */}
                    {weekDays.map(day => {
                      const slotBookings = getBookingsForSlot(day, hourStr);

                      if (slotBookings.length === 0) {
                        return (
                          <div
                            key={day.toISOString()}
                            onClick={() => handleOpenNewBookingForSlot(day, hourStr)}
                            className="group rounded-[6px] transition-colors p-1 flex items-center justify-center hover:bg-[#faf8f8] cursor-pointer"
                            title={`Click to book on ${format(day, 'EEE, d MMM')} at ${hourStr}`}
                          >
                            <span className="opacity-0 group-hover:opacity-100 text-[#81141f] transition-opacity">
                              <Plus className="w-3.5 h-3.5 stroke-[2]" />
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={day.toISOString()} className="flex flex-col gap-1.5 justify-center">
                          {slotBookings.map(({ booking }) => {
                            const isRental = booking.type === 'car_rental';
                            const isTestDrive = booking.type === 'car_test_drive';
                            const isInspection = booking.type === 'property_inspection';

                            const prefix = isRental ? 'Rental · ' : isTestDrive ? 'Drive · ' : 'Inspect · ';

                            return (
                              <button
                                key={booking.id}
                                type="button"
                                onClick={() => setSelectedBooking(booking)}
                                className={cn(
                                  'text-left p-2 rounded-[8px] leading-tight shadow-xs text-[10px] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer w-full',
                                  isRental && 'bg-[#81141f] text-white hover:bg-[#6e1019]',
                                  isTestDrive && 'bg-[#1b1416] text-white hover:bg-[#2c2225]',
                                  isInspection && 'bg-[#fef3c7] border border-[#fcd34d] text-[#92400e] hover:bg-[#fde68a]'
                                )}
                                title={`${booking.listingTitle} (${booking.customerName}) · Click for details`}
                              >
                                <div className="font-bold truncate">
                                  {prefix}
                                  {booking.listingTitle}
                                </div>
                                <div
                                  className={cn(
                                    'truncate mt-0.5 font-medium',
                                    isInspection ? 'text-[#92400e]/85' : 'text-white/85'
                                  )}
                                >
                                  {booking.customerName}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ====================================================
               MONTH GRID VIEW
               ==================================================== */
            <div className="min-w-[620px] space-y-3">
              {/* Month Day Headers */}
              <div className="grid grid-cols-7 gap-1.5 pb-2 border-b border-[#eae3e4] text-center text-[12px] font-semibold text-[#716769]">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Month Calendar Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map(day => {
                  const dayBookings = getBookingsForDay(day);
                  const isCurrentMonth = isSameMonth(day, activeDate);
                  const isTodayCell = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'min-h-[96px] p-2 rounded-[10px] border transition-colors flex flex-col justify-between',
                        isCurrentMonth
                          ? 'bg-[#ffffff] border-[#eae3e4]/80 hover:border-[#81141f]/50'
                          : 'bg-[#faf8f8]/50 border-transparent text-[#a8a1a3]',
                        isTodayCell && 'ring-2 ring-[#81141f] bg-[#fcf3f4]/30'
                      )}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-[12px] font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full',
                            isTodayCell
                              ? 'bg-[#81141f] text-white'
                              : isCurrentMonth
                              ? 'text-[#1b1416]'
                              : 'text-[#a8a1a3]'
                          )}
                        >
                          {format(day, 'd')}
                        </span>

                        {dayBookings.length > 0 && (
                          <span className="text-[10px] font-bold text-[#81141f] bg-[#fcf3f4] px-1.5 py-0.5 rounded-full">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>

                      {/* Booking Chips for the Day */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayBookings.slice(0, 2).map(({ booking }) => {
                          const isRental = booking.type === 'car_rental';
                          const isTestDrive = booking.type === 'car_test_drive';
                          const isInspection = booking.type === 'property_inspection';

                          return (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => setSelectedBooking(booking)}
                              className={cn(
                                'w-full text-left px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium truncate flex items-center gap-1 transition-transform hover:scale-[1.02]',
                                isRental && 'bg-[#81141f] text-white',
                                isTestDrive && 'bg-[#1b1416] text-white',
                                isInspection && 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'
                              )}
                              title={`${booking.listingTitle} (${booking.customerName})`}
                            >
                              <span className="truncate">{booking.customerName.split(' ')[0]}</span>
                            </button>
                          );
                        })}

                        {dayBookings.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDate(day);
                              setTimeFilter('This week');
                            }}
                            className="text-[10px] text-[#81141f] font-semibold hover:underline block text-center"
                          >
                            +{dayBookings.length - 2} more
                          </button>
                        )}
                      </div>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenNewBookingForSlot(day, '10:00')}
                        className="opacity-0 hover:opacity-100 text-[10px] text-[#716769] hover:text-[#81141f] flex items-center justify-center gap-0.5 pt-1 mt-auto"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Book</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Needs Confirmation Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1b1416]">Needs confirmation</h2>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                needsConfirmation.length > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              )}
            >
              {needsConfirmation.length} new
            </span>
          </div>

          <div className="space-y-3.5">
            {needsConfirmation.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-[12px] bg-[#faf8f8] border border-[#eae3e4] space-y-2.5 text-[12px] transition-shadow hover:shadow-2xs"
              >
                <div>
                  <div className="font-bold text-[13px] text-[#1b1416]">{item.title}</div>
                  <div className="text-[#716769] mt-0.5">{item.customerDate}</div>
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
                    onClick={() => handleReschedule(item.id, item.title)}
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
          <div>
            <h2 className="text-[18px] font-bold text-[#1b1416]">All bookings</h2>
            <p className="text-[12px] text-[#716769]">
              Live overview of all active, confirmed and pending appointments across BZ Group
            </p>
          </div>

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
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                        row.status === 'Approved' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        row.status === 'In progress' && 'bg-orange-50 text-orange-700 border-orange-200',
                        row.status === 'Declined' && 'bg-rose-50 text-rose-700 border-rose-200',
                        row.status === 'Rescheduled' && 'bg-purple-50 text-purple-700 border-purple-200',
                        row.status === 'Pending' && 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
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
                        onClick={() => setSelectedBooking(row.raw)}
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

      {/* ========================================================
          5. BOOKING DETAILS MODAL
         ======================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#eae3e4] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[#eae3e4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    selectedBooking.type === 'car_rental' && 'bg-[#fcf3f4] text-[#81141f]',
                    selectedBooking.type === 'car_test_drive' && 'bg-stone-100 text-stone-900',
                    selectedBooking.type === 'property_inspection' && 'bg-amber-50 text-amber-700'
                  )}
                >
                  {selectedBooking.type === 'car_rental' ? (
                    <Car className="w-5 h-5" />
                  ) : selectedBooking.type === 'car_test_drive' ? (
                    <Compass className="w-5 h-5" />
                  ) : (
                    <Home className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#1b1416]">
                    {selectedBooking.reference || selectedBooking.id}
                  </h3>
                  <p className="text-[12px] text-[#716769] capitalize">
                    {selectedBooking.type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-[#716769] hover:text-[#1b1416] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Listing Card */}
              <div className="p-3.5 rounded-[12px] bg-[#faf8f8] border border-[#eae3e4] flex items-center gap-3.5">
                <div className="w-16 h-12 rounded-[8px] bg-stone-200 overflow-hidden shrink-0">
                  <img
                    src={selectedBooking.listingImage || '/photos/car-suv-white.jpg'}
                    alt={selectedBooking.listingTitle}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[14px] text-[#1b1416] truncate">
                    {selectedBooking.listingTitle}
                  </div>
                  <div className="text-[12px] text-[#716769]">
                    Status:{' '}
                    <span className="font-semibold capitalize text-[#81141f]">
                      {selectedBooking.bookingStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
                  Client Information
                </h4>
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-center gap-2.5 text-[#1b1416]">
                    <User className="w-4 h-4 text-[#716769]" />
                    <span className="font-semibold">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#4a4245]">
                    <Phone className="w-4 h-4 text-[#716769]" />
                    <span>{selectedBooking.customerPhone}</span>
                    <a
                      href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${selectedBooking.customerName}, this is BZ Group regarding your booking ${selectedBooking.reference || selectedBooking.id} for ${selectedBooking.listingTitle}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  {selectedBooking.customerEmail && (
                    <div className="flex items-center gap-2.5 text-[#4a4245]">
                      <Mail className="w-4 h-4 text-[#716769]" />
                      <span>{selectedBooking.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates & Schedule */}
              <div className="space-y-2.5 pt-2 border-t border-[#eae3e4]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
                  Schedule & Terms
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="p-2.5 rounded-[8px] bg-[#faf8f8] border border-[#eae3e4]">
                    <span className="text-[#716769] block">Start Date & Time</span>
                    <span className="font-bold text-[#1b1416] mt-0.5 block">
                      {selectedBooking.startDate.replace('T', ' ')}
                    </span>
                  </div>
                  {selectedBooking.endDate && (
                    <div className="p-2.5 rounded-[8px] bg-[#faf8f8] border border-[#eae3e4]">
                      <span className="text-[#716769] block">End Date</span>
                      <span className="font-bold text-[#1b1416] mt-0.5 block">
                        {selectedBooking.endDate.replace('T', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {selectedBooking.driverOption && (
                  <div className="text-[12px] text-[#4a4245]">
                    Driver arrangement:{' '}
                    <span className="font-semibold text-[#1b1416]">{selectedBooking.driverOption}</span>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div className="p-3 rounded-[8px] bg-amber-50/60 border border-amber-200/60 text-[12px] text-amber-900">
                    <span className="font-bold block text-[11px] uppercase tracking-wider mb-1">
                      Notes / Instructions:
                    </span>
                    {selectedBooking.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-3 border-t border-[#eae3e4] bg-[#faf8f8] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="h-[36px] px-4 rounded-[8px] bg-white border border-[#eae3e4] text-[#4a4245] text-[12px] font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedBooking.bookingStatus === 'requested' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(selectedBooking.id)}
                    className="h-[36px] px-4 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[12px] font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    Confirm Booking
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleReschedule(selectedBooking.id, selectedBooking.listingTitle)}
                  className="h-[36px] px-3 rounded-[8px] bg-white border border-[#eae3e4] hover:bg-stone-50 text-[#4a4245] text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Reschedule
                </button>

                <button
                  type="button"
                  onClick={() => handleDecline(selectedBooking.id, selectedBooking.listingTitle)}
                  className="h-[36px] px-3 rounded-[8px] bg-white border border-[#eae3e4] hover:bg-rose-50 hover:text-rose-700 text-[#716769] text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. NEW BOOKING MODAL
         ======================================================== */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#eae3e4] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-[#eae3e4] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[18px] text-[#1b1416]">New Reservation</h3>
                <p className="text-[12px] text-[#716769]">
                  {newBookingSlot
                    ? `Booking slot: ${newBookingSlot.date} at ${newBookingSlot.hour}`
                    : 'Schedule walk-in, phone or manual client reservation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBookingModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-[#716769] hover:text-[#1b1416] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBookingSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Type Select */}
              <div>
                <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                  Reservation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'car_rental', label: 'Car Rental' },
                      { key: 'car_test_drive', label: 'Test Drive' },
                      { key: 'property_inspection', label: 'Inspection' }
                    ] as const
                  ).map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setFormType(t.key)}
                      className={cn(
                        'h-[36px] rounded-[8px] text-[12px] font-semibold border transition-all cursor-pointer',
                        formType === t.key
                          ? 'bg-[#81141f] text-white border-[#81141f]'
                          : 'bg-white border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listing Choice */}
              <div>
                <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                  Select Listing / Asset
                </label>
                <select
                  value={formListingId}
                  onChange={e => setFormListingId(e.target.value)}
                  className="w-full h-[40px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                >
                  <option value="">-- Choose from available inventory --</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={e => setFormCustomerName(e.target.value)}
                    placeholder="e.g. Chief Obinna Okafor"
                    className="w-full h-[38px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formCustomerPhone}
                    onChange={e => setFormCustomerPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full h-[38px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formCustomerEmail}
                  onChange={e => setFormCustomerEmail(e.target.value)}
                  placeholder="client@company.ng"
                  className="w-full h-[38px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full h-[38px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={formStartHour}
                    onChange={e => setFormStartHour(e.target.value)}
                    className="w-full h-[38px] px-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  >
                    {WORKING_HOURS.map(h => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formType === 'car_rental' && (
                <div>
                  <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                    Driver Option
                  </label>
                  <div className="flex items-center gap-3">
                    {(['Chauffeured', 'Self-drive'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input
                          type="radio"
                          name="driverOpt"
                          checked={formDriverOption === opt}
                          onChange={() => setFormDriverOption(opt)}
                          className="text-[#81141f] focus:ring-[#81141f]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-[#1b1416] mb-1.5">
                  Notes / Instructions
                </label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Airport pick-up, client mechanic arriving with surveyor"
                  className="w-full p-2.5 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="h-[38px] px-4 rounded-[8px] bg-white border border-[#eae3e4] text-[#4a4245] text-[13px] font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[38px] px-5 rounded-[8px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm & Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
