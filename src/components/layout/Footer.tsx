'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MessageCircle, Instagram, MapPin, Sparkles, Heart, Utensils } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-harmony-950 text-stone-300 pt-16 pb-12 border-t border-harmony-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-harmony-900/60">
          {/* Col 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-harmony-800 to-harmony-900 flex items-center justify-center text-gold-400 font-serif font-bold text-lg border border-gold-400/30">
                H
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white tracking-tight">
                  HARMONY HAVEN ENTERPRISE
                </h3>
                <p className="text-xs text-gold-400 font-semibold tracking-wider uppercase">
                  Small Hands, Wide Reach
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Building brands. Creating experiences. A growing Ghanaian enterprise bringing meaningful expressions of food, gifting, and creativity under one roof.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-pink-950/60 text-pink-300 border border-pink-800/50 hover:bg-pink-900 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Col 3: Child Brands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Our Brands</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/kowahs-dishes"
                  className="hover:text-gold-300 transition-colors flex items-center gap-2"
                >
                  <Utensils className="w-3.5 h-3.5 text-gold-500" />
                  <span>Kowah&apos;s Dishes</span>
                </Link>
                <p className="text-[11px] text-stone-500 pl-5.5">Cook Less, Live More!</p>
              </li>
              <li className="pt-2">
                <Link
                  href="/4u-heartlines"
                  className="hover:text-gold-300 transition-colors flex items-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>4U HEARTLINES</span>
                </Link>
                <p className="text-[11px] text-stone-500 pl-5.5">Where feelings find words</p>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Order Catalog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/partnerships" className="hover:text-white transition-colors">Partnerships</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">Customer Account</Link></li>
            </ul>
          </div>

          {/* Col 5: Business Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Reach Us</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <a href="tel:0245147912" className="hover:text-white transition-colors font-medium">
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Harmony Haven Enterprise. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-stone-400 transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-stone-400 transition-colors">Terms of Service</Link>
            <Link href="/legal/shipping" className="hover:text-stone-400 transition-colors">Delivery Policy</Link>
            <Link href="/legal/returns" className="hover:text-stone-400 transition-colors">Returns & Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
