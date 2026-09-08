'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingBag,
  Heart,
  Image as ImageIcon,
  Sliders,
  Mail,
  History,
  LogOut,
  ExternalLink,
  Shield,
  TrendingUp,
  Layers,
  Boxes,
  Users,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminOrderAlarm } from '@/components/admin/AdminOrderAlarm';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF'))) {
      router.push('/account/login');
    }
  }, [user, isLoading, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-gold-400">
        <p className="text-xs font-bold uppercase tracking-wider">Verifying Admin Access...</p>
      </div>
    );
  }

  // Flat nav links matching desktop sidebar exactly
  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { href: '/admin/sales', label: 'Sales & Revenue', shortLabel: 'Sales', icon: TrendingUp },
    { href: '/admin/products', label: 'Products & Photos', shortLabel: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', shortLabel: 'Categories', icon: Layers },
    { href: '/admin/inventory', label: 'Inventory Control', shortLabel: 'Inventory', icon: Boxes },
    { href: '/admin/orders', label: 'Order Management', shortLabel: 'Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customer Accounts', shortLabel: 'Customers', icon: Users },
    { href: '/admin/custom-requests', label: '4U Heartlines Requests', shortLabel: '4U Requests', icon: Heart },
    { href: '/admin/media', label: 'Sunflower Media Hub', shortLabel: 'Media', icon: ImageIcon },
    { href: '/admin/brands', label: 'Brand Architecture', shortLabel: 'Brands', icon: Tag },
    { href: '/admin/settings', label: 'Store Settings & Alerts', shortLabel: 'Settings', icon: Sliders },
    { href: '/admin/inquiries', label: 'Customer Inquiries', shortLabel: 'Inquiries', icon: Mail },
    { href: '/admin/audit-logs', label: 'Staff Audit Logs', shortLabel: 'Audit Logs', icon: History },
  ];

  // Grouped sections for structured mobile phone drawer
  const mobileNavSections = [
    {
      category: 'Analytics & Orders',
      links: [
        { href: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { href: '/admin/sales', label: 'Sales & Revenue', icon: TrendingUp },
        { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
      ],
    },
    {
      category: 'Catalog & Warehouse',
      links: [
        { href: '/admin/products', label: 'Products & Photos', icon: Package },
        { href: '/admin/categories', label: 'Categories', icon: Layers },
        { href: '/admin/inventory', label: 'Inventory Control', icon: Boxes },
        { href: '/admin/media', label: 'Sunflower Media Hub', icon: ImageIcon },
      ],
    },
    {
      category: 'Clients & Requests',
      links: [
        { href: '/admin/customers', label: 'Customer Accounts', icon: Users },
        { href: '/admin/custom-requests', label: '4U Heartlines Requests', icon: Heart },
        { href: '/admin/inquiries', label: 'Customer Inquiries', icon: Mail },
      ],
    },
    {
      category: 'Store & Administration',
      links: [
        { href: '/admin/brands', label: 'Brand Architecture', icon: Tag },
        { href: '/admin/settings', label: 'Store Settings & Alerts', icon: Sliders },
        { href: '/admin/audit-logs', label: 'Staff Audit Logs', icon: History },
      ],
    },
  ];

  const currentNav = navLinks.find((l) => l.href === pathname) || navLinks[0];

  return (
    <div className="min-h-screen flex bg-stone-100/90 text-stone-900">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION (UNTOUCHED: hidden md:flex)                    */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-harmony-950 text-stone-300 border-r border-harmony-900 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-harmony-800 to-harmony-900 text-gold-400 font-serif font-bold text-lg flex items-center justify-center border border-gold-400/30">
              H
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-sm tracking-tight leading-tight">
                HARMONY HAVEN
              </h2>
              <span className="text-[10px] uppercase font-bold text-gold-400 tracking-widest block">
                Enterprise Admin Hub
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-harmony-900 text-gold-300 shadow-xs border border-gold-400/20'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Storefront Link */}
        <div className="p-6 border-t border-harmony-900/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-harmony-800 text-gold-400 font-bold text-xs flex items-center justify-center font-serif">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <span className="text-[10px] text-gold-400 uppercase font-semibold">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={() => logout()}
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-950/60 hover:text-rose-300 text-stone-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (md:hidden)                                      */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[86vw] max-w-xs sm:max-w-sm h-full bg-harmony-950 text-stone-200 flex flex-col justify-between border-r border-harmony-800 shadow-2xl z-10 overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Drawer Top / Header */}
            <div className="p-5 border-b border-harmony-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-harmony-800 to-harmony-900 text-gold-400 font-serif font-bold text-base flex items-center justify-center border border-gold-400/30">
                  H
                </div>
                <div>
                  <h2 className="font-serif font-bold text-white text-xs tracking-tight">
                    HARMONY HAVEN
                  </h2>
                  <span className="text-[9px] uppercase font-bold text-gold-400 tracking-widest block">
                    Enterprise Admin Hub
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="px-5 py-3.5 bg-harmony-900/40 border-b border-harmony-900/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-harmony-800 text-gold-300 font-serif font-bold text-sm flex items-center justify-center border border-gold-400/20">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-md mt-0.5">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Categorized Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {mobileNavSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500/80 px-2.5 block mb-1.5">
                    {section.category}
                  </span>
                  <div className="space-y-1">
                    {section.links.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[42px] ${
                            isActive
                              ? 'bg-harmony-900 text-gold-300 border border-gold-400/30 shadow-xs'
                              : 'text-stone-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-400' : 'text-stone-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-harmony-900 bg-harmony-950/90 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                <span>Open Storefront</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-900/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* REAL-TIME ORDER ALARM & DISPATCH MONITOR */}
        <AdminOrderAlarm />

        {/* MOBILE STICKY TOP HEADER (md:hidden) */}
        <div className="md:hidden sticky top-0 z-30 bg-harmony-950 text-white border-b border-harmony-900/80 px-4 py-3 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 text-gold-400 active:scale-95 transition-all flex items-center gap-1.5 border border-gold-400/20"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-wider uppercase">Menu</span>
            </button>

            <div className="min-w-0">
              <h2 className="font-serif font-bold text-xs text-white truncate tracking-tight">
                HARMONY HAVEN
              </h2>
              <span className="text-[9px] uppercase font-bold text-gold-400 tracking-wider block">
                {currentNav.shortLabel || 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gold-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-white/5"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Store</span>
            </Link>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE HORIZONTAL QUICK-ACCESS PILL BAR (md:hidden) */}
        <div className="md:hidden bg-harmony-900/90 backdrop-blur-xs border-b border-harmony-800/80 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-tight transition-all ${
                  isActive
                    ? 'bg-harmony-950 text-gold-300 border border-gold-400/40 shadow-xs'
                    : 'bg-white/5 text-stone-300 hover:text-white border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-stone-400'}`} />
                <span>{item.shortLabel || item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Page Content Container (optimized for both phone and desktop) */}
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 pb-28 md:pb-10">
          {children}
        </div>

        {/* MOBILE DOCKED BOTTOM QUICK BAR (md:hidden) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-harmony-950/95 backdrop-blur-md border-t border-harmony-900/90 py-1.5 px-2 flex items-center justify-around shadow-2xl">
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === '/admin/dashboard' ? 'text-gold-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </Link>

          <Link
            href="/admin/sales"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === '/admin/sales' ? 'text-gold-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales</span>
          </Link>

          <Link
            href="/admin/products"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === '/admin/products' ? 'text-gold-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/inventory"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === '/admin/inventory' ? 'text-gold-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold text-gold-400 active:scale-95 transition-transform"
          >
            <Menu className="w-4 h-4" />
            <span>All Hubs</span>
          </button>
        </div>
      </main>
    </div>
  );
}

