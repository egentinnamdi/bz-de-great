export type ListingCategory = 'car_rent' | 'car_sale' | 'property_rent' | 'property_sale';

export interface VehicleSpecs {
  make: string;
  model: string;
  year: number;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid';
  driverOption: 'Self-drive' | 'Chauffeured' | 'Both';
  mileage?: string;
  engine?: string;
  color?: string;
}

export interface PropertySpecs {
  type: 'House' | 'Apartment' | 'Duplex' | 'Land & plots';
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  serviced?: boolean;
  furnished?: boolean;
  titleDocument?: string; // e.g. "C of O", "Governor's Consent", "R of O"
  amenities: string[];
}

export interface Listing {
  id: string;
  category: ListingCategory;
  title: string;
  subtitle?: string;
  slug: string;
  description: string;
  price: number; // e.g. daily rent rate or full sale price
  currency: 'NGN' | 'USD';
  pricePeriod?: '/day' | '/month' | '/year' | 'total';
  location: string;
  images: string[];
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  vehicleSpecs?: VehicleSpecs;
  propertySpecs?: PropertySpecs;
  tags?: string[];
  createdAt: string;
}

export interface RmbRateConfig {
  payRmbRate: number; // e.g. ¥1 = ₦205.00
  payNairaRate: number; // e.g. ¥1 = ₦215.40
  updatedAt: string;
  updatedBy: string;
}

export interface RmbExchangeRequest {
  id: string; // e.g. "RMB-0142"
  reference?: string;
  direction: 'rmb_to_naira' | 'naira_to_rmb';
  sourceAmount: number;
  rateApplied: number;
  destinationAmount: number;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  destinationChannel?: string;
  destinationAccountDetails?: string;
  senderBank?: string;
  senderAccountName?: string;
  notes?: string;
  receiptUrl?: string;
  status: 'requested' | 'account_sent' | 'receipt_received' | 'approved' | 'paid_out' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string; // e.g. "BK-2292", "INS-0318", "TD-0091"
  reference?: string;
  type: 'car_rental' | 'car_test_drive' | 'property_inspection';
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string;
  endDate?: string;
  driverOption?: 'Self-drive' | 'Chauffeured';
  pickupLocation?: string;
  totalAmount?: number;
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  bookingStatus: 'requested' | 'confirmed' | 'active' | 'returned' | 'declined' | 'rescheduled';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneFull?: string;
  initials?: string;
  location: string;
  uses?: 'RMB' | 'Cars' | 'Property';
  bookingsCount?: number;
  totalBookings: number;
  rmbSentDisplay?: string;
  totalSpentDisplay?: string;
  lifetimeSpendNgn: number;
  joinedAt: string;
  lastActive?: string;
  isVip?: boolean;
  status: 'active' | 'vip' | 'inactive';
  notes?: string;
}

export interface StaffActivity {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId?: string;
  target?: string;
  details?: string;
  timestamp: string;
  category?: 'payments' | 'listings' | 'rates' | 'content' | 'bookings';
}

export interface WebsiteContentConfig {
  heroHeadline: string;
  heroEyebrow: string;
  heroSupportingText: string;
  heroImage?: string;
  founderBio: string;
  founderImage?: string;
  announcementEnabled: boolean;
  announcementText: string;
  galleryPhotos?: string[];
  featuredItems: Array<{
    id: string;
    title: string;
    image: string;
    category: string;
    active: boolean;
  }>;
}
