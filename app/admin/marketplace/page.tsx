'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Tag,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCategorySlug } from '@/lib/types';

export default function AdminMarketplacePage() {
  const {
    productCategories,
    products,
    productOrders,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductCategory,
    updateProductOrder,
  } = useStore();

  const [tab, setTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug>('phones');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('Brand New');
  const [warranty, setWarranty] = useState('1 Year Official Warranty');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('5');
  const [imageUrl, setImageUrl] = useState('/photos/gallery-bz-1.jpg');
  const [description, setDescription] = useState('');
  const [specValues, setSpecValues] = useState<Record<string, string>>({});

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSpecs, setNewCatSpecs] = useState('Brand, Model, Condition, Warranty');

  const selectedCategoryObj =
    productCategories.find((c) => c.slug === categorySlug) || productCategories[0];

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await addProduct({
      name: name.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      categoryId: selectedCategoryObj?.id || 'cat-phones',
      categorySlug,
      brand: brand.trim() || 'BZ Verified',
      condition,
      warranty,
      description: description.trim() || `${name} verified by BZ Group Marketplace.`,
      price: Number(price) || 0,
      currency: 'NGN',
      images: [imageUrl.trim() || '/photos/gallery-bz-1.jpg'],
      stock: Number(stock) || 1,
      status: 'published',
      featured: true,
      specifications: {
        Brand: brand.trim() || 'BZ Verified',
        Condition: condition,
        Warranty: warranty,
        ...specValues,
      },
    });

    setName('');
    setBrand('');
    setPrice('');
    setDescription('');
    setSpecValues({});
    setShowAddModal(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug =
      newCatSlug.trim() ||
      newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    await addProductCategory({
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || `${newCatName} catalog`,
      active: true,
      specFields: newCatSpecs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setNewCatName('');
    setNewCatSlug('');
    setNewCatDesc('');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.categorySlug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#81141f]">
            MULTI-SERVICE COMMERCE ADMIN
          </span>
          <h1 className="text-2xl font-extrabold text-[#1b1416]">
            Marketplace Products, Categories &amp; Orders
          </h1>
          <p className="text-xs text-[#716769]">
            Manage phones, laptops, gadgets, electronics, solar &amp; inverters, clothing, and jewelry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#81141f] hover:bg-[#6b121c] text-white h-10 px-4 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#eae3e4] bg-white p-4">
          <span className="text-xs text-[#716769] font-medium">Published Products</span>
          <p className="text-2xl font-extrabold text-[#1b1416] mt-1">
            {products.filter((p) => p.status === 'published').length}
          </p>
        </div>
        <div className="rounded-xl border border-[#eae3e4] bg-white p-4">
          <span className="text-xs text-[#716769] font-medium">Active Categories</span>
          <p className="text-2xl font-extrabold text-[#1b1416] mt-1">
            {productCategories.filter((c) => c.active).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#eae3e4] bg-white p-4">
          <span className="text-xs text-[#716769] font-medium">Total Orders</span>
          <p className="text-2xl font-extrabold text-[#81141f] mt-1">
            {productOrders.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#eae3e4] bg-white p-4">
          <span className="text-xs text-[#716769] font-medium">Order Volume (NGN)</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            ₦
            {productOrders
              .reduce((sum, o) => sum + o.totalAmount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#eae3e4] pb-3">
        {[
          { id: 'products' as const, label: `Products (${products.length})`, icon: Package },
          { id: 'orders' as const, label: `Orders (${productOrders.length})`, icon: ShoppingBag },
          {
            id: 'categories' as const,
            label: `Categories (${productCategories.length})`,
            icon: Tag,
          },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-[#81141f] text-white'
                  : 'bg-white border border-[#eae3e4] text-[#4d4547] hover:bg-[#f8f5f5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter products by name, brand, or category..."
              className="pl-10 h-10 bg-white"
            />
          </div>

          <div className="rounded-2xl border border-[#eae3e4] bg-white overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f5f5] border-b border-[#eae3e4] text-[#716769] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae3e4]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8f5f5]/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || '/photos/gallery-bz-1.jpg'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#eae3e4]"
                        />
                        <div>
                          <p className="font-bold text-[#1b1416]">{p.name}</p>
                          <p className="text-[11px] text-[#716769]">
                            {p.brand} · {p.condition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold uppercase text-[#81141f]">
                      {p.categorySlug}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#1b1416]">
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={p.stock}
                          onChange={(e) =>
                            updateProduct(p.id, {
                              stock: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-16 h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          updateProduct(p.id, {
                            status: e.target.value as 'published' | 'draft' | 'archived',
                          })
                        }
                        className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-semibold bg-white"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-[#716769] hover:text-red-600 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {tab === 'orders' && (
        <div className="rounded-2xl border border-[#eae3e4] bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f5f5] border-b border-[#eae3e4] text-[#716769] uppercase">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {productOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#f8f5f5]/50">
                  <td className="py-3.5 px-4 font-extrabold text-[#81141f]">{ord.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1b1416]">{ord.customerName}</p>
                    <p className="text-[11px] text-[#716769]">
                      {ord.customerPhone} · {ord.deliveryState}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {ord.items.map((i, idx) => (
                      <div key={idx} className="text-xs font-medium">
                        {i.quantity}x {i.productName}{' '}
                        {i.variantLabel ? `(${i.variantLabel})` : ''}
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#1b1416]">
                    ₦{ord.totalAmount.toLocaleString()}
                    {ord.receiptUrl && (
                      <Link
                        href={`/admin/payments?order=${encodeURIComponent(ord.id)}`}
                        className="block text-[10px] text-[#81141f] hover:underline mt-0.5 inline-flex items-center gap-1"
                      >
                        <span>View Receipt</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.paymentStatus}
                      onChange={(e) =>
                        updateProductOrder(ord.id, {
                          paymentStatus: e.target.value as any,
                        })
                      }
                      className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="receipt_uploaded">Receipt Uploaded</option>
                      <option value="verified">Verified ✓</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        updateProductOrder(ord.id, {
                          orderStatus: e.target.value as any,
                        })
                      }
                      className="h-8 rounded-lg border border-[#eae3e4] px-2 text-xs font-bold bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {productCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-[#eae3e4] bg-white p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1b1416]">{cat.name}</h3>
                    <span className="text-[11px] font-mono text-[#81141f]">
                      /{cat.slug}
                    </span>
                  </div>
                  <p className="text-xs text-[#716769] mt-0.5">{cat.description}</p>
                  <p className="text-[11px] text-[#4d4547] mt-1">
                    Spec fields: {cat.specFields.join(', ')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 rounded-2xl border border-[#eae3e4] bg-white p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-bold text-[#1b1416]">
              Add New Marketplace Category
            </h3>
            <div>
              <label className="block text-xs font-bold mb-1">Category Name *</label>
              <Input
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Smart Home Automation"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">URL Slug</label>
              <Input
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                placeholder="e.g. smart-home"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <Input
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short category overview"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                Specification Fields (comma-separated)
              </label>
              <Input
                value={newCatSpecs}
                onChange={(e) => setNewCatSpecs(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 bg-[#81141f] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Create Category
            </Button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-[#eae3e4] shadow-2xl my-8 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#eae3e4] pb-3">
              <h3 className="text-lg font-bold text-[#1b1416]">Add New Product</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-[#716769]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Product Name *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro 256GB"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Category *</label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#eae3e4] px-3 text-xs font-bold bg-white"
                >
                  {productCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Brand *</label>
                <Input
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Apple / Deye / BZ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Price (NGN) *</label>
                <Input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1850000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Stock Qty *</label>
                <Input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Condition</label>
                <Input
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Warranty</label>
                <Input
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description and highlights"
              />
            </div>

            {/* Category Dynamic Spec Fields */}
            {selectedCategoryObj && (
              <div className="rounded-xl bg-[#f8f5f5] p-4 border border-[#eae3e4] space-y-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81141f]">
                  {selectedCategoryObj.name} Specific Attributes
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedCategoryObj.specFields.map((field) => (
                    <div key={field}>
                      <label className="block text-[11px] font-semibold text-[#4d4547] mb-1">
                        {field}
                      </label>
                      <Input
                        value={specValues[field] || ''}
                        onChange={(e) =>
                          setSpecValues((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        placeholder={field}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#81141f] hover:bg-[#6b121c] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Publish Product
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
