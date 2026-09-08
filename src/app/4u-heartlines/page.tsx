import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Feather, Gift, ArrowRight, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';
import { CustomOrderStudio } from '@/components/heartlines/CustomOrderStudio';

export const dynamic = 'force-dynamic';

export default async function HeartlinesPage() {
  let brand: any = null;
  try {
    brand = await prisma.brand.findUnique({
      where: { slug: '4u-heartlines' },
      include: {
        categories: {
          where: { active: true },
          include: {
            products: {
              where: { active: true },
              include: { brand: true, category: true, variants: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  } catch (err) {
    console.error('HeartlinesPage DB error:', err);
  }

  if (!brand) {
    brand = {
      name: '4U HEARTLINES',
      tagline: 'When Words Fall Short, We Give Them Wings.',
      description: 'Handcrafted bespoke poems, elegant glee boxes, framed citation candles, and bespoke gifts designed to touch souls and seal unforgettable memories.',
      categories: [],
    };
  }

  return (
    <div className="bg-heartlines-50/40 pb-24 space-y-20">
      {/* Brand Hero Banner */}
      <section className="relative overflow-hidden bg-linear-to-b from-harmony-950 via-stone-950 to-harmony-900 text-white pt-20 pb-24 border-b border-teal-900">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-harmony-800/80 border border-teal-400/40 text-teal-300 text-xs font-bold tracking-wider uppercase">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>4U HEARTLINES — A HARMONY HAVEN BRAND</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                  Where feelings <span className="text-teal-300">find their words</span>
                </h1>
                <p className="text-gold-200 font-serif italic text-lg sm:text-xl">
                  &ldquo;From your heart through our pen.&rdquo;
                </p>
                <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light leading-relaxed">
                  Thoughtful gifts. Personal words. Meaningful moments. We transform emotions into timeless poetry, engraved citations, aromatic candle verses, and curated luxury gift boxes for people you cherish.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#custom-studio-section"
                  className="px-8 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Commission A Poem / Gift
                </a>
                <a
                  href="#catalog-section"
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all"
                >
                  Browse Curations
                </a>
              </div>
            </div>

            {/* Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-teal-400/30 aspect-4/3 max-w-md mx-auto">
                <img
                  src="/images/gallery/WhatsApp Image 2026-09-03 at 10.57.01 PM.jpeg"
                  alt="4U Heartlines Curated Experience"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-800">
            Creative Collections
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">
            Verse & Velvet &bull; Ink & Emotion
          </h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Discover our curated gift experiences and personalized poetic art pieces.
          </p>
        </div>

        <div className="space-y-16">
          {brand.categories.map((category: any) => (
            <div key={category.id} className="space-y-6">
              <div className="border-b border-teal-200 pb-4 flex items-end justify-between">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-harmony-950">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-stone-500 mt-1">{category.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
                  {category.products?.length || 0} {category.products?.length === 1 ? 'offering' : 'offerings'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products?.map((product: any) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dedicated Interactive Custom Order Studio */}
      <section id="custom-studio-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomOrderStudio />
      </section>
    </div>
  );
}
