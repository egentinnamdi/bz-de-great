export const SITE_CONFIG = {
  name: 'BZ Group',
  legalName: 'BZ Group Global Universal Solutions Ltd',
  divisionName: 'BZ de Great Homes and Properties',
  tagline: 'Invest in value · Live the future',
  subTagline: 'Drive it. Live in it. Own it.',
  description: 'Rent or buy premium cars and homes across Abuja and Lagos — all through one trusted team.',
  phoneDisplay: '+234 704 753 1433',
  phoneRaw: '+2347047531433',
  whatsappNumber: '2347047531433',
  whatsappUrl: 'https://wa.me/2347047531433',
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

export const NAV_LINKS = [
  { label: 'Rent a car', href: '/cars/rent' },
  { label: 'Buy a car', href: '/cars/buy' },
  { label: 'Rent a home', href: '/homes/rent' },
  { label: 'Buy property', href: '/properties/buy' },
  { label: 'Marketplace & Studio', href: '/marketplace' },
  { label: 'About', href: '/about' },
];

export const FOOTER_LINKS = {
  services: [
    { label: 'Car rentals', href: '/cars/rent' },
    { label: 'Car sales', href: '/cars/buy' },
    { label: 'Homes for rent', href: '/homes/rent' },
    { label: 'Property for sale', href: '/properties/buy' },
    { label: 'Marketplace & Gadgets', href: '/marketplace' },
    { label: 'Studio & Gear Rental', href: '/studio' },
    { label: 'Events & Tickets', href: '/events' },
    { label: 'Chauffeured VIP escort', href: '/cars/rent?driver=Chauffeured' },
  ],
  company: [
    { label: 'About BZ Group', href: '/about' },
    { label: 'Founder & Vision', href: '/about#founder' },
    { label: 'Track My Booking', href: '/my-booking' },
    { label: 'Contact Concierge', href: 'https://wa.me/2347047531433' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Help & FAQs', href: '/help' },
    { label: 'Rental Agreement Terms', href: '/terms#car-rentals' },
  ],
  admin: [
    { label: 'Staff Dashboard', href: '/admin' },
    { label: 'Manage Listings', href: '/admin/listings' },
    { label: 'Marketplace & Studio', href: '/admin/marketplace' },
    { label: 'Bookings Calendar', href: '/admin/bookings' },
    { label: 'Payments Review', href: '/admin/payments' },
  ]
};

export function getWhatsAppBookingLink(refCode: string, itemTitle: string, details?: string): string {
  const text = encodeURIComponent(
    `Hello BZ Group Concierge, I would like to inquire regarding booking [${refCode}] for "${itemTitle}". ${details ? details : ''}`
  );
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
}
