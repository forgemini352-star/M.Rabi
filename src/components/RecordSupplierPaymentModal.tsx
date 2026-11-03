import React, { useState } from 'react';
import { Supplier } from '../types';
import { X, CreditCard, DollarSign } from 'lucide-react';

interface RecordSupplierPaymentModalProps {
  supplier: Supplier;
  currency: string;
  onSave: (paymentData: {
    amount: number;
    paymentMode: string;
    referenceNo: string;
    description: string;
  }) => void;
  onClose: () => void;
}

export const RecordSupplierPaymentModal: React.FC<RecordSupplierPaymentModalProps> = ({
  supplier,
  currency,
  onSave,
  onClose,
}) => {
  const [amount, setAmount] = useState<number>(supplier.currentBalance > 0 ? supplier.currentBalance : 0);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>(`PAY-${Date.now().toString().slice(-6)}`);
  const [description, setDescription] = useState<string>('Payment against pending balance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid payment amount greater than zero');
      return;
    }
    onSave({
      amount: Number(amount),
      paymentMode,
      referenceNo: referenceNo.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Record Supplier Payment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {supplier.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Current Outstanding Due:</span>
            <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400">
              {currency}{supplier.currentBalance.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-semibold tabular-nums font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI / Online">UPI / Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Voucher / Reference #
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes & Remarks
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-sm"
            >
              Post Payment to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
