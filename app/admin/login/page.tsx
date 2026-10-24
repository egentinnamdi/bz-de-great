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
  Building2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, isLoading } = useAdminAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@bzgroup.com');
  const [password, setPassword] = useState('admin2026');
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
          description: `Welcome back to BZ Group operations desk.`,
          variant: 'default'
        });
        router.replace(returnUrl);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        toast({
          title: 'Authentication Failed',
          description: res.error || 'Invalid credentials.',
          variant: 'warning'
        });
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string, label: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    toast({
      title: `${label} Loaded`,
      description: 'Tap "Sign in to Portal" to enter.',
      variant: 'default'
    });
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
        <div className="w-full max-w-[460px] bg-white rounded-[24px] border border-[#eae3e4] p-8 sm:p-10 shadow-lg space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf3f4] text-[#81141f] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#81141f]" />
              <span>Operations Portal</span>
            </div>

            <h1 className="font-serif text-[30px] sm:text-[34px] font-semibold text-[#1b1416] tracking-tight leading-tight">
              Staff Authentication
            </h1>

            <p className="text-[14px] text-[#716769] font-normal leading-relaxed">
              Enter your corporate credentials to access listings, treasury payout desk, and client bookings.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-800 text-[13px] leading-snug">
              {errorMessage}
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
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@bzgroup.com"
                  className="w-full h-[48px] pl-10 pr-4 bg-white border border-[#eae3e4] rounded-[10px] text-[15px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  required
                />
                <Mail className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Security Password
                </label>
                <a
                  href="https://wa.me/2348139690031?text=Hello%2C%20I%20need%20assistance%20recovering%20my%20BZ%20Group%20staff%20portal%20access."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#81141f] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-[48px] pl-10 pr-11 bg-white border border-[#eae3e4] rounded-[10px] text-[15px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
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
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#eae3e4] text-[#81141f] accent-[#81141f] cursor-pointer"
              />
              <span className="text-[13px] text-[#4a4245]">
                Keep me authenticated on this device
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[50px] rounded-[10px] bg-[#81141f] hover:bg-[#680e18] disabled:bg-[#a89d9f] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign in to Portal</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-2 border-t border-[#eae3e4] space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#716769]">
              <Sparkles className="w-3.5 h-3.5 text-[#81141f]" />
              <span>One-Click Demo Roles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@bzgroup.com', 'admin2026', 'Master Admin')}
                className="p-2.5 rounded-[8px] bg-[#f8f5f5] hover:bg-[#fcf3f4] border border-[#eae3e4] hover:border-[#81141f] text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#1b1416] group-hover:text-[#81141f]">
                  Master Admin
                </div>
                <div className="text-[11px] text-[#716769]">admin@bzgroup.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('treasury@bzgroup.com', 'treasury2026', 'Treasury Desk')}
                className="p-2.5 rounded-[8px] bg-[#f8f5f5] hover:bg-[#fcf3f4] border border-[#eae3e4] hover:border-[#81141f] text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#1b1416] group-hover:text-[#81141f]">
                  Treasury Officer
                </div>
                <div className="text-[11px] text-[#716769]">treasury@bzgroup.com</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="py-4 text-center text-xs text-[#716769] px-4">
        <p>© 2026 BZ Group Global Universal Solutions. Strict security and audit logs enabled.</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#4e0b13] flex items-center justify-center text-white text-sm">Loading staff portal...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
