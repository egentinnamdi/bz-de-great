export const SITE_CONFIG = {
  name: 'BZ Group',
  legalName: 'BZ Group Global Universal Solutions Ltd',
  tagline: 'Invest in value · Live the future',
  subTagline: 'Drive it. Live in it. Own it.',
  description: 'Rent or buy premium cars and homes, and change RMB and naira at a clear daily rate — all through one trusted team.',
  phoneDisplay: '+234 813 969 0031',
  phoneRaw: '+2348139690031',
  whatsappNumber: '2348139690031',
  whatsappUrl: 'https://wa.me/2348139690031',
  email: 'concierge@bzgroup.com',
  address: 'Plot 1044, Kur Mohammed Avenue, Central Business District, Abuja, FCT, Nigeria',
  defaultLocation: 'Abuja, FCT',
  operatingHours: 'Monday – Saturday: 8:00 AM – 8:00 PM',
  socials: {
    instagram: 'https://instagram.com/bzgroup_universal',
    twitter: 'https://x.com/bzgroup',
    linkedin: 'https://linkedin.com/company/bz-group-universal'
  }
};

export const INITIAL_RMB_RATES = {
  payRmbRate: 205.00,
  payNairaRate: 215.40,
  updatedAt: '9:30 AM Today',
  updatedBy: 'Admin (Treasury Desk)'
};

export const NAV_LINKS = [
  { label: 'Rent a car', href: '/cars/rent' },
  { label: 'Buy a car', href: '/cars/buy' },
  { label: 'Rent a home', href: '/homes/rent' },
  { label: 'Buy property', href: '/properties/buy' },
  { label: 'RMB exchange', href: '/rmb-exchange' },
  { label: 'About', href: '/about' },
];

export const FOOTER_LINKS = {
  services: [
    { label: 'Car rentals', href: '/cars/rent' },
    { label: 'Car sales', href: '/cars/buy' },
    { label: 'Homes for rent', href: '/homes/rent' },
    { label: 'Property for sale', href: '/properties/buy' },
    { label: 'RMB & Naira exchange', href: '/rmb-exchange' },
    { label: 'Chauffeured VIP escort', href: '/cars/rent?driver=Chauffeured' },
  ],
  company: [
    { label: 'About BZ Group', href: '/about' },
    { label: 'Founder & Vision', href: '/about#founder' },
    { label: 'Track My Booking', href: '/my-booking' },
    { label: 'Pay Naira (Checkout)', href: '/pay-naira' },
    { label: 'Contact Concierge', href: SITE_CONFIG.whatsappUrl },
  ],
  legal: [
    { label: 'Help & FAQs', href: '/help' },
    { label: 'Rental Agreement Terms', href: '/help#rental-terms' },
    { label: 'Inspection Policy', href: '/help#inspection' },
    { label: 'Currency Exchange Policy', href: '/help#rmb-policy' },
    { label: 'Privacy & Disclaimers', href: '/help#privacy' },
  ],
  admin: [
    { label: 'Staff Dashboard', href: '/admin' },
    { label: 'Manage Listings', href: '/admin/listings' },
    { label: 'Bookings Calendar', href: '/admin/bookings' },
    { label: 'Payments Review', href: '/admin/payments' },
    { label: 'Set RMB Rate', href: '/admin/rmb-rate' },
  ]
};

export function getWhatsAppBookingLink(refCode: string, itemTitle: string, details?: string): string {
  const text = encodeURIComponent(
    `Hello BZ Group Concierge, I would like to inquire regarding booking [${refCode}] for "${itemTitle}". ${details ? details : ''}`
  );
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
}

export function getWhatsAppRmbLink(refCode: string, direction: 'rmb_to_naira' | 'naira_to_rmb', amount: number): string {
  const dirText = direction === 'rmb_to_naira' ? 'Pay RMB to receive Naira' : 'Pay Naira to receive RMB';
  const text = encodeURIComponent(
    `Hello BZ Group Treasury, I have initiated RMB Exchange request [${refCode}]: ${dirText} for amount ¥${amount.toLocaleString()}. Please provide official payment instructions.`
  );
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
}
