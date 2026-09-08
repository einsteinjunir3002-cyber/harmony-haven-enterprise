'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  Users,
  Heart,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-stone-400">
        Loading real-time enterprise metrics...
      </div>
    );
  }

  const { metrics, recentOrders } = data;

  const statCards = [
    {
      title: 'Verified Revenue',
      value: formatCurrency(metrics.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-emerald-500 text-white',
      desc: 'Total paid orders',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-harmony-900 text-white',
      desc: 'All customer transactions',
    },
    {
      title: 'Pending Fulfillment',
      value: metrics.pendingOrders || 0,
      icon: Clock,
      color: 'bg-amber-500 text-white',
      desc: 'New & preparing orders',
    },
    {
      title: 'Active Products',
      value: metrics.totalProducts || 0,
      icon: Package,
      color: 'bg-teal-600 text-white',
      desc: 'Across all active brands',
    },
    {
      title: 'Custom 4U Requests',
      value: metrics.customRequestsCount || 0,
      icon: Heart,
      color: 'bg-pink-600 text-white',
      desc: 'Pending creative review',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockProducts || 0,
      icon: AlertTriangle,
      color: metrics.lowStockProducts > 0 ? 'bg-rose-500 text-white' : 'bg-stone-500 text-white',
      desc: 'Items with ≤10 inventory',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Enterprise Overview
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Executive Dashboard
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Authoritative real-time metrics calculated from database transactions.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
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
                <p className="text-[11px] text-stone-400 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Feed */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Recent Orders</h2>
            <p className="text-xs text-stone-400 mt-0.5">Live stream of incoming orders across brands</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950 flex items-center gap-1"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            No orders in database yet. New orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="pb-3">Order No.</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Placed</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord: any) => {
                  const statusObj =
                    ORDER_STATUS_FLOW.find((s) => s.key === ord.fulfillmentStatus) ||
                    ORDER_STATUS_FLOW[0];

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-stone-900">{ord.customerName}</p>
                        <p className="text-[11px] text-stone-400">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 text-stone-600">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
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
                          Inspect
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
