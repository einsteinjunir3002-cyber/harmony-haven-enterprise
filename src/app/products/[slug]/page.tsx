import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { ProductCard } from '@/components/ui/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      category: true,
      variants: { orderBy: { priceAdjustment: 'asc' } },
    },
  });

  if (!product || !product.active) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      brandId: product.brandId,
      id: { not: product.id },
      active: true,
    },
    take: 3,
    include: {
      brand: true,
      category: true,
      variants: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <ProductDetailClient product={product as any} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-12 border-t border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              More from {product.brand.name}
            </span>
            <h2 className="font-serif font-bold text-2xl text-stone-950">
              You Might Also Love
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
