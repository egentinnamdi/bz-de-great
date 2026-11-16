'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  CarFront,
  CalendarDays,
  CreditCard,
  Users,
  Image as ImageIcon,
  BarChart3,
  History,
  ArrowLeft,
  LogOut,
  Lock,
  ShoppingBag,
  Camera,
  Video,
  Ticket,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { AdminSectionId } from '@/lib/types';
import {
  canAccessAdminModule,
  canManageBooking,
  canManageListing,
  getFirstAllowedAdminRoute,
  isMasterAdmin,
} from '@/lib/staff';

interface NavItem {
  label: string;
  href: string;
  moduleId: AdminSectionId;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

function getModuleForPath(pathname: string): AdminSectionId {
  if (pathname === '/admin') return 'overview';
  if (pathname.startsWith('/admin/listings')) return 'listings';
  if (pathname.startsWith('/admin/bookings')) return 'bookings';
  if (pathname.startsWith('/admin/marketplace')) return 'marketplace';
  if (pathname.startsWith('/admin/studio')) return 'studio';
  if (pathname.startsWith('/admin/equipment')) return 'equipment';
  if (pathname.startsWith('/admin/events')) return 'events';
  if (pathname.startsWith('/admin/payments')) return 'payments';
  if (pathname.startsWith('/admin/customers')) return 'customers';
  if (pathname.startsWith('/admin/website-content')) return 'website_content';
  if (pathname.startsWith('/admin/reports')) return 'reports';
  if (pathname.startsWith('/admin/activity-log')) return 'activity_log';
  if (pathname.startsWith('/admin/team')) return 'team';
  return 'overview';
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAdminAuth();
  const {
    listings,
    bookings,
    productOrders,
    studioBookings,
    equipmentRentals,
    digitalTickets,
    staffAccounts,
  } = useStore();

  const scopedListingsCount = React.useMemo(
    () => listings.filter(l => canManageListing(user, l)).length,
    [listings, user]
  );

  const listingsById = React.useMemo(
    () => new Map(listings.map(l => [l.id, l])),
    [listings]
  );

  const scopedPendingBookingsCount = React.useMemo(
    () =>
      bookings.filter(
        b => b.bookingStatus === 'requested' && canManageBooking(user, b, listingsById)
      ).length,
    [bookings, user, listingsById]
  );

  const pendingPaymentsCount = React.useMemo(() => {
    const bCount = bookings.filter(b => b.paymentStatus === 'receipt_uploaded' || b.paymentStatus === 'pending').length;
    const oCount = productOrders.filter(o => o.paymentStatus === 'receipt_uploaded' || o.paymentStatus === 'pending').length;
    const sCount = studioBookings.filter(s => s.paymentStatus === 'receipt_uploaded' || s.paymentStatus === 'pending').length;
    const rCount = equipmentRentals.filter(r => r.paymentStatus === 'receipt_uploaded' || r.paymentStatus === 'pending').length;
    const tCount = digitalTickets.filter(t => t.paymentStatus === 'receipt_uploaded' || t.paymentStatus === 'pending').length;
    return bCount + oCount + sCount + rCount + tCount;
  }, [bookings, productOrders, studioBookings, equipmentRentals, digitalTickets]);

  const navGroups = React.useMemo<Array<{ group: string; items: NavItem[] }>>(() => {
    const raw: Array<{ group: string; items: NavItem[] }> = [
      {
        group: isMasterAdmin(user) ? 'MAIN' : 'MY BRANCH / STAND',
        items: [
          { label: 'Overview', href: '/admin', moduleId: 'overview', icon: LayoutGrid },
          {
            label: isMasterAdmin(user) ? 'Listings' : 'My Stand & Listings',
            href: '/admin/listings',
            moduleId: 'listings',
            icon: CarFront,
            badge: scopedListingsCount || undefined,
          },
          {
            label: 'Bookings',
            href: '/admin/bookings',
            moduleId: 'bookings',
            icon: CalendarDays,
            badge: scopedPendingBookingsCount || undefined,
          },
        ]
      },
      {
        group: 'COMMERCE & STUDIO',
        items: [
          { label: 'Marketplace', href: '/admin/marketplace', moduleId: 'marketplace', icon: ShoppingBag, badge: productOrders.length || undefined },
          { label: 'Studio', href: '/admin/studio', moduleId: 'studio', icon: Camera, badge: studioBookings.length || undefined },
          { label: 'Gear Rentals', href: '/admin/equipment', moduleId: 'equipment', icon: Video, badge: equipmentRentals.length || undefined },
          { label: 'Events & QR Gate', href: '/admin/events', moduleId: 'events', icon: Ticket, badge: digitalTickets.length || undefined },
        ]
      },
      {
        group: 'MONEY',
        items: [
          {
            label: 'Payments',
            href: '/admin/payments',
            moduleId: 'payments',
            icon: CreditCard,
            badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
          }
        ]
      },
      {
        group: 'MANAGE',
        items: [
          {
            label: 'Team & Branches',
            href: '/admin/team',
            moduleId: 'team',
            icon: ShieldCheck,
            badge: staffAccounts.filter(s => s.isActive && s.role !== 'Master Admin').length || undefined,
          },
          { label: 'Customers', href: '/admin/customers', moduleId: 'customers', icon: Users },
          { label: 'Website content', href: '/admin/website-content', moduleId: 'website_content', icon: ImageIcon },
          { label: 'Reports', href: '/admin/reports', moduleId: 'reports', icon: BarChart3 },
          { label: 'Activity log', href: '/admin/activity-log', moduleId: 'activity_log', icon: History }
        ]
      }
    ];

    return raw
      .map(group => ({
        group: group.group,
        items: group.items.filter(item => canAccessAdminModule(user, item.moduleId)),
      }))
      .filter(group => group.items.length > 0);
  }, [
    user,
    scopedListingsCount,
    scopedPendingBookingsCount,
    pendingPaymentsCount,
    productOrders.length,
    studioBookings.length,
    equipmentRentals.length,
    digitalTickets.length,
    staffAccounts,
  ]);

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
    <div className="h-screen flex bg-[#fdfbfb] text-[#1b1416] font-sans overflow-hidden">
      {/* Sidebar Navigation [264px] (Figma: #4e0b13) */}
      <aside className="w-[264px] shrink-0 hidden md:flex flex-col justify-between bg-[#4e0b13] text-white border-r border-[#680e18] p-5 h-full overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Emblem & Wordmark */}
          <div className="pb-5 border-b border-white/10">
            <BrandLogo tone="light" size="sm" href="/" />
            <div className="flex items-center justify-between text-[11px] text-white/70 mt-3 font-medium">
              <span>{isMasterAdmin(user) ? 'MASTER ADMIN' : 'BRANCH / STAND PORTAL'}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px]">
                v2.1
              </span>
            </div>
            {user && !isMasterAdmin(user) && (
              <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/10 text-[11px] text-[#ebc7cb] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-semibold">{user.assignedStates.join(', ')}</span>
              </div>
            )}
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
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide w-fit mt-0.5 border bg-amber-500/20 text-amber-200 border-amber-500/30 truncate max-w-[130px]">
                  {user?.role || 'Master Admin'}
                </span>
                {user?.branchOffice && (
                  <span className="text-[10px] text-white/60 truncate mt-0.5 max-w-[130px]">
                    {user.branchOffice}
                  </span>
                )}
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="md:hidden shrink-0 flex items-center justify-between gap-2 px-4 py-3 bg-[#4e0b13] text-white border-b border-[#680e18]">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo tone="light" size="sm" href="/" />
            {user && (
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-[#ebc7cb] whitespace-nowrap shrink-0">
                {isMasterAdmin(user) ? 'Master' : user.assignedStates[0]?.replace(/ State$/i, '')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={logout}
              className="text-xs text-white/80 hover:text-white underline cursor-pointer whitespace-nowrap"
            >
              Sign out
            </button>
            <Link href="/" className="text-xs font-semibold text-white/80 hover:text-white whitespace-nowrap">
              Site ↗
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-[#f8f5f5] border-b border-[#eae3e4] overflow-x-auto no-scrollbar">
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

        {/* Child Pages (Protected by Scoped Role Access) */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-[1440px] w-full mx-auto">
          {canAccessAdminModule(user, getModuleForPath(pathname)) ? (
            children
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] p-8 sm:p-12 text-center max-w-lg mx-auto my-10 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#fbf3f4] text-[#81141f] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1b1416]">
                Restricted to Master Admin
              </h2>
              <p className="text-sm text-[#716769]">
                Your account ({user?.name} · {user?.branchOffice}) is scoped to{' '}
                <strong>{user?.assignedStates.join(', ')}</strong>. Financial controls, reports, and team management are reserved for Master Admin.
              </p>
              <Link
                href={getFirstAllowedAdminRoute(user)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#81141f] text-white text-sm font-semibold hover:bg-[#680e18] transition-colors"
              >
                Return to My Workspace
              </Link>
            </div>
          )}
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
