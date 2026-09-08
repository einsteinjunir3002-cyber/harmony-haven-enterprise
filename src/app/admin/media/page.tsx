'use client';

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, Plus, Folder, Check, AlertCircle } from 'lucide-react';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [message, setMessage] = useState('');

  const sunflowerFolders = [
    { name: 'ALL', label: 'All Media Assets' },
    { name: 'BRANDING', label: 'Sunflower Media/branding' },
    { name: 'HARMONY_HAVEN', label: 'Sunflower Media/harmony-haven' },
    { name: 'KOWAHS_DISHES', label: 'Sunflower Media/kowahs-dishes' },
    { name: '4U_HEARTLINES', label: 'Sunflower Media/4u-heartlines' },
    { name: 'PRODUCTS', label: 'Sunflower Media/products' },
    { name: 'GALLERY', label: 'Sunflower Media/gallery' },
    { name: 'FOUNDER', label: 'Sunflower Media/founder' },
    { name: 'UPLOADS', label: 'Sunflower Media/uploads' },
  ];

  // Initial list seeded from the 25 client photos
  const staticMediaList = [
    { title: 'Kowah Savory Soup Pot', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg', category: 'KOWAHS_DISHES' },
    { title: 'Kowah Hot Box Assorted Meats', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg', category: 'KOWAHS_DISHES' },
    { title: 'Fruity Sorrel Juice Bottle', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg', category: 'KOWAHS_DISHES' },
    { title: 'Rich Ghanaian Shito Jar', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg', category: 'KOWAHS_DISHES' },
    { title: '4U Heartlines Luxury Glee Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg', category: '4U_HEARTLINES' },
    { title: '4U Heartlines Pamper Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg', category: '4U_HEARTLINES' },
    { title: '4U Heartlines Poetic Candle', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg', category: '4U_HEARTLINES' },
    { title: '4U Heartlines Framed Poem Citation', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg', category: '4U_HEARTLINES' },
    { title: 'Founder Portrait - Alberta Glory', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg', category: 'FOUNDER' },
    { title: 'Special Day Box Gifting Ensemble', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg', category: '4U_HEARTLINES' },
    { title: 'Pictures & Poems Keepsake Plaque', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg', category: '4U_HEARTLINES' },
    { title: 'Artisanal Snack Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg', category: '4U_HEARTLINES' },
  ];

  const [items, setItems] = useState(staticMediaList);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setItems((prev) => [
        { title: file.name, url: json.url, category: 'UPLOADS' },
        ...prev,
      ]);
      setMessage('File saved to Sunflower Media/uploads and web assets!');
    } catch (err: any) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = selectedCategory === 'ALL'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Central Repository
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Sunflower Media Hub
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            All brand graphics, product photography, and customer commissions organized in Sunflower Media.
          </p>
        </div>

        <div>
          <input
            type="file"
            id="media-upload-input"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <label
            htmlFor="media-upload-input"
            className="cursor-pointer px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Saving to Sunflower Media...' : 'Upload New Asset'}</span>
          </label>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Folder Category Pills */}
      <div className="flex flex-wrap gap-2">
        {sunflowerFolders.map((f) => (
          <button
            key={f.name}
            onClick={() => setSelectedCategory(f.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedCategory === f.name
                ? 'bg-harmony-900 text-gold-300 shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-gold-600" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((m, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs group hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-stone-100 relative overflow-hidden">
              <img
                src={m.url}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                {m.category}
              </span>
            </div>
            <div className="p-3">
              <p className="font-bold text-stone-900 text-xs truncate">{m.title}</p>
              <p className="text-[10px] text-stone-400 truncate mt-0.5">{m.url}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
