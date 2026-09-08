'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload, Heart, CheckCircle2, Calendar, Phone, User, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { compressImageFile } from '@/lib/imageCompression';

export function CustomOrderStudio() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    recipientName: '',
    occasion: 'Birthday',
    relationship: 'Best Friend',
    messageStory: '',
    preferredColors: 'Teal & Gold',
    poemTheme: 'Heartfelt Gratitude',
    tone: 'Deeply Emotional & Warm',
    requestedItems: 'Pictures & Poems (Framed)',
    deadlineDate: '',
    additionalInstructions: '',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: {
      region: 'Greater Accra',
      city: '',
      area: '',
      landmark: '',
    },
    basePrice: 160.0,
  });

  const occasions = [
    'Birthday',
    'Anniversary',
    'Appreciation & Gratitude',
    'Milestone / Graduation',
    'Apology & Reconciliation',
    'Retirement / Honor',
    'Just Because',
  ];

  const relationships = [
    'Spouse / Partner',
    'Parent (Mother / Father)',
    'Best Friend',
    'Sibling',
    'Mentor / Boss',
    'Colleague',
    'Myself (Self-Love)',
  ];

  const packages = [
    { name: 'Pictures & Poems (Framed)', price: 160.0, desc: 'Original framed bespoke poem paired with your photo' },
    { name: 'Poetic Citations (Plaque)', price: 220.0, desc: 'Engraved glass/acrylic milestone citation' },
    { name: 'Glee Box & Custom Verse', price: 250.0, desc: 'Curated luxury confectionery and handwritten poem' },
    { name: 'Girl Care / Guy Care Box', price: 320.0, desc: 'Premium pampering & wellness ensemble with poem' },
    { name: 'Poetic Candle Citations', price: 140.0, desc: 'Hand-poured soy candle with metallic gold poetic inscription' },
    { name: 'Wax-Sealed Poetic Scroll', price: 95.0, desc: 'Hand-written parchment scroll sealed with botanical wax' },
  ];

  const handlePackageSelect = (pkg: { name: string; price: number }) => {
    setFormData((prev) => ({
      ...prev,
      requestedItems: pkg.name,
      basePrice: pkg.price,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMsg('');

    try {
      let uploadFile: File = file;
      let fallbackUrl = '';

      if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name)) {
        try {
          const compressed = await compressImageFile(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
          });
          uploadFile = compressed.file;
          fallbackUrl = compressed.dataUrl;
        } catch (compErr) {
          console.warn('Compression skipped:', compErr);
        }
      }

      const data = new FormData();
      data.append('file', uploadFile);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: data,
      });

      const resText = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(resText);
      } catch {
        if (!res.ok && !fallbackUrl) {
          throw new Error('Upload server error. Please retry.');
        }
      }

      const finalUrl = json.url || fallbackUrl;
      if (!finalUrl) {
        throw new Error(json.error || 'Failed to upload photo');
      }

      setUploadedFiles((prev) => [...prev, finalUrl]);
    } catch (err: any) {
      setErrorMsg(err.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerName || !formData.customerPhone || !formData.recipientName || !formData.messageStory) {
      setErrorMsg('Please complete all required fields (Your Name, Phone, Recipient Name, and Your Story).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/custom-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          uploadedMedia: uploadedFiles,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit custom order');

      setSuccessOrderNumber(data.orderNumber);
      if (data.order) {
        try {
          sessionStorage.setItem('hh_last_order', JSON.stringify(data.order));
          sessionStorage.setItem(`hh_order_${data.order.id}`, JSON.stringify(data.order));
          localStorage.setItem(`hh_order_${data.order.id}`, JSON.stringify(data.order));
        } catch (e) {
          console.warn('Could not cache order in storage:', e);
        }
      }
      router.push(`/checkout/confirmation/${data.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-teal-100 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-harmony-900 via-harmony-950 to-stone-950 text-white p-8 sm:p-10 relative">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4U HEARTLINES PERSONALIZATION STUDIO</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
            Commission a Custom Poem & Gift
          </h2>
          <p className="text-teal-200 text-xs sm:text-sm font-light">
            Tell us your story, memories, and desired tone. Our poetic artisans craft bespoke verses and curated keepsakes tailored exclusively for your recipient.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Select Package */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
              1
            </span>
            <span>Choose Your Service or Package</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map((pkg) => {
              const isSelected = formData.requestedItems === pkg.name;
              return (
                <div
                  key={pkg.name}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-harmony-900 bg-harmony-50/50 shadow-md'
                      : 'border-stone-200 hover:border-teal-200 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">{pkg.name}</span>
                    <span className="font-bold text-xs text-harmony-950">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{pkg.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Customer & Recipient Information */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
              2
            </span>
            <span>Recipient & Occasion Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Ama Mensah"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Your WhatsApp / Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="e.g. 024 123 4567"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Recipient&apos;s Name *
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="e.g. Kojo or Mum"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Occasion *
              </label>
              <select
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
              >
                {occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Relationship to Recipient
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
              >
                {relationships.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Desired Delivery / Needed Date
              </label>
              <input
                type="date"
                value={formData.deadlineDate}
                onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Story, Tone, and Poem Theme */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
              3
            </span>
            <span>The Story & Emotional Tone</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Share Your Story, Memories & Sentiments *
              </label>
              <textarea
                required
                rows={4}
                value={formData.messageStory}
                onChange={(e) => setFormData({ ...formData, messageStory: e.target.value })}
                placeholder="Tell us what you want to express: shared memories, what makes them special, inside jokes, qualities you cherish, or specific feelings you want us to weave into the poem..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Poem Theme
                </label>
                <input
                  type="text"
                  value={formData.poemTheme}
                  onChange={(e) => setFormData({ ...formData, poemTheme: e.target.value })}
                  placeholder="e.g. Unwavering Love, Gratitude, Strength"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Desired Tone
                </label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g. Deeply Emotional, Playful, Royal"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-harmony-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Photo Attachments for Pictures & Poems */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-harmony-900 text-white text-xs flex items-center justify-center font-sans">
              4
            </span>
            <span>Upload Photo(s) (Optional for Framed Keepsakes)</span>
          </h3>

          <div className="border-2 border-dashed border-stone-300 hover:border-harmony-900 rounded-2xl p-6 text-center transition-colors">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-harmony-900">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-stone-800">
                {uploadingFile ? 'Uploading photo...' : 'Click to Upload Recipient Photo'}
              </p>
              <p className="text-[11px] text-stone-400">JPEG, PNG, or WEBP up to 10MB</p>
            </label>
          </div>

          {/* Uploaded thumbnails */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {uploadedFiles.map((url, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-teal-200 relative shadow-xs">
                  <img src={url} alt="Uploaded attachment" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-500 block">Total Package Estimate</span>
            <span className="text-2xl font-bold text-harmony-950 font-serif">
              {formatCurrency(formData.basePrice + (formData.deliveryMethod === 'DELIVERY' ? 30 : 0))}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting Custom Commission...</span>
            ) : (
              <>
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Submit & Confirm Custom Order</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
