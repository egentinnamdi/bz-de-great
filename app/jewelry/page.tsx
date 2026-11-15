import React from 'react';
import { MarketplaceCatalogView } from '@/components/marketplace-catalog-view';

export const metadata = {
  title: 'Fine Jewelry & Gold Collection | BZ Group Marketplace',
  description: '18K solid gold chains, bracelets, rings, and certified luxury timepieces.',
};

export default function JewelryCategoryPage() {
  return (
    <MarketplaceCatalogView
      initialCategorySlug="jewelry"
      pageTitle="Fine Jewelry & 18K Gold Vault"
      pageSubtitle="Assay-certified 18K Italian gold chains, bracelets, rings, and luxury statement pieces."
    />
  );
}
