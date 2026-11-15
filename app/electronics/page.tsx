import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Electronics & Home Cinema | BZ Group Marketplace',
  description: '4K/8K OLED Smart TVs, home cinema systems, and luxury residential electronics.',
};

export default function ElectronicsCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="electronics"
      pageTitle="Electronics & Home Cinema"
      pageSubtitle="65-inch and 77-inch OLED Smart TVs, Dolby Atmos audio systems, and executive office electronics."
    />
  );
}
