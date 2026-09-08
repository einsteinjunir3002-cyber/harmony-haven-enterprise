'use client';

import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Save,
  Check,
  AlertCircle,
  MapPin,
  Sparkles,
  Building,
  Phone,
  Mail,
  Bell,
  MessageSquare,
  Plus,
  Trash2,
  X,
  Volume2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable CMS fields
  const [visionText, setVisionText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [founderName, setFounderName] = useState('Alberta Glory');
  const [founderPhoto, setFounderPhoto] = useState('/images/gallery/alberta-glory-founder.jpg');

  // Store Contact Info
  const [whatsappPhone, setWhatsappPhone] = useState('024 514 7912');
  const [supportPhone, setSupportPhone] = useState('024 514 7912');
  const [supportEmail, setSupportEmail] = useState('successlight@gmail.com');
  const [storeAddress, setStoreAddress] = useState('Accra, Ghana (Deliveries to Kumasi, Cape Coast & Accra)');

  // Store Announcement Banner
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerText, setBannerText] = useState('Small Hands, Wide Reach | Fresh Homemade Meals & Bespoke Gifting across Ghana');

  // Notification Preferences
  const [notifyWhatsAppOrders, setNotifyWhatsAppOrders] = useState(true);
  const [notifyInquiryEmails, setNotifyInquiryEmails] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // New Delivery Zone Modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRegion, setNewZoneRegion] = useState('Greater Accra');
  const [newZoneFee, setNewZoneFee] = useState(30);
  const [newZoneTime, setNewZoneTime] = useState('24 - 48 hrs');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.contentBlocks) {
        setContentBlocks(data.contentBlocks);

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
            setFounderPhoto(obj.photo || '/images/gallery/alberta-glory-founder.jpg');
          } catch {}
        }

        const contact = data.contentBlocks.find((b: any) => b.key === 'store.contact');
        if (contact) {
          try {
            const obj = JSON.parse(contact.contentJson);
            if (obj.whatsapp) setWhatsappPhone(obj.whatsapp);
            if (obj.phone) setSupportPhone(obj.phone);
            if (obj.email) setSupportEmail(obj.email);
            if (obj.address) setStoreAddress(obj.address);
          } catch {}
        }

        const banner = data.contentBlocks.find((b: any) => b.key === 'store.banner');
        if (banner) {
          try {
            const obj = JSON.parse(banner.contentJson);
            if (obj.enabled !== undefined) setBannerEnabled(obj.enabled);
            if (obj.text) setBannerText(obj.text);
          } catch {}
        }

        const notif = data.contentBlocks.find((b: any) => b.key === 'store.notifications');
        if (notif) {
          try {
            const obj = JSON.parse(notif.contentJson);
            if (obj.notifyWhatsAppOrders !== undefined) setNotifyWhatsAppOrders(obj.notifyWhatsAppOrders);
            if (obj.notifyInquiryEmails !== undefined) setNotifyInquiryEmails(obj.notifyInquiryEmails);
            if (obj.lowStockThreshold !== undefined) setLowStockThreshold(obj.lowStockThreshold);
          } catch {}
        }
      }

      if (data.deliveryZones) setDeliveryZones(data.deliveryZones);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
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
          section: 'about',
          contentJson: JSON.stringify({ text: visionText }),
        },
        {
          key: 'about.mission',
          title: 'Mission',
          section: 'about',
          contentJson: JSON.stringify({ text: missionText }),
        },
        {
          key: 'about.founder',
          title: 'Founder & CEO',
          section: 'about',
          contentJson: JSON.stringify({
            role: 'Founder & CEO',
            name: founderName,
            biography: founderBio,
            photo: founderPhoto || '/images/gallery/alberta-glory-founder.jpg',
          }),
        },
        {
          key: 'store.contact',
          title: 'Store Contact Channels',
          section: 'general',
          contentJson: JSON.stringify({
            whatsapp: whatsappPhone,
            phone: supportPhone,
            email: supportEmail,
            address: storeAddress,
          }),
        },
        {
          key: 'store.banner',
          title: 'Storefront Announcement Banner',
          section: 'general',
          contentJson: JSON.stringify({
            enabled: bannerEnabled,
            text: bannerText,
          }),
        },
        {
          key: 'store.notifications',
          title: 'Notification Alert Preferences',
          section: 'general',
          contentJson: JSON.stringify({
            notifyWhatsAppOrders,
            notifyInquiryEmails,
            lowStockThreshold,
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

      setMessage('Store configurations, notifications, and delivery settings successfully saved!');
      setTimeout(() => setMessage(''), 5000);
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

  const handleZoneTimeChange = (id: string, newTime: string) => {
    setDeliveryZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, estimatedTime: newTime } : z))
    );
  };

  const handleCreateDeliveryZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDeliveryZones: [
            {
              name: newZoneName,
              region: newZoneRegion,
              fee: newZoneFee,
              estimatedTime: newZoneTime,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to add delivery zone');
      setIsZoneModalOpen(false);
      setNewZoneName('');
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Error creating zone');
    }
  };

  const handleDeleteDeliveryZone = async (id: string, name: string) => {
    if (!confirm(`Delete delivery zone "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/settings?type=deliveryZone&id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete zone');
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Error deleting zone');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-stone-400">
        Loading enterprise settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            System Control & Operations
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Store Settings & Alerts
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Configure contact lines, delivery zones, announcement banners, notification toggles, and brand content.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. STORE CONTACT & CHANNELS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-950">Store Contact Channels</h2>
              <p className="text-xs text-stone-400">Customer touchpoints displayed on storefront and order confirmations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Official WhatsApp Hotline
              </label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 024 514 7912"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Voice Hotline Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="e.g. 024 514 7912"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="e.g. successlight@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Headquarters & Pick-up Address
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="e.g. Accra, Ghana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 2. STOREFRONT ANNOUNCEMENT BANNER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-stone-950">Storefront Announcement Banner</h2>
                <p className="text-xs text-stone-400">Notice bar displayed across the top of all public storefront pages</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={bannerEnabled}
                onChange={(e) => setBannerEnabled(e.target.checked)}
                className="rounded text-harmony-900"
              />
              <span>Banner Active</span>
            </label>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1 text-xs">
              Announcement Message
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="e.g. Free delivery on orders over GH₵300 in Accra!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
            />
          </div>
        </div>

        {/* 3. NOTIFICATION PREFERENCES & SYSTEM ALERTS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-950">Notification & Alert Preferences</h2>
              <p className="text-xs text-stone-400">Operational triggers for customer purchases and inventory thresholds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">New Order Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyWhatsAppOrders}
                  onChange={(e) => setNotifyWhatsAppOrders(e.target.checked)}
                  className="rounded text-harmony-900"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Receive instant WhatsApp dispatch alerts when customers checkout.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">Inquiry Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyInquiryEmails}
                  onChange={(e) => setNotifyInquiryEmails(e.target.checked)}
                  className="rounded text-harmony-900"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Notify staff email when customers submit custom inquiries.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
              <span className="font-bold text-stone-900 block">Low Stock Threshold</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 10)}
                  className="w-20 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                />
                <span className="text-[11px] text-stone-500">units or less</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. GHANAIAN DELIVERY ZONES MANAGEMENT */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-stone-950">Ghanaian Delivery Zones</h2>
                <p className="text-xs text-stone-400">Automated shipping fee calculator applied dynamically at checkout</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsZoneModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Zone</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Zone / Destination</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Delivery Fee (GH₵)</th>
                  <th className="py-3 px-4">Estimated Transit</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {deliveryZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">{zone.name}</td>
                    <td className="py-3 px-4 text-stone-600">{zone.region}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400 font-bold">GH₵</span>
                        <input
                          type="number"
                          step="1"
                          value={zone.fee}
                          onChange={(e) => handleZoneFeeChange(zone.id, e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={zone.estimatedTime || ''}
                        onChange={(e) => handleZoneTimeChange(zone.id, e.target.value)}
                        className="w-40 px-2 py-1 rounded-lg border border-stone-300 text-xs"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteDeliveryZone(zone.id, zone.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. BRAND CMS & FOUNDER IDENTITY */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-harmony-100 text-harmony-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-950">Brand Narrative & Leadership</h2>
              <p className="text-xs text-stone-400">Content displayed on the public About page and footer</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Enterprise Vision
              </label>
              <textarea
                rows={2}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Enterprise Mission
              </label>
              <textarea
                rows={2}
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Founder Photo URL
                </label>
                <input
                  type="text"
                  value={founderPhoto}
                  onChange={(e) => setFounderPhoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                Founder Biography
              </label>
              <textarea
                rows={3}
                value={founderBio}
                onChange={(e) => setFounderBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Add New Delivery Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-950">Add New Delivery Zone</h3>
              <button
                onClick={() => setIsZoneModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliveryZone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Zone / Destination Name *
                </label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Osu, Cantonments & Labone"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={newZoneRegion}
                  onChange={(e) => setNewZoneRegion(e.target.value)}
                  placeholder="e.g. Greater Accra"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Fee (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Transit Time
                  </label>
                  <input
                    type="text"
                    value={newZoneTime}
                    onChange={(e) => setNewZoneTime(e.target.value)}
                    placeholder="Same Day (2-4 hrs)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-harmony-900 text-white font-bold uppercase text-[10px] shadow-sm"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
