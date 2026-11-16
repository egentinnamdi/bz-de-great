-- ==============================================================================
-- BZ GROUP — MULTI-BRANCH, PARTNER CAR STAND & REGIONAL ADMIN MIGRATION
-- ==============================================================================

-- 1. Regional & Car-Stand Attribution Columns on Listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS branch_office TEXT,
  ADD COLUMN IF NOT EXISTS created_by_id TEXT,
  ADD COLUMN IF NOT EXISTS created_by_name TEXT,
  ADD COLUMN IF NOT EXISTS partner_net_price NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sold_by_name TEXT,
  ADD COLUMN IF NOT EXISTS sale_note TEXT,
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false;

-- 2. Regional Handling Office Columns on Bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS branch_state TEXT,
  ADD COLUMN IF NOT EXISTS branch_office TEXT,
  ADD COLUMN IF NOT EXISTS assigned_rep_name TEXT,
  ADD COLUMN IF NOT EXISTS assigned_rep_phone TEXT;

-- 3. Staff & Partner Accounts Table (Scoped by State & Section)
CREATE TABLE IF NOT EXISTS public.staff_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Stand Uploader',
  assigned_states JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_categories JSONB NOT NULL DEFAULT '["car_sale"]'::jsonb,
  allowed_modules JSONB NOT NULL DEFAULT '["overview","listings"]'::jsonb,
  branch_office TEXT NOT NULL DEFAULT '',
  branch_address TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  require_approval_before_live BOOLEAN NOT NULL DEFAULT false,
  can_delete_listings BOOLEAN NOT NULL DEFAULT false,
  avatar_initials TEXT NOT NULL DEFAULT 'BZ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_accounts_email ON public.staff_accounts(email);
CREATE INDEX IF NOT EXISTS idx_listings_state ON public.listings(state);

ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff accounts desk access" ON public.staff_accounts;
CREATE POLICY "Staff accounts desk access" ON public.staff_accounts
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Storage bucket for compressed stand/property photos (safe if storage schema exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public read listing images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'listing-images');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Staff upload listing images"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'listing-images');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 5. Seed initial Master & Regional / Stand partner desks
INSERT INTO public.staff_accounts (
  id, name, email, phone, password, role,
  assigned_states, allowed_categories, allowed_modules,
  branch_office, branch_address, is_active,
  require_approval_before_live, can_delete_listings, avatar_initials
) VALUES
  (
    'ADM-001', 'Administrator', 'admin@bzgroup.com', '+234 704 753 1433', 'admin2026',
    'Master Admin', '["ALL"]'::jsonb,
    '["car_sale","car_rent","property_rent","property_sale"]'::jsonb,
    '["overview","listings","bookings","marketplace","studio","equipment","events","payments","customers","website_content","reports","activity_log","team"]'::jsonb,
    'Nationwide Executive HQ (Lagos)', 'No. 2 Thomas Estate, Ajah, Lagos State',
    true, false, true, 'AD'
  ),
  (
    'STF-AWKA-01', 'Chinedu Okafor', 'awka@bzdegreat.com', '+234 803 441 9012', 'bzawka2026',
    'Stand Uploader', '["Anambra State"]'::jsonb,
    '["car_sale"]'::jsonb,
    '["overview","listings"]'::jsonb,
    'Awka Car Stand — Aroma Junction', 'Aroma Junction Auto Plaza, Awka, Anambra State',
    true, false, false, 'CO'
  ),
  (
    'STF-ASABA-01', 'Emeka Nnamdi', 'asaba@bzdegreat.com', '+234 806 218 4410', 'bzasaba2026',
    'Regional Admin', '["Delta State"]'::jsonb,
    '["car_sale","car_rent","property_rent","property_sale"]'::jsonb,
    '["overview","listings","bookings"]'::jsonb,
    'Asaba Office & Car Stand (Delta)', 'Opp. Solar House, Beside NTA, Okpanam Road, Asaba',
    true, false, false, 'EN'
  ),
  (
    'STF-OWERRI-01', 'Uche Nwosu', 'owerri@bzdegreat.com', '+234 703 881 2004', 'bzowerri2026',
    'Stand Uploader', '["Imo State"]'::jsonb,
    '["car_sale"]'::jsonb,
    '["overview","listings"]'::jsonb,
    'New Owerri Partner Car Lot', 'Port Harcourt Road / New Owerri Auto Hub, Imo State',
    true, false, false, 'UN'
  ),
  (
    'STF-ENUGU-01', 'Adaeze Eze', 'enugu@bzdegreat.com', '+234 812 553 7781', 'bzenugu2026',
    'Regional Admin', '["Enugu State"]'::jsonb,
    '["car_rent","property_rent","property_sale"]'::jsonb,
    '["overview","listings","bookings"]'::jsonb,
    'Enugu Regional Office', 'Suite 4, Independence Layout Commercial Desk, Enugu State',
    true, false, false, 'AE'
  )
ON CONFLICT (id) DO NOTHING;
