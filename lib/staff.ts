import {
  AdminRole,
  AdminSectionId,
  Booking,
  BranchOffice,
  Listing,
  ListingCategory,
  StaffAccount,
} from './types';
import { inferStateFromLocation, matchesLocationFilter } from './locations';

export interface AdminIdentityLike {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  assignedStates: string[];
  allowedCategories: ListingCategory[];
  allowedModules: AdminSectionId[];
  branchOffice?: string;
  canDeleteListings?: boolean;
  requireApprovalBeforeLive?: boolean;
}

export const ALL_ADMIN_MODULES: AdminSectionId[] = [
  'overview',
  'listings',
  'bookings',
  'marketplace',
  'studio',
  'equipment',
  'events',
  'payments',
  'customers',
  'website_content',
  'reports',
  'activity_log',
  'team',
];

export const ALL_LISTING_CATEGORIES: ListingCategory[] = [
  'car_sale',
  'car_rent',
  'property_rent',
  'property_sale',
];

export const ROLE_DEFAULT_MODULES: Record<AdminRole, AdminSectionId[]> = {
  'Master Admin': ALL_ADMIN_MODULES,
  'Regional Admin': ['overview', 'listings', 'bookings'],
  'Stand Uploader': ['overview', 'listings'],
};

export const BRANCH_OFFICES: BranchOffice[] = [
  {
    id: 'br-onitsha-hq',
    name: 'Head Office (Anambra)',
    state: 'Anambra State',
    city: 'Onitsha',
    address: 'Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State',
    phone: '+234 704 753 1433',
    managerName: 'Ifeanyi Obi',
    handles: 'Properties · Land · Head Office Inquiries',
  },
  {
    id: 'br-awka-stand',
    name: 'Awka Car Stand (Anambra)',
    state: 'Anambra State',
    city: 'Awka',
    address: 'Aroma Junction Auto Plaza, Enugu-Onitsha Exp, Awka, Anambra State',
    phone: '+234 803 441 9012',
    managerName: 'Chinedu Okafor',
    handles: 'Car Sales · Stand Inspections',
  },
  {
    id: 'br-asaba-delta',
    name: 'Delta Branch Office & Stand',
    state: 'Delta State',
    city: 'Asaba',
    address: 'Opp. Solar House, Beside NTA, Okpanam Road, Asaba, Delta State',
    phone: '+234 806 218 4410',
    managerName: 'Emeka Nnamdi',
    handles: 'Car Sales · Car Rentals · Houses & Land',
  },
  {
    id: 'br-owerri-imo',
    name: 'Imo Car Stand (Owerri)',
    state: 'Imo State',
    city: 'Owerri',
    address: 'Port Harcourt Road / New Owerri Auto Hub, Owerri, Imo State',
    phone: '+234 703 881 2004',
    managerName: 'Uche Nwosu',
    handles: 'Car Sales · Partner Stand Inventory',
  },
  {
    id: 'br-enugu-office',
    name: 'Enugu Regional Office',
    state: 'Enugu State',
    city: 'Enugu',
    address: 'Suite 4, Independence Layout Commercial Desk, Enugu State',
    phone: '+234 812 553 7781',
    managerName: 'Adaeze Eze',
    handles: 'Car Rentals · House Rentals & Viewings',
  },
  {
    id: 'br-lagos-office',
    name: 'Lagos Executive Office',
    state: 'Lagos State',
    city: 'Lagos',
    address: 'No. 2 Thomas Estate, Ajah, Lagos State',
    phone: '+234 704 753 1433',
    managerName: 'BZ Executive Desk',
    handles: 'Car Sales · Rentals · Island & Mainland Homes',
  },
  {
    id: 'br-abuja-office',
    name: 'Abuja FCT Operations Desk',
    state: 'FCT Abuja',
    city: 'Abuja',
    address: 'STEM PARK, Ochacho Junction, After Nyzamie Hospital, Karmo, Abuja',
    phone: '+234 704 753 1433',
    managerName: 'Abuja Fleet & Property Desk',
    handles: 'Car Rentals · Sales · Diplomatic Properties',
  },
];

export function computeInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BZ';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const DEFAULT_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'ADM-001',
    name: 'Administrator',
    email: 'admin@bzgroup.com',
    phone: '+234 704 753 1433',
    password: 'admin2026',
    role: 'Master Admin',
    assignedStates: ['ALL'],
    allowedCategories: ALL_LISTING_CATEGORIES,
    allowedModules: ALL_ADMIN_MODULES,
    branchOffice: 'Nationwide Executive HQ (Lagos)',
    branchAddress: 'No. 2 Thomas Estate, Ajah, Lagos State',
    isActive: true,
    requireApprovalBeforeLive: false,
    canDeleteListings: true,
    avatarInitials: 'AD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'STF-AWKA-01',
    name: 'Chinedu Okafor',
    email: 'awka@bzdegreat.com',
    phone: '+234 803 441 9012',
    password: 'bzawka2026',
    role: 'Stand Uploader',
    assignedStates: ['Anambra State'],
    allowedCategories: ['car_sale'],
    allowedModules: ['overview', 'listings'],
    branchOffice: 'Awka Car Stand — Aroma Junction',
    branchAddress: 'Aroma Junction Auto Plaza, Awka, Anambra State',
    isActive: true,
    requireApprovalBeforeLive: false,
    canDeleteListings: false,
    avatarInitials: 'CO',
    createdAt: '2026-11-16T08:00:00.000Z',
  },
  {
    id: 'STF-ASABA-01',
    name: 'Emeka Nnamdi',
    email: 'asaba@bzdegreat.com',
    phone: '+234 806 218 4410',
    password: 'bzasaba2026',
    role: 'Regional Admin',
    assignedStates: ['Delta State'],
    allowedCategories: ['car_sale', 'car_rent', 'property_rent', 'property_sale'],
    allowedModules: ['overview', 'listings', 'bookings'],
    branchOffice: 'Asaba Office & Car Stand (Delta)',
    branchAddress: 'Opp. Solar House, Beside NTA, Okpanam Road, Asaba',
    isActive: true,
    requireApprovalBeforeLive: false,
    canDeleteListings: false,
    avatarInitials: 'EN',
    createdAt: '2026-11-16T08:05:00.000Z',
  },
  {
    id: 'STF-OWERRI-01',
    name: 'Uche Nwosu',
    email: 'owerri@bzdegreat.com',
    phone: '+234 703 881 2004',
    password: 'bzowerri2026',
    role: 'Stand Uploader',
    assignedStates: ['Imo State'],
    allowedCategories: ['car_sale'],
    allowedModules: ['overview', 'listings'],
    branchOffice: 'New Owerri Partner Car Lot',
    branchAddress: 'Port Harcourt Road / New Owerri Auto Hub, Imo State',
    isActive: true,
    requireApprovalBeforeLive: false,
    canDeleteListings: false,
    avatarInitials: 'UN',
    createdAt: '2026-11-16T08:10:00.000Z',
  },
  {
    id: 'STF-ENUGU-01',
    name: 'Adaeze Eze',
    email: 'enugu@bzdegreat.com',
    phone: '+234 812 553 7781',
    password: 'bzenugu2026',
    role: 'Regional Admin',
    assignedStates: ['Enugu State'],
    allowedCategories: ['car_rent', 'property_rent', 'property_sale'],
    allowedModules: ['overview', 'listings', 'bookings'],
    branchOffice: 'Enugu Regional Office',
    branchAddress: 'Suite 4, Independence Layout Commercial Desk, Enugu State',
    isActive: true,
    requireApprovalBeforeLive: false,
    canDeleteListings: false,
    avatarInitials: 'AE',
    createdAt: '2026-11-16T08:15:00.000Z',
  },
];

export function isMasterAdmin(user?: AdminIdentityLike | null): boolean {
  if (!user) return false;
  return user.role === 'Master Admin' || user.assignedStates.includes('ALL');
}

export function canAccessAdminModule(
  user: AdminIdentityLike | null | undefined,
  moduleId: AdminSectionId
): boolean {
  if (!user) return false;
  if (isMasterAdmin(user)) return true;
  return user.allowedModules.includes(moduleId);
}

export function getFirstAllowedAdminRoute(user?: AdminIdentityLike | null): string {
  if (!user) return '/admin/login';
  if (isMasterAdmin(user)) return '/admin';
  if (user.allowedModules.includes('overview')) return '/admin';
  if (user.allowedModules.includes('listings')) return '/admin/listings';
  if (user.allowedModules.includes('bookings')) return '/admin/bookings';
  return '/admin';
}

export function getListingState(listing: Pick<Listing, 'state' | 'location'>): string {
  return (listing.state && listing.state.trim()) || inferStateFromLocation(listing.location);
}

export function matchesAssignedStates(
  targetStateOrLocation: string,
  assignedStates: string[]
): boolean {
  if (!assignedStates || assignedStates.length === 0) return false;
  if (assignedStates.includes('ALL')) return true;
  return assignedStates.some(
    state =>
      state.toLowerCase() === targetStateOrLocation.toLowerCase() ||
      matchesLocationFilter(targetStateOrLocation, state)
  );
}

export function canManageListing(
  user: AdminIdentityLike | null | undefined,
  listing: Pick<Listing, 'category' | 'state' | 'location'>
): boolean {
  if (!user) return false;
  if (isMasterAdmin(user)) return true;
  const catAllowed = user.allowedCategories.includes(listing.category);
  if (!catAllowed) return false;
  const listingState = getListingState(listing);
  return (
    matchesAssignedStates(listingState, user.assignedStates) ||
    matchesAssignedStates(listing.location, user.assignedStates)
  );
}

export function getBookingState(
  booking: Pick<Booking, 'branchState' | 'pickupLocation' | 'listingId'>,
  listingsById?: Map<string, Listing>
): string {
  if (booking.branchState && booking.branchState.trim()) return booking.branchState;
  const linked = booking.listingId ? listingsById?.get(booking.listingId) : undefined;
  if (linked) return getListingState(linked);
  if (booking.pickupLocation) return inferStateFromLocation(booking.pickupLocation);
  return 'FCT Abuja';
}

export function canManageBooking(
  user: AdminIdentityLike | null | undefined,
  booking: Pick<Booking, 'branchState' | 'pickupLocation' | 'listingId'>,
  listingsById?: Map<string, Listing>
): boolean {
  if (!user) return false;
  if (isMasterAdmin(user)) return true;
  if (!canAccessAdminModule(user, 'bookings')) return false;
  const st = getBookingState(booking, listingsById);
  return (
    matchesAssignedStates(st, user.assignedStates) ||
    (booking.pickupLocation ? matchesAssignedStates(booking.pickupLocation, user.assignedStates) : false)
  );
}

export function findBranchForState(stateOrLocation?: string): BranchOffice | undefined {
  if (!stateOrLocation) return undefined;
  const canonical = inferStateFromLocation(stateOrLocation);
  const low = stateOrLocation.toLowerCase();
  return (
    BRANCH_OFFICES.find(b => low.includes(b.city.toLowerCase())) ||
    BRANCH_OFFICES.find(b => b.state.toLowerCase() === canonical.toLowerCase()) ||
    BRANCH_OFFICES.find(b => matchesLocationFilter(stateOrLocation, b.state))
  );
}

/**
 * Determines if a listing should appear publicly across the storefront.
 * Sold, rented, reserved, draft, and archived items are immediately hidden.
 */
export function isListingLive(listing?: Pick<Listing, 'status'> | null): boolean {
  return Boolean(listing && listing.status === 'published');
}

export function formatCategoryLabel(cat: ListingCategory): string {
  switch (cat) {
    case 'car_sale':
      return 'Car Sales';
    case 'car_rent':
      return 'Car Rentals';
    case 'property_rent':
      return 'House Rentals';
    case 'property_sale':
      return 'Property & Land Sales';
  }
}
