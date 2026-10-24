'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [globalSearch, setGlobalSearch] = useState('');
  const [range, setRange] = useState<'Last 6 months' | 'This year' | 'Last year' | 'Custom range'>('Last 6 months');

  const handleDownloadPdf = () => {
    toast({
      title: 'Generating executive report',
      description: 'Preparing BZ Group Financial Report (May – Oct 2026).pdf...',
      variant: 'success'
    });

    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Reports</h1>
          <p className="text-xs text-[#716769] mt-0.5">May – October 2026</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search orders, listings, customers"
              className="pl-8 pr-3 py-1.5 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-64 focus:outline-none focus:border-[#7A0C1A]"
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="text-xs font-medium text-[#716769]">Revenue</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">₦142.6M</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">+18% vs previous 6 months</div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="text-xs font-medium text-[#716769]">Bookings</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">214</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">+26 vs previous</div>
        </div>

        {/* RMB volume */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="text-xs font-medium text-[#716769]">RMB volume</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">¥1.24M</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">+31% vs previous</div>
        </div>

        {/* New customers */}
        <div className="bg-white rounded-xl border border-[#eae3e4] p-5 shadow-xs">
          <div className="text-xs font-medium text-[#716769]">New customers</div>
          <div className="text-2xl font-bold font-serif text-[#1b1416] mt-2">412</div>
          <div className="text-[11px] text-[#059669] font-medium mt-1">+9% vs previous</div>
        </div>
      </div>

      {/* Middle Row: Revenue By Month & Revenue By Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue By Month Bar Chart [7 cols] */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1b1416]">Revenue by month</h2>
            <span className="text-[11px] text-[#716769]">₦ millions</span>
          </div>

          <div className="pt-6">
            <div className="h-52 flex items-end justify-between gap-4 px-2">
              {[
                { month: 'May', value: 16.2, current: false },
                { month: 'Jun', value: 20.1, current: false },
                { month: 'Jul', value: 19.4, current: false },
                { month: 'Aug', value: 24.8, current: false },
                { month: 'Sep', value: 27.3, current: false },
                { month: 'Oct', value: 32.8, current: true }
              ].map(item => {
                const heightPercent = (item.value / 35) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-semibold text-[#1b1416]">
                      {item.value}
                    </span>
                    <div className="w-full max-w-[48px] bg-[#f8e9ea] rounded-t-md h-40 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          'w-full rounded-t-md transition-all',
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
          <h2 className="text-sm font-bold text-[#1b1416]">Revenue by division</h2>

          <div className="space-y-4 pt-1">
            {[
              { label: 'Property sales', amount: '₦77.0M', pct: 54, color: '#7A0C1A' },
              { label: 'Car rentals', amount: '₦29.9M', pct: 21, color: '#2B2B2B' },
              { label: 'Car sales', amount: '₦21.4M', pct: 15, color: '#C26772' },
              { label: 'RMB fees', amount: '₦10.0M', pct: 7, color: '#D97706' },
              { label: 'Apartments', amount: '₦4.3M', pct: 3, color: '#E8B8BE' }
            ].map(division => (
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
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Top Listings */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#eae3e4]">
          <h2 className="text-sm font-bold text-[#1b1416]">Top listings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Listing</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Bookings / Inquiries</th>
                <th className="py-3 px-5">Revenue</th>
                <th className="py-3 px-5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {[
                {
                  listing: 'Lincoln Navigator 2022',
                  category: 'Car rental',
                  inquiries: '58 bookings',
                  revenue: '₦9.1M',
                  trend: '+22%',
                  trendType: 'positive'
                },
                {
                  listing: '5-Bedroom Detached Duplex',
                  category: 'Property sale',
                  inquiries: '61 inquiries',
                  revenue: 'Offer pending',
                  trend: 'New',
                  trendType: 'neutral'
                },
                {
                  listing: 'Mercedes-Benz S-Class 2022',
                  category: 'Car rental',
                  inquiries: '34 bookings',
                  revenue: '₦5.6M',
                  trend: '+12%',
                  trendType: 'positive'
                },
                {
                  listing: 'Agidigba Garden City – Plots',
                  category: 'Land',
                  inquiries: '22 plots sold',
                  revenue: '₦44.0M',
                  trend: '+40%',
                  trendType: 'positive'
                }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fcf8f8]/50 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#1b1416]">{row.listing}</td>
                  <td className="py-3.5 px-5 text-[#716769]">{row.category}</td>
                  <td className="py-3.5 px-5 text-[#1b1416]">{row.inquiries}</td>
                  <td className="py-3.5 px-5 font-bold text-[#1b1416]">{row.revenue}</td>
                  <td className="py-3.5 px-5 text-right">
                    {row.trendType === 'positive' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                        {row.trend}
                      </span>
                    )}
                    {row.trendType === 'neutral' && (
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
