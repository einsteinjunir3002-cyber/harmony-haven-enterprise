import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Legal Documentation</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">Delivery & Shipping Policy</h1>
        <p className="text-xs text-stone-500">Last updated: September 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">1. Coverage Areas in Ghana</h2>
          <p>
            We deliver across Greater Accra, Tema, Spintex, Kumasi, Takoradi, Cape Coast, and nationwide across all 16 regions of Ghana via verified express courier services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">2. Dispatch Timelines</h2>
          <p>
            - Greater Accra & Tema: Same day or scheduled preferred delivery date.<br />
            - Regional Hubs (Kumasi, Takoradi, etc.): Next day express dispatch.<br />
            - Nationwide Courier: 24 to 48 hours.
          </p>
        </section>
      </div>
    </div>
  );
}
