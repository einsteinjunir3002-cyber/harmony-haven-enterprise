import React from 'react';
import Link from 'next/link';
import { Utensils, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame, Soup, Coffee } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';

export const dynamic = 'force-dynamic';

export default async function KowahsDishesPage() {
  let brand: any = null;
  try {
    brand = await prisma.brand.findUnique({
      where: { slug: 'kowahs-dishes' },
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
        products: {
          where: { active: true },
          include: { brand: true, category: true, variants: true },
        },
      },
    });
  } catch (err) {
    console.error('KowahsDishesPage DB error:', err);
  }

  if (!brand) {
    brand = {
      name: "Kowah's Dishes",
      tagline: 'Flavour in Every Bite. Prepared with Passion.',
      description: 'Crafted culinary perfection bringing rich Ghanaian flavors and warmth to your table.',
      categories: [],
      products: [],
    };
  }

  return (
    <div className="bg-kowah-50/50 pb-24 space-y-20">
      {/* Brand Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white pt-20 pb-24 border-b border-kowah-900">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kowah-800/80 border border-gold-400/40 text-gold-300 text-xs font-bold tracking-wider uppercase">
                <Utensils className="w-4 h-4 text-gold-400" />
                <span>KOWAH&apos;S DISHES — A HARMONY HAVEN BRAND</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                  Cook Less, <span className="text-gold-400">Live More!</span>
                </h1>
                <p className="text-gold-200 font-serif italic text-lg sm:text-xl">
                  &ldquo;Fresh from our pot to your fridge.&rdquo;
                </p>
                <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light leading-relaxed">
                  Authentic homemade Ghanaian culinary favorites. Prepared fresh with rich traditional spices, premium cuts, and uncompromised quality so you can enjoy wholesome goodness without the kitchen hassle.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#menu-section"
                  className="px-8 py-3.5 rounded-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Explore The Pot
                </a>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all"
                >
                  Catering Inquiries
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-300 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold-400" />
                  <span>Simmered to Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <Soup className="w-4 h-4 text-gold-400" />
                  <span>Fridge-Ready Storing</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Coffee className="w-4 h-4 text-gold-400" />
                  <span>Natural Spiced Sorrel</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gold-400/30 aspect-4/3 max-w-md mx-auto">
                <img
                  src="/images/gallery/WhatsApp Image 2026-09-03 at 10.22.02 PM.jpeg"
                  alt="Kowah's Dishes Simmered Pot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories Navigation */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
            Fresh Ghanaian Menu
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">
            Browse Kowah&apos;s Specialties
          </h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Choose your soups, grilled meats, refreshing sorrel juice, and shito jars.
          </p>
        </div>

        {/* Grouped by Category */}
        <div className="space-y-16">
          {brand.categories.map((category: any) => (
            <div key={category.id} className="space-y-6">
              <div className="border-b border-kowah-200 pb-4 flex items-end justify-between">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-kowah-950">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-stone-500 mt-1">{category.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-gold-700 bg-gold-100 px-3 py-1 rounded-full">
                  {category.products?.length || 0} {category.products?.length === 1 ? 'item' : 'items'}
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

      {/* Trust & Quality Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-kowah-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-gold-400/30">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Bulk & Event Orders
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Hosting a Family Gathering or Office Event?
            </h3>
            <p className="text-stone-300 text-sm">
              We prepare custom family pots, mega meat platters, and party-size sorrel dispensers.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all shrink-0"
          >
            Inquire For Bulk Orders
          </Link>
        </div>
      </section>
    </div>
  );
}
