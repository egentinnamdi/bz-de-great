'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase/client';
import { useStore } from './store';
import { AdminRole, AdminSectionId, ListingCategory, StaffAccount } from './types';
import {
  ALL_ADMIN_MODULES,
  ALL_LISTING_CATEGORIES,
  DEFAULT_STAFF_ACCOUNTS,
  getFirstAllowedAdminRoute,
} from './staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  assignedStates: string[];
  allowedCategories: ListingCategory[];
  allowedModules: AdminSectionId[];
  branchOffice: string;
  requireApprovalBeforeLive?: boolean;
  canDeleteListings?: boolean;
  avatarInitials: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; landingRoute?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const SESSION_STORAGE_KEY = 'bz_group_admin_auth_v2';
const MASTER_EMAIL = 'admin@bzgroup.com';

function toAdminUser(acc: StaffAccount): AdminUser {
  return {
    id: acc.id,
    name: acc.name,
    email: acc.email,
    phone: acc.phone,
    role: acc.role,
    assignedStates: acc.assignedStates?.length ? acc.assignedStates : ['ALL'],
    allowedCategories: acc.allowedCategories?.length ? acc.allowedCategories : ALL_LISTING_CATEGORIES,
    allowedModules: acc.allowedModules?.length ? acc.allowedModules : ALL_ADMIN_MODULES,
    branchOffice: acc.branchOffice || 'BZ Group Operations Desk',
    requireApprovalBeforeLive: Boolean(acc.requireApprovalBeforeLive),
    canDeleteListings: Boolean(acc.canDeleteListings),
    avatarInitials: acc.avatarInitials || 'BZ',
  };
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { staffAccounts, addActivity, isLoading: isStoreLoading } = useStore();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const combinedStaff = useMemo(() => {
    const existingEmails = new Set(staffAccounts.map(s => s.email.toLowerCase()));
    const missingDefaults = DEFAULT_STAFF_ACCOUNTS.filter(
      d => !existingEmails.has(d.email.toLowerCase())
    );
    return [...staffAccounts, ...missingDefaults];
  }, [staffAccounts]);

  // Initial session hydration from cache + Supabase Auth
  useEffect(() => {
    let mounted = true;

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          const match = combinedStaff.find(
            s => s.email.toLowerCase() === String(parsed.email).toLowerCase() && s.isActive
          );
          if (match) {
            setUser(toAdminUser(match));
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached admin session:', err);
    }

    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const matched = combinedStaff.find(
            s => s.email.toLowerCase() === session.user.email?.toLowerCase() && s.isActive
          );
          if (matched) {
            const adminUser = toAdminUser(matched);
            setUser(adminUser);
            try {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Supabase getSession check error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkSupabaseSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {}
      } else if (session?.user && mounted) {
        const matched = combinedStaff.find(
          s => s.email.toLowerCase() === session.user.email?.toLowerCase() && s.isActive
        );
        if (matched) {
          const adminUser = toAdminUser(matched);
          setUser(adminUser);
          try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
          } catch {}
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Run hydration once on mount

  // Live permission sync whenever Owner modifies or suspends a partner account
  useEffect(() => {
    if (!user || isStoreLoading) return;
    const latest = combinedStaff.find(
      s => s.id === user.id || s.email.toLowerCase() === user.email.toLowerCase()
    );
    if (!latest) return;

    if (!latest.isActive) {
      setUser(null);
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
      router.replace('/admin/login');
      return;
    }

    const refreshed = toAdminUser(latest);
    if (JSON.stringify(refreshed) !== JSON.stringify(user)) {
      setUser(refreshed);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(refreshed));
      } catch {}
    }
  }, [combinedStaff, user, router]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; landingRoute?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const account = combinedStaff.find(s => s.email.toLowerCase() === trimmedEmail);

    if (!account || account.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (!account.isActive) {
      return {
        success: false,
        error: 'This partner/branch account has been suspended. Contact Master Admin.',
      };
    }

    if (trimmedEmail === MASTER_EMAIL) {
      try {
        await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
      } catch {
        // Ignore Supabase Auth backend issues if using local/branch credentials
      }
    }

    const adminUser = toAdminUser(account);
    setUser(adminUser);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
    } catch {}

    try {
      await addActivity({
        actorName: adminUser.name,
        actorRole: `${adminUser.role} · ${adminUser.branchOffice}`,
        action: `signed in (${adminUser.assignedStates.join(', ')})`,
        target: adminUser.branchOffice,
        category: 'team',
      });
    } catch {}

    return {
      success: true,
      landingRoute: getFirstAllowedAdminRoute(adminUser),
    };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        logout,
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
