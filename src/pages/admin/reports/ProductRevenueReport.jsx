import { useState } from 'react';
import { useProductRevenue } from '../../../hooks/useReports';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../lib/formatters';

export default function ProductRevenueReport() {
  const { data, loading } = useProductRevenue();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('total_revenue');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = data
    .filter((r) =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.prodcode.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const th = (key, label, right) => (
    <th onClick={() => toggleSort(key)} className={right ? 'text-right' : ''}>
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  const totalRevenue = data.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
  const totalQty     = data.reduce((s, r) => s + Number(r.total_qty_sold || 0), 0);
  const maxRevenue   = data.length > 0 ? Math.max(...data.map((r) => Number(r.total_revenue || 0))) : 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Revenue</h1>
          <p className="page-subtitle">Total quantity sold and revenue per product</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Products</p>
          <p className="text-3xl font-black text-slate-800">{data.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Units Sold</p>
          <p className="text-3xl font-black text-blue-700">{Number(totalQty).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-green-700">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="revenueSearch"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <TableSkeleton rows={8} columns={7} /> : filtered.length === 0 ? (
          <EmptyState icon="💰" title="No data found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {th('prodcode', 'Code')}
                  {th('description', 'Product')}
                  {th('unit', 'Unit')}
                  {th('total_qty_sold', 'Qty Sold', true)}
                  {th('total_revenue', 'Revenue', true)}
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const share = totalRevenue > 0 ? (Number(r.total_revenue) / totalRevenue * 100) : 0;
                  const barPct = maxRevenue > 0 ? (Number(r.total_revenue) / maxRevenue * 100) : 0;
                  return (
                    <tr key={r.prodcode}>
                      <td className="text-slate-400 text-sm font-semibold">{i + 1}</td>
                      <td className="font-mono text-xs text-slate-400">{r.prodcode}</td>
                      <td className="font-semibold text-slate-800">{r.description}</td>
                      <td className="text-slate-500 text-sm">{r.unit}</td>
                      <td className="text-right font-mono font-semibold text-slate-700">{Number(r.total_qty_sold).toLocaleString()}</td>
                      <td className="text-right font-mono font-bold text-green-700">{formatCurrency(r.total_revenue)}</td>
                      <td className="text-right w-32">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${barPct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
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
