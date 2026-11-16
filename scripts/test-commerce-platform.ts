import assert from 'node:assert/strict';
import {
  BRANCH_OFFICES,
  DEFAULT_STAFF_ACCOUNTS,
  canAccessAdminModule,
  canManageBooking,
  canManageListing,
  findBranchForState,
  getBookingState,
  getFirstAllowedAdminRoute,
  getListingState,
  isListingLive,
  isMasterAdmin,
} from '../lib/staff';
import { inferStateFromLocation } from '../lib/locations';
import { Booking, Listing } from '../lib/types';
import {
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STUDIO_SERVICES,
  INITIAL_STUDIO_BOOKINGS,
  INITIAL_EQUIPMENT_ITEMS,
  INITIAL_EQUIPMENT_RENTALS,
  INITIAL_EVENTS,
  INITIAL_DIGITAL_TICKETS,
  calculateOrderAuthoritative,
  validateStudioSlotConflict,
  calculateEquipmentAvailableQty,
  calculateEquipmentRentalAuthoritative,
  purchaseEventTicketAuthoritative,
  validateAndCheckInTicket,
} from '../lib/commerce-engine';
import {
  NIGERIA_STATES,
  NIGERIA_MAJOR_CITIES,
  matchesLocationFilter,
} from '../lib/locations';

console.log('=== Running Multi-Service Commerce Platform Test Suite ===\n');

// 1. Marketplace Categories & Products Coverage
{
  const slugs = INITIAL_PRODUCT_CATEGORIES.map((c) => c.slug);
  for (const required of [
    'phones',
    'laptops',
    'gadgets',
    'electronics',
    'solar-inverters',
    'clothing',
    'jewelry',
  ]) {
    assert.ok(slugs.includes(required), `Missing required category slug: ${required}`);
    const hasProd = INITIAL_PRODUCTS.some(
      (p) => p.categorySlug === required && p.status === 'published'
    );
    assert.ok(hasProd, `Missing published seed product for category: ${required}`);
  }
  console.log('✓ [Marketplace] All 7 product categories and specifications verified');
}

// 2. Authoritative Order Calculation, Stock Validation & Variant Pricing
{
  const phone = INITIAL_PRODUCTS.find((p) => p.id === 'prod-phone-1')!;
  const variant = phone.variants![0];
  const initialVariantStock = variant.stock;

  const orderRes = calculateOrderAuthoritative(
    [{ productId: phone.id, variantId: variant.id, quantity: 2 }],
    INITIAL_PRODUCTS,
    'Abuja (FCT)'
  );
  assert.equal(orderRes.ok, true, 'Valid order should succeed');
  assert.equal(orderRes.subtotalAmount, variant.price * 2);
  assert.equal(orderRes.deliveryFee, 15000);
  assert.equal(orderRes.totalAmount, variant.price * 2 + 15000);

  const updatedPhone = orderRes.updatedProducts.find((p) => p.id === phone.id)!;
  const updatedVar = updatedPhone.variants!.find((v) => v.id === variant.id)!;
  assert.equal(
    updatedVar.stock,
    initialVariantStock - 2,
    'Variant stock should decrement by ordered quantity'
  );

  // Out-of-stock rejection
  const overStockRes = calculateOrderAuthoritative(
    [{ productId: phone.id, variantId: variant.id, quantity: 999 }],
    INITIAL_PRODUCTS,
    'Lagos State'
  );
  assert.equal(overStockRes.ok, false, 'Order exceeding stock must be rejected');
  console.log('✓ [Orders & Checkout] Authoritative pricing, variant handling, and stock enforcement verified');
}

// 3. Studio Double-Booking Conflict Prevention
{
  assert.ok(INITIAL_STUDIO_SERVICES.length >= 4, 'Studio services should be populated');
  const existing = INITIAL_STUDIO_BOOKINGS[0]; // 2026-11-20 @ 12:00 PM

  const conflictCheck = validateStudioSlotConflict(
    INITIAL_STUDIO_BOOKINGS,
    existing.serviceId,
    existing.date,
    existing.timeSlot
  );
  assert.equal(
    conflictCheck.conflict,
    true,
    'Booking the same date and time slot must trigger a conflict'
  );

  const freeCheck = validateStudioSlotConflict(
    INITIAL_STUDIO_BOOKINGS,
    existing.serviceId,
    existing.date,
    '03:00 PM'
  );
  assert.equal(
    freeCheck.conflict,
    false,
    'Different time slot on the same date should be available'
  );

  // Cancelled booking should free the slot
  const cancelledList = INITIAL_STUDIO_BOOKINGS.map((b) => ({
    ...b,
    bookingStatus: 'cancelled' as const,
  }));
  const freedCheck = validateStudioSlotConflict(
    cancelledList,
    existing.serviceId,
    existing.date,
    existing.timeSlot
  );
  assert.equal(
    freedCheck.conflict,
    false,
    'Cancelled studio booking must release the slot'
  );
  console.log('✓ [Studio] Slot availability and double-booking prevention verified');
}

// 4. Camera & Media Equipment Date-Range Conflict & Deposit Calculation
{
  const fx3 = INITIAL_EQUIPMENT_ITEMS.find((e) => e.id === 'eq-cam-1')!; // quantityTotal = 3, 1 rented 2026-11-18..2026-11-20
  const availOverlap = calculateEquipmentAvailableQty(
    fx3,
    INITIAL_EQUIPMENT_RENTALS,
    '2026-11-19',
    '2026-11-21'
  );
  assert.equal(
    availOverlap,
    2,
    'Overlapping date range should reflect 1 reserved unit (3 - 1 = 2 available)'
  );

  // Requesting 3 units during overlap must fail
  const overRent = calculateEquipmentRentalAuthoritative(
    fx3,
    INITIAL_EQUIPMENT_RENTALS,
    '2026-11-19',
    '2026-11-21',
    3
  );
  assert.equal(
    overRent.ok,
    false,
    'Renting more units than available in overlapping date range must fail'
  );

  // Requesting 2 units for 3 days must succeed with exact rate + deposit
  const validRent = calculateEquipmentRentalAuthoritative(
    fx3,
    INITIAL_EQUIPMENT_RENTALS,
    '2026-11-19',
    '2026-11-21',
    2
  );
  assert.equal(validRent.ok, true);
  assert.equal(validRent.days, 3);
  assert.equal(
    validRent.totalAmount,
    fx3.dailyRate * 3 * 2 + fx3.depositAmount * 2
  );
  console.log('✓ [Equipment Rental] Date-range conflict guard and deposit calculation verified');
}

// 5. Events, Ticket Tier Capacity, Digital Ticket & QR Duplicate Check-In Guard
{
  const gala = INITIAL_EVENTS[0];
  const vipTier = gala.ticketTiers.find((t) => t.id === 'tier-gala-vip')!;
  const initialSold = vipTier.sold;

  const purchase = purchaseEventTicketAuthoritative(gala, vipTier.id, 2, {
    customerName: 'Barrister Clara',
    customerPhone: '+234 818 990 0112',
    customerEmail: 'clara@juristpartners.ng',
  });
  assert.equal(purchase.ok, true, 'Valid ticket purchase should succeed');
  assert.ok(purchase.ticket?.ticketCode.startsWith('BZ-'), 'Unique ticket code generated');
  assert.equal(purchase.ticket?.totalAmount, vipTier.price * 2);

  const updatedVip = purchase.updatedEvent!.ticketTiers.find(
    (t) => t.id === vipTier.id
  )!;
  assert.equal(updatedVip.sold, initialSold + 2, 'Sold count should increment by 2');

  // Exceeding capacity must fail
  const overCap = purchaseEventTicketAuthoritative(gala, vipTier.id, 999, {
    customerName: 'Test User',
    customerPhone: '08000000000',
    customerEmail: 'test@example.com',
  });
  assert.equal(overCap.ok, false, 'Exceeding ticket tier capacity must be rejected');

  // First check-in succeeds
  const ticketsPool = [purchase.ticket!, ...INITIAL_DIGITAL_TICKETS];
  const firstScan = validateAndCheckInTicket(
    ticketsPool,
    purchase.ticket!.ticketCode,
    'Gate Scanner 1'
  );
  assert.equal(firstScan.ok, true, 'First ticket check-in should succeed');
  assert.equal(firstScan.ticket?.ticketStatus, 'checked_in');

  // Second check-in of the same ticket must be blocked as duplicate
  const duplicateScan = validateAndCheckInTicket(
    firstScan.updatedTickets,
    purchase.ticket!.qrPayload,
    'Gate Scanner 2'
  );
  assert.equal(duplicateScan.ok, false, 'Duplicate ticket check-in must be blocked');
  assert.equal(duplicateScan.reason, 'already_checked_in');
  console.log('✓ [Events & Ticketing] Tier capacity, QR ticket generation, and duplicate check-in prevention verified');
}

// 6. All-Nigeria Location Options & Filter Matching
{
  assert.equal(NIGERIA_STATES.length, 37, 'All 36 Nigerian states plus FCT must be present');
  const uniqueValues = new Set([
    ...NIGERIA_MAJOR_CITIES.map((c) => c.value),
    ...NIGERIA_STATES.map((s) => s.value),
  ]);
  assert.equal(
    uniqueValues.size,
    NIGERIA_MAJOR_CITIES.length + NIGERIA_STATES.length,
    'Every location option value must be unique'
  );

  assert.equal(matchesLocationFilter('Okpanam, Asaba', 'all'), true);
  assert.equal(matchesLocationFilter('Maitama, Abuja', 'All Nigeria'), true);
  assert.equal(matchesLocationFilter('Okpanam, Asaba', 'Delta State'), true);
  assert.equal(matchesLocationFilter('Lekki, Lagos', 'Lagos State'), true);
  assert.equal(matchesLocationFilter('Maitama, Abuja', 'Abuja'), true);
  assert.equal(matchesLocationFilter('Asokoro, Abuja', 'Maitama, Abuja'), false);
  assert.equal(matchesLocationFilter('Nigeria', 'Niger State'), false, 'Niger State must not false-match Nigeria');
  assert.equal(matchesLocationFilter('Minna, Niger State', 'Niger State'), true);
  console.log('✓ [Locations] Nationwide Nigeria coverage (36 states + FCT) and filter aliases verified');
}

// 7. Multi-Branch Partner Admin, Regional Scoping & Sold Lifecycle Removal
{
  assert.equal(inferStateFromLocation('Aroma Junction, Awka, Anambra State'), 'Anambra State');
  assert.equal(inferStateFromLocation('Okpanam Road, Asaba'), 'Delta State');
  assert.equal(inferStateFromLocation('New Owerri Auto Lot'), 'Imo State');
  assert.equal(inferStateFromLocation('Independence Layout, Enugu'), 'Enugu State');
  assert.equal(inferStateFromLocation('Lekki Phase 1, Lagos'), 'Lagos State');
  assert.equal(inferStateFromLocation('Maitama, Abuja'), 'FCT Abuja');

  assert.ok(BRANCH_OFFICES.length >= 6, 'Regional branch offices must be seeded');
  const master = DEFAULT_STAFF_ACCOUNTS.find(a => a.email === 'admin@bzgroup.com');
  const awkaRep = DEFAULT_STAFF_ACCOUNTS.find(a => a.email === 'awka@bzdegreat.com');
  const asabaRep = DEFAULT_STAFF_ACCOUNTS.find(a => a.email === 'asaba@bzdegreat.com');
  const owerriRep = DEFAULT_STAFF_ACCOUNTS.find(a => a.email === 'owerri@bzdegreat.com');
  const enuguRep = DEFAULT_STAFF_ACCOUNTS.find(a => a.email === 'enugu@bzdegreat.com');

  assert.ok(master && awkaRep && asabaRep && owerriRep && enuguRep, 'All regional demo accounts must exist');
  assert.equal(isMasterAdmin(master), true);
  assert.equal(isMasterAdmin(awkaRep), false);
  assert.equal(isMasterAdmin(enuguRep), false);

  // Module & financial isolation checks
  assert.equal(canAccessAdminModule(master, 'payments'), true);
  assert.equal(canAccessAdminModule(master, 'team'), true);
  assert.equal(canAccessAdminModule(awkaRep, 'listings'), true);
  assert.equal(canAccessAdminModule(awkaRep, 'payments'), false, 'Stand uploader must not access payments');
  assert.equal(canAccessAdminModule(awkaRep, 'reports'), false, 'Stand uploader must not access reports');
  assert.equal(canAccessAdminModule(awkaRep, 'team'), false, 'Stand uploader must not access team management');
  assert.equal(canAccessAdminModule(awkaRep, 'bookings'), false, 'Upload-only stand boy must not access bookings');
  assert.equal(canAccessAdminModule(asabaRep, 'bookings'), true);
  assert.equal(canAccessAdminModule(asabaRep, 'payments'), false, 'Regional office must not see company financial payouts');
  assert.ok(getFirstAllowedAdminRoute(awkaRep).startsWith('/admin'));

  // Scoped listing management (State + Category isolation)
  const makeListing = (overrides: Partial<Listing>): Listing => ({
    id: 'LST-TEST-1',
    slug: 'lst-test-1',
    title: 'Test Asset',
    category: 'car_sale',
    price: 45000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Awka, Anambra State',
    images: ['/photos/car-suv-white.jpg'],
    description: 'Test vehicle',
    status: 'published',
    createdAt: '2026-11-16T00:00:00Z',
    ...overrides,
  });

  const awkaCar = makeListing({ id: 'L-AWKA-1', category: 'car_sale', location: 'Aroma Junction, Awka' });
  const awkaHome = makeListing({ id: 'L-AWKA-HOME', category: 'property_rent', location: 'Awka, Anambra State' });
  const asabaCar = makeListing({ id: 'L-ASABA-1', category: 'car_sale', location: 'Okpanam Road, Asaba', state: 'Delta State' });
  const enuguHouse = makeListing({ id: 'L-ENUGU-1', category: 'property_rent', location: 'Independence Layout, Enugu', state: 'Enugu State' });

  assert.equal(getListingState(awkaCar), 'Anambra State');
  assert.equal(canManageListing(master, asabaCar), true);
  assert.equal(canManageListing(awkaRep, awkaCar), true, 'Awka car-stand boy manages Anambra car_sale');
  assert.equal(canManageListing(awkaRep, awkaHome), false, 'Car-stand uploader cannot manage disallowed property category');
  assert.equal(canManageListing(awkaRep, asabaCar), false, 'Awka stand cannot edit Delta listing');
  assert.equal(canManageListing(asabaRep, asabaCar), true, 'Asaba office manages Delta listing');
  assert.equal(canManageListing(enuguRep, enuguHouse), true, 'Enugu office manages Enugu property rental');
  assert.equal(canManageListing(owerriRep, enuguHouse), false, 'Owerri stand cannot manage Enugu house');

  // Booking branch routing & isolation
  const listingMap = new Map<string, Listing>([
    [asabaCar.id, asabaCar],
    [enuguHouse.id, enuguHouse],
  ]);
  const deltaBooking: Booking = {
    id: 'BK-DELTA-1',
    reference: 'BZ-DLT-01',
    type: 'car_test_drive',
    listingId: asabaCar.id,
    listingTitle: asabaCar.title,
    customerName: 'Chief Chidi',
    customerPhone: '08030000000',
    customerEmail: 'chidi@example.com',
    startDate: '2026-11-20',
    bookingStatus: 'requested',
    paymentStatus: 'pending',
    totalAmount: 0,
    createdAt: '2026-11-16T00:00:00Z',
  };
  assert.equal(getBookingState(deltaBooking, listingMap), 'Delta State');
  assert.equal(findBranchForState('Asaba, Delta State')?.state, 'Delta State');
  assert.equal(canManageBooking(master, deltaBooking, listingMap), true);
  assert.equal(canManageBooking(asabaRep, deltaBooking, listingMap), true);
  assert.equal(canManageBooking(owerriRep, deltaBooking, listingMap), false);

  // Sold / Rented / Draft public visibility guard
  assert.equal(isListingLive({ status: 'published' }), true);
  assert.equal(isListingLive({ status: 'sold' }), false, 'Sold items must be hidden from public storefront');
  assert.equal(isListingLive({ status: 'rented' }), false, 'Rented items must be hidden from public storefront');
  assert.equal(isListingLive({ status: 'reserved' }), false);
  assert.equal(isListingLive({ status: 'draft' }), false);
  assert.equal(isListingLive({ status: 'archived' }), false);

  console.log('✓ [Multi-Branch Partner Admin] Regional scoping, financial isolation, branch routing, and sold-removal guards verified');
}

console.log('\nALL MULTI-SERVICE COMMERCE TESTS PASSED SUCCESSFULLY!');
