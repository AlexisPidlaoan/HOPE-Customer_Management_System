import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../lib/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Filler, Tooltip, Legend
);

// ── KPI Card ──
function KpiCard({ icon, label, value, sub, color = 'blue', trend }) {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
    cyan: 'from-cyan-500 to-sky-600',
    indigo: 'from-indigo-500 to-blue-600',
    slate: 'from-slate-500 to-slate-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-${color}-200/50`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {trend && (
          <p className={`text-xs font-bold mt-1 ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
          </p>
        )}
      </div>
    </div>
  );
}

// ── Chart Card Wrapper ──
function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Recent Activity Item ──
function ActivityItem({ icon, title, detail, time, color = 'blue' }) {
  const bgMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg ${bgMap[color]} flex items-center justify-center text-sm flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{title}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
      <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{time}</span>
    </div>
  );
}

// ── Skeleton Loader ──
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 h-80 lg:col-span-2" />
        <div className="bg-white rounded-2xl border border-slate-200 h-80" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 h-80 lg:col-span-2" />
        <div className="bg-white rounded-2xl border border-slate-200 h-80" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useDashboard();

  // ── Chart configs ──
  const monthlySalesChart = useMemo(() => {
    if (!data) return null;
    return {
      data: {
        labels: data.monthlySales.labels,
        datasets: [{
          label: 'Transactions',
          data: data.monthlySales.values,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, stepSize: 1 } },
        },
      },
    };
  }, [data]);

  const revenueChart = useMemo(() => {
    if (!data) return null;
    return {
      data: {
        labels: data.monthlyRevenue.labels,
        datasets: [{
          label: 'Revenue (₱)',
          data: data.monthlyRevenue.values,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₱${ctx.parsed.y.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              font: { size: 10 },
              callback: (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`,
            },
          },
        },
      },
    };
  }, [data]);

  const payTermChart = useMemo(() => {
    if (!data) return null;
    return {
      data: {
        labels: data.payTermBreakdown.labels,
        datasets: [{
          data: data.payTermBreakdown.values,
          backgroundColor: [
            'rgba(245, 158, 11, 0.85)',
            'rgba(99, 102, 241, 0.85)',
            'rgba(100, 116, 139, 0.85)',
          ],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
        },
      },
    };
  }, [data]);

  const topProductsChart = useMemo(() => {
    if (!data) return null;
    return {
      data: {
        labels: data.topProducts.map(p => p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name),
        datasets: [{
          label: 'Revenue (₱)',
          data: data.topProducts.map(p => p.revenue),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ],
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₱${ctx.parsed.x.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 10 }, callback: (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}` },
          },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    };
  }, [data]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <p className="text-slate-500 text-center py-20">Unable to load dashboard data.</p>;

  const { kpi, topCustomers, userTypeMap } = data;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Business overview · SUPERADMIN</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-semibold border border-indigo-100">
          ★ SUPERADMIN Access Only
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon="👥" label="Active Customers" value={kpi.activeCustomers} sub={`${kpi.inactiveCustomers} inactive`} color="blue" />
        <KpiCard icon="📊" label="Total Transactions" value={kpi.totalTransactions} sub="All time" color="violet" />
        <KpiCard icon="💰" label="Total Revenue" value={formatCurrency(kpi.totalRevenue)} sub={`Avg: ${formatCurrency(kpi.avgOrderValue)} / order`} color="emerald" />
        <KpiCard icon="📦" label="Products" value={kpi.totalProducts} sub={`${kpi.activeUsers} / ${kpi.totalUsers} users active`} color="amber" />
      </div>

      {/* ── Charts Row 1: Monthly Sales + Pay Term ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Monthly Transactions" subtitle="Last 12 months" className="lg:col-span-2">
          <div style={{ height: '280px' }}>
            {monthlySalesChart && <Bar data={monthlySalesChart.data} options={monthlySalesChart.options} />}
          </div>
        </ChartCard>
        <ChartCard title="Customers by Pay Term" subtitle="Active customers only">
          <div style={{ height: '280px' }} className="flex items-center justify-center">
            {payTermChart && <Doughnut data={payTermChart.data} options={payTermChart.options} />}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Revenue Trend + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue (₱)" className="lg:col-span-2">
          <div style={{ height: '280px' }}>
            {revenueChart && <Line data={revenueChart.data} options={revenueChart.options} />}
          </div>
        </ChartCard>
        <ChartCard title="Top Products by Revenue" subtitle="All-time best sellers">
          <div style={{ height: '280px' }}>
            {topProductsChart && <Bar data={topProductsChart.data} options={topProductsChart.options} />}
          </div>
        </ChartCard>
      </div>

      {/* ── Bottom Row: Top Customers + System Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <ChartCard title="Top Customers" subtitle="Most transactions">
          <div className="space-y-0">
            {topCustomers.map((c, i) => (
              <div key={c.custno} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-600' :
                  i === 1 ? 'bg-slate-200 text-slate-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.custno}</p>
                </div>
                <span className="text-sm font-bold text-indigo-600">{c.transactions} tx</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* System Overview */}
        <ChartCard title="System Overview" subtitle="Users & platform status">
          <div className="space-y-4">
            {/* User breakdown */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">User Roles</p>
              <div className="space-y-2">
                {Object.entries(userTypeMap).sort().map(([type, count]) => {
                  const total = kpi.totalUsers || 1;
                  const pct = Math.round((count / total) * 100);
                  const colorMap = {
                    SUPERADMIN: 'bg-violet-500',
                    ADMIN: 'bg-blue-500',
                    USER: 'bg-slate-400',
                  };
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-600">{type}</span>
                        <span className="text-xs text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorMap[type] || 'bg-slate-300'} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-indigo-600">{kpi.activeUsers}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{kpi.totalProducts}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-amber-600">{kpi.activeCustomers}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-rose-600">{kpi.inactiveCustomers}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Deactivated</p>
                </div>
              </div>
            </div>

            {/* Platform info */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online · Supabase Connected</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
