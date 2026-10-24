'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase/client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Master Admin';
  avatarInitials: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const SESSION_STORAGE_KEY = 'bz_group_admin_auth_v2';
const AUTHORIZED_EMAIL = 'admin@bzgroup.com';
const AUTHORIZED_PASSWORD = 'admin2026';

const MASTER_ADMIN_USER: AdminUser = {
  id: 'ADM-001',
  name: 'Administrator',
  email: AUTHORIZED_EMAIL,
  role: 'Master Admin',
  avatarInitials: 'AD'
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // 1. Initial cached check
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email === AUTHORIZED_EMAIL) {
          setUser(MASTER_ADMIN_USER);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached session:', err);
    }

    // 2. Query Supabase Auth session
    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          if (session.user.email?.toLowerCase() === AUTHORIZED_EMAIL) {
            setUser(MASTER_ADMIN_USER);
            try {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MASTER_ADMIN_USER));
            } catch (e) {}
          } else {
            await supabase.auth.signOut();
            setUser(null);
            try {
              localStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Supabase getSession check error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkSupabaseSession();

    // 3. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
        if (session.user.email?.toLowerCase() === AUTHORIZED_EMAIL) {
          setUser(MASTER_ADMIN_USER);
          try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MASTER_ADMIN_USER));
          } catch (e) {}
        } else {
          await supabase.auth.signOut();
          setUser(null);
          try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } catch (e) {}
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (e) {}
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Strict authentication check - strictly admin@bzgroup.com and admin2026
    if (trimmedEmail !== AUTHORIZED_EMAIL || password !== AUTHORIZED_PASSWORD) {
      // Standard security practice: generic error with zero hints
      return { success: false, error: 'Invalid email or password.' };
    }

    // Try Supabase Auth signInWithPassword if created in Supabase Auth
    try {
      await supabase.auth.signInWithPassword({
        email: AUTHORIZED_EMAIL,
        password: AUTHORIZED_PASSWORD
      });
    } catch (err) {
      // Ignore Supabase Auth backend connection issues and proceed with authorized master credentials
    }

    // Set authorized state
    setUser(MASTER_ADMIN_USER);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MASTER_ADMIN_USER));
    } catch (e) {}

    // Audit log sign-in
    try {
      await supabase.from('staff_activities').insert({
        id: `act-${Date.now()}`,
        category: 'auth',
        staff_name: MASTER_ADMIN_USER.name,
        action: 'signed in to portal',
        target: 'Operations Desk',
        details: 'Master Admin authenticated successfully',
        timestamp_display: 'Just now'
      });
    } catch (e) {}

    return { success: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
