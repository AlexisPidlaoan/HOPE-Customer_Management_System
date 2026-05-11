import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../lib/formatters';

export default function ProductCataloguePage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.prodcode.toLowerCase().includes(search.toLowerCase()) ||
    p.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalogue</h1>
          <p className="page-subtitle">{filtered.length} product{filtered.length !== 1 ? 's' : ''} · View-only</p>
        </div>
        {/* No add/edit/delete — Core Rule 3 */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold border border-blue-100">
          🔒 Read-only module
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="productSearch"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
        {search && <button onClick={() => setSearch('')} className="text-slate-400 text-xs hover:text-slate-600">✕ Clear</button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <TableSkeleton rows={8} columns={5} /> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No products found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th className="text-right">Current Price</th>
                  <th>Price As Of</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.prodcode} className="hover:bg-slate-50 cursor-default">
                    <td className="font-mono text-xs text-slate-500">{p.prodcode}</td>
                    <td className="font-medium text-slate-800">{p.description}</td>
                    <td className="text-slate-500 text-sm">{p.unit}</td>
                    <td className="text-right font-bold text-slate-800">{formatCurrency(p.current_price)}</td>
                    <td className="text-slate-400 text-sm">{formatDate(p.price_as_of)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
