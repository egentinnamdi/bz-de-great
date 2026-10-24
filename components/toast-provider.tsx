'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; variant?: ToastVariant; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 4000
  }: {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, title, description, variant, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex max-w-md w-full flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map(t => {
          const isSuccess = t.variant === 'success';
          const isError = t.variant === 'error';
          const isWarning = t.variant === 'warning';

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5',
                isSuccess
                  ? 'bg-emerald-950/95 border-emerald-800/80 text-emerald-100'
                  : isError
                  ? 'bg-rose-950/95 border-rose-800/80 text-rose-100'
                  : isWarning
                  ? 'bg-amber-950/95 border-amber-800/80 text-amber-100'
                  : 'bg-wine-950/95 border-wine-800/80 text-white'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {(!isSuccess && !isError && !isWarning) && (
                  <Info className="w-5 h-5 text-wine-200" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold tracking-tight">{t.title}</div>
                {t.description && (
                  <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
