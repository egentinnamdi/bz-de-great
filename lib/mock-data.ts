import { Listing, Booking, RmbExchangeRequest, Customer, StaffActivity } from './types';

export const INITIAL_LISTINGS: Listing[] = [
  // --- CAR RENTALS (FIGMA DESKTOP · LISTINGS) ---
  {
    id: 'car-rent-1',
    category: 'car_rent',
    title: 'Lincoln Navigator 2022',
    subtitle: 'Twin-Turbo V6 · Reserve Luxury',
    slug: 'lincoln-navigator-2022-rent',
    description: 'A full-size luxury SUV with three rows of leather seating, panoramic roof and a smooth, quiet ride — ideal for airport pick-ups, family trips and executive movement around Abuja. Available self-drive or with a trained car professional driver.',
    price: 180000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Wuse 2, Abuja',
    images: [
      '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
      '/photos/car-suv-white.jpg',
      '/photos/car-suv-grey.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Luxury', 'Reserve', 'Uniformed driver'],
    createdAt: '2026-10-01T10:00:00Z',
    vehicleSpecs: {
      make: 'Lincoln',
      model: 'Navigator',
      year: 2022,
      transmission: 'Automatic',
      seats: 7,
      fuelType: 'Petrol',
      driverOption: 'Both',
      engine: '3.5L Twin-Turbo V6 (450 hp)',
      color: 'Pristine White Metallic'
    }
  },
  {
    id: 'car-rent-2',
    category: 'car_rent',
    title: 'Mercedes-Benz E-Class 2022',
    subtitle: 'Executive Luxury Sedan',
    slug: 'mercedes-benz-e-class-2022-rent',
    description: 'The definitive executive flagship sedan. Featuring executive rear seating, Burmester 3D high-end audio, ambient lighting, and serene whisper-quiet ride.',
    price: 120000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Central Area, Abuja',
    images: [
      '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
      '/photos/car-sedan-black.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Sedan', 'Executive', 'Chauffeured VIP'],
    createdAt: '2026-10-05T12:00:00Z',
    vehicleSpecs: {
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2022,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Both',
      engine: '2.0L Turbo Inline-4',
      color: 'Obsidian Black'
    }
  },
  {
    id: 'car-rent-3',
    category: 'car_rent',
    title: 'BMW X5 xDrive40i 2021',
    subtitle: 'M Sport Edition · Panoramic Sunroof',
    slug: 'bmw-x5-xdrive40i-2021-rent',
    description: 'Clean, foreign-used BMW X5 xDrive40i with M Sport package. Outstanding ride composure, spacious leather cabin, and BMW live cockpit professional.',
    price: 150000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Asokoro, Abuja',
    images: [
      '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
      '/photos/car-suv-grey.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'BMW', 'M Sport'],
    createdAt: '2026-10-10T08:00:00Z',
    vehicleSpecs: {
      make: 'BMW',
      model: 'X5 xDrive40i',
      year: 2021,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Both',
      engine: '3.0L Turbo Inline-6',
      color: 'Phytonic Blue Metallic'
    }
  },
  {
    id: 'car-rent-4',
    category: 'car_rent',
    title: 'Mercedes-Benz G-Class 2021',
    subtitle: 'G63 AMG Biturbo V8',
    slug: 'mercedes-benz-g-class-2021-rent',
    description: 'Iconic commanding road presence. The G-Class blends brute performance with handcrafted leather luxury, Burmester sound, and diplomatic prestige.',
    price: 220000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Maitama, Abuja',
    images: [
      '/photos/car-suv-white.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'G-Wagon', 'Escort Ready'],
    createdAt: '2026-10-12T09:30:00Z',
    vehicleSpecs: {
      make: 'Mercedes-Benz',
      model: 'G-Class G63',
      year: 2021,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Both',
      engine: '4.0L V8 Biturbo',
      color: 'Designo Polar White'
    }
  },
  {
    id: 'car-rent-5',
    category: 'car_rent',
    title: 'Toyota Land Cruiser 2023',
    subtitle: '300 Series VXR Twin-Turbo',
    slug: 'toyota-land-cruiser-2023-rent',
    description: 'The preferred choice for corporate executives, dignitaries, and long-range luxury travel across Nigeria. Supreme reliability and ventilated seating.',
    price: 200000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Wuse 2, Abuja',
    images: [
      '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
      '/photos/car-suv-white.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Toyota', '4WD'],
    createdAt: '2026-10-14T11:00:00Z',
    vehicleSpecs: {
      make: 'Toyota',
      model: 'Land Cruiser 300',
      year: 2023,
      transmission: 'Automatic',
      seats: 7,
      fuelType: 'Petrol',
      driverOption: 'Both',
      engine: '3.5L Twin-Turbo V6',
      color: 'Graphite Grey'
    }
  },
  {
    id: 'car-rent-6',
    category: 'car_rent',
    title: 'Lexus RX 350 2022',
    subtitle: 'F-Sport All-Wheel Drive',
    slug: 'lexus-rx-350-2022-rent',
    description: 'Silky smooth ride, plush semi-aniline leather interior, Mark Levinson audio, and supreme reliability for city errands and business meetings.',
    price: 130000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Garki, Abuja',
    images: [
      '/photos/car-suv-grey.jpg',
      '/photos/car-suv-white.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Lexus', 'F-Sport'],
    createdAt: '2026-10-15T14:00:00Z',
    vehicleSpecs: {
      make: 'Lexus',
      model: 'RX 350',
      year: 2022,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      engine: '3.5L V6',
      color: 'Atomic Silver'
    }
  },

  // --- CAR SALES (FIGMA DESKTOP · CARS FOR SALE) ---
  {
    id: 'car-sale-1',
    category: 'car_sale',
    title: 'BMW X5 xDrive40i 2021',
    subtitle: 'Foreign Used · Customs Cleared · 34,000 km',
    slug: 'bmw-x5-xdrive40i-2021-sale',
    description: 'A clean, foreign-used BMW X5 xDrive40i with M Sport package. Documented, no accident record. Customs duty is fully cleared and every document is ready for transfer. Book a free test drive, bring your mechanic, and only pay once you are happy with the car.',
    price: 85000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Wuse 2, Abuja',
    images: [
      '/figma-images/9d7db0a7aeef9858ca0e073a93bf39c628f3bb9c.jpg',
      '/photos/car-suv-grey.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Foreign Used', 'BMW', 'Clean Title'],
    createdAt: '2026-10-02T10:00:00Z',
    vehicleSpecs: {
      make: 'BMW',
      model: 'X5 xDrive40i',
      year: 2021,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '34,000 km',
      engine: '3.0L Turbo Inline-6 (335 hp)',
      color: 'Mineral Grey Metallic'
    }
  },
  {
    id: 'car-sale-2',
    category: 'car_sale',
    title: 'Mercedes-Benz E-Class 2021',
    subtitle: 'E350 AMG Line · Panoramic Sunroof',
    slug: 'mercedes-benz-e-class-2021-sale',
    description: 'Flawless condition, verified customs papers, original paint, full service history from authorized center. Clean leather seats, ambient lighting.',
    price: 48000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Central Area, Abuja',
    images: [
      '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg',
      '/photos/car-sedan-black.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Sedan', 'Mercedes-Benz', 'Foreign Used'],
    createdAt: '2026-10-04T12:00:00Z',
    vehicleSpecs: {
      make: 'Mercedes-Benz',
      model: 'E-Class E350',
      year: 2021,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '28,500 km',
      engine: '2.0L Turbo Inline-4',
      color: 'Obsidian Black'
    }
  },
  {
    id: 'car-sale-3',
    category: 'car_sale',
    title: 'Lexus RX 350 2021',
    subtitle: 'Full Option · Keyless Entry',
    slug: 'lexus-rx-350-2021-sale',
    description: 'Foreign used with pristine cream leather, navigation, reverse camera, power tailgate, and brand new Michelin tires. Clean title ready for transfer.',
    price: 62000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Garki, Abuja',
    images: [
      '/photos/car-suv-grey.jpg',
      '/photos/car-suv-white.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Lexus', 'Foreign Used'],
    createdAt: '2026-10-06T15:00:00Z',
    vehicleSpecs: {
      make: 'Lexus',
      model: 'RX 350',
      year: 2021,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '41,000 km',
      engine: '3.5L V6',
      color: 'Caviar Black'
    }
  },
  {
    id: 'car-sale-4',
    category: 'car_sale',
    title: 'Toyota Land Cruiser 2022',
    subtitle: 'LC300 VXR · Executive Package',
    slug: 'toyota-land-cruiser-2022-sale',
    description: 'The pinnacle of bulletproof durability and prestige. 7-seater executive layout, JBL premium sound, cooled/heated seats, and genuine documentation.',
    price: 150000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Wuse 2, Abuja',
    images: [
      '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg',
      '/photos/car-suv-white.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Toyota', 'LC300'],
    createdAt: '2026-10-08T09:00:00Z',
    vehicleSpecs: {
      make: 'Toyota',
      model: 'Land Cruiser 300',
      year: 2022,
      transmission: 'Automatic',
      seats: 7,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '18,000 km',
      engine: '3.5L Twin-Turbo V6',
      color: 'Pearl White'
    }
  },
  {
    id: 'car-sale-5',
    category: 'car_sale',
    title: 'Lincoln Navigator 2021',
    subtitle: 'Reserve Package · Twin-Turbo',
    slug: 'lincoln-navigator-2021-sale',
    description: 'Full-size flagship luxury SUV with 22-inch wheels, Revel Ultima 20-speaker sound, massaging front captain chairs, and full duty clearance.',
    price: 120000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Maitama, Abuja',
    images: [
      '/photos/car-suv-white.jpg',
      '/figma-images/1d1f3a8c0aa3ff156f7fb0fd0480a30117a69620.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['SUV', 'Lincoln', 'Luxury'],
    createdAt: '2026-10-09T14:00:00Z',
    vehicleSpecs: {
      make: 'Lincoln',
      model: 'Navigator Reserve',
      year: 2021,
      transmission: 'Automatic',
      seats: 7,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '32,000 km',
      engine: '3.5L Twin-Turbo V6',
      color: 'Pristine White'
    }
  },
  {
    id: 'car-sale-6',
    category: 'car_sale',
    title: 'Mercedes-Benz S-Class 2019',
    subtitle: 'S560 Maybach Look · Executive',
    slug: 'mercedes-benz-s-class-2019-sale',
    description: 'Chauffeured diplomat pedigree. Rear refrigerator, executive footrest, twin screens, and immaculate service record with certified duty payment.',
    price: 78000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Asokoro, Abuja',
    images: [
      '/photos/car-sedan-black.jpg',
      '/figma-images/8720e6043d38d2c02684412c2a02c36ccc111f62.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Sedan', 'Mercedes-Benz', 'S-Class'],
    createdAt: '2026-10-11T16:00:00Z',
    vehicleSpecs: {
      make: 'Mercedes-Benz',
      model: 'S-Class S560',
      year: 2019,
      transmission: 'Automatic',
      seats: 5,
      fuelType: 'Petrol',
      driverOption: 'Self-drive',
      mileage: '49,000 km',
      engine: '4.0L V8 Biturbo',
      color: 'Obsidian Black'
    }
  },

  // --- HOMES FOR RENT (FIGMA DESKTOP · HOMES FOR RENT) ---
  {
    id: 'home-rent-1',
    category: 'property_rent',
    title: '3-Bedroom Serviced Apartment',
    subtitle: 'Lake Views · Gated Estate · Jabi',
    slug: '3-bedroom-serviced-apartment-jabi',
    description: 'Contemporary waterfront apartment in Jabi, Abuja. Fully furnished, 24/7 power, Olympic swimming pool, gym, and 24-hour uniformed security patrol.',
    price: 12000000,
    currency: 'NGN',
    pricePeriod: '/year',
    location: 'Jabi, Abuja',
    images: [
      '/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg',
      '/photos/apartment-interior.jpg',
      '/photos/house-duplex.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Apartment', 'Jabi', 'Serviced', 'Pool'],
    createdAt: '2026-10-03T10:00:00Z',
    propertySpecs: {
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      areaSqm: 280,
      serviced: true,
      furnished: true,
      amenities: ['24/7 Power', 'Fitted Gym', 'Swimming Pool', 'Security']
    }
  },
  {
    id: 'home-rent-2',
    category: 'property_rent',
    title: '4-Bedroom Duplex',
    subtitle: 'Diplomatic Enclave · Maitama',
    slug: '4-bedroom-duplex-maitama-rent',
    description: 'Grand detached duplex situated in the heart of Maitama. Private compound, 2-room staff quarters, perimeter electric fencing, and industrial borehole.',
    price: 35000000,
    currency: 'NGN',
    pricePeriod: '/year',
    location: 'Maitama, Abuja',
    images: [
      '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg',
      '/photos/house-duplex.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Duplex', 'Maitama', 'Diplomatic'],
    createdAt: '2026-10-05T12:00:00Z',
    propertySpecs: {
      type: 'Duplex',
      bedrooms: 4,
      bathrooms: 5,
      areaSqm: 650,
      serviced: true,
      furnished: true,
      amenities: ['Private Compound', 'Electric Fencing', 'BQ', 'Water Plant']
    }
  },
  {
    id: 'home-rent-3',
    category: 'property_rent',
    title: '4-Bedroom Terrace',
    subtitle: 'Hilltop Serenity · Guzape',
    slug: '4-bedroom-terrace-guzape-rent',
    description: 'Multi-level terrace residence with panoramic views of the city skyline. Contemporary finish, en-suite bedrooms, and dedicated children play area.',
    price: 15000000,
    currency: 'NGN',
    pricePeriod: '/year',
    location: 'Guzape, Abuja',
    images: [
      '/photos/house-terrace.jpg',
      '/photos/apartment-interior.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['House', 'Guzape', 'Terrace'],
    createdAt: '2026-10-07T14:00:00Z',
    propertySpecs: {
      type: 'House',
      bedrooms: 4,
      bathrooms: 4,
      areaSqm: 420,
      serviced: true,
      furnished: false,
      amenities: ['Hilltop View', '24/7 Security', 'Kids Playground']
    }
  },
  {
    id: 'home-rent-4',
    category: 'property_rent',
    title: '2-Bedroom Apartment',
    subtitle: 'Wuse 2 Commercial & Lifestyle Hub',
    slug: '2-bedroom-apartment-wuse-2-rent',
    description: 'Perfect for executives and expatriates who desire city-center convenience. Walking distance to elite restaurants and supermarkets in Wuse 2.',
    price: 7500000,
    currency: 'NGN',
    pricePeriod: '/year',
    location: 'Wuse 2, Abuja',
    images: [
      '/photos/apartment-interior.jpg',
      '/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Apartment', 'Wuse 2', 'City Center'],
    createdAt: '2026-10-08T16:00:00Z',
    propertySpecs: {
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 190,
      serviced: true,
      furnished: true,
      amenities: ['Elevator', 'Fitted Kitchen', 'Central Generator']
    }
  },
  {
    id: 'home-rent-5',
    category: 'property_rent',
    title: 'Furnished 5-Bedroom Villa',
    subtitle: 'Asokoro Luxury Haven with Pool',
    slug: 'furnished-5-bedroom-villa-asokoro-rent',
    description: 'Immaculately appointed luxury villa with infinity pool, cinema room, private garden, and full air-conditioned staff accommodation.',
    price: 40000000,
    currency: 'NGN',
    pricePeriod: '/year',
    location: 'Asokoro, Abuja',
    images: [
      '/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['House', 'Asokoro', 'Furnished Villa'],
    createdAt: '2026-10-10T11:00:00Z',
    propertySpecs: {
      type: 'House',
      bedrooms: 5,
      bathrooms: 6,
      areaSqm: 900,
      serviced: true,
      furnished: true,
      amenities: ['Infinity Pool', 'Private Cinema', 'Smart Automation']
    }
  },
  {
    id: 'home-rent-6',
    category: 'property_rent',
    title: '1-Bedroom Short-let',
    subtitle: 'Central Area · Executive Transit Suite',
    slug: '1-bedroom-short-let-central-area',
    description: 'High-end short-let apartment with ultra-fast Wi-Fi, streaming subscriptions, daily housekeeping, and 24-hour room concierge.',
    price: 85000,
    currency: 'NGN',
    pricePeriod: '/day',
    location: 'Central Area, Abuja',
    images: [
      '/photos/apartment-interior.jpg',
      '/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Apartment', 'Short-let', 'CBD'],
    createdAt: '2026-10-12T13:00:00Z',
    propertySpecs: {
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 95,
      serviced: true,
      furnished: true,
      amenities: ['Daily Housekeeping', 'High-Speed Wi-Fi', 'Smart TV']
    }
  },

  // --- PROPERTY FOR SALE (FIGMA DESKTOP · PROPERTY FOR SALE) ---
  {
    id: 'prop-sale-1',
    category: 'property_sale',
    title: '5-Bedroom Detached Duplex',
    subtitle: 'Private Pool · Smart Home · Maitama',
    slug: '5-bedroom-detached-duplex-maitama-sale',
    description: 'A bespoke 5-bedroom detached duplex on a quiet, gated street in Maitama. Every bedroom is en-suite, with three lounges, private infinity pool with sanitary facilities, quarters and parking for four cars. Title: Certificate of Occupancy, and inspections are strictly by appointment.',
    price: 650000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Maitama, Abuja',
    images: [
      '/figma-images/6f0a97198d0b6047e8cae25b8e2f59dce1844516.jpg',
      '/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg',
      '/photos/house-duplex.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Duplex', 'Maitama', 'C of O', 'Private Pool'],
    createdAt: '2026-10-01T10:00:00Z',
    propertySpecs: {
      type: 'Duplex',
      bedrooms: 5,
      bathrooms: 6,
      areaSqm: 1200,
      serviced: true,
      furnished: true,
      titleDocument: 'Certificate of Occupancy (C of O)',
      amenities: [
        'All rooms en-suite',
        'Private swimming pool',
        'Fitted contemporary kitchen',
        'Cinema room & smart locks',
        '2-room staff quarters',
        '4-car parking'
      ]
    }
  },
  {
    id: 'prop-sale-2',
    category: 'property_sale',
    title: '3-Bedroom Apartment',
    subtitle: 'Luxury High-Rise · Wuse 2',
    slug: '3-bedroom-apartment-wuse-2-sale',
    description: 'Newly completed luxury residence in a prime high-rise in Wuse 2. Top-tier imported fittings, private balcony, basement parking, and clean Governor Consent.',
    price: 95000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Wuse 2, Abuja',
    images: [
      '/figma-images/290b34423c922b4cdb8c41ef5e61b014f523f36a.jpg',
      '/photos/apartment-interior.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Apartment', 'Wuse 2', 'Investment'],
    createdAt: '2026-10-03T11:00:00Z',
    propertySpecs: {
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      areaSqm: 320,
      serviced: true,
      furnished: false,
      titleDocument: "Governor's Consent",
      amenities: ['Elevator', 'Basement Parking', '24/7 Security', 'Balcony']
    }
  },
  {
    id: 'prop-sale-3',
    category: 'property_sale',
    title: '4-Bedroom Terrace',
    subtitle: 'Contemporary Family Home · Guzape',
    slug: '4-bedroom-terrace-guzape-sale',
    description: 'Modern luxury terrace with private compound, solar inverter integration, smart home switches, and clean FCDA allocation papers.',
    price: 280000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Guzape, Abuja',
    images: [
      '/photos/house-terrace.jpg',
      '/photos/house-duplex.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['House', 'Guzape', 'Terrace'],
    createdAt: '2026-10-05T14:00:00Z',
    propertySpecs: {
      type: 'House',
      bedrooms: 4,
      bathrooms: 5,
      areaSqm: 550,
      serviced: true,
      furnished: true,
      titleDocument: 'FCDA Allocation with C of O',
      amenities: ['Solar Inverter', 'Smart Automation', 'BQ', 'CCTV']
    }
  },
  {
    id: 'prop-sale-4',
    category: 'property_sale',
    title: 'Luxury 5-Bedroom Villa',
    subtitle: 'Asokoro Diplomatic Hills · Infinity Pool',
    slug: 'luxury-5-bedroom-villa-asokoro-sale',
    description: 'An ambassadorial estate built on 1,600 sqm of prime land in Asokoro. Dual infinity pools, banquet dining hall, security bunker, and glass elevator.',
    price: 1200000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Asokoro, Abuja',
    images: [
      '/figma-images/3b1bf621f2a293f79d5e43da5f91ddf563a63c83.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['House', 'Asokoro', 'Ambassadorial'],
    createdAt: '2026-10-07T16:00:00Z',
    propertySpecs: {
      type: 'House',
      bedrooms: 5,
      bathrooms: 7,
      areaSqm: 1600,
      serviced: true,
      furnished: true,
      titleDocument: 'Certificate of Occupancy (FCDA Verified)',
      amenities: ['Dual Pools', 'Glass Elevator', 'Cinema', 'Security Bunker']
    }
  },
  {
    id: 'prop-sale-5',
    category: 'property_sale',
    title: 'Agidigba Garden City — Plots',
    subtitle: 'Prime Commercial & Residential Plots',
    slug: 'agidigba-garden-city-plots',
    description: 'Government approved layout in fast-developing economic hub. Instant allocation, dry table land, perimeter fencing, and global C of O in process.',
    price: 20000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Okpanam, Asaba',
    images: [
      '/photos/land-estate.jpg',
      '/figma-images/3106610cc25be4b155398cf1c889ed0535a4873b.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Land & plots', 'Asaba', 'Investment'],
    createdAt: '2026-10-09T09:00:00Z',
    propertySpecs: {
      type: 'Land & plots',
      areaSqm: 600,
      serviced: false,
      furnished: false,
      titleDocument: 'Registered Survey & Deed of Assignment',
      amenities: ['Dry Table Land', 'Gated Perimeter', 'Access Road', 'Instant Allocation']
    }
  },
  {
    id: 'prop-sale-6',
    category: 'property_sale',
    title: 'BZ Okpanam Millennium City',
    subtitle: 'Estate Plots with Flexible Payment',
    slug: 'bz-okpanam-millennium-city',
    description: 'Strategically located minutes from the Asaba International Airport. Master-planned luxury gated community with commercial boulevard and residential zones.',
    price: 5000000,
    currency: 'NGN',
    pricePeriod: 'total',
    location: 'Okpanam, Asaba',
    images: [
      '/photos/land-estate.jpg',
      '/photos/hero-villa-suv.jpg'
    ],
    status: 'published',
    featured: true,
    tags: ['Land & plots', 'Asaba', 'Master Planned'],
    createdAt: '2026-10-11T12:00:00Z',
    propertySpecs: {
      type: 'Land & plots',
      areaSqm: 450,
      serviced: true,
      furnished: false,
      titleDocument: 'Free from Government Acquisition (Deed & Survey)',
      amenities: ['Estate Security', 'Solar Streetlights', 'Drainage System']
    }
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-2292',
    type: 'car_rental',
    listingId: 'car-rent-1',
    listingTitle: 'Lincoln Navigator 2022',
    customerName: 'Chidi Okafor',
    customerEmail: 'chidi.okafor@primegroup.ng',
    customerPhone: '+234 803 234 5678',
    startDate: '2026-10-24',
    endDate: '2026-10-27',
    driverOption: 'Chauffeured',
    totalAmount: 755000,
    bookingStatus: 'confirmed',
    paymentStatus: 'verified',
    createdAt: '2026-10-20T09:30:00Z',
    notes: 'Airport pick-up from Nnamdi Azikiwe Airport to Transcorp Hilton.'
  },
  {
    id: 'BK-2290',
    type: 'car_rental',
    listingId: 'car-rent-2',
    listingTitle: 'Mercedes-Benz E-Class 2022',
    customerName: 'Tunde Bello',
    customerEmail: 'tunde.bello@apexholdings.com',
    customerPhone: '+234 809 876 5432',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    driverOption: 'Self-drive',
    totalAmount: 360000,
    bookingStatus: 'confirmed',
    paymentStatus: 'receipt_uploaded',
    createdAt: '2026-10-21T11:00:00Z',
    receiptUrl: '/photos/car-sedan-black.jpg',
    notes: 'Self-drive booking. Delivery to Central Area.'
  },
  {
    id: 'INS-0318',
    type: 'property_inspection',
    listingId: 'prop-sale-1',
    listingTitle: '5-Bedroom Detached Duplex',
    customerName: 'Amaka Eze',
    customerEmail: 'amaka.eze@capitalpartners.ng',
    customerPhone: '+234 812 345 6789',
    startDate: '2026-10-26',
    totalAmount: 0,
    bookingStatus: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-10-22T14:15:00Z',
    notes: 'Physical viewing with surveyor and client spouse at 11:00 AM.'
  },
  {
    id: 'TD-0091',
    type: 'car_test_drive',
    listingId: 'car-sale-1',
    listingTitle: 'BMW X5 xDrive40i 2021',
    customerName: 'Fatima Sule',
    customerEmail: 'fatima.sule@zenithenterprise.com',
    customerPhone: '+234 805 112 2334',
    startDate: '2026-10-27',
    totalAmount: 0,
    bookingStatus: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-10-23T10:00:00Z',
    notes: 'Test drive around Wuse 2 with personal mechanic at 02:00 PM.'
  }
];

export const INITIAL_RMB_REQUESTS: RmbExchangeRequest[] = [
  {
    id: 'RMB-0142',
    direction: 'naira_to_rmb',
    sourceAmount: 21540000,
    rateApplied: 215.40,
    destinationAmount: 100000,
    customerName: 'Ifeanyi Obi',
    customerEmail: 'ifeanyi.obi@globaltrade.ng',
    customerWhatsApp: '+234 706 448 2628',
    status: 'approved',
    createdAt: '2026-10-24T08:00:00Z',
    updatedAt: '2026-10-24T08:30:00Z',
    receiptUrl: '/photos/car-sedan-black.jpg',
    notes: '¥100,000 factory settlement in Guangzhou.'
  },
  {
    id: 'RMB-0143',
    direction: 'rmb_to_naira',
    sourceAmount: 50000,
    rateApplied: 205.00,
    destinationAmount: 10250000,
    customerName: 'Zainab Abdullahi',
    customerEmail: 'zainab@kadoimports.com',
    customerWhatsApp: '+234 706 448 2628',
    status: 'receipt_received',
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-24T08:45:00Z',
    notes: 'Settlement for electronics shipment.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-101',
    name: 'Chidi Okafor',
    email: 'chidi.okafor@primegroup.ng',
    phone: '+234 803 234 5678',
    location: 'Maitama, Abuja',
    totalBookings: 6,
    lifetimeSpendNgn: 4200000,
    joinedAt: '2026-01-15T00:00:00Z',
    status: 'vip'
  },
  {
    id: 'CUST-102',
    name: 'Amaka Eze',
    email: 'amaka.eze@capitalpartners.ng',
    phone: '+234 812 345 6789',
    location: 'Asokoro, Abuja',
    totalBookings: 3,
    lifetimeSpendNgn: 650000000,
    joinedAt: '2026-03-20T00:00:00Z',
    status: 'vip'
  },
  {
    id: 'CUST-103',
    name: 'Tunde Bello',
    email: 'tunde.bello@apexholdings.com',
    phone: '+234 809 876 5432',
    location: 'Central Area, Abuja',
    totalBookings: 4,
    lifetimeSpendNgn: 1850000,
    joinedAt: '2026-05-10T00:00:00Z',
    status: 'active'
  },
  {
    id: 'CUST-104',
    name: 'Fatima Sule',
    email: 'fatima.sule@zenithenterprise.com',
    phone: '+234 805 112 2334',
    location: 'Wuse 2, Abuja',
    totalBookings: 2,
    lifetimeSpendNgn: 85000000,
    joinedAt: '2026-07-01T00:00:00Z',
    status: 'active'
  }
];

export const INITIAL_ACTIVITIES: StaffActivity[] = [
  {
    id: 'ACT-01',
    actorName: 'Admin',
    actorRole: 'Treasury Desk',
    action: 'Approved RMB payout for RMB-0142 (¥100,000)',
    targetId: 'RMB-0142',
    timestamp: '10 mins ago'
  },
  {
    id: 'ACT-02',
    actorName: 'Sarah',
    actorRole: 'Concierge Desk',
    action: 'Confirmed booking BK-2292 (Lincoln Navigator 2022)',
    targetId: 'BK-2292',
    timestamp: '35 mins ago'
  },
  {
    id: 'ACT-03',
    actorName: 'Emeka',
    actorRole: 'Fleet Desk',
    action: 'Added new vehicle listing: Toyota Land Cruiser 2023',
    targetId: 'car-rent-5',
    timestamp: '2 hours ago'
  }
];
export const INITIAL_STAFF_ACTIVITIES = INITIAL_ACTIVITIES;
