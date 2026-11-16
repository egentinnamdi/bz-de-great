import { supabase, isSupabaseConfigured } from './client';
import type {
  Listing,
  ListingStatus,
  Booking,
  Customer,
  StaffAccount,
  BranchOffice,
  StaffActivity,
  WebsiteContentConfig
} from '@/lib/types';
import { inferStateFromLocation } from '@/lib/locations';
import { formatActivityTimestamp } from '@/lib/activity-time';

interface ListingMetaPayload {
  branchOffice?: string;
  createdById?: string;
  createdByName?: string;
  partnerNetPrice?: number;
  soldAt?: string;
  soldByName?: string;
  soldByRole?: string;
  saleNote?: string;
  requiresApproval?: boolean;
}

function dbStatusToListingStatus(dbStatus?: string): ListingStatus {
  switch ((dbStatus || '').toLowerCase()) {
    case 'available':
    case 'published':
      return 'published';
    case 'sold':
      return 'sold';
    case 'rented':
      return 'rented';
    case 'reserved':
      return 'reserved';
    case 'archived':
      return 'archived';
    case 'under_inspection':
    case 'draft':
    default:
      return 'draft';
  }
}

function listingStatusToDbStatus(status?: ListingStatus): string {
  switch (status) {
    case 'published':
      return 'available';
    case 'sold':
      return 'sold';
    case 'rented':
      return 'rented';
    case 'reserved':
      return 'reserved';
    case 'archived':
    case 'draft':
    default:
      return 'under_inspection';
  }
}

function extractListingSpecsAndMeta(rawSpecs: any) {
  if (!rawSpecs || typeof rawSpecs !== 'object') {
    return { cleanSpecs: {}, meta: {} as ListingMetaPayload };
  }
  const { __bzMeta, ...rest } = rawSpecs;
  return {
    cleanSpecs: rest,
    meta: (__bzMeta && typeof __bzMeta === 'object' ? __bzMeta : {}) as ListingMetaPayload,
  };
}

function buildSpecsWithMeta(listing: Partial<Listing>, fallbackSpecs?: any) {
  const baseSpecs = (listing.vehicleSpecs || listing.propertySpecs || fallbackSpecs || {}) as Record<string, any>;
  const meta: ListingMetaPayload = {
    branchOffice: listing.branchOffice,
    createdById: listing.createdById,
    createdByName: listing.createdByName,
    partnerNetPrice: listing.partnerNetPrice,
    soldAt: listing.soldAt,
    soldByName: listing.soldByName,
    soldByRole: listing.soldByRole,
    saleNote: listing.saleNote,
    requiresApproval: listing.requiresApproval,
  };
  const hasMeta = Object.values(meta).some(v => v !== undefined);
  return hasMeta ? { ...baseSpecs, __bzMeta: meta } : baseSpecs;
}

function mapListingRow(row: any): Listing {
  let categoryMapped = 'car_rent';
  if (row.category === 'cars') {
    categoryMapped = row.mode === 'rent' ? 'car_rent' : 'car_sale';
  } else {
    categoryMapped = row.mode === 'rent' ? 'property_rent' : 'property_sale';
  }

  const { cleanSpecs, meta } = extractListingSpecsAndMeta(row.specs);
  const isVehicle = cleanSpecs && 'make' in cleanSpecs;
  const isProp = cleanSpecs && ('bedrooms' in cleanSpecs || 'amenities' in cleanSpecs || 'type' in cleanSpecs);

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
    state: (row.state && row.state.trim()) || inferStateFromLocation(row.location),
    branchOffice: row.branch_office || meta.branchOffice,
    createdById: row.created_by_id || meta.createdById,
    createdByName: row.created_by_name || meta.createdByName,
    partnerNetPrice: row.partner_net_price != null ? Number(row.partner_net_price) : meta.partnerNetPrice,
    soldAt: row.sold_at || meta.soldAt,
    soldByName: row.sold_by_name || meta.soldByName,
    soldByRole: meta.soldByRole,
    saleNote: row.sale_note || meta.saleNote,
    requiresApproval: row.requires_approval ?? meta.requiresApproval,
    images: Array.isArray(row.images) ? (row.images as string[]).filter(Boolean) : [],
    status: dbStatusToListingStatus(row.status),
    featured: Boolean(row.featured),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    vehicleSpecs: isVehicle ? (cleanSpecs as any) : undefined,
    propertySpecs: !isVehicle && isProp ? (cleanSpecs as any) : undefined,
    createdAt: row.created_at || new Date().toISOString()
  };
}

/**
 * Robust, production-grade service layer connecting BZ Group to Supabase BaaS.
 * Serves as the single source of truth for all public pages and admin operations.
 */
export const supabaseService = {
  // ============================================================================
  // 1. LISTINGS (Cars & Properties)
  // ============================================================================
  /**
   * Fetches listing metadata quickly without bulky base64 `images` JSONB payloads
   * so cold loads complete cleanly under ~500ms without Postgres statement timeouts.
   */
  async fetchListings(): Promise<Listing[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id,category,mode,title,subtitle,slug,price,price_unit,currency,location,state,status,featured,tags,description,specs,created_at')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetchListings error:', error?.message);
        return null;
      }

      return data.map(mapListingRow);
    } catch (err) {
      console.warn('Supabase fetchListings exception:', err);
      return null;
    }
  },

  /**
   * Streams `images` JSONB in small chunks (1-2 rows per request) so multi-megabyte
   * legacy uploads never cause Postgres HTTP 500 statement timeouts.
   */
  async fetchListingImagesForIds(
    ids: string[],
    onBatch?: (patch: Record<string, string[]>) => void
  ): Promise<Record<string, string[]>> {
    const collected: Record<string, string[]> = {};
    if (!isSupabaseConfigured() || ids.length === 0) return collected;

    const chunkSize = 2;
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize));
    }

    const workers = 2;
    let cursor = 0;

    const runWorker = async () => {
      while (cursor < chunks.length) {
        const idx = cursor++;
        const chunk = chunks[idx];
        try {
          const { data, error } = await supabase
            .from('listings')
            .select('id,images')
            .in('id', chunk);

          if (!error && Array.isArray(data)) {
            const patch: Record<string, string[]> = {};
            for (const row of data) {
              const imgs =
                Array.isArray(row.images) && row.images.length > 0
                  ? (row.images as string[]).filter(Boolean)
                  : ['/photos/car-suv-white.jpg'];
              patch[row.id] = imgs;
              collected[row.id] = imgs;
            }
            if (Object.keys(patch).length > 0 && onBatch) {
              onBatch(patch);
            }
          }
        } catch {
          // Continue remaining chunks even if one image batch fails
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(workers, chunks.length) }, () => runWorker()));
    return collected;
  },

  async fetchListingById(idOrSlug: string): Promise<Listing | null> {
    if (!isSupabaseConfigured() || !idOrSlug) return null;
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      const mapped = mapListingRow(data);
      if (mapped.images.length === 0) {
        mapped.images = ['/photos/car-suv-white.jpg'];
      }
      return mapped;
    } catch {
      return null;
    }
  },

  async insertListing(listing: Listing): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const isCar = listing.category.startsWith('car');
      const isRent = listing.category.includes('rent');
      const canonicalState = listing.state || inferStateFromLocation(listing.location);

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
        state: canonicalState,
        status: listingStatusToDbStatus(listing.status),
        featured: Boolean(listing.featured),
        tags: (listing.tags || []) as any,
        description: listing.description,
        specs: buildSpecsWithMeta(listing) as any,
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

  async updateListing(id: string, updates: Partial<Listing>, mergedListing?: Listing): Promise<boolean> {
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
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.status !== undefined) dbUpdates.status = listingStatusToDbStatus(updates.status);
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.images !== undefined) dbUpdates.images = updates.images;

      const metaUpdated =
        updates.branchOffice !== undefined ||
        updates.createdById !== undefined ||
        updates.createdByName !== undefined ||
        updates.partnerNetPrice !== undefined ||
        updates.soldAt !== undefined ||
        updates.soldByName !== undefined ||
        updates.soldByRole !== undefined ||
        updates.saleNote !== undefined ||
        updates.requiresApproval !== undefined;

      if (updates.vehicleSpecs || updates.propertySpecs || metaUpdated) {
        const source = mergedListing ? { ...mergedListing, ...updates } : updates;
        dbUpdates.specs = buildSpecsWithMeta(source);
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
  // 3. CUSTOMERS CRM
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
        location: row.location || 'Nigeria',
        uses: (row.uses as any) || 'Cars',
        bookingsCount: row.bookings_count || 0,
        totalBookings: row.bookings_count || 0,
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

      const rawSupportingText = typeof data.hero_supporting_text === 'string' ? data.hero_supporting_text.trim() : '';
      const cleanSupportingText =
        !rawSupportingText || /\brmb\b/i.test(rawSupportingText)
          ? 'Rent or buy premium cars and homes, shop Marketplace & book Studio — all through one trusted team.'
          : rawSupportingText;

      return {
        heroHeadline: data.hero_headline || 'Drive it. Live in it. Own it.',
        heroEyebrow: data.hero_eyebrow || 'Invest in value · Live the future',
        heroSupportingText: cleanSupportingText,
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

      return data.map(row => {
        const createdAt = row.created_at || undefined;
        return {
          id: row.id,
          actorName: row.staff_name,
          actorRole: 'Staff',
          action: row.action,
          target: row.target,
          details: row.details || undefined,
          createdAt,
          timestamp: formatActivityTimestamp(createdAt, row.timestamp_display),
          category: (row.category as any) || 'payments'
        };
      });
    } catch (err) {
      return null;
    }
  },

  async insertActivity(act: StaffActivity): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const createdAt = act.createdAt || new Date().toISOString();
      const { error } = await supabase.from('staff_activities').insert({
        id: act.id,
        category: act.category || 'payments',
        staff_name: act.actorName,
        action: act.action,
        target: act.target || act.targetId || 'Record',
        details: act.details || '',
        timestamp_display: act.timestamp || formatActivityTimestamp(createdAt),
        created_at: createdAt,
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
  // 8. STORAGE & RECEIPT / LISTING PHOTO UPLOADS
  // ============================================================================
  async uploadFileToBuckets(
    buckets: string[],
    folder: string,
    file: File | Blob,
    filename?: string
  ): Promise<string> {
    const fname = filename || (file instanceof File ? file.name : `${folder}-${Date.now()}.jpg`);
    const ext = fname.split('.').pop() || 'jpg';
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (isSupabaseConfigured()) {
      for (const bucket of buckets) {
        try {
          const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
          if (!error && data) {
            const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            if (pubData?.publicUrl) {
              return pubData.publicUrl;
            }
          }
        } catch {
          // Try next bucket
        }
      }
    }

    // Fallback: compressed Data URL when Storage bucket is unavailable
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to encode uploaded image'));
      reader.readAsDataURL(file);
    });
  },

  async uploadReceipt(file: File | Blob, filename?: string): Promise<string> {
    return this.uploadFileToBuckets(['receipts'], 'receipts', file, filename);
  },

  async uploadListingPhoto(file: File | Blob, filename?: string): Promise<string> {
    return this.uploadFileToBuckets(['listing-images', 'receipts'], 'listings', file, filename);
  },

  // ============================================================================
  // 9. REGIONAL & CAR-STAND STAFF ACCOUNTS
  // ============================================================================
  async fetchStaffAccounts(): Promise<StaffAccount[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('staff_accounts')
        .select('*')
        .order('created_at', { ascending: true });
      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        password: row.password,
        role: row.role,
        assignedStates: Array.isArray(row.assigned_states) ? row.assigned_states : [],
        allowedCategories: Array.isArray(row.allowed_categories) ? row.allowed_categories : ['car_sale'],
        allowedModules: Array.isArray(row.allowed_modules) ? row.allowed_modules : ['overview', 'listings'],
        branchOffice: row.branch_office || '',
        branchAddress: row.branch_address || undefined,
        isActive: row.is_active !== false,
        requireApprovalBeforeLive: Boolean(row.require_approval_before_live),
        canDeleteListings: Boolean(row.can_delete_listings),
        avatarInitials: row.avatar_initials || 'BZ',
        createdAt: row.created_at || new Date().toISOString(),
      }));
    } catch {
      return null;
    }
  },

  async upsertStaffAccount(account: StaffAccount): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('staff_accounts').upsert({
        id: account.id,
        name: account.name,
        email: account.email.toLowerCase(),
        phone: account.phone,
        password: account.password,
        role: account.role,
        assigned_states: account.assignedStates as any,
        allowed_categories: account.allowedCategories as any,
        allowed_modules: account.allowedModules as any,
        branch_office: account.branchOffice,
        branch_address: account.branchAddress || null,
        is_active: account.isActive,
        require_approval_before_live: Boolean(account.requireApprovalBeforeLive),
        can_delete_listings: Boolean(account.canDeleteListings),
        avatar_initials: account.avatarInitials,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteStaffAccount(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('staff_accounts').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // 10. REGIONAL BRANCH OFFICES & CAR STANDS CRUD
  // ============================================================================
  async fetchBranchOffices(): Promise<BranchOffice[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('branch_offices')
        .select('*')
        .order('created_at', { ascending: true });
      if (error || !data) return null;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        state: row.state,
        city: row.city || '',
        address: row.address || '',
        phone: row.phone || '',
        managerName: row.manager_name || '',
        handles: row.handles || '',
        isActive: row.is_active !== false,
        createdAt: row.created_at || undefined,
      }));
    } catch {
      return null;
    }
  },

  async upsertBranchOffice(branch: BranchOffice): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('branch_offices').upsert({
        id: branch.id,
        name: branch.name,
        state: branch.state,
        city: branch.city,
        address: branch.address,
        phone: branch.phone,
        manager_name: branch.managerName,
        handles: branch.handles,
        is_active: branch.isActive !== false,
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteBranchOffice(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('branch_offices').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }
};

