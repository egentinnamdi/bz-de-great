'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/toast-provider';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  showIconOnly?: boolean;
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
  showIconOnly = false
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: value,
        variant: 'success',
        duration: 2500
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        variant: 'error'
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-xs font-medium text-text-secondary transition-all hover:bg-wine-50 hover:text-wine-900 hover:border-wine-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-wine-600',
        copied && 'border-emerald-300 bg-emerald-50 text-emerald-800',
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
      {!showIconOnly && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
}
