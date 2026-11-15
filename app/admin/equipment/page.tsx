'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminEquipmentPage() {
  const {
    equipmentItems,
    equipmentRentals,
    addEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    updateEquipmentRental,
  } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cameras');
  const [brand, setBrand] = useState('Sony');
  const [dailyRate, setDailyRate] = useState('65000');
  const [depositAmount, setDepositAmount] = useState('120000');
  const [quantityTotal, setQuantityTotal] = useState('2');
  const [description, setDescription] = useState('');

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addEquipmentItem({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      brand,
      description:
        description.trim() ||
        'Mint studio-grade equipment inspected before every rental.',
      images: ['/photos/gallery-bz-1.jpg'],
      dailyRate: Number(dailyRate) || 50000,
      depositAmount: Number(depositAmount) || 100000,
      quantityTotal: Number(quantityTotal) || 1,
      condition: 'Mint Studio Grade',
      specifications: {
        Brand: brand,
        Category: category,
      },
      status: 'available',
    });

    setName('');
    setDescription('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
          CAMERA &amp; MEDIA GEAR FLEET
        </span>
        <h1 className="text-2xl font-extrabold text-[#1b1416]">
          Equipment Inventory &amp; Rental Bookings
        </h1>
        <p className="text-xs text-[#716769]">
          Manage cinema cameras, lenses, lighting, audio gear, deposits, and rental returns.
        </p>
      </div>

      {/* Rentals Table */}
      <div className="rounded-2xl border border-[#eae3e4] bg-white overflow-x-auto">
        <div className="px-5 py-4 border-b border-[#eae3e4] bg-[#f8f5f5]">
          <h2 className="text-sm font-bold text-[#1b1416]">
            Equipment Rental Bookings ({equipmentRentals.length})
          </h2>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f5f5] border-b border-[#eae3e4] text-[#716769] uppercase">
            <tr>
              <th className="py-3 px-4">Ref</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Equipment</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Total (Incl. Deposit)</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Rental Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae3e4]">
            {equipmentRentals.map((r) => (
              <tr key={r.id}>
                <td className="py-3 px-4 font-extrabold text-[#81141f]">{r.id}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-[#1b1416]">{r.customerName}</p>
                  <p className="text-[11px] text-[#716769]">{r.customerPhone}</p>
                </td>
                <td className="py-3 px-4 font-semibold">
                  {r.quantity}x {r.equipmentName}
                </td>
                <td className="py-3 px-4">
                  {r.startDate} → {r.endDate} ({r.days}d)
                </td>
                <td className="py-3 px-4 font-extrabold">
                  ₦{r.totalAmount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={r.paymentStatus}
                    onChange={(e) =>
                      updateEquipmentRental(r.id, { paymentStatus: e.target.value as any })
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
                    value={r.rentalStatus}
                    onChange={(e) =>
                      updateEquipmentRental(r.id, { rentalStatus: e.target.value as any })
                    }
                    className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active (Dispatched)</option>
                    <option value="returned">Returned (Frees Gear)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment Items + Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold text-[#1b1416]">
            Rental Fleet Inventory ({equipmentItems.length})
          </h3>
          {equipmentItems.map((eq) => (
            <div
              key={eq.id}
              className="rounded-xl border border-[#eae3e4] bg-white p-4 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-[#81141f]">
                  {eq.category} · {eq.brand}
                </span>
                <h4 className="text-sm font-bold text-[#1b1416]">{eq.name}</h4>
                <p className="text-xs text-[#4d4547] mt-0.5">
                  Daily: <strong>₦{eq.dailyRate.toLocaleString()}</strong> · Deposit:{' '}
                  <strong>₦{eq.depositAmount.toLocaleString()}</strong> · Qty:{' '}
                  <strong>{eq.quantityTotal}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={eq.status}
                  onChange={(e) =>
                    updateEquipmentItem(eq.id, { status: e.target.value as any })
                  }
                  className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  type="button"
                  onClick={() => deleteEquipmentItem(eq.id)}
                  className="p-1.5 text-[#716769] hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddEquipment}
          className="lg:col-span-5 rounded-2xl border border-[#eae3e4] bg-white p-5 space-y-3 h-fit"
        >
          <h3 className="text-sm font-bold text-[#1b1416] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#81141f]" />
            <span>Add Rental Equipment</span>
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Equipment Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ARRI Alexa Mini LF Package"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#eae3e4] px-2.5 text-xs font-bold bg-white"
              >
                <option value="Cameras">Cameras</option>
                <option value="Lenses">Lenses</option>
                <option value="Lighting">Lighting</option>
                <option value="Tripods">Tripods</option>
                <option value="Microphones">Microphones</option>
                <option value="Audio Equipment">Audio Equipment</option>
                <option value="Video Equipment">Video Equipment</option>
                <option value="Other Media Equipment">Other Media Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold mb-1">Daily Rate (₦)</label>
              <Input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Deposit (₦)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Total Units</label>
              <Input
                type="number"
                value={quantityTotal}
                onChange={(e) => setQuantityTotal(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Included Accessories</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Batteries, media cards, hard case..."
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 bg-[#81141f] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Add Equipment to Fleet
          </Button>
        </form>
      </div>
    </div>
  );
}
