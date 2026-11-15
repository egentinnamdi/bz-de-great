import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Phones for Sale in Abuja & Lagos | BZ Group Marketplace',
  description: 'Factory-unlocked iPhones, Samsung Galaxy flagships, and executive smartphones with official warranty.',
};

export default function PhonesCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="phones"
      pageTitle="Phones & Flagship Smartphones"
      pageSubtitle="Factory-unlocked iPhones and Samsung Galaxy flagships with verified battery health, storage options, and official warranty."
    />
  );
}
