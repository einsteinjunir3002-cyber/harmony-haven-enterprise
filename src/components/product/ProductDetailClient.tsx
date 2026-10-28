'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  ExternalLink,
  AlertCircle,
  Check,
  Save,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { compressImageFile } from '@/lib/imageCompression';

interface ProductDetailProps {
  product: {
    id: string;
    brandId: string;
    categoryId?: string | null;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    compareAtPrice?: number | null;
    sku?: string | null;
    images?: string;
    type?: string;
    active?: boolean;
    featured?: boolean;
    trackInventory?: boolean;
    stockQuantity?: number;
    sortOrder?: number;
    brand?: {
      id?: string;
      name: string;
      slug: string;
    };
    category?: {
      id?: string;
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
  brands?: Array<{ id: string; name: string; slug: string }>;
  categories?: Array<{ id: string; name: string; slug: string; brandId: string }>;
}

export function ProductDetailClient({
  product: initialProduct,
  brands = [],
  categories = [],
}: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, setIsOpen } = useCart();
  const { user } = useAuth();

  const isAdmin =
    user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF');

  const [product, setProduct] = useState(initialProduct);

  // Parse images
  const parseImages = (imgs?: string | string[]): string[] => {
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string' && imgs.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(imgs);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (imgs && typeof imgs === 'string') return [imgs];
    return [];
  };

  const getFallbackImage = (brandSlug?: string) => {
    if (brandSlug === '4u-heartlines') {
      return '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.47 PM.jpeg';
    }
    return '/images/gallery/WhatsApp Image 2026-09-03 at 10.31.46 PM.jpeg';
  };

  const [imageList, setImageList] = useState<string[]>(() => {
    const parsed = parseImages(initialProduct.images);
    return parsed.length > 0 ? parsed : [getFallbackImage(initialProduct.brand?.slug)];
  });

  const [selectedImage, setSelectedImage] = useState(imageList[0]);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [personalizationNote, setPersonalizationNote] = useState('');

  // Admin In-Page Editor State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Check if ?edit=true was passed in the URL to automatically open editor for admins
  useEffect(() => {
    if (isAdmin && searchParams?.get('edit') === 'true') {
      handleOpenEdit();
    }
  }, [isAdmin, searchParams]);

  // Update image list if product changes
  useEffect(() => {
    const parsed = parseImages(product.images);
    const resolved = parsed.length > 0 ? parsed : [getFallbackImage(product.brand?.slug)];
    setImageList(resolved);
    setSelectedImage((prev) => (resolved.includes(prev) ? prev : resolved[0]));
  }, [product.images, product.brand?.slug]);

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

  // Open the in-page product editor
  const handleOpenEdit = () => {
    const currentImgs = parseImages(product.images);
    setEditingForm({
      id: product.id,
      brandId: product.brandId,
      categoryId: product.categoryId || product.category?.id || '',
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      sku: product.sku || '',
      type: product.type || 'PHYSICAL_PRODUCT',
      active: product.active !== undefined ? product.active : true,
      featured: product.featured || false,
      trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
      stockQuantity: product.stockQuantity || 100,
      images: currentImgs,
      variants: product.variants || [],
    });
    setNewImageUrl('');
    setIsEditModalOpen(true);
  };

  // Photo management inside in-page editor
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      let uploadFile: File = file;
      let fallbackUrl = '';

      if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name)) {
        try {
          const compressed = await compressImageFile(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
          });
          uploadFile = compressed.file;
          fallbackUrl = compressed.dataUrl;
        } catch (compErr) {
          console.warn('Compression skipped:', compErr);
        }
      }

      const data = new FormData();
      data.append('file', uploadFile);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: data,
      });

      const resText = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(resText);
      } catch {
        if (fallbackUrl) {
          setEditingForm((prev: any) => ({
            ...prev,
            images: [...(prev?.images || []), fallbackUrl],
          }));
          return;
        }
        throw new Error('Image upload failed.');
      }

      if (!res.ok) {
        if (fallbackUrl) {
          setEditingForm((prev: any) => ({
            ...prev,
            images: [...(prev?.images || []), fallbackUrl],
          }));
          return;
        }
        throw new Error(json.error || 'Upload failed');
      }

      setEditingForm((prev: any) => ({
        ...prev,
        images: [...(prev?.images || []), json.url || fallbackUrl],
      }));
    } catch (err: any) {
      alert(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setEditingForm((prev: any) => ({
      ...prev,
      images: [...(prev?.images || []), newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setEditingForm((prev: any) => ({
      ...prev,
      images: (prev?.images || []).filter((_: any, idx: number) => idx !== indexToRemove),
    }));
  };

  const handleSetCoverPhoto = (indexToPrimary: number) => {
    setEditingForm((prev: any) => {
      const imgs = [...(prev?.images || [])];
      if (indexToPrimary >= imgs.length) return prev;
      const [chosen] = imgs.splice(indexToPrimary, 1);
      return { ...prev, images: [chosen, ...imgs] };
    });
  };

  // Save changes from in-page editor
  const handleSaveProductChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      const payload = {
        id: editingForm.id,
        brandId: editingForm.brandId,
        categoryId: editingForm.categoryId || null,
        name: editingForm.name,
        slug: editingForm.slug,
        description: editingForm.description,
        shortDescription: editingForm.shortDescription,
        price: parseFloat(editingForm.price),
        compareAtPrice: editingForm.compareAtPrice ? parseFloat(editingForm.compareAtPrice) : null,
        sku: editingForm.sku || null,
        type: editingForm.type,
        active: Boolean(editingForm.active),
        featured: Boolean(editingForm.featured),
        trackInventory: Boolean(editingForm.trackInventory),
        stockQuantity: parseInt(editingForm.stockQuantity, 10) || 0,
        images: editingForm.images || [],
        variants: editingForm.variants,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product changes');

      // Update state immediately so changes reflect live on this page without reload
      setProduct((prev) => ({
        ...prev,
        ...data.product,
        brand: prev.brand,
        category:
          categories.find((c) => c.id === data.product.categoryId) ||
          prev.category,
      }));

      const newImgs = parseImages(data.product.images);
      const resolvedImgs =
        newImgs.length > 0 ? newImgs : [getFallbackImage(product.brand?.slug)];
      setImageList(resolvedImgs);
      setSelectedImage(resolvedImgs[0]);

      setIsEditModalOpen(false);
      setAdminNotice({
        type: 'success',
        text: 'Product information updated and live for customers!',
      });
      setTimeout(() => setAdminNotice(null), 5000);

      router.refresh();
    } catch (err: any) {
      alert(`Update Error: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete product directly from the customer view page
  const handleDeleteProductDirect = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${product.name}"? This product will be removed from both the storefront and database.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache, no-store' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      alert(`"${product.name}" has been permanently deleted.`);
      router.push(isKowah ? '/kowahs-dishes' : isHeartlines ? '/4u-heartlines' : '/home');
    } catch (err: any) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const availableCategories = editingForm
    ? categories.filter((c) => c.brandId === editingForm.brandId)
    : [];

  return (
    <div className="space-y-6">
      {/* Admin Quick Control Bar (Visible only to Alberta Glory / Admins) */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-harmony-900 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              Admin Mode
            </span>
            <span className="text-xs text-stone-800 font-medium">
              You are viewing this product live on the storefront.
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="px-4 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5 text-gold-400" />
              <span>Edit Product Details</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteProductDirect}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <Link
              href="/admin/products"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>Catalog Table</span>
            </Link>
          </div>
        </div>
      )}

      {/* Admin Success / Alert Banner */}
      {adminNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold shadow-xs ${
            adminNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {adminNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{adminNotice.text}</span>
        </div>
      )}

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-950 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 shadow-md"
              >
                <Edit2 className="w-3 h-3 text-gold-400" />
                <span>Edit Photos</span>
              </button>
            )}
          </div>

          {/* Thumbnail Selector */}
          {imageList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imageList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-harmony-900 shadow-md scale-102'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
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

              {isAdmin && !product.active && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                  Inactive / Hidden
                </span>
              )}
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-stone-500 text-xs sm:text-sm mt-1.5 italic">
                {product.shortDescription}
              </p>
            )}

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

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
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
                          {v.priceAdjustment > 0
                            ? `+${formatCurrency(v.priceAdjustment)}`
                            : formatCurrency(v.priceAdjustment)}
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
              <span>Delivery available to Kumasi, Cape Coast & Accra (24hr to 48hrs).</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Guaranteed fresh preparation and luxury presentation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* IN-PAGE ADMIN PRODUCT EDIT MODAL */}
      {isEditModalOpen && editingForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 block">
                  Live Product Editor
                </span>
                <h2 className="font-serif font-bold text-xl text-stone-950 mt-0.5">
                  Edit "{editingForm.name || 'Product'}"
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSaveProductChanges(e as any)}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Save all changes to this product"
                >
                  <Save className="w-3.5 h-3.5 text-gold-400" />
                  <span>{savingEdit ? 'Saving...' : 'Save Product'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProductChanges} className="space-y-6 text-xs">
              {/* Brand & Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={editingForm.brandId}
                    onChange={(e) => {
                      const newBrandId = e.target.value;
                      const validCats = categories.filter((c) => c.brandId === newBrandId);
                      setEditingForm({
                        ...editingForm,
                        brandId: newBrandId,
                        categoryId: validCats[0]?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingForm.categoryId || ''}
                    onChange={(e) =>
                      setEditingForm({
                        ...editingForm,
                        categoryId: e.target.value || '',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="">-- No Category (Unassigned) --</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingForm.name}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={editingForm.type}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="PHYSICAL_PRODUCT">PHYSICAL_PRODUCT</option>
                    <option value="MADE_TO_ORDER">MADE_TO_ORDER</option>
                    <option value="CUSTOM_PRODUCT">CUSTOM_PRODUCT</option>
                    <option value="SERVICE">SERVICE</option>
                  </select>
                </div>
              </div>

              {/* Price, Compare Price, Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingForm.price}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, price: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Compare At (GH₵)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingForm.compareAtPrice}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, compareAtPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingForm.stockQuantity}
                    onChange={(e) =>
                      setEditingForm({
                        ...editingForm,
                        stockQuantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Short Tagline / Summary
                </label>
                <input
                  type="text"
                  value={editingForm.shortDescription || ''}
                  onChange={(e) =>
                    setEditingForm({ ...editingForm, shortDescription: e.target.value })
                  }
                  placeholder="Shown on cards and previews..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Customer Description
                </label>
                <textarea
                  rows={4}
                  value={editingForm.description || ''}
                  onChange={(e) =>
                    setEditingForm({ ...editingForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs leading-relaxed"
                />
              </div>

              {/* PHOTO GALLERY MANAGEMENT SECTION */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gold-700" />
                      <span>Product Photo Gallery</span>
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Upload, rearrange, or delete photos. Cover photo is the main storefront image.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="product-detail-photo-upload"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-detail-photo-upload"
                      className="cursor-pointer px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={(e) => handleSaveProductChanges(e as any)}
                      disabled={savingEdit}
                      className="px-3.5 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Save photo gallery changes"
                    >
                      <Save className="w-3.5 h-3.5 text-gold-400" />
                      <span>{savingEdit ? 'Saving...' : 'Save Photos'}</span>
                    </button>
                  </div>
                </div>

                {/* Add Image by URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste photo URL (/images/gallery/...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] uppercase"
                  >
                    Add URL
                  </button>
                </div>

                {/* Photo Thumbnails */}
                {(!editingForm.images || editingForm.images.length === 0) ? (
                  <div className="py-6 text-center text-stone-400 italic text-xs">
                    No custom photos attached. Upload a photo or add an image URL above.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {editingForm.images.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border-2 border-stone-200 bg-white aspect-square shadow-xs"
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />

                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 bg-gold-600 text-stone-950 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-stone-950" /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverPhoto(idx)}
                            className="absolute top-1 left-1 bg-stone-900/80 hover:bg-gold-600 hover:text-stone-950 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xs transition-colors"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingForm.active}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, active: e.target.checked })
                    }
                    className="rounded text-harmony-900"
                  />
                  <span className="font-bold">Active in Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingForm.featured}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, featured: e.target.checked })
                    }
                    className="rounded text-harmony-900"
                  />
                  <span className="font-bold">Feature on Homepage</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Changes update both live customer view and the administrative database.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-7 py-2.5 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold uppercase tracking-wider text-[11px] disabled:opacity-50 shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5 text-gold-400" />
                    <span>{savingEdit ? 'Saving Changes...' : 'Save Product Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
