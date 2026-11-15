import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Marketplace, Studio & Events | BZ Group',
  description:
    'Shop verified phones, laptops, gadgets, electronics, solar & inverter systems, bespoke clothing, and fine jewelry — plus studio booking, camera rentals, and event tickets.',
};

export default function MarketplacePage() {
  return <MarketplaceCatalogView initialCategorySlug="all" />;
}
