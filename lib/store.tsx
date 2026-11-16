'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Listing,
  Booking,
  Customer,
  StaffActivity,
  WebsiteContentConfig,
  ProductCategory,
  Product,
  ProductOrder,
  CartItem,
  StudioService,
  StudioBooking,
  EquipmentItem,
  EquipmentRental,
  EventItem,
  DigitalTicket,
  StaffAccount,
} from './types';
import {
  DEFAULT_STAFF_ACCOUNTS,
  computeInitials,
  findBranchForState,
  getListingState,
} from './staff';
import { inferStateFromLocation } from './locations';
import {
  INITIAL_LISTINGS,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_ACTIVITIES,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_ORDERS,
  INITIAL_STUDIO_SERVICES,
  INITIAL_STUDIO_BOOKINGS,
  INITIAL_EQUIPMENT_ITEMS,
  INITIAL_EQUIPMENT_RENTALS,
  INITIAL_EVENTS,
  INITIAL_DIGITAL_TICKETS,
} from './mock-data';
import {
  calculateOrderAuthoritative,
  validateStudioSlotConflict,
  calculateEquipmentRentalAuthoritative,
  purchaseEventTicketAuthoritative,
  validateAndCheckInTicket,
} from './commerce-engine';
import { supabaseService } from './supabase/service';

const DEFAULT_WEBSITE_CONTENT: WebsiteContentConfig = {
  heroHeadline: 'Drive it. Live in it. Own it.',
  heroEyebrow: 'Invest in value · Live the future',
  heroSupportingText: 'Rent or buy premium cars and homes across Nigeria — all through one trusted team.',
  heroImage: '/photos/founder-bz-3.jpg',
  founderBio: 'BZ De Great is a realtor, investment broker and entrepreneur working across four industries — real estate, automobiles, fashion and technology.',
  founderImage: '/photos/founder-bz-3.jpg',
  announcementEnabled: false,
  announcementText: '',
  galleryPhotos: [
    '/photos/gallery-bz-1.jpg',
    '/photos/gallery-bz-2.jpg',
    '/photos/gallery-bz-3.jpg',
    '/photos/gallery-bz-4.jpg',
    '/photos/gallery-bz-5.jpg',
    '/photos/gallery-bz-6.jpg',
    '/photos/gallery-bz-7.jpg',
    '/photos/gallery-bz-8.jpg',
    '/photos/gallery-bz-9.jpg',
  ],
  featuredItems: [
    {
      id: 'feat-1',
      title: 'Lincoln Navigator 2022',
      image: '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
      category: 'Car',
      active: true,
    },
    {
      id: 'feat-2',
      title: 'Mercedes-Benz S-Class 2022',
      image: '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
      category: 'Car',
      active: true,
    },
    {
      id: 'feat-3',
      title: 'BMW 50i xDrive 2021',
      image: '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
      category: 'Car',
      active: true,
    },
  ],
};

interface StoreContextType {
  listings: Listing[];
  bookings: Booking[];
  customers: Customer[];
  activities: StaffActivity[];
  websiteContent: WebsiteContentConfig;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Multi-Service Commerce State
  productCategories: ProductCategory[];
  products: Product[];
  productOrders: ProductOrder[];
  cart: CartItem[];
  studioServices: StudioService[];
  studioBookings: StudioBooking[];
  equipmentItems: EquipmentItem[];
  equipmentRentals: EquipmentRental[];
  events: EventItem[];
  digitalTickets: DigitalTicket[];
  staffAccounts: StaffAccount[];

  // Staff / Branch Team Management
  addStaffAccount: (
    account: Omit<StaffAccount, 'id' | 'createdAt' | 'avatarInitials'>
  ) => Promise<StaffAccount>;
  updateStaffAccount: (id: string, updates: Partial<StaffAccount>) => Promise<void>;
  deleteStaffAccount: (id: string) => Promise<void>;

  // Existing Mutations
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  markListingSold: (
    id: string,
    meta: { soldByName: string; soldByRole: string; saleNote?: string }
  ) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;

  updateCustomerNotes: (customerId: string, notes: string) => Promise<void>;
  addActivity: (activity: Omit<StaffActivity, 'id' | 'timestamp'>) => Promise<void>;
  clearActivities: () => Promise<void>;
  updateWebsiteContent: (config: Partial<WebsiteContentConfig>) => Promise<void>;

  // Marketplace Categories & Products
  addProductCategory: (cat: Omit<ProductCategory, 'id'>) => Promise<ProductCategory>;
  updateProductCategory: (id: string, updates: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Cart & Product Orders
  addToCart: (item: { productId: string; variantId?: string; quantity?: number }) => { ok: boolean; error?: string };
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  createProductOrder: (payload: {
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    deliveryState: string;
    receiptUrl?: string;
    notes?: string;
  }) => Promise<{ ok: boolean; error?: string; order?: ProductOrder }>;
  updateProductOrder: (id: string, updates: Partial<ProductOrder>) => Promise<void>;

  // Studio Services & Bookings
  addStudioService: (srv: Omit<StudioService, 'id'>) => Promise<StudioService>;
  updateStudioService: (id: string, updates: Partial<StudioService>) => Promise<void>;
  deleteStudioService: (id: string) => Promise<void>;
  createStudioBooking: (payload: {
    serviceId: string;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    receiptUrl?: string;
    notes?: string;
  }) => Promise<{ ok: boolean; error?: string; booking?: StudioBooking }>;
  updateStudioBooking: (id: string, updates: Partial<StudioBooking>) => Promise<void>;

  // Equipment & Rentals
  addEquipmentItem: (eq: Omit<EquipmentItem, 'id'>) => Promise<EquipmentItem>;
  updateEquipmentItem: (id: string, updates: Partial<EquipmentItem>) => Promise<void>;
  deleteEquipmentItem: (id: string) => Promise<void>;
  createEquipmentRental: (payload: {
    equipmentId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    pickupLocation?: string;
    receiptUrl?: string;
    notes?: string;
  }) => Promise<{ ok: boolean; error?: string; rental?: EquipmentRental }>;
  updateEquipmentRental: (id: string, updates: Partial<EquipmentRental>) => Promise<void>;

  // Events & Digital Tickets
  addEvent: (evt: Omit<EventItem, 'id' | 'createdAt'>) => Promise<EventItem>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  purchaseEventTicket: (payload: {
    eventId: string;
    tierId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    receiptUrl?: string;
    notes?: string;
  }) => Promise<{ ok: boolean; error?: string; ticket?: DigitalTicket }>;
  updateDigitalTicket: (id: string, updates: Partial<DigitalTicket>) => Promise<void>;
  checkInDigitalTicket: (
    codeOrId: string,
    checkedInBy?: string
  ) => Promise<{ ok: boolean; reason?: string; message: string; ticket?: DigitalTicket }>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const CACHE_KEY_PREFIX = 'bz_group_supabase_cache_';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [activities, setActivities] = useState<StaffActivity[]>(INITIAL_ACTIVITIES);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContentConfig>(DEFAULT_WEBSITE_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-Service Commerce State
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(INITIAL_PRODUCT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>(INITIAL_PRODUCT_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [studioServices, setStudioServices] = useState<StudioService[]>(INITIAL_STUDIO_SERVICES);
  const [studioBookings, setStudioBookings] = useState<StudioBooking[]>(INITIAL_STUDIO_BOOKINGS);
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT_ITEMS);
  const [equipmentRentals, setEquipmentRentals] = useState<EquipmentRental[]>(INITIAL_EQUIPMENT_RENTALS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [digitalTickets, setDigitalTickets] = useState<DigitalTicket[]>(INITIAL_DIGITAL_TICKETS);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(DEFAULT_STAFF_ACCOUNTS);

  // Hydrate from Supabase BaaS (Single Source of Truth)
  const refreshData = useCallback(async () => {
    try {
      const [
        remoteListings,
        remoteBookings,
        remoteCustomers,
        remoteActivities,
        remoteContent,
        remoteStaff,
      ] = await Promise.all([
        supabaseService.fetchListings(),
        supabaseService.fetchBookings(),
        supabaseService.fetchCustomers(),
        supabaseService.fetchActivities(),
        supabaseService.fetchWebsiteContent(),
        supabaseService.fetchStaffAccounts(),
      ]);

      if (remoteListings !== null) setListings(remoteListings);
      if (remoteBookings !== null) setBookings(remoteBookings);
      if (remoteCustomers !== null) setCustomers(remoteCustomers);
      if (remoteActivities !== null) setActivities(remoteActivities);
      if (remoteStaff !== null && remoteStaff.length > 0) setStaffAccounts(remoteStaff);
      if (remoteContent) {
        setWebsiteContent((prev) => ({
          ...prev,
          ...remoteContent,
          heroImage: prev.heroImage || DEFAULT_WEBSITE_CONTENT.heroImage,
          founderImage: prev.founderImage || DEFAULT_WEBSITE_CONTENT.founderImage,
          galleryPhotos:
            prev.galleryPhotos && prev.galleryPhotos.length > 0
              ? prev.galleryPhotos
              : DEFAULT_WEBSITE_CONTENT.galleryPhotos,
        }));
      }
    } catch (err) {
      console.warn('Error fetching Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    try {
      const cListings = localStorage.getItem(CACHE_KEY_PREFIX + 'listings');
      if (cListings) {
        const p = JSON.parse(cListings);
        if (Array.isArray(p) && p.length > 0) setListings(p);
      }

      const cBookings = localStorage.getItem(CACHE_KEY_PREFIX + 'bookings');
      if (cBookings) {
        const p = JSON.parse(cBookings);
        if (Array.isArray(p) && p.length > 0) setBookings(p);
      }

      const cCust = localStorage.getItem(CACHE_KEY_PREFIX + 'cust');
      if (cCust) {
        const p = JSON.parse(cCust);
        if (Array.isArray(p) && p.length > 0) setCustomers(p);
      }

      const cAct = localStorage.getItem(CACHE_KEY_PREFIX + 'act');
      if (cAct) {
        const p = JSON.parse(cAct);
        if (Array.isArray(p) && p.length > 0) setActivities(p);
      }

      const cContent = localStorage.getItem(CACHE_KEY_PREFIX + 'content');
      if (cContent) setWebsiteContent(JSON.parse(cContent));

      const cProdCats = localStorage.getItem(CACHE_KEY_PREFIX + 'product_categories');
      if (cProdCats) {
        const p = JSON.parse(cProdCats);
        if (Array.isArray(p) && p.length > 0) setProductCategories(p);
      }

      const cProds = localStorage.getItem(CACHE_KEY_PREFIX + 'products');
      if (cProds) {
        const p = JSON.parse(cProds);
        if (Array.isArray(p) && p.length > 0) setProducts(p);
      }

      const cOrders = localStorage.getItem(CACHE_KEY_PREFIX + 'product_orders');
      if (cOrders) {
        const p = JSON.parse(cOrders);
        if (Array.isArray(p)) setProductOrders(p);
      }

      const cCart = localStorage.getItem(CACHE_KEY_PREFIX + 'cart');
      if (cCart) {
        const p = JSON.parse(cCart);
        if (Array.isArray(p)) setCart(p);
      }

      const cStuSrv = localStorage.getItem(CACHE_KEY_PREFIX + 'studio_services');
      if (cStuSrv) {
        const p = JSON.parse(cStuSrv);
        if (Array.isArray(p) && p.length > 0) setStudioServices(p);
      }

      const cStuBook = localStorage.getItem(CACHE_KEY_PREFIX + 'studio_bookings');
      if (cStuBook) {
        const p = JSON.parse(cStuBook);
        if (Array.isArray(p)) setStudioBookings(p);
      }

      const cEqItems = localStorage.getItem(CACHE_KEY_PREFIX + 'equipment_items');
      if (cEqItems) {
        const p = JSON.parse(cEqItems);
        if (Array.isArray(p) && p.length > 0) setEquipmentItems(p);
      }

      const cEqRent = localStorage.getItem(CACHE_KEY_PREFIX + 'equipment_rentals');
      if (cEqRent) {
        const p = JSON.parse(cEqRent);
        if (Array.isArray(p)) setEquipmentRentals(p);
      }

      const cEvents = localStorage.getItem(CACHE_KEY_PREFIX + 'events');
      if (cEvents) {
        const p = JSON.parse(cEvents);
        if (Array.isArray(p) && p.length > 0) setEvents(p);
      }

      const cTickets = localStorage.getItem(CACHE_KEY_PREFIX + 'digital_tickets');
      if (cTickets) {
        const p = JSON.parse(cTickets);
        if (Array.isArray(p)) setDigitalTickets(p);
      }

      const cStaff = localStorage.getItem(CACHE_KEY_PREFIX + 'staff_accounts');
      if (cStaff) {
        const p = JSON.parse(cStaff);
        if (Array.isArray(p) && p.length > 0) setStaffAccounts(p);
      }
    } catch {
      // Ignore cache read failures
    }

    refreshData();
  }, [refreshData]);

  // Sync to local cache
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + 'listings', JSON.stringify(listings));
      localStorage.setItem(CACHE_KEY_PREFIX + 'bookings', JSON.stringify(bookings));
      localStorage.setItem(CACHE_KEY_PREFIX + 'cust', JSON.stringify(customers));
      localStorage.setItem(CACHE_KEY_PREFIX + 'act', JSON.stringify(activities));
      localStorage.setItem(CACHE_KEY_PREFIX + 'content', JSON.stringify(websiteContent));
      localStorage.setItem(CACHE_KEY_PREFIX + 'product_categories', JSON.stringify(productCategories));
      localStorage.setItem(CACHE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(CACHE_KEY_PREFIX + 'product_orders', JSON.stringify(productOrders));
      localStorage.setItem(CACHE_KEY_PREFIX + 'cart', JSON.stringify(cart));
      localStorage.setItem(CACHE_KEY_PREFIX + 'studio_services', JSON.stringify(studioServices));
      localStorage.setItem(CACHE_KEY_PREFIX + 'studio_bookings', JSON.stringify(studioBookings));
      localStorage.setItem(CACHE_KEY_PREFIX + 'equipment_items', JSON.stringify(equipmentItems));
      localStorage.setItem(CACHE_KEY_PREFIX + 'equipment_rentals', JSON.stringify(equipmentRentals));
      localStorage.setItem(CACHE_KEY_PREFIX + 'events', JSON.stringify(events));
      localStorage.setItem(CACHE_KEY_PREFIX + 'digital_tickets', JSON.stringify(digitalTickets));
      localStorage.setItem(CACHE_KEY_PREFIX + 'staff_accounts', JSON.stringify(staffAccounts));
    } catch {
      // Ignore cache write errors
    }
  }, [
    listings,
    bookings,
    customers,
    activities,
    websiteContent,
    productCategories,
    products,
    productOrders,
    cart,
    studioServices,
    studioBookings,
    equipmentItems,
    equipmentRentals,
    events,
    digitalTickets,
    staffAccounts,
    isLoading,
  ]);

  const upsertCustomerRecord = useCallback(
    (name: string, email: string, phone: string, location: string, spendNgn: number) => {
      setCustomers((prev) => {
        const cleanName = name.trim() || 'BZ Client';
        const initials = cleanName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() || '')
          .join('') || 'BZ';

        const existingIdx = prev.findIndex(
          (c) =>
            (email && c.email.toLowerCase() === email.toLowerCase()) ||
            (phone && c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))
        );
        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const nextSpend = existing.lifetimeSpendNgn + spendNgn;
          const isNowVip = Boolean(existing.isVip) || nextSpend >= 2000000;
          const updated: Customer = {
            ...existing,
            initials: existing.initials || initials,
            totalBookings: existing.totalBookings + 1,
            bookingsCount: (existing.bookingsCount ?? existing.totalBookings) + 1,
            lifetimeSpendNgn: nextSpend,
            isVip: isNowVip,
            status: isNowVip ? 'vip' : existing.status,
            lastActive: 'Just now',
          };
          return prev.map((c, i) => (i === existingIdx ? updated : c));
        }
        const isInitialVip = spendNgn >= 2000000;
        const newCust: Customer = {
          id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
          name: cleanName,
          initials,
          email,
          phone,
          phoneFull: phone,
          location: location || 'Nigeria',
          totalBookings: 1,
          bookingsCount: 1,
          lifetimeSpendNgn: spendNgn,
          joinedAt: new Date().toISOString(),
          lastActive: 'Just now',
          isVip: isInitialVip,
          status: isInitialVip ? 'vip' : 'active',
        };
        return [newCust, ...prev];
      });
    },
    []
  );

  // ==========================================================================
  // EXISTING MUTATIONS
  // ==========================================================================

  const addStaffAccount = async (
    item: Omit<StaffAccount, 'id' | 'createdAt' | 'avatarInitials'>
  ): Promise<StaffAccount> => {
    const newAccount: StaffAccount = {
      ...item,
      email: item.email.trim().toLowerCase(),
      id: `STF-${Date.now().toString(36).toUpperCase()}`,
      avatarInitials: computeInitials(item.name),
      createdAt: new Date().toISOString(),
    };
    setStaffAccounts((prev) => [...prev, newAccount]);
    await supabaseService.upsertStaffAccount(newAccount);
    return newAccount;
  };

  const updateStaffAccount = async (id: string, updates: Partial<StaffAccount>) => {
    let updatedTarget: StaffAccount | undefined;
    setStaffAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;
        updatedTarget = {
          ...acc,
          ...updates,
          email: updates.email !== undefined ? updates.email.trim().toLowerCase() : acc.email,
          avatarInitials: updates.name !== undefined ? computeInitials(updates.name) : acc.avatarInitials,
        };
        return updatedTarget;
      })
    );
    if (updatedTarget) {
      await supabaseService.upsertStaffAccount(updatedTarget);
    }
  };

  const deleteStaffAccount = async (id: string) => {
    if (id === 'ADM-001') return;
    setStaffAccounts((prev) => prev.filter((acc) => acc.id !== id));
    await supabaseService.deleteStaffAccount(id);
  };

  const addListing = async (item: Omit<Listing, 'id' | 'createdAt'>) => {
    const newId = `listing-${Date.now()}`;
    const canonicalState = item.state?.trim() || inferStateFromLocation(item.location);
    const matchedBranch = findBranchForState(canonicalState);
    const newListing: Listing = {
      ...item,
      id: newId,
      state: canonicalState,
      branchOffice: item.branchOffice || matchedBranch?.name,
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
    await supabaseService.insertListing(newListing);
    return newListing;
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    let merged: Listing | undefined;
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        merged = { ...l, ...updates };
        return merged;
      })
    );
    await supabaseService.updateListing(id, updates, merged);
  };

  const markListingSold = async (
    id: string,
    meta: { soldByName: string; soldByRole: string; saleNote?: string }
  ) => {
    const updates: Partial<Listing> = {
      status: 'sold',
      soldAt: new Date().toISOString(),
      soldByName: meta.soldByName,
      soldByRole: meta.soldByRole,
      saleNote: meta.saleNote?.trim() || undefined,
    };
    await updateListing(id, updates);
  };

  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    await supabaseService.deleteListing(id);
  };

  const createBooking = async (item: Omit<Booking, 'id' | 'createdAt'>) => {
    const prefix = item.type === 'car_rental' ? 'BK' : item.type === 'car_test_drive' ? 'TD' : 'INS';
    const num = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}-${num}`;

    const linkedListing = item.listingId ? listings.find((l) => l.id === item.listingId) : undefined;
    const resolvedState =
      item.branchState ||
      (linkedListing ? getListingState(linkedListing) : undefined) ||
      (item.pickupLocation ? inferStateFromLocation(item.pickupLocation) : 'FCT Abuja');
    const resolvedBranch = findBranchForState(resolvedState);

    const newBooking: Booking = {
      ...item,
      id: newId,
      reference: newId,
      branchState: resolvedState,
      branchOffice: item.branchOffice || linkedListing?.branchOffice || resolvedBranch?.name,
      assignedRepName: item.assignedRepName || resolvedBranch?.managerName,
      assignedRepPhone: item.assignedRepPhone || resolvedBranch?.phone,
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
    await supabaseService.insertBooking(newBooking);
    return newBooking;
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    await supabaseService.updateBooking(id, updates);
  };

  const updateCustomerNotes = async (customerId: string, notes: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, notes } : c)));
    await supabaseService.updateCustomerNotes(customerId, notes);
  };

  const addActivity = async (act: Omit<StaffActivity, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAct: StaffActivity = {
      ...act,
      id: `act-${Date.now()}`,
      timestamp: `Today, ${timeStr}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    await supabaseService.insertActivity(newAct);
  };

  const clearActivities = async () => {
    setActivities([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CACHE_KEY_PREFIX + 'act');
      } catch (e) {
        console.warn('Failed to clear cached activities:', e);
      }
    }
    await supabaseService.clearActivities();
  };

  const updateWebsiteContent = async (config: Partial<WebsiteContentConfig>) => {
    setWebsiteContent((prev) => {
      const updated = { ...prev, ...config };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY_PREFIX + 'content', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
    await supabaseService.updateWebsiteContent(config);
  };

  // ==========================================================================
  // MARKETPLACE CATEGORIES & PRODUCTS
  // ==========================================================================

  const addProductCategory = async (cat: Omit<ProductCategory, 'id'>) => {
    const newCat: ProductCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setProductCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateProductCategory = async (id: string, updates: Partial<ProductCategory>) => {
    setProductCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteProductCategory = async (id: string) => {
    setProductCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Marketplace Desk',
      action: `Added product: ${newProd.name} (${newProd.categorySlug})`,
      targetId: newProd.id,
      category: 'listings',
    });
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ==========================================================================
  // CART & AUTHORITATIVE ORDERS
  // ==========================================================================

  const addToCart = ({
    productId,
    variantId,
    quantity = 1,
  }: {
    productId: string;
    variantId?: string;
    quantity?: number;
  }): { ok: boolean; error?: string } => {
    const product = products.find((p) => p.id === productId && p.status === 'published');
    if (!product) {
      return { ok: false, error: 'Product is not available.' };
    }

    const variant =
      variantId && product.variants
        ? product.variants.find((v) => v.id === variantId)
        : product.variants && product.variants.length > 0
        ? product.variants[0]
        : undefined;

    const maxStock = variant ? variant.stock : product.stock;
    const unitPrice = variant ? variant.price : product.price;
    const cartItemId = `${product.id}:${variant ? variant.id : 'default'}`;

    const existing = cart.find((c) => c.id === cartItemId);
    const nextQty = (existing ? existing.quantity : 0) + quantity;

    if (nextQty > maxStock) {
      return {
        ok: false,
        error:
          maxStock <= 0
            ? `"${product.name}" is out of stock.`
            : `Only ${maxStock} unit(s) of "${product.name}" available in stock.`,
      };
    }

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === cartItemId);
      if (idx !== -1) {
        return prev.map((c, i) => (i === idx ? { ...c, quantity: nextQty, unitPrice, maxStock } : c));
      }
      const nextItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '/photos/gallery-bz-1.jpg',
        categorySlug: product.categorySlug,
        variantId: variant?.id,
        variantLabel: variant?.label,
        unitPrice,
        quantity,
        maxStock,
      };
      return [...prev, nextItem];
    });

    return { ok: true };
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.id === cartItemId
          ? { ...c, quantity: Math.min(c.maxStock, Math.max(1, quantity)) }
          : c
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createProductOrder = async (payload: {
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    deliveryState: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<{ ok: boolean; error?: string; order?: ProductOrder }> => {
    const authResult = calculateOrderAuthoritative(payload.items, products, payload.deliveryState);
    if (!authResult.ok) {
      return { ok: false, error: authResult.error };
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: ProductOrder = {
      id: orderId,
      reference: orderId,
      items: authResult.orderItems,
      subtotalAmount: authResult.subtotalAmount,
      deliveryFee: authResult.deliveryFee,
      totalAmount: authResult.totalAmount,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      deliveryAddress: payload.deliveryAddress,
      deliveryState: payload.deliveryState,
      orderStatus: 'pending',
      paymentStatus: payload.receiptUrl ? 'receipt_uploaded' : 'pending',
      receiptUrl: payload.receiptUrl,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    setProducts(authResult.updatedProducts);
    setProductOrders((prev) => [newOrder, ...prev]);
    setCart([]);

    upsertCustomerRecord(
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.deliveryState,
      newOrder.totalAmount
    );

    await addActivity({
      actorName: payload.customerName,
      actorRole: 'Marketplace Order',
      action: `Placed order ${newOrder.id} (${newOrder.items.length} item(s) · ₦${newOrder.totalAmount.toLocaleString()})`,
      targetId: newOrder.id,
      category: 'bookings',
    });

    return { ok: true, order: newOrder };
  };

  const updateProductOrder = async (id: string, updates: Partial<ProductOrder>) => {
    setProductOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  // ==========================================================================
  // STUDIO SERVICES & BOOKINGS (WITH DOUBLE-BOOKING PREVENTION)
  // ==========================================================================

  const addStudioService = async (srv: Omit<StudioService, 'id'>) => {
    const newSrv: StudioService = {
      ...srv,
      id: `stu-srv-${Date.now()}`,
    };
    setStudioServices((prev) => [...prev, newSrv]);
    return newSrv;
  };

  const updateStudioService = async (id: string, updates: Partial<StudioService>) => {
    setStudioServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudioService = async (id: string) => {
    setStudioServices((prev) => prev.filter((s) => s.id !== id));
  };

  const createStudioBooking = async (payload: {
    serviceId: string;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<{ ok: boolean; error?: string; booking?: StudioBooking }> => {
    const service = studioServices.find((s) => s.id === payload.serviceId && s.status === 'active');
    if (!service) {
      return { ok: false, error: 'Selected studio package is no longer available.' };
    }

    const { conflict } = validateStudioSlotConflict(
      studioBookings,
      payload.serviceId,
      payload.date,
      payload.timeSlot
    );

    if (conflict) {
      return {
        ok: false,
        error: `The ${payload.timeSlot} slot on ${payload.date} is already booked at our Studio. Please choose another time slot or date.`,
      };
    }

    const bookingId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: StudioBooking = {
      id: bookingId,
      reference: bookingId,
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.serviceType,
      date: payload.date,
      timeSlot: payload.timeSlot,
      durationHours: service.durationHours,
      location: service.location,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      totalAmount: service.price,
      bookingStatus: payload.receiptUrl ? 'payment_pending' : 'pending',
      paymentStatus: payload.receiptUrl ? 'receipt_uploaded' : 'pending',
      receiptUrl: payload.receiptUrl,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    setStudioBookings((prev) => [newBooking, ...prev]);

    upsertCustomerRecord(
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      'Lagos State',
      newBooking.totalAmount
    );

    await addActivity({
      actorName: payload.customerName,
      actorRole: 'Studio Desk',
      action: `Booked studio session ${newBooking.id}: ${service.name} (${payload.date} @ ${payload.timeSlot})`,
      targetId: newBooking.id,
      category: 'bookings',
    });

    return { ok: true, booking: newBooking };
  };

  const updateStudioBooking = async (id: string, updates: Partial<StudioBooking>) => {
    setStudioBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // ==========================================================================
  // CAMERA & MEDIA EQUIPMENT RENTALS (WITH DATE-RANGE CONFLICT PREVENTION)
  // ==========================================================================

  const addEquipmentItem = async (eq: Omit<EquipmentItem, 'id'>) => {
    const newEq: EquipmentItem = {
      ...eq,
      id: `eq-${Date.now()}`,
    };
    setEquipmentItems((prev) => [newEq, ...prev]);
    return newEq;
  };

  const updateEquipmentItem = async (id: string, updates: Partial<EquipmentItem>) => {
    setEquipmentItems((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEquipmentItem = async (id: string) => {
    setEquipmentItems((prev) => prev.filter((e) => e.id !== id));
  };

  const createEquipmentRental = async (payload: {
    equipmentId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    pickupLocation?: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<{ ok: boolean; error?: string; rental?: EquipmentRental }> => {
    const equipment = equipmentItems.find((e) => e.id === payload.equipmentId);
    if (!equipment || equipment.status !== 'available') {
      return { ok: false, error: 'Selected equipment is currently unavailable for rental.' };
    }

    const calc = calculateEquipmentRentalAuthoritative(
      equipment,
      equipmentRentals,
      payload.startDate,
      payload.endDate,
      payload.quantity
    );

    if (!calc.ok) {
      return { ok: false, error: calc.error };
    }

    const rentalId = `RNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRental: EquipmentRental = {
      id: rentalId,
      reference: rentalId,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentCategory: equipment.category,
      equipmentImage: equipment.images[0],
      startDate: payload.startDate,
      endDate: payload.endDate,
      days: calc.days,
      quantity: payload.quantity,
      dailyRate: calc.dailyRate,
      depositAmount: calc.depositAmount,
      totalAmount: calc.totalAmount,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      pickupLocation: payload.pickupLocation || 'BZ De Great Creative Studio',
      rentalStatus: payload.receiptUrl ? 'payment_pending' : 'pending',
      paymentStatus: payload.receiptUrl ? 'receipt_uploaded' : 'pending',
      receiptUrl: payload.receiptUrl,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    setEquipmentRentals((prev) => [newRental, ...prev]);

    upsertCustomerRecord(
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      'Lagos State',
      newRental.totalAmount
    );

    await addActivity({
      actorName: payload.customerName,
      actorRole: 'Equipment Rental Desk',
      action: `Booked gear rental ${newRental.id}: ${payload.quantity}x ${equipment.name} (${payload.startDate} to ${payload.endDate})`,
      targetId: newRental.id,
      category: 'bookings',
    });

    return { ok: true, rental: newRental };
  };

  const updateEquipmentRental = async (id: string, updates: Partial<EquipmentRental>) => {
    setEquipmentRentals((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  // ==========================================================================
  // EVENTS, DIGITAL TICKETS & QR CHECK-IN VALIDATION
  // ==========================================================================

  const addEvent = async (evt: Omit<EventItem, 'id' | 'createdAt'>) => {
    const newEvt: EventItem = {
      ...evt,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvt, ...prev]);
    return newEvt;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const purchaseEventTicket = async (payload: {
    eventId: string;
    tierId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    receiptUrl?: string;
    notes?: string;
  }): Promise<{ ok: boolean; error?: string; ticket?: DigitalTicket }> => {
    const targetEvent = events.find((e) => e.id === payload.eventId);
    if (!targetEvent) {
      return { ok: false, error: 'Event not found.' };
    }

    const result = purchaseEventTicketAuthoritative(targetEvent, payload.tierId, payload.quantity, {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      receiptUrl: payload.receiptUrl,
      notes: payload.notes,
    });

    if (!result.ok || !result.ticket || !result.updatedEvent) {
      return { ok: false, error: result.error };
    }

    const newTicket = result.ticket;
    const updatedEvent = result.updatedEvent;

    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    setDigitalTickets((prev) => [newTicket, ...prev]);

    upsertCustomerRecord(
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      targetEvent.city,
      newTicket.totalAmount
    );

    await addActivity({
      actorName: payload.customerName,
      actorRole: 'Events Box Office',
      action: `Issued digital ticket ${newTicket.id} (${newTicket.ticketCode}) for ${targetEvent.name}`,
      targetId: newTicket.id,
      category: 'bookings',
    });

    return { ok: true, ticket: newTicket };
  };

  const updateDigitalTicket = async (id: string, updates: Partial<DigitalTicket>) => {
    setDigitalTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const checkInDigitalTicket = async (
    codeOrId: string,
    checkedInBy = 'Admin Gate Scanner'
  ): Promise<{ ok: boolean; reason?: string; message: string; ticket?: DigitalTicket }> => {
    const result = validateAndCheckInTicket(digitalTickets, codeOrId, checkedInBy);
    if (result.ok && result.ticket) {
      setDigitalTickets(result.updatedTickets);
      await addActivity({
        actorName: checkedInBy,
        actorRole: 'Event Gate Check-In',
        action: `Checked in ticket ${result.ticket.ticketCode} (${result.ticket.customerName} · ${result.ticket.tierName})`,
        targetId: result.ticket.id,
        category: 'bookings',
      });
    }
    return {
      ok: result.ok,
      reason: result.reason,
      message: result.message,
      ticket: result.ticket,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        listings,
        bookings,
        customers,
        activities,
        websiteContent,
        isLoading,
        refreshData,
        productCategories,
        products,
        productOrders,
        cart,
        studioServices,
        studioBookings,
        equipmentItems,
        equipmentRentals,
        events,
        digitalTickets,
        staffAccounts,
        addStaffAccount,
        updateStaffAccount,
        deleteStaffAccount,
        addListing,
        updateListing,
        markListingSold,
        deleteListing,
        createBooking,
        updateBooking,
        updateCustomerNotes,
        addActivity,
        clearActivities,
        updateWebsiteContent,
        addProductCategory,
        updateProductCategory,
        deleteProductCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        createProductOrder,
        updateProductOrder,
        addStudioService,
        updateStudioService,
        deleteStudioService,
        createStudioBooking,
        updateStudioBooking,
        addEquipmentItem,
        updateEquipmentItem,
        deleteEquipmentItem,
        createEquipmentRental,
        updateEquipmentRental,
        addEvent,
        updateEvent,
        deleteEvent,
        purchaseEventTicket,
        updateDigitalTicket,
        checkInDigitalTicket,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
