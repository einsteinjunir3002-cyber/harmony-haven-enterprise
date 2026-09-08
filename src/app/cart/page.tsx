'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Heart,
  Utensils,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-100">
            Your Cart is Empty
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our handcrafted specialties and personalized gifts.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/kowahs-dishes"
            className="px-6 py-3.5 rounded-full bg-kowah-900 hover:bg-kowah-950 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Utensils className="w-4 h-4 text-gold-400" />
            <span>Kowah's Dishes</span>
          </Link>

          <Link
            href="/4u-heartlines"
            className="px-6 py-3.5 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            <span>4U HEARTLINES</span>
          </Link>

          <Link
            href="/order"
            className="px-6 py-3.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider transition-all"
          >
            View All Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 dark:text-stone-100">
            Shopping Cart
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            You have <span className="font-bold text-harmony-950 dark:text-gold-400">{totalCount} item{totalCount !== 1 ? 's' : ''}</span> in your cart
          </p>
        </div>

        <Link
          href="/order"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-harmony-900 dark:text-gold-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 shadow-xs">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-700/60 relative">
                  <img
                    src={item.image || '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block">
                    {item.brandName || "Harmony Haven"}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 truncate">
                    {item.name}
                  </h3>
                  {item.variantName && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Option: <span className="font-semibold">{item.variantName}</span>
                    </p>
                  )}
                  {item.personalization && (
                    <p className="text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 rounded inline-block">
                      Customization: {JSON.stringify(item.personalization)}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 sm:hidden pt-1">
                    {formatCurrency(item.price)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-800">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900 dark:text-stone-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <p className="font-bold text-base sm:text-lg text-harmony-950 dark:text-gold-400 font-serif">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-harmony-900 dark:hover:text-gold-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Add More Items From Catalog</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-lg space-y-6">
            <h2 className="font-serif font-bold text-xl text-stone-950 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Items Subtotal ({totalCount})</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-stone-600 dark:text-stone-400 pt-1">
                <span>Estimated Delivery</span>
                <span className="text-xs text-stone-500">Calculated at checkout</span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-harmony-900 dark:text-gold-400">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Delivery to Kumasi, Cape Coast & Accra</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 pl-6">
                  Standard delivery duration is 24hr to 48hrs.
                </p>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-stone-200 dark:border-stone-700 text-base font-bold text-stone-950 dark:text-stone-100">
                <span>Estimated Total</span>
                <span className="text-2xl font-serif text-harmony-950 dark:text-gold-400">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted, Safe & Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-harmony-800 dark:text-gold-500 shrink-0" />
                <span>Prompt 24hr - 48hrs Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
