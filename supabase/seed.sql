-- ==============================================================================
-- BZ GROUP INITIAL SEED DATA FOR SUPABASE BAAS
-- ==============================================================================

-- 1. SEED RMB RATES
INSERT INTO public.rmb_rates (id, pay_rmb_rate, pay_naira_rate, updated_at_display, updated_by, is_current)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 205.00, 215.40, '9:30 AM Today', 'Admin (Treasury Desk)', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED LISTINGS (Cars & Properties)
INSERT INTO public.listings (
  id, category, mode, title, subtitle, slug, price, price_unit, price_formatted, caution_fee,
  images, location, state, status, featured, description, specs, features, inspection_available
) VALUES
-- Car Rental 1: Mercedes-Benz G63 AMG
(
  'car-gwagon-01',
  'cars',
  'rent',
  'Mercedes-Benz G63 AMG (2024 Edition)',
  'Biturbo V8 Luxury SUV · Obsidian Black Metallic',
  'mercedes-benz-g63-amg-2024',
  350000.00,
  '/ day',
  '₦350,000 / day',
  100000.00,
  '["/photos/cars/gwagon-1.jpg", "/photos/cars/gwagon-2.jpg", "/photos/cars/gwagon-3.jpg"]'::jsonb,
  'Abuja Central Business District',
  'Abuja',
  'available',
  true,
  'The quintessential VIP commanding presence. Finished in flawless Obsidian Black with diamond-quilted Designo Nappa leather, AMG performance exhaust system, and optional chauffeured escort.',
  '{"make": "Mercedes-Benz", "model": "G63 AMG", "year": 2024, "bodyType": "SUV", "seats": 5, "transmission": "Automatic", "fuelType": "Petrol", "engine": "4.0L V8 Biturbo", "driverOption": "Self-drive or Chauffeured"}'::jsonb,
  '["Chauffeured VIP escort option", "Armored ballistic glass available", "Burmester Surround Sound", "Chilled center console compartment"]'::jsonb,
  true
),
-- Car Rental 2: Rolls-Royce Cullinan
(
  'car-cullinan-01',
  'cars',
  'rent',
  'Rolls-Royce Cullinan Series II',
  'Ultra-Luxury SUV · Arctic White / Mandarin Hide',
  'rolls-royce-cullinan-series-2',
  950000.00,
  '/ day',
  '₦950,000 / day',
  250000.00,
  '["/photos/cars/cullinan-1.jpg", "/photos/cars/cullinan-2.jpg"]'::jsonb,
  'Maitama, Abuja',
  'Abuja',
  'available',
  true,
  'Effortless everywhere. Rolls-Royce Cullinan provides unmatched acoustic insulation, shooting-star starlight headliner, and rear theater configuration for diplomatic convoys.',
  '{"make": "Rolls-Royce", "model": "Cullinan", "year": 2024, "bodyType": "SUV", "seats": 4, "transmission": "Automatic", "fuelType": "Petrol", "engine": "6.75L V12 Twin-Turbo", "driverOption": "Chauffeured only"}'::jsonb,
  '["Dedicated certified chauffeur included", "Shooting Star Starlight Headliner", "Rear entertainment & champagne cooler", "Motorized privacy curtains"]'::jsonb,
  true
),
-- Car Sale: Mercedes-Maybach S580
(
  'car-maybach-s580',
  'cars',
  'buy',
  'Mercedes-Maybach S580 4MATIC (Brand New)',
  'First-Class Executive Suite on Wheels · Two-Tone Ruby / Kalahari Gold',
  'mercedes-maybach-s580-4matic-brand-new',
  380000000.00,
  '',
  '₦380,000,000',
  0.00,
  '["/photos/cars/maybach-1.jpg", "/photos/cars/maybach-2.jpg"]'::jsonb,
  'Victoria Island, Lagos / Abuja CBD',
  'Abuja',
  'available',
  true,
  'Zero mileage, direct factory specification with executive reclining rear seats, rear-axle steering, Burmester high-end 4D sound, and complete Nigerian customs clearance papers.',
  '{"make": "Mercedes-Maybach", "model": "S580 4MATIC", "year": 2025, "bodyType": "Sedan", "seats": 4, "transmission": "Automatic", "fuelType": "Petrol Hybrid", "engine": "4.0L V8 Mild Hybrid", "driverOption": "Chauffeured"}'::jsonb,
  '["Full duty & customs papers verified", "Rear executive calf-rest massage seats", "Executive silver champagne flutes", "Active road-noise cancellation"]'::jsonb,
  true
),
-- Property Rental 1: 5-Bed Ambassadorial Villa
(
  'prop-asokoro-villa',
  'homes',
  'rent',
  '5-Bedroom Ambassadorial Villa with Infinity Pool',
  'Panoramic Hillside Estate · Full Smart Home Automation',
  '5-bedroom-ambassadorial-villa-asokoro',
  45000000.00,
  '/ year',
  '₦45,000,000 / year',
  0.00,
  '["/photos/properties/villa-1.jpg", "/photos/properties/villa-2.jpg"]'::jsonb,
  'Asokoro Hills, Abuja',
  'Abuja',
  'available',
  true,
  'A masterwork in contemporary architecture. Boasts bullet-resistant diplomatic windows, twin 100kVA soundproof Cat generators, industrial solar backup, private cinema, and Olympic-length infinity pool.',
  '{"type": "Villa", "bedrooms": 5, "bathrooms": 6, "toilets": 7, "parkingSpaces": 8, "sizeSqm": 1850, "serviced": true, "furnishing": "Fully Furnished"}'::jsonb,
  '["Private Olympic infinity pool", "Bullet-resistant diplomatic glazing", "Private cinema & wine cellar", "24/7 armed private patrol"]'::jsonb,
  true
),
-- Property Sale 1: Diplomatic Mansion Maitama
(
  'prop-maitama-mansion',
  'properties',
  'buy',
  'Architectural Masterpiece Mansion on 2,400 SQM',
  'Private Gated Compound · Certificate of Occupancy (FCDA Verified)',
  'architectural-masterpiece-mansion-maitama',
  1650000000.00,
  '',
  '₦1,650,000,000',
  0.00,
  '["/photos/properties/mansion-1.jpg", "/photos/properties/mansion-2.jpg"]'::jsonb,
  'Maitama Diplomatic Zone, Abuja',
  'Abuja',
  'available',
  true,
  'Positioned on the most prestigious boulevard in Nigeria. Freehold Certificate of Occupancy, marble floors imported from Carrara, smart biometric security gates, and 4-bedroom detached staff quarters.',
  '{"type": "Mansion", "bedrooms": 7, "bathrooms": 8, "toilets": 9, "parkingSpaces": 14, "sizeSqm": 2400, "serviced": true, "furnishing": "Luxury Semi-Furnished"}'::jsonb,
  '["Verified Federal C of O in hand", "Imported Carrara Italian marble", "4-Room detached staff quarters (BQ)", "Dedicated transformer & solar plant"]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED INITIAL BOOKINGS
INSERT INTO public.bookings (
  id, type, listing_id, listing_title, listing_image, customer_name, customer_phone, customer_email,
  start_date, end_date, driver_option, pickup_location, total_amount, payment_status, booking_status, notes
) VALUES
(
  'BK-2292',
  'car_rental',
  'car-gwagon-01',
  'Mercedes-Benz G63 AMG (2024 Edition)',
  '/photos/cars/gwagon-1.jpg',
  'Chidi Okafor',
  '0803 000 0000',
  'chidi.o@email.com',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '5 days',
  'Self-drive',
  'Transcorp Hilton Abuja',
  1050000.00,
  'verified',
  'confirmed',
  'Flight lands at 11:30 AM at Nnamdi Azikiwe Airport. Meet at VIP terminal.'
),
(
  'INS-0318',
  'property_inspection',
  'prop-asokoro-villa',
  '5-Bedroom Ambassadorial Villa with Infinity Pool',
  '/photos/properties/villa-1.jpg',
  'Hajia Amina Bello',
  '0802 444 1122',
  'amina.bello@energycorp.ng',
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '1 day',
  'Chauffeured',
  'Asokoro Site Gate',
  0.00,
  'pending',
  'confirmed',
  'Free accompanied viewing with Chief Surveyor and executive architect.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED RMB EXCHANGE REQUESTS
INSERT INTO public.rmb_exchange_requests (
  id, direction, source_amount, rate_applied, destination_amount, destination_channel,
  destination_account_details, customer_name, customer_email, customer_whatsapp, sender_bank,
  sender_account_name, receipt_url, status, rate_locked_until, notes
) VALUES
(
  'RMB-0142',
  'naira_to_rmb',
  2154000.00,
  215.40,
  10000.00,
  'Alipay, WeChat Pay or bank',
  'Alipay: chidi.okafor@china-trader.cn',
  'Chidi Okafor',
  'chidi.o@email.com',
  '+234 803 000 0000',
  'Premium Trust Bank',
  'Chidi Okafor',
  'transfer-receipt.pdf',
  'receipt_received',
  NOW() + INTERVAL '24 minutes',
  'Transfer receipt uploaded via checkout page. Treasury desk verifying inflow.'
),
(
  'RMB-0141',
  'rmb_to_naira',
  50000.00,
  205.00,
  10250000.00,
  'Nigerian Bank Transfer',
  'Zenith Bank: 1012994820 (Obi Importers Ltd)',
  'Chief Emeka Nwosu',
  'emeka@nwosugroup.com',
  '+234 803 999 8888',
  'WeChat Pay Enterprise',
  'Guangzhou Cargo Desk',
  'wechat_inflow_slip.png',
  'approved',
  NOW() - INTERVAL '1 hour',
  'Yuan landed in treasury WeChat Pay account. Paid out ₦10.25M to Zenith Bank.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CUSTOMERS (CRM)
INSERT INTO public.customers (
  id, name, email, phone, location, total_bookings, lifetime_spend_ngn, status, notes
) VALUES
(
  'CUST-001',
  'Chidi Okafor',
  'chidi.o@email.com',
  '0803 000 0000',
  'Abuja, FCT',
  4,
  5850000.00,
  'vip',
  'High-volume importer. Regularly books luxury escort vehicles and converts ¥10,000–¥50,000 RMB weekly.'
),
(
  'CUST-002',
  'Hajia Amina Bello',
  'amina.bello@energycorp.ng',
  '0802 444 1122',
  'Maitama, Abuja',
  2,
  45000000.00,
  'vip',
  'Executive client inspecting luxury ambassadorial villas in Asokoro and Maitama.'
)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED AUDIT LOGS
INSERT INTO public.staff_activities (staff_name, staff_role, action, target, details)
VALUES
  ('Chidi Okafor (COO)', 'Master Admin', 'Updated Rates', 'RMB Treasury', 'Adjusted Pay Naira rate to ¥1 = ₦215.40 and Pay RMB to ¥1 = ₦205.00'),
  ('Treasury Desk', 'Treasury', 'Verified Payment', 'RMB-0141', 'Verified ¥50,000 inflow and executed ₦10,250,000 bank settlement'),
  ('Concierge Lead', 'Concierge', 'Confirmed Booking', 'BK-2292', 'Arranged G63 AMG delivery to VIP Terminal for client');
