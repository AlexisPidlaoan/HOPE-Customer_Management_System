import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserDashboard } from '../hooks/useUserDashboard';
import { formatCurrency, formatDate } from '../lib/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Helpers ────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDateTime() {
  return new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = 'blue', delay = 0 }) {
  const gradients = {
    blue:    'from-blue-500 to-blue-600',
    violet:  'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber:   'from-amber-500 to-orange-500',
  };
  const shadows = {
    blue:    'shadow-blue-200/60',
    violet:  'shadow-violet-200/60',
    emerald: 'shadow-emerald-200/60',
    amber:   'shadow-amber-200/60',
  };
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all duration-200 fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg ${shadows[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function AlertBanner({ type = 'warning', icon, message }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error:   'bg-red-50 border-red-200 text-red-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${styles[type]}`}>
      <span className="text-base">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 bg-white rounded-2xl border border-slate-200" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 h-80 lg:col-span-2" />
        <div className="bg-white rounded-2xl border border-slate-200 h-80" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 h-72" />
    </div>
  );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────
function exportToCSV(filename, rows, headers) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Date Range Pill ─────────────────────────────────────────────────────────
const PRESETS = [
  { key: 'all', label: 'All Time' },
  { key: '7d',  label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'custom', label: 'Custom' },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [preset, setPreset] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Transaction table state
  const [txSearch, setTxSearch] = useState('');
  const [txSort, setTxSort] = useState({ key: 'salesdate', dir: 'desc' });

  const { data, loading, errors } = useUserDashboard({ preset, customStart, customEnd });

  // ── Chart config ──────────────────────────────────────────────────────────
  const trendChart = useMemo(() => {
    if (!data) return null;
    const { labels, counts, amounts } = data.trend;
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Transactions',
            data: counts,
            borderColor: 'rgba(37, 99, 235, 1)',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: labels.length <= 14 ? 4 : 2,
            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 2.5,
            yAxisID: 'y',
          },
          {
            label: 'Amount (₱)',
            data: amounts,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: true,
            tension: 0.4,
            pointRadius: labels.length <= 14 ? 4 : 2,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11 }, usePointStyle: true, pointStyleWidth: 10, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.datasetIndex === 1
                ? `₱${ctx.parsed.y.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                : `${ctx.parsed.y} transactions`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 14 } },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            position: 'left',
            ticks: { font: { size: 10 }, stepSize: 1 },
            title: { display: true, text: 'Transactions', font: { size: 10 }, color: '#64748b' },
          },
          y1: {
            beginAtZero: true,
            grid: { display: false },
            position: 'right',
            ticks: {
              font: { size: 10 },
              callback: (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`,
            },
            title: { display: true, text: 'Amount', font: { size: 10 }, color: '#64748b' },
          },
        },
      },
    };
  }, [data]);

  // ── Transaction table filtering & sorting ─────────────────────────────────
  const filteredTx = useMemo(() => {
    if (!data) return [];
    let rows = [...data.recentTransactions];
    if (txSearch) {
      const q = txSearch.toLowerCase();
      rows = rows.filter((r) =>
        r.transno.toLowerCase().includes(q) ||
        (r.customer?.custname || r.custno || '').toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let av = a[txSort.key] ?? '';
      let bv = b[txSort.key] ?? '';
      if (txSort.key === 'amount') { av = a.amount; bv = b.amount; }
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return txSort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [data, txSearch, txSort]);

  const toggleSort = useCallback((key) => {
    setTxSort((s) => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'desc' });
  }, []);

  const sortIcon = (key) => txSort.key === key ? (txSort.dir === 'asc' ? ' ↑' : ' ↓') : '';

  // ── Risk alerts ───────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [...(errors || []).map((e) => ({ type: 'error', icon: '⚠️', message: e }))];
    if (data) {
      if (data.kpi.totalTransactions === 0)
        list.push({ type: 'warning', icon: '📭', message: `No sales recorded in the selected period.` });
      else if (data.kpi.totalTransactions < 3)
        list.push({ type: 'info', icon: '📉', message: `Only ${data.kpi.totalTransactions} transaction(s) in this period — low activity detected.` });
    }
    return list;
  }, [errors, data]);

  // ── CSV exports ───────────────────────────────────────────────────────────
  const handleExportKPI = () => {
    if (!data) return;
    exportToCSV('user_kpi.csv',
      [[data.kpi.activeCustomers, data.kpi.totalTransactions,
        data.kpi.totalSalesAmount.toFixed(2), data.kpi.uniqueProductsSold]],
      ['Active Customers', 'Total Transactions', 'Total Sales Amount (PHP)', 'Unique Products Sold']
    );
  };

  const handleExportTransactions = () => {
    if (!data) return;
    exportToCSV('transactions.csv',
      filteredTx.map((r) => [
        r.transno,
        r.salesdate,
        r.customer?.custname || r.custno,
        r.empno || '',
        r.amount.toFixed(2),
      ]),
      ['Transaction No', 'Date', 'Customer', 'Employee', 'Amount (PHP)']
    );
  };

  const handleExportTrend = () => {
    if (!data) return;
    exportToCSV('sales_trend.csv',
      data.trend.labels.map((lbl, i) => [lbl, data.trend.counts[i], data.trend.amounts[i].toFixed(2)]),
      ['Date', 'Transactions', 'Amount (PHP)']
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  const { kpi, recentTransactions, newCustomers } = data || {};
  const firstName = (profile?.full_name || profile?.email || 'User').split(' ')[0];
  const periodLabel = preset === 'all' ? 'all time' : preset === '7d' ? 'last 7 days' : preset === '30d' ? 'last 30 days' : 'custom period';

  return (
    <div className="space-y-6 pb-8">

      {/* ── Greeting Banner ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/40 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-extrabold">{getGreeting()}, {firstName}! 👋</span>
            </div>
            <p className="text-blue-200 text-sm">{formatDateTime()}</p>
            <p className="text-blue-100 text-xs mt-1 opacity-80">Here's your sales overview for the {periodLabel}.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              👤 Sales Staff
            </span>
            <span className="flex items-center gap-1.5 text-xs text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* ── Risk Alerts ───────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertBanner key={i} type={a.type} icon={a.icon} message={a.message} />
          ))}
        </div>
      )}

      {/* ── Date Range Filter ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Period:</span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              id={`rangeBtn-${p.key}`}
              onClick={() => { setPreset(p.key); setShowCustom(p.key === 'custom'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                preset === p.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="form-input text-xs py-1.5 w-36"
              id="customStart"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="form-input text-xs py-1.5 w-36"
              id="customEnd"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            id="exportKpiBtn"
            onClick={handleExportKPI}
            className="btn btn-outline text-xs py-1.5 px-3"
          >
            📥 Export KPI
          </button>
          <button
            id="exportTrendBtn"
            onClick={handleExportTrend}
            className="btn btn-outline text-xs py-1.5 px-3"
          >
            📥 Export Trend
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon="👥" label="Active Customers" color="blue" delay={0}
          value={kpi.activeCustomers.toLocaleString()}
          sub="Currently visible to you"
        />
        <KpiCard
          icon="📊" label="Transactions" color="violet" delay={60}
          value={kpi.totalTransactions.toLocaleString()}
          sub={`In the ${periodLabel}`}
        />
        <KpiCard
          icon="💰" label="Total Sales Amount" color="emerald" delay={120}
          value={formatCurrency(kpi.totalSalesAmount)}
          sub={`In the ${periodLabel}`}
        />
        <KpiCard
          icon="📦" label="Unique Products Sold" color="amber" delay={180}
          value={kpi.uniqueProductsSold.toLocaleString()}
          sub={`Distinct products in period`}
        />
      </div>

      {/* ── Sales Trend Chart ─────────────────────────────────────────────── */}
      <SectionCard
        title="Sales Trend"
        subtitle={`Daily transactions & amount · ${periodLabel}`}
      >
        <div className="px-6 pb-6 pt-4">
          {trendChart ? (
            <div style={{ height: '300px' }}>
              <Line data={trendChart.data} options={trendChart.options} />
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12 text-sm">No trend data available.</p>
          )}
        </div>
      </SectionCard>

      {/* ── Recent Transactions + New Customers ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Transactions table */}
        <SectionCard
          className="lg:col-span-2"
          title="Recent Transactions"
          subtitle={`${filteredTx.length} of ${recentTransactions.length} shown · ${periodLabel}`}
          actions={
            <button
              id="exportTxBtn"
              onClick={handleExportTransactions}
              className="btn btn-outline text-xs py-1 px-2.5"
            >
              📥 Export CSV
            </button>
          }
        >
          {/* Search + sort bar */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              id="txSearch"
              type="text"
              placeholder="Search by Trans. No or Customer…"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
            />
            {txSearch && (
              <button onClick={() => setTxSearch('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>

          {filteredTx.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-sm">
              {txSearch ? 'No transactions match your search.' : 'No transactions in this period.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('transno')} className="cursor-pointer select-none">Trans. No{sortIcon('transno')}</th>
                    <th onClick={() => toggleSort('salesdate')} className="cursor-pointer select-none">Date{sortIcon('salesdate')}</th>
                    <th>Customer</th>
                    <th onClick={() => toggleSort('amount')} className="cursor-pointer select-none text-right">Amount{sortIcon('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx) => (
                    <tr
                      key={tx.transno}
                      className="cursor-pointer"
                      onClick={() => navigate('/sales')}
                    >
                      <td className="font-mono text-xs text-blue-600 font-semibold">{tx.transno}</td>
                      <td className="text-slate-500">{formatDate(tx.salesdate)}</td>
                      <td className="font-medium text-slate-700">{tx.customer?.custname || tx.custno}</td>
                      <td className="text-right font-mono text-sm font-semibold text-emerald-700">
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* New Customers panel */}
        <SectionCard
          title="Customers"
          subtitle={`${newCustomers.length} active shown`}
          actions={
            <button
              id="viewAllCustomersBtn"
              onClick={() => navigate('/customers')}
              className="btn btn-ghost text-xs py-1 px-2"
            >
              View all →
            </button>
          }
        >
          {newCustomers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No customers found.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {newCustomers.map((c) => (
                <div
                  key={c.custno}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/customers/${c.custno}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.custname?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{c.custname}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.custno}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">{c.payterm}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'qaCustomers', icon: '👤', label: 'Customers', desc: 'Browse list', path: '/customers', color: 'blue' },
            { id: 'qaSales',     icon: '📊', label: 'Sales',     desc: 'View transactions', path: '/sales', color: 'violet' },
            { id: 'qaProducts',  icon: '📦', label: 'Products',  desc: 'Browse catalogue', path: '/products', color: 'emerald' },
            { id: 'qaExport',    icon: '📥', label: 'Export',    desc: 'Download CSV data', path: null, color: 'amber',
              onClick: handleExportTransactions },
          ].map((action) => (
            <button
              key={action.id}
              id={action.id}
              onClick={action.onClick ?? (() => navigate(action.path))}
              className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-100 ${
                action.color === 'blue'    ? 'border-blue-100 hover:border-blue-400 hover:bg-blue-50'   :
                action.color === 'violet' ? 'border-violet-100 hover:border-violet-400 hover:bg-violet-50' :
                action.color === 'emerald'? 'border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50':
                                            'border-amber-100 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">{action.label}</p>
                <p className="text-[11px] text-slate-400">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
