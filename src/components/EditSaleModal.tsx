import React, { useState } from 'react';
import { Sale, SaleItemEntry, StoreSettings } from '../types';
import { X, Trash2, Plus, Minus, Save } from 'lucide-react';

interface EditSaleModalProps {
  sale: Sale;
  settings: StoreSettings;
  onSave: (id: string, updatedData: Omit<Sale, 'id' | 'invoiceNumber'>) => void;
  onClose: () => void;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  sale,
  settings,
  onSave,
  onClose,
}) => {
  const [customerName, setCustomerName] = useState(sale.customerName);
  const [customerPhone, setCustomerPhone] = useState(sale.customerPhone || '');
  const [paymentMode, setPaymentMode] = useState<Sale['paymentMode']>(sale.paymentMode);
  const [items, setItems] = useState<SaleItemEntry[]>([...sale.items]);
  const [discountAmount, setDiscountAmount] = useState<number>(sale.discountAmount);
  const [taxPercent, setTaxPercent] = useState<number>(sale.taxPercent || 0);
  const [notes, setNotes] = useState(sale.notes || '');

  const updateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.quantity = newQty;
      item.totalPrice = item.unitPrice * newQty - item.discountAmount;
      updated[index] = item;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Sale invoice must contain at least one item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const effectiveDiscount = Math.min(discountAmount, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - effectiveDiscount);
  const taxAmount = (discountedSubtotal * taxPercent) / 100;
  const grandTotal = discountedSubtotal + taxAmount;
  const totalCost = items.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);
  const profit = grandTotal - totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    onSave(sale.id, {
      date: sale.date,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      paymentMode,
      items,
      subtotal,
      discountType: sale.discountType || 'flat',
      discountValue: sale.discountValue || effectiveDiscount,
      discountAmount: effectiveDiscount,
      taxPercent,
      taxAmount,
      grandTotal,
      totalCost,
      profit,
      amountReceived: grandTotal,
      changeDue: 0,
      servedBy: sale.servedBy || 'Staff / Admin',
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Edit Sales Invoice #{sale.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modifying quantities automatically recalculates totals and balances inventory stock.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Debit/Credit Card</option>
                <option value="UPI/Bank">Online / Bank Transfer</option>
                <option value="Store Credit">Store Credit / Khata</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Invoice Items ({items.length})
            </label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                        <div>{it.itemName}</div>
                        {it.imeiNumbers && it.imeiNumbers.length > 0 && (
                          <div className="text-[10px] font-mono text-indigo-500">
                            IMEI: {it.imeiNumbers.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {settings.currency}{it.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateItemQty(idx, it.quantity - 1)}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold px-1.5">{it.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(idx, it.quantity + 1)}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {settings.currency}{it.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discount ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 mb-1">
                Invoice Notes
              </label>
              <input
                type="text"
                placeholder="Optional customer notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{settings.currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>Discount:</span>
                <span>-{settings.currency}{effectiveDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax ({taxPercent}%):</span>
                <span>+{settings.currency}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Updated Grand Total:</span>
                <span>{settings.currency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save & Update Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
