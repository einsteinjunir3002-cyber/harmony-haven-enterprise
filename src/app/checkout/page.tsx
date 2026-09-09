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
  Smartphone,
  Banknote,
  Check,
  Loader2,
  X,
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
  const [paymentTiming, setPaymentTiming] = useState<'PAY_BEFORE_DELIVERY' | 'PAY_ON_DELIVERY'>('PAY_BEFORE_DELIVERY');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'TELECEL' | 'AT'>('MTN');
  const [momoPhone, setMomoPhone] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Mobile Money USSD Prompt Modal state
  const [momoModalData, setMomoModalData] = useState<{
    active: boolean;
    orderId: string;
    orderNumber: string;
    reference: string;
    phone: string;
    network: 'MTN' | 'TELECEL' | 'AT';
    amount: number;
    displayText?: string;
    simulated?: boolean;
    status: 'waiting' | 'approved' | 'failed';
    errorMessage?: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(60);

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
      setMomoPhone((prev) => prev || user.phone || '');
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

  // Real-time polling effect to detect when the customer inputs their MoMo PIN on their phone
  useEffect(() => {
    if (!momoModalData?.active || momoModalData.status !== 'waiting') return;

    setCountdown(60);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/momo/status?reference=${encodeURIComponent(momoModalData.reference)}&orderId=${encodeURIComponent(momoModalData.orderId)}`
        );
        const data = await res.json();
        if (data.paid || data.status === 'success') {
          clearInterval(interval);
          setMomoModalData((prev) => (prev ? { ...prev, status: 'approved' } : null));
          clearCart();
          setTimeout(() => {
            router.push(`/checkout/confirmation/${momoModalData.orderId}`);
          }, 1800);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setMomoModalData((prev) => (prev ? { ...prev, status: 'failed', errorMessage: data.message } : null));
        }
      } catch (pollErr) {
        console.warn('MoMo status polling notice:', pollErr);
      }
    }, 3000);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [momoModalData?.active, momoModalData?.status, momoModalData?.reference, momoModalData?.orderId, clearCart, router]);

  // Handle simulated PIN approval for testing
  const handleSimulatePinApproval = async () => {
    if (!momoModalData) return;
    try {
      const res = await fetch('/api/payments/momo/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: momoModalData.reference,
          orderId: momoModalData.orderId,
          simulateApproval: true,
        }),
      });
      const data = await res.json();
      if (data.success || data.paid) {
        setMomoModalData((prev) => (prev ? { ...prev, status: 'approved' } : null));
        clearCart();
        setTimeout(() => {
          router.push(`/checkout/confirmation/${momoModalData.orderId}`);
        }, 1800);
      }
    } catch (e: any) {
      console.error('Simulate PIN error:', e);
    }
  };

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
          paymentTiming,
          paymentMethod: 'MOMO',
          momoNetwork,
          momoPhone: momoPhone || formData.phone,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const orderId = orderData.order.id;

      // 2. If paying before delivery via MoMo, trigger live USSD prompt to customer's phone
      if (paymentTiming === 'PAY_BEFORE_DELIVERY') {
        const chargeRes = await fetch('/api/payments/momo/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            phone: momoPhone || formData.phone,
            network: momoNetwork,
          }),
        });

        const chargeData = await chargeRes.json();
        if (!chargeRes.ok) {
          throw new Error(chargeData.error || 'Failed to trigger Mobile Money prompt on your phone.');
        }

        // Cache order data for receipt
        if (orderData.order) {
          try {
            sessionStorage.setItem('hh_last_order', JSON.stringify(orderData.order));
            sessionStorage.setItem(`hh_order_${orderId}`, JSON.stringify(orderData.order));
            localStorage.setItem(`hh_order_${orderId}`, JSON.stringify(orderData.order));
          } catch (e) {}
        }

        // Open live USSD push prompt modal on screen
        setMomoModalData({
          active: true,
          orderId,
          orderNumber: orderData.order.orderNumber,
          reference: chargeData.reference,
          phone: momoPhone || formData.phone,
          network: momoNetwork,
          amount: orderData.order.total,
          displayText: chargeData.displayText,
          simulated: chargeData.simulated,
          status: 'waiting',
        });
        setIsProcessing(false);
        return;
      }

      // 3. For Payment on Delivery: Cache confirmed order details in storage
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

          {/* Section 3: Payment Arrangement & Strictly Mobile Money */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
                  3
                </span>
                <span>Payment Arrangement</span>
              </h2>

              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300/60">
                Ghana MoMo Strictly
              </span>
            </div>

            {/* Timing Selector Cards: Pay Before Delivery vs Payment on Delivery */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Choose Payment Option *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Pay Before Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentTiming('PAY_BEFORE_DELIVERY')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                    paymentTiming === 'PAY_BEFORE_DELIVERY'
                      ? 'border-harmony-900 bg-harmony-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        paymentTiming === 'PAY_BEFORE_DELIVERY' ? 'bg-harmony-900 text-gold-400' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">Pay Before Delivery</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
                          Instant MoMo Transfer
                        </span>
                      </div>
                    </div>
                    {paymentTiming === 'PAY_BEFORE_DELIVERY' && (
                      <div className="w-5 h-5 rounded-full bg-harmony-900 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Make your Mobile Money payment before dispatch. Fast and seamless priority packaging.
                  </p>
                </button>

                {/* Option B: Payment on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentTiming('PAY_ON_DELIVERY')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                    paymentTiming === 'PAY_ON_DELIVERY'
                      ? 'border-harmony-900 bg-harmony-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        paymentTiming === 'PAY_ON_DELIVERY' ? 'bg-harmony-900 text-gold-400' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-stone-900">Payment on Delivery</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          MoMo on Arrival
                        </span>
                      </div>
                    </div>
                    {paymentTiming === 'PAY_ON_DELIVERY' && (
                      <div className="w-5 h-5 rounded-full bg-harmony-900 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Pay our rider via Mobile Money when your package arrives at your doorstep in Kumasi, Cape Coast, or Accra.
                  </p>
                </button>
              </div>

              {/* Instant Clarification Box on Selected Timing */}
              {paymentTiming === 'PAY_ON_DELIVERY' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Payment on Delivery Selected — No Online MoMo Prompt</span>
                  </div>
                  <p className="leading-relaxed text-emerald-800">
                    <strong>Notice:</strong> No payment prompt will be sent to your phone right now. Your order is confirmed immediately so the kitchen can prepare it. You will pay <strong>{formatCurrency(finalTotal)}</strong> to the dispatch rider (via MoMo or cash) when your order reaches your doorstep.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Pay Before Delivery Selected</span>
                  </div>
                  <p className="leading-relaxed text-amber-800">
                    Your order will be prepared and prioritized once your Mobile Money payment of <strong>{formatCurrency(finalTotal)}</strong> is confirmed. You can transfer directly to our merchant number (<strong>024 514 7912</strong>) using your order number as reference.
                  </p>
                </div>
              )}
            </div>

            {/* Strict MoMo Network Selector */}
            <div className="pt-2 border-t border-stone-100 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Your MoMo Network *
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { key: 'MTN', name: 'MTN MoMo', color: 'border-amber-400 text-amber-900 bg-amber-50' },
                    { key: 'TELECEL', name: 'Telecel Cash', color: 'border-rose-400 text-rose-900 bg-rose-50' },
                    { key: 'AT', name: 'AT Money', color: 'border-blue-400 text-blue-900 bg-blue-50' },
                  ].map((net) => (
                    <button
                      key={net.key}
                      type="button"
                      onClick={() => setMomoNetwork(net.key as any)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                        momoNetwork === net.key
                          ? `${net.color} border-current shadow-xs`
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <span>{net.name}</span>
                      {momoNetwork === net.key && <Check className="w-3 h-3 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Your MoMo Registered Number
                </label>
                <input
                  type="tel"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="e.g. 024 514 7912"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  The Mobile Money phone number our team or dispatch rider should verify with.
                </p>
              </div>

              {/* Official Store MoMo Account Details */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Smartphone className="w-4 h-4 text-harmony-900" />
                  <span>Harmony Haven Official MoMo Account</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-stone-200/60">
                  <div>
                    <span className="text-stone-400 block">MoMo Number:</span>
                    <span className="font-bold font-mono text-stone-900 text-xs">024 514 7912</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Account Name:</span>
                    <span className="font-bold text-stone-900">Harmony Haven Enterprise</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 pt-1">
                  {paymentTiming === 'PAY_ON_DELIVERY'
                    ? 'Upon delivery, you will transfer your order total directly to this merchant number or the rider.'
                    : 'You may complete your MoMo payment using this merchant number upon order placement.'}
                </p>
              </div>
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
                        Qty: {item.quantity} {item.variantName && `• ${item.variantName}`}
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

              {/* Payment Arrangement Summary Badge */}
              <div className="p-2.5 rounded-xl bg-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-700 mt-2">
                <span>Payment Arrangement:</span>
                <span className="font-bold text-harmony-950">
                  {paymentTiming === 'PAY_ON_DELIVERY' ? 'Payment on Delivery (MoMo)' : 'Pay Before Delivery (MoMo)'}
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
                <span>Confirming & Placing Order...</span>
              ) : (
                <>
                  <span className="text-center">
                    {paymentTiming === 'PAY_ON_DELIVERY'
                      ? `Confirm Order (Pay ${formatCurrency(finalTotal)} on Delivery)`
                      : `Place Order & Pay via MoMo (${formatCurrency(finalTotal)})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {paymentTiming === 'PAY_ON_DELIVERY' && (
              <p className="text-[11px] text-center text-emerald-800 font-medium">
                ✨ No money deducted now &bull; You will pay the rider upon delivery
              </p>
            )}

            <div className="text-center pt-2">
              <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Ghanaian Culinary & Gifting Guarantee</span>
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Real-Time Mobile Money USSD Push Prompt Modal */}
      {momoModalData?.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-2.5 ${
                momoModalData.network === 'MTN'
                  ? 'bg-amber-400'
                  : momoModalData.network === 'TELECEL'
                  ? 'bg-rose-600'
                  : 'bg-blue-600'
              }`}
            />

            {/* Waiting State: Prompt Sent, waiting for PIN */}
            {momoModalData.status === 'waiting' && (
              <div className="text-center space-y-5">
                {/* Animated Pulsing Phone Icon */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                      momoModalData.network === 'MTN'
                        ? 'bg-amber-400'
                        : momoModalData.network === 'TELECEL'
                        ? 'bg-rose-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md relative z-10 ${
                      momoModalData.network === 'MTN'
                        ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-100'
                        : momoModalData.network === 'TELECEL'
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                        : 'bg-blue-600 text-white ring-4 ring-blue-100'
                    }`}
                  >
                    <Smartphone className="w-8 h-8 animate-bounce" />
                  </div>
                </div>

                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      momoModalData.network === 'MTN'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : momoModalData.network === 'TELECEL'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {momoModalData.network} MoMo USSD Prompt Sent
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                    Check Your Phone Screen!
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    An authorization prompt has been sent to{' '}
                    <strong className="text-stone-900 font-mono text-sm">{momoModalData.phone}</strong>.
                  </p>
                </div>

                {/* Amount Pill */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">Amount to Authorize:</span>
                  <span className="text-xl font-bold font-serif text-harmony-950">
                    {formatCurrency(momoModalData.amount)}
                  </span>
                </div>

                {/* Radar Polling Status */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-harmony-900 bg-harmony-50 py-2.5 px-4 rounded-xl border border-harmony-200/60">
                  <Loader2 className="w-4 h-4 animate-spin text-harmony-900" />
                  <span>Waiting for your PIN input on your phone ({countdown}s)...</span>
                </div>

                {/* USSD Fallback Accordion / Instructions */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>💡 Prompt didn't appear automatically on your screen?</span>
                  </p>
                  {momoModalData.network === 'MTN' && (
                    <p className="leading-relaxed">
                      Dial <strong>*170#</strong> &rarr; Option <strong>6</strong> (My Wallet) &rarr; Option <strong>3</strong> (My Approvals) &rarr; Enter MoMo PIN to authorize.
                    </p>
                  )}
                  {momoModalData.network === 'TELECEL' && (
                    <p className="leading-relaxed">
                      Dial <strong>*110#</strong> &rarr; Option <strong>4</strong> (My Account) &rarr; Option <strong>5</strong> (Pending Approvals) &rarr; Enter Cash PIN.
                    </p>
                  )}
                  {momoModalData.network === 'AT' && (
                    <p className="leading-relaxed">
                      Dial <strong>*110#</strong> and check your Pending Approvals to authorize.
                    </p>
                  )}
                </div>

                {/* Simulated Approval for Testing / Placeholder Mode */}
                {momoModalData.simulated && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSimulatePinApproval}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Simulate Phone PIN Approval (Test Mode)</span>
                    </button>
                    <p className="text-[10px] text-stone-400 mt-1">
                      (Click to simulate successful PIN input on this test order)
                    </p>
                  </div>
                )}

                {/* Cancel / Switch Option */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMomoModalData(null)}
                    className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                  >
                    Close Window
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMomoModalData(null);
                      setPaymentTiming('PAY_ON_DELIVERY');
                    }}
                    className="text-xs text-harmony-900 hover:underline font-bold"
                  >
                    Switch to Payment on Delivery
                  </button>
                </div>
              </div>
            )}

            {/* Approved State */}
            {momoModalData.status === 'approved' && (
              <div className="text-center space-y-4 py-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl text-stone-900">
                    Payment Approved!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 font-medium">
                    Your Mobile Money payment of {formatCurrency(momoModalData.amount)} was verified.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center justify-center gap-2 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Finalizing your receipt and alerting admin...</span>
                </div>
              </div>
            )}

            {/* Failed State */}
            {momoModalData.status === 'failed' && (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900">
                    Prompt Timed Out or Declined
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {momoModalData.errorMessage || 'The authorization was cancelled on the phone or timed out.'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMomoModalData((prev) => (prev ? { ...prev, status: 'waiting' } : null))}
                    className="flex-1 py-2.5 rounded-xl bg-harmony-900 text-white text-xs font-bold"
                  >
                    Retry Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMomoModalData(null);
                      setPaymentTiming('PAY_ON_DELIVERY');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                  >
                    Pay on Delivery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
