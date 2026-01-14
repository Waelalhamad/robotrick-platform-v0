/**
 * Shared type definitions for inventory management
 * These types ensure consistency across all inventory-related components
 */

export interface Part {
  _id: string;
  name: string;
  category: string;
  description?: string;
  sku: string;
  group?: string;
  partNumber?: string;
  // Stock quantities from API response (optional in base Part)
  availableQty?: number;
  usedQty?: number;
  damagedQty?: number;
  reservedQty?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  _id: string;
  partId: string;
  availableQty: number;
  usedQty: number;
  damagedQty: number;
  updatedAt: string;
}

export interface PartWithStock {
  _id: string;
  name: string;
  category: string;
  description?: string;
  sku: string;
  group?: string;
  partNumber?: string;
  createdAt: string;
  updatedAt: string;
  // Stock quantities are required and guaranteed to be numbers
  availableQty: number;
  usedQty: number;
  damagedQty: number;
  reservedQty?: number;
  totalQty: number;
  stockLevel?: StockLevel;
  imageUrl?: string;
}

export interface StockMovement {
  _id: string;
  partId: string;
  qtyChange: number;
  reason: "purchase" | "adjustment" | "used" | "damaged" | "return" | "other";
  orderId?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockAdjustment {
  partId: string;
  qtyChange: number;
  reason: string;
  notes?: string;
  orderId?: string;
}

// Additional helper types
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export type StockReason =
  | "purchase"
  | "adjustment"
  | "used"
  | "damaged"
  | "return"
  | "other";
