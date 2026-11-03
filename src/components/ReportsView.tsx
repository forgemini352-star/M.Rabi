import React, { useState } from 'react';
import { Sale, StoreSettings, UserRole } from '../types';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  FileSpreadsheet,
  Printer,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  settings: StoreSettings;
  currentRole: UserRole;
  onOpenReceipt: (sale: Sale) => void;
  onEditSale?: (sale: Sale) => void;
  onDeleteSale?: (saleId: string) => void;
  onPromptAdminUnlock: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  settings,
  currentRole,
  onOpenReceipt,
  onEditSale,
  onDeleteSale,
  onPromptAdminUnlock,
}) => {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Security check: staff is restricted from financial profit & loss
  if (currentRole === 'staff') {
    return (
      <div className="p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Restricted Area: Financial Profit & Loss Reports
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Role-Based Access Control is active. Net margin, purchase cost sheets and profit/loss statements are restricted to Store Administrators.
        </p>
        <button
          onClick={onPromptAdminUnlock}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
        >
          Enter Admin PIN to Unlock
        </button>
      </div>
    );
  }

  // Filter sales by selected period
  const filteredSales = sales.filter((s) => {
    if (period === 'daily') {
      return s.date.startsWith(filterDate);
    } else if (period === 'monthly') {
      const monthPrefix = filterDate.slice(0, 7);
      return s.date.startsWith(monthPrefix);
    }
    return true;
  });

  // Calculate Financials
  const grossRevenue = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
  const totalDiscounts = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalTaxes = filteredSales.reduce((acc, s) => acc + s.taxAmount, 0);
  const netSalesRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCOGS = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const netProfit = netSalesRevenue - totalCOGS;
  const overallMargin = netSalesRevenue > 0 ? (netProfit / netSalesRevenue) * 100 : 0;

  // Breakdown by Category
  const categoryMap: { [cat: string]: { sales: number; profit: number; count: number } } = {};
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const cat = item.category || 'other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { sales: 0, profit: 0, count: 0 };
      }
      categoryMap[cat].sales += item.totalPrice;
      categoryMap[cat].profit += item.totalPrice - (item.unitCost * item.quantity);
      categoryMap[cat].count += item.quantity;
    });
  });

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Financial Profit & Loss Statement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated Net Profit calculated by comparing Sales Revenue against Cost of Goods Sold (COGS)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 font-medium rounded-md ${
                period === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 font-medium rounded-md ${
                period === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly Report
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 font-medium rounded-md ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
          </div>

          {period !== 'all' && (
            <input
              type={period === 'monthly' ? 'month' : 'date'}
              value={period === 'monthly' ? filterDate.slice(0, 7) : filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          )}

          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Print Financial Statement"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* P&L Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Gross Sales Revenue
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {settings.currency}{netSalesRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">
            From {filteredSales.length} finalized orders
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Cost of Goods (COGS)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-600 dark:text-slate-400 tabular-nums">
            {settings.currency}{totalCOGS.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">
            Wholesale purchase cost of sold inventory
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Net Profit Earned
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {settings.currency}{netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-500 font-medium">
            Net cash balance generated
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Profit Margin %
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {overallMargin.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">
            Total discounts: {settings.currency}{totalDiscounts.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Category Contribution & Margin Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(categoryMap).map(([cat, val]) => (
            <div
              key={cat}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {cat.replace('_', ' ')}
              </div>
              <div className="text-slate-500 text-[11px]">
                {val.count} items sold
              </div>
              <div className="pt-1 flex justify-between font-mono">
                <span className="text-slate-500">Revenue:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {settings.currency}{val.sales.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Profit:</span>
                <span>+{settings.currency}{val.profit.toFixed(0)}</span>
              </div>
            </div>
          ))}

          {Object.keys(categoryMap).length === 0 && (
            <div className="col-span-full py-6 text-center text-slate-400 text-xs">
              No sales recorded for this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Recent Finalized Sales Register */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Detailed Sales Invoices Register ({filteredSales.length})
          </h3>
          <span className="text-slate-400">Click any row to view or reprint receipt</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-3">Items Sold</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Bill Total</th>
                <th className="py-2.5 px-3 text-right">Cost (COGS)</th>
                <th className="py-2.5 px-3 text-right">Net Profit</th>
                <th className="py-2.5 px-4 text-center">Receipt & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <td className="py-2.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">
                    {new Date(sale.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-800 dark:text-slate-200">
                    {sale.customerName}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                    {sale.items.reduce((a, b) => a + b.quantity, 0)} pcs ({sale.items[0]?.itemName}...)
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sale.paymentMode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {settings.currency}{sale.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                    {settings.currency}{sale.totalCost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{settings.currency}{sale.profit.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(sale)}
                        title="View / Print Receipt"
                        className="px-2 py-1 text-[11px] text-slate-600 hover:text-indigo-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Receipt
                      </button>
                      {onEditSale && (
                        <button
                          type="button"
                          onClick={() => onEditSale(sale)}
                          title="Edit Sales Bill"
                          className="px-2 py-1 text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {onDeleteSale && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete Sale Invoice #${sale.invoiceNumber}?\n\nThis will permanently remove the bill and automatically return the sold items back to your stock inventory.`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          title="Delete Bill & Rollback Stock"
                          className="px-2 py-1 text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    No sales recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
