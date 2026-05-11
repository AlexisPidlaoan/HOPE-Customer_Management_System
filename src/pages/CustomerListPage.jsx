import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../hooks/useCustomers';
import { useRights } from '../hooks/useRights';
import { useToast } from '../components/ui/ToastProvider';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import EditCustomerModal from '../components/customers/EditCustomerModal';
import SoftDeleteConfirmDialog from '../components/customers/SoftDeleteConfirmDialog';
import { formatPayterm, truncate } from '../lib/formatters';

const PAGE_SIZE = 15;

export default function CustomerListPage() {
  const { profile, isSuperAdmin } = useAuth();
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(profile?.user_type);
  const { hasRight } = useRights();
  const { customers, loading, addCustomer, editCustomer, softDeleteCustomer } = useCustomers();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('custname');
  const [sortDir, setSortDir] = useState('asc');

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter + sort
  const filtered = customers
    .filter((c) =>
      c.custname.toLowerCase().includes(search.toLowerCase()) ||
      c.custno.toLowerCase().includes(search.toLowerCase()) ||
      (c.address || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const v = (a[sortKey] || '').localeCompare(b[sortKey] || '');
      return sortDir === 'asc' ? v : -v;
    });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const th = (key, label) => (
    <th onClick={() => toggleSort(key)} className="cursor-pointer select-none">
      {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  const handleAdd = async (data) => {
    const { error } = await addCustomer(data);
    if (error) toast.error(error.message);
    else { toast.success('Customer added!'); setAddOpen(false); }
  };

  const handleEdit = async (custno, data) => {
    const { error } = await editCustomer(custno, data);
    if (error) toast.error(error.message);
    else { toast.success('Customer updated!'); setEditTarget(null); }
  };

  const handleDelete = async (custno) => {
    const { error } = await softDeleteCustomer(custno, profile?.email);
    if (error) toast.error(error.message);
    else { toast.success('Customer deactivated.'); setDeleteTarget(null); }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{total} active customer{total !== 1 ? 's' : ''}</p>
        </div>
        {hasRight('ADD_CUSTOMER') && (
          <button id="addCustomerBtn" className="btn btn-primary" onClick={() => setAddOpen(true)}>
            ＋ New Customer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="customerSearch"
          type="text"
          placeholder="Search by name, ID, or address…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs">✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={15} columns={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon="👤" title="No customers found" message={search ? 'Try a different search term.' : 'Add your first customer to get started.'} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {th('custno', 'ID')}
                    {th('custname', 'Name')}
                    {th('address', 'Address')}
                    {th('payterm', 'Pay Term')}
                    {isAdmin && <th>Stamp</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.custno} onClick={() => navigate(`/customers/${c.custno}`)}>
                      <td className="font-mono text-xs text-slate-500">{c.custno}</td>
                      <td className="font-semibold text-slate-800">{c.custname}</td>
                      <td className="text-slate-500">{truncate(c.address, 38)}</td>
                      <td><Badge type={c.payterm.toLowerCase()} label={formatPayterm(c.payterm)} /></td>
                      {isAdmin && <td className="text-xs text-slate-400 font-mono">{truncate(c.stamp, 30)}</td>}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {hasRight('EDIT_CUSTOMER') && (
                            <button
                              className="btn btn-outline text-xs py-1 px-2"
                              onClick={() => setEditTarget(c)}
                            >
                              Edit
                            </button>
                          )}
                          {hasRight('DELETE_CUSTOMER') && (
                            <button
                              id={`deleteBtn-${c.custno}`}
                              className="btn btn-danger text-xs py-1 px-2"
                              onClick={() => setDeleteTarget(c)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
              <div className="flex gap-1">
                <button className="btn btn-ghost text-xs py-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span className="px-3 py-1 text-xs">{page} / {pages}</span>
                <button className="btn btn-ghost text-xs py-1" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddCustomerModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
      {editTarget && (
        <EditCustomerModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          customer={editTarget}
          onSubmit={handleEdit}
          showStamp={isAdmin}
        />
      )}
      {deleteTarget && (
        <SoftDeleteConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          customer={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.custno)}
        />
      )}
    </div>
  );
}
