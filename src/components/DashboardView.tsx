import React, { useState } from 'react';
import { Item, Sale, Supplier, PurchaseRecord, StoreSettings } from '../types';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  PlusCircle,
  Truck,
  BookOpen,
  Calendar,
  Layers,
  Barcode,
} from 'lucide-react';

interface DashboardViewProps {
  items: Item[];
  sales: Sale[];
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  settings: StoreSettings;
  onNavigate: (tab: string) => void;
  onOpenAddItem: () => void;
  onOpenNewPurchase: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  sales,
  suppliers,
  purchases,
  settings,
  onNavigate,
  onOpenAddItem,
  onOpenNewPurchase,
}) => {
  const [chartMetric, setChartMetric] = useState<'sales' | 'profit'>('sales');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');

  // Today calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const salesToday = sales.filter((s) => s.date.startsWith(todayStr));
  const totalSalesToday = salesToday.reduce((a, b) => a + b.grandTotal, 0);
  const totalProfitToday = salesToday.reduce((a, b) => a + b.profit, 0);

  // This Month calculation
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const salesThisMonth = sales.filter((s) => s.date.startsWith(currentMonthStr));
  const totalSalesThisMonth = salesThisMonth.reduce((a, b) => a + b.grandTotal, 0);
  const totalProfitThisMonth = salesThisMonth.reduce((a, b) => a + b.profit, 0);

  // Stock totals
  const totalItemsCount = items.reduce((a, b) => a + b.quantity, 0);
  const totalStockValue = items.reduce((a, b) => a + b.purchasePrice * b.quantity, 0);
  const totalRetailPotential = items.reduce((a, b) => a + b.sellingPrice * b.quantity, 0);

  // Supplier Dues
  const totalSupplierDues = suppliers.reduce(
    (a, b) => a + Math.max(0, b.currentBalance),
    0
  );

  // Zero Stock Items (Notification triggers ONLY when stock value reaches zero)
  const zeroStockItems = items.filter((i) => i.quantity <= 0);

  // Chart Data Preparation:
  // Last 7 days or 6 months
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dStr = d.toISOString().split('T')[0];
    const daySales = sales.filter((s) => s.date.startsWith(dStr));
    const dayTotal = daySales.reduce((a, b) => a + b.grandTotal, 0);
    const dayProfit = daySales.reduce((a, b) => a + b.profit, 0);
    const label = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
    return { date: dStr, label, sales: dayTotal, profit: dayProfit };
  });

  const last6Months = Array.from({ length: 6 }).map((_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const mStr = d.toISOString().slice(0, 7);
    const mLabel = d.toLocaleDateString([], { month: 'short' });
    const monthSales = sales.filter((s) => s.date.startsWith(mStr));
    const monthTotal = monthSales.reduce((a, b) => a + b.grandTotal, 0);
    const monthProfit = monthSales.reduce((a, b) => a + b.profit, 0);
    return { label: mLabel, sales: monthTotal, profit: monthProfit };
  });

  const activeChartData = chartPeriod === 'daily' ? last7Days : last6Months;
  const maxVal = Math.max(
    ...activeChartData.map((d) => (chartMetric === 'sales' ? d.sales : d.profit)),
    100
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales & Profit */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium uppercase tracking-wider text-[11px]">Today's Sales</span>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {settings.currency}{totalSalesToday.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Gross Profit:</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{settings.currency}{totalProfitToday.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card 2: This Month's Revenue */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium uppercase tracking-wider text-[11px]">This Month Sales</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {settings.currency}{totalSalesThisMonth.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Completed Orders:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {salesThisMonth.length} Invoices
            </span>
          </div>
        </div>

        {/* Card 3: Total Stock Value & Inventory Count */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium uppercase tracking-wider text-[11px]">Stock Valuation</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {settings.currency}{totalStockValue.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Total Units in Stock:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {totalItemsCount} units ({items.length} SKUs)
            </span>
          </div>
        </div>

        {/* Card 4: Supplier Pending Dues */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium uppercase tracking-wider text-[11px]">Supplier Payables</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {settings.currency}{totalSupplierDues.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Pending Parties:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {suppliers.filter((s) => s.currentBalance > 0).length} Suppliers
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="p-4 bg-slate-900 text-white dark:bg-slate-800/90 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Store Operations Terminal</h3>
          <p className="text-xs text-slate-400">
            Quick hotkeys: Open POS sale counter, restock inward goods, or manage vendor ledgers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('pos')}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" /> Open POS Terminal
          </button>
          <button
            onClick={onOpenAddItem}
            className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> + Add Item
          </button>
          <button
            onClick={onOpenNewPurchase}
            className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" /> + New Purchase
          </button>
          <button
            onClick={() => onNavigate('ledger')}
            className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" /> Supplier Ledger
          </button>
        </div>
      </div>

      {/* Interactive Charts & Low-Stock Alerts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Sales Revenue & Profit Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live trajectory comparison across {chartPeriod === 'daily' ? 'past 7 days' : 'past 6 months'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Metric Toggle */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setChartMetric('sales')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    chartMetric === 'sales'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartMetric('profit')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    chartMetric === 'profit'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Net Profit
                </button>
              </div>

              {/* Period Toggle */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setChartPeriod('daily')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    chartPeriod === 'daily'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    chartPeriod === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  6 Months
                </button>
              </div>
            </div>
          </div>

          {/* Clean High-Density Interactive Bar / Area Chart */}
          <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {activeChartData.map((d, idx) => {
              const val = chartMetric === 'sales' ? d.sales : d.profit;
              const heightPct = Math.max(8, Math.round((val / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap">
                    {settings.currency}{val.toFixed(0)}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all ${
                      chartMetric === 'sales'
                        ? 'bg-indigo-500/80 group-hover:bg-indigo-600 dark:bg-indigo-600/70 dark:group-hover:bg-indigo-500'
                        : 'bg-emerald-500/80 group-hover:bg-emerald-600 dark:bg-emerald-600/70 dark:group-hover:bg-emerald-500'
                    }`}
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Gross Sales Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Net Margin Profit
              </span>
            </div>
            <span className="font-mono text-[11px]">Values calculated in {settings.currencyCode}</span>
          </div>
        </div>

        {/* Zero Stock Alerts Box (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Zero-Stock Alerts
                </h3>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                zeroStockItems.length > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}>
                {zeroStockItems.length} Stock = 0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notification triggers strictly when stock value reaches zero (0 units). Reorder to resume sales.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
              {zeroStockItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white truncate">
                      {item.brand} {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.model}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      0 Units Left
                    </span>
                    <div className="text-[10px] text-red-500">
                      Out of Stock
                    </div>
                  </div>
                </div>
              ))}

              {zeroStockItems.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  All items have positive inventory (&gt; 0 units). No zero-stock alerts!
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => onNavigate('inventory')}
              className="flex-1 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-center transition-colors"
            >
              View Full Stock
            </button>
            <button
              onClick={onOpenNewPurchase}
              className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg text-center shadow-xs transition-colors"
            >
              Restock Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
