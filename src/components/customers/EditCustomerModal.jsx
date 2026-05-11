import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const PAYTERMS = ['COD', '30D', '45D'];

export default function EditCustomerModal({ isOpen, onClose, customer, onSubmit, showStamp }) {
  const [form, setForm] = useState({ custname: '', address: '', payterm: 'COD', stamp: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        custname: customer.custname || '',
        address:  customer.address  || '',
        payterm:  customer.payterm  || 'COD',
        stamp:    customer.stamp    || '',
      });
    }
  }, [customer]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { custname: form.custname, address: form.address, payterm: form.payterm };
    if (showStamp) payload.stamp = form.stamp;
    await onSubmit(customer.custno, payload);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit — ${customer?.custno}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Customer ID</label>
          <input className="form-input bg-slate-50 text-slate-400" value={customer?.custno || ''} readOnly />
        </div>
        <div>
          <label className="form-label">Customer Name <span className="text-red-500">*</span></label>
          <input id="editCustname" className="form-input" value={form.custname} onChange={set('custname')} required />
        </div>
        <div>
          <label className="form-label">Address</label>
          <textarea id="editAddress" className="form-input resize-none" rows={2} value={form.address} onChange={set('address')} />
        </div>
        <div>
          <label className="form-label">Payment Term <span className="text-red-500">*</span></label>
          <select id="editPayterm" className="form-input" value={form.payterm} onChange={set('payterm')} required>
            {PAYTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {showStamp && (
          <div>
            <label className="form-label text-amber-600">
              Audit Stamp <span className="text-xs font-normal text-slate-400">(admin only)</span>
            </label>
            <input id="editStamp" className="form-input border-amber-200 bg-amber-50/50 font-mono text-xs" value={form.stamp} onChange={set('stamp')} placeholder="Audit note…" />
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button id="editSubmitBtn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
