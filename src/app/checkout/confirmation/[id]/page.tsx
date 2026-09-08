import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate, ORDER_STATUS_FLOW } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      payments: true,
      customRequest: true,
    },
  });

  if (!order) {
    notFound();
  }

  let deliveryAddress = null;
  if (order.deliveryAddressJson) {
    try {
      deliveryAddress = JSON.parse(order.deliveryAddressJson);
    } catch {}
  }

  const currentStatusObj =
    ORDER_STATUS_FLOW.find((s) => s.key === order.fulfillmentStatus) || ORDER_STATUS_FLOW[0];

  const whatsappMessage = encodeURIComponent(
    `Hello Harmony Haven! I just placed order *${order.orderNumber}* for ${formatCurrency(
      order.total
    )}. Name: ${order.customerName}. Please confirm my order status.`
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
            Thank You, {order.customerName.split(' ')[0]}!
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
        <div className="space-y-4 pt-2 border-t border-stone-100">
          {order.statusHistory.map((history, i) => (
            <div key={history.id} className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-harmony-900 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {history.toStatus} {history.note && `&bull; ${history.note}`}
                </p>
                <p className="text-[11px] text-stone-400">
                  {formatDate(history.createdAt)} {history.actorName && `(${history.actorName})`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Purchased Items */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-harmony-900" />
            <span>Items in Order ({order.items.length})</span>
          </h3>

          <div className="space-y-3 pt-2 border-t border-stone-100">
            {order.items.map((item) => (
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
                <span>Total Paid</span>
                <span className="text-harmony-950 font-serif">{formatCurrency(order.total)}</span>
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
