import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSales } from '../hooks/useSales';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPayterm, formatCurrency } from '../lib/formatters';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import SalesDetailModal from '../components/sales/SalesDetailModal';

export default function CustomerDetailPage() {
  const { custno } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(profile?.user_type);

  const [customer, setCustomer] = useState(null);
  const [custLoading, setCustLoading] = useState(true);
  const { sales, loading: salesLoading } = useSales({ custno });
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    supabase.from('customer').select('*').eq('custno', custno).single()
      .then(({ data }) => { setCustomer(data); setCustLoading(false); });
  }, [custno]);

  if (custLoading) return <Spinner label="Loading customer…" />;
  if (!customer) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Customer not found.</p>
      <button className="btn btn-ghost mt-4" onClick={() => navigate('/customers')}>← Back</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <button className="btn btn-ghost text-sm" onClick={() => navigate('/customers')}>
        ← Back to Customers
      </button>

      {/* Customer info card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {customer.custname[0]}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">{customer.custname}</h1>
              <p className="text-slate-400 font-mono text-sm">{customer.custno}</p>
            </div>
          </div>
          <Badge type={customer.record_status.toLowerCase()} label={customer.record_status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          <InfoCell label="Address" value={customer.address || '—'} />
          <InfoCell label="Payment Term" value={formatPayterm(customer.payterm)} />
          <InfoCell label="Status" value={customer.record_status} />
          {isAdmin && (
            <InfoCell label="Audit Stamp" value={customer.stamp || '—'} mono />
          )}
        </div>
      </div>

      {/* Sales history */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Sales History</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sales.length} transaction{sales.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {salesLoading ? (
          <Spinner label="Loading sales…" />
        ) : sales.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No sales found for this customer.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction No.</th>
                <th>Date</th>
                <th>Employee</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.transno} onClick={() => setSelectedTx(s.transno)} className="cursor-pointer hover:bg-blue-50">
                  <td className="font-mono text-sm text-blue-600 font-semibold">{s.transno}</td>
                  <td>{formatDate(s.salesdate)}</td>
                  <td className="text-slate-500">{s.empno || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTx && (
        <SalesDetailModal transno={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-slate-800 font-medium text-sm ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}
