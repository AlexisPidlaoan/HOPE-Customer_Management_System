import { useState } from 'react';
import { useSales } from '../hooks/useSales';
import SalesDetailModal from '../components/sales/SalesDetailModal';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../lib/formatters';

const PAGE_SIZE = 15;

export default function SalesListPage() {
  const { sales, loading } = useSales();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);

  const filtered = sales.filter((s) =>
    s.transno.toLowerCase().includes(search.toLowerCase()) ||
    (s.customer?.custname || '').toLowerCase().includes(search.toLowerCase()) ||
    s.custno.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">{total} transaction{total !== 1 ? 's' : ''} · View-only</p>
        </div>
        {/* No add/edit/delete controls — Core Rule 3 */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold border border-blue-100">
          🔒 Read-only module
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="salesSearch"
          type="text"
          placeholder="Search by transaction ID or customer…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
        {search && <button onClick={() => setSearch('')} className="text-slate-400 text-xs hover:text-slate-600">✕ Clear</button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <TableSkeleton rows={15} columns={4} /> : rows.length === 0 ? (
          <EmptyState icon="📊" title="No transactions found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trans. No.</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Employee</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.transno} onClick={() => setSelectedTx(s.transno)} className="cursor-pointer">
                      <td className="font-mono text-sm text-blue-600 font-semibold">{s.transno}</td>
                      <td>{formatDate(s.salesdate)}</td>
                      <td className="font-medium">{s.customer?.custname || s.custno}</td>
                      <td className="text-slate-500">{s.empno || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
              <span>Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, total)} of {total}</span>
              <div className="flex gap-1">
                <button className="btn btn-ghost text-xs py-1" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</button>
                <span className="px-3 py-1 text-xs">{page} / {pages}</span>
                <button className="btn btn-ghost text-xs py-1" onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedTx && <SalesDetailModal transno={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
