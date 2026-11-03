import React, { useState } from 'react';
import { Item, StoreSettings, UserRole, CategoryType, Category } from '../types';
import {
  Search,
  Plus,
  Barcode,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Smartphone,
  CheckCircle,
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

interface InventoryViewProps {
  items: Item[];
  settings: StoreSettings;
  currentRole: UserRole;
  categories?: Category[];
  onOpenAddItem: (item?: Item | null) => void;
  onOpenBarcodeGenerator: (item?: Item) => void;
  onAdjustStock: (itemId: string, delta: number) => void;
  onDeleteItem: (itemId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  settings,
  currentRole,
  categories = [],
  onOpenAddItem,
  onOpenBarcodeGenerator,
  onAdjustStock,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Quick adjust stock modal state
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock count');

  // Extract unique brands
  const brands = Array.from(new Set(items.map((i) => i.brand))).filter(Boolean);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || item.brand === selectedBrand;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.quantity > 0 && item.quantity <= item.reorderThreshold;
    } else if (stockFilter === 'out') {
      matchesStock = item.quantity <= 0;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat && matchesBrand && matchesStock;

    const matchesQ =
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q) ||
      (item.specs?.storage && item.specs.storage.toLowerCase().includes(q)) ||
      (item.specs?.ram && item.specs.ram.toLowerCase().includes(q));

    return matchesCat && matchesBrand && matchesStock && matchesQ;
  });

  const handleConfirmAdjust = () => {
    if (!adjustingItem) return;
    onAdjustStock(adjustingItem.id, adjustDelta);
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Model, Barcode, RAM, Storage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenBarcodeGenerator()}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Barcode className="w-4 h-4" /> Print Barcode Labels
            </button>
            <button
              onClick={() => onOpenAddItem()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by:
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="smartphones">Smartphones</option>
                <option value="chargers">Chargers & Cables</option>
                <option value="audio">Earbuds & Audio</option>
                <option value="screen_protectors">Screen Protectors</option>
                <option value="cases">Cases & Covers</option>
                <option value="accessories">Power Banks & Accessories</option>
              </>
            )}
          </select>

          {/* Brand filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Stock state filter */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md ml-auto">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                stockFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Stock ({items.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                stockFilter === 'low'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Low Stock (&le; 5)
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                stockFilter === 'out'
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Items Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Preview</th>
                <th className="py-3 px-4">Item & Brand</th>
                <th className="py-3 px-4">Model & Specs</th>
                <th className="py-3 px-4">Barcode / Serial</th>
                {currentRole === 'admin' && (
                  <th className="py-3 px-4 text-right">Cost Price</th>
                )}
                <th className="py-3 px-4 text-right">Selling Price</th>
                {currentRole === 'admin' && (
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                )}
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const isOutOfStock = item.quantity <= 0;
                const isLowStock = item.quantity > 0 && item.quantity <= item.reorderThreshold;
                const marginPct =
                  item.sellingPrice > 0
                    ? ((item.sellingPrice - item.purchasePrice) / item.sellingPrice) * 100
                    : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <Smartphone className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Brand & Name */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Brand: {item.brand}
                      </div>
                    </td>

                    {/* Model & Specs */}
                    <td className="py-2.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200">{item.model}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                        {item.specs?.storage && <span>{item.specs.ram ? `${item.specs.ram} / ` : ''}{item.specs.storage}</span>}
                        {item.specs?.color && <span>· {item.specs.color}</span>}
                        {item.imeiTracked && <span className="text-indigo-600 dark:text-indigo-400 font-medium">· IMEI Tracked</span>}
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {item.barcode}
                    </td>

                    {/* Cost (Admin Protected) */}
                    {currentRole === 'admin' && (
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {settings.currency}{item.purchasePrice.toFixed(2)}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {settings.currency}{item.sellingPrice.toFixed(2)}
                    </td>

                    {/* Margin % (Admin Protected) */}
                    {currentRole === 'admin' && (
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                        <span
                          className={`font-medium ${
                            marginPct >= 20
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {marginPct.toFixed(1)}%
                        </span>
                      </td>
                    )}

                    {/* Stock Quantity */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-sm tabular-nums px-2 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {isOutOfStock && (
                          <span title="Zero Stock Alert: Item has reached 0 units">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustDelta(1);
                          }}
                          title="Quick Stock Count Adjustment"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenBarcodeGenerator(item)}
                          title="Generate Barcode Tag"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAddItem(item)}
                          title="Edit Item"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {currentRole === 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete "${item.brand} ${item.name}" from inventory?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Delete Item"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    {items.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Inventory is completely empty
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Click "+ Add Item" above to add your first mobile phone, charger, or accessory with Pakistani Rupee (Rs.) pricing.
                        </p>
                      </div>
                    ) : (
                      <p>No items found matching the selected filters.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Adjustment Dialog */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Stock Adjustment: {adjustingItem.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current Available: <strong className="text-slate-900 dark:text-white">{adjustingItem.quantity} units</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Change (+ to add, - to subtract)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((d) => d - 1)}
                    className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm font-bold font-mono text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((d) => d + 1)}
                    className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 text-center font-mono">
                  Resulting Stock: {Math.max(0, adjustingItem.quantity + adjustDelta)} units
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Physical stock count">Physical Stock Count Audit</option>
                  <option value="Damaged / Scratched unit">Damaged / Scratched Unit</option>
                  <option value="Display / Demo unit">Display / Counter Demo Unit</option>
                  <option value="Customer return replacement">Customer Return Replacement</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
