'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Calendar,
  ArrowRight,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

export default function AdminSalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'all' | '30d' | '7d' | 'today'>('all');

  const fetchSales = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sales?range=${selectedRange}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(range);
  }, [range]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-stone-400">
        Calculating financial sales & brand revenue metrics...
      </div>
    );
  }

  const { summary, brandSales, paymentMethods, transactions } = data;

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Financial Performance & Ledger
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Sales & Revenue Analytics
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Track gross sales, brand revenue shares, mobile money payment metrics, and order transaction flows.
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
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Verified Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-harmony-950">
            {formatCurrency(summary.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            {summary.paidOrdersCount || 0} successfully settled orders
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-gold-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            {formatCurrency(summary.averageOrderValue || 0)}
          </p>
          <span className="text-[10px] text-stone-400 block">Per completed customer transaction</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            {summary.totalOrdersCount || 0}
          </p>
          <span className="text-[10px] text-stone-400 block">Across storefront checkouts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payment</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-amber-600">
            {formatCurrency(summary.pendingRevenue || 0)}
          </p>
          <span className="text-[10px] text-stone-400 block">
            {summary.pendingOrdersCount || 0} awaiting settlement
          </span>
        </div>
      </div>

      {/* Brand Sales Share Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Brand Revenue Contribution</h2>
            <p className="text-xs text-stone-400 mt-0.5">Sales performance comparison between sister brands</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-700">Multi-Brand Share</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brandSales.map((b: any, i: number) => {
            const pct =
              summary.totalRevenue > 0
                ? Math.round((b.revenue / summary.totalRevenue) * 100)
                : 0;

            return (
              <div
                key={i}
                className="p-5 rounded-2xl border border-stone-100 bg-stone-50/70 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-serif font-bold text-sm"
                      style={{ backgroundColor: b.color }}
                    >
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{b.name}</h3>
                      <p className="text-[11px] text-stone-400">{b.ordersCount} orders recorded</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-lg text-harmony-950">
                      {formatCurrency(b.revenue)}
                    </p>
                    <span className="text-xs font-bold text-gold-700">{pct}% Share</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, pct)}%`,
                      backgroundColor: b.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Transactions Ledger */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950">Sales Transactions Ledger</h2>
            <p className="text-xs text-stone-400 mt-0.5">Chronological stream of financial transactions</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950 flex items-center gap-1"
          >
            <span>Fulfillment Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            No sales transactions found for this timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">Transaction / Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items / Brands</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transactions.map((ord: any) => {
                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-stone-900">{ord.customerName}</p>
                        <p className="text-[11px] text-stone-400">{ord.customerPhone}</p>
                      </td>

                      <td className="py-4 px-4 text-stone-600">
                        {ord.items?.length || 0} items
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700 flex items-center gap-1 w-fit">
                          <Smartphone className="w-3 h-3 text-gold-700" />
                          {ord.payments?.[0]?.provider?.replace('_', ' ') || 'Mobile Money'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentStatus === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-harmony-950">
                        {formatCurrency(ord.total)}
                      </td>

                      <td className="py-4 px-4 text-stone-400">
                        {formatDate(ord.createdAt)}
                      </td>

                      <td className="py-4 px-6 text-right">
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
