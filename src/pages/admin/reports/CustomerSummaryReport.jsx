import { useState } from 'react';
import { useCustomerSummary } from '../../../hooks/useReports';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../lib/formatters';

export default function CustomerSummaryReport() {
  const { data, loading } = useCustomerSummary();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('total_spend');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = data
    .filter((r) =>
      r.custname.toLowerCase().includes(search.toLowerCase()) ||
      r.custno.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
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

  const totalSpend = data.reduce((s, r) => s + Number(r.total_spend || 0), 0);
  const totalTx    = data.reduce((s, r) => s + Number(r.total_transactions || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Sales Summary</h1>
          <p className="page-subtitle">Aggregated spend and transaction counts per customer</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Customers</p>
          <p className="text-3xl font-black text-slate-800">{data.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Transactions</p>
          <p className="text-3xl font-black text-blue-700">{totalTx}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-green-700">{formatCurrency(totalSpend)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="summarySearch"
          type="text"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <TableSkeleton rows={8} columns={5} /> : filtered.length === 0 ? (
          <EmptyState icon="📋" title="No data found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {th('custno', 'ID')}
                  {th('custname', 'Customer')}
                  {th('payterm', 'Pay Term')}
                  {th('total_transactions', 'Transactions', true)}
                  {th('total_spend', 'Total Spend', true)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.custno}>
                    <td className="font-mono text-xs text-slate-400">{r.custno}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {i < 3 && <span className="text-sm">{['🥇','🥈','🥉'][i]}</span>}
                        <span className="font-semibold text-slate-800">{r.custname}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{r.payterm}</td>
                    <td className="text-right font-semibold text-slate-700">{r.total_transactions}</td>
                    <td className="text-right font-bold text-green-700">{formatCurrency(r.total_spend)}</td>
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
