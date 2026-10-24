const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const mockCode = fs.readFileSync(path.join(__dirname, '../lib/mock-data.ts'), 'utf8');
const js = ts.transpileModule(mockCode, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
const fn = new Function('module', 'exports', js);
fn(mod, mod.exports);

const listings = mod.exports.INITIAL_LISTINGS || [];
const bookings = mod.exports.INITIAL_BOOKINGS || [];
const rmbRequests = mod.exports.INITIAL_RMB_REQUESTS || [];
const customers = mod.exports.INITIAL_CUSTOMERS || [];
const activities = mod.exports.INITIAL_ACTIVITIES || [];

function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ==============================================================================
-- BZ GROUP GLOBAL UNIVERSAL SOLUTIONS - COMPLETE SUPABASE BAAS SCHEMA & SEED
-- Execute this entire file in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES

-- A. LISTINGS
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(14,2) NOT NULL,
  price_unit TEXT DEFAULT '/ day',
  price_formatted TEXT DEFAULT '',
  currency TEXT DEFAULT 'NGN',
  caution_fee NUMERIC(12,2) DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT NOT NULL,
  state TEXT DEFAULT 'Abuja',
  status TEXT NOT NULL DEFAULT 'available',
  featured BOOLEAN NOT NULL DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  inspection_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  reference TEXT,
  type TEXT NOT NULL,
  listing_id TEXT,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  driver_option TEXT DEFAULT 'Self-drive',
  pickup_location TEXT,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'requested',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- C. RMB RATES
CREATE TABLE IF NOT EXISTS public.rmb_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_rmb_rate NUMERIC(8,2) NOT NULL DEFAULT 205.00,
  pay_naira_rate NUMERIC(8,2) NOT NULL DEFAULT 215.40,
  updated_at_display TEXT NOT NULL DEFAULT '9:30 AM Today',
  updated_by TEXT NOT NULL DEFAULT 'Admin (Treasury Desk)',
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- D. RMB EXCHANGE REQUESTS & PAYMENTS
CREATE TABLE IF NOT EXISTS public.rmb_exchange_requests (
  id TEXT PRIMARY KEY,
  reference TEXT,
  direction TEXT NOT NULL,
  source_amount NUMERIC(14,2) NOT NULL,
  rate_applied NUMERIC(8,2) NOT NULL,
  destination_amount NUMERIC(14,2) NOT NULL,
  destination_channel TEXT DEFAULT 'Alipay, WeChat Pay or bank',
  destination_account_details TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  sender_bank TEXT,
  sender_account_name TEXT,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E. CUSTOMERS CRM
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  initials TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_full TEXT,
  location TEXT DEFAULT 'Abuja, FCT',
  uses TEXT DEFAULT 'Cars',
  bookings_count INTEGER NOT NULL DEFAULT 0,
  rmb_sent_display TEXT DEFAULT '¥0',
  total_spent_display TEXT DEFAULT '₦0',
  lifetime_spend_ngn NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  last_active TEXT DEFAULT 'Today',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- F. WEBSITE CONTENT (CMS)
CREATE TABLE IF NOT EXISTS public.website_content (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  hero_headline TEXT DEFAULT 'Drive it. Live in it. Own it.',
  hero_eyebrow TEXT DEFAULT 'Invest in value · Live the future',
  hero_supporting_text TEXT DEFAULT 'Rent or buy premium cars and homes, and change RMB and naira — all through one trusted team.',
  founder_bio TEXT DEFAULT 'BZ De Great is a realtor, investment broker and entrepreneur working across four industries — real estate, automobiles, fashion and technology.',
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT DEFAULT '',
  featured_items JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. STAFF ACTIVITIES (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.staff_activities (
  id TEXT PRIMARY KEY,
  category TEXT DEFAULT 'payments',
  staff_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT DEFAULT '',
  timestamp_display TEXT DEFAULT 'Today',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- H. PROFILES (AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rmb_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rmb_exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public listings access" ON public.listings;
CREATE POLICY "Public listings access" ON public.listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public bookings access" ON public.bookings;
CREATE POLICY "Public bookings access" ON public.bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public rmb_rates access" ON public.rmb_rates;
CREATE POLICY "Public rmb_rates access" ON public.rmb_rates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public rmb_exchange_requests access" ON public.rmb_exchange_requests;
CREATE POLICY "Public rmb_exchange_requests access" ON public.rmb_exchange_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public customers access" ON public.customers;
CREATE POLICY "Public customers access" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public website_content access" ON public.website_content;
CREATE POLICY "Public website_content access" ON public.website_content FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public staff_activities access" ON public.staff_activities;
CREATE POLICY "Public staff_activities access" ON public.staff_activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. SEED RMB RATES
INSERT INTO public.rmb_rates (id, pay_rmb_rate, pay_naira_rate, updated_at_display, updated_by, is_current)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 205.00, 215.40, '9:30 AM Today', 'Admin (Treasury Desk)', true)
ON CONFLICT (id) DO UPDATE SET
  pay_rmb_rate = EXCLUDED.pay_rmb_rate,
  pay_naira_rate = EXCLUDED.pay_naira_rate,
  updated_at_display = EXCLUDED.updated_at_display;

-- 5. SEED WEBSITE CONTENT
INSERT INTO public.website_content (id, hero_headline, hero_eyebrow, hero_supporting_text, founder_bio, announcement_enabled, announcement_text, featured_items)
VALUES (
  'global_config',
  'Drive it. Live in it. Own it.',
  'Invest in value · Live the future',
  'Rent or buy premium cars and homes, and change RMB and naira — all through one trusted team.',
  'BZ De Great is a realtor, investment broker and entrepreneur working across four industries — real estate, automobiles, fashion and technology.',
  false,
  '',
  '[{"id":"feat-1","title":"Lincoln Navigator 2022","image":"/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg","category":"Car","active":true},{"id":"feat-2","title":"Mercedes-Benz S-Class 2022","image":"/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg","category":"Car","active":true},{"id":"feat-3","title":"BMW 50i xDrive 2021","image":"/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg","category":"Car","active":true}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
`;

// 6. SEED LISTINGS
sql += '\n-- 6. SEED LISTINGS (Cars & Properties)\n';
for (const l of listings) {
  const cat = l.category.startsWith('car') ? 'cars' : 'properties';
  const mode = l.category.includes('rent') ? 'rent' : 'buy';
  const specs = l.vehicleSpecs || l.propertySpecs || {};
  const priceFormatted = '₦' + Number(l.price).toLocaleString('en-NG') + (l.pricePeriod === '/day' ? ' / day' : (l.pricePeriod === '/year' ? ' / year' : ''));
  
  sql += `INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  ${sqlEscape(l.id)},
  ${sqlEscape(cat)},
  ${sqlEscape(mode)},
  ${sqlEscape(l.title)},
  ${sqlEscape(l.subtitle || '')},
  ${sqlEscape(l.slug)},
  ${l.price},
  ${sqlEscape(l.pricePeriod === '/day' ? '/ day' : (l.pricePeriod === '/year' ? '/ year' : ''))},
  ${sqlEscape(priceFormatted)},
  'NGN',
  ${l.cautionFee || 0},
  ${sqlEscape(JSON.stringify(l.images || []))}::jsonb,
  ${sqlEscape(l.location)},
  'Abuja',
  ${sqlEscape(l.status === 'published' ? 'available' : 'reserved')},
  ${l.featured ? 'true' : 'false'},
  ${sqlEscape(JSON.stringify(l.tags || []))}::jsonb,
  ${sqlEscape(l.description)},
  ${sqlEscape(JSON.stringify(specs))}::jsonb,
  ${sqlEscape(JSON.stringify(l.features || []))}::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;\n\n`;
}

// 7. SEED BOOKINGS
sql += '\n-- 7. SEED BOOKINGS\n';
const extraBookings = [
  {
    id: 'BK-2292',
    reference: 'BK-2292',
    type: 'car_rental',
    listingId: 'car-rent-1',
    listingTitle: 'Lincoln Navigator 2022',
    listingImage: '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
    customerName: 'Amaka Eze',
    customerPhone: '+234 803 221 4455',
    customerEmail: 'amaka.eze@gmail.com',
    startDate: '2026-10-24',
    endDate: '2026-10-27',
    driverOption: 'Chauffeured',
    pickupLocation: 'Wuse 2, Abuja',
    totalAmount: 540000,
    paymentStatus: 'verified',
    bookingStatus: 'requested',
    notes: 'Airport VIP reception requested'
  },
  {
    id: 'INS-0318',
    reference: 'INS-0318',
    type: 'property_inspection',
    listingId: 'home-rent-1',
    listingTitle: '5-Bedroom Detached Duplex',
    listingImage: '/figma-images/c702fe619623eefbe67bcf4d1a5598687ba4ba2b.jpg',
    customerName: 'Mr Ibrahim',
    customerPhone: '+234 814 889 0012',
    customerEmail: 'ibrahim.k@investments.ng',
    startDate: '2026-10-25',
    endDate: '2026-10-25',
    driverOption: 'Self-drive',
    pickupLocation: 'Guzape Hills, Abuja',
    totalAmount: 0,
    paymentStatus: 'verified',
    bookingStatus: 'requested',
    notes: 'Client visiting from Kano'
  },
  {
    id: 'BK-2290',
    reference: 'BK-2290',
    type: 'car_rental',
    listingId: 'car-rent-2',
    listingTitle: 'Mercedes-Benz E-Class 2022',
    listingImage: '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
    customerName: 'Fatima Sule',
    customerPhone: '+234 809 332 1100',
    customerEmail: 'fatima.s@corporate.org',
    startDate: '2026-11-01',
    endDate: '2026-11-04',
    driverOption: 'Chauffeured',
    pickupLocation: 'Transcorp Hilton, Abuja',
    totalAmount: 360000,
    paymentStatus: 'verified',
    bookingStatus: 'confirmed',
    notes: 'Annual corporate conference'
  },
  {
    id: 'BK-2288',
    reference: 'BK-2288',
    type: 'car_rental',
    listingId: 'car-rent-3',
    listingTitle: 'Mercedes E-Class + driver',
    listingImage: '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
    customerName: 'Corporate client',
    customerPhone: '+234 802 119 4433',
    customerEmail: 'admin@chevron-affiliate.ng',
    startDate: '2026-10-20',
    endDate: '2026-10-23',
    driverOption: 'Chauffeured',
    pickupLocation: 'Central Area, Abuja',
    totalAmount: 480000,
    paymentStatus: 'verified',
    bookingStatus: 'active',
    notes: 'Executive diplomatic shuttle'
  }
];

const allBookings = [...bookings, ...extraBookings];
for (const b of allBookings) {
  sql += `INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  ${sqlEscape(b.id)},
  ${sqlEscape(b.reference || b.id)},
  ${sqlEscape(b.type)},
  ${sqlEscape(b.listingId || null)},
  ${sqlEscape(b.listingTitle || '')},
  ${sqlEscape(b.listingImage || null)},
  ${sqlEscape(b.customerName)},
  ${sqlEscape(b.customerPhone)},
  ${sqlEscape(b.customerEmail)},
  ${sqlEscape(b.startDate)},
  ${sqlEscape(b.endDate || null)},
  ${sqlEscape(b.driverOption || 'Self-drive')},
  ${sqlEscape(b.pickupLocation || null)},
  ${b.totalAmount || 0},
  ${sqlEscape(b.paymentStatus || 'pending')},
  ${sqlEscape(b.bookingStatus || 'requested')},
  ${sqlEscape(b.notes || null)}
) ON CONFLICT (id) DO NOTHING;\n`;
}

// 8. SEED RMB REQUESTS & PAYMENTS
sql += '\n-- 8. SEED RMB REQUESTS\n';
const extraRmbRequests = [
  {
    id: 'RMB-0144',
    reference: 'RMB-0144',
    direction: 'rmb_to_naira',
    sourceAmount: 18500,
    rateApplied: 216.10,
    destinationAmount: 3997850,
    customerName: 'Chidi Okafor',
    customerEmail: 'chidi.o@email.com',
    customerWhatsApp: '+234 803 441 2099',
    destinationChannel: 'First Bank Nigeria · 3088921102',
    status: 'requested',
    notes: 'Guangzhou logistics supply payment'
  },
  {
    id: 'RMB-0143',
    reference: 'RMB-0143',
    direction: 'naira_to_rmb',
    sourceAmount: 2600000,
    rateApplied: 205.50,
    destinationAmount: 12652,
    customerName: 'Fatima Al-Hassan',
    customerEmail: 'fatima.al@gmail.com',
    customerWhatsApp: '+234 814 200 9988',
    destinationChannel: 'Alipay · 186****9912',
    status: 'account_sent',
    notes: 'Yiwu market fashion goods'
  },
  {
    id: 'RMB-0142',
    reference: 'RMB-0142',
    direction: 'rmb_to_naira',
    sourceAmount: 50000,
    rateApplied: 215.80,
    destinationAmount: 10790000,
    customerName: 'David Adeleke',
    customerEmail: 'david.a@gmail.com',
    customerWhatsApp: '+234 802 334 1122',
    destinationChannel: 'Zenith Bank · 1012398411',
    status: 'receipt_received',
    receiptUrl: '/receipts/demo-receipt-0142.jpg',
    notes: 'Heavy machinery spare parts'
  },
  {
    id: 'RMB-0141',
    reference: 'RMB-0141',
    direction: 'rmb_to_naira',
    sourceAmount: 20000,
    rateApplied: 215.40,
    destinationAmount: 4308000,
    customerName: 'Amina Bello',
    customerEmail: 'amina.b@trade.ng',
    customerWhatsApp: '+234 809 111 8877',
    destinationChannel: 'GTBank · 0148892311',
    status: 'paid_out',
    receiptUrl: '/receipts/demo-receipt-0141.jpg',
    notes: 'Payment processed and verified'
  }
];

const allRmb = [...rmbRequests, ...extraRmbRequests];
for (const r of allRmb) {
  sql += `INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  ${sqlEscape(r.id)},
  ${sqlEscape(r.reference || r.id)},
  ${sqlEscape(r.direction)},
  ${r.sourceAmount},
  ${r.rateApplied},
  ${r.destinationAmount},
  ${sqlEscape(r.destinationChannel || 'Alipay, WeChat Pay or bank')},
  ${sqlEscape(r.customerName)},
  ${sqlEscape(r.customerEmail)},
  ${sqlEscape(r.customerWhatsApp)},
  ${sqlEscape(r.receiptUrl || null)},
  ${sqlEscape(r.status)},
  ${sqlEscape(r.notes || null)}
) ON CONFLICT (id) DO NOTHING;\n`;
}

// 9. SEED CUSTOMERS
sql += '\n-- 9. SEED CUSTOMERS (CRM)\n';
const extraCustomers = [
  {
    id: 'cust-1',
    initials: 'CO',
    name: 'Chidi Okafor',
    isVip: true,
    email: 'chidi.o@email.com',
    phone: '0803 *** 4412',
    phoneFull: '+234 803 441 2099',
    uses: 'RMB',
    bookingsCount: 0,
    rmbSentDisplay: '¥86,000',
    totalSpentDisplay: '₦18,520,000',
    lifetimeSpendNgn: 18520000,
    lastActive: 'Today, 10:41 AM',
    notes: 'CEO at Okafor Logistics. High-volume frequent trader, prefers direct WeChat Pay.',
    status: 'active'
  },
  {
    id: 'cust-2',
    initials: 'FA',
    name: 'Fatima Al-Hassan',
    isVip: true,
    email: 'fatima.al@gmail.com',
    phone: '0814 *** 9988',
    phoneFull: '+234 814 200 9988',
    uses: 'Cars',
    bookingsCount: 6,
    rmbSentDisplay: '¥0',
    totalSpentDisplay: '₦2,450,000',
    lifetimeSpendNgn: 2450000,
    lastActive: 'Yesterday, 3:20 PM',
    notes: 'Regular G-Wagon and Lincoln Navigator rental. Prefers airport pickup with security convoy.',
    status: 'active'
  },
  {
    id: 'cust-3',
    initials: 'DA',
    name: 'David Adeleke',
    isVip: false,
    email: 'david.a@gmail.com',
    phone: '0802 *** 1122',
    phoneFull: '+234 802 334 1122',
    uses: 'RMB',
    bookingsCount: 0,
    rmbSentDisplay: '¥50,000',
    totalSpentDisplay: '₦10,790,000',
    lifetimeSpendNgn: 10790000,
    lastActive: 'Wed, 4:15 PM',
    notes: 'Guangzhou manufacturing procurement. Prefers settlement to Zenith Bank.',
    status: 'active'
  },
  {
    id: 'cust-4',
    initials: 'AB',
    name: 'Amina Bello',
    isVip: false,
    email: 'amina.b@trade.ng',
    phone: '0809 *** 8877',
    phoneFull: '+234 809 111 8877',
    uses: 'Property',
    bookingsCount: 3,
    rmbSentDisplay: '¥20,000',
    totalSpentDisplay: '₦48,300,000',
    lifetimeSpendNgn: 48300000,
    lastActive: '2 days ago',
    notes: 'High net worth client, recently inspected 5-bedroom villa in Asokoro.',
    status: 'active'
  },
  {
    id: 'cust-5',
    initials: 'EN',
    name: 'Emeka Nwosu',
    isVip: false,
    email: 'emeka.n@techafrica.co',
    phone: '0703 *** 6543',
    phoneFull: '+234 703 111 6543',
    uses: 'Cars',
    bookingsCount: 4,
    rmbSentDisplay: '¥0',
    totalSpentDisplay: '₦980,000',
    lifetimeSpendNgn: 980000,
    lastActive: '5 days ago',
    notes: 'Tech founder, books BMW X5 for executive partner visits.',
    status: 'active'
  },
  {
    id: 'cust-6',
    initials: 'ZI',
    name: 'Zainab Ibrahim',
    isVip: true,
    email: 'zainab.i@energyholdings.ng',
    phone: '0818 *** 3321',
    phoneFull: '+234 818 900 3321',
    uses: 'Property',
    bookingsCount: 2,
    rmbSentDisplay: '¥140,000',
    totalSpentDisplay: '₦32,400,000',
    lifetimeSpendNgn: 32400000,
    lastActive: '1 week ago',
    notes: 'Corporate housing coordinator for multinational executives in Maitama.',
    status: 'active'
  }
];

for (const c of extraCustomers) {
  sql += `INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  ${sqlEscape(c.id)},
  ${sqlEscape(c.initials)},
  ${sqlEscape(c.name)},
  ${sqlEscape(c.email)},
  ${sqlEscape(c.phone)},
  ${sqlEscape(c.phoneFull)},
  ${sqlEscape(c.location || 'Abuja, FCT')},
  ${sqlEscape(c.uses)},
  ${c.bookingsCount},
  ${sqlEscape(c.rmbSentDisplay)},
  ${sqlEscape(c.totalSpentDisplay)},
  ${c.lifetimeSpendNgn},
  ${c.isVip ? 'true' : 'false'},
  ${sqlEscape(c.status)},
  ${sqlEscape(c.notes)},
  ${sqlEscape(c.lastActive)}
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;\n`;
}

// 10. SEED STAFF ACTIVITIES
sql += '\n-- 10. SEED STAFF ACTIVITIES\n';
const extraActivities = [
  {
    id: 'act-1',
    category: 'payments',
    staffName: 'Admin',
    action: 'approved payment',
    target: 'RMB-0141 · ₦4,308,000',
    details: 'Verified GTBank credit confirmation',
    timestampDisplay: 'Today, 10:41 AM'
  },
  {
    id: 'act-2',
    category: 'rates',
    staffName: 'Admin',
    action: 'changed the RMB rate',
    target: '₦214.80 → ₦215.40',
    details: 'Morning market adjustment based on CBN interbank rates',
    timestampDisplay: 'Today, 9:30 AM'
  },
  {
    id: 'act-3',
    category: 'listings',
    staffName: 'David Ola',
    action: 'updated a car listing',
    target: 'Lincoln Navigator 2022',
    details: 'Updated daily rental rate and availability window',
    timestampDisplay: 'Today, 8:15 AM'
  },
  {
    id: 'act-4',
    category: 'payments',
    staffName: 'Admin',
    action: 'sent account details',
    target: 'RMB-0143 · Fatima Al-Hassan',
    details: 'Forwarded BZ Group treasury RMB collection account',
    timestampDisplay: 'Yesterday, 5:10 PM'
  },
  {
    id: 'act-5',
    category: 'bookings',
    staffName: 'Admin',
    action: 'confirmed booking',
    target: 'BK-2290 · Fatima Sule',
    details: 'Mercedes E-Class chauffeured booking locked for 1-4 Nov',
    timestampDisplay: 'Yesterday, 4:20 PM'
  },
  {
    id: 'act-6',
    category: 'content',
    staffName: 'Admin',
    action: 'updated homepage content',
    target: 'Hero headline & featured fleet',
    details: 'Published high-resolution assets for Q4 promotions',
    timestampDisplay: 'Yesterday, 11:00 AM'
  }
];

for (const a of extraActivities) {
  sql += `INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  ${sqlEscape(a.id)},
  ${sqlEscape(a.category)},
  ${sqlEscape(a.staffName)},
  ${sqlEscape(a.action)},
  ${sqlEscape(a.target)},
  ${sqlEscape(a.details)},
  ${sqlEscape(a.timestampDisplay)}
) ON CONFLICT (id) DO NOTHING;\n`;
}

fs.writeFileSync(path.join(__dirname, '../supabase/full_schema_and_seed.sql'), sql, 'utf8');
console.log('Successfully generated supabase/full_schema_and_seed.sql. Size:', sql.length, 'bytes');
