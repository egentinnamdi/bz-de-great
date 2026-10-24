'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Master Admin' | 'Treasury Desk' | 'Concierge Lead';
  avatarInitials: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const SESSION_STORAGE_KEY = 'bz_group_admin_auth_v1';

const PRESET_ACCOUNTS: Record<string, { pass: string; user: AdminUser }> = {
  'admin@bzgroup.com': {
    pass: 'admin2026',
    user: {
      id: 'ADM-001',
      name: 'Chidi Okafor (COO)',
      email: 'admin@bzgroup.com',
      role: 'Master Admin',
      avatarInitials: 'CO'
    }
  },
  'treasury@bzgroup.com': {
    pass: 'treasury2026',
    user: {
      id: 'ADM-002',
      name: 'Treasury Settlement Desk',
      email: 'treasury@bzgroup.com',
      role: 'Treasury Desk',
      avatarInitials: 'TR'
    }
  },
  'concierge@bzgroup.com': {
    pass: 'concierge2026',
    user: {
      id: 'ADM-003',
      name: 'VIP Concierge Lead',
      email: 'concierge@bzgroup.com',
      role: 'Concierge Lead',
      avatarInitials: 'VC'
    }
  }
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to parse admin session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate slight verification latency for realism
    await new Promise(r => setTimeout(r, 450));

    const trimmedEmail = email.trim().toLowerCase();
    const preset = PRESET_ACCOUNTS[trimmedEmail];

    if (preset) {
      if (preset.pass !== password && password !== 'admin2026' && password !== 'password') {
        return { success: false, error: 'Invalid password. Try admin2026.' };
      }
      setUser(preset.user);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(preset.user));
      } catch (e) {}
      return { success: true };
    }

    // Flexible fallback for custom corporate email testing
    if (password.length >= 4) {
      const newUser: AdminUser = {
        id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
        name: trimmedEmail.split('@')[0].toUpperCase(),
        email: trimmedEmail,
        role: 'Master Admin',
        avatarInitials: trimmedEmail.slice(0, 2).toUpperCase()
      };
      setUser(newUser);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {}
      return { success: true };
    }

    return { success: false, error: 'Password must be at least 4 characters.' };
  };

  const logout = () => {
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
