import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Solar Panels & Hybrid Inverters | BZ Group Marketplace',
  description: 'Hybrid solar inverters, LiFePO4 lithium battery walls, and monocrystalline solar panels for homes and offices.',
};

export default function SolarInvertersCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="solar-inverters"
      pageTitle="Solar Panels & Hybrid Inverters"
      pageSubtitle="Uninterrupted 24/7 power systems: Deye hybrid inverters, LiFePO4 lithium battery packs, and Jinko monocrystalline solar panels."
    />
  );
}
