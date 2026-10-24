-- ==============================================================================
-- BZ GROUP GLOBAL UNIVERSAL SOLUTIONS - SUPABASE BAAS PRODUCTION SCHEMA
-- Comprehensive schema for Car Rentals/Sales, Property Rentals/Sales, 
-- RMB Treasury Exchange Desk, Bookings CRM, Profiles, and Audit Logs.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  CREATE TYPE listing_category AS ENUM ('cars', 'homes', 'properties');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_mode AS ENUM ('rent', 'buy');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('available', 'rented', 'sold', 'reserved', 'under_inspection');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('car_rental', 'car_test_drive', 'property_inspection');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'receipt_uploaded', 'verified', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('requested', 'confirmed', 'active', 'returned', 'declined', 'rescheduled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exchange_direction AS ENUM ('rmb_to_naira', 'naira_to_rmb');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exchange_status AS ENUM ('requested', 'account_sent', 'receipt_received', 'approved', 'paid_out', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'treasury', 'concierge', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LISTINGS TABLE (Cars, Homes, Properties)
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  category listing_category NOT NULL,
  mode listing_mode NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(14,2) NOT NULL,
  price_unit TEXT NOT NULL DEFAULT '/ day',
  price_formatted TEXT NOT NULL,
  caution_fee NUMERIC(12,2) DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Abuja',
  status listing_status NOT NULL DEFAULT 'available',
  featured BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  inspection_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast search and catalog filters
CREATE INDEX IF NOT EXISTS idx_listings_cat_mode ON public.listings(category, mode);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);

-- 5. BOOKINGS TABLE (Car rentals, Test drives, Property inspections)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  type booking_type NOT NULL,
  listing_id TEXT REFERENCES public.listings(id) ON DELETE SET NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  driver_option TEXT DEFAULT 'Self-drive',
  pickup_location TEXT,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  booking_status booking_status NOT NULL DEFAULT 'requested',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);

-- 6. RMB TREASURY DAILY EXCHANGE RATES
CREATE TABLE IF NOT EXISTS public.rmb_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_rmb_rate NUMERIC(8,2) NOT NULL DEFAULT 205.00,
  pay_naira_rate NUMERIC(8,2) NOT NULL DEFAULT 215.40,
  updated_at_display TEXT NOT NULL DEFAULT '9:30 AM Today',
  updated_by TEXT NOT NULL DEFAULT 'Admin (Treasury Desk)',
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rmb_rates_current ON public.rmb_rates(is_current);

-- 7. RMB EXCHANGE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.rmb_exchange_requests (
  id TEXT PRIMARY KEY,
  direction exchange_direction NOT NULL,
  source_amount NUMERIC(14,2) NOT NULL,
  rate_applied NUMERIC(8,2) NOT NULL,
  destination_amount NUMERIC(14,2) NOT NULL,
  destination_channel TEXT NOT NULL DEFAULT 'Alipay, WeChat Pay or bank',
  destination_account_details TEXT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  sender_bank TEXT,
  sender_account_name TEXT,
  receipt_url TEXT,
  status exchange_status NOT NULL DEFAULT 'requested',
  rate_locked_until TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rmb_req_status ON public.rmb_exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_rmb_req_customer_whatsapp ON public.rmb_exchange_requests(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_rmb_req_created ON public.rmb_exchange_requests(created_at DESC);

-- 8. CUSTOMERS (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Abuja, FCT',
  total_bookings INTEGER NOT NULL DEFAULT 0,
  lifetime_spend_ngn NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 9. AUDIT LOGS & STAFF ACTIVITIES
CREATE TABLE IF NOT EXISTS public.staff_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_created ON public.staff_activities(created_at DESC);

-- ==============================================================================
-- 10. DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Trigger to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_listings_updated_at ON public.listings;
CREATE TRIGGER tr_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_bookings_updated_at ON public.bookings;
CREATE TRIGGER tr_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_rmb_requests_updated_at ON public.rmb_exchange_requests;
CREATE TRIGGER tr_rmb_requests_updated_at
  BEFORE UPDATE ON public.rmb_exchange_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile record when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rmb_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rmb_exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activities ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is an admin or staff member
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'treasury', 'concierge')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile or staff can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- LISTINGS POLICIES (Public read, Staff write)
CREATE POLICY "Anyone can view available listings"
  ON public.listings FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Staff can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update listings"
  ON public.listings FOR UPDATE
  USING (public.is_staff());

CREATE POLICY "Staff can delete listings"
  ON public.listings FOR DELETE
  USING (public.is_staff());

-- BOOKINGS POLICIES (Public can insert, Users/Staff can read)
CREATE POLICY "Public can create a booking request"
  ON public.bookings FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Staff can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_staff() OR auth.uid() = customer_id);

CREATE POLICY "Staff can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_staff());

-- RMB RATES POLICIES (Public read current rate, Staff write)
CREATE POLICY "Anyone can view RMB rates"
  ON public.rmb_rates FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Treasury and admin can insert rates"
  ON public.rmb_rates FOR INSERT
  WITH CHECK (public.is_staff());

CREATE POLICY "Treasury and admin can update rates"
  ON public.rmb_rates FOR UPDATE
  USING (public.is_staff());

-- RMB EXCHANGE REQUESTS POLICIES
CREATE POLICY "Public can create exchange orders"
  ON public.rmb_exchange_requests FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Staff and owners can view exchange requests"
  ON public.rmb_exchange_requests FOR SELECT
  USING (public.is_staff() OR auth.uid() = customer_id);

CREATE POLICY "Staff can update exchange requests"
  ON public.rmb_exchange_requests FOR UPDATE
  USING (public.is_staff());

-- CUSTOMERS CRM POLICIES (Staff only)
CREATE POLICY "Staff can manage CRM customers"
  ON public.customers FOR ALL
  USING (public.is_staff());

-- AUDIT LOGS POLICIES (Staff read and write)
CREATE POLICY "Staff can view activities"
  ON public.staff_activities FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Staff can insert activity logs"
  ON public.staff_activities FOR INSERT
  WITH CHECK (public.is_staff());
