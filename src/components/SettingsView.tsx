import React, { useState, useRef } from 'react';
import { StoreSettings, DatabaseBackup, UserRole, Category } from '../types';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Store,
  Plus,
  Trash2,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';

interface SettingsViewProps {
  settings: StoreSettings;
  currentRole: UserRole;
  categories?: Category[];
  onSaveSettings: (settings: StoreSettings) => void;
  onAddCategory?: (name: string) => void;
  onDeleteCategory?: (id: string) => void;
  onExportBackup: () => void;
  onRestoreBackup: (backup: DatabaseBackup) => void;
  onResetDemo: () => void;
  onPromptAdminUnlock: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentRole,
  categories = [],
  onSaveSettings,
  onAddCategory,
  onDeleteCategory,
  onExportBackup,
  onRestoreBackup,
  onResetDemo,
  onPromptAdminUnlock,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  if (currentRole === 'staff') {
    return (
      <div className="p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Admin Settings & System Backups
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Store profile configurations, database backup exports and security PIN management are restricted to Store Administrators.
        </p>
        <button
          onClick={onPromptAdminUnlock}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
        >
          Enter Admin PIN to Access
        </button>
      </div>
    );
  }

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backupData: DatabaseBackup = JSON.parse(text);
        if (!backupData.items || !backupData.suppliers) {
          throw new Error('Invalid backup file format');
        }
        onRestoreBackup(backupData);
        setRestoreSuccess(true);
        setRestoreError(null);
        setTimeout(() => setRestoreSuccess(false), 4000);
      } catch (err: any) {
        setRestoreError(err.message || 'Failed to read backup file');
        setRestoreSuccess(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              System Settings & Data Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receipt branding, tax configuration, role security and zero-loss local backup recovery
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Recovery Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Data Backup & Disaster Recovery (.bak / .db)
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your complete store database (Inventory items, supplier ledgers, sales invoices, purchase logs) into a portable verified backup file to prevent data loss.
        </p>

        {restoreSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Database restored successfully! All records, stock counts and ledgers are synchronized.
          </div>
        )}

        {restoreError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Error restoring backup: {restoreError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export Complete Backup (.bak)
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.bak"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" /> Restore from File (.bak)
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clean Storage: This will set all stock to 0, clear all sales/purchases/ledger history, and reset currency to PKR (Rs.). Do you want to proceed?')) {
                onResetDemo();
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 rounded-lg border border-red-200 dark:border-red-900/60 ml-auto transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clean Storage (Reset to Stock 0)
          </button>
        </div>
      </div>

      {/* Store Profile & Receipt Settings Form */}
      <form onSubmit={handleSave} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Store Profile & Receipt Branding
            </h3>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Settings Saved!
            </span>
          )}
        </div>

        {/* Shop Logo Display & URL */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="shrink-0 text-center">
            <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center shadow-xs overflow-hidden">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Shop Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Live Preview</span>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white">
              Shop Logo URL (Emblem / Monogram)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This logo is shown on the top navbar application header and printed prominently on all customer invoice bills and receipts.
            </p>
            <input
              type="text"
              placeholder="e.g. /src/assets/images/... or https://..."
              value={formData.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Store / Shop Name
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Store Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Physical Shop Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tax ID / GSTIN
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Thermal Receipt Terms & Footer Text
            </label>
            <textarea
              rows={3}
              value={formData.receiptFooter}
              onChange={(e) => handleChange('receiptFooter', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Security PIN Settings */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Admin Security PIN
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <input
                type="password"
                maxLength={8}
                value={formData.adminPin}
                onChange={(e) => handleChange('adminPin', e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-mono tracking-widest text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used to switch between Staff Mode and Admin Mode, protecting purchase costs and financial reports.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* Dynamic Item Categories Management Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Item Categories Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add, manage, and delete custom product categories for your mobile store catalog.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {categories.length} Categories Defined
          </span>
        </div>

        {/* Add Category Input */}
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="New Category Name (e.g. Gaming Controllers, Smart Tags)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!newCategoryName.trim()) return;
                if (onAddCategory) {
                  onAddCategory(newCategoryName.trim());
                  setNewCategoryName('');
                }
              }
            }}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              if (!newCategoryName.trim()) return;
              if (onAddCategory) {
                onAddCategory(newCategoryName.trim());
                setNewCategoryName('');
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>

        {/* Categories Badges List */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <span>{cat.name}</span>
              {onDeleteCategory && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete category "${cat.name}"?`)) {
                      onDeleteCategory(cat.id);
                    }
                  }}
                  title="Remove Category"
                  className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-slate-400 py-2">No categories defined yet. Type a category name above and click "Add Category".</p>
          )}
        </div>
      </div>
    </div>
  );
};
