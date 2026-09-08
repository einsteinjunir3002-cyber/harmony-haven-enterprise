'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  ShoppingBag,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalCustomers: 0,
    totalUsers: 0,
    activeCustomers: 0,
    totalLifetimeSpend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
      if (data.metrics) setMetrics(data.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenEdit = (c: any) => {
    setSelectedCustomer(c);
    setEditRole(c.role);
    setEditStatus(c.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSavePrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCustomer.id,
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update customer');

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating privileges');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (roleFilter !== 'ALL' && c.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Clientele & Stakeholders
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Customer Management
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          View registered customer accounts, monitor verified purchase history, manage access roles, and audit account status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-4 h-4 text-harmony-900" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-950 mt-2">{metrics.totalUsers}</p>
          <span className="text-[10px] text-stone-400">Total customer & staff profiles</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Customers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-950 mt-2">{metrics.activeCustomers}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Ready to order</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customer Spend</span>
            <DollarSign className="w-4 h-4 text-gold-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-harmony-950 mt-2">
            {formatCurrency(metrics.totalLifetimeSpend)}
          </p>
          <span className="text-[10px] text-stone-400">Verified paid transactions</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shopper Base</span>
            <ShoppingBag className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-950 mt-2">{metrics.totalCustomers}</p>
          <span className="text-[10px] text-stone-400">Pure retail consumers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'CUSTOMER', 'STAFF', 'ADMIN'].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === rf
                  ? 'bg-harmony-900 text-gold-300 shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {rf === 'ALL' ? 'All Roles' : rf}
            </button>
          ))}
        </div>

        <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2 sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full text-xs focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            Loading customer profiles...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            No customer accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spend</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-6 text-right">Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-harmony-900 text-gold-300 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{c.name}</p>
                          <span className="text-[11px] text-stone-400 font-mono">ID: {c.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-stone-800">{c.email}</p>
                      <span className="text-[11px] text-stone-400">{c.phone || 'No phone'}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.role === 'SUPER_ADMIN'
                            ? 'bg-gold-100 text-gold-900 border border-gold-300'
                            : c.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : c.role === 'STAFF'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-stone-800">
                      {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                    </td>

                    <td className="py-4 px-4 font-bold text-harmony-950">
                      {formatCurrency(c.totalSpend)}
                    </td>

                    <td className="py-4 px-4 text-stone-400">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-harmony-900 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Privileges & Orders Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-harmony-900 text-gold-300 font-serif font-bold text-sm flex items-center justify-center">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-stone-950">{selectedCustomer.name}</h2>
                  <p className="text-[11px] text-stone-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Financial Overview */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Total Lifetime Spend</span>
                <p className="font-serif font-bold text-lg text-harmony-950">
                  {formatCurrency(selectedCustomer.totalSpend)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Orders Count</span>
                <p className="font-serif font-bold text-lg text-stone-900">
                  {selectedCustomer.totalOrders} orders
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePrivileges} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Access Privilege Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  disabled={selectedCustomer.email === 'albertaglory@harmonyhaven.com'}
                >
                  <option value="CUSTOMER">CUSTOMER (Standard Shopper)</option>
                  <option value="STAFF">STAFF (Fulfillment & Inquiries)</option>
                  <option value="ADMIN">ADMIN (Catalog & Store Manager)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Owner - Alberta Glory)</option>
                </select>
                {selectedCustomer.email === 'albertaglory@harmonyhaven.com' && (
                  <p className="text-[10px] text-gold-700 italic mt-1">
                    Primary Super Admin role is locked for system security.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  disabled={selectedCustomer.email === 'albertaglory@harmonyhaven.com'}
                >
                  <option value="ACTIVE">ACTIVE (Authorized)</option>
                  <option value="SUSPENDED">SUSPENDED (Locked Out)</option>
                </select>
              </div>

              {/* Order History Stream */}
              <div className="pt-2">
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Recent Purchase History
                </label>
                {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCustomer.recentOrders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <p className="font-mono font-bold text-stone-900">{ord.orderNumber}</p>
                          <span className="text-[10px] text-stone-400">{formatDate(ord.createdAt)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-harmony-950">{formatCurrency(ord.total)}</p>
                          <span
                            className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                              ord.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-[11px]">No orders placed yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving || selectedCustomer.email === 'albertaglory@harmonyhaven.com'}
                  className="px-6 py-2.5 rounded-xl bg-harmony-900 text-white font-bold uppercase tracking-wider text-[11px] disabled:opacity-50 shadow-md"
                >
                  {saving ? 'Updating...' : 'Save Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
