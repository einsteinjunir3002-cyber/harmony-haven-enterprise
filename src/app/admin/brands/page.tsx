'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Tag, Edit2, Sparkles, Check, AlertCircle, X } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand({
      name: '',
      tagline: '',
      description: '',
      primaryColor: '#0a4d52',
      secondaryColor: '#d4af37',
      active: true,
      sortOrder: brands.length + 1,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBrand(b);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const method = editingBrand.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/brands', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save brand');

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving brand');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Enterprise Brand Hierarchy
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Brand Management
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Scalable multi-brand architecture. Add new sister brands anytime without code modification.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sister Brand</span>
        </button>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-serif font-bold shadow-xs"
                    style={{ backgroundColor: brand.primaryColor || '#0a4d52' }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-xl text-stone-950">{brand.name}</h2>
                    <span className="text-[11px] font-mono text-stone-400">/{brand.slug}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    brand.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {brand.active ? 'Active' : 'Disabled'}
                </span>
              </div>

              {brand.tagline && (
                <p className="text-xs font-serif italic text-gold-700">&ldquo;{brand.tagline}&rdquo;</p>
              )}

              <p className="text-xs text-stone-600 leading-relaxed font-light line-clamp-3">
                {brand.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
                <span>{brand.categories?.length || 0} Categories</span>
                <span>&bull;</span>
                <span>{brand._count?.products || 0} Products</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-stone-300"
                  style={{ backgroundColor: brand.primaryColor }}
                  title="Primary Color"
                />
                <div
                  className="w-5 h-5 rounded-full border border-stone-300"
                  style={{ backgroundColor: brand.secondaryColor }}
                  title="Secondary Color"
                />
              </div>

              <button
                onClick={() => handleOpenEdit(brand)}
                className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Brand</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Modal */}
      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-xl text-stone-950">
                {editingBrand.id ? 'Edit Brand Settings' : 'Create New Brand'}
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

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Haven Home Essentials"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingBrand.tagline || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, tagline: e.target.value })}
                  placeholder="e.g. Elegance In Every Space"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Primary Brand Color
                  </label>
                  <input
                    type="color"
                    value={editingBrand.primaryColor || '#0a4d52'}
                    onChange={(e) => setEditingBrand({ ...editingBrand, primaryColor: e.target.value })}
                    className="w-full h-9 rounded-xl border border-stone-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Secondary Accent Color
                  </label>
                  <input
                    type="color"
                    value={editingBrand.secondaryColor || '#d4af37'}
                    onChange={(e) => setEditingBrand({ ...editingBrand, secondaryColor: e.target.value })}
                    className="w-full h-9 rounded-xl border border-stone-300 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="brandActive"
                  checked={editingBrand.active}
                  onChange={(e) => setEditingBrand({ ...editingBrand, active: e.target.checked })}
                  className="rounded text-harmony-900"
                />
                <label htmlFor="brandActive" className="font-bold cursor-pointer">
                  Activate Brand for Public Storefront
                </label>
              </div>

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
                  {saving ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
