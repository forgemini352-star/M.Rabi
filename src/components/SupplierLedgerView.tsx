import React, { useState } from 'react';
import { Supplier, SupplierLedgerEntry, PurchaseRecord, StoreSettings, UserRole } from '../types';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
  Truck,
  BookOpen,
} from 'lucide-react';

interface SupplierLedgerViewProps {
  suppliers: Supplier[];
  ledgerEntries: SupplierLedgerEntry[];
  purchases: PurchaseRecord[];
  settings: StoreSettings;
  currentRole: UserRole;
  onOpenAddSupplier: (supplier?: Supplier | null) => void;
  onOpenRecordPayment: (supplier: Supplier) => void;
  onOpenNewPurchase: () => void;
  onEditPurchase?: (purchase: PurchaseRecord) => void;
  onDeletePurchase?: (purchaseId: string) => void;
}

export const SupplierLedgerView: React.FC<SupplierLedgerViewProps> = ({
  suppliers,
  ledgerEntries,
  purchases,
  settings,
  currentRole,
  onOpenAddSupplier,
  onOpenRecordPayment,
  onOpenNewPurchase,
  onEditPurchase,
  onDeletePurchase,
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'purchases'>('ledger');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || ''
  );
  const [searchSupplier, setSearchSupplier] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchSupplier.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  });

  // Ledger entries for active supplier
  const supplierLedger = ledgerEntries.filter(
    (e) => e.supplierId === (selectedSupplier?.id || '')
  );

  // Total debits (payments made) and credits (purchases made)
  const totalDebits = supplierLedger.reduce((a, b) => a + b.debit, 0);
  const totalCredits = supplierLedger.reduce((a, b) => a + b.credit, 0);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Supplier Ledger & Accounts Payable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time party balances, transaction debits/credits & purchase order receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Party Ledgers
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'purchases'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Purchase History ({purchases.length})
            </button>
          </div>

          <button
            onClick={() => onOpenAddSupplier()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Party
          </button>
        </div>
      </div>

      {activeTab === 'ledger' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Supplier List (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden max-h-[750px]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Search vendor or party name..."
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.map((s) => {
                const isSelected = selectedSupplier?.id === s.id;
                const hasDue = s.currentBalance > 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSupplierId(s.id)}
                    className={`p-3.5 cursor-pointer text-left transition-colors select-none ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {s.company}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-bold text-xs tabular-nums ${
                            hasDue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {settings.currency}{s.currentBalance.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {hasDue ? 'Due Payable' : 'Settled'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="font-mono">{s.phone}</span>
                      <span>{s.contactPerson}</span>
                    </div>
                  </div>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No suppliers found matching query
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Supplier Ledger Statement (8 cols) */}
          {selectedSupplier ? (
            <div className="lg:col-span-8 space-y-4">
              {/* Supplier Header & Summary Cards */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedSupplier.name}
                      </h3>
                      <button
                        onClick={() => onOpenAddSupplier(selectedSupplier)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Edit Details
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Phone: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedSupplier.phone}</strong></span>
                      <span>Email: <strong className="text-slate-700 dark:text-slate-300">{selectedSupplier.email || 'N/A'}</strong></span>
                      <span>Address: <strong className="text-slate-700 dark:text-slate-300">{selectedSupplier.address}</strong></span>
                      {selectedSupplier.taxId && <span>Tax ID: <strong className="font-mono">{selectedSupplier.taxId}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenRecordPayment(selectedSupplier)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CreditCard className="w-4 h-4" /> Record Payment
                    </button>
                    <button
                      onClick={onOpenNewPurchase}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-4 h-4" /> New Purchase
                    </button>
                    <button
                      onClick={handlePrintStatement}
                      title="Print Ledger Statement"
                      className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ledger Financial Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-500 block mb-1">Total Purchases (Credit)</span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {settings.currency}{totalCredits.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-slate-500 block mb-1">Total Payments (Debit)</span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {settings.currency}{totalDebits.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-amber-800 dark:text-amber-400 block mb-1 font-medium">
                      Net Current Outstanding
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
                      {settings.currency}{selectedSupplier.currentBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Running Ledger Statement Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Ledger Statement Entries ({supplierLedger.length})
                  </h4>
                  <span className="text-slate-400">
                    Chronological audit trail
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Reference #</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-3 text-right">Debit (Paid)</th>
                        <th className="py-2.5 px-3 text-right">Credit (Bill)</th>
                        <th className="py-2.5 px-4 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {supplierLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-sans">
                            {new Date(entry.date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                entry.type === 'PAYMENT'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : entry.type === 'PURCHASE'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                            {entry.referenceNo}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-sans max-w-xs truncate">
                            {entry.description}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {entry.debit > 0 ? `${settings.currency}${entry.debit.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-white">
                            {entry.credit > 0 ? `${settings.currency}${entry.credit.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900 dark:text-white">
                            {settings.currency}{entry.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}

                      {supplierLedger.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                            No ledger transactions recorded yet for this supplier.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No supplier selected. Click "+ Add Party" to register a wholesale vendor.
            </div>
          )}
        </div>
      ) : (
        /* Purchases List Tab */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Stock Inward Purchase Bills ({purchases.length})
            </h3>
            <button
              onClick={onOpenNewPurchase}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Purchase
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier (Party)</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Bill Total</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {po.purchaseNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(po.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {po.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {settings.currency}{po.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {settings.currency}{po.amountPaid.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                      {settings.currency}{po.balanceDue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditPurchase && (
                          <button
                            type="button"
                            onClick={() => onEditPurchase(po)}
                            title="Edit Purchase Bill"
                            className="px-2 py-1 text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {onDeletePurchase && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete Purchase Bill #${po.purchaseNumber}?\n\nThis will permanently delete the purchase record, deduct the added quantities from store stock, and adjust the supplier ledger balance.`)) {
                                onDeletePurchase(po.id);
                              }
                            }}
                            title="Delete Purchase Bill & Rollback Stock"
                            className="px-2 py-1 text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
