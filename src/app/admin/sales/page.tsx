'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Smartphone,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminSalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'all' | '30d' | '7d' | 'today'>('all');

  const fetchSales = useCallback(async (selectedRange: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sales?range=${selectedRange}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({ error: 'Invalid response from server' }));
      if (!res.ok || json.error) {
        setError(json.error || 'Could not load sales numbers.');
      } else {
        setData(json);
      }
    } catch (e: any) {
      console.error('Error fetching sales:', e);
      setError('Connection issue. Please tap refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales(range);
  }, [range, fetchSales]);

  if (loading && !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Loading your sales numbers...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-xl text-stone-900">
          Could not load sales numbers
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">{error}</p>
        <button
          onClick={() => fetchSales(range)}
          className="px-5 py-2.5 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    paidOrdersCount: 0,
    averageOrderValue: 0,
    totalOrdersCount: 0,
    pendingRevenue: 0,
    pendingOrdersCount: 0,
  };

  const brandSales: any[] = Array.isArray(data?.brandSales) ? data.brandSales : [];
  const transactions: any[] = Array.isArray(data?.transactions) ? data.transactions : [];

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Money You Made
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950 mt-1">
            Sales & Money
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            See how much money you made, how customers paid, and your latest sales.
          </p>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 shadow-xs">
          {[
            { key: 'all', label: 'All Time' },
            { key: '30d', label: 'Last 30 Days' },
            { key: '7d', label: 'Last 7 Days' },
            { key: 'today', label: 'Today' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setRange(t.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                range === t.key
                  ? 'bg-harmony-900 text-gold-300 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Paid Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-harmony-950">
            {formatCurrency(summary.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            {summary.paidOrdersCount || 0} paid orders
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Sale</span>
            <TrendingUp className="w-4 h-4 text-gold-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            {formatCurrency(summary.averageOrderValue || 0)}
          </p>
          <span className="text-[10px] text-stone-400 block">Average amount per order</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            {summary.totalOrdersCount || 0}
          </p>
          <span className="text-[10px] text-stone-400 block">Total orders in this period</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Waiting for Payment</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-amber-600">
            {formatCurrency(summary.pendingRevenue || 0)}
          </p>
          <span className="text-[10px] text-stone-400 block">
            {summary.pendingOrdersCount || 0} orders waiting for payment
          </span>
        </div>
      </div>

      {/* Brand Sales Share Breakdown */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Sales by Each Brand</h2>
            <p className="text-xs text-stone-400 mt-0.5">See which shop is making the most sales</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-700">Brand Share</span>
        </div>

        {brandSales.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No brand sales recorded for this timeframe yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {brandSales.map((b: any, i: number) => {
              const totalRev = Number(summary.totalRevenue) || 0;
              const bRev = Number(b.revenue) || 0;
              const pct = totalRev > 0 ? Math.round((bRev / totalRev) * 100) : 0;

              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-stone-100 bg-stone-50/70 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-serif font-bold text-sm"
                        style={{ backgroundColor: b.color || '#0a4d52' }}
                      >
                        {(b.name || 'B').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900">{b.name}</h3>
                        <p className="text-[11px] text-stone-400">{b.ordersCount || 0} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-lg text-harmony-950">
                        {formatCurrency(b.revenue)}
                      </p>
                      <span className="text-xs font-bold text-gold-700">{pct}% of sales</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, pct)}%`,
                        backgroundColor: b.color || '#0a4d52',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sales Transactions Ledger */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Latest Sales</h2>
            <p className="text-xs text-stone-400 mt-0.5">List of all orders and payments</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950 flex items-center gap-1"
          >
            <span>See All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            No sales recorded for this timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">How They Paid</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">When</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transactions.map((ord: any) => {
                  const itemsCount = Array.isArray(ord?.items) ? ord.items.length : 0;
                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{ord.customerName || 'Customer'}</p>
                        <p className="text-[11px] text-stone-400">{ord.customerPhone || '—'}</p>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700 flex items-center gap-1 w-fit">
                          <Smartphone className="w-3 h-3 text-gold-700" />
                          {ord.payments?.[0]?.provider?.replace('_', ' ') || 'Mobile Money'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentStatus === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus === 'PAID' ? 'Paid' : ord.paymentStatus === 'REFUNDED' ? 'Sent Back' : 'Waiting'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-harmony-950">
                        {formatCurrency(ord.total)}
                      </td>

                      <td className="py-3 px-4 text-stone-400">
                        {formatDate(ord.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
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
