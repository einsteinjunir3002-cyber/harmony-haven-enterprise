import React from 'react';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Legal Documentation</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">Returns & Refund Policy</h1>
        <p className="text-xs text-stone-500">Last updated: September 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">1. Fresh Food & Perishables (Kowah&apos;s Dishes)</h2>
          <p>
            Due to the perishable nature of freshly simmered soups, meats, and sorrel juices, returns cannot be accepted once delivered. If your order arrives damaged or incorrect, contact us immediately via phone (024 514 7912) for a replacement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">2. Custom Personalized Items (4U HEARTLINES)</h2>
          <p>
            Personalized poetry, citations, and custom gift boxes are created specifically for your recipient. In the rare event of printing or transcription errors caused by our studio, we will reprint and reship at zero cost.
          </p>
        </section>
      </div>
    </div>
  );
}
