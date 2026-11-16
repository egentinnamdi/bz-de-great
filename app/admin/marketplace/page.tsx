'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';
import {
  OrderStatus,
  Product,
  ProductCategory,
  ProductCategorySlug,
  ProductOrder,
  ProductVariant,
} from '@/lib/types';
import {
  CommerceCustomerCard,
  CommerceDrawer,
  CommerceEmptyState,
  CommerceFilterPills,
  CommerceHeader,
  CommerceImageField,
  CommerceMetricStrip,
  CommercePaymentCard,
  CommerceStatusPill,
  CommerceTabs,
  CommerceTwoStepDelete,
  RowChevron,
  formatCompactNgn,
  formatNgn,
  formatShortDate,
} from '@/components/admin/commerce-ui';
import { cn } from '@/lib/utils';

type MarketplaceTab = 'products' | 'orders' | 'categories';
type OrderFilter = 'all' | 'action' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
type ProductStockFilter = 'all' | 'published' | 'low' | 'draft' | 'archived';

const ORDER_STATUS_STEPS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminMarketplacePage() {
  const {
    productCategories,
    products,
    productOrders,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    updateProductOrder,
    addActivity,
  } = useStore();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<MarketplaceTab>('products');
  const [search, setSearch] = useState('');

  // Catalog filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all');

  // Orders filters
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');

  // Product Drawer state (null = closed, 'new' = creating, Product = editing)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategorySlug, setProdCategorySlug] = useState<ProductCategorySlug>('phones');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCondition, setProdCondition] = useState('Brand New');
  const [prodWarranty, setProdWarranty] = useState('1 Year Official Warranty');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCompareAt, setProdCompareAt] = useState('');
  const [prodStock, setProdStock] = useState('5');
  const [prodStatus, setProdStatus] = useState<Product['status']>('published');
  const [prodFeatured, setProdFeatured] = useState(true);
  const [prodImageUrl, setProdImageUrl] = useState('/photos/gallery-bz-1.jpg');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSpecs, setProdSpecs] = useState<Record<string, string>>({});
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);

  // Order Inspector Drawer state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Category Drawer state
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSpecs, setCatSpecs] = useState('Brand, Model, Condition, Warranty');
  const [catActive, setCatActive] = useState(true);

  const selectedOrder = useMemo(
    () => productOrders.find((o) => o.id === selectedOrderId) || null,
    [productOrders, selectedOrderId]
  );

  const selectedCategoryObj = useMemo(
    () =>
      productCategories.find((c) => c.slug === prodCategorySlug) || productCategories[0],
    [productCategories, prodCategorySlug]
  );

  const getProductTotalStock = (p: Product) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return p.stock;
  };

  // Metrics
  const metrics = useMemo(() => {
    const publishedProducts = products.filter((p) => p.status === 'published');
    const draftProducts = products.filter((p) => p.status === 'draft');
    const lowOrOutCount = publishedProducts.filter((p) => getProductTotalStock(p) <= 3).length;

    const actionableOrders = productOrders.filter(
      (o) =>
        o.orderStatus !== 'cancelled' &&
        (o.orderStatus === 'pending' ||
          o.paymentStatus === 'pending' ||
          o.paymentStatus === 'receipt_uploaded')
    );

    const verifiedRevenue = productOrders
      .filter((o) => o.paymentStatus === 'verified')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const grossVolume = productOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const activeCategories = productCategories.filter((c) => c.active);

    return {
      publishedCount: publishedProducts.length,
      draftCount: draftProducts.length,
      lowOrOutCount,
      actionableOrdersCount: actionableOrders.length,
      verifiedRevenue,
      grossVolume,
      activeCategoriesCount: activeCategories.length,
    };
  }, [products, productOrders, productCategories]);

  // Filtered lists
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter) return false;
      const totalStock = getProductTotalStock(p);
      if (stockFilter === 'published' && p.status !== 'published') return false;
      if (stockFilter === 'draft' && p.status !== 'draft') return false;
      if (stockFilter === 'archived' && p.status !== 'archived') return false;
      if (stockFilter === 'low' && totalStock > 3) return false;

      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, search]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productOrders.filter((o) => {
      if (orderFilter === 'action') {
        const needsAction =
          o.orderStatus !== 'cancelled' &&
          (o.orderStatus === 'pending' ||
            o.paymentStatus === 'pending' ||
            o.paymentStatus === 'receipt_uploaded');
        if (!needsAction) return false;
      } else if (orderFilter !== 'all' && o.orderStatus !== orderFilter) {
        return false;
      }

      if (q) {
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.deliveryState.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [productOrders, orderFilter, search]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productCategories;
    return productCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [productCategories, search]);

  // Product Drawer Handlers
  const openCreateProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategorySlug(productCategories[0]?.slug || 'phones');
    setProdBrand('');
    setProdCondition('Brand New');
    setProdWarranty('1 Year Official Warranty');
    setProdPrice('');
    setProdCompareAt('');
    setProdStock('5');
    setProdStatus('published');
    setProdFeatured(true);
    setProdImageUrl('/photos/gallery-bz-1.jpg');
    setProdDescription('');
    setProdSpecs({});
    setProdVariants([]);
    setProductDrawerOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategorySlug(p.categorySlug);
    setProdBrand(p.brand);
    setProdCondition(p.condition);
    setProdWarranty(p.warranty || '');
    setProdPrice(String(p.price));
    setProdCompareAt(p.compareAtPrice ? String(p.compareAtPrice) : '');
    setProdStock(String(p.stock));
    setProdStatus(p.status);
    setProdFeatured(Boolean(p.featured));
    setProdImageUrl(p.images[0] || '/photos/gallery-bz-1.jpg');
    setProdDescription(p.description);
    setProdSpecs({ ...p.specifications });
    setProdVariants(p.variants ? p.variants.map((v) => ({ ...v })) : []);
    setProductDrawerOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;

    const cleanPrice = Number(prodPrice) || 0;
    const cleanCompare = prodCompareAt ? Number(prodCompareAt) || undefined : undefined;
    const cleanVariants = prodVariants.filter((v) => v.label.trim());
    const computedStock =
      cleanVariants.length > 0
        ? cleanVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : Math.max(0, Number(prodStock) || 0);

    const payload = {
      name: prodName.trim(),
      categoryId: selectedCategoryObj?.id || 'cat-phones',
      categorySlug: prodCategorySlug,
      brand: prodBrand.trim() || 'BZ Verified',
      condition: prodCondition.trim() || 'Brand New',
      warranty: prodWarranty.trim() || undefined,
      description: prodDescription.trim() || `${prodName.trim()} verified by BZ Group Marketplace.`,
      price: cleanPrice,
      compareAtPrice: cleanCompare,
      currency: 'NGN' as const,
      images: [prodImageUrl.trim() || '/photos/gallery-bz-1.jpg'],
      stock: computedStock,
      status: prodStatus,
      featured: prodFeatured,
      specifications: {
        ...prodSpecs,
        Brand: prodBrand.trim() || prodSpecs.Brand || 'BZ Verified',
        Condition: prodCondition.trim() || prodSpecs.Condition || 'Brand New',
        ...(prodWarranty.trim() ? { Warranty: prodWarranty.trim() } : {}),
      },
      variants: cleanVariants.length > 0 ? cleanVariants : undefined,
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);
      await addActivity({
        actorName: user?.name || 'Admin',
        actorRole: user?.role || 'Marketplace Desk',
        action: `updated product: ${payload.name}`,
        targetId: editingProductId,
        category: 'listings',
      });
      toast({
        title: 'Product updated',
        description: `${payload.name} saved to marketplace catalog.`,
        variant: 'success',
      });
    } else {
      const slugBase = prodName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      await addProduct({
        ...payload,
        slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      });
      toast({
        title: 'Product published',
        description: `${payload.name} added to marketplace.`,
        variant: 'success',
      });
    }

    setProductDrawerOpen(false);
  };

  const handleDeleteProduct = async () => {
    if (!editingProductId) return;
    const targetName = prodName || 'product';
    await deleteProduct(editingProductId);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Marketplace Desk',
      action: `removed product: ${targetName}`,
      targetId: editingProductId,
      category: 'listings',
    });
    toast({
      title: 'Product removed',
      description: `${targetName} deleted from catalog.`,
      variant: 'default',
    });
    setProductDrawerOpen(false);
  };

  const handleAddVariantRow = () => {
    const idx = prodVariants.length + 1;
    setProdVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${idx}`,
        sku: `SKU-${Date.now().toString().slice(-4)}-${idx}`,
        label: '',
        attributes: {},
        price: Number(prodPrice) || 0,
        stock: 1,
      },
    ]);
  };

  // Order Update Handlers
  const handleOrderUpdate = async (
    order: ProductOrder,
    updates: Partial<ProductOrder>,
    actionNote: string
  ) => {
    await updateProductOrder(order.id, updates);
    await addActivity({
      actorName: user?.name || 'Admin',
      actorRole: user?.role || 'Marketplace Desk',
      action: `${actionNote} for order ${order.id}`,
      target: `${order.customerName} · ${formatNgn(order.totalAmount)}`,
      targetId: order.id,
      category: 'payments',
    });
    toast({
      title: `Order ${order.id} updated`,
      description: actionNote,
      variant: 'success',
    });
  };

  // Category Drawer Handlers
  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatSpecs('Brand, Model, Condition, Warranty');
    setCatActive(true);
    setCategoryDrawerOpen(true);
  };

  const openEditCategory = (cat: ProductCategory) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description);
    setCatSpecs(cat.specFields.join(', '));
    setCatActive(cat.active);
    setCategoryDrawerOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const cleanSlug =
      catSlug.trim() ||
      catName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const specList = catSpecs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCategoryId) {
      await updateProductCategory(editingCategoryId, {
        name: catName.trim(),
        slug: cleanSlug,
        description: catDesc.trim() || `${catName.trim()} catalog`,
        specFields: specList,
        active: catActive,
      });
      toast({
        title: 'Category updated',
        description: `${catName.trim()} settings saved.`,
        variant: 'success',
      });
    } else {
      await addProductCategory({
        name: catName.trim(),
        slug: cleanSlug,
        description: catDesc.trim() || `${catName.trim()} catalog`,
        specFields: specList,
        active: catActive,
      });
      toast({
        title: 'Category created',
        description: `${catName.trim()} added to marketplace.`,
        variant: 'success',
      });
    }
    setCategoryDrawerOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (!editingCategoryId) return;
    await deleteProductCategory(editingCategoryId);
    toast({
      title: 'Category deleted',
      description: `${catName} removed.`,
      variant: 'default',
    });
    setCategoryDrawerOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <CommerceHeader
        title="Marketplace"
        subtitle="Catalog inventory, customer orders & category specifications"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products, orders, categories..."
        primaryAction={
          tab === 'categories' ? (
            <button
              type="button"
              onClick={openCreateCategory}
              className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateProduct}
              className="h-10 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )
        }
      />

      <CommerceMetricStrip
        metrics={[
          {
            label: 'Live Products',
            value: metrics.publishedCount,
            hint:
              metrics.lowOrOutCount > 0
                ? `${metrics.lowOrOutCount} low or out of stock`
                : `${metrics.draftCount} draft items`,
            tone: metrics.lowOrOutCount > 0 ? 'amber' : 'neutral',
          },
          {
            label: 'Pending Orders',
            value: metrics.actionableOrdersCount,
            hint: `${productOrders.length} total orders`,
            tone: metrics.actionableOrdersCount > 0 ? 'wine' : 'neutral',
          },
          {
            label: 'Verified Revenue',
            value: formatCompactNgn(metrics.verifiedRevenue),
            hint: `${formatCompactNgn(metrics.grossVolume)} gross volume`,
            tone: 'emerald',
          },
          {
            label: 'Active Categories',
            value: metrics.activeCategoriesCount,
            hint: `of ${productCategories.length} configured`,
            tone: 'neutral',
          },
        ]}
      />

      <CommerceTabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: 'products', label: 'Catalog', count: products.length },
          {
            id: 'orders',
            label: 'Orders',
            count: productOrders.length,
            attentionCount: metrics.actionableOrdersCount,
          },
          { id: 'categories', label: 'Categories', count: productCategories.length },
        ]}
      />

      {/* ====================================================================
          TAB 1: CATALOG
         ==================================================================== */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CommerceFilterPills
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { id: 'all', label: 'All Categories' },
                ...productCategories.map((c) => ({ id: c.slug, label: c.name })),
              ]}
            />

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as ProductStockFilter)}
              aria-label="Filter by product stock or status"
              className="h-9 rounded-xl border border-[#eae3e4] bg-white px-3 text-xs font-semibold text-[#1b1416] focus:outline-none focus:border-[#81141f] w-fit"
            >
              <option value="all">All Statuses</option>
              <option value="published">Live Only</option>
              <option value="low">Low / Out of Stock (≤3)</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <CommerceEmptyState
              icon={<Package className="w-5 h-5" />}
              title="No matching products"
              description="Adjust your search or category filter, or add a new item to the marketplace catalog."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('all');
                    setStockFilter('all');
                  }}
                  className="text-xs font-semibold text-[#81141f] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              }
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredProducts.map((p) => {
                      const totalStock = getProductTotalStock(p);
                      const stockStatus =
                        totalStock <= 0
                          ? 'out_of_stock'
                          : totalStock <= 3
                          ? 'low_stock'
                          : 'available';
                      const stockLabel =
                        totalStock <= 0
                          ? 'Out of Stock'
                          : totalStock <= 3
                          ? `${totalStock} left`
                          : `${totalStock} units`;

                      return (
                        <tr
                          key={p.id}
                          onClick={() => openEditProduct(p)}
                          className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.images[0] || '/photos/gallery-bz-1.jpg'}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#eae3e4] shrink-0 bg-[#f8f5f5]"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-[13px] text-[#1b1416] truncate max-w-[260px] sm:max-w-[340px]">
                                    {p.name}
                                  </p>
                                  {p.featured && (
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[#716769] truncate">
                                  {p.brand} · {p.condition}
                                  {p.variants && p.variants.length > 0
                                    ? ` · ${p.variants.length} variants`
                                    : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#f8f5f5] border border-[#eae3e4] text-[11px] font-medium text-[#4a4245] capitalize">
                              {p.categorySlug.replace(/-/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[13px] text-[#1b1416]">
                              {formatNgn(p.price)}
                            </div>
                            {p.compareAtPrice && p.compareAtPrice > p.price && (
                              <div className="text-[11px] text-[#9c9193] line-through">
                                {formatNgn(p.compareAtPrice)}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <CommerceStatusPill status={stockStatus} customLabel={stockLabel} />
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-2.5">
                              <CommerceStatusPill status={p.status} />
                              <RowChevron />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 2: ORDERS
         ==================================================================== */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <CommerceFilterPills
            value={orderFilter}
            onChange={setOrderFilter}
            options={[
              { id: 'all', label: 'All Orders', count: productOrders.length },
              {
                id: 'action',
                label: 'Needs Action',
                count: metrics.actionableOrdersCount,
              },
              { id: 'processing', label: 'Processing' },
              { id: 'dispatched', label: 'Dispatched' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ]}
          />

          {filteredOrders.length === 0 ? (
            <CommerceEmptyState
              icon={<ShoppingBag className="w-5 h-5" />}
              title="No orders match this filter"
              description="Customer orders placed from the storefront appear here for verification and dispatch."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#eae3e4] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfafa] border-b border-[#eae3e4] text-[#716769] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-5">Order</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-5 text-right">Payment &amp; Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eaeb]">
                    {filteredOrders.map((ord) => {
                      const firstItem = ord.items[0];
                      const extraItemsCount = Math.max(0, ord.items.length - 1);

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrderId(ord.id)}
                          className="group hover:bg-[#fcf8f8] transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-mono font-bold text-[#81141f]">{ord.id}</div>
                            <div className="text-[11px] text-[#716769]">
                              {formatShortDate(ord.createdAt)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[13px] text-[#1b1416]">
                              {ord.customerName}
                            </p>
                            <p className="text-[11px] text-[#716769]">{ord.deliveryState}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            {firstItem && (
                              <div className="max-w-[260px]">
                                <p className="font-medium text-[#1b1416] truncate">
                                  {firstItem.quantity}x {firstItem.productName}
                                </p>
                                <p className="text-[11px] text-[#716769] truncate">
                                  {firstItem.variantLabel || ''}
                                  {extraItemsCount > 0
                                    ? `${firstItem.variantLabel ? ' · ' : ''}+${extraItemsCount} more item${extraItemsCount > 1 ? 's' : ''}`
                                    : ''}
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[13px] text-[#1b1416]">
                              {formatNgn(ord.totalAmount)}
                            </div>
                            {ord.receiptUrl && (
                              <span className="text-[10px] font-medium text-[#81141f]">
                                Receipt attached
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                              <CommerceStatusPill status={ord.paymentStatus} />
                              <CommerceStatusPill status={ord.orderStatus} />
                              <RowChevron />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3: CATEGORIES
         ==================================================================== */}
      {tab === 'categories' && (
        <div className="space-y-4">
          {filteredCategories.length === 0 ? (
            <CommerceEmptyState
              icon={<Tag className="w-5 h-5" />}
              title="No categories found"
              description="Create a marketplace category to define storefront filters and product specifications."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => {
                const countInCat = products.filter((p) => p.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openEditCategory(cat)}
                    className="group text-left bg-white rounded-2xl border border-[#eae3e4] p-5 hover:border-[#81141f]/40 hover:shadow-xs transition-all flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#1b1416]">{cat.name}</h3>
                        <span className="text-[11px] font-mono text-[#81141f] bg-[#fbf3f4] px-2 py-0.5 rounded-md">
                          /{cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-[#716769] line-clamp-2">{cat.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-[#4a4245] font-medium">
                        <span>
                          {countInCat} product{countInCat === 1 ? '' : 's'}
                        </span>
                        <span className="text-[#c9bcbe]">·</span>
                        <span>{cat.specFields.length} spec attributes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <CommerceStatusPill
                        status={cat.active ? 'active' : 'archived'}
                        customLabel={cat.active ? 'Active' : 'Paused'}
                      />
                      <RowChevron />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          DRAWER 1: PRODUCT INSPECTOR & EDITOR
         ==================================================================== */}
      <CommerceDrawer
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        eyebrow={editingProductId ? 'Edit Product' : 'New Catalog Item'}
        title={editingProductId ? prodName || 'Product Details' : 'Add Marketplace Product'}
        subtitle={
          editingProductId
            ? `${prodBrand || 'BZ Verified'} · ${prodCategorySlug}`
            : 'Configure pricing, stock variants, and category specs'
        }
        footer={
          <>
            <div>
              {editingProductId && (
                <CommerceTwoStepDelete label="Delete Product" onConfirm={handleDeleteProduct} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProductDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] hover:text-[#1b1416] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-editor-form"
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold cursor-pointer"
              >
                {editingProductId ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </>
        }
      >
        <form id="product-editor-form" onSubmit={handleSaveProduct} className="space-y-5">
          <CommerceImageField
            label="Product Image"
            value={prodImageUrl}
            onChange={setProdImageUrl}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Product Name *
              </label>
              <input
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. iPhone 16 Pro Max"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Category *
              </label>
              <select
                value={prodCategorySlug}
                onChange={(e) => setProdCategorySlug(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                {productCategories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Brand *
              </label>
              <input
                required
                value={prodBrand}
                onChange={(e) => setProdBrand(e.target.value)}
                placeholder="Apple / Deye"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="1850000"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Compare-at (₦)
              </label>
              <input
                type="number"
                min={0}
                value={prodCompareAt}
                onChange={(e) => setProdCompareAt(e.target.value)}
                placeholder="Optional"
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                {prodVariants.length > 0 ? 'Stock (from variants)' : 'Stock Qty *'}
              </label>
              <input
                type="number"
                min={0}
                disabled={prodVariants.length > 0}
                value={
                  prodVariants.length > 0
                    ? prodVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
                    : prodStock
                }
                onChange={(e) => setProdStock(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white disabled:bg-[#f8f5f5] focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Condition
              </label>
              <input
                value={prodCondition}
                onChange={(e) => setProdCondition(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Status
              </label>
              <select
                value={prodStatus}
                onChange={(e) => setProdStatus(e.target.value as Product['status'])}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-semibold text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#4a4245] mb-1">
                Warranty
              </label>
              <input
                value={prodWarranty}
                onChange={(e) => setProdWarranty(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
              />
            </div>

            <label className="flex items-center justify-between h-10 px-3.5 rounded-xl border border-[#eae3e4] bg-[#fcfafa] cursor-pointer">
              <span className="text-xs font-semibold text-[#1b1416]">Featured Product</span>
              <input
                type="checkbox"
                checked={prodFeatured}
                onChange={(e) => setProdFeatured(e.target.checked)}
                className="accent-[#81141f] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={prodDescription}
              onChange={(e) => setProdDescription(e.target.value)}
              placeholder="Product highlights, key selling points, and included accessories..."
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          {/* Variants Section */}
          <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1b1416] block">
                  Variants &amp; SKU Stock ({prodVariants.length})
                </span>
                <span className="text-[11px] text-[#716769]">
                  Optional options such as storage, size, or color
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#eae3e4] text-[11px] font-semibold text-[#81141f] hover:border-[#81141f] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Variant</span>
              </button>
            </div>

            {prodVariants.length > 0 && (
              <div className="space-y-2">
                {prodVariants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-[#eae3e4]"
                  >
                    <input
                      value={variant.label}
                      onChange={(e) =>
                        setProdVariants((prev) =>
                          prev.map((v, i) => (i === idx ? { ...v, label: e.target.value } : v))
                        )
                      }
                      placeholder="Label (e.g. 256GB · Titanium)"
                      className="col-span-5 h-8 rounded-lg border border-[#eae3e4] px-2 text-[11px] text-[#1b1416]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={variant.price}
                      onChange={(e) =>
                        setProdVariants((prev) =>
                          prev.map((v, i) =>
                            i === idx ? { ...v, price: Number(e.target.value) || 0 } : v
                          )
                        )
                      }
                      placeholder="Price"
                      className="col-span-3 h-8 rounded-lg border border-[#eae3e4] px-2 text-[11px] font-semibold text-[#1b1416]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) =>
                        setProdVariants((prev) =>
                          prev.map((v, i) =>
                            i === idx
                              ? { ...v, stock: Math.max(0, Number(e.target.value) || 0) }
                              : v
                          )
                        )
                      }
                      placeholder="Qty"
                      className="col-span-3 h-8 rounded-lg border border-[#eae3e4] px-2 text-[11px] font-semibold text-[#1b1416]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProdVariants((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label="Remove variant"
                      className="col-span-1 flex justify-center text-[#716769] hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Dynamic Specs */}
          {selectedCategoryObj && selectedCategoryObj.specFields.length > 0 && (
            <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-3">
              <span className="text-xs font-bold text-[#1b1416] block">
                {selectedCategoryObj.name} Specifications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedCategoryObj.specFields.map((field) => (
                  <div key={field}>
                    <label className="block text-[11px] font-medium text-[#716769] mb-1">
                      {field}
                    </label>
                    <input
                      value={prodSpecs[field] || ''}
                      onChange={(e) =>
                        setProdSpecs((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      placeholder={field}
                      className="w-full h-8 rounded-lg border border-[#eae3e4] px-2.5 text-xs bg-white text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 2: ORDER INSPECTOR
         ==================================================================== */}
      <CommerceDrawer
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        eyebrow="Marketplace Order"
        title={selectedOrder ? selectedOrder.id : ''}
        subtitle={
          selectedOrder
            ? `Placed ${formatShortDate(selectedOrder.createdAt)} · ${selectedOrder.deliveryState}`
            : ''
        }
        footer={
          selectedOrder ? (
            <>
              <span className="text-[11px] text-[#716769]">
                Reference: <strong className="font-mono">{selectedOrder.reference}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] cursor-pointer"
              >
                Close
              </button>
            </>
          ) : null
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <CommerceCustomerCard
              name={selectedOrder.customerName}
              phone={selectedOrder.customerPhone}
              email={selectedOrder.customerEmail}
              metaLine={`${selectedOrder.deliveryAddress}, ${selectedOrder.deliveryState}`}
              whatsappMessage={`Hello ${selectedOrder.customerName}, contacting you from BZ Group regarding Marketplace Order ${selectedOrder.id}.`}
            />

            <CommercePaymentCard
              paymentStatus={selectedOrder.paymentStatus}
              receiptUrl={selectedOrder.receiptUrl}
              amount={selectedOrder.totalAmount}
              paymentsLink={`/admin/payments?order=${encodeURIComponent(selectedOrder.id)}`}
              verifyLabel="Verify Payment & Confirm Order"
              onVerifyAndConfirm={() =>
                handleOrderUpdate(
                  selectedOrder,
                  {
                    paymentStatus: 'verified',
                    orderStatus:
                      selectedOrder.orderStatus === 'pending'
                        ? 'confirmed'
                        : selectedOrder.orderStatus,
                  },
                  'verified payment & confirmed order'
                )
              }
              onChangePaymentStatus={(next) =>
                handleOrderUpdate(
                  selectedOrder,
                  { paymentStatus: next },
                  `updated payment status to ${next}`
                )
              }
            />

            {/* Fulfillment Status Pills */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769]">
                  Fulfillment Status
                </span>
                <CommerceStatusPill status={selectedOrder.orderStatus} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ORDER_STATUS_STEPS.map((step) => {
                  const active = selectedOrder.orderStatus === step.value;
                  return (
                    <button
                      key={step.value}
                      type="button"
                      onClick={() =>
                        handleOrderUpdate(
                          selectedOrder,
                          { orderStatus: step.value },
                          `marked order ${step.label.toLowerCase()}`
                        )
                      }
                      className={cn(
                        'h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1',
                        active
                          ? 'bg-[#81141f] border-[#81141f] text-white'
                          : 'bg-white border-[#eae3e4] text-[#4a4245] hover:border-[#81141f]/50'
                      )}
                    >
                      {active && <CheckCircle2 className="w-3 h-3" />}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Itemized Order Breakdown */}
            <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
                Order Breakdown ({selectedOrder.items.length}{' '}
                {selectedOrder.items.length === 1 ? 'item' : 'items'})
              </span>
              <div className="divide-y divide-[#f0eaeb]">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage || '/photos/gallery-bz-1.jpg'}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-[#eae3e4] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1b1416] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-[#716769] truncate">
                          {item.quantity} × {formatNgn(item.unitPrice)}
                          {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#1b1416] shrink-0">
                      {formatNgn(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#eae3e4] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#716769]">
                  <span>Subtotal</span>
                  <span>{formatNgn(selectedOrder.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#716769]">
                  <span>Delivery ({selectedOrder.deliveryState})</span>
                  <span>{formatNgn(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1b1416] text-sm pt-1 border-t border-[#f0eaeb]">
                  <span>Total</span>
                  <span>{formatNgn(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
                  Customer Delivery Notes
                </span>
                <p className="text-xs text-[#1b1416] leading-relaxed">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </CommerceDrawer>

      {/* ====================================================================
          DRAWER 3: CATEGORY INSPECTOR & EDITOR
         ==================================================================== */}
      <CommerceDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        eyebrow={editingCategoryId ? 'Edit Category' : 'New Category'}
        title={editingCategoryId ? catName || 'Category Settings' : 'Add Marketplace Category'}
        subtitle="Define storefront routes and product specification fields"
        widthClass="max-w-lg"
        footer={
          <>
            <div>
              {editingCategoryId && (
                <CommerceTwoStepDelete
                  label="Delete Category"
                  onConfirm={handleDeleteCategory}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#eae3e4] bg-white text-xs font-semibold text-[#4a4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-editor-form"
                className="h-9 px-4 rounded-xl bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold cursor-pointer"
              >
                {editingCategoryId ? 'Save Category' : 'Create Category'}
              </button>
            </div>
          </>
        }
      >
        <form id="category-editor-form" onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Category Name *
            </label>
            <input
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Smart Home Automation"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              URL Slug
            </label>
            <input
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              placeholder="e.g. smart-home"
              className="w-full h-10 rounded-xl border border-[#eae3e4] px-3 text-xs font-mono text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Short category overview shown to shoppers"
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4245] mb-1">
              Specification Fields (comma-separated)
            </label>
            <textarea
              rows={3}
              value={catSpecs}
              onChange={(e) => setCatSpecs(e.target.value)}
              placeholder="Brand, Model, Storage, Warranty"
              className="w-full rounded-xl border border-[#eae3e4] p-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
            />
          </div>

          <label className="flex items-center justify-between h-11 px-3.5 rounded-xl border border-[#eae3e4] bg-[#fcfafa] cursor-pointer">
            <span className="text-xs font-semibold text-[#1b1416]">Active on Storefront</span>
            <input
              type="checkbox"
              checked={catActive}
              onChange={(e) => setCatActive(e.target.checked)}
              className="accent-[#81141f] w-4 h-4 cursor-pointer"
            />
          </label>
        </form>
      </CommerceDrawer>
    </div>
  );
}
