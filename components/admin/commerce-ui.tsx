'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cn, formatPhoneForWhatsApp } from '@/lib/utils';
import { compressImageForUpload } from '@/lib/image-upload';
import { supabaseService } from '@/lib/supabase/service';
import { useToast } from '@/components/toast-provider';

export function formatNgn(amount?: number | null): string {
  const num = Number(amount) || 0;
  return `₦${num.toLocaleString('en-NG')}`;
}

export function formatCompactNgn(amount?: number | null): string {
  const num = Number(amount) || 0;
  if (num >= 1_000_000) {
    return `₦${(num / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  }
  return `₦${num.toLocaleString('en-NG')}`;
}

export function formatShortDate(dateString?: string): string {
  if (!dateString) return 'Recently';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ============================================================================
   HEADER
   ============================================================================ */

interface CommerceHeaderProps {
  title: string;
  subtitle: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  secondaryAction?: React.ReactNode;
  primaryAction?: React.ReactNode;
}

export function CommerceHeader({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  secondaryAction,
  primaryAction,
}: CommerceHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h1 className="font-serif text-[26px] sm:text-[30px] font-bold text-[#1b1416] tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-[13px] text-[#716769]">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {onSearchChange !== undefined && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-8 bg-white border border-[#eae3e4] rounded-xl text-[13px] text-[#1b1416] placeholder:text-[#9c9193] focus:outline-none focus:border-[#81141f] transition-colors"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#716769] hover:text-[#1b1416] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        )}
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
}

/* ============================================================================
   UNIFIED HAIRLINE METRIC STRIP
   ============================================================================ */

export interface MetricSlot {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'wine' | 'emerald' | 'amber';
}

export function CommerceMetricStrip({ metrics }: { metrics: MetricSlot[] }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#eae3e4] shadow-2xs grid divide-y sm:divide-y-0 sm:divide-x divide-[#eae3e4] overflow-hidden',
        metrics.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
      )}
    >
      {metrics.map((m) => (
        <div key={m.label} className="px-5 py-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#716769]">{m.label}</span>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#1b1416] mt-1 tracking-tight">
            {m.value}
          </div>
          {m.hint && (
            <span
              className={cn(
                'text-[11px] mt-1 font-medium',
                m.tone === 'emerald' && 'text-emerald-700',
                m.tone === 'amber' && 'text-amber-700',
                m.tone === 'wine' && 'text-[#81141f]',
                (!m.tone || m.tone === 'neutral') && 'text-[#716769]'
              )}
            >
              {m.hint}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   SEGMENTED VIEW TABS
   ============================================================================ */

export interface CommerceTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  attentionCount?: number;
}

export function CommerceTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  rightSlot,
}: {
  tabs: CommerceTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div
        role="tablist"
        className="inline-flex items-center rounded-xl bg-[#f3eeee] p-1 border border-[#eae3e4] w-fit max-w-full overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-white text-[#1b1416] font-semibold shadow-2xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[11px] px-1.5 py-0.5 rounded-md font-semibold',
                    isActive ? 'bg-[#f8f5f5] text-[#4a4245]' : 'text-[#716769]'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {tab.attentionCount !== undefined && tab.attentionCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#81141f] text-white text-[10px] font-bold">
                  {tab.attentionCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {rightSlot && <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>}
    </div>
  );
}

/* ============================================================================
   FILTER PILLS
   ============================================================================ */

export function CommerceFilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
              active
                ? 'bg-[#1b1416] text-white'
                : 'bg-white border border-[#eae3e4] text-[#4a4245] hover:border-[#c9bcbe] hover:text-[#1b1416]'
            )}
          >
            {opt.label}
            {opt.count !== undefined ? ` (${opt.count})` : ''}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   MINIMALIST STATUS PILL
   ============================================================================ */

const STATUS_STYLE_MAP: Record<string, { label: string; style: string; dot: string }> = {
  published: {
    label: 'Live',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  active: {
    label: 'Active',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  available: {
    label: 'Available',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  verified: {
    label: 'Verified',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  confirmed: {
    label: 'Confirmed',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  delivered: {
    label: 'Delivered',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  checked_in: {
    label: 'Checked In',
    style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  valid: {
    label: 'Valid Pass',
    style: 'bg-[#fbf3f4] text-[#81141f] border-[#ebc7cb]',
    dot: 'bg-[#81141f]',
  },
  dispatched: {
    label: 'Dispatched',
    style: 'bg-sky-50 text-sky-800 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  processing: {
    label: 'Processing',
    style: 'bg-sky-50 text-sky-800 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  receipt_uploaded: {
    label: 'Receipt Sent',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  payment_pending: {
    label: 'Payment Review',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  pending_payment: {
    label: 'Payment Pending',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  pending: {
    label: 'Pending',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  maintenance: {
    label: 'Maintenance',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  low_stock: {
    label: 'Low Stock',
    style: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  out_of_stock: {
    label: 'Out of Stock',
    style: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    style: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  refunded: {
    label: 'Refunded',
    style: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  returned: {
    label: 'Returned',
    style: 'bg-[#f8f5f5] text-[#4a4245] border-[#eae3e4]',
    dot: 'bg-[#716769]',
  },
  draft: {
    label: 'Draft',
    style: 'bg-[#f8f5f5] text-[#4a4245] border-[#eae3e4]',
    dot: 'bg-[#716769]',
  },
  archived: {
    label: 'Archived',
    style: 'bg-[#f8f5f5] text-[#716769] border-[#eae3e4]',
    dot: 'bg-[#9c9193]',
  },
};

export function CommerceStatusPill({
  status,
  customLabel,
}: {
  status: string;
  customLabel?: string;
}) {
  const key = status.toLowerCase();
  const cfg = STATUS_STYLE_MAP[key] || {
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    style: 'bg-[#f8f5f5] text-[#4a4245] border-[#eae3e4]',
    dot: 'bg-[#716769]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        cfg.style
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      <span>{customLabel || cfg.label}</span>
    </span>
  );
}

/* ============================================================================
   SLIDE-OVER INSPECTOR & EDITOR DRAWER
   ============================================================================ */

interface CommerceDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  widthClass?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function CommerceDrawer({
  open,
  onClose,
  title,
  eyebrow,
  subtitle,
  widthClass = 'max-w-xl',
  footer,
  children,
}: CommerceDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'w-full bg-white h-full shadow-2xl border-l border-[#eae3e4] flex flex-col animate-in slide-in-from-right duration-200',
          widthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Drawer Header */}
        <div className="px-6 py-5 border-b border-[#eae3e4] flex items-start justify-between gap-4 shrink-0 bg-white">
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81141f] block mb-0.5">
                {eyebrow}
              </span>
            )}
            <h2 className="font-serif text-xl font-bold text-[#1b1416] truncate">{title}</h2>
            {subtitle && <p className="text-xs text-[#716769] mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-lg border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] hover:bg-[#f8f5f5] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>

        {/* Sticky Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#eae3e4] bg-[#fcfafa] shrink-0 flex items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGE FIELD (URL + OPTIONAL UPLOAD)
   ============================================================================ */

export function CommerceImageField({
  label = 'Cover Image',
  value,
  onChange,
  fallback = '/photos/gallery-bz-1.jpg',
}: {
  label?: string;
  value: string;
  onChange: (nextUrl: string) => void;
  fallback?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImageForUpload(file, 1400, 0.82);
      const uploadedUrl = await supabaseService.uploadListingPhoto(
        compressed.blob,
        compressed.filename
      );
      onChange(uploadedUrl);
      toast({
        title: 'Image attached',
        description: 'Ready to save.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Could not read image file. You can paste an image URL instead.',
        variant: 'error',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#4a4245] block">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl border border-[#eae3e4] bg-[#f8f5f5] overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value || fallback}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /photos/..."
            className="w-full h-9 rounded-lg border border-[#eae3e4] px-3 text-xs text-[#1b1416] bg-white focus:outline-none focus:border-[#81141f]"
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#eae3e4] bg-[#f8f5f5] hover:bg-[#efeaea] text-[11px] font-semibold text-[#1b1416] transition-colors cursor-pointer disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImagePlus className="w-3.5 h-3.5 text-[#81141f]" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CUSTOMER CONTACT CARD + WHATSAPP LINK
   ============================================================================ */

export function CommerceCustomerCard({
  name,
  phone,
  email,
  metaLine,
  whatsappMessage,
}: {
  name: string;
  phone: string;
  email?: string;
  metaLine?: string;
  whatsappMessage: string;
}) {
  return (
    <div className="rounded-xl border border-[#eae3e4] bg-[#fcfafa] p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#716769]">
          Customer
        </div>
        <p className="text-sm font-bold text-[#1b1416] truncate">{name}</p>
        <p className="text-xs text-[#4a4245] truncate">
          {phone}
          {email ? ` · ${email}` : ''}
        </p>
        {metaLine && <p className="text-xs text-[#716769] truncate">{metaLine}</p>}
      </div>

      {phone && (
        <a
          href={`https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(
            whatsappMessage
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] hover:border-emerald-300 hover:text-emerald-700 transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>
      )}
    </div>
  );
}

/* ============================================================================
   PAYMENT PROOF CARD (FOR ORDERS, STUDIO, RENTALS, TICKETS)
   ============================================================================ */

export function CommercePaymentCard({
  paymentStatus,
  receiptUrl,
  amount,
  onVerifyAndConfirm,
  verifyLabel = 'Verify Payment & Confirm',
  onChangePaymentStatus,
  paymentsLink,
}: {
  paymentStatus: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
  receiptUrl?: string;
  amount: number;
  onVerifyAndConfirm?: () => void;
  verifyLabel?: string;
  onChangePaymentStatus: (
    next: 'pending' | 'receipt_uploaded' | 'verified' | 'refunded'
  ) => void;
  paymentsLink?: string;
}) {
  return (
    <div className="rounded-xl border border-[#eae3e4] bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#716769] block">
            Payment Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-serif text-lg font-bold text-[#1b1416]">
              {formatNgn(amount)}
            </span>
            <CommerceStatusPill status={paymentStatus} />
          </div>
        </div>

        <select
          value={paymentStatus}
          onChange={(e) =>
            onChangePaymentStatus(
              e.target.value as 'pending' | 'receipt_uploaded' | 'verified' | 'refunded'
            )
          }
          aria-label="Update payment status"
          className="h-9 rounded-lg border border-[#eae3e4] px-2.5 text-xs font-semibold bg-white text-[#1b1416] focus:outline-none focus:border-[#81141f]"
        >
          <option value="pending">Pending</option>
          <option value="receipt_uploaded">Receipt Uploaded</option>
          <option value="verified">Verified</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {receiptUrl && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f5f5] px-3 py-2 border border-[#eae3e4]">
          <span className="text-xs text-[#4a4245] font-medium truncate">
            Transfer receipt attached
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#81141f] hover:underline"
            >
              Open Proof
            </a>
            {paymentsLink && (
              <Link
                href={paymentsLink}
                className="text-xs font-semibold text-[#4a4245] hover:underline"
              >
                Payments Desk →
              </Link>
            )}
          </div>
        </div>
      )}

      {paymentStatus !== 'verified' && onVerifyAndConfirm && (
        <button
          type="button"
          onClick={onVerifyAndConfirm}
          className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{verifyLabel}</span>
        </button>
      )}
    </div>
  );
}

/* ============================================================================
   TWO-STEP SAFE DELETE
   ============================================================================ */

export function CommerceTwoStepDelete({
  label = 'Delete',
  onConfirm,
}: {
  label?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={async () => {
            await onConfirm();
            setArmed(false);
          }}
          className="h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
        >
          Confirm Delete
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="h-9 px-2.5 rounded-lg border border-[#eae3e4] bg-white text-xs font-medium text-[#716769] hover:text-[#1b1416] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

/* ============================================================================
   EMPTY STATE & ROW CHEVRON
   ============================================================================ */

export function CommerceEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#eae3e4] py-14 px-6 text-center space-y-3">
      <div className="w-11 h-11 rounded-full bg-[#f8f5f5] border border-[#eae3e4] text-[#716769] flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[#1b1416]">{title}</p>
        <p className="text-xs text-[#716769] max-w-sm mx-auto">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export function RowChevron() {
  return (
    <ChevronRight className="w-4 h-4 text-[#b5aaac] group-hover:text-[#81141f] group-hover:translate-x-0.5 transition-all shrink-0" />
  );
}
