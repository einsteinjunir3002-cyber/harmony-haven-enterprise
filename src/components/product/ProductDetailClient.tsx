'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Utensils,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductDetailProps {
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
    trackInventory?: boolean;
    stockQuantity?: number;
    brand?: {
      name: string;
      slug: string;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    variants: Array<{
      id: string;
      name: string;
      priceAdjustment: number;
      stockQuantity: number;
    }>;
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCart();

  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images || '[]');
  } catch {
    imageList = [];
  }
  if (!imageList.length) {
    imageList = ['/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg'];
  }

  const [selectedImage, setSelectedImage] = useState(imageList[0]);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [personalizationNote, setPersonalizationNote] = useState('');

  const currentPrice = product.price + (selectedVariant ? selectedVariant.priceAdjustment : 0);
  const isKowah = product.brand?.slug === 'kowahs-dishes';
  const isHeartlines = product.brand?.slug === '4u-heartlines';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      quantity,
      image: selectedImage,
      brandSlug: product.brand?.slug || '',
      brandName: product.brand?.name || 'Harmony Haven',
      personalization: personalizationNote ? { note: personalizationNote } : undefined,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Product Image Showcase */}
      <div className="lg:col-span-6 space-y-4">
        <div className="aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md relative">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail Selector */}
        {imageList.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {imageList.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImage === img ? 'border-harmony-900 shadow-md' : 'border-stone-200 opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Actions & Details */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isKowah
                  ? 'bg-kowah-100 text-kowah-900'
                  : isHeartlines
                  ? 'bg-harmony-100 text-harmony-900'
                  : 'bg-stone-100 text-stone-800'
              }`}
            >
              {isKowah && <Utensils className="w-3.5 h-3.5" />}
              {isHeartlines && <Heart className="w-3.5 h-3.5" />}
              <span>{product.brand?.name}</span>
            </span>

            {product.category && (
              <span className="text-xs text-stone-500 font-medium">
                &bull; {product.category.name}
              </span>
            )}
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-bold text-harmony-950">
              {formatCurrency(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-sm text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
          {product.description}
        </p>

        {/* Variant Selection */}
        {product.variants.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
              Select Option / Size / Combo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-harmony-900 bg-harmony-50 text-harmony-950 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.priceAdjustment !== 0 && (
                      <span className="font-bold text-stone-500">
                        {v.priceAdjustment > 0 ? `+${formatCurrency(v.priceAdjustment)}` : formatCurrency(v.priceAdjustment)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Personalization input for custom gift items */}
        {(product.type === 'CUSTOM_PRODUCT' || product.type === 'SERVICE') && (
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Personalization Note (Recipient, Occasion or Message):</span>
            </label>
            <textarea
              rows={2}
              value={personalizationNote}
              onChange={(e) => setPersonalizationNote(e.target.value)}
              placeholder="e.g. Birthday gift for Ama, write a short uplifting note on the card..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-harmony-900"
            />
          </div>
        )}

        {/* Quantity Controls and Action Buttons */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2.5 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag &bull; {formatCurrency(currentPrice * quantity)}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Delivery Info */}
        <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-harmony-900" />
            <span>Delivery available in Accra, Tema, Kumasi, and nationwide across Ghana.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed fresh preparation and luxury presentation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
