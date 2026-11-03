import React, { useState, useEffect } from 'react';
import { Item, Supplier, CategoryType, Category } from '../types';
import { searchProductImages, ImageCandidate } from '../services/imageFetcher';
import { X, Sparkles, RefreshCw, Barcode, Image as ImageIcon, Check, AlertCircle, Plus } from 'lucide-react';

interface AddItemModalProps {
  suppliers: Supplier[];
  currency: string;
  categories?: Category[];
  initialItem?: Item | null;
  onSave: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddCategory?: (name: string) => Category;
  onClose: () => void;
}

const DEFAULT_FALLBACK_CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: 'Smartphones', value: 'smartphones' },
  { label: 'Feature Phones', value: 'feature_phones' },
  { label: 'Chargers & Cables', value: 'chargers' },
  { label: 'Audio & Earbuds', value: 'audio' },
  { label: 'Screen Protectors', value: 'screen_protectors' },
  { label: 'Cases & Covers', value: 'cases' },
  { label: 'Smartwatches & Wearables', value: 'wearables' },
  { label: 'Power Banks & Batteries', value: 'accessories' },
  { label: 'Spare Parts & Tools', value: 'spare_parts' },
];

const POPULAR_BRANDS = [
  'Samsung',
  'Apple',
  'Xiaomi',
  'Realme',
  'OnePlus',
  'Google',
  'Vivo',
  'Oppo',
  'VelocCharge',
  'Sonicure',
  'Anker',
  'Baseus',
  'Oraimo',
  'Generic / Accessories',
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  suppliers,
  currency,
  categories = [],
  initialItem,
  onSave,
  onAddCategory,
  onClose,
}) => {
  const [name, setName] = useState(initialItem?.name || '');
  const [brand, setBrand] = useState(initialItem?.brand || 'Samsung');
  const [model, setModel] = useState(initialItem?.model || '');
  const [category, setCategory] = useState<CategoryType>(
    initialItem?.category || (categories[0]?.id || 'smartphones')
  );
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const handleCreateCategory = () => {
    if (!newCatInput.trim()) return;
    if (onAddCategory) {
      const created = onAddCategory(newCatInput.trim());
      setCategory(created.id);
    } else {
      setCategory(newCatInput.trim().toLowerCase().replace(/\s+/g, '_'));
    }
    setNewCatInput('');
    setIsAddingNewCat(false);
  };
  
  // Specs
  const [ram, setRam] = useState(initialItem?.specs?.ram || '');
  const [storage, setStorage] = useState(initialItem?.specs?.storage || '');
  const [color, setColor] = useState(initialItem?.specs?.color || '');
  const [compatibility, setCompatibility] = useState(initialItem?.specs?.compatibility || '');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(initialItem?.specs?.warrantyMonths ?? 12);
  const [imeiTracked, setImeiTracked] = useState<boolean>(initialItem?.imeiTracked ?? (category === 'smartphones'));

  // Barcode & Financials
  const [barcode, setBarcode] = useState(initialItem?.barcode || '');
  const [purchasePrice, setPurchasePrice] = useState<number>(initialItem?.purchasePrice || 0);
  const [sellingPrice, setSellingPrice] = useState<number>(initialItem?.sellingPrice || 0);
  const [minSellingPrice, setMinSellingPrice] = useState<number>(initialItem?.minSellingPrice || 0);
  const [quantity, setQuantity] = useState<number>(initialItem?.quantity ?? 0);
  const [reorderThreshold, setReorderThreshold] = useState<number>(initialItem?.reorderThreshold ?? 5);
  const [supplierId, setSupplierId] = useState<string>(initialItem?.supplierId || (suppliers[0]?.id || ''));

  // Smart Web Image Auto-Fetch
  const [imageUrl, setImageUrl] = useState<string>(initialItem?.imageUrl || '');
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [imageCandidates, setImageCandidates] = useState<ImageCandidate[]>([]);
  const [imageVerified, setImageVerified] = useState(!!initialItem?.imageUrl);

  // Auto generate barcode if empty
  useEffect(() => {
    if (!barcode && !initialItem) {
      generateBarcode();
    }
  }, []);

  // Update imeiTracked recommendation on category change
  const handleCategoryChange = (cat: CategoryType) => {
    setCategory(cat);
    if (cat === 'smartphones' || cat === 'feature_phones') {
      setImeiTracked(true);
    } else {
      setImeiTracked(false);
    }
  };

  const generateBarcode = () => {
    const code = '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(code);
  };

  // Trigger Smart Web Image Auto-Fetch
  const handleAutoFetchImage = async () => {
    if (!name && !model) {
      alert('Please enter an Item Name or Model first');
      return;
    }
    setIsSearchingImages(true);
    try {
      const candidates = await searchProductImages({
        name,
        brand,
        model,
        category,
      });
      setImageCandidates(candidates);
      if (candidates.length > 0) {
        setImageUrl(candidates[0].url);
        setImageVerified(true);
      }
    } catch (err) {
      console.error('Image fetch error:', err);
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Financial margin calculations
  const profitMargin = sellingPrice > 0 ? ((sellingPrice - purchasePrice) / sellingPrice) * 100 : 0;
  const unitProfit = sellingPrice - purchasePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Item name is required');
      return;
    }
    if (sellingPrice < purchasePrice) {
      const confirmLow = window.confirm(
        'Warning: Selling price is less than purchase cost! Do you want to proceed?'
      );
      if (!confirmLow) return;
    }

    onSave({
      name: name.trim(),
      brand,
      model: model.trim(),
      category,
      specs: {
        ram: ram.trim() || undefined,
        storage: storage.trim() || undefined,
        color: color.trim() || undefined,
        compatibility: compatibility.trim() || undefined,
        warrantyMonths: Number(warrantyMonths) || 0,
      },
      barcode: barcode.trim(),
      imeiTracked,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      minSellingPrice: Number(minSellingPrice) || Number(purchasePrice),
      quantity: Number(quantity) || 0,
      reorderThreshold: Number(reorderThreshold) || 5,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      supplierId: supplierId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {initialItem ? 'Edit Product Item' : 'Add New Inventory Item'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mobile phones, gadgets, replacement parts & accessories catalog entry
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Identity & Smart Image Auto-Fetch */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Brand / Manufacturer *
                  </label>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {POPULAR_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> {isAddingNewCat ? 'Cancel' : 'New Category'}
                    </button>
                  </div>

                  {isAddingNewCat ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Gaming Triggers, AirTags"
                        value={newCatInput}
                        onChange={(e) => setNewCatInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.length > 0
                        ? categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))
                        : DEFAULT_FALLBACK_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy S24 Ultra or 65W GaN Dual Fast Charger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model & Hardware Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. SM-S928B / 12GB+256GB Titanium"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Hardware Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    RAM
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8GB / 12GB"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Storage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 256GB / 512GB"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Natural Titanium"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Warranty (Mo.)
                  </label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Smart Web Image Auto-Fetch Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Smart Web Image
                </span>
                <button
                  type="button"
                  onClick={handleAutoFetchImage}
                  disabled={isSearchingImages}
                  className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isSearchingImages ? 'animate-spin' : ''}`} />
                  Auto-Fetch
                </button>
              </div>

              {/* Visual Preview Box */}
              <div className="relative w-full aspect-square max-w-[200px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-xs">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span className="text-[11px]">No image selected</span>
                  </div>
                )}
                {imageVerified && imageUrl && (
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Image URL input or candidates picker */}
              <div className="w-full mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Or paste direct image URL..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageVerified(true);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
                />

                {imageCandidates.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {imageCandidates.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setImageUrl(c.url);
                          setImageVerified(true);
                        }}
                        className={`w-10 h-10 shrink-0 rounded border p-0.5 bg-white transition-all ${
                          imageUrl === c.url
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={c.url}
                          alt={c.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Barcode & Serial Identification */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-indigo-500" /> Barcode & Device Serial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Scan or enter barcode / UPC"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="sm:col-span-4 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={imeiTracked}
                    onChange={(e) => setImeiTracked(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Track Individual IMEI/Serial on Sale</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Details & Initial Quantity */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Financial Details & Stock Quantity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Cost ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Retail Selling Price ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Min. Allowed Price ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minSellingPrice}
                  onChange={(e) => setMinSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Stock Qty *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Live Profit Preview Pill */}
            <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-600 dark:text-slate-400">
                  Unit Gross Profit:{' '}
                  <strong className={`font-mono ${unitProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {currency}{unitProfit.toFixed(2)}
                  </strong>
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Gross Margin:{' '}
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                    {profitMargin.toFixed(1)}%
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Low Stock Reorder Alert At:</span>
                <input
                  type="number"
                  min="1"
                  value={reorderThreshold}
                  onChange={(e) => setReorderThreshold(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-0.5 text-xs text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                />
                <span className="text-slate-500">units</span>
              </div>
            </div>
          </div>

          {/* Section 4: Preferred Supplier */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Primary Supplier / Wholesale Party
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="">-- No Preferred Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.company}) - Balance Due: {currency}{s.currentBalance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-sm transition-colors"
          >
            {initialItem ? 'Update Item' : 'Save to Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};
