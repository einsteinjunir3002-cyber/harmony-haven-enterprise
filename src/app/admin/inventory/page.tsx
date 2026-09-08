'use client';

import React, { useEffect, useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowUpDown,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalTracked: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockChanges, setStockChanges] = useState<{ [key: string]: number }>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<{ [key: string]: boolean }>({});

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockInputChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    setStockChanges((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleAdjustStep = (id: string, currentStock: number, delta: number) => {
    const currentVal = stockChanges[id] !== undefined ? stockChanges[id] : currentStock;
    const newVal = Math.max(0, currentVal + delta);
    setStockChanges((prev) => ({
      ...prev,
      [id]: newVal,
    }));
  };

  const handleSaveStock = async (productId: string, variantId?: string) => {
    const key = variantId || productId;
    const newStock = stockChanges[key];
    if (newStock === undefined) return;

    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: variantId ? undefined : productId,
          variantId,
          stockQuantity: newStock,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');

      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleTrackInventory = async (productId: string, currentValue: boolean) => {
    try {
      await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          trackInventory: !currentValue,
        }),
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProducts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filterMode === 'LOW_STOCK' && (!p.trackInventory || p.stockQuantity <= 0 || p.stockQuantity > 10)) {
      return false;
    }
    if (filterMode === 'OUT_OF_STOCK' && (!p.trackInventory || p.stockQuantity > 0)) {
      return false;
    }
    if (filterMode === 'IN_STOCK' && (!p.trackInventory || p.stockQuantity <= 10)) {
      return false;
    }
    if (selectedBrand !== 'ALL' && p.brand?.id !== selectedBrand) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand?.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSku) return false;
    }
    return true;
  });

  const brandsMap = Array.from(
    new Set(products.map((p) => JSON.stringify({ id: p.brand?.id, name: p.brand?.name })))
  ).map((str) => JSON.parse(str));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Stock Control & Auditing
        </span>
        <h1 className="font-serif font-bold text-3xl text-stone-950 mt-1">
          Inventory Management
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Real-time warehouse stock tracking, low-inventory notifications, and instant quantity adjustments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterMode('ALL')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            filterMode === 'ALL'
              ? 'bg-harmony-900 text-white border-harmony-900 shadow-md'
              : 'bg-white border-stone-200 hover:border-harmony-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Tracked SKUs</span>
            <Boxes className="w-4 h-4 opacity-80" />
          </div>
          <p className="font-serif font-bold text-2xl mt-2">{summary.totalTracked}</p>
          <span className="text-[10px] opacity-70">Active inventory products</span>
        </div>

        <div
          onClick={() => setFilterMode('IN_STOCK')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            filterMode === 'IN_STOCK'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white border-stone-200 hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-serif font-bold text-2xl mt-2">{summary.inStock}</p>
          <span className="text-[10px] opacity-70">&gt; 10 units available</span>
        </div>

        <div
          onClick={() => setFilterMode('LOW_STOCK')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            filterMode === 'LOW_STOCK'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white border-stone-200 hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif font-bold text-2xl mt-2">{summary.lowStock}</p>
          <span className="text-[10px] opacity-70">1 to 10 units remaining</span>
        </div>

        <div
          onClick={() => setFilterMode('OUT_OF_STOCK')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            filterMode === 'OUT_OF_STOCK'
              ? 'bg-rose-700 text-white border-rose-700 shadow-md'
              : 'bg-white border-stone-200 hover:border-rose-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-serif font-bold text-2xl mt-2">{summary.outOfStock}</p>
          <span className="text-[10px] opacity-70">0 units available</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBrand('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedBrand === 'ALL'
                ? 'bg-harmony-900 text-gold-300 shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Brands
          </button>
          {brandsMap.map(
            (b: any) =>
              b.id && (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedBrand === b.id
                      ? 'bg-harmony-900 text-gold-300 shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {b.name}
                </button>
              )
          )}
        </div>

        <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2 sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product, brand, SKU..."
            className="w-full text-xs focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 font-bold uppercase tracking-wider">
            Loading warehouse inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            No products match the selected inventory filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Tracking</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-6">Adjust Stock Level</th>
                  <th className="py-3 px-4 text-right">Options</th>
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

                  const currentVal =
                    stockChanges[prod.id] !== undefined ? stockChanges[prod.id] : prod.stockQuantity;
                  const isDirty = stockChanges[prod.id] !== undefined && stockChanges[prod.id] !== prod.stockQuantity;
                  const isSaving = savingKey === prod.id;
                  const isSaved = savedKey === prod.id;

                  const isOutOfStock = prod.stockQuantity <= 0;
                  const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= 10;

                  return (
                    <React.Fragment key={prod.id}>
                      <tr className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={firstImg}
                              alt=""
                              className="w-11 h-11 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-stone-900">{prod.name}</p>
                              <span className="text-[10px] text-stone-400 font-mono">
                                SKU: {prod.sku || `PRD-${prod.id.slice(-6).toUpperCase()}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-semibold text-stone-800">{prod.brand?.name}</p>
                          <span className="text-[10px] text-stone-400">{prod.category?.name || 'Unassigned'}</span>
                        </td>

                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleTrackInventory(prod.id, prod.trackInventory)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                              prod.trackInventory
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {prod.trackInventory ? 'Tracked' : 'Untracked'}
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" /> Low ({prod.stockQuantity})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Good ({prod.stockQuantity})
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAdjustStep(prod.id, prod.stockQuantity, -5)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center transition-colors"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleAdjustStep(prod.id, prod.stockQuantity, -1)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center transition-colors"
                              title="Decrease 1"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) => handleStockInputChange(prod.id, e.target.value)}
                              className="w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-harmony-900 bg-white"
                            />

                            <button
                              onClick={() => handleAdjustStep(prod.id, prod.stockQuantity, 1)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center transition-colors"
                              title="Increase 1"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleAdjustStep(prod.id, prod.stockQuantity, 5)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center transition-colors"
                              title="Increase 5"
                            >
                              +5
                            </button>

                            {isDirty && (
                              <button
                                onClick={() => handleSaveStock(prod.id)}
                                disabled={isSaving}
                                className="px-3 py-1 rounded-lg bg-harmony-900 hover:bg-harmony-950 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all"
                              >
                                {isSaving ? '...' : <Save className="w-3 h-3" />}
                                <span>Save</span>
                              </button>
                            )}

                            {isSaved && (
                              <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                                <Check className="w-3.5 h-3.5" /> Saved
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          {prod.variants && prod.variants.length > 0 && (
                            <button
                              onClick={() => toggleExpand(prod.id)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1"
                            >
                              <span>{prod.variants.length} Options</span>
                              {expandedProducts[prod.id] ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Variant Sub-rows */}
                      {expandedProducts[prod.id] &&
                        prod.variants?.map((v: any) => {
                          const vCurrentVal =
                            stockChanges[v.id] !== undefined ? stockChanges[v.id] : v.stockQuantity;
                          const vIsDirty =
                            stockChanges[v.id] !== undefined && stockChanges[v.id] !== v.stockQuantity;
                          const vIsSaving = savingKey === v.id;
                          const vIsSaved = savedKey === v.id;

                          return (
                            <tr key={v.id} className="bg-stone-50/80 text-[11px]">
                              <td className="py-2.5 pl-14 pr-6">
                                <span className="font-semibold text-stone-700">&bull; {v.name}</span>
                              </td>
                              <td className="py-2.5 px-4 text-stone-400">
                                Variant (+GH₵{v.priceAdjustment})
                              </td>
                              <td className="py-2.5 px-4 text-stone-400">Tracked</td>
                              <td className="py-2.5 px-4">
                                <span className="font-semibold text-stone-700">{v.stockQuantity} units</span>
                              </td>
                              <td className="py-2.5 px-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAdjustStep(v.id, v.stockQuantity, -1)}
                                    className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center border border-stone-200"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={vCurrentVal}
                                    onChange={(e) => handleStockInputChange(v.id, e.target.value)}
                                    className="w-14 px-1 py-0.5 text-center font-bold text-xs rounded border border-stone-300 bg-white"
                                  />
                                  <button
                                    onClick={() => handleAdjustStep(v.id, v.stockQuantity, 1)}
                                    className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center border border-stone-200"
                                  >
                                    +
                                  </button>

                                  {vIsDirty && (
                                    <button
                                      onClick={() => handleSaveStock(prod.id, v.id)}
                                      disabled={vIsSaving}
                                      className="px-2.5 py-0.5 rounded bg-harmony-900 text-white font-bold text-[9px] uppercase"
                                    >
                                      {vIsSaving ? '...' : 'Save'}
                                    </button>
                                  )}

                                  {vIsSaved && (
                                    <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-bold">
                                      <Check className="w-3 h-3" /> Saved
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right" />
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
