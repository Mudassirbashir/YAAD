import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  AlertTriangle,
  Tag,
  Package,
  Check,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminCache } from '../utils/adminCache';

export interface CatalogItem {
  id: string;
  name: string;
  nameUr?: string;
  category: string;
  defaultUnit?: string;
  aliases?: string[];
  isEssential?: boolean;
  pricePkr?: number;
}

const DEFAULT_CATEGORIES = [
  'Fresh Vegetables & Sabzi',
  'Atta, Rice & Grains',
  'Pulses & Daal',
  'Spices & Masalay',
  'Dairy & Eggs',
  'Cooking Oils & Ghee',
  'Tea & Beverages',
  'Household & Cleaning',
  'Snacks & Biscuits',
  'Meat & Poultry',
];

const COMMON_UNITS = ['kg', 'g', 'dozen', 'litre', 'ml', 'pack', 'bunch', 'piece', 'box'];

export const AdminCatalogPage: React.FC = () => {
  const { token, logout } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cached initial state
  const cacheKey = `/api/admin/catalog/products?page=${page}&limit=50&search=${encodeURIComponent(searchQuery.trim())}&category=${selectedCategory}`;
  const initialCached = adminCache.getStale<any>(cacheKey);

  const [items, setItems] = useState<CatalogItem[]>(initialCached?.items || []);
  const [categories, setCategories] = useState<string[]>(initialCached?.categories || DEFAULT_CATEGORIES);
  const [total, setTotal] = useState(initialCached?.total || 0);
  const [isLoading, setIsLoading] = useState(!initialCached);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [itemCategory, setItemCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [defaultUnit, setDefaultUnit] = useState('kg');
  const [pricePkr, setPricePkr] = useState<string>('');
  const [isEssential, setIsEssential] = useState(false);

  const fetchCatalog = useCallback(async (force = false) => {
    if (!token) return;
    const currentKey = `/api/admin/catalog/products?page=${page}&limit=50&search=${encodeURIComponent(searchQuery.trim())}&category=${selectedCategory}`;

    if (!adminCache.get(currentKey) && !force) {
      const stale = adminCache.getStale<any>(currentKey);
      if (!stale) setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await adminCache.fetchWithSwr(
        currentKey,
        async () => {
          const params = new URLSearchParams();
          params.set('page', String(page));
          params.set('limit', '50');
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          if (selectedCategory !== 'all') params.set('category', selectedCategory);

          const res = await fetch(`/api/admin/catalog/products?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            if (res.status === 401) {
              logout();
              throw new Error('Unauthorized');
            }
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}: Failed to load catalog`);
          }
          return res.json();
        },
        {
          ttl: 300_000,
          onRevalidate: (freshData) => {
            if (freshData) {
              setItems(freshData.items || []);
              if (freshData.categories && freshData.categories.length > 0) {
                setCategories(freshData.categories);
              }
              setTotal(freshData.total || 0);
              setTotalPages(freshData.totalPages || 1);
            }
          },
        }
      );

      if (data) {
        setItems(data.items || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        setErrorMessage(err.message || 'Unable to load catalog from database.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, page, searchQuery, selectedCategory, logout]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleOpenAddModal = () => {
    setNameEn('');
    setNameUr('');
    setItemCategory(categories[0] || DEFAULT_CATEGORIES[0]);
    setDefaultUnit('kg');
    setPricePkr('');
    setIsEssential(false);
    setModalError(null);
    setModalSuccess(null);
    setIsAddModalOpen(true);
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      setModalError('English item name is required.');
      return;
    }

    setIsSaving(true);
    setModalError(null);

    const payload = {
      name: nameEn.trim(),
      nameEn: nameEn.trim(),
      nameUr: nameUr.trim() || undefined,
      category: itemCategory,
      unit: defaultUnit,
      pricePkr: pricePkr ? Number(pricePkr) : undefined,
      isEssential,
    };

    try {
      const res = await fetch('/api/admin/catalog/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item to catalog.');
      }

      setModalSuccess(`"${nameEn}" added to grocery catalog successfully!`);
      adminCache.invalidatePrefix('/api/admin/catalog');
      await fetchCatalog(true);

      setTimeout(() => {
        setIsAddModalOpen(false);
        setModalSuccess(null);
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to add item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Authoritative Pakistani Grocery Catalog
              </span>
              <span className="text-xs text-neutral-500 font-bold">
                {total} Items Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Grocery Item Catalog
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Pakistani grocery vocabulary, standard categories, and bilingual auto-suggest recognition database.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchCatalog(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#003527] hover:bg-[#00281e] text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Grocery Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search items or Urdu names..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#003527]/20"
          >
            <option value="all">All Categories ({total})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Database Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 text-sm">DATA ERROR: Unable to load catalog from database</div>
              <div className="text-xs text-rose-700 mt-0.5">{errorMessage}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchCatalog(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#003527] animate-spin mx-auto" />
            <div className="text-xs font-mono text-neutral-500">Querying catalog items...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-3 text-neutral-500">
            <Package className="w-12 h-12 text-neutral-300 mx-auto" />
            <div className="font-bold text-neutral-800 text-sm">No Catalog Items Found</div>
            <p className="text-xs max-w-sm mx-auto text-neutral-500">
              {searchQuery || selectedCategory !== 'all'
                ? 'No items match your filter.'
                : 'Zero items recorded in the database catalog.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#003527] text-white font-bold text-xs hover:bg-[#00281e] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Grocery Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Urdu / Aliases</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Default Unit</th>
                  <th className="py-3.5 px-4">Price (Est.)</th>
                  <th className="py-3.5 px-4">Essential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {item.nameUr && <span className="font-urdu text-sm mr-2">{item.nameUr}</span>}
                      {item.aliases && item.aliases.length > 0 && (
                        <span className="text-[10px] text-neutral-400 font-mono">
                          [{item.aliases.join(', ')}]
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        <Tag className="w-3 h-3 text-neutral-500" />
                        <span>{item.category}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono">{item.defaultUnit || 'pcs'}</td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-700">
                      {item.pricePkr ? `Rs. ${item.pricePkr}` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isEssential ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Check className="w-3.5 h-3.5" />
                          <span>Rashan Staple</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total items)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                    Add Pakistani Grocery Item
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Add standard household item to auto-suggest and catalog database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddItemSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Item Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Potato (Aloo) or Basmati Rice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Item Name (Urdu - Optional)
                </label>
                <input
                  type="text"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  placeholder="آلو یا باسمتی چاول"
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-[#003527] font-urdu text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527] bg-white"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Default Unit</label>
                  <select
                    value={defaultUnit}
                    onChange={(e) => setDefaultUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527] bg-white font-mono"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Estimated Price (PKR)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricePkr}
                    onChange={(e) => setPricePkr(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:outline-none focus:border-[#003527]"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 select-none">
                    <input
                      type="checkbox"
                      checked={isEssential}
                      onChange={(e) => setIsEssential(e.target.checked)}
                      className="w-4 h-4 rounded text-[#003527] focus:ring-[#003527] cursor-pointer"
                    />
                    <span>Mark as Essential Rashan Staple</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#003527] text-white font-bold hover:bg-[#00281e] cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
