import React, { useState } from 'react';
import { Item, Supplier, PurchaseRecord, PurchaseItemEntry, Category } from '../types';
import { X, ShoppingBag, Plus, Trash2, CheckCircle2, Sparkles, Box, PlusCircle } from 'lucide-react';

interface NewPurchaseModalProps {
  suppliers: Supplier[];
  items: Item[];
  categories?: Category[];
  currency: string;
  initialPurchase?: PurchaseRecord | null;
  onSave: (purchase: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>) => void;
  onAddItemDirectly: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Item;
  onOpenAddItem?: () => void;
  onClose: () => void;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({
  suppliers,
  items,
  categories = [],
  currency,
  initialPurchase,
  onSave,
  onAddItemDirectly,
  onOpenAddItem,
  onClose,
}) => {
  const [supplierId, setSupplierId] = useState<string>(
    initialPurchase?.supplierId || (suppliers[0]?.id || '')
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    initialPurchase
      ? new Date(initialPurchase.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(initialPurchase?.notes || '');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit'>(
    initialPurchase?.paymentMode || 'Bank Transfer'
  );
  const [amountPaid, setAmountPaid] = useState<number>(initialPurchase?.amountPaid || 0);

  // Purchase items array
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemEntry[]>(() => {
    if (initialPurchase && initialPurchase.items.length > 0) {
      return initialPurchase.items;
    }
    if (items.length > 0) {
      return [
        {
          itemId: items[0].id,
          itemName: items[0].name,
          brand: items[0].brand,
          model: items[0].model,
          quantity: 1,
          unitCost: items[0].purchasePrice || 0,
          totalCost: items[0].purchasePrice || 0,
        },
      ];
    }
    return [];
  });

  // Quick Add Item Inline Drawer State
  const [showQuickAddItem, setShowQuickAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('Samsung');
  const [newItemCategory, setNewItemCategory] = useState(categories[0]?.name || 'Smartphones');
  const [newItemModel, setNewItemModel] = useState('');
  const [newItemCost, setNewItemCost] = useState<number>(0);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemBarcode, setNewItemBarcode] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  // Smart Inventory Check & Autofill
  const handleItemSelect = (index: number, selectedId: string) => {
    if (selectedId === '__CREATE_NEW__') {
      setShowQuickAddItem(true);
      return;
    }

    const existing = items.find((i) => i.id === selectedId);
    if (!existing) return;

    setPurchaseItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        itemId: existing.id,
        itemName: existing.name,
        brand: existing.brand,
        model: existing.model,
        unitCost: existing.purchasePrice,
        totalCost: existing.purchasePrice * copy[index].quantity,
      };
      return copy;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const validQty = Math.max(1, qty);
      copy[index].quantity = validQty;
      copy[index].totalCost = copy[index].unitCost * validQty;
      return copy;
    });
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const validCost = Math.max(0, cost);
      copy[index].unitCost = validCost;
      copy[index].totalCost = validCost * copy[index].quantity;
      return copy;
    });
  };

  const addItemRow = () => {
    if (items.length === 0) {
      setShowQuickAddItem(true);
      return;
    }
    const defaultItem = items[0];
    setPurchaseItems((prev) => [
      ...prev,
      {
        itemId: defaultItem.id,
        itemName: defaultItem.name,
        brand: defaultItem.brand,
        model: defaultItem.model,
        quantity: 1,
        unitCost: defaultItem.purchasePrice,
        totalCost: defaultItem.purchasePrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Functional Quick Add Item inside Add Purchase
  const handleCreateItemDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert('Please enter product name');
      return;
    }

    const generatedBarcode = newItemBarcode.trim() || '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const createdItem = onAddItemDirectly({
      name: newItemName.trim(),
      brand: newItemBrand.trim() || 'Generic',
      model: newItemModel.trim(),
      category: newItemCategory,
      specs: {},
      barcode: generatedBarcode,
      imeiTracked: newItemCategory.toLowerCase().includes('phone') || newItemCategory.toLowerCase().includes('handset'),
      purchasePrice: Number(newItemCost) || 0,
      sellingPrice: Number(newItemPrice) || Number(newItemCost) * 1.15,
      minSellingPrice: Number(newItemCost) || 0,
      quantity: 0,
      reorderThreshold: 0,
      imageUrl: '',
      supplierId: supplierId || undefined,
    });

    // Automatically add this new item to the current purchase bill
    setPurchaseItems((prev) => [
      ...prev,
      {
        itemId: createdItem.id,
        itemName: createdItem.name,
        brand: createdItem.brand,
        model: createdItem.model,
        quantity: 1,
        unitCost: createdItem.purchasePrice,
        totalCost: createdItem.purchasePrice,
      },
    ]);

    // Reset quick-add form
    setNewItemName('');
    setNewItemModel('');
    setNewItemCost(0);
    setNewItemPrice(0);
    setNewItemBarcode('');
    setShowQuickAddItem(false);
  };

  const subtotal = purchaseItems.reduce((acc, it) => acc + it.totalCost, 0);
  const totalAmount = subtotal;
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !selectedSupplier) {
      alert('Please select a supplier / wholesale party');
      return;
    }
    if (purchaseItems.length === 0) {
      alert('Please add at least one item to this purchase bill');
      return;
    }

    onSave({
      supplierId,
      supplierName: selectedSupplier.name,
      date: new Date(purchaseDate).toISOString(),
      items: purchaseItems,
      subtotal,
      taxAmount: 0,
      totalAmount,
      amountPaid: Number(amountPaid) || 0,
      balanceDue,
      paymentMode,
      status: 'Completed',
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {initialPurchase ? `Edit Purchase Bill (${initialPurchase.purchaseNumber})` : 'New Stock Purchase & Supplier Bill'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inward goods restock, inventory increment & automatic supplier ledger credit
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top row: Supplier & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Supplier (Party) *
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.company}) — Balance: {currency}{s.currentBalance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purchase / Invoice Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Quick-Add Item Inline Panel */}
          {showQuickAddItem && (
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Quick Add New Item to Inventory & Bill
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickAddItem(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galaxy A55 5G or 33W Fast Charger"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Brand / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung, Apple, Realme, Anker"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Model & Hardware Specs
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8GB/256GB Black"
                    value={newItemModel}
                    onChange={(e) => setNewItemModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newItemCost || ''}
                    onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Retail Selling Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickAddItem(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateItemDirectly}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Item & Add to Bill
                </button>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Purchased Items ({purchaseItems.length})
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddItem(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + Add New Item Here
                </button>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Item / Product (Select or Add New)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Cost ({currency})</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total Cost</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchaseItems.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3">
                        <select
                          value={entry.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                        >
                          <option value="__CREATE_NEW__">-- [+ Quick-Add New Item Right Here...] --</option>
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.brand} {i.name} (Current Stock: {i.quantity})
                            </option>
                          ))}
                        </select>
                        <div className="mt-1 text-[11px] text-slate-400 truncate">
                          {entry.brand} · {entry.model}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-xs text-center font-mono font-semibold tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.unitCost}
                          onChange={(e) => handleUnitCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 text-xs text-right font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {currency}{entry.totalCost.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {purchaseItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <p className="text-xs mb-2">No items added to this purchase bill yet.</p>
                        <button
                          type="button"
                          onClick={() => setShowQuickAddItem(true)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Item to Purchase
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financials & Ledger Settlement */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment Settlement & Ledger Impact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Purchase Bill
                </label>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {currency}{totalAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Amount Paid Now ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm font-semibold font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Added to Supplier Ledger Due
                </label>
                <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  {currency}{balanceDue.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Full Credit (Pay Later)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Invoice / Challan Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shipment verified, seals intact"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Stock inventory and supplier ledger balance will update immediately
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-sm"
            >
              {initialPurchase ? 'Save Edited Purchase Bill' : 'Confirm Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
