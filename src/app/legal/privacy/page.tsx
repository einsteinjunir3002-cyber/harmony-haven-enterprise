import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Legal Documentation</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">Privacy Policy</h1>
        <p className="text-xs text-stone-500">Last updated: September 2026</p>
      </div>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 space-y-6 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">1. Information We Collect</h2>
          <p>
            Harmony Haven Enterprise respects your privacy. When you place an order for Kowah&apos;s Dishes or commission a custom 4U HEARTLINES poem or gift, we collect information including your name, email address, phone/WhatsApp number, delivery address in Ghana, and personalization stories provided for gift creation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">2. How We Use Your Information</h2>
          <p>
            We use your data strictly to fulfill your culinary and gifting orders, process secure payments, provide dispatch tracking notifications via WhatsApp/SMS, and respond to your customer service inquiries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">3. Payment & Data Security</h2>
          <p>
            We do not store your payment card numbers or Mobile Money PINs on our servers. All monetary transactions are processed through certified Ghanaian payment infrastructure with server-side HMAC encryption and cryptographic verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">4. Contact Us</h2>
          <p>
            For any privacy-related queries, please contact our administrative desk at <a href="mailto:successlight@gmail.com" className="text-harmony-900 font-semibold underline">successlight@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
