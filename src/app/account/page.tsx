'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Package, 
  Clock, 
  LogOut, 
  ChevronRight, 
  ShoppingBag, 
  Camera, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  Settings,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isLoading, refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchParams?.get('tab') === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/account/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');

      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [user, isLoading, router]);

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSaveError('Photo is too large. Please select a photo under 10MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `${user?.name || 'User'} Profile Photo`);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      setAvatar(data.url);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Could not upload photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          avatar: avatar.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative group">
            {avatar || user.avatar ? (
              <img
                src={avatar || user.avatar || ''}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gold-400 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-harmony-900 text-gold-400 flex items-center justify-center font-serif font-bold text-2xl sm:text-3xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-harmony-900 hover:bg-harmony-950 text-gold-400 rounded-full shadow-md border-2 border-white dark:border-stone-900 transition-transform hover:scale-110"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-950 dark:text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                Verified Member
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {user.email} {user.phone ? `• ${user.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'profile' ? 'orders' : 'profile')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-harmony-900 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{activeTab === 'profile' ? 'View Orders' : 'Profile Settings'}</span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-stone-200 dark:border-stone-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-harmony-900 text-harmony-900 dark:border-gold-400 dark:text-gold-400'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-harmony-900 text-harmony-900 dark:border-gold-400 dark:text-gold-400'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab 1: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-8 shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-950 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-harmony-900 dark:text-gold-400" />
              <span>Personal Information & Photo</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Add your profile photo and update your contact details easily.
            </p>
          </div>

          {/* Success / Error Alerts */}
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Profile updated successfully! Your photo and details are now saved.</span>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Section A: Profile Photo Picker & Upload */}
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Your Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Avatar Preview */}
                <div className="relative shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gold-400 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-harmony-900 text-gold-400 flex items-center justify-center font-serif font-bold text-3xl shadow-md">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
                    </div>
                  )}
                </div>

                {/* Upload & Actions */}
                <div className="space-y-3 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-harmony-900 hover:bg-harmony-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-gold-400" />
                      )}
                      <span>Upload Photo</span>
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="px-3 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Upload any photo from your phone or computer (JPG, PNG, WebP, GIF up to 10MB).
                  </p>

                  {/* Direct Image URL input */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                      Or paste an online photo web address (URL):
                    </label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-harmony-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-harmony-900"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-harmony-900"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Used by our delivery team to reach you for order updates.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/70 text-stone-500 dark:text-stone-400 cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Your registered account email address cannot be changed.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                ) : (
                  <Check className="w-4 h-4 text-gold-400" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-2xl text-stone-950 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-harmony-900 dark:text-gold-400" />
              <span>Your Order History ({orders.length})</span>
            </h2>
            <Link
              href="/order"
              className="text-xs font-bold uppercase tracking-wider text-harmony-900 dark:text-gold-400 hover:underline"
            >
              Browse Menu & Products &rarr;
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3 shadow-xs">
              <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">No orders placed yet</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Treat yourself to delicious dishes from Kowah&apos;s Dishes or custom poems from 4U HEARTLINES.
              </p>
              <Link
                href="/order"
                className="inline-block px-6 py-2.5 bg-harmony-900 text-white rounded-full text-xs font-bold uppercase tracking-wider mt-2 shadow-xs hover:shadow-md transition-all"
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
                    className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-sm text-stone-950 dark:text-white">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                        <span className="text-xs text-stone-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}: </span>
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {order.items.map((i: any) => i.productName).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100 dark:border-stone-800">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
                        <span className="text-base font-bold text-harmony-950 dark:text-gold-400 font-serif">
                          {formatCurrency(order.total)}
                        </span>
                      </div>

                      <Link
                        href={`/checkout/confirmation/${order.id}`}
                        className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-harmony-900 hover:text-white dark:hover:bg-gold-500 dark:hover:text-stone-950 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
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
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Loading your profile...</p>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
