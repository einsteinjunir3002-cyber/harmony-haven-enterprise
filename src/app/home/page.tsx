import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Utensils,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Eye,
  Target,
  Compass,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';
import { BUSINESS_INFO } from '@/lib/constants';

// Enable dynamic database rendering
export const dynamic = 'force-dynamic';

export default async function FullHomePage() {
  let brands: any[] = [];
  let featuredProducts: any[] = [];
  let contentBlocks: any[] = [];
  let galleryMedia: any[] = [];

  try {
    const results = await Promise.all([
      prisma.brand.findMany({
        where: { active: true },
        include: {
          categories: { where: { active: true }, take: 4 },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: { active: true, featured: true },
        take: 6,
        include: {
          brand: true,
          category: true,
          variants: true,
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.contentBlock.findMany(),
      prisma.media.findMany({
        where: { category: { in: ['GALLERY', 'PRODUCT'] } },
        take: 8,
      }),
    ]);
    brands = results[0];
    featuredProducts = results[1];
    contentBlocks = results[2];
    galleryMedia = results[3];
  } catch (err) {
    console.error('HomePage DB error, using fallback:', err);
  }

  // Helper to parse content blocks
  const getBlock = (key: string, defaultVal: any) => {
    const found = contentBlocks.find((b) => b.key === key);
    if (!found) return defaultVal;
    try {
      return JSON.parse(found.contentJson);
    } catch {
      return defaultVal;
    }
  };

  const heroContent = getBlock('home.hero', {
    headline: 'Harmony Haven Enterprise',
    tagline: 'Small Hands, Wide Reach',
    subheadline:
      'Harmony Haven Enterprise is a growing Ghanaian enterprise building meaningful brands across food, gifting, creativity and lifestyle.',
    ctaExplore: 'Explore Our Brands',
    ctaOrder: 'Place an Order',
  });

  const welcomeContent = getBlock('home.welcome', {
    heading: 'MORE THAN A BUSINESS. A HOME FOR IDEAS.',
    body:
      "Harmony Haven Enterprise was created to bring different ideas and experiences together under one vision. From nourishing people through food to helping them express what words sometimes cannot say, our brands are built around one simple belief: What we create should add value to people's lives.",
  });

  const founderContent = getBlock('about.founder', {
    role: 'Founder & CEO',
    name: 'Alberta Glory',
    biography:
      'Passionate entrepreneur and creative director leading Harmony Haven Enterprise with a vision to build homegrown Ghanaian brands that resonate globally through culinary delight and expressive gifting.',
    photo: '/images/gallery/WhatsApp Image 2026-09-03 at 10.24.22 PM.jpeg',
  });

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-harmony-900 via-harmony-950 to-stone-950 text-white pt-20 pb-28 lg:pt-28 lg:pb-36">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/30 text-gold-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>HARMONY HAVEN ENTERPRISE</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                  Small Hands,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-200 to-gold-400">
                    Wide Reach
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-stone-300 max-w-2xl font-light leading-relaxed">
                  {heroContent.subheadline}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="#brands-section"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-sm tracking-wider uppercase shadow-xl hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{heroContent.ctaExplore}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/order"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wider uppercase border border-white/20 backdrop-blur-md transition-all flex items-center justify-center"
                >
                  <span>{heroContent.ctaOrder}</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-400 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Fresh Homemade Meals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Bespoke Poetry & Gifting</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Ghana-wide Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Dual Visual Composition (Food & Gifting) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Kowah's Dishes Card Preview */}
                <div className="relative z-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-400/40 bg-stone-900 group">
                  <img
                    src="/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg"
                    alt="Kowah's Dishes Food Pot"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4 bg-gradient-to-t from-stone-950 via-stone-900 to-transparent">
                    <span className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">
                      Kowah&apos;s Dishes
                    </span>
                    <h3 className="font-serif font-bold text-white text-base">
                      Cook Less, Live More!
                    </h3>
                  </div>
                </div>

                {/* 4U Heartlines Floating Card Preview */}
                <div className="relative -mt-12 ml-10 z-30 rounded-2xl overflow-hidden shadow-2xl border-2 border-teal-400/40 bg-harmony-950 group">
                  <img
                    src="/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg"
                    alt="4U Heartlines Gift Experience"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4 bg-gradient-to-t from-harmony-950 via-harmony-900 to-transparent">
                    <span className="text-[10px] font-bold tracking-widest text-teal-300 uppercase">
                      4U HEARTLINES
                    </span>
                    <h3 className="font-serif font-bold text-white text-base">
                      Where feelings find their words
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WELCOME SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-block w-12 h-1 bg-gold-500 rounded-full mx-auto" />
        <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-stone-950 tracking-tight">
          {welcomeContent.heading}
        </h2>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl mx-auto font-light">
          {welcomeContent.body}
        </p>
        <div className="pt-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-bold text-harmony-900 hover:text-harmony-950 uppercase tracking-wider group"
          >
            <span>Learn More About Us</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 3. OUR BRANDS SECTION */}
      <section id="brands-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 tracking-tight">
            MEET OUR BRANDS
          </h2>
          <p className="text-sm sm:text-base text-stone-500 max-w-xl mx-auto">
            Two brands. Two unique experiences. One growing enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BRAND CARD 1: KOWAH'S DISHES */}
          <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-8 sm:p-10 border border-stone-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-kowah-800/80 border border-gold-400/40 text-gold-400 flex items-center justify-center">
                  <Utensils className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                  Culinary Brand
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                  Kowah&apos;s Dishes
                </h3>
                <p className="text-gold-300 font-serif italic text-base mt-1">
                  &ldquo;Cook Less, Live More!&rdquo;
                </p>
                <p className="text-stone-300 text-sm mt-3 leading-relaxed">
                  Fresh from our pot to your fridge. Nourishing soups, sizzling grilled meats, spiced sorrel juice, and authentic Ghanaian shito prepared with modern excellence.
                </p>
              </div>

              {/* Offerings list */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Savory Bowl</p>
                  <p className="text-[11px] text-stone-400">Soups & stews</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Hot Box</p>
                  <p className="text-[11px] text-stone-400">Assorted meats</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Fruity Sorrel Juice</p>
                  <p className="text-[11px] text-stone-400">Natural fruit blend</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Shito</p>
                  <p className="text-[11px] text-stone-400">Rich pepper sauce</p>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                href="/kowahs-dishes"
                className="w-full py-3.5 rounded-xl bg-kowah-800 hover:bg-kowah-700 text-gold-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-gold-400/30 transition-all shadow-md group-hover:shadow-kowah-900/50"
              >
                <span>Explore Kowah&apos;s Dishes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* BRAND CARD 2: 4U HEARTLINES */}
          <div className="rounded-3xl bg-gradient-to-br from-harmony-950 via-stone-950 to-harmony-900 text-white p-8 sm:p-10 border border-teal-900/60 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-harmony-800/80 border border-gold-400/40 text-gold-400 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                  Gifting & Creative Studio
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                  4U HEARTLINES
                </h3>
                <p className="text-teal-200 font-serif italic text-base mt-1">
                  &ldquo;Where feelings find their words; from your heart through our pen.&rdquo;
                </p>
                <p className="text-stone-300 text-sm mt-3 leading-relaxed">
                  Thoughtful gifts. Personal words. Meaningful moments. Bespoke poetry, custom citations, scented candles, and curated gift boxes for all occasions.
                </p>
              </div>

              {/* Offerings list */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">VERSE & VELVET</p>
                  <p className="text-[11px] text-stone-400">Curated gift boxes</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">INK & EMOTION</p>
                  <p className="text-[11px] text-stone-400">Personalized poems</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Candle Citations</p>
                  <p className="text-[11px] text-stone-400">Aromatic gold verse</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-xs text-white">Poetic Memos</p>
                  <p className="text-[11px] text-stone-400">Wax-sealed scrolls</p>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <Link
                href="/4u-heartlines"
                className="w-full py-3.5 rounded-xl bg-harmony-800 hover:bg-harmony-700 text-gold-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-gold-400/30 transition-all shadow-md group-hover:shadow-teal-900/50"
              >
                <span>Explore 4U HEARTLINES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS & MENU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 block mb-1">
              Curated Offerings
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
              Featured Across Our Brands
            </h2>
          </div>
          <Link
            href="/order"
            className="text-xs font-bold uppercase tracking-wider text-harmony-900 hover:text-harmony-950 flex items-center gap-1.5"
          >
            <span>View Full Menu & Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 5. FOUNDER & MISSION HIGHLIGHT */}
      <section className="bg-stone-100/80 py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Founder Portrait */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-4/5 max-w-sm mx-auto">
                <img
                  src={founderContent.photo}
                  alt={founderContent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase font-bold tracking-widest text-gold-400">
                    {founderContent.role}
                  </span>
                  <h3 className="font-serif font-bold text-xl">{founderContent.name}</h3>
                </div>
              </div>
            </div>

            {/* Vision & Mission Info */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
                  Leadership & Philosophy
                </span>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 leading-tight">
                  One Vision. Multiple Expressions.
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                  {founderContent.biography}
                </p>
              </div>

              {/* Core Values Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <span className="text-xs font-bold text-harmony-900 block">Integrity</span>
                  <p className="text-[11px] text-stone-500 mt-1">Uncompromising authenticity</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <span className="text-xs font-bold text-harmony-900 block">Excellence</span>
                  <p className="text-[11px] text-stone-500 mt-1">Meticulous standards</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <span className="text-xs font-bold text-harmony-900 block">Creativity</span>
                  <p className="text-[11px] text-stone-500 mt-1">Inspiring original design</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <span className="text-xs font-bold text-harmony-900 block">Care</span>
                  <p className="text-[11px] text-stone-500 mt-1">Genuine customer focus</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-harmony-900 block">Growth</span>
                  <p className="text-[11px] text-stone-500 mt-1">Wide reach & impact</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-md"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Moments & Creations
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
            From Our Kitchen & Gifting Studio
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryMedia.map((m, idx) => (
            <div
              key={m.id || idx}
              className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 group shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={m.url}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-semibold">
                <span>{m.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LIVE CONTACT & ORDER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-harmony-900 via-harmony-950 to-stone-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-gold-400/20">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Ready to Experience Harmony Haven?
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Delicious Food & Thoughtful Gifts Delivered to Your Door
            </h3>
            <p className="text-stone-300 text-sm">
              We deliver across Accra, Tema, Kumasi, and nationwide across Ghana.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              href="/order"
              className="px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Place an Order
            </Link>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-emerald-600/40 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
