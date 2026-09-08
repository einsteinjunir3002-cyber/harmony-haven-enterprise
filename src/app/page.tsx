'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, Mail, Phone, ArrowRight, AlertCircle, Sparkles, Utensils, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RootGatewayPage() {
  const router = useRouter();
  const { login, register, user, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [emailOrName, setEmailOrName] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    }
  }, [user, isLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(emailOrName, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials');
    } else {
      router.push('/home');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await register(regName, regEmail, regPassword, regPhone);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16 bg-gradient-to-b from-stone-50 via-white to-stone-100">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-harmony-800 to-harmony-950 text-gold-400 font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-lg border border-gold-400/30 hover:scale-105 transition-transform">
            H
          </div>
          <div className="space-y-1">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950 tracking-tight">
              HARMONY HAVEN ENTERPRISE
            </h1>
            <p className="text-xs text-gold-600 font-bold uppercase tracking-widest">
              Small Hands, Wide Reach
            </p>
          </div>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Welcome! Please sign in to access your account or proceed as our guest.'
              : 'Create your customer account for fast ordering & exclusive offers.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address or Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={emailOrName}
                    onChange={(e) => setEmailOrName(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kojo Mensah"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. kojo@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 024 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Password (min. 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Guest Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Or
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>

          {/* Continue as Guest Button */}
          <div className="space-y-2.5">
            <Link
              href="/home"
              className="w-full py-3.5 rounded-xl border-2 border-stone-300 hover:border-harmony-800 hover:bg-stone-50 text-stone-800 hover:text-harmony-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/order"
              className="w-full py-2.5 text-center text-xs font-semibold text-stone-500 hover:text-harmony-900 block transition-colors"
            >
              Jump directly to Order Catalog →
            </Link>
          </div>
        </div>

        {/* Quick Brand Badges Footer */}
        <div className="flex items-center justify-center gap-6 text-xs text-stone-500 pt-2">
          <Link
            href="/kowahs-dishes"
            className="flex items-center gap-1.5 hover:text-kowah-900 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-gold-600" />
            <span>Kowah&apos;s Dishes</span>
          </Link>
          <span>•</span>
          <Link
            href="/4u-heartlines"
            className="flex items-center gap-1.5 hover:text-harmony-900 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            <span>4U HEARTLINES</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
