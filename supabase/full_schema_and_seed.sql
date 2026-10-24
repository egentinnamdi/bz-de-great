-- ==============================================================================
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

-- 6. SEED LISTINGS (Cars & Properties)
INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-1',
  'cars',
  'rent',
  'Lincoln Navigator 2022',
  'Twin-Turbo V6 · Reserve Luxury',
  'lincoln-navigator-2022-rent',
  180000,
  '/ day',
  '₦180,000 / day',
  'NGN',
  0,
  '["/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg","/photos/car-suv-white.jpg","/photos/car-suv-grey.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Luxury","Reserve","Uniformed driver"]'::jsonb,
  'A full-size luxury SUV with three rows of leather seating, panoramic roof and a smooth, quiet ride — ideal for airport pick-ups, family trips and executive movement around Abuja. Available self-drive or with a trained car professional driver.',
  '{"make":"Lincoln","model":"Navigator","year":2022,"transmission":"Automatic","seats":7,"fuelType":"Petrol","driverOption":"Both","engine":"3.5L Twin-Turbo V6 (450 hp)","color":"Pristine White Metallic"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-2',
  'cars',
  'rent',
  'Mercedes-Benz E-Class 2022',
  'Executive Luxury Sedan',
  'mercedes-benz-e-class-2022-rent',
  120000,
  '/ day',
  '₦120,000 / day',
  'NGN',
  0,
  '["/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg","/photos/car-sedan-black.jpg"]'::jsonb,
  'Central Area, Abuja',
  'Abuja',
  'available',
  true,
  '["Sedan","Executive","Chauffeured VIP"]'::jsonb,
  'The definitive executive flagship sedan. Featuring executive rear seating, Burmester 3D high-end audio, ambient lighting, and serene whisper-quiet ride.',
  '{"make":"Mercedes-Benz","model":"E-Class","year":2022,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Both","engine":"2.0L Turbo Inline-4","color":"Obsidian Black"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-3',
  'cars',
  'rent',
  'BMW X5 xDrive40i 2021',
  'M Sport Edition · Panoramic Sunroof',
  'bmw-x5-xdrive40i-2021-rent',
  150000,
  '/ day',
  '₦150,000 / day',
  'NGN',
  0,
  '["/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg","/photos/car-suv-grey.jpg"]'::jsonb,
  'Asokoro, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","BMW","M Sport"]'::jsonb,
  'Clean, foreign-used BMW X5 xDrive40i with M Sport package. Outstanding ride composure, spacious leather cabin, and BMW live cockpit professional.',
  '{"make":"BMW","model":"X5 xDrive40i","year":2021,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Both","engine":"3.0L Turbo Inline-6","color":"Phytonic Blue Metallic"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-4',
  'cars',
  'rent',
  'Mercedes-Benz G-Class 2021',
  'G63 AMG Biturbo V8',
  'mercedes-benz-g-class-2021-rent',
  220000,
  '/ day',
  '₦220,000 / day',
  'NGN',
  0,
  '["/photos/car-suv-white.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Maitama, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","G-Wagon","Escort Ready"]'::jsonb,
  'Iconic commanding road presence. The G-Class blends brute performance with handcrafted leather luxury, Burmester sound, and diplomatic prestige.',
  '{"make":"Mercedes-Benz","model":"G-Class G63","year":2021,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Both","engine":"4.0L V8 Biturbo","color":"Designo Polar White"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-5',
  'cars',
  'rent',
  'Toyota Land Cruiser 2023',
  '300 Series VXR Twin-Turbo',
  'toyota-land-cruiser-2023-rent',
  200000,
  '/ day',
  '₦200,000 / day',
  'NGN',
  0,
  '["/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg","/photos/car-suv-white.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Toyota","4WD"]'::jsonb,
  'The preferred choice for corporate executives, dignitaries, and long-range luxury travel across Nigeria. Supreme reliability and ventilated seating.',
  '{"make":"Toyota","model":"Land Cruiser 300","year":2023,"transmission":"Automatic","seats":7,"fuelType":"Petrol","driverOption":"Both","engine":"3.5L Twin-Turbo V6","color":"Graphite Grey"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-rent-6',
  'cars',
  'rent',
  'Lexus RX 350 2022',
  'F-Sport All-Wheel Drive',
  'lexus-rx-350-2022-rent',
  130000,
  '/ day',
  '₦130,000 / day',
  'NGN',
  0,
  '["/photos/car-suv-grey.jpg","/photos/car-suv-white.jpg"]'::jsonb,
  'Garki, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Lexus","F-Sport"]'::jsonb,
  'Silky smooth ride, plush semi-aniline leather interior, Mark Levinson audio, and supreme reliability for city errands and business meetings.',
  '{"make":"Lexus","model":"RX 350","year":2022,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Self-drive","engine":"3.5L V6","color":"Atomic Silver"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-1',
  'cars',
  'buy',
  'BMW X5 xDrive40i 2021',
  'Foreign Used · Customs Cleared · 34,000 km',
  'bmw-x5-xdrive40i-2021-sale',
  85000000,
  '',
  '₦85,000,000',
  'NGN',
  0,
  '["/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg","/photos/car-suv-grey.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Foreign Used","BMW","Clean Title"]'::jsonb,
  'A clean, foreign-used BMW X5 xDrive40i with M Sport package. Documented, no accident record. Customs duty is fully cleared and every document is ready for transfer. Book a free test drive, bring your mechanic, and only pay once you are happy with the car.',
  '{"make":"BMW","model":"X5 xDrive40i","year":2021,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"34,000 km","engine":"3.0L Turbo Inline-6 (335 hp)","color":"Mineral Grey Metallic"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-2',
  'cars',
  'buy',
  'Mercedes-Benz E-Class 2021',
  'E350 AMG Line · Panoramic Sunroof',
  'mercedes-benz-e-class-2021-sale',
  48000000,
  '',
  '₦48,000,000',
  'NGN',
  0,
  '["/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg","/photos/car-sedan-black.jpg"]'::jsonb,
  'Central Area, Abuja',
  'Abuja',
  'available',
  true,
  '["Sedan","Mercedes-Benz","Foreign Used"]'::jsonb,
  'Flawless condition, verified customs papers, original paint, full service history from authorized center. Clean leather seats, ambient lighting.',
  '{"make":"Mercedes-Benz","model":"E-Class E350","year":2021,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"28,500 km","engine":"2.0L Turbo Inline-4","color":"Obsidian Black"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-3',
  'cars',
  'buy',
  'Lexus RX 350 2021',
  'Full Option · Keyless Entry',
  'lexus-rx-350-2021-sale',
  62000000,
  '',
  '₦62,000,000',
  'NGN',
  0,
  '["/photos/car-suv-grey.jpg","/photos/car-suv-white.jpg"]'::jsonb,
  'Garki, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Lexus","Foreign Used"]'::jsonb,
  'Foreign used with pristine cream leather, navigation, reverse camera, power tailgate, and brand new Michelin tires. Clean title ready for transfer.',
  '{"make":"Lexus","model":"RX 350","year":2021,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"41,000 km","engine":"3.5L V6","color":"Caviar Black"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-4',
  'cars',
  'buy',
  'Toyota Land Cruiser 2022',
  'LC300 VXR · Executive Package',
  'toyota-land-cruiser-2022-sale',
  150000000,
  '',
  '₦150,000,000',
  'NGN',
  0,
  '["/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg","/photos/car-suv-white.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Toyota","LC300"]'::jsonb,
  'The pinnacle of bulletproof durability and prestige. 7-seater executive layout, JBL premium sound, cooled/heated seats, and genuine documentation.',
  '{"make":"Toyota","model":"Land Cruiser 300","year":2022,"transmission":"Automatic","seats":7,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"18,000 km","engine":"3.5L Twin-Turbo V6","color":"Pearl White"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-5',
  'cars',
  'buy',
  'Lincoln Navigator 2021',
  'Reserve Package · Twin-Turbo',
  'lincoln-navigator-2021-sale',
  120000000,
  '',
  '₦120,000,000',
  'NGN',
  0,
  '["/photos/car-suv-white.jpg","/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg"]'::jsonb,
  'Maitama, Abuja',
  'Abuja',
  'available',
  true,
  '["SUV","Lincoln","Luxury"]'::jsonb,
  'Full-size flagship luxury SUV with 22-inch wheels, Revel Ultima 20-speaker sound, massaging front captain chairs, and full duty clearance.',
  '{"make":"Lincoln","model":"Navigator Reserve","year":2021,"transmission":"Automatic","seats":7,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"32,000 km","engine":"3.5L Twin-Turbo V6","color":"Pristine White"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'car-sale-6',
  'cars',
  'buy',
  'Mercedes-Benz S-Class 2019',
  'S560 Maybach Look · Executive',
  'mercedes-benz-s-class-2019-sale',
  78000000,
  '',
  '₦78,000,000',
  'NGN',
  0,
  '["/photos/car-sedan-black.jpg","/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg"]'::jsonb,
  'Asokoro, Abuja',
  'Abuja',
  'available',
  true,
  '["Sedan","Mercedes-Benz","S-Class"]'::jsonb,
  'Chauffeured diplomat pedigree. Rear refrigerator, executive footrest, twin screens, and immaculate service record with certified duty payment.',
  '{"make":"Mercedes-Benz","model":"S-Class S560","year":2019,"transmission":"Automatic","seats":5,"fuelType":"Petrol","driverOption":"Self-drive","mileage":"49,000 km","engine":"4.0L V8 Biturbo","color":"Obsidian Black"}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-1',
  'properties',
  'rent',
  '3-Bedroom Serviced Apartment',
  'Lake Views · Gated Estate · Jabi',
  '3-bedroom-serviced-apartment-jabi',
  12000000,
  '/ year',
  '₦12,000,000 / year',
  'NGN',
  0,
  '["/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg","/photos/apartment-interior.jpg","/photos/house-duplex.jpg"]'::jsonb,
  'Jabi, Abuja',
  'Abuja',
  'available',
  true,
  '["Apartment","Jabi","Serviced","Pool"]'::jsonb,
  'Contemporary waterfront apartment in Jabi, Abuja. Fully furnished, 24/7 power, Olympic swimming pool, gym, and 24-hour uniformed security patrol.',
  '{"type":"Apartment","bedrooms":3,"bathrooms":3,"areaSqm":280,"serviced":true,"furnished":true,"amenities":["24/7 Power","Fitted Gym","Swimming Pool","Security"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-2',
  'properties',
  'rent',
  '4-Bedroom Duplex',
  'Diplomatic Enclave · Maitama',
  '4-bedroom-duplex-maitama-rent',
  35000000,
  '/ year',
  '₦35,000,000 / year',
  'NGN',
  0,
  '["/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg","/photos/house-duplex.jpg"]'::jsonb,
  'Maitama, Abuja',
  'Abuja',
  'available',
  true,
  '["Duplex","Maitama","Diplomatic"]'::jsonb,
  'Grand detached duplex situated in the heart of Maitama. Private compound, 2-room staff quarters, perimeter electric fencing, and industrial borehole.',
  '{"type":"Duplex","bedrooms":4,"bathrooms":5,"areaSqm":650,"serviced":true,"furnished":true,"amenities":["Private Compound","Electric Fencing","BQ","Water Plant"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-3',
  'properties',
  'rent',
  '4-Bedroom Terrace',
  'Hilltop Serenity · Guzape',
  '4-bedroom-terrace-guzape-rent',
  15000000,
  '/ year',
  '₦15,000,000 / year',
  'NGN',
  0,
  '["/photos/house-terrace.jpg","/photos/apartment-interior.jpg"]'::jsonb,
  'Guzape, Abuja',
  'Abuja',
  'available',
  true,
  '["House","Guzape","Terrace"]'::jsonb,
  'Multi-level terrace residence with panoramic views of the city skyline. Contemporary finish, en-suite bedrooms, and dedicated children play area.',
  '{"type":"House","bedrooms":4,"bathrooms":4,"areaSqm":420,"serviced":true,"furnished":false,"amenities":["Hilltop View","24/7 Security","Kids Playground"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-4',
  'properties',
  'rent',
  '2-Bedroom Apartment',
  'Wuse 2 Commercial & Lifestyle Hub',
  '2-bedroom-apartment-wuse-2-rent',
  7500000,
  '/ year',
  '₦7,500,000 / year',
  'NGN',
  0,
  '["/photos/apartment-interior.jpg","/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["Apartment","Wuse 2","City Center"]'::jsonb,
  'Perfect for executives and expatriates who desire city-center convenience. Walking distance to elite restaurants and supermarkets in Wuse 2.',
  '{"type":"Apartment","bedrooms":2,"bathrooms":2,"areaSqm":190,"serviced":true,"furnished":true,"amenities":["Elevator","Fitted Kitchen","Central Generator"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-5',
  'properties',
  'rent',
  'Furnished 5-Bedroom Villa',
  'Asokoro Luxury Haven with Pool',
  'furnished-5-bedroom-villa-asokoro-rent',
  40000000,
  '/ year',
  '₦40,000,000 / year',
  'NGN',
  0,
  '["/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Asokoro, Abuja',
  'Abuja',
  'available',
  true,
  '["House","Asokoro","Furnished Villa"]'::jsonb,
  'Immaculately appointed luxury villa with infinity pool, cinema room, private garden, and full air-conditioned staff accommodation.',
  '{"type":"House","bedrooms":5,"bathrooms":6,"areaSqm":900,"serviced":true,"furnished":true,"amenities":["Infinity Pool","Private Cinema","Smart Automation"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'home-rent-6',
  'properties',
  'rent',
  '1-Bedroom Short-let',
  'Central Area · Executive Transit Suite',
  '1-bedroom-short-let-central-area',
  85000,
  '/ day',
  '₦85,000 / day',
  'NGN',
  0,
  '["/photos/apartment-interior.jpg","/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg"]'::jsonb,
  'Central Area, Abuja',
  'Abuja',
  'available',
  true,
  '["Apartment","Short-let","CBD"]'::jsonb,
  'High-end short-let apartment with ultra-fast Wi-Fi, streaming subscriptions, daily housekeeping, and 24-hour room concierge.',
  '{"type":"Apartment","bedrooms":1,"bathrooms":1,"areaSqm":95,"serviced":true,"furnished":true,"amenities":["Daily Housekeeping","High-Speed Wi-Fi","Smart TV"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-1',
  'properties',
  'buy',
  '5-Bedroom Detached Duplex',
  'Private Pool · Smart Home · Maitama',
  '5-bedroom-detached-duplex-maitama-sale',
  650000000,
  '',
  '₦650,000,000',
  'NGN',
  0,
  '["/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg","/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg","/photos/house-duplex.jpg"]'::jsonb,
  'Maitama, Abuja',
  'Abuja',
  'available',
  true,
  '["Duplex","Maitama","C of O","Private Pool"]'::jsonb,
  'A bespoke 5-bedroom detached duplex on a quiet, gated street in Maitama. Every bedroom is en-suite, with three lounges, private infinity pool with sanitary facilities, quarters and parking for four cars. Title: Certificate of Occupancy, and inspections are strictly by appointment.',
  '{"type":"Duplex","bedrooms":5,"bathrooms":6,"areaSqm":1200,"serviced":true,"furnished":true,"titleDocument":"Certificate of Occupancy (C of O)","amenities":["All rooms en-suite","Private swimming pool","Fitted contemporary kitchen","Cinema room & smart locks","2-room staff quarters","4-car parking"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-2',
  'properties',
  'buy',
  '3-Bedroom Apartment',
  'Luxury High-Rise · Wuse 2',
  '3-bedroom-apartment-wuse-2-sale',
  95000000,
  '',
  '₦95,000,000',
  'NGN',
  0,
  '["/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg","/photos/apartment-interior.jpg"]'::jsonb,
  'Wuse 2, Abuja',
  'Abuja',
  'available',
  true,
  '["Apartment","Wuse 2","Investment"]'::jsonb,
  'Newly completed luxury residence in a prime high-rise in Wuse 2. Top-tier imported fittings, private balcony, basement parking, and clean Governor Consent.',
  '{"type":"Apartment","bedrooms":3,"bathrooms":3,"areaSqm":320,"serviced":true,"furnished":false,"titleDocument":"Governor''s Consent","amenities":["Elevator","Basement Parking","24/7 Security","Balcony"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-3',
  'properties',
  'buy',
  '4-Bedroom Terrace',
  'Contemporary Family Home · Guzape',
  '4-bedroom-terrace-guzape-sale',
  280000000,
  '',
  '₦280,000,000',
  'NGN',
  0,
  '["/photos/house-terrace.jpg","/photos/house-duplex.jpg"]'::jsonb,
  'Guzape, Abuja',
  'Abuja',
  'available',
  true,
  '["House","Guzape","Terrace"]'::jsonb,
  'Modern luxury terrace with private compound, solar inverter integration, smart home switches, and clean FCDA allocation papers.',
  '{"type":"House","bedrooms":4,"bathrooms":5,"areaSqm":550,"serviced":true,"furnished":true,"titleDocument":"FCDA Allocation with C of O","amenities":["Solar Inverter","Smart Automation","BQ","CCTV"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-4',
  'properties',
  'buy',
  'Luxury 5-Bedroom Villa',
  'Asokoro Diplomatic Hills · Infinity Pool',
  'luxury-5-bedroom-villa-asokoro-sale',
  1200000000,
  '',
  '₦1,200,000,000',
  'NGN',
  0,
  '["/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Asokoro, Abuja',
  'Abuja',
  'available',
  true,
  '["House","Asokoro","Ambassadorial"]'::jsonb,
  'An ambassadorial estate built on 1,600 sqm of prime land in Asokoro. Dual infinity pools, banquet dining hall, security bunker, and glass elevator.',
  '{"type":"House","bedrooms":5,"bathrooms":7,"areaSqm":1600,"serviced":true,"furnished":true,"titleDocument":"Certificate of Occupancy (FCDA Verified)","amenities":["Dual Pools","Glass Elevator","Cinema","Security Bunker"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-5',
  'properties',
  'buy',
  'Agidigba Garden City — Plots',
  'Prime Commercial & Residential Plots',
  'agidigba-garden-city-plots',
  20000000,
  '',
  '₦20,000,000',
  'NGN',
  0,
  '["/photos/land-estate.jpg","/figma-images/3106610cc25be4b155398cf1c889ed0535a4873b.jpg"]'::jsonb,
  'Okpanam, Asaba',
  'Abuja',
  'available',
  true,
  '["Land & plots","Asaba","Investment"]'::jsonb,
  'Government approved layout in fast-developing economic hub. Instant allocation, dry table land, perimeter fencing, and global C of O in process.',
  '{"type":"Land & plots","areaSqm":600,"serviced":false,"furnished":false,"titleDocument":"Registered Survey & Deed of Assignment","amenities":["Dry Table Land","Gated Perimeter","Access Road","Instant Allocation"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;

INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, currency,
  caution_fee, images, location, state, status, featured, tags, description, specs, features
) VALUES (
  'prop-sale-6',
  'properties',
  'buy',
  'BZ Okpanam Millennium City',
  'Estate Plots with Flexible Payment',
  'bz-okpanam-millennium-city',
  5000000,
  '',
  '₦5,000,000',
  'NGN',
  0,
  '["/photos/land-estate.jpg","/photos/hero-villa-suv.jpg"]'::jsonb,
  'Okpanam, Asaba',
  'Abuja',
  'available',
  true,
  '["Land & plots","Asaba","Master Planned"]'::jsonb,
  'Strategically located minutes from the Asaba International Airport. Master-planned luxury gated community with commercial boulevard and residential zones.',
  '{"type":"Land & plots","areaSqm":450,"serviced":true,"furnished":false,"titleDocument":"Free from Government Acquisition (Deed & Survey)","amenities":["Estate Security","Solar Streetlights","Drainage System"]}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description;


-- 7. SEED BOOKINGS
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'BK-2292',
  'BK-2292',
  'car_rental',
  'car-rent-1',
  'Lincoln Navigator 2022',
  NULL,
  'Chidi Okafor',
  '+234 803 234 5678',
  'chidi.okafor@primegroup.ng',
  '2026-10-24',
  '2026-10-27',
  'Chauffeured',
  NULL,
  755000,
  'verified',
  'confirmed',
  'Airport pick-up from Nnamdi Azikiwe Airport to Transcorp Hilton.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'BK-2290',
  'BK-2290',
  'car_rental',
  'car-rent-2',
  'Mercedes-Benz E-Class 2022',
  NULL,
  'Tunde Bello',
  '+234 809 876 5432',
  'tunde.bello@apexholdings.com',
  '2026-10-25',
  '2026-10-28',
  'Self-drive',
  NULL,
  360000,
  'receipt_uploaded',
  'confirmed',
  'Self-drive booking. Delivery to Central Area.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'INS-0318',
  'INS-0318',
  'property_inspection',
  'prop-sale-1',
  '5-Bedroom Detached Duplex',
  NULL,
  'Amaka Eze',
  '+234 812 345 6789',
  'amaka.eze@capitalpartners.ng',
  '2026-10-26',
  NULL,
  'Self-drive',
  NULL,
  0,
  'pending',
  'confirmed',
  'Physical viewing with surveyor and client spouse at 11:00 AM.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'TD-0091',
  'TD-0091',
  'car_test_drive',
  'car-sale-1',
  'BMW X5 xDrive40i 2021',
  NULL,
  'Fatima Sule',
  '+234 805 112 2334',
  'fatima.sule@zenithenterprise.com',
  '2026-10-27',
  NULL,
  'Self-drive',
  NULL,
  0,
  'pending',
  'confirmed',
  'Test drive around Wuse 2 with personal mechanic at 02:00 PM.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'BK-2292',
  'BK-2292',
  'car_rental',
  'car-rent-1',
  'Lincoln Navigator 2022',
  '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
  'Amaka Eze',
  '+234 803 221 4455',
  'amaka.eze@gmail.com',
  '2026-10-24',
  '2026-10-27',
  'Chauffeured',
  'Wuse 2, Abuja',
  540000,
  'verified',
  'requested',
  'Airport VIP reception requested'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'INS-0318',
  'INS-0318',
  'property_inspection',
  'home-rent-1',
  '5-Bedroom Detached Duplex',
  '/figma-images/c702fe619623eefbe67bcf4d1a5598687ba4ba2b.jpg',
  'Mr Ibrahim',
  '+234 814 889 0012',
  'ibrahim.k@investments.ng',
  '2026-10-25',
  '2026-10-25',
  'Self-drive',
  'Guzape Hills, Abuja',
  0,
  'verified',
  'requested',
  'Client visiting from Kano'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'BK-2290',
  'BK-2290',
  'car_rental',
  'car-rent-2',
  'Mercedes-Benz E-Class 2022',
  '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
  'Fatima Sule',
  '+234 809 332 1100',
  'fatima.s@corporate.org',
  '2026-11-01',
  '2026-11-04',
  'Chauffeured',
  'Transcorp Hilton, Abuja',
  360000,
  'verified',
  'confirmed',
  'Annual corporate conference'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.bookings (
  id, reference, type, listing_id, listing_title, listing_image, customer_name,
  customer_phone, customer_email, start_date, end_date, driver_option,
  pickup_location, total_amount, payment_status, booking_status, notes
) VALUES (
  'BK-2288',
  'BK-2288',
  'car_rental',
  'car-rent-3',
  'Mercedes E-Class + driver',
  '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
  'Corporate client',
  '+234 802 119 4433',
  'admin@chevron-affiliate.ng',
  '2026-10-20',
  '2026-10-23',
  'Chauffeured',
  'Central Area, Abuja',
  480000,
  'verified',
  'active',
  'Executive diplomatic shuttle'
) ON CONFLICT (id) DO NOTHING;

-- 8. SEED RMB REQUESTS
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0142',
  'RMB-0142',
  'naira_to_rmb',
  21540000,
  215.4,
  100000,
  'Alipay, WeChat Pay or bank',
  'Ifeanyi Obi',
  'ifeanyi.obi@globaltrade.ng',
  '+234 813 969 0031',
  '/photos/car-sedan-black.jpg',
  'approved',
  '¥100,000 factory settlement in Guangzhou.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0143',
  'RMB-0143',
  'rmb_to_naira',
  50000,
  205,
  10250000,
  'Alipay, WeChat Pay or bank',
  'Zainab Abdullahi',
  'zainab@kadoimports.com',
  '+234 813 969 0031',
  NULL,
  'receipt_received',
  'Settlement for electronics shipment.'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0144',
  'RMB-0144',
  'rmb_to_naira',
  18500,
  216.1,
  3997850,
  'First Bank Nigeria · 3088921102',
  'Chidi Okafor',
  'chidi.o@email.com',
  '+234 803 441 2099',
  NULL,
  'requested',
  'Guangzhou logistics supply payment'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0143',
  'RMB-0143',
  'naira_to_rmb',
  2600000,
  205.5,
  12652,
  'Alipay · 186****9912',
  'Fatima Al-Hassan',
  'fatima.al@gmail.com',
  '+234 814 200 9988',
  NULL,
  'account_sent',
  'Yiwu market fashion goods'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0142',
  'RMB-0142',
  'rmb_to_naira',
  50000,
  215.8,
  10790000,
  'Zenith Bank · 1012398411',
  'David Adeleke',
  'david.a@gmail.com',
  '+234 802 334 1122',
  '/receipts/demo-receipt-0142.jpg',
  'receipt_received',
  'Heavy machinery spare parts'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.rmb_exchange_requests (
  id, reference, direction, source_amount, rate_applied, destination_amount,
  destination_channel, customer_name, customer_email, customer_whatsapp,
  receipt_url, status, notes
) VALUES (
  'RMB-0141',
  'RMB-0141',
  'rmb_to_naira',
  20000,
  215.4,
  4308000,
  'GTBank · 0148892311',
  'Amina Bello',
  'amina.b@trade.ng',
  '+234 809 111 8877',
  '/receipts/demo-receipt-0141.jpg',
  'paid_out',
  'Payment processed and verified'
) ON CONFLICT (id) DO NOTHING;

-- 9. SEED CUSTOMERS (CRM)
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-1',
  'CO',
  'Chidi Okafor',
  'chidi.o@email.com',
  '0803 *** 4412',
  '+234 803 441 2099',
  'Abuja, FCT',
  'RMB',
  0,
  '¥86,000',
  '₦18,520,000',
  18520000,
  true,
  'active',
  'CEO at Okafor Logistics. High-volume frequent trader, prefers direct WeChat Pay.',
  'Today, 10:41 AM'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-2',
  'FA',
  'Fatima Al-Hassan',
  'fatima.al@gmail.com',
  '0814 *** 9988',
  '+234 814 200 9988',
  'Abuja, FCT',
  'Cars',
  6,
  '¥0',
  '₦2,450,000',
  2450000,
  true,
  'active',
  'Regular G-Wagon and Lincoln Navigator rental. Prefers airport pickup with security convoy.',
  'Yesterday, 3:20 PM'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-3',
  'DA',
  'David Adeleke',
  'david.a@gmail.com',
  '0802 *** 1122',
  '+234 802 334 1122',
  'Abuja, FCT',
  'RMB',
  0,
  '¥50,000',
  '₦10,790,000',
  10790000,
  false,
  'active',
  'Guangzhou manufacturing procurement. Prefers settlement to Zenith Bank.',
  'Wed, 4:15 PM'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-4',
  'AB',
  'Amina Bello',
  'amina.b@trade.ng',
  '0809 *** 8877',
  '+234 809 111 8877',
  'Abuja, FCT',
  'Property',
  3,
  '¥20,000',
  '₦48,300,000',
  48300000,
  false,
  'active',
  'High net worth client, recently inspected 5-bedroom villa in Asokoro.',
  '2 days ago'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-5',
  'EN',
  'Emeka Nwosu',
  'emeka.n@techafrica.co',
  '0703 *** 6543',
  '+234 703 111 6543',
  'Abuja, FCT',
  'Cars',
  4,
  '¥0',
  '₦980,000',
  980000,
  false,
  'active',
  'Tech founder, books BMW X5 for executive partner visits.',
  '5 days ago'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;
INSERT INTO public.customers (
  id, initials, name, email, phone, phone_full, location, uses,
  bookings_count, rmb_sent_display, total_spent_display, lifetime_spend_ngn,
  is_vip, status, notes, last_active
) VALUES (
  'cust-6',
  'ZI',
  'Zainab Ibrahim',
  'zainab.i@energyholdings.ng',
  '0818 *** 3321',
  '+234 818 900 3321',
  'Abuja, FCT',
  'Property',
  2,
  '¥140,000',
  '₦32,400,000',
  32400000,
  true,
  'active',
  'Corporate housing coordinator for multinational executives in Maitama.',
  '1 week ago'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  lifetime_spend_ngn = EXCLUDED.lifetime_spend_ngn;

-- 10. SEED STAFF ACTIVITIES
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-1',
  'payments',
  'Admin',
  'approved payment',
  'RMB-0141 · ₦4,308,000',
  'Verified GTBank credit confirmation',
  'Today, 10:41 AM'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-2',
  'rates',
  'Admin',
  'changed the RMB rate',
  '₦214.80 → ₦215.40',
  'Morning market adjustment based on CBN interbank rates',
  'Today, 9:30 AM'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-3',
  'listings',
  'David Ola',
  'updated a car listing',
  'Lincoln Navigator 2022',
  'Updated daily rental rate and availability window',
  'Today, 8:15 AM'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-4',
  'payments',
  'Admin',
  'sent account details',
  'RMB-0143 · Fatima Al-Hassan',
  'Forwarded BZ Group treasury RMB collection account',
  'Yesterday, 5:10 PM'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-5',
  'bookings',
  'Admin',
  'confirmed booking',
  'BK-2290 · Fatima Sule',
  'Mercedes E-Class chauffeured booking locked for 1-4 Nov',
  'Yesterday, 4:20 PM'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.staff_activities (
  id, category, staff_name, action, target, details, timestamp_display
) VALUES (
  'act-6',
  'content',
  'Admin',
  'updated homepage content',
  'Hero headline & featured fleet',
  'Published high-resolution assets for Q4 promotions',
  'Yesterday, 11:00 AM'
) ON CONFLICT (id) DO NOTHING;

-- 10. SEED PRESET STAFF PROFILES
INSERT INTO public.profiles (id, full_name, email, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Chidi Okafor (COO)', 'admin@bzgroup.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Treasury Settlement Desk', 'treasury@bzgroup.com', 'treasury'),
  ('00000000-0000-0000-0000-000000000003', 'VIP Concierge Lead', 'concierge@bzgroup.com', 'concierge')
ON CONFLICT (email) DO NOTHING;

