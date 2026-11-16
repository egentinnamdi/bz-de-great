-- ==============================================================================
-- BZ GROUP — BRANCH OFFICES & CAR STANDS CRUD MIGRATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.branch_offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  manager_name TEXT NOT NULL DEFAULT '',
  handles TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branch_offices_state ON public.branch_offices(state);
CREATE INDEX IF NOT EXISTS idx_branch_offices_active ON public.branch_offices(is_active);

ALTER TABLE public.branch_offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Branch offices desk access" ON public.branch_offices;
CREATE POLICY "Branch offices desk access" ON public.branch_offices
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.branch_offices (
  id, name, state, city, address, phone, manager_name, handles, is_active
) VALUES
  (
    'br-onitsha-hq',
    'Head Office (Anambra)',
    'Anambra State',
    'Onitsha',
    'Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State',
    '+234 704 753 1433',
    'Ifeanyi Obi',
    'Properties · Land · Head Office Inquiries',
    true
  ),
  (
    'br-awka-stand',
    'Awka Car Stand (Anambra)',
    'Anambra State',
    'Awka',
    'Aroma Junction Auto Plaza, Enugu-Onitsha Exp, Awka, Anambra State',
    '+234 803 441 9012',
    'Chinedu Okafor',
    'Car Sales · Stand Inspections',
    true
  ),
  (
    'br-asaba-delta',
    'Delta Branch Office & Stand',
    'Delta State',
    'Asaba',
    'Opp. Solar House, Beside NTA, Okpanam Road, Asaba, Delta State',
    '+234 806 218 4410',
    'Emeka Nnamdi',
    'Car Sales · Car Rentals · Houses & Land',
    true
  ),
  (
    'br-owerri-imo',
    'Imo Car Stand (Owerri)',
    'Imo State',
    'Owerri',
    'Port Harcourt Road / New Owerri Auto Hub, Owerri, Imo State',
    '+234 703 881 2004',
    'Uche Nwosu',
    'Car Sales · Partner Stand Inventory',
    true
  ),
  (
    'br-enugu-office',
    'Enugu Regional Office',
    'Enugu State',
    'Enugu',
    'Suite 4, Independence Layout Commercial Desk, Enugu State',
    '+234 812 553 7781',
    'Adaeze Eze',
    'Car Rentals · House Rentals & Viewings',
    true
  ),
  (
    'br-lagos-office',
    'Lagos Executive Office',
    'Lagos State',
    'Lagos',
    'No. 2 Thomas Estate, Ajah, Lagos State',
    '+234 704 753 1433',
    'BZ Executive Desk',
    'Car Sales · Rentals · Island & Mainland Homes',
    true
  ),
  (
    'br-abuja-office',
    'Abuja FCT Operations Desk',
    'FCT Abuja',
    'Abuja',
    'STEM PARK, Ochacho Junction, After Nyzamie Hospital, Karmo, Abuja',
    '+234 704 753 1433',
    'Abuja Fleet & Property Desk',
    'Car Rentals · Sales · Diplomatic Properties',
    true
  )
ON CONFLICT (id) DO NOTHING;
