'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, totalCount } = useCart();
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/delivery-zones')
        .then((res) => res.json())
        .then((data) => {
          if (data.zones) setDeliveryZones(data.zones);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-harmony-900" />
              <h2 className="text-base font-serif font-bold text-stone-900">
                Your Shopping Bag ({totalCount})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Your bag is currently empty</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Explore Kowah&apos;s Dishes or 4U HEARTLINES to add homemade meals and thoughtful gifts to your order.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-block text-xs font-bold uppercase tracking-wider px-6 py-2.5 bg-harmony-900 text-white rounded-full hover:bg-harmony-950"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-stone-100 overflow-hidden relative shrink-0 border border-stone-200/60">
                    <img
                      src={item.image || '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 block">
                      {item.brandName}
                    </span>
                    <h4 className="font-semibold text-stone-900 text-sm truncate">{item.name}</h4>
                    {item.variantName && (
                      <p className="text-xs text-stone-500">{item.variantName}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-stone-500 hover:bg-stone-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-stone-500 hover:bg-stone-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="font-bold text-harmony-950 text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 p-6 bg-stone-50/80 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-harmony-800" />
                  Estimated Delivery in Ghana (24 - 48 hrs)
                </span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-200/60">
                <span>Subtotal</span>
                <span className="text-lg text-harmony-950">{formatCurrency(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
