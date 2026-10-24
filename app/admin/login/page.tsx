'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, isLoading } = useAdminAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl') || '/admin';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isLoading, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast({
          title: 'Access Granted',
          description: 'Welcome to BZ Group operations desk.',
          variant: 'default'
        });
        router.replace(returnUrl);
      } else {
        // Strict security: generic error without any hints
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex flex-col justify-between text-[#1b1416]">
      {/* Top Bar */}
      <header className="w-full bg-[#4e0b13] text-white py-4 px-6 sm:px-10 flex items-center justify-between border-b border-[#680e18]">
        <BrandLogo tone="light" size="sm" href="/" />

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#ebc7cb] hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Site</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] border border-[#eae3e4] p-8 sm:p-10 shadow-xl space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf3f4] text-[#81141f] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#81141f]" />
              <span>Operations Portal</span>
            </div>

            <h1 className="font-serif text-[28px] sm:text-[32px] font-semibold text-[#1b1416] tracking-tight leading-tight">
              Admin Authentication
            </h1>

            <p className="text-[13px] text-[#716769] font-normal leading-relaxed">
              Enter your authorized corporate credentials to access the administration portal.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-800 text-[13px] leading-snug flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#1b1416] block">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="name@bzgroup.com"
                  autoComplete="email"
                  className="w-full h-[48px] pl-10 pr-4 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  required
                />
                <Mail className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#1b1416] block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-[48px] pl-10 pr-11 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#716769] hover:text-[#1b1416] cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f] cursor-pointer"
              />
              <span className="text-[13px] text-[#4a4245]">
                Keep me authenticated on this workstation
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] rounded-[10px] bg-[#81141f] hover:bg-[#680e18] disabled:bg-[#a89d9f] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </span>
              ) : (
                <>
                  <span>Sign in to Portal</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="py-4 text-center text-xs text-[#716769] px-4">
        <p>© 2026 BZ Group Global Universal Solutions. Strict security access policy.</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#4e0b13] flex items-center justify-center text-white text-sm">Loading operations portal...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
