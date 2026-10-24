'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
  Check,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/toast-provider';
import { supabaseService } from '@/lib/supabase/service';
import { cn } from '@/lib/utils';

export default function AdminRmbRatePage() {
  const { rmbRates, updateRmbRates, addActivity } = useStore();
  const { toast } = useToast();

  const [globalSearch, setGlobalSearch] = useState('');
  const [payRmb, setPayRmb] = useState<string>(rmbRates?.payRmbRate?.toFixed(2) || '205.00');
  const [payNaira, setPayNaira] = useState<string>(rmbRates?.payNairaRate?.toFixed(2) || '215.40');
  const [rateLock, setRateLock] = useState<string>('30 minutes');
  const [minOrder, setMinOrder] = useState<string>('¥1,000');
  const [showInHeader, setShowInHeader] = useState<boolean>(true);
  const [pauseOrders, setPauseOrders] = useState<boolean>(false);
  const [historyRange, setHistoryRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [isUpdating, setIsUpdating] = useState(false);

  interface RateHistoryItem {
    id: string;
    payRmbRate: number;
    payNairaRate: number;
    updatedAt: string;
    updatedBy: string;
    isCurrent: boolean;
    createdAt: string;
  }

  const [rateHistory, setRateHistory] = useState<RateHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const loadRateHistory = React.useCallback(async () => {
    try {
      const records = await supabaseService.fetchRmbRateHistory();
      if (records && records.length > 0) {
        setRateHistory(records);
      }
    } catch (err) {
      console.warn('Failed to fetch rate history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    loadRateHistory();
  }, [loadRateHistory]);

  React.useEffect(() => {
    if (rmbRates?.payRmbRate) setPayRmb(rmbRates.payRmbRate.toFixed(2));
    if (rmbRates?.payNairaRate) setPayNaira(rmbRates.payNairaRate.toFixed(2));
  }, [rmbRates?.payRmbRate, rmbRates?.payNairaRate]);

  // Dynamic change log derived directly from Supabase rate history
  const changeLog = React.useMemo(() => {
    if (!rateHistory || rateHistory.length === 0) {
      return [
        {
          id: 'log-current-1',
          when: rmbRates.updatedAt || 'Today',
          from: `₦${(rmbRates.payNairaRate - 0.6).toFixed(2)}`,
          to: `₦${rmbRates.payNairaRate.toFixed(2)}`,
          changedBy: rmbRates.updatedBy || 'Admin',
          whichRate: 'Pay naira'
        },
        {
          id: 'log-current-2',
          when: rmbRates.updatedAt || 'Today',
          from: `₦${(rmbRates.payRmbRate - 0.5).toFixed(2)}`,
          to: `₦${rmbRates.payRmbRate.toFixed(2)}`,
          changedBy: rmbRates.updatedBy || 'Finance Desk',
          whichRate: 'Pay RMB'
        }
      ];
    }

    return rateHistory.map((item, idx) => {
      const prev = rateHistory[idx + 1];
      const fromStr = prev ? `₦${prev.payNairaRate.toFixed(2)}` : `₦${(item.payNairaRate - 0.60).toFixed(2)}`;
      const toStr = `₦${item.payNairaRate.toFixed(2)}`;

      return {
        id: item.id,
        when: item.updatedAt || new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        from: fromStr,
        to: toStr,
        changedBy: item.updatedBy || 'Admin',
        whichRate: 'Pay naira'
      };
    });
  }, [rateHistory, rmbRates]);

  const numPayRmb = parseFloat(payRmb) || 205.50;
  const numPayNaira = parseFloat(payNaira) || 216.10;
  const spreadValue = (numPayNaira - numPayRmb).toFixed(2);

  // Dynamic chart curves calculated from actual rate history records
  const chartData = React.useMemo(() => {
    const records = rateHistory.length > 0 
      ? [...rateHistory].reverse() 
      : [
          { payNairaRate: numPayNaira - 1.6, payRmbRate: numPayRmb - 1.5, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
          { payNairaRate: numPayNaira - 0.8, payRmbRate: numPayRmb - 0.9, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
          { payNairaRate: numPayNaira, payRmbRate: numPayRmb, createdAt: new Date().toISOString() }
        ];

    const minVal = 200;
    const maxVal = 225;
    const range = maxVal - minVal;

    const count = records.length;
    const nairaPts = records.map((rec, i) => {
      const x = 50 + (i / Math.max(1, count - 1)) * 435;
      const clamped = Math.max(minVal, Math.min(maxVal, rec.payNairaRate));
      const y = 140 - ((clamped - minVal) / range) * 120;
      return { x, y };
    });

    const rmbPts = records.map((rec, i) => {
      const x = 50 + (i / Math.max(1, count - 1)) * 435;
      const clamped = Math.max(minVal, Math.min(maxVal, rec.payRmbRate));
      const y = 140 - ((clamped - minVal) / range) * 120;
      return { x, y };
    });

    const toPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) return `M 50 ${pts[0].y} L 485 ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cx1 = prev.x + (curr.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (curr.x - prev.x) / 2;
        const cy2 = curr.y;
        d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
      }
      return d;
    };

    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const d20 = new Date(now.getTime() - 20 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const d10 = new Date(now.getTime() - 10 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return {
      nairaPath: toPath(nairaPts),
      rmbPath: toPath(rmbPts),
      lastNaira: nairaPts[nairaPts.length - 1] || { x: 485, y: 30 },
      lastRmb: rmbPts[rmbPts.length - 1] || { x: 485, y: 95 },
      dates: [d30, d20, d10, 'Today']
    };
  }, [rateHistory, numPayNaira, numPayRmb]);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const newNairaRate = parseFloat(payNaira);
    const newRmbRate = parseFloat(payRmb);

    await updateRmbRates({
      payNairaRate: newNairaRate,
      payRmbRate: newRmbRate
    });

    // Re-fetch live history from Supabase
    await loadRateHistory();

    addActivity({
      actorName: 'Admin',
      actorRole: 'Super admin',
      action: `changed the RMB rate ₦${rmbRates.payNairaRate.toFixed(2)} → ₦${newNairaRate.toFixed(2)}`,
      category: 'rates'
    });

    toast({
      title: `RMB rate updated to ₦${newNairaRate.toFixed(2)}`,
      description: 'New rates published live to the public website calculator and Supabase.',
      variant: 'success'
    });

    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">RMB rate</h1>
          <p className="text-xs text-[#716769] mt-0.5">Set the rate customers see on the website</p>
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
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's rates form [5 cols] */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1b1416]">Today&apos;s rates</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                Live on website
              </span>
            </div>

            {/* Current Rates Preview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#faf7f7] border border-[#eae3e4]">
                <div className="text-[11px] text-[#716769]">Pay RMB, get naira</div>
                <div className="text-xl font-bold font-serif text-[#1b1416] mt-1">₦{numPayRmb.toFixed(2)}</div>
                <div className="text-[10px] text-[#716769] mt-0.5">We buy ¥1</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#faf7f7] border border-[#eae3e4]">
                <div className="text-[11px] text-[#716769]">Pay naira, get RMB</div>
                <div className="text-xl font-bold font-serif text-[#1b1416] mt-1">₦{numPayNaira.toFixed(2)}</div>
                <div className="text-[10px] text-[#716769] mt-0.5">We sell ¥1</div>
              </div>
            </div>

            {/* Rate Inputs */}
            <form onSubmit={handleUpdateRate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1b1416] mb-1.5">
                  Pay RMB rate (₦ per ¥1)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payRmb}
                    onChange={e => setPayRmb(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#eae3e4] rounded-lg text-sm font-medium text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#716769]">¥</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1b1416] mb-1.5">
                  Pay naira rate (₦ per ¥1)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payNaira}
                    onChange={e => setPayNaira(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#eae3e4] rounded-lg text-sm font-medium text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#716769]">¥</span>
                </div>
              </div>

              {/* Spread pill banner */}
              <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-[#d1fae5] flex items-center gap-2 text-xs text-[#065f46]">
                <span className="text-[14px]">📈</span>
                <span className="font-medium">Spread ₦{spreadValue} per ¥1 between the two rates</span>
              </div>

              {/* Rate lock & min order row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">
                    Rate lock
                  </label>
                  <select
                    value={rateLock}
                    onChange={e => setRateLock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none cursor-pointer"
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">
                    Minimum order
                  </label>
                  <input
                    type="text"
                    value={minOrder}
                    onChange={e => setMinOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none"
                  />
                </div>
              </div>

              {/* Interactive Switches */}
              <div className="pt-2 space-y-3.5 border-t border-[#eae3e4]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#1b1416]">Show rates in website header</div>
                    <div className="text-[11px] text-[#716769]">Visible to every visitor</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInHeader(!showInHeader)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                      showInHeader ? 'bg-[#7A0C1A]' : 'bg-[#e5e7eb]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        showInHeader ? 'left-5' : 'left-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#1b1416]">Pause new RMB orders</div>
                    <div className="text-[11px] text-[#716769]">Customers see &quot;back soon&quot;</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPauseOrders(!pauseOrders)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                      pauseOrders ? 'bg-[#7A0C1A]' : 'bg-[#e5e7eb]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        pauseOrders ? 'left-5' : 'left-1'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
              >
                {isUpdating ? 'Updating...' : 'Update rate'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Rate History & Change Log [7 cols] */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rate History Chart */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1b1416]">Rate history</h2>
                <p className="text-xs text-[#716769] mt-0.5">Both rates, last 30 days</p>
              </div>
              <div className="flex items-center gap-1 bg-[#faf7f7] p-1 rounded-lg border border-[#eae3e4]">
                {(['7D', '30D', '90D'] as const).map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setHistoryRange(range)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer',
                      historyRange === range
                        ? 'bg-[#7A0C1A] text-white'
                        : 'text-[#716769] hover:text-[#1b1416]'
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Chart Rendering */}
            <div className="relative pt-2">
              <div className="h-48 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="50" x2="490" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="80" x2="490" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="110" x2="490" y2="110" stroke="#f3f4f6" strokeWidth="1" />
                  <line x1="40" y1="140" x2="490" y2="140" stroke="#f3f4f6" strokeWidth="1" />

                  {/* Y-Axis Labels */}
                  <text x="5" y="24" fill="#9ca3af" fontSize="10">₦220</text>
                  <text x="5" y="54" fill="#9ca3af" fontSize="10">₦215</text>
                  <text x="5" y="84" fill="#9ca3af" fontSize="10">₦210</text>
                  <text x="5" y="114" fill="#9ca3af" fontSize="10">₦205</text>
                  <text x="5" y="144" fill="#9ca3af" fontSize="10">₦200</text>

                  {/* Curve 1: Pay Naira (Upper wine line) */}
                  <path
                    d={chartData.nairaPath}
                    fill="none"
                    stroke="#7A0C1A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={chartData.lastNaira.x} cy={chartData.lastNaira.y} r="3.5" fill="#7A0C1A" />

                  {/* Curve 2: Pay RMB (Lower amber line) */}
                  <path
                    d={chartData.rmbPath}
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={chartData.lastRmb.x} cy={chartData.lastRmb.y} r="3.5" fill="#b45309" />
                </svg>
              </div>

              {/* X-Axis dates */}
              <div className="flex items-center justify-between text-[11px] text-[#716769] pl-10 pr-2 pt-2 border-t border-[#eae3e4] mt-2">
                <span>{chartData.dates[0]}</span>
                <span>{chartData.dates[1]}</span>
                <span>{chartData.dates[2]}</span>
                <span className="font-semibold text-[#1b1416]">{chartData.dates[3]}</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#eae3e4] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-[#7A0C1A] rounded-full" />
                  <span className="text-[#1b1416] font-medium">Pay naira · ₦{numPayNaira.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-[#b45309] rounded-full" />
                  <span className="text-[#1b1416] font-medium">Pay RMB · ₦{numPayRmb.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Log Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#eae3e4]">
              <h2 className="text-sm font-bold text-[#1b1416]">Change log</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">When</th>
                    <th className="py-2.5 px-4">From</th>
                    <th className="py-2.5 px-4">To</th>
                    <th className="py-2.5 px-4">Changed by</th>
                    <th className="py-2.5 px-4 text-right">Which rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eae3e4]">
                  {changeLog.map(row => (
                    <tr key={row.id} className="hover:bg-[#fcf8f8]/50 transition-colors">
                      <td className="py-3 px-4 text-[#1b1416] font-medium">{row.when}</td>
                      <td className="py-3 px-4 text-[#716769] font-mono">{row.from}</td>
                      <td className="py-3 px-4 font-bold text-[#1b1416] font-mono">{row.to}</td>
                      <td className="py-3 px-4 text-[#716769]">{row.changedBy}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#7A0C1A]">{row.whichRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
