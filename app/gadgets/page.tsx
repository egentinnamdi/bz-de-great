import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Gadgets, Smartwatches & Drones | BZ Group Marketplace',
  description: 'Apple Watch Ultra, DJI drones, tablets, and premium everyday carry tech.',
};

export default function GadgetsCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="gadgets"
      pageTitle="Gadgets, Wearables & Drones"
      pageSubtitle="Apple Watch Ultra, DJI camera drones, tablets, and executive tech accessories."
    />
  );
}
