export type Unit = "pcs" | "pair" | "m" | "set" | "roll";

export type PartStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export type MovementType = "PURCHASE" | "SALE" | "RETURN" | "ADJUST";

export interface Part {
  partId: string;
  name: string;
  category?: string;
  location?: string;
  inStock: number;
  minStock: number;
  available: number;
  unit: Unit;
  unitCost?: number;
  taxRate?: number; // Tax rate as percentage (e.g., 18 for 18%)
  supplier?: string;
  wattpics?: number; // WattPics (wp)
  lastMovement?: string;
  status: PartStatus;
}

export interface Movement {
  id: string;
  partId: string;
  partName: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  taxRate?: number; // Tax rate as percentage
  taxAmount?: number; // Calculated tax amount
  totalWithTax?: number; // Total including tax
  wattpics?: number; // WattPics (wp)
  category?: string; // Category
  supplier?: string;
  note?: string;
  timestamp: string;
  invoiceNo?: string;
}

export interface OverviewStats {
  totalSkus: number;
  totalInStock: number;
  availableUnits: number;
  lowStockSkus: number;
  inventoryValue: number;
  changesLast24h: number;
}

export interface TopSku {
  partId: string;
  partName: string;
  quantity: number;
}

export interface DailyNetData {
  date: string;
  purchases: number;
  sales: number;
}

export interface ParsedInvoiceDTO {
  vendor?: string;
  currency?: string;
  invoiceNo?: string;
  date?: string;
  items: Array<{
    rawDescription: string;
    suggested: {
      partId?: string;
      name?: string;
      unit?: Unit;
      quantity?: number;
      unitCost?: number;
      supplier?: string;
    };
    confidence: number;
  }>;
}

export interface IngestInvoiceItem {
  mode: "CREATE_NEW_PART" | "MAP_EXISTING_PART";
  partId: string;
  name?: string;
  unit?: Unit;
  minStock?: number;
  quantity: number;
  unitCost?: number;
  supplier?: string;
  note?: string;
}

export interface IngestInvoiceDTO {
  meta?: {
    invoiceNo?: string;
    date?: string;
    currency?: string;
    supplier?: string;
  };
  items: IngestInvoiceItem[];
}

export interface IngestResultDTO {
  createdParts: number;
  createdMovements: number;
  totals: {
    quantity: number;
    value?: number;
  };
  warnings?: string[];
}
