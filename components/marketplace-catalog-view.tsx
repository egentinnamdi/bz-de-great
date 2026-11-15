'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  X,
  Upload,
  ShieldCheck,
  Camera,
  Video,
  Ticket,
  SlidersHorizontal,
  ArrowRight,
  Package,
  MessageSquare,
} from 'lucide-react';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CopyButton } from './copy-button';
import { useStore } from '@/lib/store';
import { Product, ProductOrder } from '@/lib/types';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import { computeDeliveryFee } from '@/lib/commerce-engine';
import { supabaseService } from '@/lib/supabase/service';

interface MarketplaceCatalogViewProps {
  initialCategorySlug?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function MarketplaceCatalogView({
  initialCategorySlug = 'all',
  pageTitle,
  pageSubtitle,
}: MarketplaceCatalogViewProps) {
  const {
    productCategories,
    products,
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    createProductOrder,
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategorySlug);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryState, setDeliveryState] = useState('Abuja (FCT)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<ProductOrder | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const activeCategoryObj = productCategories.find((c) => c.slug === activeCategory);

  const publishedProducts = useMemo(
    () => products.filter((p) => p.status === 'published'),
    [products]
  );

  const availableBrands = useMemo(() => {
    const scoped =
      activeCategory === 'all'
        ? publishedProducts
        : publishedProducts.filter((p) => p.categorySlug === activeCategory);
    return Array.from(new Set(scoped.map((p) => p.brand).filter(Boolean)));
  }, [publishedProducts, activeCategory]);

  const filteredProducts = useMemo(() => {
    return publishedProducts
      .filter((p) => {
        if (activeCategory !== 'all' && p.categorySlug !== activeCategory) return false;
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = p.name.toLowerCase().includes(q);
          const inBrand = p.brand.toLowerCase().includes(q);
          const inCategory = p.categorySlug.toLowerCase().includes(q);
          const inDesc = p.description.toLowerCase().includes(q);
          const inSpecs = Object.values(p.specifications).some((val) =>
            String(val).toLowerCase().includes(q)
          );
          if (!inName && !inBrand && !inCategory && !inDesc && !inSpecs) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [publishedProducts, activeCategory, selectedBrand, searchQuery, sortBy]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const deliveryFee = computeDeliveryFee(deliveryState, cartSubtotal);
  const cartTotal = cartSubtotal + deliveryFee;

  const handleAddToCart = (product: Product, openDrawer = false) => {
    const chosenVariantId =
      selectedVariants[product.id] ||
      (product.variants && product.variants.length > 0 ? product.variants[0].id : undefined);

    const res = addToCart({
      productId: product.id,
      variantId: chosenVariantId,
      quantity: 1,
    });

    if (!res.ok) {
      showToast(res.error || 'Could not add item to cart.');
      return;
    }

    showToast(`Added "${product.name}" to your order bag.`);
    if (openDrawer) {
      setCheckoutStep('cart');
      setCartOpen(true);
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const uploaded = await supabaseService.uploadReceipt(file, `ORD-TEMP-${Date.now()}`);
      if (uploaded) {
        setReceiptUrl(uploaded);
      }
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setCheckoutError('Please provide your full name, phone number, and email address.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setCheckoutError('Please enter your delivery address or pickup branch preference.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await createProductOrder({
        items: cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId,
          quantity: c.quantity,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryState,
        receiptUrl: receiptUrl || undefined,
        notes: orderNotes.trim() || undefined,
      });

      if (!res.ok || !res.order) {
        setCheckoutError(res.error || 'Unable to place order.');
        return;
      }

      setCompletedOrder(res.order);
      setCheckoutStep('success');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const resolvedTitle =
    pageTitle ||
    (activeCategoryObj
      ? `${activeCategoryObj.name} Marketplace`
      : 'Marketplace, Lagos Studio & Events');

  const resolvedSubtitle =
    pageSubtitle ||
    (activeCategoryObj
      ? activeCategoryObj.description
      : 'Shop verified phones, laptops, gadgets, electronics, solar & inverter systems, bespoke clothing, and fine jewelry — or book our Lagos State creative studio, cinema gear, and event tickets.');

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-[#1b1416] text-white px-4 py-3 shadow-xl border border-white/10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Marketplace Hero Banner */}
      <section className="relative overflow-hidden bg-black text-white py-14 lg:py-16 border-b border-white/10">
        {/* Background Commerce Image (70% visibility over black) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85"
            alt=""
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/70" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-xs">
                {resolvedTitle}
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {resolvedSubtitle}
              </p>
            </div>

            {/* Service Pillar Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#1b1416] px-4 py-2.5 text-xs font-bold shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#81141f]" />
                <span>Marketplace ({publishedProducts.length})</span>
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-black/60 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Camera className="w-4 h-4 text-[#f6e3e5]" />
                <span>Lagos Studio Booking</span>
              </Link>
              <Link
                href="/equipment-rental"
                className="inline-flex items-center gap-2 rounded-xl bg-black/60 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Video className="w-4 h-4 text-[#f6e3e5]" />
                <span>Camera &amp; Gear Rental</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-black/60 hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Ticket className="w-4 h-4 text-[#f6e3e5]" />
                <span>Events &amp; Tickets</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Grid */}
      <main id="marketplace-catalog-grid" className="flex-1 py-12 lg:py-16 scroll-mt-[100px]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          {/* Row 1: Standard Search Bar & Filter/Sort/Bag Controls */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById('marketplace-catalog-grid')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex items-center w-full lg:max-w-md bg-white rounded-xl p-1 border border-[#d6ccce] focus-within:border-[#81141f] shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#716769] ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or keywords..."
                className="w-full h-9 px-2.5 text-xs sm:text-sm text-[#1b1416] placeholder:text-[#716769] bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-[#716769] hover:text-[#1b1416] cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-[#81141f] hover:bg-[#6b121c] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Brand Filter, Sort & Cart Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#716769]">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="font-semibold">Brand:</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="h-10 rounded-xl border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416]"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')
                }
                className="h-10 rounded-xl border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416]"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <Button
                type="button"
                onClick={() => {
                  setCheckoutStep('cart');
                  setCartOpen(true);
                }}
                className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white text-xs font-bold gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Bag ({cartCount})</span>
                {cartSubtotal > 0 && (
                  <span className="hidden sm:inline text-[#f6e3e5]">
                    · ₦{cartSubtotal.toLocaleString()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Row 2: Direct Category Filter Chips directly above Product Cards */}
          <div className="mb-8 pb-5 border-b border-[#eae3e4] space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1b1416]">
                {activeCategoryObj ? activeCategoryObj.name : 'All Verified Products'}
              </h2>
              <p className="text-xs sm:text-sm text-[#716769]">
                Showing {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} · Direct bank transfer verification &amp; nationwide insured delivery
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedBrand('all');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#81141f] border-[#81141f] text-white shadow-xs'
                    : 'bg-[#f8f5f5] border-[#eae3e4] text-[#4d4547] hover:border-[#81141f] hover:text-[#81141f]'
                }`}
              >
                All Categories ({publishedProducts.length})
              </button>
              {productCategories
                .filter((c) => c.active)
                .map((cat) => {
                  const count = publishedProducts.filter(
                    (p) => p.categorySlug === cat.slug
                  ).length;
                  const isSelected = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setSelectedBrand('all');
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#81141f] border-[#81141f] text-white shadow-xs'
                          : 'bg-[#f8f5f5] border-[#eae3e4] text-[#4d4547] hover:border-[#81141f] hover:text-[#81141f]'
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[#eae3e4] bg-[#f8f5f5] p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[#81141f] mx-auto" />
              <h3 className="text-lg font-bold text-[#1b1416]">No matching products found</h3>
              <p className="text-sm text-[#716769] max-w-md mx-auto">
                Try clearing your search filter or switching to All Categories.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedBrand('all');
                  setSearchQuery('');
                }}
                className="bg-[#81141f] text-white h-10 px-5 rounded-xl text-xs font-bold"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const chosenVariantId =
                  selectedVariants[product.id] ||
                  (product.variants && product.variants.length > 0
                    ? product.variants[0].id
                    : undefined);
                const activeVariant = product.variants?.find(
                  (v) => v.id === chosenVariantId
                );
                const displayPrice = activeVariant ? activeVariant.price : product.price;
                const displayStock = activeVariant ? activeVariant.stock : product.stock;
                const specSummary = Object.values(product.specifications)
                  .slice(0, 2)
                  .join(' · ');

                return (
                  <div
                    key={product.id}
                    onClick={() => setDetailProduct(product)}
                    className="h-[400px] sm:h-[420px] rounded-2xl relative overflow-hidden border border-[#eae3e4] bg-[#f8f5f5] shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    {/* Full-bleed Product Image */}
                    <img
                      src={product.images[0] || '/photos/gallery-bz-1.jpg'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Subtle Gradient Framing */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

                    {/* Top Minimal Badges */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider truncate">
                        {product.brand} · {product.condition}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-[#1b1416] shadow-xs shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            displayStock > 0 ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        <span>{displayStock > 0 ? `${displayStock} left` : 'Sold out'}</span>
                      </span>
                    </div>

                    {/* Bottom Translucent Glass Details Card */}
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/88 backdrop-blur-md border border-white/80 p-4 shadow-lg transition-all duration-300 group-hover:bg-white/95">
                      <h3 className="text-[15px] sm:text-base font-bold text-[#1b1416] line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-medium text-[#5a5052] line-clamp-1 mt-0.5">
                        {specSummary || product.description}
                      </p>

                      {/* Price & Quick Actions */}
                      <div className="mt-3 pt-2.5 border-t border-[#eae3e4]/80 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-base sm:text-lg font-extrabold text-[#1b1416]">
                            ₦{displayPrice.toLocaleString()}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                            <span className="ml-1.5 text-[11px] text-[#716769] line-through">
                              ₦{product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setDetailProduct(product)}
                            className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white/80 hover:bg-white text-[11px] font-semibold text-[#4d4547] hover:text-[#1b1416] transition-colors cursor-pointer"
                          >
                            Specs
                          </button>
                          <button
                            type="button"
                            disabled={displayStock <= 0}
                            onClick={() => handleAddToCart(product, false)}
                            className="h-8 px-2.5 rounded-lg border border-[#eae3e4] bg-white hover:border-[#81141f] text-[11px] font-bold text-[#1b1416] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            + Bag
                          </button>
                          <button
                            type="button"
                            disabled={displayStock <= 0}
                            onClick={() => handleAddToCart(product, true)}
                            className="h-8 px-3 rounded-lg bg-[#81141f] hover:bg-[#6b121c] text-white text-[11px] font-bold disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Product Specification Detail Modal */}
      {detailProduct && (() => {
        const chosenVariantId =
          selectedVariants[detailProduct.id] ||
          (detailProduct.variants && detailProduct.variants.length > 0
            ? detailProduct.variants[0].id
            : undefined);
        const activeVariant = detailProduct.variants?.find(
          (v) => v.id === chosenVariantId
        );
        const detailPrice = activeVariant ? activeVariant.price : detailProduct.price;
        const detailStock = activeVariant ? activeVariant.stock : detailProduct.stock;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#eae3e4] shadow-2xl overflow-hidden my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae3e4] bg-[#f8f5f5]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                    {detailProduct.brand} · {detailProduct.condition}
                  </span>
                  <h3 className="text-lg font-bold text-[#1b1416]">{detailProduct.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="p-2 rounded-lg text-[#716769] hover:text-[#1b1416] hover:bg-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <img
                    src={detailProduct.images[0] || '/photos/gallery-bz-1.jpg'}
                    alt={detailProduct.name}
                    className="w-full h-52 object-cover rounded-xl border border-[#eae3e4]"
                  />
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#1b1416]">
                        ₦{detailPrice.toLocaleString()}
                      </span>
                      {detailProduct.compareAtPrice && detailProduct.compareAtPrice > detailPrice && (
                        <span className="text-xs text-[#716769] line-through">
                          ₦{detailProduct.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                      <span
                        className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          detailStock > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {detailStock > 0 ? `${detailStock} in stock` : 'Sold out'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4d4547] leading-relaxed">
                      {detailProduct.description}
                    </p>
                    {detailProduct.variants && detailProduct.variants.length > 0 && (
                      <div className="pt-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
                          Select Option / Variant
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {detailProduct.variants.map((v) => {
                            const isSel = v.id === chosenVariantId;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [detailProduct.id]: v.id,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                  isSel
                                    ? 'bg-[#fbf3f4] border-[#81141f] text-[#81141f]'
                                    : 'bg-white border-[#eae3e4] text-[#4d4547] hover:bg-[#f8f5f5]'
                                }`}
                              >
                                {v.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {detailProduct.warranty && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{detailProduct.warranty}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#716769] mb-2.5">
                    Technical Specifications &amp; Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(detailProduct.specifications).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl bg-[#f8f5f5] border border-[#eae3e4] px-3.5 py-2.5"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#716769]">
                          {k}
                        </span>
                        <span className="block text-xs font-semibold text-[#1b1416] mt-0.5">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eae3e4]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailProduct(null)}
                    className="h-10 px-4 rounded-xl border-[#eae3e4]"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    disabled={detailStock <= 0}
                    onClick={() => {
                      handleAddToCart(detailProduct, true);
                      setDetailProduct(null);
                    }}
                    className="h-10 px-5 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Add to Bag &amp; Checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cart & Checkout Modal Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl border-l border-[#eae3e4]">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#eae3e4] bg-black text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ebc7cb]">
                  BZ MARKETPLACE CHECKOUT
                </span>
                <h3 className="text-lg font-bold">
                  {checkoutStep === 'cart' && `Your Order Bag (${cartCount})`}
                  {checkoutStep === 'details' && 'Delivery & Bank Transfer Verification'}
                  {checkoutStep === 'success' && 'Order Confirmed'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-[#81141f] mx-auto" />
                      <h4 className="text-base font-bold text-[#1b1416]">
                        Your order bag is empty
                      </h4>
                      <p className="text-xs text-[#716769] max-w-xs mx-auto">
                        Add phones, laptops, solar systems, clothing, or jewelry from the catalog to proceed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[#eae3e4] p-4 flex items-center gap-4 bg-[#f8f5f5]"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 rounded-lg object-cover border border-[#eae3e4] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#1b1416] truncate">
                              {item.productName}
                            </h4>
                            {item.variantLabel && (
                              <span className="block text-[11px] font-semibold text-[#81141f]">
                                {item.variantLabel}
                              </span>
                            )}
                            <span className="block text-xs font-bold text-[#4d4547] mt-1">
                              ₦{item.unitPrice.toLocaleString()} each
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartItemQuantity(item.id, item.quantity - 1)
                              }
                              className="w-7 h-7 rounded-lg border border-[#eae3e4] bg-white flex items-center justify-center hover:bg-[#fbf3f4] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartItemQuantity(item.id, item.quantity + 1)
                              }
                              className="w-7 h-7 rounded-lg border border-[#eae3e4] bg-white flex items-center justify-center hover:bg-[#fbf3f4] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="ml-1 p-1.5 text-[#716769] hover:text-red-600 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#716769]">Items Subtotal</span>
                          <span className="font-bold text-[#1b1416]">
                            ₦{cartSubtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#716769]">
                            Insured Delivery ({deliveryState})
                          </span>
                          <span className="font-bold text-[#1b1416]">
                            {deliveryFee === 0
                              ? 'Free (Office Pickup)'
                              : `₦${deliveryFee.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#eae3e4] text-sm">
                          <span className="font-bold text-[#1b1416]">Authoritative Total</span>
                          <span className="font-extrabold text-[#81141f]">
                            ₦{cartTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'details' && (
                <form id="marketplace-checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                  {checkoutError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                      {checkoutError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Chidi Okafor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Phone / WhatsApp *
                      </label>
                      <Input
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Delivery State / Pickup *
                      </label>
                      <select
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416]"
                      >
                        <option value="Abuja (FCT)">Abuja (FCT) — ₦15,000</option>
                        <option value="Lagos State">Lagos State — ₦15,000</option>
                        <option value="Anambra / Delta">Anambra / Delta — ₦25,000</option>
                        <option value="Other State (Nationwide)">Other State — ₦25,000</option>
                        <option value="Office Pickup (Walk-in)">
                          Branch Office Pickup — Free
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1b1416] mb-1">
                        Street Address / Branch *
                      </label>
                      <Input
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street address or branch city"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1416] mb-1">
                      Delivery or Specification Notes (Optional)
                    </label>
                    <Input
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Preferred delivery window or serial verification instructions"
                    />
                  </div>

                  {/* Official Bank Transfer Box */}
                  <div className="rounded-xl bg-[#fbf3f4] border border-[#e6d3d6] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#81141f]">
                        OFFICIAL BANK TRANSFER ACCOUNT
                      </span>
                      <span className="text-sm font-extrabold text-[#1b1416]">
                        ₦{cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#eae3e4] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#716769]">
                          {SITE_CONFIG.bankDetails.bankName}
                        </p>
                        <p className="text-base font-extrabold tracking-wider text-[#1b1416]">
                          {SITE_CONFIG.bankDetails.accountNumber}
                        </p>
                        <p className="text-[11px] font-bold text-[#4d4547]">
                          {SITE_CONFIG.bankDetails.accountName}
                        </p>
                      </div>
                      <CopyButton
                        text={SITE_CONFIG.bankDetails.accountNumber}
                        label="Copy Account"
                      />
                    </div>

                    {/* Optional Receipt Upload */}
                    <div className="pt-1">
                      <label className="block text-xs font-bold text-[#1b1416] mb-1.5">
                        Upload Transfer Receipt (Optional — or upload later on Track Booking)
                      </label>
                      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#81141f]/50 bg-white px-4 py-2.5 text-xs font-semibold text-[#81141f] hover:bg-[#fbf3f4] cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>
                          {uploadingReceipt
                            ? 'Uploading receipt...'
                            : receiptUrl
                            ? 'Receipt Attached ✓ (Click to change)'
                            : 'Select Payment Receipt Image / PDF'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && completedOrder && (
                <div className="space-y-5 py-4">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                      ORDER REGISTERED
                    </span>
                    <h4 className="text-2xl font-extrabold text-[#1b1416]">
                      {completedOrder.id}
                    </h4>
                    <p className="text-xs text-[#4d4547]">
                      Save your reference code above to track dispatch and payment verification.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eae3e4] p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Customer</span>
                      <span className="font-bold">{completedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Delivery</span>
                      <span className="font-bold">
                        {completedOrder.deliveryAddress} ({completedOrder.deliveryState})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716769]">Total Amount</span>
                      <span className="font-extrabold text-[#81141f]">
                        ₦{completedOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={getWhatsAppBookingLink(
                        completedOrder.id,
                        completedOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
                        `Total: ₦${completedOrder.totalAmount.toLocaleString()} | Delivery: ${completedOrder.deliveryState}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl gap-2 justify-center cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>Confirm Order on WhatsApp Concierge</span>
                      </Button>
                    </a>
                    <Link href={`/my-booking?ref=${completedOrder.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-[#eae3e4] text-xs font-bold cursor-pointer"
                      >
                        Track Order Status ({completedOrder.id})
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {checkoutStep !== 'success' && cart.length > 0 && (
              <div className="p-6 border-t border-[#eae3e4] bg-[#f8f5f5] flex items-center justify-between gap-3">
                {checkoutStep === 'cart' ? (
                  <>
                    <div>
                      <span className="block text-[11px] text-[#716769] font-medium">
                        Total with Delivery
                      </span>
                      <span className="text-lg font-extrabold text-[#1b1416]">
                        ₦{cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setCheckoutStep('details')}
                      className="h-11 px-6 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs cursor-pointer"
                    >
                      Proceed to Checkout →
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCheckoutStep('cart')}
                      className="h-11 px-4 rounded-xl border-[#eae3e4] text-xs font-bold"
                    >
                      ← Back to Bag
                    </Button>
                    <Button
                      type="submit"
                      form="marketplace-checkout-form"
                      disabled={submittingOrder}
                      className="h-11 px-6 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs cursor-pointer"
                    >
                      {submittingOrder
                        ? 'Submitting Order...'
                        : `Complete Order (₦${cartTotal.toLocaleString()})`}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
