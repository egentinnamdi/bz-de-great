import {
  ProductCategory,
  Product,
  ProductOrder,
  OrderItem,
  StudioService,
  StudioBooking,
  EquipmentItem,
  EquipmentRental,
  EventItem,
  DigitalTicket,
} from './types';

export const INITIAL_PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-phones',
    name: 'Phones',
    slug: 'phones',
    description: 'Factory-unlocked flagship smartphones with verified warranty and battery health.',
    icon: 'Smartphone',
    active: true,
    specFields: ['Brand', 'Model', 'Storage', 'RAM', 'Display', 'Battery', 'Camera', 'Processor', 'Color', 'Condition', 'Warranty'],
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Executive workstations, MacBooks, and creator laptops inspected by our engineers.',
    icon: 'Laptop',
    active: true,
    specFields: ['Brand', 'Model', 'Processor', 'RAM', 'Storage', 'GPU', 'Display', 'OS', 'Condition', 'Warranty'],
  },
  {
    id: 'cat-gadgets',
    name: 'Gadgets',
    slug: 'gadgets',
    description: 'Tablets, smartwatches, noise-cancelling audio, drones, and everyday carry tech.',
    icon: 'Watch',
    active: true,
    specFields: ['Brand', 'Model', 'Connectivity', 'Battery Life', 'Compatibility', 'Condition', 'Warranty'],
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: '4K/8K OLED televisions, home cinema soundbars, smart appliances, and office electronics.',
    icon: 'Tv',
    active: true,
    specFields: ['Brand', 'Model', 'Display / Capacity', 'Power Rating', 'Features', 'Condition', 'Warranty'],
  },
  {
    id: 'cat-solar-inverters',
    name: 'Solar & Inverters',
    slug: 'solar-inverters',
    description: 'Hybrid inverters, LiFePO4 lithium battery banks, and monocrystalline solar panels.',
    icon: 'Sun',
    active: true,
    specFields: ['Brand', 'Capacity / Wattage', 'Voltage', 'Type', 'Battery Compatibility', 'Warranty'],
  },
  {
    id: 'cat-clothing',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Executive Senator ensembles, tailored kaftans, luxury streetwear, and corporate attire.',
    icon: 'Shirt',
    active: true,
    specFields: ['Brand', 'Size', 'Color', 'Material', 'Fit', 'Quantity'],
  },
  {
    id: 'cat-jewelry',
    name: 'Jewelry',
    slug: 'jewelry',
    description: '18K gold chains, certified wristwatches, diamond-cut rings, and luxury cufflinks.',
    icon: 'Gem',
    active: true,
    specFields: ['Material', 'Type', 'Color', 'Size', 'Weight', 'Brand', 'Condition', 'Warranty'],
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- PHONES ---
  {
    id: 'prod-phone-1',
    name: 'iPhone 16 Pro Max',
    slug: 'iphone-16-pro-max',
    categoryId: 'cat-phones',
    categorySlug: 'phones',
    brand: 'Apple',
    condition: 'Brand New',
    warranty: '1 Year Apple Official Warranty',
    description: 'Factory-sealed iPhone 16 Pro Max in Natural Titanium. Physical + eSIM unlocked for all Nigerian and international networks, featuring A18 Pro chip and 4K 120fps Dolby Vision camera system.',
    price: 2350000,
    compareAtPrice: 2500000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
      '/photos/gallery-bz-1.jpg',
    ],
    stock: 9,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'Apple',
      Model: 'iPhone 16 Pro Max',
      Storage: '256GB / 512GB',
      RAM: '8GB Unified',
      Display: '6.9" Super Retina XDR ProMotion 120Hz',
      Battery: '4,685 mAh (33 hrs video playback)',
      Camera: '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto',
      Processor: 'Apple A18 Pro (3nm)',
      Color: 'Natural Titanium',
      Condition: 'Brand New (Factory Sealed)',
      Warranty: '1 Year Apple Care Eligible',
    },
    variants: [
      {
        id: 'var-ip16pm-256-nat',
        sku: 'IP16PM-256-NAT',
        label: '256GB · Natural Titanium',
        attributes: { Storage: '256GB', Color: 'Natural Titanium' },
        price: 2350000,
        stock: 5,
      },
      {
        id: 'var-ip16pm-512-des',
        sku: 'IP16PM-512-DES',
        label: '512GB · Desert Titanium',
        attributes: { Storage: '512GB', Color: 'Desert Titanium' },
        price: 2680000,
        stock: 4,
      },
    ],
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'prod-phone-2',
    name: 'Samsung Galaxy S24 Ultra 5G',
    slug: 'samsung-galaxy-s24-ultra-5g',
    categoryId: 'cat-phones',
    categorySlug: 'phones',
    brand: 'Samsung',
    condition: 'Brand New',
    warranty: '24 Months Samsung Nigeria Warranty',
    description: 'Titanium-framed Galaxy S24 Ultra with integrated S-Pen, Galaxy AI live translation, 200MP quad-telephoto camera system, and Snapdragon 8 Gen 3 for Galaxy.',
    price: 1980000,
    compareAtPrice: 2120000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 7,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'Samsung',
      Model: 'Galaxy S24 Ultra (SM-S928B/DS)',
      Storage: '512GB UFS 4.0',
      RAM: '12GB LPDDR5X',
      Display: '6.8" Dynamic LTPO AMOLED 2X (2600 nits)',
      Battery: '5,000 mAh (45W Fast Charge)',
      Camera: '200MP Wide + 50MP Periscope + 10MP Tele + 12MP Ultra-Wide',
      Processor: 'Snapdragon 8 Gen 3 for Galaxy',
      Color: 'Titanium Grey',
      Condition: 'Brand New',
      Warranty: '2 Years Samsung Nigeria',
    },
    variants: [
      {
        id: 'var-s24u-512-grey',
        sku: 'S24U-512-GRY',
        label: '512GB · Titanium Grey',
        attributes: { Storage: '512GB', Color: 'Titanium Grey' },
        price: 1980000,
        stock: 4,
      },
      {
        id: 'var-s24u-512-blk',
        sku: 'S24U-512-BLK',
        label: '512GB · Titanium Black',
        attributes: { Storage: '512GB', Color: 'Titanium Black' },
        price: 1980000,
        stock: 3,
      },
    ],
    createdAt: '2026-10-11T10:00:00Z',
  },

  // --- LAPTOPS ---
  {
    id: 'prod-laptop-1',
    name: 'MacBook Pro 16" M3 Max (36GB / 1TB)',
    slug: 'macbook-pro-16-m3-max',
    categoryId: 'cat-laptops',
    categorySlug: 'laptops',
    brand: 'Apple',
    condition: 'Brand New',
    warranty: '1 Year Apple Warranty',
    description: 'Built for cinema editors, software architects, and studio directors. Space Black anodized finish with Liquid Retina XDR display and 22-hour battery life.',
    price: 4950000,
    compareAtPrice: 5250000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 4,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'Apple',
      Model: 'MacBook Pro 16-inch (Late 2024)',
      Processor: 'Apple M3 Max (14-core CPU)',
      RAM: '36GB Unified Memory',
      Storage: '1TB NVMe SSD',
      GPU: '30-core Apple GPU with Hardware Ray Tracing',
      Display: '16.2" Liquid Retina XDR (3456 x 2234)',
      OS: 'macOS Sequoia',
      Condition: 'Brand New',
      Warranty: '1 Year Official Apple Warranty',
    },
    variants: [
      {
        id: 'var-mbp16-36-1tb',
        sku: 'MBP16-M3M-1TB',
        label: '36GB RAM · 1TB SSD · Space Black',
        attributes: { RAM: '36GB', Storage: '1TB', Color: 'Space Black' },
        price: 4950000,
        stock: 3,
      },
      {
        id: 'var-mbp16-48-2tb',
        sku: 'MBP16-M3M-2TB',
        label: '48GB RAM · 2TB SSD · Space Black',
        attributes: { RAM: '48GB', Storage: '2TB', Color: 'Space Black' },
        price: 5650000,
        stock: 1,
      },
    ],
    createdAt: '2026-10-12T11:00:00Z',
  },
  {
    id: 'prod-laptop-2',
    name: 'Dell XPS 15 OLED (Core i9 · 32GB · RTX 4070)',
    slug: 'dell-xps-15-oled-i9',
    categoryId: 'cat-laptops',
    categorySlug: 'laptops',
    brand: 'Dell',
    condition: 'Brand New',
    warranty: '12 Months ProSupport Warranty',
    description: 'CNC machined aluminum and carbon fiber palm rest with a breathtaking 3.5K OLED touch InfinityEdge display and NVIDIA GeForce RTX 4070 graphics.',
    price: 3150000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 5,
    status: 'published',
    featured: false,
    specifications: {
      Brand: 'Dell',
      Model: 'XPS 15 9530',
      Processor: '13th Gen Intel Core i9-13900H (14-Core)',
      RAM: '32GB DDR5 4800MHz',
      Storage: '1TB PCIe Gen 4 SSD',
      GPU: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      Display: '15.6" 3.5K (3456x2160) OLED Touch',
      OS: 'Windows 11 Pro',
      Condition: 'Brand New',
      Warranty: '12 Months Dell ProSupport',
    },
    createdAt: '2026-10-13T09:30:00Z',
  },

  // --- GADGETS ---
  {
    id: 'prod-gadget-1',
    name: 'Apple Watch Ultra 2 (49mm Titanium + Alpine Loop)',
    slug: 'apple-watch-ultra-2-49mm',
    categoryId: 'cat-gadgets',
    categorySlug: 'gadgets',
    brand: 'Apple',
    condition: 'Brand New',
    warranty: '1 Year Apple Warranty',
    description: 'Rugged aerospace-grade titanium case, 3000-nit sapphire front crystal display, dual-frequency precision GPS, and up to 72 hours of low-power autonomy.',
    price: 1280000,
    compareAtPrice: 1350000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 8,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'Apple',
      Model: 'Watch Ultra 2 (GPS + Cellular)',
      Connectivity: 'LTE, UMTS, Wi-Fi 4, Bluetooth 5.3, Ultra Wideband',
      'Battery Life': '36 Hours Normal / 72 Hours Low Power',
      Compatibility: 'iPhone Xs or later with iOS 18+',
      Condition: 'Brand New',
      Warranty: '1 Year Apple Warranty',
    },
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'prod-gadget-2',
    name: 'DJI Air 3 Fly More Combo (DJI RC 2)',
    slug: 'dji-air-3-fly-more-combo',
    categoryId: 'cat-gadgets',
    categorySlug: 'gadgets',
    brand: 'DJI',
    condition: 'Brand New',
    warranty: '12 Months DJI Care Coverage',
    description: 'Dual-primary camera system (Wide-Angle + 3x Medium Telephoto), 46-minute flight time, omnidirectional obstacle sensing, and 3 intelligent flight batteries.',
    price: 2290000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 4,
    status: 'published',
    featured: false,
    specifications: {
      Brand: 'DJI',
      Model: 'Air 3 Fly More Combo (RC 2 Screen Controller)',
      Connectivity: 'DJI O4 20km 1080p/60fps Video Transmission',
      'Battery Life': '46 Minutes per battery (3 batteries included)',
      Compatibility: 'Standalone RC 2 FHD Built-in Screen',
      Condition: 'Brand New',
      Warranty: '1 Year Warranty',
    },
    createdAt: '2026-10-14T14:00:00Z',
  },

  // --- ELECTRONICS ---
  {
    id: 'prod-elec-1',
    name: 'LG OLED evo C4 65-Inch 4K Smart TV (2025 Model)',
    slug: 'lg-oled-evo-c4-65-inch',
    categoryId: 'cat-electronics',
    categorySlug: 'electronics',
    brand: 'LG',
    condition: 'Brand New',
    warranty: '2 Years Fouani LG Nigeria Warranty',
    description: 'Self-lit OLED 4K pixels powered by the α9 AI Processor Gen7, Brightness Booster, Dolby Vision & Dolby Atmos, and 144Hz VRR gaming responsiveness.',
    price: 2650000,
    compareAtPrice: 2850000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 6,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'LG',
      Model: 'OLED65C46LA',
      'Display / Capacity': '65" 4K Ultra HD OLED evo (3840 x 2160, 120Hz/144Hz)',
      'Power Rating': 'AC 100-240V 50/60Hz (Energy Saving Mode)',
      Features: 'Dolby Vision, Dolby Atmos, webOS 24, 4x HDMI 2.1, Apple AirPlay 2',
      Condition: 'Brand New',
      Warranty: '2 Years Official LG Warranty',
    },
    createdAt: '2026-10-15T10:00:00Z',
  },

  // --- SOLAR & INVERTERS ---
  {
    id: 'prod-solar-1',
    name: 'Deye 8kVA / 8kW Hybrid Solar Inverter + 10kWh LiFePO4 Lithium Pack',
    slug: 'deye-8kw-hybrid-inverter-10kwh-lithium-bundle',
    categoryId: 'cat-solar-inverters',
    categorySlug: 'solar-inverters',
    brand: 'Deye',
    condition: 'Brand New',
    warranty: '5 Years Inverter & Battery Warranty',
    description: 'Complete executive home & office solar power system. Includes 8kW Deye Dual-MPPT Hybrid Inverter and wall-mounted 48V 200Ah (10.24kWh) LiFePO4 battery bank. Runs ACs, freezers, lighting, and workstations seamlessly.',
    price: 5400000,
    compareAtPrice: 5800000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 5,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'Deye',
      'Capacity / Wattage': '8kW Continuous / 16kW Peak + 10.24kWh Lithium Storage',
      Voltage: '48V DC System / 230V Pure Sine Wave AC',
      Type: 'IP65 Hybrid Solar Inverter + Grade-A LiFePO4 Wall Battery',
      'Battery Compatibility': 'LiFePO4 BMS Smart Comms (CAN/RS485) & Lead-Acid',
      Warranty: '5 Years Manufacturer & Installation Support (Abuja & Lagos)',
    },
    variants: [
      {
        id: 'var-deye-8kw-10kwh',
        sku: 'SOL-DEYE-8K-10K',
        label: '8kW Inverter + 10kWh Lithium Battery',
        attributes: { Capacity: '8kW + 10kWh' },
        price: 5400000,
        stock: 3,
      },
      {
        id: 'var-deye-8kw-10kwh-panels',
        sku: 'SOL-DEYE-8K-FULL',
        label: 'Full Kit (+ 12x 550W Jinko Monocrystalline Panels)',
        attributes: { Capacity: '8kW + 10kWh + 12x 550W Panels' },
        price: 6950000,
        stock: 2,
      },
    ],
    createdAt: '2026-10-16T09:00:00Z',
  },
  {
    id: 'prod-solar-2',
    name: 'Jinko Tiger Neo 580W N-Type Monocrystalline Solar Panel (Pallet / Single)',
    slug: 'jinko-tiger-neo-580w-solar-panel',
    categoryId: 'cat-solar-inverters',
    categorySlug: 'solar-inverters',
    brand: 'Jinko Solar',
    condition: 'Brand New',
    warranty: '25 Years Linear Power Output Warranty',
    description: 'High-efficiency N-type TOPCon Half-Cell 580W monocrystalline solar modules engineered for intense West African sunlight and low-irradiance cloudy conditions.',
    price: 165000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 40,
    status: 'published',
    featured: false,
    specifications: {
      Brand: 'Jinko Solar',
      'Capacity / Wattage': '580W Peak Output (22.45% Module Efficiency)',
      Voltage: '51.2V Voc / 42.8V Vmp',
      Type: 'N-Type Monocrystalline Bifacial-Grade Half-Cell',
      'Battery Compatibility': 'Compatible with 24V / 48V MPPT Charge Controllers',
      Warranty: '12 Years Product / 25 Years Linear Performance',
    },
    createdAt: '2026-10-16T11:30:00Z',
  },

  // --- CLOTHING ---
  {
    id: 'prod-cloth-1',
    name: 'BZ Bespoke Cashmere Executive Senator Suit',
    slug: 'bz-bespoke-cashmere-senator-suit',
    categoryId: 'cat-clothing',
    categorySlug: 'clothing',
    brand: 'BZ Atelier',
    condition: 'Brand New',
    warranty: 'Complimentary Tailoring Adjustment',
    description: 'Hand-finished Italian cashmere-wool blend executive Senator two-piece with subtle tonal embroidery and mother-of-pearl cuff detailing.',
    price: 245000,
    compareAtPrice: 280000,
    currency: 'NGN',
    images: [
      '/photos/founder-bz-3.jpg',
      '/photos/gallery-bz-6.jpg',
    ],
    stock: 15,
    status: 'published',
    featured: true,
    specifications: {
      Brand: 'BZ Atelier',
      Size: 'M, L, XL, XXL',
      Color: 'Deep Wine / Obsidian Black / Ivory',
      Material: '180s Italian Superfine Cashmere Wool',
      Fit: 'Tailored Executive Fit',
      Quantity: '2-Piece Set (Tunic & Trousers)',
    },
    variants: [
      {
        id: 'var-cloth-sen-l-wine',
        sku: 'BZ-SEN-L-WINE',
        label: 'Size L · Deep Wine',
        attributes: { Size: 'L', Color: 'Deep Wine' },
        price: 245000,
        stock: 6,
      },
      {
        id: 'var-cloth-sen-xl-blk',
        sku: 'BZ-SEN-XL-BLK',
        label: 'Size XL · Obsidian Black',
        attributes: { Size: 'XL', Color: 'Obsidian Black' },
        price: 245000,
        stock: 5,
      },
      {
        id: 'var-cloth-sen-xxl-ivy',
        sku: 'BZ-SEN-XXL-IVY',
        label: 'Size XXL · Royal Ivory',
        attributes: { Size: 'XXL', Color: 'Royal Ivory' },
        price: 255000,
        stock: 4,
      },
    ],
    createdAt: '2026-10-17T08:00:00Z',
  },

  // --- JEWELRY ---
  {
    id: 'prod-jewelry-1',
    name: '18K Solid Gold Cuban Link Chain & Bracelet Set (22-Inch)',
    slug: '18k-solid-gold-cuban-link-set',
    categoryId: 'cat-jewelry',
    categorySlug: 'jewelry',
    brand: 'BZ Fine Jewelry',
    condition: 'Brand New',
    warranty: 'Lifetime Gold Purity Certificate & Assay Card',
    description: 'Hand-polished 18K Italian yellow gold Miami Cuban link chain (22 inches, 8mm width) with matching box-clasp bracelet. Delivered in a locked mahogany presentation vault.',
    price: 3850000,
    compareAtPrice: 4100000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
    ],
    stock: 4,
    status: 'published',
    featured: true,
    specifications: {
      Material: '18K Solid Italian Yellow Gold (750 Hallmarked)',
      Type: 'Necklace & Bracelet Set',
      Color: 'Yellow Gold',
      Size: '22" Chain + 8.5" Bracelet (8mm Width)',
      Weight: '44.5 Grams Total',
      Brand: 'BZ Fine Jewelry',
      Condition: 'Brand New (Vault Sealed)',
      Warranty: 'Certificate of Authenticity & Lifetime Buy-Back Guarantee',
    },
    createdAt: '2026-10-18T12:00:00Z',
  },
];

export const INITIAL_PRODUCT_ORDERS: ProductOrder[] = [
  {
    id: 'ORD-4101',
    reference: 'ORD-4101',
    items: [
      {
        productId: 'prod-phone-1',
        productName: 'iPhone 16 Pro Max',
        productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
        variantId: 'var-ip16pm-256-nat',
        variantLabel: '256GB · Natural Titanium',
        unitPrice: 2350000,
        quantity: 1,
        lineTotal: 2350000,
      },
    ],
    subtotalAmount: 2350000,
    deliveryFee: 15000,
    totalAmount: 2365000,
    customerName: 'Chidi Okafor',
    customerPhone: '+234 803 234 5678',
    customerEmail: 'chidi.okafor@primegroup.ng',
    deliveryAddress: '14 Danube Street, Maitama',
    deliveryState: 'Abuja (FCT)',
    orderStatus: 'confirmed',
    paymentStatus: 'verified',
    notes: 'Deliver before 4:00 PM to Maitama office reception.',
    createdAt: '2026-10-22T11:20:00Z',
  },
  {
    id: 'ORD-4102',
    reference: 'ORD-4102',
    items: [
      {
        productId: 'prod-solar-1',
        productName: 'Deye 8kVA / 8kW Hybrid Solar Inverter + 10kWh LiFePO4 Lithium Pack',
        productImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=85',
        variantId: 'var-deye-8kw-10kwh',
        variantLabel: '8kW Inverter + 10kWh Lithium Battery',
        unitPrice: 5400000,
        quantity: 1,
        lineTotal: 5400000,
      },
    ],
    subtotalAmount: 5400000,
    deliveryFee: 25000,
    totalAmount: 5425000,
    customerName: 'Tunde Bello',
    customerPhone: '+234 809 876 5432',
    customerEmail: 'tunde.bello@apexholdings.com',
    deliveryAddress: 'Plot 8 Admiralty Way, Lekki Phase 1',
    deliveryState: 'Lagos State',
    orderStatus: 'processing',
    paymentStatus: 'receipt_uploaded',
    receiptUrl: '/photos/car-sedan-black.jpg',
    notes: 'Include installation engineer site assessment on delivery.',
    createdAt: '2026-10-24T15:10:00Z',
  },
];

export const INITIAL_STUDIO_SERVICES: StudioService[] = [
  {
    id: 'stu-srv-1',
    name: 'Executive Portrait & Editorial Session',
    slug: 'executive-portrait-editorial-session',
    serviceType: 'Portrait Session',
    description: 'Full-lighting portrait session in our creative studio. Ideal for CEOs, campaign portraits, personal branding, and luxury lookbooks.',
    durationHours: 2,
    price: 150000,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85',
      '/photos/founder-bz-3.jpg',
    ],
    location: 'BZ De Great Creative Studio',
    includes: [
      '2 Hours Exclusive Cyclorama & Editorial Set Access',
      'Lead Portrait Photographer + Lighting Assistant',
      '3 Outfit Changes & Private Changing Suite',
      '20 High-End Retouched Digital Portraits + All RAW Previews',
    ],
    availableSlots: ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'],
    status: 'active',
  },
  {
    id: 'stu-srv-2',
    name: 'Full Studio Rental (Photo + Video Cyclorama Stage)',
    slug: 'full-studio-rental-photo-video-stage',
    serviceType: 'Photo + Video Session',
    description: 'Book our acoustic-treated production stage for commercials, music videos, podcasts, and brand campaigns. Includes Profoto strobes and Aputure continuous cinema lighting.',
    durationHours: 4,
    price: 320000,
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85',
    ],
    location: 'BZ De Great Creative Studio',
    includes: [
      '4 Hours Full Studio & 4-Set Access (Podcast, Cyclorama, Lounge, Dark Set)',
      '100% Uninterrupted Solar + Soundproof Generator Power',
      '3x Aputure 600d Pro + 2x Profoto B10X Plus Modifiers',
      'VIP Makeup & Wardrobe Green Room',
    ],
    availableSlots: ['09:00 AM', '01:30 PM', '06:00 PM'],
    status: 'active',
  },
  {
    id: 'stu-srv-3',
    name: 'Commercial Product & E-Commerce Photography',
    slug: 'commercial-product-photography',
    serviceType: 'Product Photography',
    description: 'Macro and tabletop studio photography for jewelry, fashion lines, gadgets, and luxury packaging with crisp color-calibrated grading.',
    durationHours: 3,
    price: 220000,
    images: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=85',
    ],
    location: 'BZ De Great Creative Studio',
    includes: [
      'Up to 15 SKU Products Shot on Pure White & Styled Editorial Sets',
      'Macro Lens Rig + Motorized 360° Turntable',
      'High-Resolution Web + Billboard Print Exports',
    ],
    availableSlots: ['10:00 AM', '02:00 PM'],
    status: 'active',
  },
  {
    id: 'stu-srv-4',
    name: 'Luxury Event & Documentary Coverage (Full Day)',
    slug: 'luxury-event-documentary-coverage',
    serviceType: 'Event Photography',
    description: 'Multi-camera photography and 4K cinema highlight production for weddings, corporate summits, private galas, and estate launches across Lagos & Abuja.',
    durationHours: 8,
    price: 750000,
    images: [
      '/photos/gallery-bz-11.jpg',
    ],
    location: 'Creative Studio & On-Location Coverage',
    includes: [
      '2 Senior Photographers + 2 4K Cinema Videographers',
      'Licensed Drone Aerial Coverage',
      'Same-Day 60-Second Social Reel + 300+ Graded Photos',
    ],
    availableSlots: ['09:00 AM', '12:00 PM'],
    status: 'active',
  },
];

export const INITIAL_STUDIO_BOOKINGS: StudioBooking[] = [
  {
    id: 'STU-1041',
    reference: 'STU-1041',
    serviceId: 'stu-srv-1',
    serviceName: 'Executive Portrait & Editorial Session',
    serviceType: 'Portrait Session',
    date: '2026-11-20',
    timeSlot: '12:00 PM',
    durationHours: 2,
    location: 'BZ De Great Creative Studio',
    customerName: 'Amaka Eze',
    customerPhone: '+234 812 345 6789',
    customerEmail: 'amaka.eze@capitalpartners.ng',
    totalAmount: 150000,
    bookingStatus: 'confirmed',
    paymentStatus: 'verified',
    notes: 'Executive board portrait shoot — 3 corporate looks.',
    createdAt: '2026-10-23T10:00:00Z',
  },
];

export const INITIAL_EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'eq-cam-1',
    name: 'Sony FX3 Full-Frame Cinema Line Camera Body',
    slug: 'sony-fx3-cinema-camera',
    category: 'Cameras',
    brand: 'Sony',
    description: 'Netflix-approved 4K 120p full-frame cinema camera with XLR Top Handle Unit, dual CFexpress Type A cards (160GB x2), and 4x NP-FZ100 batteries.',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 85000,
    depositAmount: 150000,
    quantityTotal: 3,
    condition: 'Mint Studio Grade',
    specifications: {
      Sensor: 'Full-Frame Exmor R BSI CMOS (10.2MP / 15+ Stops Dynamic Range)',
      Mount: 'Sony E-Mount',
      Media: '2x 160GB CFexpress Type A Cards Included',
      Audio: 'XLR-H1 Top Handle with 2x XLR/TRS Inputs',
    },
    status: 'available',
  },
  {
    id: 'eq-cam-2',
    name: 'RED Komodo 6K Production Pack (RF/EF Mount)',
    slug: 'red-komodo-6k-production-pack',
    category: 'Cameras',
    brand: 'RED Digital Cinema',
    description: 'Global shutter Super 35 6K cinema camera rigged with SmallRig cage, Portkeys 7" daylight monitor, 2x 512GB RED PRO CFast cards, and V-Mount batteries.',
    images: [
      'https://images.unsplash.com/photo-1589872307379-0ffdf9829123?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 160000,
    depositAmount: 300000,
    quantityTotal: 2,
    condition: 'Mint Studio Grade',
    specifications: {
      Sensor: '6K Super 35 Global Shutter CMOS',
      Mount: 'Canon RF with EF ND Adapter Included',
      Media: '2x 512GB RED CFast 2.0 + Reader',
      Power: '2x 150Wh V-Mount Batteries + Dual Charger',
    },
    status: 'available',
  },
  {
    id: 'eq-lens-1',
    name: 'Sony FE 24-70mm f/2.8 GM II G-Master Lens',
    slug: 'sony-fe-24-70mm-f28-gm-ii',
    category: 'Lenses',
    brand: 'Sony',
    description: 'Flagship second-generation G-Master standard zoom with ultra-fast XD Linear AF motors, de-clickable aperture ring, and Tiffen Variable ND filter.',
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 35000,
    depositAmount: 75000,
    quantityTotal: 4,
    condition: 'Flawless Optics',
    specifications: {
      'Focal Length': '24-70mm Full-Frame',
      Aperture: 'Constant f/2.8 to f/22',
      'Filter Thread': '82mm (Variable ND 2-5 Stop Included)',
      Mount: 'Sony E-Mount',
    },
    status: 'available',
  },
  {
    id: 'eq-light-1',
    name: 'Aputure LS 600d Pro Daylight LED + Light Dome II',
    slug: 'aputure-ls-600d-pro-kit',
    category: 'Lighting',
    brand: 'Aputure',
    description: '600W COB daylight point-source LED fixture with weather-resistant control box, heavy-duty C-stand, and 35-inch Light Dome II quick-release softbox.',
    images: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 45000,
    depositAmount: 80000,
    quantityTotal: 4,
    condition: 'Studio Tested',
    specifications: {
      Output: '600W COB LED (8,500+ lux @ 3m with Hyper Reflector)',
      'Color Temp': '5600K Daylight Balanced (CRI/TLCI 96+)',
      Modifiers: 'Aputure Light Dome II + Eggcrate Grid + Heavy C-Stand',
      Power: 'AC Mains or Dual 48V V-Mount Battery Input',
    },
    status: 'available',
  },
  {
    id: 'eq-audio-1',
    name: 'DJI Mic 2 (2 TX + 1 RX + Charging Case) + Sennheiser MKH 416 Boom Kit',
    slug: 'dji-mic-2-sennheiser-boom-combo',
    category: 'Audio Equipment',
    brand: 'Sennheiser / DJI',
    description: 'Broadcast-grade 32-bit float dual wireless lavalier system paired with the industry-standard Sennheiser MKH 416 shotgun microphone, carbon boom pole, and Zoom F6 recorder.',
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 40000,
    depositAmount: 70000,
    quantityTotal: 3,
    condition: 'Mint Studio Grade',
    specifications: {
      Wireless: 'DJI Mic 2 (32-Bit Float Internal Recording + Intelligent Noise Cancelling)',
      Shotgun: 'Sennheiser MKH 416-P48U3 + Rycote Blimp + 3m Carbon Boom',
      Recorder: 'Zoom F6 6-Input / 14-Track 32-Bit Float Field Recorder',
    },
    status: 'available',
  },
  {
    id: 'eq-rig-1',
    name: 'DJI RS 4 Pro Gimbal Combo + Sachtler Flowtech 75 Fluid Head Tripod',
    slug: 'dji-rs4-pro-sachtler-tripod-kit',
    category: 'Tripods',
    brand: 'DJI / Sachtler',
    description: 'Carbon-fiber 4.5kg payload motorized stabilizer with LiDAR Focus Pro motor plus a Sachtler Flowtech 75 rapid-deploy carbon tripod for rock-solid cinema pans.',
    images: [
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1000&q=85',
    ],
    dailyRate: 42000,
    depositAmount: 80000,
    quantityTotal: 3,
    condition: 'Mint Studio Grade',
    specifications: {
      Gimbal: 'DJI RS 4 Pro (4.5kg Payload, RavenEye Image Transmitter)',
      Tripod: 'Sachtler Aktiv8 Fluid Head + Flowtech 75 Carbon Fiber Legs',
      Battery: 'BG30 Grip (29.5 Hours Runtime)',
    },
    status: 'available',
  },
];

export const INITIAL_EQUIPMENT_RENTALS: EquipmentRental[] = [
  {
    id: 'RNT-3081',
    reference: 'RNT-3081',
    equipmentId: 'eq-cam-1',
    equipmentName: 'Sony FX3 Full-Frame Cinema Line Camera Body',
    equipmentCategory: 'Cameras',
    equipmentImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85',
    startDate: '2026-11-18',
    endDate: '2026-11-20',
    days: 3,
    quantity: 1,
    dailyRate: 85000,
    depositAmount: 150000,
    totalAmount: 405000, // (85000 * 3 * 1) + 150000
    customerName: 'Tunde Bello',
    customerPhone: '+234 809 876 5432',
    customerEmail: 'tunde.bello@apexholdings.com',
    pickupLocation: 'BZ De Great Creative Studio',
    rentalStatus: 'confirmed',
    paymentStatus: 'verified',
    notes: 'Pickup 8:30 AM with valid NIN & production ID.',
    createdAt: '2026-10-24T12:00:00Z',
  },
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-lagos-gala-2026',
    name: 'BZ De Great Luxury Auto, Real Estate & Creative Gala 2026',
    slug: 'bz-luxury-auto-real-estate-gala-2026',
    description: 'An exclusive evening bringing together real estate investors, automotive collectors, tech founders, and Lagos creative directors. Featuring live showcase of 2026 flagship SUVs, private estate unveilings, live orchestra, and executive networking.',
    image: '/photos/hero-villa-suv.jpg',
    venue: 'Eko Hotel & Suites — Grand Ballroom, Victoria Island',
    city: 'Lagos State',
    date: '2026-12-12',
    startTime: '06:00 PM',
    endTime: '11:30 PM',
    organizer: 'BZ De Great Group',
    status: 'published',
    featured: true,
    ticketTiers: [
      {
        id: 'tier-gala-reg',
        name: 'Regular Pass',
        price: 50000,
        capacity: 150,
        sold: 42,
        perks: ['Red Carpet Arrival', 'Exhibition & Showroom Access', 'Welcome Cocktail & Canapés'],
      },
      {
        id: 'tier-gala-vip',
        name: 'VIP Executive Seat',
        price: 150000,
        capacity: 60,
        sold: 19,
        perks: ['Reserved Front-Section Lounge Seating', '3-Course Gourmet Dinner & Champagne', 'Priority Investor Deal Dossier'],
      },
      {
        id: 'tier-gala-vvip',
        name: 'VVIP Table Experience',
        price: 500000,
        capacity: 20,
        sold: 6,
        perks: ['Chauffeured Executive Drop-Off (Lagos Island)', 'Private Founder & CEO Roundtable Access', 'Luxury Gift Vault & Dedicated Butler'],
      },
    ],
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'evt-studio-masterclass-2026',
    name: 'Lagos Cinema Lighting & Commercial Directing Masterclass',
    slug: 'lagos-cinema-lighting-masterclass-2026',
    description: 'Hands-on full-day production intensive hosted inside the BZ De Great Creative Studio. Learn high-speed Profoto commercial strobe lighting, RED/Sony FX3 color workflow, and luxury brand storytelling.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85',
    venue: 'BZ De Great Creative Studio',
    city: 'Lagos State',
    date: '2026-11-28',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    organizer: 'BZ Creative Studio',
    status: 'published',
    featured: true,
    ticketTiers: [
      {
        id: 'tier-mc-reg',
        name: 'Creator Pass',
        price: 35000,
        capacity: 40,
        sold: 14,
        perks: ['Full Day Live Set Walkthrough', 'LUTs & Lighting Diagrams Pack', 'Catered Lunch & Networking'],
      },
      {
        id: 'tier-mc-vip',
        name: 'Director Pro Pass',
        price: 85000,
        capacity: 15,
        sold: 5,
        perks: ['1-on-1 Hands-On Camera Rigging Slot', '₦50,000 Voucher Towards Next Studio/Gear Rental', 'Certificate of Completion'],
      },
    ],
    createdAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'evt-abuja-investors-summit',
    name: 'Abuja Prime Property & Solar Infrastructure Private Briefing',
    slug: 'abuja-prime-property-solar-briefing',
    description: 'Private investor briefing on Maitama/Asokoro titled developments, Asaba Millennium City land banking, and off-grid commercial solar microgrids.',
    image: '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg',
    venue: 'Transcorp Hilton — Congress Hall, Maitama',
    city: 'Abuja (FCT)',
    date: '2026-12-05',
    startTime: '04:00 PM',
    endTime: '08:30 PM',
    organizer: 'BZ Homes & Properties',
    status: 'published',
    featured: false,
    ticketTiers: [
      {
        id: 'tier-abj-reg',
        name: 'Delegate Pass',
        price: 25000,
        capacity: 80,
        sold: 31,
        perks: ['Keynote & Estate Portfolio Dossier', 'Evening Refreshments'],
      },
      {
        id: 'tier-abj-vip',
        name: 'Private Investor Pass',
        price: 100000,
        capacity: 25,
        sold: 9,
        perks: ['1-on-1 Legal & C-of-O Verification Desk', 'Complimentary Private Site Inspection Convoy'],
      },
    ],
    createdAt: '2026-10-19T14:00:00Z',
  },
];

export const INITIAL_DIGITAL_TICKETS: DigitalTicket[] = [
  {
    id: 'TKT-8821',
    ticketCode: 'BZ-TKT-8821-7E4A',
    qrPayload: JSON.stringify({
      ticketId: 'TKT-8821',
      ticketCode: 'BZ-TKT-8821-7E4A',
      eventId: 'evt-lagos-gala-2026',
      tier: 'VIP Executive Seat',
      holder: 'Chidi Okafor',
    }),
    eventId: 'evt-lagos-gala-2026',
    eventName: 'BZ De Great Luxury Auto, Real Estate & Creative Gala 2026',
    eventDate: '2026-12-12',
    eventTime: '06:00 PM',
    eventVenue: 'Eko Hotel & Suites — Grand Ballroom, Victoria Island',
    eventImage: '/photos/hero-villa-suv.jpg',
    tierId: 'tier-gala-vip',
    tierName: 'VIP Executive Seat',
    quantity: 2,
    unitPrice: 150000,
    totalAmount: 300000,
    customerName: 'Chidi Okafor',
    customerPhone: '+234 803 234 5678',
    customerEmail: 'chidi.okafor@primegroup.ng',
    paymentStatus: 'verified',
    ticketStatus: 'valid',
    createdAt: '2026-10-23T16:45:00Z',
  },
];

// ============================================================================
// AUTHORITATIVE DOMAIN VALIDATION & BUSINESS LOGIC ENGINE
// ============================================================================

export function computeDeliveryFee(deliveryState: string, subtotalAmount: number): number {
  if (subtotalAmount <= 0) return 0;
  const normalized = deliveryState.toLowerCase();
  if (normalized.includes('pickup') || normalized.includes('walk-in')) {
    return 0;
  }
  if (normalized.includes('abuja') || normalized.includes('fct') || normalized.includes('lagos')) {
    return 15000;
  }
  return 25000;
}

export interface OrderInputLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderAuthoritativeResult {
  ok: boolean;
  error?: string;
  orderItems: OrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  updatedProducts: Product[];
}

/**
 * Validates product availability & stock, ignores any client-tampered prices,
 * computes authoritative line totals and order total, and decrements stock.
 */
export function calculateOrderAuthoritative(
  inputItems: OrderInputLine[],
  products: Product[],
  deliveryState: string
): OrderAuthoritativeResult {
  if (!inputItems || inputItems.length === 0) {
    return {
      ok: false,
      error: 'Your cart is empty. Add at least one product before placing an order.',
      orderItems: [],
      subtotalAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,
      updatedProducts: products,
    };
  }

  const clonedProducts: Product[] = products.map((p) => ({
    ...p,
    variants: p.variants ? p.variants.map((v) => ({ ...v })) : undefined,
  }));

  const orderItems: OrderItem[] = [];
  let subtotalAmount = 0;

  for (const line of inputItems) {
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isFinite(qty) || qty <= 0) {
      return {
        ok: false,
        error: 'Invalid item quantity in order.',
        orderItems: [],
        subtotalAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
        updatedProducts: products,
      };
    }

    const product = clonedProducts.find((p) => p.id === line.productId);
    if (!product || product.status !== 'published') {
      return {
        ok: false,
        error: `Product "${line.productId}" is unavailable or no longer published.`,
        orderItems: [],
        subtotalAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
        updatedProducts: products,
      };
    }

    if (line.variantId && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        return {
          ok: false,
          error: `Selected variant for "${product.name}" does not exist.`,
          orderItems: [],
          subtotalAmount: 0,
          deliveryFee: 0,
          totalAmount: 0,
          updatedProducts: products,
        };
      }
      if (variant.stock < qty) {
        return {
          ok: false,
          error: `Insufficient stock for "${product.name} (${variant.label})". Only ${variant.stock} left.`,
          orderItems: [],
          subtotalAmount: 0,
          deliveryFee: 0,
          totalAmount: 0,
          updatedProducts: products,
        };
      }

      variant.stock -= qty;
      product.stock = Math.max(0, product.stock - qty);

      const unitPrice = variant.price;
      const lineTotal = unitPrice * qty;
      subtotalAmount += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        variantId: variant.id,
        variantLabel: variant.label,
        unitPrice,
        quantity: qty,
        lineTotal,
      });
    } else {
      if (product.stock < qty) {
        return {
          ok: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
          orderItems: [],
          subtotalAmount: 0,
          deliveryFee: 0,
          totalAmount: 0,
          updatedProducts: products,
        };
      }

      product.stock -= qty;
      const unitPrice = product.price;
      const lineTotal = unitPrice * qty;
      subtotalAmount += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        unitPrice,
        quantity: qty,
        lineTotal,
      });
    }
  }

  const deliveryFee = computeDeliveryFee(deliveryState, subtotalAmount);
  const totalAmount = subtotalAmount + deliveryFee;

  return {
    ok: true,
    orderItems,
    subtotalAmount,
    deliveryFee,
    totalAmount,
    updatedProducts: clonedProducts,
  };
}

/**
 * Checks if a studio date + timeSlot already has an active (non-cancelled) booking.
 * Prevents studio double-booking across all sessions sharing the studio stage or specific service.
 */
export function validateStudioSlotConflict(
  existingBookings: StudioBooking[],
  serviceId: string,
  date: string,
  timeSlot: string,
  excludeBookingId?: string
): { conflict: boolean; conflictingBooking?: StudioBooking } {
  const normalizedDate = date.trim();
  const normalizedSlot = timeSlot.trim().toUpperCase();

  const conflicting = existingBookings.find((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.bookingStatus === 'cancelled') return false;
    const sameDate = b.date.trim() === normalizedDate;
    const sameSlot = b.timeSlot.trim().toUpperCase() === normalizedSlot;
    return sameDate && sameSlot;
  });

  return {
    conflict: Boolean(conflicting),
    conflictingBooking: conflicting,
  };
}

/**
 * Computes the number of rental days (inclusive of start and end date, minimum 1 day).
 */
export function computeRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Checks overlapping equipment rentals for `[startDate, endDate]` and returns remaining available quantity.
 */
export function calculateEquipmentAvailableQty(
  equipment: EquipmentItem,
  existingRentals: EquipmentRental[],
  startDate: string,
  endDate: string,
  excludeRentalId?: string
): number {
  if (equipment.status !== 'available') return 0;

  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();
  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd < reqStart) {
    return 0;
  }

  let reservedQty = 0;
  for (const r of existingRentals) {
    if (excludeRentalId && r.id === excludeRentalId) continue;
    if (r.equipmentId !== equipment.id) continue;
    if (r.rentalStatus === 'cancelled' || r.rentalStatus === 'returned') continue;

    const rStart = new Date(r.startDate).getTime();
    const rEnd = new Date(r.endDate).getTime();
    // Overlap condition: reqStart <= rEnd && reqEnd >= rStart
    if (reqStart <= rEnd && reqEnd >= rStart) {
      reservedQty += r.quantity;
    }
  }

  return Math.max(0, equipment.quantityTotal - reservedQty);
}

export function calculateEquipmentRentalAuthoritative(
  equipment: EquipmentItem,
  existingRentals: EquipmentRental[],
  startDate: string,
  endDate: string,
  quantity: number
): {
  ok: boolean;
  error?: string;
  days: number;
  dailyRate: number;
  depositAmount: number;
  totalAmount: number;
  availableQty: number;
} {
  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();
  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd < reqStart) {
    return {
      ok: false,
      error: 'End date must be on or after the start date.',
      days: 0,
      dailyRate: equipment.dailyRate,
      depositAmount: equipment.depositAmount,
      totalAmount: 0,
      availableQty: 0,
    };
  }

  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty <= 0) {
    return {
      ok: false,
      error: 'Quantity must be at least 1.',
      days: 0,
      dailyRate: equipment.dailyRate,
      depositAmount: equipment.depositAmount,
      totalAmount: 0,
      availableQty: 0,
    };
  }

  const availableQty = calculateEquipmentAvailableQty(equipment, existingRentals, startDate, endDate);
  if (qty > availableQty) {
    return {
      ok: false,
      error:
        availableQty === 0
          ? `"${equipment.name}" is fully booked for ${startDate} to ${endDate}. Please select another date range.`
          : `Only ${availableQty} unit(s) of "${equipment.name}" available for ${startDate} to ${endDate}.`,
      days: 0,
      dailyRate: equipment.dailyRate,
      depositAmount: equipment.depositAmount,
      totalAmount: 0,
      availableQty,
    };
  }

  const days = computeRentalDays(startDate, endDate);
  const rentalCharge = equipment.dailyRate * days * qty;
  const totalDeposit = equipment.depositAmount * qty;
  const totalAmount = rentalCharge + totalDeposit;

  return {
    ok: true,
    days,
    dailyRate: equipment.dailyRate,
    depositAmount: totalDeposit,
    totalAmount,
    availableQty: availableQty - qty,
  };
}

export function generateUniqueTicketCode(ticketId: string, eventId: string, tierId: string): string {
  const cleanNum = ticketId.replace(/[^0-9A-Z]/gi, '').toUpperCase();
  const randHex = Math.floor(0x1000 + Math.random() * 0xefff)
    .toString(16)
    .toUpperCase();
  const evtSuffix = eventId.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
  const tierSuffix = tierId.replace(/[^a-z0-9]/gi, '').slice(-2).toUpperCase();
  return `BZ-${cleanNum}-${evtSuffix}${tierSuffix}-${randHex}`;
}

export function purchaseEventTicketAuthoritative(
  event: EventItem,
  tierId: string,
  quantity: number,
  customer: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
    receiptUrl?: string;
  },
  customTicketId?: string
): {
  ok: boolean;
  error?: string;
  ticket?: DigitalTicket;
  updatedEvent?: EventItem;
} {
  if (event.status !== 'published') {
    return { ok: false, error: 'This event is not open for ticket sales.' };
  }

  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, error: 'Ticket quantity must be at least 1.' };
  }

  const tierIndex = event.ticketTiers.findIndex((t) => t.id === tierId);
  if (tierIndex === -1) {
    return { ok: false, error: 'Selected ticket tier does not exist.' };
  }

  const tier = event.ticketTiers[tierIndex];
  const remaining = tier.capacity - tier.sold;
  if (qty > remaining) {
    return {
      ok: false,
      error:
        remaining <= 0
          ? `The "${tier.name}" tier is sold out.`
          : `Only ${remaining} ticket(s) remaining in "${tier.name}".`,
    };
  }

  const ticketId = customTicketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticketCode = generateUniqueTicketCode(ticketId, event.id, tier.id);
  const unitPrice = tier.price;
  const totalAmount = unitPrice * qty;

  const qrPayload = JSON.stringify({
    ticketId,
    ticketCode,
    eventId: event.id,
    tier: tier.name,
    qty,
    holder: customer.customerName,
  });

  const ticket: DigitalTicket = {
    id: ticketId,
    ticketCode,
    qrPayload,
    eventId: event.id,
    eventName: event.name,
    eventDate: event.date,
    eventTime: `${event.startTime} – ${event.endTime}`,
    eventVenue: `${event.venue}, ${event.city}`,
    eventImage: event.image,
    tierId: tier.id,
    tierName: tier.name,
    quantity: qty,
    unitPrice,
    totalAmount,
    customerName: customer.customerName,
    customerPhone: customer.customerPhone,
    customerEmail: customer.customerEmail,
    paymentStatus: customer.receiptUrl ? 'receipt_uploaded' : 'pending',
    ticketStatus: 'valid',
    receiptUrl: customer.receiptUrl,
    notes: customer.notes,
    createdAt: new Date().toISOString(),
  };

  const updatedTiers = event.ticketTiers.map((t, idx) =>
    idx === tierIndex ? { ...t, sold: t.sold + qty } : t
  );

  const updatedEvent: EventItem = {
    ...event,
    ticketTiers: updatedTiers,
  };

  return {
    ok: true,
    ticket,
    updatedEvent,
  };
}

export function validateAndCheckInTicket(
  tickets: DigitalTicket[],
  queryCodeOrId: string,
  checkedInBy = 'Gate Desk'
): {
  ok: boolean;
  reason?: 'not_found' | 'already_checked_in' | 'cancelled' | 'unpaid';
  message: string;
  ticket?: DigitalTicket;
  updatedTickets: DigitalTicket[];
} {
  let cleanQuery = queryCodeOrId.trim();
  // Also support scanning raw JSON QR payload directly
  if (cleanQuery.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleanQuery);
      if (parsed.ticketCode) cleanQuery = String(parsed.ticketCode);
      else if (parsed.ticketId) cleanQuery = String(parsed.ticketId);
    } catch {
      // keep raw string
    }
  }

  const normalized = cleanQuery.toUpperCase();
  const idx = tickets.findIndex(
    (t) =>
      t.ticketCode.toUpperCase() === normalized ||
      t.id.toUpperCase() === normalized
  );

  if (idx === -1) {
    return {
      ok: false,
      reason: 'not_found',
      message: `No digital ticket found matching "${cleanQuery}".`,
      updatedTickets: tickets,
    };
  }

  const target = tickets[idx];

  if (target.ticketStatus === 'cancelled' || target.paymentStatus === 'refunded') {
    return {
      ok: false,
      reason: 'cancelled',
      message: `Ticket ${target.ticketCode} has been cancelled/refunded and cannot be admitted.`,
      ticket: target,
      updatedTickets: tickets,
    };
  }

  if (target.ticketStatus === 'checked_in') {
    return {
      ok: false,
      reason: 'already_checked_in',
      message: `DUPLICATE CHECK-IN BLOCKED: Ticket ${target.ticketCode} (${target.customerName}) was already checked in at ${target.checkedInAt || 'an earlier time'}.`,
      ticket: target,
      updatedTickets: tickets,
    };
  }

  const nowIso = new Date().toISOString();
  const updatedTicket: DigitalTicket = {
    ...target,
    ticketStatus: 'checked_in',
    checkedInAt: nowIso,
    checkedInBy,
  };

  const updatedTickets = tickets.map((t, i) => (i === idx ? updatedTicket : t));

  return {
    ok: true,
    message: `Check-in verified for ${updatedTicket.customerName} (${updatedTicket.quantity}x ${updatedTicket.tierName}).`,
    ticket: updatedTicket,
    updatedTickets,
  };
}
