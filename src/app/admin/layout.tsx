'use client';

import React, { useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF'))) {
      router.push('/account/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-gold-400">
        <p className="text-xs font-bold uppercase tracking-wider">Verifying Admin Access...</p>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/brands', label: 'Brand Architecture', icon: Tag },
    { href: '/admin/products', label: 'Products & Variants', icon: Package },
    { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
    { href: '/admin/custom-requests', label: '4U Heartlines Requests', icon: Heart },
    { href: '/admin/media', label: 'Sunflower Media Hub', icon: ImageIcon },
    { href: '/admin/settings', label: 'CMS & Settings', icon: Sliders },
    { href: '/admin/inquiries', label: 'Customer Inquiries', icon: Mail },
    { href: '/admin/audit-logs', label: 'Staff Audit Logs', icon: History },
  ];

  return (
    <div className="min-h-screen flex bg-stone-100/90 text-stone-900">
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden bg-harmony-950 text-white p-4 flex items-center justify-between">
          <span className="font-serif font-bold text-sm">HARMONY HAVEN ADMIN</span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gold-400 underline">Storefront</Link>
            <button onClick={() => logout()} className="text-xs text-rose-300">Logout</button>
          </div>
        </div>

        <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
