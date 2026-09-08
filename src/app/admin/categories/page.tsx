'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Folder, Sparkles, Check, AlertCircle, X, Layers, ArrowRight } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (data.brands) setBrands(data.brands);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    const defaultBrandId = selectedBrand !== 'ALL' ? selectedBrand : brands[0]?.id || '';
    setEditingCategory({
      brandId: defaultBrandId,
      name: '',
      description: '',
      active: true,
      sortOrder: categories.length + 1,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const method = editingCategory.id ? 'PUT' : 'POST';
      const payload = {
        id: editingCategory.id,
        brandId: editingCategory.brandId,
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description,
        active: editingCategory.active,
        sortOrder: editingCategory.sortOrder,
      };

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');

      setIsModalOpen(false);
      setSuccessMsg(editingCategory.id ? 'Category updated successfully' : 'New category created successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    const confirmText = cat._count?.products > 0
      ? `This category contains ${cat._count.products} product(s). Deleting it will unassign them from this category. Are you sure?`
      : `Are you sure you want to delete "${cat.name}"?`;

    if (!confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');

      setSuccessMsg(`Category "${cat.name}" deleted successfully`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filteredCategories = selectedBrand === 'ALL'
    ? categories
    : categories.filter((c) => c.brandId === selectedBrand);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Catalog Structure
          </span>
          <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
            Category Management
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Add new categories, rename or edit descriptions, adjust display order, and organize offerings under each brand.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 rounded-full bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Brand Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedBrand('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedBrand === 'ALL'
              ? 'bg-harmony-900 text-gold-300 shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          All Brands ({categories.length})
        </button>
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBrand(b.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedBrand === b.id
                ? 'bg-harmony-900 text-gold-300 shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {b.name} ({categories.filter((c) => c.brandId === b.id).length})
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-stone-400">
          Loading catalog categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400 text-xs">
          No categories found. Click &quot;Add New Category&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1"
                      style={{
                        backgroundColor: `${cat.brand?.primaryColor || '#0a4d52'}15`,
                        color: cat.brand?.primaryColor || '#0a4d52',
                      }}
                    >
                      {cat.brand?.name}
                    </span>
                    <h2 className="font-serif font-bold text-lg text-stone-950">{cat.name}</h2>
                    <span className="text-[11px] font-mono text-stone-400">slug: /{cat.slug}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-light line-clamp-3">
                  {cat.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="font-semibold text-harmony-950">
                    {cat._count?.products || 0} {cat._count?.products === 1 ? 'Product' : 'Products'}
                  </span>
                  <span>&bull;</span>
                  <span>Sort Order: {cat.sortOrder}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-xl text-stone-950">
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
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

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Brand *
                </label>
                <select
                  value={editingCategory.brandId}
                  onChange={(e) => setEditingCategory({ ...editingCategory, brandId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  required
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Savory Bowl, Verse & Velvet"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {editingCategory.id && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Brief description for customer catalog viewing..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.sortOrder || 0}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.active}
                      onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                      className="rounded text-harmony-900"
                    />
                    <span className="font-bold">Active in Catalog</span>
                  </label>
                </div>
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
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
