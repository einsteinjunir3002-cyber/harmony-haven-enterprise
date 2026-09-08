'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/constants';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  personalizationJson?: string | null;
}

interface OrderHistory {
  id: string;
  toStatus: string;
  note?: string | null;
  createdAt: string | Date;
  actorName?: string | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  deliveryMethod: string;
  deliveryAddressJson?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  createdAt: string | Date;
  items: OrderItem[];
  statusHistory?: OrderHistory[];
}

export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = params.id;
    if (!orderId) {
      setLoading(false);
      return;
    }

    // 1. Check local / session storage first for immediate fallback
    let cachedOrder: OrderData | null = null;
    try {
      const cached =
        sessionStorage.getItem(`hh_order_${orderId}`) ||
        localStorage.getItem(`hh_order_${orderId}`) ||
        sessionStorage.getItem('hh_last_order');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id === orderId || parsed.orderNumber === orderId || !parsed.id)) {
          cachedOrder = parsed;
          setOrder(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('Failed reading order cache:', e);
    }

    // 2. Fetch fresh order from live server API
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found on server');
        return res.json();
      })
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          try {
            sessionStorage.setItem(`hh_order_${orderId}`, JSON.stringify(data.order));
            localStorage.setItem(`hh_order_${orderId}`, JSON.stringify(data.order));
          } catch {}
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Live order fetch notice:', err.message);
        if (!cachedOrder) {
          setLoading(false);
        }
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-harmony-50 text-harmony-900 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-xl text-stone-900">Loading your order confirmation...</h2>
        <p className="text-stone-500 text-sm">Please wait while we retrieve your order details.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
            Order Status Notice
          </h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto mt-2 leading-relaxed">
            If you just placed an order, your transaction may still be synchronizing. You can confirm your order immediately with our team on WhatsApp or check your account.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://wa.me/233245147912?text=Hello%20Harmony%20Haven!%20I%20just%20placed%20an%20order%20and%20would%20like%20to%20confirm%20my%20order%20status."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat With Us on WhatsApp</span>
          </a>

          <Link
            href="/account"
            className="px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            View My Orders
          </Link>

          <Link
            href="/order"
            className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  let deliveryAddress = null;
  if (order.deliveryAddressJson) {
    try {
      deliveryAddress = JSON.parse(order.deliveryAddressJson);
    } catch {}
  }

  const currentStatusObj =
    ORDER_STATUS_FLOW.find((s) => s.key === order.fulfillmentStatus) || ORDER_STATUS_FLOW[0];

  const isPayOnDelivery =
    order.paymentStatus === 'PAY_ON_DELIVERY' ||
    (order.internalNotes && order.internalNotes.includes('PAY_ON_DELIVERY'));

  const paymentModeLabel = isPayOnDelivery
    ? 'Payment on Delivery (MoMo on arrival)'
    : 'Pay Before Delivery (via MoMo)';

  const whatsappMessage = encodeURIComponent(
    `Hello Harmony Haven! I just placed order *${order.orderNumber}* for ${formatCurrency(
      order.total
    )}.\nName: ${order.customerName}\nPayment: ${paymentModeLabel}\nPlease confirm my order.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 block">
            Order Successfully Placed & Confirmed
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 mt-1">
            Thank You, {order.customerName ? order.customerName.split(' ')[0] : 'Valued Customer'}!
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Your order number is <span className="font-bold text-harmony-950 font-mono">{order.orderNumber}</span>
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`https://wa.me/233245147912?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notify Us On WhatsApp</span>
          </a>

          <Link
            href="/order"
            className="px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs uppercase tracking-wider transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Prominent Payment Arrangement Notice */}
      {isPayOnDelivery ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-2 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-base text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Payment on Delivery Confirmed — No Online Charge Made</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            Your order has been sent to our kitchen team and is being prepared! <strong>No MoMo prompt was sent to your phone</strong> because you selected <strong>Payment on Delivery</strong>. Please prepare <strong>{formatCurrency(order.total)}</strong> to pay our delivery rider (via MoMo or cash) upon arrival.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-base text-amber-950">
            <Smartphone className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Pay Before Delivery — MoMo Transfer Details</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            Please transfer <strong>{formatCurrency(order.total)}</strong> to complete payment for priority dispatch:
          </p>
          <div className="p-4 bg-white rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-bold">Official MoMo Number:</span>
              <span className="text-stone-900 font-mono font-bold text-base">024 514 7912</span>
              <span className="text-stone-500 block text-[11px]">(Harmony Haven Enterprise / Alberta Glory)</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider font-bold">Payment Reference:</span>
              <span className="text-harmony-950 font-mono font-bold text-base">{order.orderNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Status Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-harmony-900" />
            <span>Fulfillment Status</span>
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentStatusObj.color}`}>
            {currentStatusObj.label}
          </span>
        </div>

        {/* Timeline progression */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-stone-100">
            {order.statusHistory.map((history) => (
              <div key={history.id} className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-harmony-900 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {history.toStatus} {history.note && ` • ${history.note}`}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {formatDate(history.createdAt)} {history.actorName && `(${history.actorName})`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Purchased Items */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-harmony-900" />
            <span>Items in Order ({order.items ? order.items.length : 0})</span>
          </h3>

          <div className="space-y-3 pt-2 border-t border-stone-100">
            {order.items &&
              order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-bold text-stone-900">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-stone-500 text-[11px]">{item.variantName}</p>
                    )}
                    <p className="text-stone-400 text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-stone-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}

            <div className="pt-3 space-y-1.5 text-xs text-stone-600 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
                <span>{isPayOnDelivery ? 'Total Due on Delivery' : 'Total Paid'}</span>
                <span className="text-harmony-950 font-serif">{formatCurrency(order.total)}</span>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-harmony-950">
                  {isPayOnDelivery ? 'Payment on Delivery (MoMo)' : 'Paid Before Delivery (MoMo)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Customer Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-harmony-900" />
            <span>Delivery & Contact Details</span>
          </h3>

          <div className="space-y-3 pt-2 border-t border-stone-100 text-xs text-stone-600 leading-relaxed">
            <div>
              <span className="font-bold text-stone-800 block">Customer:</span>
              <p>{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
            </div>

            <div>
              <span className="font-bold text-stone-800 block">Payment Arrangement:</span>
              <p className="font-semibold text-harmony-900">{paymentModeLabel}</p>
              <p className="text-[11px] text-stone-400">Strictly Ghana Mobile Money (MTN, Telecel, AT)</p>
            </div>

            {deliveryAddress && (
              <div>
                <span className="font-bold text-stone-800 block">Delivery Address:</span>
                <p>{deliveryAddress.area}, {deliveryAddress.city} ({deliveryAddress.region})</p>
                {deliveryAddress.landmark && (
                  <p className="text-stone-500">Landmark: {deliveryAddress.landmark}</p>
                )}
                {deliveryAddress.digitalAddress && (
                  <p className="text-stone-500">GPS: {deliveryAddress.digitalAddress}</p>
                )}
              </div>
            )}

            {order.notes && (
              <div>
                <span className="font-bold text-stone-800 block">Order Notes:</span>
                <p className="italic text-stone-500">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
