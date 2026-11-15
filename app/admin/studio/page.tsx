'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminStudioPage() {
  const {
    studioServices,
    studioBookings,
    addStudioService,
    deleteStudioService,
    updateStudioBooking,
  } = useStore();

  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('Studio Session');
  const [durationHours, setDurationHours] = useState('2');
  const [price, setPrice] = useState('150000');
  const [slots, setSlots] = useState('09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM');
  const [description, setDescription] = useState('');

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addStudioService({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      serviceType,
      description:
        description.trim() ||
        'Professional studio session at BZ De Great Studio.',
      durationHours: Number(durationHours) || 2,
      price: Number(price) || 150000,
      images: ['/photos/founder-bz-3.jpg'],
      location: 'BZ De Great Studio',
      includes: ['Full Lighting Rig', 'Studio Assistant', 'Uninterrupted Power'],
      availableSlots: slots
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: 'active',
    });

    setName('');
    setDescription('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
          BZ DE GREAT STUDIO
        </span>
        <h1 className="text-2xl font-extrabold text-[#1b1416]">
          Studio Packages &amp; Session Bookings
        </h1>
        <p className="text-xs text-[#716769]">
          Manage photography &amp; video studio packages, available time slots, and client bookings.
        </p>
      </div>

      {/* Studio Bookings Table */}
      <div className="rounded-2xl border border-[#eae3e4] bg-white overflow-x-auto">
        <div className="px-5 py-4 border-b border-[#eae3e4] bg-[#f8f5f5]">
          <h2 className="text-sm font-bold text-[#1b1416]">
            Studio Session Bookings ({studioBookings.length})
          </h2>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f5f5] border-b border-[#eae3e4] text-[#716769] uppercase">
            <tr>
              <th className="py-3 px-4">Ref</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Package</th>
              <th className="py-3 px-4">Date &amp; Slot</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Booking Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae3e4]">
            {studioBookings.map((b) => (
              <tr key={b.id}>
                <td className="py-3 px-4 font-extrabold text-[#81141f]">{b.id}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-[#1b1416]">{b.customerName}</p>
                  <p className="text-[11px] text-[#716769]">{b.customerPhone}</p>
                </td>
                <td className="py-3 px-4 font-semibold">{b.serviceName}</td>
                <td className="py-3 px-4 font-bold">
                  {b.date} · {b.timeSlot}
                </td>
                <td className="py-3 px-4 font-extrabold">
                  ₦{b.totalAmount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={b.paymentStatus}
                    onChange={(e) =>
                      updateStudioBooking(b.id, { paymentStatus: e.target.value as any })
                    }
                    className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="receipt_uploaded">Receipt Uploaded</option>
                    <option value="verified">Verified ✓</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={b.bookingStatus}
                    onChange={(e) =>
                      updateStudioBooking(b.id, { bookingStatus: e.target.value as any })
                    }
                    className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled (Frees Slot)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Packages + Add Package Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold text-[#1b1416]">
            Active Studio Services ({studioServices.length})
          </h3>
          {studioServices.map((srv) => (
            <div
              key={srv.id}
              className="rounded-xl border border-[#eae3e4] bg-white p-4 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-[#81141f]">
                  {srv.serviceType} · {srv.durationHours} hrs
                </span>
                <h4 className="text-sm font-bold text-[#1b1416]">{srv.name}</h4>
                <p className="text-xs font-extrabold text-[#1b1416] mt-0.5">
                  ₦{srv.price.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#716769] mt-1">
                  Slots: {srv.availableSlots.join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteStudioService(srv.id)}
                className="p-2 text-[#716769] hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddService}
          className="lg:col-span-5 rounded-2xl border border-[#eae3e4] bg-white p-5 space-y-3 h-fit"
        >
          <h3 className="text-sm font-bold text-[#1b1416] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#81141f]" />
            <span>Add Studio Service</span>
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Service Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Music Video Cyclorama Full Day"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#eae3e4] px-2.5 text-xs font-bold bg-white"
              >
                <option value="Photography Session">Photography Session</option>
                <option value="Studio Session">Studio Session</option>
                <option value="Photo + Video Session">Photo + Video Session</option>
                <option value="Event Photography">Event Photography</option>
                <option value="Portrait Session">Portrait Session</option>
                <option value="Product Photography">Product Photography</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Price (NGN)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Duration (Hours)</label>
              <Input
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Time Slots (comma)</label>
              <Input
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Included lighting, sets, and deliverables"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 bg-[#81141f] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Add Studio Service
          </Button>
        </form>
      </div>
    </div>
  );
}
