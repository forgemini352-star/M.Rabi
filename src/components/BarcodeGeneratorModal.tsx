import React, { useState } from 'react';
import { Item, StoreSettings } from '../types';
import { BarcodeDisplay } from './BarcodeDisplay';
import { X, Printer, Tag, Check, Sparkles, RefreshCw } from 'lucide-react';

interface BarcodeGeneratorModalProps {
  items: Item[];
  initialItem?: Item | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  items,
  initialItem,
  settings,
  onClose,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItem ? initialItem.id : (items[0]?.id || '')
  );
  const [customBarcode, setCustomBarcode] = useState<string>(
    initialItem ? initialItem.barcode : ''
  );
  const [customPrice, setCustomPrice] = useState<number>(
    initialItem ? initialItem.sellingPrice : 0
  );
  const [labelCopies, setLabelCopies] = useState<number>(8);
  const [format, setFormat] = useState<'CODE128' | 'QR'>('CODE128');
  const [includePrice, setIncludePrice] = useState<boolean>(true);
  const [includeShopName, setIncludeShopName] = useState<boolean>(true);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) {
      setCustomBarcode(item.barcode);
      setCustomPrice(item.sellingPrice);
    }
  };

  const generateRandomBarcode = () => {
    const newBarcode = '890' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setCustomBarcode(newBarcode);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Barcode & QR Label Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and print scannable price tags for handsets, covers & accessories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Left Column */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Inventory Item
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => handleItemSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {items.length === 0 && (
                  <option value="">-- Custom Label (Empty Catalog) --</option>
                )}
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.brand} {item.name} ({settings.currency}{item.sellingPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Barcode / Serial Code
                </label>
                <button
                  type="button"
                  onClick={generateRandomBarcode}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                value={customBarcode}
                onChange={(e) => setCustomBarcode(e.target.value)}
                placeholder="e.g. 8806095321014"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Retail Price ({settings.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Label Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={labelCopies}
                  onChange={(e) => setLabelCopies(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Barcode Standard
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('CODE128')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    format === 'CODE128'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Code 128 (Linear)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('QR')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    format === 'QR'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  QR Code (2D)
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeShopName}
                  onChange={(e) => setIncludeShopName(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Include Store Name ({settings.shopName})
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Include Retail Price Label
              </label>
            </div>
          </div>

          {/* Label Sheet Preview Right Column */}
          <div className="md:col-span-7 flex flex-col bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium uppercase tracking-wider text-[11px]">
                Sticker Sheet Live Preview ({labelCopies} Labels)
              </span>
              <span>Label Size: 50mm × 28mm</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[460px] p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-inner">
              <div
                id="printable-labels"
                className="grid grid-cols-2 gap-3 p-2"
              >
                {Array.from({ length: labelCopies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-slate-300 dark:border-slate-700 rounded p-2.5 bg-white text-slate-900 flex flex-col items-center justify-between text-center min-h-[110px]"
                  >
                    {includeShopName && (
                      <div className="text-[10px] font-bold tracking-tight text-slate-800 truncate w-full uppercase">
                        {settings.shopName}
                      </div>
                    )}
                    <div className="text-[11px] font-semibold text-slate-900 leading-tight truncate w-full mt-0.5">
                      {selectedItem ? `${selectedItem.brand} ${selectedItem.name}` : 'Custom Item / Accessory'}
                    </div>

                    <div className="my-1 flex items-center justify-center w-full">
                      <BarcodeDisplay
                        value={customBarcode || '0000000000'}
                        format={format}
                        width={1.2}
                        height={26}
                        displayValue={format !== 'QR'}
                      />
                    </div>

                    {includePrice && (
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {settings.currency}{customPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compatible with standard thermal barcode sticker printers & letter paper
          </p>
          <div className="flex gap-3">
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
              <Printer className="w-4 h-4" /> Print Sticker Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
