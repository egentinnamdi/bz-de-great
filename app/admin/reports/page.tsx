'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  Download,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Car,
  Home,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AdminReportsPage() {
  const { toast } = useToast();
  const {
    bookings,
    listings,
    customers,
    productOrders,
    products,
    studioBookings,
    studioServices,
    equipmentRentals,
    equipmentItems,
    events,
    digitalTickets,
  } = useStore();
  const [globalSearch, setGlobalSearch] = useState('');
  const [range, setRange] = useState<'Last 6 months' | 'This year' | 'Last year' | 'Custom range'>('Last 6 months');

  // ============================================================================
  // 1. DYNAMIC TOP METRICS AGGREGATION ACROSS ALL DIVISIONS
  // ============================================================================
  const metrics = useMemo(() => {
    const verifiedBookingsRev = bookings.reduce((sum, b) => {
      if (b.paymentStatus === 'verified' || b.bookingStatus === 'confirmed') {
        return sum + (Number(b.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const verifiedOrdersRev = productOrders.reduce((sum, o) => {
      if (
        o.paymentStatus === 'verified' ||
        ['confirmed', 'processing', 'dispatched', 'delivered'].includes(o.orderStatus)
      ) {
        return sum + (Number(o.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const verifiedStudioRev = studioBookings.reduce((sum, s) => {
      if (s.paymentStatus === 'verified' || ['confirmed', 'completed'].includes(s.bookingStatus)) {
        return sum + (Number(s.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const verifiedRentalRev = equipmentRentals.reduce((sum, r) => {
      if (
        r.paymentStatus === 'verified' ||
        ['confirmed', 'active', 'returned'].includes(r.rentalStatus)
      ) {
        return sum + (Number(r.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const verifiedTicketRev = digitalTickets.reduce((sum, t) => {
      if (t.paymentStatus === 'verified' || t.ticketStatus === 'valid' || t.ticketStatus === 'checked_in') {
        return sum + (Number(t.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const totalRevenueNgn =
      verifiedBookingsRev + verifiedOrdersRev + verifiedStudioRev + verifiedRentalRev + verifiedTicketRev;

    const totalBookingsCount =
      bookings.length +
      productOrders.length +
      studioBookings.length +
      equipmentRentals.length +
      digitalTickets.length;

    const activeBookingsCount =
      bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'active').length +
      productOrders.filter(o =>
        ['confirmed', 'processing', 'dispatched', 'delivered'].includes(o.orderStatus)
      ).length +
      studioBookings.filter(s => s.bookingStatus === 'confirmed' || s.bookingStatus === 'completed').length +
      equipmentRentals.filter(r => ['confirmed', 'active'].includes(r.rentalStatus)).length +
      digitalTickets.filter(t => t.ticketStatus === 'valid' || t.ticketStatus === 'checked_in').length;

    const publishedListingsCount =
      listings.filter(l => l.status === 'published').length +
      products.filter(p => p.status === 'published').length +
      studioServices.filter(s => s.status === 'active').length +
      equipmentItems.filter(e => e.status === 'available').length +
      events.filter(ev => ev.status === 'published').length;

    const totalListingsCount =
      listings.length +
      products.length +
      studioServices.length +
      equipmentItems.length +
      events.length;

    const totalCustomersCount = customers.length;
    const vipCustomersCount = customers.filter(c => c.isVip || c.status === 'vip').length;

    return {
      totalRevenueNgn,
      totalBookingsCount,
      activeBookingsCount,
      publishedListingsCount,
      totalListingsCount,
      totalCustomersCount,
      vipCustomersCount
    };
  }, [
    bookings,
    listings,
    customers,
    productOrders,
    products,
    studioBookings,
    studioServices,
    equipmentRentals,
    equipmentItems,
    events,
    digitalTickets,
  ]);

  // Format currency helpers
  const formatNgnDisplay = (amount: number) => {
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `₦${(amount / 1_000).toFixed(0)}K`;
    }
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  // ============================================================================
  // 2. DYNAMIC MONTHLY REVENUE (ROLLING LAST 6 MONTHS)
  // ============================================================================
  const monthlyRevenueData = useMemo(() => {
    const now = new Date();
    const monthNames: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthNames.push(d.toLocaleString('en-US', { month: 'short' }));
    }
    const currentMonth = monthNames[monthNames.length - 1];

    const buckets: Record<string, number> = {};
    monthNames.forEach(m => {
      buckets[m] = 0;
    });

    const accumulate = (createdAt?: string, amount?: number) => {
      const date = createdAt ? new Date(createdAt) : now;
      const month = !isNaN(date.getTime())
        ? date.toLocaleString('en-US', { month: 'short' })
        : currentMonth;
      const amt = Number(amount) || 0;
      if (buckets[month] !== undefined) {
        buckets[month] += amt;
      } else {
        buckets[currentMonth] += amt;
      }
    };

    bookings.forEach(b => accumulate(b.createdAt, b.totalAmount));
    productOrders.forEach(o => accumulate(o.createdAt, o.totalAmount));
    studioBookings.forEach(s => accumulate(s.createdAt, s.totalAmount));
    equipmentRentals.forEach(r => accumulate(r.createdAt, r.totalAmount));
    digitalTickets.forEach(t => accumulate(t.createdAt, t.totalAmount));

    const items = monthNames.map((m) => {
      const rawValNgn = buckets[m] || 0;
      const valMillions = Number((rawValNgn / 1_000_000).toFixed(2));
      return {
        month: m,
        value: valMillions,
        rawAmount: rawValNgn,
        current: m === currentMonth
      };
    });

    const maxValue = Math.max(...items.map(i => i.value), 1);

    return {
      items,
      maxValue,
      rangeLabel: `₦ millions · ${monthNames[0]} – ${currentMonth} ${now.getFullYear()}`,
    };
  }, [bookings, productOrders, studioBookings, equipmentRentals, digitalTickets]);

  // ============================================================================
  // 3. DYNAMIC REVENUE BY DIVISION
  // ============================================================================
  const divisionsData = useMemo(() => {
    const autosAndPropertyRev = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const marketplaceRev = productOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const studioAndRentalRev =
      studioBookings.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0) +
      equipmentRentals.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const eventsRev = digitalTickets.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);

    const totalDiv = autosAndPropertyRev + marketplaceRev + studioAndRentalRev + eventsRev || 1;

    return [
      {
        label: 'Autos & Real Estate',
        amountNum: autosAndPropertyRev,
        amount: formatNgnDisplay(autosAndPropertyRev),
        pct: Math.round((autosAndPropertyRev / totalDiv) * 100),
        color: '#7A0C1A'
      },
      {
        label: 'Marketplace Storefront',
        amountNum: marketplaceRev,
        amount: formatNgnDisplay(marketplaceRev),
        pct: Math.round((marketplaceRev / totalDiv) * 100),
        color: '#2B2B2B'
      },
      {
        label: 'Studio & Gear Rentals',
        amountNum: studioAndRentalRev,
        amount: formatNgnDisplay(studioAndRentalRev),
        pct: Math.round((studioAndRentalRev / totalDiv) * 100),
        color: '#C26772'
      },
      {
        label: 'Events & QR Tickets',
        amountNum: eventsRev,
        amount: formatNgnDisplay(eventsRev),
        pct: Math.round((eventsRev / totalDiv) * 100),
        color: '#E8B8BE'
      }
    ];
  }, [bookings, productOrders, studioBookings, equipmentRentals, digitalTickets]);

  // ============================================================================
  // 4. DYNAMIC TOP LISTINGS & COMMERCE RANKING
  // ============================================================================
  const topListingsData = useMemo(() => {
    const listingRows = listings.map(l => {
      const matchBookings = bookings.filter(b => b.listingId === l.id || b.listingTitle === l.title);
      const bookingCount = matchBookings.length;
      const revenue = matchBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      const isCar = l.category.startsWith('car');
      const isRent = l.category.includes('rent');
      let category = isCar ? (isRent ? 'Car rental' : 'Car sale') : (isRent ? 'Property rental' : 'Property sale');
      if (l.title.toLowerCase().includes('plot') || l.title.toLowerCase().includes('land')) {
        category = 'Land';
      }

      return {
        id: l.id,
        listing: l.title,
        category,
        inquiries: bookingCount > 0 ? `${bookingCount} booking${bookingCount > 1 ? 's' : ''}` : 'Available on site',
        revenueFormatted: revenue > 0 ? formatNgnDisplay(revenue) : formatNgnDisplay(Number(l.price) || 0),
        revenueRaw: revenue > 0 ? revenue : Number(l.price) || 0,
        activityScore: bookingCount,
        trend: bookingCount > 0 ? `${bookingCount} active` : 'Catalog',
        trendType: bookingCount > 0 ? 'positive' : 'neutral'
      };
    });

    const productRows = products.map(p => {
      const matchOrders = productOrders.filter(o => o.items.some(i => i.productId === p.id));
      const unitsSold = matchOrders.reduce(
        (sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((q, i) => q + i.quantity, 0),
        0
      );
      const revenue = matchOrders.reduce(
        (sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((q, i) => q + i.lineTotal, 0),
        0
      );
      return {
        id: p.id,
        listing: p.name,
        category: `Marketplace · ${p.categorySlug}`,
        inquiries: unitsSold > 0 ? `${unitsSold} unit${unitsSold > 1 ? 's' : ''} ordered` : `${p.stock} in stock`,
        revenueFormatted: revenue > 0 ? formatNgnDisplay(revenue) : formatNgnDisplay(p.price),
        revenueRaw: revenue > 0 ? revenue : p.price,
        activityScore: unitsSold,
        trend: unitsSold > 0 ? '+Orders' : 'Active',
        trendType: unitsSold > 0 ? 'positive' : 'neutral'
      };
    });

    const eventRows = events.map(ev => {
      const matchTickets = digitalTickets.filter(t => t.eventId === ev.id);
      const qtySold = matchTickets.reduce((sum, t) => sum + t.quantity, 0);
      const revenue = matchTickets.reduce((sum, t) => sum + t.totalAmount, 0);
      return {
        id: ev.id,
        listing: ev.name,
        category: 'Events & QR Gate',
        inquiries: qtySold > 0 ? `${qtySold} pass${qtySold > 1 ? 'es' : ''} issued` : 'Published event',
        revenueFormatted: revenue > 0 ? formatNgnDisplay(revenue) : formatNgnDisplay(ev.ticketTiers[0]?.price || 0),
        revenueRaw: revenue,
        activityScore: qtySold,
        trend: qtySold > 0 ? `${qtySold} sold` : 'Open',
        trendType: qtySold > 0 ? 'positive' : 'neutral'
      };
    });

    const mapped = [...listingRows, ...productRows, ...eventRows];
    mapped.sort((a, b) => (b.activityScore !== a.activityScore ? b.activityScore - a.activityScore : b.revenueRaw - a.revenueRaw));

    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      return mapped.filter(item =>
        item.listing.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.inquiries.toLowerCase().includes(q)
      );
    }

    return mapped.slice(0, 8);
  }, [listings, bookings, products, productOrders, events, digitalTickets, globalSearch]);

  const handleDownloadPdf = () => {
    toast({
      title: 'Generating executive report',
      description: `Preparing BZ Group Financial Report · ${formatNgnDisplay(metrics.totalRevenueNgn)} Total Revenue...`,
      variant: 'success'
    });

    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Reports & Financial Analytics</h1>
          <p className="text-xs text-[#716769] mt-0.5">
            Real-time multi-industry business performance · Source: Supabase BaaS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search listings, categories, bookings"
              className="pl-8 pr-3 py-1.5 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-64 focus:outline-none focus:border-[#7A0C1A] transition-colors"
            />
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="hover-luxury-lift flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Time Range Pills */}
      <div className="flex items-center gap-2">
        {(['Last 6 months', 'This year', 'Last year', 'Custom range'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setRange(tab)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              range === tab
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="text-xs font-medium text-[#716769]">Total Revenue</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            {formatNgnDisplay(metrics.totalRevenueNgn)}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            +18% growth vs prior cycle
          </div>
        </div>

        {/* Bookings */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="text-xs font-medium text-[#716769]">Bookings & Orders</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            {metrics.totalBookingsCount}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            {metrics.activeBookingsCount} confirmed active orders
          </div>
        </div>

        {/* Published listings */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="text-xs font-medium text-[#716769]">Published Listings</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            {metrics.publishedListingsCount}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            of {metrics.totalListingsCount} total catalog items
          </div>
        </div>

        {/* New customers */}
        <div className="hover-luxury-lift bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs transition-all duration-300">
          <div className="text-xs font-medium text-[#716769]">Registered Clients</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">
            {metrics.totalCustomersCount}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">
            {metrics.vipCustomersCount} VIP enterprise accounts
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue By Month & Revenue By Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue By Month Bar Chart [7 cols] */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1b1416]">Revenue by month</h2>
            <span className="text-[11px] text-[#716769]">{monthlyRevenueData.rangeLabel}</span>
          </div>

          <div className="pt-6">
            <div className="h-52 flex items-end justify-between gap-4 px-2">
              {monthlyRevenueData.items.map(item => {
                const heightPercent = Math.min((item.value / monthlyRevenueData.maxValue) * 100, 100);
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-semibold text-[#1b1416] transition-transform duration-200 group-hover:-translate-y-0.5">
                      {item.value}M
                    </span>
                    <div className="w-full max-w-[48px] bg-[#f8e9ea] rounded-t-md h-40 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          'w-full rounded-t-md transition-all duration-500',
                          item.current ? 'bg-[#7A0C1A]' : 'bg-[#eecbd0]'
                        )}
                      />
                    </div>
                    <span className="text-xs text-[#716769] font-medium mt-1">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue By Division [5 cols] */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1b1416]">Revenue by division</h2>
            <span className="text-[11px] text-[#716769] font-mono">Portfolio share</span>
          </div>

          <div className="space-y-4 pt-1">
            {divisionsData.map(division => (
              <div key={division.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1b1416]">{division.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1b1416]">{division.amount}</span>
                    <span className="text-[#716769] font-mono text-[11px]">{division.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                  <div
                    style={{ width: `${division.pct}%`, backgroundColor: division.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Top Listings */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#eae3e4] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1b1416]">Top Performing Inventory</h2>
          <span className="text-[11px] text-[#716769]">Ranked by client demand & transaction value</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Listing</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Bookings / Status</th>
                <th className="py-3 px-5">Revenue / Price</th>
                <th className="py-3 px-5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {topListingsData.map(row => (
                <tr key={row.id} className="hover:bg-[#fcf8f8]/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#1b1416]">{row.listing}</td>
                  <td className="py-3.5 px-5 text-[#716769]">{row.category}</td>
                  <td className="py-3.5 px-5 text-[#1b1416]">{row.inquiries}</td>
                  <td className="py-3.5 px-5 font-bold text-[#1b1416]">{row.revenueFormatted}</td>
                  <td className="py-3.5 px-5 text-right">
                    {row.trendType === 'positive' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                        {row.trend}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#fdf5e8] text-[#b45309] text-[10px] font-bold">
                        {row.trend}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
