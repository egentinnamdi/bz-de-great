'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Listing,
  Booking,
  Customer,
  StaffActivity,
  WebsiteContentConfig
} from './types';
import {
  INITIAL_LISTINGS,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_ACTIVITIES
} from './mock-data';
import { supabaseService } from './supabase/service';

const DEFAULT_WEBSITE_CONTENT: WebsiteContentConfig = {
  heroHeadline: 'Drive it. Live in it. Own it.',
  heroEyebrow: 'Invest in value · Live the future',
  heroSupportingText: 'Rent or buy premium cars and homes across Abuja and Lagos — all through one trusted team.',
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
    '/photos/gallery-bz-9.jpg'
  ],
  featuredItems: [
    {
      id: 'feat-1',
      title: 'Lincoln Navigator 2022',
      image: '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
      category: 'Car',
      active: true
    },
    {
      id: 'feat-2',
      title: 'Mercedes-Benz S-Class 2022',
      image: '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
      category: 'Car',
      active: true
    },
    {
      id: 'feat-3',
      title: 'BMW 50i xDrive 2021',
      image: '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
      category: 'Car',
      active: true
    }
  ]
};

interface StoreContextType {
  listings: Listing[];
  bookings: Booking[];
  customers: Customer[];
  activities: StaffActivity[];
  websiteContent: WebsiteContentConfig;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Mutations
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;

  updateCustomerNotes: (customerId: string, notes: string) => Promise<void>;
  addActivity: (activity: Omit<StaffActivity, 'id' | 'timestamp'>) => Promise<void>;
  clearActivities: () => Promise<void>;
  updateWebsiteContent: (config: Partial<WebsiteContentConfig>) => Promise<void>;
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

  // Hydrate from Supabase BaaS (Single Source of Truth)
  const refreshData = useCallback(async () => {
    try {
      const [
        remoteListings,
        remoteBookings,
        remoteCustomers,
        remoteActivities,
        remoteContent
      ] = await Promise.all([
        supabaseService.fetchListings(),
        supabaseService.fetchBookings(),
        supabaseService.fetchCustomers(),
        supabaseService.fetchActivities(),
        supabaseService.fetchWebsiteContent()
      ]);

      if (remoteListings !== null) setListings(remoteListings);
      if (remoteBookings !== null) setBookings(remoteBookings);
      if (remoteCustomers !== null) setCustomers(remoteCustomers);
      if (remoteActivities !== null) setActivities(remoteActivities);
      if (remoteContent) {
        setWebsiteContent(prev => ({
          ...prev,
          ...remoteContent,
          heroImage: prev.heroImage || DEFAULT_WEBSITE_CONTENT.heroImage,
          founderImage: prev.founderImage || DEFAULT_WEBSITE_CONTENT.founderImage,
          galleryPhotos: (prev.galleryPhotos && prev.galleryPhotos.length > 0) ? prev.galleryPhotos : DEFAULT_WEBSITE_CONTENT.galleryPhotos
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
    // 1. Try local cache for zero-flicker startup
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
    } catch (e) {
      // Ignore cache read failures
    }

    // 2. Fetch live truth from Supabase
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
    } catch (e) {
      // Ignore cache write errors
    }
  }, [listings, bookings, customers, activities, websiteContent, isLoading]);

  // ==========================================================================
  // MUTATIONS (Optimistic UI + Persistent Supabase write)
  // ==========================================================================

  const addListing = async (item: Omit<Listing, 'id' | 'createdAt'>) => {
    const newId = `listing-${Date.now()}`;
    const newListing: Listing = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setListings(prev => [newListing, ...prev]);
    await supabaseService.insertListing(newListing);
    return newListing;
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    await supabaseService.updateListing(id, updates);
  };

  const deleteListing = async (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    await supabaseService.deleteListing(id);
  };

  const createBooking = async (item: Omit<Booking, 'id' | 'createdAt'>) => {
    const prefix = item.type === 'car_rental' ? 'BK' : item.type === 'car_test_drive' ? 'TD' : 'INS';
    const num = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}-${num}`;
    const newBooking: Booking = {
      ...item,
      id: newId,
      reference: newId,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);
    await supabaseService.insertBooking(newBooking);
    return newBooking;
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    await supabaseService.updateBooking(id, updates);
  };

  const updateCustomerNotes = async (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => (c.id === customerId ? { ...c, notes } : c)));
    await supabaseService.updateCustomerNotes(customerId, notes);
  };

  const addActivity = async (act: Omit<StaffActivity, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAct: StaffActivity = {
      ...act,
      id: `act-${Date.now()}`,
      timestamp: `Today, ${timeStr}`
    };
    setActivities(prev => [newAct, ...prev]);
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
    setWebsiteContent(prev => {
      const updated = { ...prev, ...config };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY_PREFIX + 'content', JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      }
      return updated;
    });
    await supabaseService.updateWebsiteContent(config);
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
        addListing,
        updateListing,
        deleteListing,
        createBooking,
        updateBooking,
        updateCustomerNotes,
        addActivity,
        clearActivities,
        updateWebsiteContent
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
