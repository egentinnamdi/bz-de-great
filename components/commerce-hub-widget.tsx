'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Camera,
  Video,
  Ticket,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';

type PillarTab = 'marketplace' | 'studio' | 'equipment' | 'events';

export function CommerceHubWidget() {
  const {
    productCategories,
    products,
    studioServices,
    equipmentItems,
    events,
  } = useStore();

  const [activeTab, setActiveTab] = useState<PillarTab>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string>('phones');
  const [selectedStudioId, setSelectedStudioId] = useState<string>(
    studioServices[0]?.id || 'stu-srv-1'
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    equipmentItems[0]?.id || 'eq-cam-1'
  );
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || 'evt-lagos-gala-2026'
  );

  const publishedProducts = products.filter((p) => p.status === 'published');
  const categoryProducts = publishedProducts.filter(
    (p) => p.categorySlug === selectedCategory
  );
  const featuredProduct = categoryProducts[0] || publishedProducts[0];

  const activeStudio =
    studioServices.find((s) => s.id === selectedStudioId) || studioServices[0];
  const activeEquipment =
    equipmentItems.find((e) => e.id === selectedEquipmentId) || equipmentItems[0];
  const activeEvent =
    events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="rounded-[20px] bg-white p-6 sm:p-8 text-[#1b1416] shadow-2xl border border-[#eae3e4]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-5 border-b border-[#eae3e4]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#81141f]">
            LIVE MULTI-SERVICE DESK
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#1b1416] mt-0.5">
            Instant Estimator &amp; Availability
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live Stock
        </span>
      </div>

      {/* 4 Pillar Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#f8f5f5] p-1.5 rounded-xl mt-5 border border-[#eae3e4]">
        {[
          { id: 'marketplace' as const, label: 'Shop', icon: ShoppingBag },
          { id: 'studio' as const, label: 'Studio', icon: Camera },
          { id: 'equipment' as const, label: 'Gear Rent', icon: Video },
          { id: 'events' as const, label: 'Events', icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#81141f] text-white shadow-xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#716769] mb-2">
              Select Product Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {productCategories
                .filter((c) => c.active)
                .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedCategory === cat.slug
                        ? 'bg-[#fbf3f4] border-[#81141f] text-[#81141f]'
                        : 'bg-white border-[#eae3e4] text-[#4d4547] hover:bg-[#f8f5f5]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {featuredProduct && (
            <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                    {featuredProduct.brand} · {featuredProduct.condition}
                  </span>
                  <h4 className="text-sm font-bold text-[#1b1416] mt-0.5">
                    {featuredProduct.name}
                  </h4>
                </div>
                <span className="text-right shrink-0">
                  <span className="block text-base font-extrabold text-[#1b1416]">
                    ₦{featuredProduct.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {featuredProduct.stock} in stock
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eae3e4] text-xs">
                {Object.entries(featuredProduct.specifications)
                  .slice(0, 4)
                  .map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="text-[#716769]">{k}: </span>
                      <span className="font-semibold text-[#1b1416]">{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Link
              href={
                ['phones', 'laptops', 'gadgets', 'electronics', 'solar-inverters', 'clothing', 'jewelry'].includes(
                  selectedCategory
                )
                  ? `/${selectedCategory}`
                  : `/marketplace?category=${encodeURIComponent(selectedCategory)}`
              }
              className="flex-1"
            >
              <Button className="w-full h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-sm rounded-xl justify-center gap-2 cursor-pointer">
                <span>Browse {selectedCategory.replace('-', ' & ')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 px-4 rounded-xl border-[#eae3e4] text-[#1b1416] font-semibold text-sm cursor-pointer"
              >
                All 7 Categories
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: STUDIO */}
      {activeTab === 'studio' && activeStudio && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#81141f]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>BZ De Great Creative Studio</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
              Studio / Photography Session
            </label>
            <select
              value={activeStudio.id}
              onChange={(e) => setSelectedStudioId(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#eae3e4] bg-white px-3.5 text-sm font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f]"
            >
              {studioServices
                .filter((s) => s.status === 'active')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationHours} hrs) — ₦{s.price.toLocaleString()}
                  </option>
                ))}
            </select>
          </div>

          <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#716769] font-medium">Session Rate</span>
              <span className="text-lg font-extrabold text-[#1b1416]">
                ₦{activeStudio.price.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 pt-2 border-t border-[#eae3e4]">
              {activeStudio.includes.slice(0, 3).map((inc) => (
                <div key={inc} className="flex items-center gap-2 text-xs text-[#4d4547]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
                  <span className="truncate">{inc}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href={`/studio?service=${activeStudio.id}`} className="block">
            <Button className="w-full h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-sm rounded-xl justify-center gap-2 cursor-pointer">
              <span>Select Date &amp; Book Studio Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* TAB 3: EQUIPMENT RENTAL */}
      {activeTab === 'equipment' && activeEquipment && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
                Camera / Cinema Gear
              </label>
              <select
                value={activeEquipment.id}
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#eae3e4] bg-white px-3 text-sm font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f]"
              >
                {equipmentItems
                  .filter((e) => e.status === 'available')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} (₦{e.dailyRate.toLocaleString()}/day)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
                Rental Days
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={rentalDays}
                onChange={(e) =>
                  setRentalDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                }
                className="w-full h-11 rounded-xl border border-[#eae3e4] bg-white px-3 text-sm font-bold text-[#1b1416] focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#716769]">
                Rental ({rentalDays} day{rentalDays > 1 ? 's' : ''} × ₦
                {activeEquipment.dailyRate.toLocaleString()})
              </span>
              <span className="font-bold text-[#1b1416]">
                ₦{(activeEquipment.dailyRate * rentalDays).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716769]">Refundable Caution Deposit</span>
              <span className="font-bold text-[#1b1416]">
                ₦{activeEquipment.depositAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#eae3e4] text-sm">
              <span className="font-bold text-[#1b1416]">Total Estimated</span>
              <span className="font-extrabold text-[#81141f]">
                ₦
                {(
                  activeEquipment.dailyRate * rentalDays +
                  activeEquipment.depositAmount
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <Link href={`/equipment-rental?item=${activeEquipment.id}`} className="block">
            <Button className="w-full h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-sm rounded-xl justify-center gap-2 cursor-pointer">
              <span>Reserve Equipment Dates</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* TAB 4: EVENTS & DIGITAL TICKETS */}
      {activeTab === 'events' && activeEvent && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
              Upcoming Event
            </label>
            <select
              value={activeEvent.id}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#eae3e4] bg-white px-3 text-sm font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f]"
            >
              {events
                .filter((ev) => ev.status === 'published')
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.city})
                  </option>
                ))}
            </select>
          </div>

          <div className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#716769]">
              <span>
                {activeEvent.date} · {activeEvent.startTime}
              </span>
              <span className="font-semibold text-[#81141f]">{activeEvent.city}</span>
            </div>
            <p className="text-xs font-medium text-[#1b1416] truncate">
              {activeEvent.venue}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#eae3e4]">
              {activeEvent.ticketTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-lg bg-white border border-[#eae3e4] p-2 text-center"
                >
                  <span className="block text-[10px] font-bold uppercase text-[#716769] truncate">
                    {tier.name}
                  </span>
                  <span className="block text-xs font-extrabold text-[#81141f] mt-0.5">
                    ₦{tier.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href={`/events?event=${activeEvent.id}`} className="block">
            <Button className="w-full h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-semibold text-sm rounded-xl justify-center gap-2 cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <span>Get Instant QR Digital Ticket</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
