# BZ Group Supabase BaaS Architecture & Integration Guide

This directory contains the production-grade PostgreSQL database schema, migrations, seed data, and Row Level Security (RLS) policies configured specifically for **BZ Group Global Universal Solutions**.

---

## 1. Architecture Overview

| Table | Purpose | Primary Key | Key Security & Relationships |
| :--- | :--- | :--- | :--- |
| `profiles` | Extended user records & staff roles | `UUID (auth.users)` | RLS enabled. Roles: `admin`, `treasury`, `concierge`, `customer`. |
| `listings` | Luxury cars, homes & properties catalog | `TEXT (slug/id)` | Public read access; staff-only write access. Indexes on category, mode, status. |
| `bookings` | Car rentals, test drives & property inspections | `TEXT (BK-xxxx)` | Public insert with receipt upload; staff CRM tracking. |
| `rmb_rates` | Treasury daily exchange rates ticker | `UUID` | Public read; treasury/admin write. Ticker feeds site header & calculators. |
| `rmb_exchange_requests` | 2-way RMB ⇄ NGN trade transactions | `TEXT (RMB-xxxx)` | Public order initiation, receipt verification, 30-min rate locking. |
| `customers` | Client CRM, lifetime spend & loyalty status | `TEXT (CUST-xxx)` | Staff only. Auto-tracks total bookings and spend in NGN. |
| `staff_activities` | Immutable audit log of administrative actions | `UUID` | Staff-only read & insert. Tracks rate changes, payout confirmations. |

---

## 2. Quick Setup (3 Minutes)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings > API**, copy your:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (keep private)

### Step 2: Configure Environment Variables
Create or update `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run the Schema & Seed Data
You can execute the setup directly in the Supabase **SQL Editor**:

1. Open **SQL Editor** in your Supabase dashboard.
2. Copy the contents of [`supabase/schema.sql`](./schema.sql) and click **RUN**.
3. Copy the contents of [`supabase/seed.sql`](./seed.sql) and click **RUN**.

*Alternatively, if using the Supabase CLI:*
```bash
supabase link --project-ref your-project-id
supabase db push
supabase db reset
```

---

## 3. Client Integration Usage

The application includes pre-configured client bindings in `lib/supabase/`:

### Browser Client (`lib/supabase/client.ts`):
```typescript
import { supabase } from '@/lib/supabase/client';

// Fetch all available luxury cars for rent
const { data: cars, error } = await supabase
  .from('listings')
  .select('*')
  .eq('category', 'cars')
  .eq('mode', 'rent')
  .eq('status', 'available');

// Submit an RMB exchange order
const { data: order, error } = await supabase
  .from('rmb_exchange_requests')
  .insert({
    id: 'RMB-0143',
    direction: 'naira_to_rmb',
    source_amount: 2154000,
    rate_applied: 215.40,
    destination_amount: 10000,
    customer_name: 'Chidi Okafor',
    customer_email: 'chidi.o@email.com',
    customer_whatsapp: '+234 803 000 0000',
    sender_bank: 'Premium Trust Bank'
  });
```

### Server Client (`lib/supabase/server.ts`):
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: rates } = await supabase
    .from('rmb_rates')
    .select('*')
    .eq('is_current', true)
    .single();

  return Response.json(rates);
}
```

---

## 4. Row Level Security (RLS) Details

- **Public Visitors**: Can browse all approved listings and current RMB exchange rates without logging in. Can initiate new car rental bookings, inspection requests, and currency orders.
- **Customers**: When logged in, can view and track their own booking receipts and settlement statuses.
- **Operations & Treasury Staff**: Users with role `admin`, `treasury`, or `concierge` in `public.profiles` have full management privileges across listings, payout approvals, rate ticker updates, and CRM logs.
