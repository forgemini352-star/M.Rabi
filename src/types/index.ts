export type CategoryType = string;

export interface Category {
  id: string;
  name: string;
}

export interface ItemSpecs {
  ram?: string;
  storage?: string;
  color?: string;
  compatibility?: string;
  warrantyMonths?: number;
}

export interface Item {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: CategoryType;
  specs: ItemSpecs;
  barcode: string;
  imeiTracked: boolean;
  purchasePrice: number;
  sellingPrice: number;
  minSellingPrice: number;
  quantity: number;
  reorderThreshold: number;
  imageUrl: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  company: string;
  taxId?: string;
  currentBalance: number; // positive: store owes supplier; negative: advance payment
  createdAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  type: 'PURCHASE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT';
  referenceNo: string;
  description: string;
  debit: number; // Payment made by store (reduces payable balance)
  credit: number; // New purchase from supplier (increases payable balance)
  balance: number; // Running balance after this transaction
}

export interface PurchaseItemEntry {
  itemId: string;
  itemName: string;
  brand: string;
  model: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  imeiList?: string[];
}

export interface PurchaseRecord {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItemEntry[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit';
  status: 'Completed' | 'Pending';
  notes?: string;
}

export interface SaleItemEntry {
  itemId: string;
  itemName: string;
  brand: string;
  model: string;
  category: CategoryType;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountAmount: number;
  totalPrice: number;
  imeiNumbers?: string[];
  warrantyMonths?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: SaleItemEntry[];
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  totalCost: number;
  profit: number;
  paymentMode: 'Cash' | 'Card' | 'UPI/Bank' | 'Split' | 'Store Credit';
  amountReceived: number;
  changeDue: number;
  servedBy: string;
  notes?: string;
}

export interface StoreSettings {
  shopName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  currency: string;
  currencyCode: string;
  receiptFooter: string;
  adminPin: string;
  defaultTaxRate: number;
  logoUrl?: string;
}

export type UserRole = 'admin' | 'staff';

export interface DatabaseBackup {
  version: string;
  exportDate: string;
  appName: string;
  items: Item[];
  suppliers: Supplier[];
  ledgerEntries: SupplierLedgerEntry[];
  purchases: PurchaseRecord[];
  sales: Sale[];
  settings: StoreSettings;
  categories?: Category[];
}
