'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Folder, Check, Trash2, Copy, Sparkles, AlertCircle } from 'lucide-react';

export default function SunflowerMediaPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const sunflowerFolders = [
    { name: 'ALL', label: 'All Sunflower Media' },
    { name: 'KOWAHS_DISHES', label: "Kowah's Dishes" },
    { name: '4U_HEARTLINES', label: '4U Heartlines' },
    { name: 'BRANDING', label: 'Branding & Logos' },
    { name: 'FOUNDER', label: 'Founder Alberta Glory' },
    { name: 'UPLOADS', label: 'Uploads' },
  ];

  // 25 client photos plus founder portrait
  const staticMediaList = [
    // Branding & Identity
    { id: '1', title: 'Harmony Haven Enterprise Corporate Logo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM.jpeg', category: 'BRANDING' },
    { id: '2', title: "Kowah's Dishes Official Logo", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.23 PM (1).jpeg', category: 'BRANDING' },
    { id: '3', title: '4U HEARTLINES Official Logo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.14.22 PM.jpeg', category: 'BRANDING' },
    // Kowah's Dishes Culinary & Beverages
    { id: '4', title: "Kowah's Dishes Official Menu Flyer", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '5', title: 'Savory Bowl - Rich Beef Stew Pot', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.18.38 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '6', title: 'Savory Bowl - Ghanaian Spiced Light Soup', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.19.28 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '7', title: 'Savory Bowl - Beef & Fresh Vegetable Stew', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '8', title: 'Hot Box - Sizzling Peppered Beef Medley', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.21.06 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '9', title: 'Hot Box - Seasoned Grilled Meat Chunks Platter', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '10', title: 'Fruity Sorrel Juice (Sobolo) Poster', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.23.34 PM.jpeg', category: 'KOWAHS_DISHES' },
    { id: '11', title: 'Homedine Shito - Black & Green Pepper Jars', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg', category: 'KOWAHS_DISHES' },
    // 4U Heartlines - Verse & Velvet Gift Boxes
    { id: '12', title: '4U Heartlines Package Flyer', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '13', title: 'Verse & Velvet - Girl Care Luxury Gift Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.59 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '14', title: 'Executive Appreciation - Gold Embossed Journal Suite', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM (1).jpeg', category: '4U_HEARTLINES' },
    { id: '15', title: 'Verse & Velvet - Guy Care Luxury Gift Box', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.25.52 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '16', title: 'Executive Cream Journal & Citation Scroll Set', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.29.27 PM.jpeg', category: '4U_HEARTLINES' },
    // 4U Heartlines - Ink & Emotion Poems, Keepsakes & Citations
    { id: '17', title: 'Pictures & Poems - Tabletop Framed Poem & Photo', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.27.18 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '18', title: "Poetic Keepsake Tag - Winter's Embrace", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.30.14 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '19', title: 'Poetic Candle Citation - Burning Soy Tumbler', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.30.55 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '20', title: 'Poetic Memos - Hardbound Gold-Foil Keepsake Booklet', url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.45.38 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '21', title: "Wax-Sealed Love Letters - 'To that person I like' by Kowah", url: '/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '22', title: "Pictures & Poems - 'Heart lines to my forever person'", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.00.28 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '23', title: "Celebration Keepsake - 'Best friends forever'", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.07.34 PM.jpeg', category: '4U_HEARTLINES' },
    { id: '24', title: "Pictures & Poems - 'when you cloud my thoughts' Album", url: '/images/gallery/WhatsApp Image 2026-09-03 at 11.07.35 PM.jpeg', category: '4U_HEARTLINES' },
    // Founder Portrait
    { id: '25', title: 'Founder Portrait - Alberta Glory', url: '/images/gallery/alberta-glory-founder.jpg', category: 'FOUNDER' },
  ];

  const [items, setItems] = useState(staticMediaList);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.media && data.media.length > 0) {
        // Merge DB media with any static entries not yet in DB
        const dbUrls = new Set(data.media.map((m: any) => m.url));
        const missingStatic = staticMediaList.filter((s) => !dbUrls.has(s.url));
        setItems([...data.media, ...missingStatic]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

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

      // Save to media database
      await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          url: json.url,
          category: 'UPLOADS',
        }),
      });

      setItems((prev) => [
        { id: Date.now().toString(), title: file.name, url: json.url, category: 'UPLOADS' },
        ...prev,
      ]);
      setMessage('Photo uploaded and saved to Sunflower Media!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Are you sure you want to remove "${item.title}" from media gallery?`)) return;

    try {
      await fetch(`/api/admin/media?id=${item.id}&url=${encodeURIComponent(item.url)}`, {
        method: 'DELETE',
      });
      setItems((prev) => prev.filter((i) => i.url !== item.url));
      setMessage('Asset removed from media gallery.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Delete failed');
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
            All brand graphics, culinary photography, client commissions, and marketing assets organized in Sunflower Media.
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
            <span>{uploading ? 'Saving to Sunflower Media...' : 'Upload New Photo'}</span>
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
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs group hover:shadow-md transition-shadow flex flex-col justify-between"
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

              {/* Action Overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopyUrl(m.url)}
                  className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-gold-500 hover:text-stone-950 text-white transition-colors"
                  title="Copy Image URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(m)}
                  className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-rose-600 text-white transition-colors"
                  title="Remove from Media Hub"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <p className="font-bold text-stone-900 text-xs truncate" title={m.title}>
                {m.title}
              </p>
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span className="truncate max-w-[140px] font-mono">{m.url}</span>
                {copiedUrl === m.url ? (
                  <span className="text-emerald-600 font-bold">Copied!</span>
                ) : (
                  <button
                    onClick={() => handleCopyUrl(m.url)}
                    className="text-stone-500 hover:text-harmony-900 font-semibold"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
