import React, { useState, useEffect } from 'react';
import {
  Item,
  Supplier,
  SupplierLedgerEntry,
  PurchaseRecord,
  Sale,
  StoreSettings,
  UserRole,
  DatabaseBackup,
  Category,
} from './types';
import { storageService } from './services/storage';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { PosWorkstation } from './components/PosWorkstation';
import { InventoryView } from './components/InventoryView';
import { SupplierLedgerView } from './components/SupplierLedgerView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AddItemModal } from './components/AddItemModal';
import { AddSupplierModal } from './components/AddSupplierModal';
import { RecordSupplierPaymentModal } from './components/RecordSupplierPaymentModal';
import { NewPurchaseModal } from './components/NewPurchaseModal';
import { EditSaleModal } from './components/EditSaleModal';
import { BarcodeGeneratorModal } from './components/BarcodeGeneratorModal';
import { PrintableReceiptModal } from './components/PrintableReceiptModal';
import { AdminPinModal } from './components/AdminPinModal';

export default function App() {
  // Global Data State from storage
  const [items, setItems] = useState<Item[]>(() => storageService.getItems());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storageService.getSuppliers());
  const [ledgerEntries, setLedgerEntries] = useState<SupplierLedgerEntry[]>(() => storageService.getLedgerEntries());
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => storageService.getPurchases());
  const [sales, setSales] = useState<Sale[]>(() => storageService.getSales());
  const [settings, setSettings] = useState<StoreSettings>(() => storageService.getSettings());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());

  // UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Modals State
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);

  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editSaleModalOpen, setEditSaleModalOpen] = useState(false);

  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeItem, setBarcodeItem] = useState<Item | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Keyboard Shortcuts (F2 for POS, F3 for Inventory, F4 for Purchases)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setEditingPurchase(null);
        setNewPurchaseOpen(true);
      } else if (e.key === 'Escape') {
        setAddItemOpen(false);
        setAddSupplierOpen(false);
        setRecordPaymentOpen(false);
        setNewPurchaseOpen(false);
        setEditSaleModalOpen(false);
        setBarcodeModalOpen(false);
        setReceiptModalOpen(false);
        setAdminPinModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Items
  const handleSaveItem = (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      storageService.updateItem(editingItem.id, itemData);
    } else {
      storageService.addItem(itemData);
    }
    setItems(storageService.getItems());
    setAddItemOpen(false);
    setEditingItem(null);
  };

  const handleAdjustStock = (itemId: string, delta: number) => {
    storageService.adjustStock(itemId, delta);
    setItems(storageService.getItems());
  };

  const handleDeleteItem = (itemId: string) => {
    storageService.deleteItem(itemId);
    setItems(storageService.getItems());
  };

  // Handlers for Categories
  const handleAddCategory = (name: string): Category => {
    const created = storageService.addCategory(name);
    setCategories(storageService.getCategories());
    return created;
  };

  const handleDeleteCategory = (id: string) => {
    storageService.deleteCategory(id);
    setCategories(storageService.getCategories());
  };

  // Handlers for Suppliers & Ledger
  const handleSaveSupplier = (
    supplierData: Omit<Supplier, 'id' | 'createdAt' | 'currentBalance'> & { initialBalance?: number }
  ) => {
    if (editingSupplier) {
      storageService.updateSupplier(editingSupplier.id, supplierData);
    } else {
      storageService.addSupplier(supplierData);
    }
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setAddSupplierOpen(false);
    setEditingSupplier(null);
  };

  const handleRecordPayment = (paymentData: {
    amount: number;
    paymentMode: string;
    referenceNo: string;
    description: string;
  }) => {
    if (!payingSupplier) return;
    storageService.recordSupplierPayment(
      payingSupplier.id,
      paymentData.amount,
      paymentData.paymentMode,
      paymentData.referenceNo,
      paymentData.description
    );
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setRecordPaymentOpen(false);
    setPayingSupplier(null);
  };

  // Handler for New / Edit Purchase
  const handleSavePurchase = (purchaseData: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>) => {
    storageService.createPurchase(purchaseData);
    setPurchases(storageService.getPurchases());
    setItems(storageService.getItems());
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setNewPurchaseOpen(false);
    setEditingPurchase(null);
  };

  const handleUpdatePurchase = (id: string, purchaseData: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>) => {
    storageService.updatePurchase(id, purchaseData);
    setPurchases(storageService.getPurchases());
    setItems(storageService.getItems());
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setNewPurchaseOpen(false);
    setEditingPurchase(null);
  };

  const handleDeletePurchase = (purchaseId: string) => {
    storageService.deletePurchase(purchaseId);
    setPurchases(storageService.getPurchases());
    setItems(storageService.getItems());
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
  };

  // Handler for POS Sale Checkout
  const handleCompleteSale = (saleData: Omit<Sale, 'id' | 'invoiceNumber'>) => {
    const newSale = storageService.createSale(saleData);
    setSales(storageService.getSales());
    setItems(storageService.getItems());
    setActiveReceiptSale(newSale);
    setReceiptModalOpen(true);
  };

  // Handler for Editing / Deleting Sales Bills
  const handleUpdateSale = (id: string, saleData: Omit<Sale, 'id' | 'invoiceNumber'>) => {
    storageService.updateSale(id, saleData);
    setSales(storageService.getSales());
    setItems(storageService.getItems());
    setEditSaleModalOpen(false);
    setEditingSale(null);
  };

  const handleDeleteSale = (saleId: string) => {
    storageService.deleteSale(saleId);
    setSales(storageService.getSales());
    setItems(storageService.getItems());
  };

  // Handler for Settings
  const handleSaveSettings = (newSettings: StoreSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Handler for Exporting Database Backup (.bak)
  const handleExportBackup = () => {
    const backup = storageService.exportDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apexcell_backup_${timestamp}.bak`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler for Restoring Database Backup
  const handleRestoreBackup = (backup: DatabaseBackup) => {
    storageService.restoreDatabase(backup);
    setItems(storageService.getItems());
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setPurchases(storageService.getPurchases());
    setSales(storageService.getSales());
    setSettings(storageService.getSettings());
    setCategories(storageService.getCategories());
  };

  // Handler for Reset / Clean Storage (Stock 0)
  const handleResetDemo = () => {
    storageService.cleanStorage();
    setItems(storageService.getItems());
    setSuppliers(storageService.getSuppliers());
    setLedgerEntries(storageService.getLedgerEntries());
    setPurchases(storageService.getPurchases());
    setSales(storageService.getSales());
    setSettings(storageService.getSettings());
    setCategories(storageService.getCategories());
  };

  // Role toggle with PIN
  const handleToggleRole = () => {
    if (currentRole === 'admin') {
      setCurrentRole('staff');
    } else {
      setAdminPinModalOpen(true);
    }
  };

  const handleAdminPinSuccess = () => {
    setCurrentRole('admin');
    setAdminPinModalOpen(false);
  };

  // Notification triggers ONLY if an item's stock value reaches zero
  const zeroStockCount = items.filter((i) => i.quantity <= 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar with Shop Logo & Zero Stock Alert */}
      <TopNavbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        lowStockCount={zeroStockCount}
        settings={settings}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            items={items}
            sales={sales}
            suppliers={suppliers}
            purchases={purchases}
            settings={settings}
            onNavigate={setActiveTab}
            onOpenAddItem={() => {
              setEditingItem(null);
              setAddItemOpen(true);
            }}
            onOpenNewPurchase={() => {
              setEditingPurchase(null);
              setNewPurchaseOpen(true);
            }}
          />
        )}

        {activeTab === 'pos' && (
          <PosWorkstation
            items={items}
            settings={settings}
            currentRole={currentRole}
            onCompleteSale={handleCompleteSale}
            onOpenBarcodeGenerator={(item) => {
              setBarcodeItem(item || null);
              setBarcodeModalOpen(true);
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            items={items}
            settings={settings}
            currentRole={currentRole}
            categories={categories}
            onOpenAddItem={(item) => {
              setEditingItem(item || null);
              setAddItemOpen(true);
            }}
            onOpenBarcodeGenerator={(item) => {
              setBarcodeItem(item || null);
              setBarcodeModalOpen(true);
            }}
            onAdjustStock={handleAdjustStock}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'ledger' && (
          <SupplierLedgerView
            suppliers={suppliers}
            ledgerEntries={ledgerEntries}
            purchases={purchases}
            settings={settings}
            currentRole={currentRole}
            onOpenAddSupplier={(s) => {
              setEditingSupplier(s || null);
              setAddSupplierOpen(true);
            }}
            onOpenRecordPayment={(s) => {
              setPayingSupplier(s);
              setRecordPaymentOpen(true);
            }}
            onOpenNewPurchase={() => {
              setEditingPurchase(null);
              setNewPurchaseOpen(true);
            }}
            onEditPurchase={(p) => {
              setEditingPurchase(p);
              setNewPurchaseOpen(true);
            }}
            onDeletePurchase={handleDeletePurchase}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            sales={sales}
            settings={settings}
            currentRole={currentRole}
            onOpenReceipt={(sale) => {
              setActiveReceiptSale(sale);
              setReceiptModalOpen(true);
            }}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setEditSaleModalOpen(true);
            }}
            onDeleteSale={handleDeleteSale}
            onPromptAdminUnlock={() => setAdminPinModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            currentRole={currentRole}
            categories={categories}
            onSaveSettings={handleSaveSettings}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onExportBackup={handleExportBackup}
            onRestoreBackup={handleRestoreBackup}
            onResetDemo={handleResetDemo}
            onPromptAdminUnlock={() => setAdminPinModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {addItemOpen && (
        <AddItemModal
          suppliers={suppliers}
          currency={settings.currency}
          categories={categories}
          initialItem={editingItem}
          onSave={handleSaveItem}
          onAddCategory={handleAddCategory}
          onClose={() => {
            setAddItemOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {addSupplierOpen && (
        <AddSupplierModal
          initialSupplier={editingSupplier}
          currency={settings.currency}
          onSave={handleSaveSupplier}
          onClose={() => {
            setAddSupplierOpen(false);
            setEditingSupplier(null);
          }}
        />
      )}

      {recordPaymentOpen && payingSupplier && (
        <RecordSupplierPaymentModal
          supplier={payingSupplier}
          currency={settings.currency}
          onSave={handleRecordPayment}
          onClose={() => {
            setRecordPaymentOpen(false);
            setPayingSupplier(null);
          }}
        />
      )}

      {newPurchaseOpen && (
        <NewPurchaseModal
          suppliers={suppliers}
          items={items}
          currency={settings.currency}
          initialPurchase={editingPurchase}
          onSave={(data) => {
            if (editingPurchase) {
              handleUpdatePurchase(editingPurchase.id, data);
            } else {
              handleSavePurchase(data);
            }
          }}
          onAddItemDirectly={(itemData) => {
            const newItem = storageService.addItem(itemData);
            setItems(storageService.getItems());
            return newItem;
          }}
          onClose={() => {
            setNewPurchaseOpen(false);
            setEditingPurchase(null);
          }}
          onOpenAddItem={() => {
            setEditingItem(null);
            setAddItemOpen(true);
          }}
        />
      )}

      {editSaleModalOpen && editingSale && (
        <EditSaleModal
          sale={editingSale}
          settings={settings}
          onSave={handleUpdateSale}
          onClose={() => {
            setEditSaleModalOpen(false);
            setEditingSale(null);
          }}
        />
      )}

      {barcodeModalOpen && (
        <BarcodeGeneratorModal
          items={items}
          initialItem={barcodeItem}
          settings={settings}
          onClose={() => {
            setBarcodeModalOpen(false);
            setBarcodeItem(null);
          }}
        />
      )}

      {receiptModalOpen && activeReceiptSale && (
        <PrintableReceiptModal
          sale={activeReceiptSale}
          settings={settings}
          onClose={() => {
            setReceiptModalOpen(false);
            setActiveReceiptSale(null);
          }}
        />
      )}

      {adminPinModalOpen && (
        <AdminPinModal
          correctPin={settings.adminPin}
          onSuccess={handleAdminPinSuccess}
          onClose={() => setAdminPinModalOpen(false)}
        />
      )}
    </div>
  );
}
