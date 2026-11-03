import { Item, Supplier, SupplierLedgerEntry, PurchaseRecord, Sale, StoreSettings, DatabaseBackup, Category } from '../types';

const STORAGE_KEYS = {
  VERSION: 'apexcell_storage_version_pkr_v5_clean_slate',
  ITEMS: 'apexcell_items_v5_pkr',
  SUPPLIERS: 'apexcell_suppliers_v5_pkr',
  LEDGER: 'apexcell_ledger_v5_pkr',
  PURCHASES: 'apexcell_purchases_v5_pkr',
  SALES: 'apexcell_sales_v5_pkr',
  SETTINGS: 'apexcell_settings_v5_pkr',
  CATEGORIES: 'apexcell_categories_v5_pkr',
  CURRENT_ROLE: 'apexcell_current_role_v5_pkr',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  shopName: 'ApexCell Mobile & Gadgets',
  tagline: 'Smartphones, PTA Approved Devices & Original Accessories',
  phone: '+92 300 1234567',
  email: 'sales@apexcell.pk',
  address: 'Shop #18, Ground Floor, Hafeez Centre, Main Boulevard, Gulberg III, Lahore, Pakistan',
  taxId: 'NTN: 8291048-7',
  currency: 'Rs.',
  currencyCode: 'PKR',
  receiptFooter: 'Thank you for shopping at ApexCell! Please verify PTA official registration & IMEI at counter. 7-day exchange on accessories with original box.',
  adminPin: '6598',
  defaultTaxRate: 0,
  logoUrl: '/src/assets/images/apexcell_store_logo_1793700628534.jpg',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Smartphones' },
  { id: 'cat-2', name: 'Feature Phones' },
  { id: 'cat-3', name: 'Chargers & Cables' },
  { id: 'cat-4', name: 'Audio & Earbuds' },
  { id: 'cat-5', name: 'Screen Protectors' },
  { id: 'cat-6', name: 'Cases & Covers' },
  { id: 'cat-7', name: 'Smartwatches & Wearables' },
  { id: 'cat-8', name: 'Power Banks & Batteries' },
  { id: 'cat-9', name: 'Spare Parts & Tools' },
  { id: 'cat-10', name: 'Used / Pre-Owned Handsets' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Apex Cellular Wholesale Distribution',
    contactPerson: 'Khurram Shahzad',
    phone: '+92 321 8844221',
    email: 'khurram@apexcellular.pk',
    address: 'Plaza 4, Hafeez Centre Wholesale Block, Lahore',
    company: 'Apex Cellular Distro Pakistan',
    taxId: 'NTN: 4182901-2',
    currentBalance: 0,
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'sup-2',
    name: 'StarTech Mobile Wholesale Hub',
    contactPerson: 'Tariq Mehmood',
    phone: '+92 301 7711990',
    email: 'tariq@startechdistro.pk',
    address: 'Electronics Market, Saddar, Karachi',
    company: 'StarTech Wholesale Ltd.',
    taxId: 'NTN: 3109284-5',
    currentBalance: 0,
    createdAt: '2026-10-05T11:30:00.000Z',
  },
  {
    id: 'sup-3',
    name: 'OmniGadget Accessories Direct',
    contactPerson: 'Babar Ali',
    phone: '+92 333 5522118',
    email: 'babar@omnigadgets.pk',
    address: 'Hall Road Commercial Centre, Lahore',
    company: 'OmniGadget Imports Pakistan',
    taxId: 'NTN: 9918274-1',
    currentBalance: 0,
    createdAt: '2026-10-10T14:15:00.000Z',
  },
];

// Clean software data: 0 pre-added items, 0 sales, 0 purchases, 0 ledger entries
export const INITIAL_ITEMS: Item[] = [];
export const INITIAL_LEDGER: SupplierLedgerEntry[] = [];
export const INITIAL_PURCHASES: PurchaseRecord[] = [];
export const INITIAL_SALES: Sale[] = [];

class StorageService {
  constructor() {
    this.migrateIfNeeded();
  }

  // Ensures complete data reset to pristine state with 0 items, 0 transactions, and PIN 6598
  private migrateIfNeeded(): void {
    try {
      const currentVer = localStorage.getItem(STORAGE_KEYS.VERSION);
      if (currentVer !== '5.0.0-pkr-clean-slate-empty') {
        // Clear all previous storage versions
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('apexcell_') || key.includes('items') || key.includes('sales'))) {
            localStorage.removeItem(key);
          }
        }

        // Write fresh empty state
        this.saveItems([]);
        this.saveSuppliers(INITIAL_SUPPLIERS);
        this.saveLedgerEntries([]);
        this.savePurchases([]);
        this.saveSales([]);
        this.saveSettings(DEFAULT_SETTINGS);
        this.saveCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(STORAGE_KEYS.VERSION, '5.0.0-pkr-clean-slate-empty');
      }
    } catch (e) {
      console.warn('Migration error:', e);
    }
  }

  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading key ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key ${key} to storage:`, e);
    }
  }

  // Categories Management (User can add categories freely)
  getCategories(): Category[] {
    return this.get<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  saveCategories(categories: Category[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  addCategory(name: string): Category {
    const categories = this.getCategories();
    const cleanName = name.trim();
    const existing = categories.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) return existing;

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name: cleanName,
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;
    this.saveCategories(filtered);
    return true;
  }

  // Items
  getItems(): Item[] {
    return this.get<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
  }

  saveItems(items: Item[]): void {
    this.set(STORAGE_KEYS.ITEMS, items);
  }

  addItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item {
    const items = this.getItems();
    const newItem: Item = {
      ...item,
      id: 'item-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  }

  updateItem(id: string, updates: Partial<Item>): Item | null {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const updated = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this.saveItems(items);
    return updated;
  }

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.saveItems(filtered);
    return true;
  }

  adjustStock(itemId: string, deltaQty: number): Item | null {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) return null;
    items[index].quantity = Math.max(0, items[index].quantity + deltaQty);
    items[index].updatedAt = new Date().toISOString();
    this.saveItems(items);
    return items[index];
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  saveSuppliers(suppliers: Supplier[]): void {
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'currentBalance'> & { initialBalance?: number }): Supplier {
    const suppliers = this.getSuppliers();
    const newSupplier: Supplier = {
      id: 'sup-' + Date.now(),
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      company: supplier.company,
      taxId: supplier.taxId,
      currentBalance: supplier.initialBalance || 0,
      createdAt: new Date().toISOString(),
    };
    suppliers.unshift(newSupplier);
    this.saveSuppliers(suppliers);

    if (supplier.initialBalance && supplier.initialBalance !== 0) {
      this.addLedgerEntry({
        supplierId: newSupplier.id,
        supplierName: newSupplier.name,
        date: new Date().toISOString(),
        type: 'ADJUSTMENT',
        referenceNo: 'INIT-BAL',
        description: 'Opening balance setup',
        debit: supplier.initialBalance < 0 ? Math.abs(supplier.initialBalance) : 0,
        credit: supplier.initialBalance > 0 ? supplier.initialBalance : 0,
        balance: supplier.initialBalance,
      });
    }

    return newSupplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    suppliers[index] = { ...suppliers[index], ...updates };
    this.saveSuppliers(suppliers);
    return suppliers[index];
  }

  deleteSupplier(id: string): boolean {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter((s) => s.id !== id);
    if (filtered.length === suppliers.length) return false;
    this.saveSuppliers(filtered);
    return true;
  }

  // Ledger Entries
  getLedgerEntries(supplierId?: string): SupplierLedgerEntry[] {
    const entries = this.get<SupplierLedgerEntry[]>(STORAGE_KEYS.LEDGER, INITIAL_LEDGER);
    if (supplierId) {
      return entries.filter((e) => e.supplierId === supplierId);
    }
    return entries;
  }

  saveLedgerEntries(entries: SupplierLedgerEntry[]): void {
    this.set(STORAGE_KEYS.LEDGER, entries);
  }

  addLedgerEntry(entry: Omit<SupplierLedgerEntry, 'id'>): SupplierLedgerEntry {
    const entries = this.getLedgerEntries();
    const newEntry: SupplierLedgerEntry = {
      ...entry,
      id: 'led-' + Date.now(),
    };
    entries.unshift(newEntry);
    this.saveLedgerEntries(entries);
    return newEntry;
  }

  recordSupplierPayment(
    supplierId: string,
    amount: number,
    paymentMode: string,
    referenceNo: string,
    description: string
  ): { supplier: Supplier; ledgerEntry: SupplierLedgerEntry } {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === supplierId);
    if (index === -1) throw new Error('Supplier not found');

    const supplier = suppliers[index];
    const newBalance = supplier.currentBalance - amount;
    supplier.currentBalance = newBalance;
    this.saveSuppliers(suppliers);

    const ledgerEntry = this.addLedgerEntry({
      supplierId,
      supplierName: supplier.name,
      date: new Date().toISOString(),
      type: 'PAYMENT',
      referenceNo: referenceNo || `PAY-${Date.now().toString().slice(-6)}`,
      description: `${description || 'Payment made'} via ${paymentMode}`,
      debit: amount,
      credit: 0,
      balance: newBalance,
    });

    return { supplier, ledgerEntry };
  }

  // Purchases
  getPurchases(): PurchaseRecord[] {
    return this.get<PurchaseRecord[]>(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  }

  savePurchases(purchases: PurchaseRecord[]): void {
    this.set(STORAGE_KEYS.PURCHASES, purchases);
  }

  createPurchase(purchaseData: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>): PurchaseRecord {
    const purchases = this.getPurchases();
    const purchaseNumber = `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(4, '0')}`;
    
    const newPurchase: PurchaseRecord = {
      ...purchaseData,
      id: 'pur-' + Date.now(),
      purchaseNumber,
    };

    // Update items stock and cost
    const items = this.getItems();
    newPurchase.items.forEach((pItem) => {
      const idx = items.findIndex((i) => i.id === pItem.itemId);
      if (idx !== -1) {
        items[idx].quantity += pItem.quantity;
        items[idx].purchasePrice = pItem.unitCost;
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    // Update supplier ledger & balance
    const suppliers = this.getSuppliers();
    const supIdx = suppliers.findIndex((s) => s.id === newPurchase.supplierId);
    if (supIdx !== -1) {
      const currentBal = suppliers[supIdx].currentBalance;
      const balanceIncrement = newPurchase.totalAmount - newPurchase.amountPaid;
      const newBal = currentBal + balanceIncrement;
      suppliers[supIdx].currentBalance = newBal;
      this.saveSuppliers(suppliers);

      this.addLedgerEntry({
        supplierId: newPurchase.supplierId,
        supplierName: newPurchase.supplierName,
        date: newPurchase.date,
        type: 'PURCHASE',
        referenceNo: newPurchase.purchaseNumber,
        description: `Purchase: ${newPurchase.items.length} item(s) (Paid: Rs.${newPurchase.amountPaid}, Due: Rs.${newPurchase.balanceDue})`,
        debit: newPurchase.amountPaid,
        credit: newPurchase.totalAmount,
        balance: newBal,
      });
    }

    purchases.unshift(newPurchase);
    this.savePurchases(purchases);
    return newPurchase;
  }

  // EDIT Purchase Bill with stock & supplier ledger adjustment
  updatePurchase(id: string, updatedData: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>): PurchaseRecord | null {
    const purchases = this.getPurchases();
    const index = purchases.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const oldPurchase = purchases[index];
    const items = this.getItems();

    // 1. Revert old stock additions
    oldPurchase.items.forEach((oldItem) => {
      const idx = items.findIndex((i) => i.id === oldItem.itemId);
      if (idx !== -1) {
        items[idx].quantity = Math.max(0, items[idx].quantity - oldItem.quantity);
      }
    });

    // 2. Apply new stock additions
    updatedData.items.forEach((newItem) => {
      const idx = items.findIndex((i) => i.id === newItem.itemId);
      if (idx !== -1) {
        items[idx].quantity += newItem.quantity;
        items[idx].purchasePrice = newItem.unitCost;
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    // 3. Adjust supplier ledger balance
    const suppliers = this.getSuppliers();
    const oldSupIdx = suppliers.findIndex((s) => s.id === oldPurchase.supplierId);
    const newSupIdx = suppliers.findIndex((s) => s.id === updatedData.supplierId);

    const oldDue = oldPurchase.totalAmount - oldPurchase.amountPaid;
    const newDue = updatedData.totalAmount - updatedData.amountPaid;

    if (oldSupIdx !== -1 && oldPurchase.supplierId === updatedData.supplierId) {
      suppliers[oldSupIdx].currentBalance += (newDue - oldDue);
      this.saveSuppliers(suppliers);
    } else {
      if (oldSupIdx !== -1) {
        suppliers[oldSupIdx].currentBalance -= oldDue;
      }
      if (newSupIdx !== -1) {
        suppliers[newSupIdx].currentBalance += newDue;
      }
      this.saveSuppliers(suppliers);
    }

    const updatedPurchase: PurchaseRecord = {
      ...updatedData,
      id: oldPurchase.id,
      purchaseNumber: oldPurchase.purchaseNumber,
    };

    purchases[index] = updatedPurchase;
    this.savePurchases(purchases);

    // Add ledger adjustment note
    this.addLedgerEntry({
      supplierId: updatedPurchase.supplierId,
      supplierName: updatedPurchase.supplierName,
      date: new Date().toISOString(),
      type: 'ADJUSTMENT',
      referenceNo: updatedPurchase.purchaseNumber,
      description: `Purchase Bill Edited (${updatedPurchase.purchaseNumber})`,
      debit: updatedPurchase.amountPaid,
      credit: updatedPurchase.totalAmount,
      balance: newSupIdx !== -1 ? suppliers[newSupIdx].currentBalance : 0,
    });

    return updatedPurchase;
  }

  // DELETE Purchase Bill with stock rollback & supplier ledger rollback
  deletePurchase(id: string): boolean {
    const purchases = this.getPurchases();
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase) return false;

    // 1. Roll back stock: deduct quantities that this purchase added
    const items = this.getItems();
    purchase.items.forEach((it) => {
      const idx = items.findIndex((i) => i.id === it.itemId);
      if (idx !== -1) {
        items[idx].quantity = Math.max(0, items[idx].quantity - it.quantity);
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    // 2. Roll back supplier balance: reduce supplier due
    const suppliers = this.getSuppliers();
    const supIdx = suppliers.findIndex((s) => s.id === purchase.supplierId);
    if (supIdx !== -1) {
      const netDue = purchase.totalAmount - purchase.amountPaid;
      suppliers[supIdx].currentBalance = Math.max(0, suppliers[supIdx].currentBalance - netDue);
      this.saveSuppliers(suppliers);

      // Ledger rollback entry
      this.addLedgerEntry({
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName,
        date: new Date().toISOString(),
        type: 'ADJUSTMENT',
        referenceNo: `VOID-${purchase.purchaseNumber}`,
        description: `Purchase Bill Deleted / Voided (${purchase.purchaseNumber})`,
        debit: netDue,
        credit: 0,
        balance: suppliers[supIdx].currentBalance,
      });
    }

    // 3. Remove purchase
    const filtered = purchases.filter((p) => p.id !== id);
    this.savePurchases(filtered);
    return true;
  }

  // Sales (POS)
  getSales(): Sale[] {
    return this.get<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  saveSales(sales: Sale[]): void {
    this.set(STORAGE_KEYS.SALES, sales);
  }

  createSale(saleData: Omit<Sale, 'id' | 'invoiceNumber'>): Sale {
    const sales = this.getSales();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;
    
    const newSale: Sale = {
      ...saleData,
      id: 'sale-' + Date.now(),
      invoiceNumber,
    };

    // Decrement stock for sold items
    const items = this.getItems();
    newSale.items.forEach((sold) => {
      const idx = items.findIndex((i) => i.id === sold.itemId);
      if (idx !== -1) {
        items[idx].quantity = Math.max(0, items[idx].quantity - sold.quantity);
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    sales.unshift(newSale);
    this.saveSales(sales);
    return newSale;
  }

  // EDIT Sale Bill with stock adjustment
  updateSale(id: string, updatedData: Omit<Sale, 'id' | 'invoiceNumber'>): Sale | null {
    const sales = this.getSales();
    const index = sales.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const oldSale = sales[index];
    const items = this.getItems();

    // 1. Revert old stock deduction (add back old sold quantities)
    oldSale.items.forEach((oldItem) => {
      const idx = items.findIndex((i) => i.id === oldItem.itemId);
      if (idx !== -1) {
        items[idx].quantity += oldItem.quantity;
      }
    });

    // 2. Deduct new sold quantities
    updatedData.items.forEach((newItem) => {
      const idx = items.findIndex((i) => i.id === newItem.itemId);
      if (idx !== -1) {
        items[idx].quantity = Math.max(0, items[idx].quantity - newItem.quantity);
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    const updatedSale: Sale = {
      ...updatedData,
      id: oldSale.id,
      invoiceNumber: oldSale.invoiceNumber,
    };

    sales[index] = updatedSale;
    this.saveSales(sales);
    return updatedSale;
  }

  // DELETE Sale Bill with stock rollback
  deleteSale(id: string): boolean {
    const sales = this.getSales();
    const sale = sales.find((s) => s.id === id);
    if (!sale) return false;

    // Roll back stock: add back the quantities that were sold
    const items = this.getItems();
    sale.items.forEach((sold) => {
      const idx = items.findIndex((i) => i.id === sold.itemId);
      if (idx !== -1) {
        items[idx].quantity += sold.quantity;
        items[idx].updatedAt = new Date().toISOString();
      }
    });
    this.saveItems(items);

    const filtered = sales.filter((s) => s.id !== id);
    this.saveSales(filtered);
    return true;
  }

  // Settings
  getSettings(): StoreSettings {
    return this.get<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  saveSettings(settings: StoreSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // Complete Clean Storage & Clear All Data
  cleanStorage(): void {
    try {
      localStorage.clear();
      this.saveItems([]);
      this.saveSuppliers(INITIAL_SUPPLIERS);
      this.saveLedgerEntries([]);
      this.savePurchases([]);
      this.saveSales([]);
      this.saveSettings(DEFAULT_SETTINGS);
      this.saveCategories(DEFAULT_CATEGORIES);
      localStorage.setItem(STORAGE_KEYS.VERSION, '5.0.0-pkr-clean-slate-empty');
    } catch (e) {
      console.error('Clean storage error:', e);
    }
  }

  // Backup & Restore
  exportDatabase(): DatabaseBackup {
    return {
      version: '5.0.0-pkr',
      exportDate: new Date().toISOString(),
      appName: 'ApexCell POS & Ledger Management System (PKR)',
      items: this.getItems(),
      suppliers: this.getSuppliers(),
      ledgerEntries: this.getLedgerEntries(),
      purchases: this.getPurchases(),
      sales: this.getSales(),
      settings: this.getSettings(),
      categories: this.getCategories(),
    };
  }

  restoreDatabase(backup: DatabaseBackup): boolean {
    if (!backup || !backup.suppliers) {
      throw new Error('Invalid backup file format.');
    }
    this.saveItems(backup.items || []);
    this.saveSuppliers(backup.suppliers);
    this.saveLedgerEntries(backup.ledgerEntries || []);
    this.savePurchases(backup.purchases || []);
    this.saveSales(backup.sales || []);
    if (backup.settings) {
      this.saveSettings(backup.settings);
    }
    if (backup.categories) {
      this.saveCategories(backup.categories);
    }
    return true;
  }

  resetToDemo(): void {
    this.cleanStorage();
  }
}

export const storageService = new StorageService();
