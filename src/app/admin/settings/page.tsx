'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Home Top Banner & 2 Pictures CMS
  const [heroHeadline, setHeroHeadline] = useState('Small Hands, Wide Reach');
  const [heroBadge, setHeroBadge] = useState('HARMONY HAVEN ENTERPRISE');
  const [heroSubheadline, setHeroSubheadline] = useState(
    'We make yummy home-cooked Ghanaian food and beautiful gift boxes that bring happiness to you and your loved ones.'
  );
  const [heroCtaExplore, setHeroCtaExplore] = useState('See What We Sell');
  const [heroCtaExploreLink, setHeroCtaExploreLink] = useState('#brands-section');
  const [heroCtaOrder, setHeroCtaOrder] = useState('Order Food or Gifts');
  const [heroCtaOrderLink, setHeroCtaOrderLink] = useState('/order');
  const [heroBadge1, setHeroBadge1] = useState('Fresh Homemade Meals');
  const [heroBadge2, setHeroBadge2] = useState('Bespoke Poetry & Gifting');
  const [heroBadge3, setHeroBadge3] = useState('Ghana-wide Delivery');

  // Card 1 (Food / Kowah's Dishes)
  const [card1Image, setCard1Image] = useState('/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg');
  const [card1Badge, setCard1Badge] = useState("Kowah's Dishes");
  const [card1Title, setCard1Title] = useState('Cook Less, Live More!');
  const [card1Link, setCard1Link] = useState('/kowahs-dishes');
  const [uploadingCard1, setUploadingCard1] = useState(false);

  // Card 2 (Gifting / 4U Heartlines)
  const [card2Image, setCard2Image] = useState('/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg');
  const [card2Badge, setCard2Badge] = useState('4U HEARTLINES');
  const [card2Title, setCard2Title] = useState('Where feelings find their words');
  const [card2Link, setCard2Link] = useState('/4u-heartlines');
  const [uploadingCard2, setUploadingCard2] = useState(false);

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
      const res = await fetch(`/api/admin/settings?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      const data = await res.json();

      if (data.contentBlocks) {
        setContentBlocks(data.contentBlocks);

        const heroBlock = data.contentBlocks.find((b: any) => b.key === 'home.hero');
        if (heroBlock) {
          try {
            const obj = JSON.parse(heroBlock.contentJson);
            if (obj.headline) setHeroHeadline(obj.headline);
            if (obj.badge) setHeroBadge(obj.badge);
            if (obj.subheadline) setHeroSubheadline(obj.subheadline);
            if (obj.ctaExplore) setHeroCtaExplore(obj.ctaExplore);
            if (obj.ctaExploreLink) setHeroCtaExploreLink(obj.ctaExploreLink);
            if (obj.ctaOrder) setHeroCtaOrder(obj.ctaOrder);
            if (obj.ctaOrderLink) setHeroCtaOrderLink(obj.ctaOrderLink);
            if (obj.badge1) setHeroBadge1(obj.badge1);
            if (obj.badge2) setHeroBadge2(obj.badge2);
            if (obj.badge3) setHeroBadge3(obj.badge3);
            if (obj.card1Image) setCard1Image(obj.card1Image);
            if (obj.card1Badge) setCard1Badge(obj.card1Badge);
            if (obj.card1Title) setCard1Title(obj.card1Title);
            if (obj.card1Link) setCard1Link(obj.card1Link);
            if (obj.card2Image) setCard2Image(obj.card2Image);
            if (obj.card2Badge) setCard2Badge(obj.card2Badge);
            if (obj.card2Title) setCard2Title(obj.card2Title);
            if (obj.card2Link) setCard2Link(obj.card2Link);
          } catch {}
        }

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

  const handleUploadBannerImage = async (file: File, cardNum: 1 | 2) => {
    if (cardNum === 1) setUploadingCard1(true);
    if (cardNum === 2) setUploadingCard2(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (cardNum === 1) setCard1Image(e.target.result as string);
          if (cardNum === 2) setCard2Image(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.url) {
        if (cardNum === 1) setCard1Image(data.url);
        if (cardNum === 2) setCard2Image(data.url);
      }
    } catch (err) {
      console.error('Failed to upload banner image:', err);
    } finally {
      if (cardNum === 1) setUploadingCard1(false);
      if (cardNum === 2) setUploadingCard2(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updatedBlocks = [
        {
          key: 'home.hero',
          title: 'Home Page Hero & Top Banner',
          section: 'home',
          contentJson: JSON.stringify({
            headline: heroHeadline,
            badge: heroBadge,
            subheadline: heroSubheadline,
            ctaExplore: heroCtaExplore,
            ctaExploreLink: heroCtaExploreLink,
            ctaOrder: heroCtaOrder,
            ctaOrderLink: heroCtaOrderLink,
            badge1: heroBadge1,
            badge2: heroBadge2,
            badge3: heroBadge3,
            card1Image,
            card1Badge,
            card1Title,
            card1Link,
            card2Image,
            card2Badge,
            card2Title,
            card2Link,
          }),
        },
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
        Loading store settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Store Settings
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950 mt-1">
            Store Settings
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Change your phone numbers, delivery towns, prices, and banner message.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
            <span>Go to Shop</span>
          </Link>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
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
              <h2 className="font-serif font-bold text-xl text-stone-950">Phone Numbers & Contact</h2>
              <p className="text-xs text-stone-400">Phone numbers shown to customers on the website</p>
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

        {/* 2.5 HOME PAGE TOP BANNER & 2 PICTURES CMS */}
        <div id="home-banner" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold-400/40 shadow-sm space-y-8 scroll-mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-harmony-800 to-harmony-950 text-gold-400 flex items-center justify-center shadow-xs">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-xl text-stone-950">Home Page Top Banner & Pictures</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 text-[10px] font-bold uppercase tracking-wider">
                    Live On Top of Home Page
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Change the two pictures on the top of your shop, the words on each picture, the main title, and buttons.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/home"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>See Live Home</span>
              </Link>
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-gold-400" />
                <span>{saving ? 'Saving...' : 'Save Banner'}</span>
              </button>
            </div>
          </div>

          {/* TWO PICTURES CONFIGURATION */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
                Top Banner Pictures (The 2 Pictures)
              </span>
              <p className="text-xs text-stone-500">
                Tap &ldquo;Choose Picture from Phone/Computer&rdquo; to upload any photo, or paste a link.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: FOOD POT / KOWAH'S DISHES */}
              <div className="p-5 rounded-2xl border-2 border-amber-200/80 bg-amber-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Picture 1 (Food / Kowah&apos;s Dishes)
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Top / Main Card</span>
                </div>

                {/* Live Preview */}
                <div className="relative rounded-xl overflow-hidden shadow-md border border-amber-300/60 bg-stone-900 aspect-16/9 group">
                  <img
                    src={card1Image}
                    alt={card1Badge}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-3.5">
                    <span className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">
                      {card1Badge || "Kowah's Dishes"}
                    </span>
                    <h4 className="font-serif font-bold text-white text-sm">
                      {card1Title || "Cook Less, Live More!"}
                    </h4>
                  </div>
                  {uploadingCard1 && (
                    <div className="absolute inset-0 bg-stone-950/75 flex items-center justify-center text-white text-xs font-bold">
                      Uploading picture...
                    </div>
                  )}
                </div>

                {/* Upload & Text Fields */}
                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Upload New Picture for Card 1
                    </label>
                    <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-400 bg-white hover:bg-amber-50 text-amber-900 font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>{uploadingCard1 ? 'Uploading...' : 'Choose Picture from Phone/Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadBannerImage(file, 1);
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Or Image URL / File Path
                    </label>
                    <input
                      type="text"
                      value={card1Image}
                      onChange={(e) => setCard1Image(e.target.value)}
                      placeholder="/images/gallery/... or https://..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Small Tag Writing
                      </label>
                      <input
                        type="text"
                        value={card1Badge}
                        onChange={(e) => setCard1Badge(e.target.value)}
                        placeholder="e.g. Kowah's Dishes"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Big Title on Picture
                      </label>
                      <input
                        type="text"
                        value={card1Title}
                        onChange={(e) => setCard1Title(e.target.value)}
                        placeholder="e.g. Cook Less, Live More!"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Where it opens when clicked
                    </label>
                    <input
                      type="text"
                      value={card1Link}
                      onChange={(e) => setCard1Link(e.target.value)}
                      placeholder="/kowahs-dishes"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: GIFT / 4U HEARTLINES */}
              <div className="p-5 rounded-2xl border-2 border-teal-200/80 bg-teal-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    Picture 2 (Gifts / 4U Heartlines)
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Floating Card</span>
                </div>

                {/* Live Preview */}
                <div className="relative rounded-xl overflow-hidden shadow-md border border-teal-300/60 bg-harmony-950 aspect-16/9 group">
                  <img
                    src={card2Image}
                    alt={card2Badge}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-harmony-950/90 via-harmony-950/40 to-transparent flex flex-col justify-end p-3.5">
                    <span className="text-[10px] font-bold tracking-widest text-teal-300 uppercase">
                      {card2Badge || "4U HEARTLINES"}
                    </span>
                    <h4 className="font-serif font-bold text-white text-sm">
                      {card2Title || "Where feelings find their words"}
                    </h4>
                  </div>
                  {uploadingCard2 && (
                    <div className="absolute inset-0 bg-stone-950/75 flex items-center justify-center text-white text-xs font-bold">
                      Uploading picture...
                    </div>
                  )}
                </div>

                {/* Upload & Text Fields */}
                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Upload New Picture for Card 2
                    </label>
                    <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-400 bg-white hover:bg-teal-50 text-teal-900 font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span>{uploadingCard2 ? 'Uploading...' : 'Choose Picture from Phone/Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadBannerImage(file, 2);
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Or Image URL / File Path
                    </label>
                    <input
                      type="text"
                      value={card2Image}
                      onChange={(e) => setCard2Image(e.target.value)}
                      placeholder="/images/gallery/... or https://..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Small Tag Writing
                      </label>
                      <input
                        type="text"
                        value={card2Badge}
                        onChange={(e) => setCard2Badge(e.target.value)}
                        placeholder="e.g. 4U HEARTLINES"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Big Title on Picture
                      </label>
                      <input
                        type="text"
                        value={card2Title}
                        onChange={(e) => setCard2Title(e.target.value)}
                        placeholder="e.g. Where feelings find their words"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Where it opens when clicked
                    </label>
                    <input
                      type="text"
                      value={card2Link}
                      onChange={(e) => setCard2Link(e.target.value)}
                      placeholder="/4u-heartlines"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WRITINGS & BUTTONS ON BANNER (OTHER SETTINGS) */}
          <div className="pt-6 border-t border-stone-100 space-y-4 text-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
                Banner Title, Story & Buttons
              </span>
              <p className="text-xs text-stone-500">
                The big headline text, description, and two main buttons on the left of the banner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="HARMONY HAVEN ENTERPRISE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Big Main Title
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="Small Hands, Wide Reach"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Sub-Text / Story
              </label>
              <textarea
                rows={2}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                placeholder="We make yummy home-cooked Ghanaian food and beautiful gift boxes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                <span className="font-bold text-stone-800 block">Yellow Button 1</span>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Button Writing</label>
                  <input
                    type="text"
                    value={heroCtaExplore}
                    onChange={(e) => setHeroCtaExplore(e.target.value)}
                    placeholder="See What We Sell"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Where it goes</label>
                  <input
                    type="text"
                    value={heroCtaExploreLink}
                    onChange={(e) => setHeroCtaExploreLink(e.target.value)}
                    placeholder="#brands-section"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                <span className="font-bold text-stone-800 block">Outlined Button 2</span>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Button Writing</label>
                  <input
                    type="text"
                    value={heroCtaOrder}
                    onChange={(e) => setHeroCtaOrder(e.target.value)}
                    placeholder="Order Food or Gifts"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Where it goes</label>
                  <input
                    type="text"
                    value={heroCtaOrderLink}
                    onChange={(e) => setHeroCtaOrderLink(e.target.value)}
                    placeholder="/order"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Bottom Point 1</label>
                <input
                  type="text"
                  value={heroBadge1}
                  onChange={(e) => setHeroBadge1(e.target.value)}
                  placeholder="Fresh Homemade Meals"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Bottom Point 2</label>
                <input
                  type="text"
                  value={heroBadge2}
                  onChange={(e) => setHeroBadge2(e.target.value)}
                  placeholder="Bespoke Poetry & Gifting"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Bottom Point 3</label>
                <input
                  type="text"
                  value={heroBadge3}
                  onChange={(e) => setHeroBadge3(e.target.value)}
                  placeholder="Ghana-wide Delivery"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>
            </div>
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
            <Save className="w-4 h-4 text-gold-400" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Floating Sticky Quick-Save Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={(e) => handleSaveSettings(e as any)}
          disabled={saving}
          className="px-6 py-3.5 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-2xl border-2 border-gold-400 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 backdrop-blur-xs"
          title="Save all store configurations"
        >
          <Save className="w-4 h-4 text-gold-400" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

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
