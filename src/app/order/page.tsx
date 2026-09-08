import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrderCatalogPage({
  searchParams,
}: {
  searchParams: { brand?: string; category?: string; q?: string; sort?: string };
}) {
  const brandSlug = searchParams.brand;
  const categorySlug = searchParams.category;
  const query = searchParams.q;
  const sort = searchParams.sort || 'default';

  const where: any = { active: true };
  if (brandSlug) where.brand = { slug: brandSlug };
  if (categorySlug) where.category = { slug: categorySlug };
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { shortDescription: { contains: query } },
    ];
  }

  let orderBy: any = [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'name_asc') orderBy = { name: 'asc' };

  let products: any[] = [];
  let brands: any[] = [];
  try {
    const results = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          variants: true,
        },
        orderBy,
      }),
      prisma.brand.findMany({
        where: { active: true },
        include: {
          categories: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    products = results[0];
    brands = results[1];
  } catch (err) {
    console.error('OrderCatalogPage DB error:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider">
          Harmony Haven Enterprise
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950">
          Complete Product & Menu Catalog
        </h1>
        <p className="text-stone-500 text-sm max-w-2xl">
          Browse homemade dishes from Kowah&apos;s Dishes and poetic gifting curations from 4U HEARTLINES.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <a
            href="/order"
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              !brandSlug
                ? 'bg-harmony-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Brands ({products.length})
          </a>
          {brands.map((b) => (
            <a
              key={b.id}
              href={`/order?brand=${b.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                brandSlug === b.slug
                  ? 'bg-harmony-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {b.name}
            </a>
          ))}
        </div>

        {/* Search Input */}
        <form method="GET" action="/order" className="w-full md:w-72 relative">
          {brandSlug && <input type="hidden" name="brand" value={brandSlug} />}
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            name="q"
            defaultValue={query || ''}
            placeholder="Search products or meals..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-harmony-900"
          />
        </form>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
          <p className="font-serif font-bold text-xl text-stone-800">No items match your query</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try searching with different keywords or switch between our child brand collections.
          </p>
          <a
            href="/order"
            className="inline-block px-6 py-2.5 bg-harmony-900 text-white text-xs font-bold uppercase tracking-wider rounded-full mt-2"
          >
            Reset Filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
