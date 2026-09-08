'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  Edit2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const fetchOrders = async () => {
    try {
      const url = `/api/admin/orders?${searchQuery ? `q=${encodeURIComponent(searchQuery)}&` : ''}${
        selectedStatus ? `status=${selectedStatus}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleInspect = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.fulfillmentStatus);
    setStatusNote('');
    setInternalNotes(order.internalNotes || '');
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          fulfillmentStatus: newStatus,
          statusNote,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDrawerOpen(false);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Order Operations
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Order Management & Status Machine
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Track customer purchases, advance kitchen/gifting workflow stages, and record fulfillment logs.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedStatus === ''
                ? 'bg-harmony-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {ORDER_STATUS_FLOW.slice(0, 5).map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedStatus(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedStatus === s.key
                  ? 'bg-harmony-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); fetchOrders(); }}
          className="w-full md:w-72 relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order no. or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-harmony-900"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">No matching orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-6">Order Number</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => {
                  const statusObj =
                    ORDER_STATUS_FLOW.find((s) => s.key === ord.fulfillmentStatus) ||
                    ORDER_STATUS_FLOW[0];

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
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-4 px-4 font-bold text-harmony-950">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-stone-400">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleInspect(ord)}
                          className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-harmony-900 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Status Update Drawer / Modal */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
                  Order Details
                </span>
                <h2 className="font-serif font-bold text-xl text-stone-950 font-mono">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 text-xs text-stone-600">
              <div>
                <span className="font-bold text-stone-900 block">Customer:</span>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerPhone}</p>
                <p>{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="font-bold text-stone-900 block">Delivery Details:</span>
                <p>{selectedOrder.deliveryMethod} &bull; Total: <span className="font-bold text-harmony-950">{formatCurrency(selectedOrder.total)}</span></p>
                {selectedOrder.deliveryAddressJson && (
                  <p className="text-[11px] text-stone-500 mt-1">
                    {JSON.parse(selectedOrder.deliveryAddressJson).area}, {JSON.parse(selectedOrder.deliveryAddressJson).city}
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Ordered Items ({selectedOrder.items.length})
              </span>
              <div className="space-y-2 border border-stone-100 rounded-xl p-3">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs py-1 border-b border-stone-50 last:border-0">
                    <div>
                      <p className="font-bold text-stone-800">{item.productName}</p>
                      {item.variantName && <p className="text-[11px] text-stone-500">{item.variantName}</p>}
                      <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-stone-900">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Machine Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-stone-100 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Change Fulfillment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {ORDER_STATUS_FLOW.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Status Transition Note (Recorded in Audit History)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Soup packaged in temperature-controlled cooler for dispatch"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private internal operational notes..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-6 py-2 rounded-xl bg-harmony-900 text-white font-bold uppercase tracking-wider text-[11px] disabled:opacity-50 shadow-md"
                >
                  {updatingStatus ? 'Updating Status...' : 'Save & Record Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
