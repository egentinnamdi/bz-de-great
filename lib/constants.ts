export const SITE_CONFIG = {
  name: 'BZ Group',
  legalName: 'BZ Group Global Universal Solutions Ltd',
  divisionName: 'BZ de Great Homes and Properties',
  tagline: 'Invest in value · Live the future',
  subTagline: 'Drive it. Live in it. Own it.',
  description: 'Rent or buy premium cars and homes, and change RMB and naira at a clear daily rate — all through one trusted team.',
  phoneDisplay: '+234 706 448 2628',
  phoneRaw: '+2347064482628',
  whatsappNumber: '2347064482628',
  whatsappUrl: 'https://wa.me/2347064482628',
  email: 'support@bzdegreat.com',
  address: 'Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State',
  defaultLocation: 'Onitsha · Abuja · Lagos · Asaba',
  operatingHours: 'Monday – Saturday: 8:00 AM – 8:00 PM',
  bankDetails: {
    bankName: 'Premium Trust Bank',
    accountNumber: '0010252664',
    accountName: 'BZ DE GREAT HOMES AND PROPERTIES'
  },
  offices: [
    { name: 'Head Office', address: 'Suite 40, Olivia Mall Plaza, Main Market, Onitsha, Anambra State' },
    { name: 'Branch Office 1 (Delta)', address: 'Opp. Solar House, Beside NTA, Okpanam Road, Asaba, Delta State' },
    { name: 'Branch Office 2 (Lagos)', address: 'No. 2 Thomas Estate, Ajah, Lagos State' },
    { name: 'Branch Office 3 (Abuja)', address: 'STEM PARK, Ochacho Junction, After Nyzamie Hospital, Karmo, Abuja' }
  ],
  socials: {
    instagram: 'https://instagram.com/bzgroup_universal',
    twitter: 'https://x.com/bzgroup',
    linkedin: 'https://linkedin.com/company/bz-group-universal'
  }
};

export const INITIAL_RMB_RATES = {
  payRmbRate: 205.00,
  payNairaRate: 215.40,
  updatedAt: '5:09 PM Yesterday',
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
    { label: 'Contact Concierge', href: 'https://wa.me/2347064482628' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Help & FAQs', href: '/help' },
    { label: 'Rental Agreement Terms', href: '/terms#car-rentals' },
    { label: 'Currency Exchange Policy', href: '/terms#rmb-exchange' },
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
