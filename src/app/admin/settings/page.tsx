'use client';

import React, { useEffect, useState } from 'react';
import { Sliders, Save, Check, AlertCircle, MapPin, Sparkles, Building, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [visionText, setVisionText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderPhoto, setFounderPhoto] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.contentBlocks) {
          setContentBlocks(data.contentBlocks);

          // Parse block contents
          const vis = data.contentBlocks.find((b: any) => b.key === 'about.vision');
          if (vis) {
            try { setVisionText(JSON.parse(vis.contentJson).text); } catch {}
          }

          const mis = data.contentBlocks.find((b: any) => b.key === 'about.mission');
          if (mis) {
            try { setMissionText(JSON.parse(mis.contentJson).text); } catch {}
          }

          const fnd = data.contentBlocks.find((b: any) => b.key === 'about.founder');
          if (fnd) {
            try {
              const obj = JSON.parse(fnd.contentJson);
              setFounderName(obj.name || 'Alberta Glory');
              setFounderBio(obj.biography || '');
              setFounderPhoto(obj.photo || '');
            } catch {}
          }
        }

        if (data.deliveryZones) setDeliveryZones(data.deliveryZones);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updatedBlocks = [
        {
          key: 'about.vision',
          title: 'Vision',
          contentJson: JSON.stringify({ text: visionText }),
        },
        {
          key: 'about.mission',
          title: 'Mission',
          contentJson: JSON.stringify({ text: missionText }),
        },
        {
          key: 'about.founder',
          title: 'Founder & CEO',
          contentJson: JSON.stringify({
            role: 'Founder & CEO',
            name: founderName,
            biography: founderBio,
            photo: founderPhoto || '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg',
          }),
        },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentBlocks: updatedBlocks,
          deliveryZones,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMessage('Enterprise CMS Content and Delivery Fees successfully updated!');
    } catch (err: any) {
      setMessage(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleZoneFeeChange = (id: string, newFee: string) => {
    setDeliveryZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, fee: parseFloat(newFee) || 0 } : z))
    );
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-stone-400">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Content Management & Configuration
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Enterprise Settings & CMS
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Modify corporate vision, mission, founder details, delivery fees and Ghanaian regions.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Section 1: Vision, Mission & Founder CMS */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <h2 className="font-serif font-bold text-xl text-stone-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-600" />
          <span>Corporate Vision, Mission & Leadership</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
              Vision Statement
            </label>
            <textarea
              rows={3}
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-harmony-900"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
              Mission Statement
            </label>
            <textarea
              rows={3}
              value={missionText}
              onChange={(e) => setMissionText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-harmony-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Founder & CEO Name
              </label>
              <input
                type="text"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-harmony-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Founder Photo Path
              </label>
              <input
                type="text"
                value={founderPhoto}
                onChange={(e) => setFounderPhoto(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-harmony-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Founder Biography
              </label>
              <textarea
                rows={3}
                value={founderBio}
                onChange={(e) => setFounderBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-harmony-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Ghana Delivery Zones & Fee Settings */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <h2 className="font-serif font-bold text-xl text-stone-950 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-harmony-900" />
          <span>Ghana Delivery Zones & Fee Schedule</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Zone / Area Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Delivery Fee (GH₵)</th>
                <th className="py-3 px-4">Estimated Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {deliveryZones.map((z) => (
                <tr key={z.id}>
                  <td className="py-3 px-4 font-bold text-stone-900">{z.name}</td>
                  <td className="py-3 px-4 text-stone-600">{z.region}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="1"
                      value={z.fee}
                      onChange={(e) => handleZoneFeeChange(z.id, e.target.value)}
                      className="w-24 px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold text-harmony-950"
                    />
                  </td>
                  <td className="py-3 px-4 text-stone-500">{z.estimatedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
