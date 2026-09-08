import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Legal Documentation</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">Terms & Conditions</h1>
        <p className="text-xs text-stone-500">Last updated: September 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or ordering from Harmony Haven Enterprise, Kowah&apos;s Dishes, or 4U HEARTLINES, you agree to comply with these terms of service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">2. Made-to-Order & Custom Items</h2>
          <p>
            Meals from Kowah&apos;s Dishes and bespoke poems/citations from 4U HEARTLINES are crafted fresh upon order confirmation. Please ensure delivery dates and recipient details are accurate during submission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">3. Delivery & Dispatch</h2>
          <p>
            Delivery times are subject to Ghanaian traffic and logistics timelines. We provide live status updates to ensure transparent arrival.
          </p>
        </section>
      </div>
    </div>
  );
}
