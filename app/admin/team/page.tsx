'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  MapPin,
  Copy,
  Check,
  Trash2,
  UserPlus,
  KeyRound,
  Building2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import { NIGERIA_STATES } from '@/lib/locations';
import {
  ALL_LISTING_CATEGORIES,
  BRANCH_OFFICES,
  ROLE_DEFAULT_MODULES,
  formatCategoryLabel,
  getListingState,
  matchesAssignedStates,
} from '@/lib/staff';
import {
  AdminRole,
  AdminSectionId,
  ListingCategory,
  StaffAccount,
} from '@/lib/types';
import { cn } from '@/lib/utils';

type FilterTab = 'All' | 'Stand Uploader' | 'Regional Admin' | 'Suspended';

export default function AdminTeamPage() {
  const {
    staffAccounts,
    listings,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state (create or edit partner)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('Stand Uploader');
  const [assignedStates, setAssignedStates] = useState<string[]>(['Anambra State']);
  const [branchOffice, setBranchOffice] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [allowedCategories, setAllowedCategories] = useState<ListingCategory[]>(['car_sale']);
  const [allowBookings, setAllowBookings] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  const resetFormToNew = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('bzpartner2026');
    setRole('Stand Uploader');
    setAssignedStates(['Anambra State']);
    setBranchOffice('');
    setBranchAddress('');
    setAllowedCategories(['car_sale']);
    setAllowBookings(false);
    setRequireApproval(false);
  };

  const loadAccountIntoEditor = (acc: StaffAccount) => {
    setEditingId(acc.id);
    setName(acc.name);
    setEmail(acc.email);
    setPhone(acc.phone);
    setPassword(acc.password);
    setRole(acc.role);
    setAssignedStates(acc.assignedStates);
    setBranchOffice(acc.branchOffice);
    setBranchAddress(acc.branchAddress || '');
    setAllowedCategories(acc.allowedCategories);
    setAllowBookings(acc.allowedModules.includes('bookings'));
    setRequireApproval(Boolean(acc.requireApprovalBeforeLive));
  };

  const toggleStateSelection = (stateValue: string) => {
    if (assignedStates.includes('ALL')) {
      setAssignedStates([stateValue]);
      return;
    }
    setAssignedStates(prev =>
      prev.includes(stateValue)
        ? prev.length > 1
          ? prev.filter(s => s !== stateValue)
          : prev
        : [...prev, stateValue]
    );
  };

  const toggleCategoryPermission = (cat: ListingCategory) => {
    setAllowedCategories(prev =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter(c => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Missing details',
        description: 'Name, login email, and password are required.',
        variant: 'error',
      });
      return;
    }

    const duplicate = staffAccounts.find(
      s => s.email.toLowerCase() === email.trim().toLowerCase() && s.id !== editingId
    );
    if (duplicate) {
      toast({
        title: 'Email already assigned',
        description: `${email} is already used by ${duplicate.name}.`,
        variant: 'error',
      });
      return;
    }

    const computedModules: AdminSectionId[] =
      role === 'Master Admin'
        ? ROLE_DEFAULT_MODULES['Master Admin']
        : allowBookings
          ? ['overview', 'listings', 'bookings']
          : ['overview', 'listings'];

    const resolvedOffice =
      branchOffice.trim() ||
      `${assignedStates[0]?.replace(' State', '') || 'Branch'} Partner Desk`;

    if (editingId) {
      await updateStaffAccount(editingId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        role,
        assignedStates: role === 'Master Admin' ? ['ALL'] : assignedStates,
        allowedCategories: role === 'Master Admin' ? ALL_LISTING_CATEGORIES : allowedCategories,
        allowedModules: computedModules,
        branchOffice: resolvedOffice,
        branchAddress: branchAddress.trim() || undefined,
        requireApprovalBeforeLive: requireApproval,
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `updated access permissions for ${name.trim()} (${assignedStates.join(', ')})`,
        target: resolvedOffice,
        category: 'team',
      });

      toast({
        title: 'Partner permissions updated',
        description: `${name.trim()} is now scoped to ${assignedStates.join(', ')}.`,
        variant: 'success',
      });
    } else {
      const created = await addStaffAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+234',
        password: password.trim(),
        role,
        assignedStates: role === 'Master Admin' ? ['ALL'] : assignedStates,
        allowedCategories: role === 'Master Admin' ? ALL_LISTING_CATEGORIES : allowedCategories,
        allowedModules: computedModules,
        branchOffice: resolvedOffice,
        branchAddress: branchAddress.trim() || undefined,
        isActive: true,
        requireApprovalBeforeLive: requireApproval,
        canDeleteListings: role === 'Master Admin',
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `created ${role} account for ${created.name} (${created.assignedStates.join(', ')})`,
        target: created.branchOffice,
        category: 'team',
      });

      toast({
        title: 'Partner / Staff account created',
        description: `${created.name} can now log in and upload listings for ${created.assignedStates.join(', ')}.`,
        variant: 'success',
      });
      loadAccountIntoEditor(created);
    }
  };

  const handleToggleActive = async (acc: StaffAccount) => {
    if (acc.id === 'ADM-001' || acc.role === 'Master Admin') return;
    const next = !acc.isActive;
    await updateStaffAccount(acc.id, { isActive: next });
    await addActivity({
      actorName: user?.name || 'Master Admin',
      actorRole: 'Master Admin',
      action: `${next ? 're-activated' : 'suspended'} branch access for ${acc.name}`,
      target: acc.branchOffice,
      category: 'team',
    });
    toast({
      title: next ? 'Partner access restored' : 'Partner access suspended',
      description: `${acc.name} (${acc.assignedStates.join(', ')})`,
      variant: next ? 'success' : 'default',
    });
  };

  const handleCopyCredentials = async (acc: StaffAccount) => {
    const snippet = `BZ Group Staff Portal Login\nURL: ${typeof window !== 'undefined' ? window.location.origin : ''}/admin/login\nEmail: ${acc.email}\nPassword: ${acc.password}\nBranch: ${acc.branchOffice}\nStates: ${acc.assignedStates.join(', ')}`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(acc.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Login details copied',
        description: `Ready to paste and send to ${acc.name} on WhatsApp.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: `${acc.email}`,
        description: `Password: ${acc.password}`,
        variant: 'default',
      });
    }
  };

  const handleDelete = async (acc: StaffAccount) => {
    if (acc.id === 'ADM-001' || acc.role === 'Master Admin') return;
    if (!confirm(`Remove "${acc.name}" (${acc.branchOffice}) from staff access?`)) return;
    await deleteStaffAccount(acc.id);
    if (editingId === acc.id) resetFormToNew();
    toast({
      title: 'Staff account removed',
      description: `${acc.name} can no longer sign in.`,
      variant: 'default',
    });
  };

  const counts = useMemo(() => {
    return {
      all: staffAccounts.length,
      uploaders: staffAccounts.filter(s => s.role === 'Stand Uploader').length,
      regional: staffAccounts.filter(s => s.role === 'Regional Admin').length,
      suspended: staffAccounts.filter(s => !s.isActive).length,
    };
  }, [staffAccounts]);

  const filteredAccounts = useMemo(() => {
    return staffAccounts.filter(acc => {
      if (filterTab === 'Stand Uploader' && acc.role !== 'Stand Uploader') return false;
      if (filterTab === 'Regional Admin' && acc.role !== 'Regional Admin') return false;
      if (filterTab === 'Suspended' && acc.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          acc.name.toLowerCase().includes(q) ||
          acc.email.toLowerCase().includes(q) ||
          acc.branchOffice.toLowerCase().includes(q) ||
          acc.assignedStates.some(s => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [staffAccounts, filterTab, searchQuery]);

  const statsForAccount = (acc: StaffAccount) => {
    if (acc.assignedStates.includes('ALL')) {
      return {
        live: listings.filter(l => l.status === 'published').length,
        sold: listings.filter(l => l.status === 'sold').length,
      };
    }
    const scoped = listings.filter(
      l =>
        matchesAssignedStates(getListingState(l), acc.assignedStates) &&
        acc.allowedCategories.includes(l.category)
    );
    return {
      live: scoped.filter(l => l.status === 'published').length,
      sold: scoped.filter(l => l.status === 'sold').length,
    };
  };

  const TOP_BRANCH_STATES = [
    'Anambra State',
    'Delta State',
    'Imo State',
    'Enugu State',
    'Lagos State',
    'FCT Abuja',
    'Rivers State',
    'Abia State',
    'Oyo State',
    'Edo State',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#81141f] mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin Control</span>
          </div>
          <h1 className="font-serif text-[30px] font-bold text-[#1b1416] tracking-tight">
            Team &amp; Branch Access
          </h1>
          <p className="text-[13px] text-[#716769]">
            Create accounts for partners and car-stand boys across Asaba, Awka, Owerri, Enugu, and other states with scoped state and section permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFormToNew}
          className="h-[42px] px-4 rounded-[10px] bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Partner / Stand Boy</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'All' as const, label: `All · ${counts.all}` },
            { id: 'Stand Uploader' as const, label: `Car-Stand Uploaders · ${counts.uploaders}` },
            { id: 'Regional Admin' as const, label: `Regional Office Admins · ${counts.regional}` },
            { id: 'Suspended' as const, label: `Suspended · ${counts.suspended}` },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                'h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer',
                filterTab === tab.id
                  ? 'bg-[#81141f] text-white shadow-2xs'
                  : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#81141f] hover:text-[#81141f]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, state, stand..."
            className="w-full h-[38px] pl-8 pr-3 bg-white border border-[#eae3e4] rounded-[8px] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
          />
        </div>
      </div>

      {/* Main Split Grid: Roster + Editor */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Staff Roster */}
        <div className="xl:col-span-7 bg-white rounded-[16px] border border-[#eae3e4] shadow-xs overflow-hidden divide-y divide-[#eae3e4]">
          {filteredAccounts.map(acc => {
            const stats = statsForAccount(acc);
            const isSelected = editingId === acc.id;
            const isMaster = acc.role === 'Master Admin' || acc.id === 'ADM-001';

            return (
              <div
                key={acc.id}
                onClick={() => loadAccountIntoEditor(acc)}
                className={cn(
                  'p-4 sm:p-5 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  isSelected ? 'bg-[#fbf3f4]' : 'hover:bg-[#fdfbfb]'
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#4e0b13] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {acc.avatarInitials}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1b1416]">{acc.name}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                          isMaster
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : acc.role === 'Regional Admin'
                              ? 'bg-[#fbf3f4] text-[#81141f] border-[#ebc7cb]'
                              : 'bg-stone-100 text-[#4a4245] border-[#eae3e4]'
                        )}
                      >
                        {acc.role}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          acc.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        )}
                      >
                        {acc.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    <div className="text-[12px] text-[#716769]">
                      {acc.email} · {acc.phone}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f8f5f5] border border-[#eae3e4] text-[11px] font-semibold text-[#1b1416]">
                        <MapPin className="w-3 h-3 text-[#81141f]" />
                        {acc.assignedStates.includes('ALL')
                          ? 'All Nigeria'
                          : acc.assignedStates.join(', ')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fbf3f4] border border-[#ebc7cb] text-[11px] font-semibold text-[#81141f]">
                        {acc.branchOffice}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#716769]">
                      Sections:{' '}
                      <span className="font-medium text-[#4a4245]">
                        {acc.allowedCategories.map(formatCategoryLabel).join(' · ')}
                      </span>{' '}
                      · <strong>{stats.live}</strong> live, <strong>{stats.sold}</strong> sold
                    </div>
                  </div>
                </div>

                {/* Quick Controls */}
                <div
                  className="flex items-center gap-2.5 shrink-0 self-end sm:self-center"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(acc)}
                    className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white hover:border-[#81141f] text-[11px] font-semibold text-[#1b1416] inline-flex items-center gap-1 cursor-pointer"
                    title="Copy portal email & password for WhatsApp"
                  >
                    {copiedId === acc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#81141f]" />
                    )}
                    <span>{copiedId === acc.id ? 'Copied' : 'Copy Login'}</span>
                  </button>

                  {!isMaster && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(acc)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                          acc.isActive ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
                        )}
                        aria-label={`Toggle access for ${acc.name}`}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition',
                            acc.isActive ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(acc)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove partner access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAccounts.length === 0 && (
            <div className="p-10 text-center text-sm text-[#716769]">
              No staff accounts match your current filter.
            </div>
          )}
        </div>

        {/* Right: Create / Edit Partner Panel */}
        <form
          onSubmit={handleSavePartner}
          className="xl:col-span-5 bg-white rounded-[16px] border border-[#eae3e4] p-5 sm:p-6 shadow-xs space-y-4 sticky top-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#eae3e4]">
            <div>
              <h2 className="text-[17px] font-bold text-[#1b1416] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#81141f]" />
                <span>{editingId ? 'Edit Partner Permissions' : 'New Partner / Car-Stand Login'}</span>
              </h2>
              <p className="text-[11px] text-[#716769] mt-0.5">
                Lock login to specific Nigerian state(s) &amp; product/rental sections.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetFormToNew}
                className="text-xs font-semibold text-[#81141f] hover:underline cursor-pointer"
              >
                + New
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#716769]">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chinedu Okafor"
                className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-medium focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#716769]">Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+234 803..."
                className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-medium focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#716769]">Portal Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="stand@bzdegreat.com"
                disabled={editingId === 'ADM-001'}
                className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-medium focus:outline-none focus:border-[#81141f] disabled:bg-stone-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#716769] flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Login Password *</span>
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Set password"
                className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-mono focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          {editingId !== 'ADM-001' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#716769]">Account Role</label>
                  <select
                    value={role}
                    onChange={e => {
                      const nextRole = e.target.value as AdminRole;
                      setRole(nextRole);
                      if (nextRole === 'Regional Admin') {
                        setAllowBookings(true);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] bg-white text-xs font-semibold focus:outline-none focus:border-[#81141f]"
                  >
                    <option value="Stand Uploader">Stand Uploader (Cars / Stand)</option>
                    <option value="Regional Admin">Regional Admin (State Office)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#716769] flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Car Stand / Office Name</span>
                  </label>
                  <input
                    type="text"
                    value={branchOffice}
                    onChange={e => setBranchOffice(e.target.value)}
                    placeholder="e.g. Awka Car Stand · Aroma"
                    className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-medium focus:outline-none focus:border-[#81141f]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#716769]">Office / Lot Address (Optional)</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                  placeholder="Street or landmark where customers attend inspections"
                  className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-xs font-medium focus:outline-none focus:border-[#81141f]"
                />
              </div>

              {/* Assigned Nigerian State(s) */}
              <div className="space-y-2 p-3 rounded-xl bg-[#f8f5f5] border border-[#eae3e4]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#716769]">
                    Assigned State(s) ({assignedStates.length})
                  </span>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) toggleStateSelection(e.target.value);
                    }}
                    className="h-7 px-2 rounded border border-[#eae3e4] bg-white text-[11px] font-semibold text-[#1b1416]"
                  >
                    <option value="">+ Add any state...</option>
                    {NIGERIA_STATES.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set([...TOP_BRANCH_STATES, ...assignedStates])).map(st => {
                    const selected = assignedStates.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStateSelection(st)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border',
                          selected
                            ? 'bg-[#81141f] text-white border-[#81141f]'
                            : 'bg-white text-[#4a4245] border-[#eae3e4] hover:border-[#81141f]'
                        )}
                      >
                        {st.replace(' State', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allowed Sections Checkboxes */}
              <div className="space-y-2 p-3 rounded-xl bg-[#f8f5f5] border border-[#eae3e4]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#716769] block">
                  Allowed Sections &amp; Permissions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_LISTING_CATEGORIES.map(cat => {
                    const checked = allowedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-2 text-xs font-semibold text-[#1b1416] bg-white px-2.5 py-2 rounded-lg border border-[#eae3e4] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategoryPermission(cat)}
                          className="accent-[#81141f] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{formatCategoryLabel(cat)}</span>
                      </label>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#1b1416] bg-white px-2.5 py-2 rounded-lg border border-[#eae3e4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowBookings}
                    onChange={e => setAllowBookings(e.target.checked)}
                    className="accent-[#81141f] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Can handle local Rental &amp; House Viewing bookings in their state(s)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#1b1416] bg-white px-2.5 py-2 rounded-lg border border-[#eae3e4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={e => setRequireApproval(e.target.checked)}
                    className="accent-[#81141f] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Hold uploads for Master Admin approval before going live</span>
                </label>

                <div className="text-[11px] text-[#716769] pt-0.5">
                  Payments, Financial Reports, Customers &amp; Website CMS stay strictly hidden for non-Master roles.
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {editingId ? 'Save Partner Permissions' : 'Create Partner Login'}
          </button>

          {/* Branch Directory quick reference */}
          <div className="pt-2 border-t border-[#eae3e4]">
            <p className="text-[11px] font-bold text-[#716769] mb-1.5">
              Registered Regional Desks ({BRANCH_OFFICES.length})
            </p>
            <div className="text-[11px] text-[#716769] space-y-1 max-h-28 overflow-y-auto pr-1">
              {BRANCH_OFFICES.map(b => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1b1416] truncate">{b.name}</span>
                  <span className="shrink-0">{b.managerName}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
