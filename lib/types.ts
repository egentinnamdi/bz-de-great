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
  uses?: 'Cars' | 'Property';
  bookingsCount?: number;
  totalBookings: number;
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
  category?: 'payments' | 'listings' | 'content' | 'bookings';
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

// ============================================================================
// MULTI-SERVICE COMMERCE PLATFORM TYPES (Marketplace, Studio, Rentals, Events)
// ============================================================================

export type ProductCategorySlug =
  | 'phones'
  | 'laptops'
  | 'gadgets'
  | 'electronics'
  | 'solar-inverters'
  | 'clothing'
  | 'jewelry'
  | (string & {});

export interface ProductCategory {
  id: string;
  name: string;
  slug: ProductCategorySlug;
  description: string;
  icon?: string;
  active: boolean;
  specFields: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string; // e.g. "256GB · Natural Titanium" or "Size L · Burgundy"
  attributes: Record<string, string>; // e.g. { Storage: "256GB", Color: "Natural Titanium" }
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: ProductCategorySlug;
  brand: string;
  condition: string; // e.g. "Brand New", "Foreign Used", "Custom Crafted"
  warranty?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: 'NGN';
  images: string[];
  stock: number;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string; // `${productId}:${variantId || 'default'}`
  productId: string;
  productName: string;
  productImage: string;
  categorySlug: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface ProductOrder {
  id: string; // e.g. "ORD-4102"
  reference: string;
  items: OrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryState: string;
  orderStatus: OrderStatus;
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface StudioService {
  id: string;
  name: string;
  slug: string;
  serviceType:
    | 'Photography Session'
    | 'Studio Session'
    | 'Photo + Video Session'
    | 'Event Photography'
    | 'Portrait Session'
    | 'Product Photography'
    | (string & {});
  description: string;
  durationHours: number;
  price: number;
  images: string[];
  location: string; // e.g. "BZ De Great Studio, Lekki-Ajah, Lagos State"
  includes: string[];
  availableSlots: string[]; // e.g. ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"]
  status: 'active' | 'archived';
}

export type StudioBookingStatus =
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface StudioBooking {
  id: string; // e.g. "STU-1042"
  reference: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  durationHours: number;
  location: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  bookingStatus: StudioBookingStatus;
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export type EquipmentCategory =
  | 'Cameras'
  | 'Lenses'
  | 'Lighting'
  | 'Tripods'
  | 'Microphones'
  | 'Audio Equipment'
  | 'Video Equipment'
  | 'Other Media Equipment'
  | (string & {});

export interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  category: EquipmentCategory;
  brand: string;
  description: string;
  images: string[];
  dailyRate: number;
  depositAmount: number;
  quantityTotal: number;
  condition: string;
  specifications: Record<string, string>;
  status: 'available' | 'maintenance' | 'archived';
}

export type EquipmentRentalStatus =
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'active'
  | 'returned'
  | 'cancelled';

export interface EquipmentRental {
  id: string; // e.g. "RNT-3081"
  reference: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentImage?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  quantity: number;
  dailyRate: number;
  depositAmount: number;
  totalAmount: number; // (dailyRate * days * quantity) + (depositAmount * quantity)
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupLocation: string;
  rentalStatus: EquipmentRentalStatus;
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface EventTicketTier {
  id: string;
  name: string; // e.g. "Regular", "VIP", "VVIP"
  price: number;
  capacity: number;
  sold: number;
  perks: string[];
}

export interface EventItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  venue: string;
  city: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  organizer: string;
  status: 'published' | 'draft' | 'archived' | 'completed';
  featured?: boolean;
  ticketTiers: EventTicketTier[];
  createdAt: string;
}

export type DigitalTicketStatus =
  | 'pending_payment'
  | 'valid'
  | 'checked_in'
  | 'cancelled';

export interface DigitalTicket {
  id: string; // e.g. "TKT-8821"
  ticketCode: string; // Unique cryptographic/verification code e.g. "BZ-TKT-8821-A9F4"
  qrPayload: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventImage?: string;
  tierId: string;
  tierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  ticketStatus: DigitalTicketStatus;
  checkedInAt?: string;
  checkedInBy?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

