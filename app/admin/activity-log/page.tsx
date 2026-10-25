'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  CreditCard,
  JapaneseYen,
  CarFront,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Check,
  Clock,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  category: 'payments' | 'listings' | 'rates' | 'content' | 'bookings';
  actorName: string;
  actionText: string;
  targetDetails: string;
  timestamp: string;
  dayGroup: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  iconType: 'payment' | 'rate' | 'listing' | 'payout' | 'booking' | 'content';
}

import { useStore } from '@/lib/store';

export default function AdminActivityLogPage() {
  const { toast } = useToast();
  const { activities: storeActivities, clearActivities } = useStore();
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'payments' | 'listings' | 'rates'>('all');

  const activities: ActivityItem[] = React.useMemo(() => {
    return storeActivities.map(a => {
      let iconType: ActivityItem['iconType'] = 'payment';
      if (a.category === 'rates') iconType = 'rate';
      else if (a.category === 'listings') iconType = 'listing';
      else if (a.category === 'bookings') iconType = 'booking';
      else if (a.category === 'content') iconType = 'content';

      const tsLower = (a.timestamp || '').toLowerCase();
      let dayGroup: 'TODAY' | 'YESTERDAY' | 'EARLIER' = 'EARLIER';
      if (tsLower.includes('today')) {
        dayGroup = 'TODAY';
      } else if (tsLower.includes('yesterday')) {
        dayGroup = 'YESTERDAY';
      }

      return {
        id: a.id,
        category: a.category || 'payments',
        actorName: a.actorName,
        actionText: a.action,
        targetDetails: a.target || a.details || 'Record',
        timestamp: a.timestamp ? a.timestamp.replace(/^(today|yesterday),\s*/i, '') : 'Recent',
        dayGroup,
        iconType
      };
    });
  }, [storeActivities]);

  const handleExport = () => {
    const csvContent =
      'Actor,Action,Target,Time,Day\n' +
      activities
        .map(a => `"${a.actorName}","${a.actionText}","${a.targetDetails}","${a.timestamp}","${a.dayGroup}"`)
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bz_audit_trail_october_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Activity log exported',
      description: 'Downloaded bz_audit_trail_october_2026.csv',
      variant: 'success'
    });
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all activity history? This action cannot be undone.')) {
      await clearActivities();
      toast({
        title: 'Activity log cleared',
        description: 'All past activity records have been removed.',
        variant: 'success'
      });
    }
  };

  const filteredActivities = activities.filter(item => {
    if (filterTab === 'payments' && item.category !== 'payments') return false;
    if (filterTab === 'listings' && item.category !== 'listings') return false;
    if (filterTab === 'rates' && item.category !== 'rates') return false;
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      const match =
        item.actorName.toLowerCase().includes(q) ||
        item.actionText.toLowerCase().includes(q) ||
        item.targetDetails.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const todayItems = filteredActivities.filter(a => a.dayGroup === 'TODAY');
  const yesterdayItems = filteredActivities.filter(a => a.dayGroup === 'YESTERDAY');
  const earlierItems = filteredActivities.filter(a => a.dayGroup === 'EARLIER');

  const renderIcon = (type: ActivityItem['iconType']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-[#7A0C1A]" />;
      case 'rate':
        return <span className="font-bold text-xs text-[#7A0C1A]">¥</span>;
      case 'listing':
        return <CarFront className="w-3.5 h-3.5 text-[#7A0C1A]" />;
      case 'payout':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />;
      case 'booking':
        return <Calendar className="w-3.5 h-3.5 text-[#7A0C1A]" />;
      case 'content':
        return <ImageIcon className="w-3.5 h-3.5 text-[#7A0C1A]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Activity log</h1>
          <p className="text-xs text-[#716769] mt-0.5">Every change made in the dashboard, and who made it</p>
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
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          {storeActivities.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#eae3e4] bg-white hover:bg-[#fcf3f4] text-[#81141f] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Clear all activity history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
            filterTab === 'all'
              ? 'bg-[#7A0C1A] text-white font-bold'
              : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
          )}
        >
          All activity
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('payments')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
            filterTab === 'payments'
              ? 'bg-[#7A0C1A] text-white font-bold'
              : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
          )}
        >
          Payments
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('listings')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
            filterTab === 'listings'
              ? 'bg-[#7A0C1A] text-white font-bold'
              : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
          )}
        >
          Listings
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('rates')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
            filterTab === 'rates'
              ? 'bg-[#7A0C1A] text-white font-bold'
              : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
          )}
        >
          Rate changes
        </button>
      </div>

      {/* Main Activity Feed Container */}
      <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-6">
        {/* TODAY Section */}
        {todayItems.length > 0 && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
              TODAY
            </span>
            <div className="space-y-3 divide-y divide-[#eae3e4]">
              {todayItems.map(item => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fdf3f4] flex items-center justify-center shrink-0">
                      {renderIcon(item.iconType)}
                    </div>
                    <div>
                      <div className="text-xs text-[#1b1416]">
                        <span className="font-bold">{item.actorName}</span>{' '}
                        <span>{item.actionText}</span>
                      </div>
                      <div className="text-[11px] text-[#716769] font-mono mt-0.5">
                        {item.targetDetails}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#716769] shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YESTERDAY Section */}
        {yesterdayItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#eae3e4]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
              YESTERDAY
            </span>
            <div className="space-y-3 divide-y divide-[#eae3e4]">
              {yesterdayItems.map(item => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fdf3f4] flex items-center justify-center shrink-0">
                      {renderIcon(item.iconType)}
                    </div>
                    <div>
                      <div className="text-xs text-[#1b1416]">
                        <span className="font-bold">{item.actorName}</span>{' '}
                        <span>{item.actionText}</span>
                      </div>
                      <div className="text-[11px] text-[#716769] font-mono mt-0.5">
                        {item.targetDetails}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#716769] shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EARLIER Section */}
        {earlierItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#eae3e4]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
              EARLIER AUDIT TRAIL
            </span>
            <div className="space-y-3 divide-y divide-[#eae3e4]">
              {earlierItems.map(item => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fdf3f4] flex items-center justify-center shrink-0">
                      {renderIcon(item.iconType)}
                    </div>
                    <div>
                      <div className="text-xs text-[#1b1416]">
                        <span className="font-bold">{item.actorName}</span>{' '}
                        <span>{item.actionText}</span>
                      </div>
                      <div className="text-[11px] text-[#716769] font-mono mt-0.5">
                        {item.targetDetails}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#716769] shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredActivities.length === 0 && (
          <div className="py-12 text-center text-xs text-[#716769]">
            No activity records found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
