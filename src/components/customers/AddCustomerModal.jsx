import { useState } from 'react';
import Modal from '../ui/Modal';

const PAYTERMSS = ['COD', '30D', '45D'];

export default function AddCustomerModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ custno: '', custname: '', address: '', payterm: 'COD' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ ...form, record_status: 'ACTIVE' });
    setLoading(false);
    setForm({ custno: '', custname: '', address: '', payterm: 'COD' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Customer ID <span className="text-red-500">*</span></label>
            <input id="custno" className="form-input" value={form.custno} onChange={set('custno')} required placeholder="C083" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Payment Term <span className="text-red-500">*</span></label>
            <select id="payterm" className="form-input" value={form.payterm} onChange={set('payterm')} required>
              {PAYTERMSS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Customer Name <span className="text-red-500">*</span></label>
          <input id="custname" className="form-input" value={form.custname} onChange={set('custname')} required placeholder="Dela Cruz Trading Co." />
        </div>
        <div>
          <label className="form-label">Address</label>
          <textarea id="address" className="form-input resize-none" rows={2} value={form.address} onChange={set('address')} placeholder="123 Rizal Ave, Manila" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button id="addSubmitBtn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : '＋ Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
