'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  CarFront,
  CalendarDays,
  CreditCard,
  JapaneseYen,
  Users,
  Image as ImageIcon,
  BarChart3,
  History,
  ArrowLeft,
  LogOut,
  Lock,
  Search,
  Bell
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAdminAuth();
  const { bookings, rmbRequests } = useStore();

  const pendingPaymentsCount = React.useMemo(() => {
    const pendingBookings = bookings.filter(b => b.paymentStatus === 'receipt_uploaded' || b.paymentStatus === 'pending').length;
    const pendingRmb = rmbRequests.filter(r => r.status === 'receipt_received' || r.status === 'requested').length;
    return pendingBookings + pendingRmb;
  }, [bookings, rmbRequests]);

  const navGroups = React.useMemo(() => [
    {
      group: 'MAIN',
      items: [
        { label: 'Overview', href: '/admin', icon: LayoutGrid },
        { label: 'Listings', href: '/admin/listings', icon: CarFront },
        { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
      ]
    },
    {
      group: 'MONEY',
      items: [
        {
          label: 'Payments',
          href: '/admin/payments',
          icon: CreditCard,
          badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
        },
        { label: 'RMB rate', href: '/admin/rmb-rate', icon: JapaneseYen }
      ]
    },
    {
      group: 'MANAGE',
      items: [
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Website content', href: '/admin/website-content', icon: ImageIcon },
        { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
        { label: 'Activity log', href: '/admin/activity-log', icon: History }
      ]
    }
  ], [pendingPaymentsCount]);

  const isLoginPage = pathname === '/admin/login';

  // Protect all /admin routes except /admin/login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace(`/admin/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, isLoginPage, pathname, router]);

  // If on login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#4e0b13] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/80 font-medium">Verifying security credentials...</p>
      </div>
    );
  }

  // If unauthenticated and redirecting, render guarded screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#1b1416]">Authentication Required</h2>
        <p className="text-sm text-[#716769] max-w-sm">
          Please sign in with your corporate BZ Group credentials to access the admin operations desk.
        </p>
        <Link
          href={`/admin/login?returnUrl=${encodeURIComponent(pathname)}`}
          className="px-6 py-2.5 rounded-lg bg-[#81141f] text-white text-sm font-semibold hover:bg-[#680e18] transition-colors"
        >
          Sign In to Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fdfbfb] text-[#1b1416] font-sans">
      {/* Sidebar Navigation [264px] (Figma: #4e0b13) */}
      <aside className="w-[264px] shrink-0 hidden md:flex flex-col justify-between bg-[#4e0b13] text-white border-r border-[#680e18] p-5">
        <div className="space-y-6">
          {/* Brand Emblem & Wordmark */}
          <div className="pb-5 border-b border-white/10">
            <BrandLogo tone="light" size="sm" href="/" />
            <div className="flex items-center justify-between text-[11px] text-white/70 mt-3 font-medium">
              <span>ADMIN PORTAL</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px]">
                v2.0
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {navGroups.map(grp => (
              <div key={grp.group} className="space-y-1.5">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                  {grp.group}
                </span>
                {grp.items.map(item => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);

                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-all cursor-pointer',
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-white/70')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="w-5 h-5 rounded-full bg-white text-[#4e0b13] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile, Return Link & Sign Out */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[12px] text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>

          {/* Authenticated Staff User */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-xs border border-white/20 shrink-0">
                {user?.avatarInitials || 'AD'}
              </div>
              <div className="flex flex-col text-[12px] leading-tight min-w-0">
                <span className="font-semibold text-white truncate">{user?.name || 'Administrator'}</span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide w-fit mt-0.5 border bg-amber-500/20 text-amber-200 border-amber-500/30">
                  Master Admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-[8px] transition-colors cursor-pointer"
              title="Sign Out of Operations Desk"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#4e0b13] text-white border-b border-[#680e18]">
          <BrandLogo tone="light" size="sm" href="/" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="text-xs text-white/80 hover:text-white underline cursor-pointer"
            >
              Sign out
            </button>
            <Link href="/" className="text-xs font-semibold text-white/80 hover:text-white">
              Exit ↗
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center gap-2 p-2 bg-[#f8f5f5] border-b border-[#eae3e4] overflow-x-auto no-scrollbar">
          {navGroups.flatMap(g => g.items).map(item => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0',
                  isActive ? 'bg-[#81141f] text-white' : 'bg-white text-[#1b1416] border border-[#eae3e4]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Child Pages */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
