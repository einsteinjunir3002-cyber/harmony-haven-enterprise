'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Shield, ChevronDown, Sparkles, Utensils, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { totalCount, setIsOpen } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);

  const isKowah = pathname.startsWith('/kowahs-dishes');
  const isHeartlines = pathname.startsWith('/4u-heartlines');
  const isAdmin = pathname.startsWith('/admin');

  // Skip public navbar on admin pages
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors">
      {/* Top corporate notice bar */}
      <div className="bg-harmony-900 text-gold-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span>HARMONY HAVEN ENTERPRISE — Small Hands, Wide Reach</span>
        <span className="hidden md:inline">| Delivery Across Ghana</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-harmony-800 to-harmony-950 flex items-center justify-center text-gold-400 font-serif font-bold text-xl shadow-md border border-gold-400/30 group-hover:scale-105 transition-transform">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-harmony-950 tracking-tight leading-tight group-hover:text-harmony-800 transition-colors">
                HARMONY HAVEN
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-gold-600">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-700">
            <Link
              href="/"
              className={`hover:text-harmony-900 transition-colors ${
                pathname === '/' ? 'text-harmony-900 font-semibold' : ''
              }`}
            >
              HOME
            </Link>

            <Link
              href="/about"
              className={`hover:text-harmony-900 transition-colors ${
                pathname === '/about' ? 'text-harmony-900 font-semibold' : ''
              }`}
            >
              ABOUT
            </Link>

            {/* Brands Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setBrandsDropdownOpen(!brandsDropdownOpen)}
                onMouseEnter={() => setBrandsDropdownOpen(true)}
                className={`flex items-center gap-1.5 hover:text-harmony-900 transition-colors py-2 ${
                  pathname.startsWith('/brands') || isKowah || isHeartlines
                    ? 'text-harmony-900 font-semibold'
                    : ''
                }`}
              >
                <span>OUR BRANDS</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div
                onMouseLeave={() => setBrandsDropdownOpen(false)}
                className={`absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 transition-all duration-200 ${
                  brandsDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <Link
                  href="/kowahs-dishes"
                  onClick={() => setBrandsDropdownOpen(false)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-kowah-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-kowah-900 text-gold-400 flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm group-hover:text-kowah-900">
                      Kowah&apos;s Dishes
                    </p>
                    <p className="text-xs text-stone-500">Cook Less, Live More!</p>
                  </div>
                </Link>

                <Link
                  href="/4u-heartlines"
                  onClick={() => setBrandsDropdownOpen(false)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-heartlines-50 transition-colors group mt-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-harmony-900 text-gold-400 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm group-hover:text-harmony-900">
                      4U HEARTLINES
                    </p>
                    <p className="text-xs text-stone-500">Where feelings find words</p>
                  </div>
                </Link>
              </div>
            </div>

            <Link
              href="/kowahs-dishes"
              className={`hover:text-kowah-900 transition-colors ${
                isKowah ? 'text-kowah-900 font-semibold' : ''
              }`}
            >
              KOWAH&apos;S DISHES
            </Link>

            <Link
              href="/4u-heartlines"
              className={`hover:text-heartlines-900 transition-colors ${
                isHeartlines ? 'text-heartlines-900 font-semibold' : ''
              }`}
            >
              4U HEARTLINES
            </Link>

            <Link
              href="/order"
              className={`hover:text-harmony-900 transition-colors ${
                pathname === '/order' ? 'text-harmony-900 font-semibold' : ''
              }`}
            >
              ALL PRODUCTS
            </Link>

            <Link
              href="/contact"
              className={`hover:text-harmony-900 transition-colors ${
                pathname === '/contact' ? 'text-harmony-900 font-semibold' : ''
              }`}
            >
              CONTACT
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Admin Dashboard Badge */}
            {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 text-xs font-semibold rounded-full border border-amber-300 hover:bg-amber-100 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Hub</span>
              </Link>
            )}

            {/* Customer Account Button */}
            <Link
              href={user ? '/account' : '/account/login'}
              className="p-2 text-stone-700 hover:text-harmony-900 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-1.5"
              title={user ? `Signed in as ${user.name}` : 'Sign In'}
            >
              <User className="w-5 h-5" />
              {user && <span className="hidden md:inline text-xs font-semibold">{user.name.split(' ')[0]}</span>}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 bg-stone-100 hover:bg-stone-200 text-harmony-950 rounded-full transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Primary CTA Button */}
            <Link
              href="/order"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-harmony-900 text-white hover:bg-harmony-950 shadow-md hover:shadow-lg transition-all"
            >
              PLACE AN ORDER
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-harmony-900 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-6 shadow-xl space-y-4">
          <nav className="flex flex-col gap-3 text-base font-medium text-stone-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>Home</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>About Us</span>
            </Link>

            <Link
              href="/kowahs-dishes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-kowah-900 border-b border-stone-100 flex items-center justify-between font-semibold"
            >
              <span>Kowah&apos;s Dishes</span>
              <span className="text-xs bg-kowah-100 text-kowah-900 px-2 py-0.5 rounded-full">Food & Drinks</span>
            </Link>

            <Link
              href="/4u-heartlines"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-harmony-900 border-b border-stone-100 flex items-center justify-between font-semibold"
            >
              <span>4U HEARTLINES</span>
              <span className="text-xs bg-harmony-100 text-harmony-900 px-2 py-0.5 rounded-full">Gifts & Poetry</span>
            </Link>

            <Link
              href="/order"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>All Products & Menu</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-stone-100 flex items-center justify-between"
            >
              <span>Contact Us</span>
            </Link>

            {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-amber-800 border-b border-stone-100 flex items-center gap-2 font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href={user ? '/account' : '/account/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-stone-600 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
            </Link>
          </nav>

          <Link
            href="/order"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-3 bg-harmony-900 text-white rounded-xl font-bold text-sm tracking-wider uppercase shadow-md block"
          >
            PLACE AN ORDER
          </Link>
        </div>
      )}
    </header>
  );
}
