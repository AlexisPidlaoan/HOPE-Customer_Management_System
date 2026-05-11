import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { useToast } from '../../components/ui/ToastProvider';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { truncate } from '../../lib/formatters';

export default function DeletedCustomersPage() {
  const { customers, loading, recoverCustomer } = useCustomers({ includeInactive: true });
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [recoverTarget, setRecoverTarget] = useState(null);
  const [working, setWorking] = useState(false);

  // Show INACTIVE only
  const inactive = customers.filter((c) =>
    c.record_status === 'INACTIVE' &&
    (c.custname.toLowerCase().includes(search.toLowerCase()) ||
     c.custno.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRecover = async () => {
    if (!recoverTarget) return;
    setWorking(true);
    const { error } = await recoverCustomer(recoverTarget.custno);
    if (error) toast.error(error.message);
    else toast.success(`${recoverTarget.custname} restored to ACTIVE.`);
    setWorking(false);
    setRecoverTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deleted Customers</h1>
          <p className="page-subtitle">{inactive.length} inactive record{inactive.length !== 1 ? 's' : ''} · Recover to restore visibility</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3 text-amber-700 text-sm">
        <span className="text-lg">ℹ️</span>
        <span>These customers were <strong>soft-deleted</strong>. They have never been permanently removed. Use <strong>Recover</strong> to make them active again.</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="deletedSearch"
          type="text"
          placeholder="Search inactive customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <Spinner label="Loading…" /> : inactive.length === 0 ? (
          <EmptyState icon="✅" title="No inactive customers" message="All customers are currently active." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Pay Term</th>
                <th>Stamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inactive.map((c) => (
                <tr key={c.custno} className="bg-red-50/30">
                  <td className="font-mono text-xs text-slate-400">{c.custno}</td>
                  <td className="font-semibold text-slate-700">{c.custname}</td>
                  <td className="text-slate-500 text-sm">{truncate(c.address, 35)}</td>
                  <td className="text-slate-500 text-sm">{c.payterm}</td>
                  <td className="font-mono text-xs text-slate-400">{truncate(c.stamp, 28)}</td>
                  <td>
                    <button
                      id={`recoverBtn-${c.custno}`}
                      className="btn btn-success text-xs py-1 px-3"
                      onClick={() => setRecoverTarget(c)}
                    >
                      ↩ Recover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!recoverTarget}
        onClose={() => setRecoverTarget(null)}
        onConfirm={handleRecover}
        loading={working}
        title="Recover Customer?"
        message={`Restore "${recoverTarget?.custname}" to ACTIVE status? They will become visible to all users.`}
        confirmLabel="Yes, Recover"
      />
    </div>
  );
}
