'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, GHANA_REGIONS } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: 'Greater Accra',
    city: '',
    area: '',
    digitalAddress: '',
    landmark: '',
    instructions: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/delivery-zones')
      .then((res) => res.json())
      .then((data) => {
        if (data.zones && data.zones.length > 0) {
          setDeliveryZones(data.zones);
          setSelectedZoneId(data.zones[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = deliveryMethod === 'DELIVERY' ? selectedZone?.fee || 25.0 : 0.0;
  const finalTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg('Please complete your name, email and phone number.');
      return;
    }

    if (deliveryMethod === 'DELIVERY' && (!formData.city || !formData.area)) {
      setErrorMsg('Please provide your delivery city/town and area.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server (authoritatively recalculates prices from DB)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            personalization: i.personalization,
          })),
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          deliveryMethod,
          deliveryZoneId: selectedZoneId,
          deliveryAddress: {
            region: formData.region,
            city: formData.city,
            area: formData.area,
            digitalAddress: formData.digitalAddress,
            landmark: formData.landmark,
            instructions: formData.instructions,
          },
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          notes: formData.notes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const orderId = orderData.order.id;

      // 2. Process / Verify payment with gateway reference
      const reference = `T${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          orderId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification encountered an issue');
      }

      // 3. Cache confirmed order details in storage for instantaneous, reliable receipt display
      if (orderData.order) {
        try {
          sessionStorage.setItem('hh_last_order', JSON.stringify(orderData.order));
          sessionStorage.setItem(`hh_order_${orderId}`, JSON.stringify(orderData.order));
          localStorage.setItem(`hh_order_${orderId}`, JSON.stringify(orderData.order));
        } catch (e) {
          console.warn('Could not cache order in storage:', e);
        }
      }

      // 4. Clear cart and navigate to confirmation page
      clearCart();
      router.push(`/checkout/confirmation/${orderId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing checkout.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-bold text-2xl text-stone-900">Your bag is empty</h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Please select your favorite meals or personalized gifts before checking out.
        </p>
        <Link
          href="/order"
          className="inline-block px-8 py-3.5 bg-harmony-900 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md"
        >
          Return to Menu & Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure Encrypted Checkout</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">
          Complete Your Order
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-10">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Contact */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
                1
              </span>
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kwesi Mensah"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. kwesi@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 024 514 7912"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery vs Pickup & Ghana Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
                2
              </span>
              <span>Delivery & Fulfillment Method</span>
            </h2>

            {/* Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('DELIVERY')}
                className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  deliveryMethod === 'DELIVERY'
                    ? 'bg-harmony-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Doorstep Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('PICKUP')}
                className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  deliveryMethod === 'PICKUP'
                    ? 'bg-harmony-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Local Pickup</span>
              </button>
            </div>

            {deliveryMethod === 'DELIVERY' ? (
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Select Delivery Zone in Ghana *
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
                  >
                    {deliveryZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({formatCurrency(z.fee)}) &bull; {z.estimatedTime}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required={deliveryMethod === 'DELIVERY'}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Kumasi, Cape Coast, or Accra"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Area / Neighborhood *
                    </label>
                    <input
                      type="text"
                      required={deliveryMethod === 'DELIVERY'}
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. East Legon, Spintex, Ahodwo"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      GhanaPost Digital Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.digitalAddress}
                      onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value })}
                      placeholder="e.g. GA-123-4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Prominent Landmark & Specific Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="e.g. Opposite Shell Station, 2nd yellow house on the right"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-800">Pickup Location:</p>
                <p>Harmony Haven Hub, Greater Accra | Phone: 024 514 7912</p>
                <p className="text-stone-500">We will notify you on WhatsApp as soon as your order is packaged and ready for collection.</p>
              </div>
            )}
          </div>

          {/* Section 3: Payment Options (Ghana MoMo / Cards) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
                3
              </span>
              <span>Payment Method</span>
            </h2>

            <div className="p-4 rounded-2xl border-2 border-harmony-900 bg-harmony-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-harmony-900" />
                  <span className="font-bold text-sm text-stone-900">
                    Ghana Mobile Money / Visa / Mastercard
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Paystack Verified
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Supports MTN Mobile Money, Telecel Cash, AT Money, and local debit/credit cards. Fast, safe and instantaneous confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
            <h2 className="font-serif font-bold text-xl text-stone-950 pb-4 border-b border-stone-100">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg'}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                      <p className="text-stone-400 text-[11px]">
                        Qty: {item.quantity} {item.variantName && `&bull; ${item.variantName}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({deliveryMethod === 'DELIVERY' ? selectedZone?.name || 'Accra' : 'Pickup'})</span>
                <span className="font-bold text-stone-900">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 pt-3 border-t border-stone-200">
                <span>Total Due</span>
                <span className="text-xl text-harmony-950 font-serif">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Securing & Placing Order...</span>
              ) : (
                <>
                  <span>Pay & Confirm Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Ghanaian Culinary & Gifting Guarantee</span>
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
