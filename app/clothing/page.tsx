import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Executive Clothing & Senator Attire | BZ Group Marketplace',
  description: 'Bespoke Italian cashmere Senator suits, tailored kaftans, and luxury corporate wear.',
};

export default function ClothingCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="clothing"
      pageTitle="Bespoke Clothing & Executive Attire"
      pageSubtitle="Hand-finished Italian cashmere Senator two-piece suits, kaftans, and tailored executive wardrobe essentials."
    />
  );
}
