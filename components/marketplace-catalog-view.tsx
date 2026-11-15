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
  Sparkles,
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
          const inDesc = p.description.toLowerCase().includes(q);
          const inSpecs = Object.values(p.specifications).some((val) =>
            String(val).toLowerCase().includes(q)
          );
          if (!inName && !inBrand && !inDesc && !inSpecs) return false;
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

      {/* Hero Banner */}
      <section className="bg-[#4e0b13] text-white py-14 lg:py-16 border-b border-[#630f1a]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#81141f] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f6e3e5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BZ DE GREAT MULTI-SERVICE COMMERCE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.12]">
                {resolvedTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#ebc7cb] leading-relaxed">
                {resolvedSubtitle}
              </p>
            </div>

            {/* Service Pillar Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4e0b13] px-4 py-2.5 text-xs font-bold shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#81141f]" />
                <span>Marketplace ({publishedProducts.length})</span>
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#ebc7cb]" />
                <span>Lagos Studio Booking</span>
              </Link>
              <Link
                href="/equipment-rental"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Video className="w-4 h-4 text-[#ebc7cb]" />
                <span>Camera &amp; Gear Rental</span>
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#63101a] hover:bg-[#81141f] text-white px-4 py-2.5 text-xs font-semibold border border-white/15 transition-colors"
              >
                <Ticket className="w-4 h-4 text-[#ebc7cb]" />
                <span>Events &amp; Tickets</span>
              </Link>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSelectedBrand('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-[#4e0b13] shadow-xs'
                  : 'bg-[#63101a]/70 text-[#f6e3e5] hover:bg-[#81141f]'
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#4e0b13] shadow-xs'
                        : 'bg-[#63101a]/70 text-[#f6e3e5] hover:bg-[#81141f]'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="border-b border-[#eae3e4] bg-[#f8f5f5] py-4 sticky top-[88px] lg:top-[101px] z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, MacBooks, Deye solar, gold jewelry, Senator suits..."
              className="pl-10 h-10 bg-white border-[#eae3e4] rounded-xl text-sm"
            />
          </div>

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
      </section>

      {/* Main Catalog Grid */}
      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
          {/* Dedicated SEO Category Route Quick Links */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1b1416]">
                {activeCategoryObj ? activeCategoryObj.name : 'All Verified Products'}
              </h2>
              <p className="text-xs sm:text-sm text-[#716769]">
                Showing {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} · Direct bank transfer verification &amp; nationwide insured delivery
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#716769] font-medium">Direct Category Pages:</span>
              {[
                { label: 'Phones', href: '/phones' },
                { label: 'Laptops', href: '/laptops' },
                { label: 'Gadgets', href: '/gadgets' },
                { label: 'Electronics', href: '/electronics' },
                { label: 'Solar & Inverters', href: '/solar-inverters' },
                { label: 'Clothing', href: '/clothing' },
                { label: 'Jewelry', href: '/jewelry' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1 rounded-lg border border-[#eae3e4] bg-[#f8f5f5] hover:border-[#81141f] hover:text-[#81141f] font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
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

                return (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-[#eae3e4] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative h-56 bg-[#f8f5f5] overflow-hidden">
                      <img
                        src={product.images[0] || '/photos/gallery-bz-1.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-[#4e0b13]/90 backdrop-blur-xs text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <span className="rounded-md bg-white/95 text-[#1b1416] px-2.5 py-1 text-[11px] font-semibold shadow-xs">
                          {product.condition}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            displayStock > 0
                              ? 'bg-emerald-950/90 text-emerald-300'
                              : 'bg-red-950/90 text-red-200'
                          }`}
                        >
                          {displayStock > 0 ? `${displayStock} in stock` : 'Sold out'}
                        </span>
                      </div>
                    </div>

                    {/* Product Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-[#1b1416] leading-snug">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#716769] line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Top Specifications Grid */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2">
                          {Object.entries(product.specifications)
                            .slice(0, 4)
                            .map(([key, val]) => (
                              <div
                                key={key}
                                className="rounded-lg bg-[#f8f5f5] px-2.5 py-1.5 border border-[#eae3e4]/70 truncate"
                              >
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#716769]">
                                  {key}
                                </span>
                                <span className="block text-xs font-semibold text-[#1b1416] truncate">
                                  {val}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Variants Selector */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="pt-2">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#716769] mb-1.5">
                              Select Option / Variant
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {product.variants.map((v) => {
                                const isSel = v.id === chosenVariantId;
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedVariants((prev) => ({
                                        ...prev,
                                        [product.id]: v.id,
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
                      </div>

                      {/* Price & Actions */}
                      <div className="pt-4 border-t border-[#eae3e4] space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xl font-extrabold text-[#1b1416]">
                              ₦{displayPrice.toLocaleString()}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                              <span className="ml-2 text-xs text-[#716769] line-through">
                                ₦{product.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setDetailProduct(product)}
                            className="text-xs font-bold text-[#81141f] hover:underline cursor-pointer"
                          >
                            Full Specs →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={displayStock <= 0}
                            onClick={() => handleAddToCart(product, false)}
                            className="h-10 rounded-xl border-[#eae3e4] hover:border-[#81141f] text-[#1b1416] text-xs font-bold cursor-pointer"
                          >
                            Add to Bag
                          </Button>
                          <Button
                            type="button"
                            disabled={displayStock <= 0}
                            onClick={() => handleAddToCart(product, true)}
                            className="h-10 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white text-xs font-bold cursor-pointer"
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cross-Division Banner for Studio, Equipment & Events */}
          <div className="mt-16 rounded-2xl bg-[#fbf3f4] border border-[#e6d3d6] p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white p-6 border border-[#eae3e4] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fbf3f4] text-[#81141f] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1b1416]">
                Lagos State Photo &amp; Video Studio
              </h3>
              <p className="text-xs text-[#716769] leading-relaxed">
                Book our acoustic-treated cyclorama &amp; portrait studio in Lekki-Ajah, Lagos State with live slot conflict protection.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81141f] hover:underline pt-1"
              >
                <span>Book Studio Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 border border-[#eae3e4] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fbf3f4] text-[#81141f] flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1b1416]">
                Camera &amp; Media Gear Rentals
              </h3>
              <p className="text-xs text-[#716769] leading-relaxed">
                Rent Sony FX3, RED Komodo 6K, G-Master lenses, Aputure 600d Pro lights, and wireless audio kits by the day.
              </p>
              <Link
                href="/equipment-rental"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81141f] hover:underline pt-1"
              >
                <span>Browse Rental Gear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 border border-[#eae3e4] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fbf3f4] text-[#81141f] flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1b1416]">
                Events &amp; QR Digital Tickets
              </h3>
              <p className="text-xs text-[#716769] leading-relaxed">
                Reserve Regular, VIP, and VVIP passes for upcoming BZ Group galas, investor briefings, and masterclasses.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81141f] hover:underline pt-1"
              >
                <span>View Upcoming Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Product Specification Detail Modal */}
      {detailProduct && (
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
                  <div className="text-2xl font-extrabold text-[#1b1416]">
                    ₦{detailProduct.price.toLocaleString()}
                  </div>
                  <p className="text-xs text-[#4d4547] leading-relaxed">
                    {detailProduct.description}
                  </p>
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
                  onClick={() => {
                    handleAddToCart(detailProduct, true);
                    setDetailProduct(null);
                  }}
                  className="h-10 px-5 rounded-xl bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs cursor-pointer"
                >
                  Add to Bag &amp; Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Modal Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl border-l border-[#eae3e4]">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#eae3e4] bg-[#4e0b13] text-white flex items-center justify-between">
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
