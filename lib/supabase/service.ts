import { supabase, isSupabaseConfigured } from './client';
import { formatRmbUpdatedAt } from '@/lib/utils';
import type {
  Listing,
  Booking,
  RmbExchangeRequest,
  RmbRateConfig,
  Customer,
  StaffActivity,
  WebsiteContentConfig
} from '@/lib/types';

/**
 * Robust, production-grade service layer connecting BZ Group to Supabase BaaS.
 * Serves as the single source of truth for all public pages and admin operations.
 */
export const supabaseService = {
  // ============================================================================
  // 1. LISTINGS (Cars & Properties)
  // ============================================================================
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

      return data.map(row => {
        let categoryMapped = 'car_rent';
        if (row.category === 'cars') {
          categoryMapped = row.mode === 'rent' ? 'car_rent' : 'car_sale';
        } else {
          categoryMapped = row.mode === 'rent' ? 'property_rent' : 'property_sale';
        }

        return {
          id: row.id,
          category: categoryMapped as any,
          title: row.title,
          subtitle: row.subtitle || undefined,
          slug: row.slug,
          description: row.description,
          price: Number(row.price),
          currency: (row.currency as any) || 'NGN',
          pricePeriod: row.price_unit === '/ day' ? '/day' : (row.price_unit === '/ year' ? '/year' : 'total'),
          location: row.location,
          images: Array.isArray(row.images) && row.images.length > 0
            ? (row.images as string[])
            : ['/photos/car-suv-white.jpg'],
          status: (row.status === 'available' ? 'published' : 'draft') as any,
          featured: Boolean(row.featured),
          tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
          vehicleSpecs: (row.specs && typeof row.specs === 'object' && 'make' in row.specs ? (row.specs as any) : undefined),
          propertySpecs: (row.specs && typeof row.specs === 'object' && ('bedrooms' in row.specs || 'amenities' in row.specs) ? (row.specs as any) : undefined),
          createdAt: row.created_at || new Date().toISOString()
        };
      });
    } catch (err) {
      console.warn('Supabase fetchListings exception:', err);
      return null;
    }
  },

  async insertListing(listing: Listing): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const isCar = listing.category.startsWith('car');
      const isRent = listing.category.includes('rent');

      const { error } = await supabase.from('listings').insert({
        id: listing.id,
        category: isCar ? 'cars' : 'properties',
        mode: isRent ? 'rent' : 'buy',
        title: listing.title,
        subtitle: listing.subtitle || '',
        slug: listing.slug || listing.id,
        price: listing.price,
        price_unit: listing.pricePeriod === '/day' ? '/ day' : (listing.pricePeriod === '/year' ? '/ year' : ''),
        price_formatted: `₦${Number(listing.price).toLocaleString('en-NG')}`,
        currency: listing.currency || 'NGN',
        caution_fee: 0,
        images: listing.images as any,
        location: listing.location,
        state: 'Abuja',
        status: listing.status === 'published' ? 'available' : 'reserved',
        featured: Boolean(listing.featured),
        tags: (listing.tags || []) as any,
        description: listing.description,
        specs: (listing.vehicleSpecs || listing.propertySpecs || {}) as any,
        features: [] as any
      });

      if (error) {
        console.warn('Supabase insertListing error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase insertListing exception:', err);
      return false;
    }
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) {
        dbUpdates.price = updates.price;
        dbUpdates.price_formatted = `₦${Number(updates.price).toLocaleString('en-NG')}`;
      }
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.status !== undefined) dbUpdates.status = updates.status === 'published' ? 'available' : 'reserved';
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.vehicleSpecs || updates.propertySpecs) {
        dbUpdates.specs = updates.vehicleSpecs || updates.propertySpecs;
      }

      const { error } = await supabase.from('listings').update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ============================================================================
  // 2. BOOKINGS
  // ============================================================================
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
        reference: row.reference || row.id,
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
        totalAmount: Number(row.total_amount) || 0,
        paymentStatus: row.payment_status,
        bookingStatus: row.booking_status,
        receiptUrl: row.receipt_url || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at || new Date().toISOString()
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
        reference: booking.reference || booking.id,
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
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

      const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ============================================================================
  // 3. RMB RATES
  // ============================================================================
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
        payRmbRate: Number(data.pay_rmb_rate),
        payNairaRate: Number(data.pay_naira_rate),
        updatedAt: formatRmbUpdatedAt(data.created_at, data.updated_at_display),
        updatedBy: data.updated_by || 'Admin (Treasury Desk)'
      };
    } catch (err) {
      return null;
    }
  },

  async updateRmbRates(rates: { payRmbRate: number; payNairaRate: number }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      await supabase.from('rmb_rates').update({ is_current: false }).eq('is_current', true);

      const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' Today';
      const { error } = await supabase.from('rmb_rates').insert({
        pay_rmb_rate: rates.payRmbRate,
        pay_naira_rate: rates.payNairaRate,
        updated_at_display: timeStr,
        updated_by: 'Admin (Treasury Desk)',
        is_current: true
      });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async fetchRmbRateHistory(): Promise<Array<{
    id: string;
    payRmbRate: number;
    payNairaRate: number;
    updatedAt: string;
    updatedBy: string;
    isCurrent: boolean;
    createdAt: string;
  }> | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('rmb_rates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        payRmbRate: Number(row.pay_rmb_rate),
        payNairaRate: Number(row.pay_naira_rate),
        updatedAt: row.updated_at_display || 'Recently',
        updatedBy: row.updated_by || 'Admin',
        isCurrent: Boolean(row.is_current),
        createdAt: row.created_at || new Date().toISOString()
      }));
    } catch (err) {
      return null;
    }
  },

  // ============================================================================
  // 4. RMB EXCHANGE REQUESTS
  // ============================================================================
  async fetchRmbRequests(): Promise<RmbExchangeRequest[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('rmb_exchange_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        reference: row.reference || row.id,
        direction: row.direction,
        sourceAmount: Number(row.source_amount),
        rateApplied: Number(row.rate_applied),
        destinationAmount: Number(row.destination_amount),
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerWhatsApp: row.customer_whatsapp,
        destinationChannel: row.destination_channel,
        destinationAccountDetails: row.destination_account_details || undefined,
        senderBank: row.sender_bank || undefined,
        senderAccountName: row.sender_account_name || undefined,
        receiptUrl: row.receipt_url || undefined,
        status: row.status,
        notes: row.notes || undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString()
      }));
    } catch (err) {
      return null;
    }
  },

  async insertRmbRequest(req: RmbExchangeRequest): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('rmb_exchange_requests').insert({
        id: req.id,
        reference: req.reference || req.id,
        direction: req.direction,
        source_amount: req.sourceAmount,
        rate_applied: req.rateApplied,
        destination_amount: req.destinationAmount,
        destination_channel: req.destinationChannel || 'Alipay, WeChat Pay or bank',
        destination_account_details: req.destinationAccountDetails || null,
        customer_name: req.customerName,
        customer_email: req.customerEmail,
        customer_whatsapp: req.customerWhatsApp,
        sender_bank: req.senderBank || null,
        sender_account_name: req.senderAccountName || null,
        receipt_url: req.receiptUrl || null,
        status: req.status,
        notes: req.notes || null
      });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async updateRmbRequest(id: string, updates: Partial<RmbExchangeRequest>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;
      if (updates.senderBank !== undefined) dbUpdates.sender_bank = updates.senderBank;
      if (updates.senderAccountName !== undefined) dbUpdates.sender_account_name = updates.senderAccountName;
      if (updates.destinationAccountDetails !== undefined) dbUpdates.destination_account_details = updates.destinationAccountDetails;
      if (updates.destinationChannel !== undefined) dbUpdates.destination_channel = updates.destinationChannel;

      const { error } = await supabase.from('rmb_exchange_requests').update(dbUpdates).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ============================================================================
  // 5. CUSTOMERS CRM
  // ============================================================================
  async fetchCustomers(): Promise<Customer[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('joined_at', { ascending: false });

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        initials: row.initials || row.name.slice(0, 2).toUpperCase(),
        email: row.email,
        phone: row.phone,
        phoneFull: row.phone_full || row.phone,
        location: row.location || 'Abuja, FCT',
        uses: (row.uses as any) || 'Cars',
        bookingsCount: row.bookings_count || 0,
        totalBookings: row.bookings_count || 0,
        rmbSentDisplay: row.rmb_sent_display || '¥0',
        totalSpentDisplay: row.total_spent_display || '₦0',
        lifetimeSpendNgn: Number(row.lifetime_spend_ngn) || 0,
        isVip: Boolean(row.is_vip),
        status: (row.status as any) || 'active',
        notes: row.notes || undefined,
        lastActive: row.last_active || 'Today',
        joinedAt: row.joined_at || new Date().toISOString()
      }));
    } catch (err) {
      return null;
    }
  },

  async updateCustomerNotes(id: string, notes: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('customers').update({ notes }).eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ============================================================================
  // 6. WEBSITE CONTENT (CMS)
  // ============================================================================
  async fetchWebsiteContent(): Promise<WebsiteContentConfig | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('id', 'global_config')
        .single();

      if (error || !data) return null;

      return {
        heroHeadline: data.hero_headline || 'Drive it. Live in it. Own it.',
        heroEyebrow: data.hero_eyebrow || 'Invest in value · Live the future',
        heroSupportingText: data.hero_supporting_text || 'Rent or buy premium cars and homes, and change RMB and naira — all through one trusted team.',
        founderBio: data.founder_bio || 'BZ De Great is a realtor, investment broker and entrepreneur working across four industries — real estate, automobiles, fashion and technology.',
        announcementEnabled: Boolean(data.announcement_enabled),
        announcementText: data.announcement_text !== undefined && data.announcement_text !== null ? data.announcement_text : '',
        featuredItems: Array.isArray(data.featured_items) ? data.featured_items : []
      };
    } catch (err) {
      console.warn('Supabase fetchWebsiteContent exception:', err);
      return null;
    }
  },

  async updateWebsiteContent(config: Partial<WebsiteContentConfig>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // Only include columns that actually exist in the website_content table
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (config.heroHeadline !== undefined) dbUpdates.hero_headline = config.heroHeadline;
      if (config.heroEyebrow !== undefined) dbUpdates.hero_eyebrow = config.heroEyebrow;
      if (config.heroSupportingText !== undefined) dbUpdates.hero_supporting_text = config.heroSupportingText;
      if (config.founderBio !== undefined) dbUpdates.founder_bio = config.founderBio;
      if (config.announcementEnabled !== undefined) dbUpdates.announcement_enabled = Boolean(config.announcementEnabled);
      if (config.announcementText !== undefined) dbUpdates.announcement_text = String(config.announcementText);
      if (config.featuredItems !== undefined) dbUpdates.featured_items = config.featuredItems;

      // Update existing record by id
      const { error } = await supabase
        .from('website_content')
        .update(dbUpdates)
        .eq('id', 'global_config');

      if (error) {
        console.warn('Supabase updateWebsiteContent update error:', error.message);
        const { error: upsertErr } = await supabase
          .from('website_content')
          .upsert({ id: 'global_config', ...dbUpdates });
        if (upsertErr) {
          console.warn('Supabase updateWebsiteContent upsert error:', upsertErr.message);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.warn('Supabase updateWebsiteContent exception:', err);
      return false;
    }
  },

  // ============================================================================
  // 7. STAFF ACTIVITIES (AUDIT TRAIL)
  // ============================================================================
  async fetchActivities(): Promise<StaffActivity[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('staff_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        actorName: row.staff_name,
        actorRole: 'Staff',
        action: row.action,
        target: row.target,
        details: row.details || undefined,
        timestamp: row.timestamp_display || 'Today',
        category: (row.category as any) || 'payments'
      }));
    } catch (err) {
      return null;
    }
  },

  async insertActivity(act: StaffActivity): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('staff_activities').insert({
        id: act.id,
        category: act.category || 'payments',
        staff_name: act.actorName,
        action: act.action,
        target: act.target || act.targetId || 'Record',
        details: act.details || '',
        timestamp_display: act.timestamp || 'Today'
      });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async clearActivities(): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    try {
      const { error } = await supabase.from('staff_activities').delete().gte('created_at', '2000-01-01');
      return !error;
    } catch (err) {
      return false;
    }
  },

  // ============================================================================
  // 8. STORAGE & RECEIPT UPLOADS
  // ============================================================================
  async uploadReceipt(file: File | Blob, filename?: string): Promise<string> {
    const fname = filename || (file instanceof File ? file.name : `receipt-${Date.now()}.png`);
    const ext = fname.split('.').pop() || 'png';
    const filePath = `receipts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.storage.from('receipts').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from('receipts').getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            return pubData.publicUrl;
          }
        }
      }
    } catch (e) {
      // Fall through to Base64 data URL
    }

    // Direct fallback: Base64 data URL ensures 100% receipt persistence
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to encode receipt file'));
      reader.readAsDataURL(file);
    });
  }
};

