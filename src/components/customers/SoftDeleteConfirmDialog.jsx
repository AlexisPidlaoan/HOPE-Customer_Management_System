import { useState } from 'react';
import Modal from '../ui/Modal';

export default function SoftDeleteConfirmDialog({ isOpen, onClose, customer, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Customer" size="sm">
      <div className="flex gap-4 items-start mb-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
        <div>
          <p className="font-semibold text-slate-800">{customer?.custname}</p>
          <p className="text-sm text-slate-500 mt-1">
            This customer will be marked <strong>INACTIVE</strong> and hidden from standard users.
            The record is <strong>not deleted</strong> and can be recovered later by an administrator.
          </p>
          <p className="text-xs text-slate-400 mt-2">Customer ID: {customer?.custno}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button
          id="confirmDeactivateBtn"
          className="btn btn-danger"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Processing…' : 'Yes, Deactivate'}
        </button>
      </div>
    </Modal>
  );
}
