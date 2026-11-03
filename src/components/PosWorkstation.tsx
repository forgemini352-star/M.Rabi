import React, { useState, useEffect, useRef } from 'react';
import { Item, Sale, SaleItemEntry, StoreSettings, UserRole } from '../types';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Smartphone,
  Tag,
  DollarSign,
  Percent,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PosWorkstationProps {
  items: Item[];
  settings: StoreSettings;
  currentRole: UserRole;
  onCompleteSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber'>) => void;
  onOpenBarcodeGenerator: (item?: Item) => void;
}

export const PosWorkstation: React.FC<PosWorkstationProps> = ({
  items,
  settings,
  currentRole,
  onCompleteSale,
  onOpenBarcodeGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItemEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI/Bank' | 'Split' | 'Store Credit'>('Cash');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.defaultTaxRate);
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Hardware barcode scanner input reference
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus search on load for fast barcode scanning
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  // Handle hardware barcode scan (when user hits Enter in search)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchQuery.trim();
      if (!code) return;

      // Exact barcode match
      const exactBarcodeMatch = items.find((i) => i.barcode === code);
      if (exactBarcodeMatch) {
        addToCart(exactBarcodeMatch);
        setSearchQuery('');
        return;
      }

      // If only 1 item matches, add it
      if (filteredItems.length === 1) {
        addToCart(filteredItems[0]);
        setSearchQuery('');
      }
    }
  };

  // Add Item to Cart with Real-time Stock Validation
  const addToCart = (item: Item) => {
    if (item.quantity <= 0) {
      if (currentRole === 'staff') {
        alert(`Stock Out! "${item.brand} ${item.name}" has 0 units remaining. Staff cannot sell out-of-stock items.`);
        return;
      } else {
        const allowOverride = window.confirm(
          `Stock Out: "${item.name}" has 0 stock. As Admin, do you want to force-add to sale?`
        );
        if (!allowOverride) return;
      }
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.itemId === item.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty >= item.quantity && currentRole === 'staff') {
          alert(`Cannot add more than available stock (${item.quantity} units)`);
          return prev;
        }
        const updated = [...prev];
        const newQty = currentQty + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: (updated[existingIndex].unitPrice - updated[existingIndex].discountAmount) * newQty,
        };
        return updated;
      } else {
        const defaultWarranty = item.specs?.warrantyMonths || (item.category === 'smartphones' ? 12 : 0);
        const newEntry: SaleItemEntry = {
          itemId: item.id,
          itemName: item.name,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: 1,
          unitPrice: item.sellingPrice,
          unitCost: item.purchasePrice,
          discountAmount: 0,
          totalPrice: item.sellingPrice,
          imeiNumbers: item.imeiTracked ? [''] : undefined,
          warrantyMonths: defaultWarranty,
        };
        return [...prev, newEntry];
      }
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    setCart((prev) => {
      return prev
        .map((entry) => {
          if (entry.itemId === itemId) {
            const newQty = entry.quantity + delta;
            if (newQty <= 0) return null;
            if (item && newQty > item.quantity && currentRole === 'staff') {
              alert(`Cannot exceed available stock of ${item.quantity} units`);
              return entry;
            }
            return {
              ...entry,
              quantity: newQty,
              totalPrice: (entry.unitPrice - entry.discountAmount) * newQty,
            };
          }
          return entry;
        })
        .filter(Boolean) as SaleItemEntry[];
    });
  };

  const updateCartUnitPrice = (itemId: string, newPrice: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item && currentRole === 'staff' && newPrice < item.minSellingPrice) {
      alert(`Staff restricted: Price cannot be lower than minimum price (${settings.currency}${item.minSellingPrice})`);
      return;
    }
    setCart((prev) =>
      prev.map((entry) => {
        if (entry.itemId === itemId) {
          const validPrice = Math.max(0, newPrice);
          return {
            ...entry,
            unitPrice: validPrice,
            totalPrice: (validPrice - entry.discountAmount) * entry.quantity,
          };
        }
        return entry;
      })
    );
  };

  const updateImeiNumber = (itemId: string, imeiIndex: number, value: string) => {
    setCart((prev) =>
      prev.map((entry) => {
        if (entry.itemId === itemId) {
          const currentImeis = entry.imeiNumbers ? [...entry.imeiNumbers] : [];
          currentImeis[imeiIndex] = value.trim();
          return {
            ...entry,
            imeiNumbers: currentImeis,
          };
        }
        return entry;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Clear all items from current cart?')) {
      setCart([]);
      setDiscountValue(0);
      setAmountTendered(0);
    }
  };

  // Automated Calculations
  const subtotal = cart.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalCost = cart.reduce((acc, it) => acc + it.unitCost * it.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'flat') {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  } else {
    discountAmount = (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * Math.max(0, taxPercent)) / 100;
  const grandTotal = taxableAmount + taxAmount;
  const netProfit = grandTotal - totalCost;
  const changeDue = Math.max(0, (amountTendered || grandTotal) - grandTotal);

  // Sync amount tendered with grand total if not set
  useEffect(() => {
    if (amountTendered === 0 || amountTendered < grandTotal) {
      setAmountTendered(Math.ceil(grandTotal));
    }
  }, [grandTotal]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to checkout.');
      return;
    }

    // Verify IMEI entries for tracked items
    for (const entry of cart) {
      if (entry.imeiNumbers && entry.imeiNumbers.length > 0) {
        for (let i = 0; i < entry.quantity; i++) {
          const imei = entry.imeiNumbers[i];
          if (!imei || imei.length < 5) {
            const proceedWithoutImei = window.confirm(
              `Notice: IMEI / Serial for "${entry.brand} ${entry.itemName}" (unit #${i + 1}) is missing or short. Complete sale without IMEI?`
            );
            if (!proceedWithoutImei) return;
          }
        }
      }
    }

    onCompleteSale({
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: cart,
      subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount,
      taxPercent,
      taxAmount,
      grandTotal,
      totalCost,
      profit: netProfit,
      paymentMode,
      amountReceived: Number(amountTendered) || grandTotal,
      changeDue,
      servedBy: currentRole === 'admin' ? 'Store Manager (Admin)' : 'Sales Counter (Staff)',
      notes: notes.trim() || undefined,
    });

    // Reset workstation for next customer
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountValue(0);
    setNotes('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[700px]">
      {/* Left: Product Catalog & Fast Search (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Search & Barcode Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Scan Barcode gun or search Name, Model, Brand... (Press Enter to Add)"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1">
                <Barcode className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Functional interactive tabs) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              All Products ({items.length})
            </button>
            <button
              onClick={() => setSelectedCategory('smartphones')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'smartphones'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Smartphones
            </button>
            <button
              onClick={() => setSelectedCategory('chargers')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'chargers'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Chargers & Cables
            </button>
            <button
              onClick={() => setSelectedCategory('audio')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'audio'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Earbuds & Audio
            </button>
            <button
              onClick={() => setSelectedCategory('screen_protectors')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'screen_protectors'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Glass Protectors
            </button>
            <button
              onClick={() => setSelectedCategory('cases')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'cases'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Cases & Covers
            </button>
            <button
              onClick={() => setSelectedCategory('accessories')}
              className={`px-3 py-1.5 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'accessories'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Power Banks & More
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => {
            const isOutOfStock = item.quantity <= 0;
            const isLowStock = item.quantity > 0 && item.quantity <= item.reorderThreshold;

            return (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all text-left cursor-pointer select-none ${
                  isOutOfStock
                    ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-red-300'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Image slot with safe fallback */}
                  <div className="relative aspect-square w-full rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden mb-2">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Smartphone className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}

                    {/* Stock Alert Badge */}
                    <div className="absolute bottom-1 right-1">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          Only {item.quantity} left
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Stock: {item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Brand & Name */}
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {item.brand}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  {item.specs?.storage && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.specs.ram ? `${item.specs.ram} / ` : ''}{item.specs.storage} {item.specs.color ? `· ${item.specs.color}` : ''}
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {settings.currency}{item.sellingPrice.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBarcodeGenerator(item);
                    }}
                    title="Print Barcode Tag"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              {items.length === 0 ? (
                <>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Catalog is currently empty</p>
                  <p className="text-xs text-slate-500 mt-1">Go to Inventory to Add Items or Purchases to Inward Stock</p>
                </>
              ) : (
                <>
                  <p className="text-sm">No items found matching "{searchQuery}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching by brand or scan barcode</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart, Discounts & Fast Checkout (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Current Sale Cart
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Customer Input Row */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="Phone (for Warranty)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((entry) => (
            <div
              key={entry.itemId}
              className="p-3 bg-slate-50/60 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {entry.brand} {entry.itemName}
                  </div>
                  <div className="text-[11px] text-slate-400">{entry.model}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                    {settings.currency}{entry.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    @{settings.currency}{entry.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Price override */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-0.5">
                  <button
                    onClick={() => updateCartQuantity(entry.itemId, -1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                    {entry.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(entry.itemId, 1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>Unit:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={entry.unitPrice}
                      onChange={(e) => updateCartUnitPrice(entry.itemId, parseFloat(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 text-right font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                    />
                  </div>

                  <button
                    onClick={() => removeFromCart(entry.itemId)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IMEI input slots for tracked devices */}
              {entry.imeiNumbers && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-indigo-500" />
                    Handset Serial / IMEI Tracker
                  </div>
                  {Array.from({ length: entry.quantity }).map((_, imeiIdx) => (
                    <input
                      key={imeiIdx}
                      type="text"
                      placeholder={`Scan or enter IMEI #${imeiIdx + 1} (15 digits)`}
                      value={entry.imeiNumbers?.[imeiIdx] || ''}
                      onChange={(e) => updateImeiNumber(entry.itemId, imeiIdx, e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Sale cart is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Scan a barcode or click any item from the catalog on the left
              </p>
            </div>
          )}
        </div>

        {/* Calculations & Discount Section */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Custom Discount Engine */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" /> Discount:
            </span>
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDiscountType('flat')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    discountType === 'flat' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {settings.currency} Flat
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    discountType === 'percentage' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  %
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-xs text-right font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Subtotal & Net Payable */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">
                {settings.currency}{subtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono tabular-nums font-semibold">
                  -{settings.currency}{discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Sales Tax / GST ({taxPercent}%):</span>
                <span className="font-mono tabular-nums">
                  +{settings.currency}{taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>NET PAYABLE</span>
              <span className="font-mono tabular-nums text-lg text-indigo-600 dark:text-indigo-400">
                {settings.currency}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['Cash', 'Card', 'UPI/Bank', 'Store Credit'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  paymentMode === mode
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Quick Cash Tender & Change Due */}
          {paymentMode === 'Cash' && (
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Cash Received:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>{settings.currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-xs text-right font-semibold tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Change Returned:</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 text-sm">
                  {settings.currency}{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Complete Sale & Print Receipt ({settings.currency}{grandTotal.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};
