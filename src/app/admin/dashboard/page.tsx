'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  Heart,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/metrics?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      const json = await res.json().catch(() => ({ error: 'Invalid response from server' }));

      if (!res.ok || json.error) {
        setFetchError(json.error || 'Could not load store numbers right now.');
      } else {
        setData(json);
      }
    } catch (err: any) {
      console.error('Admin metrics fetch error:', err);
      setFetchError('Internet connection issue. Please tap refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading && !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Loading your store numbers...
        </p>
      </div>
    );
  }

  if (fetchError && !data) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-xl text-stone-900">
          Could not load store numbers
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          {fetchError}
        </p>
        <button
          onClick={fetchMetrics}
          className="px-5 py-2.5 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    customRequestsCount: 0,
    lowStockProducts: 0,
  };

  const recentOrders: any[] = Array.isArray(data?.recentOrders) ? data.recentOrders : [];

  const statCards = [
    {
      title: 'Total Money Made',
      value: formatCurrency(metrics.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-emerald-500 text-white',
      desc: 'Money from paid orders',
    },
    {
      title: 'All Orders',
      value: metrics.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-harmony-900 text-white',
      desc: 'Total orders placed so far',
    },
    {
      title: 'Orders to Pack & Send',
      value: metrics.pendingOrders || 0,
      icon: Clock,
      color: 'bg-amber-500 text-white',
      desc: 'New orders waiting for you',
    },
    {
      title: 'Items for Sale',
      value: metrics.totalProducts || 0,
      icon: Package,
      color: 'bg-teal-600 text-white',
      desc: 'Items in your shop right now',
    },
    {
      title: 'Special Gift Requests',
      value: metrics.customRequestsCount || 0,
      icon: Heart,
      color: 'bg-pink-600 text-white',
      desc: 'Custom gift orders to reply to',
    },
    {
      title: 'Items Running Low',
      value: metrics.lowStockProducts || 0,
      icon: AlertTriangle,
      color: (metrics.lowStockProducts || 0) > 0 ? 'bg-rose-500 text-white' : 'bg-stone-500 text-white',
      desc: 'Items with 10 or fewer left in stock',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Store Overview
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950 mt-1">
            Welcome Back!
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Here is a simple look at how your shop is doing today.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Refresh numbers"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Numbers</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color} shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
                  {card.value}
                </p>
                <p className="text-xs text-stone-400 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Feed */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Latest Orders</h2>
            <p className="text-xs text-stone-400 mt-0.5">When customers order, they show up here</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950 flex items-center gap-1"
          >
            <span>See All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            No orders yet. When someone buys an item, you will see it here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">When</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord: any) => {
                  const statusObj =
                    ORDER_STATUS_FLOW.find((s) => s.key === ord?.fulfillmentStatus) ||
                    ORDER_STATUS_FLOW[0];

                  const itemsCount = Array.isArray(ord?.items) ? ord.items.length : 0;

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-stone-900">{ord.customerName || 'Customer'}</p>
                        <p className="text-[11px] text-stone-400">{ord.customerPhone || '—'}</p>
                      </td>
                      <td className="py-3 text-stone-600">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3 font-bold text-harmony-950">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                      </td>
                      <td className="py-3 text-stone-400">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders?q=${ord.orderNumber}`}
                          className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-harmony-900 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-colors inline-block"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
