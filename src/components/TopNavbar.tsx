import React from 'react';
import { UserRole, StoreSettings } from '../types';
import {
  ShieldCheck,
  User,
  Sun,
  Moon,
  ShoppingCart,
  Bell,
  Sparkles,
  Barcode,
} from 'lucide-react';

interface TopNavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  currentRole: UserRole;
  onToggleRole: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  lowStockCount: number;
  settings: StoreSettings;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onNavigate,
  currentRole,
  onToggleRole,
  darkMode,
  onToggleTheme,
  lowStockCount,
  settings,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark with Shop Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90"
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Shop Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs"
            />
          ) : (
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-mono font-black">
              AC
            </span>
          )}
          <span>{settings?.shopName || 'ApexCell POS'}</span>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('pos')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'pos'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          POS Terminal
        </button>
        <button
          onClick={() => onNavigate('inventory')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          <span>Inventory</span>
          {lowStockCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
              {lowStockCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate('ledger')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'ledger'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          Supplier Ledger
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'reports'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          P&L Reports
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-600 py-1'
              : ''
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 primary action area */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Role toggle button */}
        <button
          onClick={onToggleRole}
          title={currentRole === 'admin' ? 'Switch to Staff Mode' : 'Click to Enter Admin PIN'}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 border ${
            currentRole === 'admin'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          {currentRole === 'admin' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Admin Mode</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff Mode</span>
            </>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Light/Dark"
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary CTA button */}
        <button
          onClick={() => onNavigate('pos')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale (F2)</span>
        </button>
      </div>
    </header>
  );
};
