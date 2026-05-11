import Modal from '../ui/Modal';
import { useSaleDetail } from '../../hooks/useSales';
import { formatDate, formatCurrency } from '../../lib/formatters';
import Spinner from '../ui/Spinner';

export default function SalesDetailModal({ transno, onClose }) {
  const { detail, items, loading } = useSaleDetail(transno);

  const total = items.reduce(
    (sum, i) => sum + (i.quantity * (i.product_current_price?.current_price || 0)),
    0
  );

  return (
    <Modal isOpen={!!transno} onClose={onClose} title={`Transaction — ${transno}`} size="lg">
      {loading ? (
        <Spinner label="Loading transaction…" />
      ) : (
        <div className="space-y-5">
          {/* Header info */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-slate-800 text-sm">{detail?.customer?.custname || detail?.custno}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p className="font-semibold text-slate-800 text-sm">{formatDate(detail?.salesdate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Employee</p>
              <p className="font-semibold text-slate-800 text-sm">{detail?.empno || '—'}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const price = item.product_current_price?.current_price || 0;
                  const subtotal = item.quantity * price;
                  return (
                    <tr key={item.prodcode}>
                      <td className="font-mono text-xs text-slate-500">{item.prodcode}</td>
                      <td className="font-medium text-slate-800">{item.product_current_price?.description || item.prodcode}</td>
                      <td className="text-slate-500 text-sm">{item.product_current_price?.unit || '—'}</td>
                      <td className="text-right font-semibold">{item.quantity}</td>
                      <td className="text-right text-slate-600">{formatCurrency(price)}</td>
                      <td className="text-right font-bold text-slate-800">{formatCurrency(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={5} className="text-right font-bold text-slate-700 px-4 py-3">Total</td>
                  <td className="text-right font-black text-blue-700 px-4 py-3 text-base">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* View-only notice */}
          <p className="text-xs text-slate-400 text-center">
            🔒 This transaction is view-only. No modifications are permitted.
          </p>
        </div>
      )}
    </Modal>
  );
}
