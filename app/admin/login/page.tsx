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
  ArrowLeft,
  UserPlus,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  X
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useAdminAuth } from '@/lib/admin-auth';
import { useToast } from '@/components/toast-provider';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, signup, resetPassword, isLoading } = useAdminAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In state
  const [email, setEmail] = useState('admin@bzgroup.com');
  const [password, setPassword] = useState('admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'Master Admin' | 'Treasury Desk' | 'Concierge Lead'>('Master Admin');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // General form feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl') || '/admin';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isLoading, returnUrl, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast({
          title: 'Access Granted',
          description: 'Welcome back to BZ Group operations desk.',
          variant: 'default'
        });
        router.replace(returnUrl);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
        toast({
          title: 'Authentication Failed',
          description: res.error || 'Invalid credentials.',
          variant: 'warning'
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full corporate name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and retry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup(regFullName, regEmail, regPassword, regRole);
      if (res.success) {
        toast({
          title: 'Staff Profile Created',
          description: `Account created for ${regFullName} with role: ${regRole}.`,
          variant: 'default'
        });
        router.replace(returnUrl);
      } else {
        setErrorMessage(res.error || 'Unable to create staff profile. Please try another email.');
        toast({
          title: 'Registration Unsuccessful',
          description: res.error || 'Could not register corporate staff profile.',
          variant: 'warning'
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while creating account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;

    setIsRecovering(true);
    try {
      const res = await resetPassword(recoveryEmail);
      if (res.success) {
        setRecoverySent(true);
        toast({
          title: 'Recovery Link Sent',
          description: `Instructions sent to ${recoveryEmail}. Please check your inbox.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Notice',
          description: res.error || 'Could not initiate reset. Please contact WhatsApp support.',
          variant: 'warning'
        });
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: 'Failed to initiate password reset.',
        variant: 'warning'
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoPass: string, label: string) => {
    setActiveTab('signin');
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
        <div className="w-full max-w-[500px] bg-white rounded-[24px] border border-[#eae3e4] p-7 sm:p-9 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf3f4] text-[#81141f] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#81141f]" />
              <span>Operations & Management Portal</span>
            </div>

            <h1 className="font-serif text-[28px] sm:text-[32px] font-semibold text-[#1b1416] tracking-tight leading-tight">
              Staff Authentication
            </h1>

            <p className="text-[13px] text-[#716769] font-normal leading-relaxed max-w-sm mx-auto">
              Access vehicle listings, properties, RMB treasury payout desk, and client bookings.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-[12px] bg-[#f5f1f1] p-1 border border-[#eae3e4]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-[#81141f] shadow-xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#81141f] shadow-xs'
                  : 'text-[#716769] hover:text-[#1b1416]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Staff</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-800 text-[13px] leading-snug flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN TAB */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
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
                    className="w-full h-[48px] pl-10 pr-4 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
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
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      setShowRecoveryModal(true);
                      setRecoverySent(false);
                    }}
                    className="text-[12px] text-[#81141f] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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
                    <span>Sign in to Operations Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER STAFF TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="e.g. David Adeleke"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                  required
                />
              </div>

              {/* Corporate Email */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="david@bzgroup.com"
                    className="w-full h-[46px] pl-10 pr-4 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Operational Desk Role
                </label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as any)}
                  className="w-full h-[46px] px-3 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors cursor-pointer"
                >
                  <option value="Master Admin">Master Admin (Executive / Full System Control)</option>
                  <option value="Treasury Desk">Treasury Desk (RMB Rates & Payment Reconciliation)</option>
                  <option value="Concierge Lead">Concierge Lead (Bookings, Fleet & Inspections)</option>
                </select>
                <p className="text-[11px] text-[#716769]">
                  {regRole === 'Master Admin' && 'Full permissions across cars, properties, CMS, CRM, and rates.'}
                  {regRole === 'Treasury Desk' && 'Focused on RMB conversions, bank settlements, and receipt verification.'}
                  {regRole === 'Concierge Lead' && 'Manages client bookings, vehicle dispatch, and inspection tours.'}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Security Password (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-[46px] pl-10 pr-11 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#716769] hover:text-[#1b1416] cursor-pointer p-1"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1b1416] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-[46px] pl-10 pr-4 bg-white border border-[#eae3e4] rounded-[10px] text-[14px] text-[#1b1416] focus:outline-none focus:border-[#81141f] transition-colors"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] rounded-[10px] bg-[#81141f] hover:bg-[#680e18] disabled:bg-[#a89d9f] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Provisioning staff account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create Staff Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-[#eae3e4] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#716769]">
                <Sparkles className="w-3.5 h-3.5 text-[#81141f]" />
                <span>Instant Evaluation Roles</span>
              </div>
              <span className="text-[11px] text-[#81141f] font-semibold">Ready to Use</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@bzgroup.com', 'admin2026', 'Master Admin')}
                className="p-2.5 rounded-[8px] bg-[#f8f5f5] hover:bg-[#fcf3f4] border border-[#eae3e4] hover:border-[#81141f] text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#1b1416] group-hover:text-[#81141f] text-[12px]">
                  Master Admin
                </div>
                <div className="text-[10px] text-[#716769] truncate">admin@bzgroup.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('treasury@bzgroup.com', 'treasury2026', 'Treasury Desk')}
                className="p-2.5 rounded-[8px] bg-[#f8f5f5] hover:bg-[#fcf3f4] border border-[#eae3e4] hover:border-[#81141f] text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#1b1416] group-hover:text-[#81141f] text-[12px]">
                  Treasury Desk
                </div>
                <div className="text-[10px] text-[#716769] truncate">treasury@bzgroup.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('concierge@bzgroup.com', 'concierge2026', 'Concierge Lead')}
                className="p-2.5 rounded-[8px] bg-[#f8f5f5] hover:bg-[#fcf3f4] border border-[#eae3e4] hover:border-[#81141f] text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[#1b1416] group-hover:text-[#81141f] text-[12px]">
                  Concierge Lead
                </div>
                <div className="text-[10px] text-[#716769] truncate">concierge@bzgroup.com</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] bg-white rounded-[20px] p-6 sm:p-7 shadow-2xl border border-[#eae3e4] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#fcf3f4] text-[#81141f] flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1b1416]">Password Recovery</h3>
                <p className="text-xs text-[#716769]">
                  Send a password reset link to your registered email or contact IT operations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 text-[#716769] hover:text-[#1b1416] rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recoverySent ? (
              <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reset instructions dispatched</span>
                </div>
                <p>
                  If an account exists for <strong>{recoveryEmail}</strong>, you will receive an email shortly with instructions to choose a new password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="mt-3 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-[8px] text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1b1416]">Corporate Email</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    placeholder="admin@bzgroup.com"
                    className="w-full h-[44px] px-3.5 bg-white border border-[#eae3e4] rounded-[9px] text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full h-[44px] rounded-[9px] bg-[#81141f] hover:bg-[#680e18] disabled:bg-[#a89d9f] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isRecovering ? (
                    <span>Sending reset instructions...</span>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>

                <div className="pt-3 border-t border-[#eae3e4] text-center">
                  <span className="text-[11px] text-[#716769] block mb-2">Or get instant assistance from the BZ Group IT desk:</span>
                  <a
                    href="https://wa.me/2348139690031?text=Hello%20BZ%20Group%20Operations%2C%20I%20need%20immediate%20assistance%20recovering%20my%20staff%20admin%20access."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-[8px] bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 font-semibold text-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp IT Desk (+234 813 969 0031)</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
