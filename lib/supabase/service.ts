import { supabase, isSupabaseConfigured } from './client';
import type { Listing, Booking, RmbExchangeRequest, RmbRateConfig, Customer } from '@/lib/types';

/**
 * Service methods to synchronize application state with Supabase BaaS.
 * Each method gracefully logs and returns null if Supabase is offline or not yet configured.
 */

export const supabaseService = {
  // 1. Listings
  async fetchListings(): Promise<Listing[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetchListings error:', error?.message);
        return null;
      }

      return data.map(row => ({
        id: row.id,
        category: (row.category === 'cars' ? (row.mode === 'rent' ? 'car_rent' : 'car_sale') : (row.mode === 'rent' ? 'property_rent' : 'property_sale')) as any,
        title: row.title,
        subtitle: row.subtitle,
        slug: row.slug,
        description: row.description,
        price: row.price,
        currency: 'NGN',
        pricePeriod: (row.price_unit === '/ day' ? '/day' : 'total') as any,
        location: row.location,
        images: Array.isArray(row.images) ? (row.images as string[]) : ['/photos/car-suv-white.jpg'],
        status: (row.status === 'available' ? 'published' : 'draft') as any,
        featured: row.featured,
        vehicleSpecs: (row.specs && typeof row.specs === 'object' && 'make' in row.specs ? (row.specs as any) : undefined),
        propertySpecs: (row.specs && typeof row.specs === 'object' && 'bedrooms' in row.specs ? (row.specs as any) : undefined),
        createdAt: row.created_at
      }));
    } catch (err) {
      console.warn('Supabase fetchListings exception:', err);
      return null;
    }
  },

  async insertListing(listing: Listing): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('listings').insert({
        id: listing.id,
        category: listing.category.startsWith('car') ? 'cars' : 'properties',
        mode: listing.category.includes('rent') ? 'rent' : 'buy',
        title: listing.title,
        subtitle: listing.subtitle || '',
        slug: listing.slug || listing.id,
        price: listing.price,
        price_unit: listing.pricePeriod === '/day' ? '/ day' : '',
        price_formatted: `₦${listing.price.toLocaleString('en-NG')}`,
        images: listing.images as any,
        location: listing.location,
        status: listing.status === 'published' ? 'available' : 'reserved',
        featured: !!listing.featured,
        description: listing.description,
        specs: (listing.vehicleSpecs || listing.propertySpecs || {}) as any
      });
      return !error;
    } catch (err) {
      console.warn('Supabase insertListing error:', err);
      return false;
    }
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.status) dbUpdates.status = updates.status === 'published' ? 'available' : 'reserved';

      const { error } = await supabase.from('listings').update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // 2. Bookings
  async fetchBookings(): Promise<Booking[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        type: row.type,
        listingId: row.listing_id || '',
        listingTitle: row.listing_title,
        listingImage: row.listing_image || undefined,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email,
        startDate: row.start_date,
        endDate: row.end_date || undefined,
        driverOption: (row.driver_option as any) || 'Self-drive',
        pickupLocation: row.pickup_location || undefined,
        totalAmount: row.total_amount,
        paymentStatus: row.payment_status,
        bookingStatus: row.booking_status,
        receiptUrl: row.receipt_url || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at
      }));
    } catch (err) {
      return null;
    }
  },

  async insertBooking(booking: Booking): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('bookings').insert({
        id: booking.id,
        type: booking.type,
        listing_id: booking.listingId || null,
        listing_title: booking.listingTitle,
        listing_image: booking.listingImage || null,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
        customer_email: booking.customerEmail,
        start_date: booking.startDate,
        end_date: booking.endDate || null,
        driver_option: booking.driverOption || 'Self-drive',
        pickup_location: booking.pickupLocation || null,
        total_amount: booking.totalAmount || 0,
        payment_status: booking.paymentStatus,
        booking_status: booking.bookingStatus,
        receipt_url: booking.receiptUrl || null,
        notes: booking.notes || null
      });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.bookingStatus) dbUpdates.booking_status = updates.bookingStatus;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.notes) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // 3. RMB Rates
  async fetchRmbRates(): Promise<RmbRateConfig | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('rmb_rates')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        payRmbRate: data.pay_rmb_rate,
        payNairaRate: data.pay_naira_rate,
        updatedAt: data.updated_at_display,
        updatedBy: data.updated_by
      };
    } catch (err) {
      return null;
    }
  },

  async updateRmbRates(rates: { payRmbRate: number; payNairaRate: number }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // Mark old as false
      await supabase.from('rmb_rates').update({ is_current: false }).eq('is_current', true);

      // Insert new current rate
      const { error } = await supabase.from('rmb_rates').insert({
        pay_rmb_rate: rates.payRmbRate,
        pay_naira_rate: rates.payNairaRate,
        updated_at_display: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' Today',
        updated_by: 'Admin (Treasury Desk)',
        is_current: true
      });
      return !error;
    } catch (err) {
      return false;
    }
  },

  // 4. RMB Exchange Requests
  async insertRmbRequest(req: RmbExchangeRequest): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('rmb_exchange_requests').insert({
        id: req.id,
        direction: req.direction,
        source_amount: req.sourceAmount,
        rate_applied: req.rateApplied,
        destination_amount: req.destinationAmount,
        customer_name: req.customerName,
        customer_email: req.customerEmail,
        customer_whatsapp: req.customerWhatsApp,
        receipt_url: req.receiptUrl || null,
        status: req.status,
        notes: req.notes || null
      });
      return !error;
    } catch (err) {
      return false;
    }
  }
};
