import { useCustomerSummary } from '../../../hooks/useReports';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { formatCurrency } from '../../../lib/formatters';

export default function TopCustomersReport() {
  const { data, loading } = useCustomerSummary();

  // Top 10 by total spend
  const top10 = [...data]
    .sort((a, b) => Number(b.total_spend) - Number(a.total_spend))
    .slice(0, 10);

  const maxSpend = top10.length > 0 ? Number(top10[0].total_spend) : 1;

  const COLORS = [
    'bg-yellow-400', 'bg-slate-300', 'bg-amber-600',
    'bg-blue-500', 'bg-blue-400', 'bg-blue-300',
    'bg-indigo-400', 'bg-indigo-300', 'bg-violet-400', 'bg-violet-300',
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Top Customers</h1>
          <p className="page-subtitle">Top 10 customers by total spend</p>
        </div>
      </div>

      {loading ? <TableSkeleton rows={10} columns={4} /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-700 mb-5 text-sm uppercase tracking-wider">Spend Chart</h2>
            <div className="space-y-3">
              {top10.map((r, i) => {
                const pct = Math.max(4, (Number(r.total_spend) / maxSpend) * 100);
                return (
                  <div key={r.custno}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 truncate max-w-[60%]">
                        {i < 3 ? ['🥇','🥈','🥉'][i] + ' ' : `${i+1}. `}{r.custname}
                      </span>
                      <span className="text-slate-500 font-mono">{formatCurrency(r.total_spend)}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${COLORS[i]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Rankings</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th className="text-right">Txns</th>
                  <th className="text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((r, i) => (
                  <tr key={r.custno}>
                    <td className="font-black text-slate-400 text-sm w-8">
                      {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800 text-sm">{r.custname}</div>
                      <div className="text-slate-400 text-xs font-mono">{r.custno}</div>
                    </td>
                    <td className="text-right text-slate-600 font-semibold">{r.total_transactions}</td>
                    <td className="text-right font-bold text-green-700">{formatCurrency(r.total_spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
