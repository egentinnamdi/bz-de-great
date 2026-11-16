'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminRowsSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/toast-provider';
import { NIGERIA_STATES } from '@/lib/locations';
import {
  ALL_LISTING_CATEGORIES,
  ROLE_DEFAULT_MODULES,
  findBranchForState,
  formatCategoryLabel,
  getListingState,
  isListingLive,
  matchesAssignedStates,
} from '@/lib/staff';
import {
  AdminRole,
  AdminSectionId,
  BranchOffice,
  ListingCategory,
  StaffAccount,
} from '@/lib/types';
import { cn, formatPhoneForWhatsApp } from '@/lib/utils';

type FilterTab = 'All' | 'Stand Uploader' | 'Regional Admin' | 'Suspended';
type BranchFilterTab = 'All' | 'Active' | 'Inactive';
type DirectoryViewTab = 'partners' | 'branches';

const BRANCH_SERVICE_CHIPS = [
  'Car Sales',
  'Car Rentals',
  'House Rentals',
  'Property & Land',
  'Stand Inspections',
];

const HUB_STATE_VALUES = [
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

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none',
        checked ? 'bg-[#81141f]' : 'bg-[#d8d0d1]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}

interface PermissionToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function PermissionToggleRow({
  title,
  description,
  checked,
  onChange,
}: PermissionToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[#1b1416]">{title}</div>
        <div className="text-[11px] text-[#716769] leading-snug mt-0.5">{description}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export default function AdminTeamPage() {
  const {
    staffAccounts,
    branchOffices,
    listings,
    isLoading,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    addBranchOffice,
    updateBranchOffice,
    deleteBranchOffice,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<DirectoryViewTab>('partners');
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [branchFilterTab, setBranchFilterTab] = useState<BranchFilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Slide-over drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Branch CRUD slide-over drawer
  const [branchDrawerOpen, setBranchDrawerOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [confirmDeleteBranchId, setConfirmDeleteBranchId] = useState<string | null>(null);
  const [brName, setBrName] = useState('');
  const [brState, setBrState] = useState('Anambra State');
  const [brCity, setBrCity] = useState('');
  const [brAddress, setBrAddress] = useState('');
  const [brPhone, setBrPhone] = useState('');
  const [brManagerName, setBrManagerName] = useState('');
  const [brHandles, setBrHandles] = useState('');
  const [brIsActive, setBrIsActive] = useState(true);

  // Partner drawer form state
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
  const [canDeleteListings, setCanDeleteListings] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'branches') {
        setActiveView('branches');
      }
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setBranchDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const populateForm = (acc: StaffAccount) => {
    setEditingId(acc.id);
    setConfirmDeleteId(null);
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
    setCanDeleteListings(Boolean(acc.canDeleteListings));
  };

  const openNewPartnerDrawer = (presetBranch?: BranchOffice) => {
    setEditingId(null);
    setConfirmDeleteId(null);
    setShowPassword(true);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('bzpartner2026');
    setRole('Stand Uploader');
    setAssignedStates([presetBranch?.state || 'Anambra State']);
    setBranchOffice(presetBranch?.name || '');
    setBranchAddress(presetBranch?.address || '');
    setAllowedCategories(['car_sale']);
    setAllowBookings(false);
    setRequireApproval(false);
    setCanDeleteListings(false);
    setBranchDrawerOpen(false);
    setDrawerOpen(true);
  };

  const openNewBranchDrawer = () => {
    setEditingBranchId(null);
    setConfirmDeleteBranchId(null);
    setBrName('');
    setBrState('Anambra State');
    setBrCity('');
    setBrAddress('');
    setBrPhone('+234 704 753 1433');
    setBrManagerName('');
    setBrHandles('Car Sales · Stand Inspections');
    setBrIsActive(true);
    setDrawerOpen(false);
    setBranchDrawerOpen(true);
  };

  const openEditBranchDrawer = (branch: BranchOffice) => {
    setEditingBranchId(branch.id);
    setConfirmDeleteBranchId(null);
    setBrName(branch.name);
    setBrState(branch.state);
    setBrCity(branch.city);
    setBrAddress(branch.address);
    setBrPhone(branch.phone);
    setBrManagerName(branch.managerName);
    setBrHandles(branch.handles);
    setBrIsActive(branch.isActive !== false);
    setDrawerOpen(false);
    setBranchDrawerOpen(true);
  };

  const openEditDrawer = (acc: StaffAccount) => {
    populateForm(acc);
    setShowPassword(false);
    setDrawerOpen(true);
  };

  const applyRolePreset = (nextRole: AdminRole) => {
    setRole(nextRole);
    if (nextRole === 'Regional Admin') {
      setAllowBookings(true);
      if (allowedCategories.length === 1 && allowedCategories[0] === 'car_sale') {
        setAllowedCategories(['car_sale', 'car_rent', 'property_rent', 'property_sale']);
      }
    } else if (nextRole === 'Stand Uploader') {
      setAllowBookings(false);
    }
  };

  const addState = (stateValue: string) => {
    if (!stateValue) return;
    if (assignedStates.includes('ALL')) {
      setAssignedStates([stateValue]);
      return;
    }
    if (!assignedStates.includes(stateValue)) {
      setAssignedStates(prev => [...prev, stateValue]);
    }
  };

  const removeState = (stateValue: string) => {
    setAssignedStates(prev => (prev.length > 1 ? prev.filter(s => s !== stateValue) : prev));
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

  const fillBranchFromState = () => {
    const primaryState = assignedStates[0];
    if (!primaryState) return;
    const match = findBranchForState(primaryState, branchOffices);
    if (match) {
      setBranchOffice(match.name);
      setBranchAddress(match.address);
    }
  };

  const applyRegisteredBranchPreset = (branchId: string) => {
    const selected = branchOffices.find(b => b.id === branchId);
    if (!selected) return;
    if (!assignedStates.includes(selected.state)) {
      setAssignedStates(prev =>
        prev.includes('ALL') ? [selected.state] : [...prev.filter(Boolean), selected.state]
      );
    }
    setBranchOffice(selected.name);
    setBranchAddress(selected.address);
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

    const isMasterRecord = editingId === 'ADM-001' || role === 'Master Admin';
    const computedModules: AdminSectionId[] = isMasterRecord
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
        assignedStates: isMasterRecord ? ['ALL'] : assignedStates,
        allowedCategories: isMasterRecord ? ALL_LISTING_CATEGORIES : allowedCategories,
        allowedModules: computedModules,
        branchOffice: resolvedOffice,
        branchAddress: branchAddress.trim() || undefined,
        requireApprovalBeforeLive: isMasterRecord ? false : requireApproval,
        canDeleteListings: isMasterRecord ? true : canDeleteListings,
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `updated access permissions for ${name.trim()} (${isMasterRecord ? 'All Nigeria' : assignedStates.join(', ')})`,
        target: resolvedOffice,
        category: 'team',
      });

      toast({
        title: 'Changes saved',
        description: `${name.trim()} permissions updated.`,
        variant: 'success',
      });
      setDrawerOpen(false);
    } else {
      const created = await addStaffAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+234',
        password: password.trim(),
        role,
        assignedStates: isMasterRecord ? ['ALL'] : assignedStates,
        allowedCategories: isMasterRecord ? ALL_LISTING_CATEGORIES : allowedCategories,
        allowedModules: computedModules,
        branchOffice: resolvedOffice,
        branchAddress: branchAddress.trim() || undefined,
        isActive: true,
        requireApprovalBeforeLive: requireApproval,
        canDeleteListings,
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `created ${role} account for ${created.name} (${created.assignedStates.join(', ')})`,
        target: created.branchOffice,
        category: 'team',
      });

      toast({
        title: 'Partner login created',
        description: `${created.name} can now upload for ${created.assignedStates.join(', ')}.`,
        variant: 'success',
      });
      setDrawerOpen(false);
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
      title: next ? 'Access restored' : 'Access suspended',
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
        title: 'Login copied',
        description: `Ready to share with ${acc.name} on WhatsApp.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: acc.email,
        description: `Password: ${acc.password}`,
        variant: 'default',
      });
    }
  };

  const handleConfirmDelete = async (acc: StaffAccount) => {
    if (acc.id === 'ADM-001' || acc.role === 'Master Admin') return;
    await deleteStaffAccount(acc.id);
    setConfirmDeleteId(null);
    setDrawerOpen(false);
    toast({
      title: 'Partner removed',
      description: `${acc.name} can no longer sign in.`,
      variant: 'default',
    });
  };

  const toggleBranchServiceChip = (label: string) => {
    const tokens = brHandles
      .split('·')
      .map(t => t.trim())
      .filter(Boolean);
    const exists = tokens.some(t => t.toLowerCase() === label.toLowerCase());
    const next = exists
      ? tokens.filter(t => t.toLowerCase() !== label.toLowerCase())
      : [...tokens, label];
    setBrHandles(next.join(' · '));
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim() || !brState.trim() || !brCity.trim() || !brAddress.trim()) {
      toast({
        title: 'Missing branch details',
        description: 'Branch name, state, city, and address are required.',
        variant: 'error',
      });
      return;
    }

    const duplicate = branchOffices.find(
      b => b.name.toLowerCase() === brName.trim().toLowerCase() && b.id !== editingBranchId
    );
    if (duplicate) {
      toast({
        title: 'Branch name already exists',
        description: `"${duplicate.name}" is already registered in ${duplicate.state}.`,
        variant: 'error',
      });
      return;
    }

    if (editingBranchId) {
      await updateBranchOffice(editingBranchId, {
        name: brName.trim(),
        state: brState.trim(),
        city: brCity.trim(),
        address: brAddress.trim(),
        phone: brPhone.trim(),
        managerName: brManagerName.trim() || 'Branch Operations Desk',
        handles: brHandles.trim() || 'Car Sales · Property Inquiries',
        isActive: brIsActive,
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `updated branch office "${brName.trim()}" (${brCity.trim()}, ${brState.replace(/ State$/i, '')})`,
        target: brName.trim(),
        category: 'team',
      });

      toast({
        title: 'Branch updated',
        description: `${brName.trim()} changes saved.`,
        variant: 'success',
      });
      setBranchDrawerOpen(false);
    } else {
      const created = await addBranchOffice({
        name: brName.trim(),
        state: brState.trim(),
        city: brCity.trim(),
        address: brAddress.trim(),
        phone: brPhone.trim() || '+234 704 753 1433',
        managerName: brManagerName.trim() || 'Branch Operations Desk',
        handles: brHandles.trim() || 'Car Sales · Property Inquiries',
        isActive: brIsActive,
      });

      await addActivity({
        actorName: user?.name || 'Master Admin',
        actorRole: 'Master Admin',
        action: `added new branch "${created.name}" in ${created.city}, ${created.state.replace(/ State$/i, '')}`,
        target: created.name,
        category: 'team',
      });

      toast({
        title: 'Branch created',
        description: `${created.name} is now available for listings and partner assignments.`,
        variant: 'success',
      });
      setBranchDrawerOpen(false);
    }
  };

  const handleToggleBranchActive = async (branch: BranchOffice) => {
    const next = branch.isActive === false;
    await updateBranchOffice(branch.id, { isActive: next });
    await addActivity({
      actorName: user?.name || 'Master Admin',
      actorRole: 'Master Admin',
      action: `${next ? 'activated' : 'deactivated'} branch "${branch.name}"`,
      target: branch.name,
      category: 'team',
    });
    toast({
      title: next ? 'Branch activated' : 'Branch paused',
      description: `${branch.name} (${branch.city})`,
      variant: next ? 'success' : 'default',
    });
  };

  const handleConfirmDeleteBranch = async (branch: BranchOffice) => {
    await deleteBranchOffice(branch.id);
    setConfirmDeleteBranchId(null);
    setBranchDrawerOpen(false);
    await addActivity({
      actorName: user?.name || 'Master Admin',
      actorRole: 'Master Admin',
      action: `removed branch "${branch.name}" (${branch.city}, ${branch.state.replace(/ State$/i, '')})`,
      target: branch.name,
      category: 'team',
    });
    toast({
      title: 'Branch removed',
      description: `${branch.name} has been deleted from the directory.`,
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

  const branchCounts = useMemo(() => {
    return {
      all: branchOffices.length,
      active: branchOffices.filter(b => b.isActive !== false).length,
      inactive: branchOffices.filter(b => b.isActive === false).length,
    };
  }, [branchOffices]);

  const filteredBranches = useMemo(() => {
    return branchOffices.filter(br => {
      const isBrActive = br.isActive !== false;
      if (branchFilterTab === 'Active' && !isBrActive) return false;
      if (branchFilterTab === 'Inactive' && isBrActive) return false;
      if (branchSearchQuery.trim()) {
        const q = branchSearchQuery.toLowerCase();
        return (
          br.name.toLowerCase().includes(q) ||
          br.city.toLowerCase().includes(q) ||
          br.state.toLowerCase().includes(q) ||
          br.address.toLowerCase().includes(q) ||
          br.managerName.toLowerCase().includes(q) ||
          br.handles.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [branchOffices, branchFilterTab, branchSearchQuery]);

  const statsForBranch = (branch: BranchOffice) => {
    const scoped = listings.filter(l =>
      matchesAssignedStates(getListingState(l), [branch.state])
    );
    const reps = staffAccounts.filter(
      s => s.isActive && s.role !== 'Master Admin' && matchesAssignedStates(branch.state, s.assignedStates)
    );
    return {
      live: scoped.filter(l => isListingLive(l)).length,
      sold: scoped.filter(l => l.status === 'sold' || l.status === 'rented').length,
      repsCount: reps.length,
    };
  };

  const editingBranch = useMemo(
    () => (editingBranchId ? branchOffices.find(b => b.id === editingBranchId) || null : null),
    [editingBranchId, branchOffices]
  );

  const hubStateOptions = useMemo(
    () => NIGERIA_STATES.filter(s => HUB_STATE_VALUES.includes(s.value)),
    []
  );
  const otherStateOptions = useMemo(
    () => NIGERIA_STATES.filter(s => !HUB_STATE_VALUES.includes(s.value)),
    []
  );

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
        live: listings.filter(l => isListingLive(l)).length,
        sold: listings.filter(l => l.status === 'sold' || l.status === 'rented').length,
      };
    }
    const scoped = listings.filter(
      l =>
        matchesAssignedStates(getListingState(l), acc.assignedStates) &&
        acc.allowedCategories.includes(l.category)
    );
    return {
      live: scoped.filter(l => isListingLive(l)).length,
      sold: scoped.filter(l => l.status === 'sold' || l.status === 'rented').length,
    };
  };

  const editingAccount = useMemo(
    () => (editingId ? staffAccounts.find(s => s.id === editingId) || null : null),
    [editingId, staffAccounts]
  );

  const isEditingMaster = editingAccount?.id === 'ADM-001' || editingAccount?.role === 'Master Admin';

  const unselectedHubStates = useMemo(
    () => NIGERIA_STATES.filter(s => HUB_STATE_VALUES.includes(s.value) && !assignedStates.includes(s.value)),
    [assignedStates]
  );
  const unselectedOtherStates = useMemo(
    () => NIGERIA_STATES.filter(s => !HUB_STATE_VALUES.includes(s.value) && !assignedStates.includes(s.value)),
    [assignedStates]
  );

  const formatStateSummary = (states: string[]) => {
    if (states.includes('ALL')) return 'All Nigeria';
    const clean = states.map(s => s.replace(/ State$/i, ''));
    return clean.length <= 2 ? clean.join(', ') : `${clean.slice(0, 2).join(', ')} +${clean.length - 2}`;
  };

  const formatCategorySummary = (cats: ListingCategory[]) => {
    if (cats.length === ALL_LISTING_CATEGORIES.length) return 'All sections';
    if (cats.length === 1) return formatCategoryLabel(cats[0]);
    return `${cats.slice(0, 2).map(formatCategoryLabel).join(' · ')}${cats.length > 2 ? ` +${cats.length - 2}` : ''}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Calm Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#81141f]">
            Team &amp; Branches
          </p>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1b1416] tracking-tight mt-0.5">
            Branch Access
          </h1>
          <p className="text-[13px] text-[#716769] mt-0.5">
            Assign state territories and upload scopes for regional offices and car stands.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-[#f4eff0] border border-[#eae3e4]">
            <button
              type="button"
              onClick={() => setActiveView('partners')}
              className={cn(
                'h-8 px-3 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                activeView === 'partners'
                  ? 'bg-white text-[#1b1416] shadow-2xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              )}
            >
              Partners ({staffAccounts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('branches')}
              className={cn(
                'h-8 px-3 rounded-lg text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                activeView === 'branches'
                  ? 'bg-white text-[#1b1416] shadow-2xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              )}
            >
              <Building2 className="w-3.5 h-3.5 text-[#81141f] shrink-0" />
              <span>Branches ({branchOffices.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => (activeView === 'branches' ? openNewBranchDrawer() : openNewPartnerDrawer())}
            className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2] shrink-0" />
            <span>{activeView === 'branches' ? 'Add Branch' : 'Add Partner'}</span>
          </button>
        </div>
      </div>

      {activeView === 'partners' ? (
        <>
          {/* Minimal Filter Strip — Partners */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#eae3e4] pb-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'All' as const, label: 'All', count: counts.all },
                { id: 'Stand Uploader' as const, label: 'Stand Uploaders', count: counts.uploaders },
                { id: 'Regional Admin' as const, label: 'Regional Admins', count: counts.regional },
                { id: 'Suspended' as const, label: 'Suspended', count: counts.suspended },
              ].map(tab => {
                const active = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id)}
                    className={cn(
                      'h-9 px-3 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer',
                      active
                        ? 'bg-[#1b1416] text-white'
                        : 'text-[#716769] hover:text-[#1b1416] hover:bg-[#f6f3f4]'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'text-[11px] px-1.5 py-0.2 rounded-full',
                        active ? 'bg-white/15 text-white' : 'bg-[#f1ecec] text-[#716769]'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-[#8c8082] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search partner, state or stand..."
                className="w-full h-9 pl-8 pr-3 bg-white border border-[#eae3e4] rounded-lg text-[13px] text-[#1b1416] placeholder:text-[#a09597] focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          {/* Sleek Single-Surface Partner Roster */}
          <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
        {/* Widescreen Column Labels (xl: where full 4 columns have comfortable room) */}
        <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)_225px] gap-5 px-5 py-2.5 bg-[#faf8f8] border-b border-[#eae3e4] text-[11px] font-semibold uppercase tracking-wider text-[#8c8082]">
          <div>Partner</div>
          <div>Role &amp; Stand</div>
          <div>Scope &amp; Stock</div>
          <div className="text-right">Status</div>
        </div>

        <div className="divide-y divide-[#f0eaeb]">
          {isLoading ? (
            <AdminRowsSkeleton rows={4} />
          ) : (
          <>
          {filteredAccounts.map(acc => {
            const stats = statsForAccount(acc);
            const isMaster = acc.role === 'Master Admin' || acc.id === 'ADM-001';

            return (
              <div
                key={acc.id}
                onClick={() => openEditDrawer(acc)}
                className="px-4 sm:px-5 py-3.5 hover:bg-[#fcf9fa] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)_225px] xl:gap-5"
              >
                {/* Col 1: Identity (plus compact secondary metadata for < xl viewports) */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0',
                      isMaster
                        ? 'bg-[#1b1416] text-white'
                        : 'bg-[#f8eced] text-[#81141f]'
                    )}
                  >
                    {acc.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[14px] font-semibold text-[#1b1416] truncate">
                        {acc.name}
                      </span>
                      <span className="xl:hidden text-[11px] font-medium text-[#716769]">
                        · {acc.role}
                      </span>
                      {acc.requireApprovalBeforeLive && !isMaster && (
                        <span
                          title="Uploads require Master Admin approval"
                          className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                        />
                      )}
                    </div>
                    <div className="text-[12px] text-[#716769] truncate">
                      {acc.email}
                    </div>
                    {/* Compact inline summary visible below xl so nothing gets squeezed into overlapping grid columns */}
                    <div className="xl:hidden mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#716769]">
                      <span className="inline-flex items-center gap-1 text-[#4a4245]">
                        <MapPin className="w-3 h-3 text-[#81141f] shrink-0" />
                        <span>
                          {formatStateSummary(acc.assignedStates)} · {acc.branchOffice}
                        </span>
                      </span>
                      <span className="text-[#c9bfc1]">•</span>
                      <span>
                        {formatCategorySummary(acc.allowedCategories)}
                        {acc.allowedModules.includes('bookings') && !isMaster ? ' · Bookings' : ''}
                      </span>
                      <span className="text-[#c9bfc1]">•</span>
                      <span>
                        <strong className="font-medium text-[#1b1416]">{stats.live}</strong> live,{' '}
                        <strong className="font-medium text-[#1b1416]">{stats.sold}</strong> sold
                      </span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Role & Branch (xl+ desktop table view) */}
                <div className="hidden xl:block min-w-0">
                  <div className="text-[13px] font-medium text-[#1b1416] truncate">
                    {acc.role}
                  </div>
                  <div className="text-[12px] text-[#716769] truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#81141f] shrink-0" />
                    <span className="truncate">
                      {formatStateSummary(acc.assignedStates)} · {acc.branchOffice}
                    </span>
                  </div>
                </div>

                {/* Col 3: Scope & Inventory (xl+ desktop table view) */}
                <div className="hidden xl:block min-w-0">
                  <div className="text-[13px] font-medium text-[#1b1416] truncate">
                    {formatCategorySummary(acc.allowedCategories)}
                    {acc.allowedModules.includes('bookings') && !isMaster ? ' · Bookings' : ''}
                  </div>
                  <div className="text-[12px] text-[#716769] mt-0.5">
                    <span className="text-[#1b1416] font-medium">{stats.live}</span> live ·{' '}
                    <span>{stats.sold}</span> sold
                  </div>
                </div>

                {/* Col 4: Status & Fast Actions */}
                <div
                  className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-[50px] sm:pl-0"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => openEditDrawer(acc)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4245] hover:text-[#1b1416] whitespace-nowrap cursor-pointer"
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        acc.isActive ? 'bg-emerald-500' : 'bg-stone-300'
                      )}
                    />
                    <span>{acc.isActive ? 'Active' : 'Suspended'}</span>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(acc)}
                      title="Copy portal email & password"
                      className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white hover:border-[#81141f] text-[11px] font-medium text-[#4a4245] hover:text-[#1b1416] inline-flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {copiedId === acc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#81141f]" />
                      )}
                      <span>{copiedId === acc.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    {!isMaster && (
                      <ToggleSwitch
                        checked={acc.isActive}
                        onChange={() => handleToggleActive(acc)}
                        label={`Toggle access for ${acc.name}`}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => openEditDrawer(acc)}
                      aria-label={`Manage ${acc.name}`}
                      className="p-1 text-[#a09597] hover:text-[#1b1416] cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAccounts.length === 0 && (
            <div className="px-6 py-12 text-center space-y-2">
              <p className="text-[14px] font-medium text-[#1b1416]">No matching accounts</p>
              <p className="text-[12px] text-[#716769]">
                Clear your search filter or add a new branch partner.
              </p>
            </div>
          )}
          </>
          )}
        </div>
      </div>
        </>
      ) : (
        <>
          {/* Minimal Filter Strip — Branches */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#eae3e4] pb-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'All' as const, label: 'All Branches', count: branchCounts.all },
                { id: 'Active' as const, label: 'Active', count: branchCounts.active },
                { id: 'Inactive' as const, label: 'Paused', count: branchCounts.inactive },
              ].map(tab => {
                const active = branchFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBranchFilterTab(tab.id)}
                    className={cn(
                      'h-9 px-3 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer',
                      active
                        ? 'bg-[#1b1416] text-white'
                        : 'text-[#716769] hover:text-[#1b1416] hover:bg-[#f6f3f4]'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'text-[11px] px-1.5 py-0.2 rounded-full',
                        active ? 'bg-white/15 text-white' : 'bg-[#f1ecec] text-[#716769]'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-[#8c8082] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={branchSearchQuery}
                onChange={e => setBranchSearchQuery(e.target.value)}
                placeholder="Search branch, city, state or lead..."
                className="w-full h-9 pl-8 pr-3 bg-white border border-[#eae3e4] rounded-lg text-[13px] text-[#1b1416] placeholder:text-[#a09597] focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          {/* Sleek Single-Surface Branch Directory */}
          <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
            <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_225px] gap-5 px-5 py-2.5 bg-[#faf8f8] border-b border-[#eae3e4] text-[11px] font-semibold uppercase tracking-wider text-[#8c8082]">
              <div>Branch &amp; Address</div>
              <div>Territory &amp; Lead</div>
              <div>Handles &amp; Stock</div>
              <div className="text-right">Status</div>
            </div>

            <div className="divide-y divide-[#f0eaeb]">
              {isLoading ? (
                <AdminRowsSkeleton rows={4} />
              ) : (
                <>
                  {filteredBranches.map(branch => {
                    const bStats = statsForBranch(branch);
                    const isBrActive = branch.isActive !== false;
                    const shortState = branch.state.replace(/ State$/i, '');

                    return (
                      <div
                        key={branch.id}
                        onClick={() => openEditBranchDrawer(branch)}
                        className="px-4 sm:px-5 py-3.5 hover:bg-[#fcf9fa] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_225px] xl:gap-5"
                      >
                        {/* Col 1: Branch Name & Address */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#f8eced] text-[#81141f] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-[14px] font-semibold text-[#1b1416] truncate">
                                {branch.name}
                              </span>
                              <span className="xl:hidden text-[11px] font-medium text-[#716769]">
                                · {branch.city}, {shortState}
                              </span>
                            </div>
                            <div className="text-[12px] text-[#716769] truncate">
                              {branch.address}
                            </div>

                            {/* Compact summary below xl */}
                            <div className="xl:hidden mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#716769]">
                              <span>
                                Lead: <strong className="font-medium text-[#1b1416]">{branch.managerName || 'Unassigned'}</strong>
                              </span>
                              {branch.phone && (
                                <>
                                  <span className="text-[#c9bfc1]">•</span>
                                  <span>{branch.phone}</span>
                                </>
                              )}
                              <span className="text-[#c9bfc1]">•</span>
                              <span>
                                <strong className="font-medium text-[#1b1416]">{bStats.live}</strong> live ·{' '}
                                <strong className="font-medium text-[#1b1416]">{bStats.repsCount}</strong>{' '}
                                {bStats.repsCount === 1 ? 'rep' : 'reps'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: Location & Desk Lead (xl+) */}
                        <div className="hidden xl:block min-w-0">
                          <div className="text-[13px] font-medium text-[#1b1416] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#81141f] shrink-0" />
                            <span className="truncate">
                              {branch.city}, {shortState}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#716769] truncate mt-0.5">
                            {branch.managerName || 'Operations Desk'}
                            {branch.phone ? ` · ${branch.phone}` : ''}
                          </div>
                        </div>

                        {/* Col 3: Handles & Inventory (xl+) */}
                        <div className="hidden xl:block min-w-0">
                          <div className="text-[13px] font-medium text-[#1b1416] truncate">
                            {branch.handles || 'General branch operations'}
                          </div>
                          <div className="text-[12px] text-[#716769] mt-0.5">
                            <span className="text-[#1b1416] font-medium">{bStats.live}</span> live ·{' '}
                            <span>{bStats.sold}</span> sold ·{' '}
                            <span>
                              {bStats.repsCount} {bStats.repsCount === 1 ? 'rep' : 'reps'}
                            </span>
                          </div>
                        </div>

                        {/* Col 4: Status & Fast Actions */}
                        <div
                          className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-[50px] sm:pl-0"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEditBranchDrawer(branch)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4245] hover:text-[#1b1416] whitespace-nowrap cursor-pointer"
                          >
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full shrink-0',
                                isBrActive ? 'bg-emerald-500' : 'bg-stone-300'
                              )}
                            />
                            <span>{isBrActive ? 'Active' : 'Paused'}</span>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => openNewPartnerDrawer(branch)}
                              title={`Create partner login for ${branch.name}`}
                              className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white hover:border-[#81141f] text-[11px] font-medium text-[#4a4245] hover:text-[#1b1416] inline-flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3 text-[#81141f]" />
                              <span>Rep</span>
                            </button>

                            <ToggleSwitch
                              checked={isBrActive}
                              onChange={() => handleToggleBranchActive(branch)}
                              label={`Toggle active status for ${branch.name}`}
                            />

                            <button
                              type="button"
                              onClick={() => openEditBranchDrawer(branch)}
                              aria-label={`Edit ${branch.name}`}
                              className="p-1 text-[#a09597] hover:text-[#1b1416] cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredBranches.length === 0 && (
                    <div className="px-6 py-12 text-center space-y-3">
                      <p className="text-[14px] font-medium text-[#1b1416]">No matching branches</p>
                      <p className="text-[12px] text-[#716769]">
                        Clear your search filter or register a new car stand or regional desk.
                      </p>
                      <button
                        type="button"
                        onClick={openNewBranchDrawer}
                        className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Branch</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ====================================================================
          SLIDE-OVER ACCOUNT INSPECTOR & EDITOR DRAWER
         ==================================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <form
            onSubmit={handleSavePartner}
            className="relative z-10 w-full max-w-[520px] h-full bg-white shadow-2xl border-l border-[#eae3e4] flex flex-col animate-in slide-in-from-right duration-200"
          >
            {/* Sticky Drawer Header */}
            <div className="px-6 py-4 border-b border-[#eae3e4] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full font-semibold text-xs flex items-center justify-center shrink-0',
                    isEditingMaster ? 'bg-[#1b1416] text-white' : 'bg-[#f8eced] text-[#81141f]'
                  )}
                >
                  {editingAccount ? editingAccount.avatarInitials : <Plus className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-bold text-[#1b1416] truncate">
                    {editingAccount ? editingAccount.name : 'New Partner Login'}
                  </h2>
                  <p className="text-[12px] text-[#716769] truncate">
                    {editingAccount
                      ? `${editingAccount.role} · ${formatStateSummary(editingAccount.assignedStates)}`
                      : 'Lock access to a Nigerian state and stand section'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingAccount && (
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(editingAccount)}
                    className="h-8 px-3 rounded-lg border border-[#eae3e4] hover:border-[#81141f] text-[12px] font-medium text-[#1b1416] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === editingAccount.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#81141f]" />
                    )}
                    <span>{copiedId === editingAccount.id ? 'Copied' : 'Copy Login'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close drawer"
                  className="w-8 h-8 rounded-lg hover:bg-[#f6f3f4] text-[#716769] hover:text-[#1b1416] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Critical Quick Metrics for Existing Accounts */}
              {editingAccount && (() => {
                const liveStats = statsForAccount(editingAccount);
                const cleanWa = formatPhoneForWhatsApp(editingAccount.phone);
                return (
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb]">
                      <div className="text-[11px] text-[#716769]">Live Units</div>
                      <div className="text-[18px] font-bold text-[#1b1416] mt-0.5">
                        {liveStats.live}
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb]">
                      <div className="text-[11px] text-[#716769]">Sold / Rented</div>
                      <div className="text-[18px] font-bold text-[#1b1416] mt-0.5">
                        {liveStats.sold}
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb] flex flex-col justify-between">
                      <div className="text-[11px] text-[#716769]">Contact</div>
                      {cleanWa ? (
                        <a
                          href={`https://wa.me/${cleanWa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-semibold text-[#81141f] hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[12px] text-[#716769] mt-1">No phone</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Role Preset (non-Master) */}
              {!isEditingMaster && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#716769]">
                    Access Level
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'Stand Uploader' as const,
                        title: 'Stand Uploader',
                        hint: 'Uploads photos & marks items sold. No bookings or money tabs.',
                      },
                      {
                        id: 'Regional Admin' as const,
                        title: 'Regional Admin',
                        hint: 'Full state inventory + handles inspections & rental bookings.',
                      },
                    ].map(preset => {
                      const active = role === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyRolePreset(preset.id)}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all cursor-pointer',
                            active
                              ? 'border-[#81141f] bg-[#fcf5f6]'
                              : 'border-[#eae3e4] bg-white hover:border-[#cbbec0]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-[#1b1416]">
                              {preset.title}
                            </span>
                            {active && <Check className="w-3.5 h-3.5 text-[#81141f]" />}
                          </div>
                          <p className="text-[11px] text-[#716769] leading-snug mt-1">
                            {preset.hint}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Identity & Credentials */}
              <div className="space-y-3 pt-1 border-t border-[#f0eaeb]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#716769] pt-2">
                  Identity &amp; Portal Login
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 803..."
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">Portal Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="stand@bzdegreat.com"
                      disabled={editingAccount?.id === 'ADM-001'}
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f] disabled:bg-[#faf8f8] disabled:text-[#716769]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245] flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#716769]" />
                      <span>Password *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Set password"
                        className="w-full h-10 pl-3 pr-9 rounded-lg border border-[#eae3e4] text-[13px] font-mono text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c8082] hover:text-[#1b1416] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Territory & Branch Location */}
              {!isEditingMaster && (
                <div className="space-y-3.5 pt-2 border-t border-[#f0eaeb]">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716769]">
                      Territory &amp; Branch Stand
                    </span>
                    {findBranchForState(assignedStates[0], branchOffices) && (
                      <button
                        type="button"
                        onClick={fillBranchFromState}
                        className="text-[11px] font-semibold text-[#81141f] hover:underline cursor-pointer"
                      >
                        Use {assignedStates[0]?.replace(' State', '')} office address
                      </button>
                    )}
                  </div>

                  {branchOffices.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#4a4245]">
                        Quick-Fill from Registered Branch (Optional)
                      </label>
                      <select
                        value=""
                        onChange={e => applyRegisteredBranchPreset(e.target.value)}
                        aria-label="Pick registered branch"
                        className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] bg-white text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      >
                        <option value="">Select a registered branch to auto-fill...</option>
                        {branchOffices.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} — {b.city}, {b.state.replace(/ State$/i, '')}
                            {b.isActive === false ? ' (Paused)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Assigned States (selected chips + clean Add State dropdown) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-[#4a4245]">
                        Assigned State(s)
                      </span>
                      <select
                        value=""
                        onChange={e => addState(e.target.value)}
                        aria-label="Add state to territory"
                        className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white text-[12px] font-medium text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      >
                        <option value="">+ Add state...</option>
                        {unselectedHubStates.length > 0 && (
                          <optgroup label="Key Branch Hubs">
                            {unselectedHubStates.map(s => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="All Nigerian States">
                          {unselectedOtherStates.map(s => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {assignedStates.map(st => (
                        <span
                          key={st}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-[#fcf3f4] border border-[#ebc7cb] text-[12px] font-semibold text-[#81141f]"
                        >
                          <span>{st.replace(/ State$/i, '')}</span>
                          {assignedStates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeState(st)}
                              aria-label={`Remove ${st}`}
                              className="hover:text-[#1b1416] cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#4a4245]">
                        Car Stand / Office Name
                      </label>
                      <input
                        type="text"
                        value={branchOffice}
                        onChange={e => setBranchOffice(e.target.value)}
                        placeholder="e.g. Awka Car Stand — Aroma Junction"
                        className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#4a4245]">
                        Inspection Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={branchAddress}
                        onChange={e => setBranchAddress(e.target.value)}
                        placeholder="Landmark where walk-in clients inspect cars or homes"
                        className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sections & Safeguards */}
              {!isEditingMaster && (
                <div className="space-y-4 pt-2 border-t border-[#f0eaeb]">
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716769] block">
                      Allowed Sections
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_LISTING_CATEGORIES.map(cat => {
                        const checked = allowedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategoryPermission(cat)}
                            className={cn(
                              'h-10 px-3 rounded-lg border text-[12px] font-medium flex items-center justify-between transition-colors cursor-pointer',
                              checked
                                ? 'border-[#81141f] bg-[#fcf5f6] text-[#81141f]'
                                : 'border-[#eae3e4] bg-white text-[#4a4245] hover:border-[#cbbec0]'
                            )}
                          >
                            <span>{formatCategoryLabel(cat)}</span>
                            <span
                              className={cn(
                                'w-4 h-4 rounded flex items-center justify-center border text-[10px]',
                                checked
                                  ? 'bg-[#81141f] border-[#81141f] text-white'
                                  : 'border-[#d6cdcf]'
                              )}
                            >
                              {checked && <Check className="w-3 h-3" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="divide-y divide-[#f0eaeb] pt-1">
                    <PermissionToggleRow
                      title="Bookings & Inspections"
                      description="View and confirm rental & inspection bookings in their state(s)"
                      checked={allowBookings}
                      onChange={setAllowBookings}
                    />
                    <PermissionToggleRow
                      title="Require HQ Approval"
                      description="Hold new uploads as drafts until Master Admin approves them live"
                      checked={requireApproval}
                      onChange={setRequireApproval}
                    />
                    <PermissionToggleRow
                      title="Permanent Delete Access"
                      description="Allow deleting records instead of only marking them Sold or Rented"
                      checked={canDeleteListings}
                      onChange={setCanDeleteListings}
                    />
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-[#716769] bg-[#faf8f8] rounded-xl px-3.5 py-2.5 border border-[#f0eaeb]">
                    <Lock className="w-3.5 h-3.5 text-[#81141f] shrink-0 mt-0.5" />
                    <span>
                      Payments, financial reports, customers, and website CMS remain hidden for all partner accounts.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-6 py-4 border-t border-[#eae3e4] bg-[#faf8f8] flex items-center justify-between gap-3 shrink-0">
              <div>
                {editingAccount && !isEditingMaster && (
                  confirmDeleteId === editingAccount.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(editingAccount)}
                        className="h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold cursor-pointer"
                      >
                        Confirm Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[12px] text-[#716769] hover:text-[#1b1416] cursor-pointer"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(editingAccount.id)}
                      className="h-9 px-2.5 rounded-lg text-[12px] font-medium text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-10 px-4 rounded-xl border border-[#eae3e4] bg-white hover:bg-[#f6f3f4] text-[13px] font-medium text-[#4a4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {editingAccount ? 'Save Changes' : 'Create Login'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          SLIDE-OVER BRANCH INSPECTOR & EDITOR DRAWER (FULL CRUD)
         ==================================================================== */}
      {branchDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
            onClick={() => setBranchDrawerOpen(false)}
          />

          <form
            onSubmit={handleSaveBranch}
            className="relative z-10 w-full max-w-[520px] h-full bg-white shadow-2xl border-l border-[#eae3e4] flex flex-col animate-in slide-in-from-right duration-200"
          >
            {/* Sticky Drawer Header */}
            <div className="px-6 py-4 border-b border-[#eae3e4] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#f8eced] text-[#81141f] flex items-center justify-center shrink-0">
                  {editingBranch ? <Building2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-bold text-[#1b1416] truncate">
                    {editingBranch ? editingBranch.name : 'New Branch Office'}
                  </h2>
                  <p className="text-[12px] text-[#716769] truncate">
                    {editingBranch
                      ? `${editingBranch.city}, ${editingBranch.state.replace(/ State$/i, '')}`
                      : 'Register a regional desk, car stand or inspection hub'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBranchDrawerOpen(false)}
                aria-label="Close branch drawer"
                className="w-8 h-8 rounded-lg hover:bg-[#f6f3f4] text-[#716769] hover:text-[#1b1416] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {editingBranch && (() => {
                const bStats = statsForBranch(editingBranch);
                const cleanWa = formatPhoneForWhatsApp(editingBranch.phone);
                return (
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb]">
                      <div className="text-[11px] text-[#716769]">Live Units</div>
                      <div className="text-[18px] font-bold text-[#1b1416] mt-0.5">
                        {bStats.live}
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb]">
                      <div className="text-[11px] text-[#716769]">Active Reps</div>
                      <div className="text-[18px] font-bold text-[#1b1416] mt-0.5">
                        {bStats.repsCount}
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f8] border border-[#f0eaeb] flex flex-col justify-between">
                      <div className="text-[11px] text-[#716769]">Contact</div>
                      {cleanWa ? (
                        <a
                          href={`https://wa.me/${cleanWa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-semibold text-[#81141f] hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[12px] text-[#716769] mt-1">No phone</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Branch Identity & Location */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#716769]">
                  Branch Identity &amp; Location
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#4a4245]">
                    Branch / Car Stand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={brName}
                    onChange={e => setBrName(e.target.value)}
                    placeholder="e.g. Awka Car Stand (Anambra)"
                    className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">
                      Nigerian State *
                    </label>
                    <select
                      value={brState}
                      onChange={e => setBrState(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] bg-white text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    >
                      <optgroup label="Key Branch Hubs">
                        {hubStateOptions.map(s => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="All Nigerian States">
                        {otherStateOptions.map(s => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={brCity}
                      onChange={e => setBrCity(e.target.value)}
                      placeholder="e.g. Awka, Asaba, Lekki"
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#4a4245]">
                    Street / Inspection Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={brAddress}
                    onChange={e => setBrAddress(e.target.value)}
                    placeholder="Full landmark address for walk-in inspections & pickups"
                    className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                </div>
              </div>

              {/* Operations & Desk Lead */}
              <div className="space-y-3 pt-2 border-t border-[#f0eaeb]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#716769] pt-2">
                  Desk Lead &amp; Operations
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">
                      Desk Lead / Manager
                    </label>
                    <input
                      type="text"
                      value={brManagerName}
                      onChange={e => setBrManagerName(e.target.value)}
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#4a4245]">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={brPhone}
                      onChange={e => setBrPhone(e.target.value)}
                      placeholder="+234 803..."
                      className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#4a4245] block">
                    Services Handled
                  </label>
                  <input
                    type="text"
                    value={brHandles}
                    onChange={e => setBrHandles(e.target.value)}
                    placeholder="e.g. Car Sales · Rentals · Property Inspections"
                    className="w-full h-10 px-3 rounded-lg border border-[#eae3e4] text-[13px] text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {BRANCH_SERVICE_CHIPS.map(chip => {
                      const active = brHandles.toLowerCase().includes(chip.toLowerCase());
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => toggleBranchServiceChip(chip)}
                          className={cn(
                            'h-7 px-2.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer',
                            active
                              ? 'border-[#81141f] bg-[#fcf3f4] text-[#81141f]'
                              : 'border-[#eae3e4] bg-white text-[#716769] hover:border-[#cbbec0]'
                          )}
                        >
                          {active ? `✓ ${chip}` : `+ ${chip}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f0eaeb]">
                  <PermissionToggleRow
                    title="Active Branch"
                    description="Include this branch in booking assignment & stand quick-pickers"
                    checked={brIsActive}
                    onChange={setBrIsActive}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-6 py-4 border-t border-[#eae3e4] bg-[#faf8f8] flex items-center justify-between gap-3 shrink-0">
              <div>
                {editingBranch && (
                  confirmDeleteBranchId === editingBranch.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteBranch(editingBranch)}
                        className="h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold cursor-pointer"
                      >
                        Confirm Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBranchId(null)}
                        className="text-[12px] text-[#716769] hover:text-[#1b1416] cursor-pointer"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteBranchId(editingBranch.id)}
                      className="h-9 px-2.5 rounded-lg text-[12px] font-medium text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setBranchDrawerOpen(false)}
                  className="h-10 px-4 rounded-xl border border-[#eae3e4] bg-white hover:bg-[#f6f3f4] text-[13px] font-medium text-[#4a4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
