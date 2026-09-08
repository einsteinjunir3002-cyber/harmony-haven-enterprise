'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Star,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { compressImageFile } from '@/lib/imageCompression';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchProducts = async () => {
    try {
      const [prodRes, brandRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/brands'),
        fetch('/api/admin/categories'),
      ]);
      const prodData = await prodRes.json();
      const brandData = await brandRes.json();
      const catData = await catRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (brandData.brands) setBrands(brandData.brands);
      if (catData.categories) setCategories(catData.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    const defaultBrandId = brands[0]?.id || '';
    const brandCats = categories.filter((c) => c.brandId === defaultBrandId);

    setEditingProduct({
      brandId: defaultBrandId,
      categoryId: brandCats[0]?.id || null,
      name: '',
      description: '',
      shortDescription: '',
      price: 50,
      compareAtPrice: '',
      type: 'PHYSICAL_PRODUCT',
      active: true,
      featured: false,
      stockQuantity: 100,
      images: ['/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg'],
      variants: [],
    });
    setNewImageUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    let parsedImages: string[] = [];
    try {
      if (Array.isArray(p.images)) {
        parsedImages = p.images;
      } else if (typeof p.images === 'string' && p.images.startsWith('[')) {
        parsedImages = JSON.parse(p.images);
      } else if (p.images) {
        parsedImages = [p.images];
      }
    } catch {
      parsedImages = p.images ? [p.images] : [];
    }

    setEditingProduct({
      ...p,
      images: parsedImages,
      compareAtPrice: p.compareAtPrice || '',
    });
    setNewImageUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Image Management Handlers
  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');

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
          console.warn('Client compression skipped:', compErr);
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
        if (!res.ok) {
          if (fallbackUrl) {
            // If upload endpoint failed (e.g. read-only serverless), use dataUrl seamlessly
            setEditingProduct((prev: any) => ({
              ...prev,
              images: [...(prev?.images || []), fallbackUrl],
            }));
            return;
          }
          throw new Error('Server returned an invalid response. Please retry.');
        }
      }

      if (!res.ok) {
        if (fallbackUrl) {
          setEditingProduct((prev: any) => ({
            ...prev,
            images: [...(prev?.images || []), fallbackUrl],
          }));
          return;
        }
        throw new Error(json.error || 'Upload failed');
      }

      setEditingProduct((prev: any) => ({
        ...prev,
        images: [...(prev?.images || []), json.url || fallbackUrl],
      }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setEditingProduct((prev: any) => ({
      ...prev,
      images: [...(prev?.images || []), newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setEditingProduct((prev: any) => ({
      ...prev,
      images: (prev?.images || []).filter((_: any, idx: number) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setEditingProduct((prev: any) => {
      const imgs = [...(prev?.images || [])];
      if (indexToPrimary >= imgs.length) return prev;
      const [chosen] = imgs.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [chosen, ...imgs],
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const payload = {
        id: editingProduct.id,
        brandId: editingProduct.brandId,
        categoryId: editingProduct.categoryId || null,
        name: editingProduct.name,
        slug: editingProduct.slug,
        description: editingProduct.description,
        shortDescription: editingProduct.shortDescription,
        price: editingProduct.price,
        compareAtPrice: editingProduct.compareAtPrice,
        sku: editingProduct.sku,
        type: editingProduct.type,
        active: editingProduct.active,
        featured: editingProduct.featured,
        trackInventory: editingProduct.trackInventory,
        stockQuantity: editingProduct.stockQuantity,
        images: editingProduct.images || [],
        sortOrder: editingProduct.sortOrder,
        variants: editingProduct.variants,
      };

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCategories = editingProduct
    ? categories.filter((c) => c.brandId === editingProduct.brandId)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Catalog Management
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Products & Variants
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Create, edit photos, assign categories, adjust prices, manage inventory and attach options.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter products by name, brand, or category..."
          className="w-full text-xs focus:outline-none bg-transparent"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((prod) => {
                  let firstImg = '/images/gallery/WhatsApp Image 2026-09-03 at 10.20.31 PM.jpeg';
                  try {
                    if (Array.isArray(prod.images) && prod.images.length > 0) {
                      firstImg = prod.images[0];
                    } else if (typeof prod.images === 'string' && prod.images.startsWith('[')) {
                      firstImg = JSON.parse(prod.images)[0] || firstImg;
                    } else if (prod.images) {
                      firstImg = prod.images;
                    }
                  } catch {}

                  return (
                    <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImg}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-stone-900">{prod.name}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1">
                              {prod.shortDescription || prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-stone-700">
                        {prod.brand?.name}
                      </td>
                      <td className="py-4 px-4">
                        {prod.category ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                            {prod.category.name}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-harmony-950">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            prod.stockQuantity <= 10 ? 'text-rose-600' : 'text-stone-700'
                          }`}
                        >
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                          {prod.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prod.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {prod.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-harmony-900 hover:bg-stone-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal with Multi-Photo Gallery Manager */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-xl text-stone-950">
                {editingProduct.id ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Brand & Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={editingProduct.brandId}
                    onChange={(e) => {
                      const newBrandId = e.target.value;
                      const validCats = categories.filter((c) => c.brandId === newBrandId);
                      setEditingProduct({
                        ...editingProduct,
                        brandId: newBrandId,
                        categoryId: validCats[0]?.id || null,
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
                    value={editingProduct.categoryId || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value || null,
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

              {/* Product Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={editingProduct.type}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, type: e.target.value })
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
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Compare At Price
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.compareAtPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value })
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
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
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
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                  }
                  placeholder="Appears on cards and lists..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
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
                      Add, upload, reorder, or remove photos. First photo is the primary cover image.
                    </p>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="product-photo-upload"
                      accept="image/*"
                      onChange={handleUploadProductImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-photo-upload"
                      className="cursor-pointer px-3.5 py-2 rounded-xl bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    </label>
                  </div>
                </div>

                {/* Add Image by URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste image URL (e.g. /images/gallery/...)"
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

                {/* Current Photo Thumbnails */}
                {(!editingProduct.images || editingProduct.images.length === 0) ? (
                  <div className="py-6 text-center text-stone-400 italic text-xs">
                    No photos attached yet. Upload a photo or add an image URL above.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {editingProduct.images.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border-2 border-stone-200 bg-white aspect-square shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Cover Badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 bg-gold-600 text-stone-950 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-stone-950" /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-1 left-1 bg-stone-900/80 hover:bg-gold-600 hover:text-stone-950 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Set as Cover Photo"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
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
                    checked={editingProduct.active}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, active: e.target.checked })
                    }
                    className="rounded text-harmony-900"
                  />
                  <span className="font-bold">Active in Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                    className="rounded text-harmony-900"
                  />
                  <span className="font-bold">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.trackInventory ?? true}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        trackInventory: e.target.checked,
                      })
                    }
                    className="rounded text-harmony-900"
                  />
                  <span className="font-bold">Track Stock</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-harmony-900 text-white font-bold uppercase tracking-wider text-[11px] disabled:opacity-50 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
