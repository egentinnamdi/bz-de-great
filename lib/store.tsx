'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Listing,
  Booking,
  RmbExchangeRequest,
  RmbRateConfig,
  Customer,
  StaffActivity
} from './types';
import {
  INITIAL_LISTINGS,
  INITIAL_BOOKINGS,
  INITIAL_RMB_REQUESTS,
  INITIAL_CUSTOMERS,
  INITIAL_ACTIVITIES
} from './mock-data';
import { INITIAL_RMB_RATES } from './constants';
import { supabaseService } from './supabase/service';

interface StoreContextType {
  listings: Listing[];
  bookings: Booking[];
  rmbRequests: RmbExchangeRequest[];
  rmbRates: RmbRateConfig;
  customers: Customer[];
  activities: StaffActivity[];

  // Mutations
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Listing;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  createRmbRequest: (req: Omit<RmbExchangeRequest, 'id' | 'createdAt' | 'updatedAt'>) => RmbExchangeRequest;
  updateRmbRequest: (id: string, updates: Partial<RmbExchangeRequest>) => void;

  updateRmbRates: (rates: { payRmbRate: number; payNairaRate: number }) => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;
  addActivity: (activity: Omit<StaffActivity, 'id' | 'timestamp'>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'bz_group_store_';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [rmbRequests, setRmbRequests] = useState<RmbExchangeRequest[]>(INITIAL_RMB_REQUESTS);
  const [rmbRates, setRmbRates] = useState<RmbRateConfig>(INITIAL_RMB_RATES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [activities, setActivities] = useState<StaffActivity[]>(INITIAL_ACTIVITIES);
  const [initialized, setInitialized] = useState(false);

  // 1. Initial Load: LocalStorage first, then background sync with Supabase BaaS
  useEffect(() => {
    try {
      const storedListings = localStorage.getItem(STORAGE_KEY_PREFIX + 'listings');
      if (storedListings) setListings(JSON.parse(storedListings));

      const storedBookings = localStorage.getItem(STORAGE_KEY_PREFIX + 'bookings');
      if (storedBookings) setBookings(JSON.parse(storedBookings));

      const storedRmb = localStorage.getItem(STORAGE_KEY_PREFIX + 'rmb');
      if (storedRmb) setRmbRequests(JSON.parse(storedRmb));

      const storedRates = localStorage.getItem(STORAGE_KEY_PREFIX + 'rates');
      if (storedRates) setRmbRates(JSON.parse(storedRates));

      const storedCust = localStorage.getItem(STORAGE_KEY_PREFIX + 'cust');
      if (storedCust) setCustomers(JSON.parse(storedCust));

      const storedAct = localStorage.getItem(STORAGE_KEY_PREFIX + 'act');
      if (storedAct) setActivities(JSON.parse(storedAct));
    } catch {
      // Ignore
    } finally {
      setInitialized(true);
    }

    // Attempt Supabase live fetch if configured
    (async () => {
      try {
        const [remoteRates, remoteListings, remoteBookings] = await Promise.all([
          supabaseService.fetchRmbRates(),
          supabaseService.fetchListings(),
          supabaseService.fetchBookings()
        ]);

        if (remoteRates) setRmbRates(remoteRates);
        if (remoteListings && remoteListings.length > 0) setListings(remoteListings);
        if (remoteBookings && remoteBookings.length > 0) setBookings(remoteBookings);
      } catch (err) {
        // Fallback to local data
      }
    })();
  }, []);

  // 2. Sync to localStorage
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'listings', JSON.stringify(listings));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'bookings', JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rmb', JSON.stringify(rmbRequests));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rates', JSON.stringify(rmbRates));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'cust', JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'act', JSON.stringify(activities));
    } catch {
      // Ignore
    }
  }, [listings, bookings, rmbRequests, rmbRates, customers, activities, initialized]);

  // Mutations with Supabase BaaS synchronization
  const addListing = (item: Omit<Listing, 'id' | 'createdAt'>) => {
    const newId = `listing-${Date.now()}`;
    const newListing: Listing = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setListings(prev => [newListing, ...prev]);

    // Async persist to Supabase
    supabaseService.insertListing(newListing);

    return newListing;
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    supabaseService.updateListing(id, updates);
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const createBooking = (item: Omit<Booking, 'id' | 'createdAt'>) => {
    const prefix = item.type === 'car_rental' ? 'BK' : item.type === 'car_test_drive' ? 'TD' : 'INS';
    const num = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}-${num}`;
    const newBooking: Booking = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);

    // Async persist to Supabase
    supabaseService.insertBooking(newBooking);

    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    supabaseService.updateBooking(id, updates);
  };

  const createRmbRequest = (item: Omit<RmbExchangeRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const num = Math.floor(100 + Math.random() * 900);
    const newId = `RMB-0${num}`;
    const now = new Date().toISOString();
    const newReq: RmbExchangeRequest = {
      ...item,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    setRmbRequests(prev => [newReq, ...prev]);

    // Async persist to Supabase
    supabaseService.insertRmbRequest(newReq);

    return newReq;
  };

  const updateRmbRequest = (id: string, updates: Partial<RmbExchangeRequest>) => {
    const now = new Date().toISOString();
    setRmbRequests(prev => prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: now } : r)));
  };

  const updateRmbRates = (newRates: { payRmbRate: number; payNairaRate: number }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const updated: RmbRateConfig = {
      payRmbRate: newRates.payRmbRate,
      payNairaRate: newRates.payNairaRate,
      updatedAt: timeStr,
      updatedBy: 'Admin (Treasury Desk)'
    };
    setRmbRates(updated);

    // Async persist to Supabase
    supabaseService.updateRmbRates(newRates);
  };

  const updateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => (c.id === customerId ? { ...c, notes } : c)));
  };

  const addActivity = (act: Omit<StaffActivity, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAct: StaffActivity = {
      ...act,
      id: `act-${Date.now()}`,
      timestamp: `Today, ${timeStr}`
    };
    setActivities(prev => [newAct, ...prev]);
  };

  return (
    <StoreContext.Provider
      value={{
        listings,
        bookings,
        rmbRequests,
        rmbRates,
        customers,
        activities,
        addListing,
        updateListing,
        deleteListing,
        createBooking,
        updateBooking,
        createRmbRequest,
        updateRmbRequest,
        updateRmbRates,
        updateCustomerNotes,
        addActivity
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
