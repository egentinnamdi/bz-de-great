import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Laptops & Workstations | BZ Group Marketplace',
  description: 'Apple MacBook Pro, Dell XPS, and executive creator laptops inspected and backed by warranty.',
};

export default function LaptopsCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="laptops"
      pageTitle="Laptops & Executive Workstations"
      pageSubtitle="Apple MacBook Pro, Dell XPS OLED, and high-performance engineering laptops ready for immediate dispatch."
    />
  );
}
