import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  AlertTriangle,
  Tag,
  Package,
  Check,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export interface CatalogItem {
  id: string;
  name: string;
  nameUr?: string;
  category: string;
  defaultUnit?: string;
  aliases?: string[];
  isEssential?: boolean;
}

export const AdminCatalogPage: React.FC = () => {
  const { token } = useAdminAuth();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCatalog = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);

      const res = await fetch(`/api/admin/catalog/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to load catalog`);
      }

      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load catalog from database.');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003527] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Authoritative Supabase Source
              </span>
              <span className="text-xs text-neutral-500">public.items + public.categories</span>
            </div>
            <h2 className="text-2xl font-black text-[#003527] tracking-tight font-['Manrope']">
              Product &amp; Item Catalog
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
              Pakistani grocery vocabulary, standard categories, and bilingual auto-suggest recognition database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCatalog()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-fetch from Database</span>
          </button>
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
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-500 font-mono ml-2">
            Total: <strong>{total}</strong>
          </span>
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
            onClick={() => fetchCatalog()}
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
            <div className="text-xs font-mono text-neutral-500">Querying Supabase catalog...</div>
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
                    <td className="py-3.5 px-4">
                      {item.isEssential ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Rashan</span>
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
    </div>
  );
};
