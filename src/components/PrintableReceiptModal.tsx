import React, { useState } from 'react';
import { Sale, StoreSettings } from '../types';
import { BarcodeDisplay } from './BarcodeDisplay';
import { X, Printer, Download, Receipt, CheckCircle, Smartphone } from 'lucide-react';

interface PrintableReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  sale,
  settings,
  onClose,
}) => {
  const [receiptStyle, setReceiptStyle] = useState<'thermal' | 'a4'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sales Invoice & Receipt
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{sale.invoiceNumber}</span>
                <span>·</span>
                <span>{new Date(sale.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setReceiptStyle('thermal')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  receiptStyle === 'thermal'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setReceiptStyle('a4')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  receiptStyle === 'a4'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                A4 Tax Invoice
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/70 flex justify-center">
          <div
            id="printable-receipt"
            className={`bg-white text-slate-900 shadow-md p-6 border border-slate-200 ${
              receiptStyle === 'thermal' ? 'w-[320px] text-xs' : 'w-full max-w-xl text-sm'
            }`}
          >
            {/* Store Header with Shop Logo */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              {settings.logoUrl && (
                <div className="flex justify-center mb-2">
                  <img
                    src={settings.logoUrl}
                    alt={settings.shopName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain rounded-lg border border-slate-200"
                  />
                </div>
              )}
              <h1 className="text-base font-bold tracking-tight uppercase">
                {settings.shopName}
              </h1>
              <p className="text-[11px] text-slate-600 mt-0.5">{settings.tagline}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-slate-600 font-mono">Phone: {settings.phone}</p>
              {settings.taxId && (
                <p className="text-[10px] text-slate-500 font-mono">NTN / Tax ID: {settings.taxId}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-mono font-semibold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono">
                  {new Date(sale.date).toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold">{sale.customerName || 'Walk-in Customer'}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono">{sale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{sale.servedBy}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] text-slate-500 uppercase">
                    <th className="py-1">Item / Model</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((it, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 pr-2">
                        <div className="font-medium text-slate-900 leading-tight">
                          {it.brand} {it.itemName}
                        </div>
                        <div className="text-[10px] text-slate-500">{it.model}</div>
                        {it.imeiNumbers && it.imeiNumbers.length > 0 && (
                          <div className="mt-0.5 text-[9px] font-mono text-slate-600 bg-slate-50 p-0.5 rounded">
                            IMEI: {it.imeiNumbers.join(', ')}
                          </div>
                        )}
                        {it.warrantyMonths && (
                          <div className="text-[9px] text-emerald-700">
                            Warranty: {it.warrantyMonths} Months
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-1.5 text-right font-mono tabular-nums">
                        {settings.currency}{it.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right font-mono font-semibold tabular-nums">
                        {settings.currency}{it.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-mono tabular-nums">
                  {settings.currency}{sale.subtotal.toFixed(2)}
                </span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>
                    Discount {sale.discountType === 'percentage' ? `(${sale.discountValue}%)` : '(Cash)'}
                  </span>
                  <span className="font-mono tabular-nums">
                    -{settings.currency}{sale.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Sales Tax / GST ({sale.taxPercent}%)</span>
                  <span className="font-mono tabular-nums">
                    +{settings.currency}{sale.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-300">
                <span>NET PAYABLE</span>
                <span className="font-mono tabular-nums">
                  {settings.currency}{sale.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold uppercase">{sale.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Tendered:</span>
                <span className="font-mono tabular-nums">
                  {settings.currency}{sale.amountReceived.toFixed(2)}
                </span>
              </div>
              {sale.changeDue > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Change Returned:</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    {settings.currency}{sale.changeDue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Notice & Verification QR */}
            <div className="pt-4 text-center space-y-2">
              <div className="flex justify-center">
                <BarcodeDisplay
                  value={`INV:${sale.invoiceNumber}|TOTAL:${sale.grandTotal}|DATE:${sale.date}`}
                  format="QR"
                  height={32}
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-normal max-w-[280px] mx-auto">
                {settings.receiptFooter}
              </p>
              <div className="text-[9px] text-slate-400 font-mono">
                *** APEXCELL SYSTEM VERIFIED COPY ***
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Press Print to trigger connected POS thermal printer or save as PDF
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
