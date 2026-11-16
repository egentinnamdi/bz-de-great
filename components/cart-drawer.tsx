'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  MessageSquare,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CopyButton } from './copy-button';
import { useStore } from '@/lib/store';
import { ProductOrder } from '@/lib/types';
import { SITE_CONFIG, getWhatsAppBookingLink } from '@/lib/constants';
import { computeDeliveryFee } from '@/lib/commerce-engine';
import { supabaseService } from '@/lib/supabase/service';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateCartItemQuantity,
    removeFromCart,
    createProductOrder,
  } = useStore();

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

  // Close drawer on Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, closeCart]);

  // Ensure re-opening cart after a finished order starts back on Bag view cleanly
  useEffect(() => {
    if (isCartOpen && checkoutStep === 'success') {
      setCheckoutStep('cart');
      setCompletedOrder(null);
      setCheckoutError(null);
    }
  }, [isCartOpen, checkoutStep]);

  if (!isCartOpen) return null;

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const deliveryFee = computeDeliveryFee(deliveryState, cartSubtotal);
  const cartTotal = cartSubtotal + deliveryFee;

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="Marketplace Shopping Cart"
    >
      <div
        className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl border-l border-[#eae3e4] text-[#1b1416] animate-in slide-in-from-right duration-150"
        onClick={(e) => e.stopPropagation()}
      >
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
            onClick={closeCart}
            aria-label="Close Cart"
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
                  <div className="pt-2">
                    <Link href="/marketplace" onClick={closeCart}>
                      <Button variant="wineOutline" size="sm" className="cursor-pointer">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </div>
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
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.productName}`}
                          className="w-7 h-7 rounded-lg border border-[#eae3e4] bg-white flex items-center justify-center hover:bg-[#fbf3f4] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.productName}`}
                          className="w-7 h-7 rounded-lg border border-[#eae3e4] bg-white flex items-center justify-center hover:bg-[#fbf3f4] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.productName}`}
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
                <Link href={`/my-booking?ref=${completedOrder.id}`} onClick={closeCart}>
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
                  className="h-11 px-4 rounded-xl border-[#eae3e4] text-xs font-bold cursor-pointer"
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
  );
}
