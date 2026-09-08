'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Clock, LogOut, Shield, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/account/login');
      return;
    }

    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Profile Banner */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-harmony-900 text-gold-400 flex items-center justify-center font-serif font-bold text-2xl shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-stone-950">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user.email} &bull; {user.phone || 'No phone saved'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
            <Link
              href="/admin/dashboard"
              className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-4 h-4 text-amber-800" />
              <span>Admin Hub</span>
            </Link>
          )}

          <button
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-2xl text-stone-950 flex items-center gap-2">
            <Package className="w-5 h-5 text-harmony-900" />
            <span>Your Order History ({orders.length})</span>
          </h2>
          <Link
            href="/order"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950"
          >
            Browse Menu & Products &rarr;
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-serif font-bold text-base text-stone-800">No orders placed yet</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Treat yourself to delicious dishes from Kowah&apos;s Dishes or custom poems from 4U HEARTLINES.
            </p>
            <Link
              href="/order"
              className="inline-block px-6 py-2.5 bg-harmony-900 text-white rounded-full text-xs font-bold uppercase tracking-wider mt-2"
            >
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusObj =
                ORDER_STATUS_FLOW.find((s) => s.key === order.fulfillmentStatus) ||
                ORDER_STATUS_FLOW[0];

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-stone-950">
                        {order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                        {statusObj.label}
                      </span>
                      <span className="text-xs text-stone-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}: </span>
                      <span className="font-medium text-stone-800">
                        {order.items.map((i: any) => i.productName).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
                      <span className="text-base font-bold text-harmony-950 font-serif">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <Link
                      href={`/checkout/confirmation/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-harmony-900 hover:text-white text-stone-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
