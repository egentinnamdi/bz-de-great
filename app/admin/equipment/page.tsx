'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, MapPin, Plus, Trash2, Video } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import { calculateEquipmentRentalAuthoritative } from '@/lib/commerce-engine';
import {
  EquipmentItem,
  EquipmentRental,
  EquipmentRentalStatus,
} from '@/lib/types';
import {
  CommerceCustomerCard,
  CommerceDrawer,
  CommerceEmptyState,
  CommerceFilterPills,
  CommerceHeader,
  CommerceImageField,
  CommerceMetricStrip,
  CommercePaymentCard,
  CommerceStatusPill,
  CommerceTabs,
  CommerceTwoStepDelete,
  RowChevron,
  formatCompactNgn,
  formatNgn,
} from '@/components/admin/commerce-ui';
import { cn } from '@/lib/utils';

type EquipmentTab = 'rentals' | 'fleet';
type RentalFilter = 'all' | 'action' | 'confirmed' | 'active' | 'returned' | 'cancelled';

const RENTAL_STATUS_STEPS: Array<{ value: EquipmentRentalStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active', label: 'Active (Out)' },
  { value: 'returned', label: 'Returned (Frees Gear)' },
  { value: 'cancelled', label: 'Cancelled' },
];

const GEAR_CATEGORIES = [
  'Cameras',
  'Lenses',
  'Lighting',
  'Tripods',
  'Microphones',
  'Audio Equipment',
  'Video Equipment',
  'Other Media Equipment',
];

export default function AdminEquipmentPage() {
  const {
    equipmentItems,
    equipmentRentals,
    addEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    createEquipmentRental,
    updateEquipmentRental,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<EquipmentTab>('rentals');
  const [search, setSearch] = useState('');
  const [rentalFilter, setRentalFilter] = useState<RentalFilter>('all');
  const [fleetCategoryFilter, setFleetCategoryFilter] = useState<string>('all');
  const [fleetStatusFilter, setFleetStatusFilter] = useState<'all' | EquipmentItem['status']>('all');

  // Rental Inspector Drawer
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

  // Gear Editor Drawer (Create / Edit)
  const [gearDrawerOpen, setGearDrawerOpen] = useState(false);
  const [editingGearId, setEditingGearId] = useState<string | null>(null);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState('Cameras');
  const [eqBrand, setEqBrand] = useState('Sony');
  const [eqCondition, setEqCondition] = useState('Mint Studio Grade');
  const [eqDailyRate, setEqDailyRate] = useState('65000');
  const [eqDeposit, setEqDeposit] = useState('120000');
  const [eqUnits, setEqUnits] = useState('2');
  const [eqStatus, setEqStatus] = useState<EquipmentItem['status']>('available');
  const [eqImage, setEqImage] = useState('/photos/gallery-bz-1.jpg');
  const [eqDescription, setEqDescription] = useState('');
  const [eqSpecs, setEqSpecs] = useState<Array<{ key: string; value: string }>>([]);

  // Manual Rental Drawer
  const [rentalDrawerOpen, setRentalDrawerOpen] = useState(false);
  const [rnEquipmentId, setRnEquipmentId] = useState('');
  const [rnStartDate, setRnStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rnEndDate, setRnEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rnQty, setRnQty] = useState('1');
  const [rnName, setRnName] = useState('');
  const [rnPhone, setRnPhone] = useState('');
  const [rnEmail, setRnEmail] = useState('');
  const [rnPickup, setRnPickup] = useState('BZ De Great Creative Studio');
  const [rnNotes, setRnNotes] = useState('');

  const selectedRental = useMemo(
    () => equipmentRentals.find((r) => r.id === selectedRentalId) || null,
    [equipmentRentals, selectedRentalId]
  );

  const metrics = useMemo(() => {
    const needsAction = equipmentRentals.filter(
      (r) =>
        r.rentalStatus !== 'cancelled' &&
        r.rentalStatus !== 'returned' &&
        (r.rentalStatus === 'pending' ||
          r.rentalStatus === 'payment_pending' ||
          r.paymentStatus === 'pending' ||
          r.paymentStatus === 'receipt_uploaded')
    ).length;

    const outOrConfirmed = equipmentRentals.filter(
      (r) => r.rentalStatus === 'confirmed' || r.rentalStatus === 'active'
    ).length;

    const totalUnits = equipmentItems.reduce((sum, e) => sum + e.quantityTotal, 0);
    const availableCount = equipmentItems.filter((e) => e.status === 'available').length;
    const maintenanceCount = equipmentItems.filter((e) => e.status === 'maintenance').length;
    const archivedCount = equipmentItems.filter((e) => e.status === 'archived').length;

    const verifiedRevenue = equipmentRentals
      .filter((r) => r.paymentStatus === 'verified' && r.rentalStatus !== 'cancelled')
      .reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      needsAction,
      outOrConfirmed,
      totalUnits,
      availableCount,
      maintenanceCount,
      archivedCount,
      verifiedRevenue,
    };
  }, [equipmentItems, equipmentRentals]);

  const filteredRentals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return equipmentRentals.filter((r) => {
      if (rentalFilter === 'action') {
        const needsAction =
          r.rentalStatus !== 'cancelled' &&
          r.rentalStatus !== 'returned' &&
          (r.rentalStatus === 'pending' ||
            r.rentalStatus === 'payment_pending' ||
            r.paymentStatus === 'pending' ||
            r.paymentStatus === 'receipt_uploaded');
        if (!needsAction) return false;
      } else if (rentalFilter !== 'all' && r.rentalStatus !== rentalFilter) {
        return false;
      }

      if (q) {
        return (
          r.id.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.equipmentName.toLowerCase().includes(q) ||
          r.equipmentCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipmentRentals, rentalFilter, search]);

  const activeCategories = useMemo(() => {
    const set = new Set(equipmentItems.map((e) => e.category));
    return Array.from(set);
  }, [equipmentItems]);

  const filteredFleet = useMemo(() => {
    const q = search.trim().toLowerCase();
    return equipmentItems.filter((e) => {
      if (fleetCategoryFilter !== 'all' && e.category !== fleetCategoryFilter) return false;
      if (fleetStatusFilter !== 'all' && e.status !== fleetStatusFilter) return false;
      if (q) {
        return (
          e.name.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipmentItems, fleetCategoryFilter, fleetStatusFilter, search]);

  const availableEquipment = useMemo(
    () => equipmentItems.filter((e) => e.status === 'available'),
    [equipmentItems]
  );

  const selectedRentalEquipment = useMemo(
    () =>
      availableEquipment.find((e) => e.id === rnEquipmentId) || availableEquipment[0] || null,
    [availableEquipment, rnEquipmentId]
  );

  const rentalPreviewCalc = useMemo(() => {
    if (!selectedRentalEquipment) return null;
    return calculateEquipmentRentalAuthoritative(
      selectedRentalEquipment,
      equipmentRentals,
      rnStartDate,
      rnEndDate,
      Math.max(1, Number(rnQty) || 1)
    );
  }, [selectedRentalEquipment, equipmentRentals, rnStartDate, rnEndDate, rnQty]);

  // Handlers
  const handleRentalUpdate = async (
    rental: EquipmentRental,
    updates: Partial<EquipmentRental>,
    actionNote: string
  ) => {
    await updateEquipmentRental(rental.id, updates);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Equipment Desk',
      action: `${actionNote} for gear rental ${rental.id}`,
      target: `${rental.customerName} · ${rental.equipmentName}`,
      targetId: rental.id,
      category: 'bookings',
    });
    toast({
      title: `Rental ${rental.id} updated`,
      description: actionNote,
      variant: 'success',
    });
  };

  const openCreateGear = () => {
    setEditingGearId(null);
    setEqName('');
    setEqCategory('Cameras');
    setEqBrand('Sony');
    setEqCondition('Mint Studio Grade');
    setEqDailyRate('65000');
    setEqDeposit('120000');
    setEqUnits('2');
    setEqStatus('available');
    setEqImage('/photos/gallery-bz-1.jpg');
    setEqDescription('');
    setEqSpecs([
      { key: 'Sensor / Output', value: '' },
      { key: 'Included Accessories', value: '' },
    ]);
    setGearDrawerOpen(true);
  };

  const openEditGear = (eq: EquipmentItem) => {
    setEditingGearId(eq.id);
    setEqName(eq.name);
    setEqCategory(eq.category);
    setEqBrand(eq.brand);
    setEqCondition(eq.condition);
    setEqDailyRate(String(eq.dailyRate));
    setEqDeposit(String(eq.depositAmount));
    setEqUnits(String(eq.quantityTotal));
    setEqStatus(eq.status);
    setEqImage(eq.images[0] || '/photos/gallery-bz-1.jpg');
    setEqDescription(eq.description);
    setEqSpecs(
      Object.entries(eq.specifications || {}).map(([key, value]) => ({ key, value }))
    );
    setGearDrawerOpen(true);
  };

  const handleSaveGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;

    const specMap: Record<string, string> = {};
    eqSpecs.forEach((row) => {
      if (row.key.trim() && row.value.trim()) {
        specMap[row.key.trim()] = row.value.trim();
      }
    });

    const payload = {
      name: eqName.trim(),
      category: eqCategory,
      brand: eqBrand.trim() || 'BZ Studio Fleet',
      condition: eqCondition.trim() || 'Mint Studio Grade',
      dailyRate: Math.max(0, Number(eqDailyRate) || 50000),
      depositAmount: Math.max(0, Number(eqDeposit) || 100000),
      quantityTotal: Math.max(1, Number(eqUnits) || 1),
      status: eqStatus,
      images: [eqImage.trim() || '/photos/gallery-bz-1.jpg'],
      description:
        eqDescription.trim() ||
        'Mint studio-grade equipment inspected before every rental.',
      specifications: {
        Brand: eqBrand.trim() || 'BZ Studio Fleet',
        Category: eqCategory,
        ...specMap,
      },
    };

    if (editingGearId) {
      await updateEquipmentItem(editingGearId, payload);
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Equipment Desk',
        action: `updated gear fleet item: ${payload.name}`,
        targetId: editingGearId,
        category: 'listings',
      });
      toast({
        title: 'Gear item updated',
        description: `${payload.name} changes saved.`,
        variant: 'success',
      });
    } else {
      await addEquipmentItem({
        ...payload,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Equipment Desk',
        action: `added gear to fleet: ${payload.name}`,
        category: 'listings',
      });
      toast({
        title: 'Gear added to fleet',
        description: `${payload.name} is now available for rentals.`,
        variant: 'success',
      });
    }

    setGearDrawerOpen(false);
  };

  const handleDeleteGear = async () => {
    if (!editingGearId) return;
    const label = eqName || 'equipment';
    await deleteEquipmentItem(editingGearId);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Equipment Desk',
      action: `removed gear from fleet: ${label}`,
      targetId: editingGearId,
      category: 'listings',
    });
    toast({
      title: 'Gear removed',
      description: `${label} deleted from fleet.`,
      variant: 'default',
    });
    setGearDrawerOpen(false);
  };

  const openNewRental = () => {
    setRnEquipmentId(availableEquipment[0]?.id || '');
    setRnQty('1');
    setRnName('');
    setRnPhone('');
    setRnEmail('');
    setRnNotes('');
    setRentalDrawerOpen(true);
  };

  const handleCreateManualRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalEquipment || !rnName.trim() || !rnPhone.trim()) return;

    const result = await createEquipmentRental({
      equipmentId: selectedRentalEquipment.id,
      startDate: rnStartDate,
      endDate: rnEndDate,
      quantity: Math.max(1, Number(rnQty) || 1),
      customerName: rnName.trim(),
      customerPhone: rnPhone.trim(),
      customerEmail: rnEmail.trim() || 'client@bzgroup.ng',
      pickupLocation: rnPickup.trim() || 'BZ De Great Creative Studio',
      notes: rnNotes.trim() || undefined,
    });

    if (!result.ok) {
      toast({
        title: 'Gear unavailable',
        description: result.error,
        variant: 'error',
      });
      return;
    }

    toast({
      title: 'Rental booking created',
      description: `${result.rental?.id} logged for ${rnName.trim()}.`,
      variant: 'success',
    });
    setRentalDrawerOpen(false);
    setTab('rentals');
  };

  return (
    <div className="space-y-6 pb-12">
      <CommerceHeader
        title="Gear Rentals"
        subtitle="Production fleet availability, security deposits & active rentals"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search rentals, clients, gear..."
        secondaryAction={
          <button
            type="button"
            onClick={openNewRental}
            className="h-10 px-3.5 rounded-xl border border-[#eae3e4] bg-white hover:border-[#81141f] text-[13px] font-semibold text-[#1b1416] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#81141f]" />
            <span>New Rental</span>
          </button>
        }
        primaryAction={
          <button
            type="button"
            onClick={openCreateGear}
            className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gear</span>
          </button>
        }
      />

      <CommerceMetricStrip
        metrics={[
          {
            label: 'Out & Confirmed',
            value: metrics.outOrConfirmed,
            hint:
              metrics.needsAction > 0
                ? `${metrics.needsAction} awaiting verification`
                : 'No pending approvals',
            tone: metrics.needsAction > 0 ? 'amber' : 'neutral',
          },
          {
            label: 'Fleet Units',
            value: metrics.totalUnits,
            hint: `${metrics.availableCount} of ${equipmentItems.length} gear items ready`,
            tone: 'neutral',
          },
          {
            label: 'Maintenance',
            value: metrics.maintenanceCount,
            hint: `${metrics.archivedCount} archived items`,
            tone: metrics.maintenanceCount > 0 ? 'amber' : 'neutral',
          },
          {
            label: 'Verified Revenue',
            value: formatCompactNgn(metrics.verifiedRevenue),
            hint: 'Rental fees + held deposits',
            tone: 'emerald',
          },
        ]}
      />

      <CommerceTabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          {
            id: 'rentals',
            label: 'Rentals',
            count: equipmentRentals.length,
            attentionCount: metrics.needsAction,
          },
          {
            id: 'fleet',
            label: 'Fleet Inventory',
            count: equipmentItems.length,
          },
        ]}
      />

      {/* ====================================================================
          TAB 1: RENTALS
         ==================================================================== */}
      {tab === 'rentals' && (
        <div className="space-y-4">
          <CommerceFilterPills
            value={rentalFilter}
            onChange={setRentalFilter}
            options={[
              { id: 'all', label: 'All Rentals', count: equipmentRentals.length },
              { id: 'action', label: 'Needs Action', count: metrics.needsAction },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'active', label: 'Active Out' },
              { id: 'returned', label: 'Returned' },
              { id: 'cancelled', label: 'Cancelled' },
            ]}
          />

          {filteredRentals.length === 0 ? (
            <CommerceEmptyState
              icon={<Video className="w-5 h-5" />}
              title="No gear rentals found"
              description="Booked cinema cameras, lenses, lighting, and audio rentals appear here."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Rental</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Equipment</th>
                      <th className="py-3.5 px-4">Rental Window</th>
                      <th className="py-3.5 px-5 text-right">Total &amp; Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredRentals.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRentalId(r.id)}
                        className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-[#81141f]">{r.id}</div>
                          <div className="text-[11px] text-[#716769]">{r.equipmentCategory}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[13px] text-[#1b1416]">
                            {r.customerName}
                          </p>
                          <p className="text-[11px] text-[#716769]">{r.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#1b1416] max-w-[260px] truncate">
                            {r.quantity}x {r.equipmentName}
                          </p>
                          <p className="text-[11px] text-[#716769]">
                            Deposit: {formatNgn(r.depositAmount)}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1b1416]">
                            {r.startDate} → {r.endDate}
                          </div>
                          <div className="text-[11px] text-[#716769]">
                            {r.days} day{r.days === 1 ? '' : 's'}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2.5 flex-wrap justify-end">
                            <span className="font-semibold text-[13px] text-[#1b1416] mr-1">
                              {formatNgn(r.totalAmount)}
                            </span>
                            <CommerceStatusPill status={r.paymentStatus} />
                            <CommerceStatusPill status={r.rentalStatus} />
                            <RowChevron />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 2: FLEET INVENTORY
         ==================================================================== */}
      {tab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CommerceFilterPills
              value={fleetCategoryFilter}
              onChange={setFleetCategoryFilter}
              options={[
                { id: 'all', label: 'All Gear' },
                ...activeCategories.map((cat) => ({ id: cat, label: cat })),
              ]}
            />

            <select
              value={fleetStatusFilter}
              onChange={(e) =>
                setFleetStatusFilter(e.target.value as 'all' | EquipmentItem['status'])
              }
              aria-label="Filter gear by fleet status"
              className="h-9 rounded-xl border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f] w-fit"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {filteredFleet.length === 0 ? (
            <CommerceEmptyState
              icon={<Video className="w-5 h-5" />}
              title="No fleet equipment matches"
              description="Adjust your filters or add a new camera, lens, light, or audio rig to the fleet."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Equipment</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Rates</th>
                      <th className="py-3.5 px-4">Total Units</th>
                      <th className="py-3.5 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredFleet.map((eq) => (
                      <tr
                        key={eq.id}
                        onClick={() => openEditGear(eq)}
                        className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={eq.images[0] || '/photos/gallery-bz-1.jpg'}
                              alt={eq.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#eae3e4] shrink-0 bg-[#f8f5f5]"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-[13px] text-[#1b1416] truncate max-w-[280px] sm:max-w-[360px]">
                                {eq.name}
                              </p>
                              <p className="text-[11px] text-[#716769]">
                                {eq.brand} · {eq.condition}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#f8f5f5] border border-[#eae3e4] text-[11px] font-medium text-[#4a4245]">
                            {eq.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[13px] text-[#1b1416]">
                            {formatNgn(eq.dailyRate)} / day
                          </div>
                          <div className="text-[11px] text-[#716769]">
                            Deposit: {formatNgn(eq.depositAmount)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#1b1416]">
                          {eq.quantityTotal} unit{eq.quantityTotal === 1 ? '' : 's'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2.5">
                            <CommerceStatusPill status={eq.status} />
                            <RowChevron />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          DRAWER 1: RENTAL INSPECTOR
         ==================================================================== */}
      <CommerceDrawer
        open={Boolean(selectedRental)}
        onClose={() => setSelectedRentalId(null)}
        eyebrow="Gear Rental"
        title={selectedRental ? selectedRental.id : ''}
        subtitle={
          selectedRental
            ? `${selectedRental.quantity}x ${selectedRental.equipmentName}`
            : ''
        }
        footer={
          selectedRental ? (
            <>
              <span className="text-[11px] text-[#716769]">
                Ref: <strong className="font-mono">{selectedRental.reference}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedRentalId(null)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] cursor-pointer"
              >
                Close
              </button>
            </>
          ) : null
        }
      >
        {selectedRental && (
          <div className="space-y-4">
            <CommerceCustomerCard
              name={selectedRental.customerName}
              phone={selectedRental.customerPhone}
              email={selectedRental.customerEmail}
              whatsappMessage={`Hello ${selectedRental.customerName}, contacting you from BZ De Great Studio regarding gear rental ${selectedRental.id} (${selectedRental.equipmentName}).`}
            />

            {/* Rental Breakdown */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#716769]">
                <span>Rental Window</span>
                <span className="font-semibold text-[#1b1416]">
                  {selectedRental.startDate} → {selectedRental.endDate} ({selectedRental.days}d)
                </span>
              </div>
              <div className="flex items-center justify-between text-[#716769]">
                <span>
                  Rental Fee ({selectedRental.quantity} × {selectedRental.days}d ×{' '}
                  {formatNgn(selectedRental.dailyRate)})
                </span>
                <span className="font-semibold text-[#1b1416]">
                  {formatNgn(
                    selectedRental.dailyRate * selectedRental.days * selectedRental.quantity
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#716769]">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-[#1b1416]">
                  {formatNgn(selectedRental.depositAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#f0eaeb] flex items-center justify-between">
                <span className="font-bold text-[#1b1416]">Total Charged</span>
                <span className="font-serif text-base font-bold text-[#1b1416]">
                  {formatNgn(selectedRental.totalAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#f0eaeb] flex items-center gap-1.5 text-[#716769]">
                <MapPin className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
                <span>Pickup: {selectedRental.pickupLocation}</span>
              </div>
            </div>

            <CommercePaymentCard
              paymentStatus={selectedRental.paymentStatus}
              receiptUrl={selectedRental.receiptUrl}
              amount={selectedRental.totalAmount}
              paymentsLink={`/admin/payments?order=${encodeURIComponent(selectedRental.id)}`}
              verifyLabel="Verify Payment & Confirm Rental"
              onVerifyAndConfirm={() =>
                handleRentalUpdate(
                  selectedRental,
                  { paymentStatus: 'verified', rentalStatus: 'confirmed' },
                  'verified payment & confirmed rental'
                )
              }
              onChangePaymentStatus={(next) =>
                handleRentalUpdate(
                  selectedRental,
                  { paymentStatus: next },
                  `updated payment status to ${next}`
                )
              }
            />

            {/* Rental Status Steps */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769]">
                  Rental Lifecycle
                </span>
                <CommerceStatusPill status={selectedRental.rentalStatus} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RENTAL_STATUS_STEPS.map((step) => {
                  const active = selectedRental.rentalStatus === step.value;
                  return (
                    <button
                      key={step.value}
                      type="button"
                      onClick={() =>
                        handleRentalUpdate(
                          selectedRental,
                          { rentalStatus: step.value },
                          `marked rental ${step.label.toLowerCase()}`
                        )
                      }
                      className={cn(
                        'h-9 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        active
                          ? 'bg-[#81141f] border-[#81141f] text-white'
                          : 'bg-white border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]/50'
                      )}
                    >
                      {active && <CheckCircle2 className="w-3 h-3" />}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRental.notes && (
              <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
                  Pickup &amp; Inspection Notes
                </span>
                <p className="text-xs text-[#1b1416] leading-relaxed">{selectedRental.notes}</p>
              </div>
            )}
          </div>
        )}
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 2: GEAR INSPECTOR & EDITOR
         ==================================================================== */}
      <CommerceDrawer
        open={gearDrawerOpen}
        onClose={() => setGearDrawerOpen(false)}
        eyebrow={editingGearId ? 'Edit Fleet Item' : 'New Fleet Gear'}
        title={editingGearId ? eqName || 'Equipment Details' : 'Add Rental Equipment'}
        subtitle="Manage daily pricing, security deposit, and technical specifications"
        footer={
          <>
            <div>
              {editingGearId && (
                <CommerceTwoStepDelete label="Delete Gear" onConfirm={handleDeleteGear} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGearDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="gear-editor-form"
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold cursor-pointer"
              >
                {editingGearId ? 'Save Changes' : 'Add to Fleet'}
              </button>
            </div>
          </>
        }
      >
        <form id="gear-editor-form" onSubmit={handleSaveGear} className="space-y-4">
          <CommerceImageField label="Gear Photo" value={eqImage} onChange={setEqImage} />

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Equipment Name *
            </label>
            <input
              required
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              placeholder="e.g. ARRI Alexa Mini LF Package"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Category
              </label>
              <select
                value={eqCategory}
                onChange={(e) => setEqCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                {GEAR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Brand</label>
              <input
                value={eqBrand}
                onChange={(e) => setEqBrand(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Status</label>
              <select
                value={eqStatus}
                onChange={(e) => setEqStatus(e.target.value as EquipmentItem['status'])}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Daily Rate (₦)
              </label>
              <input
                type="number"
                min={0}
                value={eqDailyRate}
                onChange={(e) => setEqDailyRate(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Deposit (₦)
              </label>
              <input
                type="number"
                min={0}
                value={eqDeposit}
                onChange={(e) => setEqDeposit(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Total Units
              </label>
              <input
                type="number"
                min={1}
                value={eqUnits}
                onChange={(e) => setEqUnits(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">Condition</label>
            <input
              value={eqCondition}
              onChange={(e) => setEqCondition(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Description &amp; Included Accessories
            </label>
            <textarea
              rows={3}
              value={eqDescription}
              onChange={(e) => setEqDescription(e.target.value)}
              placeholder="Batteries, media cards, cages, hard flight case..."
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          {/* Technical Specifications */}
          <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b1416]">Technical Specs</span>
              <button
                type="button"
                onClick={() => setEqSpecs((prev) => [...prev, { key: '', value: '' }])}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#eae3e4] text-[11px] font-semibold text-[#81141f] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Spec</span>
              </button>
            </div>
            {eqSpecs.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  value={spec.key}
                  onChange={(e) =>
                    setEqSpecs((prev) =>
                      prev.map((row, i) => (i === idx ? { ...row, key: e.target.value } : row))
                    )
                  }
                  placeholder="Spec (e.g. Mount)"
                  className="col-span-4 h-8 rounded-lg border border-[#eae3e4] px-2 text-[11px] bg-white"
                />
                <input
                  value={spec.value}
                  onChange={(e) =>
                    setEqSpecs((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, value: e.target.value } : row
                      )
                    )
                  }
                  placeholder="Details"
                  className="col-span-7 h-8 rounded-lg border border-[#eae3e4] px-2 text-[11px] bg-white"
                />
                <button
                  type="button"
                  onClick={() => setEqSpecs((prev) => prev.filter((_, i) => i !== idx))}
                  className="col-span-1 flex justify-center text-[#716769] hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </form>
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 3: MANUAL RENTAL BOOKING
         ==================================================================== */}
      <CommerceDrawer
        open={rentalDrawerOpen}
        onClose={() => setRentalDrawerOpen(false)}
        eyebrow="New Gear Rental"
        title="Schedule Equipment Hire"
        subtitle="Validates date-range stock availability and deposit automatically"
        widthClass="max-w-lg"
        footer={
          <>
            <div className="text-xs">
              {rentalPreviewCalc?.ok ? (
                <span className="font-bold text-[#1b1416]">
                  Total: {formatNgn(rentalPreviewCalc.totalAmount)}{' '}
                  <span className="font-normal text-[#716769]">
                    (incl. {formatNgn(rentalPreviewCalc.depositAmount)} deposit)
                  </span>
                </span>
              ) : (
                <span className="text-rose-600 font-medium">{rentalPreviewCalc?.error}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRentalDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="manual-rental-form"
                disabled={!rentalPreviewCalc?.ok}
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                Create Rental
              </button>
            </div>
          </>
        }
      >
        <form id="manual-rental-form" onSubmit={handleCreateManualRental} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Select Equipment *
            </label>
            <select
              value={selectedRentalEquipment?.id || ''}
              onChange={(e) => setRnEquipmentId(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            >
              {availableEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({formatNgn(eq.dailyRate)}/day)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={rnStartDate}
                onChange={(e) => setRnStartDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-2.5 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={rnEndDate}
                onChange={(e) => setRnEndDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-2.5 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Qty *</label>
              <input
                type="number"
                min={1}
                value={rnQty}
                onChange={(e) => setRnQty(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Client Name *
              </label>
              <input
                required
                value={rnName}
                onChange={(e) => setRnName(e.target.value)}
                placeholder="Full name"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Phone *
              </label>
              <input
                required
                value={rnPhone}
                onChange={(e) => setRnPhone(e.target.value)}
                placeholder="+234 800 ..."
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">Email</label>
              <input
                type="email"
                value={rnEmail}
                onChange={(e) => setRnEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Pickup Desk
              </label>
              <input
                value={rnPickup}
                onChange={(e) => setRnPickup(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              ID Verification / Notes
            </label>
            <textarea
              rows={2}
              value={rnNotes}
              onChange={(e) => setRnNotes(e.target.value)}
              placeholder="NIN check, production details, or accessories notes..."
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>
        </form>
      </CommerceDrawer>
    </div>
  );
}
