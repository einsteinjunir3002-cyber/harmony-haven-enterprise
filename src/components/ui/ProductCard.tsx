'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles, Heart, Utensils } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    brandId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    compareAtPrice?: number | null;
    images?: string;
    type?: string;
    brand?: {
      name: string;
      slug: string;
      primaryColor?: string | null;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    variants?: Array<{
      id: string;
      name: string;
      priceAdjustment: number;
    }>;
  };
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCart();

  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images || '[]');
  } catch {
    imageList = [];
  }

  const primaryImage =
    imageList[0] || '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg';

  const isKowah = product.brand?.slug === 'kowahs-dishes';
  const isHeartlines = product.brand?.slug === '4u-heartlines';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, navigate to product page for selection
    if (product.variants && product.variants.length > 0) {
      window.location.href = `/products/${product.slug}`;
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: primaryImage,
      brandSlug: product.brand?.slug || '',
      brandName: product.brand?.name || 'Harmony Haven',
    });
  };

  return (
    <div
      className={`group rounded-2xl bg-white border transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-xl ${
        isKowah
          ? 'border-kowah-100 hover:border-kowah-300'
          : isHeartlines
          ? 'border-heartlines-100 hover:border-heartlines-300'
          : 'border-stone-200 hover:border-gold-300'
      }`}
    >
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-4/3 overflow-hidden bg-stone-100 block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Brand Tag Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md ${
              isKowah
                ? 'bg-kowah-900/90 text-gold-300'
                : isHeartlines
                ? 'bg-harmony-900/90 text-gold-300'
                : 'bg-stone-900/80 text-white'
            }`}
          >
            {isKowah && <Utensils className="w-3 h-3" />}
            {isHeartlines && <Heart className="w-3 h-3" />}
            <span>{product.brand?.name || 'Harmony Haven'}</span>
          </span>
        </div>

        {/* Customization / Service Indicator */}
        {(product.type === 'CUSTOM_PRODUCT' || product.type === 'SERVICE') && (
          <div className="absolute top-3 right-3 bg-gold-400 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Personalizable</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {product.category && (
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}

          <Link href={`/products/${product.slug}`} className="block group-hover:text-harmony-900 transition-colors">
            <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price and Action Bar */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-stone-950">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.variants && product.variants.length > 0 && (
              <span className="text-[10px] text-stone-500 font-medium">Multiple Options</span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className={`p-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              isKowah
                ? 'bg-kowah-900 hover:bg-kowah-950 text-white'
                : isHeartlines
                ? 'bg-harmony-900 hover:bg-harmony-950 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
            title={product.variants?.length ? 'Choose Options' : 'Add to Bag'}
          >
            {product.variants && product.variants.length > 0 ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
