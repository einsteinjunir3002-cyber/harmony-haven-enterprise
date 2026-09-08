'use client';

import React, { useState } from 'react';
import { Handshake, Building, Gift, Utensils, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export default function PartnershipsPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    partnershipType: 'Corporate Gifting',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const partnershipTypes = [
    'Corporate Gifting & Care Packages',
    'Event Catering & Family Pots',
    'Brand Collaboration & Co-Marketing',
    'Wholesale Distribution (Shito & Sorrel)',
    'Milestone Citations & Recognition Awards',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Partnership: ${formData.partnershipType} (${formData.organization})`,
          message: formData.message,
          isPartnership: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit partnership request');

      setIsSuccess(true);
      setFormData({ name: '', organization: '', email: '', phone: '', partnershipType: 'Corporate Gifting', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider">
          <Handshake className="w-3.5 h-3.5" />
          <span>Strategic Collaborations</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">
          Partner With Harmony Haven Enterprise
        </h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto">
          We collaborate with corporate organizations, event planners, hospitality venues, and creative agencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <Gift className="w-6 h-6 text-harmony-900" />
          <h3 className="font-serif font-bold text-base text-stone-900">Corporate Gifting</h3>
          <p className="text-xs text-stone-500 leading-relaxed font-light">
            Bespoke executive gift boxes, employee milestone appreciation hampers, and customized wax-sealed poetic citations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <Utensils className="w-6 h-6 text-kowah-900" />
          <h3 className="font-serif font-bold text-base text-stone-900">Event & Retreat Catering</h3>
          <p className="text-xs text-stone-500 leading-relaxed font-light">
            Bulk orders of signature soups, assorted meat boxes, and cold brewed spiced sorrel dispensers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <Building className="w-6 h-6 text-gold-600" />
          <h3 className="font-serif font-bold text-base text-stone-900">Wholesale Distribution</h3>
          <p className="text-xs text-stone-500 leading-relaxed font-light">
            Supply jars of premium Ghanaian shito and sorrel juice bottles to retail outlets and supermarkets.
          </p>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif font-bold text-2xl text-stone-950">Partnership Inquiry Form</h2>
          <p className="text-xs text-stone-500 mt-1">
            Share details about your organization and how you would like to collaborate.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-emerald-950">Inquiry Submitted!</h3>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Thank you for your interest in partnering with Harmony Haven Enterprise. Our partnerships director will connect with you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sandra Appiah"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Apex Innovations Ltd"
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
                  placeholder="e.g. sandra@apexinnovations.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 024 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Area of Collaboration *
                </label>
                <select
                  value={formData.partnershipType}
                  onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
                >
                  {partnershipTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Project Description & Requirements *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide estimated quantities, dates, or specifications for your collaboration..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Partnership Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
